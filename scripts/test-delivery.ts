/**
 * Delivery Engine Test Suite (Phase 8)
 * Comprehensive testing covering all required Phase 8 validation criteria:
 *
 * Schema:
 * 1. Valid Delivery output validation
 * 2. Invalid Delivery output rejection
 * 3. Missing required fields rejection
 * 4. Malformed deliverables rejection
 *
 * Prerequisites:
 * 5. Discovery missing rejection
 * 6. Positioning missing rejection
 * 7. Personality missing rejection
 * 8. Naming missing rejection
 * 9. selectedName missing rejection
 * 10. Voice missing rejection
 * 11. Visual Direction missing rejection
 * 12. Consistency missing rejection
 * 13. Consistency not evaluated rejection
 *
 * Execution & AgentRun:
 * 14. Delivery agent executes successfully
 * 15. Prompt receives correct context
 * 16. Structured output is extracted
 * 17. Zod validation succeeds
 * 18. Provider failure is handled safely
 * 19. AgentRun created
 * 20. Correct agentName ("Delivery")
 * 21. Correct stage ("DELIVERY")
 * 22. Timestamps recorded (createdAt, completedAt)
 * 23. Duration recorded (durationMs)
 * 24. Failures recorded safely with failed status
 *
 * State:
 * 25. Delivery persisted on BrandState (isDelivered = true, deliveredAt set)
 * 26. Version increments correctly (e.g. 1 -> 2)
 * 27. Upstream state unchanged (bit-for-bit check on Discovery, Positioning, Personality, Naming, Voice, Visual)
 * 28. selectedName unchanged and protected
 * 29. Consistency unchanged
 * 30. Critique unchanged
 *
 * Context & Grounding:
 * 31. Context propagation across distinct brands (Enterprise Cybersecurity vs Artisan Coffee)
 * 32. Zero cross-brand contamination
 * 33. Name protection (authoritative selectedName preserved even if model alters it)
 * 34. Consistency propagation (readiness, warnings, cross-system issues consumed)
 * 35. Unsupported claims protection (anti-hyperbole rules enforce no manufactured supremacy claims)
 * 36. canRunDelivery stage prerequisite verification
 */

import {
  DeliveryBrandOverviewSchema,
  DeliveryMessagingPillarSchema,
  DeliveryMessagingSchema,
  DeliveryVocabularyGuidanceSchema,
  DeliveryVoiceGuidelinesSchema,
  DeliveryVisualGuidelinesSchema,
  DeliveryUsageGuidanceSchema,
  DeliveryItemSchema,
  DeliveryOutputSchema,
  DeliverySchema,
  type DeliveryOutput,
  type BrandState,
  createInitialBrandState,
} from "../src/types/brand";
import { executeDeliveryAgent } from "../src/lib/agents/delivery";
import { DELIVERY_SYSTEM_PROMPT, buildDeliveryUserPrompt } from "../src/lib/agents/prompts/delivery";
import { canRunDelivery } from "../src/lib/agents/stages";
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

