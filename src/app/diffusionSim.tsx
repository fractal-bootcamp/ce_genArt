"use client";
import React, { useState, useEffect, useRef } from "react";

const GrayScottSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [grid, setGrid] = useState<number[][]>([]);
  const [flowRadius, setFlowRadius] = useState(0);
  const [flowRotate, setFlowRotate] = useState(0);
  const [scale, setScale] = useState(1);

  const width = 200;
  const height = 200;
  const dA = 1.0;
  const dB = 0.5;
  const feed = 0.055;
  const kill = 0.062;

  useEffect(() => {
    initializeGrid();
  }, []);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(update, 50);
      return () => clearInterval(interval);
    }
  }, [isRunning, grid, flowRadius, flowRotate, scale]);

  const initializeGrid = () => {
    const newGrid: number[][] = [];
    for (let i = 0; i < height; i++) {
      newGrid[i] = new Array(width).fill(1);
    }
    // Seed a small area with chemical B
    for (let i = 90; i < 110; i++) {
      for (let j = 90; j < 110; j++) {
        newGrid[i][j] = 0;
      }
    }
    setGrid(newGrid);
  };

  const update = () => {
    const newGrid: number[][] = grid.map((row) => [...row]);

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const a = grid[i][j];
        const b = 1 - a;

        // Apply flow
        const angle = (flowRotate * Math.PI) / 180;
        const fi = Math.round(i + Math.sin(angle) * flowRadius);
        const fj = Math.round(j + Math.cos(angle) * flowRadius);
        const flowA = grid[fi % height][fj % width];

        // Simplified reaction-diffusion calculation
        let nextA = a + (dA * (flowA - a) - a * b * b + feed * (1 - a)) * scale;
        nextA = Math.max(0, Math.min(1, nextA));
        newGrid[i][j] = nextA;
      }
    }

    setGrid(newGrid);
    draw();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = (i * width + j) * 4;
        const value = Math.floor(grid[i][j] * 255);
        imageData.data[index] = value;
        imageData.data[index + 1] = value;
        imageData.data[index + 2] = value;
        imageData.data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const toggleSimulation = () => setIsRunning(!isRunning);
  const resetSimulation = () => {
    setIsRunning(false);
    initializeGrid();
  };

  return (
    <div className="flex flex-col items-center p-4">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300"
      />
      <div className="mt-4 space-x-4">
        <button
          onClick={toggleSimulation}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isRunning ? "Stop" : "Start"}
        </button>
        <button
          onClick={resetSimulation}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Reset
        </button>
      </div>
      <div className="mt-4 space-y-2">
        <div>
          <label>Flow Radius: </label>
          <input
            type="range"
            min="0"
            max="10"
            value={flowRadius}
            onChange={(e) => setFlowRadius(Number(e.target.value))}
          />
          <span>{flowRadius}</span>
        </div>
        <div>
          <label>Flow Rotate: </label>
          <input
            type="range"
            min="0"
            max="360"
            value={flowRotate}
            onChange={(e) => setFlowRotate(Number(e.target.value))}
          />
          <span>{flowRotate}°</span>
        </div>
        <div>
          <label>Scale: </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
          <span>{scale.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default GrayScottSimulation;
