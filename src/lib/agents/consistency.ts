import type {
  BrandState,
  ConsistencyOutput,
  ConsistencyAlignment,
} from "@/types/brand";
import { ConsistencyOutputSchema } from "@/types/brand";
import type { AgentRun } from "@/types/agent";
import type { LLMMessage, LLMProvider } from "@/lib/ai/types";
import { getAIProvider } from "@/lib/ai/provider";
import { persistAgentRun, persistBrandState } from "@/lib/db/repository";
import {
  CONSISTENCY_SYSTEM_PROMPT,
  buildConsistencyUserPrompt,
} from "./prompts/consistency";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface ConsistencyExecutionInput {
  projectId: string;
  brandState?: BrandState;
  apiKey?: string;
}

export interface ConsistencyExecutionResult {
  success: boolean;
  consistencyOutput?: ConsistencyOutput;
  updatedBrandState?: BrandState;
  agentRun?: AgentRun;
  error?: string;
}

/**
 * Consistency Agent Engine (Phase 7).
 *
 * Responsibilities:
 * 1. Validates all 6 upstream prerequisites: Discovery, Positioning, Personality, Naming, Voice, and Visual Direction
 * 2. Enforces hard prerequisite chain: Consistency MUST NOT run without all preceding stages completed
 * 3. Consumes Critique findings when available, synthesizing system-level ripple effects
 * 4. Evaluates 7 core dimensions: Strategic, Audience, Personality, Naming, Voice, Visual, Messaging
 * 5. Identifies cross-system issues with relationship tags, verbatim evidence, explanations, and recommendations
 * 6. Strictly protects human decisions: selectedName is authoritative and NEVER renamed
 * 7. False-positive resistant: coherent brands receive readiness = "coherent" and zero critical issues
 * 8. Records AgentRun trace (stage: "CONSISTENCY", agentName: "Consistency")
 * 9. Immutably updates BrandState.consistency while preserving all upstream state
 * 10. Handles provider failures and malformed outputs gracefully
 */
