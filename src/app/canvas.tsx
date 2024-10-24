// render client side only
"use client";

// import dependencies
import dynamic from "next/dynamic";
import * as THREE from "three";
import { Suspense, useRef, useState, MutableRefObject } from "react";
import { useFrame, Canvas, useLoader, extend } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Mesh, TextureLoader, ShaderMaterial } from "three";

// import custom shader material with its type
import { NoiseShaderMaterial, NoiseShaderMaterialType } from "./material";

extend({ NoiseShaderMaterial });

// Import controls with SSR disabled
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
  gridSpacing: number; // Added to support dynamic grid spacing
}

// rotating scene component - defines 3D objects
function RotateScene({
  position,
  scale = 1,
  rowIndex,
  colIndex,
  depthIndex,
  gridSpacing, // Add gridSpacing to props
}: RotateSceneProps) {
  // refs to access mesh and material instances
  const meshRotate = useRef<Mesh>(null);
  // Update material ref type to use NoiseShaderMaterialType
  const materialRef = useRef<NoiseShaderMaterialType>(null);
  // state for hover and click interactions
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // animation frame loop
  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.positionIndex.value.set(colIndex, rowIndex);
      materialRef.current.uniforms.totalCubes.value.set(50, 50);
      materialRef.current.uniforms.depthIndex.value = depthIndex;
      materialRef.current.uniforms.gridSpacing.value = gridSpacing;
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
      <noiseShaderMaterial
        ref={materialRef}
        transparent
        depthWrite={true}
        key={`material-${rowIndex}-${colIndex}-${depthIndex}`}
      />
    </mesh>
  );
}

// main canvas component
export function CanvasComponent() {
  // Update material ref to use NoiseShaderMaterialType
  const materialRef = useRef<NoiseShaderMaterialType>(null);
  // Add state for grid spacing
  const [gridSpacing, setGridSpacing] = useState(2.0);

  return (
    <div style={{ width: "100%", height: "100vw" }}>
      <Canvas shadows gl={{ antialias: true }}>
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[0, 20, 100]} fov={60} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 6]} color="red" />

        {/* Ground plane with updated material ref */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -20, 0]}
          receiveShadow
        >
          <noiseShaderMaterial
            ref={materialRef}
            transparent
            depthWrite={true}
          />
        </mesh>

        {/* 3D grid of cubes - now with dynamic spacing */}
        {Array.from({ length: 3 }).map((_, depthIndex) =>
          Array.from({ length: 50 }).map((_, rowIndex) => {
            const scale = 1 - rowIndex * 0.05;
            return Array.from({ length: 50 }).map((_, colIndex) => (
              <RotateScene
                key={`${depthIndex}-${rowIndex}-${colIndex}`}
                position={[
                  (colIndex - 25) * gridSpacing, // X position with dynamic spacing
                  (rowIndex - 25) * gridSpacing, // Y position with dynamic spacing
                  (depthIndex - 1) * 10, // Z position (depth)
                ]}
                scale={scale}
                rowIndex={rowIndex}
                colIndex={colIndex}
                depthIndex={depthIndex}
                gridSpacing={gridSpacing} // Pass gridSpacing to RotateScene
              />
            ));
          })
        )}

        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={100}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          target={[0, 0, 0]}
        />

        {/* Scene fog for depth effect */}
        <fog attach="fog" args={["#000000", 40, 200]} />
      </Canvas>

      {/* Shader controls panel - now properly typed and with grid spacing controls */}
      <ShaderControls
        materialRef={materialRef}
        gridSpacing={gridSpacing}
        setGridSpacing={setGridSpacing}
      />
    </div>
  );
}
