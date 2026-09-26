import type {
  BrandState,
  Discovery,
  Positioning,
  BrandPersonality,
  Naming,
  Voice,
  VisualDirection,
  Critique,
} from "@/types/brand";

export const CONSISTENCY_SYSTEM_PROMPT = `
You are PinkLoom's Chief Systems Architect, Brand Integrity Auditor, and Structural Coherence Director.

CORE PURPOSE:
The Critic Agent asks: "What is wrong?"
You, the Consistency Agent, ask: "Does the complete brand system actually belong together?"

Your mission is to evaluate systemic cross-stage coherence. You assess whether strategy, personality, naming, voice, visual identity, and messaging form a unified, indivisible, mutually-reinforcing organism—or whether departments are pulling in conflicting directions.

INPUTS YOU EVALUATE:
The complete brand system across all foundational layers:
1. Discovery (Problem, Primary/Secondary Audience, Core Needs, Constraints)
2. Positioning (Category, Differentiator, Value Proposition, Statements, Proof Points)
3. Personality (Archetype, Behavioral Traits, Cultural Principles, Emotional Territory)
4. Naming (Authoritative Human-Selected Name & Tagline)
5. Voice (Tone Profile, Tone Dimensions, Vocabulary Rules, Messaging Pillars, Real-World Copy)
6. Visual Direction (Color System, Typography, Visual Mood, Imagery Direction, Logo Mark, Layout Principles)
7. Critique (Diagnostic Critic Findings & Identified Friction Points, when available)

SEVEN CONSISTENCY DIMENSIONS:
Evaluate each dimension with a status ("coherent" | "warning" | "inconsistent") and specific findings:

1. STRATEGIC CONSISTENCY:
   Problem ↔ Audience ↔ Category ↔ Positioning ↔ Differentiator ↔ Value Proposition
   Does the solution directly address the diagnosed problem? Does the category framing reinforce the differentiator?

2. AUDIENCE CONSISTENCY:
   Audience ↔ Positioning ↔ Personality ↔ Voice ↔ Messaging ↔ Visual
   Does every touchpoint respect the cognitive expectations, professional level, and emotional needs of the target audience?

3. PERSONALITY CONSISTENCY:
   Personality ↔ Name ↔ Voice ↔ Messaging ↔ Visual
   Do the visual geometry, verbal cadence, and brand demeanor genuinely express the declared psychological archetype?

4. NAMING CONSISTENCY:
   Selected Name ↔ Positioning ↔ Personality ↔ Audience ↔ Voice ↔ Visual
   Does the authoritative name harmonize with the market posture and archetype?
   CRITICAL: The human-selected name is IMMUTABLE. Never rename the brand. Evaluate fit; never propose replacements.

5. VOICE CONSISTENCY:
   Voice Definition ↔ Tone Dimensions ↔ Writing Guidelines ↔ Homepage Copy ↔ Social Copy
   Do the copy examples strictly uphold the tone profile and vocabulary constraints? Is there tonal drift?

6. VISUAL CONSISTENCY:
   Visual Direction ↔ Positioning ↔ Personality ↔ Voice
   Do the color palette, typography pairing, imagery guidelines, and layout rhythm visually materialize the brand's identity?

7. MESSAGING CONSISTENCY:
   Messaging Pillars ↔ Positioning ↔ Differentiator ↔ Value Proposition ↔ Voice
   Do core pillars substantiate the central value proposition? Are proof points concrete and aligned with claims?

CROSS-SYSTEM RELATIONSHIPS TO EXAMINE:
- Audience ↔ Positioning
- Positioning ↔ Differentiation
- Positioning ↔ Personality
- Personality ↔ Voice
- Name ↔ Personality
- Name ↔ Positioning
- Personality ↔ Visual
- Voice ↔ Messaging
- Visual ↔ Personality
- Messaging ↔ Positioning
- Claims ↔ Proof Points

CRITIC INTEGRATION:
When Critic findings are provided:
- Do NOT simply copy-paste Critic issues.
- Evaluate how Critic observations impact systemic cross-stage coherence (e.g. if Critic noted a formal voice issue, evaluate whether that conflicts with an irreverent personality or an informal student audience).
- Synthesize system-level consequences and ripple effects across multiple dimensions.

STRICT BEHAVIORAL CONSTRAINTS:
1. NO AUTOMATIC REWRITING OR RENAMING:
   - You are an evaluator and auditor, NOT an automated copy editor.
   - You MUST NOT automatically rewrite positioning statements, change personality traits, alter color palettes, or modify the brand name.
   - The selected brand name is human-authoritative and permanent.
2. GOOD-BRAND BEHAVIOR (FALSE-POSITIVE RESISTANCE):
   - If the brand system is harmonious, internally consistent, and well-integrated, celebrate it!
   - DO NOT fabricate contradictions and DO NOT invent false contradictions or force warnings to justify your output.
   - A coherent brand MUST receive readiness = "coherent", dimension statuses = "coherent", zero critical cross-system issues, and robust strengths.
3. NO ARBITRARY NUMERICAL SCORES:
   - Use strictly qualitative statuses: "coherent", "warning", "inconsistent".
   - Use readiness: "coherent", "mostly_coherent", "inconsistent".
4. EVIDENCE & ACTIONABLE RECOMMENDATIONS:
   - For every cross-system issue, cite verbatim evidence from the state, explain the structural friction, and recommend an architectural alignment path.

OUTPUT SCHEMA (STRICT JSON ONLY):
Return a single JSON object conforming to:
{
  "overallAssessment": "Comprehensive 3-5 sentence synthesis evaluating whether the brand system hangs together as a coherent whole.",
  "readiness": "coherent" | "mostly_coherent" | "inconsistent",
  "strategic": {
    "status": "coherent" | "warning" | "inconsistent",
    "findings": ["Array of 1-4 specific strategic coherence findings"]
  },
  "audience": {
    "status": "coherent" | "warning" | "inconsistent",
    "findings": ["Array of 1-4 specific audience alignment findings"]
  },
  "personality": {
    "status": "coherent" | "warning" | "inconsistent",
    "findings": ["Array of 1-4 specific personality cohesion findings"]
  },
  "naming": {
    "status": "coherent" | "warning" | "inconsistent",
    "findings": ["Array of 1-4 specific naming resonance findings"]
  },
  "voice": {
    "status": "coherent" | "warning" | "inconsistent",
    "findings": ["Array of 1-4 specific voice-to-guideline findings"]
  },
  "visual": {
    "status": "coherent" | "warning" | "inconsistent",
    "findings": ["Array of 1-4 specific visual-to-identity findings"]
  },
  "messaging": {
    "status": "coherent" | "warning" | "inconsistent",
    "findings": ["Array of 1-4 specific messaging-to-proof findings"]
  },
  "crossSystemIssues": [
    {
      "id": "cs-issue-1",
      "severity": "critical" | "high" | "medium" | "low",
      "relationship": "Personality ↔ Voice" | "Audience ↔ Visual" | "Positioning ↔ Differentiation" | ...,
      "evidence": "Exact verbatim quotes or attributes showing the clash",
      "explanation": "Why this cross-system friction damages brand integrity",
      "recommendation": "How the human strategist should align the two stages"
    }
  ],
  "strengths": [
    "Array of 2-5 cross-system synergies where multiple stages reinforce each other exceptionally"
  ],
  "warnings": [
    "Array of 0-4 advisory observations on potential divergence points"
  ]
}
`.trim();

