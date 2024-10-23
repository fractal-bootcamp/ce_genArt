// Declare this file as client-side code
"use client";

import { extend } from "@react-three/fiber"; // Allows us to use custom materials in R3F
import type { ReactThreeFiber } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei"; // Helper to create shader materials
import * as THREE from "three"; // Main Three.js library

// Create a custom shader material with three parts: uniforms, vertex shader, and fragment shader
const NoiseShaderMaterial = shaderMaterial(
  // 1. Uniforms: Variables that can be updated from JavaScript
  {
    time: 0, // For animations
    color: new THREE.Color(0.0, 0.0, 0.0), // Base color (RGB)
    positionIndex: new THREE.Vector2(0, 0), // Current cube's position in grid
    totalCubes: new THREE.Vector2(50, 50), // Grid dimensions
    depthIndex: 0, // Z-layer index
    speed: 0.5, // Animation speed control
    intensity: 0.3, // Lighting intensity control
  },

  // 2. Vertex Shader: Processes each vertex of the geometry
  /* glsl */ `
    // Declare varying variables to pass data to fragment shader
    varying vec2 vUv;            // UV coordinates for texturing
    varying vec3 vNormal;        // Surface normals for lighting
    varying vec3 vViewPosition;  // Camera-relative position
    varying vec3 vWorldPosition; // World-space position
    
    void main() {
      // Pass UV coordinates to fragment shader
      vUv = uv;
      
      // Calculate and normalize surface normal
      vNormal = normalize(normalMatrix * normal);
      
      // Calculate world position for lighting
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      // Calculate view-space position
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      // Set final vertex position
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  // 3. Fragment Shader: Colors each pixel
  /* glsl */ `
    // Declare uniforms that we'll update from JavaScript
    uniform float time;          // Animation time
    uniform float speed;         // Animation speed control
    uniform float intensity;     // Lighting intensity
    uniform vec3 color;          // Base color
    uniform vec2 positionIndex;  // Grid position
    uniform vec2 totalCubes;     // Grid size
    uniform float depthIndex;    // Depth layer

    // Receive varying variables from vertex shader
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    // Pseudo-random noise function
    float noise(vec2 p) {
      return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // Normalize vectors for lighting calculations
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Create animated UV coordinates
      vec2 uv = vUv;
      uv.x += sin(time * speed) * 0.5;
      uv.y += cos(time * speed) * 0.5;

      // Define colors for each depth layer
      vec3 colors[3] = vec3[3](
        vec3(0.8, 0.0, 0.0),    // Red for first layer
        vec3(0.0, 0.8, 0.0),    // Green for second layer
        vec3(0.0, 0.0, 0.8)     // Blue for third layer
      );

      // Define secondary colors for gradient
      vec3 colors2[3] = vec3[3](
        vec3(1.0, 0.5, 0.0),    // Orange
        vec3(0.0, 1.0, 0.5),    // Lime
        vec3(0.5, 0.0, 1.0)     // Purple
      );

      // Select colors based on depth layer
      vec3 color1 = colors[int(depthIndex)];
      vec3 color2 = colors2[int(depthIndex)];
      vec3 color = mix(color1, color2, uv.x);

      // Calculate lighting
      vec3 lightPosition = vec3(90.0, 10.0, 20.0);
      vec3 lightDir = normalize(lightPosition - vWorldPosition);
      
      // Calculate diffuse lighting
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = color * diff;
      
      // Calculate ambient lighting using intensity uniform
      vec3 ambient = color * intensity;
      
      // Calculate specular highlights
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
      vec3 specular = vec3(0.5) * spec;
      
      // Combine all lighting components
      vec3 finalColor = ambient + diffuse + specular;
      
      // Output final color with full opacity
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Extend directly with NoiseShaderMaterial
extend({ NoiseShaderMaterial });

// TypeScript support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      noiseShaderMaterial: any; // Simplified type for now
    }
  }
}

export { NoiseShaderMaterial };
