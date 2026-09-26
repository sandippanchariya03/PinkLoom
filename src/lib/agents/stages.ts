import type { WorkflowStage } from "@/types/workflow";
import type { BrandState } from "@/types/brand";
import type { AgentName } from "@/types/agent";
import { canRunFinalBrandKit } from "@/lib/brand-kit/final-brand-kit";

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
      if (!state.discovery.isAnalyzed || !state.discovery.problem || !state.discovery.targetAudience.primary) {
        return { allowed: false, reason: "Discovery stage must be completed before Positioning can run." };
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
      if (!state.discovery.isAnalyzed || !state.discovery.problem) {
        return { allowed: false, reason: "Discovery stage must be completed before Personality can run." };
      }
      if (!state.positioning.isPositioned || !state.positioning.positioningStatement || !state.positioning.category) {
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
      if (!state.discovery?.isAnalyzed || !state.discovery?.problem) {
        return { allowed: false, reason: "Discovery stage must be completed before Visual Direction can run." };
      }
      if (!state.positioning?.isPositioned || !state.positioning?.category) {
        return { allowed: false, reason: "Positioning stage must be completed before Visual Direction can run." };
      }
      if (!state.personality?.isFormulated || !state.personality?.archetype) {
        return { allowed: false, reason: "Personality stage must be completed before Visual Direction can run." };
      }
      if (!state.naming?.isSelected || !state.naming?.selectedName) {
        return { allowed: false, reason: "An authoritative brand name must be selected in Naming before Visual Direction can run." };
      }
      if (!state.voice?.isGenerated) {
        return { allowed: false, reason: "Voice strategy must be established before visual identity can be generated." };
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
      const visualPrereq = canRunVisual(state);
      if (!visualPrereq.allowed) {
        return visualPrereq;
      }
      if (!state.visualDirection?.isGenerated || state.visualDirection.colorSystem.primary.length === 0) {
        return { allowed: false, reason: "Visual Direction must be completed before systemic brand critique can run." };
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
    canRun: (state) => canRunConsistency(state),
  },
  DELIVER: {
    stage: "DELIVER",
    label: "Deliver",
    order: 7,
    primaryAgent: "Delivery",
    supportingAgents: ["Orchestrator"],
    canRun: (state) => canRunDelivery(state),
  },
  DELIVERY: {
    stage: "DELIVERY",
    label: "Deliver",
    order: 7,
    primaryAgent: "Delivery",
    supportingAgents: ["Orchestrator"],
    canRun: (state) => canRunDelivery(state),
  },
  BRAND_KIT: {
    stage: "BRAND_KIT",
    label: "Final Brand Kit",
    order: 8,
    primaryAgent: "BrandKit",
    supportingAgents: [],
    canRun: (state) => canRunFinalBrandKit(state),
  },
  FINAL_BRAND_KIT: {
    stage: "FINAL_BRAND_KIT",
    label: "Final Brand Kit",
    order: 8,
    primaryAgent: "BrandKit",
    supportingAgents: [],
    canRun: (state) => canRunFinalBrandKit(state),
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
  "BRAND_KIT",
];

export function getNextStage(current: WorkflowStage): WorkflowStage | null {
  const index = ORDERED_STAGES.indexOf(current);
  if (index >= 0 && index < ORDERED_STAGES.length - 1) {
    return ORDERED_STAGES[index + 1];
  }
  return null;
}

export { canRunFinalBrandKit } from "@/lib/brand-kit/final-brand-kit";

/**
 * Verifies whether the Naming Agent can run based on prerequisite BrandState.
 * Requires:
 * 1. Discovery completed (isAnalyzed === true)
 * 2. Positioning completed (isPositioned === true)
 * 3. Personality completed (isFormulated === true)
 */
export function canRunNaming(state: BrandState): { allowed: boolean; reason?: string } {
  if (!state?.discovery?.isAnalyzed || !state?.discovery?.problem) {
    return { allowed: false, reason: "Discovery stage must be completed before Naming can run." };
  }
  if (!state?.positioning?.isPositioned || !state?.positioning?.category) {
    return { allowed: false, reason: "Positioning stage must be completed before Naming can run." };
  }
  if (!state?.personality?.isFormulated || !state?.personality?.archetype) {
    return { allowed: false, reason: "Personality stage must be completed before Naming can run." };
  }
  return { allowed: true };
}

/**
 * Checks whether Voice stage can be unlocked.
 * Voice remains strictly locked until a brand name has been explicitly human-selected.
 */
export function canRunVoice(state: BrandState): { allowed: boolean; reason?: string } {
  const namingPrereq = canRunNaming(state);
  if (!namingPrereq.allowed) {
    return namingPrereq;
  }
  if (!state.naming?.isGenerated) {
    return { allowed: false, reason: "Naming territories must be generated first." };
  }
  if (!state.naming?.isSelected || !state.naming?.selectedName) {
    return { allowed: false, reason: "Select a name to continue to Voice." };
  }
  return { allowed: true };
}

/**
 * Checks whether Visual Direction stage can be unlocked.
 * Visual Direction remains strictly locked until Discovery, Positioning,
 * Personality, human-selected Name, and Voice guidelines are all completed.
 */
export function canRunVisual(state: BrandState): { allowed: boolean; reason?: string } {
  const voicePrereq = canRunVoice(state);
  if (!voicePrereq.allowed) {
    return voicePrereq;
  }
  if (!state.voice?.isGenerated || !state.voice?.toneProfile?.primary) {
    return { allowed: false, reason: "Voice guidelines must be generated before visual identity can run." };
  }
  return { allowed: true };
}

/**
 * Checks whether Critic / Challenge stage can be unlocked.
 * Critic remains strictly locked until Discovery, Positioning,
 * Personality, human-selected Name, Voice, and Visual Direction are all completed.
 */
export function canRunCritic(state: BrandState): { allowed: boolean; reason?: string } {
  const visualPrereq = canRunVisual(state);
  if (!visualPrereq.allowed) {
    return visualPrereq;
  }
  if (!state.visualDirection?.isGenerated || state.visualDirection.colorSystem.primary.length === 0) {
    return { allowed: false, reason: "Visual Direction must be completed before systemic brand critique can run." };
  }
  return { allowed: true };
}

/**
 * Checks whether Consistency stage can be unlocked.
 * Consistency requires complete upstream foundational layers: Discovery, Positioning,
 * Personality, human-selected Name, Voice guidelines, and Visual Direction.
 * Critique is consumed as rich diagnostic context when available.
 */
export function canRunConsistency(state: BrandState): { allowed: boolean; reason?: string } {
  const criticPrereq = canRunCritic(state);
  if (!criticPrereq.allowed) {
    return criticPrereq;
  }
  return { allowed: true };
}

/**
 * Checks whether Delivery stage can be unlocked.
 * Delivery requires complete upstream foundational layers: Discovery, Positioning,
 * Personality, human-selected Name, Voice guidelines, Visual Direction, and
 * Consistency evaluated.
 * Critique is consumed as rich diagnostic context when available.
 */
export function canRunDelivery(state: BrandState): { allowed: boolean; reason?: string } {
  const consistencyPrereq = canRunConsistency(state);
  if (!consistencyPrereq.allowed) {
    return consistencyPrereq;
  }
  if (!state.consistency || !state.consistency.isEvaluated) {
    return {
      allowed: false,
      reason: "Consistency stage must be evaluated before Delivery can run. Please evaluate consistency in Stage 08 first.",
    };
  }
  return { allowed: true };
}



