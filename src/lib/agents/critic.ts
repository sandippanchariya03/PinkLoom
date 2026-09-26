import { z } from "zod";
import type { BrandState, CriticOutput, CritiqueItem } from "@/types/brand";
import { CriticOutputSchema } from "@/types/brand";
import type { AgentRun } from "@/types/agent";
import type { LLMMessage, LLMProvider } from "@/lib/ai/types";
import { getAIProvider } from "@/lib/ai/provider";
import { persistAgentRun, persistBrandState } from "@/lib/db/repository";
import { CRITIC_SYSTEM_PROMPT, buildCriticUserPrompt } from "./prompts/critic";

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

export const CriticExecutionInputSchema = z.object({
  projectId: z.string().optional(),
  apiKey: z.string().optional(),
  brandState: z.custom<BrandState>().optional(),
});

export type CriticExecutionInput = z.infer<typeof CriticExecutionInputSchema>;

export interface CriticExecutionResult {
  success: boolean;
  criticOutput?: CriticOutput;
  updatedBrandState?: BrandState;
  agentRun?: AgentRun;
  error?: string;
}

/**
 * Executes the PinkLoom Critic / Challenge Agent (Phase 6).
 *
 * Responsibilities:
 * 1. Validates all 6 upstream prerequisites: Discovery, Positioning, Personality, Naming, Voice, and Visual Direction
 * 2. Enforces hard prerequisite chain: Critic MUST NOT run without all 6 preceding stages completed
 * 3. Builds unified 6-layer diagnostic prompt covering the complete brand system
 * 4. Calls LLMProvider to generate structured CriticOutput conforming to CriticOutputSchema
 * 5. Validates model response with strict Zod constraints
 * 6. Records AgentRun trace with status, execution timing, input summaries, and structured output
 * 7. Immutably updates BrandState.critique while preserving all upstream state and selectedName
 * 8. Increments BrandState.version and marks critique.isEvaluated = true
 * 9. Persists updated BrandState and AgentRun
 * 10. Handles provider failures, missing keys, and invalid outputs gracefully
 */
export async function executeCriticAgent(
  input: CriticExecutionInput,
  brandStateOrProvider?: BrandState | LLMProvider,
  customProviderParam?: LLMProvider
): Promise<CriticExecutionResult> {
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
    agentName: "Critic",
    stage: "CHALLENGE",
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
            aestheticMood: brandState.visualDirection.visualPersonality.aestheticMood,
            headingFont: brandState.visualDirection.typography.heading.fontFamily,
          }
        : null,
    },
    output: null,
    status: "running",
    createdAt: new Date().toISOString(),
  };

  // 2. Validate Discovery Prerequisite
  if (!brandState || !brandState.discovery || !brandState.discovery.isAnalyzed || !brandState.discovery.problem) {
    const errorMsg = "Discovery stage must be completed before Critic can run. Please complete Stage 01 first.";
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
    const errorMsg = "Positioning stage must be completed before Critic can run. Please complete Stage 02 first.";
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
    const errorMsg = "Personality stage must be completed before Critic can run. Please complete Stage 03 Personality first.";
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

  // 5. Validate Naming Selection Prerequisite (Authoritative Human Selection)
  if (!brandState.naming || !brandState.naming.isSelected || !brandState.naming.selectedName) {
    const errorMsg = "Naming stage must be completed and an authoritative brand name selected before Critic can run. Please select a brand name in Stage 04 (Naming) first.";
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
    const errorMsg = "Voice stage must be completed before Critic can run. Please generate Voice guidelines in Stage 05 (Voice) first.";
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
    brandState.visualDirection.colorSystem.primary.length === 0
  ) {
    const errorMsg = "Visual Direction stage must be completed before Critic can run. Please generate Visual Direction in Stage 06 first.";
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
        content: CRITIC_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildCriticUserPrompt(brandState),
      },
    ];

    // 8. Structured Generation & Zod Validation via LLMProvider
    const response = await provider.generateStructured<CriticOutput>(
      messages,
      CriticOutputSchema,
      {
        apiKey: input.apiKey,
        temperature: 0.3, // Diagnostic evaluation requires lower temperature for objective rigor
        maxTokens: 4000,
      }
    );

    const criticOutput = response.data;
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    // 9. Update AgentRun Trace to Completed
    agentRun.status = "completed";
    agentRun.output = criticOutput as unknown as Record<string, unknown>;
    agentRun.completedAt = completedAt;
    agentRun.durationMs = durationMs;

    // Generate legacy CritiqueItem array for backwards compatibility with consistency stage
    const legacyCritiques: CritiqueItem[] = criticOutput.issues.map((iss) => {
      let aspect: CritiqueItem["aspect"] = "differentiation";
      if (iss.category.includes("positioning")) aspect = "positioning";
      else if (iss.category.includes("name")) aspect = "naming";
      else if (iss.category.includes("voice")) aspect = "voice_cohesion";
      else if (iss.category.includes("visual")) aspect = "visual_alignment";
      else if (iss.category.includes("audience")) aspect = "audience_resonance";

      let sev: CritiqueItem["severity"] = "medium";
      if (iss.severity === "critical") sev = "critical";
      else if (iss.severity === "high") sev = "medium";
      else if (iss.severity === "low") sev = "low";

      return {
        id: iss.id,
        aspect,
        severity: sev,
        challenge: `${iss.category}: ${iss.explanation}`,
        recommendedAction: iss.suggestedRevision,
        resolved: false,
      };
    });

    const genericLanguageDetected = criticOutput.issues
      .filter((iss) => iss.category === "generic_language" || iss.category === "cliches")
      .map((iss) => iss.evidence);

    const vulnerabilities = criticOutput.issues
      .filter((iss) => iss.severity === "critical" || iss.severity === "high")
      .map((iss) => iss.explanation);

    // 10. Immutably update BrandState (Preserving all upstream state and selectedName)
    const updatedBrandState: BrandState = {
      ...brandState,
      projectId,
      version: (brandState.version || 1) + 1,
      updatedAt: completedAt,
      critique: {
        overallAssessment: criticOutput.overallAssessment,
        readiness: criticOutput.readiness,
        strengths: criticOutput.strengths,
        issues: criticOutput.issues,
        blockingIssues: criticOutput.blockingIssues,
        summary: criticOutput.overallAssessment,
        critiques: legacyCritiques,
        genericLanguageDetected,
        vulnerabilities,
        isEvaluated: true,
        evaluatedAt: completedAt,
      },
    };

    // 11. Persist to Repository
    await persistAgentRun(agentRun);
    await persistBrandState(updatedBrandState);

    return {
      success: true,
      criticOutput,
      updatedBrandState,
      agentRun,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Critic Agent execution failed";

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
