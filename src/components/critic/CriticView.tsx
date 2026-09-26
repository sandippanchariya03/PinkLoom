"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Quote,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Check,
} from "lucide-react";
import type { BrandState, CriticIssue } from "@/types/brand";
import type { WorkflowStage } from "@/types/workflow";
import {
  CRITIC_CATEGORY_LABELS,
  mapSeverityToHierarchy,
  formatCriticalBlockingIssue,
  refineClaimLanguage,
  refineRecommendedAction,
  getRecommendedStageForCategory,
  deriveIssueTitle,
  type FormattedCriticalIssue,
} from "@/lib/critic/critic-ui-helpers";

export interface CriticViewProps {
  brandState: BrandState;
  isLoading: boolean;
  loadingStep: string;
  errorMessage: string | null;
  onRunCritic: () => void;
  onClearError: () => void;
  onNavigateStage: (stage: WorkflowStage, subStage?: "personality" | "naming" | "voice") => void;
  onReviewApproved: () => void;
}

export function CriticView({
  brandState,
  isLoading,
  loadingStep,
  errorMessage,
  onRunCritic,
  onClearError,
  onNavigateStage,
  onReviewApproved,
}: CriticViewProps) {
  // Severity filter state: "all" | "critical" | "warning" | "info" | "high" | "medium" | "low"
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const critique = brandState?.critique;
  const selectedName = brandState?.naming?.selectedName || "Your Brand";

  // Check prerequisites: all 6 upstream layers must be present
  const hasDiscovery = Boolean(brandState?.discovery?.isAnalyzed);
  const hasPositioning = Boolean(brandState?.positioning?.isPositioned);
  const hasPersonality = Boolean(brandState?.personality?.isFormulated);
  const hasNaming = Boolean(brandState?.naming?.isSelected && brandState?.naming?.selectedName);
  const hasVoice = Boolean(brandState?.voice?.isGenerated);
  const hasVisual = Boolean(brandState?.visualDirection?.isGenerated);

  const missingPrerequisites =
    !hasDiscovery ||
    !hasPositioning ||
    !hasPersonality ||
    !hasNaming ||
    !hasVoice ||
    !hasVisual;

  // 1. PREREQUISITE GUARD
  if (missingPrerequisites) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-[#B78103] font-semibold tracking-wider block">
              Prerequisites Required
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Prerequisites Pending for Critic / Challenge Audit
            </h3>
            <p className="text-xs text-[#686764] leading-relaxed max-w-2xl mt-1">
              The Critic Agent performs a systemic diagnostic audit across all 6 foundational layers.
              All preceding stages must be fully generated and approved before stress-testing the brand.
            </p>
          </div>
        </div>

        {/* Requirement Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              hasDiscovery
                ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
            }`}
          >
            <div>
              <span className="font-semibold block text-[#141416]">01. Discovery</span>
              <span className="text-[11px] text-[#686764]">
                {hasDiscovery ? "Problem & Audience Set" : "Incomplete"}
              </span>
            </div>
            {hasDiscovery ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            ) : (
              <button
                type="button"
                onClick={() => onNavigateStage("DISCOVER")}
                className="text-xs font-medium text-[#141416] underline hover:text-[#C62828] cursor-pointer"
              >
                Fix
              </button>
            )}
          </div>

          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              hasPositioning
                ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
            }`}
          >
            <div>
              <span className="font-semibold block text-[#141416]">02. Positioning</span>
              <span className="text-[11px] text-[#686764]">
                {hasPositioning ? "Category & Differentiation Set" : "Incomplete"}
              </span>
            </div>
            {hasPositioning ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            ) : (
              <button
                type="button"
                onClick={() => onNavigateStage("POSITION")}
                className="text-xs font-medium text-[#141416] underline hover:text-[#C62828] cursor-pointer"
              >
                Fix
              </button>
            )}
          </div>

          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              hasPersonality
                ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
            }`}
          >
            <div>
              <span className="font-semibold block text-[#141416]">03. Personality</span>
              <span className="text-[11px] text-[#686764]">
                {hasPersonality ? "Archetype & Principles Set" : "Incomplete"}
              </span>
            </div>
            {hasPersonality ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            ) : (
              <button
                type="button"
                onClick={() => onNavigateStage("SHAPE", "personality")}
                className="text-xs font-medium text-[#141416] underline hover:text-[#C62828] cursor-pointer"
              >
                Fix
              </button>
            )}
          </div>

          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              hasNaming
                ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
            }`}
          >
            <div>
              <span className="font-semibold block text-[#141416]">04. Selected Name</span>
              <span className="text-[11px] text-[#686764]">
                {hasNaming ? brandState.naming.selectedName : "Candidate Unselected"}
              </span>
            </div>
            {hasNaming ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            ) : (
              <button
                type="button"
                onClick={() => onNavigateStage("SHAPE", "naming")}
                className="text-xs font-medium text-[#141416] underline hover:text-[#C62828] cursor-pointer"
              >
                Fix
              </button>
            )}
          </div>

          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              hasVoice
                ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
            }`}
          >
            <div>
              <span className="font-semibold block text-[#141416]">05. Voice Strategy</span>
              <span className="text-[11px] text-[#686764]">
                {hasVoice ? "Tone & Pillars Set" : "Incomplete"}
              </span>
            </div>
            {hasVoice ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            ) : (
              <button
                type="button"
                onClick={() => onNavigateStage("SHAPE", "voice")}
                className="text-xs font-medium text-[#141416] underline hover:text-[#C62828] cursor-pointer"
              >
                Fix
              </button>
            )}
          </div>

          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              hasVisual
                ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
            }`}
          >
            <div>
              <span className="font-semibold block text-[#141416]">06. Visual Direction</span>
              <span className="text-[11px] text-[#686764]">
                {hasVisual ? "Color & Typography Set" : "Incomplete"}
              </span>
            </div>
            {hasVisual ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            ) : (
              <button
                type="button"
                onClick={() => onNavigateStage("VISUALIZE")}
                className="text-xs font-medium text-[#141416] underline hover:text-[#C62828] cursor-pointer"
              >
                Fix
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE (Recoverable with retry button)
  const renderErrorBanner = () => {
    if (!errorMessage) return null;
    return (
      <div
        role="alert"
        className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#C62828] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#C62828]">Critic Evaluation Paused</h4>
            <p className="text-xs text-[#B71C1C] leading-relaxed break-words max-w-2xl">
              {errorMessage}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onClearError}
            className="px-3 py-1.5 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] text-xs font-medium text-[#686764] hover:bg-[#FAF8F5] transition-colors"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={onRunCritic}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#C62828] text-[#FFFFFF] text-xs font-semibold hover:bg-[#B71C1C] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Audit</span>
          </button>
        </div>
      </div>
    );
  };

  // 3. LOADING STATE (Animated audit in progress)
  if (isLoading) {
    return (
      <div className="space-y-6">
        {renderErrorBanner()}
        <div
          role="status"
          aria-live="polite"
          className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 sm:p-12 shadow-sm text-center space-y-6 animate-pulse"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center mx-auto ring-1 ring-[#FFE082] animate-bounce">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FAF8F5] border border-[#E8E5DF] text-[#686764]">
              Stage 07 &bull; Diagnostic Brand Audit in Progress
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl text-[#141416]">
              Evaluating Systemic Brand Coherence
            </h3>
            <p className="text-xs sm:text-sm text-[#686764] leading-relaxed">
              The Critic Agent is stress-testing &ldquo;{selectedName}&rdquo; across 12 diagnostic dimensions.
              Evaluating for unverified claims, clichés, and cross-stage contradictions.
            </p>
          </div>

          {/* Current Step Banner */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] max-w-md mx-auto text-xs font-mono text-[#141416] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E87A90] animate-ping" />
            <span>{loadingStep || "Auditing 6 foundational layers..."}</span>
          </div>

          <p className="text-[11px] text-[#96948F]">
            Non-destructive audit: BrandState assets remain 100% unaltered.
          </p>
        </div>
      </div>
    );
  }

  // 4. READY TO RUN STATE (Not evaluated yet)
  if (!critique?.isEvaluated) {
    return (
      <div className="space-y-6">
        {renderErrorBanner()}
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF8E1] text-[#141416] flex items-center justify-center mx-auto ring-1 ring-[#FFE082]">
            <ShieldAlert className="w-8 h-8 text-[#B78103]" />
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FAF8F5] border border-[#E8E5DF] text-[#686764]">
              Stage 07 &bull; Adversarial Diagnostic Engine
            </span>
            <h3 className="font-editorial text-3xl sm:text-4xl text-[#141416] tracking-tight">
              Stress-Test the Complete Brand System
            </h3>
            <p className="text-xs sm:text-sm text-[#686764] leading-relaxed">
              The Critic Agent conducts a rigorous, multi-layered audit for{" "}
              <strong className="text-[#141416]">&ldquo;{selectedName}&rdquo;</strong>{" "}
              across strategy, archetype, voice, and visuals &mdash; identifying contradictions, generic clichés, and unsubstantiated claims before release.
            </p>
          </div>

          {/* 12 Diagnostic Categories Preview */}
          <div className="space-y-2 max-w-4xl mx-auto text-left pt-2">
            <span className="text-[11px] font-mono text-[#96948F] uppercase block tracking-wider">
              Diagnostic Scope: 12 Rigorous Audit Dimensions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {[
                { label: "Generic Language", desc: "Buzzwords & clichés" },
                { label: "Weak Positioning", desc: "Commoditization risks" },
                { label: "Audience Mismatch", desc: "Relevance alignment" },
                { label: "Contradictions", desc: "Cross-stage clashes" },
                { label: "Weak Differentiation", desc: "Defensible moats" },
                { label: "Name/Personality", desc: "Resonance check" },
                { label: "Name/Positioning", desc: "Category fit" },
                { label: "Visual/Personality", desc: "Aesthetic harmony" },
                { label: "Voice Inconsistency", desc: "Tone stability" },
                { label: "Clichés", desc: "Overused tropes" },
                { label: "Unsupported Claims", desc: "Proof point audits" },
                { label: "Missing Information", desc: "Strategic blindspots" },
              ].map((cat, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-0.5">
                  <span className="text-[10px] font-mono text-[#96948F]">0{i + 1}</span>
                  <p className="text-xs font-semibold text-[#141416]">{cat.label}</p>
                  <p className="text-[10px] text-[#686764]">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guardrails Box */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] max-w-2xl mx-auto text-xs text-[#686764] space-y-1.5 text-left">
            <span className="font-semibold text-[#141416] block">Non-Destructive Diagnostic Principles:</span>
            <ul className="space-y-1 list-disc list-inside text-[11px]">
              <li>
                <strong className="text-[#141416]">Diagnostic Only:</strong> Pinpoints weaknesses and suggests revisions without altering your BrandState directly.
              </li>
              <li>
                <strong className="text-[#141416]">Name Protection:</strong> The selected name &ldquo;{selectedName}&rdquo; is human-authoritative and will never be overwritten.
              </li>
              <li>
                <strong className="text-[#141416]">No Manufactured Flaws:</strong> Coherent, well-aligned brands are recognized and validated with strengths.
              </li>
            </ul>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              type="button"
              id="run-critic-agent-btn"
              onClick={onRunCritic}
              disabled={isLoading}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-sm font-semibold hover:bg-[#27262A] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-[#E87A90]" />
              <span>Run Brand Challenge (Critic Agent)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. EVALUATED STATE
  // Process issues and blocking issues
  const allIssues: CriticIssue[] = critique.issues || [];
  const blockingItems = critique.blockingIssues || [];

  // Format critical blocking issues with structured cards (Step 3 & 4)
  const formattedCriticalIssues: FormattedCriticalIssue[] = blockingItems.map((item, idx) =>
    formatCriticalBlockingIssue(item, idx, allIssues)
  );

  // Filter issues based on active filter
  const filteredIssues = allIssues.filter((iss) => {
    if (severityFilter === "all") return true;
    const meta = mapSeverityToHierarchy(iss.severity);
    if (severityFilter === "critical") return meta.hierarchy === "critical" || iss.severity === "critical";
    if (severityFilter === "warning") return meta.hierarchy === "warning" || iss.severity === "high" || iss.severity === "medium";
    if (severityFilter === "info") return meta.hierarchy === "info" || iss.severity === "low";
    return iss.severity === severityFilter;
  });

  const criticalCount = allIssues.filter((i) => i.severity === "critical").length;
  const warningCount = allIssues.filter((i) => i.severity === "high" || i.severity === "medium").length;
  const infoCount = allIssues.filter((i) => i.severity === "low").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {renderErrorBanner()}

      {/* Top Overview & Readiness Banner */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5DF]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase text-[#96948F]">
                Stage 07 &bull; Systemic Audit
              </span>
              <span className="text-[#E8E5DF]">&bull;</span>
              <span className="text-xs font-mono text-[#686764]">
                BrandState v{brandState.version}
              </span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl text-[#141416]">
              Brand Diagnostic for &ldquo;{selectedName}&rdquo;
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Readiness Badge */}
            {critique.readiness === "ready" && (
              <span
                role="status"
                aria-label="Status: Ready for Production"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ready for Production</span>
              </span>
            )}
            {critique.readiness === "needs_revision" && (
              <span
                role="status"
                aria-label="Status: Needs Strategic Revision"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFF8E1] text-[#B78103] border border-[#FFE082]"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Needs Strategic Revision</span>
              </span>
            )}
            {critique.readiness === "not_ready" && (
              <span
                role="status"
                aria-label="Status: Critical Issues Detected"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Critical Issues Detected</span>
              </span>
            )}

            <button
              type="button"
              onClick={onRunCritic}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-[#E8E5DF] text-xs font-medium text-[#141416] hover:bg-[#FAF8F5] transition-colors disabled:opacity-50 cursor-pointer"
              title="Re-run Critic agent"
            >
              Re-audit
            </button>
          </div>
        </div>

        {/* Metric Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#96948F]">Readiness</span>
            <p className="text-sm font-semibold text-[#141416] capitalize">
              {critique.readiness.replace("_", " ")}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#96948F]">Identified Issues</span>
            <p className="text-sm font-semibold text-[#141416]">
              {allIssues.length} {allIssues.length === 1 ? "Issue" : "Issues"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#96948F]">Blocking Flaws</span>
            <p
              className={`text-sm font-semibold ${
                formattedCriticalIssues.length > 0 ? "text-[#C62828]" : "text-[#2E7D32]"
              }`}
            >
              {formattedCriticalIssues.length} Blocking
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#96948F]">Affirmed Strengths</span>
            <p className="text-sm font-semibold text-[#2E7D32]">
              {(critique.strengths || []).length} Verified
            </p>
          </div>
        </div>
      </div>

      {/* 01. Overall Diagnostic Assessment */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E87A90]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#96948F]">
            01. Diagnostic Assessment
          </span>
        </div>
        <h4 className="font-editorial text-2xl text-[#141416]">Overall Brand Evaluation</h4>
        <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-sm text-[#4A4946] leading-relaxed break-words">
          {critique.overallAssessment}
        </div>
      </div>

      {/* 02. Systemic Brand Strengths */}
      {critique.strengths && critique.strengths.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#81C784]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#96948F]">
              02. Systemic Strengths
            </span>
          </div>
          <h4 className="font-editorial text-2xl text-[#141416]">Verified Foundational Pillars</h4>
          <p className="text-xs text-[#686764]">
            Aspects of the brand that demonstrated strong differentiation, cross-stage cohesion, and strategic clarity.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {critique.strengths.map((strength, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#FAF8F5] border border-[#C8E6C9] flex items-start gap-3"
              >
                <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                <span className="text-xs text-[#2A2927] leading-relaxed break-words">{strength}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 03. CRITICAL BLOCKING ISSUES SECTION (Steps 2, 3, 4, 5, 6) */}
      {formattedCriticalIssues.length > 0 && (
        <section aria-labelledby="critical-blocking-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFEBEE] text-[#C62828] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4
                  id="critical-blocking-heading"
                  className="font-editorial text-2xl text-[#141416]"
                >
                  Critical Blocking Issues
                </h4>
                <p className="text-xs text-[#686764]">
                  Blocking issues requiring human review before proceeding. The user remains the final decision-maker.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
              {formattedCriticalIssues.length} {formattedCriticalIssues.length === 1 ? "Blocker" : "Blockers"}
            </span>
          </div>

          <div className="space-y-4">
            {formattedCriticalIssues.map((issue) => (
              <article
                key={issue.id}
                className="bg-[#FFFFFF] border-2 border-[#FFCDD2] rounded-2xl p-6 shadow-sm space-y-4 transition-all hover:border-[#E57373]"
              >
                {/* Header Tag & Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#FEEBEE]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      role="status"
                      aria-label="Severity: Critical Blocking Issue"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>CRITICAL BLOCKING ISSUE</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF8F5] border border-[#E8E5DF] text-[#141416]">
                      <span className="text-[#96948F]">Category:</span>
                      <strong className="font-semibold">{issue.categoryLabel}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#96948F]">#{issue.id}</span>
                </div>

                {/* Issue Title (Step 3 & 4) */}
                <h5 className="font-editorial text-xl sm:text-2xl text-[#141416] break-words">
                  {issue.title}
                </h5>

                {/* Evidence Quote Block if provided */}
                {issue.evidence && issue.evidence !== "Direct reference from BrandState" && (
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#96948F]">
                      <Quote className="w-3 h-3 text-[#E87A90]" />
                      <span>Flagged In BrandState Input:</span>
                    </div>
                    <p className="text-xs italic font-medium text-[#141416] leading-relaxed break-words">
                      &ldquo;{issue.evidence}&rdquo;
                    </p>
                  </div>
                )}

                {/* Why Flagged (Step 3 & 4: accurately communicates uncertainty) */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#96948F] block">
                    Why Flagged
                  </span>
                  <p className="text-xs sm:text-sm text-[#4A4946] leading-relaxed break-words">
                    {issue.whyFlagged}
                  </p>
                </div>

                {/* Category block */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#96948F] block">
                    Category
                  </span>
                  <p className="text-xs font-semibold text-[#141416]">
                    {issue.categoryLabel}
                  </p>
                </div>

                {/* Recommended Action (Step 3 & 4: human-directed) */}
                <div className="p-4 rounded-xl bg-[#FFF8E1]/80 border border-[#FFE082] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B78103]">
                    <Lightbulb className="w-4 h-4 shrink-0" />
                    <span>Recommended Action:</span>
                  </div>
                  <p className="text-xs text-[#5D4037] leading-relaxed break-words">
                    {issue.recommendedAction}
                  </p>
                </div>

                {/* Human Control Review Action (Step 3 & 6) */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#FEEBEE]">
                  <p className="text-[11px] text-[#78756F]">
                    Human review required &bull; The user remains the final decision-maker.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateStage(issue.targetStage, issue.targetSubStage)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141416] text-[#FFFFFF] text-xs font-semibold hover:bg-[#27262A] transition-colors cursor-pointer shrink-0"
                  >
                    <span>Review in {issue.targetStageLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#E87A90]" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 04. DETAILED DIAGNOSTIC FINDINGS (Step 2: Critical, Warning, Info hierarchy) */}
      <section aria-labelledby="detailed-findings-heading" className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E87A90]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#96948F]">
                04. Diagnostic Breakdown
              </span>
            </div>
            <h4
              id="detailed-findings-heading"
              className="font-editorial text-2xl text-[#141416] mt-1"
            >
              Detailed Diagnostic Findings
            </h4>
          </div>

          {/* Severity Filter Pills (Step 2 Hierarchy: Critical, Warning, Info) */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E5DF] text-xs flex-wrap">
            <button
              type="button"
              onClick={() => setSeverityFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                severityFilter === "all"
                  ? "bg-[#141416] text-[#FBF9F6]"
                  : "text-[#686764] hover:text-[#141416]"
              }`}
            >
              All ({allIssues.length})
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter("critical")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                severityFilter === "critical"
                  ? "bg-[#141416] text-[#FBF9F6]"
                  : "text-[#686764] hover:text-[#141416]"
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter("warning")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                severityFilter === "warning"
                  ? "bg-[#141416] text-[#FBF9F6]"
                  : "text-[#686764] hover:text-[#141416]"
              }`}
            >
              Warning ({warningCount})
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter("info")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                severityFilter === "info"
                  ? "bg-[#141416] text-[#FBF9F6]"
                  : "text-[#686764] hover:text-[#141416]"
              }`}
            >
              Info ({infoCount})
            </button>
          </div>
        </div>

        {/* Filtered Issues List */}
        {filteredIssues.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-[#81C784] mx-auto" />
            <p className="text-sm font-semibold text-[#141416]">No findings in this filter</p>
            <p className="text-xs text-[#686764]">
              {allIssues.length === 0
                ? "The complete brand system demonstrated internal coherence and strategic alignment across all inspected layers. Zero flaws detected."
                : `No issues match the selected "${severityFilter}" severity filter.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const severityMeta = mapSeverityToHierarchy(issue.severity);
              const catLabel = CRITIC_CATEGORY_LABELS[issue.category] || issue.category;
              const refinedWhyFlagged = refineClaimLanguage(issue.explanation);
              const refinedAction = refineRecommendedAction(issue.suggestedRevision, issue.category);
              const issueTitle = deriveIssueTitle(issue.category, issue.explanation);
              const stageRouting = getRecommendedStageForCategory(issue.category, issue.evidence);

              return (
                <div
                  key={issue.id}
                  className="p-5 sm:p-6 rounded-2xl border border-[#E8E5DF] bg-[#FAF8F5] space-y-4 transition-all hover:border-[#D0CDC6] overflow-hidden break-words max-w-full"
                >
                  {/* Issue Top Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        role="status"
                        aria-label={severityMeta.ariaLabel}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${severityMeta.badgeClass}`}
                      >
                        {severityMeta.hierarchy === "critical" && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {severityMeta.hierarchy === "warning" && (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {severityMeta.hierarchy === "info" && (
                          <Info className="w-3 h-3" />
                        )}
                        <span>{severityMeta.label}</span>
                        <span className="opacity-70 font-normal">({issue.severity})</span>
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFFFFF] border border-[#E8E5DF] text-[#141416]">
                        {catLabel}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-[#96948F]">#{issue.id}</span>
                  </div>

                  {/* Scannable Issue Title */}
                  <h5 className="font-semibold text-sm sm:text-base text-[#141416] break-words">
                    {issueTitle}
                  </h5>

                  {/* Evidence Quote Block */}
                  {issue.evidence && (
                    <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E8E5DF] space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#96948F]">
                        <Quote className="w-3 h-3 text-[#E87A90]" />
                        <span>Verbatim Evidence from BrandState:</span>
                      </div>
                      <p className="text-xs italic font-medium text-[#141416] leading-relaxed break-words">
                        &ldquo;{issue.evidence}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Diagnostic Explanation (Why Flagged) */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#96948F] block">
                      Why Flagged
                    </span>
                    <p className="text-xs text-[#4A4946] leading-relaxed break-words">
                      {refinedWhyFlagged}
                    </p>
                  </div>

                  {/* Suggested Revision (Recommended Action) */}
                  <div className="p-3.5 rounded-xl bg-[#FFFDE7]/70 border border-[#FFF59D] space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-[#827717]">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                      <span>Recommended Action:</span>
                    </div>
                    <p className="text-[#333333] leading-relaxed text-[11px] break-words">
                      {refinedAction}
                    </p>
                  </div>

                  {/* Review Button Footer (Step 6) */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#E8E5DF]">
                    <span className="text-[11px] text-[#96948F]">
                      Human-directed: Final determination remains with you.
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateStage(stageRouting.stage, stageRouting.subStage)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141416] hover:text-[#C62828] transition-colors cursor-pointer"
                    >
                      <span>Review in {stageRouting.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 05. Bottom Milestone Banner */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="w-2 h-2 rounded-full bg-[#81C784]" />
            <span className="text-xs font-semibold text-[#141416]">
              Stage 07 &mdash; Critic / Challenge Complete
            </span>
          </div>
          <p className="text-xs text-[#686764]">
            Diagnostic findings are evaluated and persisted. You may review findings or proceed directly to Stage 08 Consistency.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateStage("VISUALIZE")}
            className="px-4 py-2.5 rounded-xl border border-[#E8E5DF] text-xs font-medium text-[#686764] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            &larr; Back to Visual
          </button>
          <button
            type="button"
            onClick={onReviewApproved}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5D2CA] text-[#141416] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#81C784]" />
            <span>Review Findings</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateStage("CONSISTENCY")}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors cursor-pointer"
          >
            <span>Proceed to Consistency</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E87A90]" />
          </button>
        </div>
      </div>
    </div>
  );
}
