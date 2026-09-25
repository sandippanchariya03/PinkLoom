import type { Discovery } from "@/types/brand";

/**
 * System prompt and prompt builders for the PinkLoom Positioning Agent.
 * Designed specifically for Phase 3: Strategic Whitespace, Category Definition, and Differentiator Formulation.
 */

export const POSITIONING_SYSTEM_PROMPT = `You are the lead Positioning Agent of the PinkLoom Brand Intelligence Platform.
Your sole mission in this stage is to translate validated Discovery insights into a sharp, defendable market positioning strategy.

CRITICAL INSTRUCTIONS:
1. DISCOVERY IS YOUR SOURCE OF TRUTH:
   - You MUST consume the validated Discovery context (problem, target audience personas, user needs, constraints, assumptions, and blind spots).
   - Do NOT restart analysis from the raw idea alone.
   - Ground every positioning choice directly in the verified pains, audience characteristics, and constraints identified during Discovery.

2. RIGOROUS STRATEGIC DIFFERENTIATION:
   - Identify the exact market category where this product can plausibly lead or create a new subcategory.
   - Formulate a clear Category Rationale: explain WHY this category framing gives the venture an unfair advantage.
   - Articulate a singular, non-generic Differentiator (what makes it genuinely distinct from existing alternatives).
   - Draft a crisp Value Proposition: What concrete transformation or capability does the user acquire?
   - Identify 2-4 areas of Competitive Whitespace (unmet market needs or underserved angles that legacy alternatives overlook).
   - Acknowledge realistic Positioning Risks and necessary Proof Points.

3. DISTINGUISH FACTS FROM ASSUMPTIONS:
   - Explicitly separate verified audience needs from unproven assumptions.
   - Do NOT invent false market data or make up fake statistics.
   - Estimate an honest confidence score (0-100) reflecting the clarity of the problem space and defensibility of the differentiator.

4. DO NOT JUMP AHEAD INTO DOWNSTREAM STAGES:
   - You MUST NOT invent brand names.
   - You MUST NOT generate slogans, advertising copy, or taglines.
   - You MUST NOT recommend visual identity, colors, typography, or logo concepts.
   - Brand shaping and naming belong to future stages. Focus solely on strategic market positioning.

5. STRUCTURED OUTPUT MANDATE:
   - You must return ONLY a JSON object conforming strictly to the requested schema.
   - No markdown formatting or commentary outside the JSON object.
`;

export function buildPositioningUserPrompt(discovery: Discovery): string {
  const audienceSummary = `
Primary Target Audience: ${discovery.targetAudience.primary}
Secondary Segments: ${discovery.targetAudience.secondary.join(", ") || "None specified"}
Key Traits: ${discovery.targetAudience.characteristics.join("; ") || "None specified"}
Acute Pain Points: ${discovery.targetAudience.painPoints.join("; ") || "None specified"}
Underlying Motivations: ${discovery.targetAudience.motivations.join("; ") || "None specified"}
`.trim();

  const userNeedsSummary = discovery.userNeeds.map((n, i) => `${i + 1}. ${n}`).join("\n");
  const constraintsSummary = discovery.constraints.length > 0
    ? discovery.constraints.map((c, i) => `${i + 1}. ${c}`).join("\n")
    : "None specified";
  const assumptionsSummary = discovery.assumptions.length > 0
    ? discovery.assumptions.map((a, i) => `${i + 1}. ${a}`).join("\n")
    : "None specified";
  const missingInfoSummary = discovery.missingInformation.length > 0
    ? discovery.missingInformation.map((m, i) => `${i + 1}. ${m}`).join("\n")
    : "None specified";

  return `Based on the following validated Discovery output, develop a comprehensive market positioning strategy:

==================================================
VALIDATED DISCOVERY CONTEXT (STAGE 01 OUTPUT)
==================================================

FOUNDER'S RAW IDEA:
"${discovery.rawIdea}"

CORE PROBLEM IDENTIFIED:
${discovery.problem}

AUDIENCE ANATOMY:
${audienceSummary}

VALIDATED USER NEEDS:
${userNeedsSummary}

OPERATING CONSTRAINTS:
${constraintsSummary}

UNPROVEN FOUNDER ASSUMPTIONS:
${assumptionsSummary}

IDENTIFIED GAPS & BLIND SPOTS:
${missingInfoSummary}

==================================================
OUTPUT MANDATE:
==================================================
Synthesize the above into the following JSON format:
{
  "category": "Exact market category or framed subcategory (e.g. 'Peer-to-Peer Technical Cofounder Network')",
  "categoryRationale": "Substantive explanation of why this category framing is advantageous given the audience's pain points and constraints.",
  "positioningStatement": "For [target audience] who [core frustration], [venture concept] is a [category] that [key benefit / differentiator], unlike [primary alternative].",
  "differentiator": "The sharpest, most defendable competitive wedge that sets this apart from existing alternatives.",
  "valueProposition": "Clear, compelling statement of the primary value, outcome, or relief delivered to the user.",
  "competitiveWhitespace": [
    "Specific underserved market angle or gap 1",
    "Specific underserved market angle or gap 2"
  ],
  "alternatives": [
    "Existing alternative, workaround, or competitor currently used by target audience",
    "Second common alternative"
  ],
  "proofPoints": [
    "Concrete evidence, capability, or mechanism required to make this positioning believable"
  ],
  "risks": [
    "Strategic, distribution, or adoption risk inherent in this positioning choice"
  ],
  "confidence": 85
}
`;
}
