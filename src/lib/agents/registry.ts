import type {
  AgentDefinition,
  AgentName,
  AgentResult,
} from "@/types/agent";

/**
 * Creates a standard Phase 1 stub for an agent definition.
 * Strictly adheres to non-fabrication rules: no fake AI outputs are generated.
 */
function createAgentStub(
  name: AgentName,
  stage: AgentDefinition["stage"],
  description: string
): AgentDefinition {
  return {
    name,
    stage,
    description,
    execute: async (): Promise<AgentResult> => {
      // Phase 1 Architecture Stub: execution is deferred to Phase 2
      throw new Error(
        `Agent "${name}" execution is a Phase 1 stub. Implementation is scheduled for subsequent phases.`
      );
    },
  };
}

import { executeDiscoveryAgent } from "./discovery";

export const OrchestratorAgent = createAgentStub(
  "Orchestrator",
  "DISCOVER",
  "Coordinates workflow execution, manages stage transitions, handles critique-revision loops, and validates pipeline integrity."
);

export const DiscoveryAgent: AgentDefinition = {
  name: "Discovery",
  stage: "DISCOVER",
  description:
    "Deconstructs the raw startup/product idea into core problem statements, audience segments, user needs, and practical constraints.",
  execute: async (input, context): Promise<AgentResult> => {
    const rawIdea = (input.rawIdea as string) || context.currentBrandState.discovery.rawIdea;
    const result = await executeDiscoveryAgent(
      { rawIdea, projectId: context.projectId },
      context.currentBrandState
    );

    return {
      agentName: "Discovery",
      stage: "DISCOVER",
      success: result.success,
      output: (result.discoveryOutput as unknown as Record<string, unknown>) || {},
      updatedStatePartial: result.updatedBrandState || {},
      durationMs: result.agentRun.durationMs || 0,
      error: result.error,
    };
  },
};

import { executePositioningAgent } from "./positioning";
import { executePersonalityAgent } from "./personality";

export const PositioningAgent: AgentDefinition = {
  name: "Positioning",
  stage: "POSITION",
  description:
    "Establishes market category, unique differentiator, value proposition, and competitive whitespace based on validated Discovery output.",
  execute: async (input, context): Promise<AgentResult> => {
    const result = await executePositioningAgent(
      {
        projectId: context.projectId,
        apiKey: input.apiKey as string | undefined,
      },
      context.currentBrandState
    );

    return {
      agentName: "Positioning",
      stage: "POSITION",
      success: result.success,
      output: (result.positioningOutput as unknown as Record<string, unknown>) || {},
      updatedStatePartial: result.updatedBrandState || {},
      durationMs: result.agentRun.durationMs || 0,
      error: result.error,
    };
  },
};

export const PersonalityAgent: AgentDefinition = {
  name: "Personality",
  stage: "SHAPE",
  description:
    "Translates validated Discovery and Positioning strategy into brand archetype, behavioral traits, principles, and emotional territory.",
  execute: async (input, context): Promise<AgentResult> => {
    const result = await executePersonalityAgent(
      {
        projectId: context.projectId,
        apiKey: input.apiKey as string | undefined,
      },
      context.currentBrandState
    );

    return {
      agentName: "Personality",
      stage: "SHAPE",
      success: result.success,
      output: (result.personalityOutput as unknown as Record<string, unknown>) || {},
      updatedStatePartial: result.updatedBrandState || {},
      durationMs: result.agentRun.durationMs || 0,
      error: result.error,
    };
  },
};

import { executeNamingAgent } from "./naming";

export const NamingAgent: AgentDefinition = {
  name: "Naming",
  stage: "SHAPE",
  description:
    "Translates validated Discovery, Positioning, and Personality strategy into distinct naming territories, candidate names with linguistic and phonetic assessments, and taglines.",
  execute: async (input, context): Promise<AgentResult> => {
    const result = await executeNamingAgent(
      {
        projectId: context.projectId,
        apiKey: input.apiKey as string | undefined,
      },
      context.currentBrandState
    );

    return {
      agentName: "Naming",
      stage: "SHAPE",
      success: result.success,
      output: (result.namingOutput as unknown as Record<string, unknown>) || {},
      updatedStatePartial: result.updatedBrandState || {},
      durationMs: result.agentRun.durationMs || 0,
      error: result.error,
    };
  },
};

import { executeVoiceAgent } from "./voice";

export const VoiceAgent: AgentDefinition = {
  name: "Voice",
  stage: "SHAPE",
  description:
    "Translates validated Discovery, Positioning, Personality, and human-selected brand identity into an operational voice system, tone dimensions, vocabulary rules, messaging pillars, and copy examples.",
  execute: async (input, context): Promise<AgentResult> => {
    const result = await executeVoiceAgent(
      {
        projectId: context.projectId,
        apiKey: input.apiKey as string | undefined,
      },
      context.currentBrandState
    );

    return {
      agentName: "Voice",
      stage: "SHAPE",
      success: result.success,
      output: (result.voiceOutput as unknown as Record<string, unknown>) || {},
      updatedStatePartial: result.updatedBrandState || {},
      durationMs: result.agentRun?.durationMs || 0,
      error: result.error,
    };
  },
};

