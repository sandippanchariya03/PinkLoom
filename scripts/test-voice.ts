/**
 * Voice Engine Test Suite (Phase 4C)
 * Comprehensive testing covering all required Phase 4C validation criteria:
 *
 * A. Valid Voice schema
 * B. Invalid Voice schema
 * C. Missing Discovery rejection
 * D. Missing Positioning rejection
 * E. Missing Personality rejection
 * F. Missing Naming selection rejection
 * G. Missing selectedName rejection
 * H. Context propagation (Discovery + Positioning + Personality + selectedName + selectedTagline)
 * I. Tone profile validation
 * J. Tone dimensions validation
 * K. Vocabulary validation
 * L. Messaging pillars validation
 * M. Communication principles validation
 * N. Writing guidelines validation
 * O. Required examples validation (homepageHero, shortPitch, primaryCTA, socialPost)
 * P. Voice don'ts validation
 * Q. Consistency rules validation
 * R. State preservation (rawIdea, discovery, positioning, personality, naming)
 * S. Version increment
 * T. AgentRun trace verification (stage = SHAPE, agentName = Voice)
 * U. Provider failure handling
 * V. Missing API key handling
 * W. Malformed model output handling
 * X. Selected tagline optional (Voice functions with selectedTagline = null)
 * Y. No brand-name invention (verifies output uses supplied selectedName)
 * Z. Regeneration (re-running Voice preserves upstream, updates voice, increments version)
 */

import {
  VoiceOutputSchema,
  type VoiceOutput,
  type BrandState,
  createInitialBrandState,
} from "../src/types/brand";
import { executeVoiceAgent } from "../src/lib/agents/voice";
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

