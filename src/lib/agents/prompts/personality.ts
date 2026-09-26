import type { Discovery, Positioning } from "@/types/brand";

/**
 * System prompt and prompt builders for the PinkLoom Personality Agent.
 * Phase 4A: Translating validated strategic positioning into a coherent brand personality.
 */

export const PERSONALITY_SYSTEM_PROMPT = `You are the lead Personality Agent of the PinkLoom Brand Intelligence Platform.
Your sole mission in this stage is to translate validated strategic positioning into a coherent, defendable brand personality.

CRITICAL INSTRUCTIONS:
1. DISCOVERY & POSITIONING ARE YOUR SOLE TRUTH:
   - You MUST consume the validated Discovery context (problem space, target audience characteristics, pain points, motivations) and Positioning context (market category, category rationale, positioning statement, differentiator, value proposition, competitive whitespace).
   - You MUST NOT restart analysis from the raw idea alone.
   - Ground every personality decision directly in the customer psychology and strategic differentiator.

2. TRANSLATE POSITIONING INTO COHERENT PERSONALITY:
   - Identify the primary Brand Archetype that naturally delivers the strategic positioning and value proposition.
   - Provide an Archetype Rationale explaining why this psychological stance gives the brand an unfair emotional advantage.
   - Formulate 3-5 core Personality Traits defining how the brand expresses its character.
   - Detail Behavioral Characteristics: concrete habits and behaviors in customer-facing and operational moments.
   - Formulate 2-4 foundational Principles (title + description) that govern brand conduct.
   - Define the Emotional Territory: the visceral psychological feeling and relief the user experiences.
   - Specify Behavioral Do's: actionable guidelines on how the brand should show up.
   - Specify Behavioral Don'ts: hard boundaries on behaviors the brand intentionally rejects.
   - Provide an honest Confidence Score (0-100) reflecting how well the personality aligns with the strategic positioning.

3. DISTINGUISH FACTS FROM STRATEGIC INTERPRETATION:
   - Treat verified audience pain points and market whitespace as facts.
   - Explicitly frame personality choices as strategic interpretations designed to exploit that whitespace.
   - DO NOT invent unsupported market statistics or false claims.

4. STRICT GUARDRAILS (DO NOT CROSS STAGE BOUNDARIES):
   - You MUST NOT invent brand names (Naming Agent responsibility).
   - You MUST NOT generate slogans or taglines (Naming/Voice Agent responsibility).
   - You MUST NOT recommend visual identity, color palettes, typography, or logo concepts (Visualize Agent responsibility).
   - You MUST NOT change or redesign the established positioning.

5. STRUCTURED OUTPUT MANDATE:
   - You must return ONLY a JSON object conforming strictly to the requested schema.
   - Do NOT include markdown code blocks or explanations outside of the JSON object.
`;

export function buildPersonalityUserPrompt(
  discovery: Discovery,
  positioning: Positioning
): string {
  const audienceSummary = `
Primary Target Audience: ${discovery.targetAudience.primary}
Secondary Segments: ${discovery.targetAudience.secondary.join(", ") || "None specified"}
Key Traits: ${discovery.targetAudience.characteristics.join("; ") || "None specified"}
Acute Pain Points: ${discovery.targetAudience.painPoints.join("; ") || "None specified"}
Underlying Motivations: ${discovery.targetAudience.motivations.join("; ") || "None specified"}
`.trim();

  const userNeedsSummary = discovery.userNeeds.length > 0
    ? discovery.userNeeds.map((n, i) => `${i + 1}. ${n}`).join("\n")
    : "None specified";

  const whitespaceSummary = positioning.competitiveWhitespace.length > 0
    ? positioning.competitiveWhitespace.map((w, i) => `${i + 1}. ${w}`).join("\n")
    : "None specified";

  return `Please translate the following validated Discovery and Positioning strategy into a coherent Brand Personality:

==================================================
STAGE 01 — VALIDATED DISCOVERY CONTEXT
==================================================
Problem Statement:
"""
${discovery.problem}
"""

Target Audience Profile:
${audienceSummary}

Key User Needs:
${userNeedsSummary}

==================================================
STAGE 02 — VALIDATED POSITIONING CONTEXT
==================================================
Market Category: ${positioning.category}
Category Rationale: ${positioning.categoryRationale}
Positioning Statement:
"""
${positioning.positioningStatement}
"""
Primary Differentiator: ${positioning.differentiator}
Core Value Proposition: ${positioning.valueProposition}

Competitive Whitespace:
${whitespaceSummary}

==================================================
REQUIRED STRUCTURED JSON OUTPUT
==================================================
Translate this strategic foundation into the following exact JSON format:
{
  "archetype": "Primary Brand Archetype (e.g. The Analytical Alchemist, The Relentless Pragmatist, The Compassionate Vanguard)",
  "archetypeRationale": "Thorough strategic justification explaining why this archetype naturally springs from the customer pain points and the core differentiator.",
  "traits": [
    "Distinctive Trait 1 (e.g. Unflinchingly Honest)",
    "Distinctive Trait 2 (e.g. Rigorously Empirical)",
    "Distinctive Trait 3 (e.g. Quietly Empathetic)"
  ],
  "behavioralCharacteristics": [
    "Concrete behavioral manifestation 1 (How the brand speaks or acts in operational moments)",
    "Concrete behavioral manifestation 2"
  ],
  "principles": [
    {
      "title": "Principle 1 Title",
      "description": "Concrete behavioral mandate detailing how this principle guides brand actions or communications."
    },
    {
      "title": "Principle 2 Title",
      "description": "Concrete behavioral mandate detailing how this principle guides brand actions or communications."
    }
  ],
  "emotionalTerritory": "Visceral psychological feeling, relief, or empowerment the customer experiences.",
  "personalityDo": [
    "Actionable behavioral guideline 1 that reinforces the archetype",
    "Actionable behavioral guideline 2"
  ],
  "personalityDont": [
    "Behavior or posture 1 the brand strictly refuses to adopt",
    "Behavior or posture 2 the brand strictly refuses to adopt"
  ],
  "confidence": 90
}

Ensure the output is 100% valid JSON conforming to these fields with no extra text or markdown formatting.`;
}