export async function executeConsistencyAgent(
  input: ConsistencyExecutionInput,
  brandStateOrProvider?: BrandState | LLMProvider,
  customProviderParam?: LLMProvider
): Promise<ConsistencyExecutionResult> {
  const startTime = Date.now();
  const runId = generateUUID();

  let activeBrandState: BrandState | undefined = input.brandState;
  let customProvider: LLMProvider | undefined = customProviderParam;

  if (brandStateOrProvider) {
    if ("generateStructured" in brandStateOrProvider) {
      customProvider = brandStateOrProvider as LLMProvider;
    } else {
      activeBrandState = brandStateOrProvider as BrandState;
    }
  }

  const brandState = activeBrandState;
  const projectId = input.projectId || brandState?.projectId || generateUUID();

  // 1. Initialize Agent Run Trace
  const agentRun: AgentRun = {
    id: runId,
    projectId,
    agentName: "Consistency",
    stage: "CONSISTENCY",
    input: {
      selectedName: brandState?.naming?.selectedName || null,
      selectedTagline: brandState?.naming?.selectedTagline || null,
      discoverySummary: brandState?.discovery?.isAnalyzed
        ? {
            problem: brandState.discovery.problem,
            primaryAudience: brandState.discovery.targetAudience.primary,
          }
        : null,
      positioningSummary: brandState?.positioning?.isPositioned
        ? {
            category: brandState.positioning.category,
            differentiator: brandState.positioning.differentiator,
          }
        : null,
      personalitySummary: brandState?.personality?.isFormulated
        ? {
            archetype: brandState.personality.archetype,
            traits: brandState.personality.traits,
          }
        : null,
      voiceSummary: brandState?.voice?.isGenerated
        ? {
            primaryTone: brandState.voice.toneProfile.primary,
          }
        : null,
      visualSummary: brandState?.visualDirection?.isGenerated
        ? {
            aestheticMood: brandState.visualDirection.visualPersonality?.aestheticMood || "",
            headingFont:
              (brandState.visualDirection.typography as unknown as Record<string, unknown>)?.headingFont?.toString() ||
              (brandState.visualDirection.typography as unknown as { heading?: { fontFamily?: string } })?.heading?.fontFamily ||
              "",
          }
        : null,
      critiqueSummary: brandState?.critique?.isEvaluated
        ? {
            readiness: brandState.critique.readiness,
            issueCount: brandState.critique.issues?.length || 0,
          }
        : null,
    },
    output: null,
    status: "running",
    createdAt: new Date().toISOString(),
  };

  // 2. Validate Discovery Prerequisite
  if (!brandState || !brandState.discovery || !brandState.discovery.isAnalyzed || !brandState.discovery.problem) {
    const errorMsg = "Discovery stage must be completed before Consistency can run. Please complete Stage 01 first.";
    agentRun.status = "failed";
    agentRun.error = errorMsg;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;
    await persistAgentRun(agentRun);
    return {
      success: false,
      agentRun,
      error: errorMsg,
    };
  }

  // 3. Validate Positioning Prerequisite
  if (!brandState.positioning || !brandState.positioning.isPositioned || !brandState.positioning.category) {
    const errorMsg = "Positioning stage must be completed before Consistency can run. Please complete Stage 02 first.";
    agentRun.status = "failed";
    agentRun.error = errorMsg;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;
    await persistAgentRun(agentRun);
    return {
      success: false,
      agentRun,
      error: errorMsg,
    };
  }

  // 4. Validate Personality Prerequisite
  if (!brandState.personality || !brandState.personality.isFormulated || !brandState.personality.archetype) {
    const errorMsg = "Personality stage must be completed before Consistency can run. Please complete Stage 03 Personality first.";
    agentRun.status = "failed";
    agentRun.error = errorMsg;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;
    await persistAgentRun(agentRun);
    return {
      success: false,
      agentRun,
      error: errorMsg,
    };
  }

  // 5. Validate Naming Selection Prerequisite
  if (!brandState.naming || !brandState.naming.isGenerated) {
    const errorMsg = "Naming stage must be completed before Consistency can run. Please generate candidates in Stage 04 (Naming) first.";
    agentRun.status = "failed";
    agentRun.error = errorMsg;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;
    await persistAgentRun(agentRun);
    return {
      success: false,
      agentRun,
      error: errorMsg,
    };
  }

  if (!brandState.naming.isSelected || !brandState.naming.selectedName || brandState.naming.selectedName.trim().length === 0) {
    const errorMsg = "An authoritative brand name must be selected before Consistency can run. Please select a candidate brand name in Stage 04 first.";
    agentRun.status = "failed";
    agentRun.error = errorMsg;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;
    await persistAgentRun(agentRun);
    return {
      success: false,
      agentRun,
      error: errorMsg,
    };
  }

  // 6. Validate Voice Prerequisite
  if (!brandState.voice || !brandState.voice.isGenerated || !brandState.voice.toneProfile?.primary) {
    const errorMsg = "Voice stage must be completed before Consistency can run. Please generate Voice guidelines in Stage 05 (Voice) first.";
    agentRun.status = "failed";
    agentRun.error = errorMsg;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;
    await persistAgentRun(agentRun);
    return {
      success: false,
      agentRun,
      error: errorMsg,
    };
  }

  // 7. Validate Visual Direction Prerequisite
  if (
    !brandState.visualDirection ||
    !brandState.visualDirection.isGenerated ||
    !brandState.visualDirection.colorSystem?.primary ||
    brandState.visualDirection.colorSystem.primary.length === 0
  ) {
    const errorMsg = "Visual Direction stage must be completed before Consistency can run. Please generate Visual Direction in Stage 06 first.";
    agentRun.status = "failed";
    agentRun.error = errorMsg;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;
    await persistAgentRun(agentRun);
    return {
      success: false,
      agentRun,
      error: errorMsg,
    };
  }

  try {
    const provider = customProvider || getAIProvider();

    const messages: LLMMessage[] = [
      {
        role: "system",
        content: CONSISTENCY_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildConsistencyUserPrompt(brandState),
      },
    ];

    // 8. Structured Generation & Zod Validation via LLMProvider
    const response = await provider.generateStructured<ConsistencyOutput>(
      messages,
      ConsistencyOutputSchema,
      {
        apiKey: input.apiKey,
        temperature: 0.3,
        maxTokens: 4000,
      }
    );

    const consistencyOutput = response.data;
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    // 9. Update AgentRun Trace to Completed
    agentRun.status = "completed";
    agentRun.output = consistencyOutput as unknown as Record<string, unknown>;
    agentRun.completedAt = completedAt;
    agentRun.durationMs = durationMs;

    // Backward compatibility helper: map dimension statuses to legacy alignments
    const statusScoreMap = {
      coherent: 92,
      warning: 72,
      inconsistent: 40,
    };

    const legacyAlignments: ConsistencyAlignment[] = [
      {
        dimension: "Strategic Alignment",
        score: statusScoreMap[consistencyOutput.strategic.status],
        observation: consistencyOutput.strategic.findings.join("; "),
        isAligned: consistencyOutput.strategic.status === "coherent",
      },
      {
        dimension: "Audience Alignment",
        score: statusScoreMap[consistencyOutput.audience.status],
        observation: consistencyOutput.audience.findings.join("; "),
        isAligned: consistencyOutput.audience.status === "coherent",
      },
      {
        dimension: "Personality Alignment",
        score: statusScoreMap[consistencyOutput.personality.status],
        observation: consistencyOutput.personality.findings.join("; "),
        isAligned: consistencyOutput.personality.status === "coherent",
      },
      {
        dimension: "Naming Alignment",
        score: statusScoreMap[consistencyOutput.naming.status],
        observation: consistencyOutput.naming.findings.join("; "),
        isAligned: consistencyOutput.naming.status === "coherent",
      },
      {
        dimension: "Voice Alignment",
        score: statusScoreMap[consistencyOutput.voice.status],
        observation: consistencyOutput.voice.findings.join("; "),
        isAligned: consistencyOutput.voice.status === "coherent",
      },
      {
        dimension: "Visual Alignment",
        score: statusScoreMap[consistencyOutput.visual.status],
        observation: consistencyOutput.visual.findings.join("; "),
        isAligned: consistencyOutput.visual.status === "coherent",
      },
      {
        dimension: "Messaging Alignment",
        score: statusScoreMap[consistencyOutput.messaging.status],
        observation: consistencyOutput.messaging.findings.join("; "),
        isAligned: consistencyOutput.messaging.status === "coherent",
      },
    ];

    let overallCoherenceScore = 80;
    if (consistencyOutput.readiness === "coherent") overallCoherenceScore = 95;
    else if (consistencyOutput.readiness === "mostly_coherent") overallCoherenceScore = 78;
    else overallCoherenceScore = 45;

    const crossStageConflicts = consistencyOutput.crossSystemIssues.map(
      (iss) => `[${iss.relationship}] ${iss.explanation}`
    );

    // 10. Immutably update BrandState (Preserving all upstream state and selectedName)
    const updatedBrandState: BrandState = {
      ...brandState,
      projectId,
      version: (brandState.version || 1) + 1,
      updatedAt: completedAt,
      consistency: {
        isEvaluated: true,
        evaluatedAt: completedAt,
        overallAssessment: consistencyOutput.overallAssessment,
        readiness: consistencyOutput.readiness,
        strategic: consistencyOutput.strategic,
        audience: consistencyOutput.audience,
        personality: consistencyOutput.personality,
        naming: consistencyOutput.naming,
        voice: consistencyOutput.voice,
        visual: consistencyOutput.visual,
        messaging: consistencyOutput.messaging,
        crossSystemIssues: consistencyOutput.crossSystemIssues,
        strengths: consistencyOutput.strengths,
        warnings: consistencyOutput.warnings,
        overallCoherenceScore,
        alignments: legacyAlignments,
        crossStageConflicts,
        finalRecommendation: consistencyOutput.overallAssessment,
      },
    };

    // 11. Persist to Repository
    await persistAgentRun(agentRun);
    await persistBrandState(updatedBrandState);

    return {
      success: true,
      consistencyOutput,
      updatedBrandState,
      agentRun,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Consistency Agent execution failed";

    agentRun.status = "failed";
    agentRun.error = errorMessage;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = durationMs;

    await persistAgentRun(agentRun);

    return {
      success: false,
      agentRun,
      error: errorMessage,
    };
  }
}
