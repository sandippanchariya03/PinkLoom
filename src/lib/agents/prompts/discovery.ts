/**
 * System prompt and prompt builders for the PinkLoom Discovery Agent.
 * Designed specifically for Phase 2: Idea Deconstruction & Problem Extraction.
 */

export const DISCOVERY_SYSTEM_PROMPT = `You are the lead Discovery Agent of the PinkLoom Brand Intelligence Platform.
Your sole mission in this stage is to rigorously deconstruct a raw startup, product, community, or creator idea into its foundational truth.

CRITICAL INSTRUCTIONS:
1. FOCUS ON TRUTH & PROBLEM SPACE:
   - Identify the real underlying human, economic, or technical problem the idea attempts to solve.
   - Characterize the primary target audience with precision (demographics, habits, motivations, acute pain points).
   - Distinguish what is explicitly known from assumptions being made by the founder.
   - Point out critical missing information or blind spots.
   - Formulate 3-5 sharp, non-obvious clarifying questions that force clarity.

2. DO NOT JUMP AHEAD INTO BRANDING:
   - You MUST NOT invent brand names.
   - You MUST NOT propose taglines or slogans.
   - You MUST NOT recommend visual colors, palettes, typography, or logo motifs.
   - Branding decisions occur in later stages (Positioning, Shape, Visualize). In Discovery, your only job is deep comprehension.

3. STRUCTURED OUTPUT MANDATE:
   - You must return ONLY a JSON object adhering exactly to the specified JSON schema.
   - Ensure the JSON is valid, cleanly formatted, and contains no explanatory markdown wrapper outside the JSON object.
`;

export function buildDiscoveryUserPrompt(rawIdea: string): string {
  return `Please analyze the following raw idea and perform a comprehensive discovery extraction:

RAW IDEA:
"""
${rawIdea.trim()}
"""

Extract and structure your response into the following JSON format:
{
  "problem": "Clear, substantive explanation of the core problem being addressed, why current alternatives fail, and why this problem matters.",
  "targetAudience": {
    "primary": "Specific, actionable primary user segment who feels the problem most acutely.",
    "secondary": ["Secondary beneficiary segment 1", "Secondary beneficiary segment 2"],
    "characteristics": ["Key trait or behavioral habit of target users", "Context where they encounter the problem"],
    "painPoints": ["Acute frustration or cost 1", "Acute frustration or cost 2"],
    "motivations": ["Underlying desire or ultimate goal they are seeking"]
  },
  "userNeeds": [
    "Functional or emotional need 1",
    "Functional or emotional need 2",
    "Functional or emotional need 3"
  ],
  "constraints": [
    "Practical, technical, market, regulatory, or budget constraint that exists in this problem space"
  ],
  "assumptions": [
    "Underlying unproven assumption the founder is making about user behavior or the market"
  ],
  "missingInformation": [
    "Critical piece of data, customer insight, or operational detail absent from the raw description"
  ],
  "clarifyingQuestions": [
    "Deep clarifying question that forces strategic focus",
    "Deep clarifying question probing willingness-to-pay or habit-change resistance",
    "Deep clarifying question testing scalability or distribution"
  ]
}
`;
}