// Mock provider for deterministic voice tests
class TestMockVoiceProvider implements LLMProvider {
  readonly providerName = "test-mock-voice";
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

const mockValidVoice: VoiceOutput = {
  toneProfile: {
    primary: "Authoritative Pragmatism",
    secondary: ["Incisive", "Transparent", "Relentlessly Grounded"],
    tonalBalance: "Direct and unsparing without sounding aggressive; clear evidence leads every claim.",
    emotionalEffect: "The technical audience feels immediate clarity, unburdened by hype and radically certain of verified results.",
  },
  toneDimensions: [
    {
      dimension: "Authoritative vs Approachable",
      level: 78,
      rationale: "Requires high technical authority to establish trust with skeptical software engineers.",
    },
    {
      dimension: "Direct vs Empathetic",
      level: 82,
      rationale: "Engineers prioritize immediate facts over emotional hand-waving.",
    },
    {
      dimension: "Restrained vs Expressive",
      level: 35,
      rationale: "Understated precision signals confidence; exuberant claims signal sales puffery.",
    },
    {
      dimension: "Technical vs Accessible",
      level: 70,
      rationale: "Uses exact software engineering terms while remaining clear to non-technical startup founders.",
    },
  ],
  vocabulary: {
    preferred: ["verified", "escrowed", "deterministic", "provable", "concrete"],
    avoid: ["revolutionary", "game-changing", "disruptive", "rockstar", "ninja", "supercharge"],
    terminology: ["escrow-backed compensation", "identity-verified employer", "zero-ghost pipeline"],
    languageCharacteristics: ["Anglo-Saxon root verbs", "declarative syntax", "data-led claims"],
  },
  messagingPillars: [
    {
      title: "Guaranteed Authenticity",
      purpose: "Eradicate fear of phantom listings and ghost recruiters",
      keyMessage: "Every job listing is backed by verified corporate identity and escrowed funds.",
      supportingPoints: [
        "100% corporate verification before any post goes live",
        "Zero recruiter intermediaries or resume brokers",
      ],
    },
    {
      title: "Engineered Efficiency",
      purpose: "Respect engineering time and cognitive load",
      keyMessage: "Direct-to-decision-maker applications with guaranteed sub-48-hour response windows.",
      supportingPoints: [
        "No multi-step questionnaires or applicant black holes",
        "Direct communication with hiring engineering managers",
      ],
    },
    {
      title: "Mutual Accountability",
      purpose: "Rebalance hiring power between candidates and employers",
      keyMessage: "Clear salary transparency and binding offer requirements protect both parties.",
      supportingPoints: [
        "Upfront salary and equity bands with zero ambiguity",
        "Enforceable offer escrow rules",
      ],
    },
  ],
  communicationPrinciples: [
    {
      principle: "Evidence Precedes Rhetoric",
      description: "State the verifiable metric or verification mechanism before making an efficacy claim.",
    },
    {
      principle: "Radical Plainspokenness",
      description: "Use active verbs and declarative sentences. Never hide conditions behind euphemisms.",
    },
    {
      principle: "Respect the Reader's Intellect",
      description: "Assume the reader is a discerning practitioner who spots marketing inflation immediately.",
    },
  ],
  writingGuidelines: {
    sentenceStyle: ["Keep sentences under 20 words on average", "Lead with active verbs", "Avoid passive voice"],
    structure: ["Headline + single supporting paragraph + proof point", "Use bulleted lists for technical criteria"],
    callsToAction: ["Verify Your Team", "View Verified Roles", "Apply with Escrow Guarantee"],
    punctuationAndFormatting: ["Use em-dashes sparingly", "Avoid exclamation marks entirely", "Sentence case headlines"],
  },
  examples: {
    homepageHero: "HireLock: Software engineering roles with zero ghost jobs and escrowed hiring budgets.",
    shortPitch: "HireLock is the trust-first hiring platform where every startup role is verified, funded, and direct to engineering leaders.",
    primaryCTA: "Browse Verified Roles",
    socialPost: "Recruiter spam and fake listings have broken tech hiring. HireLock fixes this by escrowing hiring budgets and verifying 100% of employers. No middle-men.",
  },
  voiceDonts: [
    "Never use exclamation marks in marketing or product copy.",
    "Never promise instant career transformation or miracle matches.",
    "Never refer to candidates as 'talent pool' or 'human capital'.",
  ],
  consistencyRules: [
    "Every headline must connect to verified employer trust or developer time savings.",
    "All salary mentions must specify exact currency and bounds; no 'competitive salary' phrasing.",
    "Never use superlatives without an accompanying proof point.",
  ],
};

function createRealisticBrandState(): BrandState {
  const init = createInitialBrandState("Platform for remote engineer hiring without ghost jobs", "test-project-voice");
  return {
    ...init,
    version: 4,
    discovery: {
      rawIdea: "Platform for remote engineer hiring without ghost jobs",
      problem: "Software engineers waste hundreds of hours applying to ghost jobs and dodging spam recruiters with fake listings.",
      targetAudience: {
        primary: "Senior Software Engineers",
        secondary: ["Engineering Managers", "Seed-stage CTOs"],
        characteristics: ["Experienced engineers", "Product-minded"],
        painPoints: ["Ghost jobs", "Recruiter spam", "Opaque salary bands"],
        motivations: ["Finding legitimate high-growth startups", "Direct communication"],
      },
      userNeeds: ["Proof of real hiring budget", "Verified company identity", "Fast response"],
      constraints: ["Zero tolerance for spam", "Must protect applicant privacy"],
      assumptions: ["Companies value quality over applicant volume"],
      missingInformation: [],
      clarifyingQuestions: [],
      isAnalyzed: true,
      analyzedAt: new Date().toISOString(),
    },
    positioning: {
      category: "Trust-first employment verification platform",
      categoryRationale: "Eliminates ghost jobs through corporate identity and budget escrow verification.",
      positioningStatement: "For software engineers seeking legitimate startup opportunities, our platform guarantees 100% verified employers with escrow-backed hiring budgets.",
      differentiator: "Mandatory corporate verification and escrow-backed hiring compensation.",
      valueProposition: "Apply only to real, verified startups ready to hire today.",
      competitiveWhitespace: ["Escrow-backed job offers", "Zero ghost jobs guarantee"],
      alternatives: ["LinkedIn Jobs", "Indeed", "Recruiter DMs"],
      proofPoints: ["100% fraud-free rate"],
      risks: ["Employer onboarding friction"],
      confidence: 90,
      isPositioned: true,
      positionedAt: new Date().toISOString(),
    },
    personality: {
      archetype: "The Relentless Pragmatist",
      archetypeRationale: "Engineers respect technical reality, evidence, and no-nonsense verification over marketing hype.",
      traits: ["Incisive", "Evidence-based", "Unyielding", "Transparent"],
      behavioralCharacteristics: ["Speaks plainly", "Publishes proof", "Rejects corporate jargon"],
      principles: [
        { title: "Verifiable Truth", description: "Claims must be provable with data." },
        { title: "Zero Fluff", description: "Cut adjectives that add no factual value." },
      ],
      emotionalTerritory: "Calm certainty, unburdened clarity, and deep professional respect.",
      personalityDo: ["Lead with facts", "Respect developer intelligence"],
      personalityDont: ["Use cheesy tech buzzwords", "Exaggerate outcomes"],
      confidence: 92,
      isFormulated: true,
      formulatedAt: new Date().toISOString(),
    },
    naming: {
      directions: [
        {
          id: "dir-1",
          name: "Compound / Constructed: Direct-Locking",
          strategy: "Conveys a mechanically sealed hiring flow where every offer is locked and verified.",
          rationale: "Directly mirrors the escrow and trust-first positioning.",
          namingLogic: "Combines active hiring verb with structural security noun.",
          candidates: [
            {
              name: "HireLock",
              rationale: "Signals that hiring is secured, verified, and free of phantom listings.",
              linguisticRationale: "Direct compound of 'Hire' and 'Lock'.",
              phoneticAssessment: "Crisp plosive cadence; confident monosyllabic pairing.",
              domainSuitability: "Eight letters, intuitive spelling, clean URL usability.",
            },
          ],
          taglineCandidates: ["Jobs locked, talent unleashed.", "Zero ghosts. Full confidence."],
        },
      ],
      selectedDirectionId: "dir-1",
      selectedName: "HireLock",
      selectedTagline: "Jobs locked, talent unleashed.",
      isGenerated: true,
      isSelected: true,
      generatedAt: new Date().toISOString(),
      selectedAt: new Date().toISOString(),
    },
  };
}

async function runTests() {
  console.log("==================================================");
  console.log("PinkLoom Phase 4C — Voice Engine Test Suite");
  console.log("==================================================\n");

  // Test A: Valid Voice Schema
  console.log("Test A: Valid VoiceOutput Schema Validation");
  const parseResult = VoiceOutputSchema.safeParse(mockValidVoice);
  assert(parseResult.success, "Valid schema parses successfully");
  if (parseResult.success) {
    assert(parseResult.data.toneProfile.primary === "Authoritative Pragmatism", "Tone profile primary matches");
    assert(parseResult.data.toneDimensions.length >= 3, "Tone dimensions contains at least 3 dimensions");
    assert(parseResult.data.messagingPillars.length >= 3, "Messaging pillars contains at least 3 pillars");
    assert(Boolean(parseResult.data.examples.homepageHero), "Homepage hero example present");
  }

  // Test B: Invalid Voice Schema
  console.log("\nTest B: Invalid VoiceOutput Schema Rejection");
  const invalidVoice = {
    toneProfile: { primary: "" }, // Missing secondary, tonalBalance, emotionalEffect
    toneDimensions: [], // Empty (requires min 3)
    vocabulary: {},
    messagingPillars: [],
    communicationPrinciples: [],
    writingGuidelines: {},
    examples: {},
    voiceDonts: [],
    consistencyRules: [],
  };
  const invalidResult = VoiceOutputSchema.safeParse(invalidVoice);
  assert(!invalidResult.success, "Invalid schema rejected by Zod validation");

  // Test C: Missing Discovery Rejection
  console.log("\nTest C: Missing Discovery Rejection");
  const missingDiscState = createRealisticBrandState();
  missingDiscState.discovery.isAnalyzed = false;
  const mockProviderC = new TestMockVoiceProvider(mockValidVoice);
  const resultC = await executeVoiceAgent({ projectId: missingDiscState.projectId }, missingDiscState, mockProviderC);
  assert(!resultC.success, "Rejects execution when Discovery is incomplete");
  assert(resultC.agentRun?.status === "failed", "AgentRun status = failed on missing Discovery");
  assert(resultC.error?.includes("Discovery"), "Error message cites Discovery requirement");

  // Test D: Missing Positioning Rejection
  console.log("\nTest D: Missing Positioning Rejection");
  const missingPosState = createRealisticBrandState();
  missingPosState.positioning.isPositioned = false;
  const mockProviderD = new TestMockVoiceProvider(mockValidVoice);
  const resultD = await executeVoiceAgent({ projectId: missingPosState.projectId }, missingPosState, mockProviderD);
  assert(!resultD.success, "Rejects execution when Positioning is incomplete");
  assert(resultD.agentRun?.status === "failed", "AgentRun status = failed on missing Positioning");
  assert(resultD.error?.includes("Positioning"), "Error message cites Positioning requirement");

  // Test E: Missing Personality Rejection
  console.log("\nTest E: Missing Personality Rejection");
  const missingPersState = createRealisticBrandState();
  missingPersState.personality.isFormulated = false;
  const mockProviderE = new TestMockVoiceProvider(mockValidVoice);
  const resultE = await executeVoiceAgent({ projectId: missingPersState.projectId }, missingPersState, mockProviderE);
  assert(!resultE.success, "Rejects execution when Personality is incomplete");
  assert(resultE.agentRun?.status === "failed", "AgentRun status = failed on missing Personality");
  assert(resultE.error?.includes("Personality"), "Error message cites Personality requirement");

  // Test F: Missing Naming Selection Rejection
  console.log("\nTest F: Missing Naming Selection Rejection");
  const missingNamingSelectState = createRealisticBrandState();
  missingNamingSelectState.naming.isSelected = false;
  const mockProviderF = new TestMockVoiceProvider(mockValidVoice);
  const resultF = await executeVoiceAgent({ projectId: missingNamingSelectState.projectId }, missingNamingSelectState, mockProviderF);
  assert(!resultF.success, "Rejects execution when Naming is not selected");
  assert(resultF.agentRun?.status === "failed", "AgentRun status = failed on unselected Naming");
  assert(resultF.error?.includes("selected"), "Error message cites Naming selection requirement");

  // Test G: Missing selectedName Rejection
  console.log("\nTest G: Missing selectedName Rejection");
  const missingNameState = createRealisticBrandState();
  missingNameState.naming.isSelected = true;
  missingNameState.naming.selectedName = null;
  const mockProviderG = new TestMockVoiceProvider(mockValidVoice);
  const resultG = await executeVoiceAgent({ projectId: missingNameState.projectId }, missingNameState, mockProviderG);
  assert(!resultG.success, "Rejects execution when selectedName is null");
  assert(resultG.agentRun?.status === "failed", "AgentRun status = failed on null selectedName");

  // Test H: Context Propagation (Discovery + Positioning + Personality + selectedName + selectedTagline)
  console.log("\nTest H: Context Propagation Verification in Prompt");
  const stateH = createRealisticBrandState();
  const mockProviderH = new TestMockVoiceProvider(mockValidVoice);
  const resultH = await executeVoiceAgent({ projectId: stateH.projectId }, stateH, mockProviderH);
  assert(resultH.success, "Voice execution succeeds with valid 4-layer context");

  const promptContent = mockProviderH.capturedMessages.map((m) => m.content).join("\n");
  assert(promptContent.includes("Software engineers waste hundreds of hours"), "Prompt contains Discovery problem statement");
  assert(promptContent.includes("Senior Software Engineers"), "Prompt contains Discovery target audience");
  assert(promptContent.includes("Trust-first employment verification platform"), "Prompt contains Positioning market category");
  assert(promptContent.includes("Mandatory corporate verification"), "Prompt contains Positioning differentiator");
  assert(promptContent.includes("The Relentless Pragmatist"), "Prompt contains Personality archetype");
  assert(promptContent.includes("Calm certainty"), "Prompt contains Personality emotional territory");
  assert(promptContent.includes("HireLock"), "Prompt contains authoritative selected brand name");
  assert(promptContent.includes("Jobs locked, talent unleashed."), "Prompt contains selected tagline");

  // Test I: Tone Profile Validation
  console.log("\nTest I: Tone Profile Validation");
  assert(Boolean(resultH.updatedBrandState?.voice.toneProfile.primary), "Sets primary tone");
  assert((resultH.updatedBrandState?.voice.toneProfile.secondary.length ?? 0) >= 3, "Sets secondary tones array");
  assert(Boolean(resultH.updatedBrandState?.voice.toneProfile.tonalBalance), "Sets tonal balance description");
  assert(Boolean(resultH.updatedBrandState?.voice.toneProfile.emotionalEffect), "Sets emotional effect description");

  // Test J: Tone Dimensions Validation
  console.log("\nTest J: Tone Dimensions Validation");
  const dims = resultH.updatedBrandState?.voice.toneDimensions || [];
  assert(dims.length >= 3, "Tone dimensions array contains at least 3 dimensions");
  assert(dims.every((d) => d.level >= 0 && d.level <= 100), "All dimension levels are normalized 0-100");
  assert(dims.every((d) => d.rationale.length > 0), "All dimensions include strategic rationales");

  // Test K: Vocabulary Validation
  console.log("\nTest K: Vocabulary Validation");
  const vocab = resultH.updatedBrandState?.voice.vocabulary;
  assert((vocab?.preferred.length ?? 0) >= 3, "Preferred vocabulary populated");
  assert((vocab?.avoid.length ?? 0) >= 3, "Words to avoid populated");
  assert((vocab?.terminology.length ?? 0) >= 2, "Important terminology populated");
  assert((vocab?.languageCharacteristics.length ?? 0) >= 2, "Language characteristics populated");

  // Test L: Messaging Pillars Validation
  console.log("\nTest L: Messaging Pillars Validation");
  const pillars = resultH.updatedBrandState?.voice.messagingPillars || [];
  assert(pillars.length >= 3 && pillars.length <= 5, "Messaging pillars count is between 3 and 5");
  assert(pillars.every((p) => p.title && p.purpose && p.keyMessage && p.supportingPoints.length >= 1), "Pillars contain title, purpose, keyMessage, and supportingPoints");

  // Test M: Communication Principles Validation
  console.log("\nTest M: Communication Principles Validation");
  const principles = resultH.updatedBrandState?.voice.communicationPrinciples || [];
  assert(principles.length >= 3, "Communication principles contains at least 3 principles");
  assert(principles.every((p) => p.principle && p.description), "Principles contain principle name and actionable description");

  // Test N: Writing Guidelines Validation
  console.log("\nTest N: Writing Guidelines Validation");
  const guidelines = resultH.updatedBrandState?.voice.writingGuidelines;
  assert((guidelines?.sentenceStyle.length ?? 0) >= 2, "Sentence style guidelines present");
  assert((guidelines?.structure.length ?? 0) >= 1, "Content structure guidelines present");
  assert((guidelines?.callsToAction.length ?? 0) >= 2, "Calls to action guidance present");
  assert((guidelines?.punctuationAndFormatting.length ?? 0) >= 2, "Punctuation/formatting guidance present");

  // Test O: Required Examples Validation
  console.log("\nTest O: Required Examples Validation");
  const examples = resultH.updatedBrandState?.voice.examples;
  assert(Boolean(examples?.homepageHero), "Homepage hero copy present");
  assert(Boolean(examples?.shortPitch), "Short pitch copy present");
  assert(Boolean(examples?.primaryCTA), "Primary CTA button copy present");
  assert(Boolean(examples?.socialPost), "Social announcement post copy present");

  // Test P: Voice Don'ts Validation
  console.log("\nTest P: Voice Don'ts Validation");
  assert((resultH.updatedBrandState?.voice.voiceDonts.length ?? 0) >= 3, "Voice don'ts contains at least 3 anti-patterns");

  // Test Q: Consistency Rules Validation
  console.log("\nTest Q: Consistency Rules Validation");
  assert((resultH.updatedBrandState?.voice.consistencyRules.length ?? 0) >= 3, "Consistency rules contains at least 3 evaluable rules");

  // Test R: State Preservation
  console.log("\nTest R: Preservation of Upstream Context");
  assert(resultH.updatedBrandState?.discovery.rawIdea === stateH.discovery.rawIdea, "Preserves rawIdea unmutated");
  assert(resultH.updatedBrandState?.discovery.problem === stateH.discovery.problem, "Preserves Discovery unmutated");
  assert(resultH.updatedBrandState?.positioning.category === stateH.positioning.category, "Preserves Positioning unmutated");
  assert(resultH.updatedBrandState?.personality.archetype === stateH.personality.archetype, "Preserves Personality unmutated");
  assert(resultH.updatedBrandState?.naming.selectedName === stateH.naming.selectedName, "Preserves Naming selectedName unmutated");
  assert(resultH.updatedBrandState?.naming.directions.length === stateH.naming.directions.length, "Preserves Naming directions unmutated");

  // Test S: Version Increment
  console.log("\nTest S: Version Increment");
  assert(resultH.updatedBrandState?.version === stateH.version + 1, "Increments BrandState.version from 4 to 5");

  // Test T: AgentRun Trace Verification
  console.log("\nTest T: AgentRun Trace Verification");
  assert(resultH.agentRun?.stage === "SHAPE", "AgentRun stage is SHAPE");
  assert(resultH.agentRun?.agentName === "Voice", "AgentRun agentName is Voice");
  assert(resultH.agentRun?.status === "completed", "AgentRun status is completed");
  assert(typeof resultH.agentRun?.durationMs === "number" && resultH.agentRun.durationMs >= 0, "AgentRun tracks durationMs");
  assert((resultH.agentRun?.input as Record<string, unknown> | undefined)?.selectedName === "HireLock", "AgentRun input records selectedName");

  // Test U: Provider Failure Handling
  console.log("\nTest U: Provider Failure Handling");
  const failProvider = new TestMockVoiceProvider(mockValidVoice, true);
  const failResult = await executeVoiceAgent({ projectId: stateH.projectId }, stateH, failProvider);
  assert(!failResult.success, "Handles provider failure gracefully");
  assert(failResult.agentRun?.status === "failed", "Marks AgentRun status = failed on provider error");
  assert(Boolean(failResult.agentRun?.error), "Captures error message in trace");

  // Test V: Missing API Key Handling
  console.log("\nTest V: Missing API Key Handling");
  const savedKey = process.env.GROQ_API_KEY;
  const savedAiKey = process.env.AI_API_KEY;
  const savedOpenAi = process.env.OPENAI_API_KEY;
  const savedGemini = process.env.GEMINI_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.AI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const keylessResult = await executeVoiceAgent({ projectId: stateH.projectId }, stateH);
    assert(!keylessResult.success, "Handles missing API key gracefully");
    assert(keylessResult.agentRun?.status === "failed", "Marks AgentRun status = failed on missing key");
    assert(keylessResult.error?.includes("missing") || keylessResult.error?.includes("API key"), "Returns user-friendly API key configuration error");
  } finally {
    if (savedKey) process.env.GROQ_API_KEY = savedKey;
    if (savedAiKey) process.env.AI_API_KEY = savedAiKey;
    if (savedOpenAi) process.env.OPENAI_API_KEY = savedOpenAi;
    if (savedGemini) process.env.GEMINI_API_KEY = savedGemini;
  }

