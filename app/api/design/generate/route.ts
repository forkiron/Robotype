import { NextRequest, NextResponse } from "next/server";

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

    // TODO: Integrate with AI service for CAD generation
    // This will call the server/services/ai-service.ts
    
    // For now, return a mock response
    return NextResponse.json({
      success: true,
      data: {
        designId: `design-${Date.now()}`,
        message: "Design generation started",
        prompt,
      },
    });
  } catch (error) {
    console.error("Error in design generation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

