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
    depthIndex: 0, // z index
  },

  // 2. Vertex Shader: Handles the position/geometry of the mesh -- processes each vertex of the geometry
  // passes UV coordinates to the fragment shader
  `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
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

    float noise(vec2 p) {
      return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    vec3 getBaseColor(vec2 position, float depth) {
      vec2 normalizedPos = position / totalCubes;  // Now totalCubes is defined

      // Fixed color values (removed extra decimal point)
      vec3 colors[3] = vec3[3](
        vec3(0.0, 0.5, 0.3),  // layer 1
        vec3(0.4, 0.0, 0.8),  // layer 2 (fixed 0.0. to 0.0)
        vec3(0.8, 0.0, 0.0)   // layer 3
      );

      vec3 baseColor1 = colors[int(depth)];
      vec3 baseColor2 = baseColor1 + vec3(0.2, 0.2, 0.2);
      vec3 baseColor3 = baseColor2 + vec3(0.2, 0.2, 0.2);

      vec3 horizontalGradient = mix(baseColor1, baseColor2, normalizedPos.x);
      vec3 verticalGradient = mix(baseColor2, baseColor3, normalizedPos.y);

      return mix(horizontalGradient, verticalGradient, 0.5);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      vec3 baseColor = getBaseColor(positionIndex, depthIndex);
      float n = noise(vUv * 10.0 + time);
      vec3 lighterColor = baseColor + vec3(0.2);
      vec3 color = mix(baseColor, lighterColor, n);

      vec3 lightPosition = vec3(20.0, 40.0, 20.0);
      vec3 lightDir = normalize(lightPosition - vWorldPosition);
      
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = color * diff;
      vec3 ambient = color * 0.3;
      
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
      vec3 specular = vec3(0.5) * spec;
      
      vec3 finalColor = ambient + diffuse + specular;
      
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
