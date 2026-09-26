import type {
  BrandState,
  DeliveryOutput,
} from "@/types/brand";
import { DeliveryOutputSchema } from "@/types/brand";
import type { AgentRun } from "@/types/agent";
import type { LLMMessage, LLMProvider } from "@/lib/ai/types";
import { getAIProvider } from "@/lib/ai/provider";
import { persistAgentRun, persistBrandState } from "@/lib/db/repository";
import {
  DELIVERY_SYSTEM_PROMPT,
  buildDeliveryUserPrompt,
} from "./prompts/delivery";

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

export interface DeliveryExecutionInput {
  projectId: string;
  brandState?: BrandState;
  apiKey?: string;
}

export interface DeliveryExecutionResult {
  success: boolean;
  deliveryOutput?: DeliveryOutput;
  updatedBrandState?: BrandState;
  agentRun?: AgentRun;
  error?: string;
}

/**
 * Delivery Agent Engine (Phase 8).
 *
 * Responsibilities:
 * 1. Validates all 8 upstream prerequisites: Discovery, Positioning, Personality, Naming,
 *    authoritative human-selected Name, Voice, Visual Direction, and Consistency evaluated.
 * 2. Enforces hard prerequisite chain: Delivery MUST NOT run without all preceding stages completed.
 * 3. Consumes Consistency and Critique context, respecting readiness, systemic synergies, and warnings.
 * 4. Synthesizes practical, operationalized brand guidance across 6 sections:
 *    Brand Overview, Messaging, Voice Guidelines, Visual Guidelines, Usage Guidance, Deliverables.
 * 5. Strictly protects human decisions: selectedName is authoritative and NEVER renamed or altered.
 * 6. Unsupported claim resistance: ensures zero manufactured hype or unsupported assertions.
 * 7. Records AgentRun trace (stage: "DELIVERY", agentName: "Delivery").
 * 8. Immutably updates BrandState.delivery while strictly preserving all upstream state.
 * 9. Handles provider failures and malformed outputs gracefully.
 */
export async function executeDeliveryAgent(
  input: DeliveryExecutionInput,
  brandStateOrProvider?: BrandState | LLMProvider,
  customProviderParam?: LLMProvider
): Promise<DeliveryExecutionResult> {
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
    agentName: "Delivery",
    stage: "DELIVERY",
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
      consistencySummary: brandState?.consistency?.isEvaluated
        ? {
            readiness: brandState.consistency.readiness,
            warningCount: brandState.consistency.warnings?.length || 0,
            crossSystemIssueCount: brandState.consistency.crossSystemIssues?.length || 0,
          }
        : null,
    },
    output: null,
    status: "running",
    createdAt: new Date().toISOString(),
  };

  // 2. Validate Discovery Prerequisite
  if (!brandState || !brandState.discovery || !brandState.discovery.isAnalyzed || !brandState.discovery.problem) {
    const errorMsg = "Discovery stage must be completed before Delivery can run. Please complete Stage 01 first.";
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
    const errorMsg = "Positioning stage must be completed before Delivery can run. Please complete Stage 02 first.";
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
    const errorMsg = "Personality stage must be completed before Delivery can run. Please complete Stage 03 Personality first.";
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
    const errorMsg = "Naming stage must be completed before Delivery can run. Please generate candidates in Stage 04 (Naming) first.";
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
    const errorMsg = "An authoritative brand name must be selected before Delivery can run. Please select a candidate brand name in Stage 04 first.";
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
    const errorMsg = "Voice stage must be completed before Delivery can run. Please generate Voice guidelines in Stage 05 (Voice) first.";
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
    const errorMsg = "Visual Direction stage must be completed before Delivery can run. Please generate Visual Direction in Stage 06 first.";
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

  // 8. Validate Consistency Prerequisite (Must have been evaluated)
  if (!brandState.consistency || !brandState.consistency.isEvaluated) {
    const errorMsg = "Consistency stage must be evaluated before Delivery can run. Please evaluate consistency in Stage 08 first.";
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
    const prompt = buildDeliveryUserPrompt(brandState);

    const messages: LLMMessage[] = [
      {
        role: "system",
        content: DELIVERY_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    // 9. Structured Generation & Zod Validation via LLMProvider
    const response = await provider.generateStructured<DeliveryOutput>(
      messages,
      DeliveryOutputSchema,
      {
        apiKey: input.apiKey,
        temperature: 0.25,
        maxTokens: 4000,
      }
    );

    const deliveryOutput = response.data;

    // Explicitly guarantee selectedName is strictly authoritative and unmodified
    deliveryOutput.brandOverview.name = brandState.naming.selectedName;

    const durationMs = Date.now() - startTime;
    const completedAt = new Date().toISOString();

    // Complete AgentRun
    agentRun.status = "completed";
    agentRun.completedAt = completedAt;
    agentRun.durationMs = durationMs;
    agentRun.output = deliveryOutput as unknown as Record<string, unknown>;

    // 10. Immutably update BrandState (Preserving all upstream state and selectedName)
    const updatedBrandState: BrandState = {
      ...brandState,
      projectId,
      version: (brandState.version || 1) + 1,
      updatedAt: completedAt,
      delivery: {
        isDelivered: true,
        deliveredAt: completedAt,
        brandOverview: deliveryOutput.brandOverview,
        messaging: deliveryOutput.messaging,
        voiceGuidelines: deliveryOutput.voiceGuidelines,
        visualGuidelines: deliveryOutput.visualGuidelines,
        usageGuidance: deliveryOutput.usageGuidance,
        deliverables: deliveryOutput.deliverables,
        warnings: deliveryOutput.warnings,
      },
    };

    // 11. Persist to Repository
    await persistAgentRun(agentRun);
    await persistBrandState(updatedBrandState);

    return {
      success: true,
      deliveryOutput,
      updatedBrandState,
      agentRun,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Delivery Agent execution failed";

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
