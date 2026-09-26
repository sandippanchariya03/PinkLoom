/**
 * Visual Direction Engine Test Suite (Phase 5)
 * Comprehensive testing covering all required Phase 5 validation criteria:
 *
 * A. Valid VisualDirection schema validation
 * B. Invalid VisualDirection schema rejection
 * C. Missing Discovery rejection
 * D. Missing Positioning rejection
 * E. Missing Personality rejection
 * F. Missing Naming selection rejection
 * G. Missing selectedName rejection
 * H. Missing Voice rejection
 * I. Context propagation verification in prompt (Discovery + Positioning + Personality + selectedName + Voice)
 * J. Color system validation (primary, secondary, neutrals, semantic, accessibility)
 * K. Typography validation (heading, body, pairing, rationale)
 * L. Visual personality validation (mood, keywords, principles, imagery direction)
 * M. Imagery validation (photography, illustration, composition, subject treatment)
 * N. Logo direction validation (concept, mark, wordmark, construction principles)
 * O. Layout principles validation (spacing, density, hierarchy, shape language, composition)
 * P. Preservation of upstream context (rawIdea, discovery, positioning, personality, naming, voice)
 * Q. Version increment
 * R. AgentRun trace verification (stage = VISUALIZE, agentName = Visual)
 * S. Provider failure handling
 * T. Missing API key handling
 * U. Malformed model output handling
 * V. Regeneration verification
 * W. Authoritative selectedName verification
 * X. Context propagation test (Brand A vs Brand B with contrasting positioning/personality/voice)
 */

import {
  VisualDirectionOutputSchema,
  type VisualDirectionOutput,
  type BrandState,
  createInitialBrandState,
} from "../src/types/brand";
import { executeVisualAgent } from "../src/lib/agents/visual";
import { buildVisualUserPrompt } from "../src/lib/agents/prompts/visual";
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

