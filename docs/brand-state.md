# PinkLoom Brand State Specification

## Overview

The `BrandState` is the single source of truth for a project undergoing the PinkLoom pipeline. It is a strongly typed, deterministic data structure validated at runtime via Zod schemas.

---

## State Structure

```typescript
export interface BrandState {
  id?: string;
  projectId?: string;
  version: number;
  createdAt?: string;
  updatedAt?: string;

  // 1. DISCOVER
  discovery: {
    rawIdea: string;
    problem: string;
    targetAudience: {
      primary: string;
      secondary?: string;
      painPoints: string[];
      motivations: string[];
    };
    userNeeds: string[];
    constraints: string[];
    detectedGaps: string[];
  };

  // 2. POSITION
  positioning: {
    category: string;
    positioning: string;
    differentiator: string;
    valueProposition: string;
    marketAngle: string;
    competitiveContrast: string;
  };

  // 3. SHAPE
  personality: {
    archetype: string;
    traits: string[];
    principles: Array<{ title: string; description: string }>;
    emotionalHook: string;
  };
  naming: {
    namingDirections: Array<{
      direction: string;
      explanation: string;
      candidates: Array<{ name: string; rationale: string; tone: string }>;
    }>;
    selectedName: string | null;
    tagline: string | null;
    taglineOptions: string[];
  };
  voice: {
    toneAttributes: string[];
    voiceGuidelines: Array<{ do: string; dont: string; example: string }>;
    messaging: {
      oneLiner: string;
      elevatorPitch: string;
      pillars: Array<{ pillar: string; statement: string }>;
    };
  };

  // 4. VISUALIZE
  visualDirection: {
    overallAesthetic: string;
    colors: Array<{
      role: "primary" | "secondary" | "accent" | "background" | "surface" | "text";
      name: string;
      hex: string;
      hsl?: string;
      rationale: string;
    }>;
    typography: {
      headingFont: string;
      bodyFont: string;
      accentFont?: string;
      pairingRationale: string;
      sampleScale?: Record<string, string>;
    };
    imagery: {
      style: string;
      moodKeywords: string[];
      visualMetaphors: string[];
      lightingAndTexture: string;
    };
    logoDirection: {
      concept: string;
      symbolism: string;
      formLanguage: string;
      compositionNotes: string;
    };
  };

  // 5. CHALLENGE
  critique: {
    summary: string;
    critiques: Array<{
      id: string;
      aspect: "positioning" | "naming" | "differentiation" | "voice_cohesion" | "visual_alignment" | "audience_resonance";
      severity: "low" | "medium" | "critical";
      challenge: string;
      recommendedAction: string;
      resolved: boolean;
    }>;
    genericLanguageDetected: string[];
    strengths: string[];
    vulnerabilities: string[];
  };

  // 6. CONSISTENCY
  consistency: {
    overallCoherenceScore: number; // 0 - 100
    alignments: Array<{
      dimension: string;
      score: number;
      observation: string;
      isAligned: boolean;
    }>;
    crossStageConflicts: string[];
    finalRecommendation: string;
  };

  // 7. DELIVER
  finalBrandKit: {
    brandName: string;
    tagline: string;
    missionStatement: string;
    brandManifesto: string;
    elevatorPitch: string;
    corePillars: string[];
    colorPalette: ColorSwatch[];
    typography: Typography;
    voicePrinciples: string[];
    dosAndDonts: Array<{ guideline: string; type: "do" | "dont" }>;
    assetChecklist: string[];
    generatedAt?: string;
  } | null;
}
```

---

## State Lifecycle & Immutability

1. **Initialization (`IMPLEMENTED`)**: `createInitialBrandState(rawIdea)` generates a valid zero-state containing the raw idea with empty typed structures.
2. **Sequential Mutation (`IMPLEMENTED` contracts / `PLANNED` Phase 2 execution)**: Each agent reads relevant slices of the state and returns an `updatedStatePartial` object.
3. **Runtime Validation (`IMPLEMENTED`)**: Every update is validated through the respective Zod schema before state application.
4. **Persistence (`IMPLEMENTED` DB schema / `PLANNED` Phase 2 sync)**: Saved to Supabase PostgreSQL `brand_states` table on stage completion.
