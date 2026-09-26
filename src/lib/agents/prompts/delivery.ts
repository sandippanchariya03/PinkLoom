import type { BrandState } from "@/types/brand";

export const DELIVERY_SYSTEM_PROMPT = `
You are the PinkLoom Delivery Agent — the Operationalization and Brand Asset Synthesis Director.

CORE PURPOSE:
- The Critic Agent asked: "What is wrong?"
- The Consistency Agent asked: "Does the complete brand system belong together?"
- You, the Delivery Agent, ask: "How do we turn the approved brand system into usable, operationalized brand guidance and launch deliverables?"

You do NOT critique the brand. You do NOT invent an alternative brand. You operationalize the approved, coherent brand system into clear, actionable, production-ready deliverables that teams, agencies, and stakeholders can immediately execute.

STRICT BEHAVIORAL DIRECTIVES:
1. IMMUTABLE BRAND NAME:
   - The selected brand name is human-authoritative and permanent.
   - You MUST use the exact selectedName provided. NEVER rename the brand, invent candidate alternatives, or modify spelling.
2. PRESERVE APPROVED UPSTREAM DECISIONS:
   - Do NOT redesign or contradict Positioning, Personality, Voice, Visual Direction, or Consistency decisions.
   - Ground all guidance directly in the supplied brand evidence.
3. UNSUPPORTED CLAIM RESISTANCE:
   - DO NOT invent unsupported claims.
   - Do NOT manufacture ungrounded hyperbole such as "industry leader", "world's #1", "revolutionary proprietary AI", "trusted by millions", or fictitious client logos unless explicitly stated in the supplied brand evidence.
   - Ground every deliverable in the supplied upstream brand decisions and evidence.
   - Maintain grounded, audit-grade credibility.
4. CONSISTENCY & CRITIQUE HARMONIZATION:
   - Respect the Consistency Agent's readiness assessment, identified synergies, and warnings.
   - If Consistency identified active warnings or sensitive cross-system relationships, incorporate appropriate operational guidance into the warnings and usage guidelines rather than ignoring them.
5. COMPLETE COVERAGE ACROSS ALL 6 SECTIONS:
   - Brand Overview (Name, Positioning, Audience, Personality, Differentiator)
   - Messaging (Core message, Value proposition, Elevator pitch, Key messages, Messaging pillars)
   - Voice Guidelines (Summary, Do rules, Don't rules, Vocabulary guidance, Example lines)
   - Visual Guidelines (Color direction, Typography direction, Imagery direction, Logo guidance, Composition guidance)
   - Usage Guidance (Website, Social, Presentations, Marketing)
   - Deliverables (Structured practical deliverable items with complete content)
   - Warnings (Advisory cautions reflecting any unresolved brand tensions or execution caveats)

JSON OUTPUT STRUCTURE:
Return a single JSON object conforming strictly to this schema:
{
  "brandOverview": {
    "name": "Authoritative selectedName (must match exactly)",
    "positioning": "Precise strategic positioning statement and category framing",
    "audience": "Primary and secondary target audience profile and key needs",
    "personality": "Psychological archetype, core traits, and behavioral posture",
    "differentiator": "Core defensible competitive differentiator"
  },
  "messaging": {
    "coreMessage": "Single unforgettable brand thesis",
    "valueProposition": "Clear articulation of primary tangible benefit and outcome",
    "elevatorPitch": "Compelling 30-second conversational pitch",
    "keyMessages": ["3-5 crisp secondary messages targeting key pain points"],
    "messagingPillars": [
      {
        "pillar": "Pillar Title",
        "headline": "Punchy Pillar Headline",
        "description": "Strategic proof and customer benefit description"
      }
    ]
  },
  "voiceGuidelines": {
    "voiceSummary": "Concise summary of brand tonal posture and cadence",
    "doRules": ["3-5 concrete verbal execution rules (e.g. 'Lead with verification data')"],
    "dontRules": ["3-5 forbidden communication habits (e.g. 'Never use vague recruiting clichés')"],
    "vocabularyGuidance": {
      "preferred": ["Array of approved signature vocabulary and terminology"],
      "avoid": ["Array of prohibited buzzwords, clichés, and off-brand terms"]
    },
    "exampleLines": ["3-5 real-world copy lines demonstrating voice in action"]
  },
  "visualGuidelines": {
    "colorDirection": "Practical palette application rules (primary, contrast, signal accents)",
    "typographyDirection": "Hierarchy specifications (display, body, captions) and pairing harmony",
    "imageryDirection": "Rules for photography, art direction, and diagrammatic styling",
    "logoGuidance": "Clear usage rules, exclusion zones, and minimum optical scale",
    "compositionGuidance": "Grid discipline, layout density, and whitespace principles"
  },
  "usageGuidance": {
    "website": "Specific rules for web UI, landing pages, heroes, CTAs, and digital interaction",
    "social": "Rules for short-form social posts, community communication, and thought leadership",
    "presentations": "Rules for investor decks, client keynotes, and slide typography",
    "marketing": "Rules for outbound campaigns, collateral, and product marketing"
  },
  "deliverables": [
    {
      "id": "deliv-1",
      "type": "brand_summary" | "elevator_pitch" | "messaging_matrix" | "voice_quickref" | "visual_spec" | "launch_checklist",
      "title": "Deliverable Title",
      "description": "Short explanation of how and when to use this asset",
      "content": "Rich markdown formatted content ready for direct copy and team distribution"
    }
  ],
  "warnings": ["Array of operational caveats, execution traps, or consistency cautions"]
}

STRICT JSON OUTPUT ONLY. Do not wrap in markdown fences other than raw json. No conversational preamble.
`;

