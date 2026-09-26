/**
 * Pre-Phase-10 Critic / Challenge UI Refinement Test Suite
 *
 * Verifies all 13 required UI criteria:
 * 1. Critical issue rendering
 * 2. Warning rendering
 * 3. Info rendering
 * 4. Five critical challenges rendering
 * 5. Long challenge text
 * 6. Empty state
 * 7. Loading state
 * 8. Error state
 * 9. Category rendering (all 12 categories)
 * 10. Review action (mapping to upstream stages)
 * 11. No automatic claim modification & accurate uncertainty communication
 * 12. No BrandState mutation (bit-for-bit immutability)
 * 13. Responsive-safe rendering & accessibility attributes
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  type BrandState,
  createInitialBrandState,
  type CriticIssue,
} from "../src/types/brand";
import {
  CRITIC_CATEGORY_LABELS,
  mapSeverityToHierarchy,
  refineClaimLanguage,
  refineRecommendedAction,
  getRecommendedStageForCategory,
  deriveIssueTitle,
  formatCriticalBlockingIssue,
} from "../src/lib/critic/critic-ui-helpers";
import { CriticView } from "../src/components/critic/CriticView";

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

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Helper to create fully analyzed BrandState with 6 upstream layers
function createMockAuditedBrandState(): BrandState {
  const base = createInitialBrandState("A platform for automated brand strategy and identity design");
  base.projectId = "test-project-pre-phase10-critic";
  base.version = 1;

  base.discovery = {
    rawIdea: "A platform for automated brand strategy and identity design",
    problem: "Early-stage founders lack access to senior brand strategy consultants.",
    targetAudience: {
      primary: "Seed-stage technical founders and startup operators",
      secondary: ["Product Managers", "Solo Developers"],
      characteristics: ["High engineering velocity", "Time-constrained"],
      painPoints: ["Inconsistent visual assets", "Unfocused positioning messaging"],
      motivations: ["Launch credible brand system quickly", "Attract initial angel investment"],
    },
    userNeeds: ["Clear positioning statements", "Production-grade design tokens", "Audit-ready brand guide"],
    constraints: ["Budget under $5k", "Timeline under 1 week"],
    assumptions: ["Founders know their initial target customer segment"],
    missingInformation: [],
    clarifyingQuestions: [],
    isAnalyzed: true,
    analyzedAt: "2026-03-01T10:00:00.000Z",
  };

  base.positioning = {
    category: "Autonomous Brand Architecture Engine",
    categoryRationale: "Transforms brand creation from subjective guesswork into deterministic architectural strategy.",
    positioningStatement: "For technical founders launching ambitious ventures, ProofLoom is the autonomous brand architecture platform that synthesizes audit-grade identities in minutes.",
    differentiator: "Deterministic cross-system consistency checking and formal brand proof generation.",
    valueProposition: "Launch institutional-grade brand systems with zero agency overhead.",
    competitiveWhitespace: ["Multi-agent consistency auditing", "Deterministic token validation", "Pre-launch challenge testing"],
    proofPoints: ["10x faster turnaround than boutique agencies", "Zero cross-stage contradictions"],
    alternatives: ["Generic DIY logo generators", "Traditional $50k branding agencies"],
    risks: ["Founders confusing brand kit for product execution"],
    confidence: 0.95,
    isPositioned: true,
    positionedAt: "2026-03-01T10:30:00.000Z",
  };

  base.personality = {
    archetype: "The Sage / Architect",
    archetypeRationale: "Emphasizes structural discipline, intellectual rigor, and uncompromising aesthetic precision.",
    traits: ["Authoritative", "Systemic", "Disciplined", "Lucid", "Empowering"],
    behavioralCharacteristics: ["Speaks with architectural clarity", "Avoids hyperbolic marketing jargon", "Focuses on evidence"],
    principles: [
      { title: "Structure over ornamentation", description: "Design systems must solve strategic communication goals." },
      { title: "Coherence above novelty", description: "Every touchpoint must reinforce the foundational archetype." },
    ],
    emotionalTerritory: "Quiet confidence, surgical clarity, and structural beauty.",
    personalityDo: ["Provide concrete architectural rationale", "Acknowledge engineering constraints"],
    personalityDont: ["Use emotional hype or ungrounded superlatives", "Employ noisy decorative flourishes"],
    confidence: 0.94,
    isFormulated: true,
    formulatedAt: "2026-03-01T11:00:00.000Z",
  };

  base.naming = {
    directions: [
      {
        id: "dir-1",
        name: "Architectural Precision",
        strategy: "Names evoking deliberate craft and verified structure.",
        rationale: "Aligns with Architect archetype.",
        namingLogic: "Pairs evidence and weaving metaphors.",
        taglineCandidates: ["Autonomous Brand Architecture", "Deterministic Identity Systems"],
        candidates: [
          {
            name: "ProofLoom",
            rationale: "Evokes mathematical certainty and systemic weaving of brand threads.",
            linguisticRationale: "Strong plosive start with smooth resonating liquid coda.",
            phoneticAssessment: "Crisp two-syllable cadence with institutional weight.",
            domainSuitability: "Available across modern tech TLDs.",
          },
        ],
      },
    ],
    selectedName: "ProofLoom",
    selectedTagline: "Autonomous Brand Architecture",
    selectedDirectionId: "dir-1",
    isSelected: true,
    selectedAt: "2026-03-01T11:30:00.000Z",
    isGenerated: true,
    generatedAt: "2026-03-01T11:15:00.000Z",
  };

  base.voice = {
    toneProfile: {
      primary: "Authoritative & Architectural",
      secondary: ["Precise", "Measured", "Clear"],
      tonalBalance: "75% technical precision, 25% empowering clarity",
      emotionalEffect: "Instills immediate confidence through rigorous clarity",
    },
    toneDimensions: [
      { dimension: "Formality", level: 4, rationale: "Professional and executive-ready" },
      { dimension: "Directness", level: 5, rationale: "Unambiguous declarative statements" },
    ],
    vocabulary: {
      preferred: ["deterministic", "architectural", "coherence", "systemic", "proof"],
      avoid: ["disruptive", "game-changing", "magic", "ninja", "supercharged"],
      terminology: ["brand architecture", "typographic hierarchy", "chromatic system"],
      languageCharacteristics: ["Active voice", "Concise declarative sentences"],
    },
    messagingPillars: [
      {
        title: "Deterministic Coherence",
        purpose: "Eliminate cross-channel brand contradictions",
        keyMessage: "Every brand asset reinforces one unified thesis.",
        supportingPoints: ["Cross-system auditing", "Automated alignment checks"],
      },
    ],
    communicationPrinciples: [
      { principle: "State facts directly", description: "Avoid marketing hyperbole." },
    ],
    writingGuidelines: {
      sentenceStyle: ["Direct, punchy engineering sentences"],
      structure: ["Observation first, then structural rationale, then actionable next step"],
      callsToAction: ["Inspect Architecture", "Synthesize Brand Tokens"],
      punctuationAndFormatting: ["Monospace code tags for system variables", "No exclamation marks"],
    },
    examples: {
      homepageHero: "Architect your brand system with mathematical precision.",
      shortPitch: "ProofLoom turns scattered brand ideas into audit-grade identity systems in minutes.",
      primaryCTA: "Architect Your Brand",
      socialPost: "Most brands suffer from silent cross-system contradictions. ProofLoom audits your voice, strategy, and visuals before release.",
    },
    voiceDonts: ["Never make ungrounded market supremacy claims", "Never use patronizing buzzwords"],
    consistencyRules: ["Maintain architectural precision across all surfaces"],
    isGenerated: true,
    generatedAt: "2026-03-01T12:00:00.000Z",
  };

  base.visualDirection = {
    colorSystem: {
      primary: [
        { name: "Architect Obsidian", hex: "#141416", role: "primary", usage: "Dominant background and primary surfaces" },
        { name: "Loom Coral", hex: "#E87A90", role: "accent", usage: "Interactive indicators and highlights" },
      ],
      secondary: [
        { name: "Warm Parchment", hex: "#FAF8F5", role: "secondary", usage: "Light background surfaces" },
      ],
      neutrals: [
        { name: "Stone Slate", hex: "#686764", role: "neutral", usage: "Secondary typography" },
        { name: "Hairline Cream", hex: "#E8E5DF", role: "neutral", usage: "Subtle borders" },
      ],
      semantic: [
        { name: "Pass Green", hex: "#2E7D32", role: "semantic", usage: "Verified audit state" },
      ],
      accessibility: {
        contrastNotes: "14:1 contrast ratio across obsidian and white surfaces",
        wcagCompliance: "WCAG 2.1 AAA",
        darkThemeConsiderations: "Optimized for high-contrast dark and light modes",
      },
    },
    typography: {
      heading: {
        fontFamily: "Instrument Serif",
        category: "Serif",
        weights: ["400"],
        usage: "Hero headlines and section titles",
      },
      body: {
        fontFamily: "Inter",
        category: "Sans-serif",
        weights: ["400", "500", "600"],
        usage: "Body paragraphs and UI components",
      },
      pairing: {
        headingFont: "Instrument Serif",
        bodyFont: "Inter",
        contrast: "Editorial elegance balanced with clean grotesque precision",
        mood: "Disciplined, architectural, timeless",
      },
      rationale: "Balances intellectual gravity with modern digital legibility.",
    },
    visualPersonality: {
      aestheticMood: "Architectural Editorial",
      visualKeywords: ["Disciplined", "Monochrome", "Surgical", "Warm", "Tactile"],
      designPrinciples: [
        { principle: "Every pixel has structural purpose", description: "Zero purely decorative noise." },
      ],
      imageryDirection: "Architectural blueprints and fine linework weaving diagrams.",
    },
    imagery: {
      photographyDirection: "Monochrome architectural studies in dramatic natural raking light",
      illustrationDirection: "Precise vector schematics and orthogonal grid diagrams",
      composition: "Strict modular 8px grid layouts with generous white space",
      subjectTreatment: "Sharp linework and clean vector geometries",
    },
    logoDirection: {
      concept: "Interlocking geometric loom reed forming an abstracted capital P",
      markDirection: "Crisp vector geometry with hairline intersections",
      wordmarkDirection: "Custom tracked Instrument Serif with modified terminals",
      constructionPrinciples: [
        "Hexagonal vertices align to a 60-degree grid",
        "100% silhouette legibility down to 16px favicon",
      ],
    },
    layoutPrinciples: {
      spacing: "8px modular scale",
      density: "Airy editorial layout",
      hierarchy: "Editorial headline first, monospace badge second, clean body third",
      shapeLanguage: "Precise 16px corner radii with hairline borders",
      composition: "Asymmetrical grid cards",
    },
    colors: [
      { role: "primary", name: "Architect Obsidian", hex: "#141416", rationale: "Dominant presence" },
      { role: "accent", name: "Loom Coral", hex: "#E87A90", rationale: "Deliberate contrast" },
    ],
    overallAesthetic: "Architectural Editorial",
    isGenerated: true,
    generatedAt: "2026-03-01T12:30:00.000Z",
  };

  base.critique = {
    overallAssessment: "Strong, cohesive architectural brand system with minor caution on performance claims.",
    readiness: "needs_revision",
    strengths: [
      "Positioning is sharply differentiated from generic DIY template tools through deterministic multi-agent auditing.",
      "Architect archetype aligns seamlessly with monochrome palette and editorial typography.",
    ],
    issues: [
      {
        id: "issue-perf-claim",
        severity: "critical",
        category: "unsupported_claims",
        evidence: "100x faster than boutique agencies with zero errors guaranteed.",
        explanation: "Unverified performance claim could be challenged by investors or users and must be substantiated before launch.",
        suggestedRevision: "Verify supporting evidence or revise the claim before launch.",
      },
      {
        id: "issue-tone-warn",
        severity: "high",
        category: "voice_inconsistency",
        evidence: "Voice tone: 'Formal Architectural' vs Marketing hero: 'Supercharge your startup now!'",
        explanation: "High-priority warning: marketing hero copy uses informal startup clichés that conflict with architectural voice rules.",
        suggestedRevision: "Replace colloquial marketing exclamation with architectural value proposition.",
      },
      {
        id: "issue-info-note",
        severity: "low",
        category: "missing_information",
        evidence: "Target audience defines technical founders.",
        explanation: "Observation: consider adding secondary guidance for agency partners evaluating the tool for client work.",
        suggestedRevision: "Add secondary partner persona in future roadmap review.",
      },
    ],
    blockingIssues: [
      "Unverified performance claim could be challenged by investors or users and must be substantiated before launch.",
    ],
    summary: "System validated with one critical blocking issue requiring human review.",
    critiques: [],
    genericLanguageDetected: [],
    vulnerabilities: [],
    isEvaluated: true,
    evaluatedAt: "2026-03-01T13:00:00.000Z",
  };

  return base;
}

async function runTestSuite() {
  console.log("\n============================================================");
  console.log("  PRE-PHASE-10 CRITIC / CHALLENGE UI REFINEMENT TEST SUITE");
  console.log("============================================================\n");

  const baseState = createMockAuditedBrandState();

  // --------------------------------------------------------------------------
  // TEST 1: Critical Issue Rendering
  // --------------------------------------------------------------------------
  console.log("--- 1. CRITICAL ISSUE RENDERING ---");
  const critMeta = mapSeverityToHierarchy("critical");
  assert(critMeta.hierarchy === "critical", "mapSeverityToHierarchy('critical') returns 'critical'");
  assert(critMeta.label === "Critical", "mapSeverityToHierarchy('critical') label is 'Critical'");
  assert(critMeta.description.includes("Blocking issue requiring human review"), "Critical description specifies human review requirement");

  const formattedCrit = formatCriticalBlockingIssue(baseState.critique.issues[0], 0, baseState.critique.issues);
  assert(formattedCrit.title === "Unverified performance claim", "Critical issue title derived accurately as 'Unverified performance claim'");
  assert(formattedCrit.categoryLabel === "Unsupported Claim", "Critical issue category correctly mapped to 'Unsupported Claim'");
  assert(formattedCrit.recommendedAction.includes("Verify supporting evidence"), "Human-directed recommended action included");

  // Direct deriveIssueTitle testing
  assert(deriveIssueTitle("unsupported_claims", "Unverified performance claim...") === "Unverified performance claim", "deriveIssueTitle maps unsupported claims to 'Unverified performance claim'");
  assert(deriveIssueTitle("contradictions", "personality and voice conflict") === "Archetype & Voice Tonal Contradiction", "deriveIssueTitle maps tonal contradiction title correctly");
  assert(deriveIssueTitle("visual_inconsistency", "Palette contrast issue") === "Visual Direction Alignment Friction", "deriveIssueTitle maps visual category correctly");

  // Render CriticView component to static HTML markup
  const renderedHtml = renderToStaticMarkup(
    React.createElement(CriticView, {
      brandState: baseState,
      isLoading: false,
      loadingStep: "",
      errorMessage: null,
      onRunCritic: () => {},
      onClearError: () => {},
      onNavigateStage: () => {},
      onReviewApproved: () => {},
    })
  );

  assert(renderedHtml.includes("CRITICAL BLOCKING ISSUE"), "Rendered UI displays 'CRITICAL BLOCKING ISSUE' header");
  assert(renderedHtml.includes("Why Flagged"), "Rendered UI displays 'Why Flagged' heading");
  assert(renderedHtml.includes("Category"), "Rendered UI displays 'Category' heading");
  assert(renderedHtml.includes("Recommended Action:"), "Rendered UI displays 'Recommended Action:' heading");
  assert(renderedHtml.includes("Review in Stage 02: Positioning"), "Rendered UI displays 'Review in Stage 02: Positioning' button");

  // --------------------------------------------------------------------------
  // TEST 2: Warning Rendering
  // --------------------------------------------------------------------------
  console.log("\n--- 2. WARNING RENDERING ---");
  const warnHighMeta = mapSeverityToHierarchy("high");
  const warnMedMeta = mapSeverityToHierarchy("medium");
  assert(warnHighMeta.hierarchy === "warning", "Severity 'high' maps to hierarchy 'warning'");
  assert(warnMedMeta.hierarchy === "warning", "Severity 'medium' maps to hierarchy 'warning'");
  assert(warnHighMeta.description.includes("Potential weakness that should be reviewed"), "Warning description explains potential weakness");

  assert(renderedHtml.includes("Warning") || renderedHtml.includes("WARNING"), "Rendered UI displays Warning badge");
  assert(renderedHtml.includes("Voice Inconsistency"), "Rendered UI displays Voice Inconsistency category for warning finding");

  // --------------------------------------------------------------------------
  // TEST 3: Info Rendering
  // --------------------------------------------------------------------------
  console.log("\n--- 3. INFO RENDERING ---");
  const infoMeta = mapSeverityToHierarchy("low");
  assert(infoMeta.hierarchy === "info", "Severity 'low' maps to hierarchy 'info'");
  assert(infoMeta.description.includes("Observation or improvement opportunity"), "Info description explains observation/opportunity");
  assert(renderedHtml.includes("Info") || renderedHtml.includes("INFO"), "Rendered UI displays Info badge");
  assert(renderedHtml.includes("Missing Information"), "Rendered UI displays Missing Information category for info finding");

  // --------------------------------------------------------------------------
  // TEST 4: Five Critical Challenges Rendering
  // --------------------------------------------------------------------------
  console.log("\n--- 4. FIVE CRITICAL CHALLENGES RENDERING ---");
  const fiveBlockersState = deepClone(baseState);
  fiveBlockersState.critique.blockingIssues = [
    {
      id: "crit-1",
      severity: "critical",
      category: "unsupported_claims",
      evidence: "100% bug free guarantee",
      explanation: "Unverified performance claim could be challenged by investors or users and must be substantiated before launch.",
      suggestedRevision: "Verify supporting evidence or revise the claim before launch.",
    },
    {
      id: "crit-2",
      severity: "critical",
      category: "contradictions",
      evidence: "Jester archetype vs Wall Street voice",
      explanation: "Strategic cross-system contradiction between playful personality and corporate voice.",
      suggestedRevision: "Align tone to personality by shifting voice from institutional formality to approachable tone.",
    },
    {
      id: "crit-3",
      severity: "critical",
      category: "audience_mismatch",
      evidence: "Student audience vs Bloomberg dark terminal",
      explanation: "Audience aesthetic mismatch: dark enterprise dashboard alienates collegiate founders.",
      suggestedRevision: "Shift visual direction to an approachable editorial palette.",
    },
    {
      id: "crit-4",
      severity: "critical",
      category: "weak_positioning",
      evidence: "We are an innovative app revolutionizing work.",
      explanation: "Empty marketing clichés provide zero defensible competitive moat.",
      suggestedRevision: "Ground differentiation in concrete verifiable mechanisms.",
    },
    {
      id: "crit-5",
      severity: "critical",
      category: "generic_language",
      evidence: "Supercharge your business with seamless synergy.",
      explanation: "Generic buzzwords mask lack of concrete product capabilities.",
      suggestedRevision: "Replace buzzwords with precise engineering terms.",
    },
  ];
  fiveBlockersState.critique.issues = fiveBlockersState.critique.blockingIssues as CriticIssue[];

  const fiveBlockersHtml = renderToStaticMarkup(
    React.createElement(CriticView, {
      brandState: fiveBlockersState,
      isLoading: false,
      loadingStep: "",
      errorMessage: null,
      onRunCritic: () => {},
      onClearError: () => {},
      onNavigateStage: () => {},
      onReviewApproved: () => {},
    })
  );

  assert(fiveBlockersHtml.includes("5 Blockers"), "Rendered UI displays '5 Blockers' badge");
  assert(fiveBlockersHtml.includes("Unverified performance claim"), "Blocker 1 (Claim) rendered");
  assert(fiveBlockersHtml.includes("Archetype &amp; Voice Tonal Contradiction") || fiveBlockersHtml.includes("Contradiction"), "Blocker 2 (Contradiction) rendered");
  assert(fiveBlockersHtml.includes("Target Audience &amp; Presentation Mismatch") || fiveBlockersHtml.includes("Audience"), "Blocker 3 (Audience Mismatch) rendered");
  assert(fiveBlockersHtml.includes("Defensibility &amp; Competitive Moat Risk") || fiveBlockersHtml.includes("Positioning"), "Blocker 4 (Positioning) rendered");
  assert(fiveBlockersHtml.includes("Generic Terminology &amp; Cliché Exposure") || fiveBlockersHtml.includes("Generic"), "Blocker 5 (Generic Language) rendered");
  assert(!fiveBlockersHtml.includes("undefined") && !fiveBlockersHtml.includes("NaN"), "Zero undefined or NaN values in five blockers UI");

  // --------------------------------------------------------------------------
  // TEST 5: Long Challenge Text Formatting & Non-Overflow
  // --------------------------------------------------------------------------
  console.log("\n--- 5. LONG CHALLENGE TEXT RENDERING ---");
  const longText =
    "A very comprehensive and exhaustive multi-paragraph systemic assessment explaining in extensive detail how the foundational claims regarding sub-millisecond cryptographic latency fail to account for edge distributed cloud environments and could potentially mislead technical buyers, enterprise auditors, legal compliance teams, and downstream systems integrators across multiple international deployment jurisdictions unless substantiated with verifiable benchmark reports.";

  const refinedLong = refineClaimLanguage(longText);
  assert(refinedLong.length > 50, "Refined long text preserves substantive depth");

  const longBlockerState = deepClone(baseState);
  longBlockerState.critique.blockingIssues = [
    {
      id: "crit-long",
      severity: "critical",
      category: "unsupported_claims",
      evidence: "Guaranteed sub-millisecond cryptographic verification latency on all global networks worldwide.",
      explanation: longText,
      suggestedRevision: "Conduct formal cloud latency benchmarks and publish reproducible results before publishing absolute performance numbers.",
    },
  ];

  const longHtml = renderToStaticMarkup(
    React.createElement(CriticView, {
      brandState: longBlockerState,
      isLoading: false,
      loadingStep: "",
      errorMessage: null,
      onRunCritic: () => {},
      onClearError: () => {},
      onNavigateStage: () => {},
      onReviewApproved: () => {},
    })
  );

  assert(longHtml.includes("break-words"), "Long text container includes 'break-words' to prevent horizontal overflow");
  assert(longHtml.includes("Guaranteed sub-millisecond"), "Verbatim evidence included without truncation error");
  assert(longHtml.includes("cryptographic latency fail to account"), "Substantive long explanation preserved in output");

  // --------------------------------------------------------------------------
  // TEST 6: Empty State (Zero Flaws Detected)
  // --------------------------------------------------------------------------
  console.log("\n--- 6. EMPTY STATE RENDERING ---");
  const emptyFlawsState = deepClone(baseState);
  emptyFlawsState.critique.readiness = "ready";
  emptyFlawsState.critique.issues = [];
  emptyFlawsState.critique.blockingIssues = [];

  const emptyHtml = renderToStaticMarkup(
    React.createElement(CriticView, {
      brandState: emptyFlawsState,
      isLoading: false,
      loadingStep: "",
      errorMessage: null,
      onRunCritic: () => {},
      onClearError: () => {},
      onNavigateStage: () => {},
      onReviewApproved: () => {},
    })
  );

  assert(emptyHtml.includes("Ready for Production"), "Empty flaws state renders 'Ready for Production'");
  assert(emptyHtml.includes("0 Blocking"), "Displays '0 Blocking' flaws counter");
  assert(emptyHtml.includes("0 Issues"), "Displays '0 Issues' counter");
  assert(emptyHtml.includes("No findings in this filter") || emptyHtml.includes("Zero flaws detected"), "Empty issues list explains zero flaws detected");

  // --------------------------------------------------------------------------
  // TEST 7: Loading State
  // --------------------------------------------------------------------------
  console.log("\n--- 7. LOADING STATE RENDERING ---");
  const loadingHtml = renderToStaticMarkup(
    React.createElement(CriticView, {
      brandState: baseState,
      isLoading: true,
      loadingStep: "Auditing 6 foundational layers for contradictions...",
      errorMessage: null,
      onRunCritic: () => {},
      onClearError: () => {},
      onNavigateStage: () => {},
      onReviewApproved: () => {},
    })
  );

  assert(loadingHtml.includes('role="status"'), "Loading state includes accessible role='status'");
  assert(loadingHtml.includes('aria-live="polite"'), "Loading state includes aria-live='polite'");
  assert(loadingHtml.includes("Diagnostic Brand Audit in Progress") || loadingHtml.includes("Evaluating Systemic Brand Coherence"), "Loading heading clearly rendered");
  assert(loadingHtml.includes("Auditing 6 foundational layers for contradictions..."), "Live loading step rendered");
  assert(loadingHtml.includes("BrandState assets remain 100% unaltered"), "Reassures user of non-destructive execution");

  // --------------------------------------------------------------------------
  // TEST 8: Error State
  // --------------------------------------------------------------------------
  console.log("\n--- 8. ERROR STATE RENDERING ---");
  const errorHtml = renderToStaticMarkup(
    React.createElement(CriticView, {
      brandState: baseState,
      isLoading: false,
      loadingStep: "",
      errorMessage: "Groq API service rate limit encountered (429). Please try again shortly.",
      onRunCritic: () => {},
      onClearError: () => {},
      onNavigateStage: () => {},
      onReviewApproved: () => {},
    })
  );

  assert(errorHtml.includes('role="alert"'), "Error banner includes accessible role='alert'");
  assert(errorHtml.includes("Critic Evaluation Paused"), "Error title displayed cleanly");
  assert(errorHtml.includes("Groq API service rate limit encountered (429)"), "Safe, recoverable error message displayed");
  assert(!errorHtml.includes("stack trace") && !errorHtml.includes("TypeError:"), "Zero raw stack traces exposed in UI");
  assert(errorHtml.includes("Retry Audit"), "Recovery action 'Retry Audit' button rendered");
  assert(errorHtml.includes("Dismiss"), "Dismiss error button rendered");

  // --------------------------------------------------------------------------
  // TEST 9: Category Rendering Across All 12 Categories
  // --------------------------------------------------------------------------
  console.log("\n--- 9. CATEGORY RENDERING ---");
  const expectedCategories = [
    "generic_language",
    "weak_positioning",
    "audience_mismatch",
    "contradictions",
    "weak_differentiation",
    "name_personality_mismatch",
    "name_positioning_mismatch",
    "visual_personality_mismatch",
    "voice_inconsistency",
    "cliches",
    "unsupported_claims",
    "missing_information",
  ];

  for (const cat of expectedCategories) {
    const label = CRITIC_CATEGORY_LABELS[cat];
    assert(Boolean(label) && label.length > 0, `Category '${cat}' correctly maps to label '${label}'`);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Review Action Stage Mapping
  // --------------------------------------------------------------------------
  console.log("\n--- 10. REVIEW ACTION STAGE MAPPING ---");
  assert(getRecommendedStageForCategory("unsupported_claims").stage === "POSITION", "Unsupported claims maps to Stage 02 (POSITION)");
  assert(getRecommendedStageForCategory("voice_inconsistency").stage === "SHAPE", "Voice inconsistency maps to Stage 05 (SHAPE)");
  assert(getRecommendedStageForCategory("voice_inconsistency").subStage === "voice", "Voice inconsistency sets subStage='voice'");
  assert(getRecommendedStageForCategory("visual_personality_mismatch").stage === "VISUALIZE", "Visual mismatch maps to Stage 06 (VISUALIZE)");
  assert(getRecommendedStageForCategory("name_personality_mismatch").stage === "SHAPE", "Name mismatch maps to Stage 04 (SHAPE)");
  assert(getRecommendedStageForCategory("name_personality_mismatch").subStage === "naming", "Name mismatch sets subStage='naming'");
  assert(getRecommendedStageForCategory("contradictions", "Personality: Jester vs Voice: Formal").stage === "SHAPE", "Contradiction mentioning voice routes to Voice stage");

  // --------------------------------------------------------------------------
  // TEST 11: No Automatic Claim Modification & Accurate Uncertainty
  // --------------------------------------------------------------------------
  console.log("\n--- 11. NO AUTOMATIC CLAIM MODIFICATION & ACCURATE UNCERTAINTY ---");
  const rawFinding = "Unverified performance claim could be challenged by investors or users and must be substantiated before launch.";
  const refinedFinding = refineClaimLanguage(rawFinding);

  assert(
    refinedFinding === "This claim may be challenged by investors or users because supporting evidence has not been established.",
    "Refined finding communicates uncertainty accurately per Step 4 requirements"
  );
  assert(!refinedFinding.includes("The claim is false"), "Refined text does NOT state 'The claim is false'");
  assert(!refinedFinding.includes("AI proved this claim is false"), "Refined text does NOT state 'AI proved this claim is false'");
  assert(!refinedFinding.includes("must legally be substantiated"), "Refined text does NOT state 'must legally be substantiated'");

  const refinedAction = refineRecommendedAction("must be substantiated before launch", "unsupported_claims");
  assert(
    refinedAction === "Verify supporting evidence or revise the claim before launch.",
    "Action recommendation matches exact human-directed wording: 'Verify supporting evidence or revise the claim before launch.'"
  );

  // --------------------------------------------------------------------------
  // TEST 12: Zero BrandState Mutation (Bit-for-Bit Immutability)
  // --------------------------------------------------------------------------
  console.log("\n--- 12. ZERO BRANDSTATE MUTATION ---");
  const stateBefore = deepClone(baseState);

  // Render view multiple times with various options
  renderToStaticMarkup(
    React.createElement(CriticView, {
      brandState: baseState,
      isLoading: false,
      loadingStep: "",
      errorMessage: null,
      onRunCritic: () => {},
      onClearError: () => {},
      onNavigateStage: () => {},
      onReviewApproved: () => {},
    })
  );

  assert(JSON.stringify(stateBefore) === JSON.stringify(baseState), "BrandState is 100% UNMUTATED after rendering CriticView");
  assert(baseState.naming.selectedName === "ProofLoom", "Authoritative selectedName strictly preserved");
  assert(baseState.positioning.positioningStatement === stateBefore.positioning.positioningStatement, "Positioning statement strictly unmutated");
  assert(baseState.voice.toneProfile.primary === stateBefore.voice.toneProfile.primary, "Voice tone strictly unmutated");

  // --------------------------------------------------------------------------
  // TEST 13: Responsive-Safe Rendering & Accessibility Attributes
  // --------------------------------------------------------------------------
  console.log("\n--- 13. RESPONSIVE-SAFE RENDERING & ACCESSIBILITY ---");
  assert(renderedHtml.includes("break-words"), "Uses 'break-words' to prevent long string overflow");
  assert(renderedHtml.includes("max-w-full"), "Uses 'max-w-full' for responsive containment");
  assert(renderedHtml.includes("aria-label"), "Includes accessible aria-label attributes for screen-readers");
  assert(renderedHtml.includes("Human-directed"), "Emphasizes human control and final decision-making power");

  console.log("\n============================================================");
  console.log(`  CRITIC UI REFINEMENT RESULTS: ${passedTests} / ${totalTests} PASSING`);
  console.log("============================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
