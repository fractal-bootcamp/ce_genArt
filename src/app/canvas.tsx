// render client side only
"use client";

// import Canvas component
import { Canvas } from "@react-three/fiber";

// functional component for 3D scene
function Scene() {
  return (
    // create 3d mesh
    <mesh>
      {/** add a box geometry to the mesh dimension 2-2-2 */}
      <boxGeometry args={[2, 2, 2]} />
      {/** apply material */}
      <meshStandardMaterial />
    </mesh>
  );
}

export function CanvasComponent() {
  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Scene />
      </Canvas>
    </div>
  );
}
