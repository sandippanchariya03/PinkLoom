/**
 * Naming Engine Test Suite (Phase 4B)
 * Comprehensive testing covering all required Phase 4B validation criteria:
 *
 * A. Valid NamingOutput schema
 * B. Invalid NamingOutput schema
 * C. Missing Discovery rejection
 * D. Missing Positioning rejection
 * E. Missing Personality rejection
 * F. Context propagation (Discovery + Positioning + Personality)
 * G. Distinct directions (3-4 directions)
 * H. Candidate structure (name, rationale, linguistic, phonetic, domain suitability)
 * I. Tagline candidates exist
 * J. State preservation (rawIdea, discovery, positioning, personality)
 * K. Version increment
 * L. AgentRun trace verification (stage = SHAPE, agentName = Naming)
 * M. Provider failure handling
 * N. Missing API key handling
 * O. Malformed model output handling
 * P. No automatic selection (human selection mandatory)
 * Q. Selection persistence (selectedDirectionId, selectedName, selectedTagline, isSelected, selectedAt)
 * R. Selection does not destroy generated directions
 * S. Re-selection (switching selection from candidate A to candidate B)
 */

import {
  NamingOutputSchema,
  type NamingOutput,
  type BrandState,
  createInitialBrandState,
} from "../src/types/brand";
import { executeNamingAgent } from "../src/lib/agents/naming";
import { selectBrandName } from "../src/lib/actions/naming";
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

