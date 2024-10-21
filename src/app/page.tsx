import dynamic from "next/dynamic";

const CanvasComponent = dynamic(
  () => import("./canvas").then((mod) => mod.CanvasComponent),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <main>
      <h1>My 3D Scene</h1>
      <CanvasComponent />
    </main>
  );
}
