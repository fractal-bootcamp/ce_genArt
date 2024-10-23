// client component for controls
"use client";

import { useState } from "react";
import { MutableRefObject } from "react";
import { ShaderMaterial } from "three";
import dynamic from "next/dynamic";

interface ShaderControlsProps {
  materialRef: MutableRefObject<typeof NoiseShaderMaterial | null>;
}

function ShaderControls({ materialRef }: ShaderControlsProps) {
  const [speed, setSpeed] = useState(0.5);
  const [intensity, setIntensity] = useState(0.3);

  return (
    <div className="absolute top-0 right-0 p-4 bg-white/20 backdrop-blur">
      <div>
        <label htmlFor="speed">Speed</label>
        <input
          id="speed"
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={speed}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setSpeed(value);
            if (materialRef.current) {
              materialRef.current.uniforms.speed.value = value;
            }
          }}
        />
      </div>
      <div>
        <label htmlFor="intensity">Intensity</label>
        <input
          id="intensity"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={intensity}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setIntensity(value);
            if (materialRef.current) {
              materialRef.current.uniforms.intensity.value = value;
            }
          }}
        />
      </div>
    </div>
  );
}

// Export as a client component with no SSR
export default dynamic(() => Promise.resolve(ShaderControls), {
  ssr: false,
});
