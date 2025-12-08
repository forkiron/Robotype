"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";

export const RobotArm = (props: any) => {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  // Animation: Gentle "breathing" movement
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 4) * 0.2; // Base rotation
    if (group.current.children[1]) {
      (group.current.children[1] as THREE.Group).rotation.x =
        Math.sin(t / 2) * 0.1 - 0.2; // Shoulder
      if ((group.current.children[1] as THREE.Group).children[0]) {
        (
          (group.current.children[1] as THREE.Group)
            .children[0] as THREE.Group
        ).rotation.x = Math.sin(t / 1.5) * 0.1 + 0.5; // Elbow
      }
    }
  });

  // Material: High-tech glossy blue plastic/metal
  const material = new THREE.MeshStandardMaterial({
    color: "#0ea5e9", // Sky-500
    roughness: 0.2,
    metalness: 0.8,
    emissive: "#000000",
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.1,
    metalness: 0.5,
  });

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* BASE */}
      <mesh material={material} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1, 1.5, 1, 32]} />
      </mesh>

      {/* ROTATING TURRET (Joint 1) */}
      <group position={[0, 1, 0]}>
        <mesh material={accentMaterial} position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 1, 32]} />
        </mesh>

        {/* LOWER ARM (Joint 2) */}
        <group position={[0, 0.5, 0]} rotation={[-0.2, 0, 0]}>
          <mesh material={material} position={[0, 1.5, 0]}>
            <boxGeometry args={[0.6, 3, 0.6]} />
          </mesh>
          <mesh
            material={accentMaterial}
            position={[0, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.5, 0.5, 1.2, 32]} />
          </mesh>
          {/* UPPER ARM (Joint 3) */}
          <group position={[0, 2.8, 0]} rotation={[0.5, 0, 0]}>
            <mesh
              material={accentMaterial}
              position={[0, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.4, 0.4, 1.2, 32]} />
            </mesh>
            <mesh material={material} position={[0, 1.2, 0]}>
              <boxGeometry args={[0.5, 2.5, 0.5]} />
            </mesh>

            {/* WRIST & CLAW */}
            <group position={[0, 2.4, 0]} rotation={[-0.3, 0, 0]}>
              <mesh material={accentMaterial}>
                <sphereGeometry args={[0.4]} />
              </mesh>
              {/* Claws */}
              <mesh
                material={material}
                position={[0.2, 0.5, 0]}
                rotation={[0, 0, -0.2]}
              >
                <boxGeometry args={[0.1, 0.8, 0.3]} />
              </mesh>
              <mesh
                material={material}
                position={[-0.2, 0.5, 0]}
                rotation={[0, 0, 0.2]}
              >
                <boxGeometry args={[0.1, 0.8, 0.3]} />
              </mesh>
              {/* CAD ANNOTATION: End Effector */}
              <Html position={[0.8, 1, 0]} distanceFactor={6}>
                <div className="bg-slate-900/80 backdrop-blur border border-blue-500/50 p-2 rounded text-[10px] text-blue-200 font-mono w-24">
                  <div className="flex justify-between border-b border-blue-500/30 mb-1 pb-1">
                    <span>EE_POS</span>
                    <span className="text-blue-400">ACTIVE</span>
                  </div>
                  <div>X: 124.5mm</div>
                  <div>Y: 890.2mm</div>
                  <div>Z: 45.0mm</div>
                </div>
                {/* Line connecting to mesh */}
                <div className="absolute top-1/2 -left-4 w-4 h-px bg-blue-500/50"></div>
              </Html>
            </group>
          </group>
        </group>
      </group>
      {/* CAD ANNOTATION: Base */}
      <Html position={[-1.5, 1, 0]} distanceFactor={8}>
        <div className="bg-white/90 backdrop-blur border border-slate-200 p-2 rounded text-[10px] text-slate-600 font-mono shadow-xl">
          <span className="font-bold text-blue-600 block">J1_ROTATION</span>
          <span>VEL: 0.5 rad/s</span>
        </div>
        <div className="absolute top-1/2 -right-4 w-4 h-px bg-slate-300"></div>
      </Html>
    </group>
  );
};