// Mock provider for deterministic visual tests
class TestMockVisualProvider implements LLMProvider {
  readonly providerName = "test-mock-visual";
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

const mockValidVisual: VisualDirectionOutput = {
  colorSystem: {
    primary: [
      {
        name: "Obsidian Slate",
        hex: "#0F1115",
        role: "Primary Brand Anchor",
        usage: "Used for high-contrast headers, structural borders, and grounded dark surfaces.",
      },
      {
        name: "Loom Ochre",
        hex: "#D97706",
        role: "Strategic Accent",
        usage: "Action buttons, verified state badges, and primary interactive highlights.",
      },
    ],
    secondary: [
      {
        name: "Alabaster Parchment",
        hex: "#F9F8F5",
        role: "Editorial Canvas",
        usage: "Dominant background tint for calm, fatigue-free reading environments.",
      },
      {
        name: "Muted Juniper",
        hex: "#344E41",
        role: "Supportive Secondary",
        usage: "Secondary category badges and structural graphic containers.",
      },
    ],
    neutrals: [
      {
        name: "Pure White",
        hex: "#FFFFFF",
        role: "Surface Elevated",
        usage: "Container cards and popover elements.",
      },
      {
        name: "Border Mist",
        hex: "#E5E2DC",
        role: "Subtle Hairline",
        usage: "1px structural dividers.",
      },
      {
        name: "Charcoal Text",
        hex: "#27272A",
        role: "Body Typography",
        usage: "Long-form editorial paragraphs.",
      },
    ],
    semantic: [
      {
        name: "Emerald Verified",
        hex: "#10B981",
        role: "Success / Verified",
        usage: "Identity badges and verified indicators.",
      },
      {
        name: "Crimson Flag",
        hex: "#EF4444",
        role: "Danger / Outage",
        usage: "Critical error states and alerts.",
      },
    ],
    accessibility: {
      contrastNotes: "Obsidian Slate achieves 14.8:1 contrast on Alabaster Parchment, surpassing WCAG AAA.",
      wcagCompliance: "WCAG 2.1 AAA Compliant",
      darkThemeConsiderations: "In dark mode, surfaces shift to #18191E while text shifts to #ECEAE5 to preserve hierarchy without eye strain.",
    },
  },
  typography: {
    heading: {
      fontFamily: "Instrument Serif",
      category: "Serif",
      weights: ["400", "italic"],
      usage: "Editorial hero headlines, section intros, and conceptual milestones.",
    },
    body: {
      fontFamily: "Inter",
      category: "Sans-serif",
      weights: ["400", "500", "600"],
      usage: "Body paragraphs, data tables, and interface controls.",
    },
    pairing: {
      headingFont: "Instrument Serif",
      bodyFont: "Inter",
      contrast: "High contrast between literary editorial serif and utilitarian grotesque sans-serif.",
      mood: "Intellectual authority anchored by contemporary technological rigor.",
    },
    rationale: "The juxtaposition of Instrument Serif against Inter directly manifests the brand's core positioning: classical craftsmanship elevated by modern engineering precision.",
  },
  visualPersonality: {
    aestheticMood: "Architectural Editorial Rigor with Organic Tactile Warmth",
    visualKeywords: [
      "Architectural",
      "Tactile",
      "Monolithic",
      "Restrained",
      "Luminous",
    ],
    designPrinciples: [
      {
        principle: "Substance Precedes Decoration",
        description: "Every visual line, tint, and bounding box must communicate hierarchy or state. Eliminate arbitrary ornamentation.",
      },
      {
        principle: "Cadenced Breathing Space",
        description: "Maintain generous spatial margins (64px+) between thematic sections to encourage deliberate contemplation.",
      },
      {
        principle: "Tactile Authenticity",
        description: "Incorporate natural texture, subtle paper grain, and directional natural lighting rather than glossy synthetic neon gradients.",
      },
    ],
    imageryDirection: "Editorial documentary aesthetic featuring real craftspeople in working environments under directional natural light.",
  },
  imagery: {
    photographyDirection: "Authentic documentary perspective. Natural daylight, 35mm textural grain, candid non-staged captures. Strictly no generic stock corporate handshakes or studio smiles.",
    illustrationDirection: "Minimalist architectural schematics and monochrome geometric vector diagrams with fine 1px strokes. No bubbly 3D cartoon avatars.",
    composition: "Disciplined asymmetric balance using golden ratio proportions with generous negative space and clear focal anchors.",
    subjectTreatment: "Subjects are depicted with dignity, deep focus, and situational context. Avoid synthetic beauty filters.",
  },
  logoDirection: {
    concept: "The convergence of classical weaving warp-and-weft with deterministic modern circuitry.",
    markDirection: "A continuous ribbon loop forming an architectural lotus bloom, geometrically calibrated to a 1:1.618 ratio.",
    wordmarkDirection: "Set in tracked geometric capitals with subtle optical weight adjustments and custom angled terminals.",
    constructionPrinciples: [
      "Constructed strictly on an 8px grid coordinate system",
      "Maintains legibility and silhouette recognition down to 16x16px favicon scale",
      "Equal optical weight between logomark symbol and wordmark logotype",
    ],
  },
  layoutPrinciples: {
    spacing: "Strict 8pt baseline rhythm with expanded 48px to 96px macro section gutters.",
    density: "Low-to-medium density designed for cognitive ease and high-scan editorial consumption.",
    hierarchy: "Disciplined 1.333 typographic scale ratio ensuring immediate distinction between titles, subtitles, and captions.",
    shapeLanguage: "Crisp architectural rectangles with subtle 4px to 8px corner radii and razor-thin 1px border lines.",
    composition: "Asymmetrical editorial grid inspired by Swiss typography with off-axis callout columns and anchor cards.",
  },
};

function createValid5LayerBrandState(): BrandState {
  const state = createInitialBrandState("Decentralized escrow and talent platform for verified engineers");

  state.discovery = {
    ...state.discovery,
    isAnalyzed: true,
    analyzedAt: "2026-03-20T10:00:00Z",
    problem: "Engineers waste hundreds of hours filtering spam recruiters, phantom job posts, and unvetted compensation claims.",
    targetAudience: {
      primary: "Senior Software Engineers & Engineering Leaders",
      secondary: ["Series A-C Startup Founders", "Technical Recruiters"],
      characteristics: ["High agency", "Skeptical of hype", "Data-driven"],
      painPoints: ["Recruiter spam", "Ghost job listings", "Unclear equity compensation"],
      motivations: ["Authentic career acceleration", "Guaranteed compensation transparency"],
    },
    userNeeds: ["Proof of corporate funds", "Direct founder access", "No intermediaries"],
    constraints: ["Must verify company identity cryptographically"],
  };

  state.positioning = {
    ...state.positioning,
    isPositioned: true,
    positionedAt: "2026-03-20T10:15:00Z",
    category: "Verified Technical Talent Infrastructure",
    categoryRationale: "Transitions hiring from recruiting spam to verified financial infrastructure.",
    positioningStatement: "For senior engineers seeking transparent contracts, PinkLoom is the verified talent protocol.",
    differentiator: "Cryptographically escrowed compensation and verified corporate identities.",
    valueProposition: "Zero recruiter spam, guaranteed response times, and escrowed hiring bounties.",
    competitiveWhitespace: ["Eliminating the recruiter broker margin completely"],
  };

  state.personality = {
    ...state.personality,
    isFormulated: true,
    formulatedAt: "2026-03-20T10:30:00Z",
    archetype: "The Master Craftsman & Sovereign Architect",
    archetypeRationale: "Commands respect through undeniable technical execution and unsparing integrity.",
    traits: ["Authoritative", "Pragmatic", "Deterministic", "Incisive"],
    behavioralCharacteristics: ["Speaks in verified claims", "Rejects corporate jargon"],
    principles: [
      { title: "Proof Before Persuasion", description: "Always lead with verifiable data before making claims." },
      { title: "Radical Directness", description: "Never obscure difficulty or trade-offs behind euphemisms." },
    ],
    emotionalTerritory: "Calm intellectual mastery, unburdened certainty, and professional dignity.",
    confidence: 94,
  };

  state.naming = {
    ...state.naming,
    isGenerated: true,
    isSelected: true,
    selectedName: "ProofLoom",
    selectedDirectionId: "dir_architectural_01",
    selectedTagline: "The Escrow-Backed Engineering Protocol",
    selectedAt: "2026-03-20T10:45:00Z",
    directions: [
      {
        id: "dir_architectural_01",
        name: "Architectural Precision",
        strategy: "Structural integrity and verifiable craft",
        rationale: "Evokes woven structure and cryptographic proofs",
        namingLogic: "Taps into architectural and weaving metaphors",
        candidates: [
          {
            name: "ProofLoom",
            rationale: "Combines cryptographic proof with woven infrastructure",
            linguisticRationale: "Strong compound linking mathematical proof with fabric craft",
            phoneticAssessment: "Plosive start followed by smooth resonant coda",
            domainSuitability: "Distinctive, high memorability, and brandable",
          },
        ],
        taglineCandidates: ["The Escrow-Backed Engineering Protocol"],
      },
    ],
  };

  state.voice = {
    ...state.voice,
    isGenerated: true,
    generatedAt: "2026-03-20T11:00:00Z",
    toneProfile: {
      primary: "Authoritative Pragmatism",
      secondary: ["Incisive", "Transparent", "Relentlessly Grounded"],
      tonalBalance: "Direct and unsparing without sounding aggressive; clear evidence leads every claim.",
      emotionalEffect: "The technical audience feels immediate clarity and radical certainty.",
    },
    toneDimensions: [
      { dimension: "Authoritative vs Approachable", level: 78, rationale: "Requires high technical authority." },
      { dimension: "Direct vs Empathetic", level: 82, rationale: "Engineers prioritize immediate facts." },
      { dimension: "Restrained vs Expressive", level: 35, rationale: "Understated precision signals confidence." },
    ],
    vocabulary: {
      preferred: ["verified", "escrowed", "deterministic", "provable"],
      avoid: ["revolutionary", "rockstar", "ninja", "supercharge"],
      terminology: ["escrow-backed compensation", "identity-verified employer"],
      languageCharacteristics: ["Anglo-Saxon root verbs", "declarative syntax"],
    },
    messagingPillars: [
      {
        title: "Guaranteed Authenticity",
        purpose: "Eradicate fear of phantom listings",
        keyMessage: "Every job listing is backed by verified corporate identity and escrowed funds.",
        supportingPoints: ["100% corporate verification", "Zero recruiter intermediaries"],
      },
      {
        title: "Engineered Efficiency",
        purpose: "Respect cognitive load",
        keyMessage: "Direct-to-decision-maker applications with guaranteed sub-48-hour response windows.",
        supportingPoints: ["Direct founder access", "No ghosting policy"],
      },
      {
        title: "Provable Compensation",
        purpose: "Provide true market transparency",
        keyMessage: "Real salaries and real escrowed signing bonuses with zero opaque ranges.",
        supportingPoints: ["Smart contract verification", "Transparent equity formulas"],
      },
    ],
    communicationPrinciples: [
      { principle: "Lead with Verified Evidence", description: "State measurable outcomes before descriptive context." },
      { principle: "Eliminate Superlatives", description: "Use concrete nouns and active verbs instead of hype." },
      { principle: "Respect Technical Intelligence", description: "Never talk down to or patronize software engineers." },
    ],
    writingGuidelines: {
      sentenceStyle: ["Crisp sentences averaging 12-16 words", "Active voice"],
      structure: ["Inverted pyramid", "Punchy lead statements"],
      callsToAction: ["Direct invitations to verify", "Clear action verbs"],
      punctuationAndFormatting: ["Use em-dashes for cadence", "Numbered lists for sequential steps"],
    },
    examples: {
      homepageHero: "Engineering contracts backed by escrow. Zero recruiters.",
      shortPitch: "ProofLoom connects senior engineers directly to verified founders with escrowed compensation.",
      primaryCTA: "Verify Identity & Enter",
      socialPost: "Recruiter spam is obsolete. ProofLoom guarantees corporate identity and escrowed compensation.",
    },
    voiceDonts: ["Never use generic hype words", "Never promise vague outcomes", "Never obscure compensation details"],
    consistencyRules: ["Every feature must mention verification", "Always use active voice", "Lead with data"],
  };

  return state;
}

async function runTestSuite() {
  console.log("\n==================================================");
  console.log("PinkLoom Phase 5 — Visual Direction Test Suite");
  console.log("==================================================\n");

  // Test A: Valid Schema Validation
  console.log("Test A: Valid VisualDirection Schema Validation");
  const parsedValid = VisualDirectionOutputSchema.safeParse(mockValidVisual);
  assert(parsedValid.success, "Valid schema parses successfully");
  if (parsedValid.success) {
    assert(parsedValid.data.colorSystem.primary.length >= 1, "Primary colors array populated");
    assert(parsedValid.data.colorSystem.secondary.length >= 1, "Secondary colors array populated");
    assert(parsedValid.data.colorSystem.neutrals.length >= 2, "Neutrals array contains at least 2 tones");
    assert(parsedValid.data.typography.heading.fontFamily === "Instrument Serif", "Heading font family matches");
    assert(parsedValid.data.typography.body.fontFamily === "Inter", "Body font family matches");
    assert(parsedValid.data.visualPersonality.visualKeywords.length >= 3, "Visual keywords has at least 3 keywords");
    assert(parsedValid.data.visualPersonality.designPrinciples.length >= 2, "Design principles has at least 2 principles");
    assert(parsedValid.data.imagery.photographyDirection.length >= 10, "Photography direction is substantive");
    assert(parsedValid.data.logoDirection.concept.length >= 10, "Logo concept is substantive");
    assert(parsedValid.data.layoutPrinciples.spacing.length >= 5, "Spacing principle is substantive");
  }

  // Test B: Invalid Schema Rejection
  console.log("\nTest B: Invalid VisualDirection Schema Rejection");
  const invalidVisual = {
    colorSystem: { primary: [] }, // Missing secondary, neutrals, accessibility
    typography: { heading: {} },
  };
  const parsedInvalid = VisualDirectionOutputSchema.safeParse(invalidVisual);
  assert(!parsedInvalid.success, "Invalid schema rejected by Zod validation");

  // Test C: Missing Discovery Rejection
  console.log("\nTest C: Missing Discovery Rejection");
  const stateNoDiscovery = createValid5LayerBrandState();
  stateNoDiscovery.discovery.isAnalyzed = false;
  stateNoDiscovery.discovery.problem = "";
  const providerC = new TestMockVisualProvider(mockValidVisual);
  const resultC = await executeVisualAgent({}, stateNoDiscovery, providerC);
  assert(!resultC.success, "Rejects execution when Discovery is incomplete");
  assert(resultC.agentRun?.status === "failed", "AgentRun status = failed on missing Discovery");
  assert(resultC.error?.includes("Discovery"), "Error message cites Discovery requirement");

  // Test D: Missing Positioning Rejection
  console.log("\nTest D: Missing Positioning Rejection");
  const stateNoPositioning = createValid5LayerBrandState();
  stateNoPositioning.positioning.isPositioned = false;
  stateNoPositioning.positioning.category = "";
  const providerD = new TestMockVisualProvider(mockValidVisual);
  const resultD = await executeVisualAgent({}, stateNoPositioning, providerD);
  assert(!resultD.success, "Rejects execution when Positioning is incomplete");
  assert(resultD.agentRun?.status === "failed", "AgentRun status = failed on missing Positioning");
  assert(resultD.error?.includes("Positioning"), "Error message cites Positioning requirement");

  // Test E: Missing Personality Rejection
  console.log("\nTest E: Missing Personality Rejection");
  const stateNoPersonality = createValid5LayerBrandState();
  stateNoPersonality.personality.isFormulated = false;
  stateNoPersonality.personality.archetype = "";
  const providerE = new TestMockVisualProvider(mockValidVisual);
  const resultE = await executeVisualAgent({}, stateNoPersonality, providerE);
  assert(!resultE.success, "Rejects execution when Personality is incomplete");
  assert(resultE.agentRun?.status === "failed", "AgentRun status = failed on missing Personality");
  assert(resultE.error?.includes("Personality"), "Error message cites Personality requirement");

  // Test F: Missing Naming Selection Rejection
  console.log("\nTest F: Missing Naming Selection Rejection");
  const stateNoNaming = createValid5LayerBrandState();
  stateNoNaming.naming.isSelected = false;
  stateNoNaming.naming.selectedName = null;
  const providerF = new TestMockVisualProvider(mockValidVisual);
  const resultF = await executeVisualAgent({}, stateNoNaming, providerF);
  assert(!resultF.success, "Rejects execution when Naming is not selected");
  assert(resultF.agentRun?.status === "failed", "AgentRun status = failed on unselected Naming");
  assert(resultF.error?.includes("Naming"), "Error message cites Naming requirement");

  // Test G: Missing selectedName Rejection
  console.log("\nTest G: Missing selectedName Rejection");
  const stateNullSelectedName = createValid5LayerBrandState();
  stateNullSelectedName.naming.isSelected = true;
  stateNullSelectedName.naming.selectedName = null;
  const providerG = new TestMockVisualProvider(mockValidVisual);
  const resultG = await executeVisualAgent({}, stateNullSelectedName, providerG);
  assert(!resultG.success, "Rejects execution when selectedName is null");
  assert(resultG.agentRun?.status === "failed", "AgentRun status = failed on null selectedName");

  // Test H: Missing Voice Rejection
  console.log("\nTest H: Missing Voice Rejection");
  const stateNoVoice = createValid5LayerBrandState();
  stateNoVoice.voice.isGenerated = false;
  const providerH = new TestMockVisualProvider(mockValidVisual);
  const resultH = await executeVisualAgent({}, stateNoVoice, providerH);
  assert(!resultH.success, "Rejects execution when Voice is not generated");
  assert(resultH.agentRun?.status === "failed", "AgentRun status = failed on missing Voice");
  assert(resultH.error?.includes("Voice"), "Error message cites Voice requirement");

  // Test I: Context Propagation Verification in Prompt
  console.log("\nTest I: Context Propagation Verification in Prompt");
  const validState = createValid5LayerBrandState();
  const providerI = new TestMockVisualProvider(mockValidVisual);
  const resultI = await executeVisualAgent({}, validState, providerI);
  assert(resultI.success, "Visual execution succeeds with valid 5-layer context");

  const promptContent = providerI.capturedMessages.find((m) => m.role === "user")?.content || "";
  assert(promptContent.includes(validState.discovery.problem), "Prompt contains Discovery problem statement");
  assert(promptContent.includes(validState.discovery.targetAudience.primary), "Prompt contains Discovery target audience");
  assert(promptContent.includes(validState.positioning.category), "Prompt contains Positioning market category");
  assert(promptContent.includes(validState.positioning.differentiator), "Prompt contains Positioning differentiator");
  assert(promptContent.includes(validState.personality.archetype), "Prompt contains Personality archetype");
  assert(promptContent.includes(validState.personality.emotionalTerritory), "Prompt contains Personality emotional territory");
  assert(promptContent.includes(validState.naming.selectedName!), "Prompt contains authoritative selected brand name");
  assert(promptContent.includes(validState.voice.toneProfile.primary), "Prompt contains Voice primary tone");
  assert(promptContent.includes(validState.voice.toneProfile.tonalBalance), "Prompt contains Voice tonal balance");

  // Test J: Color System Validation
  console.log("\nTest J: Color System Validation");
  const colorSys = resultI.visualOutput?.colorSystem;
  assert(Boolean(colorSys && colorSys.primary.length >= 1), "Primary colors populated");
  assert(Boolean(colorSys && colorSys.primary[0].hex.startsWith("#")), "Primary color has valid hex format");
  assert(Boolean(colorSys && colorSys.secondary.length >= 1), "Secondary colors populated");
  assert(Boolean(colorSys && colorSys.neutrals.length >= 2), "Neutral tones contain at least 2 swatches");
  assert(Boolean(colorSys && colorSys.accessibility.wcagCompliance.length > 0), "Accessibility WCAG compliance documented");
  assert(Boolean(colorSys && colorSys.accessibility.contrastNotes.length > 0), "Contrast notes documented");

  // Test K: Typography Validation
  console.log("\nTest K: Typography Validation");
  const typo = resultI.visualOutput?.typography;
  assert(Boolean(typo && typo.heading.fontFamily.length > 0), "Heading font family specified");
  assert(Boolean(typo && typo.body.fontFamily.length > 0), "Body font family specified");
  assert(Boolean(typo && typo.pairing.contrast.length > 0), "Typographic contrast articulated");
  assert(Boolean(typo && typo.pairing.mood.length > 0), "Typographic mood articulated");
  assert(Boolean(typo && typo.rationale.length >= 10), "Strategic typography rationale articulated");

  // Test L: Visual Personality Validation
  console.log("\nTest L: Visual Personality Validation");
  const visPers = resultI.visualOutput?.visualPersonality;
  assert(Boolean(visPers && visPers.aestheticMood.length > 0), "Aesthetic mood defined");
  assert(Boolean(visPers && visPers.visualKeywords.length >= 3), "Visual keywords contains at least 3 keywords");
  assert(Boolean(visPers && visPers.designPrinciples.length >= 2), "Design principles contains at least 2 principles");
  assert(Boolean(visPers && visPers.imageryDirection.length > 0), "High-level imagery direction defined");

  // Test M: Imagery Validation
  console.log("\nTest M: Imagery Validation");
  const img = resultI.visualOutput?.imagery;
  assert(Boolean(img && img.photographyDirection.length > 0), "Photography direction defined");
  assert(Boolean(img && img.illustrationDirection.length > 0), "Illustration direction defined");
  assert(Boolean(img && img.composition.length > 0), "Compositional rules defined");
  assert(Boolean(img && img.subjectTreatment.length > 0), "Subject treatment guidance defined");

  // Test N: Logo Direction Validation
  console.log("\nTest N: Logo Direction Validation");
  const logo = resultI.visualOutput?.logoDirection;
  assert(Boolean(logo && logo.concept.length > 0), "Logo conceptual thesis defined");
  assert(Boolean(logo && logo.markDirection.length > 0), "Mark direction defined");
  assert(Boolean(logo && logo.wordmarkDirection.length > 0), "Wordmark direction defined");
  assert(Boolean(logo && logo.constructionPrinciples.length >= 2), "At least 2 construction principles defined");

  // Test O: Layout Principles Validation
  console.log("\nTest O: Layout Principles Validation");
  const layout = resultI.visualOutput?.layoutPrinciples;
  assert(Boolean(layout && layout.spacing.length > 0), "Spacing rhythm defined");
  assert(Boolean(layout && layout.density.length > 0), "Density guidance defined");
  assert(Boolean(layout && layout.hierarchy.length > 0), "Hierarchy rules defined");
  assert(Boolean(layout && layout.shapeLanguage.length > 0), "Shape language defined");
  assert(Boolean(layout && layout.composition.length > 0), "Compositional rules defined");

  // Test P: Preservation of Upstream Context
  console.log("\nTest P: Preservation of Upstream Context");
  const updatedState = resultI.updatedBrandState!;
  assert(updatedState.discovery.rawIdea === validState.discovery.rawIdea, "Preserves rawIdea unmutated");
  assert(updatedState.discovery.problem === validState.discovery.problem, "Preserves Discovery unmutated");
  assert(updatedState.positioning.category === validState.positioning.category, "Preserves Positioning unmutated");
  assert(updatedState.personality.archetype === validState.personality.archetype, "Preserves Personality unmutated");
  assert(updatedState.naming.selectedName === validState.naming.selectedName, "Preserves Naming selectedName unmutated");
  assert(updatedState.voice.toneProfile.primary === validState.voice.toneProfile.primary, "Preserves Voice unmutated");

  // Test Q: Version Increment
  console.log("\nTest Q: Version Increment");
  assert(updatedState.version === (validState.version || 1) + 1, "Increments BrandState.version");

  // Test R: AgentRun Trace Verification
  console.log("\nTest R: AgentRun Trace Verification");
  const agentRun = resultI.agentRun!;
  assert(agentRun.stage === "VISUALIZE", "AgentRun stage is VISUALIZE");
  assert(agentRun.agentName === "Visual", "AgentRun agentName is Visual");
  assert(agentRun.status === "completed", "AgentRun status is completed");
  assert(typeof agentRun.durationMs === "number" && agentRun.durationMs >= 0, "AgentRun tracks durationMs");
  assert(agentRun.input.selectedName === "ProofLoom", "AgentRun input records selectedName");

  // Test S: Provider Failure Handling
  console.log("\nTest S: Provider Failure Handling");
  const providerS = new TestMockVisualProvider(mockValidVisual, true);
  const resultS = await executeVisualAgent({}, validState, providerS);
  assert(!resultS.success, "Handles provider failure gracefully");
  assert(resultS.agentRun?.status === "failed", "Marks AgentRun status = failed on provider error");
  assert(Boolean(resultS.error?.includes("timeout")), "Captures error message in trace");

  // Test T: Missing API Key Handling
  console.log("\nTest T: Missing API Key Handling");
  const origKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.AI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const resultT = await executeVisualAgent({}, validState);
  assert(!resultT.success, "Handles missing API key gracefully");
  assert(resultT.agentRun?.status === "failed", "Marks AgentRun status = failed on missing key");
  assert(Boolean(resultT.error?.includes("missing")), "Returns user-friendly API key configuration error");
  if (origKey) process.env.GROQ_API_KEY = origKey;

  // Test U: Malformed Model Output Handling
  console.log("\nTest U: Malformed Model Output Handling");
  const malformedProvider = new TestMockVisualProvider({
    colorSystem: { primary: "not-an-array" },
  });
  const resultU = await executeVisualAgent({}, validState, malformedProvider);
  assert(!resultU.success, "Rejects malformed model output");
  assert(resultU.agentRun?.status === "failed", "Marks AgentRun status = failed on schema failure");

  // Test V: Regeneration Verification
  console.log("\nTest V: Regeneration Verification");
  const firstRun = await executeVisualAgent({}, validState, new TestMockVisualProvider(mockValidVisual));
  assert(firstRun.success, "First run succeeds");
  const regeneratedMock: VisualDirectionOutput = {
    ...mockValidVisual,
    visualPersonality: {
      ...mockValidVisual.visualPersonality,
      aestheticMood: "Regenerated High-Tech Brutalism",
    },
  };
  const secondRun = await executeVisualAgent(
    {},
    firstRun.updatedBrandState,
    new TestMockVisualProvider(regeneratedMock)
  );
  assert(secondRun.success, "Regeneration succeeds");
  assert(secondRun.updatedBrandState?.version === firstRun.updatedBrandState!.version + 1, "Increments version on regeneration");
  assert(secondRun.updatedBrandState?.visualDirection.visualPersonality.aestheticMood === "Regenerated High-Tech Brutalism", "Updates visualDirection to regenerated output");
  assert(secondRun.agentRun?.id !== firstRun.agentRun?.id, "Produces separate AgentRun trace with unique ID");

  // Test W: Authoritative Selected Name in Visual Direction
  console.log("\nTest W: Authoritative Selected Name in Visual Direction");
  assert(secondRun.updatedBrandState?.naming.selectedName === "ProofLoom", "Selected name remains strictly ProofLoom");
  assert(firstRun.agentRun?.input.selectedName === "ProofLoom", "AgentRun recorded authoritative name ProofLoom");

  // Test X: Context Propagation Test (Step 5.8: Brand A vs Brand B)
  console.log("\nTest X: Context Propagation Test (Brand A vs Brand B)");
  // Brand A: Institutional Cryptographic Security Protocol
  const brandA = createValid5LayerBrandState();
  brandA.positioning.category = "Institutional Zero-Trust Financial Infrastructure";
  brandA.positioning.differentiator = "Cryptographic multi-party computation with formal mathematical proofs";
  brandA.personality.archetype = "The Sovereign Sentinel";
  brandA.personality.traits = ["Monolithic", "Incorruptible", "Surgical", "Stoic"];
  brandA.voice.toneProfile.primary = "Mathematical Inevitability";
  brandA.naming.selectedName = "AegisCore";

  const promptA = buildVisualUserPrompt(
    brandA.discovery,
    brandA.positioning,
    brandA.personality,
    brandA.naming,
    brandA.voice
  );

  // Brand B: Whimsical Creator Platform & Meme Collective
  const brandB = createValid5LayerBrandState();
  brandB.positioning.category = "Playful Social Canvas & Creator Collective";
  brandB.positioning.differentiator = "Frictionless micro-collaborations with instant viral remixing";
  brandB.personality.archetype = "The Irreverent Jester & Free Spirit";
  brandB.personality.traits = ["Electric", "Chaotic Good", "Warm", "Whimsical"];
  brandB.voice.toneProfile.primary = "Electric Playfulness";
  brandB.naming.selectedName = "FlickerPop";

  const promptB = buildVisualUserPrompt(
    brandB.discovery,
    brandB.positioning,
    brandB.personality,
    brandB.naming,
    brandB.voice
  );

  assert(promptA.includes("Institutional Zero-Trust Financial Infrastructure"), "Prompt A grounds in institutional security category");
  assert(promptA.includes("The Sovereign Sentinel"), "Prompt A grounds in Sovereign Sentinel archetype");
  assert(promptA.includes("Mathematical Inevitability"), "Prompt A grounds in Mathematical Inevitability voice");
  assert(promptA.includes("AegisCore"), "Prompt A grounds in AegisCore name");

  assert(promptB.includes("Playful Social Canvas & Creator Collective"), "Prompt B grounds in playful creator category");
  assert(promptB.includes("The Irreverent Jester & Free Spirit"), "Prompt B grounds in Jester archetype");
  assert(promptB.includes("Electric Playfulness"), "Prompt B grounds in Electric Playfulness voice");
  assert(promptB.includes("FlickerPop"), "Prompt B grounds in FlickerPop name");

  assert(!promptA.includes("Playful Social Canvas"), "Prompt A does not leak Brand B's positioning");
  assert(!promptB.includes("Institutional Zero-Trust"), "Prompt B does not leak Brand A's positioning");
  assert(promptA !== promptB, "Brand A and Brand B produce radically distinct grounded prompts");

  console.log("\n==================================================");
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log("==================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
