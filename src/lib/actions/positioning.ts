"use server";

import { executePositioningAgent } from "@/lib/agents/positioning";
import {
  persistBrandState,
  persistAgentRun,
  getStoredBrandState,
} from "@/lib/db/repository";
import type { PositioningExecutionResult } from "@/lib/agents/positioning";
import type { BrandState } from "@/types/brand";

export async function runPositioningAction(
  projectId = "pinkloom-demo-project",
  apiKey?: string,
  clientState?: BrandState
): Promise<PositioningExecutionResult> {
  const existingState = clientState || (await getStoredBrandState(projectId));

  if (!existingState || !existingState.discovery || !existingState.discovery.isAnalyzed) {
    return {
      success: false,
      agentRun: {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        projectId,
        agentName: "Positioning",
        stage: "POSITION",
        input: {},
        output: null,
        status: "failed",
        createdAt: new Date().toISOString(),
        error: "Discovery stage must be completed before Positioning can run.",
      },
      error: "Discovery stage must be completed before Positioning can run.",
    };
  }

  const result = await executePositioningAgent(
    { projectId, apiKey },
    existingState
  );

  // Background persistence
  await persistAgentRun(result.agentRun);

  if (result.success && result.updatedBrandState) {
    await persistBrandState(result.updatedBrandState);
  }

  return result;
}
