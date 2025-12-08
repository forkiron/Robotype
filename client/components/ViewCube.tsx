"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";

interface ViewCubeProps {
  onViewChange: (view: string) => void;
  currentView: string;
}

export function ViewCube({ onViewChange, currentView }: ViewCubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, raycaster, gl } = useThree();
  const [hoveredFace, setHoveredFace] = useState<string | null>(null);
  const mouseRef = useRef(new THREE.Vector2());

  // Position the cube in screen space (top-left corner)
  useFrame(({ camera, size }) => {
    if (groupRef.current) {
      // Position in normalized device coordinates (top-left)
      const x = -size.width / 2 + 80;
      const y = size.height / 2 - 80;
      const z = 0.5;

      // Convert screen coordinates to world position
      const vector = new THREE.Vector3(
        (x / size.width) * 2 - 1,
        -(y / size.height) * 2 + 1,
        z
      );
      vector.unproject(camera);

      const dir = vector.sub(camera.position).normalize();
      const distance = 3; // Distance from camera
      groupRef.current.position
        .copy(camera.position)
        .add(dir.multiplyScalar(distance));

      // Make it always face the camera
      groupRef.current.lookAt(camera.position);
    }
  });

  const handleClick = (event: any, faceName: string) => {
    event.stopPropagation();
    onViewChange(faceName);
  };

  const handlePointerEnter = (faceName: string) => {
    setHoveredFace(faceName);
  };

  const handlePointerLeave = () => {
    setHoveredFace(null);
  };

  const getFaceColor = (faceName: string) => {
    if (currentView === faceName) {
      return "#3b82f6"; // Blue for active
    }
    if (hoveredFace === faceName) {
      return "#60a5fa"; // Light blue for hover
    }
    return "#e2e8f0"; // Gray for default
  };

  const getTextColor = (faceName: string) => {
    if (currentView === faceName || hoveredFace === faceName) {
      return "#ffffff";
    }
    return "#64748b";
  };

  const faceSize = 1.2;
  const offset = 0.61;

  return (
    <group ref={groupRef}>
      {/* Front face */}
      <mesh
        position={[0, 0, offset]}
        onPointerEnter={() => handlePointerEnter("FRONT")}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => handleClick(e, "FRONT")}
      >
        <planeGeometry args={[faceSize, faceSize]} />
        <meshStandardMaterial
          color={getFaceColor("FRONT")}
          side={THREE.DoubleSide}
        />
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.25}
          color={getTextColor("FRONT")}
          anchorX="center"
          anchorY="middle"
        >
          FRONT
        </Text>
      </mesh>

      {/* Back face */}
      <mesh
        position={[0, 0, -offset]}
        rotation={[0, Math.PI, 0]}
        onPointerEnter={() => handlePointerEnter("BACK")}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => handleClick(e, "BACK")}
      >
        <planeGeometry args={[faceSize, faceSize]} />
        <meshStandardMaterial
          color={getFaceColor("BACK")}
          side={THREE.DoubleSide}
        />
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.25}
          color={getTextColor("BACK")}
          anchorX="center"
          anchorY="middle"
        >
          BACK
        </Text>
      </mesh>

      {/* Top face */}
      <mesh
        position={[0, offset, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerEnter={() => handlePointerEnter("TOP")}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => handleClick(e, "TOP")}
      >
        <planeGeometry args={[faceSize, faceSize]} />
        <meshStandardMaterial
          color={getFaceColor("TOP")}
          side={THREE.DoubleSide}
        />
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.25}
          color={getTextColor("TOP")}
          anchorX="center"
          anchorY="middle"
        >
          TOP
        </Text>
      </mesh>

      {/* Bottom face */}
      <mesh
        position={[0, -offset, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerEnter={() => handlePointerEnter("BOTTOM")}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => handleClick(e, "BOTTOM")}
      >
        <planeGeometry args={[faceSize, faceSize]} />
        <meshStandardMaterial
          color={getFaceColor("BOTTOM")}
          side={THREE.DoubleSide}
        />
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.25}
          color={getTextColor("BOTTOM")}
          anchorX="center"
          anchorY="middle"
        >
          BOTTOM
        </Text>
      </mesh>

      {/* Right face */}
      <mesh
        position={[offset, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        onPointerEnter={() => handlePointerEnter("RIGHT")}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => handleClick(e, "RIGHT")}
      >
        <planeGeometry args={[faceSize, faceSize]} />
        <meshStandardMaterial
          color={getFaceColor("RIGHT")}
          side={THREE.DoubleSide}
        />
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.25}
          color={getTextColor("RIGHT")}
          anchorX="center"
          anchorY="middle"
        >
          RIGHT
        </Text>
      </mesh>

      {/* Left face */}
      <mesh
        position={[-offset, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        onPointerEnter={() => handlePointerEnter("LEFT")}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => handleClick(e, "LEFT")}
      >
        <planeGeometry args={[faceSize, faceSize]} />
        <meshStandardMaterial
          color={getFaceColor("LEFT")}
          side={THREE.DoubleSide}
        />
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.25}
          color={getTextColor("LEFT")}
          anchorX="center"
          anchorY="middle"
        >
          LEFT
        </Text>
      </mesh>

      {/* Cube edges for visual structure */}
      <lineSegments>
        <edgesGeometry
          args={[new THREE.BoxGeometry(faceSize, faceSize, faceSize)]}
        />
        <lineBasicMaterial color="#94a3b8" opacity={0.3} transparent />
      </lineSegments>
    </group>
  );
}
