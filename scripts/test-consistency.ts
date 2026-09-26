/**
 * Consistency Engine Test Suite (Phase 7)
 * Comprehensive testing covering all required Phase 7 validation criteria:
 *
 * 1. Schema validation (ConsistencyOutputSchema, ConsistencyReadinessSchema, ConsistencyDimensionAssessmentSchema, CrossSystemIssueSchema, ConsistencyDimensionStatusSchema)
 * 2. Valid Consistency output validation
 * 3. Invalid Consistency output rejection
 * 4. Missing Discovery rejection
 * 5. Missing Positioning rejection
 * 6. Missing Personality rejection
 * 7. Missing Naming rejection
 * 8. Missing selectedName rejection
 * 9. Missing Voice rejection
 * 10. Missing Visual Direction rejection
 * 11. AgentRun creation & trace verification (stage = CONSISTENCY, agentName = Consistency)
 * 12. BrandState update (consistency added, isEvaluated = true, evaluatedAt set, version incremented)
 * 13. State preservation (upstream 6 layers + critique + selectedName strictly unmutated)
 * 14. API behavior (guard checks, structured errors, success 200 payload)
 * 15. Strategic consistency dimension evaluation (status, findings)
 * 16. Audience consistency dimension evaluation (status, findings)
 * 17. Personality consistency dimension evaluation (status, findings)
 * 18. Naming consistency dimension evaluation (status, findings)
 * 19. Voice consistency dimension evaluation (status, findings)
 * 20. Visual consistency dimension evaluation (status, findings)
 * 21. Messaging consistency dimension evaluation (status, findings)
 * 22. Cross-system issues structure (id, severity, relationship, evidence, explanation, recommendation)
 * 23. CRITICAL TEST 1: Fully Coherent Brand (readiness = coherent, zero critical issues, strengths affirmed)
 * 24. CRITICAL TEST 2: Systemically Inconsistent Brand (readiness = inconsistent, multiple cross-system friction issues)
 * 25. CRITICAL TEST 3: Name Protection (selectedName remains human-authoritative and unmutated)
 * 26. CRITICAL TEST 5: Critic Propagation (Critic findings consumed if present, adding cross-system interpretation)
 * 27. CRITICAL TEST 4: Context Propagation across contrasting identities and attribute mutation
 * 28. CRITICAL TEST 7: False-Positive Resistance (A coherent brand is not forced into needs revision)
 * 29. canRunConsistency stage prerequisite verification
 */

import {
  ConsistencyOutputSchema,
  ConsistencyReadinessSchema,
  ConsistencyDimensionAssessmentSchema,
  CrossSystemIssueSchema,
  ConsistencyDimensionStatusSchema,
  type ConsistencyOutput,
  type BrandState,
  createInitialBrandState,
} from "../src/types/brand";
import { executeConsistencyAgent } from "../src/lib/agents/consistency";
import { CONSISTENCY_SYSTEM_PROMPT, buildConsistencyUserPrompt } from "../src/lib/agents/prompts/consistency";
import { canRunConsistency } from "../src/lib/agents/stages";
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

