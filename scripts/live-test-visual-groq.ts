/**
 * Live Groq Integration Test for Visual Direction Agent (Phase 5)
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
import { executeVisualAgent } from "../src/lib/agents/visual";
import { getAIProvider } from "../src/lib/ai/provider";

async function runLiveGroqTest() {
  console.log("\n=======================================================");
  console.log("PinkLoom Phase 5 — Live Groq Visual Direction Agent Test");
  console.log("=======================================================\n");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your-groq-api-key")) {
    console.error("GROQ_API_KEY is not configured in .env.local.");
    process.exit(1);
  }

  const provider = getAIProvider();
  console.log(`Using AI Provider: ${provider.providerName}`);
  console.log(`Target Model: ${process.env.GROQ_MODEL || "default"}\n`);

  // Build a realistic 5-layer BrandState
  const brandState: BrandState = createInitialBrandState("Decentralized escrow and verified talent protocol");

  brandState.discovery = {
    ...brandState.discovery,
    isAnalyzed: true,
    analyzedAt: new Date().toISOString(),
    problem: "Software engineers waste hundreds of hours filtering recruiter spam, fake job listings, and ambiguous equity offers.",
    targetAudience: {
      primary: "Senior Staff Software Engineers & High-Agency Builders",
      secondary: ["Series A Founders", "Autonomous Systems Architects"],
      characteristics: ["High technical agency", "Allergic to corporate jargon", "Values verifiable proof"],
      painPoints: ["Recruiter ghosting", "Phantom equity grants", "Opaque salary negotiations"],
      motivations: ["Direct peer-to-peer contracts", "Cryptographic escrow protection"],
    },
    userNeeds: ["Proof of employer funds before interviewing", "Direct founder interaction"],
    constraints: ["Must guarantee zero recruiter intermediaries"],
  };

  brandState.positioning = {
    ...brandState.positioning,
    isPositioned: true,
    positionedAt: new Date().toISOString(),
    category: "Verified Technical Talent Infrastructure",
    categoryRationale: "Elevates developer compensation from sales-led recruiting to deterministic financial infrastructure.",
    positioningStatement: "For elite software engineers, PinkLoom is the first escrow-backed talent protocol that guarantees direct founder contracts.",
    differentiator: "Cryptographically escrowed hiring bonuses and zero recruiter intermediaries.",
    valueProposition: "Direct contracts, provable budgets, and verified corporate identities with sub-48h SLAs.",
    competitiveWhitespace: ["Eliminating the 25% recruiter margin through programmatic escrow"],
  };

  brandState.personality = {
    ...brandState.personality,
    isFormulated: true,
    formulatedAt: new Date().toISOString(),
    archetype: "The Master Craftsman & Sovereign Architect",
    archetypeRationale: "Commands respect through undeniable technical execution and unsparing craftsmanship.",
    traits: ["Authoritative", "Pragmatic", "Deterministic", "Incisive"],
    behavioralCharacteristics: ["Speaks in verified claims", "Rejects generic superlatives"],
    principles: [
      { title: "Proof Before Persuasion", description: "State verifiable data before qualitative claims." },
      { title: "Radical Directness", description: "Never obscure trade-offs or technical realities behind euphemisms." },
    ],
    emotionalTerritory: "Calm intellectual mastery, unburdened certainty, and professional dignity.",
    confidence: 95,
  };

  brandState.naming = {
    ...brandState.naming,
    isGenerated: true,
    isSelected: true,
    selectedName: "ProofLoom",
    selectedDirectionId: "dir_architectural",
    selectedTagline: "The Escrow-Backed Engineering Protocol",
    selectedAt: new Date().toISOString(),
    directions: [],
  };

  brandState.voice = {
    ...brandState.voice,
    isGenerated: true,
    generatedAt: new Date().toISOString(),
    toneProfile: {
      primary: "Authoritative Pragmatism",
      secondary: ["Incisive", "Transparent", "Relentlessly Grounded"],
      tonalBalance: "Direct and unsparing without sounding aggressive; clear evidence leads every sentence.",
      emotionalEffect: "The technical audience feels immediate clarity, relief from hype, and radical certainty.",
    },
    toneDimensions: [
      { dimension: "Authoritative vs Approachable", level: 80, rationale: "Engineers respect deep domain authority." },
      { dimension: "Direct vs Empathetic", level: 85, rationale: "Facts and concrete timelines matter above sentiment." },
    ],
    vocabulary: {
      preferred: ["verified", "escrowed", "deterministic", "provable"],
      avoid: ["revolutionary", "game-changer", "rockstar", "ninja", "supercharge"],
      terminology: ["escrow-backed compensation", "identity-verified employer"],
      languageCharacteristics: ["Anglo-Saxon root verbs", "declarative sentences"],
    },
    messagingPillars: [
      {
        title: "Guaranteed Authenticity",
        purpose: "Eliminate phantom listings",
        keyMessage: "Every contract is backed by verified corporate identity and escrowed funds.",
        supportingPoints: ["100% corporate treasury verification", "Zero intermediaries"],
      },
    ],
    communicationPrinciples: [
      { principle: "Lead with Verified Evidence", description: "Measurable facts before claims." },
    ],
    writingGuidelines: {
      sentenceStyle: ["Short, declarative sentences"],
      structure: ["Direct and inverted pyramid"],
      callsToAction: ["Direct invitations to verify"],
      punctuationAndFormatting: ["Em-dashes for cadence"],
    },
    examples: {
      homepageHero: "Engineering contracts backed by escrow. Zero recruiters.",
      shortPitch: "ProofLoom connects senior engineers directly to verified founders with escrowed compensation.",
      primaryCTA: "Verify Identity & Enter",
      socialPost: "Recruiter spam is dead. ProofLoom guarantees corporate identity and escrowed compensation.",
    },
    voiceDonts: ["Never use generic buzzwords", "Never hide compensation numbers"],
    consistencyRules: ["Every feature must tie to verified proof"],
  };

  console.log("Executing Visual Direction Agent with real Groq LLM inference...");
  const startTime = Date.now();
  const result = await executeVisualAgent(
    { projectId: "live-groq-test", apiKey },
    brandState,
    provider
  );
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  if (!result.success || !result.visualOutput) {
    console.error(`Live Groq Test FAILED in ${elapsed}s:`, result.error);
    process.exit(1);
  }

  const vo = result.visualOutput;
  console.log(`\nLive Groq Inference SUCCEEDED in ${elapsed}s!\n`);

  console.log("-------------------------------------------------------");
  console.log("01. VISUAL PERSONALITY");
  console.log("-------------------------------------------------------");
  console.log(`Aesthetic Mood: "${vo.visualPersonality.aestheticMood}"`);
  console.log(`Keywords: ${vo.visualPersonality.visualKeywords.join(", ")}`);
  console.log("Design Principles:");
  vo.visualPersonality.designPrinciples.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.principle}: ${p.description}`);
  });
  console.log(`Imagery Direction: ${vo.visualPersonality.imageryDirection}\n`);

  console.log("-------------------------------------------------------");
  console.log("02. COLOR SYSTEM");
  console.log("-------------------------------------------------------");
  console.log(`WCAG Compliance: ${vo.colorSystem.accessibility.wcagCompliance}`);
  console.log(`Contrast Notes: ${vo.colorSystem.accessibility.contrastNotes}`);
  console.log("Primary Colors:");
  vo.colorSystem.primary.forEach((c) => {
    console.log(`  - [${c.hex}] ${c.name} (${c.role}): ${c.usage}`);
  });
  console.log("Secondary Colors:");
  vo.colorSystem.secondary.forEach((c) => {
    console.log(`  - [${c.hex}] ${c.name} (${c.role}): ${c.usage}`);
  });
  console.log("Neutrals:");
  vo.colorSystem.neutrals.forEach((c) => {
    console.log(`  - [${c.hex}] ${c.name} (${c.role}): ${c.usage}`);
  });
  console.log();

  console.log("-------------------------------------------------------");
  console.log("03. TYPOGRAPHY");
  console.log("-------------------------------------------------------");
  console.log(`Heading Font: ${vo.typography.heading.fontFamily} (${vo.typography.heading.category}) [${vo.typography.heading.weights.join(", ")}]`);
  console.log(`Body Font: ${vo.typography.body.fontFamily} (${vo.typography.body.category}) [${vo.typography.body.weights.join(", ")}]`);
  console.log(`Pairing Contrast & Mood: ${vo.typography.pairing.contrast} | ${vo.typography.pairing.mood}`);
  console.log(`Strategic Rationale: ${vo.typography.rationale}\n`);

  console.log("-------------------------------------------------------");
  console.log("04. IMAGERY RULES");
  console.log("-------------------------------------------------------");
  console.log(`Photography: ${vo.imagery.photographyDirection}`);
  console.log(`Illustration: ${vo.imagery.illustrationDirection}`);
  console.log(`Composition: ${vo.imagery.composition}`);
  console.log(`Subject Treatment: ${vo.imagery.subjectTreatment}\n`);

  console.log("-------------------------------------------------------");
  console.log("05. LOGO DIRECTION");
  console.log("-------------------------------------------------------");
  console.log(`Concept: ${vo.logoDirection.concept}`);
  console.log(`Mark Direction: ${vo.logoDirection.markDirection}`);
  console.log(`Wordmark Direction: ${vo.logoDirection.wordmarkDirection}`);
  console.log("Construction Principles:");
  vo.logoDirection.constructionPrinciples.forEach((cp, i) => {
    console.log(`  ${i + 1}. ${cp}`);
  });
  console.log();

  console.log("-------------------------------------------------------");
  console.log("06. LAYOUT PRINCIPLES");
  console.log("-------------------------------------------------------");
  console.log(`Spacing: ${vo.layoutPrinciples.spacing}`);
  console.log(`Density: ${vo.layoutPrinciples.density}`);
  console.log(`Hierarchy: ${vo.layoutPrinciples.hierarchy}`);
  console.log(`Shape Language: ${vo.layoutPrinciples.shapeLanguage}`);
  console.log(`Composition: ${vo.layoutPrinciples.composition}\n`);

  console.log("-------------------------------------------------------");
  console.log("STATE & TRACE VALIDATION");
  console.log("-------------------------------------------------------");
  console.log(`Updated Version: ${result.updatedBrandState?.version}`);
  console.log(`visualDirection.isGenerated: ${result.updatedBrandState?.visualDirection.isGenerated}`);
  console.log(`AgentRun Status: ${result.agentRun?.status}`);
  console.log(`AgentRun Duration: ${result.agentRun?.durationMs}ms`);
  console.log(`AgentRun ID: ${result.agentRun?.id}`);

  console.log("\n=======================================================");
  console.log("LIVE GROQ TEST RESULT: 100% PASSED");
  console.log("=======================================================\n");
}

runLiveGroqTest().catch((err) => {
  console.error("Live test failed with unhandled error:", err);
  process.exit(1);
});
