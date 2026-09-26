import { z } from "zod";

// ============================================================================
// 1. DISCOVERY STAGE TYPES
// ============================================================================

export const DiscoveryOutputSchema = z.object({
  problem: z.string().min(5, "Problem statement must be identified"),
  targetAudience: z.object({
    primary: z.string().min(2, "Primary target audience is required"),
    secondary: z.array(z.string()).default([]),
    characteristics: z.array(z.string()).default([]),
    painPoints: z.array(z.string()).default([]),
    motivations: z.array(z.string()).default([]),
  }),
  userNeeds: z.array(z.string()).min(1, "At least one user need is required"),
  constraints: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
  clarifyingQuestions: z.array(z.string()).default([]),
});

export type DiscoveryOutput = z.infer<typeof DiscoveryOutputSchema>;

export const DiscoverySchema = z.object({
  rawIdea: z.string().min(1, "Raw idea is required"),
  problem: z.string().default(""),
  targetAudience: z.object({
    primary: z.string().default(""),
    secondary: z.array(z.string()).default([]),
    characteristics: z.array(z.string()).default([]),
    painPoints: z.array(z.string()).default([]),
    motivations: z.array(z.string()).default([]),
  }).default({
    primary: "",
    secondary: [],
    characteristics: [],
    painPoints: [],
    motivations: [],
  }),
  userNeeds: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
  clarifyingQuestions: z.array(z.string()).default([]),
  isAnalyzed: z.boolean().default(false),
  analyzedAt: z.string().optional(),
});

export type Discovery = z.infer<typeof DiscoverySchema>;

// ============================================================================
// 2. POSITIONING STAGE TYPES
// ============================================================================

export const PositioningOutputSchema = z.object({
  category: z.string().min(2, "Category definition is required"),
  categoryRationale: z.string().min(10, "Category rationale must be substantive"),
  positioningStatement: z.string().min(10, "Positioning statement must be substantive"),
  differentiator: z.string().min(5, "Unique differentiator is required"),
  valueProposition: z.string().min(10, "Value proposition is required"),
  competitiveWhitespace: z.array(z.string()).min(1, "At least one competitive whitespace must be identified"),
  alternatives: z.array(z.string()).default([]),
  proofPoints: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100).default(85),
});

export type PositioningOutput = z.infer<typeof PositioningOutputSchema>;

export const PositioningSchema = z.object({
  category: z.string().default(""),
  categoryRationale: z.string().default(""),
  positioningStatement: z.string().default(""),
  differentiator: z.string().default(""),
  valueProposition: z.string().default(""),
  competitiveWhitespace: z.array(z.string()).default([]),
  alternatives: z.array(z.string()).default([]),
  proofPoints: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100).default(0),
  isPositioned: z.boolean().default(false),
  positionedAt: z.string().optional(),
});

export type Positioning = z.infer<typeof PositioningSchema>;

// ============================================================================
// 3. SHAPE STAGE TYPES (Personality, Naming, Voice)
// ============================================================================

export const PersonalityOutputSchema = z.object({
  archetype: z.string().min(2, "Brand archetype is required"),
  archetypeRationale: z.string().min(10, "Archetype rationale must be substantive"),
  traits: z.array(z.string()).min(3, "At least 3 core personality traits are required"),
  behavioralCharacteristics: z.array(z.string()).min(2, "At least 2 behavioral characteristics are required"),
  principles: z.array(
    z.object({
      title: z.string().min(2, "Principle title is required"),
      description: z.string().min(5, "Principle description must be clear"),
    })
  ).min(2, "At least 2 behavioral principles are required"),
  emotionalTerritory: z.string().min(5, "Emotional territory is required"),
  personalityDo: z.array(z.string()).min(2, "At least 2 behavioral do guidelines are required"),
  personalityDont: z.array(z.string()).min(2, "At least 2 behavioral don't guidelines are required"),
  confidence: z.number().min(0).max(100).default(85),
});

export type PersonalityOutput = z.infer<typeof PersonalityOutputSchema>;

export const BrandPersonalitySchema = z.object({
  archetype: z.string().default(""),
  archetypeRationale: z.string().default(""),
  traits: z.array(z.string()).default([]),
  behavioralCharacteristics: z.array(z.string()).default([]),
  principles: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ).default([]),
  emotionalTerritory: z.string().default(""),
  personalityDo: z.array(z.string()).default([]),
  personalityDont: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100).default(0),
  isFormulated: z.boolean().default(false),
  formulatedAt: z.string().optional(),
});

export type BrandPersonality = z.infer<typeof BrandPersonalitySchema>;

export const NamingCandidateSchema = z.object({
  name: z.string().min(1, "Candidate name is required"),
  rationale: z.string().min(1, "Rationale is required"),
  linguisticRationale: z.string().min(1, "Linguistic rationale is required"),
  phoneticAssessment: z.string().min(1, "Phonetic assessment is required"),
  domainSuitability: z.string().min(1, "Domain suitability assessment is required"),
});

export type NamingCandidate = z.infer<typeof NamingCandidateSchema>;

// Backwards-compatibility alias
export const NameCandidateSchema = NamingCandidateSchema;
export type NameCandidate = NamingCandidate;

export const NamingDirectionSchema = z.object({
  id: z.string().min(1, "Direction ID is required"),
  name: z.string().min(1, "Direction name is required"),
  strategy: z.string().min(1, "Strategy is required"),
  rationale: z.string().min(1, "Strategic rationale is required"),
  namingLogic: z.string().min(1, "Naming logic is required"),
  candidates: z.array(NamingCandidateSchema).min(1, "At least one candidate name is required per direction"),
  taglineCandidates: z.array(z.string()).default([]),
});

export type NamingDirection = z.infer<typeof NamingDirectionSchema>;

/**
 * Output schema returned by the LLM for Naming generation.
 * Generates 3-4 distinct naming directions with candidates and taglines.
 */
export const NamingOutputSchema = z.object({
  directions: z
    .array(NamingDirectionSchema)
    .min(3, "At least 3 distinct naming directions are required")
    .max(4, "Maximum 4 naming directions"),
});

export type NamingOutput = z.infer<typeof NamingOutputSchema>;

