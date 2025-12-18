"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Float,
  ContactShadows,
} from "@react-three/drei";
import { RobotArm } from "./RobotArm";

export const BlueprintScene = () => {
  return (
    <div className="w-full h-[600px] relative">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 4, 7]} fov={35} />

        {/* LIGHTING */}
        <ambientLight intensity={0.5} color="#e0f2fe" />
        <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#0284c7"
        />
        <Environment preset="city" />

        {/* CONTROLS & FLOATING */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <RobotArm position={[0, -2, 0]} />
        </Float>

        {/* SHADOWS keep soon as it is for the robot arm fix */}
        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
          color="#005a9c"
        />
      </Canvas>

      {/* Overlay: "Blueprint" Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>
    </div>
  );
};
