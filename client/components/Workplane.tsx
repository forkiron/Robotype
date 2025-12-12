"use client";

import { Grid } from "@react-three/drei";
import * as THREE from "three";

export function Workplane() {
  // Grid visible from ALL angles - render grids on top and bottom to ensure visibility
  const cellSize = 1;
  const sectionSize = 10;
  const gridSize = 200; // Size of the square grid (20 units)

  return (
    <>
      {/* Main horizontal workplane on XZ (y=0) */}
      <Grid
        renderOrder={-1}
        position={[0, 0, 0]} // grounded at y=0
        rotation={[0, 0, 0]} // XZ plane (horizontal)
        infiniteGrid={false}
        args={[gridSize, gridSize]}
        cellSize={cellSize}
        cellThickness={3}
        cellColor="#cbd5e1"
        sectionSize={sectionSize}
        sectionThickness={5}
        sectionColor="#94a3b8"
        fadeDistance={10000}
        fadeStrength={0}
      />
    </>
  );
}