/**
 * Defensive stringification helper for diverse attribute shapes.
 */
function safeList(val: unknown): string {
  if (!val) return "None specified";
  if (Array.isArray(val)) {
    if (val.length === 0) return "None specified";
    return val
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          if ("title" in item && "description" in item) return `${(item as { title: string }).title}: ${(item as { description: string }).description}`;
          if ("name" in item && "description" in item) return `${(item as { name: string }).name}: ${(item as { description: string }).description}`;
          if ("principle" in item) return `${(item as { principle: string }).principle}`;
          return JSON.stringify(item);
        }
        return String(item);
      })
      .join(", ");
  }
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

/**
 * Builds a comprehensive 7-layer user prompt for the Consistency Agent.
 */
export function buildConsistencyUserPrompt(state: BrandState): string {
  const d: Partial<Discovery> = state.discovery || {};
  const p: Partial<Positioning> = state.positioning || {};
  const pers: Partial<BrandPersonality> = state.personality || {};
  const n: Partial<Naming> = state.naming || {};
  const v: Partial<Voice> = state.voice || {};
  const vis: Partial<VisualDirection> = state.visualDirection || {};
  const c: Partial<Critique> = state.critique || {};

  const selectedName = n.selectedName || "Not yet selected";
  const selectedTagline = n.selectedTagline || "None selected";

  // Discovery
  const problem = d.problem || "None specified";
  const targetAudiencePrimary = d.targetAudience?.primary || "None specified";
  const targetAudienceSecondary = safeList(d.targetAudience?.secondary);
  const targetCharacteristics = safeList(d.targetAudience?.characteristics);
  const targetPainPoints = safeList(d.targetAudience?.painPoints);
  const userNeeds = safeList(d.userNeeds);
  const constraints = safeList(d.constraints);

  // Positioning
  const category = p.category || "None specified";
  const positioningStatement = p.positioningStatement || "None specified";
  const differentiator = p.differentiator || "None specified";
  const valueProposition = p.valueProposition || "None specified";
  const proofPoints = safeList(p.proofPoints);
  const competitiveWhitespace = safeList(p.competitiveWhitespace);

  // Personality
  const archetype = pers.archetype || "None specified";
  const archetypeRationale = pers.archetypeRationale || "None specified";
  const traits = safeList(pers.traits);
  const behavioralCharacteristics = safeList(pers.behavioralCharacteristics);
  const principles = safeList(pers.principles);
  const emotionalTerritory = pers.emotionalTerritory || "None specified";

  // Voice
  const primaryTone = v.toneProfile?.primary || "None specified";
  const secondaryTone = safeList(v.toneProfile?.secondary);
  const tonalBalance = v.toneProfile?.tonalBalance || "None specified";
  const emotionalEffect = v.toneProfile?.emotionalEffect || "None specified";
  const toneDimensions = v.toneDimensions
    ? v.toneDimensions.map((td) => `${td.dimension}: ${td.level}/100 (${td.rationale})`).join("; ")
    : "None specified";
  const preferredVocab = safeList(v.vocabulary?.preferred);
  const avoidVocab = safeList(v.vocabulary?.avoid);
  const messagingPillars = v.messagingPillars
    ? v.messagingPillars.map((mp) => `[${mp.title}] Key Message: "${mp.keyMessage}" (Purpose: ${mp.purpose})`).join(" | ")
    : "None specified";
  const copyHero = v.examples?.homepageHero || "None specified";
  const copyPitch = v.examples?.shortPitch || "None specified";
  const copyCTA = v.examples?.primaryCTA || "None specified";
  const copySocial = v.examples?.socialPost || "None specified";

  // Visual Direction
  const primaryColors = Array.isArray(vis.colorSystem?.primary)
    ? vis.colorSystem.primary.map((col) => `${col.name} (${col.hex}) - Role: ${col.role}`).join("; ")
    : vis.colorSystem?.primary && typeof vis.colorSystem.primary === "object"
    ? `${(vis.colorSystem.primary as unknown as { name?: string; hex?: string; role?: string }).name || "Primary"} (${(vis.colorSystem.primary as unknown as { hex?: string }).hex || ""})`
    : "None specified";
  const secondaryColors = Array.isArray(vis.colorSystem?.secondary)
    ? vis.colorSystem.secondary.map((col) => `${col.name} (${col.hex}) - Role: ${col.role}`).join("; ")
    : vis.colorSystem?.secondary && typeof vis.colorSystem.secondary === "object"
    ? `${(vis.colorSystem.secondary as unknown as { name?: string; hex?: string; role?: string }).name || "Secondary"} (${(vis.colorSystem.secondary as unknown as { hex?: string }).hex || ""})`
    : "None specified";
  const headingFont = vis.typography?.heading?.fontFamily
    ? `${vis.typography.heading.fontFamily} (${vis.typography.heading.category || "serif"}, Weights: ${safeList(vis.typography.heading.weights)})`
    : (vis.typography as unknown as Record<string, unknown>)?.headingFont
    ? typeof (vis.typography as unknown as Record<string, unknown>).headingFont === "object"
      ? `${((vis.typography as unknown as Record<string, unknown>).headingFont as { family?: string })?.family || "Heading Font"}`
      : String((vis.typography as unknown as Record<string, unknown>).headingFont)
    : "None specified";
  const bodyFont = vis.typography?.body?.fontFamily
    ? `${vis.typography.body.fontFamily} (${vis.typography.body.category || "sans-serif"}, Weights: ${safeList(vis.typography.body.weights)})`
    : (vis.typography as unknown as Record<string, unknown>)?.bodyFont
    ? typeof (vis.typography as unknown as Record<string, unknown>).bodyFont === "object"
      ? `${((vis.typography as unknown as Record<string, unknown>).bodyFont as { family?: string })?.family || "Body Font"}`
      : String((vis.typography as unknown as Record<string, unknown>).bodyFont)
    : "None specified";
  const typoRationale = vis.typography?.rationale || (vis.typography as unknown as { pairingRationale?: string })?.pairingRationale || vis.typography?.pairing?.mood || "None specified";
  const aestheticMood = vis.visualPersonality?.aestheticMood || "None specified";
  const visualKeywords = safeList(vis.visualPersonality?.visualKeywords);
  const visualDesignPrinciples = safeList(vis.visualPersonality?.designPrinciples);
  const photoDirection = vis.imagery?.photographyDirection || "None specified";
  const illustrationDirection = vis.imagery?.illustrationDirection || "None specified";
  const logoConcept = vis.logoDirection?.concept || "None specified";
  const logoMark = vis.logoDirection?.markDirection || "None specified";
  const layoutSpacing = vis.layoutPrinciples?.spacing || "None specified";
  const layoutHierarchy = vis.layoutPrinciples?.hierarchy || "None specified";

  // Critique (consumed if available)
  let critiqueSection = "Critic stage has not been executed yet. No preceding Critic findings were provided. Evaluate the 6 foundational layers directly.";
  if (c.isEvaluated && c.overallAssessment) {
    const criticIssuesFormatted = c.issues && c.issues.length > 0
      ? c.issues
          .map(
            (iss, idx) =>
              `${idx + 1}. [${iss.id}] [${iss.severity.toUpperCase()}] ${iss.category}: "${iss.evidence}" -> ${iss.explanation}`
          )
          .join("\n   ")
      : "None reported";

    const criticBlockingFormatted = c.blockingIssues && c.blockingIssues.length > 0
      ? c.blockingIssues
          .map((b, idx) => (typeof b === "string" ? `${idx + 1}. ${b}` : `${idx + 1}. [${b.id}] [${b.severity}] ${b.explanation}`))
          .join("\n   ")
      : "None reported";

    critiqueSection = `
Critic Assessment: "${c.overallAssessment}"
Critic Readiness: ${c.readiness?.toUpperCase()}
Identified Diagnostic Issues:
   ${criticIssuesFormatted}
Identified Blocking Issues:
   ${criticBlockingFormatted}
`.trim();
  }

  return `
AUDIT REQUEST: CROSS-SYSTEM BRAND CONSISTENCY EVALUATION

Inspect the complete brand system across all dimensions. Evaluate whether these components reinforce each other to form a cohesive, believable, unified brand identity.

================================================================================
1. DISCOVERY & AUDIENCE CONTEXT
================================================================================
- Core Problem Diagnosed: ${problem}
- Primary Target Audience: ${targetAudiencePrimary}
- Secondary Audiences: ${targetAudienceSecondary}
- Audience Psychographic Characteristics: ${targetCharacteristics}
- Urgent Pain Points: ${targetPainPoints}
- Functional & Emotional User Needs: ${userNeeds}
- Project & Market Constraints: ${constraints}

================================================================================
2. STRATEGIC POSITIONING
================================================================================
- Market Category: ${category}
- Positioning Statement: "${positioningStatement}"
- Unique Differentiator: "${differentiator}"
- Core Value Proposition: "${valueProposition}"
- Concrete Proof Points: ${proofPoints}
- Competitive Whitespace Claimed: ${competitiveWhitespace}

================================================================================
3. BRAND PERSONALITY & ARCHETYPE
================================================================================
- Declared Psychological Archetype: ${archetype}
- Archetype Strategic Rationale: ${archetypeRationale}
- Core Behavioral Traits: ${traits}
- Behavioral Characteristics: ${behavioralCharacteristics}
- Foundational Principles: ${principles}
- Emotional Territory Occupied: "${emotionalTerritory}"

================================================================================
4. AUTHORITATIVE BRAND NAME & TAGLINE
================================================================================
- Selected Brand Name: "${selectedName}" (IMMUTABLE — Human Authoritative)
- Selected Tagline: "${selectedTagline}"

================================================================================
5. VERBAL IDENTITY & VOICE SYSTEM
================================================================================
- Primary Tone: ${primaryTone}
- Secondary Tone Descriptors: ${secondaryTone}
- Tonal Balance Rationale: ${tonalBalance}
- Desired Emotional Impact: ${emotionalEffect}
- Tone Spectrum Levels (0-100): ${toneDimensions}
- Preferred High-Resonance Vocabulary: ${preferredVocab}
- Forbidden Vocabulary (Hype/Jargon): ${avoidVocab}
- Strategic Messaging Pillars: ${messagingPillars}
- Sample Hero Headline: "${copyHero}"
- Sample Elevator Pitch: "${copyPitch}"
- Primary Call to Action: "${copyCTA}"
- Social Media Voice Sample: "${copySocial}"

================================================================================
6. VISUAL DIRECTION SYSTEM
================================================================================
- Primary Color Palette: ${primaryColors}
- Secondary & Accent Colors: ${secondaryColors}
- Typography Heading Font: ${headingFont}
- Typography Body Font: ${bodyFont}
- Typographic Contrast & Pairing Rationale: ${typoRationale}
- Overall Visual Aesthetic Mood: "${aestheticMood}"
- Visual Keywords: ${visualKeywords}
- Visual Design Principles: ${visualDesignPrinciples}
- Photography Direction: ${photoDirection}
- Illustration Direction: ${illustrationDirection}
- Logomark Concept: "${logoConcept}"
- Wordmark & Mark Treatment: ${logoMark}
- Layout Rhythm & Spatial Spacing: ${layoutSpacing}
- Visual Hierarchy & Scale: ${layoutHierarchy}

================================================================================
7. UPSTREAM CRITIC FINDINGS (PHASE 6 CRITIQUE FINDINGS)
================================================================================
${critiqueSection}

================================================================================
CROSS-SYSTEM AUDIT INSTRUCTIONS
================================================================================
1. Evaluate Strategic, Audience, Personality, Naming, Voice, Visual, and Messaging dimensions.
2. Cross-examine the relationships (Audience ↔ Positioning, Positioning ↔ Differentiation, Positioning ↔ Personality, Personality ↔ Voice, Name ↔ Personality, Personality ↔ Visual, Voice ↔ Messaging, Visual ↔ Personality, Messaging ↔ Positioning, Claims ↔ Proof Points).
3. Do NOT rewrite the brand. Do NOT rename the brand.
4. If the system is cohesive, affirm strengths and output readiness = "coherent". Do not invent false inconsistencies.
5. Provide pure JSON conforming to the ConsistencyOutputSchema.
`.trim();
}
