function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "run-" + Math.random().toString(36).substring(2, 15);
}
import type { AgentRun } from "@/types/agent";
import {
  type BrandState,
  type DiscoveryOutput,
  DiscoveryOutputSchema,
} from "@/types/brand";
import { getAIProvider } from "@/lib/ai/provider";
import type { LLMMessage, LLMProvider } from "@/lib/ai/types";
import {
  DISCOVERY_SYSTEM_PROMPT,
  buildDiscoveryUserPrompt,
} from "./prompts/discovery";

export interface DiscoveryExecutionInput {
  rawIdea: string;
  projectId?: string;
  apiKey?: string;
}

export interface DiscoveryExecutionResult {
  success: boolean;
  discoveryOutput?: DiscoveryOutput;
  updatedBrandState?: BrandState;
  agentRun: AgentRun;
  error?: string;
}

/**
 * Runs the Discovery Agent workflow on a raw user idea:
 * 1. Initializes AgentRun with status = 'running'
 * 2. Invokes the provider-independent LLMProvider with structured output schema
 * 3. Validates output via Zod
 * 4. Merges into BrandState without overwriting unrelated fields
 * 5. Updates AgentRun to 'completed' (or 'failed' on error)
 */
export async function executeDiscoveryAgent(
  input: DiscoveryExecutionInput,
  currentState?: BrandState,
  customProvider?: LLMProvider
): Promise<DiscoveryExecutionResult> {
  const startTime = Date.now();
  const runId = generateUUID();
  const projectId = input.projectId || currentState?.projectId || generateUUID();
  const rawIdea = input.rawIdea.trim();

  // 1. Initialize Agent Run Trace
  const agentRun: AgentRun = {
    id: runId,
    projectId,
    agentName: "Discovery",
    stage: "DISCOVER",
    input: { rawIdea },
    output: null,
    status: "running",
    createdAt: new Date().toISOString(),
  };

  if (!rawIdea || rawIdea.length < 5) {
    const errorMsg = "The raw idea is too brief. Please enter at least a few words describing what you want to build.";
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
        content: DISCOVERY_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildDiscoveryUserPrompt(rawIdea),
      },
    ];

    // 2. Execute Structured Generation with Zod Validation
    const response = await provider.generateStructured<DiscoveryOutput>(
      messages,
      DiscoveryOutputSchema,
      {
        temperature: 0.2,
        apiKey: input.apiKey,
      }
    );

    const discoveryOutput = response.data;
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    // 3. Update Agent Run Trace to Completed
    agentRun.status = "completed";
    agentRun.output = discoveryOutput as unknown as Record<string, unknown>;
    agentRun.completedAt = completedAt;
    agentRun.durationMs = durationMs;

    // 4. Immutably update BrandState
    const baseState: BrandState = currentState || {
      projectId,
      version: 1,
      createdAt: completedAt,
      updatedAt: completedAt,
      discovery: {
        rawIdea,
        problem: "",
        targetAudience: { primary: "", secondary: [], characteristics: [], painPoints: [], motivations: [] },
        userNeeds: [],
        constraints: [],
        assumptions: [],
        missingInformation: [],
        clarifyingQuestions: [],
        isAnalyzed: false,
      },
      positioning: {
        category: "",
        positioning: "",
        differentiator: "",
        valueProposition: "",
        marketAngle: "",
        competitiveContrast: "",
      },
      personality: { archetype: "", traits: [], principles: [], emotionalHook: "" },
      naming: { namingDirections: [], selectedName: null, tagline: null, taglineOptions: [] },
      voice: { toneAttributes: [], voiceGuidelines: [], messaging: { oneLiner: "", elevatorPitch: "", pillars: [] } },
      visualDirection: {
        overallAesthetic: "",
        colors: [],
        typography: { headingFont: "Instrument Serif", bodyFont: "Inter", pairingRationale: "" },
        imagery: { style: "", moodKeywords: [], visualMetaphors: [], lightingAndTexture: "" },
        logoDirection: { concept: "", symbolism: "", formLanguage: "", compositionNotes: "" },
      },
      critique: { summary: "", critiques: [], genericLanguageDetected: [], strengths: [], vulnerabilities: [] },
      consistency: { overallCoherenceScore: 0, alignments: [], crossStageConflicts: [], finalRecommendation: "" },
      finalBrandKit: null,
    };

    const updatedBrandState: BrandState = {
      ...baseState,
      updatedAt: completedAt,
      version: baseState.version + 1,
      discovery: {
        ...baseState.discovery,
        rawIdea, // explicitly preserve rawIdea
        problem: discoveryOutput.problem,
        targetAudience: {
          primary: discoveryOutput.targetAudience.primary,
          secondary: discoveryOutput.targetAudience.secondary || [],
          characteristics: discoveryOutput.targetAudience.characteristics || [],
          painPoints: discoveryOutput.targetAudience.painPoints || [],
          motivations: discoveryOutput.targetAudience.motivations || [],
        },
        userNeeds: discoveryOutput.userNeeds,
        constraints: discoveryOutput.constraints || [],
        assumptions: discoveryOutput.assumptions || [],
        missingInformation: discoveryOutput.missingInformation || [],
        clarifyingQuestions: discoveryOutput.clarifyingQuestions || [],
        isAnalyzed: true,
        analyzedAt: completedAt,
      },
    };

    return {
      success: true,
      discoveryOutput,
      updatedBrandState,
      agentRun,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Discovery Agent execution failed";
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
