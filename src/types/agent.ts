import { z } from "zod";
import { WorkflowStageEnum, type WorkflowStage } from "./workflow";
import type { BrandState } from "./brand";

// ============================================================================
// AGENT IDENTIFIERS & ROLES
// ============================================================================

export const AgentNameEnum = z.enum([
  "Orchestrator",
  "Discovery",
  "Positioning",
  "Personality",
  "Naming",
  "Voice",
  "Visual",
  "Critic",
  "Consistency",
  "Delivery",
]);

export type AgentName = z.infer<typeof AgentNameEnum>;

// ============================================================================
// AGENT RUN TRACE MODEL
// ============================================================================

export const AgentRunStatusEnum = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
]);

export type AgentRunStatus = z.infer<typeof AgentRunStatusEnum>;

export const AgentRunSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string(),
  agentName: AgentNameEnum,
  stage: WorkflowStageEnum,
  input: z.record(z.string(), z.unknown()),
  output: z.record(z.string(), z.unknown()).nullable(),
  status: AgentRunStatusEnum,
  createdAt: z.string(),
  completedAt: z.string().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  error: z.string().optional(),
  critiqueNotes: z.array(z.string()).optional(),
});

export type AgentRun = z.infer<typeof AgentRunSchema>;

// ============================================================================
// AGENT CONTRACT INTERFACES (Stubs for future execution)
// ============================================================================

export interface AgentContext {
  projectId: string;
  stage: WorkflowStage;
  currentBrandState: Readonly<BrandState>;
  agentRunId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResult<TOutput = Record<string, unknown>> {
  agentName: AgentName;
  stage: WorkflowStage;
  success: boolean;
  output: TOutput;
  updatedStatePartial: Partial<BrandState>;
  critiqueNotes?: string[];
  durationMs: number;
  error?: string;
}

/**
 * Base contract for an agent node in the workflow.
 * Implementations in Phase 2 will execute via LangGraph or modular pipelines.
 */
export interface AgentDefinition<TInput = Record<string, unknown>, TOutput = Record<string, unknown>> {
  readonly name: AgentName;
  readonly stage: WorkflowStage;
  readonly description: string;
  readonly systemPromptTemplate?: string;
  execute(input: TInput, context: AgentContext): Promise<AgentResult<TOutput>>;
}