export const NamingSchema = z.object({
  directions: z.array(NamingDirectionSchema).default([]),
  selectedDirectionId: z.string().nullable().optional().default(null),
  selectedName: z.string().nullable().optional().default(null),
  selectedTagline: z.string().nullable().optional().default(null),
  isGenerated: z.boolean().default(false),
  isSelected: z.boolean().default(false),
  generatedAt: z.string().optional(),
  selectedAt: z.string().optional(),
});

export type Naming = z.infer<typeof NamingSchema>;

// ============================================================================
// 3. SHAPE STAGE TYPES: VOICE (PHASE 4C)
// ============================================================================

export const ToneProfileSchema = z.object({
  primary: z.string().default(""),
  secondary: z.array(z.string()).default([]),
  tonalBalance: z.string().default(""),
  emotionalEffect: z.string().default(""),
});

export type ToneProfile = z.infer<typeof ToneProfileSchema>;

export const ToneDimensionSchema = z.object({
  dimension: z.string().min(1, "Dimension name is required"),
  level: z.number().min(0).max(100),
  rationale: z.string().min(1, "Rationale is required"),
});

export type ToneDimension = z.infer<typeof ToneDimensionSchema>;

export const VocabularySchema = z.object({
  preferred: z.array(z.string()).default([]),
  avoid: z.array(z.string()).default([]),
  terminology: z.array(z.string()).default([]),
  languageCharacteristics: z.array(z.string()).default([]),
});

export type Vocabulary = z.infer<typeof VocabularySchema>;

export const MessagingPillarSchema = z.object({
  title: z.string().min(1, "Pillar title is required"),
  purpose: z.string().min(1, "Pillar purpose is required"),
  keyMessage: z.string().min(1, "Key message is required"),
  supportingPoints: z.array(z.string()).default([]),
});

export type MessagingPillar = z.infer<typeof MessagingPillarSchema>;

export const CommunicationPrincipleSchema = z.object({
  principle: z.string().min(1, "Principle name is required"),
  description: z.string().min(1, "Principle description is required"),
});

export type CommunicationPrinciple = z.infer<typeof CommunicationPrincipleSchema>;

export const WritingGuidelinesSchema = z.object({
  sentenceStyle: z.array(z.string()).default([]),
  structure: z.array(z.string()).default([]),
  callsToAction: z.array(z.string()).default([]),
  punctuationAndFormatting: z.array(z.string()).default([]),
});

export type WritingGuidelines = z.infer<typeof WritingGuidelinesSchema>;

export const VoiceExamplesSchema = z.object({
  homepageHero: z.string().default(""),
  shortPitch: z.string().default(""),
  primaryCTA: z.string().default(""),
  socialPost: z.string().default(""),
});

export type VoiceExamples = z.infer<typeof VoiceExamplesSchema>;

/**
 * Output schema returned by the LLM for Voice generation.
 */
export const VoiceOutputSchema = z.object({
  toneProfile: z.object({
    primary: z.string().min(1, "Primary tone is required"),
    secondary: z.array(z.string()).min(1, "At least one secondary tone is required"),
    tonalBalance: z.string().min(5, "Tonal balance description is required"),
    emotionalEffect: z.string().min(5, "Emotional effect is required"),
  }),
  toneDimensions: z.array(ToneDimensionSchema).min(3, "At least 3 tone dimensions are required"),
  vocabulary: VocabularySchema,
  messagingPillars: z.array(MessagingPillarSchema).min(3, "At least 3 messaging pillars are required").max(5, "Maximum 5 messaging pillars"),
  communicationPrinciples: z.array(CommunicationPrincipleSchema).min(3, "At least 3 communication principles are required"),
  writingGuidelines: WritingGuidelinesSchema,
  examples: z.object({
    homepageHero: z.string().min(5, "Homepage hero example is required"),
    shortPitch: z.string().min(5, "Short pitch example is required"),
    primaryCTA: z.string().min(2, "Primary CTA example is required"),
    socialPost: z.string().min(5, "Social post example is required"),
  }),
  voiceDonts: z.array(z.string()).min(3, "At least 3 voice don'ts are required"),
  consistencyRules: z.array(z.string()).min(3, "At least 3 consistency rules are required"),
});

export type VoiceOutput = z.infer<typeof VoiceOutputSchema>;

/**
 * Complete Voice state persisted on BrandState.
 */
export const VoiceSchema = z.object({
  toneProfile: ToneProfileSchema.default({
    primary: "",
    secondary: [],
    tonalBalance: "",
    emotionalEffect: "",
  }),
  toneDimensions: z.array(ToneDimensionSchema).default([]),
  vocabulary: VocabularySchema.default({
    preferred: [],
    avoid: [],
    terminology: [],
    languageCharacteristics: [],
  }),
  messagingPillars: z.array(MessagingPillarSchema).default([]),
  communicationPrinciples: z.array(CommunicationPrincipleSchema).default([]),
  writingGuidelines: WritingGuidelinesSchema.default({
    sentenceStyle: [],
    structure: [],
    callsToAction: [],
    punctuationAndFormatting: [],
  }),
  examples: VoiceExamplesSchema.default({
    homepageHero: "",
    shortPitch: "",
    primaryCTA: "",
    socialPost: "",
  }),
  voiceDonts: z.array(z.string()).default([]),
  consistencyRules: z.array(z.string()).default([]),
  isGenerated: z.boolean().default(false),
  generatedAt: z.string().optional(),
});

export type Voice = z.infer<typeof VoiceSchema>;

// ============================================================================
// 4. VISUALIZE STAGE TYPES
// ============================================================================

export const ColorSwatchSchema = z.object({
  role: z.enum(["primary", "secondary", "accent", "background", "surface", "text"]),
  name: z.string(),
  hex: z.string(),
  hsl: z.string().optional(),
  rationale: z.string(),
});

export type ColorSwatch = z.infer<typeof ColorSwatchSchema>;

export const TypographySchema = z.object({
  headingFont: z.string().default(""),
  bodyFont: z.string().default(""),
  accentFont: z.string().optional(),
  pairingRationale: z.string().default(""),
  sampleScale: z.record(z.string(), z.string()).optional(),
});

export type Typography = z.infer<typeof TypographySchema>;

export const ImageryDirectionSchema = z.object({
  style: z.string().default(""),
  moodKeywords: z.array(z.string()).default([]),
  visualMetaphors: z.array(z.string()).default([]),
  lightingAndTexture: z.string().default(""),
});

