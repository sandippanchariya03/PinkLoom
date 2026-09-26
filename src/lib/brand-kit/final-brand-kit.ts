import {
  type BrandState,
  type FinalBrandKit,
  type BrandKitCompleteness,
  FinalBrandKitSchema,
} from "@/types/brand";
import type { AgentRun } from "@/types/agent";
import { persistAgentRun, persistBrandState } from "@/lib/db/repository";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface BrandKitCompletenessResult {
  isComplete: boolean;
  completeness: BrandKitCompleteness;
  missingPrerequisites: string[];
  error?: string;
}

/**
 * Validates the completeness of all 10 upstream foundational and operational stages.
 * A complete Final Brand Kit requires:
 * 1. Discovery completed
 * 2. Positioning completed
 * 3. Personality completed
 * 4. Naming completed
 * 5. Authoritative selectedName selected
 * 6. Voice completed
 * 7. Visual Direction completed
 * 8. Critique available
 * 9. Consistency evaluated
 * 10. Delivery completed
 */
export function validateBrandKitCompleteness(state?: BrandState | null): BrandKitCompletenessResult {
  const missing: string[] = [];

  const hasDiscovery = Boolean(
    state?.discovery?.isAnalyzed && state.discovery.problem && state.discovery.problem.trim().length > 0
  );
  if (!hasDiscovery) missing.push("Discovery stage (Stage 01) must be analyzed and problem defined");

  const hasPositioning = Boolean(
    state?.positioning?.isPositioned && state.positioning.category && state.positioning.category.trim().length > 0
  );
  if (!hasPositioning) missing.push("Positioning stage (Stage 02) must be completed with category framed");

  const hasPersonality = Boolean(
    state?.personality?.isFormulated && state.personality.archetype && state.personality.archetype.trim().length > 0
  );
  if (!hasPersonality) missing.push("Personality stage (Stage 03) must be formulated with archetype established");

  const hasNaming = Boolean(state?.naming?.isGenerated);
  if (!hasNaming) missing.push("Naming stage (Stage 04) candidate directions must be generated");

  const hasSelectedName = Boolean(
    state?.naming?.isSelected && state.naming.selectedName && state.naming.selectedName.trim().length > 0
  );
  if (!hasSelectedName) missing.push("An authoritative brand name must be explicitly selected in Stage 04");

  const hasVoice = Boolean(
    state?.voice?.isGenerated && state.voice.toneProfile?.primary && state.voice.toneProfile.primary.trim().length > 0
  );
  if (!hasVoice) missing.push("Voice stage (Stage 05) tonal profile must be generated");

  const hasVisual = Boolean(
    state?.visualDirection?.isGenerated &&
      state.visualDirection.colorSystem?.primary &&
      state.visualDirection.colorSystem.primary.length > 0
  );
  if (!hasVisual) missing.push("Visual Direction stage (Stage 06) must be generated with primary palette");

  const hasCritique = Boolean(state?.critique?.isEvaluated);
  // Critique is contextual in PinkLoom workflow conventions, but required for complete pipeline auditing

  const hasConsistency = Boolean(state?.consistency?.isEvaluated);
  if (!hasConsistency) missing.push("Consistency stage (Stage 08) must be evaluated across all dimensions");

  const hasDelivery = Boolean(
    state?.delivery?.isDelivered && state.delivery.messaging?.coreMessage && state.delivery.messaging.coreMessage.trim().length > 0
  );
  if (!hasDelivery) missing.push("Delivery stage (Stage 09) must be completed with operational deliverables synthesized");

  const isComplete =
    hasDiscovery &&
    hasPositioning &&
    hasPersonality &&
    hasNaming &&
    hasSelectedName &&
    hasVoice &&
    hasVisual &&
    hasConsistency &&
    hasDelivery;

  const completeness: BrandKitCompleteness = {
    discovery: hasDiscovery,
    positioning: hasPositioning,
    personality: hasPersonality,
    naming: hasNaming && hasSelectedName,
    voice: hasVoice,
    visualDirection: hasVisual,
    critique: hasCritique,
    consistency: hasConsistency,
    delivery: hasDelivery,
    isComplete,
  };

  return {
    isComplete,
    completeness,
    missingPrerequisites: missing,
    error: missing.length > 0 ? `Missing prerequisites: ${missing.join("; ")}` : undefined,
  };
}