  // Test W: Malformed Model Output Handling
  console.log("\nTest W: Malformed Model Output Handling");
  const malformedProvider = new TestMockVoiceProvider({ completely: "malformed", notVoice: true });
  const malformedResult = await executeVoiceAgent({ projectId: stateH.projectId }, stateH, malformedProvider);
  assert(!malformedResult.success, "Rejects malformed model output");
  assert(malformedResult.agentRun?.status === "failed", "Marks AgentRun status = failed on schema failure");

  // Test X: Selected Tagline Optional
  console.log("\nTest X: Selected Tagline Optional");
  const noTaglineState = createRealisticBrandState();
  noTaglineState.naming.selectedTagline = null;
  const mockProviderX = new TestMockVoiceProvider(mockValidVoice);
  const resultX = await executeVoiceAgent({ projectId: noTaglineState.projectId }, noTaglineState, mockProviderX);
  assert(resultX.success, "Voice executes successfully when selectedTagline is null");
  const promptX = mockProviderX.capturedMessages.map((m) => m.content).join("\n");
  assert(promptX.includes("NONE SELECTED"), "Prompt explicitly indicates no tagline selected without failing");

  // Test Y: No Brand Name Invention
  console.log("\nTest Y: Verification of Selected Name in Outputs");
  assert(resultH.updatedBrandState?.voice.examples.homepageHero.includes("HireLock"), "Homepage hero example features the authoritative selectedName");
  assert(resultH.updatedBrandState?.voice.examples.shortPitch.includes("HireLock"), "Short pitch example features the authoritative selectedName");
  assert(resultH.updatedBrandState?.voice.examples.socialPost.includes("HireLock"), "Social post example features the authoritative selectedName");