export type ImageryDirection = z.infer<typeof ImageryDirectionSchema>;

export const LogoDirectionSchema = z.object({
  concept: z.string().default(""),
  symbolism: z.string().default(""),
  formLanguage: z.string().default(""),
  compositionNotes: z.string().default(""),
});

export type LogoDirection = z.infer<typeof LogoDirectionSchema>;

// Phase 5: Structured Visual System Schemas
export const ColorItemSchema = z.object({
  name: z.string().min(1, "Color name is required"),
  hex: z.string().min(3, "Hex code required"),
  role: z.string().min(1, "Color role is required"),
  usage: z.string().default(""),
});

export type ColorItem = z.infer<typeof ColorItemSchema>;

export const ColorAccessibilitySchema = z.object({
  contrastNotes: z.string().default(""),
  wcagCompliance: z.string().default("WCAG 2.1 AA"),
  darkThemeConsiderations: z.string().default(""),
});

export type ColorAccessibility = z.infer<typeof ColorAccessibilitySchema>;

export const ColorSystemSchema = z.object({
  primary: z.array(ColorItemSchema).default([]),
  secondary: z.array(ColorItemSchema).default([]),
  neutrals: z.array(ColorItemSchema).default([]),
  semantic: z.array(ColorItemSchema).default([]),
  accessibility: ColorAccessibilitySchema.default({
    contrastNotes: "",
    wcagCompliance: "WCAG 2.1 AA",
    darkThemeConsiderations: "",
  }),
});

export type ColorSystem = z.infer<typeof ColorSystemSchema>;

export const TypographyFontSchema = z.object({
  fontFamily: z.string().min(1, "Font family is required"),
  category: z.string().default(""),
  weights: z.array(z.union([z.string(), z.number()]).transform((w) => String(w))).default([]),
  usage: z.string().default(""),
});

export type TypographyFont = z.infer<typeof TypographyFontSchema>;

export const TypographyPairingSchema = z.object({
  headingFont: z.string().default(""),
  bodyFont: z.string().default(""),
  contrast: z.string().default(""),
  mood: z.string().default(""),
});

export type TypographyPairing = z.infer<typeof TypographyPairingSchema>;

export const VisualTypographySchema = z.object({
  heading: TypographyFontSchema.default({
    fontFamily: "Instrument Serif",
    category: "Serif",
    weights: ["400"],
    usage: "Display headings and section titles",
  }),
  body: TypographyFontSchema.default({
    fontFamily: "Inter",
    category: "Sans-serif",
    weights: ["400", "500", "600"],
    usage: "Body paragraphs and interface copy",
  }),
  pairing: TypographyPairingSchema.default({
    headingFont: "Instrument Serif",
    bodyFont: "Inter",
    contrast: "High contrast between editorial serif and humanist sans",
    mood: "Refined and contemporary",
  }),
  rationale: z.string().default(""),
});

export type VisualTypography = z.infer<typeof VisualTypographySchema>;

export const DesignPrincipleSchema = z.union([
  z.object({
    principle: z.string().min(1, "Principle name is required"),
    description: z.string().min(3, "Principle description must be clear"),
  }),
  z.string().transform((str) => {
    const parts = str.split(":");
    return {
      principle: parts[0]?.trim() || "Principle",
      description: parts.slice(1).join(":").trim() || str,
    };
  }),
]);

export type DesignPrinciple = z.infer<typeof DesignPrincipleSchema>;

export const VisualPersonalitySchema = z.object({
  aestheticMood: z.string().default(""),
  visualKeywords: z.array(z.string()).default([]),
  designPrinciples: z.array(DesignPrincipleSchema).default([]),
  imageryDirection: z.string().default(""),
});

export type VisualPersonality = z.infer<typeof VisualPersonalitySchema>;

export const VisualImagerySchema = z.object({
  photographyDirection: z.string().default(""),
  illustrationDirection: z.string().default(""),
  composition: z.string().default(""),
  subjectTreatment: z.string().default(""),
});

export type VisualImagery = z.infer<typeof VisualImagerySchema>;

export const ConstructionPrincipleSchema = z.union([
  z.string(),
  z.object({
    principle: z.string().optional(),
    rule: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  }).transform((obj) => {
    if (obj.rule) return obj.rule;
    if (obj.description && obj.principle) return `${obj.principle}: ${obj.description}`;
    if (obj.description) return obj.description;
    if (obj.principle) return obj.principle;
    if (obj.title) return obj.title;
    return JSON.stringify(obj);
  }),
]);

export type ConstructionPrinciple = z.infer<typeof ConstructionPrincipleSchema>;

export const VisualLogoDirectionSchema = z.object({
  concept: z.string().default(""),
  markDirection: z.string().default(""),
  wordmarkDirection: z.string().default(""),
  constructionPrinciples: z.array(ConstructionPrincipleSchema).default([]),
});

export type VisualLogoDirection = z.infer<typeof VisualLogoDirectionSchema>;

export const LayoutPrinciplesSchema = z.object({
  spacing: z.string().default(""),
  density: z.string().default(""),
  hierarchy: z.string().default(""),
  shapeLanguage: z.string().default(""),
  composition: z.string().default(""),
});

export type LayoutPrinciples = z.infer<typeof LayoutPrinciplesSchema>;

/**
 * Strict LLM output validation contract for the Visual Direction Agent.
 */