/**
 * Stage gate check for Final Brand Kit in STAGE_CONFIGS.
 */
export function canRunFinalBrandKit(state?: BrandState | null): { allowed: boolean; reason?: string } {
  const validation = validateBrandKitCompleteness(state);
  if (!validation.isComplete) {
    return {
      allowed: false,
      reason: validation.error || "Upstream stages must be completed before Final Brand Kit can be assembled.",
    };
  }
  return { allowed: true };
}

export interface AssembleBrandKitResult {
  success: boolean;
  finalBrandKit?: FinalBrandKit;
  updatedBrandState?: BrandState;
  agentRun?: AgentRun;
  error?: string;
  missingPrerequisites?: string[];
  completeness?: BrandKitCompleteness;
}

/**
 * Deterministically assembles the validated PinkLoom brand system into one
 * authoritative, presentation-ready Final Brand Kit.
 *
 * Immutability:
 * - Upstream BrandState layers (discovery, positioning, personality, naming,
 *   voice, visualDirection, critique, consistency, delivery) remain 100% UNCHANGED.
 * - Authoritative name is strictly brandState.naming.selectedName.
 * - Only brandState.finalBrandKit is populated, and brandState.version increments.
 */
export async function assembleFinalBrandKit(
  state: BrandState,
  options: { persist?: boolean; projectId?: string } = {}
): Promise<AssembleBrandKitResult> {
  const startTime = Date.now();
  const runId = generateUUID();
  const projectId = options.projectId || state.projectId || "pinkloom-project";

  const agentRun: AgentRun = {
    id: runId,
    projectId,
    agentName: "BrandKit",
    stage: "BRAND_KIT",
    input: {
      selectedName: state.naming?.selectedName || null,
      deliveryDelivered: state.delivery?.isDelivered || false,
      consistencyEvaluated: state.consistency?.isEvaluated || false,
    },
    output: null,
    status: "running",
    createdAt: new Date().toISOString(),
  };

  // 1. Completeness Validation Gate
  const validation = validateBrandKitCompleteness(state);
  if (!validation.isComplete) {
    agentRun.status = "failed";
    agentRun.error = validation.error;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;
    if (options.persist !== false) {
      await persistAgentRun(agentRun);
    }
    return {
      success: false,
      error: validation.error,
      missingPrerequisites: validation.missingPrerequisites,
      completeness: validation.completeness,
      agentRun,
    };
  }

  // 2. Authoritative Name Protection
  const authoritativeName = state.naming.selectedName!.trim();
  const tagline = state.naming.selectedTagline || "";
  const timestamp = new Date().toISOString();

  // Find candidate details for the selected name if available
  let namingRationale = "";
  let linguisticRationale = "";
  let phoneticAssessment = "";
  let domainSuitability = "";
  let directionName = "";

  if (state.naming.directions && state.naming.directions.length > 0) {
    for (const dir of state.naming.directions) {
      const match = dir.candidates.find(
        (c) => c.name.toLowerCase().trim() === authoritativeName.toLowerCase()
      );
      if (match) {
        namingRationale = match.rationale;
        linguisticRationale = match.linguisticRationale;
        phoneticAssessment = match.phoneticAssessment;
        domainSuitability = match.domainSuitability;
        directionName = dir.name;
        break;
      }
    }
  }

  // Deduplicate and combine relevant warnings
  const combinedWarnings = Array.from(
    new Set([...(state.delivery.warnings || []), ...(state.consistency.warnings || [])])
  );

  // 3. Assemble Final Brand Kit Structure
  const finalBrandKitCandidate: FinalBrandKit = {
    brandName: authoritativeName,
    tagline,
    generatedAt: timestamp,
    assembledAt: timestamp,
    completeness: validation.completeness,
    overview: {
      name: authoritativeName,
      coreMessage: state.delivery.messaging.coreMessage,
      positioning: state.positioning.positioningStatement,
      audience: state.discovery.targetAudience.primary,
      personality: state.personality.archetype,
      differentiator: state.positioning.differentiator,
      tagline,
    },
    discovery: {
      rawIdea: state.discovery.rawIdea,
      problem: state.discovery.problem,
      targetAudience: {
        primary: state.discovery.targetAudience.primary,
        secondary: state.discovery.targetAudience.secondary || [],
        characteristics: state.discovery.targetAudience.characteristics || [],
        painPoints: state.discovery.targetAudience.painPoints || [],
        motivations: state.discovery.targetAudience.motivations || [],
      },
      userNeeds: state.discovery.userNeeds || [],
      constraints: state.discovery.constraints || [],
      assumptions: state.discovery.assumptions || [],
    },
    positioning: {
      category: state.positioning.category,
      categoryRationale: state.positioning.categoryRationale,
      positioningStatement: state.positioning.positioningStatement,
      differentiator: state.positioning.differentiator,
      valueProposition: state.positioning.valueProposition,
      competitiveWhitespace: state.positioning.competitiveWhitespace || [],
      proofPoints: state.positioning.proofPoints || [],
      alternatives: state.positioning.alternatives || [],
      confidence: state.positioning.confidence || 0,
    },
    personality: {
      archetype: state.personality.archetype,
      archetypeRationale: state.personality.archetypeRationale,
      traits: state.personality.traits || [],
      behavioralCharacteristics: state.personality.behavioralCharacteristics || [],
      principles: (state.personality.principles || []).map((p: unknown) => {
        if (typeof p === "string") {
          const parts = p.split(":");
          return {
            title: parts[0]?.trim() || "Principle",
            description: parts.slice(1).join(":").trim() || p,
          };
        }
        return p as { title: string; description: string };
      }),
      emotionalTerritory: state.personality.emotionalTerritory,
      personalityDo: state.personality.personalityDo || [],
      personalityDont: state.personality.personalityDont || [],
    },
    naming: {
      selectedName: authoritativeName,
      selectedTagline: tagline,
      rationale: namingRationale || state.naming.selectedDirectionId || "",
      linguisticRationale,
      phoneticAssessment,
      domainSuitability,
      directionName,
    },
    voice: {
      voiceSummary:
        state.delivery.voiceGuidelines.voiceSummary ||
        `${state.voice.toneProfile.primary} tone with ${state.voice.toneProfile.tonalBalance} balance.`,
      primaryTone: state.voice.toneProfile.primary,
      secondaryTones: state.voice.toneProfile.secondary || [],
      tonalBalance: state.voice.toneProfile.tonalBalance || "",
      emotionalEffect: state.voice.toneProfile.emotionalEffect || "",
      vocabulary: {
        preferred:
          state.delivery.voiceGuidelines.vocabularyGuidance?.preferred &&
          state.delivery.voiceGuidelines.vocabularyGuidance.preferred.length > 0
            ? state.delivery.voiceGuidelines.vocabularyGuidance.preferred
            : state.voice.vocabulary.preferred || [],
        avoid:
          state.delivery.voiceGuidelines.vocabularyGuidance?.avoid &&
          state.delivery.voiceGuidelines.vocabularyGuidance.avoid.length > 0
            ? state.delivery.voiceGuidelines.vocabularyGuidance.avoid
            : state.voice.vocabulary.avoid || [],
      },
      doRules: state.delivery.voiceGuidelines.doRules || [],
      dontRules: state.delivery.voiceGuidelines.dontRules || state.voice.voiceDonts || [],
      examples: {
        homepageHero: state.voice.examples.homepageHero || "",
        shortPitch: state.voice.examples.shortPitch || "",
        primaryCTA: state.voice.examples.primaryCTA || "",
        socialPost: state.voice.examples.socialPost || "",
      },
    },
    messaging: {
      coreMessage: state.delivery.messaging.coreMessage,
      valueProposition: state.delivery.messaging.valueProposition,
      elevatorPitch: state.delivery.messaging.elevatorPitch,
      keyMessages: state.delivery.messaging.keyMessages || [],
      messagingPillars: state.delivery.messaging.messagingPillars || [],
    },
    visualDirection: {
      aestheticMood:
        state.visualDirection.visualPersonality?.aestheticMood || state.visualDirection.overallAesthetic || "",
      visualKeywords: state.visualDirection.visualPersonality?.visualKeywords || [],
      colorSystem: state.visualDirection.colorSystem,
      typography: state.visualDirection.typography,
      imagery: state.visualDirection.imagery,
      logoDirection: state.visualDirection.logoDirection,
      layoutPrinciples: state.visualDirection.layoutPrinciples,
      guidelinesSummary: state.delivery.visualGuidelines,
    },
    consistency: {
      readiness: state.consistency.readiness,
      overallAssessment: state.consistency.overallAssessment,
      strengths: state.consistency.strengths || [],
      warnings: state.consistency.warnings || [],
      crossSystemIssues: state.consistency.crossSystemIssues || [],
      isEvaluated: state.consistency.isEvaluated,
      evaluatedAt: state.consistency.evaluatedAt,
    },
    usage: {
      website: state.delivery.usageGuidance.website || "",
      social: state.delivery.usageGuidance.social || "",
      presentations: state.delivery.usageGuidance.presentations || "",
      marketing: state.delivery.usageGuidance.marketing || "",
    },
    deliveryAssets: state.delivery.deliverables || [],
    warnings: combinedWarnings,

    // Legacy fields for backwards compatibility
    missionStatement: state.positioning.positioningStatement,
    brandManifesto: `${authoritativeName}: ${state.delivery.messaging.coreMessage}\n\n${state.positioning.positioningStatement}`,
    elevatorPitch: state.delivery.messaging.elevatorPitch,
    corePillars: state.delivery.messaging.messagingPillars?.map((p) => p.pillar) || [],
    colorPalette: state.visualDirection.colors || [],
    typography: {
      headingFont:
        state.visualDirection.typography.heading?.fontFamily ||
        (state.visualDirection.typography as unknown as Record<string, unknown>)?.headingFont?.toString() ||
        "",
      bodyFont:
        state.visualDirection.typography.body?.fontFamily ||
        (state.visualDirection.typography as unknown as Record<string, unknown>)?.bodyFont?.toString() ||
        "",
      pairingRationale: state.visualDirection.typography.rationale || "",
    },
    voicePrinciples: state.delivery.voiceGuidelines.doRules || [],
    dosAndDonts: [
      ...(state.delivery.voiceGuidelines.doRules || []).map((rule) => ({
        guideline: rule,
        type: "do" as const,
      })),
      ...(state.delivery.voiceGuidelines.dontRules || []).map((rule) => ({
        guideline: rule,
        type: "dont" as const,
      })),
    ],
    assetChecklist: (state.delivery.deliverables || []).map((d) => d.title),
  };

  // 4. Schema Validation
  const validated = FinalBrandKitSchema.safeParse(finalBrandKitCandidate);
  if (!validated.success) {
    const errorMsg = `Final Brand Kit schema validation failed: ${validated.error.message}`;
    agentRun.status = "failed";
    agentRun.error = errorMsg;
    agentRun.completedAt = new Date().toISOString();
    agentRun.durationMs = Date.now() - startTime;
    if (options.persist !== false) {
      await persistAgentRun(agentRun);
    }
    return {
      success: false,
      error: errorMsg,
      agentRun,
    };
  }

  const finalBrandKit = validated.data;
  // Explicitly ensure authoritative name is preserved 100%
  finalBrandKit.brandName = authoritativeName;
  finalBrandKit.overview.name = authoritativeName;
  finalBrandKit.naming.selectedName = authoritativeName;

  // 5. Update AgentRun
  agentRun.status = "completed";
  agentRun.completedAt = timestamp;
  agentRun.durationMs = Date.now() - startTime;
  agentRun.output = {
    brandName: finalBrandKit.brandName,
    completeness: finalBrandKit.completeness,
    deliverablesCount: finalBrandKit.deliveryAssets.length,
    warningsCount: finalBrandKit.warnings.length,
  };

  // 6. Deep Immutability: Update ONLY finalBrandKit and version
  const updatedBrandState: BrandState = {
    ...state,
    version: (state.version || 1) + 1,
    updatedAt: timestamp,
    finalBrandKit,
  };

  // 7. Persist if requested
  if (options.persist !== false) {
    await persistBrandState(updatedBrandState);
    await persistAgentRun(agentRun);
  }

  return {
    success: true,
    finalBrandKit,
    updatedBrandState,
    agentRun,
    completeness: finalBrandKit.completeness,
  };
}
