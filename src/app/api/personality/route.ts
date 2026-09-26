import { NextResponse } from "next/server";
import { executePersonalityAgent } from "@/lib/agents/personality";
import {
  persistBrandState,
  persistAgentRun,
  getStoredBrandState,
} from "@/lib/db/repository";
import type { BrandState } from "@/types/brand";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const projectId = body?.projectId || "pinkloom-demo-project";
    const apiKey = body?.apiKey;
    const clientState: BrandState | undefined = body?.brandState;

    // Load existing brand state from client payload or repository
    const existingState = clientState || (await getStoredBrandState(projectId));

    if (!existingState || !existingState.discovery || !existingState.discovery.isAnalyzed) {
      return NextResponse.json(
        {
          success: false,
          error: "Discovery stage must be completed before Personality can run. Please complete Stage 01 first.",
        },
        { status: 400 }
      );
    }

    if (!existingState.positioning || !existingState.positioning.isPositioned) {
      return NextResponse.json(
        {
          success: false,
          error: "Positioning stage must be completed before Personality can run. Please complete Stage 02 first.",
        },
        { status: 400 }
      );
    }

    // Execute Personality Agent server-side consuming Discovery and Positioning context
    const result = await executePersonalityAgent(
      { projectId, apiKey },
      existingState
    );

    // Persist to Supabase / In-Memory Repository
    await persistAgentRun(result.agentRun);

    if (result.success && result.updatedBrandState) {
      await persistBrandState(result.updatedBrandState);
    }

    return NextResponse.json({
      success: result.success,
      personalityOutput: result.personalityOutput,
      brandState: result.updatedBrandState,
      agentRun: result.agentRun,
      error: result.error,
    });
  } catch (error) {
    console.error("[PinkLoom API] Personality route error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected server error occurred.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
