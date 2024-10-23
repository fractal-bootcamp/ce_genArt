// render client side only
"use client";

// import dependencies
import dynamic from "next/dynamic";
import * as THREE from "three";
import { Suspense, useRef, useState, MutableRefObject } from "react";
import { useFrame, Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Mesh, TextureLoader, ShaderMaterial } from "three";

// import custom shader material
import { NoiseShaderMaterial } from "./material";

const ShaderControls = dynamic(() => import("./shaderControls"), {
  ssr: false,
});

// define types for rotating scene
interface RotateSceneProps {
  position: [number, number, number];
  scale?: number;
  rowIndex: number;
  colIndex: number;
  depthIndex: number;
}

// rotating scene component - defines 3D objects
function RotateScene({
  position,
  scale = 1,
  rowIndex,
  colIndex,
  depthIndex,
}: RotateSceneProps) {
  // refs to access mesh and material instances
  const meshRotate = useRef<Mesh>(null);
  const materialRef = useRef<typeof NoiseShaderMaterial>(null);
  // state for hover and click interactions
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // animation frame loop
  useFrame((state) => {
    // update mesh rotation
    if (meshRotate.current) {
      meshRotate.current.rotation.y += 0.01;
      if (clicked) {
        meshRotate.current.rotation.y += 0.05;
      }
    }

    // update shader uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.positionIndex.value = new THREE.Vector2(
        colIndex,
        rowIndex
      );
      materialRef.current.uniforms.totalCubes.value = new THREE.Vector2(50, 50);
      materialRef.current.uniforms.depthIndex.value = depthIndex;
    }
  });

  return (
    <mesh
      ref={meshRotate}
      position={position}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? scale * 1.3 : scale}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[2, 2, 2]} />
      <noiseShaderMaterial ref={materialRef} transparent depthWrite={true} />
    </mesh>
  );
}

// main canvas component
export function CanvasComponent() {
  const materialRef = useRef<ShaderMaterial>(null);

  return (
    <div style={{ width: "100%", height: "100vw" }}>
      <Canvas shadows gl={{ antialias: true }}>
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[0, 20, 100]} fov={60} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 6]} color="red" />

        {/* Ground plane */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -20, 0]}
          receiveShadow
        >
          <noiseShaderMaterial transparent depthWrite={true} />
        </mesh>

        {/* 3D grid of cubes */}
        {Array.from({ length: 3 }).map((_, depthIndex) =>
          Array.from({ length: 50 }).map((_, rowIndex) => {
            const scale = 1 - rowIndex * 0.05;
            return Array.from({ length: 50 }).map((_, colIndex) => (
              <RotateScene
                key={`${depthIndex}-${rowIndex}-${colIndex}`}
                position={[
                  (colIndex - 25) * 2, // X position
                  (rowIndex - 25) * 2, // Y position
                  (depthIndex - 1) * 10, // Z position (depth)
                ]}
                scale={scale}
                rowIndex={rowIndex}
                colIndex={colIndex}
                depthIndex={depthIndex}
              />
            ));
          })
        )}

        {/* Shader controls UI */}

        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={100}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          target={[0, 0, 0]}
        />

        {/* Scene fog */}
        <fog attach="fog" args={["#000000", 40, 200]} />
      </Canvas>
      <ShaderControls materialRef={materialRef} />
    </div>
  );
}
