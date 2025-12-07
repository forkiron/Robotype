"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid, Text } from "@react-three/drei";
import * as THREE from "three";

export function Workplane() {
  const { camera } = useThree();
  const gridRef = useRef<THREE.Group>(null);
  const lastDistance = useRef(0);

  // Calculate grid size based on camera distance
  const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
  
  // Update grid cell size based on distance
  // Closer = smaller cells (finer grid), farther = larger cells
  const cellSize = useMemo(() => {
    // Map distance to cell size: 0.5-50 units distance -> 0.1-10 cell size
    const normalizedDistance = Math.max(0.5, Math.min(50, distance));
    return Math.max(0.1, Math.min(10, normalizedDistance * 0.2));
  }, [distance]);

  const sectionSize = cellSize * 10;

  // Force re-render when distance changes significantly
  useFrame(() => {
    const currentDistance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    if (Math.abs(currentDistance - lastDistance.current) > 0.5) {
      lastDistance.current = currentDistance;
    }
  });

  return (
    <group ref={gridRef}>
      {/* Main workplane grid with dynamic sizing */}
      <Grid
        key={`grid-${cellSize.toFixed(2)}`} // Force re-render when cellSize changes
        renderOrder={-1}
        position={[0, 0, 0]}
        infiniteGrid
        cellSize={cellSize}
        cellThickness={0.5}
        cellColor="#60a5fa"
        sectionSize={sectionSize}
        sectionThickness={1}
        sectionColor="#3b82f6"
        fadeDistance={50}
        fadeStrength={1}
      />
      
      {/* Workplane Labels */}
      <Text
        position={[-20, 0.1, -20]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={8}
        color="#60a5fa"
        opacity={0.6}
        anchorX="left"
        anchorY="middle"
      >
        Workplane
      </Text>
      
      <Text
        position={[20, 0.1, 20]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={3}
        color="#60a5fa"
        opacity={0.6}
        anchorX="right"
        anchorY="middle"
      >
        Millimeters
      </Text>
      
      {/* Origin marker */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.1, 0.02, 0.1]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
}
