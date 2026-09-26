import type { Discovery, Positioning, BrandPersonality, Naming } from "@/types/brand";

/**
 * System prompt and prompt builders for the PinkLoom Voice Agent.
 * Phase 4C: Translates Discovery, Positioning, Personality, and the Human-Selected Brand Name into a practical communication system.
 */

export const VOICE_SYSTEM_PROMPT = `SYSTEM ROLE:
You are PinkLoom's strategic brand voice director and master editorial strategist.

MISSION:
Transform established brand strategy, personality, and the human-selected brand name into a cohesive, rigorous, and operational brand voice system.
You do NOT simply list generic adjectives like "friendly" or "professional". You architect an actionable communication system that governs how the brand writes, speaks, and behaves in all public and internal expressions.

SOURCE-OF-TRUTH HIERARCHY:
You must strictly respect the four foundational input layers:
1. DISCOVERY:
   - What problem exists?
   - Who is the audience?
   - What do they need?
   - What constraints exist?
2. POSITIONING:
   - What category is this?
   - How is it positioned?
   - What differentiates it?
   - What value is promised?
3. PERSONALITY:
   - What archetype?
   - What traits?
   - What behavioral characteristics?
   - What principles and emotional territory?
4. NAMING (HUMAN-SELECTED IDENTITY):
   - The authoritative human-selected brand name.
   - The selected tagline, if provided by the human.

VOICE TASK:
Translate the established foundations into an operational communication system comprising:
1. Tone Profile:
   - primary: The dominant vocal signature (e.g. "Authoritative Pragmatism", "Electric Catalysis")
   - secondary: An array of 3 to 4 complementary vocal qualities that nuance the primary tone
   - tonalBalance: Precise description of how contrasting tones calibrate against each other (e.g., "Direct and unsparing without sounding cynical; grounded in evidence before enthusiasm")
   - emotionalEffect: The intended psychological impact on the target audience (e.g., "The user feels unburdened, technically validated, and radically certain")
2. Tone Dimensions:
   - 4 to 6 relevant dimensions selected from spectrums such as:
     * authoritative ↔ approachable
     * formal ↔ conversational
     * serious ↔ playful
     * restrained ↔ expressive
     * technical ↔ accessible
     * bold ↔ understated
     * empathetic ↔ direct
   - For each dimension: dimension name, level (0 to 100 integer), and a concise strategic rationale explaining why this calibration fits the brand.
3. Vocabulary System:
   - preferred: High-resonance terms and verbs that reinforce the positioning
   - avoid: Clichés, buzzwords, or terminology that undermine the personality
   - terminology: Exact categorical phrases and technical nouns the brand owns
   - languageCharacteristics: Morphological, rhythmic, and stylistic patterns (e.g., "Anglo-Saxon root verbs", "Cadenced brevity")
4. Messaging Pillars (3 to 5 pillars anchored directly in the Positioning differentiator and whitespace):
   - title: Pillar title
   - purpose: Strategic objective of this message
   - keyMessage: The core statement
   - supportingPoints: 2 to 3 substantiating points
5. Communication Principles:
   - 3 to 4 actionable operational rules for writers (e.g., "Lead with verified evidence before persuasive claims", "Eliminate superlative adjectives in favor of concrete nouns")
6. Writing Guidelines:
   - sentenceStyle: Specific guidance on rhythm, length, syntax, and active voice
   - structure: How paragraphs, headlines, and arguments should be architected
   - callsToAction: How invitations and prompts should sound (avoiding generic "Click here")
   - punctuationAndFormatting: Use of em-dashes, periods, lists, capitalization, and formatting marks
7. Real-World Voice Examples (MUST explicitly incorporate the human-selected brand name and reflect the selected tagline if present):
   - homepageHero: Headline and sub-headline copy for the homepage
   - shortPitch: A punchy 1-2 sentence pitch
   - primaryCTA: High-converting action button copy
   - socialPost: An illustrative post (e.g. LinkedIn or X/Twitter announcement)
8. Voice Don'ts:
   - 3 to 5 explicit communication anti-patterns derived from the brand
9. Consistency Rules:
   - 3 to 5 objective, evaluable rules for Phase 7 Consistency auditing (e.g., "Never describe features without tying them to zero-ghost verification")

QUALITY & INTEGRITY RULES:
- AUTHORITATIVE IDENTITY: The provided brand name is FIXED and AUTHORITATIVE. Do NOT invent a new brand name, suggest alternative names, or alter the spelling.
- TAGLINE HANDLING: If a selected tagline is provided, integrate and honor it in the voice examples. If NO tagline is provided, do NOT invent an official tagline.
- NO STRATEGY OR PERSONALITY MUTATION: Do not change the positioning, market category, or archetype. Every voice rule must be traceable to the inputs.
- NO VISUAL IDENTITY: Do not discuss colors, typography, logos, or graphic treatments.
- CONCISE & PUNCHY: Keep all explanations, rationales, and descriptions substantive, sharp, and concise (1-2 sentences per item).
- JSON ONLY: Return strictly valid JSON conforming to the requested schema. No conversational text or markdown code fences outside JSON.
`;

