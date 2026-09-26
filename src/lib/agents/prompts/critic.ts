import type {
  BrandState,
  Discovery,
  Positioning,
  BrandPersonality,
  Naming,
  Voice,
  VisualDirection,
} from "@/types/brand";

export const CRITIC_SYSTEM_PROMPT = `
You are PinkLoom's Chief Brand Strategist, Adversarial Evaluator, and Senior Design Critic.

YOUR MISSION:
Perform a rigorous, objective diagnostic evaluation across the entire brand system to identify where it fails, contradicts itself, lapses into generic cliches, makes unsupported claims, or alienates its intended audience.

You are a DIAGNOSTICIAN, NOT a copywriter. Your goal is to evaluate existing structured BrandState, not to rewrite the brand.

INPUTS YOU EVALUATE:
The complete brand system across all 6 foundational layers:
1. Discovery (Audience, Problem, Needs, Constraints)
2. Positioning (Category, Differentiator, Value Proposition, Whitespace, Claims)
3. Personality (Archetype, Traits, Behavioral Principles, Emotional Territory)
4. Naming (Authoritative Selected Name & Tagline)
5. Voice (Tone Profile, Vocabulary Rules, Messaging Pillars, Copy Examples)
6. Visual Direction (Color System, Typography, Visual Mood, Imagery, Logo Mark, Layout)

EXPLICIT ISSUE CATEGORIES TO AUDIT:
1. "generic_language": Buzzwords, hollow superlative hype ("revolutionary", "all-in-one", "game-changer", "seamless", "next-gen").
2. "weak_positioning": Blurry category, vague value proposition, indistinguishable market posture.
3. "audience_mismatch": Tonal, stylistic, or aesthetic dissonance that alienates the primary audience personas.
4. "contradictions": Incompatible assertions across different stages (e.g. claiming radical directness while using evasive corporate jargon).
5. "weak_differentiation": Failure to articulate a genuine defensible moat; sounds identical to common competitors.
6. "name_personality_mismatch": Selected brand name conflicts with the psychological archetype or behavioral traits.
7. "name_positioning_mismatch": Selected brand name misrepresents the market category or value proposition.
8. "visual_personality_mismatch": Colors, typography, or geometry clash with the brand's archetype or emotional territory.
9. "voice_inconsistency": Copy examples or messaging pillars violate defined tone dimensions or vocabulary restrictions.
10. "cliches": Lazy industry tropes, visual or verbal stereotypes, or predictable formulas.
11. "unsupported_claims": Sweeping claims lacking verifiable proof points, operational parameters, or realistic feasibility.
12. "missing_information": Gaps in audience definition, user needs, or strategic justification.

CROSS-SYSTEM RELATIONSHIPS TO SCRUTINIZE:
- Audience <-> Positioning: Does the positioning solve the actual pain points of the specified personas?
- Positioning <-> Differentiation: Is the differentiator truly unique, or is it standard table stakes?
- Positioning <-> Personality: Does the behavioral archetype support the market posture?
- Personality <-> Voice: Do the tone dimensions and vocabulary express the archetype's traits?
- Name <-> Personality & Positioning: Does the selected name harmonize with the strategic identity?
- Personality <-> Visual System: Do the palette, typography, and geometry reflect the emotional territory?
- Voice <-> Messaging & Copy Examples: Do the real-world copy examples obey the writing guidelines?
- Claims <-> Proof Points: Are claims backed by concrete evidence rather than empty assertion?

STRICT CONSTRAINTS & BEHAVIORAL RULES:
1. HUMAN DECISION PROTECTION:
   - The selected brand name is AUTHORITATIVE and IMMUTABLE. You MUST NOT rename the brand or invent a replacement name.
   - If you detect a name/personality mismatch, report it as a diagnostic observation; DO NOT propose a new brand name.
   - You MUST NOT automatically rewrite or replace positioning, personality, voice, or visual direction.
2. NO MANUFACTURED COMPLAINTS (GOOD BRAND BEHAVIOR):
   - If the brand is coherent, disciplined, and well-grounded, DO NOT invent fake flaws.
   - If a brand has strong alignment, celebrate its strengths, report zero blocking issues, and designate readiness = "ready".
3. EVIDENCE-BASED DIAGNOSIS:
   - Every issue must cite verbatim evidence (exact phrases, color hexes, typography choices, or tone levels).
   - Distinguish FACT (what is written) from STRATEGIC RISK (why it hurts the brand).
4. SEVERITY DEFINITIONS:
   - "critical": Fatal flaw, major cross-stage contradiction, or non-viable claim that prevents market launch.
   - "high": Serious friction, generic positioning, or audience mismatch that degrades authority.
   - "medium": Noticeable cliché, stylistic inconsistency, or unpolished detail.
   - "low": Minor polish, cadence tweak, or advisory observation.

OUTPUT CONTRACT (STRICT JSON ONLY):
Return a single JSON object conforming to this schema:
{
  "overallAssessment": "Comprehensive 3-5 sentence diagnostic summary of the entire brand system's systemic health, integrity, and market viability.",
  "strengths": [
    "Array of 2-5 specific systemic strengths where stages reinforce each other exceptionally well"
  ],
  "issues": [
    {
      "id": "issue-1",
      "severity": "critical" | "high" | "medium" | "low",
      "category": "generic_language" | "weak_positioning" | "audience_mismatch" | "contradictions" | "weak_differentiation" | "name_personality_mismatch" | "name_positioning_mismatch" | "visual_personality_mismatch" | "voice_inconsistency" | "cliches" | "unsupported_claims" | "missing_information",
      "evidence": "Exact verbatim phrase, color hex, font, or setting from BrandState",
      "explanation": "Clear diagnostic rationale explaining why this creates dissonance or weakness",
      "suggestedRevision": "Constructive, directional recommendation for the human to consider (do NOT rewrite the brand)"
    }
  ],
  "blockingIssues": [
    // Sub-array of issues with severity 'critical' (or fatal 'high') that require resolution before launch
  ],
  "readiness": "ready" | "needs_revision" | "not_ready"
}
`;

