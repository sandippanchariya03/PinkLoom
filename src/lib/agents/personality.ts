import type { AgentRun } from "@/types/agent";
import {
  type BrandState,
  type PersonalityOutput,
  PersonalityOutputSchema,
} from "@/types/brand";
import { getAIProvider } from "@/lib/ai/provider";
import type { LLMMessage, LLMProvider } from "@/lib/ai/types";
import {
  persistBrandState,
  persistAgentRun,
} from "@/lib/db/repository";
import {
  PERSONALITY_SYSTEM_PROMPT,
  buildPersonalityUserPrompt,
} from "./prompts/personality";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "run-" + Math.random().toString(36).substring(2, 15);
}

export interface PersonalityExecutionInput {
  projectId?: string;
  apiKey?: string;
}

export interface PersonalityExecutionResult {
  success: boolean;
  personalityOutput?: PersonalityOutput;
  updatedBrandState?: BrandState;
  agentRun: AgentRun;
  error?: string;
}

/**
 * Runs the Personality Agent workflow:
 * 1. Validates strict stage prerequisites:
 *    - Stage 01 (Discovery) must be completed (isAnalyzed === true)
 *    - Stage 02 (Positioning) must be completed (isPositioned === true)
 * 2. Initializes AgentRun with status = 'running'
 * 3. Consumes validated Discovery and Positioning contexts (does NOT restart from rawIdea)
 * 4. Invokes LLMProvider with PersonalityOutputSchema
 * 5. Validates structured output via Zod
 * 6. Immutably updates BrandState.personality without mutating upstream stages
 * 7. Increments BrandState.version and marks personality.isFormulated = true
 * 8. Persists updated BrandState and AgentRun
 * 9. Handles provider failures, missing keys, and invalid outputs gracefully
 */
export async function executePersonalityAgent(
  input: PersonalityExecutionInput,
  brandState?: BrandState,
  customProvider?: LLMProvider
): Promise<PersonalityExecutionResult> {
  const startTime = Date.now();
  const runId = generateUUID();
  const projectId = input.projectId || brandState?.projectId || generateUUID();

  // 1. Initialize Agent Run Trace
  const agentRun: AgentRun = {
    id: runId,
    projectId,
    agentName: "Personality",
    stage: "SHAPE",
    input: {
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
    },
    output: null,
    status: "running",
    createdAt: new Date().toISOString(),
  };

  // 2. Validate Discovery Prerequisite
  if (!brandState || !brandState.discovery || !brandState.discovery.isAnalyzed || !brandState.discovery.problem) {
    const errorMsg = "Discovery stage must be completed before Personality can run. Please complete Stage 01 first.";
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
    const errorMsg = "Positioning stage must be completed before Personality can run. Please complete Stage 02 first.";
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
        content: PERSONALITY_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildPersonalityUserPrompt(brandState.discovery, brandState.positioning),
      },
    ];

    // 4. Structured Generation & Zod Validation via LLMProvider
    const response = await provider.generateStructured<PersonalityOutput>(
      messages,
      PersonalityOutputSchema,
      {
        apiKey: input.apiKey,
        temperature: 0.3,
      }
    );

    const personalityOutput = response.data;
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    // 5. Update AgentRun Trace to Completed
    agentRun.status = "completed";
    agentRun.output = personalityOutput as unknown as Record<string, unknown>;
    agentRun.completedAt = completedAt;
    agentRun.durationMs = durationMs;

    // 6. Immutably update BrandState (Preserving rawIdea, discovery, & positioning)
    const updatedBrandState: BrandState = {
      ...brandState,
      projectId,
      version: (brandState.version || 1) + 1,
      updatedAt: completedAt,
      personality: {
        archetype: personalityOutput.archetype,
        archetypeRationale: personalityOutput.archetypeRationale,
        traits: personalityOutput.traits,
        behavioralCharacteristics: personalityOutput.behavioralCharacteristics,
        principles: personalityOutput.principles,
        emotionalTerritory: personalityOutput.emotionalTerritory,
        personalityDo: personalityOutput.personalityDo,
        personalityDont: personalityOutput.personalityDont,
        confidence: personalityOutput.confidence,
        isFormulated: true,
        formulatedAt: completedAt,
      },
    };

    // 7. Persist to Repository
    await persistAgentRun(agentRun);
    await persistBrandState(updatedBrandState);

    return {
      success: true,
      personalityOutput,
      updatedBrandState,
      agentRun,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Personality Agent execution failed";

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
