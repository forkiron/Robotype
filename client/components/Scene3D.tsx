"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Workplane } from "./Workplane";
import { ViewCube } from "./ViewCube";
import { useEffect, useRef, RefObject } from "react";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

function CameraController({ cameraRef }: { cameraRef: RefObject<THREE.Camera> }) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (cameraRef) {
      cameraRef.current = camera;
    }
  }, [camera, cameraRef]);

  return null;
}

interface Scene3DProps {
  controlsRef?: RefObject<OrbitControlsImpl | null>;
  cameraRef?: RefObject<THREE.Camera | null>;
  onViewChange?: (view: string) => void;
  currentView?: string;
}

export function Scene3D({ controlsRef, cameraRef, onViewChange, currentView }: Scene3DProps) {
  const orbitControlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef) {
      controlsRef.current = orbitControlsRef.current;
    }
  }, [controlsRef]);

  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      className="w-full h-full"
      style={{ background: "#f8fafc" }}
      onCreated={({ camera }) => {
        camera.position.set(0, 5, 10);
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />
      <CameraController controlsRef={controlsRef} cameraRef={cameraRef} />
      
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.3} />
      
      <OrbitControls
        ref={orbitControlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.5}
        maxDistance={100}
        minPolarAngle={0}
        maxPolarAngle={Math.PI} // Allow 360-degree rotation
        target={[0, 0, 0]}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        // Don't auto-rotate or interfere with view cube
        autoRotate={false}
      />
      
      <Workplane />
      {onViewChange && (
        <ViewCube onViewChange={onViewChange} currentView={currentView || "FRONT"} />
      )}
    </Canvas>
  );
}

