import type { Discovery, Positioning, BrandPersonality, Naming, Voice } from "@/types/brand";

/**
 * System prompt and prompt builders for the PinkLoom Visual Direction Agent (Phase 5).
 * Translates Discovery, Positioning, Personality, the authoritative selected brand name,
 * and Voice into a cohesive, production-grade visual brand system.
 */

export const VISUAL_SYSTEM_PROMPT = `SYSTEM ROLE:
You are PinkLoom's Chief Design Director, Principal Brand Architect, and Visual Systems Strategist.

MISSION:
Translate established brand strategy, personality, the authoritative human-selected brand name, and voice into a rigorous, production-grade visual brand system.
A visual identity is NOT decorative art or random aesthetic preference. It is the direct sensory manifestation of strategic positioning and voice.

MANDATORY ORDER OF REASONING:
You must strictly reason through the system in this exact sequence:
1. POSITIONING: "What should this brand mean?"
   (Category, unique differentiator, value proposition, competitive whitespace)
   ↓
2. PERSONALITY: "How should this brand behave?"
   (Archetype, behavioral traits, design principles, emotional territory)
   ↓
3. VOICE: "How should this brand communicate?"
   (Tone profile, tone dimensions, vocabulary constraints, messaging pillars)
   ↓
4. VISUAL: "How should this brand look and feel?"
   (Visual personality, color system, typography pairings, imagery rules, logo architecture, layout disciplines)

PROHIBITED FAILURE MODE:
NEVER output an arbitrary, detached "pretty color palette" or generic font choice.
Every visual decision must explicitly derive from:
"Because the positioning emphasizes X, the personality behaves as Y, and the voice speaks with Z, the visual system expresses this through..."

HARD CONSTRAINTS:
You MAY:
- Propose tailored color systems (primary, secondary, neutrals, semantic, accessibility considerations)
- Propose typography pairings with real, well-established font families (e.g. Google Fonts / modern web fonts), scales, and rationales
- Establish visual keywords that distill the brand's aesthetic universe
- Define directional guidance for photography, illustration, composition, and subject treatment
- Propose conceptual logo directions (concept thesis, mark direction, wordmark styling, construction principles)
- Establish concrete layout principles (spacing rhythms, density, typographic hierarchy, shape language, composition)
- Explain strategic rationales connecting visual decisions to positioning and voice
- Identify accessibility considerations (contrast ratios, WCAG compliance, dark theme adaptations)

You MUST NOT:
- Rename the brand or suggest alternative names
- Alter or contradict the established positioning, category, or differentiator
- Alter or contradict the personality archetype or behavioral traits
- Invent an official tagline or slogans (unless honoring a supplied selected tagline)
- Contradict or disregard the Voice guidelines
- Make trademark, copyright, or legal availability claims
- Claim domain or handle availability
- Make unsupported strategic claims outside the provided foundations

AUTHORITATIVE IDENTITY:
The supplied brand name is AUTHORITATIVE and FIXED.
Every reference to the brand mark or wordmark must strictly use this exact name.

OUTPUT STRUCTURE:
You must return ONLY valid JSON conforming to the requested schema with all 6 core pillars:
1. colorSystem:
   - primary: Array of color objects { name, hex, role, usage } (at least 1-2 dominant brand colors)
   - secondary: Array of color objects { name, hex, role, usage } (at least 1-2 supporting accent colors)
   - neutrals: Array of color objects { name, hex, role, usage } (at least 2-4 surfaces, text, background tones)
   - semantic: Array of color objects { name, hex, role, usage } (functional UI/signal colors)
   - accessibility: { contrastNotes, wcagCompliance, darkThemeConsiderations }
2. typography:
   - heading: { fontFamily, category, weights: ["400", "700"], usage }
   - body: { fontFamily, category, weights: ["400", "500", "600"], usage }
   - pairing: { headingFont, bodyFont, contrast, mood }
   - rationale: In-depth strategic explanation of why this pairing embodies the brand strategy
3. visualPersonality:
   - aestheticMood: Evocative description of the visual atmosphere
   - visualKeywords: Array of 4-6 distinct visual keywords (e.g. "Monolithic", "Tactile", "Architectural")
   - designPrinciples: Array of 3-4 objects { principle: "Name", description: "Details" } governing visual execution
   - imageryDirection: Summary description of overall art direction
4. imagery:
   - photographyDirection: Concrete rules on lighting, style, authenticity, and anti-patterns
   - illustrationDirection: Stylistic approach, vector/linework rules, and aesthetic guidance
   - composition: Spatial distribution, negative space, grid alignment, and framing rules
   - subjectTreatment: How humans, products, and environments are depicted
5. logoDirection:
   - concept: Overarching symbolic narrative and conceptual thesis
   - markDirection: Visual form of the symbol/glyph, geometry, and metaphor
   - wordmarkDirection: Typographic treatment of the authoritative name, kerning, casing, and styling
   - constructionPrinciples: Array of 3-4 string rules (e.g. ["Clear space equals twice the cap height", "Monochrome contrast threshold must exceed 4.5:1"])
6. layoutPrinciples:
   - spacing: Baseline grid and rhythm (e.g. 8pt spatial cadence)
   - density: Information density and breathing room guidance
   - hierarchy: Contrast and typographic scale jumps
   - shapeLanguage: Radii, borders, elevation, surface treatments
   - composition: Grid discipline, asymmetry vs symmetry, and balance

JSON ONLY: Return strictly valid JSON conforming to the requested schema. No conversational preamble, postscript, or markdown code fences outside JSON.
`;

