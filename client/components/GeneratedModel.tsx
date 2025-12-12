"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GeneratedModelProps {
  geometry: {
    meshes: Array<{
      component_id: string;
      vertices: number[][];
      faces: number[][];
      label: string;
    }>;
    boundingBox: {
      min: [number, number, number];
      max: [number, number, number];
    };
  };
  showLabels?: boolean;
  animate?: boolean;
}

export function GeneratedModel({
  geometry,
  showLabels = true,
  animate = true,
}: GeneratedModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!groupRef.current) return;

    // Clear existing children
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    // Create meshes from geometry data
    geometry.meshes.forEach((meshData) => {
      // Create geometry from vertices and faces
      const geo = new THREE.BufferGeometry();

      // Set vertices
      const vertices = new Float32Array(meshData.vertices.flat());
      geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

      // Set faces (indices)
      const indices = new Uint16Array(meshData.faces.flat());
      geo.setIndex(new THREE.BufferAttribute(indices, 1));

      // Compute normals for lighting
      geo.computeVertexNormals();

      // Create material
      const material = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        metalness: 0.3,
        roughness: 0.7,
      });

      // Create mesh
      const mesh = new THREE.Mesh(geo, material);
      mesh.name = meshData.label;
      mesh.userData.componentId = meshData.component_id;

      // Add label if enabled
      if (showLabels) {
        // Calculate center position for label
        geo.computeBoundingBox();
        const center = new THREE.Vector3();
        geo.boundingBox?.getCenter(center);

        // Add label above the component
        const labelPosition = center.clone();
        labelPosition.y += 50; // Offset above

        // Note: Text component from drei needs to be added separately
        // For now, we'll add it as a child group
      }

      groupRef.current!.add(mesh);
    });
  }, [geometry, showLabels]);

  // Idle animation: gentle rotate + bob to showcase the model
  useFrame((_, delta) => {
    if (!animate || !groupRef.current) return;
    timeRef.current += delta;
    const g = groupRef.current;
    g.rotation.y += delta * 0.3;
    g.position.y = Math.sin(timeRef.current) * 0.1;
  });

  return <group ref={groupRef} />;
}
