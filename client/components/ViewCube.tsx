"use client";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface ViewCubeProps {
  onViewChange: (view: string) => void;
  currentView: string;
  orbitControlsRef?: React.RefObject<OrbitControlsImpl | null>;
}

function epsilon(value: number) {
  return Math.abs(value) < 1e-10 ? 0 : value;
}

function getCameraCSSMatrix(matrix: THREE.Matrix4) {
  const { elements } = matrix;
  return `matrix3d(
    ${epsilon(elements[0])},
    ${epsilon(-elements[1])},
    ${epsilon(elements[2])},
    ${epsilon(elements[3])},
    ${epsilon(elements[4])},
    ${epsilon(-elements[5])},
    ${epsilon(elements[6])},
    ${epsilon(elements[7])},
    ${epsilon(elements[8])},
    ${epsilon(-elements[9])},
    ${epsilon(elements[10])},
    ${epsilon(elements[11])},
    ${epsilon(elements[12])},
    ${epsilon(-elements[13])},
    ${epsilon(elements[14])},
    ${epsilon(elements[15])})`;
}

const ORIENTATIONS: Record<
  string,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  TOP: { position: [0, 0, 10], target: [0, 0, 0] },
  BOTTOM: { position: [0, 0, -10], target: [0, 0, 0] },
  BACK: { position: [0, 10, 0], target: [0, 0, 0] },
  FRONT: { position: [0, -10, 0], target: [0, 0, 0] },
  RIGHT: { position: [10, 0, 0], target: [0, 0, 0] },
  LEFT: { position: [-10, 0, 0], target: [0, 0, 0] },
};

export function ViewCube({
  onViewChange,
  currentView,
  orbitControlsRef,
}: ViewCubeProps) {
  const cubeRef = useRef<HTMLDivElement>(null);
  const [hoveredFace, setHoveredFace] = useState<string | null>(null);
  const mat = useRef(new THREE.Matrix4());
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Update cube CSS transform based on camera
  useEffect(() => {
    const updateCube = () => {
      const cameraRef = (window as any).__viewCubeCamera;
      if (cubeRef.current && cameraRef?.current) {
        const camera = cameraRef.current;
        mat.current.extractRotation(camera.matrixWorldInverse);
        cubeRef.current.style.transform = `translateZ(-100px) ${getCameraCSSMatrix(
          mat.current
        )}`;
      }
      animationFrameRef.current = requestAnimationFrame(updateCube);
    };
    animationFrameRef.current = requestAnimationFrame(updateCube);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleFaceClick = (view: string) => {
    onViewChange(view);
    if (orbitControlsRef?.current && ORIENTATIONS[view]) {
      const controls = orbitControlsRef.current;
      const camera = controls.object;

      // Calculate current distance from target
      const currentDistance = camera.position.distanceTo(controls.target);

      // Get the direction vector for the new view
      const { position: targetPosition } = ORIENTATIONS[view];
      const direction = new THREE.Vector3(...targetPosition);
      // Nudge away from exact pole to avoid getting stuck
      const poleNudge = 0.001;
      if (Math.abs(direction.y) > 0.999) {
        direction.y = Math.sign(direction.y) * (0.999 - poleNudge);
      }

      // Handle edge case: if direction is zero vector (shouldn't happen), use default
      if (direction.length() === 0) {
        direction.set(0, 0, 1);
      }

      // Normalize and scale by current distance
      direction.normalize();
      const newPosition = direction.multiplyScalar(currentDistance);

      // Smoothly animate to new position
      const startPos = camera.position.clone();
      const startTarget = controls.target.clone();
      const endTarget = new THREE.Vector3(0, 0, 0);

      let progress = 0;
      const duration = 500; // 500ms animation
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);

        // Ease in-out for smooth transition
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Interpolate position
        camera.position.lerpVectors(startPos, newPosition, eased);

        // Interpolate target
        controls.target.lerpVectors(startTarget, endTarget, eased);

        // Update camera rotation to look at target
        camera.lookAt(controls.target);
        controls.update();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  };

  const getFaceColor = (faceName: string) => {
    if (currentView === faceName) {
      return "#3b82f6"; // Blue for active
    }
    if (hoveredFace === faceName) {
      return "#bfdbfe"; // Light blue for hover
    }
    return "#ffffff"; // White for default
  };

  const faces = ["FRONT", "BACK", "TOP", "BOTTOM", "RIGHT", "LEFT"];

  return (
    <div
      style={{
        position: "absolute",
        top: "80px",
        left: "8%",
        width: "80px",
        height: "80px",
        pointerEvents: "auto",
        zIndex: 1000,
      }}
    >
      <div
        ref={cubeRef}
        className="view-cube"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out", // Smooth visual rotation
        }}
      >
        {faces.map((face) => (
          <div
            key={face}
            className={`cube-face cube-face--${face.toLowerCase()}`}
            onClick={() => handleFaceClick(face)}
            onMouseEnter={() => setHoveredFace(face)}
            onMouseLeave={() => setHoveredFace(null)}
            style={{
              position: "absolute",
              width: "80px",
              height: "80px",
              border: "1px solid #94a3b8",
              backgroundColor: getFaceColor(face),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              color: currentView === face ? "#ffffff" : "#1e293b",
              cursor: "pointer",
              userSelect: "none",
              transform: getFaceTransform(face),
              backfaceVisibility: "hidden",
              transformOrigin: "center center",
              willChange: "transform",
              // Prevent subpixel rendering issues that cause corner shifting
              imageRendering: "crisp-edges",
              WebkitFontSmoothing: "antialiased",
            }}
          >
            {face}
          </div>
        ))}
      </div>
    </div>
  );
}

function getFaceTransform(face: string): string {
  const size = 40; // Half of 80px - exact pixel value to prevent shifting
  switch (face) {
    case "TOP":
      return `translate3d(0, 0, ${size}px)`;
    case "BOTTOM":
      return `translate3d(0, 0, -${size}px) rotateY(180deg)`;
    case "FRONT":
      return `rotateX(90deg) translate3d(0, 0, ${size}px)`;
    case "BACK":
      return `rotateX(-90deg) translate3d(0, 0, ${size}px)`;
    case "RIGHT":
      return `rotateY(90deg) translate3d(0, 0, ${size}px)`;
    case "LEFT":
      return `rotateY(-90deg) translate3d(0, 0, ${size}px)`;
    default:
      return "";
  }
}