  // Test Z: Regeneration
  console.log("\nTest Z: Voice Regeneration");
  const firstRunState = resultH.updatedBrandState!;
  assert(firstRunState.version === 5, "First run version is 5");

  const mockValidVoice2: VoiceOutput = {
    ...mockValidVoice,
    toneProfile: {
      ...mockValidVoice.toneProfile,
      primary: "Rigorous Forensic Transparency",
    },
  };
  const mockProviderZ = new TestMockVoiceProvider(mockValidVoice2);
  const regenResult = await executeVoiceAgent({ projectId: firstRunState.projectId }, firstRunState, mockProviderZ);

  assert(regenResult.success, "Regeneration succeeds");
  assert(regenResult.updatedBrandState?.version === 6, "Increments version on regeneration from 5 to 6");
  assert(regenResult.updatedBrandState?.voice.toneProfile.primary === "Rigorous Forensic Transparency", "Updates voice to regenerated output");
  assert(regenResult.updatedBrandState?.naming.selectedName === "HireLock", "Naming selection remains unchanged on Voice regeneration");
  assert(regenResult.updatedBrandState?.discovery.problem === firstRunState.discovery.problem, "Discovery remains unchanged on regeneration");
  assert(regenResult.agentRun?.id !== resultH.agentRun?.id, "Produces separate AgentRun trace with unique ID");

  console.log("\n==================================================");
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log("==================================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
