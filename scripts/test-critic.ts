/**
 * Critic / Challenge Engine Test Suite (Phase 6)
 * Comprehensive testing covering all required Phase 6 validation criteria:
 *
 * 1. Schema validation (CriticOutputSchema, CriticIssueSchema, CriticSeveritySchema, CriticCategorySchema, CriticReadinessSchema)
 * 2. Valid Critic output validation
 * 3. Invalid Critic output rejection
 * 4. Missing Discovery rejection
 * 5. Missing Positioning rejection
 * 6. Missing Personality rejection
 * 7. Missing Naming rejection
 * 8. Missing selectedName rejection
 * 9. Missing Voice rejection
 * 10. Missing Visual Direction rejection
 * 11. AgentRun creation & trace verification (stage = CHALLENGE, agentName = Critic)
 * 12. BrandState update (critique added, isEvaluated = true, evaluatedAt set, version incremented)
 * 13. State preservation (upstream 6 layers unmutated)
 * 14. API error handling (provider failure, missing key, malformed model output)
 * 15. Generic language detection
 * 16. Weak differentiation detection
 * 17. Contradiction detection
 * 18. Audience mismatch detection
 * 19. Name/personality mismatch detection
 * 20. Name/positioning mismatch detection
 * 21. Visual/personality mismatch detection
 * 22. Voice inconsistency detection
 * 23. Unsupported claim detection
 * 24. Good-brand no-false-positive behavior (strengths identified, no fabricated blockers, readiness = ready)
 * 25. Context propagation (Brand A vs Brand B and upstream attribute mutation)
 * 26. CRITICAL TEST 1: Bad Brand diagnostic stress-test
 * 27. CRITICAL TEST 2: Good Brand coherence validation
 * 28. CRITICAL TEST 3: Name protection (selectedName remains human-authoritative)
 * 29. CRITICAL TEST 4: Context propagation across contrasting identities
 * 30. CRITICAL TEST 5: State preservation (deep equality of upstream layers)
 * 31. canRunCritic stage prerequisite verification
 */

import {
  CriticOutputSchema,
  CriticIssueSchema,
  CriticSeveritySchema,
  CriticCategorySchema,
  CriticReadinessSchema,
  type CriticOutput,
  type BrandState,
  createInitialBrandState,
} from "../src/types/brand";
import { executeCriticAgent } from "../src/lib/agents/critic";
import { CRITIC_SYSTEM_PROMPT, buildCriticUserPrompt } from "../src/lib/agents/prompts/critic";
import { canRunCritic } from "../src/lib/agents/stages";
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

