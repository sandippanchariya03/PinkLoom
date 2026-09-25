import { NextResponse } from "next/server";
import { executeDiscoveryAgent } from "@/lib/agents/discovery";
import {
  persistProject,
  persistBrandState,
  persistAgentRun,
  getStoredBrandState,
} from "@/lib/db/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawIdea = body?.rawIdea;
    const projectId = body?.projectId || "pinkloom-demo-project";
    const apiKey = body?.apiKey;

    if (!rawIdea || typeof rawIdea !== "string" || rawIdea.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a substantive raw idea of at least 5 characters.",
        },
        { status: 400 }
      );
    }

    // Retrieve existing brand state if available
    const existingState = await getStoredBrandState(projectId);

    // Execute the Discovery Agent server-side
    const result = await executeDiscoveryAgent(
      { rawIdea, projectId, apiKey },
      existingState || undefined
    );

    // Persist to Supabase / Repository
    await persistProject(projectId, rawIdea);
    await persistAgentRun(result.agentRun);

    if (result.success && result.updatedBrandState) {
      await persistBrandState(result.updatedBrandState);
    }

    return NextResponse.json({
      success: result.success,
      discoveryOutput: result.discoveryOutput,
      brandState: result.updatedBrandState,
      agentRun: result.agentRun,
      error: result.error,
    });
  } catch (error) {
    console.error("[PinkLoom API] Discovery route error:", error);
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
