import { z } from "zod";

// ============================================================================
// WORKFLOW STAGES & STATUSES
// ============================================================================

export const WorkflowStageEnum = z.enum([
  "DISCOVER",
  "POSITION",
  "SHAPE",
  "VISUALIZE",
  "CHALLENGE",
  "CONSISTENCY",
  "DELIVER",
  "DELIVERY",
  "BRAND_KIT",
  "FINAL_BRAND_KIT",
]);

export type WorkflowStage = z.infer<typeof WorkflowStageEnum>;

export const WorkflowStatusEnum = z.enum([
  "waiting",
  "running",
  "completed",
  "failed",
]);

export type WorkflowStatus = z.infer<typeof WorkflowStatusEnum>;

export interface StageDefinition {
  stage: WorkflowStage;
  order: number;
  label: string;
  tagline: string;
  description: string;
  associatedAgents: string[];
}

export const WORKFLOW_STAGES: StageDefinition[] = [
  {
    stage: "DISCOVER",
    order: 1,
    label: "Discover",
    tagline: "Uncover the Core Intent",
    description: "Deconstructs the raw idea into problem, audience, needs, and constraints.",
    associatedAgents: ["Discovery Agent"],
  },
  {
    stage: "POSITION",
    order: 2,
    label: "Position",
    tagline: "Claim the Strategic Space",
    description: "Defines category, differentiator, value proposition, and competitive angle.",
    associatedAgents: ["Positioning Agent"],
  },
  {
    stage: "SHAPE",
    order: 3,
    label: "Shape",
    tagline: "Form the Identity & Voice",
    description: "Develops personality archetypes, candidate naming directions, and voice guidelines.",
    associatedAgents: ["Personality Agent", "Naming Agent", "Voice Agent"],
  },
  {
    stage: "VISUALIZE",
    order: 4,
    label: "Visualize",
    tagline: "Translate Soul into Form",
    description: "Establishes color palettes, typography pairings, imagery rules, and logo direction.",
    associatedAgents: ["Visual Agent"],
  },
  {
    stage: "CHALLENGE",
    order: 5,
    label: "Challenge",
    tagline: "Stress-Test Against Reality",
    description: "Adversarial critique hunting for generic clichés, contradictions, and audience mismatches.",
    associatedAgents: ["Critic Agent"],
  },
  {
    stage: "CONSISTENCY",
    order: 6,
    label: "Consistency",
    tagline: "Harmonize Every Dimension",
    description: "Calculates cross-stage alignment scores to ensure voice, visual, and strategy resonate as one.",
    associatedAgents: ["Consistency Agent"],
  },
  {
    stage: "DELIVER",
    order: 7,
    label: "Deliver",
    tagline: "Synthesize the Launch Brand Kit",
    description: "Compiles all validated brand assets, manifesto, guidelines, and launch checklists.",
    associatedAgents: ["Delivery Agent"],
  },
  {
    stage: "BRAND_KIT",
    order: 8,
    label: "Final Brand Kit",
    tagline: "The Authoritative Brand System",
    description: "Assembles the complete, validated brand system into one authoritative, presentation-ready kit.",
    associatedAgents: ["Brand Kit Builder"],
  },
];

export interface StageProgress {
  stage: WorkflowStage;
  status: WorkflowStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  notes?: string;
}

export interface WorkflowProgressState {
  currentStage: WorkflowStage;
  stages: Record<WorkflowStage, StageProgress>;
  isComplete: boolean;
  hasErrors: boolean;
}

/**
 * Initializes a clean WorkflowProgressState with all stages set to 'waiting'
 * except DISCOVER which is initialized to 'waiting'.
 */
export function createInitialWorkflowProgress(): WorkflowProgressState {
  const stages = {} as Record<WorkflowStage, StageProgress>;
  for (const def of WORKFLOW_STAGES) {
    stages[def.stage] = {
      stage: def.stage,
      status: "waiting",
    };
  }

  return {
    currentStage: "DISCOVER",
    stages,
    isComplete: false,
    hasErrors: false,
  };
}
