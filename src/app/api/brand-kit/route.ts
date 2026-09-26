import { NextResponse } from "next/server";
import {
  assembleFinalBrandKit,
  validateBrandKitCompleteness,
} from "@/lib/brand-kit/final-brand-kit";
import {
  persistBrandState,
  persistAgentRun,
  getStoredBrandState,
} from "@/lib/db/repository";
import type { BrandState } from "@/types/brand";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body?.projectId || "pinkloom-demo-project";
    const clientState: BrandState | undefined = body?.brandState;

    // Load existing brand state from client payload or repository
    const existingState = clientState || (await getStoredBrandState(projectId));

    if (!existingState) {
      return NextResponse.json(
        {
          success: false,
          error: "No BrandState found. Please initialize a brand project first.",
          missingPrerequisites: ["BrandState is required"],
        },
        { status: 400 }
      );
    }

    // Completeness Validation Gate
    const validation = validateBrandKitCompleteness(existingState);
    if (!validation.isComplete) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "Missing upstream stage prerequisites for Final Brand Kit.",
          missingPrerequisites: validation.missingPrerequisites,
          completeness: validation.completeness,
        },
        { status: 400 }
      );
    }

    // Assemble Final Brand Kit deterministically
    const result = await assembleFinalBrandKit(existingState, {
      projectId,
      persist: true,
    });

    if (!result.success || !result.finalBrandKit || !result.updatedBrandState) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to assemble Final Brand Kit.",
          missingPrerequisites: result.missingPrerequisites,
          completeness: result.completeness,
          agentRun: result.agentRun,
        },
        { status: 400 }
      );
    }

    // Persist to repository
    if (result.agentRun) {
      await persistAgentRun(result.agentRun);
    }
    await persistBrandState(result.updatedBrandState);

    return NextResponse.json({
      success: true,
      finalBrandKit: result.finalBrandKit,
      brandState: result.updatedBrandState,
      agentRun: result.agentRun,
      completeness: result.completeness,
    });
  } catch (error) {
    console.error("[PinkLoom API] Brand Kit route error:", error);
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
