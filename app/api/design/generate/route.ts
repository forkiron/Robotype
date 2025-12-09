import { NextRequest, NextResponse } from "next/server";
import { orchestrator } from "@/server/services/orchestrator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Run the 3-step pipeline: Architect → Constraint Solver → Builder
    const result = await orchestrator.generate(prompt);

    return NextResponse.json({
      success: true,
      data: {
        designId: `design-${Date.now()}`,
        recipe: result.recipe,
        geometry: result.geometry,
        validation: result.recipe.validation,
      },
    });
  } catch (error) {
    console.error("Error in design generation:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