function safeList(val: unknown, sep = ", "): string {
  if (!val) return "None";
  if (Array.isArray(val)) {
    return (
      val
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "object" && item !== null) {
            if ("name" in item && typeof (item as { name: unknown }).name === "string") return (item as { name: string }).name;
            if ("title" in item && typeof (item as { title: unknown }).title === "string") return (item as { title: string }).title;
            if ("rule" in item && typeof (item as { rule: unknown }).rule === "string") return (item as { rule: string }).rule;
            if ("principle" in item && typeof (item as { principle: unknown }).principle === "string") return (item as { principle: string }).principle;
          }
          return String(item);
        })
        .filter(Boolean)
        .join(sep) || "None"
    );
  }
  if (typeof val === "string") return val.trim() || "None";
  return String(val);
}

export function buildCriticUserPrompt(brandState: BrandState): string {
  const d: Discovery = brandState.discovery;
  const p: Positioning = brandState.positioning;
  const pers: BrandPersonality = brandState.personality;
  const n: Naming = brandState.naming;
  const v: Voice = brandState.voice;
  const vis: VisualDirection = brandState.visualDirection;

  const selectedName = n.selectedName || "Unspecified Brand Name";
  const selectedTagline = n.selectedTagline || "None selected";

  const targetAudience = d.targetAudience || { primary: "" };

  return `
EVALUATE THIS COMPLETE BRAND SYSTEM:

=======================================================
01. DISCOVERY FOUNDATION
=======================================================
Raw Startup Idea: ${d.rawIdea || "None provided"}
Core Problem Statement: ${d.problem}
Target Audience:
  - Primary Persona: ${targetAudience.primary}
  - Secondary Segments: ${safeList(targetAudience.secondary)}
  - Audience Characteristics: ${safeList(targetAudience.characteristics, "; ")}
  - Pain Points: ${safeList(targetAudience.painPoints, "; ")}
  - Motivations: ${safeList(targetAudience.motivations, "; ")}
User Needs: ${safeList(d.userNeeds, "; ")}
Constraints: ${safeList(d.constraints, "; ")}
Assumptions: ${safeList(d.assumptions, "; ")}

=======================================================
02. POSITIONING STRATEGY
=======================================================
Market Category: ${p.category}
Category Rationale: ${p.categoryRationale}
Positioning Statement: ${p.positioningStatement}
Unique Differentiator: ${p.differentiator}
Value Proposition: ${p.valueProposition}
Competitive Whitespace: ${safeList(p.competitiveWhitespace, "; ")}
Alternatives / Competitors: ${safeList(p.alternatives, ", ")}
Proof Points: ${safeList(p.proofPoints, "; ")}
Strategic Risks: ${safeList(p.risks, "; ")}
Confidence Score: ${p.confidence}%

=======================================================
03. BRAND PERSONALITY
=======================================================
Psychological Archetype: ${pers.archetype}
Archetype Rationale: ${pers.archetypeRationale}
Core Traits: ${safeList(pers.traits, ", ")}
Behavioral Characteristics: ${safeList(pers.behavioralCharacteristics, "; ")}
Strategic Principles:
${(pers.principles || []).map((pr) => `  - ${typeof pr === "string" ? pr : `${pr.title}: ${pr.description}`}`).join("\n")}
Emotional Territory: ${pers.emotionalTerritory}
Brand Do's: ${safeList(pers.personalityDo, "; ")}
Brand Don'ts: ${safeList(pers.personalityDont, "; ")}

=======================================================
04. AUTHORITATIVE BRAND IDENTITY (HUMAN-SELECTED)
=======================================================
Selected Brand Name: "${selectedName}" (Authoritative & Immutable)
Selected Tagline: "${selectedTagline}"
Naming Direction ID: ${n.selectedDirectionId || "Custom"}

=======================================================
05. BRAND VOICE SYSTEM
=======================================================
Primary Tone: ${v?.toneProfile?.primary || "None"}
Secondary Tones: ${safeList(v?.toneProfile?.secondary, ", ")}
Tonal Balance: ${v?.toneProfile?.tonalBalance || "None"}
Emotional Effect: ${v?.toneProfile?.emotionalEffect || "None"}
Tone Dimensions:
${(v?.toneDimensions || []).map((td) => `  - ${td.dimension}: ${td.level}/100 (${td.rationale})`).join("\n")}
Preferred Vocabulary: ${safeList(v?.vocabulary?.preferred || (v?.vocabulary as Record<string, unknown>)?.preferredTerms, ", ")}
Avoided Vocabulary: ${safeList(v?.vocabulary?.avoid || (v?.vocabulary as Record<string, unknown>)?.forbiddenTerms, ", ")}
Specialized Terminology: ${safeList(v?.vocabulary?.terminology, ", ")}
Language Characteristics: ${safeList(v?.vocabulary?.languageCharacteristics, "; ")}
Messaging Pillars:
${(v?.messagingPillars || []).map((mp) => `  - [${mp.title || (mp as Record<string, unknown>).pillar}] ${mp.keyMessage || (mp as Record<string, unknown>).message}`).join("\n")}
Real-World Copy Examples:
  - Homepage Hero: "${v?.examples?.homepageHero || (v as unknown as Record<string, Record<string, string>>)?.copyExamples?.headline || "None"}"
  - Short Pitch: "${v?.examples?.shortPitch || (v as unknown as Record<string, Record<string, string>>)?.copyExamples?.elevatorPitch || "None"}"
  - Primary CTA: "${v?.examples?.primaryCTA || (v as unknown as Record<string, Record<string, string>>)?.copyExamples?.cta || "None"}"
  - Social Post: "${v?.examples?.socialPost || (v as unknown as Record<string, Record<string, string>>)?.copyExamples?.socialBio || "None"}"
Voice Don'ts: ${safeList(v?.voiceDonts, "; ")}
Consistency Rules: ${safeList(v?.consistencyRules, "; ")}

=======================================================
06. VISUAL BRAND SYSTEM
=======================================================
Aesthetic Mood: "${vis?.visualPersonality?.aestheticMood || "None"}"
Visual Keywords: ${safeList(vis?.visualPersonality?.visualKeywords, ", ")}
Operational Design Principles:
${(vis?.visualPersonality?.designPrinciples || []).map((dp) => `  - ${dp.principle}: ${dp.description}`).join("\n")}
Color System:
  - Primary Colors: ${(vis?.colorSystem?.primary || []).map((c) => `[${c.hex}] ${c.name} (${c.role}): ${c.usage}`).join("; ")}
  - Secondary Colors: ${(vis?.colorSystem?.secondary || []).map((c) => `[${c.hex}] ${c.name} (${c.role}): ${c.usage}`).join("; ") || "None"}
  - Neutrals: ${(vis?.colorSystem?.neutrals || []).map((c) => `[${c.hex}] ${c.name} (${c.role})`).join("; ")}
  - Accessibility Notes: ${vis?.colorSystem?.accessibility?.contrastNotes || "None"} (WCAG Compliance: ${vis?.colorSystem?.accessibility?.wcagCompliance || "AA"})
Typography System:
  - Heading Font: ${vis?.typography?.heading?.fontFamily || "Serif"} (${vis?.typography?.heading?.category || "Serif"}) [Weights: ${safeList(vis?.typography?.heading?.weights, ", ")}]
  - Body Font: ${vis?.typography?.body?.fontFamily || "Sans-serif"} (${vis?.typography?.body?.category || "Sans-serif"}) [Weights: ${safeList(vis?.typography?.body?.weights, ", ")}]
  - Pairing Mood & Contrast: ${vis?.typography?.pairing?.mood || ""} &mdash; ${vis?.typography?.pairing?.contrast || ""}
  - Typographic Rationale: ${vis?.typography?.rationale || "None"}
Imagery Guidelines:
  - Photography Direction: ${vis?.imagery?.photographyDirection || "None"}
  - Illustration Direction: ${vis?.imagery?.illustrationDirection || "None"}
  - Composition: ${vis?.imagery?.composition || "None"}
  - Subject Treatment: ${vis?.imagery?.subjectTreatment || "None"}
Logo Architecture:
  - Concept: ${vis?.logoDirection?.concept || "None"}
  - Mark Direction: ${vis?.logoDirection?.markDirection || "None"}
  - Wordmark Direction: ${vis?.logoDirection?.wordmarkDirection || "None"}
  - Construction Principles: ${safeList(vis?.logoDirection?.constructionPrinciples, "; ")}
Layout Principles:
  - Spacing Cadence: ${vis?.layoutPrinciples?.spacing || "None"}
  - Density: ${vis?.layoutPrinciples?.density || "None"}
  - Hierarchy Scale: ${vis?.layoutPrinciples?.hierarchy || "None"}
  - Shape Language: ${vis?.layoutPrinciples?.shapeLanguage || "None"}
  - Composition: ${vis?.layoutPrinciples?.composition || "None"}

=======================================================
DIAGNOSTIC INSTRUCTIONS:
Audit the entire system across the 12 categories.
Scrutinize every cross-stage relationship.
Provide exact evidence, diagnostic explanations, and constructive revision recommendations.
If the brand is coherent and well-crafted, celebrate strengths and avoid false positives.
Return ONLY valid JSON matching the CriticOutput schema.
`;
}
