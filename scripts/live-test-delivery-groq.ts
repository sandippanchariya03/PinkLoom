/**
 * Live Groq Integration Test for Delivery Agent (Phase 8)
 * Tests actual end-to-end LLM inference with Groq, Zod schema validation,
 * 6-section brand deliverable synthesis, state persistence, and AgentRun generation.
 */

import fs from "fs";
import path from "path";

// Native .env.local loader
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
} catch {
  // ignore
}

import { createInitialBrandState, type BrandState, DeliveryOutputSchema } from "../src/types/brand";
import { executeDeliveryAgent } from "../src/lib/agents/delivery";
import { getAIProvider } from "../src/lib/ai/provider";

async function runLiveGroqDeliveryTest() {
  console.log("\n=======================================================");
  console.log("PinkLoom Phase 8 — Live Groq Delivery Agent Integration");
  console.log("=======================================================\n");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your-groq-api-key")) {
    console.error("GROQ_API_KEY is not configured in .env.local.");
    process.exit(1);
  }

  const provider = getAIProvider();
  const targetModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  console.log(`Using AI Provider: ${provider.providerName}`);
  console.log(`Target Model: ${targetModel}\n`);

  // Build a realistic complete 8-layer BrandState + Consistency
  const brandState: BrandState = createInitialBrandState(
    "Decentralized escrow and talent protocol for verified high-agency engineers",
    "live-groq-delivery-project"
  );

  brandState.discovery = {
    ...brandState.discovery,
    isAnalyzed: true,
    analyzedAt: new Date().toISOString(),
    problem:
      "Software engineers waste hundreds of hours filtering recruiter spam, fake job listings, and ambiguous equity offers with zero guarantees of financial solvency.",
    targetAudience: {
      primary: "Senior Staff Software Engineers & High-Agency Builders",
      secondary: ["Series A Founders", "Autonomous Systems Architects"],
      characteristics: ["High technical agency", "Allergic to corporate jargon", "Values verifiable proof"],
      painPoints: ["Recruiter ghosting", "Phantom equity grants", "Opaque salary negotiations"],
      motivations: ["Direct peer-to-peer contracts", "Cryptographic escrow protection"],
    },
    userNeeds: ["Proof of employer funds before interviewing", "Direct founder interaction", "No intermediaries"],
    constraints: ["Must guarantee zero recruiter intermediaries", "Must settle milestone payouts cryptographically"],
    assumptions: ["Top engineers will bypass traditional job boards for guaranteed financial escrows"],
    clarifyingQuestions: ["What automated proof engines verify employer solvency?"],
  };

  brandState.positioning = {
    ...brandState.positioning,
    isPositioned: true,
    positionedAt: new Date().toISOString(),
    category: "Verified Technical Talent Infrastructure",
    categoryRationale:
      "Elevates developer compensation from sales-led recruiting to deterministic financial infrastructure.",
    positioningStatement:
      "For elite software engineers who refuse to waste time with recruiters, ProofLoom is the escrow-backed talent protocol that guarantees verified direct founder contracts.",
    differentiator: "Cryptographically escrowed hiring bonuses and zero recruiter intermediaries.",
    valueProposition:
      "Direct contracts, provable employer budgets, and verified corporate identities with sub-48h SLAs.",
    competitiveWhitespace: ["Eliminating the 25% recruiter margin through programmatic escrow"],
    alternatives: ["Traditional contingency recruitment agencies", "LinkedIn job postings"],
    proofPoints: [
      "100% upfront escrow verification",
      "Direct cryptographic sign-in",
      "Zero recruiter fee extraction",
    ],
    risks: ["Founders unfamiliar with escrow mechanics may experience onboarding friction"],
    confidence: 94,
  };

  brandState.personality = {
    ...brandState.personality,
    isFormulated: true,
    formulatedAt: new Date().toISOString(),
    archetype: "Sovereign Sentinel",
    archetypeRationale: "Reflects incorruptible vigilance, scientific precision, and institutional authority.",
    traits: ["Vigilant", "Incorruptible", "Direct", "High-Agency"],
    behavioralCharacteristics: [
      "Speaks with mathematical brevity",
      "Never uses recruitment hype or fluff",
      "Prioritizes verifiable facts over subjective promises",
    ],
    principles: [
      { title: "Proof Precedes Assertion", description: "Never claim budget availability without cryptographic escrow verification." },
      { title: "Zero Parasitic Intermediation", description: "Engineers speak directly to technical leaders." },
    ],
    emotionalTerritory: "The unshakeable security of verified capital and peer-level respect.",
    personalityDo: ["Cite exact compensation numbers", "Speak directly engineer-to-engineer"],
    personalityDont: ["Use recruiter buzzwords like 'rockstar' or 'ninja'", "Conceal equity formulas"],
    confidence: 96,
  };

  brandState.naming = {
    ...brandState.naming,
    isGenerated: true,
    isSelected: true,
    selectedName: "ProofLoom",
    selectedTagline: "Verified talent contracts backed by deterministic escrow.",
    selectedDirectionId: "dir-sovereign",
    generatedAt: new Date().toISOString(),
    selectedAt: new Date().toISOString(),
    directions: [
      {
        id: "dir-sovereign",
        name: "Deterministic Infrastructure",
        strategy: "Structural integrity and verifiable craft",
        rationale: "Balances cryptographic verification with architectural infrastructure weaving.",
        namingLogic: "Taps into architectural and mathematical weaving metaphors",
        candidates: [
          {
            name: "ProofLoom",
            rationale: "Balances cryptographic verification with architectural infrastructure weaving.",
            linguisticRationale: "Strong compound linking mathematical proof with fabric craft",
            phoneticAssessment: "Plosive start followed by smooth resonant coda",
            domainSuitability: "Distinctive, high memorability, and brandable",
          },
        ],
        taglineCandidates: ["Verified talent contracts backed by deterministic escrow."],
      },
    ],
  };

  brandState.voice = {
    ...brandState.voice,
    isGenerated: true,
    generatedAt: new Date().toISOString(),
    toneProfile: {
      primary: "Authoritative Rigor",
      secondary: ["Institutional Precision", "Mathematical Austerity"],
      tonalBalance: "Disciplined and objective",
      emotionalEffect: "Confidence and certainty",
    },
    vocabulary: {
      preferred: ["escrow verification", "deterministic contracts", "peer-to-peer protocol", "cryptographic proof"],
      avoid: ["rockstar", "ninja", "guru", "disruptive", "family culture", "competitive compensation"],
      terminology: ["smart contract escrow", "zero-knowledge identity", "verifiable credentials"],
      languageCharacteristics: ["Direct", "Precise", "Empirical"],
    },
    examples: {
      homepageHero: "Verified talent contracts backed by deterministic cryptographic escrow.",
      shortPitch: "ProofLoom eliminates recruiters with code-enforced hiring escrows.",
      primaryCTA: "Connect Verified Wallet",
      socialPost: "Recruiters take 25%. ProofLoom puts 100% of your compensation in verified on-chain escrow.",
    },
    voiceDonts: [
      "We're like Uber for tech talent! Join our awesome family!",
      "Supercharge your career with rockstar opportunities!",
    ],
  };

  brandState.visualDirection = {
    ...brandState.visualDirection,
    isGenerated: true,
    generatedAt: new Date().toISOString(),
    colorSystem: {
      primary: [
        {
          name: "Deep Obsidian",
          hex: "#0A0C10",
          role: "Dominant dark background canvas",
          usage: "Canvas background",
        },
      ],
      secondary: [
        {
          name: "Cryptographic Cyan",
          hex: "#00F0FF",
          role: "Accent color for verified escrow indicators",
          usage: "Actionable highlights",
        },
      ],
      neutrals: [
        {
          name: "Platinum Steel",
          hex: "#E2E8F0",
          role: "Body text and crisp architectural borders",
          usage: "Typography and hairlines",
        },
      ],
      semantic: [
        {
          name: "Escrow Verified",
          hex: "#10B981",
          role: "Indicates fully funded cryptographic escrow",
          usage: "Verification badges",
        },
      ],
      accessibility: {
        contrastNotes: "All interactive elements exceed WCAG 2.1 AAA requirements.",
        wcagCompliance: "WCAG 2.1 AAA",
        darkThemeConsiderations: "Dark-first protocol terminal design for terminal-native developers.",
      },
    },
    typography: {
      heading: {
        fontFamily: "Instrument Serif",
        category: "Serif",
        weights: ["400"],
        usage: "Display titles and protocol value statements",
      },
      body: {
        fontFamily: "Inter",
        category: "Sans-serif",
        weights: ["400", "500", "600"],
        usage: "Interface copy and technical specifications",
      },
      pairing: {
        headingFont: "Instrument Serif",
        bodyFont: "Inter",
        contrast: "Editorial authority paired with humanist technical precision",
        mood: "Refined, sovereign, institutional",
      },
      rationale: "Balances institutional trust with terminal efficiency.",
    },
    visualPersonality: {
      aestheticMood: "Austere Sovereign Terminal",
      visualKeywords: ["monochrome", "mathematical", "architectural", "high-contrast"],
      designPrinciples: [
        { principle: "Zero visual clutter", description: "Zero decorative ornament" },
        { principle: "Structural transparency", description: "Structural grid visibility" },
        { principle: "Code as interface", description: "Terminal aesthetic" },
      ],
      imageryDirection: "Technical system diagrams, monochrome code layouts, and cryptographic topology.",
    },
    imagery: {
      photographyDirection: "Monochrome architectural photography and brutalist structure textures.",
      illustrationDirection: "Vector wireframes of interlocking escrow lattices and cryptographic nodes.",
      composition: "Asymmetric grid with disciplined typography and generous structural gutters.",
      subjectTreatment: "High-contrast monochrome lighting with sharp geometric boundaries.",
    },
    logoDirection: {
      concept: "Interlocking geometric lattice representing an unbreakable contract weave.",
      markDirection: "Minimalist vector monogram forming the letters P and L inside a hexagonal cell.",
      wordmarkDirection: "Clean tracking in uppercase Instrument Serif with optical kerning.",
      constructionPrinciples: ["Mathematical symmetry", "Scalable down to 16px favicon", "Monochrome native"],
    },
    layoutPrinciples: {
      spacing: "8pt baseline grid",
      density: "High density with disciplined white space around contract terms",
      hierarchy: "Dramatic scale jump between editorial headings and monospace data",
      shapeLanguage: "Razor-sharp 0px corner radii and clean hairline borders",
      composition: "Two-column architectural layout with fixed protocol terminal",
    },
    overallAesthetic: "Austere Sovereign Terminal",
    colors: [],
  };

  brandState.critique = {
    summary: "Strong value proposition targeting developer frustration with clear structural defensibility.",
    critiques: [],
    genericLanguageDetected: [],
    vulnerabilities: [],
    overallAssessment: "ProofLoom displays high technical rigor with minimal vulnerabilities.",
    readiness: "ready",
    strengths: ["Direct address of developer compensation opacity."],
    issues: [],
    blockingIssues: [],
    isEvaluated: true,
  };

  brandState.consistency = {
    overallAssessment:
      "The ProofLoom brand system demonstrates exceptional systemic cohesion across all dimensions.",
    readiness: "coherent",
    strategic: { status: "coherent", findings: ["Tight problem-category alignment."] },
    audience: { status: "coherent", findings: ["Senior engineer audience strictly matches austere tone."] },
    personality: { status: "coherent", findings: ["Sovereign Sentinel reinforces mathematical rigor."] },
    naming: { status: "coherent", findings: ["ProofLoom captures the weaving of formal verification proofs."] },
    voice: { status: "coherent", findings: ["Austere tone profile perfectly aligns with enterprise expectations."] },
    visual: { status: "coherent", findings: ["Obsidian and cyan palette embodies cryptographic precision."] },
    messaging: { status: "coherent", findings: ["Pillars substantiate the core value proposition without hyperbole."] },
    crossSystemIssues: [],
    strengths: ["Indivisible alignment between cryptographic escrow and austere visual/verbal tone."],
    warnings: ["Maintain strict terminology boundaries around code-enforced escrow."],
    overallCoherenceScore: 96,
    alignments: [],
    crossStageConflicts: [],
    finalRecommendation: "Proceed to Delivery to operationalize brand guidelines.",
    isEvaluated: true,
    evaluatedAt: new Date().toISOString(),
  };

  const initialVersion = brandState.version || 1;
  const initialSelectedName = brandState.naming.selectedName;

  console.log(`Operationalizing complete brand system for '${initialSelectedName}'...`);
  console.log("Triggering executeDeliveryAgent via live Groq API...\n");

  const startTime = Date.now();
  const result = await executeDeliveryAgent({
    projectId: brandState.projectId || "live-groq-delivery-project",
    apiKey,
    brandState,
  });

  const durationMs = Date.now() - startTime;

  if (!result.success || !result.deliveryOutput) {
    console.error("FAIL: Delivery agent execution failed!");
    console.error("Error:", result.error);
    process.exit(1);
  }

  const output = result.deliveryOutput;
  const updatedState = result.updatedBrandState;
  const agentRun = result.agentRun;

  console.log("=======================================================");
  console.log("LIVE GROQ DELIVERY OUTPUT RECEIVED SUCCESSFULLY");
  console.log("=======================================================\n");

  console.log(`MODEL: ${targetModel}`);
  console.log(`LATENCY: ${durationMs}ms\n`);

  console.log("1. Brand Overview:");
  console.log(`   Name: ${output.brandOverview.name}`);
  console.log(`   Positioning: ${output.brandOverview.positioning}`);
  console.log(`   Audience: ${output.brandOverview.audience}`);
  console.log(`   Personality: ${output.brandOverview.personality}`);
  console.log(`   Differentiator: ${output.brandOverview.differentiator}\n`);

  console.log("2. Messaging Architecture:");
  console.log(`   Core Message: "${output.messaging.coreMessage}"`);
  console.log(`   Value Proposition: "${output.messaging.valueProposition}"`);
  console.log(`   Elevator Pitch: "${output.messaging.elevatorPitch}"`);
  console.log(`   Key Messages (${output.messaging.keyMessages.length}):`);
  output.messaging.keyMessages.forEach((msg, i) => console.log(`     ${i + 1}. ${msg}`));
  console.log(`   Messaging Pillars (${output.messaging.messagingPillars.length}):`);
  output.messaging.messagingPillars.forEach((p, i) =>
    console.log(`     ${i + 1}. ${p.pillar}: ${p.headline} — ${p.description}`)
  );
  console.log("");

  console.log("3. Voice Guidelines:");
  console.log(`   Summary: "${output.voiceGuidelines.voiceSummary}"`);
  console.log(`   Do Rules (${output.voiceGuidelines.doRules.length}): ${output.voiceGuidelines.doRules.join(" | ")}`);
  console.log(`   Don't Rules (${output.voiceGuidelines.dontRules.length}): ${output.voiceGuidelines.dontRules.join(" | ")}`);
  console.log(`   Preferred Vocab: ${output.voiceGuidelines.vocabularyGuidance.preferred.join(", ")}`);
  console.log(`   Prohibited Vocab: ${output.voiceGuidelines.vocabularyGuidance.avoid.join(", ")}`);
  console.log(`   Example Lines (${output.voiceGuidelines.exampleLines.length}):`);
  output.voiceGuidelines.exampleLines.forEach((ex, i) => console.log(`     ${i + 1}. "${ex}"`));
  console.log("");

  console.log("4. Visual Guidelines:");
  console.log(`   Color Direction: ${output.visualGuidelines.colorDirection}`);
  console.log(`   Typography Direction: ${output.visualGuidelines.typographyDirection}`);
  console.log(`   Imagery Direction: ${output.visualGuidelines.imageryDirection}`);
  console.log(`   Logo Guidance: ${output.visualGuidelines.logoGuidance}`);
  console.log(`   Composition Guidance: ${output.visualGuidelines.compositionGuidance}\n`);

  console.log("5. Multi-Channel Usage Guidance:");
  console.log(`   Website: ${output.usageGuidance.website}`);
  console.log(`   Social: ${output.usageGuidance.social}`);
  console.log(`   Presentations: ${output.usageGuidance.presentations}`);
  console.log(`   Marketing: ${output.usageGuidance.marketing}\n`);

  console.log(`6. Deliverable Cards Generated (${output.deliverables.length}):`);
  output.deliverables.forEach((d, i) => {
    console.log(`   ${i + 1}. [${d.type.toUpperCase()}] ${d.title} (ID: ${d.id})`);
    console.log(`      Description: ${d.description}`);
    console.log(`      Content Length: ${d.content.length} characters`);
  });

  if (output.warnings.length > 0) {
    console.log(`\n7. Advisory Warnings (${output.warnings.length}):`);
    output.warnings.forEach((w, i) => console.log(`   ! ${i + 1}. ${w}`));
  }

  // Verification Assertions
  console.log("\n=======================================================");
  console.log("VERIFYING LIVE INTEGRATION CONTRACTS");
  console.log("=======================================================");

  // 1. Zod Schema Validation
  const zodValidation = DeliveryOutputSchema.safeParse(output);
  if (!zodValidation.success) {
    console.error("FAIL: Delivery output failed Zod schema validation!", zodValidation.error);
    process.exit(1);
  }
  console.log("SCHEMA PASS: True");

  // 2. Output Checks
  if (output.brandOverview.name !== initialSelectedName) {
    console.error(`FAIL: Name protection violated! Expected '${initialSelectedName}', got '${output.brandOverview.name}'`);
    process.exit(1);
  }
  if (!output.messaging.coreMessage || !output.voiceGuidelines.voiceSummary || output.deliverables.length === 0) {
    console.error("FAIL: Essential delivery sections are missing!");
    process.exit(1);
  }
  console.log("OUTPUT PASS: True");

  // 3. State Persistence & Immutability
  if (!updatedState || !updatedState.delivery.isDelivered) {
    console.error("FAIL: BrandState.delivery was not properly updated!");
    process.exit(1);
  }
  if (updatedState.naming.selectedName !== initialSelectedName) {
    console.error(`FAIL: Name protection violated in upstream state!`);
    process.exit(1);
  }
  if ((updatedState.version || 1) <= initialVersion) {
    console.error(`FAIL: BrandState version was not incremented! (${initialVersion} -> ${updatedState.version})`);
    process.exit(1);
  }
  console.log("STATE PASS: True");

  // 4. AgentRun Verification
  if (!agentRun || agentRun.stage !== "DELIVERY" || agentRun.agentName !== "Delivery") {
    console.error("FAIL: AgentRun telemetry is invalid or missing!", agentRun);
    process.exit(1);
  }
  if (agentRun.status !== "completed") {
    console.error(`FAIL: AgentRun status is ${agentRun.status}, expected 'completed'`);
    process.exit(1);
  }
  console.log("AGENTRUN PASS: True");

  console.log("\n=======================================================");
  console.log("FINAL LIVE GROQ DELIVERY REPORT:");
  console.log(`MODEL: ${targetModel}`);
  console.log(`LATENCY: ${durationMs}ms`);
  console.log("SCHEMA PASS: PASS");
  console.log("OUTPUT PASS: PASS");
  console.log("STATE PASS: PASS");
  console.log("AGENTRUN PASS: PASS");
  console.log("=======================================================\n");
}

runLiveGroqDeliveryTest().catch((err) => {
  console.error("Unhandled error during Live Groq Delivery test:", err);
  process.exit(1);
});
