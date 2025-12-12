/**
 * The Builder Agent
 * Takes validated recipe and generates actual 3D geometry
 * Uses programmatic CAD (code-based) instead of neural networks
 */

import {
  ValidatedRecipe,
  GeometryOutput,
} from "../../shared/types/component-types";
import * as THREE from "three";

export class BuilderAgent {
  /**
   * Build 3D geometry from validated recipe
   * Returns Three.js meshes that can be rendered directly
   */
  async execute(recipe: ValidatedRecipe): Promise<GeometryOutput> {
    const meshes: GeometryOutput["geometry"]["meshes"] = [];
    const allGeometries: THREE.BufferGeometry[] = [];

    // Create a group to hold all components
    const assembly = new THREE.Group();
    assembly.name = recipe.object_type;

    // Build each component
    for (const component of recipe.components) {
      const geometry = this.createGeometry(component);
      const mesh = this.createMesh(geometry, component);

      // Position the mesh
      if (component.relative_position) {
        mesh.position.set(
          component.relative_position.x,
          component.relative_position.y,
          component.relative_position.z
        );
      }

      // Apply rotation
      if (component.rotation) {
        mesh.rotation.set(
          (component.rotation.pitch || 0) * (Math.PI / 180),
          (component.rotation.yaw || 0) * (Math.PI / 180),
          (component.rotation.roll || 0) * (Math.PI / 180)
        );
      }

      // Store component ID and label for later reference
      mesh.userData.componentId = component.id;
      mesh.userData.label = component.label || component.id;
      mesh.userData.type = component.type;

      assembly.add(mesh);
      allGeometries.push(geometry);

      // Extract vertices and faces for output
      const vertices: number[][] = [];
      const faces: number[][] = [];

      if (geometry.attributes.position) {
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          vertices.push([
            positions.getX(i),
            positions.getY(i),
            positions.getZ(i),
          ]);
        }
      }

      if (geometry.index) {
        const indices = geometry.index;
        for (let i = 0; i < indices.count; i += 3) {
          faces.push([
            indices.getX(i),
            indices.getX(i + 1),
            indices.getX(i + 2),
          ]);
        }
      }

      meshes.push({
        component_id: component.id,
        vertices,
        faces,
        label: component.label || component.id,
      });
    }

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(assembly);
    const boundingBox = {
      min: [box.min.x, box.min.y, box.min.z] as [number, number, number],
      max: [box.max.x, box.max.y, box.max.z] as [number, number, number],
    };

    // Export to glTF (would need gltf exporter in production)
    // For now, we return the Three.js group which can be rendered directly

    return {
      recipe,
      geometry: {
        meshes,
        boundingBox,
        // In production, these would be file paths:
        // gltf: await this.exportGLTF(assembly),
        // stl: await this.exportSTL(assembly),
        // step: await this.exportSTEP(assembly),
      },
    };
  }

  private createGeometry(component: any): THREE.BufferGeometry {
    const dims = component.dimensions;

    switch (component.type) {
      case "box":
        return new THREE.BoxGeometry(
          dims.length || 100,
          dims.height || 100,
          dims.width || 100
        );

      case "cylinder":
        return new THREE.CylinderGeometry(
          dims.radius || 50,
          dims.radius || 50,
          dims.height || 100,
          32
        );

      case "sphere":
        return new THREE.SphereGeometry(dims.radius || 50, 32, 32);

      case "cone":
        return new THREE.ConeGeometry(
          dims.radius || 50,
          dims.height || 100,
          32
        );

      case "torus":
        return new THREE.TorusGeometry(
          dims.radius || 50,
          dims.depth || 10,
          16,
          100
        );

      case "plane":
        return new THREE.PlaneGeometry(dims.width || 100, dims.height || 100);

      default:
        // Default to box
        return new THREE.BoxGeometry(100, 100, 100);
    }
  }

  private createMesh(
    geometry: THREE.BufferGeometry,
    component: any
  ): THREE.Mesh {
    // Create material based on component properties
    const material = new THREE.MeshStandardMaterial({
      color: this.getMaterialColor(component.material),
      metalness: component.material === "metal" ? 0.8 : 0.2,
      roughness: component.material === "metal" ? 0.2 : 0.6,
      // Render both sides so large panels/planes are visible from inside/outside
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = component.label || component.id;

    return mesh;
  }

  private getMaterialColor(material?: string): number {
    const colors: Record<string, number> = {
      metal: 0x888888,
      plastic: 0x0ea5e9,
      glass: 0xffffff,
      rubber: 0x1a1a1a,
      wood: 0x8b4513,
    };

    return colors[material || "plastic"] || 0x0ea5e9;
  }

  /**
   * Export assembly to glTF format (for production)
   * This would use GLTFExporter from three/examples/jsm/exporters/GLTFExporter.js
   */
  private async exportGLTF(assembly: THREE.Group): Promise<string> {
    // TODO: Implement glTF export
    // const exporter = new GLTFExporter();
    // const gltf = await exporter.parseAsync(assembly);
    // Save to file system
    return "path/to/exported.gltf";
  }
}

export const builderAgent = new BuilderAgent();
