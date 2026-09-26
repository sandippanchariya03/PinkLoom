"use server";

import {
  persistBrandState,
  persistAgentRun,
  getStoredBrandState,
} from "@/lib/db/repository";
import {
  executeVoiceAgent,
  type VoiceExecutionResult,
} from "@/lib/agents/voice";
import type { BrandState } from "@/types/brand";

/**
 * Triggers the PinkLoom Voice Agent (Phase 4C).
 *
 * Verifies that:
 * 1. Discovery is complete
 * 2. Positioning is complete
 * 3. Personality is formulated
 * 4. An authoritative brand name has been selected by the human
 *
 * Persists the resulting Voice strategy and AgentRun trace.
 */
export async function runVoiceAction(
  projectId: string,
  apiKey?: string,
  customBrandState?: BrandState | null
): Promise<VoiceExecutionResult> {
  const existingState =
    customBrandState || (await getStoredBrandState(projectId));

  if (!existingState) {
    return {
      success: false,
      agentRun: {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        projectId,
        agentName: "Voice",
        stage: "SHAPE",
        input: {},
        output: null,
        status: "failed",
        createdAt: new Date().toISOString(),
        error: "BrandState not found for project.",
      },
      error: "BrandState not found for project.",
    };
  }

  if (!existingState.discovery?.isAnalyzed) {
    return {
      success: false,
      agentRun: {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        projectId,
        agentName: "Voice",
        stage: "SHAPE",
        input: {},
        output: null,
        status: "failed",
        createdAt: new Date().toISOString(),
        error: "Discovery stage must be completed before Voice can run.",
      },
      error: "Discovery stage must be completed before Voice can run.",
    };
  }

  if (!existingState.positioning?.isPositioned) {
    return {
      success: false,
      agentRun: {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        projectId,
        agentName: "Voice",
        stage: "SHAPE",
        input: {},
        output: null,
        status: "failed",
        createdAt: new Date().toISOString(),
        error: "Positioning stage must be completed before Voice can run.",
      },
      error: "Positioning stage must be completed before Voice can run.",
    };
  }

  if (!existingState.personality?.isFormulated) {
    return {
      success: false,
      agentRun: {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        projectId,
        agentName: "Voice",
        stage: "SHAPE",
        input: {},
        output: null,
        status: "failed",
        createdAt: new Date().toISOString(),
        error: "Personality stage must be completed before Voice can run.",
      },
      error: "Personality stage must be completed before Voice can run.",
    };
  }

  if (!existingState.naming?.isSelected || !existingState.naming?.selectedName) {
    return {
      success: false,
      agentRun: {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        projectId,
        agentName: "Voice",
        stage: "SHAPE",
        input: {},
        output: null,
        status: "failed",
        createdAt: new Date().toISOString(),
        error: "Naming stage must be completed and an authoritative brand name selected before Voice can run.",
      },
      error: "Naming stage must be completed and an authoritative brand name selected before Voice can run.",
    };
  }

  const result = await executeVoiceAgent(
    { projectId, apiKey },
    existingState
  );

  if (result.agentRun) {
    await persistAgentRun(result.agentRun);
  }

  if (result.success && result.updatedBrandState) {
    await persistBrandState(result.updatedBrandState);
  }

  return result;
}
