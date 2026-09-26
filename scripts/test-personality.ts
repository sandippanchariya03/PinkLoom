/**
 * Personality Engine Test Suite (Phase 4A)
 * Fully covers all 17 required Phase 4A validation criteria:
 * 1. Valid Personality schema
 * 2. Invalid Personality schema rejection
 * 3. Missing Discovery rejection
 * 4. Missing Positioning rejection
 * 5. Successful execution with valid Discovery + Positioning
 * 6. Verifies Personality consumes Positioning context
 * 7. Preserves rawIdea
 * 8. Preserves Discovery
 * 9. Preserves Positioning
 * 10. Increments BrandState.version
 * 11. AgentRun status completed
 * 12. AgentRun stage SHAPE
 * 13. AgentRun agentName Personality
 * 14. durationMs recorded
 * 15. Provider failure handling
 * 16. Missing API key handling
 * 17. Malformed / invalid model output handling
 */

import {
  PersonalityOutputSchema,
  type PersonalityOutput,
  type BrandState,
  createInitialBrandState,
} from "../src/types/brand";
import { executePersonalityAgent } from "../src/lib/agents/personality";
import type { LLMMessage, LLMProvider, LLMResponse, StructuredLLMResponse } from "../src/lib/ai/types";
import { z } from "zod";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean | undefined | null, testName: string, detail?: string) {
  totalTests++;
  if (Boolean(condition)) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

// Mock provider for deterministic personality testing
class TestMockPersonalityProvider implements LLMProvider {
  readonly providerName = "test-mock-personality";
  private mockOutput: unknown;
  private shouldFail: boolean;
  public capturedMessages: LLMMessage[] = [];

  constructor(mockOutput?: unknown, shouldFail = false) {
    this.mockOutput = mockOutput;
    this.shouldFail = shouldFail;
  }

  async generateText(): Promise<LLMResponse> {
    if (this.shouldFail) throw new Error("Upstream model connection timeout (504)");
    return { text: "mock text", finishReason: "stop" };
  }

  async generateStructured<T>(
    messages: LLMMessage[],
    schema: z.ZodType<T>
  ): Promise<StructuredLLMResponse<T>> {
    this.capturedMessages = messages;
    if (this.shouldFail) throw new Error("Upstream model connection timeout (504)");

    const validated = schema.safeParse(this.mockOutput);
    if (!validated.success) {
      throw new Error(`Mock validation failed: ${validated.error.message}`);
    }
    return {
      data: validated.data,
      raw: { text: JSON.stringify(this.mockOutput), finishReason: "stop" },
      validationSuccess: true,
    };
  }
}

const mockValidPersonality: PersonalityOutput = {
  archetype: "The Compassionate Vanguard",
  archetypeRationale: "Directly bridges the emotional isolation felt by founders with uncompromising technical excellence.",
  traits: [
    "Unflinchingly Honest",
    "Deeply Empathetic",
    "Relentlessly Pragmatic",
    "Calm Under Fire",
  ],
  behavioralCharacteristics: [
    "Speaks in plainspoken, grounded prose without consulting jargon",
    "Admits technical constraints openly before discussing possibilities",
  ],
  principles: [
    {
      title: "Radical Transparency",
      description: "Always speak the unvarnished truth about trade-offs and technical limitations.",
    },
    {
      title: "Human Dignity First",
      description: "Prioritize user well-being and long-term autonomy over addictive engagement loops.",
    },
  ],
  emotionalTerritory: "The reassuring certainty of having a brilliant, trusted partner standing in your corner.",
  personalityDo: [
    "State concrete facts and trade-offs before prescribing actions",
    "Emphasize user agency and structural clarity",
  ],
  personalityDont: [
    "Never indulge in techno-evangelism or unsupported hype",
    "Never patronize founders with vague cheerleading",
  ],
  confidence: 92,
};

async function runPersonalityTestSuite() {
  console.log("\n==================================================");
  console.log("PinkLoom Phase 4A — Personality Engine Test Suite");
  console.log("==================================================");

  // ----------------------------------------------------
  // TEST 1: Valid Personality Schema
  // ----------------------------------------------------
  console.log("\nTest 1: Valid Personality Output Schema Validation");
  const validParsed = PersonalityOutputSchema.safeParse(mockValidPersonality);
  assert(validParsed.success, "1. Valid Personality schema");
  if (validParsed.success) {
    assert(validParsed.data.archetype === "The Compassionate Vanguard", "Archetype correctly parsed");
    assert(validParsed.data.traits.length >= 3, "Traits array contains at least 3 items");
    assert(validParsed.data.behavioralCharacteristics.length >= 2, "Behavioral characteristics parsed");
    assert(validParsed.data.personalityDo.length >= 2, "Do's guidelines parsed");
    assert(validParsed.data.personalityDont.length >= 2, "Don'ts guidelines parsed");
  }

  // ----------------------------------------------------
  // TEST 2: Invalid Personality Schema Rejection
  // ----------------------------------------------------
  console.log("\nTest 2: Invalid Personality Output Schema Rejection");
  const invalidOutput = {
    archetype: "X", // too short (min 2)
    archetypeRationale: "short", // too short (min 10)
    traits: ["trait1"], // needs >= 3
    principles: [], // needs >= 2
  };
  const invalidParsed = PersonalityOutputSchema.safeParse(invalidOutput);
  assert(!invalidParsed.success, "2. Invalid Personality schema rejection");

  // ----------------------------------------------------
  // TEST 3: Missing Discovery Rejection
  // ----------------------------------------------------
  console.log("\nTest 3: Missing Discovery Rejection");
  const mockProvider = new TestMockPersonalityProvider(mockValidPersonality);
  const rawState = createInitialBrandState("A collaborative music production suite");

  // State with no discovery
  const noDiscoveryResult = await executePersonalityAgent({}, rawState, mockProvider);
  assert(!noDiscoveryResult.success, "3. Missing Discovery rejection");
  assert(noDiscoveryResult.agentRun.status === "failed", "AgentRun marked as failed on missing Discovery");
  assert(noDiscoveryResult.error?.includes("Discovery"), "Error explicitly cites Discovery prerequisite");

  // ----------------------------------------------------
  // TEST 4: Missing Positioning Rejection
  // ----------------------------------------------------
  console.log("\nTest 4: Missing Positioning Rejection");
  const discoveryCompleteState: BrandState = {
    ...rawState,
    discovery: {
      rawIdea: rawState.discovery.rawIdea,
      problem: "Music producers struggle with clunky file exchange and loss of project versioning across DAWs.",
      targetAudience: {
        primary: "Independent electronic music producers",
        secondary: ["Studio mix engineers"],
        characteristics: ["Tech-savvy", "Multi-DAW users"],
        painPoints: ["Lost stems", "Corrupted project bundles"],
        motivations: ["Seamless real-time co-creation"],
      },
      userNeeds: ["Cloud stem sync", "Cross-DAW version control"],
      constraints: ["Low latency requirement"],
      assumptions: ["Producers have stable high-speed internet"],
      missingInformation: ["Target DAW market share"],
      clarifyingQuestions: ["Do you support VST state synchronization?"],
      isAnalyzed: true,
      analyzedAt: new Date().toISOString(),
    },
  };

  const noPositioningResult = await executePersonalityAgent({}, discoveryCompleteState, mockProvider);
  assert(!noPositioningResult.success, "4. Missing Positioning rejection");
  assert(noPositioningResult.agentRun.status === "failed", "AgentRun marked as failed on missing Positioning");
  assert(noPositioningResult.error?.includes("Positioning"), "Error explicitly cites Positioning prerequisite");

  // ----------------------------------------------------
  // TEST 5: Successful Execution with Valid Discovery + Positioning
  // ----------------------------------------------------
  console.log("\nTest 5: Successful Execution with Valid Discovery + Positioning");
  const fullyPrerequisiteState: BrandState = {
    ...discoveryCompleteState,
    version: 2,
    positioning: {
      category: "Real-Time Collaborative Audio Production OS",
      categoryRationale: "Elevates the tool from simple file storage into an active musical workflow environment.",
      positioningStatement: "For modern music producers who build together, PinkLoom Music is the first collaborative audio environment that enables zero-friction co-production.",
      differentiator: "Sub-millisecond DAW-agnostic stem synchronization with lossless version tree.",
      valueProposition: "Create music together from anywhere with the speed and intimacy of sitting in the same control room.",
      competitiveWhitespace: ["Legacy cloud storage has no musical context; existing online DAWs lack pro DSP plugins."],
      alternatives: ["Dropbox", "Splice Studio"],
      proofPoints: ["Proprietary delta-compression audio protocol"],
      risks: ["DAW vendor lock-in"],
      confidence: 90,
      isPositioned: true,
      positionedAt: new Date().toISOString(),
    },
  };

  const personalityResult = await executePersonalityAgent({}, fullyPrerequisiteState, mockProvider);
  assert(personalityResult.success, "5. Successful execution with valid Discovery + Positioning");
  assert(personalityResult.updatedBrandState?.personality.isFormulated === true, "Marks personality.isFormulated = true");
  assert(Boolean(personalityResult.updatedBrandState?.personality.formulatedAt), "Records formulatedAt timestamp");

  // ----------------------------------------------------
  // TEST 6: Verifies Personality Consumes Positioning Context
  // ----------------------------------------------------
  console.log("\nTest 6: Verifies Personality Consumes Positioning Context");
  const userPrompt = mockProvider.capturedMessages.find((m) => m.role === "user")?.content || "";
  assert(
    userPrompt.includes(fullyPrerequisiteState.positioning.category),
    "6. Verifies Personality consumes Positioning context (market category present in prompt)"
  );
  assert(
    userPrompt.includes(fullyPrerequisiteState.positioning.differentiator),
    "Prompt contains positioning differentiator"
  );
  assert(
    userPrompt.includes(fullyPrerequisiteState.discovery.problem),
    "Prompt contains discovery problem statement"
  );

  // ----------------------------------------------------
  // TEST 7: Preserves rawIdea
  // ----------------------------------------------------
  console.log("\nTest 7: Preserves rawIdea");
  assert(
    personalityResult.updatedBrandState?.discovery.rawIdea === fullyPrerequisiteState.discovery.rawIdea,
    "7. Preserves rawIdea"
  );

  // ----------------------------------------------------
  // TEST 8: Preserves Discovery
  // ----------------------------------------------------
  console.log("\nTest 8: Preserves Discovery");
  assert(
    personalityResult.updatedBrandState?.discovery.problem === fullyPrerequisiteState.discovery.problem,
    "8. Preserves Discovery problem statement"
  );
  assert(
    personalityResult.updatedBrandState?.discovery.targetAudience.primary ===
      fullyPrerequisiteState.discovery.targetAudience.primary,
    "Preserves Discovery target audience"
  );
  assert(
    personalityResult.updatedBrandState?.discovery.isAnalyzed === true,
    "Preserves Discovery isAnalyzed flag"
  );

  // ----------------------------------------------------
  // TEST 9: Preserves Positioning
  // ----------------------------------------------------
  console.log("\nTest 9: Preserves Positioning");
  assert(
    personalityResult.updatedBrandState?.positioning.category === fullyPrerequisiteState.positioning.category,
    "9. Preserves Positioning category"
  );
  assert(
    personalityResult.updatedBrandState?.positioning.differentiator ===
      fullyPrerequisiteState.positioning.differentiator,
    "Preserves Positioning differentiator"
  );
  assert(
    personalityResult.updatedBrandState?.positioning.isPositioned === true,
    "Preserves Positioning isPositioned flag"
  );

  // ----------------------------------------------------
  // TEST 10: Increments BrandState.version
  // ----------------------------------------------------
  console.log("\nTest 10: Increments BrandState.version");
  assert(
    personalityResult.updatedBrandState?.version === fullyPrerequisiteState.version + 1,
    "10. Increments BrandState.version"
  );

  // ----------------------------------------------------
  // TEST 11: AgentRun Status Completed
  // ----------------------------------------------------
  console.log("\nTest 11: AgentRun Status Completed");
  assert(personalityResult.agentRun.status === "completed", "11. AgentRun status completed");

  // ----------------------------------------------------
  // TEST 12: AgentRun Stage SHAPE
  // ----------------------------------------------------
  console.log("\nTest 12: AgentRun Stage SHAPE");
  assert(personalityResult.agentRun.stage === "SHAPE", "12. AgentRun stage SHAPE");

  // ----------------------------------------------------
  // TEST 13: AgentRun AgentName Personality
  // ----------------------------------------------------
  console.log("\nTest 13: AgentRun AgentName Personality");
  assert(personalityResult.agentRun.agentName === "Personality", "13. AgentRun agentName Personality");

  // ----------------------------------------------------
  // TEST 14: durationMs Recorded
  // ----------------------------------------------------
  console.log("\nTest 14: durationMs Recorded");
  assert(
    typeof personalityResult.agentRun.durationMs === "number" && personalityResult.agentRun.durationMs >= 0,
    "14. durationMs recorded"
  );

  // ----------------------------------------------------
  // TEST 15: Provider Failure Handling
  // ----------------------------------------------------
  console.log("\nTest 15: Provider Failure Handling");
  const failingProvider = new TestMockPersonalityProvider(null, true);
  const failureResult = await executePersonalityAgent({}, fullyPrerequisiteState, failingProvider);
  assert(!failureResult.success, "15. Provider failure handling");
  assert(failureResult.agentRun.status === "failed", "Marks AgentRun status as failed on provider error");
  assert(Boolean(failureResult.agentRun.error), "Captures error message in AgentRun");

  // ----------------------------------------------------
  // TEST 16: Missing API Key Handling
  // ----------------------------------------------------
  console.log("\nTest 16: Missing API Key Handling");
  const originalKey = process.env.GEMINI_API_KEY;
  const originalAiKey = process.env.AI_API_KEY;
  const originalGroqKey = process.env.GROQ_API_KEY;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  const originalProvider = process.env.AI_PROVIDER;

  delete process.env.GEMINI_API_KEY;
  delete process.env.AI_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.AI_PROVIDER;

  const noKeyResult = await executePersonalityAgent({}, fullyPrerequisiteState);
  assert(!noKeyResult.success, "16. Missing API key handling");
  assert(
    noKeyResult.error?.includes("missing") || noKeyResult.error?.includes("API key"),
    "Returns user-friendly API key configuration error"
  );
  assert(noKeyResult.agentRun.status === "failed", "Records AgentRun status = failed on missing key");

  if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  if (originalAiKey) process.env.AI_API_KEY = originalAiKey;
  if (originalGroqKey) process.env.GROQ_API_KEY = originalGroqKey;
  if (originalOpenAiKey) process.env.OPENAI_API_KEY = originalOpenAiKey;
  if (originalProvider) process.env.AI_PROVIDER = originalProvider;

  // ----------------------------------------------------
  // TEST 17: Malformed / Invalid Model Output Handling
  // ----------------------------------------------------
  console.log("\nTest 17: Malformed / Invalid Model Output Handling");
  const malformedProvider = new TestMockPersonalityProvider({
    archetype: "", // empty string violates schema
    traits: [],
  });
  const malformedResult = await executePersonalityAgent({}, fullyPrerequisiteState, malformedProvider);
  assert(!malformedResult.success, "17. Malformed / invalid model output handling");
  assert(malformedResult.agentRun.status === "failed", "AgentRun status = failed on malformed output");
  assert(Boolean(malformedResult.error), "Error message returned on schema failure");

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log("\n==================================================");
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log("==================================================\n");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPersonalityTestSuite().catch((err) => {
  console.error("Personality test suite runner crashed:", err);
  process.exit(1);
});