export const VisualDirectionOutputSchema = z.object({
  colorSystem: z.object({
    primary: z.array(ColorItemSchema).min(1, "At least 1 primary color is required"),
    secondary: z.array(ColorItemSchema).min(1, "At least 1 secondary color is required"),
    neutrals: z.array(ColorItemSchema).min(2, "At least 2 neutral colors are required"),
    semantic: z.array(ColorItemSchema).default([]),
    accessibility: ColorAccessibilitySchema,
  }),
  typography: z.object({
    heading: TypographyFontSchema,
    body: TypographyFontSchema,
    pairing: TypographyPairingSchema,
    rationale: z.string().min(5, "Typography rationale must be substantive"),
  }),
  visualPersonality: z.object({
    aestheticMood: z.string().min(5, "Aesthetic mood description is required"),
    visualKeywords: z.array(z.string()).min(3, "At least 3 visual keywords are required"),
    designPrinciples: z.array(DesignPrincipleSchema).min(2, "At least 2 design principles are required"),
    imageryDirection: z.string().min(5, "High-level imagery direction is required"),
  }),
  imagery: z.object({
    photographyDirection: z.string().min(5, "Photography direction is required"),
    illustrationDirection: z.string().min(5, "Illustration direction is required"),
    composition: z.string().min(5, "Composition guidance is required"),
    subjectTreatment: z.string().min(5, "Subject treatment guidance is required"),
  }),
  logoDirection: z.object({
    concept: z.string().min(5, "Logo concept is required"),
    markDirection: z.string().min(5, "Mark direction is required"),
    wordmarkDirection: z.string().min(5, "Wordmark direction is required"),
    constructionPrinciples: z.array(ConstructionPrincipleSchema).min(2, "At least 2 construction principles are required"),
  }),
  layoutPrinciples: z.object({
    spacing: z.string().min(5, "Spacing principle is required"),
    density: z.string().min(5, "Density guidance is required"),
    hierarchy: z.string().min(5, "Hierarchy rule is required"),
    shapeLanguage: z.string().min(5, "Shape language description is required"),
    composition: z.string().min(5, "Composition rule is required"),
  }),
});

export type VisualDirectionOutput = z.infer<typeof VisualDirectionOutputSchema>;

/**
 * Visual Direction state persisted on BrandState.
 */
export const VisualDirectionSchema = z.object({
  colorSystem: ColorSystemSchema.default({
    primary: [],
    secondary: [],
    neutrals: [],
    semantic: [],
    accessibility: {
      contrastNotes: "",
      wcagCompliance: "WCAG 2.1 AA",
      darkThemeConsiderations: "",
    },
  }),
  typography: VisualTypographySchema.default({
    heading: {
      fontFamily: "Instrument Serif",
      category: "Serif",
      weights: ["400"],
      usage: "Display headings and section titles",
    },
    body: {
      fontFamily: "Inter",
      category: "Sans-serif",
      weights: ["400", "500", "600"],
      usage: "Body paragraphs and interface copy",
    },
    pairing: {
      headingFont: "Instrument Serif",
      bodyFont: "Inter",
      contrast: "High contrast between editorial serif and humanist sans",
      mood: "Refined and contemporary",
    },
    rationale: "",
  }),
  visualPersonality: VisualPersonalitySchema.default({
    aestheticMood: "",
    visualKeywords: [],
    designPrinciples: [],
    imageryDirection: "",
  }),
  imagery: VisualImagerySchema.default({
    photographyDirection: "",
    illustrationDirection: "",
    composition: "",
    subjectTreatment: "",
  }),
  logoDirection: VisualLogoDirectionSchema.default({
    concept: "",
    markDirection: "",
    wordmarkDirection: "",
    constructionPrinciples: [],
  }),
  layoutPrinciples: LayoutPrinciplesSchema.default({
    spacing: "",
    density: "",
    hierarchy: "",
    shapeLanguage: "",
    composition: "",
  }),
  // Backwards compatibility properties
  overallAesthetic: z.string().default(""),
  colors: z.array(ColorSwatchSchema).default([]),
  isGenerated: z.boolean().default(false),
  generatedAt: z.string().optional(),
});

export type VisualDirection = z.infer<typeof VisualDirectionSchema>;

// ============================================================================
// 5. CHALLENGE / CRITIC STAGE TYPES (PHASE 6)
// ============================================================================

export const CriticSeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export type CriticSeverity = z.infer<typeof CriticSeveritySchema>;

export const CriticCategorySchema = z.enum([
  "generic_language",
  "weak_positioning",
  "audience_mismatch",
  "contradictions",
  "weak_differentiation",
  "name_personality_mismatch",
  "name_positioning_mismatch",
  "visual_personality_mismatch",
  "voice_inconsistency",
  "cliches",
  "unsupported_claims",
  "missing_information",
]);
export type CriticCategory = z.infer<typeof CriticCategorySchema>;

export const CriticIssueSchema = z.object({
  id: z.string(),
  severity: CriticSeveritySchema,
  category: z.union([CriticCategorySchema, z.string()]),
  evidence: z.string().min(1, "Evidence is required"),
  explanation: z.string().min(5, "Explanation is required"),
  suggestedRevision: z.string().min(5, "Suggested revision is required"),
});

export type CriticIssue = z.infer<typeof CriticIssueSchema>;

export const CriticReadinessSchema = z.enum(["ready", "needs_revision", "not_ready"]);
export type CriticReadiness = z.infer<typeof CriticReadinessSchema>;

/**
 * Output schema returned by LLM for Critic Agent.
 */
export const CriticOutputSchema = z.object({
  overallAssessment: z.string().min(10, "Overall assessment is required"),
  strengths: z.array(z.string()).default([]),
  issues: z.array(CriticIssueSchema).default([]),
  blockingIssues: z.union([z.array(CriticIssueSchema), z.array(z.string())]).default([]),
  readiness: CriticReadinessSchema.default("needs_revision"),
});

export type CriticOutput = z.infer<typeof CriticOutputSchema>;

export const CritiqueItemSchema = z.object({
  id: z.string(),
  aspect: z.enum([
    "positioning",
    "naming",
    "differentiation",
    "voice_cohesion",
    "visual_alignment",
    "audience_resonance",
  ]),
  severity: z.enum(["low", "medium", "critical"]),
  challenge: z.string(),
  recommendedAction: z.string(),
  resolved: z.boolean().default(false),
});

export type CritiqueItem = z.infer<typeof CritiqueItemSchema>;

export const CritiqueSchema = z.object({
  overallAssessment: z.string().default(""),
  readiness: CriticReadinessSchema.default("needs_revision"),
  strengths: z.array(z.string()).default([]),
  issues: z.array(CriticIssueSchema).default([]),
  blockingIssues: z.union([z.array(CriticIssueSchema), z.array(z.string())]).default([]),
  summary: z.string().default(""),
  critiques: z.array(CritiqueItemSchema).default([]),
  genericLanguageDetected: z.array(z.string()).default([]),
  vulnerabilities: z.array(z.string()).default([]),
  isEvaluated: z.boolean().default(false),
  evaluatedAt: z.string().optional(),
});

