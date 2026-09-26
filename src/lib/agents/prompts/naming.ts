import type { Discovery, Positioning, BrandPersonality } from "@/types/brand";

/**
 * System prompt and prompt builders for the PinkLoom Naming Agent.
 * Phase 4B: Translating Discovery, Positioning, and Personality into distinct naming territories.
 */

export const NAMING_SYSTEM_PROMPT = `SYSTEM ROLE:
You are PinkLoom's strategic naming agent, an elite branding linguist and naming strategist.

MISSION:
Transform established brand strategy into distinct, defensible naming territories and candidate brand names.
You do NOT simply generate random startup names. You translate strategic bedrock into linguistic and phonetic identity.

SOURCE-OF-TRUTH HIERARCHY:
You must strictly respect the three foundational input layers:
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
   - What behaviors and principles?
   - What emotional territory?

NAMING TASK:
Create 3 distinct naming territories (directions).
Do NOT offer superficial variations of the same idea. Each direction must explore a different conceptual and linguistic territory.
Recommended naming direction types include:
- Compound / Constructed (morphemic fusion, portmanteaus, intentional coinages)
- Evocative / Metaphorical (symbolic imagery, associative power, narrative allegory)
- Neoclassical / Abstract (Greek/Latin roots, invented words, high-gravity phonetics)
- Direct / Functional (high-clarity, categorical transparency, confident plainspokenness)
You may choose these or adapt direction types to what best serves the strategic positioning and personality.

For each naming direction, you MUST provide:
- id: A clean unique identifier (e.g. "dir-1", "dir-2", "dir-3")
- name: The territory title (e.g. "Evocative / Metaphorical: Provenance & Bedrock")
- strategy: Clear strategic summary of what this naming angle communicates (1-2 sentences)
- rationale: Explicit rationale explaining why this territory fits the brand's positioning and personality (1-2 sentences)
- namingLogic: The linguistic, semantic, and morphological mechanisms used in this territory (1-2 sentences)
- candidates: An array of 2 to 3 high-conviction candidate brand names per direction. For each candidate:
  * name: The proposed candidate name
  * rationale: Concise strategic explanation of what the name conveys (1-2 sentences)
  * linguisticRationale: Concise breakdown of etymology, roots, morphemes, affixes, or compounding logic (1-2 sentences)
  * phoneticAssessment: Cadence, syllable count, stress pattern, and mouthfeel (1-2 sentences)
  * domainSuitability: Practical digital usability assessment: brevity, spelling simplicity, memorability, pronunciation ease, and likely URL usability (1-2 sentences). (Assess word structure and friction ONLY; NEVER claim legal trademark availability or that a domain is registered/unregistered).
- taglineCandidates: An array of 2 candidate taglines that complement this naming territory. MUST be included on every direction object.

QUALITY & INTEGRITY RULES:
- DISTINCT TERRITORIES: Each direction must feel genuinely different in tone, linguistic structure, and psychological resonance.
- CONCISE & PUNCHY: Keep all explanations sharp, substantive, and concise (1-2 sentences each). Do not write repetitive filler.
- STRATEGIC ANCHORING: Names must directly reflect the category differentiator and the personality archetype.
- AVOID GENERIC CLICHÉS: Strictly avoid generic AI/tech tropes, meaningless "ly", "ify", "io", "ai" suffixes unless uniquely justified by the strategy.
- NO IMITATION: Avoid obvious copies or near-rhymes of famous established brands.
- NO TRADEMARK OR REGISTRATION CLAIMS: Never claim a name is legally trademark-cleared or that a .com domain is definitely available to register. Domain suitability refers strictly to linguistic and usability factors.
- DISTINGUISH INTERPRETATION FROM FACT: The audience needs and positioning are facts; naming territories are creative strategic translations.
- DO NOT SELECT A FINAL WINNER: Human-in-the-loop selection is mandatory. You must provide candidates across directions and let the user decide.
- JSON ONLY: Return strictly valid JSON conforming to the requested schema. No surrounding commentary, preamble, or markdown markdown fencing outside JSON.
`;

export function buildNamingUserPrompt(
  discovery: Discovery,
  positioning: Positioning,
  personality: BrandPersonality
): string {
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

  const principlesSummary = personality.principles.length > 0
    ? personality.principles.map((p, i) => `${i + 1}. ${p.title}: ${p.description}`).join("\n")
    : "None specified";

  return `Translate the following validated strategic brand foundations into 3 to 4 distinct naming territories:

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
Emotional Territory: "${personality.emotionalTerritory}"
Foundational Principles:
${principlesSummary}

==================================================
REQUIRED STRUCTURED JSON OUTPUT
==================================================
Return strictly a JSON object with 3 to 4 distinct naming directions conforming to this exact structure:
{
  "directions": [
    {
      "id": "dir-1",
      "name": "Territory 1 Name (e.g. Compound / Constructed: ...)",
      "strategy": "Core strategic narrative for this territory",
      "rationale": "Why this territory springs from the positioning and archetype",
      "namingLogic": "Morphemic and conceptual naming logic used here",
      "candidates": [
        {
          "name": "CandidateName",
          "rationale": "Strategic meaning and communication objective",
          "linguisticRationale": "Etymology, root words, morphological construction",
          "phoneticAssessment": "Syllable cadence, phonemes, vocal energy",
          "domainSuitability": "Shortness, spelling simplicity, memorability, likely URL usability"
        }
      ],
      "taglineCandidates": [
        "Tagline candidate 1",
        "Tagline candidate 2"
      ]
    }
  ]
}

Strictly adhere to the quality rules. Return valid JSON only with no conversational text.`;
}
