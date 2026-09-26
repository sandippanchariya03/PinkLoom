/**
 * Critic UI Helpers & Formatting Utilities
 *
 * Provides pure, deterministic formatting and classification for Critic / Challenge findings.
 * Ensures:
 * 1. Clear issue hierarchy: Critical (blocking), Warning (high/medium), Info (low).
 * 2. Scannable critical blocking issue card structure.
 * 3. Objective, uncertainty-respecting presentation for unsupported claims:
 *    - Never states "The claim is false" or "The AI proved this claim is false"
 *    - Accurately communicates that evidence is currently unverified in brand inputs
 *    - Leaves final determination to human review
 * 4. Human-directed stage routing for review actions.
 * 5. Strict read-only presentation (zero BrandState mutation).
 */

import type { CriticIssue } from "@/types/brand";
import type { WorkflowStage } from "@/types/workflow";

export const CRITIC_CATEGORY_LABELS: Record<string, string> = {
  generic_language: "Generic Language",
  weak_positioning: "Weak Positioning",
  audience_mismatch: "Audience Mismatch",
  contradictions: "Contradiction",
  weak_differentiation: "Weak Differentiation",
  name_personality_mismatch: "Name / Personality Mismatch",
  name_positioning_mismatch: "Name / Positioning Mismatch",
  visual_personality_mismatch: "Visual / Personality Mismatch",
  voice_inconsistency: "Voice Inconsistency",
  cliches: "Cliché",
  unsupported_claims: "Unsupported Claim",
  missing_information: "Missing Information",
};

export type CriticDisplaySeverity = "critical" | "warning" | "info";

export interface SeverityMeta {
  hierarchy: CriticDisplaySeverity;
  label: string;
  sublabel: string;
  description: string;
  badgeClass: string;
  iconName: "alert-circle" | "alert-triangle" | "info";
  ariaLabel: string;
}

/**
 * Maps underlying Critic severity strings to the 3-tier hierarchy:
 * - Critical: Blocking issue requiring human review before proceeding.
 * - Warning: Potential weakness that should be reviewed.
 * - Info: Observation or improvement opportunity.
 */
export function mapSeverityToHierarchy(severity: string = "medium"): SeverityMeta {
  const s = severity.toLowerCase().trim();

  if (s === "critical") {
    return {
      hierarchy: "critical",
      label: "Critical",
      sublabel: "Blocking Issue",
      description: "Blocking issue requiring human review before proceeding",
      badgeClass: "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]",
      iconName: "alert-circle",
      ariaLabel: "Severity: Critical. Blocking issue requiring human review before proceeding.",
    };
  }

  if (s === "high" || s === "medium" || s === "warning") {
    return {
      hierarchy: "warning",
      label: "Warning",
      sublabel: s === "high" ? "High Priority" : "Moderate Priority",
      description: "Potential weakness that should be reviewed",
      badgeClass:
        s === "high"
          ? "bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]"
          : "bg-[#FFF8E1] text-[#B78103] border-[#FFE082]",
      iconName: "alert-triangle",
      ariaLabel: "Severity: Warning. Potential weakness that should be reviewed.",
    };
  }

  return {
    hierarchy: "info",
    label: "Info",
    sublabel: "Observation",
    description: "Observation or improvement opportunity",
    badgeClass: "bg-[#F5F2EB] text-[#686764] border-[#E8E5DF]",
    iconName: "info",
    ariaLabel: "Severity: Info. Observation or improvement opportunity.",
  };
}

/**
 * Refines claim diagnostic text to ensure objective, uncertainty-respecting phrasing.
 * Adheres strictly to Step 4 rules:
 * - Does NOT state "The claim is false"
 * - Does NOT state "The AI proved this claim is false"
 * - Does NOT state "The claim must legally be substantiated"
 * - Accurately states that supporting evidence has not been established in brand inputs.
 */