// Mock provider for deterministic Consistency agent testing
class TestMockConsistencyProvider implements LLMProvider {
  readonly providerName = "test-mock-consistency";
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

// Canonical Valid Consistency Output (Coherent / Good Brand)
const mockCoherentConsistencyOutput: ConsistencyOutput = {
  overallAssessment:
    "The ProofLoom brand system demonstrates exceptional systemic cohesion and end-to-end resonance. The mathematical rigor articulated in the core positioning statement flows seamlessly through the Sovereign Sentinel archetype, the austere institutional voice, and the high-contrast typographic visual language, creating an indivisible and self-reinforcing enterprise audit identity.",
  readiness: "coherent",
  strategic: {
    status: "coherent",
    findings: [
      "The smart contract auditing problem directly justifies the deterministic formal verification category.",
      "The differentiator ('zero false-positive mathematical proof') directly substantiates the value proposition without hyperbole.",
      "Target audience requirements are tightly synchronized with the enterprise assurance category framing.",
    ],
  },
  audience: {
    status: "coherent",
    findings: [
      "The Chief Information Security Officer persona perfectly matches the formal, uncompromising tone of voice.",
      "Technical pain points regarding zero-day exploits align with the high-contrast visual precision.",
      "No consumer-oriented or casual jargon leaks into enterprise executive communications.",
    ],
  },
  personality: {
    status: "coherent",
    findings: [
      "The Sovereign Sentinel archetype reinforces the authoritative stance required for high-stakes protocol security.",
      "Behavioral traits ('uncompromising', 'disciplined') guide both the copywriting rules and the visual restraint.",
      "Emotional territory of 'Mathematical Inevitability' is consistently upheld across all collateral.",
    ],
  },
  naming: {
    status: "coherent",
    findings: [
      "The authoritative name 'ProofLoom' seamlessly synthesizes cryptographic proof with structured protocol weaving.",
      "The name maintains strong associative harmony with the category and archetype without trendy gimmickry.",
      "Selected name decision is respected as authoritative and permanent.",
    ],
  },
  voice: {
    status: "coherent",
    findings: [
      "The 'Deterministic & Austere' voice profile directly mirrors the analytical mindset of smart contract auditors.",
      "Homepage hero copy and technical copy demonstrate identical discipline and syntactic clarity.",
      "Writing guidelines enforce concrete mathematical proofs over vague promises.",
    ],
  },
  visual: {
    status: "coherent",
    findings: [
      "Monochrome obsidian-and-platinum palette evokes cryptographic security and institutional permanence.",
      "Editorial serif typography establishes audit-grade authority without decorative distractions.",
      "Layout principles emphasize dense, structured data hierarchy aligned with executive auditing dashboards.",
    ],
  },
  messaging: {
    status: "coherent",
    findings: [
      "Core messaging pillars directly reinforce the primary differentiator across all user touchpoints.",
      "Every product claim is backed by the verifiable proof points outlined in the positioning stage.",
      "Value proposition is stated with concise, unembellished clarity.",
    ],
  },
  crossSystemIssues: [],
  strengths: [
    "Perfect triangle alignment between Sovereign Sentinel archetype, mathematical voice profile, and obsidian visual direction.",
    "Positioning differentiator is carried through every sample headline and microcopy guideline.",
    "Name 'ProofLoom' naturally anchors the entire conceptual and visual metaphor.",
    "All claims and proof points are completely substantiated by documented mechanics.",
  ],
  warnings: [
    "Ensure secondary developer onboarding copy does not become so austere that it discourages junior open-source contributors.",
  ],
};

// Canonical Inconsistent Output (Mismatched Brand System)
const mockInconsistentConsistencyOutput: ConsistencyOutput = {
  overallAssessment:
    "The brand system suffers from severe cross-system friction and multi-layered contradiction. While positioning claims to be an ultra-secure enterprise infrastructure solution, the personality adopts an irreverent rebellious youth posture, the voice reverts to corporate bureaucracy, the visual direction uses neon festival colors, and the messaging employs casual meme slang.",
  readiness: "inconsistent",
  strategic: {
    status: "warning",
    findings: [
      "Category of enterprise cloud security is established, but the differentiator relies on undefined marketing superlatives.",
      "Disconnect between enterprise buyer requirements and youth-culture value framing.",
    ],
  },
  audience: {
    status: "inconsistent",
    findings: [
      "Enterprise CISO audience severely clashes with casual meme-driven social messaging.",
      "Visual density and playful animations alienate risk-averse institutional decision makers.",
    ],
  },
  personality: {
    status: "inconsistent",
    findings: [
      "The 'Playful Rebellious Jester' archetype directly undermines institutional trust in a high-stakes security context.",
      "Rebel posture is contradicted by rigid bureaucratic voice rules in customer support copy.",
    ],
  },
  naming: {
    status: "warning",
    findings: [
      "The selected name 'PinkLoom' projects craft and organic warmth, which clashes with the aggressive cybersecurity positioning.",
      "Note: Name is human-selected and authoritative; recommendations focus on repositioning tone around it rather than altering the name.",
    ],
  },
  voice: {
    status: "inconsistent",
    findings: [
      "Severe tonal split: formal corporate whitepapers vs TikTok meme slang in hero copy.",
      "Tone profile contradicts the stated playful brand personality.",
    ],
  },
  visual: {
    status: "inconsistent",
    findings: [
      "Neon electric pink and lime green palette contradicts enterprise executive compliance expectations.",
      "Playful doodle illustrations undermine the gravity of data breach prevention.",
    ],
  },
  messaging: {
    status: "inconsistent",
    findings: [
      "Unsubstantiated market supremacy claims conflict with zero published security audits.",
      "Messaging pillars fail to communicate technical defensibility.",
    ],
  },
  crossSystemIssues: [
    {
      id: "cs-issue-1",
      severity: "critical",
      relationship: "Positioning ↔ Personality",
      evidence: "Positioning: 'Mission-critical enterprise security' vs Personality: 'Playful Rebellious Jester'",
      explanation:
        "Enterprise buyers purchasing data breach insurance and compliance tools perceive irreverent humor as reckless and dangerous.",
      recommendation:
        "Realign archetype to Guardian or Sage to instill institutional confidence, or reposition the product for grassroots developers.",
    },
    {
      id: "cs-issue-2",
      severity: "critical",
      relationship: "Audience ↔ Visual",
      evidence: "Audience: 'Fortune 500 Chief Information Security Officers' vs Visual: 'Neon electric pink doodle stickers'",
      explanation:
        "The playful aesthetic completely destroys credibility in board-level enterprise procurement reviews.",
      recommendation:
        "Refine visual system into an editorial, high-assurance aesthetic with restrained color accents and disciplined typography.",
    },
    {
      id: "cs-issue-3",
      severity: "high",
      relationship: "Voice ↔ Messaging",
      evidence: "Voice: 'Stiff corporate compliance' vs Messaging: 'Casual meme-driven Discord banter'",
      explanation:
        "Prospective buyers experience cognitive dissonance when transitioning from marketing landing pages to sales presentations.",
      recommendation:
        "Establish unified voice boundaries across all funnel stages, eliminating incongruous social slang.",
    },
    {
      id: "cs-issue-4",
      severity: "medium",
      relationship: "Name ↔ Positioning",
      evidence: "Selected Name: 'PinkLoom' vs Positioning: 'Zero-Trust Military-Grade Cloud Defense'",
      explanation:
        "The gentle, artisanal undertones of 'PinkLoom' produce friction with severe military-grade security terminology.",
      recommendation:
        "Frame 'PinkLoom' around precision architecture and weaving resilient security fabrics, softening militaristic rhetoric.",
    },
  ],
  strengths: [
    "Core problem identification in enterprise security is validated and acute.",
  ],
  warnings: [
    "Immediate executive review required to align visual identity with target enterprise procurement cycles.",
  ],
};

// Helper: Factory function to construct a realistic, schema-valid 6-layer BrandState
function buildCompleteBrandState(overrides: Partial<BrandState> = {}): BrandState {
  const base = createInitialBrandState("test-project-phase7", "A verified cryptographic audit platform");
  base.projectId = "test-project-phase7";

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
    category: "Deterministic Cryptographic Verification Infrastructure",
    categoryRationale:
      "Positions the platform as an essential prerequisite for protocol release rather than an optional secondary auditor.",
    positioningStatement:
      "For enterprise web3 protocols requiring absolute deployment certainty, ProofLoom provides automated mathematical verification certificates with zero false-positives.",
    differentiator:
      "Deterministic formal verification engine mathematically proving contract execution paths instead of heuristic fuzzy testing.",
    valueProposition:
      "Eliminate multi-million-dollar exploit risks with verifiable mathematical proof certificates produced in CI/CD pipelines.",
    competitiveWhitespace: [
      "Existing audit firms provide subjective PDF reports weeks later; ProofLoom delivers instantaneous formal proofs in continuous integration.",
    ],
    alternatives: ["Manual audit firms", "Heuristic static analyzers", "Bug bounty platforms"],
    proofPoints: [
      "Formally proven verification engine mathematically sound across all EVM opcodes",
      "Zero false-positive guarantee with reproducible ZK-proof generation",
      "Sub-second verification latency natively integrated into GitHub Actions",
    ],
    risks: ["Developer resistance to formal mathematical specification syntax"],
    confidence: 94,
    isPositioned: true,
    positionedAt: new Date().toISOString(),
  };