// Mock provider for deterministic naming tests
class TestMockNamingProvider implements LLMProvider {
  readonly providerName = "test-mock-naming";
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

const mockValidNaming: NamingOutput = {
  directions: [
    {
      id: "dir-1",
      name: "Compound / Constructed: Morphemic Precision",
      strategy: "Fuses operational clarity with technical authority.",
      rationale: "Translates the verified cofounder matching problem into a sense of engineered partnership.",
      namingLogic: "Combines Latinate connective prefixes with crisp Germanic action stems.",
      candidates: [
        {
          name: "Synctrust",
          rationale: "Expresses synchronous alignment and radical peer vetting.",
          linguisticRationale: "Portmanteau of Greek 'syn' (together) and Germanic 'trost' (reliance, trust).",
          phoneticAssessment: "Crisp sibilant start transitioning to a firm dental stop; confident single-beat momentum.",
          domainSuitability: "Nine letters, natural English spelling, memorable, low friction for .com or .co.",
        },
        {
          name: "Foundervault",
          rationale: "Evokes security, selective admission, and serious peer commitment.",
          linguisticRationale: "Compound noun combining 'founder' with 'vault' (from Old French 'voute', a secure sanctuary).",
          phoneticAssessment: "Balanced trochaic cadence; deep resonant vowel in vault anchors authority.",
          domainSuitability: "Spelled exactly as spoken; easily identifiable digital asset.",
        },
      ],
      taglineCandidates: [
        "Where serious builders assemble.",
        "Precision matching for campus cofounders.",
      ],
    },
    {
      id: "dir-2",
      name: "Evocative / Metaphorical: Provenance & Bedrock",
      strategy: "Taps into architectural, geological, and foundational imagery.",
      rationale: "Reinforces the Compassionate Vanguard archetype through enduring stability.",
      namingLogic: "Uses natural allegories of grounding, structural integrity, and shared bedrock.",
      candidates: [
        {
          name: "Keystone",
          rationale: "The central stone upon which all arches depend; the essential complementary partner.",
          linguisticRationale: "Classic English architectural compound symbolizing central structural dependence.",
          phoneticAssessment: "Hard velar stop /k/ lends immediate assertiveness followed by crisp sibilance.",
          domainSuitability: "Universally understood metaphor, high premium memorability; requires modern TLD like keystone.team.",
        },
        {
          name: "Bedrock",
          rationale: "Unshakable foundation preceding hype or early speculation.",
          linguisticRationale: "Geological compound denoting solid unweathered rock underlying surface soil.",
          phoneticAssessment: "Two short, punchy syllables with plosive stops (/b/, /d/, /k/).",
          domainSuitability: "Zero spelling ambiguity, high brand recall, ideal for mobile navigation.",
        },
      ],
      taglineCandidates: [
        "The ground beneath great companies.",
        "Built on shared conviction.",
      ],
    },
    {
      id: "dir-3",
      name: "Neoclassical / Abstract: High-Gravity Phonetics",
      strategy: "Draws from classical linguistic roots to project timeless institutional gravitas.",
      rationale: "Elevates student startup matchmaking above casual chat apps into an enduring institution.",
      namingLogic: "Derived from Latin roots relating to alliance, covenant, and alignment.",
      candidates: [
        {
          name: "Foedus",
          rationale: "The classical Latin root of federalism, pact, covenant, and enduring mutual obligation.",
          linguisticRationale: "Direct Latin nominative 'foedus' (league, treaty, covenant).",
          phoneticAssessment: "Soft fricative opener /f/ leading to an open diphthong and soft sibilant tail.",
          domainSuitability: "Six letters, distinctive, elegant URL presence with high international brandability.",
        },
        {
          name: "Cohere",
          rationale: "Signifies natural molecular attraction and logical internal consistency.",
          linguisticRationale: "From Latin 'cohaerere' (to stick together, hold together).",
          phoneticAssessment: "Gentle aspirated /h/ followed by open sonorant glide.",
          domainSuitability: "Clean English verb, high aesthetic minimalism on web and mobile.",
        },
      ],
      taglineCandidates: [
        "Aligned by commitment, not chance.",
        "The covenant between creators.",
      ],
    },
  ],
};

function createValidTestedState(): BrandState {
  const base = createInitialBrandState("A platform for university student cofounder matching.");
  base.projectId = "test-naming-project";
  base.discovery = {
    rawIdea: "A platform for university student cofounder matching.",
    problem: "University students struggle to find serious, vetted technical and business cofounders on campus.",
    targetAudience: {
      primary: "University student technical & business builders seeking serious cofounders",
      secondary: ["Campus incubators", "Student entrepreneurship clubs"],
      characteristics: ["Ambitious", "Time-constrained", "Wary of casual commitments"],
      painPoints: ["Endless awkward coffee chats", "Flaky uncommitted partners", "Skill mismatches"],
      motivations: ["Build venture-backed startups", "Find complementary expertise"],
    },
    userNeeds: ["Verified commitment scoring", "Complementary skill filters", "Direct project trials"],
    constraints: ["Academic calendars", "Limited budgets"],
    assumptions: ["Students are willing to undergo vetting"],
    missingInformation: [],
    clarifyingQuestions: [],
    isAnalyzed: true,
    analyzedAt: new Date().toISOString(),
  };
  base.positioning = {
    category: "High-conviction cofounder matching platform",
    categoryRationale: "Distinguishes vetted, commitment-first matchmaking from casual networking clubs.",
    positioningStatement: "For student builders seeking serious partners, PinkLoom delivers verified cofounder matching.",
    differentiator: "Commitment-gated skill verification and trial work sprints",
    valueProposition: "Stop wasting months on coffee chats. Build with vetted cofounders in days.",
    competitiveWhitespace: ["Commitment-verified matching vs casual clubs", "Built-in trial sprints"],
    alternatives: ["Campus clubs", "LinkedIn search"],
    proofPoints: ["78% lower founder breakup rate"],
    risks: ["Liquidity cold-start per campus"],
    confidence: 88,
    isPositioned: true,
    positionedAt: new Date().toISOString(),
  };
  base.personality = {
    archetype: "The Compassionate Vanguard",
    archetypeRationale: "Balances deep empathy for isolated student founders with uncompromising operational rigor.",
    traits: ["Unflinchingly Honest", "Deeply Empathetic", "Relentlessly Pragmatic", "Grounded"],
    behavioralCharacteristics: ["Speaks in direct plain prose", "Transparent about founder risks"],
    principles: [
      {
        title: "Radical Transparency",
        description: "Always speak the unvarnished truth about partnership trade-offs.",
      },
    ],
    emotionalTerritory: "The profound relief of discovering an equally committed peer in a sea of casual interest.",
    personalityDo: ["Acknowledge founder anxiety openly", "Demand reciprocal rigor"],
    personalityDont: ["Use Silicon Valley hype jargon", "Treat founder matching as casual dating"],
    confidence: 90,
    isFormulated: true,
    formulatedAt: new Date().toISOString(),
  };
  return base;
}

async function runAllNamingTests() {
  console.log("\n==================================================");
  console.log("PinkLoom Phase 4B — Naming Engine Test Suite");
  console.log("==================================================\n");

  // Test A: Valid NamingOutput Schema Validation
  console.log("Test A: Valid NamingOutput Schema Validation");
  const validParse = NamingOutputSchema.safeParse(mockValidNaming);
  assert(validParse.success, "Valid schema parses successfully");
  if (validParse.success) {
    assert(validParse.data.directions.length === 3, "Directions count matches (3 directions)");
    assert(validParse.data.directions[0].candidates.length >= 1, "Candidates present in direction");
  }

  // Test B: Invalid NamingOutput Schema Rejection
  console.log("\nTest B: Invalid NamingOutput Schema Rejection");
  const invalidTooFewDirections = {
    directions: [
      {
        id: "dir-1",
        name: "Only One Direction",
        strategy: "Too short",
        rationale: "Invalid",
        namingLogic: "Invalid",
        candidates: [],
        taglineCandidates: [],
      },
    ],
  };
  const invalidParse = NamingOutputSchema.safeParse(invalidTooFewDirections);
  assert(!invalidParse.success, "Invalid schema (too few directions) rejected by Zod");

  // Test C: Missing Discovery Rejection
  console.log("\nTest C: Missing Discovery Rejection");
  const missingDiscoveryState = createValidTestedState();
  missingDiscoveryState.discovery.isAnalyzed = false;
  missingDiscoveryState.discovery.problem = "";
  const mockProviderC = new TestMockNamingProvider(mockValidNaming);
  const resultC = await executeNamingAgent({}, missingDiscoveryState, mockProviderC);
  assert(!resultC.success, "Rejects execution when Discovery is incomplete");
  assert(resultC.agentRun.status === "failed", "AgentRun status = failed on missing Discovery");
  assert(resultC.error?.includes("Discovery stage must be completed"), "Error message cites Discovery requirement");

  // Test D: Missing Positioning Rejection
  console.log("\nTest D: Missing Positioning Rejection");
  const missingPositioningState = createValidTestedState();
  missingPositioningState.positioning.isPositioned = false;
  missingPositioningState.positioning.category = "";
  const mockProviderD = new TestMockNamingProvider(mockValidNaming);
  const resultD = await executeNamingAgent({}, missingPositioningState, mockProviderD);
  assert(!resultD.success, "Rejects execution when Positioning is incomplete");
  assert(resultD.agentRun.status === "failed", "AgentRun status = failed on missing Positioning");
  assert(resultD.error?.includes("Positioning stage must be completed"), "Error message cites Positioning requirement");

  // Test E: Missing Personality Rejection
  console.log("\nTest E: Missing Personality Rejection");
  const missingPersonalityState = createValidTestedState();
  missingPersonalityState.personality.isFormulated = false;
  missingPersonalityState.personality.archetype = "";
  const mockProviderE = new TestMockNamingProvider(mockValidNaming);
  const resultE = await executeNamingAgent({}, missingPersonalityState, mockProviderE);
  assert(!resultE.success, "Rejects execution when Personality is incomplete");
  assert(resultE.agentRun.status === "failed", "AgentRun status = failed on missing Personality");
  assert(resultE.error?.includes("Personality stage must be completed"), "Error message cites Personality requirement");

  // Test F: Context Propagation
  console.log("\nTest F: Context Propagation (Discovery + Positioning + Personality)");
  const validStateF = createValidTestedState();
  const mockProviderF = new TestMockNamingProvider(mockValidNaming);
  const resultF = await executeNamingAgent({}, validStateF, mockProviderF);
  assert(resultF.success, "Naming execution succeeds with valid 3-layer context");
  const userMessage = mockProviderF.capturedMessages.find((m) => m.role === "user")?.content || "";
  assert(userMessage.includes(validStateF.discovery.problem), "Prompt contains Discovery problem statement");
  assert(userMessage.includes(validStateF.discovery.targetAudience.primary), "Prompt contains Discovery target audience");
  assert(userMessage.includes(validStateF.positioning.category), "Prompt contains Positioning market category");
  assert(userMessage.includes(validStateF.positioning.differentiator), "Prompt contains Positioning differentiator");
  assert(userMessage.includes(validStateF.personality.archetype), "Prompt contains Personality archetype");
  assert(userMessage.includes(validStateF.personality.emotionalTerritory), "Prompt contains Personality emotional territory");

  // Test G: Distinct Directions Count
  console.log("\nTest G: Distinct Directions (3-4 territories)");
  assert(
    resultF.namingOutput !== undefined &&
      resultF.namingOutput.directions.length >= 3 &&
      resultF.namingOutput.directions.length <= 4,
    "Output contains 3 to 4 distinct naming directions"
  );

  // Test H: Candidate Structure
  console.log("\nTest H: Candidate Structure Verification");
  const firstDir = resultF.namingOutput?.directions[0];
  const firstCandidate = firstDir?.candidates[0];
  assert(Boolean(firstCandidate?.name), "Candidate contains name");
  assert(Boolean(firstCandidate?.rationale), "Candidate contains strategic rationale");
  assert(Boolean(firstCandidate?.linguisticRationale), "Candidate contains linguisticRationale");
  assert(Boolean(firstCandidate?.phoneticAssessment), "Candidate contains phoneticAssessment");
  assert(Boolean(firstCandidate?.domainSuitability), "Candidate contains domainSuitability");

  // Test I: Tagline Candidates Exist
  console.log("\nTest I: Tagline Candidates Exist");
  assert(
    Boolean(firstDir?.taglineCandidates && firstDir.taglineCandidates.length >= 1),
    "Direction contains candidate taglines"
  );

  // Test J: Preservation of Upstream Context
  console.log("\nTest J: Preservation of Upstream Context");
  const updatedStateJ = resultF.updatedBrandState!;
  assert(updatedStateJ.discovery.problem === validStateF.discovery.problem, "Preserves Discovery problem statement");
  assert(updatedStateJ.positioning.category === validStateF.positioning.category, "Preserves Positioning category");
  assert(updatedStateJ.personality.archetype === validStateF.personality.archetype, "Preserves Personality archetype");
  assert(updatedStateJ.discovery.rawIdea === validStateF.discovery.rawIdea, "Preserves rawIdea");

  // Test K: Version Increment
  console.log("\nTest K: Version Increment");
  assert(updatedStateJ.version === validStateF.version + 1, "Increments BrandState.version");

  // Test L: AgentRun Trace
  console.log("\nTest L: AgentRun Trace Verification");
  assert(resultF.agentRun.stage === "SHAPE", "AgentRun stage is SHAPE");
  assert(resultF.agentRun.agentName === "Naming", "AgentRun agentName is Naming");
  assert(resultF.agentRun.status === "completed", "AgentRun status is completed");
  assert(typeof resultF.agentRun.durationMs === "number", "AgentRun tracks durationMs");

  // Test M: Provider Failure Handling
  console.log("\nTest M: Provider Failure Handling");
  const failingProvider = new TestMockNamingProvider(mockValidNaming, true);
  const resultM = await executeNamingAgent({}, createValidTestedState(), failingProvider);
  assert(!resultM.success, "Handles provider failure gracefully");
  assert(resultM.agentRun.status === "failed", "Marks AgentRun status = failed on provider error");
  assert(Boolean(resultM.agentRun.error), "Captures error message in trace");

  // Test N: Missing API Key Handling
  console.log("\nTest N: Missing API Key Handling");
  // Custom provider that checks API key
  const keyCheckingProvider: LLMProvider = {
    providerName: "groq",
    async generateText() {
      throw new Error("Missing API Key. Set GROQ_API_KEY.");
    },
    async generateStructured() {
      throw new Error("Missing API Key. Set GROQ_API_KEY in .env.local.");
    },
  };
  const resultN = await executeNamingAgent({}, createValidTestedState(), keyCheckingProvider);
  assert(!resultN.success, "Handles missing API key gracefully");
  assert(resultN.agentRun.status === "failed", "Marks AgentRun status = failed on missing key");
  assert(resultN.error?.includes("Missing API Key"), "Returns user-friendly API key configuration error");

  // Test O: Malformed Model Output Handling
  console.log("\nTest O: Malformed Model Output Handling");
  const malformedProvider: LLMProvider = {
    providerName: "malformed",
    async generateText() {
      return { text: "garbage", finishReason: "stop" };
    },
    async generateStructured() {
      throw new Error("Zod validation failed: invalid_type in directions");
    },
  };
  const resultO = await executeNamingAgent({}, createValidTestedState(), malformedProvider);
  assert(!resultO.success, "Rejects malformed model output");
  assert(resultO.agentRun.status === "failed", "Marks AgentRun status = failed on schema failure");

  // Test P: No Automatic Selection (Human selection mandatory)
  console.log("\nTest P: No Automatic Selection");
  assert(updatedStateJ.naming.isGenerated === true, "Marks naming.isGenerated = true");
  assert(updatedStateJ.naming.isSelected === false, "Leaves isSelected = false");
  assert(
    updatedStateJ.naming.selectedName === null || updatedStateJ.naming.selectedName === undefined,
    "Leaves selectedName = null (AI never selects winner automatically)"
  );
  assert(
    updatedStateJ.naming.selectedDirectionId === null || updatedStateJ.naming.selectedDirectionId === undefined,
    "Leaves selectedDirectionId = null"
  );

  // Test Q: Selection Persistence
  console.log("\nTest Q: Selection Persistence (selectBrandName)");
  const selectResultQ = await selectBrandName({
    projectId: updatedStateJ.projectId,
    directionId: "dir-1",
    candidateName: "Synctrust",
    tagline: "Where serious builders assemble.",
    brandState: updatedStateJ,
  });
  assert(selectResultQ.success, "Candidate selection succeeds");
  const selectedStateQ = selectResultQ.updatedBrandState!;
  assert(selectedStateQ.naming.isSelected === true, "Sets isSelected = true");
  assert(selectedStateQ.naming.selectedName === "Synctrust", "Sets selectedName to chosen candidate");
  assert(selectedStateQ.naming.selectedDirectionId === "dir-1", "Sets selectedDirectionId to chosen direction");
  assert(
    selectedStateQ.naming.selectedTagline === "Where serious builders assemble.",
    "Sets selectedTagline"
  );
  assert(Boolean(selectedStateQ.naming.selectedAt), "Records selectedAt timestamp");
  assert(selectedStateQ.version === updatedStateJ.version + 1, "Increments version on selection");

  // Test R: Selection Does Not Destroy Generated Directions
  console.log("\nTest R: Selection Does Not Destroy Generated Directions");
  assert(
    selectedStateQ.naming.directions.length === updatedStateJ.naming.directions.length,
    "Generated directions count remains unchanged"
  );
  assert(
    selectedStateQ.naming.directions[0].candidates.length ===
      updatedStateJ.naming.directions[0].candidates.length,
    "Candidate names list remains intact"
  );

  // Test S: Re-selection
  console.log("\nTest S: Re-selection (switching candidate)");
  const reSelectResultS = await selectBrandName({
    projectId: selectedStateQ.projectId,
    directionId: "dir-2",
    candidateName: "Keystone",
    tagline: "The ground beneath great companies.",
    brandState: selectedStateQ,
  });
  assert(reSelectResultS.success, "Re-selection succeeds");
  const reSelectedStateS = reSelectResultS.updatedBrandState!;
  assert(reSelectedStateS.naming.selectedName === "Keystone", "Updates selectedName to new candidate");
  assert(reSelectedStateS.naming.selectedDirectionId === "dir-2", "Updates selectedDirectionId to new direction");
  assert(
    reSelectedStateS.naming.selectedTagline === "The ground beneath great companies.",
    "Updates selectedTagline"
  );
  assert(
    reSelectedStateS.naming.directions.length === 3,
    "Generated directions remain intact after re-selection"
  );
  assert(reSelectedStateS.version === selectedStateQ.version + 1, "Increments version on re-selection");

  console.log("\n==================================================");
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log("==================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllNamingTests().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
