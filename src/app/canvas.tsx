// render client side only
"use client";

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
  scale: number;
}

// defines what 3d objects are in the scene
function RotateScene({ position, scale = 1 }: RotateSceneProps) {
  // state for interactive features
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // current -> accesses the mesh instance
  const meshRotate = useRef<Mesh>(null); // creates a reference to the 3d mesh
  const materialRef = useRef<ShaderMaterial>(null);

  // animation loop - every frame rotates the box by .01 radians
  useFrame((state) => {
    if (meshRotate.current) {
      meshRotate.current.rotation.y += 0.01;
      // rotate faster when clicked
      if (clicked) {
        meshRotate.current.rotation.y += 0.02;
      }
    }
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
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
      scale={hovered ? 1.1 : 1} // scale up when hovered
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
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 20, 50]} fov={60} />
        {/** add ambient light to scene for general illumination */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 6]} color="red" />

        {/** grid array */}
        {Array.from({ length: 50 }).map((_, rowIndex) => {
          // Calculate scale based on row (smaller as we go up)
          const scale = 1 - rowIndex * 0.08; // Will go from 1 to 0.28
          // each row
          return Array.from({ length: 200 }).map((_, colIndex) => (
            <RotateScene
              key={`${rowIndex}-${colIndex}`}
              // Position cubes with 4 units spacing, centered at 0
              position={[
                (colIndex - 5) * 4, // X position (horizontal)
                (rowIndex - 5) * 4, // Y position (vertical)
                0, // Z position (depth)
              ]}
              scale={scale} // Pass scale as prop
            />
          ));
        })}

        {/** add orbit controls for camera manipulation */}
        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={30}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