export type Critique = z.infer<typeof CritiqueSchema>;

// ============================================================================
// 5. CONSISTENCY STAGE TYPES (PHASE 7)
// ============================================================================

export const ConsistencyDimensionStatusSchema = z.enum(["coherent", "warning", "inconsistent"]);
export type ConsistencyDimensionStatus = z.infer<typeof ConsistencyDimensionStatusSchema>;

export const ConsistencyReadinessSchema = z.enum(["coherent", "mostly_coherent", "inconsistent"]);
export type ConsistencyReadiness = z.infer<typeof ConsistencyReadinessSchema>;

export const ConsistencyDimensionAssessmentSchema = z.object({
  status: ConsistencyDimensionStatusSchema.default("coherent"),
  findings: z.array(z.string()).default([]),
});
export type ConsistencyDimensionAssessment = z.infer<typeof ConsistencyDimensionAssessmentSchema>;

export const CrossSystemIssueSeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export type CrossSystemIssueSeverity = z.infer<typeof CrossSystemIssueSeveritySchema>;

export const CrossSystemIssueSchema = z.object({
  id: z.string().min(1, "Issue ID is required"),
  severity: CrossSystemIssueSeveritySchema,
  relationship: z.string().min(1, "Relationship dimension is required"),
  evidence: z.string().min(1, "Evidence is required"),
  explanation: z.string().min(1, "Explanation is required"),
  recommendation: z.string().min(1, "Recommendation is required"),
});
export type CrossSystemIssue = z.infer<typeof CrossSystemIssueSchema>;

/**
 * Output schema returned by LLM for Consistency Agent.
 */
export const ConsistencyOutputSchema = z.object({
  overallAssessment: z.string().min(10, "Overall assessment must be substantive"),
  readiness: ConsistencyReadinessSchema.default("mostly_coherent"),
  strategic: ConsistencyDimensionAssessmentSchema,
  audience: ConsistencyDimensionAssessmentSchema,
  personality: ConsistencyDimensionAssessmentSchema,
  naming: ConsistencyDimensionAssessmentSchema,
  voice: ConsistencyDimensionAssessmentSchema,
  visual: ConsistencyDimensionAssessmentSchema,
  messaging: ConsistencyDimensionAssessmentSchema,
  crossSystemIssues: z.array(CrossSystemIssueSchema).default([]),
  strengths: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});
export type ConsistencyOutput = z.infer<typeof ConsistencyOutputSchema>;

export const ConsistencyAlignmentSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(100),
  observation: z.string(),
  isAligned: z.boolean(),
});

export type ConsistencyAlignment = z.infer<typeof ConsistencyAlignmentSchema>;

export const ConsistencySchema = z.object({
  isEvaluated: z.boolean().default(false),
  evaluatedAt: z.string().optional(),
  overallAssessment: z.string().default(""),
  readiness: ConsistencyReadinessSchema.default("inconsistent"),
  strategic: ConsistencyDimensionAssessmentSchema.default({ status: "inconsistent", findings: [] }),
  audience: ConsistencyDimensionAssessmentSchema.default({ status: "inconsistent", findings: [] }),
  personality: ConsistencyDimensionAssessmentSchema.default({ status: "inconsistent", findings: [] }),
  naming: ConsistencyDimensionAssessmentSchema.default({ status: "inconsistent", findings: [] }),
  voice: ConsistencyDimensionAssessmentSchema.default({ status: "inconsistent", findings: [] }),
  visual: ConsistencyDimensionAssessmentSchema.default({ status: "inconsistent", findings: [] }),
  messaging: ConsistencyDimensionAssessmentSchema.default({ status: "inconsistent", findings: [] }),
  crossSystemIssues: z.array(CrossSystemIssueSchema).default([]),
  strengths: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),

  // Backwards compatibility legacy fields
  overallCoherenceScore: z.number().min(0).max(100).default(0),
  alignments: z.array(ConsistencyAlignmentSchema).default([]),
  crossStageConflicts: z.array(z.string()).default([]),
  finalRecommendation: z.string().default(""),
});

export type Consistency = z.infer<typeof ConsistencySchema>;

// ============================================================================
// 6. DELIVERY STAGE TYPES (PHASE 8)
// ============================================================================

export const DeliveryBrandOverviewSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  positioning: z.string().min(1, "Positioning summary is required"),
  audience: z.string().min(1, "Target audience summary is required"),
  personality: z.string().min(1, "Personality archetype summary is required"),
  differentiator: z.string().min(1, "Core differentiator is required"),
});

export type DeliveryBrandOverview = z.infer<typeof DeliveryBrandOverviewSchema>;

export const DeliveryMessagingPillarSchema = z.object({
  pillar: z.string().min(1, "Pillar title is required"),
  headline: z.string().min(1, "Headline is required"),
  description: z.string().min(1, "Description is required"),
});

export type DeliveryMessagingPillar = z.infer<typeof DeliveryMessagingPillarSchema>;

export const DeliveryMessagingSchema = z.object({
  coreMessage: z.string().min(1, "Core message is required"),
  valueProposition: z.string().min(1, "Value proposition is required"),
  elevatorPitch: z.string().min(1, "Elevator pitch is required"),
  keyMessages: z.array(z.string()).default([]),
  messagingPillars: z.array(DeliveryMessagingPillarSchema).default([]),
});

export type DeliveryMessaging = z.infer<typeof DeliveryMessagingSchema>;

export const DeliveryVocabularyGuidanceSchema = z.object({
  preferred: z.array(z.string()).default([]),
  avoid: z.array(z.string()).default([]),
});

export type DeliveryVocabularyGuidance = z.infer<typeof DeliveryVocabularyGuidanceSchema>;

export const DeliveryVoiceGuidelinesSchema = z.object({
  voiceSummary: z.string().min(1, "Voice summary is required"),
  doRules: z.array(z.string()).default([]),
  dontRules: z.array(z.string()).default([]),
  vocabularyGuidance: DeliveryVocabularyGuidanceSchema.default({ preferred: [], avoid: [] }),
  exampleLines: z.array(z.string()).default([]),
});

export type DeliveryVoiceGuidelines = z.infer<typeof DeliveryVoiceGuidelinesSchema>;

