import type { AgentRun } from "@/types/agent";
import {
  type BrandState,
  type PositioningOutput,
  PositioningOutputSchema,
} from "@/types/brand";
import { getAIProvider } from "@/lib/ai/provider";
import type { LLMMessage, LLMProvider } from "@/lib/ai/types";
import {
  POSITIONING_SYSTEM_PROMPT,
  buildPositioningUserPrompt,
} from "./prompts/positioning";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "run-" + Math.random().toString(36).substring(2, 15);
}

export interface PositioningExecutionInput {
  projectId?: string;
  apiKey?: string;
}

export interface PositioningExecutionResult {
  success: boolean;
  positioningOutput?: PositioningOutput;
  updatedBrandState?: BrandState;
  agentRun: AgentRun;
  error?: string;
}

/**
 * Runs the Positioning Agent workflow:
 * 1. Validates that Discovery output exists and is analyzed
 * 2. Initializes AgentRun with status = 'running'
 * 3. Consumes BrandState.discovery as the primary context
 * 4. Invokes LLMProvider with PositioningOutputSchema
 * 5. Validates output via Zod
 * 6. Immutably updates BrandState.positioning (preserving rawIdea and discovery)
 * 7. Updates AgentRun to 'completed' (or 'failed' on error)
 */
export async function executePositioningAgent(
  input: PositioningExecutionInput,
  brandState?: BrandState,
  customProvider?: LLMProvider
): Promise<PositioningExecutionResult> {
  const startTime = Date.now();
  const runId = generateUUID();
  const projectId = input.projectId || brandState?.projectId || generateUUID();

  // 1. Initialize Agent Run Trace
  const agentRun: AgentRun = {
    id: runId,
    projectId,
    agentName: "Positioning",
    stage: "POSITION",
    input: {
      discoverySummary: brandState?.discovery
        ? {
            problem: brandState.discovery.problem,
            primaryAudience: brandState.discovery.targetAudience.primary,
            userNeedsCount: brandState.discovery.userNeeds.length,
          }
        : null,
    },
    output: null,
    status: "running",
    createdAt: new Date().toISOString(),
  };

  // 2. Enforce Strict Stage Dependency: Discovery MUST be complete
  if (!brandState || !brandState.discovery || !brandState.discovery.isAnalyzed || !brandState.discovery.problem) {
    const errorMsg = "Discovery stage must be completed before Positioning can run. Please complete Stage 01 first.";
    agentRun.status = "failed";
    agentRun.error = errorMsg;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;
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
        content: POSITIONING_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildPositioningUserPrompt(brandState.discovery),
      },
    ];

    // 3. Execute Structured Generation with Zod Validation
    const response = await provider.generateStructured<PositioningOutput>(
      messages,
      PositioningOutputSchema,
      {
        temperature: 0.2,
        apiKey: input.apiKey,
      }
    );

    const positioningOutput = response.data;
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    // 4. Update Agent Run Trace to Completed
    agentRun.status = "completed";
    agentRun.output = positioningOutput as unknown as Record<string, unknown>;
    agentRun.completedAt = completedAt;
    agentRun.durationMs = durationMs;

    // 5. Immutably update BrandState (preserving discovery & rawIdea)
    const updatedBrandState: BrandState = {
      ...brandState,
      updatedAt: completedAt,
      version: brandState.version + 1,
      positioning: {
        category: positioningOutput.category,
        categoryRationale: positioningOutput.categoryRationale,
        positioningStatement: positioningOutput.positioningStatement,
        differentiator: positioningOutput.differentiator,
        valueProposition: positioningOutput.valueProposition,
        competitiveWhitespace: positioningOutput.competitiveWhitespace,
        alternatives: positioningOutput.alternatives || [],
        proofPoints: positioningOutput.proofPoints || [],
        risks: positioningOutput.risks || [],
        confidence: positioningOutput.confidence,
        isPositioned: true,
        positionedAt: completedAt,
      },
    };

    return {
      success: true,
      positioningOutput,
      updatedBrandState,
      agentRun,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Positioning Agent execution failed";
    agentRun.status = "failed";
    agentRun.error = errorMsg;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;

    return {
      success: false,
      agentRun,
      error: errorMsg,
    };
  }
}
