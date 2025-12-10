/**
 * The Architect Agent
 * Takes natural language prompt and outputs structured JSON recipe
 * This is the "decomposition" step - breaking down "car" into components
 */

import { DesignRecipe } from "../../shared/types/component-types";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ArchitectAgentConfig {
  model: "gemini-2.0-flash";
  apiKey?: string;
}

export class ArchitectAgent {
  private config: ArchitectAgentConfig;
  private genAI: GoogleGenerativeAI | null = null;

  constructor(config: ArchitectAgentConfig = {}) {
    this.config = {
      model: config.model || "gemini-2.0-flash", // Use gemini-2.0-flash (cheapest and fastest)
      apiKey:
        config.apiKey ||
        process.env.GOOGLE_API_KEY ||
        process.env.GEMINI_API_KEY,
    };

    // Initialize Google AI SDK
    if (this.config.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    }
  }

  /**
   * Main execution: Convert prompt to structured recipe
   */
  async execute(prompt: string): Promise<DesignRecipe> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.getUserPrompt(prompt);

    // Call LLM with structured output
    const response = await this.callLLM(systemPrompt, userPrompt);

    // Parse and validate JSON structure
    const recipe = this.parseResponse(response);

    return recipe;
  }

  private getSystemPrompt(): string {
    return `You are an expert mechanical engineer and CAD designer. Your job is to decompose a user's request into a structured component-based design recipe.

You must output ONLY valid JSON in this exact format:
{
  "object_type": "string describing the object",
  "root_component": "id of the main/base component",
  "components": [
    {
      "id": "unique_component_id",
      "type": "box" | "cylinder" | "sphere" | "plane" | "cone" | "torus",
      "parent": "parent_component_id (optional, for hierarchy)",
      "dimensions": {
        "length": number (for boxes),
        "width": number (for boxes),
        "height": number (for boxes/cylinders),
        "radius": number (for cylinders/spheres),
        "depth": number (for planes)
      },
      "relative_position": {
        "x": number,
        "y": number,
        "z": number
      },
      "rotation": {
        "pitch": number (degrees, optional),
        "yaw": number (degrees, optional),
        "roll": number (degrees, optional)
      },
      "material": "string (optional)",
      "label": "human readable name"
    }
  ],
  "metadata": {
    "description": "brief description",
    "scale": "mm" | "cm" | "m" | "in"
  }
}

CRITICAL RULES:
1. Every component MUST have a unique "id"
2. Dimensions should be in millimeters (mm) by default
3. Use relative_position to position components relative to their parent
4. The root_component should be the main structural element
5. Label each component clearly (e.g., "wheel_front_left", "chassis_main")
6. Think hierarchically: chassis → wheels, body → windows, etc.
7. Output ONLY the JSON, no markdown, no explanations`;
  }

  private getUserPrompt(prompt: string): string {
    return `Decompose this request into a component-based CAD design recipe:

"${prompt}"

Output the JSON recipe now:`;
  }

  private async callLLM(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    // Use Google Generative AI SDK
    if (!this.config.apiKey || !this.genAI) {
      console.warn("Google API key not configured, using mock response");
      return this.getMockResponse(userPrompt);
    }

    try {
      // Get the model (using gemini-2.0-flash - cheapest and fastest, matching working example)
      const modelName = this.config.model || "gemini-2.0-flash";
      const model = this.genAI.getGenerativeModel({
        model: modelName,
      });

      // Combine system and user prompts into one string (matching working example pattern)
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      // Generate content (same pattern as working example)
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("No response from Gemini API");
      }

      return text;
    } catch (error) {
      console.error("Gemini API call failed:", error);
      // Fallback to mock response for testing
      return this.getMockResponse(userPrompt);
    }
  }

  private parseResponse(response: string): DesignRecipe {
    try {
      // Remove markdown code blocks if present
      const cleaned = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const recipe = JSON.parse(cleaned) as DesignRecipe;

      // Validate structure
      if (!recipe.object_type || !recipe.root_component || !recipe.components) {
        throw new Error("Invalid recipe structure");
      }

      return recipe;
    } catch (error) {
      console.error("Failed to parse LLM response:", error);
      throw new Error("Failed to parse design recipe from LLM");
    }
  }

  private getMockResponse(prompt: string): string {
    // Mock response for testing without API key
    if (prompt.toLowerCase().includes("car")) {
      return JSON.stringify({
        object_type: "car",
        root_component: "chassis_main",
        components: [
          {
            id: "chassis_main",
            type: "box",
            dimensions: { length: 4500, width: 2000, height: 1200 },
            relative_position: { x: 0, y: 0, z: 0 },
            material: "metal",
            label: "Chassis",
          },
          {
            id: "wheel_front_left",
            type: "cylinder",
            parent: "chassis_main",
            dimensions: { radius: 400, height: 300 },
            relative_position: { x: 1500, y: 1100, z: -500 },
            label: "Front Left Wheel",
          },
          {
            id: "wheel_front_right",
            type: "cylinder",
            parent: "chassis_main",
            dimensions: { radius: 400, height: 300 },
            relative_position: { x: 1500, y: -1100, z: -500 },
            label: "Front Right Wheel",
          },
          {
            id: "wheel_rear_left",
            type: "cylinder",
            parent: "chassis_main",
            dimensions: { radius: 400, height: 300 },
            relative_position: { x: -1500, y: 1100, z: -500 },
            label: "Rear Left Wheel",
          },
          {
            id: "wheel_rear_right",
            type: "cylinder",
            parent: "chassis_main",
            dimensions: { radius: 400, height: 300 },
            relative_position: { x: -1500, y: -1100, z: -500 },
            label: "Rear Right Wheel",
          },
        ],
        metadata: {
          description: "A basic car with chassis and four wheels",
          scale: "mm",
        },
      });
    }

    // Generic mock
    return JSON.stringify({
      object_type: "object",
      root_component: "base",
      components: [
        {
          id: "base",
          type: "box",
          dimensions: { length: 100, width: 100, height: 100 },
          relative_position: { x: 0, y: 0, z: 0 },
          label: "Base",
        },
      ],
      metadata: { scale: "mm" },
    });
  }
}

export const architectAgent = new ArchitectAgent();
