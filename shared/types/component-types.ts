/**
 * Component-based CAD Design Types
 * These types define the structure for procedural CAD generation
 */

export interface ComponentSpec {
  id: string;
  type: "box" | "cylinder" | "sphere" | "plane" | "cone" | "torus";
  parent?: string; // ID of parent component
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    radius?: number;
    depth?: number;
    [key: string]: number | undefined;
  };
  relative_position?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    pitch?: number;
    yaw?: number;
    roll?: number;
  };
  material?: string;
  label?: string; // Human-readable label
}

export interface DesignRecipe {
  object_type: string;
  root_component: string;
  components: ComponentSpec[];
  metadata?: {
    description?: string;
    scale?: "mm" | "cm" | "m" | "in";
    [key: string]: any;
  };
}

export interface ValidatedRecipe extends DesignRecipe {
  validation: {
    valid: boolean;
    issues: string[];
    warnings: string[];
    corrections: Array<{
      component_id: string;
      field: string;
      old_value: number;
      new_value: number;
      reason: string;
    }>;
  };
}

export interface ComponentAnnotation {
  component_id: string;
  label: string;
  sizing: string;
  note: string;
}

export interface GeometryOutput {
  recipe: ValidatedRecipe;
  geometry: {
    gltf?: string; // Path to glTF file
    stl?: string; // Path to STL file
    step?: string; // Path to STEP file
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
  annotations?: ComponentAnnotation[];
}