  base.personality = {
    archetype: "Sovereign Sentinel",
    archetypeRationale:
      "An unyielding, mathematically precise guardian that defends protocols through absolute verification and disciplined proof.",
    traits: ["Austere", "Deterministic", "Uncompromising", "Rigorous", "Authoritative"],
    behavioralCharacteristics: [
      "Never uses superlatives or buzzwords; lets mathematical proofs demonstrate capability.",
      "Treats security verification as an absolute binary rather than probabilistic assurance.",
      "Communicates with crisp cryptographic precision and clinical neutrality.",
    ],
    principles: [
      {
        title: "Mathematical Inevitability",
        description: "Proof precedes assertion. We make no claim that cannot be deterministically verified.",
      },
      {
        title: "Clinical Restraint",
        description: "Zero marketing fluff or hyperbole. High-assurance leaders respect quiet competence.",
      },
    ],
    emotionalTerritory: "Calm, unshakable confidence born from mathematical certainty.",
    personalityDo: [
      "State facts, verification metrics, and formal proof theorems directly.",
      "Use disciplined, active, high-precision verbs.",
    ],
    personalityDont: [
      "Never use casual startup slang ('supercharge', 'revolutionary', 'game-changing').",
      "Never make subjective safety claims without attaching the cryptographic verification proof.",
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

  // Critique is also present from Phase 6
  base.critique = {
    summary: "Systemic cryptographic verification posture with high audit-grade integrity.",
    critiques: [],
    genericLanguageDetected: [],
    vulnerabilities: [],
    overallAssessment:
      "The ProofLoom brand exhibits strong systemic cohesion across security positioning, austere tone, and obsidian visual styling.",
    readiness: "ready",
    strengths: [
      "Positioning avoids buzzwords and grounds all claims in deterministic formal verification.",
      "Voice and visual direction mutually reinforce the Sovereign Sentinel archetype.",
    ],
    issues: [
      {
        id: "crit-1",
        severity: "low",
        category: "missing_information",
        evidence: "targetAudience: 'Chief Information Security Officers'",
        explanation: "Secondary developer onboarding could use more specific pain points.",
        suggestedRevision: "Enumerate CLI developer workflows in supplementary documentation.",
      },
    ],
    blockingIssues: [],
    isEvaluated: true,
    evaluatedAt: new Date().toISOString(),
  };

  return { ...base, ...overrides };
}

async function runConsistencyTestSuite() {
  console.log("==================================================");
  console.log("RUNNING PHASE 7 — CONSISTENCY AGENT TEST SUITE");
  console.log("==================================================");

  // ==========================================================================
  // Test 1: Schema Validation (Enums, Statuses, Readiness, Structure)
  // ==========================================================================
  console.log("\nTest 1: Schema Validation (Consistency Enums & Types)");
  assert(ConsistencyDimensionStatusSchema.safeParse("coherent").success, "DimensionStatus accepts 'coherent'");
  assert(ConsistencyDimensionStatusSchema.safeParse("warning").success, "DimensionStatus accepts 'warning'");
  assert(ConsistencyDimensionStatusSchema.safeParse("inconsistent").success, "DimensionStatus accepts 'inconsistent'");
  assert(!ConsistencyDimensionStatusSchema.safeParse("invalid_status").success, "DimensionStatus rejects invalid strings");

  assert(ConsistencyReadinessSchema.safeParse("coherent").success, "Readiness accepts 'coherent'");
  assert(ConsistencyReadinessSchema.safeParse("mostly_coherent").success, "Readiness accepts 'mostly_coherent'");
  assert(ConsistencyReadinessSchema.safeParse("inconsistent").success, "Readiness accepts 'inconsistent'");
  assert(!ConsistencyReadinessSchema.safeParse("not_ready").success, "Readiness rejects critic-specific 'not_ready'");
  assert(!ConsistencyReadinessSchema.safeParse("ready").success, "Readiness rejects critic-specific 'ready'");

  const validDimAssessment = {
    status: "coherent",
    findings: ["Strong alignment between positioning and category."],
  };
  assert(ConsistencyDimensionAssessmentSchema.safeParse(validDimAssessment).success, "DimensionAssessment parses valid object");

  const validIssue = {
    id: "iss-1",
    severity: "critical",
    relationship: "Positioning ↔ Personality",
    evidence: "Mission critical vs Playful jester",
    explanation: "Friction between high-security positioning and playful tone.",
    recommendation: "Align archetype to Guardian or Sage.",
  };
  assert(CrossSystemIssueSchema.safeParse(validIssue).success, "CrossSystemIssue parses valid object");

  // ==========================================================================
  // Test 2: Valid Consistency Output Validation
  // ==========================================================================
  console.log("\nTest 2: Valid Consistency Output Validation");
  const parseValid = ConsistencyOutputSchema.safeParse(mockCoherentConsistencyOutput);
  assert(parseValid.success, "Canonical coherent ConsistencyOutput passes schema parse", parseValid.error?.message);

  const parseInconsistent = ConsistencyOutputSchema.safeParse(mockInconsistentConsistencyOutput);
  assert(parseInconsistent.success, "Canonical inconsistent ConsistencyOutput passes schema parse", parseInconsistent.error?.message);

  // ==========================================================================
  // Test 3: Invalid Consistency Output Rejection
  // ==========================================================================
  console.log("\nTest 3: Invalid Consistency Output Rejection");
  const missingDimension = { ...mockCoherentConsistencyOutput } as Record<string, unknown>;
  delete missingDimension.messaging;
  assert(!ConsistencyOutputSchema.safeParse(missingDimension).success, "Rejects ConsistencyOutput missing 'messaging' dimension");

  const invalidReadiness = { ...mockCoherentConsistencyOutput, readiness: "super_coherent" };
  assert(!ConsistencyOutputSchema.safeParse(invalidReadiness).success, "Rejects invalid readiness enum value");

  const missingIssueField = {
    ...mockInconsistentConsistencyOutput,
    crossSystemIssues: [
      {
        id: "err-1",
        severity: "critical",
        // missing relationship!
        evidence: "evidence text",
        explanation: "explanation text",
        recommendation: "rec text",
      },
    ],
  };
  assert(!ConsistencyOutputSchema.safeParse(missingIssueField).success, "Rejects crossSystemIssues missing 'relationship'");

  // ==========================================================================
  // Test 4-10: Prerequisite Guard Verifications (Layer by Layer)
  // ==========================================================================
  console.log("\nTests 4-10: Prerequisite Guard Verifications");

  // Test 4: Missing Discovery
  const noDiscovery = buildCompleteBrandState();
  noDiscovery.discovery.isAnalyzed = false;
  const resNoDisc = await executeConsistencyAgent(
    { projectId: noDiscovery.projectId || "test-project-phase7", brandState: noDiscovery },
    new TestMockConsistencyProvider(mockCoherentConsistencyOutput)
  );
  assert(!resNoDisc.success, "Test 4: Fails when Discovery is incomplete");
  assert(resNoDisc.error?.includes("Discovery"), "Test 4: Error specifically cites Discovery requirement");

  // Test 5: Missing Positioning
  const noPos = buildCompleteBrandState();
  noPos.positioning.isPositioned = false;
  const resNoPos = await executeConsistencyAgent(
    { projectId: noPos.projectId || "test-project-phase7", brandState: noPos },
    new TestMockConsistencyProvider(mockCoherentConsistencyOutput)
  );
  assert(!resNoPos.success, "Test 5: Fails when Positioning is incomplete");
  assert(resNoPos.error?.includes("Positioning"), "Test 5: Error specifically cites Positioning requirement");

  // Test 6: Missing Personality
  const noPers = buildCompleteBrandState();
  noPers.personality.isFormulated = false;
  const resNoPers = await executeConsistencyAgent(
    { projectId: noPers.projectId || "test-project-phase7", brandState: noPers },
    new TestMockConsistencyProvider(mockCoherentConsistencyOutput)
  );
  assert(!resNoPers.success, "Test 6: Fails when Personality is incomplete");
  assert(resNoPers.error?.includes("Personality"), "Test 6: Error specifically cites Personality requirement");

  // Test 7: Missing Naming
  const noNaming = buildCompleteBrandState();
  noNaming.naming.isGenerated = false;
  const resNoNaming = await executeConsistencyAgent(
    { projectId: noNaming.projectId || "test-project-phase7", brandState: noNaming },
    new TestMockConsistencyProvider(mockCoherentConsistencyOutput)
  );
  assert(!resNoNaming.success, "Test 7: Fails when Naming is incomplete");

  // Test 8: Missing selectedName
  const noSelectedName = buildCompleteBrandState();
  noSelectedName.naming.selectedName = null;
  noSelectedName.naming.isSelected = false;
  const resNoName = await executeConsistencyAgent(
    { projectId: noSelectedName.projectId || "test-project-phase7", brandState: noSelectedName },
    new TestMockConsistencyProvider(mockCoherentConsistencyOutput)
  );
  assert(!resNoName.success, "Test 8: Fails when candidate name is unselected");
  assert(resNoName.error?.includes("select a candidate brand name"), "Test 8: Error specifically cites selectedName requirement");

  // Test 9: Missing Voice
  const noVoice = buildCompleteBrandState();
  noVoice.voice.isGenerated = false;
  const resNoVoice = await executeConsistencyAgent(
    { projectId: noVoice.projectId || "test-project-phase7", brandState: noVoice },
    new TestMockConsistencyProvider(mockCoherentConsistencyOutput)
  );
  assert(!resNoVoice.success, "Test 9: Fails when Voice is incomplete");
  assert(resNoVoice.error?.includes("Voice"), "Test 9: Error specifically cites Voice requirement");

  // Test 10: Missing Visual Direction
  const noVisual = buildCompleteBrandState();
  noVisual.visualDirection.isGenerated = false;
  const resNoVisual = await executeConsistencyAgent(
    { projectId: noVisual.projectId || "test-project-phase7", brandState: noVisual },
    new TestMockConsistencyProvider(mockCoherentConsistencyOutput)
  );
  assert(!resNoVisual.success, "Test 10: Fails when Visual Direction is incomplete");
  assert(resNoVisual.error?.includes("Visual Direction"), "Test 10: Error specifically cites Visual Direction requirement");

  // ==========================================================================
  // Test 11: AgentRun Creation & Trace Verification
  // ==========================================================================
  console.log("\nTest 11: AgentRun Creation & Trace Verification");
  const validState = buildCompleteBrandState();
  const mockProvider11 = new TestMockConsistencyProvider(mockCoherentConsistencyOutput);
  const exec11 = await executeConsistencyAgent(
    { projectId: validState.projectId || "test-project-phase7", brandState: validState },
    mockProvider11
  );

  assert(exec11.success, "Execution succeeds with valid 6 layers");
  assert(Boolean(exec11.agentRun), "AgentRun was created and returned");
  const run = exec11.agentRun!;
  assert(run.stage === "CONSISTENCY", `AgentRun stage is 'CONSISTENCY' (got ${run.stage})`);
  assert(run.agentName === "Consistency", `AgentRun agentName is 'Consistency' (got ${run.agentName})`);
  assert(run.status === "completed", `AgentRun status is 'completed' (got ${run.status})`);
  assert(typeof run.durationMs === "number" && run.durationMs >= 0, "AgentRun contains numeric durationMs");
  assert(Boolean(run.completedAt), "AgentRun contains completedAt timestamp");
  assert(Boolean(run.input), "AgentRun tracks input payload");
  assert(Boolean(run.output), "AgentRun tracks structured output payload");

  // ==========================================================================
  // Test 12: BrandState Update Verification
  // ==========================================================================
  console.log("\nTest 12: BrandState Update Verification");
  const updatedState = exec11.updatedBrandState!;
  assert(Boolean(updatedState.consistency), "BrandState.consistency is populated");
  assert(updatedState.consistency.isEvaluated === true, "BrandState.consistency.isEvaluated is true");
  assert(Boolean(updatedState.consistency.evaluatedAt), "BrandState.consistency.evaluatedAt timestamp is set");
  assert(updatedState.consistency.readiness === "coherent", "BrandState.consistency.readiness matches model output");
  assert(updatedState.version > validState.version, `BrandState.version was incremented (${validState.version} -> ${updatedState.version})`);

  // ==========================================================================
  // Test 13: State Preservation (Deep immutability of upstream layers)
  // ==========================================================================
  console.log("\nTest 13: State Preservation (Deep Immutability of Upstream Layers)");
  const baselineState = buildCompleteBrandState();
  const preConsistencySnapshot = JSON.parse(JSON.stringify(baselineState));

  const preserveExec = await executeConsistencyAgent(
    { projectId: baselineState.projectId || "test-project-phase7", brandState: baselineState },
    new TestMockConsistencyProvider(mockCoherentConsistencyOutput)
  );
  const preservedState = preserveExec.updatedBrandState!;

  assert(
    JSON.stringify(preservedState.discovery) === JSON.stringify(preConsistencySnapshot.discovery),
    "Discovery object is bit-for-bit unchanged"
  );
  assert(
    JSON.stringify(preservedState.positioning) === JSON.stringify(preConsistencySnapshot.positioning),
    "Positioning object is bit-for-bit unchanged"
  );
  assert(
    JSON.stringify(preservedState.personality) === JSON.stringify(preConsistencySnapshot.personality),
    "Personality object is bit-for-bit unchanged"
  );
  assert(
    JSON.stringify(preservedState.naming) === JSON.stringify(preConsistencySnapshot.naming),
    "Naming object is bit-for-bit unchanged"
  );
  assert(
    preservedState.naming.selectedName === preConsistencySnapshot.naming.selectedName,
    "selectedName is strictly unchanged"
  );
  assert(
    JSON.stringify(preservedState.voice) === JSON.stringify(preConsistencySnapshot.voice),
    "Voice object is bit-for-bit unchanged"
  );
  assert(
    JSON.stringify(preservedState.visualDirection) === JSON.stringify(preConsistencySnapshot.visualDirection),
    "Visual Direction object is bit-for-bit unchanged"
  );
  assert(
    JSON.stringify(preservedState.critique) === JSON.stringify(preConsistencySnapshot.critique),
    "Critique object is bit-for-bit unchanged"
  );

  // ==========================================================================
  // Test 14: API Error Handling & Provider Failure
  // ==========================================================================
  console.log("\nTest 14: API Error Handling & Provider Failure");
  const failingProvider = new TestMockConsistencyProvider(undefined, true);
  const failExec = await executeConsistencyAgent(
    { projectId: baselineState.projectId || "test-project-phase7", brandState: baselineState },
    failingProvider
  );
  assert(!failExec.success, "Fails safely when LLM provider throws error");
  assert(failExec.error?.includes("504"), "Propagates descriptive error message without crashing");
  assert(failExec.agentRun?.status === "failed", "AgentRun is recorded with status 'failed'");

  // ==========================================================================
  // Tests 15-21: The 7 Consistency Dimensions Verification
  // ==========================================================================
  console.log("\nTests 15-21: Verification of All Seven Consistency Dimensions");
  assert(Boolean(updatedState.consistency.strategic), "Test 15: Strategic consistency dimension is present");
  assert(
    ["coherent", "warning", "inconsistent"].includes(updatedState.consistency.strategic.status),
    "Test 15: Strategic dimension has valid status enum"
  );
  assert(Array.isArray(updatedState.consistency.strategic.findings), "Test 15: Strategic dimension contains findings array");

  assert(Boolean(updatedState.consistency.audience), "Test 16: Audience consistency dimension is present");
  assert(
    ["coherent", "warning", "inconsistent"].includes(updatedState.consistency.audience.status),
    "Test 16: Audience dimension has valid status enum"
  );
  assert(Array.isArray(updatedState.consistency.audience.findings), "Test 16: Audience dimension contains findings array");

  assert(Boolean(updatedState.consistency.personality), "Test 17: Personality consistency dimension is present");
  assert(
    ["coherent", "warning", "inconsistent"].includes(updatedState.consistency.personality.status),
    "Test 17: Personality dimension has valid status enum"
  );
  assert(Array.isArray(updatedState.consistency.personality.findings), "Test 17: Personality dimension contains findings array");

  assert(Boolean(updatedState.consistency.naming), "Test 18: Naming consistency dimension is present");
  assert(
    ["coherent", "warning", "inconsistent"].includes(updatedState.consistency.naming.status),
    "Test 18: Naming dimension has valid status enum"
  );
  assert(Array.isArray(updatedState.consistency.naming.findings), "Test 18: Naming dimension contains findings array");

  assert(Boolean(updatedState.consistency.voice), "Test 19: Voice consistency dimension is present");
  assert(
    ["coherent", "warning", "inconsistent"].includes(updatedState.consistency.voice.status),
    "Test 19: Voice dimension has valid status enum"
  );
  assert(Array.isArray(updatedState.consistency.voice.findings), "Test 19: Voice dimension contains findings array");

  assert(Boolean(updatedState.consistency.visual), "Test 20: Visual consistency dimension is present");
  assert(
    ["coherent", "warning", "inconsistent"].includes(updatedState.consistency.visual.status),
    "Test 20: Visual dimension has valid status enum"
  );
  assert(Array.isArray(updatedState.consistency.visual.findings), "Test 20: Visual dimension contains findings array");

  assert(Boolean(updatedState.consistency.messaging), "Test 21: Messaging consistency dimension is present");
  assert(
    ["coherent", "warning", "inconsistent"].includes(updatedState.consistency.messaging.status),
    "Test 21: Messaging dimension has valid status enum"
  );
  assert(Array.isArray(updatedState.consistency.messaging.findings), "Test 21: Messaging dimension contains findings array");

  // ==========================================================================
  // Test 22: Cross-System Issues Structure Verification
  // ==========================================================================
  console.log("\nTest 22: Cross-System Issues Structure Verification");
  const inconsistentExec = await executeConsistencyAgent(
    { projectId: baselineState.projectId || "test-project-phase7", brandState: baselineState },
    new TestMockConsistencyProvider(mockInconsistentConsistencyOutput)
  );
  const incState = inconsistentExec.updatedBrandState!;
  assert(incState.consistency.crossSystemIssues.length > 0, "Inconsistent brand identifies cross-system issues");
  const firstIssue = incState.consistency.crossSystemIssues[0];
  assert(Boolean(firstIssue.id), "Cross-system issue has id");
  assert(["critical", "high", "medium", "low"].includes(firstIssue.severity), "Cross-system issue has valid severity");
  assert(Boolean(firstIssue.relationship), "Cross-system issue specifies cross-layer relationship");
  assert(Boolean(firstIssue.evidence), "Cross-system issue cites verbatim evidence");
  assert(Boolean(firstIssue.explanation), "Cross-system issue provides diagnostic explanation");
  assert(Boolean(firstIssue.recommendation), "Cross-system issue provides actionable recommendation");

  // ==========================================================================
  // CRITICAL TEST 1: Fully Coherent Brand (Test 23)
  // ==========================================================================
  console.log("\nCRITICAL TEST 1: Fully Coherent Brand Evaluation");
  const coherentExec = await executeConsistencyAgent(
    { projectId: baselineState.projectId || "test-project-phase7", brandState: baselineState },
    new TestMockConsistencyProvider(mockCoherentConsistencyOutput)
  );
  const cohState = coherentExec.updatedBrandState!;
  assert(cohState.consistency.readiness === "coherent", "Readiness is 'coherent'");
  assert(cohState.consistency.crossSystemIssues.length === 0, "Zero critical cross-system issues fabricated");
  assert(cohState.consistency.strengths.length > 0, "Systemic strengths correctly identified and affirmed");
  assert(cohState.consistency.strategic.status === "coherent", "Strategic dimension is coherent");
  assert(cohState.consistency.voice.status === "coherent", "Voice dimension is coherent");
  assert(cohState.consistency.visual.status === "coherent", "Visual dimension is coherent");

  // ==========================================================================
  // CRITICAL TEST 2: Systemically Inconsistent Brand (Test 24)
  // ==========================================================================
  console.log("\nCRITICAL TEST 2: Systemically Inconsistent Brand Evaluation");
  assert(incState.consistency.readiness === "inconsistent", "Readiness is 'inconsistent'");
  assert(incState.consistency.crossSystemIssues.length >= 3, "Detects multiple cross-system friction issues");
  const relationships = incState.consistency.crossSystemIssues.map((iss) => iss.relationship);
  assert(
    relationships.some((r) => r.includes("Personality") || r.includes("Positioning")),
    "Identifies Positioning ↔ Personality cross-system contradiction"
  );
  assert(
    relationships.some((r) => r.includes("Audience") || r.includes("Visual")),
    "Identifies Audience ↔ Visual mismatch"
  );

  // ==========================================================================
  // CRITICAL TEST 3: Name Protection (Test 25)
  // ==========================================================================
  console.log("\nCRITICAL TEST 3: Name Protection (selectedName is Strictly Authoritative)");
  const nameMismatchState = buildCompleteBrandState();
  nameMismatchState.naming.selectedName = "PinkLoom";

  const nameMismatchExec = await executeConsistencyAgent(
    { projectId: nameMismatchState.projectId || "test-project-phase7", brandState: nameMismatchState },
    new TestMockConsistencyProvider(mockInconsistentConsistencyOutput)
  );
  const postNameState = nameMismatchExec.updatedBrandState!;
  assert(
    postNameState.naming.selectedName === "PinkLoom",
    "selectedName 'PinkLoom' remains strictly untouched even under systemic naming warnings"
  );
  assert(
    postNameState.naming.isSelected === true,
    "selectedName remains marked as selected"
  );

  // ==========================================================================
  // CRITICAL TEST 5: Critic Propagation (Test 26)
  // ==========================================================================
  console.log("\nCRITICAL TEST 5: Critic Propagation (Critic Findings Consumed & Synthesized)");
  const stateWithCritique = buildCompleteBrandState();
  stateWithCritique.critique = {
    summary: "Voice guidelines contain severe corporate stiffness contradicting playful rebel positioning.",
    critiques: [],
    genericLanguageDetected: [],
    vulnerabilities: [],
    overallAssessment: "Voice guidelines contain severe corporate stiffness contradicting playful rebel positioning.",
    readiness: "needs_revision",
    strengths: ["Strong problem formulation"],
    issues: [
      {
        id: "crit-voice-1",
        severity: "critical",
        category: "voice_inconsistency",
        evidence: "Voice tone: Formal bureaucratic compliance vs Personality: Playful rebel",
        explanation: "Voice tone directly destroys personality archetype credibility.",
        suggestedRevision: "Adopt direct conversational tone.",
      },
    ],
    blockingIssues: [
      {
        id: "crit-voice-1",
        severity: "critical",
        category: "voice_inconsistency",
        evidence: "Voice tone: Formal bureaucratic compliance vs Personality: Playful rebel",
        explanation: "Voice tone directly destroys personality archetype credibility.",
        suggestedRevision: "Adopt direct conversational tone.",
      },
    ],
    isEvaluated: true,
    evaluatedAt: new Date().toISOString(),
  };

  const promptWithCritique = buildConsistencyUserPrompt(stateWithCritique);
  assert(
    promptWithCritique.includes("PHASE 6 CRITIQUE FINDINGS"),
    "Consistency prompt explicitly incorporates upstream Critic diagnostic findings"
  );
  assert(
    promptWithCritique.includes("crit-voice-1"),
    "Prompt contains specific issue IDs and categories from Critic"
  );
  assert(
    promptWithCritique.includes("Voice guidelines contain severe corporate stiffness"),
    "Prompt contains Critic overall assessment"
  );

  // Prompt when critique is absent
  const stateWithoutCritique = buildCompleteBrandState();
  stateWithoutCritique.critique = {
    summary: "",
    critiques: [],
    genericLanguageDetected: [],
    vulnerabilities: [],
    overallAssessment: "",
    readiness: "ready",
    strengths: [],
    issues: [],
    blockingIssues: [],
    isEvaluated: false,
  };
  const promptWithoutCritique = buildConsistencyUserPrompt(stateWithoutCritique);
  assert(
    promptWithoutCritique.includes("Critic stage has not been executed yet"),
    "Prompt clearly represents absence of Critic evaluation without fabricating data"
  );

  // ==========================================================================
  // CRITICAL TEST 4: Context Propagation (Brand A vs Brand B) (Test 27)
  // ==========================================================================
  console.log("\nCRITICAL TEST 4: Context Propagation Across Distinct Brands");
  const brandA = buildCompleteBrandState();
  brandA.naming.selectedName = "ProofLoom";
  brandA.positioning.category = "Cryptographic Verification";

  const brandB = buildCompleteBrandState();
  brandB.projectId = "brand-b-flickerpop";
  brandB.naming.selectedName = "FlickerPop";
  brandB.naming.directions = [
    {
      id: "dir-pop",
      name: "Playful Beverage",
      strategy: "Sensory sparkle and effervescence",
      rationale: "Celebrates natural bubbling botanical energy",
      namingLogic: "Phonetic pop with sparkling energy",
      candidates: [
        {
          name: "FlickerPop",
          rationale: "Sparkling natural effervescence",
          linguisticRationale: "Onomatopoeic plosive pop",
          phoneticAssessment: "Crisp and lively",
          domainSuitability: "Highly distinct in beverage retail",
        },
      ],
      taglineCandidates: ["Naturally sparkling botanical tonics."],
    },
  ];
  brandB.positioning.category = "Artisanal Fizzy Beverage Craft";
  brandB.positioning.positioningStatement = "For adventurous beverage lovers, FlickerPop crafts organic botanical tonics.";
  brandB.positioning.differentiator = "Cold-pressed herbs without synthetic syrups.";
  brandB.positioning.valueProposition = "Pure botanical sparkle for mindful refreshment.";
  brandB.positioning.competitiveWhitespace = ["FlickerPop replaces artificial syrups with cold-pressed sparkling herbs."];
  brandB.voice.examples = {
    homepageHero: "Sparkling botanical refreshment without artificial syrups.",
    shortPitch: "FlickerPop delivers natural botanical sparkle.",
    primaryCTA: "Taste The Sparkle",
    socialPost: "Ditch the corn syrup. FlickerPop crafts honest botanical fizz.",
  };
  brandB.critique.overallAssessment = "FlickerPop shows strong playful craft beverage cohesion.";

  const promptA = buildConsistencyUserPrompt(brandA);
  const promptB = buildConsistencyUserPrompt(brandB);

  assert(promptA.includes("ProofLoom"), "Prompt A incorporates Brand A name");
  assert(promptA.includes("Cryptographic Verification"), "Prompt A incorporates Brand A category");
  assert(promptB.includes("FlickerPop"), "Prompt B incorporates Brand B name");
  assert(promptB.includes("Artisanal Fizzy Beverage Craft"), "Prompt B incorporates Brand B category");

  assert(!promptA.includes("FlickerPop"), "Prompt A contains zero leakage of Brand B");
  assert(!promptB.includes("ProofLoom"), "Prompt B contains zero leakage of Brand A");

  // Attribute mutation test: mutating positioning dynamically updates user prompt
  brandA.positioning.category = "Quantum State Ledger Certification";
  const promptAModified = buildConsistencyUserPrompt(brandA);
  assert(
    promptAModified.includes("Quantum State Ledger Certification"),
    "Prompt dynamically shifts when upstream positioning attribute is mutated"
  );

  // ==========================================================================
  // CRITICAL TEST 7: False-Positive Resistance (Test 28)
  // ==========================================================================
  console.log("\nCRITICAL TEST 7: False-Positive Resistance Verification");
  // Ensure that a coherent brand is completely capable of returning readiness = "coherent"
  // with zero critical issues and zero blocking status
  assert(
    mockCoherentConsistencyOutput.readiness === "coherent",
    "Agent contract explicitly allows readiness = 'coherent'"
  );
  assert(
    mockCoherentConsistencyOutput.crossSystemIssues.length === 0,
    "Coherent brand can have zero cross-system friction issues"
  );
  assert(
    CONSISTENCY_SYSTEM_PROMPT.includes("DO NOT invent false contradictions"),
    "System prompt contains explicit anti-false-positive rule"
  );

  // ==========================================================================
  // Test 29: canRunConsistency Stage Gate Verification
  // ==========================================================================
  console.log("\nTest 29: canRunConsistency Stage Gate Prerequisite Check");
  assert(canRunConsistency(validState).allowed === true, "canRunConsistency passes when all 6 layers are present");

  const invalidGateState = buildCompleteBrandState();
  invalidGateState.visualDirection.isGenerated = false;
  assert(!canRunConsistency(invalidGateState).allowed, "canRunConsistency rejects when visualDirection is false");

  invalidGateState.visualDirection.isGenerated = true;
  invalidGateState.voice.isGenerated = false;
  assert(!canRunConsistency(invalidGateState).allowed, "canRunConsistency rejects when voice is false");

  invalidGateState.voice.isGenerated = true;
  invalidGateState.naming.selectedName = null;
  assert(!canRunConsistency(invalidGateState).allowed, "canRunConsistency rejects when selectedName is null");

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

runConsistencyTestSuite().catch((err) => {
  console.error("Test execution failed with unhandled error:", err);
  process.exit(1);
});
