"use server";

import {
  persistBrandState,
  persistAgentRun,
  getStoredBrandState,
} from "@/lib/db/repository";
import {
  executeNamingAgent,
  type NamingExecutionResult,
} from "@/lib/agents/naming";
import type { BrandState } from "@/types/brand";

export interface SelectBrandNameInput {
  projectId?: string;
  directionId: string;
  candidateName: string;
  tagline?: string;
  brandState?: BrandState | null;
}

export interface SelectBrandNameResult {
  success: boolean;
  updatedBrandState?: BrandState;
  error?: string;
}

/**
 * Human-in-the-loop selection action.
 * Allows the user to select or re-select a brand name from generated directions.
 *
 * Rules:
 * - Does NOT overwrite generated directions or candidates
 * - Updates selectedDirectionId, selectedName, selectedTagline
 * - Sets isSelected = true and selectedAt timestamp
 * - Increments BrandState.version
 * - Persists updated state
 */
export async function selectBrandName(
  input: SelectBrandNameInput
): Promise<SelectBrandNameResult> {
  const projectId = input.projectId || input.brandState?.projectId || "pinkloom-demo-project";
  const existingState = input.brandState || (await getStoredBrandState(projectId));

  if (!existingState) {
    return {
      success: false,
      error: "BrandState not found for project.",
    };
  }

  if (!existingState.naming || !existingState.naming.isGenerated || existingState.naming.directions.length === 0) {
    return {
      success: false,
      error: "No generated naming directions found. Please generate naming directions first.",
    };
  }

  const direction = existingState.naming.directions.find((d) => d.id === input.directionId);
  if (!direction) {
    return {
      success: false,
      error: `Naming direction with id "${input.directionId}" not found.`,
    };
  }

  const candidate = direction.candidates.find(
    (c) => c.name.trim().toLowerCase() === input.candidateName.trim().toLowerCase()
  );
  if (!candidate) {
    return {
      success: false,
      error: `Candidate "${input.candidateName}" not found in direction "${direction.name}".`,
    };
  }

  const selectedAt = new Date().toISOString();
  const updatedBrandState: BrandState = {
    ...existingState,
    version: (existingState.version || 1) + 1,
    updatedAt: selectedAt,
    naming: {
      ...existingState.naming,
      selectedDirectionId: direction.id,
      selectedName: candidate.name,
      selectedTagline: input.tagline || (direction.taglineCandidates[0] ?? null),
      isSelected: true,
      selectedAt,
    },
  };

  await persistBrandState(updatedBrandState);

  return {
    success: true,
    updatedBrandState,
  };
}

/**
 * Server action to execute the Naming Agent generation.
 */
export async function runNamingAction(
  projectId = "pinkloom-demo-project",
  apiKey?: string,
  clientState?: BrandState
): Promise<NamingExecutionResult> {
  const existingState = clientState || (await getStoredBrandState(projectId));

  if (!existingState || !existingState.discovery?.isAnalyzed) {
    return {
      success: false,
      agentRun: {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        projectId,
        agentName: "Naming",
        stage: "SHAPE",
        input: {},
        output: null,
        status: "failed",
        createdAt: new Date().toISOString(),
        error: "Discovery stage must be completed before Naming can run.",
      },
      error: "Discovery stage must be completed before Naming can run.",
    };
  }

  if (!existingState.positioning?.isPositioned) {
    return {
      success: false,
      agentRun: {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        projectId,
        agentName: "Naming",
        stage: "SHAPE",
        input: {},
        output: null,
        status: "failed",
        createdAt: new Date().toISOString(),
        error: "Positioning stage must be completed before Naming can run.",
      },
      error: "Positioning stage must be completed before Naming can run.",
    };
  }

  if (!existingState.personality?.isFormulated) {
    return {
      success: false,
      agentRun: {
        id: "err-" + Math.random().toString(36).substring(2, 9),
        projectId,
        agentName: "Naming",
        stage: "SHAPE",
        input: {},
        output: null,
        status: "failed",
        createdAt: new Date().toISOString(),
        error: "Personality stage must be completed before Naming can run.",
      },
      error: "Personality stage must be completed before Naming can run.",
    };
  }

  const result = await executeNamingAgent(
    { projectId, apiKey },
    existingState
  );

  await persistAgentRun(result.agentRun);

  if (result.success && result.updatedBrandState) {
    await persistBrandState(result.updatedBrandState);
  }

  return result;
}
