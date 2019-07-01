#version 150
//#extension GL_ARB_shading_language_420pack : require
#extension GL_ARB_explicit_attrib_location : require

#define TASK 10
#define ENABLE_OPACITY_CORRECTION 0
#define ENABLE_LIGHTNING 0
#define ENABLE_SHADOWING 0

in vec3 ray_entry_position;

layout(location = 0) out vec4 FragColor;

uniform mat4 Modelview;

uniform sampler3D volume_texture;
uniform sampler2D transfer_texture;


uniform vec3    camera_location;
uniform float   sampling_distance;
uniform float   sampling_distance_ref;
uniform float   iso_value;
uniform vec3    max_bounds;
uniform ivec3   volume_dimensions;

uniform vec3    light_position;
uniform vec3    light_ambient_color;
uniform vec3    light_diffuse_color;
uniform vec3    light_specular_color;
uniform float   light_ref_coef;

const vec3 lightPos = vec3(1.0,1.0,1.0);


bool
inside_volume_bounds(const in vec3 sampling_position)
{
    return (   all(greaterThanEqual(sampling_position, vec3(0.0)))
            && all(lessThanEqual(sampling_position, max_bounds)));
}


float
get_sample_data(vec3 in_sampling_pos)
{
    vec3 obj_to_tex = vec3(1.0) / max_bounds;
    return texture(volume_texture, in_sampling_pos * obj_to_tex).r;

}

// compute gradient vector 
vec3 get_gradient(vec3 sampling_pos){

    float stepsize = max_bounds.x/volume_dimensions.x;

    float fx = get_sample_data(vec3(sampling_pos.x+stepsize, sampling_pos.y, sampling_pos.z));
    float bx = get_sample_data(vec3(sampling_pos.x-stepsize, sampling_pos.y, sampling_pos.z));
    
    // x center difference
    float cdx = fx-bx;

    float fy = get_sample_data(vec3(sampling_pos.x, sampling_pos.y+stepsize, sampling_pos.z));
    float by = get_sample_data(vec3(sampling_pos.x, sampling_pos.y-stepsize, sampling_pos.z));
   
    // y center difference
    float cdy = fy-by;

    float fz = get_sample_data(vec3(sampling_pos.x, sampling_pos.y, sampling_pos.z+stepsize));
    float bz = get_sample_data(vec3(sampling_pos.x, sampling_pos.y, sampling_pos.z-stepsize));
   
    // z center difference
    float cdz = fz-bz;

    // the gradient vector defined
    vec3 grad;
    grad.x   = cdx;
    grad.y   = cdy;
    grad.z   = cdz;

    return grad;
}


// compute the illumination
vec3 compute_lighting(vec3 sampling_pos){
    
    vec3 ka = light_ambient_color;      // light ambient
    vec3 kd = light_diffuse_color;      // light diffuse
    vec3 ks = light_specular_color;     // light specular
    
    // get the gradient
    vec3 N = normalize(get_gradient(sampling_pos));
    
    // which is the direction vector from the point on the surface toward each light source
    vec3 lm;
    lm.x = light_position.x - sampling_pos.x;
    lm.y = light_position.y - sampling_pos.y;
    lm.z = light_position.z - sampling_pos.z;
    lm = normalize(lm);
    
    vec3 eye = normalize(camera_location-sampling_pos);
    
    // direction vector
    vec3 Rm;
    Rm = 2 * (dot(lm,N)) * N - lm;
    
    
    // illumination of each surface point
    vec3 Ip;
    Ip = ka  + kd * clamp(dot(lm, N), 0, 1) + ks * pow(( clamp(dot(Rm,-eye), 0, 1)),light_ref_coef);
    
    return Ip; 
}


