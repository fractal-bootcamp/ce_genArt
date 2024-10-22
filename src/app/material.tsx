// materials.tsx
"use client";

// Import necessary dependencies
import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// Create a shader material for noise effect
// shaderMaterial takes three arguments: uniforms, vertex shader, and fragment shader
const NoiseShaderMaterial = shaderMaterial(
  // 1. Uniforms: Variables that can be updated from JavaScript
  {
    time: 0, // Will be used to animate the noise
    color: new THREE.Color(0.0, 0.0, 0.0),
    positionIndex: new THREE.Vector2(0, 0), // creates a 2D vector to store cube's position
    totalCubes: new THREE.Vector2(50, 50), // store total grid size (10, 10) -> x- columns , y- rows
  },

  // 2. Vertex Shader: Handles the position/geometry of the mesh -- processes each vertex of the geometry
  // passes UV coordinates to the fragment shader
  `
   varying vec2 vUv; // declare varying to pass to fragment shader
   
   void main() {
     vUv = uv; // pass UVs to fragment shader
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }
 `,

  // 3. Fragment Shader: Handles the color/pixel data
  // This creates our noise pattern and gradient effect
  `
  uniform float time; // receive time uniform
  uniform vec3 color; // receive color uniform
  varying vec2 vUv;   // receive UVs from vertex shader

  // Random noise function
  float noise(vec2 p) {
    return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;
    
    // Create animated noise pattern
    float n = noise(uv * 10.0 + time);
    
    // Define gradient colors
    vec3 color1 = vec3(0.0, 0.5, 0.3); // Pink/red
    vec3 color2 = vec3(0.2, 0.0, 0.5); // Deep purple
    
    // Mix colors based on noise
    vec3 finalColor = mix(color1, color2, n);
    
    // Output final color
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