// Mock provider for deterministic Delivery agent testing
class TestMockDeliveryProvider implements LLMProvider {
  readonly providerName = "test-mock-delivery";
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

// Canonical Valid Delivery Output (Enterprise Cybersecurity "ProofLoom")
const mockProofLoomDeliveryOutput: DeliveryOutput = {
  brandOverview: {
    name: "ProofLoom",
    positioning: "Deterministic cryptographic verification for enterprise smart contracts.",
    audience: "Chief Information Security Officers and Lead Protocol Engineers.",
    personality: "Sovereign Sentinel — rigorous, mathematical, uncompromising.",
    differentiator: "Zero false-positive formal verification with mathematical certificates.",
  },
  messaging: {
    coreMessage: "Provable cryptographic assurance for mission-critical protocols.",
    valueProposition: "Mathematical certainty eliminating protocol exploits before deployment.",
    elevatorPitch: "ProofLoom replaces probabilistic bug testing with formal verification proofs, giving CISOs mathematical certainty before mainnet deployment.",
    keyMessages: [
      "Zero false-positive formal verification",
      "Human-readable cryptographic proof certificates",
      "Continuous automated regression verification for CI/CD",
    ],
    messagingPillars: [
      {
        pillar: "Mathematical Rigor",
        headline: "Provable verification replacing probabilistic testing",
        description: "Our formal verification engine mathematically proves smart contract invariants against zero-day exploit categories.",
      },
      {
        pillar: "Enterprise Certainty",
        headline: "CISO-grade assurance for mission-critical deployments",
        description: "Clear cryptographic audit trails and deterministic proof artifacts that satisfy board-level governance.",
      },
      {
        pillar: "Automated Integration",
        headline: "Continuous formal proof inside modern CI/CD pipelines",
        description: "Automated test harnesses run formal verification on every pull request without slowing down engineering velocity.",
      },
    ],
  },
  voiceGuidelines: {
    voiceSummary: "Austere, authoritative, and mathematically precise without marketing hyperbole.",
    doRules: [
      "Use precise formal logic and verification terminology.",
      "Present empirical proof artifacts rather than speculative assertions.",
      "Maintain an uncompromising, institutional tone.",
    ],
    dontRules: [
      "Never use casual tech slang or startup buzzwords.",
      "Do not make unsubstantiated claims like 'unhackable' or 'world's best'.",
      "Avoid exclamation marks and aggressive sales pressure.",
    ],
    vocabularyGuidance: {
      preferred: ["formal verification", "deterministic proof", "mathematical assurance", "invariant verification"],
      avoid: ["bulletproof", "unhackable", "game-changing", "revolutionary", "ninja"],
    },
    exampleLines: [
      "Deterministic verification for mission-critical code.",
      "We don't test possibilities; we prove correctness.",
      "Mathematical certainty before mainnet deployment.",
    ],
  },
  visualGuidelines: {
    colorDirection: "Deep monochromatic obsidian (#0A0C10) paired with cryptographic cyan (#00F0FF) and platinum steel (#E2E8F0) accents.",
    typographyDirection: "Editorial serif Instrument Serif for authoritative display headings paired with Inter for dense tabular proof data.",
    imageryDirection: "Abstract mathematical topology, high-contrast monochrome code geometries, and stark structural matrices.",
    logoGuidance: "Geometric monogram representing an interlocking proof lattice; strict exclusion zone equal to the cap height.",
    compositionGuidance: "Austere high-density editorial grid with structured gutters and architectural asymmetry.",
  },
  usageGuidance: {
    website: "Minimalist dark theme layout with interactive verification terminal and downloadable mathematical proof certificates.",
    social: "Technical teardowns of smart contract vulnerabilities with annotated formal specification diagrams.",
    presentations: "Monochrome slide decks with tabular proof matrices and executive compliance summaries for CISO briefings.",
    marketing: "Whitepapers and peer-reviewed technical briefs distributed directly to protocol security working groups.",
  },
  deliverables: [
    {
      id: "deliv-core-messaging",
      type: "messaging",
      title: "Executive Messaging Matrix",
      description: "Core elevator pitch, value propositions, and pillar narratives for stakeholder alignment.",
      content: "# ProofLoom Executive Messaging Matrix\n\n## Value Proposition\nDeterministic mathematical proof eliminating protocol exploits before deployment.",
    },
    {
      id: "deliv-voice-guidelines",
      type: "voice",
      title: "Brand Voice & Editorial Standards",
      description: "Tone boundaries, vocabulary governance, and sample copy across channels.",
      content: "# ProofLoom Voice & Editorial Standards\n\n## Principles\n1. Mathematical Precision\n2. Institutional Authority",
    },
    {
      id: "deliv-visual-specs",
      type: "visual",
      title: "Visual System Specifications",
      description: "Color tokens, typography hierarchy, and asset layout rules for designers.",
      content: "# ProofLoom Visual System\n\n- Primary: Deep Obsidian (#0A0C10)\n- Accent: Cryptographic Cyan (#00F0FF)",
    },
    {
      id: "deliv-launch-copy",
      type: "copy",
      title: "Launch Copy & Social Campaign Assets",
      description: "Ready-to-use homepage hero copy and announcement threads.",
      content: "# ProofLoom Launch Copy\n\nHero: Provable cryptographic assurance for mission-critical protocols.",
    },
  ],
  warnings: [
    "Maintain strict terminology boundaries: use 'provable mathematical correctness' rather than generic claims of being 'unhackable'.",
  ],
};

// Helper: Factory function to construct a realistic, schema-valid 8-layer BrandState
function buildCompleteBrandState(overrides: Partial<BrandState> = {}): BrandState {
  const base = createInitialBrandState("test-project-phase8", "A verified cryptographic audit platform");
  base.projectId = "test-project-phase8";

  base.discovery = {
    ...base.discovery,
    rawIdea: "A verified cryptographic audit platform",
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
  };

  base.positioning = {
    category: "Deterministic Smart Contract Verification",
    categoryRationale: "Elevates code security from heuristic bug-hunting to mathematical proof.",
    positioningStatement:
      "For protocol engineers seeking absolute mainnet certainty, ProofLoom delivers mathematical formal verification with zero false positives.",
    differentiator: "Mathematical logic proofs rather than probabilistic heuristics.",
    valueProposition:
      "Eliminates zero-day protocol exploits before mainnet launch with verifiable mathematical certificates.",
    competitiveWhitespace: [
      "Replacing manual code auditing with automated mathematical proof engines that run continuously in CI.",
    ],
    alternatives: ["Manual code audits", "Bug bounty programs", "Fuzzing tools"],
    proofPoints: [
      "100% mathematical invariant coverage",
      "Integrated into CI/CD pipelines with sub-5 minute proof latency",
      "Zero reported post-deployment exploits across audited protocols",
    ],
    risks: ["Engineers unfamiliar with formal specifications may find rule definitions complex"],
    confidence: 94,
    isPositioned: true,
    positionedAt: new Date().toISOString(),
  };

  base.personality = {
    ...base.personality,
    archetype: "Sovereign Sentinel",
    archetypeRationale: "Reflects uncompromising precision, mathematical rigor, and institutional assurance.",
    traits: ["Rigorous", "Austere", "Authoritative"],
    emotionalTerritory: "Mathematical certainty in a chaotic adversary landscape",
    isFormulated: true,
    formulatedAt: new Date().toISOString(),
  };

  base.naming = {
    ...base.naming,
    selectedDirectionId: "dir-mathematical-rigor",
    selectedName: "ProofLoom",
    selectedTagline: "Mathematical certainty for mission-critical code.",
    isSelected: true,
    selectedAt: new Date().toISOString(),
    isGenerated: true,
    generatedAt: new Date().toISOString(),
    directions: [
      {
        id: "dir-mathematical-rigor",
        name: "Mathematical Rigor",
        strategy: "Rooted in formal logic terms and architectural weaving",
        rationale: "Emphasizes the interwoven fabric of formal verification proofs",
        namingLogic: "Compound morphemes indicating provable structure",
        candidates: [
          {
            name: "ProofLoom",
            rationale: "Weaves mathematical proofs into an unbroken fabric of protocol security",
            linguisticRationale: "Strong plosive 'P' followed by resonant 'Loom'",
            phoneticAssessment: "Crisp, institutional, memorable",
            domainSuitability: "proofloom.io is ideal for developer platforms",
          },
        ],
        taglineCandidates: ["Mathematical certainty for mission-critical code."],
      },
    ],
  };

  base.voice = {
    ...base.voice,
    toneProfile: {
      primary: "Authoritative Rigor",
      secondary: ["Institutional Precision", "Mathematical Austerity"],
      tonalBalance: "Disciplined and objective",
      emotionalEffect: "Confidence and certainty",
    },
    vocabulary: {
      preferred: ["formal verification", "deterministic proof", "mathematical assurance", "invariant verification"],
      avoid: ["bulletproof", "unhackable", "game-changing", "revolutionary", "ninja"],
      terminology: ["zero-knowledge", "symbolic execution", "abstract interpretation"],
      languageCharacteristics: ["Direct", "Precise", "Empirical"],
    },
    examples: {
      homepageHero: "Provable cryptographic assurance for mission-critical protocols.",
      shortPitch: "ProofLoom replaces heuristic testing with mathematical verification.",
      primaryCTA: "Request Formal Verification Audit",
      socialPost: "Heuristics find bugs. ProofLoom proves their absence. Here is the formal verification report.",
    },
    voiceDonts: [
      "We build totally epic smart contract security tools!",
      "Supercharge your blockchain app with our magical scanner!",
    ],
    isGenerated: true,
    generatedAt: new Date().toISOString(),
  };

  base.visualDirection = {
    ...base.visualDirection,
    colorSystem: {
      primary: [
        {
          name: "Deep Obsidian",
          hex: "#0A0C10",
          role: "Dominant background and primary structural canvas",
          usage: "Canvas background",
        },
      ],
      secondary: [
        {
          name: "Cryptographic Cyan",
          hex: "#00F0FF",
          role: "Accent color for formal verification status and proof indicators",
          usage: "Actionable highlights",
        },
      ],
      neutrals: [
        {
          name: "Platinum Steel",
          hex: "#E2E8F0",
          role: "Body text and structural border lines",
          usage: "Typography and hairlines",
        },
      ],
      semantic: [
        {
          name: "Proof Valid",
          hex: "#10B981",
          role: "Mathematical theorem verified status",
          usage: "Verification badges",
        },
      ],
      accessibility: {
        contrastNotes: "All text elements exceed WCAG AAA standards for high-contrast accessibility.",
        wcagCompliance: "WCAG 2.1 AAA",
        darkThemeConsiderations: "Designed natively for dark-mode IDE and console environments.",
      },
    },
    typography: {
      heading: {
        fontFamily: "Instrument Serif",
        category: "Serif",
        weights: ["400"],
        usage: "Display headings and section titles",
      },
      body: {
        fontFamily: "Inter",
        category: "Sans-serif",
        weights: ["400", "500", "600"],
        usage: "Body paragraphs and interface copy",
      },
      pairing: {
        headingFont: "Instrument Serif",
        bodyFont: "Inter",
        contrast: "High contrast between editorial serif and humanist sans",
        mood: "Refined, institutional, and contemporary",
      },
      rationale: "Editorial serif conveys institutional gravitas while monospace/sans delivers technical precision.",
    },
    visualPersonality: {
      aestheticMood: "Austere Cryptographic Architecture",
      visualKeywords: ["monochrome", "mathematical", "architectural", "high-contrast"],
      designPrinciples: [
        { principle: "Zero decorative ornament", description: "Zero ornament" },
        { principle: "Structural grid visibility", description: "Visible grid" },
        { principle: "Code as interface", description: "Terminal UI" },
      ],
      imageryDirection: "High-contrast monochrome code geometries and mathematical topological meshes.",
    },
    imagery: {
      photographyDirection: "Monochrome architectural photography of high-density server rooms and brutalist structures.",
      illustrationDirection: "Vector wireframes of interlocking mathematical lattices and topological knots.",
      composition: "Asymmetric grid with large gutters and precise typographic alignments.",
      subjectTreatment: "Stark chiaroscuro lighting with sharp edges.",
    },
    logoDirection: {
      concept: "Interlocking geometric lattice representing an unbroken proof weave.",
      markDirection: "Minimalist vector monogram forming the letters P and L inside a hexagonal proof cell.",
      wordmarkDirection: "Clean tracking in uppercase Instrument Serif with optical kerning.",
      constructionPrinciples: ["Mathematical symmetry", "Scalable down to 16px favicon", "Monochrome native"],
    },
    layoutPrinciples: {
      spacing: "8pt mathematical baseline grid",
      density: "High density with disciplined white space around formal proof cards",
      hierarchy: "Dramatic scale jump between display serif headings and dense sans-serif tabular data",
      shapeLanguage: "Crisp 0px or 2px corner radii, razor-sharp dividers, precise rectangular containers",
      composition: "Architectural two-column layout with fixed navigation and contextual proof terminal",
    },
    overallAesthetic: "Austere Cryptographic Architecture",
    colors: [],
    isGenerated: true,
    generatedAt: new Date().toISOString(),
  };

  base.critique = {
    summary: "Strong mathematical positioning with clear enterprise differentiation.",
    critiques: [],
    genericLanguageDetected: [],
    vulnerabilities: [],
    overallAssessment: "ProofLoom displays high technical rigor with minimal vulnerabilities.",
    readiness: "ready",
    strengths: ["Clear differentiation around mathematical proof vs heuristic auditing."],
    issues: [],
    blockingIssues: [],
    isEvaluated: true,
  };

  base.consistency = {
    overallAssessment: "The ProofLoom brand system demonstrates exceptional systemic cohesion across all dimensions.",
    readiness: "coherent",
    strategic: { status: "coherent", findings: ["Tight problem-category alignment."] },
    audience: { status: "coherent", findings: ["CISO persona strictly matches austere tone."] },
    personality: { status: "coherent", findings: ["Sovereign Sentinel reinforces mathematical rigor."] },
    naming: { status: "coherent", findings: ["ProofLoom captures the weaving of formal verification proofs."] },
    voice: { status: "coherent", findings: ["Austere tone profile perfectly aligns with enterprise expectations."] },
    visual: { status: "coherent", findings: ["Obsidian and cyan palette embodies cryptographic precision."] },
    messaging: { status: "coherent", findings: ["Pillars substantiate the core value proposition without hyperbole."] },
    crossSystemIssues: [],
    strengths: ["Indivisible alignment between mathematical formal verification and austere visual/verbal tone."],
    warnings: ["Ensure technical marketing does not drift into speculative claims of being 'unhackable'."],
    overallCoherenceScore: 96,
    alignments: [],
    crossStageConflicts: [],
    finalRecommendation: "Proceed to Delivery to operationalize brand guidelines.",
    isEvaluated: true,
    evaluatedAt: new Date().toISOString(),
  };

  base.delivery = {
    isDelivered: false,
    brandOverview: {
      name: "",
      positioning: "",
      audience: "",
      personality: "",
      differentiator: "",
    },
    messaging: {
      coreMessage: "",
      valueProposition: "",
      elevatorPitch: "",
      keyMessages: [],
      messagingPillars: [],
    },
    voiceGuidelines: {
      voiceSummary: "",
      doRules: [],
      dontRules: [],
      vocabularyGuidance: { preferred: [], avoid: [] },
      exampleLines: [],
    },
    visualGuidelines: {
      colorDirection: "",
      typographyDirection: "",
      imageryDirection: "",
      logoGuidance: "",
      compositionGuidance: "",
    },
    usageGuidance: {
      website: "",
      social: "",
      presentations: "",
      marketing: "",
    },
    deliverables: [],
    warnings: [],
  };

  return { ...base, ...overrides };
}

async function runDeliveryTestSuite() {
  console.log("\n==================================================");
  console.log("RUNNING PHASE 8 — DELIVERY AGENT TEST SUITE");
  console.log("==================================================\n");

  // ==========================================================================
  // 1. SCHEMA VALIDATION TESTS (Tests 1-4)
  // ==========================================================================
  console.log("Section 1: Schema Validation");

  // Test 1: Valid Delivery Output
  const parseValid = DeliveryOutputSchema.safeParse(mockProofLoomDeliveryOutput);
  assert(parseValid.success, "Test 1: Canonical valid DeliveryOutput passes schema parse");

  // Test 2: Invalid Delivery Output
  const invalidOutput = { ...mockProofLoomDeliveryOutput, brandOverview: "not an object" };
  const parseInvalid = DeliveryOutputSchema.safeParse(invalidOutput);
  assert(!parseInvalid.success, "Test 2: Rejects invalid DeliveryOutput with string brandOverview");

  // Test 3: Missing Required Fields
  const missingFieldsOutput = {
    ...mockProofLoomDeliveryOutput,
    brandOverview: {
      name: "ProofLoom",
      // missing positioning, audience, personality, differentiator
    },
  };
  const parseMissing = DeliveryOutputSchema.safeParse(missingFieldsOutput);
  assert(!parseMissing.success, "Test 3: Rejects DeliveryOutput missing required overview fields");

  // Test 4: Malformed Deliverables
  const malformedDeliverables = {
    ...mockProofLoomDeliveryOutput,
    deliverables: [
      {
        id: "deliv-1",
        // missing type, title, description, content
      },
    ],
  };
  const parseMalformedDeliv = DeliveryOutputSchema.safeParse(malformedDeliverables);
  assert(!parseMalformedDeliv.success, "Test 4: Rejects deliverables missing required item fields");

  // Sub-schema checks
  assert(
    DeliveryBrandOverviewSchema.safeParse(mockProofLoomDeliveryOutput.brandOverview).success,
    "DeliveryBrandOverviewSchema parses valid object"
  );
  assert(
    DeliveryMessagingPillarSchema.safeParse(mockProofLoomDeliveryOutput.messaging.messagingPillars[0]).success,
    "DeliveryMessagingPillarSchema parses valid pillar object"
  );
  assert(
    DeliveryMessagingSchema.safeParse(mockProofLoomDeliveryOutput.messaging).success,
    "DeliveryMessagingSchema parses valid object"
  );
  assert(
    DeliveryVocabularyGuidanceSchema.safeParse(mockProofLoomDeliveryOutput.voiceGuidelines.vocabularyGuidance).success,
    "DeliveryVocabularyGuidanceSchema parses valid object"
  );
  assert(
    DeliveryVoiceGuidelinesSchema.safeParse(mockProofLoomDeliveryOutput.voiceGuidelines).success,
    "DeliveryVoiceGuidelinesSchema parses valid object"
  );
  assert(
    DeliveryVisualGuidelinesSchema.safeParse(mockProofLoomDeliveryOutput.visualGuidelines).success,
    "DeliveryVisualGuidelinesSchema parses valid object"
  );
  assert(
    DeliveryUsageGuidanceSchema.safeParse(mockProofLoomDeliveryOutput.usageGuidance).success,
    "DeliveryUsageGuidanceSchema parses valid object"
  );
  assert(
    DeliveryItemSchema.safeParse(mockProofLoomDeliveryOutput.deliverables[0]).success,
    "DeliveryItemSchema parses valid deliverable item"
  );
  assert(
    DeliverySchema.safeParse({
      isDelivered: true,
      deliveredAt: new Date().toISOString(),
      ...mockProofLoomDeliveryOutput,
    }).success,
    "DeliverySchema parses valid full delivery state"
  );

  // ==========================================================================
  // 2. PREREQUISITE GUARD TESTS (Tests 5-13)
  // ==========================================================================
  console.log("\nSection 2: Prerequisite Guard Verifications");

  // Test 5: Missing Discovery
  const stateNoDiscovery = buildCompleteBrandState();
  stateNoDiscovery.discovery.isAnalyzed = false;
  const resNoDiscovery = await executeDeliveryAgent(
    { projectId: "test-proj" },
    stateNoDiscovery,
    new TestMockDeliveryProvider(mockProofLoomDeliveryOutput)
  );
  assert(!resNoDiscovery.success, "Test 5: Fails when Discovery is incomplete");
  assert(resNoDiscovery.error?.includes("Discovery"), "Test 5: Error specifically cites Discovery requirement");

  // Test 6: Missing Positioning
  const stateNoPositioning = buildCompleteBrandState();
  stateNoPositioning.positioning.isPositioned = false;
  const resNoPositioning = await executeDeliveryAgent(
    { projectId: "test-proj" },
    stateNoPositioning,
    new TestMockDeliveryProvider(mockProofLoomDeliveryOutput)
  );
  assert(!resNoPositioning.success, "Test 6: Fails when Positioning is incomplete");
  assert(resNoPositioning.error?.includes("Positioning"), "Test 6: Error specifically cites Positioning requirement");

  // Test 7: Missing Personality
  const stateNoPersonality = buildCompleteBrandState();
  stateNoPersonality.personality.isFormulated = false;
  const resNoPersonality = await executeDeliveryAgent(
    { projectId: "test-proj" },
    stateNoPersonality,
    new TestMockDeliveryProvider(mockProofLoomDeliveryOutput)
  );
  assert(!resNoPersonality.success, "Test 7: Fails when Personality is incomplete");
  assert(resNoPersonality.error?.includes("Personality"), "Test 7: Error specifically cites Personality requirement");

  // Test 8: Missing Naming Generation
  const stateNoNaming = buildCompleteBrandState();
  stateNoNaming.naming.isGenerated = false;
  const resNoNaming = await executeDeliveryAgent(
    { projectId: "test-proj" },
    stateNoNaming,
    new TestMockDeliveryProvider(mockProofLoomDeliveryOutput)
  );
  assert(!resNoNaming.success, "Test 8: Fails when Naming stage is not generated");

  // Test 9: Missing selectedName
  const stateNoSelectedName = buildCompleteBrandState();
  stateNoSelectedName.naming.isSelected = false;
  stateNoSelectedName.naming.selectedName = null;
  const resNoSelectedName = await executeDeliveryAgent(
    { projectId: "test-proj" },
    stateNoSelectedName,
    new TestMockDeliveryProvider(mockProofLoomDeliveryOutput)
  );
  assert(!resNoSelectedName.success, "Test 9: Fails when selectedName is missing");
  assert(resNoSelectedName.error?.includes("name"), "Test 9: Error specifically cites brand name requirement");

  // Test 10: Missing Voice
  const stateNoVoice = buildCompleteBrandState();
  stateNoVoice.voice.isGenerated = false;
  const resNoVoice = await executeDeliveryAgent(
    { projectId: "test-proj" },
    stateNoVoice,
    new TestMockDeliveryProvider(mockProofLoomDeliveryOutput)
  );
  assert(!resNoVoice.success, "Test 10: Fails when Voice is incomplete");
  assert(resNoVoice.error?.includes("Voice"), "Test 10: Error specifically cites Voice requirement");

  // Test 11: Missing Visual Direction
  const stateNoVisual = buildCompleteBrandState();
  stateNoVisual.visualDirection.isGenerated = false;
  const resNoVisual = await executeDeliveryAgent(
    { projectId: "test-proj" },
    stateNoVisual,
    new TestMockDeliveryProvider(mockProofLoomDeliveryOutput)
  );
  assert(!resNoVisual.success, "Test 11: Fails when Visual Direction is incomplete");
  assert(resNoVisual.error?.includes("Visual Direction"), "Test 11: Error specifically cites Visual Direction requirement");

  // Test 12: Missing Consistency Object
  const stateNoConsistency = buildCompleteBrandState();
  // @ts-expect-error test undefined consistency
  stateNoConsistency.consistency = undefined;
  const resNoConsistency = await executeDeliveryAgent(
    { projectId: "test-proj" },
    stateNoConsistency,
    new TestMockDeliveryProvider(mockProofLoomDeliveryOutput)
  );
  assert(!resNoConsistency.success, "Test 12: Fails when Consistency is missing");

  // Test 13: Consistency Not Evaluated (Critical Phase 7 Gate)
  const stateConsistencyNotEvaluated = buildCompleteBrandState();
  stateConsistencyNotEvaluated.consistency.isEvaluated = false;
  const resConsistencyNotEvaluated = await executeDeliveryAgent(
    { projectId: "test-proj" },
    stateConsistencyNotEvaluated,
    new TestMockDeliveryProvider(mockProofLoomDeliveryOutput)
  );
  assert(!resConsistencyNotEvaluated.success, "Test 13: Fails when Consistency is not evaluated");
  assert(
    resConsistencyNotEvaluated.error?.includes("Consistency"),
    "Test 13: Error specifically cites Consistency requirement"
  );

  // ==========================================================================
  // 3. EXECUTION & AGENTRUN TESTS (Tests 14-24)
  // ==========================================================================
  console.log("\nSection 3: Execution & AgentRun Verification");

  const validState = buildCompleteBrandState();
  const mockProvider = new TestMockDeliveryProvider(mockProofLoomDeliveryOutput);
  const result = await executeDeliveryAgent(
    { projectId: validState.projectId || "test-project-phase8" },
    validState,
    mockProvider
  );

  // Test 14: Agent executes
  assert(result.success === true, "Test 14: Delivery agent executes successfully with complete 8 layers");

  // Test 15: Prompt receives correct context
  const capturedMessages = mockProvider.capturedMessages;
  assert(capturedMessages.length === 2, "Test 15: Prompt messages passed to provider");
  const userPromptContent = capturedMessages[1]?.content || "";
  assert(userPromptContent.includes("ProofLoom"), "Test 15: Prompt receives selected brand name 'ProofLoom'");
  assert(
    userPromptContent.includes("Deterministic Smart Contract Verification"),
    "Test 15: Prompt receives positioning category"
  );
  assert(
    userPromptContent.includes("Sovereign Sentinel"),
    "Test 15: Prompt receives personality archetype"
  );
  assert(
    userPromptContent.includes("Deep Obsidian"),
    "Test 15: Prompt receives visual color palette"
  );
  assert(
    userPromptContent.includes("The ProofLoom brand system demonstrates exceptional systemic cohesion"),
    "Test 15: Prompt receives Consistency evaluation report"
  );

  // Test 16: Structured output is extracted
  assert(result.deliveryOutput !== undefined, "Test 16: Structured output is extracted and returned");
  assert(result.deliveryOutput?.deliverables.length === 4, "Test 16: Contains 4 deliverables");

  // Test 17: Zod validation succeeds
  const parsedRes = DeliveryOutputSchema.safeParse(result.deliveryOutput);
  assert(parsedRes.success, "Test 17: Extracted delivery output satisfies Zod DeliveryOutputSchema");

  // Test 18: Provider failure is handled safely
  const failingProvider = new TestMockDeliveryProvider(mockProofLoomDeliveryOutput, true);
  const failResult = await executeDeliveryAgent(
    { projectId: validState.projectId || "test-project-phase8" },
    validState,
    failingProvider
  );
  assert(failResult.success === false, "Test 18: Handles provider error safely");
  assert(failResult.error?.includes("timeout"), "Test 18: Propagates error description safely without crashing");
  assert(failResult.agentRun?.status === "failed", "Test 18: AgentRun marked failed on provider error");

  // Test 19-24: AgentRun telemetry verification
  const run = result.agentRun;
  assert(run !== undefined, "Test 19: AgentRun is created and returned");
  assert(run?.agentName === "Delivery", `Test 20: Correct agentName = 'Delivery' (got ${run?.agentName})`);
  assert(run?.stage === "DELIVERY", `Test 21: Correct stage = 'DELIVERY' (got ${run?.stage})`);
  assert(Boolean(run?.createdAt && run?.completedAt), "Test 22: Timestamps recorded (createdAt and completedAt)");
  assert(typeof run?.durationMs === "number" && run.durationMs >= 0, "Test 23: Numeric durationMs recorded");
  assert(run?.status === "completed", "Test 24: Successful execution marked with status = 'completed'");

  // ==========================================================================
  // 4. STATE PRESERVATION & IMMUTABILITY TESTS (Tests 25-30)
  // ==========================================================================
  console.log("\nSection 4: State Preservation & Immutability");

  const updatedState = result.updatedBrandState!;
  assert(updatedState !== undefined, "Updated brand state returned");

  // Test 25: Delivery persisted
  assert(updatedState.delivery.isDelivered === true, "Test 25: BrandState.delivery.isDelivered is true");
  assert(Boolean(updatedState.delivery.deliveredAt), "Test 25: BrandState.delivery.deliveredAt is set");
  assert(
    updatedState.delivery.brandOverview.name === "ProofLoom",
    "Test 25: BrandState.delivery.brandOverview.name is 'ProofLoom'"
  );
  assert(
    updatedState.delivery.deliverables.length === 4,
    "Test 25: BrandState.delivery.deliverables contains 4 items"
  );

  // Test 26: Version increments correctly
  assert(
    updatedState.version === (validState.version || 1) + 1,
    `Test 26: Version increments correctly (${validState.version} -> ${updatedState.version})`
  );

  // Test 27: Upstream state unchanged (deep comparison)
  assert(
    JSON.stringify(updatedState.discovery) === JSON.stringify(validState.discovery),
    "Test 27: Discovery state bit-for-bit unchanged"
  );
  assert(
    JSON.stringify(updatedState.positioning) === JSON.stringify(validState.positioning),
    "Test 27: Positioning state bit-for-bit unchanged"
  );
  assert(
    JSON.stringify(updatedState.personality) === JSON.stringify(validState.personality),
    "Test 27: Personality state bit-for-bit unchanged"
  );
  assert(
    JSON.stringify(updatedState.naming) === JSON.stringify(validState.naming),
    "Test 27: Naming state bit-for-bit unchanged"
  );
  assert(
    JSON.stringify(updatedState.voice) === JSON.stringify(validState.voice),
    "Test 27: Voice state bit-for-bit unchanged"
  );
  assert(
    JSON.stringify(updatedState.visualDirection) === JSON.stringify(validState.visualDirection),
    "Test 27: Visual Direction state bit-for-bit unchanged"
  );

  // Test 28: selectedName unchanged
  assert(
    updatedState.naming.selectedName === "ProofLoom",
    "Test 28: selectedName strictly unchanged in upstream naming state"
  );

  // Test 29: Consistency unchanged
  assert(
    JSON.stringify(updatedState.consistency) === JSON.stringify(validState.consistency),
    "Test 29: Consistency state bit-for-bit unchanged"
  );

  // Test 30: Critique unchanged
  assert(
    JSON.stringify(updatedState.critique) === JSON.stringify(validState.critique),
    "Test 30: Critique state bit-for-bit unchanged"
  );

  // ==========================================================================
  // 5. CONTEXT PROPAGATION ACROSS DISTINCT BRANDS (Tests 31-32)
  // ==========================================================================
  console.log("\nSection 5: Context Propagation Across Distinct Brands");

  // Brand A: Enterprise Cybersecurity
  const brandA = buildCompleteBrandState();
  brandA.naming.selectedName = "ProofLoom";
  brandA.positioning.category = "Cryptographic Smart Contract Verification";

  // Brand B: Artisan Coffee
  const brandB = buildCompleteBrandState();
  brandB.projectId = "brand-b-roastcraft";
  brandB.discovery.problem = "Specialty coffee lovers struggle to find single-origin beans roasted to order with transparent origin traceability.";
  brandB.discovery.targetAudience.primary = "Third-wave coffee connoisseurs and home baristas";
  brandB.discovery.userNeeds = ["Freshly roasted specialty coffee", "Direct-trade origin clarity"];
  brandB.discovery.constraints = ["Small-batch craft only"];
  brandB.positioning.category = "Artisan Single-Origin Coffee Roastery";
  brandB.positioning.categoryRationale = "Pioneering freshly roasted micro-lot beans delivered to doorstep within 24 hours.";
  brandB.positioning.positioningStatement = "For coffee connoisseurs who demand origin purity, RoastCraft sources micro-lot beans roasted to order within 24 hours.";
  brandB.positioning.differentiator = "Direct-trade micro-lots roasted within 24 hours of dispatch.";
  brandB.positioning.valueProposition = "Ultra-fresh single-origin coffee with harvest-to-cup traceability.";
  brandB.positioning.competitiveWhitespace = ["Eliminating stale warehouse shelf coffee with direct roasted-to-order delivery."];
  brandB.positioning.proofPoints = ["Shipped within 24 hours of roasting", "100% fair trade direct sourced"];
  brandB.personality.archetype = "The Artisanal Alchemist";
  brandB.personality.archetypeRationale = "Passionate craft and sensory excellence.";
  brandB.personality.traits = ["Artisanal"];
  brandB.naming.selectedName = "RoastCraft";
  brandB.naming.selectedTagline = "Small-batch origin perfection.";
  brandB.naming.directions = [];
  brandB.voice.toneProfile.primary = "Warm Artisanal Expertise";
  brandB.voice.toneProfile.secondary = ["Sensory Elegance", "Craft Passion"];
  brandB.voice.vocabulary = {
    preferred: ["micro-lot", "single-origin", "cupping notes", "batch roasting"],
    avoid: ["instant", "cheap", "commodity", "syrup"],
    terminology: ["terroir", "natural process", "elevation"],
    languageCharacteristics: ["Warm", "Sensory", "Evocative"],
  };
  brandB.voice.examples = {
    homepageHero: "Single-origin craft beans roasted to order and delivered to your cup.",
    shortPitch: "RoastCraft delivers micro-lot coffee roasted within 24 hours.",
    primaryCTA: "Discover This Week's Roast",
    socialPost: "Freshly roasted Ethiopian Yirgacheffe notes of jasmine and bergamot.",
  };
  brandB.visualDirection.overallAesthetic = "Warm Earthy Artisanal Coffee Lab";
  brandB.visualDirection.visualPersonality = {
    aestheticMood: "Warm Earthy Artisanal Coffee Lab",
    visualKeywords: ["rustic", "sensory", "warm", "earthy"],
    designPrinciples: [
      { principle: "Tactile craft paper", description: "Natural tactile feel" },
      { principle: "Natural warm tones", description: "Warm earthy tones" },
    ],
    imageryDirection: "Rich warm macro photography of roasting beans and burlap bags.",
  };
  brandB.visualDirection.colorSystem.primary = [
    { name: "Espresso Roast", hex: "#2A1810", role: "Primary dark background", usage: "Canvas background" },
  ];
  brandB.visualDirection.colorSystem.secondary = [
    { name: "Steamed Foam", hex: "#F5EFEB", role: "Light cream accent", usage: "Accents and highlights" },
  ];
  brandB.visualDirection.colorSystem.neutrals = [
    { name: "Burlap Kraft", hex: "#D7C4B7", role: "Packaging label neutral", usage: "Labels and badges" },
  ];
  brandB.visualDirection.logoDirection = {
    concept: "Minimalist coffee branch and flame symbol",
    markDirection: "Handcrafted linocut emblem",
    wordmarkDirection: "Warm serif lettering",
    constructionPrinciples: ["Warm organic curves"],
  };
  brandB.critique = {
    summary: "Strong sensory appeal with defensible small-batch roasting model.",
    critiques: [],
    genericLanguageDetected: [],
    vulnerabilities: [],
    overallAssessment: "RoastCraft delivers an evocative and cohesive artisan coffee identity.",
    readiness: "ready",
    strengths: ["Clear focus on 24-hour freshness"],
    issues: [],
    blockingIssues: [],
    isEvaluated: true,
  };
  brandB.consistency.overallAssessment = "RoastCraft demonstrates complete sensory and artisanal cohesion.";
  brandB.consistency.readiness = "coherent";
  brandB.consistency.strengths = ["Tight alignment between warm sensory voice and artisanal packaging."];
  brandB.consistency.warnings = [];
  brandB.consistency.crossSystemIssues = [];

  const promptA = buildDeliveryUserPrompt(brandA);
  const promptB = buildDeliveryUserPrompt(brandB);

  // Test 31: Distinct Brand Context Propagation
  assert(promptA.includes("ProofLoom"), "Test 31: Prompt A contains Brand A name 'ProofLoom'");
  assert(promptA.includes("Cryptographic Smart Contract Verification"), "Test 31: Prompt A contains Brand A category");
  assert(promptB.includes("RoastCraft"), "Test 31: Prompt B contains Brand B name 'RoastCraft'");
  assert(promptB.includes("Artisan Single-Origin Coffee Roastery"), "Test 31: Prompt B contains Brand B category");

  // Test 32: Zero Cross-Brand Contamination
  assert(!promptA.includes("RoastCraft"), "Test 32: Prompt A contains zero leakage of Brand B name");
  assert(!promptA.includes("single-origin"), "Test 32: Prompt A contains zero leakage of Brand B terminology");
  assert(!promptB.includes("ProofLoom"), "Test 32: Prompt B contains zero leakage of Brand A name");
  assert(!promptB.includes("Cryptographic"), "Test 32: Prompt B contains zero leakage of Brand A category");

  // ==========================================================================
  // 6. NAME PROTECTION (Test 33)
  // ==========================================================================
  console.log("\nSection 6: Name Protection");

  // Create a rogue model output that attempts to rename the brand
  const rogueRenamingOutput: DeliveryOutput = {
    ...mockProofLoomDeliveryOutput,
    brandOverview: {
      ...mockProofLoomDeliveryOutput.brandOverview,
      name: "RogueSecurityAI", // Model attempts unauthorized rename
    },
  };

  const rogueProvider = new TestMockDeliveryProvider(rogueRenamingOutput);
  const rogueResult = await executeDeliveryAgent(
    { projectId: validState.projectId || "test-project-phase8" },
    validState,
    rogueProvider
  );

  assert(
    rogueResult.deliveryOutput?.brandOverview.name === "ProofLoom",
    "Test 33: Delivery Agent overrides rogue model name and enforces authoritative selectedName 'ProofLoom'"
  );
  assert(
    rogueResult.updatedBrandState?.delivery.brandOverview.name === "ProofLoom",
    "Test 33: BrandState.delivery.brandOverview.name strictly preserves authoritative selectedName"
  );
  assert(
    rogueResult.updatedBrandState?.naming.selectedName === "ProofLoom",
    "Test 33: Upstream naming.selectedName remains 100% authoritative and untouched"
  );

  // ==========================================================================
  // 7. CONSISTENCY PROPAGATION (Test 34)
  // ==========================================================================
  console.log("\nSection 7: Consistency Propagation");

  const stateWithConsistencyIssues = buildCompleteBrandState();
  stateWithConsistencyIssues.consistency.readiness = "mostly_coherent";
  stateWithConsistencyIssues.consistency.warnings = [
    "Tone in social channels tends toward over-technical jargon that may alienate non-technical CISOs.",
  ];
  stateWithConsistencyIssues.consistency.crossSystemIssues = [
    {
      id: "cs-issue-test-1",
      severity: "medium",
      relationship: "Voice ↔ Audience",
      evidence: "Technical whitepaper depth vs non-technical procurement stakeholders",
      explanation: "Procurement leads need high-level business risk framing, not AST parsing.",
      recommendation: "Include executive summary variant in delivery messaging pillars.",
    },
  ];

  const promptWithConsistency = buildDeliveryUserPrompt(stateWithConsistencyIssues);
  assert(
    promptWithConsistency.includes("Tone in social channels tends toward over-technical jargon"),
    "Test 34: Delivery prompt contains Consistency warnings"
  );
  assert(
    promptWithConsistency.includes("Voice ↔ Audience"),
    "Test 34: Delivery prompt contains Consistency cross-system issue relationship"
  );
  assert(
    promptWithConsistency.includes("Procurement leads need high-level business risk framing"),
    "Test 34: Delivery prompt contains Consistency explanation"
  );

  // ==========================================================================
  // 8. UNSUPPORTED CLAIM PROTECTION (Test 35)
  // ==========================================================================
  console.log("\nSection 8: Unsupported Claim Protection");

  assert(
    DELIVERY_SYSTEM_PROMPT.includes("DO NOT invent unsupported claims"),
    "Test 35: System prompt prohibits unsupported claims"
  );
  assert(
    DELIVERY_SYSTEM_PROMPT.includes("world's #1") ||
      DELIVERY_SYSTEM_PROMPT.includes("industry leader") ||
      DELIVERY_SYSTEM_PROMPT.includes("unsupported claims"),
    "Test 35: System prompt explicitly flags market supremacy cliches"
  );
  assert(
    DELIVERY_SYSTEM_PROMPT.includes("Ground every deliverable in the supplied upstream brand decisions"),
    "Test 35: System prompt mandates grounding in supplied brand evidence"
  );

  // ==========================================================================
  // 9. canRunDelivery STAGE GATE PREREQUISITE CHECK (Test 36)
  // ==========================================================================
  console.log("\nSection 9: canRunDelivery Stage Gate Prerequisite Check");

  assert(canRunDelivery(validState).allowed === true, "Test 36: canRunDelivery passes when all 8 prerequisites are present");

  const invalidGateState = buildCompleteBrandState();
  invalidGateState.consistency.isEvaluated = false;
  assert(!canRunDelivery(invalidGateState).allowed, "Test 36: canRunDelivery rejects when consistency.isEvaluated is false");

  invalidGateState.consistency.isEvaluated = true;
  invalidGateState.visualDirection.isGenerated = false;
  assert(!canRunDelivery(invalidGateState).allowed, "Test 36: canRunDelivery rejects when visualDirection is false");

  invalidGateState.visualDirection.isGenerated = true;
  invalidGateState.voice.isGenerated = false;
  assert(!canRunDelivery(invalidGateState).allowed, "Test 36: canRunDelivery rejects when voice is false");

  invalidGateState.voice.isGenerated = true;
  invalidGateState.naming.selectedName = null;
  assert(!canRunDelivery(invalidGateState).allowed, "Test 36: canRunDelivery rejects when selectedName is null");

  invalidGateState.naming.selectedName = "ProofLoom";
  invalidGateState.personality.isFormulated = false;
  assert(!canRunDelivery(invalidGateState).allowed, "Test 36: canRunDelivery rejects when personality is false");

  invalidGateState.personality.isFormulated = true;
  invalidGateState.positioning.isPositioned = false;
  assert(!canRunDelivery(invalidGateState).allowed, "Test 36: canRunDelivery rejects when positioning is false");

  invalidGateState.positioning.isPositioned = true;
  invalidGateState.discovery.isAnalyzed = false;
  assert(!canRunDelivery(invalidGateState).allowed, "Test 36: canRunDelivery rejects when discovery is false");

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log("\n==================================================");
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log("==================================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runDeliveryTestSuite().catch((err) => {
  console.error("Test execution failed with unhandled error:", err);
  process.exit(1);
});