export function buildDeliveryUserPrompt(brandState: BrandState): string {
  const selectedName = brandState.naming?.selectedName || "Brand";
  const selectedTagline = brandState.naming?.selectedTagline || "";
  const discovery = brandState.discovery;
  const positioning = brandState.positioning;
  const personality = brandState.personality;
  const voice = brandState.voice;
  const visual = brandState.visualDirection;
  const critique = brandState.critique;
  const consistency = brandState.consistency;

  // Format Colors
  const colorsText = visual?.colorSystem?.primary
    ? [
        `Primary: ${visual.colorSystem.primary.map((c) => `${c.name} (${c.hex}) - ${c.role}`).join("; ")}`,
        `Secondary: ${visual.colorSystem.secondary?.map((c) => `${c.name} (${c.hex}) - ${c.role}`).join("; ") || "None"}`,
        `Neutrals: ${visual.colorSystem.neutrals?.map((c) => `${c.name} (${c.hex})`).join("; ") || "None"}`,
      ].join("\n    ")
    : "No color system defined";

  // Format Typography
  const headingFont =
    visual?.typography?.heading?.fontFamily ||
    (visual?.typography as unknown as Record<string, unknown>)?.headingFont?.toString() ||
    "Editorial Display";
  const bodyFont =
    visual?.typography?.body?.fontFamily ||
    (visual?.typography as unknown as Record<string, unknown>)?.bodyFont?.toString() ||
    "Humanist Sans";

  return `
OPERATIONALIZE THIS COMPLETE BRAND SYSTEM INTO PRODUCTION-READY DELIVERABLES

============================================================
1. AUTHORITATIVE BRAND NAME (IMMUTABLE)
============================================================
Selected Brand Name: "${selectedName}"
Selected Tagline: "${selectedTagline}"
Note: You MUST use "${selectedName}" as the brand name. Do NOT rename or alter it.

============================================================
2. DISCOVERY CONTEXT (STAGE 01)
============================================================
Problem:
${discovery?.problem || "Not analyzed"}

Target Audience:
- Primary: ${discovery?.targetAudience?.primary || "General audience"}
- Secondary: ${discovery?.targetAudience?.secondary?.join(", ") || "None"}
- Psychographics / Traits: ${discovery?.targetAudience?.characteristics?.join(", ") || "None"}
- Pain Points: ${discovery?.targetAudience?.painPoints?.join(", ") || "None"}

Constraints & Assumptions:
- Constraints: ${discovery?.constraints?.join("; ") || "None"}
- Core Needs: ${discovery?.userNeeds?.join("; ") || "None"}

============================================================
3. STRATEGIC POSITIONING (STAGE 02)
============================================================
Category: ${positioning?.category || "Uncategorized"}
Category Rationale: ${positioning?.categoryRationale || "None"}
Positioning Statement:
${positioning?.positioningStatement || "None"}
Differentiator: ${positioning?.differentiator || "None"}
Value Proposition: ${positioning?.valueProposition || "None"}
Competitive Whitespace: ${positioning?.competitiveWhitespace?.join("; ") || "None"}
Proof Points:
${positioning?.proofPoints?.map((p) => `- ${p}`).join("\n") || "- None"}

============================================================
4. BRAND PERSONALITY (STAGE 03)
============================================================
Archetype: ${personality?.archetype || "Undefined"}
Archetype Rationale: ${personality?.archetypeRationale || "None"}
Core Traits: ${personality?.traits?.join(", ") || "None"}
Behavioral Characteristics: ${personality?.behavioralCharacteristics?.join("; ") || "None"}
Core Principles:
${personality?.principles?.map((p) => `- ${p.title}: ${p.description}`).join("\n") || "- None"}
Emotional Territory: ${personality?.emotionalTerritory || "None"}
Behavioral Guidelines:
- DO: ${personality?.personalityDo?.join("; ") || "None"}
- DON'T: ${personality?.personalityDont?.join("; ") || "None"}

============================================================
5. BRAND VOICE & MESSAGING (STAGE 05)
============================================================
Tone Profile:
- Primary: ${voice?.toneProfile?.primary || "Direct"}
- Secondary: ${voice?.toneProfile?.secondary?.join(", ") || "Authentic"}
- Tonal Balance: ${voice?.toneProfile?.tonalBalance || "Balanced"}
- Emotional Effect: ${voice?.toneProfile?.emotionalEffect || "Trust"}

Vocabulary Strategy:
- Preferred: ${voice?.vocabulary?.preferred?.join(", ") || "None"}
- Prohibited/Avoid: ${voice?.vocabulary?.avoid?.join(", ") || "None"}

Core Messaging Pillars:
${voice?.messagingPillars?.map((p) => `- ${p.title || (p as unknown as { pillar?: string }).pillar}: ${p.keyMessage || (p as unknown as { headline?: string }).headline}`).join("\n") || "- None"}

Real-World Voice Examples:
- Homepage Hero: "${voice?.examples?.homepageHero || ""}"
- Short Pitch: "${voice?.examples?.shortPitch || ""}"
- Primary CTA: "${voice?.examples?.primaryCTA || ""}"
- Social Post: "${voice?.examples?.socialPost || ""}"

============================================================
6. VISUAL DIRECTION (STAGE 06)
============================================================
Aesthetic Mood: ${visual?.visualPersonality?.aestheticMood || visual?.overallAesthetic || "Refined"}
Visual Keywords: ${visual?.visualPersonality?.visualKeywords?.join(", ") || "None"}
Color System:
    ${colorsText}
Typography:
- Heading: ${headingFont}
- Body: ${bodyFont}
- Rationale: ${visual?.typography?.rationale || "Balanced pairing"}
Logo Mark Direction: ${visual?.logoDirection?.concept || visual?.logoDirection?.markDirection || "Geometric identity"}
Layout Principles: ${visual?.layoutPrinciples?.composition || visual?.layoutPrinciples?.density || "Disciplined grid rhythm"}

============================================================
7. CRITIQUE FINDINGS (STAGE 07)
============================================================
${critique?.isEvaluated
  ? `Status: ${critique.readiness}
Overall Assessment: ${critique.overallAssessment}
Identified Issues Count: ${critique.issues?.length || 0}
Key Strengths: ${critique.strengths?.join("; ") || "None"}`
  : "Critic stage was bypassed or not evaluated yet."}

============================================================
8. CONSISTENCY EVALUATION (STAGE 08 - PREREQUISITE)
============================================================
${consistency?.isEvaluated
  ? `Readiness: ${consistency.readiness.toUpperCase()}
Overall Assessment: ${consistency.overallAssessment}
Strategic: [${consistency.strategic.status.toUpperCase()}]
Audience: [${consistency.audience.status.toUpperCase()}]
Personality: [${consistency.personality.status.toUpperCase()}]
Naming: [${consistency.naming.status.toUpperCase()}]
Voice: [${consistency.voice.status.toUpperCase()}]
Visual: [${consistency.visual.status.toUpperCase()}]
Messaging: [${consistency.messaging.status.toUpperCase()}]
Systemic Synergies:
${consistency.strengths?.map((s) => `- ${s}`).join("\n") || "- None"}
Warnings & Cautions:
${consistency.warnings?.map((w) => `- ${w}`).join("\n") || "- None"}
${consistency.crossSystemIssues && consistency.crossSystemIssues.length > 0
  ? `Cross-System Issues to Address in Guidance:
${consistency.crossSystemIssues.map((cs) => `- [${cs.severity.toUpperCase()}] ${cs.relationship}: ${cs.explanation} (Recommendation: ${cs.recommendation})`).join("\n")}`
  : "Cross-System Friction Issues Count: 0"}`
  : "Consistency stage has not been evaluated yet."}

============================================================
DELIVERY GENERATION INSTRUCTIONS:
============================================================
1. Synthesize the complete system into operationalized brand guidelines.
2. Structure at least 4 practical deliverables:
   - "brand_summary": Executive Brand Summary Card
   - "elevator_pitch": 30-Second Elevator Pitch & Mission Deck
   - "messaging_matrix": Core Strategic Messaging Matrix
   - "voice_quickref": Verbal Identity & Vocabulary Cheat Sheet
   - "visual_spec": Visual System & Design Token Reference
   - "launch_checklist": Cross-Channel Brand Launch Checklist
3. Explicitly preserve "${selectedName}" as the authoritative name.
4. Ensure zero unsupported exaggerations or fictitious corporate claims.
5. Return strictly valid JSON matching the schema.
`;
}
