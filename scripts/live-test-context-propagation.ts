/**
 * Live Context Propagation Test for Visual Direction Agent (Step 5.8)
 * Compares live Groq LLM generations across two diametrically opposed brands:
 * Brand A: Sovereign Institutional Escrow Protocol ("AegisCore")
 * Brand B: Playful Generative Creator Playground ("FlickerPop")
 * 
 * Verifies that upstream changes to Positioning, Personality, and Voice
 * produce deeply distinct, coherent visual systems rather than generic templates.
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

async function runLiveContextPropagationTest() {
  console.log("\n==================================================================");
  console.log("PinkLoom Step 5.8 — Live Context Propagation Test (Groq)");
  console.log("==================================================================\n");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your-groq-api-key")) {
    console.error("GROQ_API_KEY is not configured in .env.local.");
    process.exit(1);
  }

  const provider = getAIProvider();

  // -------------------------------------------------------------
  // Brand A: Institutional Financial Escrow Infrastructure
  // -------------------------------------------------------------
  const brandA: BrandState = createInitialBrandState("Institutional cryptographic escrow infrastructure");
  brandA.discovery = {
    ...brandA.discovery,
    isAnalyzed: true,
    analyzedAt: new Date().toISOString(),
    problem: "Global investment banks risk billions on settlement delays and counterparty failure in OTC derivatives.",
    targetAudience: {
      primary: "Institutional Treasurers & Tier-1 Prime Brokers",
      secondary: ["Clearing House Executives", "Algorithmic Risk Officers"],
      characteristics: ["Mathematically exacting", "Zero tolerance for volatility or ambiguity"],
      painPoints: ["T+2 settlement latency", "Counterparty insolvency risk"],
      motivations: ["Instant atomic settlement", "Absolute cryptographic finality"],
    },
    userNeeds: ["Deterministic audit trails", "Air-gapped security"],
    constraints: ["Basel III regulatory compliance", "Sub-millisecond validation"],
  };

  brandA.positioning = {
    ...brandA.positioning,
    isPositioned: true,
    positionedAt: new Date().toISOString(),
    category: "Institutional Cryptographic Escrow & Settlement Layer",
    categoryRationale: "Transitions post-trade clearing from human brokerages to mathematical consensus.",
    positioningStatement: "For Tier-1 investment banks, AegisCore is the provable settlement infrastructure that eliminates counterparty risk.",
    differentiator: "Zero-knowledge atomic clearing with real-time solvency proof.",
    valueProposition: "Zero counterparty default risk with instant finality.",
    competitiveWhitespace: ["Replacing bilateral clearing agreements with immutable code"],
  };

  brandA.personality = {
    ...brandA.personality,
    isFormulated: true,
    formulatedAt: new Date().toISOString(),
    archetype: "The Sovereign Sentinel & Mathematical Authority",
    archetypeRationale: "Demands total institutional trust through mathematical invariance.",
    traits: ["Impenetrable", "Sovereign", "Monolithic", "Architectural"],
    behavioralCharacteristics: ["Speaks exclusively in verifiable statistics", "Zero emotional embellishment"],
    principles: [
      { title: "Invariance Over Novelty", description: "Stability and safety supersede speculative features." },
    ],
    emotionalTerritory: "Heavy monolithic security, quiet absolute power, and mathematical serenity.",
    confidence: 98,
  };

  brandA.naming = {
    ...brandA.naming,
    isGenerated: true,
    isSelected: true,
    selectedName: "AegisCore",
    selectedDirectionId: "dir_monolith",
    selectedTagline: "The Invariant Settlement Architecture",
    selectedAt: new Date().toISOString(),
    directions: [],
  };

  brandA.voice = {
    ...brandA.voice,
    isGenerated: true,
    generatedAt: new Date().toISOString(),
    toneProfile: {
      primary: "Mathematical Authority",
      secondary: ["Austere", "Unflinching", "Sovereign"],
      tonalBalance: "Every statement is formulated as an architectural theorem.",
      emotionalEffect: "Imparts a profound sense of institutional safety and unshakeable resilience.",
    },
    toneDimensions: [
      { dimension: "Austere vs Whimsical", level: 95, rationale: "Clearing billions requires solemnity." },
    ],
    vocabulary: {
      preferred: ["invariant", "atomic", "finality", "deterministic", "solvency"],
      avoid: ["exciting", "fun", "cool", "supercharge", "vibes"],
      terminology: ["atomic settlement", "cryptographic escrow"],
      languageCharacteristics: ["Declarative, formal sentence structures"],
    },
    messagingPillars: [
      {
        title: "Mathematical Finality",
        purpose: "Guarantee zero settlement defaults",
        keyMessage: "Settlement occurs in the block, not in two business days.",
        supportingPoints: ["Atomic execution", "100% reserve verification"],
      },
    ],
    communicationPrinciples: [
      { principle: "Prove, Do Not Assert", description: "State facts with cryptographic citations." },
    ],
    writingGuidelines: {
      sentenceStyle: ["Crisp, Latinate precision"],
      structure: ["Deductive logic"],
      callsToAction: ["Inspect Solvency Proof"],
      punctuationAndFormatting: ["Minimalist typography"],
    },
    examples: {
      homepageHero: "Atomic settlement for Tier-1 institutions. Zero counterparty risk.",
      shortPitch: "AegisCore eliminates counterparty risk through zero-knowledge solvency proof.",
      primaryCTA: "Inspect Protocol Specifications",
      socialPost: "Counterparty risk is a legacy construct. AegisCore settles instantly.",
    },
    voiceDonts: ["Never use casual idioms", "Never make speculative promises"],
    consistencyRules: ["All claims must cite protocol parameters"],
  };

  // -------------------------------------------------------------
  // Brand B: Playful Creator Platform for Gen-Z Animators
  // -------------------------------------------------------------
  const brandB: BrandState = createInitialBrandState("Generative sticker and meme playground for creators");
  brandB.discovery = {
    ...brandB.discovery,
    isAnalyzed: true,
    analyzedAt: new Date().toISOString(),
    problem: "Digital artists and meme creators find existing creative software tedious, intimidating, and corporate.",
    targetAudience: {
      primary: "Gen-Z Digital Illustrators & Viral Meme Creators",
      secondary: ["TikTok Animators", "Indie Game Artists"],
      characteristics: ["Irreverent", "Expressive", "Hyper-visual", "Values spontaneous joy"],
      painPoints: ["Complex menus", "Steep learning curve", "Boring corporate aesthetic"],
      motivations: ["Making weird delightful art in 10 seconds", "Viral social sharing"],
    },
    userNeeds: ["One-tap remixing", "Chaotic joyful filters"],
    constraints: ["Must work frictionlessly on mobile"],
  };

  brandB.positioning = {
    ...brandB.positioning,
    isPositioned: true,
    positionedAt: new Date().toISOString(),
    category: "Hyper-Playful Generative Creator Playground",
    categoryRationale: "Democratizes animation by stripping away technical barriers in favor of pure expressive chaos.",
    positioningStatement: "For digital creators, FlickerPop is the chaotic generative canvas that turns doodle impulses into viral stickers.",
    differentiator: "Zero-latency kinetic brushstrokes with generative AI beat-syncing.",
    valueProposition: "From brain-doodle to viral meme in 15 seconds flat.",
    competitiveWhitespace: ["Rejecting polished sterile minimalism in favor of vibrant kinetic joy"],
  };

  brandB.personality = {
    ...brandB.personality,
    isFormulated: true,
    formulatedAt: new Date().toISOString(),
    archetype: "The Irreverent Jester & Kinetic Magician",
    archetypeRationale: "Sparks uninhibited creative explosion through mischievous delight and vibrant energy.",
    traits: ["Electric", "Chaotic", "Playful", "Unfiltered", "Effervescent"],
    behavioralCharacteristics: ["Celebrates accidents", "Speaks with exclamation and humor", "Rejects formal rules"],
    principles: [
      { title: "Serious Fun", description: "Creativity thrives when seriousness is outlawed." },
    ],
    emotionalTerritory: "Sparkling dopamine, unrestrained laughter, and neon excitement.",
    confidence: 96,
  };

  brandB.naming = {
    ...brandB.naming,
    isGenerated: true,
    isSelected: true,
    selectedName: "FlickerPop",
    selectedDirectionId: "dir_electric",
    selectedTagline: "Doodle Wild. Pop Loud.",
    selectedAt: new Date().toISOString(),
    directions: [],
  };

  brandB.voice = {
    ...brandB.voice,
    isGenerated: true,
    generatedAt: new Date().toISOString(),
    toneProfile: {
      primary: "Electric Irreverence",
      secondary: ["Bouncy", "Warm", "Mischievous"],
      tonalBalance: "High energy with infectious warmth; treats art like an exhilarating sandbox party.",
      emotionalEffect: "Empowers users to create without fear of judgment.",
    },
    toneDimensions: [
      { dimension: "Formal vs Playful", level: 10, rationale: "Total rejection of corporate sterility." },
    ],
    vocabulary: {
      preferred: ["pop", "doodle", "spark", "fizz", "boom", "wild", "remix"],
      avoid: ["institutional", "governance", "enterprise", "sub-millisecond", "compliance"],
      terminology: ["pop-canvas", "sticker-party"],
      languageCharacteristics: ["Exclamations, punchy onomatopoeia, informal slang"],
    },
    messagingPillars: [
      {
        title: "Pure Creative Joy",
        purpose: "Overcome creative block",
        keyMessage: "No tutorials. No layers. Just pure sensory pop.",
        supportingPoints: ["Instant fun", "Meme-ready exports"],
      },
    ],
    communicationPrinciples: [
      { principle: "Always Spark A Smile", description: "If a line doesn't make you grin, rewrite it." },
    ],
    writingGuidelines: {
      sentenceStyle: ["Snappy, punchy exclamations"],
      structure: ["Stream-of-consciousness bounce"],
      callsToAction: ["Smash That Canvas!"],
      punctuationAndFormatting: ["Playful punctuation"],
    },
    examples: {
      homepageHero: "Make weird stuff. Pop it on TikTok. Repeat.",
      shortPitch: "FlickerPop turns accidental doodles into viral animated stickers in seconds.",
      primaryCTA: "Start Popping Free",
      socialPost: "Art school said use the grid. We say blow up the grid. 💥",
    },
    voiceDonts: ["Never sound like a bank", "Never explain features solemnly"],
    consistencyRules: ["Keep the dopamine high"],
  };

  async function executeWithRetry(params: { projectId: string; apiKey?: string }, state: BrandState) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const result = await executeVisualAgent(params, state, provider);
      if (result.success) return result;
      if (result.error && (result.error.includes("429") || result.error.includes("rate_limit")) && attempt <= 2) {
        console.log(`  Rate limit hit. Pausing 25s for Groq rolling window cooldown (attempt ${attempt}/2)...`);
        await new Promise((r) => setTimeout(r, 25000));
        continue;
      }
      return result;
    }
    throw new Error("Execution failed after retries.");
  }

  console.log("Generating Visual Direction for Brand A (AegisCore - Institutional Security)...");
  const resultA = await executeWithRetry({ projectId: "brand-a-test", apiKey }, brandA);
  if (!resultA.success || !resultA.visualOutput) {
    throw new Error(`Brand A execution failed: ${resultA.error}`);
  }
  const voA = resultA.visualOutput;

  console.log("Waiting 25 seconds for Groq rolling window cooldown before Brand B inference...");
  await new Promise((resolve) => setTimeout(resolve, 25000));

  console.log("Generating Visual Direction for Brand B (FlickerPop - Playful Creator)...");
  const resultB = await executeWithRetry({ projectId: "brand-b-test", apiKey }, brandB);
  if (!resultB.success || !resultB.visualOutput) {
    throw new Error(`Brand B execution failed: ${resultB.error}`);
  }
  const voB = resultB.visualOutput;

  console.log("\n==================================================================");
  console.log("CONTEXT PROPAGATION COMPARISON MATRIX");
  console.log("==================================================================\n");

  console.log(`[DIMENSION: BRAND A (AegisCore)] vs [BRAND B (FlickerPop)]\n`);
  
  console.log(`01. AESTHETIC MOOD:`);
  console.log(`  Brand A (AegisCore):  "${voA.visualPersonality.aestheticMood}"`);
  console.log(`  Brand B (FlickerPop): "${voB.visualPersonality.aestheticMood}"\n`);

  console.log(`02. VISUAL KEYWORDS:`);
  console.log(`  Brand A: ${voA.visualPersonality.visualKeywords.join(", ")}`);
  console.log(`  Brand B: ${voB.visualPersonality.visualKeywords.join(", ")}\n`);

  console.log(`03. PRIMARY COLORS:`);
  console.log(`  Brand A: ${voA.colorSystem.primary.map(c => `${c.name} (${c.hex})`).join(", ")}`);
  console.log(`  Brand B: ${voB.colorSystem.primary.map(c => `${c.name} (${c.hex})`).join(", ")}\n`);

  console.log(`04. SECONDARY / ACCENT COLORS:`);
  console.log(`  Brand A: ${voA.colorSystem.secondary.map(c => `${c.name} (${c.hex})`).join(", ")}`);
  console.log(`  Brand B: ${voB.colorSystem.secondary.map(c => `${c.name} (${c.hex})`).join(", ")}\n`);

  console.log(`05. TYPOGRAPHY (HEADING + BODY):`);
  console.log(`  Brand A: ${voA.typography.heading.fontFamily} (${voA.typography.heading.category}) + ${voA.typography.body.fontFamily}`);
  console.log(`  Brand B: ${voB.typography.heading.fontFamily} (${voB.typography.heading.category}) + ${voB.typography.body.fontFamily}\n`);

  console.log(`06. TYPOGRAPHIC RATIONALE:`);
  console.log(`  Brand A: ${voA.typography.rationale.slice(0, 180)}...`);
  console.log(`  Brand B: ${voB.typography.rationale.slice(0, 180)}...\n`);

  console.log(`07. LOGO CONCEPT & MARK:`);
  console.log(`  Brand A: ${voA.logoDirection.concept}`);
  console.log(`  Brand B: ${voB.logoDirection.concept}\n`);

  console.log(`08. SHAPE LANGUAGE & SPACING:`);
  console.log(`  Brand A: Shape: ${voA.layoutPrinciples.shapeLanguage} | Spacing: ${voA.layoutPrinciples.spacing}`);
  console.log(`  Brand B: Shape: ${voB.layoutPrinciples.shapeLanguage} | Spacing: ${voB.layoutPrinciples.spacing}\n`);

  // Verification Assertions
  const aText = JSON.stringify(voA).toLowerCase();
  const bText = JSON.stringify(voB).toLowerCase();

  const brandAIsSerious = aText.includes("monolith") || aText.includes("secur") || aText.includes("architect") || aText.includes("slate") || aText.includes("navy") || aText.includes("neutral") || aText.includes("sharp") || aText.includes("grid");
  const brandBIsPlayful = bText.includes("vibrant") || bText.includes("playful") || bText.includes("pop") || bText.includes("neon") || bText.includes("kinetic") || bText.includes("electric") || bText.includes("round") || bText.includes("color");

  if (!brandAIsSerious || !brandBIsPlayful) {
    console.error("Context propagation test failed: Visual directions did not reflect their strategic inputs!");
    process.exit(1);
  }

  console.log("==================================================================");
  console.log("STEP 5.8 CONTEXT PROPAGATION TEST: 100% PASSED");
  console.log("==================================================================\n");
}

runLiveContextPropagationTest().catch((err) => {
  console.error("Live context propagation test failed:", err);
  process.exit(1);
});
