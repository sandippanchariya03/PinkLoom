"use server";

import { executeDiscoveryAgent } from "@/lib/agents/discovery";
import {
  persistProject,
  persistBrandState,
  persistAgentRun,
  getStoredBrandState,
} from "@/lib/db/repository";
import type { DiscoveryExecutionResult } from "@/lib/agents/discovery";

export async function runDiscoveryAction(
  rawIdea: string,
  projectId = "pinkloom-demo-project",
  apiKey?: string
): Promise<DiscoveryExecutionResult> {
  const existingState = await getStoredBrandState(projectId);

  const result = await executeDiscoveryAgent(
    { rawIdea, projectId, apiKey },
    existingState || undefined
  );

  // Background persistence
  await persistProject(projectId, rawIdea);
  await persistAgentRun(result.agentRun);

  if (result.success && result.updatedBrandState) {
    await persistBrandState(result.updatedBrandState);
  }

  return result;
}