export function refineClaimLanguage(explanation: string): string {
  if (!explanation) return "";

  // Canonical pattern: "Unverified performance claim could be challenged by investors or users and must be substantiated before launch."
  const lower = explanation.toLowerCase();
  if (
    lower.includes("unverified performance claim") ||
    (lower.includes("challenged by investors or users") && lower.includes("substantiated"))
  ) {
    return "This claim may be challenged by investors or users because supporting evidence has not been established.";
  }

  let refined = explanation;

  // Replace definitive conclusions of falsity with accurate statements of missing evidence
  refined = refined.replace(/the claim is false/gi, "supporting evidence has not been documented");
  refined = refined.replace(/the ai proved (this|the) claim (is )?false/gi, "supporting evidence is unverified in brand inputs");
  refined = refined.replace(/is proven false/gi, "lacks supporting documentation");
  refined = refined.replace(/must legally be substantiated/gi, "should be substantiated with documented proof before launch");
  refined = refined.replace(/must be substantiated before launch/gi, "because supporting evidence has not been established");

  return refined;
}

/**
 * Refines suggested recommendations into human-directed, actionable advice.
 */
export function refineRecommendedAction(action: string, category: string = ""): string {
  if (!action) {
    return "Review the corresponding brand assets to ensure claims are grounded in documented evidence.";
  }

  const cat = category.toLowerCase();
  const lower = action.toLowerCase();

  if (
    cat === "unsupported_claims" ||
    lower.includes("unverified") ||
    lower.includes("substantiate") ||
    lower.includes("claim")
  ) {
    if (lower.includes("remove premature market supremacy claims") || lower.includes("ground differentiation")) {
      return action;
    }
    return "Verify supporting evidence or revise the claim before launch.";
  }

  return action;
}

export interface FormattedCriticalIssue {
  id: string;
  title: string;
  whyFlagged: string;
  category: string;
  categoryLabel: string;
  evidence: string;
  recommendedAction: string;
  targetStage: WorkflowStage;
  targetSubStage?: "personality" | "naming" | "voice";
  targetStageLabel: string;
  rawExplanation: string;
}

/**
 * Maps a category and optional evidence snippet to the appropriate upstream workflow stage
 * so human users can easily navigate back to review or modify their brand elements.
 */
export function getRecommendedStageForCategory(
  category: string,
  evidence: string = ""
): {
  stage: WorkflowStage;
  subStage?: "personality" | "naming" | "voice";
  label: string;
} {
  const cat = category.toLowerCase();
  const ev = evidence.toLowerCase();

  if (cat.includes("voice")) {
    return { stage: "SHAPE", subStage: "voice", label: "Stage 05: Voice" };
  }
  if (cat.includes("visual")) {
    return { stage: "VISUALIZE", label: "Stage 06: Visual Direction" };
  }
  if (cat.includes("name")) {
    return { stage: "SHAPE", subStage: "naming", label: "Stage 04: Naming" };
  }
  if (cat.includes("personality")) {
    return { stage: "SHAPE", subStage: "personality", label: "Stage 03: Personality" };
  }
  if (cat.includes("audience")) {
    if (ev.includes("problem") || ev.includes("discovery")) {
      return { stage: "DISCOVER", label: "Stage 01: Discovery" };
    }
    return { stage: "POSITION", label: "Stage 02: Positioning" };
  }
  if (
    cat.includes("positioning") ||
    cat.includes("differentiation") ||
    cat.includes("claim") ||
    cat.includes("generic") ||
    cat.includes("cliche")
  ) {
    return { stage: "POSITION", label: "Stage 02: Positioning" };
  }
  if (cat.includes("contradiction")) {
    if (ev.includes("visual") || ev.includes("terminal") || ev.includes("palette")) {
      return { stage: "VISUALIZE", label: "Stage 06: Visual Direction" };
    }
    if (ev.includes("voice") || ev.includes("tone") || ev.includes("formal")) {
      return { stage: "SHAPE", subStage: "voice", label: "Stage 05: Voice" };
    }
    if (ev.includes("personality") || ev.includes("archetype") || ev.includes("jester")) {
      return { stage: "SHAPE", subStage: "personality", label: "Stage 03: Personality" };
    }
    return { stage: "POSITION", label: "Stage 02: Positioning" };
  }

  return { stage: "POSITION", label: "Stage 02: Positioning" };
}

/**
 * Derives a scannable title for an issue based on its category and explanation.
 */
