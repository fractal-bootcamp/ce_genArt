// render client side only
"use client";

import * as THREE from "three";

// import necessary components and hooks
import { Suspense, useRef, useState } from "react";
import { useFrame, Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Mesh, TextureLoader, ShaderMaterial } from "three";

// custom material
import "./material"; // Important: This needs to be imported first

// define prop types for RotateScene
interface RotateSceneProps {
  position: [number, number, number];
  scale?: number;
  rowIndex: number;
  colIndex: number;
  depthIndex: number;
}

// defines what 3d objects are in the scene
function RotateScene({
  position,
  scale = 1,
  rowIndex,
  colIndex,
  depthIndex,
}: RotateSceneProps) {
  // current -> accesses the mesh instance
  const meshRotate = useRef<Mesh>(null); // creates a reference to the 3d mesh
  const materialRef = useRef<ShaderMaterial>(null);

  // state for interactive features
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // animation loop - every frame rotates the box by .01 radians
  useFrame((state) => {
    if (meshRotate.current) {
      meshRotate.current.rotation.y += 0.01;
      // rotate faster when clicked
      if (clicked) {
        meshRotate.current.rotation.y += 0.05;
      }
    }
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
    // create 3d mesh & attaches reference to it
    <mesh
      ref={meshRotate}
      position={position}
      // add interaction handlers
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? scale * 1.5 : scale} // scale up when hovered
      castShadow
      receiveShadow
    >
      {/** add a box geometry to the mesh dimension 2-2-2 */}
      <boxGeometry args={[2, 2, 2]} />
      {/** apply material with interactive colors */}
      <noiseShaderMaterial ref={materialRef} />
    </mesh>
  );
}

// define main canvas component
export function CanvasComponent() {
  return (
    // create a container div for the canvas
    <div style={{ width: "100%", height: "100vw" }}>
      {/** R3F canvas component which sets Three.js scene */}
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 20, 100]} fov={60} />
        {/** add ambient light to scene for general illumination */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 6]} color="red" />

        {/* // ground plane for shadows  */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -20, 0]}
          receiveShadow
        >
          {/* // grid  */}
          {/* <planeGeometry args={[300, 300]} /> */}
          {/* <meshStandardMaterial color="#666666" /> */}

          <noiseShaderMaterial />
        </mesh>

        {/* // 3d grid array  */}
        {Array.from({ length: 3 }).map((_, depthIndex) =>
          Array.from({ length: 50 }).map((_, rowIndex) => {
            // Calculate scale based on row (smaller as we go up)
            const scale = 1 - rowIndex * 0.05; // Will go from 1 to 0.05
            // each row
            return Array.from({ length: 50 }).map((_, colIndex) => (
              <RotateScene
                key={`${depthIndex}-${rowIndex}-${colIndex}`}
                // Position cubes with 4 units spacing, centered at 0
                position={[
                  (colIndex - 25) * 2, // X position (horizontal)
                  (rowIndex - 25) * 2, // Y position (vertical)
                  (depthIndex - 1) * 10, // Z position (depth)
                ]}
                scale={scale} // Pass scale as prop
                rowIndex={rowIndex}
                colIndex={colIndex}
                depthIndex={depthIndex}
              />
            ));
          })
        )}

        {/** add orbit controls for camera manipulation */}
        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={100}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          target={[0, 0, 0]}
        />
        <fog attach="fog" args={["#000000", 40, 200]} />
      </Canvas>
    </div>
  );
}