import { executeVisualAgent } from "./visual";

export const VisualAgent: AgentDefinition = {
  name: "Visual",
  stage: "VISUALIZE",
  description:
    "Translates validated strategy, personality, selected brand identity, and voice into an operational visual brand system: color palettes, typography pairings, imagery rules, logo concept, and layout principles.",
  execute: async (input, context): Promise<AgentResult> => {
    const result = await executeVisualAgent(
      {
        projectId: context.projectId,
        apiKey: input.apiKey as string | undefined,
      },
      context.currentBrandState
    );

    return {
      agentName: "Visual",
      stage: "VISUALIZE",
      success: result.success,
      output: (result.visualOutput as unknown as Record<string, unknown>) || {},
      updatedStatePartial: result.updatedBrandState || {},
      durationMs: result.agentRun?.durationMs || 0,
      error: result.error,
    };
  },
};

import { executeCriticAgent } from "./critic";

export const CriticAgent: AgentDefinition = {
  name: "Critic",
  stage: "CHALLENGE",
  description:
    "Performs rigorous diagnostic evaluation across the entire brand system: flags generic clichés, unmasks internal contradictions, detects audience mismatches, and tests positioning against reality.",
  execute: async (input, context): Promise<AgentResult> => {
    const result = await executeCriticAgent(
      {
        projectId: context.projectId,
        apiKey: input.apiKey as string | undefined,
      },
      context.currentBrandState
    );

    return {
      agentName: "Critic",
      stage: "CHALLENGE",
      success: result.success,
      output: (result.criticOutput as unknown as Record<string, unknown>) || {},
      updatedStatePartial: result.updatedBrandState || {},
      durationMs: result.agentRun?.durationMs || 0,
      error: result.error,
    };
  },
};

import { executeConsistencyAgent } from "./consistency";

export const ConsistencyAgent: AgentDefinition = {
  name: "Consistency",
  stage: "CONSISTENCY",
  description:
    "Evaluates cross-stage systemic cohesion (strategy vs. personality vs. voice vs. visual vs. messaging) and identifies structural alignment friction.",
  execute: async (input, context): Promise<AgentResult> => {
    const result = await executeConsistencyAgent(
      {
        projectId: context.projectId,
        apiKey: input.apiKey as string | undefined,
      },
      context.currentBrandState
    );

    return {
      agentName: "Consistency",
      stage: "CONSISTENCY",
      success: result.success,
      output: (result.consistencyOutput as unknown as Record<string, unknown>) || {},
      updatedStatePartial: result.updatedBrandState || {},
      durationMs: result.agentRun?.durationMs || 0,
      error: result.error,
    };
  },
};

import { executeDeliveryAgent } from "./delivery";
import { assembleFinalBrandKit } from "@/lib/brand-kit/final-brand-kit";

export const DeliveryAgent: AgentDefinition = {
  name: "Delivery",
  stage: "DELIVERY",
  description:
    "Transforms the validated, consistent brand system into operationalized brand guidance, messaging, voice, visual specifications, and launch deliverables.",
  execute: async (input, context): Promise<AgentResult> => {
    const result = await executeDeliveryAgent(
      {
        projectId: context.projectId,
        apiKey: input.apiKey as string | undefined,
      },
      context.currentBrandState
    );

    return {
      agentName: "Delivery",
      stage: "DELIVERY",
      success: result.success,
      output: (result.deliveryOutput as unknown as Record<string, unknown>) || {},
      updatedStatePartial: result.updatedBrandState || {},
      durationMs: result.agentRun?.durationMs || 0,
      error: result.error,
    };
  },
};

export const BrandKitAgent: AgentDefinition = {
  name: "BrandKit",
  stage: "BRAND_KIT",
  description:
    "Assembles the complete, validated PinkLoom brand system into one authoritative, presentation-ready Final Brand Kit.",
  execute: async (_input, context): Promise<AgentResult> => {
    const result = await assembleFinalBrandKit(
      context.currentBrandState,
      {
        projectId: context.projectId,
        persist: true,
      }
    );

    return {
      agentName: "BrandKit",
      stage: "BRAND_KIT",
      success: result.success,
      output: (result.finalBrandKit as unknown as Record<string, unknown>) || {},
      updatedStatePartial: result.updatedBrandState || {},
      durationMs: result.agentRun?.durationMs || 0,
      error: result.error,
    };
  },
};

export const AGENT_REGISTRY: Record<AgentName, AgentDefinition> = {
  Orchestrator: OrchestratorAgent,
  Discovery: DiscoveryAgent,
  Positioning: PositioningAgent,
  Personality: PersonalityAgent,
  Naming: NamingAgent,
  Voice: VoiceAgent,
  Visual: VisualAgent,
  Critic: CriticAgent,
  Consistency: ConsistencyAgent,
  Delivery: DeliveryAgent,
  BrandKit: BrandKitAgent,
};

export function getAgent(name: AgentName): AgentDefinition {
  const agent = AGENT_REGISTRY[name];
  if (!agent) {
    throw new Error(`Agent "${name}" not found in registry.`);
  }
  return agent;
}

export function getAllAgents(): AgentDefinition[] {
  return Object.values(AGENT_REGISTRY);
}
