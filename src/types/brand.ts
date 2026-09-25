import { z } from "zod";

// ============================================================================
// 1. DISCOVERY STAGE TYPES
// ============================================================================

export const DiscoverySchema = z.object({
  rawIdea: z.string().min(1, "Raw idea is required"),
  problem: z.string().default(""),
  targetAudience: z.object({
    primary: z.string().default(""),
    secondary: z.string().optional(),
    painPoints: z.array(z.string()).default([]),
    motivations: z.array(z.string()).default([]),
  }).default({ primary: "", painPoints: [], motivations: [] }),
  userNeeds: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  detectedGaps: z.array(z.string()).default([]),
});

export type Discovery = z.infer<typeof DiscoverySchema>;

// ============================================================================
// 2. POSITIONING STAGE TYPES
// ============================================================================

export const PositioningSchema = z.object({
  category: z.string().default(""),
  positioning: z.string().default(""),
  differentiator: z.string().default(""),
  valueProposition: z.string().default(""),
  marketAngle: z.string().default(""),
  competitiveContrast: z.string().default(""),
});

export type Positioning = z.infer<typeof PositioningSchema>;

// ============================================================================
// 3. SHAPE STAGE TYPES (Personality, Naming, Voice)
// ============================================================================

export const BrandPersonalitySchema = z.object({
  archetype: z.string().default(""),
  traits: z.array(z.string()).default([]),
  principles: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ).default([]),
  emotionalHook: z.string().default(""),
});

export type BrandPersonality = z.infer<typeof BrandPersonalitySchema>;

export const NameCandidateSchema = z.object({
  name: z.string(),
  rationale: z.string(),
  tone: z.string(),
  domainSuitability: z.string().optional(),
});

export type NameCandidate = z.infer<typeof NameCandidateSchema>;

export const NamingSchema = z.object({
  namingDirections: z.array(
    z.object({
      direction: z.string(),
      explanation: z.string(),
      candidates: z.array(NameCandidateSchema),
    })
  ).default([]),
  selectedName: z.string().nullable().default(null),
  tagline: z.string().nullable().default(null),
  taglineOptions: z.array(z.string()).default([]),
});

export type Naming = z.infer<typeof NamingSchema>;

export const VoiceSchema = z.object({
  toneAttributes: z.array(z.string()).default([]),
  voiceGuidelines: z.array(
    z.object({
      do: z.string(),
      dont: z.string(),
      example: z.string(),
    })
  ).default([]),
  messaging: z.object({
    oneLiner: z.string().default(""),
    elevatorPitch: z.string().default(""),
    pillars: z.array(
      z.object({
        pillar: z.string(),
        statement: z.string(),
      })
    ).default([]),
  }).default({ oneLiner: "", elevatorPitch: "", pillars: [] }),
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

export const VisualDirectionSchema = z.object({
  overallAesthetic: z.string().default(""),
  colors: z.array(ColorSwatchSchema).default([]),
  typography: TypographySchema.default({
    headingFont: "Instrument Serif",
    bodyFont: "Inter",
    pairingRationale: "",
  }),
  imagery: ImageryDirectionSchema.default({
    style: "",
    moodKeywords: [],
    visualMetaphors: [],
    lightingAndTexture: "",
  }),
  logoDirection: LogoDirectionSchema.default({
    concept: "",
    symbolism: "",
    formLanguage: "",
    compositionNotes: "",
  }),
});

export type VisualDirection = z.infer<typeof VisualDirectionSchema>;

// ============================================================================
// 5. CHALLENGE & CONSISTENCY STAGE TYPES
// ============================================================================

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
  summary: z.string().default(""),
  critiques: z.array(CritiqueItemSchema).default([]),
  genericLanguageDetected: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  vulnerabilities: z.array(z.string()).default([]),
});

export type Critique = z.infer<typeof CritiqueSchema>;

export const ConsistencyAlignmentSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(100),
  observation: z.string(),
  isAligned: z.boolean(),
});

export type ConsistencyAlignment = z.infer<typeof ConsistencyAlignmentSchema>;

export const ConsistencySchema = z.object({
  overallCoherenceScore: z.number().min(0).max(100).default(0),
  alignments: z.array(ConsistencyAlignmentSchema).default([]),
  crossStageConflicts: z.array(z.string()).default([]),
  finalRecommendation: z.string().default(""),
});

export type Consistency = z.infer<typeof ConsistencySchema>;

// ============================================================================
// 6. DELIVER STAGE TYPES (Final Brand Kit)
// ============================================================================

export const FinalBrandKitSchema = z.object({
  brandName: z.string().default(""),
  tagline: z.string().default(""),
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
  generatedAt: z.string().optional(),
});

export type FinalBrandKit = z.infer<typeof FinalBrandKitSchema>;

// ============================================================================
// 7. COMPOSITE BRAND STATE
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
      targetAudience: { primary: "", painPoints: [], motivations: [] },
      userNeeds: [],
      constraints: [],
      detectedGaps: [],
    },
    positioning: {
      category: "",
      positioning: "",
      differentiator: "",
      valueProposition: "",
      marketAngle: "",
      competitiveContrast: "",
    },
    personality: {
      archetype: "",
      traits: [],
      principles: [],
      emotionalHook: "",
    },
    naming: {
      namingDirections: [],
      selectedName: null,
      tagline: null,
      taglineOptions: [],
    },
    voice: {
      toneAttributes: [],
      voiceGuidelines: [],
      messaging: { oneLiner: "", elevatorPitch: "", pillars: [] },
    },
    visualDirection: {
      overallAesthetic: "",
      colors: [],
      typography: {
        headingFont: "Instrument Serif",
        bodyFont: "Inter",
        pairingRationale: "",
      },
      imagery: {
        style: "",
        moodKeywords: [],
        visualMetaphors: [],
        lightingAndTexture: "",
      },
      logoDirection: {
        concept: "",
        symbolism: "",
        formLanguage: "",
        compositionNotes: "",
      },
    },
    critique: {
      summary: "",
      critiques: [],
      genericLanguageDetected: [],
      strengths: [],
      vulnerabilities: [],
    },
    consistency: {
      overallCoherenceScore: 0,
      alignments: [],
      crossStageConflicts: [],
      finalRecommendation: "",
    },
    finalBrandKit: null,
  };
}