export const DeliveryVisualGuidelinesSchema = z.object({
  colorDirection: z.string().min(1, "Color direction is required"),
  typographyDirection: z.string().min(1, "Typography direction is required"),
  imageryDirection: z.string().min(1, "Imagery direction is required"),
  logoGuidance: z.string().min(1, "Logo guidance is required"),
  compositionGuidance: z.string().min(1, "Composition guidance is required"),
});

export type DeliveryVisualGuidelines = z.infer<typeof DeliveryVisualGuidelinesSchema>;

export const DeliveryUsageGuidanceSchema = z.object({
  website: z.string().default(""),
  social: z.string().default(""),
  presentations: z.string().default(""),
  marketing: z.string().default(""),
});

export type DeliveryUsageGuidance = z.infer<typeof DeliveryUsageGuidanceSchema>;

export const DeliveryItemSchema = z.object({
  id: z.string().min(1, "Deliverable ID is required"),
  type: z.string().min(1, "Deliverable type is required"),
  title: z.string().min(1, "Deliverable title is required"),
  description: z.string().min(1, "Deliverable description is required"),
  content: z.string().min(1, "Deliverable content is required"),
});

export type DeliveryItem = z.infer<typeof DeliveryItemSchema>;

export const DeliveryOutputSchema = z.object({
  brandOverview: DeliveryBrandOverviewSchema,
  messaging: DeliveryMessagingSchema,
  voiceGuidelines: DeliveryVoiceGuidelinesSchema,
  visualGuidelines: DeliveryVisualGuidelinesSchema,
  usageGuidance: DeliveryUsageGuidanceSchema,
  deliverables: z.array(DeliveryItemSchema).default([]),
  warnings: z.array(z.string()).default([]),
});

export type DeliveryOutput = z.infer<typeof DeliveryOutputSchema>;

export const DeliverySchema = z.object({
  isDelivered: z.boolean().default(false),
  deliveredAt: z.string().optional(),
  brandOverview: DeliveryBrandOverviewSchema.default({
    name: "",
    positioning: "",
    audience: "",
    personality: "",
    differentiator: "",
  }),
  messaging: DeliveryMessagingSchema.default({
    coreMessage: "",
    valueProposition: "",
    elevatorPitch: "",
    keyMessages: [],
    messagingPillars: [],
  }),
  voiceGuidelines: DeliveryVoiceGuidelinesSchema.default({
    voiceSummary: "",
    doRules: [],
    dontRules: [],
    vocabularyGuidance: { preferred: [], avoid: [] },
    exampleLines: [],
  }),
  visualGuidelines: DeliveryVisualGuidelinesSchema.default({
    colorDirection: "",
    typographyDirection: "",
    imageryDirection: "",
    logoGuidance: "",
    compositionGuidance: "",
  }),
  usageGuidance: DeliveryUsageGuidanceSchema.default({
    website: "",
    social: "",
    presentations: "",
    marketing: "",
  }),
  deliverables: z.array(DeliveryItemSchema).default([]),
  warnings: z.array(z.string()).default([]),
});

export type Delivery = z.infer<typeof DeliverySchema>;

// ============================================================================
// 7. FINAL BRAND KIT STAGE TYPES (PHASE 9)
// ============================================================================

export const BrandKitCompletenessSchema = z.object({
  discovery: z.boolean().default(false),
  positioning: z.boolean().default(false),
  personality: z.boolean().default(false),
  naming: z.boolean().default(false),
  voice: z.boolean().default(false),
  visualDirection: z.boolean().default(false),
  critique: z.boolean().default(false),
  consistency: z.boolean().default(false),
  delivery: z.boolean().default(false),
  isComplete: z.boolean().default(false),
});

export type BrandKitCompleteness = z.infer<typeof BrandKitCompletenessSchema>;

export const BrandKitOverviewSchema = z.object({
  name: z.string().min(1, "Authoritative brand name is required"),
  coreMessage: z.string().min(1, "Core message is required"),
  positioning: z.string().min(1, "Positioning statement is required"),
  audience: z.string().min(1, "Target audience is required"),
  personality: z.string().min(1, "Personality archetype is required"),
  differentiator: z.string().min(1, "Core differentiator is required"),
  tagline: z.string().default(""),
});

export type BrandKitOverview = z.infer<typeof BrandKitOverviewSchema>;

export const BrandKitDiscoverySchema = z.object({
  rawIdea: z.string().default(""),
  problem: z.string().default(""),
  targetAudience: z.object({
    primary: z.string().default(""),
    secondary: z.array(z.string()).default([]),
    characteristics: z.array(z.string()).default([]),
    painPoints: z.array(z.string()).default([]),
    motivations: z.array(z.string()).default([]),
  }).default({
    primary: "",
    secondary: [],
    characteristics: [],
    painPoints: [],
    motivations: [],
  }),
  userNeeds: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
});

export type BrandKitDiscovery = z.infer<typeof BrandKitDiscoverySchema>;

export const BrandKitPositioningSchema = z.object({
  category: z.string().default(""),
  categoryRationale: z.string().default(""),
  positioningStatement: z.string().default(""),
  differentiator: z.string().default(""),
  valueProposition: z.string().default(""),
  competitiveWhitespace: z.array(z.string()).default([]),
  proofPoints: z.array(z.string()).default([]),
  alternatives: z.array(z.string()).default([]),
  confidence: z.number().default(0),
});

export type BrandKitPositioning = z.infer<typeof BrandKitPositioningSchema>;

export const PersonalityPrincipleItemSchema = z.union([
  z.object({
    title: z.string(),
    description: z.string(),
  }),
  z.string().transform((str) => {
    const parts = str.split(":");
    return {
      title: parts[0]?.trim() || "Principle",
      description: parts.slice(1).join(":").trim() || str,
    };
  }),
]);

export const BrandKitPersonalitySchema = z.object({
  archetype: z.string().default(""),
  archetypeRationale: z.string().default(""),
  traits: z.array(z.string()).default([]),
  behavioralCharacteristics: z.array(z.string()).default([]),
  principles: z.array(PersonalityPrincipleItemSchema).default([]),
  emotionalTerritory: z.string().default(""),
  personalityDo: z.array(z.string()).default([]),
  personalityDont: z.array(z.string()).default([]),
});

export type BrandKitPersonality = z.infer<typeof BrandKitPersonalitySchema>;

