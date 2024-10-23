// Declare this file as client-side code
"use client";

import { OrbitControls, TransformControls } from "three-stdlib";
extend({ OrbitControls, TransformControls });
import { extend } from "@react-three/fiber";
import type { ReactThreeFiber } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// Create the material
const NoiseShaderMaterial = shaderMaterial(
  // Uniforms
  {
    time: 0,
    speed: 0.5,
    intensity: 0.3,
    positionIndex: new THREE.Vector2(0, 0),
    totalCubes: new THREE.Vector2(50, 50),
    depthIndex: 0,
    // For array uniforms, pass them directly
    layer1Colors: [
      new THREE.Vector3(0.8, 0.0, 0.0),
      new THREE.Vector3(1.0, 0.5, 0.0),
    ],
    layer2Colors: [
      new THREE.Vector3(0.0, 0.8, 0.0),
      new THREE.Vector3(0.0, 1.0, 0.5),
    ],
    layer3Colors: [
      new THREE.Vector3(0.0, 0.0, 0.8),
      new THREE.Vector3(0.5, 0.0, 1.0),
    ],
    gridSpacing: 2.0,
  },

  // Vertex Shader
  /* glsl */ `
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

  // Fragment Shader
  /* glsl */ `
    uniform float time;
    uniform float speed;
    uniform float intensity;
    uniform vec2 positionIndex;
    uniform vec2 totalCubes;
    uniform float depthIndex;
    uniform vec3 layer1Colors[2];
    uniform vec3 layer2Colors[2];
    uniform vec3 layer3Colors[2];
    uniform float gridSpacing;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      vec2 uv = vUv;
      uv.x += sin(time * speed) * 0.5;
      uv.y += cos(time * speed) * 0.5;

      vec3 color1;
      vec3 color2;
      
      if (depthIndex == 0.0) {
        color1 = layer1Colors[0];
        color2 = layer1Colors[1];
      } else if (depthIndex == 1.0) {
        color1 = layer2Colors[0];
        color2 = layer2Colors[1];
      } else {
        color1 = layer3Colors[0];
        color2 = layer3Colors[1];
      }
      
      vec3 color = mix(color1, color2, uv.x);
      
      vec3 lightPosition = vec3(90.0, 10.0, 20.0);
      vec3 lightDir = normalize(lightPosition - vWorldPosition);
      
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = color * diff;
      
      vec3 ambient = color * intensity;
      
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
      vec3 specular = vec3(0.5) * spec;
      
      vec3 finalColor = ambient + diffuse + specular;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Extend Three.js materials
extend({ NoiseShaderMaterial });

// Create the type for our material
export type NoiseShaderMaterialType = THREE.ShaderMaterial & {
  uniforms: {
    time: { value: number };
    speed: { value: number };
    intensity: { value: number };
    positionIndex: { value: THREE.Vector2 };
    totalCubes: { value: THREE.Vector2 };
    depthIndex: { value: number };
    layer1Colors: { value: THREE.Vector3[] };
    layer2Colors: { value: THREE.Vector3[] };
    layer3Colors: { value: THREE.Vector3[] };
    gridSpacing: { value: number };
  };
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      noiseShaderMaterial: ReactThreeFiber.Object3DNode<
        NoiseShaderMaterialType,
        typeof NoiseShaderMaterial
      >;
    }
  }
}

export { NoiseShaderMaterial };
