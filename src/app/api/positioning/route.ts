import { NextResponse } from "next/server";
import { executePositioningAgent } from "@/lib/agents/positioning";
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

    // Load existing brand state from repository or client payload
    const existingState = clientState || (await getStoredBrandState(projectId));

    if (!existingState || !existingState.discovery || !existingState.discovery.isAnalyzed) {
      return NextResponse.json(
        {
          success: false,
          error: "Discovery stage must be completed before Positioning can run. Please complete Stage 01 first.",
        },
        { status: 400 }
      );
    }

    // Execute Positioning Agent server-side consuming Discovery context
    const result = await executePositioningAgent(
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
      positioningOutput: result.positioningOutput,
      brandState: result.updatedBrandState,
      agentRun: result.agentRun,
      error: result.error,
    });
  } catch (error) {
    console.error("[PinkLoom API] Positioning route error:", error);
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
