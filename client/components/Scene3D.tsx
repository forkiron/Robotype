"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Workplane } from "./Workplane";
import { ViewCube } from "./ViewCube";
import { GeneratedModel } from "./GeneratedModel";
import { useEffect, useRef, RefObject } from "react";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

function CameraController({
  cameraRef,
}: {
  cameraRef: RefObject<THREE.Camera>;
}) {
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
  generatedGeometry?: any;
  zoomRef?: React.RefObject<number>;
  animateModel?: boolean;
}

export function Scene3D({
  controlsRef,
  cameraRef,
  onViewChange,
  currentView,
  generatedGeometry,
  zoomRef,
  animateModel = true,
}: Scene3DProps) {
  const orbitControlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef) {
      controlsRef.current = orbitControlsRef.current;
    }
  }, [controlsRef]);

  return (
    <>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
        style={{ background: "#f8fafc" }}
        onCreated={({ camera }) => {
          camera.position.set(8, 8, 8); // Isometric view between top and front
        }}
      >
        <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
        {cameraRef && (
          <CameraController cameraRef={cameraRef as RefObject<THREE.Camera>} />
        )}

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
          // Avoid exact poles to prevent lock when at top/bottom
          minPolarAngle={0.05}
          maxPolarAngle={Math.PI - 0.05}
          minAzimuthAngle={-Infinity} // Allow full horizontal rotation
          maxAzimuthAngle={Infinity} // Allow full horizontal rotation
          target={[0, 0, 0]}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          // Don't auto-rotate or interfere with view cube
          autoRotate={false}
          // Enable damping for smoother rotation and to help with gimbal lock
          enableDamping={true}
          dampingFactor={0.05}
          // Allow screen space panning to help escape edge cases
          screenSpacePanning={true}
        />

        <Workplane />
        {generatedGeometry && (
          <GeneratedModel
            geometry={generatedGeometry}
            showLabels={true}
            animate={animateModel}
          />
        )}
        {/* View cube camera sync component */}
        {onViewChange && <ViewCubeSync />}
        {/* Zoom controller for continuous zoom via ref */}
        {zoomRef && (
          <ZoomController
            zoomRef={zoomRef}
            orbitControlsRef={orbitControlsRef}
          />
        )}
        {/* Update OrbitControls every frame for smooth damping */}
        <OrbitControlsUpdater orbitControlsRef={orbitControlsRef} />
      </Canvas>
      {/* View cube as HTML overlay - positioned outside Canvas */}
      {onViewChange && (
        <ViewCube
          onViewChange={onViewChange}
          currentView={currentView || "FRONT"}
          orbitControlsRef={orbitControlsRef}
        />
      )}
    </>
  );
}

// Component inside Canvas to sync camera with view cube
function ViewCubeSync() {
  const { camera } = useThree();
  const cameraRef = useRef<THREE.Camera>(camera);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  // Store camera ref globally for ViewCube to access
  useEffect(() => {
    (window as any).__viewCubeCamera = cameraRef;
    return () => {
      delete (window as any).__viewCubeCamera;
    };
  }, []);

  return null;
}

// Component to update OrbitControls every frame for smooth damping
function OrbitControlsUpdater({
  orbitControlsRef,
}: {
  orbitControlsRef: React.RefObject<any>;
}) {
  useFrame(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.update();
    }
  });
  return null;
}

// Continuous zoom controller (uses a ref set by UI buttons)
function ZoomController({
  zoomRef,
  orbitControlsRef,
}: {
  zoomRef: React.RefObject<number>;
  orbitControlsRef: React.RefObject<any>;
}) {
  useFrame((state, delta) => {
    const controls = orbitControlsRef.current;
    if (!controls || !zoomRef?.current) return;

    const direction = zoomRef.current; // 1 in, -1 out, 0 stop
    if (direction === 0) return;

    const speed = 50; // units per second
    const moveDistance = direction * speed * delta;

    // Move camera along its local Z
    state.camera.translateZ(-moveDistance);

    // Clamp optional (disabled)
    // state.camera.position.z = Math.min(Math.max(state.camera.position.z, 0.1), 500);

    // Update OrbitControls after moving camera
    controls.update();
  });

  return null;
}