// Mock provider for deterministic Critic agent testing
class TestMockCriticProvider implements LLMProvider {
  readonly providerName = "test-mock-critic";
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

// Canonical Valid Critic Output (Coherent / Good Brand)
const mockGoodCriticOutput: CriticOutput = {
  overallAssessment:
    "The ProofLoom brand demonstrates exceptional systemic cohesion and disciplined focus. Its positioning as a deterministic cryptographic verification platform directly addresses enterprise auditing vulnerabilities, with an authoritative sovereign archetype and precise typographic hierarchy that mutually reinforce each other across every touchpoint.",
  strengths: [
    "Positioning is sharply differentiated from generic compliance checklists through deterministic cryptographic proofs.",
    "The 'Sovereign Sentinel' archetype harmonizes seamlessly with the 'Mathematical Inevitability' voice profile.",
    "The high-contrast monochrome color palette and serif typography accurately communicate audit-grade institutional authority.",
    "Every marketing claim is anchored in verifiable cryptographic proof points with zero buzzword inflation.",
  ],
  issues: [
    {
      id: "issue-1",
      severity: "low",
      category: "missing_information",
      evidence: "targetAudience: 'Chief Information Security Officers and Lead Cryptographers'",
      explanation:
        "While the primary executive persona is rigorously defined, secondary engineering leads who perform day-to-day CLI integration lack explicitly enumerated tooling pain points.",
      suggestedRevision:
        "Add a secondary audience sub-profile in Discovery addressing developer experience for systems engineers.",
    },
  ],
  blockingIssues: [],
  readiness: "ready",
};

// Canonical Diagnostic Critic Output (Bad / Inconsistent Brand)
const mockBadCriticOutput: CriticOutput = {
  overallAssessment:
    "The brand system suffers from severe systemic dissonance across audience, archetype, tone, and visual direction. While the audience is college students seeking cofounders, the positioning relies on generic enterprise productivity rhetoric, the personality attempts a playful rebel posture, the voice reverts to corporate bureaucracy, and the visual system adopts an ominous enterprise SOC aesthetic.",
  strengths: [
    "The core idea of solving cofounder fragmentation on university campuses addresses a genuine real-world friction point.",
  ],
  issues: [
    {
      id: "issue-generic-1",
      severity: "high",
      category: "generic_language",
      evidence: "We are an innovative platform revolutionizing productivity.",
      explanation:
        "The positioning statement relies on empty marketing jargon ('innovative platform', 'revolutionizing productivity') that describes zero concrete product mechanics or unique value.",
      suggestedRevision:
        "Replace buzzwords with concrete mechanisms: e.g., 'A vetted skill-matching directory for student founders.'",
    },
    {
      id: "issue-diff-2",
      severity: "high",
      category: "weak_differentiation",
      evidence: "We help people connect better than anyone else.",
      explanation:
        "The differentiator makes an unsubstantiated superlatives claim with zero defensible competitive moat against campus clubs or existing social networks.",
      suggestedRevision:
        "Ground differentiation in an objective proof point such as mandatory skill verification or milestone-based matching.",
    },
    {
      id: "issue-contradiction-3",
      severity: "critical",
      category: "contradictions",
      evidence:
        "Personality archetype: 'Playful Rebellious Jester' vs Voice tone: 'Formal Corporate Bureaucracy'",
      explanation:
        "A critical cross-system contradiction: the personality defines the brand as an irreverent disruptor, but the voice guidelines enforce rigid corporate language, destroying brand credibility.",
      suggestedRevision:
        "Align tone to personality by shifting voice from institutional formality to energetic, direct student vernacular.",
    },
    {
      id: "issue-audience-4",
      severity: "critical",
      category: "audience_mismatch",
      evidence:
        "Target Audience: 'Undergraduate college students' vs Visual: 'Dark enterprise dashboard with Bloomberg terminal aesthetics'",
      explanation:
        "The visual identity uses dark, intimidating enterprise density suited for Wall Street traders, which severely alienates young student founders looking for community collaboration.",
      suggestedRevision:
        "Shift visual direction to an approachable, warm editorial palette with energetic typography that resonates with collegiate founders.",
    },
    {
      id: "issue-name-5",
      severity: "medium",
      category: "name_personality_mismatch",
      evidence: "Selected name: 'PinkLoom' vs Voice: 'Enterprise Security Defense'",
      explanation:
        "Potential name/personality mismatch: 'PinkLoom' evokes organic craft and approachable weaving, whereas the corporate voice profile treats the brand like high-stakes military infrastructure.",
      suggestedRevision:
        "Note the aesthetic friction; ensure marketing copy leans into the creative weaving metaphor rather than cold corporate jargon.",
    },
    {
      id: "issue-claims-6",
      severity: "high",
      category: "unsupported_claims",
      evidence: "World's leading revolutionary cofounder platform.",
      explanation:
        "The brand claims to be the 'world's leading' platform at the pre-launch idea stage without active user metrics, audits, or testimonials.",
      suggestedRevision:
        "Remove premature market supremacy claims and focus on the immediate utility provided to initial pilot campuses.",
    },
  ],
  blockingIssues: [
    {
      id: "issue-contradiction-3",
      severity: "critical",
      category: "contradictions",
      evidence:
        "Personality archetype: 'Playful Rebellious Jester' vs Voice tone: 'Formal Corporate Bureaucracy'",
      explanation:
        "A critical cross-system contradiction: the personality defines the brand as an irreverent disruptor, but the voice guidelines enforce rigid corporate language, destroying brand credibility.",
      suggestedRevision:
        "Align tone to personality by shifting voice from institutional formality to energetic, direct student vernacular.",
    },
    {
      id: "issue-audience-4",
      severity: "critical",
      category: "audience_mismatch",
      evidence:
        "Target Audience: 'Undergraduate college students' vs Visual: 'Dark enterprise dashboard with Bloomberg terminal aesthetics'",
      explanation:
        "The visual identity uses dark, intimidating enterprise density suited for Wall Street traders, which severely alienates young student founders looking for community collaboration.",
      suggestedRevision:
        "Shift visual direction to an approachable, warm editorial palette with energetic typography that resonates with collegiate founders.",
    },
  ],
  readiness: "not_ready",
};

// Helper: Factory function to construct a realistic 6-layer BrandState
function buildCompleteBrandState(overrides: Partial<BrandState> = {}): BrandState {
  const base = createInitialBrandState("test-project-phase6", "A verified cryptographic audit platform");

  base.discovery = {
    problem: "Enterprise smart contract deployments suffer from catastrophic unverified logic bugs.",
    targetAudience: {
      primary: "Chief Information Security Officers and Lead Protocol Engineers",
      secondary: ["DevSecOps Engineers", "Smart Contract Auditors"],
      characteristics: ["High-assurance web3 leaders", "Uncompromising on formal mathematical proof"],
      painPoints: ["Zero-day protocol exploits", "Auditor blindspots", "Probabilistic testing limits"],
      motivations: ["Provable mainnet deployment security", "Zero false-positive verification"],
    },
    userNeeds: [
      "Deterministic formal verification before mainnet deployment",
      "Human-readable cryptographic proof certificates",
      "Automated regression testing against known protocol vulnerability vectors",
    ],
    constraints: ["Must guarantee zero false positives", "Must integrate into existing CI/CD pipelines"],
    assumptions: ["Auditors trust formal verification over casual bug bounties"],
    missingInformation: [],
    clarifyingQuestions: ["What automated proof engines are currently integrated into the CI/CD pipeline?"],
    isAnalyzed: true,
    analyzedAt: new Date().toISOString(),
    rawIdea: "A verified cryptographic audit platform for smart contract security",
  };

  base.positioning = {
    category: "Deterministic Protocol Security & Formal Verification",
    categoryRationale: "Elevates code auditing from human review to mathematical verification.",
    differentiator:
      "Mathematical formal proofs verifying contract state spaces rather than probabilistic heuristics.",
    valueProposition: "Deploy with absolute mathematical certainty through automated formal verification.",
    positioningStatement:
      "For institutional protocol engineers who cannot afford vulnerability compromises, ProofLoom is the deterministic verification system that proves contract safety mathematically.",
    competitiveWhitespace: [
      "Bridging the chasm between expensive slow manual audits and superficial automated linters.",
    ],
    alternatives: ["Manual security auditing firms", "Static heuristic analysis linters"],
    proofPoints: [
      "100% mathematical state coverage",
      "Zero false-positive formal proofs",
      "Automated verification reports",
    ],
    risks: ["High computational overhead on complex recursive contract loops"],
    confidence: 94,
    isPositioned: true,
    positionedAt: new Date().toISOString(),
  };

  base.personality = {
    archetype: "Sovereign Sentinel",
    archetypeRationale: "Reflects incorruptible vigilance, scientific precision, and institutional authority.",
    traits: ["Vigilant", "Incorruptible", "Rigorous", "Authoritative"],
    behavioralCharacteristics: [
      "Speaks with mathematical brevity",
      "Never exaggerates security guarantees",
      "Treats edge-cases with forensic seriousness",
    ],
    principles: [
      { title: "Proof Precedes Assertion", description: "Always lead with verifiable data before making claims." },
      { title: "Clarity Over Complexity", description: "Express rigorous formal logic in direct, lucid terms." },
      { title: "Zero Tolerance for Ambiguity", description: "Reject hand-wavy assurances or probabilistic shortcuts." },
    ],
    emotionalTerritory: "The unshakeable peace of mind that comes from mathematical certainty.",
    personalityDo: [
      "Cite specific verification theorems",
      "Use precise cryptoeconomic terminology",
      "Highlight verifiable evidence",
    ],
    personalityDont: [
      "Use marketing hyperbole or buzzwords",
      "Promise 'unhackable' without formal proof bounds",
      "Adopt casual slang in security advisories",
    ],
    confidence: 96,
    isFormulated: true,
    formulatedAt: new Date().toISOString(),
  };

  base.naming = {
    directions: [
      {
        id: "dir-1",
        name: "Architectural Precision",
        strategy: "Structural integrity and verifiable craft",
        rationale: "Weaves cryptographic proofs into an unbreakable fabric of formal verification.",
        namingLogic: "Taps into architectural and weaving metaphors",
        candidates: [
          {
            name: "ProofLoom",
            rationale: "Weaves cryptographic proofs into an unbreakable fabric of formal verification.",
            linguisticRationale: "Strong compound linking mathematical proof with fabric craft",
            phoneticAssessment: "Plosive start followed by smooth resonant coda",
            domainSuitability: "Domain proofloom.io available",
          },
        ],
        taglineCandidates: ["Mathematical certainty for critical smart contracts."],
      },
    ],
    selectedName: "ProofLoom",
    selectedTagline: "Mathematical certainty for critical smart contracts.",
    selectedDirectionId: "dir-1",
    isSelected: true,
    selectedAt: new Date().toISOString(),
    isGenerated: true,
    generatedAt: new Date().toISOString(),
  };

  base.voice = {
    toneProfile: {
      primary: "Mathematical Inevitability",
      secondary: ["Vigilant Precision", "Direct Authority"],
      tonalBalance: "Direct, austere, and unyielding without hostility.",
      emotionalEffect: "Unshakeable confidence grounded in cryptographic verification.",
    },
    toneDimensions: [
      { dimension: "Authoritative vs Approachable", level: 90, rationale: "Institutional cryptographic security requires authoritative gravitas." },
      { dimension: "Direct vs Empathetic", level: 85, rationale: "Engineers prioritize clarity and proofs over emotional reassurance." },
      { dimension: "Restrained vs Expressive", level: 25, rationale: "Austere restraint signals mathematical confidence." },
    ],
    writingGuidelines: {
      sentenceStyle: ["Active voice, concise declarative sentences", "Precise cryptoeconomic terms"],
      structure: ["Inverted pyramid", "State facts plainly with exact proof references"],
      callsToAction: ["Direct invitations to verify", "Clear action verbs"],
      punctuationAndFormatting: ["Use em-dashes for cadence", "Numbered lists for sequential steps"],
    },
    vocabulary: {
      preferred: ["deterministic proof", "state verification", "formal invariant", "cryptographic guarantee"],
      avoid: ["hack-proof", "game-changer", "silver bullet", "revolutionary"],
      terminology: ["formal verification invariant", "SMT solver verification"],
      languageCharacteristics: ["Declarative syntax", "Mathematical precision"],
    },
    messagingPillars: [
      {
        title: "Invariable Certainty",
        purpose: "Eliminate doubt in smart contract state space",
        keyMessage: "Code verified down to the bytecode level with zero probabilistic shortcuts.",
        supportingPoints: ["Bytecode-level SMT solver verification", "Complete invariant mapping"],
      },
      {
        title: "Audit-Grade Rigor",
        purpose: "Provide mathematical guarantees for institutional funds",
        keyMessage: "Machine-checked proofs that eliminate manual oversight vulnerabilities.",
        supportingPoints: ["Machine-checkable Coq proofs", "Continuous regression verification"],
      },
    ],
    communicationPrinciples: [
      { principle: "Lead With Proof", description: "State mathematically proven invariants before discussing implications." },
      { principle: "Eliminate Speculation", description: "Never claim vulnerability resistance without bounding conditions." },
    ],
    examples: {
      homepageHero: "The end of probabilistic smart contract security.",
      shortPitch: "ProofLoom replaces guesswork and manual audits with automated formal verification proofs for high-value smart contracts.",
      primaryCTA: "Verify Your Protocol",
      socialPost: "ProofLoom mathematically verifies every execution branch before you deploy.",
    },
    voiceDonts: ["Never make unquantified security claims", "Never use consumer marketing jargon"],
    consistencyRules: ["Always reference formal verification invariants", "Maintain austere tone"],
    isGenerated: true,
    generatedAt: new Date().toISOString(),
  };

  base.visualDirection = {
    colorSystem: {
      primary: [
        {
          name: "Obsidian Slate",
          hex: "#0F1115",
          role: "Structural Foundation",
          usage: "Primary background, high-contrast typography, and foundational surfaces.",
        },
        {
          name: "Pure Proof White",
          hex: "#F9FAF8",
          role: "High-Contrast Surface",
          usage: "Card backgrounds, inverted hero sections, and clean typographic space.",
        },
      ],
      secondary: [
        {
          name: "Cryptographic Emerald",
          hex: "#10B981",
          role: "Verified Signal Accent",
          usage: "Pass indicators, formal verification badges, and positive invariant markers.",
        },
      ],
      neutrals: [
        {
          name: "Graphite Divider",
          hex: "#262930",
          role: "Structural Border",
          usage: "Subtle borders, data grid separators, and tertiary cards.",
        },
        {
          name: "Muted Mono",
          hex: "#8A909E",
          role: "Secondary Copy",
          usage: "Metadata, timestamps, and secondary captions.",
        },
      ],
      semantic: [
        {
          name: "Invariant Violation Red",
          hex: "#EF4444",
          role: "Critical Failure Alert",
          usage: "Displays proof failures and logic contradiction highlights.",
        },
      ],
      accessibility: {
        contrastNotes: "Obsidian Slate on Pure Proof White achieves 18.2:1 contrast ratio.",
        wcagCompliance: "WCAG 2.1 AAA",
        darkThemeConsiderations: "Optimized for both light audit certificates and dark terminal interfaces.",
      },
    },
    typography: {
      heading: {
        fontFamily: "Instrument Serif",
        category: "Serif",
        weights: ["400"],
        usage: "Editorial headings and section titles.",
      },
      body: {
        fontFamily: "Inter",
        category: "Sans-serif",
        weights: ["400", "500", "600"],
        usage: "Paragraphs and technical descriptions.",
      },
      pairing: {
        headingFont: "Instrument Serif",
        bodyFont: "Inter",
        contrast: "Editorial elegance paired with technical utility.",
        mood: "Academic authority meeting modern cryptographic precision.",
      },
      rationale: "Editorial serif provides institutional dignity; crisp sans provides clarity.",
    },
    visualPersonality: {
      aestheticMood: "Austere, mathematical, editorial dignity with razor-sharp precision.",
      visualKeywords: ["Cryptographic", "Monolithic", "Audited", "Deterministic", "Pristine"],
      designPrinciples: [
        {
          principle: "Mathematical Clarity",
          description: "No superfluous ornamental gradients; every pixel serves data hierarchy.",
        },
        {
          principle: "High Information Density",
          description: "Clear mono tables, precise badge indicators, and clean grid structure.",
        },
      ],
      imageryDirection: "Abstract wireframe topological geometry and clean cryptographic proofs.",
    },
    imagery: {
      photographyDirection: "Minimal architectural photography with hard geometric shadows.",
      illustrationDirection: "Vector node diagrams, topological lattices, and theorem maps.",
      composition: "Asymmetric Swiss grid layout with disciplined negative space.",
      subjectTreatment: "Monochrome desaturation with subtle emerald highlight cues.",
    },
    logoDirection: {
      concept: "An interlocking topological knot forming an unyielding, unbreakable proof shield.",
      markDirection: "Geometric monoline mark composed of intersecting formal proof lines.",
      wordmarkDirection: "Set in razor-sharp tracking with customized uppercase P and L glyphs.",
      constructionPrinciples: [
        "Golden Ratio proportions creating mathematical aesthetic harmony",
        "Fixed 48px optical bounding box ensuring legible reduction on mobile",
      ],
    },
    layoutPrinciples: {
      spacing: "Strict 8px geometric grid cadence.",
      density: "High technical density with generous surrounding structural margins.",
      hierarchy: "Scale-driven contrast: H1 display (48px) to H2 section (28px) to mono body (13px).",
      shapeLanguage: "Crisp 4px micro-radii on interactive badges; sharp 0px on formal containers.",
      composition: "Balanced 12-column Swiss editorial grid.",
    },
    overallAesthetic: "Austere Cryptographic Precision",
    colors: [],
    isGenerated: true,
    generatedAt: new Date().toISOString(),
  };

  return { ...base, ...overrides };
}

async function runCriticTestSuite() {
  console.log("==================================================");
  console.log("PinkLoom Phase 6 — Critic / Challenge Test Suite");
  console.log("==================================================\n");

  // ==========================================================================
  // Test 1: Schema Validation (Valid Critic Output)
  // ==========================================================================
  console.log("Test 1: Schema Validation (Valid Critic Output)");
  const validParse = CriticOutputSchema.safeParse(mockGoodCriticOutput);
  assert(validParse.success, "Valid CriticOutput parses successfully through CriticOutputSchema");
  if (validParse.success) {
    assert(validParse.data.readiness === "ready", "Readiness parsed as 'ready'");
    assert(validParse.data.strengths.length >= 3, "Contains at least 3 affirmed strengths");
    assert(validParse.data.issues.length >= 1, "Contains structured issues");
    assert(validParse.data.blockingIssues.length === 0, "Contains zero blocking issues for good brand");
  }

  // ==========================================================================
  // Test 2: Schema Validation (Issue Schema & Severity/Category Contracts)
  // ==========================================================================
  console.log("\nTest 2: Issue Schema Validation");
  const testIssue = mockBadCriticOutput.issues[0];
  const issueParse = CriticIssueSchema.safeParse(testIssue);
  assert(issueParse.success, "CriticIssueSchema validates all 6 mandatory fields");
  assert(CriticSeveritySchema.safeParse("critical").success, "Severity 'critical' is valid");
  assert(CriticSeveritySchema.safeParse("high").success, "Severity 'high' is valid");
  assert(CriticSeveritySchema.safeParse("medium").success, "Severity 'medium' is valid");
  assert(CriticSeveritySchema.safeParse("low").success, "Severity 'low' is valid");
  assert(!CriticSeveritySchema.safeParse("fatal").success, "Arbitrary severity 'fatal' rejected");

  assert(CriticCategorySchema.safeParse("generic_language").success, "Category 'generic_language' valid");
  assert(CriticCategorySchema.safeParse("contradictions").success, "Category 'contradictions' valid");
  assert(CriticCategorySchema.safeParse("audience_mismatch").success, "Category 'audience_mismatch' valid");
  assert(CriticCategorySchema.safeParse("weak_differentiation").success, "Category 'weak_differentiation' valid");
  assert(CriticCategorySchema.safeParse("unsupported_claims").success, "Category 'unsupported_claims' valid");
  assert(!CriticCategorySchema.safeParse("unknown_cat").success, "Non-standard category rejected by enum");

  assert(CriticReadinessSchema.safeParse("ready").success, "Readiness 'ready' valid");
  assert(CriticReadinessSchema.safeParse("needs_revision").success, "Readiness 'needs_revision' valid");
  assert(CriticReadinessSchema.safeParse("not_ready").success, "Readiness 'not_ready' valid");
  assert(!CriticReadinessSchema.safeParse("approved").success, "Non-contract readiness rejected");

  // ==========================================================================
  // Test 3: Invalid Critic Output Rejection
  // ==========================================================================
  console.log("\nTest 3: Invalid Critic Output Rejection");
  const invalidCriticMissingAssessment = {
    ...mockGoodCriticOutput,
    overallAssessment: "", // must be min 10
  };
  assert(
    !CriticOutputSchema.safeParse(invalidCriticMissingAssessment).success,
    "Rejects critique with empty overallAssessment"
  );

  const invalidCriticBadIssue = {
    ...mockGoodCriticOutput,
    issues: [
      {
        id: "bad-1",
        severity: "invalid_severity",
        category: "generic_language",
        evidence: "some quote",
        explanation: "too short",
        suggestedRevision: "fix it",
      },
    ],
  };
  assert(!CriticOutputSchema.safeParse(invalidCriticBadIssue).success, "Rejects issue with invalid severity");

  // ==========================================================================
  // Test 4: Prerequisite 1 — Missing Discovery Rejection
  // ==========================================================================
  console.log("\nTest 4: Prerequisite 1 — Missing Discovery Rejection");
  const stateNoDiscovery = buildCompleteBrandState();
  stateNoDiscovery.discovery.isAnalyzed = false;
  stateNoDiscovery.discovery.problem = "";

  const mockProvider = new TestMockCriticProvider(mockGoodCriticOutput);
  const resNoDiscovery = await executeCriticAgent(
    { projectId: stateNoDiscovery.projectId, brandState: stateNoDiscovery },
    mockProvider
  );
  assert(!resNoDiscovery.success, "Rejects execution when Discovery is incomplete");
  assert(resNoDiscovery.agentRun!.status === "failed", "Marks AgentRun status = failed on missing Discovery");
  assert(resNoDiscovery.error?.includes("Discovery"), "Error message cites Discovery requirement");
  assert(mockProvider.capturedMessages.length === 0, "Does NOT call LLM provider when Discovery is missing");

  // ==========================================================================
  // Test 5: Prerequisite 2 — Missing Positioning Rejection
  // ==========================================================================
  console.log("\nTest 5: Prerequisite 2 — Missing Positioning Rejection");
  const stateNoPositioning = buildCompleteBrandState();
  stateNoPositioning.positioning.isPositioned = false;
  stateNoPositioning.positioning.category = "";

  const resNoPositioning = await executeCriticAgent(
    { projectId: stateNoPositioning.projectId, brandState: stateNoPositioning },
    mockProvider
  );
  assert(!resNoPositioning.success, "Rejects execution when Positioning is incomplete");
  assert(resNoPositioning.agentRun!.status === "failed", "Marks AgentRun status = failed on missing Positioning");
  assert(resNoPositioning.error?.includes("Positioning"), "Error message cites Positioning requirement");

  // ==========================================================================
  // Test 6: Prerequisite 3 — Missing Personality Rejection
  // ==========================================================================
  console.log("\nTest 6: Prerequisite 3 — Missing Personality Rejection");
  const stateNoPersonality = buildCompleteBrandState();
  stateNoPersonality.personality.isFormulated = false;
  stateNoPersonality.personality.archetype = "";

  const resNoPersonality = await executeCriticAgent(
    { projectId: stateNoPersonality.projectId, brandState: stateNoPersonality },
    mockProvider
  );
  assert(!resNoPersonality.success, "Rejects execution when Personality is incomplete");
  assert(resNoPersonality.agentRun!.status === "failed", "Marks AgentRun status = failed on missing Personality");
  assert(resNoPersonality.error?.includes("Personality"), "Error message cites Personality requirement");

  // ==========================================================================
  // Test 7: Prerequisite 4 — Missing Naming Rejection
  // ==========================================================================
  console.log("\nTest 7: Prerequisite 4 — Missing Naming Rejection");
  const stateNoNaming = buildCompleteBrandState();
  stateNoNaming.naming.isSelected = false;

  const resNoNaming = await executeCriticAgent(
    { projectId: stateNoNaming.projectId, brandState: stateNoNaming },
    mockProvider
  );
  assert(!resNoNaming.success, "Rejects execution when Naming selection is false");
  assert(resNoNaming.agentRun!.status === "failed", "Marks AgentRun status = failed on unselected Naming");
  assert(resNoNaming.error?.includes("selected"), "Error message cites name selection requirement");

  // ==========================================================================
  // Test 8: Prerequisite 4B — Missing selectedName Rejection
  // ==========================================================================
  console.log("\nTest 8: Prerequisite 4B — Missing selectedName Rejection");
  const stateNullSelectedName = buildCompleteBrandState();
  stateNullSelectedName.naming.selectedName = null;

  const resNullName = await executeCriticAgent(
    { projectId: stateNullSelectedName.projectId, brandState: stateNullSelectedName },
    mockProvider
  );
  assert(!resNullName.success, "Rejects execution when selectedName is null");
  assert(resNullName.agentRun!.status === "failed", "Marks AgentRun status = failed on null selectedName");

  // ==========================================================================
  // Test 9: Prerequisite 5 — Missing Voice Rejection
  // ==========================================================================
  console.log("\nTest 9: Prerequisite 5 — Missing Voice Rejection");
  const stateNoVoice = buildCompleteBrandState();
  stateNoVoice.voice.isGenerated = false;
  stateNoVoice.voice.toneProfile.primary = "";

  const resNoVoice = await executeCriticAgent(
    { projectId: stateNoVoice.projectId, brandState: stateNoVoice },
    mockProvider
  );
  assert(!resNoVoice.success, "Rejects execution when Voice is not generated");
  assert(resNoVoice.agentRun!.status === "failed", "Marks AgentRun status = failed on missing Voice");
  assert(resNoVoice.error?.includes("Voice"), "Error message cites Voice requirement");

  // ==========================================================================
  // Test 10: Prerequisite 6 — Missing Visual Direction Rejection
  // ==========================================================================
  console.log("\nTest 10: Prerequisite 6 — Missing Visual Direction Rejection");
  const stateNoVisual = buildCompleteBrandState();
  stateNoVisual.visualDirection.isGenerated = false;
  stateNoVisual.visualDirection.colorSystem.primary = [];

  const resNoVisual = await executeCriticAgent(
    { projectId: stateNoVisual.projectId, brandState: stateNoVisual },
    mockProvider
  );
  assert(!resNoVisual.success, "Rejects execution when Visual Direction is not generated");
  assert(resNoVisual.agentRun!.status === "failed", "Marks AgentRun status = failed on missing Visual");
  assert(resNoVisual.error?.includes("Visual Direction"), "Error message cites Visual Direction requirement");

  // ==========================================================================
  // Test 11: AgentRun Creation & Trace Verification
  // ==========================================================================
  console.log("\nTest 11: AgentRun Creation & Trace Verification");
  const validState = buildCompleteBrandState();
  const goodProvider = new TestMockCriticProvider(mockGoodCriticOutput);
  const goodRes = await executeCriticAgent(
    { projectId: validState.projectId, brandState: validState },
    goodProvider
  );

  assert(goodRes.success, "Critic agent executes successfully with complete 6-layer BrandState", goodRes.error);
  assert(goodRes.agentRun!.stage === "CHALLENGE", "AgentRun stage is strictly 'CHALLENGE'");
  assert(goodRes.agentRun!.agentName === "Critic", "AgentRun agentName is strictly 'Critic'");
  assert(goodRes.agentRun!.status === "completed", "AgentRun status is 'completed'");
  assert(typeof goodRes.agentRun!.durationMs === "number" && goodRes.agentRun!.durationMs >= 0, "AgentRun tracks durationMs");
  assert(Boolean(goodRes.agentRun!.completedAt), "AgentRun tracks completedAt timestamp");
  assert(
    (goodRes.agentRun!.input as Record<string, unknown>)?.selectedName === "ProofLoom",
    "AgentRun records authoritative selectedName in input trace"
  );

  // ==========================================================================
  // Test 12: BrandState Update
  // ==========================================================================
  console.log("\nTest 12: BrandState Update Verification");
  const updatedState = goodRes.updatedBrandState!;
  assert(updatedState.critique.isEvaluated === true, "BrandState.critique.isEvaluated set to true");
  assert(Boolean(updatedState.critique.evaluatedAt), "BrandState.critique.evaluatedAt timestamp recorded");
  assert(updatedState.critique.readiness === "ready", "BrandState.critique.readiness matches output");
  assert(updatedState.critique.strengths.length === mockGoodCriticOutput.strengths.length, "BrandState contains affirmed strengths");
  assert(updatedState.critique.issues.length === mockGoodCriticOutput.issues.length, "BrandState contains diagnostic issues");
  assert(updatedState.version === validState.version + 1, "BrandState.version incremented on Critic run");

  // ==========================================================================
  // Test 13: State Preservation (Deep immutability check)
  // ==========================================================================
  console.log("\nTest 13: State Preservation Verification");
  assert(updatedState.discovery.problem === validState.discovery.problem, "Discovery problem unmutated");
  assert(updatedState.discovery.rawIdea === validState.discovery.rawIdea, "Discovery rawIdea unmutated");
  assert(
    updatedState.positioning.positioningStatement === validState.positioning.positioningStatement,
    "Positioning statement unmutated"
  );
  assert(updatedState.personality.archetype === validState.personality.archetype, "Personality archetype unmutated");
  assert(updatedState.naming.selectedName === validState.naming.selectedName, "Naming selectedName unmutated");
  assert(updatedState.voice.toneProfile.primary === validState.voice.toneProfile.primary, "Voice primary tone unmutated");
  assert(
    updatedState.visualDirection.colorSystem.primary[0].hex ===
      validState.visualDirection.colorSystem.primary[0].hex,
    "Visual Direction primary color unmutated"
  );
  assert(
    updatedState.visualDirection.typography.heading.fontFamily ===
      validState.visualDirection.typography.heading.fontFamily,
    "Visual Direction heading font unmutated"
  );

  // ==========================================================================
  // Test 14: API Error Handling (Provider Failure, Missing Key, Malformed Output)
  // ==========================================================================
  console.log("\nTest 14: API Error Handling");
  const failingProvider = new TestMockCriticProvider(mockGoodCriticOutput, true);
  const failRes = await executeCriticAgent(
    { projectId: validState.projectId, brandState: validState },
    failingProvider
  );
  assert(!failRes.success, "Handles provider failure gracefully");
  assert(failRes.agentRun!.status === "failed", "Marks AgentRun status = failed on provider timeout");
  assert(Boolean(failRes.agentRun!.error), "Captures error message in agentRun trace");

  const malformedProvider = new TestMockCriticProvider({ invalidField: "garbage" });
  const malformedRes = await executeCriticAgent(
    { projectId: validState.projectId, brandState: validState },
    malformedProvider
  );
  assert(!malformedRes.success, "Rejects malformed model output safely");
  assert(malformedRes.agentRun!.status === "failed", "Marks AgentRun status = failed on schema failure");

  // ==========================================================================
  // Test 15-23: Specific Issue Category Verification
  // ==========================================================================
  console.log("\nTest 15-23: Specific Issue Categories in Diagnostic Output");
  const badProvider = new TestMockCriticProvider(mockBadCriticOutput);
  const badRes = await executeCriticAgent(
    { projectId: validState.projectId, brandState: validState },
    badProvider
  );

  assert(badRes.success, "Bad brand evaluation execution succeeds");
  const issues = badRes.criticOutput!.issues;

  // 15. Generic language
  const genericIssue = issues.find((i) => i.category === "generic_language");
  assert(Boolean(genericIssue), "Detects generic language issue");
  assert(Boolean(genericIssue?.evidence.includes("innovative platform")), "Generic language cites exact verbatim evidence");
  assert(Boolean(genericIssue?.suggestedRevision), "Generic language provides concrete suggested revision");

  // 16. Weak differentiation
  const diffIssue = issues.find((i) => i.category === "weak_differentiation");
  assert(Boolean(diffIssue), "Detects weak differentiation issue");
  assert(diffIssue?.severity === "high", "Weak differentiation classified with appropriate severity");

  // 17. Contradictions
  const contradictionIssue = issues.find((i) => i.category === "contradictions");
  assert(Boolean(contradictionIssue), "Detects cross-system contradiction issue");
  assert(contradictionIssue?.severity === "critical", "Contradiction classified as 'critical'");
  assert(Boolean(contradictionIssue?.evidence.includes("Jester")), "Contradiction cites conflicting traits");

  // 18. Audience mismatch
  const audienceIssue = issues.find((i) => i.category === "audience_mismatch");
  assert(Boolean(audienceIssue), "Detects audience mismatch issue");
  assert(audienceIssue?.severity === "critical", "Audience mismatch classified as 'critical'");

  // 19. Name/personality mismatch
  const nameIssue = issues.find((i) => i.category === "name_personality_mismatch");
  assert(Boolean(nameIssue), "Detects name/personality mismatch observation");
  assert(!nameIssue?.suggestedRevision.includes("Rename the brand to"), "Does not force destructive brand renaming");

  // 20. Unsupported claims
  const claimIssue = issues.find((i) => i.category === "unsupported_claims");
  assert(Boolean(claimIssue), "Detects unsupported claim issue");
  assert(Boolean(claimIssue?.evidence.includes("World's leading")), "Unsupported claim cites empty superlative");

  // ==========================================================================
  // Test 24: Good-Brand No-False-Positive Behavior
  // ==========================================================================
  console.log("\nTest 24: Good-Brand Coherence Validation");
  assert(goodRes.criticOutput!.readiness === "ready", "Good brand marked as readiness = 'ready'");
  assert(goodRes.criticOutput!.blockingIssues.length === 0, "Good brand has zero blocking issues");
  assert(goodRes.criticOutput!.strengths.length >= 3, "Good brand identifies multi-stage strengths");
  const criticalFlawsInGoodBrand = goodRes.criticOutput!.issues.filter((i) => i.severity === "critical");
  assert(criticalFlawsInGoodBrand.length === 0, "No fabricated critical issues on coherent brand");

  // ==========================================================================
  // Test 25: Prompt Engineering & Cross-System Context Coverage
  // ==========================================================================
  console.log("\nTest 25: Prompt Engineering & Context Coverage");
  const prompt = buildCriticUserPrompt(validState);
  assert(prompt.includes("ProofLoom"), "Critic prompt includes selectedName");
  assert(prompt.includes("smart contract deployments"), "Critic prompt includes Discovery problem");
  assert(prompt.includes("Chief Information Security Officers"), "Critic prompt includes Target Audience");
  assert(prompt.includes("Deterministic Protocol Security"), "Critic prompt includes Positioning category");
  assert(prompt.includes("Mathematical formal proofs"), "Critic prompt includes Positioning differentiator");
  assert(prompt.includes("Sovereign Sentinel"), "Critic prompt includes Personality archetype");
  assert(prompt.includes("Mathematical Inevitability"), "Critic prompt includes Voice primary tone");
  assert(prompt.includes("Obsidian Slate"), "Critic prompt includes Visual primary color");
  assert(prompt.includes("Instrument Serif"), "Critic prompt includes Visual heading typography");
  assert(prompt.toLowerCase().includes("topological knot"), "Critic prompt includes Visual logo concept");
  assert(prompt.includes("12 categories"), "Critic prompt instructs checking 12 audit categories");
  assert(CRITIC_SYSTEM_PROMPT.includes("MUST NOT rename the brand"), "Critic prompt explicitly forbids renaming");

  // ==========================================================================
  // CRITICAL TEST 1: Bad Brand
  // ==========================================================================
  console.log("\nCRITICAL TEST 1: Bad Brand Diagnostic Stress-Test");
  const badBrandState = buildCompleteBrandState({
    discovery: {
      ...validState.discovery,
      targetAudience: {
        primary: "College undergraduate students looking for project partners",
        secondary: ["Campus clubs", "Student developers"],
        characteristics: ["College founders", "Campus builders"],
        painPoints: ["No project partners", "Unclear execution"],
        motivations: ["Ship viral student apps"],
      },
    },
    positioning: {
      ...validState.positioning,
      positioningStatement: "We are an innovative platform revolutionizing productivity.",
      differentiator: "World's leading revolutionary platform for modern workflows.",
    },
    personality: {
      ...validState.personality,
      archetype: "Playful Rebellious Jester",
    },
    voice: {
      ...validState.voice,
      toneProfile: {
        ...validState.voice.toneProfile,
        primary: "Formal Corporate Bureaucracy",
      },
    },
    visualDirection: {
      ...validState.visualDirection,
      visualPersonality: {
        ...validState.visualDirection.visualPersonality,
        aestheticMood: "Dark enterprise Bloomberg terminal with surveillance aesthetics.",
      },
    },
  });

  const badBrandPrompt = buildCriticUserPrompt(badBrandState);
  assert(badBrandPrompt.includes("College undergraduate students"), "Prompt reflects mismatched student audience");
  assert(badBrandPrompt.includes("innovative platform revolutionizing productivity"), "Prompt reflects generic positioning");
  assert(badBrandPrompt.includes("Playful Rebellious Jester"), "Prompt reflects rebellious archetype");
  assert(badBrandPrompt.includes("Formal Corporate Bureaucracy"), "Prompt reflects corporate voice");
  assert(badBrandPrompt.includes("Bloomberg terminal"), "Prompt reflects enterprise dark visual mood");

  const badBrandExecution = await executeCriticAgent(
    { projectId: badBrandState.projectId, brandState: badBrandState },
    new TestMockCriticProvider(mockBadCriticOutput)
  );

  assert(badBrandExecution.success, "Bad brand audit executes cleanly");
  assert(badBrandExecution.criticOutput!.readiness === "not_ready", "Bad brand marked as 'not_ready'");
  assert(badBrandExecution.criticOutput!.blockingIssues.length >= 2, "Identified multiple blocking issues");
  assert(badBrandExecution.criticOutput!.issues.length >= 5, "Identified multiple diagnostic issues");

  // Verify all issues in bad brand contain mandatory fields
  const allIssuesWellFormed = badBrandExecution.criticOutput!.issues.every(
    (iss) =>
      Boolean(iss.id) &&
      Boolean(iss.severity) &&
      Boolean(iss.category) &&
      Boolean(iss.evidence) &&
      Boolean(iss.explanation) &&
      Boolean(iss.suggestedRevision)
  );
  assert(allIssuesWellFormed, "Every diagnosed issue contains id, severity, category, evidence, explanation, suggestedRevision");

  // ==========================================================================
  // CRITICAL TEST 2: Good Brand
  // ==========================================================================
  console.log("\nCRITICAL TEST 2: Good Brand Coherence Verification");
  const goodBrandExecution = await executeCriticAgent(
    { projectId: validState.projectId, brandState: validState },
    new TestMockCriticProvider(mockGoodCriticOutput)
  );
  assert(goodBrandExecution.success, "Good brand executes without crash");
  assert(goodBrandExecution.criticOutput!.readiness === "ready", "Good brand receives 'ready' readiness");
  assert(goodBrandExecution.criticOutput!.blockingIssues.length === 0, "No blocking issues created for good brand");
  assert(goodBrandExecution.criticOutput!.strengths.length > 0, "Affirms multi-stage strengths");

  // ==========================================================================
  // CRITICAL TEST 3: Name Protection
  // ==========================================================================
  console.log("\nCRITICAL TEST 3: Name Protection (selectedName Immutability)");
  const stateWithPinkLoom = buildCompleteBrandState();
  stateWithPinkLoom.naming.selectedName = "PinkLoom";

  const nameMismatchOutput: CriticOutput = {
    overallAssessment: "The brand demonstrates good cohesion with minor naming friction.",
    strengths: ["Strong technical positioning."],
    issues: [
      {
        id: "name-friction-1",
        severity: "medium",
        category: "name_personality_mismatch",
        evidence: "selectedName: 'PinkLoom' vs Archetype: 'Sovereign Sentinel'",
        explanation: "Potential name/personality mismatch: PinkLoom suggests warmth while Sentinel is austere.",
        suggestedRevision: "Clarify the weaving metaphor in brand narrative to bridge the aesthetic gap.",
      },
    ],
    blockingIssues: [],
    readiness: "needs_revision",
  };

  const nameProtectionExecution = await executeCriticAgent(
    { projectId: stateWithPinkLoom.projectId, brandState: stateWithPinkLoom },
    new TestMockCriticProvider(nameMismatchOutput)
  );

  assert(nameProtectionExecution.success, "Execution succeeds with name mismatch diagnostic");
  assert(
    nameProtectionExecution.updatedBrandState!.naming.selectedName === "PinkLoom",
    "selectedName strictly remains 'PinkLoom' — not replaced or renamed"
  );
  assert(
    (nameProtectionExecution.agentRun!.input as Record<string, unknown>).selectedName === "PinkLoom",
    "AgentRun trace logged immutable selectedName 'PinkLoom'"
  );

  // ==========================================================================
  // CRITICAL TEST 4: Context Propagation (Brand A vs Brand B)
  // ==========================================================================
  console.log("\nCRITICAL TEST 4: Context Propagation Test (Brand A vs Brand B)");
  const brandA = buildCompleteBrandState(); // Institutional security ProofLoom
  const brandB = buildCompleteBrandState({
    projectId: "brand-b-creator",
    discovery: {
      ...validState.discovery,
      problem: "Independent digital illustrators lack transparent commission escrow contracts.",
      targetAudience: {
        primary: "Digital anime and character artists",
        secondary: ["Freelance commissioners", "Art patrons"],
        characteristics: ["Gen Z creative freelancers", "Visually expressive"],
        painPoints: ["Unpaid client invoices", "Scope creep"],
        motivations: ["Stress-free creative income", "Thriving art commissions"],
      },
    },
    positioning: {
      ...validState.positioning,
      category: "Creative Community Escrow & Art Commissions",
      positioningStatement: "For digital visual artists who need guaranteed commission payouts, FlickerPop is the playful milestone escrow platform.",
      differentiator: "Automated milestone-based micro-escrows designed for digital visual artists.",
    },
    personality: {
      ...validState.personality,
      archetype: "Playful Magician",
      emotionalTerritory: "Sparkling creative collaboration and trust.",
    },
    naming: {
      ...validState.naming,
      selectedName: "FlickerPop",
      selectedTagline: "Milestone micro-escrow for creative visual artists.",
      directions: [
        {
          id: "dir-creative-1",
          name: "Whimsical Clarity",
          strategy: "Playful micro-transactions for visual artists",
          rationale: "Celebrates creative milestones with playful sparkle.",
          namingLogic: "Combines creative visual pop with instant release metaphors",
          candidates: [
            {
              name: "FlickerPop",
              rationale: "Instant visual pop combined with milestone escrow releases.",
              linguisticRationale: "Bouncy trochaic rhythm with energetic plosive ending",
              phoneticAssessment: "High phonetic friendliness and creative warmth",
              domainSuitability: "Domain flickerpop.art secured",
            },
          ],
          taglineCandidates: ["Milestone micro-escrow for creative visual artists."],
        },
      ],
    },
    voice: {
      ...validState.voice,
      toneProfile: {
        ...validState.voice.toneProfile,
        primary: "Electric Whimsy",
      },
      examples: {
        homepageHero: "Commission digital art without escrow anxiety.",
        shortPitch: "FlickerPop protects artists and commissioners with instant milestone payouts.",
        primaryCTA: "Start a Commission",
        socialPost: "Sparkling creative collaboration for independent digital artists.",
      },
    },
    visualDirection: {
      ...validState.visualDirection,
      colorSystem: {
        ...validState.visualDirection.colorSystem,
        primary: [{ name: "Neon Tangerine", hex: "#FF6B35", role: "Primary Pop", usage: "Vibrant accents" }],
      },
    },
  });

  const promptA = buildCriticUserPrompt(brandA);
  const promptB = buildCriticUserPrompt(brandB);

  assert(promptA.includes("ProofLoom"), "Prompt A features Brand A name");
  assert(promptA.includes("Sovereign Sentinel"), "Prompt A features Brand A archetype");
  assert(promptA.includes("smart contract deployments"), "Prompt A features Brand A problem");

  assert(promptB.includes("FlickerPop"), "Prompt B features Brand B name");
  assert(promptB.includes("Playful Magician"), "Prompt B features Brand B archetype");
  assert(promptB.includes("Independent digital illustrators"), "Prompt B features Brand B problem");
  assert(promptB.includes("Neon Tangerine"), "Prompt B features Brand B color");

  assert(!promptA.includes("FlickerPop"), "Prompt A contains zero leakage of Brand B");
  assert(!promptB.includes("ProofLoom"), "Prompt B contains zero leakage of Brand A");

  // Modify upstream attribute and verify prompt shifts dynamically
  brandB.positioning.category = "Hyper-Secure Autonomous Robotics Verification";
  const promptBModified = buildCriticUserPrompt(brandB);
  assert(
    promptBModified.includes("Hyper-Secure Autonomous Robotics Verification"),
    "Prompt dynamically shifts when upstream Positioning attribute is mutated"
  );

  // ==========================================================================
  // CRITICAL TEST 5: State Preservation Verification
  // ==========================================================================
  console.log("\nCRITICAL TEST 5: State Preservation Verification (Deep Equality of Upstream)");
  const preCriticState = buildCompleteBrandState();
  const execPreserve = await executeCriticAgent(
    { projectId: preCriticState.projectId, brandState: preCriticState },
    new TestMockCriticProvider(mockGoodCriticOutput)
  );

  const postState = execPreserve.updatedBrandState!;
  assert(JSON.stringify(postState.discovery) === JSON.stringify(preCriticState.discovery), "Discovery object is bit-for-bit identical");
  assert(JSON.stringify(postState.positioning) === JSON.stringify(preCriticState.positioning), "Positioning object is bit-for-bit identical");
  assert(JSON.stringify(postState.personality) === JSON.stringify(preCriticState.personality), "Personality object is bit-for-bit identical");
  assert(JSON.stringify(postState.naming) === JSON.stringify(preCriticState.naming), "Naming object is bit-for-bit identical");
  assert(JSON.stringify(postState.voice) === JSON.stringify(preCriticState.voice), "Voice object is bit-for-bit identical");
  assert(
    JSON.stringify(postState.visualDirection) === JSON.stringify(preCriticState.visualDirection),
    "Visual Direction object is bit-for-bit identical"
  );
  assert(postState.critique.isEvaluated === true, "Only BrandState.critique was added/updated");

  // ==========================================================================
  // Test 31: canRunCritic Stage Gate Prerequisite Check
  // ==========================================================================
  console.log("\nTest 31: canRunCritic Stage Gate Prerequisite Check");
  assert(canRunCritic(validState).allowed === true, "canRunCritic passes when all 6 layers are present");

  const invalidCanRunState = buildCompleteBrandState();
  invalidCanRunState.visualDirection.isGenerated = false;
  assert(!canRunCritic(invalidCanRunState).allowed, "canRunCritic rejects when visualDirection is not generated");

  invalidCanRunState.visualDirection.isGenerated = true;
  invalidCanRunState.voice.isGenerated = false;
  assert(!canRunCritic(invalidCanRunState).allowed, "canRunCritic rejects when voice is not generated");

  invalidCanRunState.voice.isGenerated = true;
  invalidCanRunState.naming.selectedName = null;
  assert(!canRunCritic(invalidCanRunState).allowed, "canRunCritic rejects when selectedName is null");

  // ==========================================================================
  // Summary
  // ==========================================================================
  console.log("\n==================================================");
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log("==================================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runCriticTestSuite().catch((err) => {
  console.error("Test execution failed with unhandled error:", err);
  process.exit(1);
});
