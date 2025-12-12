/**
 * The Annotation Agent
 * Generates human-readable notes and sizing details for each component.
 * Falls back to deterministic heuristics when no LLM key is configured.
 */

import {
  ComponentAnnotation,
  ValidatedRecipe,
} from "../../shared/types/component-types";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AnnotationAgentConfig {
  model?: "gemini-2.0-flash";
  apiKey?: string;
}

export class AnnotationAgent {
  private config: AnnotationAgentConfig;
  private genAI: GoogleGenerativeAI | null = null;

  constructor(config: AnnotationAgentConfig = {}) {
    this.config = {
      model: config.model || "gemini-2.0-flash",
      apiKey:
        config.apiKey ||
        process.env.GOOGLE_API_KEY ||
        process.env.GEMINI_API_KEY,
    };

    if (this.config.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    }
  }

  /**
   * Produce annotations for a validated recipe.
   * Uses LLM when available, otherwise deterministic heuristics.
   */
  async execute(recipe: ValidatedRecipe): Promise<ComponentAnnotation[]> {
    const prompt = this.buildPrompt(recipe);

    if (this.genAI) {
      try {
        const annotations = await this.callLLM(prompt);
        if (annotations.length > 0) {
          return annotations;
        }
      } catch (error) {
        console.warn("Annotation LLM failed, using heuristics:", error);
      }
    }

    return this.generateHeuristicAnnotations(recipe);
  }

  private buildPrompt(recipe: ValidatedRecipe): string {
    const componentList = recipe.components
      .map(
        (c) =>
          `- ${c.id} (${c.type}) dims=${JSON.stringify(
            c.dimensions
          )} rel_pos=${JSON.stringify(
            c.relative_position || { x: 0, y: 0, z: 0 }
          )}`
      )
      .join("\n");

    return `You are a senior mechanical engineer creating concise CAD annotations.
For each component, return a JSON array with:
- component_id: id from the design
- label: short human-readable label
- sizing: one sentence describing the key dimensions in mm
- note: one sentence describing placement, parent, or purpose

Design object: ${recipe.object_type}
Components:
${componentList}

Output ONLY JSON in this form:
[
  {
    "component_id": "base",
    "label": "Base Plate",
    "sizing": "200 x 150 x 10 mm box",
    "note": "Root component; located at origin."
  }
]`;
  }

  private async callLLM(prompt: string): Promise<ComponentAnnotation[]> {
    const model = this.genAI!.getGenerativeModel({
      model: this.config.model || "gemini-2.0-flash",
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return this.parseResponse(text);
  }

  private parseResponse(text: string | undefined): ComponentAnnotation[] {
    if (!text) return [];
    try {
      const cleaned = text
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (item) =>
            item &&
            typeof item.component_id === "string" &&
            typeof item.label === "string"
        )
        .map((item) => ({
          component_id: item.component_id,
          label: item.label,
          sizing: item.sizing || "",
          note: item.note || "",
        }));
    } catch (error) {
      console.warn("Failed to parse annotation response:", error);
      return [];
    }
  }

  private generateHeuristicAnnotations(
    recipe: ValidatedRecipe
  ): ComponentAnnotation[] {
    return recipe.components.map((component) => {
      const dimensionParts = Object.entries(component.dimensions)
        .filter(([_, value]) => typeof value === "number")
        .map(([key, value]) => `${key}:${value}mm`);
      const sizing =
        dimensionParts.length > 0
          ? `${component.type} (${dimensionParts.join(", ")})`
          : `${component.type} (dimensions unspecified)`;

      const position = component.relative_position
        ? `@ (${component.relative_position.x}, ${component.relative_position.y}, ${component.relative_position.z})`
        : "@ (0,0,0)";
      const parent = component.parent
        ? `Child of ${component.parent}`
        : "Root component";

      return {
        component_id: component.id,
        label: component.label || component.id,
        sizing,
        note: `${parent} ${position}`.trim(),
      };
    });
  }
}

export const annotationAgent = new AnnotationAgent();