export function deriveIssueTitle(category: string, explanation: string = ""): string {
  const cat = category.toLowerCase();
  const expl = explanation.toLowerCase();

  if (cat === "unsupported_claims" || expl.includes("unverified") || expl.includes("performance claim")) {
    return "Unverified performance claim";
  }
  if (cat === "contradictions") {
    if (expl.includes("personality") && expl.includes("voice")) {
      return "Archetype & Voice Tonal Contradiction";
    }
    if (expl.includes("visual") && expl.includes("audience")) {
      return "Visual Density & Audience Contradiction";
    }
    return "Cross-System Strategic Contradiction";
  }
  if (cat === "audience_mismatch") {
    return "Target Audience & Presentation Mismatch";
  }
  if (cat === "weak_positioning" || cat === "weak_differentiation") {
    return "Defensibility & Competitive Moat Risk";
  }
  if (cat === "generic_language" || cat === "cliches") {
    return "Generic Terminology & Cliché Exposure";
  }
  if (cat.includes("name")) {
    return "Brand Name Cohesion Risk";
  }
  if (cat.includes("visual")) {
    return "Visual Direction Alignment Friction";
  }
  if (cat.includes("voice")) {
    return "Voice & Communication Inconsistency";
  }
  if (cat.includes("missing")) {
    return "Strategic Information Gap";
  }

  // Fallback: Use category label or truncated explanation
  return CRITIC_CATEGORY_LABELS[cat] || "Critical Strategic Finding";
}

/**
 * Converts a raw Critic issue or blocker string into a structured, highly scannable
 * representation for the Critical Blocking Issue Card UI.
 */
export function formatCriticalBlockingIssue(
  blocker: CriticIssue | string,
  index: number,
  allIssues: CriticIssue[] = []
): FormattedCriticalIssue {
  if (typeof blocker === "string") {
    // Check if string matches an issue in allIssues
    const matched = allIssues.find(
      (iss) =>
        iss.explanation === blocker ||
        iss.id === blocker ||
        blocker.includes(iss.explanation) ||
        (iss.explanation && blocker.includes(iss.explanation.slice(0, 30)))
    );

    if (matched) {
      return formatCriticalBlockingIssue(matched, index, allIssues);
    }

    // Synthesize structured issue from the string
    const lower = blocker.toLowerCase();
    let category = "contradictions";
    if (lower.includes("claim") || lower.includes("unverified") || lower.includes("substantiate")) {
      category = "unsupported_claims";
    } else if (lower.includes("audience")) {
      category = "audience_mismatch";
    } else if (lower.includes("generic") || lower.includes("cliche")) {
      category = "generic_language";
    } else if (lower.includes("position") || lower.includes("differentiat")) {
      category = "weak_positioning";
    }

    const title = deriveIssueTitle(category, blocker);
    const whyFlagged = refineClaimLanguage(blocker);
    const categoryLabel = CRITIC_CATEGORY_LABELS[category] || "Strategic Finding";
    const recommendedAction = refineRecommendedAction(
      category === "unsupported_claims"
        ? "Verify supporting evidence or revise the claim before launch."
        : "Review the flagged strategic element in the corresponding stage and refine if needed.",
      category
    );

    const routing = getRecommendedStageForCategory(category, blocker);

    return {
      id: `blocker-${index + 1}`,
      title,
      whyFlagged,
      category,
      categoryLabel,
      evidence: "Identified in systemic brand state evaluation.",
      recommendedAction,
      targetStage: routing.stage,
      targetSubStage: routing.subStage,
      targetStageLabel: routing.label,
      rawExplanation: blocker,
    };
  }

  // Handle CriticIssue object
  const category = blocker.category || "contradictions";
  const title = deriveIssueTitle(category, blocker.explanation);
  const whyFlagged = refineClaimLanguage(blocker.explanation);
  const categoryLabel = CRITIC_CATEGORY_LABELS[category] || category;
  const recommendedAction = refineRecommendedAction(blocker.suggestedRevision, category);
  const routing = getRecommendedStageForCategory(category, blocker.evidence);

  return {
    id: blocker.id || `critical-${index + 1}`,
    title,
    whyFlagged,
    category,
    categoryLabel,
    evidence: blocker.evidence || "Direct reference from BrandState",
    recommendedAction,
    targetStage: routing.stage,
    targetSubStage: routing.subStage,
    targetStageLabel: routing.label,
    rawExplanation: blocker.explanation,
  };
}
