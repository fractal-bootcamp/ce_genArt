uniform float time;
    uniform vec2 positionIndex;
    uniform vec2 totalCubes;  
    uniform float depthIndex;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    float noise(vec2 p) {                                        // creates random noise 
      return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    
    vec3 getBaseColor(vec2 position, float depth) {             // generate color based off position & depth 
    vec2 normalizedPos = position / totalCubes;                 // convert grid to 0-1 range 

// define the colors for each depth layer 
    vec3 colors[3] = vec3[3](
        vec3(0.0, 0.5, 0.3),  // layer 1
        vec3(0.4, 0.0, 0.8),  // layer 2 (fixed 0.0. to 0.0)
        vec3(0.8, 0.0, 0.0)   // layer 3
      );

// get the base color for the current depth 
      vec3 baseColor1 = colors[int(depth)];
    // lighter variations 
      vec3 baseColor2 = baseColor1 + vec3(0.2, 0.2, 0.2);
      vec3 baseColor3 = baseColor2 + vec3(0.2, 0.2, 0.2);
      
// create the gradients 
      vec3 horizontalGradient = mix(baseColor1, baseColor2, normalizedPos.x);
      vec3 verticalGradient = mix(baseColor2, baseColor3, normalizedPos.y);

      return mix(horizontalGradient, verticalGradient, 0.5);
    }


//_________________________________________________MAIN 
    void main() {

// 1- basic setup: prepare normal and view vectors for lighting 
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
// 2- COLOR GEN!!
  // Animate UV's

     vec2 uv = vUv;
        uv.x += sin(time * 0.5) * 0.5;
        uv.y += cos(time * 0.5) * 0.5;

// Define starting gradient colors for each layer 

    vec3 colors[3] = vec3[3](
        vec3(0.5, 0.0, 1.0),                // first array -- purp  
        vec3(0.0, 1.0, 0.5),                // second array -- mint 
        vec3(1.0, 1.0, 0.0)                 // third array -- yellow
    ); 

    // define ending color for each gradient 

        vec3 colors2[3] = vec3[3](
            vec3(1.0, 0.5, 0.0),                 // first -- orange
            vec3(0.0, 1.0, 0.5),                 // second -- lime 
            vec3(0.5, 0.0, 1.0)                 // third - blue 
        ); 

    // select color based on depth 
        
        vec3 color1 = colors[int(depthIndex)];      // gets 1st color
        vec3 color2 = colors2[int(depthIndex)];     // gets 2nd color 
    // create gradient with selected colors 
        vec3 color = mix(color1, color2, uv.x);     // mixes colors 



// 3- light position: calculate lights 
      // Moving light
    vec3 lightPosition = vec3(sin(time) * 90.0,  // Circular motion
         200.0, cos(time) * 20.0);
    vec3 lightDir = normalize(lightPosition - vWorldPosition);
      
// 4- diffuse lighting: how light affects surface 
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = color * diff;

// 5- address ambient lighting 
      vec3 ambient = color * 0.3;
      
// 6- specular highlights and refelctions 
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
      vec3 specular = vec3(0.5) * spec;
    
// 7 - composition: combine all lighting components 
      vec3 finalColor = ambient + diffuse + specular;   
// output final color with alpha=1.0 
      gl_FragColor = vec4(finalColor, 1.0);
    }