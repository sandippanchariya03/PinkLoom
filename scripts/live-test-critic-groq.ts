/**
 * Live Groq Integration Test for Critic / Challenge Agent (Phase 6)
 * Tests actual end-to-end LLM inference with Groq, Zod schema validation,
 * state persistence, and AgentRun generation.
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

import { createInitialBrandState, type BrandState } from "../src/types/brand";
import { executeCriticAgent } from "../src/lib/agents/critic";
import { getAIProvider } from "../src/lib/ai/provider";

async function runLiveGroqTest() {
  console.log("\n=======================================================");
  console.log("PinkLoom Phase 6 — Live Groq Critic Agent Integration");
  console.log("=======================================================\n");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your-groq-api-key")) {
    console.error("GROQ_API_KEY is not configured in .env.local.");
    process.exit(1);
  }

  const provider = getAIProvider();
  console.log(`Using AI Provider: ${provider.providerName}`);
  console.log(`Target Model: ${process.env.GROQ_MODEL || "default"}\n`);

  // Build a realistic complete 6-layer BrandState
  const brandState: BrandState = createInitialBrandState(
    "Decentralized escrow and talent protocol for verified high-agency engineers",
    "live-groq-critic-project"
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
    confidence: 0.92,
  };

  brandState.personality = {
    ...brandState.personality,
    isFormulated: true,
    formulatedAt: new Date().toISOString(),
    archetype: "Sovereign Sentinel",
    archetypeRationale: "Reflects incorruptible vigilance, scientific precision, and institutional authority.",
    traits: [
      "Vigilant",
      "Incorruptible",
      "Direct",
      "High-Agency",
    ],
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
    confidence: 0.95,
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
      primary: "Mathematical Inevitability",
      secondary: ["Vigilant Precision", "Direct Authority"],
      tonalBalance: "High formality and high assertiveness with restrained, austere enthusiasm.",
      emotionalEffect: "Unshakeable confidence grounded in cryptographic verification.",
    },
    toneDimensions: [
      { dimension: "Formality", level: 90, rationale: "Audit-grade technical precision." },
      { dimension: "Assertiveness", level: 92, rationale: "Unapologetic rejection of recruiter games." },
      { dimension: "Warmth", level: 35, rationale: "Respectful but austere and non-effusive." },
      { dimension: "Enthusiasm", level: 25, rationale: "Understated facts rather than sales cheerleading." },
    ],
    vocabulary: {
      preferred: ["deterministic escrow", "direct contract", "verified solvency", "cryptographic guarantee"],
      avoid: ["rockstar", "ninja", "guru", "revolutionary", "game-changer"],
      terminology: ["Smart Escrow", "Invariant Proof", "Talent Protocol"],
      languageCharacteristics: ["Declarative sentences", "Active voice", "Zero fluff adjectives"],
    },
    messagingPillars: [
      {
        title: "Deterministic Escrow",
        keyMessage: "Employer budgets are locked in cryptographic escrow before your first interview.",
        purpose: "Eliminates phantom job postings and fake hiring pipelines.",
        supportingPoints: ["Verifiable on-chain balance proof", "Sub-48h contract settlement"],
      },
      {
        title: "Peer-to-Peer Protocol",
        keyMessage: "Engineers negotiate directly with engineering leadership with zero recruiter tax.",
        purpose: "Guarantees direct access without intermediate misrepresentation.",
        supportingPoints: ["Direct founder sign-off", "Zero agency fee extraction"],
      },
    ],
    examples: {
      homepageHero: "Stop interviewing for phantom jobs. Verified contracts backed by deterministic escrow.",
      shortPitch: "ProofLoom replaces recruiting agencies with cryptographic hiring escrows for elite engineers.",
      primaryCTA: "Verify Your Hiring Escrow",
      socialPost: "Recruiters take 25% of your first-year salary for forwarding a PDF. ProofLoom eliminates them entirely.",
    },
    voiceDonts: [
      "Never use sales hyperbole or buzzwords",
      "Never make unverified compensation promises",
    ],
    consistencyRules: [
      "Always state numbers and equity formulas plainly",
      "Maintain declarative sentence cadence",
    ],
  };

  brandState.visualDirection = {
    ...brandState.visualDirection,
    isGenerated: true,
    generatedAt: new Date().toISOString(),
    visualPersonality: {
      aestheticMood: "Austere architectural dignity with razor-sharp cryptographic clarity.",
      visualKeywords: ["Deterministic", "Monolithic", "Audited", "Precise", "Unflinching"],
      designPrinciples: [
        {
          principle: "Substance Precedes Decoration",
          description: "Every visual line, border, and badge serves hierarchical data clarity.",
        },
        {
          principle: "High Contrast Cadence",
          description: "Black and white editorial structure with emerald verified indicators.",
        },
      ],
      imageryDirection: "Minimalist architectural schematics and cryptographic network topologies.",
    },
    colorSystem: {
      primary: [
        {
          name: "Obsidian Slate",
          hex: "#0F1115",
          role: "Structural Foundation",
          usage: "Primary backgrounds, dark surfaces, and high-contrast typography.",
        },
        {
          name: "Proof White",
          hex: "#F9FAF8",
          role: "High-Contrast Surface",
          usage: "Card containers, inverted sections, and clear typographic surfaces.",
        },
      ],
      secondary: [
        {
          name: "Cryptographic Emerald",
          hex: "#10B981",
          role: "Verified Signal Accent",
          usage: "Escrow verification badges and positive status indicators.",
        },
      ],
      neutrals: [
        {
          name: "Graphite Line",
          hex: "#262930",
          role: "Structural Border",
          usage: "Subtle 1px card borders and table dividers.",
        },
        {
          name: "Muted Caption",
          hex: "#8A909E",
          role: "Secondary Copy",
          usage: "Timestamps and secondary metadata labels.",
        },
      ],
      semantic: [
        {
          name: "Escrow Violation Alert",
          hex: "#EF4444",
          role: "Critical Failure Signal",
          usage: "Highlights contract discrepancies or unverified funds.",
        },
      ],
      accessibility: {
        contrastNotes: "Obsidian on Proof White achieves an 18.2:1 contrast ratio exceeding WCAG AAA.",
        wcagCompliance: "WCAG 2.1 AAA",
        darkThemeConsiderations: "High contrast in both light certification documents and terminal dark views.",
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
        usage: "Body paragraphs and interface copy.",
      },
      pairing: {
        headingFont: "Instrument Serif",
        bodyFont: "Inter",
        contrast: "Editorial elegance paired with crisp engineering utility.",
        mood: "Academic dignity meeting high-assurance technology.",
      },
      rationale: "Serif commands institutional respect while Inter delivers pristine screen legibility.",
    },
    imagery: {
      photographyDirection: "Minimalist architectural documentary photography under natural directional light.",
      illustrationDirection: "Geometric monoline lattice diagrams and cryptographic vector schematics.",
      composition: "Disciplined asymmetric Swiss grid with generous negative space.",
      subjectTreatment: "Monochrome treatment with selective emerald signal accents.",
    },
    logoDirection: {
      concept: "Interlocking topological knot forming an unbreakable architectural proof shield.",
      markDirection: "Continuous monoline ribbon forming geometric weave geometry.",
      wordmarkDirection: "Tracked uppercase letters with razor-sharp terminals.",
      constructionPrinciples: [
        "Constructed strictly on an 8px grid coordinate system",
        "Retains optical legibility down to 16px favicon scale",
      ],
    },
    layoutPrinciples: {
      spacing: "Strict 8px geometric grid rhythm.",
      density: "High technical data density with generous surrounding structural margins.",
      hierarchy: "Disciplined scale: Display H1 (48px) to H2 (28px) to mono body (13px).",
      shapeLanguage: "Crisp 4px micro-radii on interactive badges; sharp 0px on formal containers.",
      composition: "Balanced 12-column Swiss editorial grid.",
    },
    overallAesthetic: "Austere Cryptographic Precision",
    colors: [],
  };

  const initialVersion = brandState.version || 1;
  const initialSelectedName = brandState.naming.selectedName;

  console.log(`Auditing complete brand system for '${initialSelectedName}'...`);
  console.log("Triggering executeCriticAgent via live Groq API...\n");

  const startTime = Date.now();
  const result = await executeCriticAgent({
    projectId: brandState.projectId,
    apiKey,
    brandState,
  });

  const durationMs = Date.now() - startTime;

  if (!result.success || !result.criticOutput) {
    console.error("FAIL: Critic agent execution failed!");
    console.error("Error:", result.error);
    process.exit(1);
  }

  const output = result.criticOutput;
  const updatedState = result.updatedBrandState;
  const agentRun = result.agentRun;

  console.log("=======================================================");
  console.log("LIVE GROQ CRITIC OUTPUT RECEIVED SUCCESSFULLY");
  console.log("=======================================================\n");

  console.log(`Duration: ${durationMs}ms`);
  console.log(`Readiness: ${output.readiness.toUpperCase()}`);
  console.log(`\nOverall Diagnostic Assessment:\n"${output.overallAssessment}"\n`);

  console.log(`Affirmed Strengths (${output.strengths.length}):`);
  output.strengths.forEach((s, idx) => console.log(`  ${idx + 1}. ${s}`));

  console.log(`\nDiagnosed Issues (${output.issues.length}):`);
  output.issues.forEach((iss, idx) => {
    console.log(`  ${idx + 1}. [${iss.severity.toUpperCase()}] ${iss.category}: "${iss.evidence}"`);
    console.log(`     Explanation: ${iss.explanation}`);
    console.log(`     Suggested Revision: ${iss.suggestedRevision}`);
  });

  console.log(`\nBlocking Issues: ${output.blockingIssues.length}`);
  output.blockingIssues.forEach((b, idx) => {
    const text = typeof b === "string" ? b : (b as { explanation: string }).explanation;
    console.log(`  ${idx + 1}. ${text}`);
  });

  // Verification Assertions
  console.log("\n--- Verification Checks ---");
  const checks = [
    { name: "Inference succeeds", pass: result.success === true },
    { name: "Overall assessment is substantive", pass: output.overallAssessment.length >= 20 },
    { name: "Strengths identified", pass: output.strengths.length > 0 },
    { name: "Readiness is valid enum", pass: ["ready", "needs_revision", "not_ready"].includes(output.readiness) },
    { name: "Every issue contains required fields", pass: output.issues.every((i) => i.id && i.severity && i.category && i.evidence && i.explanation && i.suggestedRevision) },
    { name: "BrandState.critique.isEvaluated is true", pass: updatedState?.critique.isEvaluated === true },
    { name: "BrandState.version incremented", pass: updatedState?.version === initialVersion + 1 },
    { name: "Name protected (selectedName unmutated)", pass: updatedState?.naming.selectedName === initialSelectedName },
    { name: "AgentRun created with stage=CHALLENGE", pass: agentRun?.stage === "CHALLENGE" },
    { name: "AgentRun agentName=Critic", pass: agentRun?.agentName === "Critic" },
    { name: "AgentRun status=completed", pass: agentRun?.status === "completed" },
    { name: "AgentRun tracks duration", pass: (agentRun?.durationMs ?? 0) > 0 },
  ];

  let allPassed = true;
  for (const c of checks) {
    if (c.pass) {
      console.log(`  ✓ PASS: ${c.name}`);
    } else {
      console.error(`  ✗ FAIL: ${c.name}`);
      allPassed = false;
    }
  }

  console.log("\n=======================================================");
  if (allPassed) {
    console.log("PHASE 6 LIVE GROQ TEST: PASSED");
  } else {
    console.error("PHASE 6 LIVE GROQ TEST: FAILED");
    process.exit(1);
  }
  console.log("=======================================================\n");
}

runLiveGroqTest().catch((err) => {
  console.error("Live test failed with unhandled error:", err);
  process.exit(1);
});
