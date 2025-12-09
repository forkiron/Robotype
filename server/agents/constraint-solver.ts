/**
 * The Mathematician (Constraint Solver)
 * Validates and corrects dimensions to ensure components fit together
 * Prevents hallucinations like wheels larger than the car
 */

import {
  DesignRecipe,
  ValidatedRecipe,
} from "../../shared/types/component-types";

export class ConstraintSolver {
  /**
   * Validate and correct the recipe
   */
  validate(recipe: DesignRecipe): ValidatedRecipe {
    const issues: string[] = [];
    const warnings: string[] = [];
    const corrections: ValidatedRecipe["validation"]["corrections"] = [];

    // Get root component
    const rootComponent = recipe.components.find(
      (c) => c.id === recipe.root_component
    );
    if (!rootComponent) {
      issues.push(`Root component "${recipe.root_component}" not found`);
      return this.createInvalidRecipe(recipe, issues, warnings, corrections);
    }

    // Validate each component
    for (const component of recipe.components) {
      // Check if component has valid dimensions for its type
      const dimensionIssues = this.validateDimensions(component);
      issues.push(...dimensionIssues);

      // Check parent-child relationships
      if (component.parent) {
        const parent = recipe.components.find((c) => c.id === component.parent);
        if (!parent) {
          issues.push(
            `Component "${component.id}" references non-existent parent "${component.parent}"`
          );
          continue;
        }

        // Check if component fits within parent bounds
        const fitIssues = this.checkFitWithinParent(component, parent, recipe);
        if (fitIssues.length > 0) {
          // Auto-correct if possible
          const corrected = this.autoCorrectFit(component, parent, fitIssues);
          if (corrected) {
            corrections.push(...corrected);
          } else {
            warnings.push(...fitIssues);
          }
        }
      }

      // Special constraint checks
      if (component.type === "cylinder" && component.dimensions.radius) {
        // Wheels should touch ground (z = 0 or negative)
        if (component.label?.toLowerCase().includes("wheel")) {
          const wheelBottom =
            (component.relative_position?.z || 0) -
            (component.dimensions.radius || 0);
          if (wheelBottom > 0) {
            const newZ = (component.dimensions.radius || 0) - 10; // 10mm below ground for clearance
            corrections.push({
              component_id: component.id,
              field: "relative_position.z",
              old_value: component.relative_position?.z || 0,
              new_value: newZ,
              reason: "Wheel must touch or be below ground level",
            });
            component.relative_position = component.relative_position || {
              x: 0,
              y: 0,
              z: 0,
            };
            component.relative_position.z = newZ;
          }
        }
      }
    }

    // Apply corrections
    for (const correction of corrections) {
      const component = recipe.components.find(
        (c) => c.id === correction.component_id
      );
      if (component) {
        const [object, field] = correction.field.split(".");
        if (object === "dimensions" && component.dimensions) {
          (component.dimensions as any)[field] = correction.new_value;
        } else if (
          object === "relative_position" &&
          component.relative_position
        ) {
          (component.relative_position as any)[field] = correction.new_value;
        }
      }
    }

    const valid = issues.length === 0;

    return {
      ...recipe,
      validation: {
        valid,
        issues,
        warnings,
        corrections,
      },
    };
  }

  private validateDimensions(component: any): string[] {
    const issues: string[] = [];

    switch (component.type) {
      case "box":
        if (
          !component.dimensions.length ||
          !component.dimensions.width ||
          !component.dimensions.height
        ) {
          issues.push(
            `Box component "${component.id}" missing required dimensions (length, width, height)`
          );
        }
        break;
      case "cylinder":
        if (!component.dimensions.radius || !component.dimensions.height) {
          issues.push(
            `Cylinder component "${component.id}" missing required dimensions (radius, height)`
          );
        }
        break;
      case "sphere":
        if (!component.dimensions.radius) {
          issues.push(
            `Sphere component "${component.id}" missing required dimension (radius)`
          );
        }
        break;
    }

    // Check for negative dimensions
    for (const [key, value] of Object.entries(component.dimensions || {})) {
      if (typeof value === "number" && value <= 0) {
        issues.push(
          `Component "${component.id}" has invalid ${key}: ${value} (must be positive)`
        );
      }
    }

    return issues;
  }

  private checkFitWithinParent(
    component: any,
    parent: any,
    recipe: DesignRecipe
  ): string[] {
    const warnings: string[] = [];

    // Get absolute position of component
    const componentPos = this.getAbsolutePosition(component, recipe);
    const parentPos = this.getAbsolutePosition(parent, recipe);

    // Simple bounds checking (can be more sophisticated)
    if (component.type === "cylinder" && component.dimensions.radius) {
      const radius = component.dimensions.radius;
      const componentSize = radius * 2;

      if (parent.type === "box" && parent.dimensions.width) {
        if (componentSize > parent.dimensions.width * 0.8) {
          warnings.push(
            `Component "${component.id}" (radius: ${radius}mm) may be too large for parent "${parent.id}" (width: ${parent.dimensions.width}mm)`
          );
        }
      }
    }

    return warnings;
  }

  private autoCorrectFit(
    component: any,
    parent: any,
    issues: string[]
  ): Array<{
    component_id: string;
    field: string;
    old_value: number;
    new_value: number;
    reason: string;
  }> | null {
    const corrections: Array<{
      component_id: string;
      field: string;
      old_value: number;
      new_value: number;
      reason: string;
    }> = [];

    // Auto-correct wheel positions to touch ground
    if (
      component.label?.toLowerCase().includes("wheel") &&
      component.type === "cylinder"
    ) {
      const radius = component.dimensions.radius || 0;
      const currentZ = component.relative_position?.z || 0;
      const wheelBottom = currentZ - radius;

      if (wheelBottom > -10) {
        // Wheel should be at least 10mm below ground for clearance
        const newZ = radius - 10;
        corrections.push({
          component_id: component.id,
          field: "relative_position.z",
          old_value: currentZ,
          new_value: newZ,
          reason: "Auto-corrected wheel position to touch ground",
        });
      }
    }

    return corrections.length > 0 ? corrections : null;
  }

  private getAbsolutePosition(
    component: any,
    recipe: DesignRecipe
  ): { x: number; y: number; z: number } {
    let pos = component.relative_position || { x: 0, y: 0, z: 0 };

    // Traverse up parent chain
    let current = component;
    while (current.parent) {
      const parent = recipe.components.find((c) => c.id === current.parent);
      if (parent && parent.relative_position) {
        pos = {
          x: pos.x + parent.relative_position.x,
          y: pos.y + parent.relative_position.y,
          z: pos.z + parent.relative_position.z,
        };
        current = parent;
      } else {
        break;
      }
    }

    return pos;
  }

  private createInvalidRecipe(
    recipe: DesignRecipe,
    issues: string[],
    warnings: string[],
    corrections: any[]
  ): ValidatedRecipe {
    return {
      ...recipe,
      validation: {
        valid: false,
        issues,
        warnings,
        corrections,
      },
    };
  }
}

export const constraintSolver = new ConstraintSolver();
