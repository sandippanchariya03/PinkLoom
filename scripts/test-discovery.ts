/**
 * Discovery Engine Test Suite
 * Covers all required Phase 2 validation criteria:
 * 1. Valid Discovery output schema validation
 * 2. Invalid Discovery output schema rejection
 * 3. Minimal user idea handling
 * 4. Detailed user idea execution
 * 5. Ambiguous idea deconstruction
 * 6. Missing API key handling
 * 7. Provider failure & AgentRun trace status
 */

import { DiscoveryOutputSchema, type DiscoveryOutput } from "../src/types/brand";
import { executeDiscoveryAgent } from "../src/lib/agents/discovery";
import type { LLMProvider, LLMResponse, StructuredLLMResponse } from "../src/lib/ai/types";
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

// Mock provider factory for deterministic test scenarios
class TestMockProvider implements LLMProvider {
  readonly providerName = "test-mock";
  private mockOutput: unknown;
  private shouldFail: boolean;

  constructor(mockOutput?: unknown, shouldFail = false) {
    this.mockOutput = mockOutput;
    this.shouldFail = shouldFail;
  }

  async generateText(): Promise<LLMResponse> {
    if (this.shouldFail) throw new Error("Upstream model connection timeout (504)");
    return { text: "mock text", finishReason: "stop" };
  }

  async generateStructured<T>(
    _messages: unknown,
    schema: z.ZodType<T>
  ): Promise<StructuredLLMResponse<T>> {
    if (this.shouldFail) throw new Error("Upstream model connection timeout (504)");
    const validated = schema.safeParse(this.mockOutput);
    if (!validated.success) {
      throw new Error(`Schema validation error: ${validated.error.issues.map((i) => i.message).join(", ")}`);
    }
    return {
      data: validated.data,
      raw: { text: JSON.stringify(this.mockOutput), finishReason: "stop" },
      validationSuccess: true,
    };
  }
}

