import { z } from "zod";
import type { BrandState, VoiceOutput } from "@/types/brand";
import { VoiceOutputSchema } from "@/types/brand";
import type { AgentRun } from "@/types/agent";
import type { LLMMessage, LLMProvider } from "@/lib/ai/types";
import { getAIProvider } from "@/lib/ai/provider";
import { persistAgentRun, persistBrandState } from "@/lib/db/repository";
import { VOICE_SYSTEM_PROMPT, buildVoiceUserPrompt } from "./prompts/voice";

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

export const VoiceExecutionInputSchema = z.object({
  projectId: z.string().optional(),
  apiKey: z.string().optional(),
  brandState: z.custom<BrandState>().optional(),
});

export type VoiceExecutionInput = z.infer<typeof VoiceExecutionInputSchema>;

export interface VoiceExecutionResult {
  success: boolean;
  voiceOutput?: VoiceOutput;
  updatedBrandState?: BrandState;
  agentRun?: AgentRun;
  error?: string;
}

/**
 * Executes the PinkLoom Voice Agent (Phase 4C).
 *
 * Responsibilities:
 * 1. Validates upstream prerequisites: Discovery, Positioning, Personality, and Human-Selected Naming
 * 2. Enforces hard dependency: Voice MUST NOT run without an authoritative human-selected brand name
 * 3. Builds grounded 4-layer prompt with Discovery, Positioning, Personality, and Selected Identity
 * 4. Calls LLMProvider to generate structured VoiceOutput conforming to VoiceOutputSchema
 * 5. Validates model response with strict Zod constraints
 * 6. Records AgentRun trace with status, execution timing, input summaries, and structured output
 * 7. Immutably updates BrandState.voice while preserving rawIdea, discovery, positioning, personality, and naming
 * 8. Increments BrandState.version and marks voice.isGenerated = true
 * 9. Persists updated BrandState and AgentRun
 * 10. Handles provider failures, missing keys, and invalid outputs gracefully
 */
export async function executeVoiceAgent(
  input: VoiceExecutionInput,
  brandState?: BrandState,
  customProvider?: LLMProvider
): Promise<VoiceExecutionResult> {
  const startTime = Date.now();
  const runId = generateUUID();
  const projectId = input.projectId || brandState?.projectId || generateUUID();

  // 1. Initialize Agent Run Trace
  const agentRun: AgentRun = {
    id: runId,
    projectId,
    agentName: "Voice",
    stage: "SHAPE",
    input: {
      selectedName: brandState?.naming?.selectedName || null,
      selectedTagline: brandState?.naming?.selectedTagline || null,
      discoverySummary: brandState?.discovery
        ? {
            problem: brandState.discovery.problem,
            primaryAudience: brandState.discovery.targetAudience.primary,
          }
        : null,
      positioningSummary: brandState?.positioning
        ? {
            category: brandState.positioning.category,
            differentiator: brandState.positioning.differentiator,
            valueProposition: brandState.positioning.valueProposition,
          }
        : null,
      personalitySummary: brandState?.personality
        ? {
            archetype: brandState.personality.archetype,
            traits: brandState.personality.traits,
            emotionalTerritory: brandState.personality.emotionalTerritory,
          }
        : null,
    },
    output: null,
    status: "running",
    createdAt: new Date().toISOString(),
  };

  // 2. Validate Discovery Prerequisite
  if (!brandState || !brandState.discovery || !brandState.discovery.isAnalyzed || !brandState.discovery.problem) {
    const errorMsg = "Discovery stage must be completed before Voice can run. Please complete Stage 01 first.";
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
    const errorMsg = "Positioning stage must be completed before Voice can run. Please complete Stage 02 first.";
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
    const errorMsg = "Personality stage must be completed before Voice can run. Please complete Stage 03 Personality first.";
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
    const errorMsg = "Naming stage must be completed and an authoritative brand name selected before Voice can run. Please select a brand name in Stage 04 (Naming) first.";
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
        content: VOICE_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildVoiceUserPrompt(
          brandState.discovery,
          brandState.positioning,
          brandState.personality,
          brandState.naming
        ),
      },
    ];

    // 6. Structured Generation & Zod Validation via LLMProvider
    const response = await provider.generateStructured<VoiceOutput>(
      messages,
      VoiceOutputSchema,
      {
        apiKey: input.apiKey,
        temperature: 0.5,
        maxTokens: 3500,
      }
    );

    const voiceOutput = response.data;
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    // 7. Update AgentRun Trace to Completed
    agentRun.status = "completed";
    agentRun.output = voiceOutput as unknown as Record<string, unknown>;
    agentRun.completedAt = completedAt;
    agentRun.durationMs = durationMs;

    // 8. Immutably update BrandState (Preserving rawIdea, discovery, positioning, personality, & naming)
    const updatedBrandState: BrandState = {
      ...brandState,
      projectId,
      version: (brandState.version || 1) + 1,
      updatedAt: completedAt,
      voice: {
        toneProfile: voiceOutput.toneProfile,
        toneDimensions: voiceOutput.toneDimensions,
        vocabulary: voiceOutput.vocabulary,
        messagingPillars: voiceOutput.messagingPillars,
        communicationPrinciples: voiceOutput.communicationPrinciples,
        writingGuidelines: voiceOutput.writingGuidelines,
        examples: voiceOutput.examples,
        voiceDonts: voiceOutput.voiceDonts,
        consistencyRules: voiceOutput.consistencyRules,
        isGenerated: true,
        generatedAt: completedAt,
      },
    };

    // 9. Persist to Repository
    await persistAgentRun(agentRun);
    await persistBrandState(updatedBrandState);

    return {
      success: true,
      voiceOutput,
      updatedBrandState,
      agentRun,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Voice Agent execution failed";

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
