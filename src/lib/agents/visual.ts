import { z } from "zod";
import type { BrandState, VisualDirectionOutput, ColorSwatch } from "@/types/brand";
import { VisualDirectionOutputSchema } from "@/types/brand";
import type { AgentRun } from "@/types/agent";
import type { LLMMessage, LLMProvider } from "@/lib/ai/types";
import { getAIProvider } from "@/lib/ai/provider";
import { persistAgentRun, persistBrandState } from "@/lib/db/repository";
import { VISUAL_SYSTEM_PROMPT, buildVisualUserPrompt } from "./prompts/visual";

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

export const VisualExecutionInputSchema = z.object({
  projectId: z.string().optional(),
  apiKey: z.string().optional(),
  brandState: z.custom<BrandState>().optional(),
});

export type VisualExecutionInput = z.infer<typeof VisualExecutionInputSchema>;

export interface VisualExecutionResult {
  success: boolean;
  visualOutput?: VisualDirectionOutput;
  updatedBrandState?: BrandState;
  agentRun?: AgentRun;
  error?: string;
}

/**
 * Executes the PinkLoom Visual Direction Agent (Phase 5).
 *
 * Responsibilities:
 * 1. Validates upstream prerequisites: Discovery, Positioning, Personality, Human-Selected Naming, and Voice
 * 2. Enforces hard prerequisite chain: Visual Direction MUST NOT run without all 5 preceding foundational layers
 * 3. Builds grounded 5-layer prompt with Discovery, Positioning, Personality, Selected Identity, and Voice
 * 4. Calls LLMProvider to generate structured VisualDirectionOutput conforming to VisualDirectionOutputSchema
 * 5. Validates model response with strict Zod constraints
 * 6. Records AgentRun trace with status, execution timing, input summaries, and structured output
 * 7. Immutably updates BrandState.visualDirection while preserving all upstream state
 * 8. Increments BrandState.version and marks visualDirection.isGenerated = true
 * 9. Persists updated BrandState and AgentRun
 * 10. Handles provider failures, missing keys, and invalid outputs gracefully
 */
export async function executeVisualAgent(
  input: VisualExecutionInput,
  brandState?: BrandState,
  customProvider?: LLMProvider
): Promise<VisualExecutionResult> {
  const startTime = Date.now();
  const runId = generateUUID();
  const projectId = input.projectId || brandState?.projectId || generateUUID();

  // 1. Initialize Agent Run Trace
  const agentRun: AgentRun = {
    id: runId,
    projectId,
    agentName: "Visual",
    stage: "VISUALIZE",
    input: {
      selectedName: brandState?.naming?.selectedName || null,
      selectedTagline: brandState?.naming?.selectedTagline || null,
      voiceSummary: brandState?.voice?.isGenerated
        ? {
            primaryTone: brandState.voice.toneProfile.primary,
            tonalBalance: brandState.voice.toneProfile.tonalBalance,
          }
        : null,
      personalitySummary: brandState?.personality?.isFormulated
        ? {
            archetype: brandState.personality.archetype,
            traits: brandState.personality.traits,
            emotionalTerritory: brandState.personality.emotionalTerritory,
          }
        : null,
      positioningSummary: brandState?.positioning?.isPositioned
        ? {
            category: brandState.positioning.category,
            differentiator: brandState.positioning.differentiator,
            valueProposition: brandState.positioning.valueProposition,
          }
        : null,
      discoverySummary: brandState?.discovery?.isAnalyzed
        ? {
            problem: brandState.discovery.problem,
            primaryAudience: brandState.discovery.targetAudience.primary,
          }
        : null,
    },
    output: null,
    status: "running",
    createdAt: new Date().toISOString(),
  };

  // 2. Validate Discovery Prerequisite
  if (!brandState || !brandState.discovery || !brandState.discovery.isAnalyzed || !brandState.discovery.problem) {
    const errorMsg = "Discovery stage must be completed before Visual Direction can run. Please complete Stage 01 first.";
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
    const errorMsg = "Positioning stage must be completed before Visual Direction can run. Please complete Stage 02 first.";
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
    const errorMsg = "Personality stage must be completed before Visual Direction can run. Please complete Stage 03 Personality first.";
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
    const errorMsg = "Naming stage must be completed and an authoritative brand name selected before Visual Direction can run. Please select a brand name in Stage 04 (Naming) first.";
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
  if (!brandState.voice || !brandState.voice.isGenerated || !brandState.voice.toneProfile.primary) {
    const errorMsg = "Voice stage must be completed before Visual Direction can run. Please generate Voice guidelines in Stage 05 (Voice) first.";
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
        content: VISUAL_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildVisualUserPrompt(
          brandState.discovery,
          brandState.positioning,
          brandState.personality,
          brandState.naming,
          brandState.voice
        ),
      },
    ];

    // 7. Structured Generation & Zod Validation via LLMProvider
    const response = await provider.generateStructured<VisualDirectionOutput>(
      messages,
      VisualDirectionOutputSchema,
      {
        apiKey: input.apiKey,
        temperature: 0.5,
        maxTokens: 4000,
      }
    );

    const visualOutput = response.data;
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    // 8. Update AgentRun Trace to Completed
    agentRun.status = "completed";
    agentRun.output = visualOutput as unknown as Record<string, unknown>;
    agentRun.completedAt = completedAt;
    agentRun.durationMs = durationMs;

    // Generate flattened colors for backwards compatibility
    const flattenedColors: ColorSwatch[] = [
      ...visualOutput.colorSystem.primary.map((c) => ({
        role: "primary" as const,
        name: c.name,
        hex: c.hex,
        rationale: `${c.role}: ${c.usage}`,
      })),
      ...visualOutput.colorSystem.secondary.map((c) => ({
        role: "secondary" as const,
        name: c.name,
        hex: c.hex,
        rationale: `${c.role}: ${c.usage}`,
      })),
      ...visualOutput.colorSystem.neutrals.map((c) => ({
        role: "surface" as const,
        name: c.name,
        hex: c.hex,
        rationale: `${c.role}: ${c.usage}`,
      })),
    ];

    // 9. Immutably update BrandState (Preserving all upstream state)
    const updatedBrandState: BrandState = {
      ...brandState,
      projectId,
      version: (brandState.version || 1) + 1,
      updatedAt: completedAt,
      visualDirection: {
        colorSystem: visualOutput.colorSystem,
        typography: visualOutput.typography,
        visualPersonality: visualOutput.visualPersonality,
        imagery: visualOutput.imagery,
        logoDirection: visualOutput.logoDirection,
        layoutPrinciples: visualOutput.layoutPrinciples,
        overallAesthetic: visualOutput.visualPersonality.aestheticMood,
        colors: flattenedColors,
        isGenerated: true,
        generatedAt: completedAt,
      },
    };

    // 10. Persist to Repository
    await persistAgentRun(agentRun);
    await persistBrandState(updatedBrandState);

    return {
      success: true,
      visualOutput,
      updatedBrandState,
      agentRun,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Visual Direction Agent execution failed";

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
