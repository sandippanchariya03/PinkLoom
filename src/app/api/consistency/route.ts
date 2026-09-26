import { NextResponse } from "next/server";
import { executeConsistencyAgent } from "@/lib/agents/consistency";
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

    // Enforce strict upstream prerequisites
    if (!existingState || !existingState.discovery || !existingState.discovery.isAnalyzed) {
      return NextResponse.json(
        {
          success: false,
          error: "Discovery stage must be completed before Consistency can run. Please complete Stage 01 first.",
        },
        { status: 400 }
      );
    }

    if (!existingState.positioning || !existingState.positioning.isPositioned) {
      return NextResponse.json(
        {
          success: false,
          error: "Positioning stage must be completed before Consistency can run. Please complete Stage 02 first.",
        },
        { status: 400 }
      );
    }

    if (!existingState.personality || !existingState.personality.isFormulated) {
      return NextResponse.json(
        {
          success: false,
          error: "Personality stage must be completed before Consistency can run. Please complete Stage 03 Personality first.",
        },
        { status: 400 }
      );
    }

    if (!existingState.naming || !existingState.naming.isSelected || !existingState.naming.selectedName) {
      return NextResponse.json(
        {
          success: false,
          error: "Naming stage must be completed and an authoritative brand name selected before Consistency can run. Please select a brand name in Stage 04 (Naming) first.",
        },
        { status: 400 }
      );
    }

    if (!existingState.voice || !existingState.voice.isGenerated) {
      return NextResponse.json(
        {
          success: false,
          error: "Voice stage must be completed before Consistency can run. Please generate Voice guidelines in Stage 05 (Voice) first.",
        },
        { status: 400 }
      );
    }

    if (
      !existingState.visualDirection ||
      !existingState.visualDirection.isGenerated ||
      existingState.visualDirection.colorSystem.primary.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Visual Direction stage must be completed before Consistency can run. Please generate Visual Direction in Stage 06 first.",
        },
        { status: 400 }
      );
    }

    // Execute Consistency Agent server-side consuming all layers
    const result = await executeConsistencyAgent(
      { projectId, apiKey },
      existingState
    );

    // Persist to Repository / In-Memory
    if (result.agentRun) {
      await persistAgentRun(result.agentRun);
    }

    if (result.success && result.updatedBrandState) {
      await persistBrandState(result.updatedBrandState);
    }

    return NextResponse.json({
      success: result.success,
      consistencyOutput: result.consistencyOutput,
      brandState: result.updatedBrandState,
      agentRun: result.agentRun,
      error: result.error,
    });
  } catch (error) {
    console.error("[PinkLoom API] Consistency route error:", error);
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