export const BrandKitNamingSchema = z.object({
  selectedName: z.string().min(1, "Authoritative brand name is required"),
  selectedTagline: z.string().default(""),
  rationale: z.string().default(""),
  linguisticRationale: z.string().default(""),
  phoneticAssessment: z.string().default(""),
  domainSuitability: z.string().default(""),
  directionName: z.string().default(""),
});

export type BrandKitNaming = z.infer<typeof BrandKitNamingSchema>;

export const BrandKitVoiceSchema = z.object({
  voiceSummary: z.string().default(""),
  primaryTone: z.string().default(""),
  secondaryTones: z.array(z.string()).default([]),
  tonalBalance: z.string().default(""),
  emotionalEffect: z.string().default(""),
  vocabulary: z.object({
    preferred: z.array(z.string()).default([]),
    avoid: z.array(z.string()).default([]),
  }).default({ preferred: [], avoid: [] }),
  doRules: z.array(z.string()).default([]),
  dontRules: z.array(z.string()).default([]),
  examples: z.object({
    homepageHero: z.string().default(""),
    shortPitch: z.string().default(""),
    primaryCTA: z.string().default(""),
    socialPost: z.string().default(""),
  }).default({ homepageHero: "", shortPitch: "", primaryCTA: "", socialPost: "" }),
});

export type BrandKitVoice = z.infer<typeof BrandKitVoiceSchema>;

export const BrandKitMessagingSchema = DeliveryMessagingSchema;
export type BrandKitMessaging = z.infer<typeof BrandKitMessagingSchema>;

export const BrandKitVisualDirectionSchema = z.object({
  aestheticMood: z.string().default(""),
  visualKeywords: z.array(z.string()).default([]),
  colorSystem: ColorSystemSchema.default({
    primary: [],
    secondary: [],
    neutrals: [],
    semantic: [],
    accessibility: { contrastNotes: "", wcagCompliance: "WCAG 2.1 AA", darkThemeConsiderations: "" },
  }),
  typography: VisualTypographySchema.default({
    heading: { fontFamily: "Instrument Serif", category: "Serif", weights: ["400"], usage: "Headings" },
    body: { fontFamily: "Inter", category: "Sans-serif", weights: ["400", "500", "600"], usage: "Body" },
    pairing: { headingFont: "Instrument Serif", bodyFont: "Inter", contrast: "High contrast", mood: "Refined" },
    rationale: "",
  }),
  imagery: VisualImagerySchema.default({
    photographyDirection: "",
    illustrationDirection: "",
    composition: "",
    subjectTreatment: "",
  }),
  logoDirection: VisualLogoDirectionSchema.default({
    concept: "",
    markDirection: "",
    wordmarkDirection: "",
    constructionPrinciples: [],
  }),
  layoutPrinciples: LayoutPrinciplesSchema.default({
    spacing: "",
    density: "",
    hierarchy: "",
    shapeLanguage: "",
    composition: "",
  }),
  guidelinesSummary: DeliveryVisualGuidelinesSchema.default({
    colorDirection: "",
    typographyDirection: "",
    imageryDirection: "",
    logoGuidance: "",
    compositionGuidance: "",
  }),
});

export type BrandKitVisualDirection = z.infer<typeof BrandKitVisualDirectionSchema>;

export const BrandKitConsistencySummarySchema = z.object({
  readiness: ConsistencyReadinessSchema.default("inconsistent"),
  overallAssessment: z.string().default(""),
  strengths: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  crossSystemIssues: z.array(CrossSystemIssueSchema).default([]),
  isEvaluated: z.boolean().default(false),
  evaluatedAt: z.string().optional(),
});

export type BrandKitConsistencySummary = z.infer<typeof BrandKitConsistencySummarySchema>;

export const BrandKitUsageSchema = DeliveryUsageGuidanceSchema;
export type BrandKitUsage = z.infer<typeof BrandKitUsageSchema>;

export const BrandKitDeliveryAssetSchema = DeliveryItemSchema;
export type BrandKitDeliveryAsset = z.infer<typeof BrandKitDeliveryAssetSchema>;

export const FinalBrandKitSchema = z.object({
  brandName: z.string().min(1, "Authoritative brand name is required"),
  tagline: z.string().default(""),
  generatedAt: z.string().optional(),
  assembledAt: z.string().optional(),
  completeness: BrandKitCompletenessSchema,
  overview: BrandKitOverviewSchema,
  discovery: BrandKitDiscoverySchema,
  positioning: BrandKitPositioningSchema,
  personality: BrandKitPersonalitySchema,
  naming: BrandKitNamingSchema,
  voice: BrandKitVoiceSchema,
  messaging: BrandKitMessagingSchema,
  visualDirection: BrandKitVisualDirectionSchema,
  consistency: BrandKitConsistencySummarySchema,
  usage: BrandKitUsageSchema,
  deliveryAssets: z.array(BrandKitDeliveryAssetSchema).default([]),
  warnings: z.array(z.string()).default([]),

  // Backwards compatibility legacy fields
  missionStatement: z.string().default(""),
  brandManifesto: z.string().default(""),
  elevatorPitch: z.string().default(""),
  corePillars: z.array(z.string()).default([]),
  colorPalette: z.array(ColorSwatchSchema).default([]),
  typography: TypographySchema.default({
    headingFont: "",
    bodyFont: "",
    pairingRationale: "",
  }),
  voicePrinciples: z.array(z.string()).default([]),
  dosAndDonts: z.array(
    z.object({
      guideline: z.string(),
      type: z.enum(["do", "dont"]),
    })
  ).default([]),
  assetChecklist: z.array(z.string()).default([]),
});

export type FinalBrandKit = z.infer<typeof FinalBrandKitSchema>;

// ============================================================================
// 8. COMPOSITE BRAND STATE
// ============================================================================

