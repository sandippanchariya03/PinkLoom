import { NextResponse } from "next/server";
import { executeNamingAgent } from "@/lib/agents/naming";
import { selectBrandName } from "@/lib/actions/naming";
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
    const action = body?.action || "generate";

    // Load existing brand state from client payload or repository
    const existingState = clientState || (await getStoredBrandState(projectId));

    // Handle Human-in-the-loop candidate selection
    if (action === "select") {
      const directionId = body?.directionId;
      const candidateName = body?.candidateName || body?.selectedName;
      const tagline = body?.tagline || body?.selectedTagline;

      if (!directionId || !candidateName) {
        return NextResponse.json(
          {
            success: false,
            error: "Both directionId and candidateName are required for selection.",
          },
          { status: 400 }
        );
      }

      const selectResult = await selectBrandName({
        projectId,
        directionId,
        candidateName,
        tagline,
        brandState: existingState,
      });

      if (!selectResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: selectResult.error || "Failed to select brand name.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        brandState: selectResult.updatedBrandState,
      });
    }

    // Generation workflow: enforce strict upstream prerequisites
    if (!existingState || !existingState.discovery || !existingState.discovery.isAnalyzed) {
      return NextResponse.json(
        {
          success: false,
          error: "Discovery stage must be completed before Naming can run. Please complete Stage 01 first.",
        },
        { status: 400 }
      );
    }

    if (!existingState.positioning || !existingState.positioning.isPositioned) {
      return NextResponse.json(
        {
          success: false,
          error: "Positioning stage must be completed before Naming can run. Please complete Stage 02 first.",
        },
        { status: 400 }
      );
    }

    if (!existingState.personality || !existingState.personality.isFormulated) {
      return NextResponse.json(
        {
          success: false,
          error: "Personality stage must be completed before Naming can run. Please complete Stage 03 Personality first.",
        },
        { status: 400 }
      );
    }

    // Execute Naming Agent server-side consuming Discovery, Positioning, and Personality context
    const result = await executeNamingAgent(
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
      namingOutput: result.namingOutput,
      brandState: result.updatedBrandState,
      agentRun: result.agentRun,
      error: result.error,
    });
  } catch (error) {
    console.error("[PinkLoom API] Naming route error:", error);
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
