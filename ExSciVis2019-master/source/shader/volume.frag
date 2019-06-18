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

// Compute gradient vector
vec3 get_gradient(vec3 sampling_pos) {
    float stepsize_x = 1.0 / volume_dimensions.x;
    float stepsize_y = 1.0 / volume_dimensions.y;
    float stepsize_z = 1.0 / volume_dimensions.z;

    float fx = get_sample_data(vec3(sampling_pos.x + stepsize_x, sampling_pos.y, sampling_pos.z));
    float bx = get_sample_data(vec3(sampling_pos.x - stepsize_x, sampling_pos.y, sampling_pos.z));
    float cdx = fx - bx;

    float fy = get_sample_data(vec3(sampling_pos.x, sampling_pos.y + stepsize_y, sampling_pos.z));
    float by = get_sample_data(vec3(sampling_pos.x, sampling_pos.y - stepsize_y, sampling_pos.z));
    float cdy = fy - by;

    float fz = get_sample_data(vec3(sampling_pos.x, sampling_pos.y, sampling_pos.z + stepsize_z));
    float bz = get_sample_data(vec3(sampling_pos.x, sampling_pos.y, sampling_pos.z - stepsize_z));
    float cdz = fz - bz;

    vec3 grad;
    grad.x = cdx;
    grad.y = cdy;
    grad.z = cdz;
    return grad;
}

// Compute illumination
vec3 compute_lighting(vec3 sampling_pos) {
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

    /// check if we are inside volume
    bool inside_volume = inside_volume_bounds(sampling_pos);
    
    if (!inside_volume)
        discard;

#if TASK == 10
    vec4 max_val = vec4(0.0, 0.0, 0.0, 0.0);
    
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
    vec4 max_val = vec4(0.0, 0.0, 0.0, 0.0);

    int count = 0;

    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added
    while (inside_volume)
    {      
        // get sample
        float s = get_sample_data(sampling_pos);

        // dummy code
        dst = vec4(sampling_pos, 1.0);

        // apply the transfer functions to retrieve color and opacity
        vec4 color = texture(transfer_texture, vec2(s, s));
        
        // increment the ray sampling position
        sampling_pos  += ray_increment;

        // update the loop termination condition
        inside_volume  = inside_volume_bounds(sampling_pos);

        max_val += color;

        count ++;
    }
    // take average of vector
    avg_val = max_val / count;

    dst = avg_val;

#endif
    
#if TASK == 12 || TASK == 13
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added

    vec4 hit_val = vec4(0.0, 0.0, 0.0, 0.0);
    int count = 0;

    bool sign_val;
    bool old_sign;

    while (inside_volume)
    {
        // get sample
        float s = get_sample_data(sampling_pos);

        // dummy code
        dst = vec4(light_diffuse_color, 1.0);

        // apply the transfer functions to retrieve color and opacity
        vec4 color = texture(transfer_texture, vec2(s, s));

        sign_val = s - iso_value < 0.0;

        if (sign_val != old_sign) {
        dst = color;
        break;
        }

        // increment the ray sampling position
        sampling_pos += ray_increment;

        if(count == 0) {
            hit_val = color;
            break;
        }
        count ++;

        #if TASK == 13 // Binary Search

                while (inside_volume) {
                float s = get_sample_data(sampling_pos);
                float steps = 1;

                if (s > iso_value) {
                    while (steps < 16) {
                        s = get_sample_data(sampling_pos);
                        ray_increment = ray_increment / 2;
                        if (s > iso_value) {
                            sampling_pos += -1 * ray_increment;
                        }
                        else {
                            sampling_pos += 1 * ray_increment;
                        }
                        steps++;
                    }
                    vec4 color = texture(transfer_texture, vec2(s,s));
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
                //IMPLEMENTLIGHT;
                dst = vec4(compute_lighting(sampling_pos), 1.0);

        #if ENABLE_SHADOWING == 1 // Add Shadows
                //IMPLEMENTSHADOW;
                if (ENABLE_LIGHTNING == 1) {
                    vec3 sample_path_to_sun = normalize(sampling_pos - light_position) * sampling_distance;

                    // increment the ray sampling position
                    sampling_pos += ray_increment;

                    while(inside_volume) {
                        float s = get_sample_data(sampling_pos);
                        if (s > iso_value) {
                        dst = vec4(light_ambient_color, 1.0);
                        break;
                        }
                        
                        // increment the ray sampling position
                        sampling_pos += ray_increment;

                        // update the loop termination condition
                        inside_volume = inside_volume_bounds(sampling_pos);

                    }
                }
        #endif
        #endif

        // update the loop termination condition
        inside_volume = inside_volume_bounds(sampling_pos);
        
    }
    dst = hit_val;
#endif 

#if TASK == 31
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added
    while (inside_volume)
    {
        // get sample
#if ENABLE_OPACITY_CORRECTION == 1 // Opacity Correction
        IMPLEMENT;
#else
        float s = get_sample_data(sampling_pos);
#endif
        // dummy code
        dst = vec4(light_specular_color, 1.0);

        // increment the ray sampling position
        sampling_pos += ray_increment;

#if ENABLE_LIGHTNING == 1 // Add Shading
        IMPLEMENT;
#endif

        // update the loop termination condition
        inside_volume = inside_volume_bounds(sampling_pos);
    }
#endif 

    // return the calculated color value
    FragColor = dst;
}
