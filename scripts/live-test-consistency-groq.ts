/**
 * Live Groq Integration Test for Consistency Agent (Phase 7)
 * Tests actual end-to-end LLM inference with Groq, Zod schema validation,
 * 7-dimension cross-system coherence evaluation, state persistence, and AgentRun generation.
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

import { createInitialBrandState, type BrandState, ConsistencyOutputSchema } from "../src/types/brand";
import { executeConsistencyAgent } from "../src/lib/agents/consistency";
import { getAIProvider } from "../src/lib/ai/provider";

async function runLiveGroqConsistencyTest() {
  console.log("\n=======================================================");
  console.log("PinkLoom Phase 7 — Live Groq Consistency Agent Integration");
  console.log("=======================================================\n");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your-groq-api-key")) {
    console.error("GROQ_API_KEY is not configured in .env.local.");
    process.exit(1);
  }

  const provider = getAIProvider();
  console.log(`Using AI Provider: ${provider.providerName}`);
  console.log(`Target Model: ${process.env.GROQ_MODEL || "default"}\n`);

  // Build a realistic complete 6-layer BrandState + Critique
  const brandState: BrandState = createInitialBrandState(
    "Decentralized escrow and talent protocol for verified high-agency engineers",
    "live-groq-consistency-project"
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

  // Critique is available from Phase 6
  brandState.critique = {
    isEvaluated: true,
    evaluatedAt: new Date().toISOString(),
    summary: "Systemic cryptographic verification posture with high audit-grade integrity.",
    critiques: [],
    genericLanguageDetected: [],
    vulnerabilities: [],
    overallAssessment:
      "ProofLoom exhibits formidable systemic cohesion across security positioning, austere tone, and obsidian visual styling.",
    readiness: "ready",
    strengths: [
      "Positioning avoids recruiting cliches and grounds all claims in deterministic escrow proof.",
      "Voice and visual direction mutually reinforce the Sovereign Sentinel archetype.",
    ],
    issues: [
      {
        id: "crit-1",
        severity: "low",
        category: "missing_information",
        evidence: "targetAudience: 'Senior Staff Software Engineers & High-Agency Builders'",
        explanation: "Secondary developer onboarding workflows could be more explicitly documented.",
        suggestedRevision: "Enumerate CLI onboarding steps in supplementary developer documentation.",
      },
    ],
    blockingIssues: [],
  };

  const initialVersion = brandState.version || 1;
  const initialSelectedName = brandState.naming.selectedName;

  console.log(`Auditing complete brand system for '${initialSelectedName}'...`);
  console.log("Triggering executeConsistencyAgent via live Groq API...\n");

  const startTime = Date.now();
  const result = await executeConsistencyAgent({
    projectId: brandState.projectId || "live-groq-consistency-project",
    apiKey,
    brandState,
  });

  const durationMs = Date.now() - startTime;

  if (!result.success || !result.consistencyOutput) {
    console.error("FAIL: Consistency agent execution failed!");
    console.error("Error:", result.error);
    process.exit(1);
  }

  const output = result.consistencyOutput;
  const updatedState = result.updatedBrandState;
  const agentRun = result.agentRun;

  console.log("=======================================================");
  console.log("LIVE GROQ CONSISTENCY OUTPUT RECEIVED SUCCESSFULLY");
  console.log("=======================================================\n");

  console.log(`Duration: ${durationMs}ms`);
  console.log(`Readiness: ${output.readiness.toUpperCase()}`);
  console.log(`Overall Assessment:\n"${output.overallAssessment}"\n`);

  console.log("The Seven Brand Dimensions Statuses:");
  console.log(`  1. Strategic:   [${output.strategic.status.toUpperCase()}] (${output.strategic.findings.length} findings)`);
  console.log(`  2. Audience:    [${output.audience.status.toUpperCase()}] (${output.audience.findings.length} findings)`);
  console.log(`  3. Personality: [${output.personality.status.toUpperCase()}] (${output.personality.findings.length} findings)`);
  console.log(`  4. Naming:      [${output.naming.status.toUpperCase()}] (${output.naming.findings.length} findings)`);
  console.log(`  5. Voice:       [${output.voice.status.toUpperCase()}] (${output.voice.findings.length} findings)`);
  console.log(`  6. Visual:      [${output.visual.status.toUpperCase()}] (${output.visual.findings.length} findings)`);
  console.log(`  7. Messaging:   [${output.messaging.status.toUpperCase()}] (${output.messaging.findings.length} findings)\n`);

  console.log(`Cross-System Issues Identified: ${output.crossSystemIssues.length}`);
  if (output.crossSystemIssues.length > 0) {
    output.crossSystemIssues.forEach((iss, i) => {
      console.log(`  ${i + 1}. [${iss.severity.toUpperCase()}] ${iss.relationship}`);
      console.log(`     Evidence: "${iss.evidence}"`);
      console.log(`     Explanation: ${iss.explanation}`);
      console.log(`     Recommendation: ${iss.recommendation}`);
    });
  } else {
    console.log("  (Zero cross-system friction issues detected — high coherence confirmed)");
  }

  console.log(`\nSystemic Synergies / Strengths: ${output.strengths.length}`);
  output.strengths.forEach((str, i) => {
    console.log(`  ✓ ${i + 1}. ${str}`);
  });

  if (output.warnings.length > 0) {
    console.log(`\nAdvisory Warnings: ${output.warnings.length}`);
    output.warnings.forEach((warn, i) => {
      console.log(`  ! ${i + 1}. ${warn}`);
    });
  }

  // Verification Assertions
  console.log("\n=======================================================");
  console.log("VERIFYING LIVE INTEGRATION CONTRACTS");
  console.log("=======================================================");

  // 1. Zod Schema Validation
  const zodValidation = ConsistencyOutputSchema.safeParse(output);
  if (!zodValidation.success) {
    console.error("FAIL: Consistency output failed Zod schema validation!", zodValidation.error);
    process.exit(1);
  }
  console.log("✓ Zod Schema Validation: PASS");

  // 2. State Persistence & Immutability
  if (!updatedState || !updatedState.consistency.isEvaluated) {
    console.error("FAIL: BrandState.consistency was not properly updated!");
    process.exit(1);
  }
  console.log("✓ BrandState.consistency Update: PASS");

  if (updatedState.naming.selectedName !== initialSelectedName) {
    console.error(`FAIL: Name protection violated! ${initialSelectedName} was changed to ${updatedState.naming.selectedName}`);
    process.exit(1);
  }
  console.log(`✓ Name Protection: PASS ('${initialSelectedName}' strictly preserved)`);

  if ((updatedState.version || 1) <= initialVersion) {
    console.error(`FAIL: BrandState version was not incremented! (${initialVersion} -> ${updatedState.version})`);
    process.exit(1);
  }
  console.log(`✓ BrandState Versioning: PASS (v${initialVersion} -> v${updatedState.version})`);

  // 3. AgentRun Verification
  if (!agentRun || agentRun.stage !== "CONSISTENCY" || agentRun.agentName !== "Consistency") {
    console.error("FAIL: AgentRun telemetry is invalid or missing!", agentRun);
    process.exit(1);
  }
  console.log(`✓ AgentRun Telemetry: PASS (stage=${agentRun.stage}, agentName=${agentRun.agentName}, status=${agentRun.status})`);

  console.log("\n=======================================================");
  console.log("PHASE 7 LIVE GROQ CONSISTENCY TEST: ALL VERIFICATIONS PASS");
  console.log("=======================================================\n");
}

runLiveGroqConsistencyTest().catch((err) => {
  console.error("Unhandled error during Live Groq Consistency test:", err);
  process.exit(1);
});
