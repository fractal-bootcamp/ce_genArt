// client component for controls
"use client";

import { useState } from "react";
import { MutableRefObject } from "react";
import { Vector3 } from "three";
import dynamic from "next/dynamic";
import { NoiseShaderMaterialType } from "./material";

interface ShaderControlsProps {
  materialRef: MutableRefObject<NoiseShaderMaterialType | null>;
  gridSpacing: number;
  setGridSpacing: (value: number) => void;
}

function ShaderControls({
  materialRef,
  gridSpacing,
  setGridSpacing,
}: ShaderControlsProps) {
  const [speed, setSpeed] = useState(0.5);
  const [intensity, setIntensity] = useState(0.3);

  // Color configuration state
  const [colorConfig, setColorConfig] = useState({
    layer1Primary: "#cc0000",
    layer1Secondary: "#ff8800",
    layer2Primary: "#00cc00",
    layer2Secondary: "#00ff88",
    layer3Primary: "#0000cc",
    layer3Secondary: "#8800ff",
  });

  // convert hex to RGB
  const hexToRGB = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  // update colors in the shader
  const updateColors = (
    layerIndex: number,
    isPrimary: boolean,
    newColor: string
  ) => {
    if (materialRef.current) {
      try {
        const colorArray =
          materialRef.current.uniforms[`layer${layerIndex}Colors`].value;
        const colorIndex = isPrimary ? 0 : 1;

        const rgb = hexToRGB(newColor);
        if (colorArray[colorIndex] instanceof Vector3) {
          colorArray[colorIndex].set(rgb[0], rgb[1], rgb[2]);
        }
      } catch (error) {
        console.error("Error updating colors:", error);
      }
    }
  };

  return (
    <div className="absolute top-0 right-0 p-4 bg-white/20 backdrop-blur space-y-4">
      {/* Speed Control */}
      <div className="space-y-2">
        <label htmlFor="speed" className="block text-sm font-medium">
          Speed
        </label>
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
          className="w-full"
        />
      </div>

      {/* Intensity Control */}
      <div className="space-y-2">
        <label htmlFor="intensity" className="block text-sm font-medium">
          Intensity
        </label>
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
          className="w-full"
        />
      </div>

      {/* Grid Spacing Control */}
      <div className="space-y-2">
        <label htmlFor="gridSpacing" className="block text-sm font-medium">
          Grid Spacing
        </label>
        <input
          id="gridSpacing"
          type="range"
          min="1"
          max="5"
          step="0.1"
          value={gridSpacing}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setGridSpacing(value);
            if (materialRef.current) {
              materialRef.current.uniforms.gridSpacing.value = value;
            }
          }}
          className="w-full"
        />
      </div>

      {/* Color controls */}
      <div className="space-y-4">
        <h3 className="font-medium">Layer Colors</h3>

        {/* Layer 1 Colors */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Layer 1</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colorConfig.layer1Primary}
              onChange={(e) => {
                updateColors(1, true, e.target.value);
                setColorConfig((prev) => ({
                  ...prev,
                  layer1Primary: e.target.value,
                }));
              }}
              className="w-1/2"
            />
            <input
              type="color"
              value={colorConfig.layer1Secondary}
              onChange={(e) => {
                updateColors(1, false, e.target.value);
                setColorConfig((prev) => ({
                  ...prev,
                  layer1Secondary: e.target.value,
                }));
              }}
              className="w-1/2"
            />
          </div>
        </div>

        {/* Layer 2 Colors */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Layer 2</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colorConfig.layer2Primary}
              onChange={(e) => {
                updateColors(2, true, e.target.value);
                setColorConfig((prev) => ({
                  ...prev,
                  layer2Primary: e.target.value,
                }));
              }}
              className="w-1/2"
            />
            <input
              type="color"
              value={colorConfig.layer2Secondary}
              onChange={(e) => {
                updateColors(2, false, e.target.value);
                setColorConfig((prev) => ({
                  ...prev,
                  layer2Secondary: e.target.value,
                }));
              }}
              className="w-1/2"
            />
          </div>
        </div>

        {/* Layer 3 Colors */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Layer 3</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colorConfig.layer3Primary}
              onChange={(e) => {
                updateColors(3, true, e.target.value);
                setColorConfig((prev) => ({
                  ...prev,
                  layer3Primary: e.target.value,
                }));
              }}
              className="w-1/2"
            />
            <input
              type="color"
              value={colorConfig.layer3Secondary}
              onChange={(e) => {
                updateColors(3, false, e.target.value);
                setColorConfig((prev) => ({
                  ...prev,
                  layer3Secondary: e.target.value,
                }));
              }}
              className="w-1/2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export as a client component with no SSR
export default dynamic(() => Promise.resolve(ShaderControls), {
  ssr: false,
});