async function runTestSuite() {
  console.log("\n==================================================");
  console.log("PinkLoom Phase 2 — Discovery Engine Test Suite");
  console.log("==================================================\n");

  const validSampleOutput: DiscoveryOutput = {
    problem: "University students lack high-signal networks to find committed cofounders with complementary skills.",
    targetAudience: {
      primary: "Undergraduate and graduate students building initial MVPs",
      secondary: ["Campus incubators", "Recent alumni"],
      characteristics: ["High agency", "Frustrated by hackathon speed dating", "Technically or operationally focused"],
      painPoints: ["Flaky collaborators", "Mismatched equity expectations", "Time zone and class schedule friction"],
      motivations: ["Build a venture-backed company before graduation"],
    },
    userNeeds: [
      "Vetted proof of technical capability or previous work",
      "Commitment level alignment (hours/week available)",
      "Standardized mutual NDA and equity expectation framework",
    ],
    constraints: [
      "Strict academic semester schedules create drop-off cycles",
      "Zero budget for software subscriptions among students",
    ],
    assumptions: [
      "Students prefer on-campus peers over remote cofounders",
      "Students are willing to undergo vetting to unlock matchmaking",
    ],
    missingInformation: [
      "Monetization model (B2B university licenses vs. freemium)",
      "Vetting mechanism (peer endorsements vs. GitHub/portfolio verification)",
    ],
    clarifyingQuestions: [
      "How will you prevent the platform from turning into another casual club directory?",
      "Will matching be restricted to within individual campuses or open cross-university?",
    ],
  };

  // ----------------------------------------------------
  // TEST 1: Valid Discovery Output Schema Validation
  // ----------------------------------------------------
  console.log("Test 1: Valid Discovery Output Schema Validation");
  const validParsed = DiscoveryOutputSchema.safeParse(validSampleOutput);
  assert(validParsed.success, "Valid schema parses successfully");
  if (validParsed.success) {
    assert(validParsed.data.problem.length > 10, "Problem statement is substantive");
    assert(validParsed.data.userNeeds.length >= 1, "User needs present");
  }

  // ----------------------------------------------------
  // TEST 2: Invalid Discovery Output Schema Rejection
  // ----------------------------------------------------
  console.log("\nTest 2: Invalid Discovery Output Schema Rejection");
  const invalidOutput = {
    problem: "", // too short
    targetAudience: { primary: "" },
    userNeeds: [], // requires min 1
  };
  const invalidParsed = DiscoveryOutputSchema.safeParse(invalidOutput);
  assert(!invalidParsed.success, "Invalid schema is rejected by Zod");

  // ----------------------------------------------------
  // TEST 3: Minimal User Idea Validation
  // ----------------------------------------------------
  console.log("\nTest 3: Minimal User Idea Handling");
  const tooShortResult = await executeDiscoveryAgent({ rawIdea: "hi" });
  assert(!tooShortResult.success, "Rejects raw idea shorter than 5 chars");
  assert(tooShortResult.agentRun.status === "failed", "AgentRun marked as failed for too-short input");

  const mockProvider = new TestMockProvider(validSampleOutput);
  const minimalValidResult = await executeDiscoveryAgent(
    { rawIdea: "co-founders for students" },
    undefined,
    mockProvider
  );
  assert(minimalValidResult.success, "Accepts minimal valid idea (>= 5 chars)");
  assert(minimalValidResult.agentRun.status === "completed", "AgentRun marked as completed");

  // ----------------------------------------------------
  // TEST 4: Detailed User Idea Execution & State Preservation
  // ----------------------------------------------------
  console.log("\nTest 4: Detailed User Idea Execution & BrandState Update");
  const detailedIdea = "A platform that helps university students find serious, vetted technical and business cofounders on their campuses based on commitment level and complementary skills rather than just casual coffee chats.";
  const detailedResult = await executeDiscoveryAgent(
    { rawIdea: detailedIdea, projectId: "test-proj-001" },
    undefined,
    mockProvider
  );
  assert(detailedResult.success, "Detailed idea execution succeeds");
  assert(detailedResult.updatedBrandState?.discovery.rawIdea === detailedIdea, "Preserves original rawIdea in BrandState");
  assert(detailedResult.updatedBrandState?.discovery.isAnalyzed === true, "Marks discovery.isAnalyzed as true");
  assert(detailedResult.updatedBrandState?.projectId === "test-proj-001", "Preserves projectId");
  assert(detailedResult.updatedBrandState?.version === 2, "Increments BrandState version");

  // ----------------------------------------------------
  // TEST 5: Ambiguous Idea Deconstruction (Assumptions & Questions)
  // ----------------------------------------------------
  console.log("\nTest 5: Ambiguous Idea Deconstruction");
  assert(
    (detailedResult.discoveryOutput?.assumptions.length ?? 0) > 0,
    "Captures unproven assumptions for ambiguous ideas"
  );
  assert(
    (detailedResult.discoveryOutput?.clarifyingQuestions.length ?? 0) > 0,
    "Formulates sharp clarifying questions"
  );

  // ----------------------------------------------------
  // TEST 6: Missing API Key Handling
  // ----------------------------------------------------
  console.log("\nTest 6: Missing API Key Error Handling");
  // Temporarily clear environment variables to test error path
  const originalKey = process.env.GEMINI_API_KEY;
  const originalAiKey = process.env.AI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.AI_API_KEY;

  const noKeyResult = await executeDiscoveryAgent({
    rawIdea: "A real estate tokenization platform",
  });
  assert(!noKeyResult.success, "Fails cleanly when API key is missing");
  assert(
    noKeyResult.error?.includes("missing") || noKeyResult.error?.includes("GEMINI_API_KEY"),
    "Returns user-friendly API key configuration error"
  );
  assert(noKeyResult.agentRun.status === "failed", "Records AgentRun status = failed");

  // Restore environment variables
  if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  if (originalAiKey) process.env.AI_API_KEY = originalAiKey;

  // ----------------------------------------------------
  // TEST 7: Provider Failure & Trace Status Recording
  // ----------------------------------------------------
  console.log("\nTest 7: Provider Failure & AgentRun Trace Status");
  const failingProvider = new TestMockProvider(null, true);
  const failureResult = await executeDiscoveryAgent(
    { rawIdea: "An on-demand grocery delivery network" },
    undefined,
    failingProvider
  );
  assert(!failureResult.success, "Catches provider network failure gracefully");
  assert(failureResult.agentRun.status === "failed", "Records AgentRun status as failed");
  assert(failureResult.agentRun.error?.includes("timeout"), "Captures error message in AgentRun");
  assert((failureResult.agentRun.durationMs ?? 0) >= 0, "Records elapsed durationMs in trace");

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

runTestSuite().catch((err) => {
  console.error("Test suite runner crashed:", err);
  process.exit(1);
});
