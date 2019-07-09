#version 150
//#extension GL_ARB_shading_language_420pack : require
#extension GL_ARB_explicit_attrib_location : require

#define TASK 10
#define ENABLE_OPACITY_CORRECTION 0
#define ENABLE_LIGHTNING 0
#define ENABLE_SHADOWING 0
#define FRONT_TO_BACK 1

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


bool inside_volume_bounds(const in vec3 sampling_position) {
    return (all (greaterThanEqual (sampling_position, vec3(0.0)))
    && all (lessThanEqual (sampling_position, max_bounds)));
}

float get_sample_data(vec3 in_sampling_pos) {
    vec3 obj_to_tex = vec3(1.0) / max_bounds;
    return texture(volume_texture, in_sampling_pos * obj_to_tex).r;
}

vec3 get_gradient(vec3 sampling_pos) {
    vec3 D = vec3(0.0, 0.0, 0.0);
    vec3 p = sampling_pos;
    vec3 voxel_size = max_bounds / volume_dimensions;

    // Compute gradient based on central difference
    // D.x = (F(x + 1, y, z) - f(x - 1, y, z)) / 2
	D.x = get_sample_data(vec3(p.x + voxel_size.x, p.y, p.z)) - get_sample_data(vec3(p.x - voxel_size.x, p.y, p.z));
	D.y = get_sample_data(vec3(p.x, p.y + voxel_size.y, p.z)) - get_sample_data(vec3(p.x, p.y - voxel_size.y, p.z));
	D.z = get_sample_data(vec3(p.x, p.y, p.z + voxel_size.z)) - get_sample_data(vec3(p.x, p.y, p.z - voxel_size.z));

    return normalize(D);
}

float length_sqr(vec3 position) {
	return (sqrt (pow(position.x, 2) + pow(position.y, 2) + pow(position.z, 2)));
}

void main() {
    
    /// One step trough the volume
    vec3 ray_increment      = normalize(ray_entry_position - camera_location) * sampling_distance;
    
    /// Position in Volume
    vec3 sampling_pos       = ray_entry_position + ray_increment; // test, increment just to be sure we are in the volume

    /// Init color of fragment
    vec4 dst = vec4(0.0, 0.0, 0.0, 0.0);

    /// check if we are inside volume
    bool inside_volume = inside_volume_bounds(sampling_pos);
    
    if (!inside_volume)
        discard;

#if TASK == 10
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added

    vec4 max_val = vec4(0.0, 0.0, 0.0, 0.0);
    
    while(inside_volume) {      
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
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added

    int counter = 0;
	
	while(inside_volume) {      
        counter++;

		// get sample
        float s = get_sample_data(sampling_pos);

        // dummy code
       	vec4 color = texture(transfer_texture, vec2(s, s));
        dst += color;
        
        // increment the ray sampling position
        sampling_pos  += ray_increment;

        // update the loop termination condition
        inside_volume  = inside_volume_bounds(sampling_pos);
    }
dst /= counter;
#endif
    
#if TASK == 12 || TASK == 13
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added
    while(inside_volume) {

        // get sample
        float s = get_sample_data(sampling_pos);

        // dummy code
        if(s > iso_value) {

			#if TASK == 13 // Binary Search
        		float steps = 1;
       
        		vec3 middle = vec3(0.0);
        		vec3 end = sampling_pos;
				vec3 start = sampling_pos - ray_increment; 
            
				while(steps < 50) {
                	//s = get_sample_data(sampling_pos);
                	middle = (start + end) / 2;
                	s = get_sample_data(middle);
					if(s > iso_value) {
    	                end = middle;
        	    	}
           			else {
                	    start = middle;
            		}
                	steps ++;
                	sampling_pos = middle;
        		}
        		s = get_sample_data(sampling_pos);
			#endif

        	vec4 color = texture(transfer_texture, vec2(s, s));
        	dst = color;

			#if ENABLE_LIGHTNING == 1 // Add Shading
        	
        		vec3 ambient = light_ambient_color;
				vec3 diffuse = light_diffuse_color;
				vec3 specular = light_specular_color;
        	
        		vec3 lightDir;
        		vec3 mirrorRef;
        		vec3 illumination;
				float specAngle;
        	
        		vec3 posGradient = normalize(get_gradient(sampling_pos));
				lightDir = light_position - sampling_pos;
        		lightDir = normalize(lightDir);
        	
        		vec3 camPosition = normalize(camera_location - sampling_pos);
        		mirrorRef = 2 * (dot(lightDir,posGradient))* posGradient - lightDir;

				illumination = ambient + diffuse * clamp(dot(lightDir,posGradient),0,1) + specular *  	pow((clamp(dot(mirrorRef,-camPosition),0,1)), light_ref_coef);
        
				dst = vec4(illumination,1.0);
			#endif

			#if ENABLE_SHADOWING == 1 // Add Shadows
        		//IMPLEMENTSHADOW;
			#endif

        	break;
		}

    // increment the ray sampling position
    sampling_pos += ray_increment;

    inside_volume = inside_volume_bounds(sampling_pos);
	}

#endif 


#if TASK == 31

	#if FRONT_TO_BACK == 1

    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added

	float trans = 1.0; 
	float prev_trans = 1.0;
    float s = get_sample_data(sampling_pos);

	vec3 intensity = texture(transfer_texture, vec2(s, s)).rgb * texture(transfer_texture, vec2(s, s)).a;

    while(inside_volume) {
        // get sample
		float s = get_sample_data(sampling_pos);
		vec4 color = texture(transfer_texture, vec2(s, s));
        trans = trans * prev_trans;
        prev_trans = trans;

        intensity = intensity + (trans*color.rgb*color.a);


		if(trans == 0.0) {
			break;
		}


		#if ENABLE_OPACITY_CORRECTION == 1 // Opacity Correction
    	//IMPLEMENT;
		#else
	 	//float s = get_sample_data(sampling_pos);
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
    }

    dst = vec4(intensity,1.0);

#endif 

#else

	#if 0	
    	while(inside_volume) {
    		sampling_pos += ray_increment;
    		inside_volume = inside_volume_bounds(sampling_pos);
    	}

    	//sampling_pos is now at the very back of the volume
    	sampling_pos -= ray_increment;

	    vec3 intensity = vec3(0.0,0.0,0.0);
    	vec3 just_color = vec3(0.0,0.0,0.0);

	    while(inside_volume) {
			float s = get_sample_data(sampling_pos);
			vec4 color = texture(transfer_texture, vec2(s, s));
			just_color = vec3(color.r, color.g, color.b);
			intensity = (just_color * color.a) + (intensity * (1 - color.a));
    		sampling_pos -= ray_increment;
    		inside_volume = inside_volume_bounds(sampling_pos);
    	}

    	dst = vec4(intensity,1.0);
	#endif

#endif

    // return the calculated color value
    FragColor = dst;
}