export const BrandStateSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().optional(),
  version: z.number().int().positive().default(1),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),

  // Workflow Core Sections
  discovery: DiscoverySchema,
  positioning: PositioningSchema,
  personality: BrandPersonalitySchema,
  naming: NamingSchema,
  voice: VoiceSchema,
  visualDirection: VisualDirectionSchema,
  critique: CritiqueSchema,
  consistency: ConsistencySchema,
  delivery: DeliverySchema.default({
    isDelivered: false,
    brandOverview: {
      name: "",
      positioning: "",
      audience: "",
      personality: "",
      differentiator: "",
    },
    messaging: {
      coreMessage: "",
      valueProposition: "",
      elevatorPitch: "",
      keyMessages: [],
      messagingPillars: [],
    },
    voiceGuidelines: {
      voiceSummary: "",
      doRules: [],
      dontRules: [],
      vocabularyGuidance: { preferred: [], avoid: [] },
      exampleLines: [],
    },
    visualGuidelines: {
      colorDirection: "",
      typographyDirection: "",
      imageryDirection: "",
      logoGuidance: "",
      compositionGuidance: "",
    },
    usageGuidance: {
      website: "",
      social: "",
      presentations: "",
      marketing: "",
    },
    deliverables: [],
    warnings: [],
  }),
  finalBrandKit: FinalBrandKitSchema.nullable().default(null),
});

export type BrandState = z.infer<typeof BrandStateSchema>;

/**
 * Creates a clean default BrandState initialized with a raw idea.
 */
export function createInitialBrandState(rawIdea: string, projectId?: string): BrandState {
  const timestamp = new Date().toISOString();
  return {
    projectId,
    version: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    discovery: {
      rawIdea,
      problem: "",
      targetAudience: {
        primary: "",
        secondary: [],
        characteristics: [],
        painPoints: [],
        motivations: [],
      },
      userNeeds: [],
      constraints: [],
      assumptions: [],
      missingInformation: [],
      clarifyingQuestions: [],
      isAnalyzed: false,
    },
    positioning: {
      category: "",
      categoryRationale: "",
      positioningStatement: "",
      differentiator: "",
      valueProposition: "",
      competitiveWhitespace: [],
      alternatives: [],
      proofPoints: [],
      risks: [],
      confidence: 0,
      isPositioned: false,
    },
    personality: {
      archetype: "",
      archetypeRationale: "",
      traits: [],
      behavioralCharacteristics: [],
      principles: [],
      emotionalTerritory: "",
      personalityDo: [],
      personalityDont: [],
      confidence: 0,
      isFormulated: false,
    },
    naming: {
      directions: [],
      selectedDirectionId: null,
      selectedName: null,
      selectedTagline: null,
      isGenerated: false,
      isSelected: false,
    },
    voice: {
      toneProfile: {
        primary: "",
        secondary: [],
        tonalBalance: "",
        emotionalEffect: "",
      },
      toneDimensions: [],
      vocabulary: {
        preferred: [],
        avoid: [],
        terminology: [],
        languageCharacteristics: [],
      },
      messagingPillars: [],
      communicationPrinciples: [],
      writingGuidelines: {
        sentenceStyle: [],
        structure: [],
        callsToAction: [],
        punctuationAndFormatting: [],
      },
      examples: {
        homepageHero: "",
        shortPitch: "",
        primaryCTA: "",
        socialPost: "",
      },
      voiceDonts: [],
      consistencyRules: [],
      isGenerated: false,
    },
    visualDirection: {
      colorSystem: {
        primary: [],
        secondary: [],
        neutrals: [],
        semantic: [],
        accessibility: {
          contrastNotes: "",
          wcagCompliance: "WCAG 2.1 AA",
          darkThemeConsiderations: "",
        },
      },
      typography: {
        heading: {
          fontFamily: "Instrument Serif",
          category: "Serif",
          weights: ["400"],
          usage: "Display headings and section titles",
        },
        body: {
          fontFamily: "Inter",
          category: "Sans-serif",
          weights: ["400", "500", "600"],
          usage: "Body paragraphs and interface copy",
        },
        pairing: {
          headingFont: "Instrument Serif",
          bodyFont: "Inter",
          contrast: "High contrast between editorial serif and humanist sans",
          mood: "Refined and contemporary",
        },
        rationale: "",
      },
      visualPersonality: {
        aestheticMood: "",
        visualKeywords: [],
        designPrinciples: [],
        imageryDirection: "",
      },
      imagery: {
        photographyDirection: "",
        illustrationDirection: "",
        composition: "",
        subjectTreatment: "",
      },
      logoDirection: {
        concept: "",
        markDirection: "",
        wordmarkDirection: "",
        constructionPrinciples: [],
      },
      layoutPrinciples: {
        spacing: "",
        density: "",
        hierarchy: "",
        shapeLanguage: "",
        composition: "",
      },
      overallAesthetic: "",
      colors: [],
      isGenerated: false,
    },
    critique: {
      overallAssessment: "",
      readiness: "needs_revision",
      strengths: [],
      issues: [],
      blockingIssues: [],
      summary: "",
      critiques: [],
      genericLanguageDetected: [],
      vulnerabilities: [],
      isEvaluated: false,
    },
    consistency: {
      isEvaluated: false,
      overallAssessment: "",
      readiness: "inconsistent",
      strategic: { status: "inconsistent", findings: [] },
      audience: { status: "inconsistent", findings: [] },
      personality: { status: "inconsistent", findings: [] },
      naming: { status: "inconsistent", findings: [] },
      voice: { status: "inconsistent", findings: [] },
      visual: { status: "inconsistent", findings: [] },
      messaging: { status: "inconsistent", findings: [] },
      crossSystemIssues: [],
      strengths: [],
      warnings: [],
      overallCoherenceScore: 0,
      alignments: [],
      crossStageConflicts: [],
      finalRecommendation: "",
    },
    delivery: {
      isDelivered: false,
      brandOverview: {
        name: "",
        positioning: "",
        audience: "",
        personality: "",
        differentiator: "",
      },
      messaging: {
        coreMessage: "",
        valueProposition: "",
        elevatorPitch: "",
        keyMessages: [],
        messagingPillars: [],
      },
      voiceGuidelines: {
        voiceSummary: "",
        doRules: [],
        dontRules: [],
        vocabularyGuidance: { preferred: [], avoid: [] },
        exampleLines: [],
      },
      visualGuidelines: {
        colorDirection: "",
        typographyDirection: "",
        imageryDirection: "",
        logoGuidance: "",
        compositionGuidance: "",
      },
      usageGuidance: {
        website: "",
        social: "",
        presentations: "",
        marketing: "",
      },
      deliverables: [],
      warnings: [],
    },
    finalBrandKit: null,
  };
}