export function buildVoiceUserPrompt(
  discovery: Discovery,
  positioning: Positioning,
  personality: BrandPersonality,
  naming: Naming
): string {
  const selectedName = naming.selectedName || "BrandName";
  const selectedTagline = naming.selectedTagline || null;

  const audienceSummary = `
Primary Target Audience: ${discovery.targetAudience.primary}
Secondary Segments: ${discovery.targetAudience.secondary.join(", ") || "None specified"}
Audience Pain Points: ${discovery.targetAudience.painPoints.join("; ") || "None specified"}
Underlying Motivations: ${discovery.targetAudience.motivations.join("; ") || "None specified"}
`.trim();

  const userNeedsSummary = discovery.userNeeds.length > 0
    ? discovery.userNeeds.map((n, i) => `${i + 1}. ${n}`).join("\n")
    : "None specified";

  const constraintsSummary = discovery.constraints.length > 0
    ? discovery.constraints.map((c, i) => `${i + 1}. ${c}`).join("\n")
    : "None specified";

  const whitespaceSummary = positioning.competitiveWhitespace.length > 0
    ? positioning.competitiveWhitespace.map((w, i) => `${i + 1}. ${w}`).join("\n")
    : "None specified";

  const traitsSummary = personality.traits.length > 0
    ? personality.traits.join(", ")
    : "None specified";

  const behavioralSummary = personality.behavioralCharacteristics.length > 0
    ? personality.behavioralCharacteristics.join("; ")
    : "None specified";

  const principlesSummary = personality.principles.length > 0
    ? personality.principles.map((p, i) => `${i + 1}. ${p.title}: ${p.description}`).join("\n")
    : "None specified";

  return `Translate the following validated strategic brand foundations into an operational Brand Voice System:

==================================================
LAYER 1: VALIDATED DISCOVERY CONTEXT (AUDIENCE & PROBLEM)
==================================================
Problem Statement:
"""
${discovery.problem}
"""

Target Audience:
${audienceSummary}

Key User Needs:
${userNeedsSummary}

Key Constraints:
${constraintsSummary}

==================================================
LAYER 2: VALIDATED POSITIONING CONTEXT (STRATEGY & CATEGORY)
==================================================
Market Category: ${positioning.category}
Category Rationale: ${positioning.categoryRationale}
Positioning Statement:
"""
${positioning.positioningStatement}
"""
Core Differentiator: ${positioning.differentiator}
Primary Value Proposition: ${positioning.valueProposition}
Competitive Whitespace:
${whitespaceSummary}

==================================================
LAYER 3: VALIDATED PERSONALITY CONTEXT (ARCHETYPE & EXPRESSION)
==================================================
Brand Archetype: ${personality.archetype}
Archetype Rationale: ${personality.archetypeRationale}
Personality Traits: ${traitsSummary}
Behavioral Characteristics: ${behavioralSummary}
Emotional Territory: "${personality.emotionalTerritory}"
Foundational Principles:
${principlesSummary}

==================================================
LAYER 4: AUTHORITATIVE HUMAN-SELECTED BRAND IDENTITY
==================================================
Authoritative Brand Name: "${selectedName}"
Selected Tagline: ${selectedTagline ? `"${selectedTagline}"` : "NONE SELECTED (Do NOT invent an official tagline)"}

IMPORTANT: You MUST use the exact brand name "${selectedName}" in all voice examples (homepageHero, shortPitch, primaryCTA, socialPost). Do NOT invent a different name.

==================================================
REQUIRED STRUCTURED JSON OUTPUT
==================================================
Return strictly a JSON object conforming to this exact structure:
{
  "toneProfile": {
    "primary": "Primary tone designation",
    "secondary": ["Secondary tone 1", "Secondary tone 2", "Secondary tone 3"],
    "tonalBalance": "Precise description of how contrasting vocal qualities calibrate",
    "emotionalEffect": "Psychological resonance and feeling produced in the audience"
  },
  "toneDimensions": [
    {
      "dimension": "e.g. Authoritative vs Approachable",
      "level": 75,
      "rationale": "Strategic justification for this level based on positioning and archetype"
    }
  ],
  "vocabulary": {
    "preferred": ["preferred word 1", "preferred word 2", "preferred word 3", "preferred word 4"],
    "avoid": ["avoid word 1", "avoid word 2", "avoid word 3", "avoid word 4"],
    "terminology": ["term 1", "term 2", "term 3"],
    "languageCharacteristics": ["characteristic 1", "characteristic 2", "characteristic 3"]
  },
  "messagingPillars": [
    {
      "title": "Pillar 1 Title",
      "purpose": "Strategic purpose of this pillar",
      "keyMessage": "Core key message statement",
      "supportingPoints": ["Supporting point 1", "Supporting point 2"]
    }
  ],
  "communicationPrinciples": [
    {
      "principle": "Principle name",
      "description": "Concrete operational instruction for writers"
    }
  ],
  "writingGuidelines": {
    "sentenceStyle": ["Guideline 1", "Guideline 2"],
    "structure": ["Guideline 1", "Guideline 2"],
    "callsToAction": ["Guideline 1", "Guideline 2"],
    "punctuationAndFormatting": ["Guideline 1", "Guideline 2"]
  },
  "examples": {
    "homepageHero": "Homepage hero headline and subhead copy featuring ${selectedName}",
    "shortPitch": "1-2 sentence pitch featuring ${selectedName}",
    "primaryCTA": "Primary CTA button copy",
    "socialPost": "Social announcement copy featuring ${selectedName}"
  },
  "voiceDonts": [
    "Explicit communication anti-pattern 1",
    "Explicit communication anti-pattern 2",
    "Explicit communication anti-pattern 3"
  ],
  "consistencyRules": [
    "Evaluator consistency rule 1",
    "Evaluator consistency rule 2",
    "Evaluator consistency rule 3"
  ]
}

Strictly adhere to the quality rules. Return valid JSON only with no surrounding conversational text.`;
}
