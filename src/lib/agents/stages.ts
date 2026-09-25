import type { WorkflowStage } from "@/types/workflow";
import type { BrandState } from "@/types/brand";
import type { AgentName } from "@/types/agent";

export interface StageConfig {
  stage: WorkflowStage;
  label: string;
  order: number;
  primaryAgent: AgentName;
  supportingAgents: AgentName[];
  canRun: (state: BrandState) => { allowed: boolean; reason?: string };
}

export const STAGE_CONFIGS: Record<WorkflowStage, StageConfig> = {
  DISCOVER: {
    stage: "DISCOVER",
    label: "Discovery",
    order: 1,
    primaryAgent: "Discovery",
    supportingAgents: ["Orchestrator"],
    canRun: (state) => {
      if (!state.discovery.rawIdea || state.discovery.rawIdea.trim().length === 0) {
        return { allowed: false, reason: "A raw idea is required to begin Discovery." };
      }
      return { allowed: true };
    },
  },
  POSITION: {
    stage: "POSITION",
    label: "Positioning",
    order: 2,
    primaryAgent: "Positioning",
    supportingAgents: [],
    canRun: (state) => {
      if (!state.discovery.problem || !state.discovery.targetAudience.primary) {
        return { allowed: false, reason: "Discovery stage must identify problem and target audience first." };
      }
      return { allowed: true };
    },
  },
  SHAPE: {
    stage: "SHAPE",
    label: "Shape",
    order: 3,
    primaryAgent: "Personality",
    supportingAgents: ["Naming", "Voice"],
    canRun: (state) => {
      if (!state.positioning.positioning || !state.positioning.category) {
        return { allowed: false, reason: "Positioning stage must establish category and positioning first." };
      }
      return { allowed: true };
    },
  },
  VISUALIZE: {
    stage: "VISUALIZE",
    label: "Visualize",
    order: 4,
    primaryAgent: "Visual",
    supportingAgents: [],
    canRun: (state) => {
      if (!state.personality.archetype && state.personality.traits.length === 0) {
        return { allowed: false, reason: "Personality and tone traits must be shaped before visualization." };
      }
      return { allowed: true };
    },
  },
  CHALLENGE: {
    stage: "CHALLENGE",
    label: "Challenge",
    order: 5,
    primaryAgent: "Critic",
    supportingAgents: [],
    canRun: (state) => {
      if (state.visualDirection.colors.length === 0 || !state.voice.messaging.oneLiner) {
        return { allowed: false, reason: "Requires visual direction and voice messaging before critique." };
      }
      return { allowed: true };
    },
  },
  CONSISTENCY: {
    stage: "CONSISTENCY",
    label: "Consistency",
    order: 6,
    primaryAgent: "Consistency",
    supportingAgents: ["Critic"],
    canRun: (state) => {
      if (state.critique.critiques.length === 0) {
        return { allowed: false, reason: "Critique stage must run before consistency verification." };
      }
      return { allowed: true };
    },
  },
  DELIVER: {
    stage: "DELIVER",
    label: "Deliver",
    order: 7,
    primaryAgent: "Delivery",
    supportingAgents: ["Orchestrator"],
    canRun: (state) => {
      if (state.consistency.overallCoherenceScore < 60 && state.consistency.overallCoherenceScore !== 0) {
        return { allowed: false, reason: "Consistency score is below required threshold for final kit delivery." };
      }
      return { allowed: true };
    },
  },
};

export const ORDERED_STAGES: WorkflowStage[] = [
  "DISCOVER",
  "POSITION",
  "SHAPE",
  "VISUALIZE",
  "CHALLENGE",
  "CONSISTENCY",
  "DELIVER",
];

export function getNextStage(current: WorkflowStage): WorkflowStage | null {
  const index = ORDERED_STAGES.indexOf(current);
  if (index >= 0 && index < ORDERED_STAGES.length - 1) {
    return ORDERED_STAGES[index + 1];
  }
  return null;
}
