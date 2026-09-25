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

export const OrchestratorAgent = createAgentStub(
  "Orchestrator",
  "DISCOVER",
  "Coordinates workflow execution, manages stage transitions, handles critique-revision loops, and validates pipeline integrity."
);

export const DiscoveryAgent = createAgentStub(
  "Discovery",
  "DISCOVER",
  "Deconstructs the raw startup/product idea into core problem statements, audience segments, user needs, and practical constraints."
);

export const PositioningAgent = createAgentStub(
  "Positioning",
  "POSITION",
  "Establishes market category, unique differentiator, value proposition, and competitive contrast."
);

export const PersonalityAgent = createAgentStub(
  "Personality",
  "SHAPE",
  "Architects brand archetype, behavioral traits, core operating principles, and emotional resonance."
);

export const NamingAgent = createAgentStub(
  "Naming",
  "SHAPE",
  "Generates distinct naming directions, candidate names with linguistic rationales, and candidate taglines."
);

export const VoiceAgent = createAgentStub(
  "Voice",
  "SHAPE",
  "Formulates voice guidelines, tone-of-voice do's and don'ts, elevator pitch, and foundational messaging pillars."
);

export const VisualAgent = createAgentStub(
  "Visual",
  "VISUALIZE",
  "Translates conceptual brand soul into visual identity: color palettes, typography pairings, imagery rules, and logo direction."
);

export const CriticAgent = createAgentStub(
  "Critic",
  "CHALLENGE",
  "Performs rigorous adversarial critique: flags generic clichés, unmasks internal contradictions, and tests positioning against reality."
);

export const ConsistencyAgent = createAgentStub(
  "Consistency",
  "CONSISTENCY",
  "Evaluates cross-stage systemic cohesion (strategy vs. voice vs. visual) and calculates brand harmony scores."
);

export const DeliveryAgent = createAgentStub(
  "Delivery",
  "DELIVER",
  "Synthesizes the validated brand assets into a production-ready Brand Kit, manifesto, and launch deliverables."
);

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