void main()
{
    /// One step trough the volume
    vec3 ray_increment      = normalize(ray_entry_position - camera_location) * sampling_distance;
    /// Position in Volume
    vec3 sampling_pos       = ray_entry_position + ray_increment; // test, increment just to be sure we are in the volume

    /// Init color of fragment
    vec4 dst = vec4(0.0, 0.0, 0.0, 0.0);
	vec4 colorForAverageIntensityProjection = vec4(0.0, 0.0, 0.0, 0.0);
	int counter = 0;

    /// check if we are inside volume
    bool inside_volume = inside_volume_bounds(sampling_pos);
    
    if (!inside_volume)
        discard;

#if TASK == 10
    vec4 max_val = vec4(0.0, 0.0, 0.0, 0.0);
    //
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added
    while (inside_volume) 
    {      
        // get sample
        float s = get_sample_data(sampling_pos);
                
        // apply the transfer functions to retrieve color and opacity
        vec4 color = texture(transfer_texture, vec2(s, s));
           
        // this is the example for maximum intensity projection
        max_val.r = max(color.r, max_val.r);
        max_val.g = max(color.g, max_val.g);
        max_val.b = max(color.b, max_val.b);
        max_val.a = max(color.a, max_val.a);
        
        // increment the ray sampling position
        sampling_pos  += ray_increment;

        // update the loop termination condition
        inside_volume  = inside_volume_bounds(sampling_pos);
    }

    dst = max_val;
#endif 
    
#if TASK == 11
	vec4 avg_val = vec4(0.0, 0.0, 0.0, 0.0);
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added
    while (inside_volume)
    {      
        // get sample
        float s = get_sample_data(sampling_pos);
		
		// apply the transfer functions to retrieve color and opacity
        vec4 color = texture(transfer_texture, vec2(s, s));
           
        // this is the example for Average intensity projection
        avg_val.r = max(color.r, avg_val.r);
        avg_val.g = max(color.g, avg_val.g);
        avg_val.b = max(color.b, avg_val.b);
        avg_val.a = max(color.a, avg_val.a);
		
		colorForAverageIntensityProjection += color;
        
        // increment the ray sampling position
        sampling_pos  += ray_increment;

        // update the loop termination condition
        inside_volume  = inside_volume_bounds(sampling_pos);
		counter++;
    }

	dst = colorForAverageIntensityProjection/counter;
#endif
    
#if TASK == 12 || TASK == 13
bool foundHit = false;
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added
    while (inside_volume && foundHit == false)
    {
        // get sample
        float s = get_sample_data(sampling_pos);
		float sPrevious = get_sample_data(sampling_pos - ray_increment);
		vec3 vertPos = sampling_pos;

        // First hit
		if (s > iso_value && sPrevious < iso_value)
		{
			dst = texture(transfer_texture, vec2(s, s));
			//dst = vec4(light_diffuse_color, 1.0);
			vertPos = sampling_pos;
			//break;
			
			foundHit = true;
		

        
#if TASK == 13 // Binary Search
            // get sample
            while (inside_volume)           // to avoid
            {
                // get sample
                float s = get_sample_data(sampling_pos);
                float steps = 1;
                
                
                if (s>iso_value){
                    
                    while (steps < 18){
                        
                        s = get_sample_data(sampling_pos);
                        ray_increment = ray_increment / 2;
                        
                        if (s >iso_value) {
                            sampling_pos += -1 * ray_increment;
                        }
                        
                        else{
                            
                            sampling_pos += 1 * ray_increment;
                        }
                        
                        
                        steps++;
                    }
                    
                    vec4 color = texture(transfer_texture, vec2(s, s));
                    dst = color;
                    break;
                    
                }
                
                // increment the ray sampling position
                sampling_pos += ray_increment;
                // update the loop termination condition
                inside_volume = inside_volume_bounds(sampling_pos);
                
            }
#endif
#if ENABLE_LIGHTNING == 1 // Add Shading
  
  vec3 normal = get_gradient(sampling_pos);
  vec3 lightDir = lightPos - vertPos;
  //float distance = length(lightDir);
  //distance = distance * distance;
  lightDir = normalize(lightDir);
  normal = normalize(normal);

  float lambertian = max(dot(lightDir,normal), 0.0);
  float specular = 0.0;

  if(lambertian > 0.0) {

    vec3 viewDir = normalize(camera_location - vertPos);
       
    // phong shading for comparison
    
    vec3 reflectDir = reflect(-lightDir, normal);
    float specAngle = max(dot(reflectDir, viewDir), 0.0);
    // different in exponent
    specular = pow(specAngle, light_ref_coef/4.0);
    
  }
  
  
  vec3 colorLinear = light_ambient_color +
                     dst.xyz * lambertian + light_specular_color * specular * dst.xyz;
  // apply gamma correction (assume ambientColor, diffuseColor and specColor
  // have been linearized, i.e. have no gamma correction in them)
  // vec3 colorGammaCorrected = pow(colorLinear, vec3(1.0/screenGamma));
  // use the gamma corrected color in the fragment
  dst = vec4(colorLinear, 1.0);
  
#if ENABLE_SHADOWING == 1 // Add Shadows
            if (ENABLE_LIGHTNING == 1) {
                
                vec3 sample_path_to_sun = normalize(sampling_pos - light_position) * sampling_distance;
                // increment the ray sampling position
                sampling_pos += sample_path_to_sun;
                
                
                // check if there is another similar or larger iso-value along the light source vector
                while(inside_volume)//all(lessThanEqual(sampling_pos,light_position)))             //
                {
                    
                    // get sample
                    float s = get_sample_data(sampling_pos);
                    
                    if (s > iso_value){
                        
                        dst = vec4(light_ambient_color,1.0);
                        break;
                    }
                    
                    // increment the ray sampling position
                    sampling_pos += sample_path_to_sun;
                    
                    inside_volume = inside_volume_bounds(sampling_pos);
                    
                }
                
            }

#endif
#endif
		}
		
		// increment the ray sampling position
        sampling_pos += ray_increment;
        // update the loop termination condition
        inside_volume = inside_volume_bounds(sampling_pos);
    }
#endif 

#if TASK == 31
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added
    bool method = false;
    
    
    // first opacity and sample initialization
    float   trans       = 1.0;
    
    if (method == true){        // front to back
        
        
        while (inside_volume && dst.a < 0.95)
        {
            // get sample
            float s = get_sample_data(sampling_pos);
            
            // apply the transfer functions to retrieve color and opacity
            vec4 color = texture(transfer_texture, vec2(s, s));
            
            if (ENABLE_OPACITY_CORRECTION == 1){
                
                // A = 1-(1-A_0) ^ (s_0 / s)
                color.a = 1 - pow((1 - color.a),(sampling_distance_ref/sampling_distance));
                
            }
            
            // intensity
            dst.rgb     = dst.rgb + trans * (color.rgb * color.a);  // Inten = Inten + Trans * I[i]   // I[i] = color.rgb * color.a
            
            
            // compute lighting
            if (ENABLE_LIGHTNING == 1){
                
                dst.rgb = dst.rgb + compute_lighting(sampling_pos) * color.a * (1.0 - trans);
                
            }
            // transparancy
            trans       = trans * (1.0 - color.a);          // Trans = Trans * T[i-1] // T[i-1] = ( 1 - αj)
            
            dst.a       = 1.0 - trans;
            
            
            
            // increment the ray sampling position
            sampling_pos += ray_increment;
            // update the loop termination condition
            inside_volume = inside_volume_bounds(sampling_pos);
        }
		
		        while (inside_volume){
            
            // increment the ray sampling position
            sampling_pos += ray_increment;
            // update the loop termination condition
            inside_volume = inside_volume_bounds(sampling_pos);
            
        }
        
        // get the first position from back
        sampling_pos -= ray_increment;
        // sampling_pos -= ray_increment;
        // update the termination condition
        inside_volume = inside_volume_bounds(sampling_pos);
        
        dst = vec4(0.0,0.0,0.0,1.0);
    }
    
    else {      // back to front
        
        while (!inside_volume){
            
            // increment the ray sampling position
            sampling_pos += ray_increment;
            // update the loop termination condition
            inside_volume = inside_volume_bounds(sampling_pos);
            
        }
        
        // get the first position from back
        sampling_pos -= ray_increment;
        // sampling_pos -= ray_increment;
        // update the termination condition
        inside_volume = inside_volume_bounds(sampling_pos);
        
        dst = vec4(0.0,0.0,0.0,1.0);
        
        while (inside_volume) {
            
            // get sample
            float s = get_sample_data(sampling_pos);
            
            // apply the transfer functions to retrieve color and opacity
            vec4 color = texture(transfer_texture, vec2(s, s));
            
            // intensity
            dst.rgb = color.rgb * color.a  + dst.rgb * (1 - color.a) ;   // inten = C[i] * A[i] + inten * (1 - A[i]);
            
            
            // compute lighting
            if (ENABLE_LIGHTNING == 1){
                
                dst.rgb = dst.rgb + compute_lighting(sampling_pos) * color.a; //* (1.0 - trans);
                
            }
            
            
            // decrement the ray sampling position
            sampling_pos -= ray_increment;
            
            // update the loop termination condition
            inside_volume = inside_volume_bounds(sampling_pos);
        }
        
        
    }
        // get sample
#if ENABLE_OPACITY_CORRECTION == 1 // Opacity Correction
        //IMPLEMENT;
#else
        float s = get_sample_data(sampling_pos);
#endif
        // dummy code
        dst = vec4(light_specular_color, 1.0);

        // increment the ray sampling position
        sampling_pos += ray_increment;

#if ENABLE_LIGHTNING == 1 // Add Shading
        //IMPLEMENT;
#endif

        // update the loop termination condition
        inside_volume = inside_volume_bounds(sampling_pos);
#endif 

    // return the calculated color value
    FragColor = dst;
}

