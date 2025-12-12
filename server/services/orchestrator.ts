/**
 * Master Orchestrator
 * Coordinates the 3-step pipeline: Architect → Constraint Solver → Builder
 */

import { architectAgent } from "../agents/architect-agent";
import { constraintSolver } from "../agents/constraint-solver";
import { builderAgent } from "../agents/builder-agent";
import { annotationAgent } from "../agents/annotation-agent";
import { GeometryOutput } from "../../shared/types/component-types";

export class DesignOrchestrator {
  /**
   * Main pipeline: Text → Spec → Mesh
   */
  async generate(prompt: string): Promise<GeometryOutput> {
    console.log(
      "🎨 Step 1: Architect Agent - Decomposing prompt into recipe..."
    );

    // Step 1: The Architect - Decompose prompt into JSON recipe
    const recipe = await architectAgent.execute(prompt);
    console.log(`✅ Recipe created: ${recipe.components.length} components`);

    console.log(
      "🔧 Step 2: Constraint Solver - Validating and correcting dimensions..."
    );

    // Step 2: The Mathematician - Validate and correct dimensions
    const validatedRecipe = constraintSolver.validate(recipe);

    if (!validatedRecipe.validation.valid) {
      console.warn("⚠️ Validation issues:", validatedRecipe.validation.issues);
    }

    if (validatedRecipe.validation.corrections.length > 0) {
      console.log(
        `✅ Applied ${validatedRecipe.validation.corrections.length} corrections`
      );
    }

    console.log("📝 Step 3: Annotation Agent - Generating notes and sizing...");

    const annotations = await annotationAgent.execute(validatedRecipe);

    console.log(`✅ Annotations created: ${annotations.length} entries`);

    console.log("🏗️ Step 4: Builder Agent - Generating 3D geometry...");

    // Step 3: The Builder - Generate actual 3D geometry
    const output = await builderAgent.execute(validatedRecipe);
    console.log(
      `✅ Geometry generated: ${output.geometry.meshes.length} meshes`
    );

    return {
      ...output,
      annotations,
    };
  }

  /**
   * Update existing design (e.g., "make wheels bigger")
   */
  async update(recipe: any, updatePrompt: string): Promise<GeometryOutput> {
    // Parse update request and modify recipe
    // Then re-run constraint solver and builder
    // This is where the "agentic" part shines - updating JSON, not redrawing

    // TODO: Implement update logic
    // For now, just regenerate
    return this.generate(updatePrompt);
  }
}

export const orchestrator = new DesignOrchestrator();