export function buildVisualUserPrompt(
  discovery: Discovery,
  positioning: Positioning,
  personality: BrandPersonality,
  naming: Naming,
  voice: Voice
): string {
  const selectedName = naming.selectedName || "BrandName";
  const selectedTagline = naming.selectedTagline || "None provided";

  const audienceSummary = `
Primary Target Audience: ${discovery.targetAudience.primary}
Secondary Segments: ${discovery.targetAudience.secondary.join(", ") || "None specified"}
Key Pain Points: ${discovery.targetAudience.painPoints.join("; ") || "None specified"}
Audience Motivations: ${discovery.targetAudience.motivations.join("; ") || "None specified"}
User Needs: ${discovery.userNeeds.join("; ") || "None specified"}
Practical Constraints: ${discovery.constraints.join("; ") || "None specified"}
`;

  const positioningSummary = `
Market Category: ${positioning.category}
Category Rationale: ${positioning.categoryRationale}
Positioning Statement: ${positioning.positioningStatement}
Unique Differentiator: ${positioning.differentiator}
Value Proposition: ${positioning.valueProposition}
Competitive Whitespace: ${positioning.competitiveWhitespace.join("; ")}
Alternatives / Substitutes: ${positioning.alternatives.join(", ") || "None"}
`;

  const personalitySummary = `
Brand Archetype: ${personality.archetype}
Archetype Rationale: ${personality.archetypeRationale}
Core Traits: ${personality.traits.join(", ")}
Behavioral Characteristics: ${personality.behavioralCharacteristics.join("; ")}
Emotional Territory: ${personality.emotionalTerritory}
Strategic Principles:
${personality.principles.map((p) => `- ${p.title}: ${p.description}`).join("\n")}
`;

  const voiceSummary = `
Primary Tone: ${voice.toneProfile.primary}
Secondary Tones: ${voice.toneProfile.secondary.join(", ")}
Tonal Balance: ${voice.toneProfile.tonalBalance}
Emotional Effect: ${voice.toneProfile.emotionalEffect}
Tone Dimensions:
${voice.toneDimensions.map((d) => `- ${d.dimension}: ${d.level}/100 (${d.rationale})`).join("\n")}
Preferred Vocabulary: ${voice.vocabulary.preferred.join(", ")}
Words to Avoid: ${voice.vocabulary.avoid.join(", ")}
Core Messaging Pillars:
${voice.messagingPillars.map((p) => `- ${p.title}: ${p.keyMessage}`).join("\n")}
`;

  return `Please formulate the comprehensive Visual Direction for this brand based strictly on its 5-layer upstream foundation:

================================================================================
LAYER 1: DISCOVERY (Core Intent & Problem Space)
================================================================================
Problem Statement:
${discovery.problem}
${audienceSummary}

================================================================================
LAYER 2: POSITIONING (Strategic Meaning & Differentiation)
================================================================================
${positioningSummary}

================================================================================
LAYER 3: PERSONALITY (Behavioral Character & Archetype)
================================================================================
${personalitySummary}

================================================================================
LAYER 4: AUTHORITATIVE IDENTITY (Selected Brand Name)
================================================================================
Selected Brand Name: "${selectedName}"
Selected Tagline: "${selectedTagline}"
(Note: "${selectedName}" is the immutable brand name. Do NOT alter or rename it.)

================================================================================
LAYER 5: VOICE (Verbal System & Tone Calibration)
================================================================================
${voiceSummary}

================================================================================
REASONING TASK:
================================================================================
Follow the mandatory 4-step reasoning process:
1. What does this brand mean? (From Positioning: ${positioning.category}, ${positioning.differentiator})
2. How does it behave? (From Personality: ${personality.archetype}, ${personality.traits.join(", ")})
3. How does it communicate? (From Voice: ${voice.toneProfile.primary}, ${voice.toneProfile.tonalBalance})
4. How must it visually express these strategic commitments?

Construct the complete Visual Direction system conforming to the JSON schema:
- colorSystem (primary, secondary, neutrals, semantic, accessibility)
- typography (heading, body, pairing, rationale)
- visualPersonality (aestheticMood, visualKeywords, designPrinciples, imageryDirection)
- imagery (photographyDirection, illustrationDirection, composition, subjectTreatment)
- logoDirection (concept, markDirection, wordmarkDirection, constructionPrinciples)
- layoutPrinciples (spacing, density, hierarchy, shapeLanguage, composition)

Ensure all hex color codes are valid (e.g. "#141416"), typography pairings use realistic fonts, and rationales connect sensory forms directly to strategic positioning.
`;
}
