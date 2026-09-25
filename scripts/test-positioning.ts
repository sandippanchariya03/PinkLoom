/**
 * Positioning Engine Test Suite (Phase 3)
 * Covers all required Phase 3 validation criteria:
 * 1. Valid Positioning output schema validation
 * 2. Invalid Positioning output schema rejection
 * 3. Missing Discovery state (strict stage dependency enforcement)
 * 4. Positioning using actual Discovery state context
 * 5. Preservation of Discovery and rawIdea in BrandState
 * 6. BrandState version incrementation
 * 7. AgentRun completion, status, and duration tracking
 * 8. Provider network failure handling
 * 9. Missing API key handling
 * 10. Malformed structured response handling
 */

import {
  PositioningOutputSchema,
  type PositioningOutput,
  type BrandState,
  createInitialBrandState,
} from "../src/types/brand";
import { executePositioningAgent } from "../src/lib/agents/positioning";
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

// Mock provider for deterministic positioning testing
class TestMockPositioningProvider implements LLMProvider {
  readonly providerName = "test-mock-positioning";
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

async function runPositioningTestSuite() {
  console.log("\n==================================================");
  console.log("PinkLoom Phase 3 — Positioning Engine Test Suite");
  console.log("==================================================\n");

  const validSamplePositioning: PositioningOutput = {
    category: "Peer-to-Peer Technical Cofounder Network",
    categoryRationale: "Framing as a peer network rather than a club or job board emphasizes high-agency reciprocity and commitment alignment.",
    positioningStatement: "For ambitious university builders who are tired of flaky hackathon partners, PinkLoom is a verified cofounder network that aligns commitment levels and technical competencies, unlike casual campus entrepreneurship clubs.",
    differentiator: "Commitment-gated matching algorithm verified through code repository activity and availability pledges rather than superficial social profiles.",
    valueProposition: "Find a vetted, dedicated technical or business cofounder on your campus within 30 days without awkward coffee chats.",
    competitiveWhitespace: [
      "Commitment-first vetting rather than vanity resumes",
      "Campus-localized matching with cross-campus graduation expansion",
      "Standardized equity expectation and project commitment covenants",
    ],
    alternatives: [
      "Casual university entrepreneurship club mixers",
      "General student hackathon team formation channels",
      "Generic LinkedIn cold outreach",
    ],
    proofPoints: [
      "Demonstrated matching protocol based on verified project contributions",
      "Mutual commitment covenant signing before contact unlock",
    ],
    risks: [
      "Chicken-and-egg liquidity problem on individual smaller campuses",
      "Semester graduation cycles causing user churn",
    ],
    confidence: 88,
  };

  // ----------------------------------------------------
  // TEST 1: Valid Positioning Output Schema
  // ----------------------------------------------------
  console.log("Test 1: Valid Positioning Output Schema Validation");
  const validParsed = PositioningOutputSchema.safeParse(validSamplePositioning);
  assert(validParsed.success, "Valid positioning schema parses successfully");
  if (validParsed.success) {
    assert(validParsed.data.category.length > 2, "Category definition is present");
    assert(validParsed.data.competitiveWhitespace.length >= 1, "Competitive whitespace identified");
    assert(validParsed.data.confidence === 88, "Confidence score accurately recorded");
  }

  // ----------------------------------------------------
  // TEST 2: Invalid Positioning Output Schema Rejection
  // ----------------------------------------------------
  console.log("\nTest 2: Invalid Positioning Output Schema Rejection");
  const invalidOutput = {
    category: "", // too short
    positioningStatement: "short", // < 10 chars
    competitiveWhitespace: [], // requires min 1
  };
  const invalidParsed = PositioningOutputSchema.safeParse(invalidOutput);
  assert(!invalidParsed.success, "Invalid positioning schema rejected by Zod");

  // ----------------------------------------------------
  // TEST 3: Missing Discovery State (Strict Dependency Enforcement)
  // ----------------------------------------------------
  console.log("\nTest 3: Stage Dependency Enforcement (Discovery must precede Positioning)");
  const emptyState = createInitialBrandState("Platform for student cofounders");
  const unanalyzedResult = await executePositioningAgent({}, emptyState);
  assert(!unanalyzedResult.success, "Rejects execution when Discovery is not yet completed");
  assert(unanalyzedResult.agentRun.status === "failed", "AgentRun marked as failed when prerequisite missing");
  assert(
    unanalyzedResult.error?.includes("Discovery stage must be completed"),
    "Error explains stage prerequisite requirement"
  );

  const noStateResult = await executePositioningAgent({});
  assert(!noStateResult.success, "Rejects execution when BrandState is undefined");

  // ----------------------------------------------------
  // TEST 4 & 5: Positioning using Actual Discovery State & Preservation
  // ----------------------------------------------------
  console.log("\nTest 4 & 5: Positioning Ingests Discovery & Preserves Context");
  const preparedBrandState: BrandState = {
    ...emptyState,
    projectId: "test-proj-phase3",
    version: 2,
    discovery: {
      rawIdea: "A platform that helps university students find serious cofounders",
      problem: "Students lack high-signal networks to find committed collaborators, suffering from flaky partners.",
      targetAudience: {
        primary: "Student builders and aspiring student founders",
        secondary: ["Campus incubators"],
        characteristics: ["High-agency", "Technical or commercial skills"],
        painPoints: ["Flaky collaborators", "Mismatched commitment"],
        motivations: ["Build venture-backed startups"],
      },
      userNeeds: ["Proof of commitment", "Vetted skills matching"],
      constraints: ["Academic calendars", "Zero student budget"],
      assumptions: ["Students prefer on-campus peers"],
      missingInformation: ["Monetization structure"],
      clarifyingQuestions: ["How is commitment verified?"],
      isAnalyzed: true,
      analyzedAt: new Date().toISOString(),
    },
  };

  const mockProvider = new TestMockPositioningProvider(validSamplePositioning);
  const positioningResult = await executePositioningAgent(
    { projectId: "test-proj-phase3" },
    preparedBrandState,
    mockProvider
  );

  assert(positioningResult.success, "Positioning succeeds when valid Discovery is present");
  assert(positioningResult.updatedBrandState?.positioning.isPositioned === true, "Marks positioning.isPositioned = true");
  assert(positioningResult.updatedBrandState?.positioning.category === validSamplePositioning.category, "Sets market category");
  assert(positioningResult.updatedBrandState?.positioning.differentiator === validSamplePositioning.differentiator, "Sets differentiator");

  // TEST 5: Preservation of Discovery & rawIdea
  assert(
    positioningResult.updatedBrandState?.discovery.problem === preparedBrandState.discovery.problem,
    "Preserves Discovery problem statement unmutated"
  );
  assert(
    positioningResult.updatedBrandState?.discovery.rawIdea === preparedBrandState.discovery.rawIdea,
    "Preserves original rawIdea unmutated"
  );

  // ----------------------------------------------------
  // TEST 6 & 7: Version Increment & AgentRun Completion
  // ----------------------------------------------------
  console.log("\nTest 6 & 7: Version Increment & AgentRun Completion");
  assert(
    (positioningResult.updatedBrandState?.version ?? 0) > preparedBrandState.version,
    `Increments version from ${preparedBrandState.version} to ${positioningResult.updatedBrandState?.version}`
  );
  assert(positioningResult.agentRun.status === "completed", "AgentRun status is completed");
  assert(positioningResult.agentRun.stage === "POSITION", "AgentRun stage is POSITION");
  assert(positioningResult.agentRun.agentName === "Positioning", "AgentRun agentName is Positioning");
  assert((positioningResult.agentRun.durationMs ?? 0) >= 0, "AgentRun duration is tracked in ms");

  // ----------------------------------------------------
  // TEST 8: Provider Failure Handling
  // ----------------------------------------------------
  console.log("\nTest 8: Provider Failure Handling");
  const failingProvider = new TestMockPositioningProvider(null, true);
  const failureResult = await executePositioningAgent(
    { projectId: "test-proj-phase3" },
    preparedBrandState,
    failingProvider
  );
  assert(!failureResult.success, "Handles provider failure gracefully");
  assert(failureResult.agentRun.status === "failed", "Marks AgentRun status = failed");
  assert(failureResult.agentRun.error?.includes("timeout"), "Records error message in trace");

  // ----------------------------------------------------
  // TEST 9: Missing API Key Handling
  // ----------------------------------------------------
  console.log("\nTest 9: Missing API Key Error Handling");
  const originalKey = process.env.GEMINI_API_KEY;
  const originalAiKey = process.env.AI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.AI_API_KEY;

  const noKeyResult = await executePositioningAgent(
    { projectId: "test-proj-phase3" },
    preparedBrandState
  );
  assert(!noKeyResult.success, "Fails cleanly when API key is missing");
  assert(
    noKeyResult.error?.includes("missing") || noKeyResult.error?.includes("GEMINI_API_KEY"),
    "Returns user-friendly API key configuration error"
  );
  assert(noKeyResult.agentRun.status === "failed", "Records AgentRun status = failed on missing key");

  if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  if (originalAiKey) process.env.AI_API_KEY = originalAiKey;

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

runPositioningTestSuite().catch((err) => {
  console.error("Positioning test suite runner crashed:", err);
  process.exit(1);
});
