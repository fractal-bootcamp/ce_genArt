// materials.tsx
"use client";

// Import necessary dependencies
import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// Create a shader material for noise effect
// shaderMaterial takes three arguments: uniforms, vertex shader, and fragment shader
const NoiseShaderMaterial = shaderMaterial(
  // 1. Uniforms: values passed from JS to shader
  {
    time: 0, // animating time for moving noise
    color: new THREE.Color(0.0, 0.0, 0.0), // base colors (RGB)
    positionIndex: new THREE.Vector2(0, 0), // current cube's grid position
    totalCubes: new THREE.Vector2(50, 50), // grid dimensions
    depthIndex: 0, // z-layer index
  },

  // 2. Vertex Shader: processes geo

  `
  varying vec2 vUv;                             // UV coords for textures& 2d effects 
  varying vec3 vNormal;                         // surface norms for lighting calculations
  varying vec3 vViewPosition;                   // cam-relative position - view-dependent effects 
  varying vec3 vWorldPosition;                  // world space position 
  
  void main() {
    vUv = uv;                                   // pass UV coords 
    vNormal = normalize(normalMatrix * normal); // calculate normals 
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);     // calc world position for lights 
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);    // calc view space position 
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;                // set final vertex position 
  }
`,

  // 3. Fragment Shader: Handles the color/pixel data
  // This creates our noise pattern and gradient effect
  `
    uniform float time;
    uniform vec2 positionIndex;
    uniform vec2 totalCubes;  // Make sure uniform is declared
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



    void main() {

    
// 1- basic setup: prepare normal and view vectors for lighting 
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
// 2- COLOR GEN!!__________________________________________________________________
// add noise to base color 
      vec3 baseColor = getBaseColor(positionIndex, depthIndex);
      float n = noise(vUv * 10.0 + time);                       // animate noise 
      vec3 lighterColor = baseColor + vec3(0.2);
      vec3 color = mix(baseColor, lighterColor, n);

// 3- light position: calculate lights 
      // Moving light
    vec3 lightPosition = vec3(sin(time) * 90.0,  // Circular motion
         200.0, cos(time) * 20.0);
    vec3 lightDir = normalize(lightPosition - vWorldPosition);
      
// 4- diffuse lighting: how light affects surface 
      float diff = max(dot(normal, lightDir), 0.3);
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
  `
);

// make material avaibale in React Three Fiber
extend({ NoiseShaderMaterial });

// Add TypeScript support for the custom material in JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      noiseShaderMaterial: any;
    }
  }
}

// Export for use in other components
export type NoiseShaderMaterialImpl = typeof NoiseShaderMaterial;

export { NoiseShaderMaterial };
