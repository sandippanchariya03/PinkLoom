import type { AgentRun } from "@/types/agent";
import {
  type BrandState,
  type NamingOutput,
  NamingOutputSchema,
} from "@/types/brand";
import { getAIProvider } from "@/lib/ai/provider";
import type { LLMMessage, LLMProvider } from "@/lib/ai/types";
import {
  persistBrandState,
  persistAgentRun,
} from "@/lib/db/repository";
import {
  NAMING_SYSTEM_PROMPT,
  buildNamingUserPrompt,
} from "./prompts/naming";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "run-" + Math.random().toString(36).substring(2, 15);
}

export interface NamingExecutionInput {
  projectId?: string;
  apiKey?: string;
}

export interface NamingExecutionResult {
  success: boolean;
  namingOutput?: NamingOutput;
  updatedBrandState?: BrandState;
  agentRun: AgentRun;
  error?: string;
}

/**
 * Runs the Naming Agent workflow:
 * 1. Validates strict stage prerequisites:
 *    - Stage 01 (Discovery) must be completed (isAnalyzed === true)
 *    - Stage 02 (Positioning) must be completed (isPositioned === true)
 *    - Stage 03 (Personality) must be completed (isFormulated === true)
 * 2. Initializes AgentRun with stage = "SHAPE", agentName = "Naming", status = "running"
 * 3. Consumes validated Discovery, Positioning, and Personality contexts (does NOT work from rawIdea alone)
 * 4. Invokes LLMProvider with NamingOutputSchema
 * 5. Validates structured output via Zod
 * 6. Immutably updates BrandState.naming.directions without selecting a winner (human selection is mandatory)
 * 7. Leaves selectedName = null and isSelected = false
 * 8. Increments BrandState.version and marks naming.isGenerated = true
 * 9. Persists updated BrandState and AgentRun
 * 10. Handles provider failures, missing keys, and invalid outputs gracefully
 */
export async function executeNamingAgent(
  input: NamingExecutionInput,
  brandState?: BrandState,
  customProvider?: LLMProvider
): Promise<NamingExecutionResult> {
  const startTime = Date.now();
  const runId = generateUUID();
  const projectId = input.projectId || brandState?.projectId || generateUUID();

  // 1. Initialize Agent Run Trace
  const agentRun: AgentRun = {
    id: runId,
    projectId,
    agentName: "Naming",
    stage: "SHAPE",
    input: {
      discoverySummary: brandState?.discovery
        ? {
            problem: brandState.discovery.problem,
            primaryAudience: brandState.discovery.targetAudience.primary,
            userNeeds: brandState.discovery.userNeeds,
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
    const errorMsg = "Discovery stage must be completed before Naming can run. Please complete Stage 01 first.";
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
    const errorMsg = "Positioning stage must be completed before Naming can run. Please complete Stage 02 first.";
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
    const errorMsg = "Personality stage must be completed before Naming can run. Please complete Stage 03 Personality first.";
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
        content: NAMING_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildNamingUserPrompt(
          brandState.discovery,
          brandState.positioning,
          brandState.personality
        ),
      },
    ];

    // 5. Structured Generation & Zod Validation via LLMProvider
    const response = await provider.generateStructured<NamingOutput>(
      messages,
      NamingOutputSchema,
      {
        apiKey: input.apiKey,
        temperature: 0.6,
        maxTokens: 3500,
      }
    );

    const namingOutput = response.data;
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    // 6. Update AgentRun Trace to Completed
    agentRun.status = "completed";
    agentRun.output = namingOutput as unknown as Record<string, unknown>;
    agentRun.completedAt = completedAt;
    agentRun.durationMs = durationMs;

    // 7. Immutably update BrandState (Preserving rawIdea, discovery, positioning, & personality)
    // Note: NEVER automatically select a candidate; human selection is mandatory.
    const updatedBrandState: BrandState = {
      ...brandState,
      projectId,
      version: (brandState.version || 1) + 1,
      updatedAt: completedAt,
      naming: {
        directions: namingOutput.directions,
        selectedDirectionId: null,
        selectedName: null,
        selectedTagline: null,
        isGenerated: true,
        isSelected: false,
        generatedAt: completedAt,
        selectedAt: undefined,
      },
    };

    // 8. Persist to Repository
    await persistAgentRun(agentRun);
    await persistBrandState(updatedBrandState);

    return {
      success: true,
      namingOutput,
      updatedBrandState,
      agentRun,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Naming Agent execution failed";

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
