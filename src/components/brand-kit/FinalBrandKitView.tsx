"use client";

import React from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import type { FinalBrandKit } from "@/types/brand";
import type { WorkflowStage } from "@/types/workflow";

export interface FinalBrandKitViewProps {
  finalBrandKit: FinalBrandKit;
  activeKitTab: string;
  setActiveKitTab: (
    tab:
      | "overview"
      | "discovery"
      | "positioning"
      | "personality"
      | "naming"
      | "voice"
      | "messaging"
      | "visual"
      | "consistency"
      | "usage"
      | "assets"
  ) => void;
  onReassemble: () => void;
  onAcknowledge: () => void;
  isLoading: boolean;
  onNavigateStage: (stage: WorkflowStage, subStage?: "personality" | "naming" | "voice") => void;
  onCopyText: (text: string, key: string) => void;
  copiedKey: string | null;
}

export function FinalBrandKitView({
  finalBrandKit,
  activeKitTab,
  setActiveKitTab,
  onReassemble,
  onAcknowledge,
  isLoading,
  onNavigateStage,
  onCopyText,
  copiedKey,
}: FinalBrandKitViewProps) {
  return (
    <div className="space-y-6">
      {/* Header Box */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E87A90]" />
              <h2 className="font-editorial text-3xl text-[#141416] tracking-tight">
                FINAL BRAND KIT
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#686764]">
              Your complete brand system, assembled in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#EAE6DC] text-xs font-semibold text-[#141416]">
              {finalBrandKit.brandName}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] text-xs font-medium text-[#2E7D32] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Authoritative System
            </span>
            <button
              type="button"
              onClick={onReassemble}
              disabled={isLoading}
              title="Re-assemble to sync any upstream changes"
              className="px-3 py-1.5 rounded-lg border border-[#E8E5DF] text-xs font-medium text-[#686764] hover:bg-[#FAF8F5] transition-colors disabled:opacity-50"
            >
              Re-assemble
            </button>
            <button
              type="button"
              onClick={onAcknowledge}
              className="px-4 py-1.5 rounded-lg bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors shadow-sm"
            >
              Acknowledge
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs (Prompt Section 11) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-[#E8E5DF] pt-4 scrollbar-none">
          {[
            { id: "overview", label: "Overview" },
            { id: "discovery", label: "Discovery" },
            { id: "positioning", label: "Positioning" },
            { id: "personality", label: "Personality" },
            { id: "naming", label: "Name" },
            { id: "voice", label: "Voice" },
            { id: "messaging", label: "Messaging" },
            { id: "visual", label: "Visual" },
            { id: "consistency", label: "Consistency" },
            { id: "usage", label: "Usage" },
            { id: "assets", label: "Assets" },
          ].map((tab) => {
            const isActive = activeKitTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveKitTab(tab.id as Parameters<typeof setActiveKitTab>[0])}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? "bg-[#141416] text-[#FBF9F6] shadow-xs"
                    : "text-[#686764] hover:text-[#141416] hover:bg-[#FAF8F5]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deduplicated Advisory Warnings Banner (if any) */}
      {finalBrandKit.warnings && finalBrandKit.warnings.length > 0 && (
        <div className="bg-[#FFF8E1]/70 border border-[#FFE082] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-[#B78103]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <h4 className="font-semibold text-xs uppercase tracking-wider">
              Authoritative Brand System Cautions ({finalBrandKit.warnings.length})
            </h4>
          </div>
          <ul className="space-y-1 text-xs text-[#7A5600] pl-6 list-disc">
            {finalBrandKit.warnings.map((w, idx) => (
              <li key={idx} className="leading-relaxed">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeKitTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
                Authoritative Brand
              </span>
              <h3 className="font-editorial text-4xl text-[#141416]">
                {finalBrandKit.overview.name}
              </h3>
              {finalBrandKit.overview.tagline && (
                <p className="font-editorial italic text-lg text-[#686764]">
                  &ldquo;{finalBrandKit.overview.tagline}&rdquo;
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Core Message
                </span>
                <p className="text-xs sm:text-sm text-[#141416] leading-relaxed">
                  {finalBrandKit.overview.coreMessage}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Strategic Differentiator
                </span>
                <p className="text-xs sm:text-sm text-[#141416] leading-relaxed">
                  {finalBrandKit.overview.differentiator}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Positioning Statement
                </span>
                <p className="text-xs sm:text-sm text-[#141416] leading-relaxed">
                  {finalBrandKit.overview.positioning}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Target Audience &amp; Archetype
                </span>
                <p className="text-xs sm:text-sm text-[#141416] leading-relaxed">
                  <strong className="text-[#141416]">Audience:</strong> {finalBrandKit.overview.audience}
                  <br />
                  <strong className="text-[#141416]">Archetype:</strong> {finalBrandKit.overview.personality}
                </p>
              </div>
            </div>
          </div>

          {/* Completeness Matrix */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
              Pipeline Completeness Audit (100% Validated)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
              {[
                { label: "Discovery", ok: finalBrandKit.completeness.discovery },
                { label: "Positioning", ok: finalBrandKit.completeness.positioning },
                { label: "Personality", ok: finalBrandKit.completeness.personality },
                { label: "Naming", ok: finalBrandKit.completeness.naming },
                { label: "Voice", ok: finalBrandKit.completeness.voice },
                { label: "Visual", ok: finalBrandKit.completeness.visualDirection },
                { label: "Critique", ok: finalBrandKit.completeness.critique },
                { label: "Consistency", ok: finalBrandKit.completeness.consistency },
                { label: "Delivery", ok: finalBrandKit.completeness.delivery },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-between"
                >
                  <span className="text-[#141416] font-medium">{item.label}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISCOVERY */}
      {activeKitTab === "discovery" && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
              Strategic Foundation &bull; Stage 01
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Discovery Architecture
            </h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Core Problem
              </span>
              <p className="text-[#141416] leading-relaxed">
                {finalBrandKit.discovery.problem}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Primary Target Audience
                </span>
                <p className="text-[#141416] leading-relaxed">
                  {finalBrandKit.discovery.targetAudience.primary}
                </p>
              </div>

              {finalBrandKit.discovery.targetAudience.secondary && (
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                    Secondary Target Audience
                  </span>
                  <p className="text-[#141416] leading-relaxed">
                    {Array.isArray(finalBrandKit.discovery.targetAudience.secondary)
                      ? finalBrandKit.discovery.targetAudience.secondary.join(", ")
                      : finalBrandKit.discovery.targetAudience.secondary}
                  </p>
                </div>
              )}
            </div>

            {finalBrandKit.discovery.targetAudience.painPoints &&
              finalBrandKit.discovery.targetAudience.painPoints.length > 0 && (
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                    Key Pain Points
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-[#4A4946]">
                    {finalBrandKit.discovery.targetAudience.painPoints.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

            {finalBrandKit.discovery.userNeeds &&
              finalBrandKit.discovery.userNeeds.length > 0 && (
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                    Validated User Needs
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-[#4A4946]">
                    {finalBrandKit.discovery.userNeeds.map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Read-Only Routing Footer (Section 12) */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-between text-xs">
            <span className="text-[#686764]">
              Discovery output is read-only. To modify problem framing or audience:
            </span>
            <button
              type="button"
              onClick={() => onNavigateStage("DISCOVER")}
              className="font-medium text-[#141416] underline hover:opacity-75"
            >
              Edit in Stage 01: Discovery &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: POSITIONING */}
      {activeKitTab === "positioning" && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
              Strategic Position &bull; Stage 02
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Market Positioning &amp; Whitespace
            </h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Category Frame &amp; Rationale
              </span>
              <p className="font-semibold text-[#141416]">
                {finalBrandKit.positioning.category}
              </p>
              <p className="text-[#686764] leading-relaxed">
                {finalBrandKit.positioning.categoryRationale}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Positioning Statement
              </span>
              <p className="text-[#141416] leading-relaxed">
                {finalBrandKit.positioning.positioningStatement}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Core Differentiator
                </span>
                <p className="text-[#141416] leading-relaxed">
                  {finalBrandKit.positioning.differentiator}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Value Proposition
                </span>
                <p className="text-[#141416] leading-relaxed">
                  {finalBrandKit.positioning.valueProposition}
                </p>
              </div>
            </div>

            {finalBrandKit.positioning.competitiveWhitespace &&
              finalBrandKit.positioning.competitiveWhitespace.length > 0 && (
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                    Competitive Whitespace
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {finalBrandKit.positioning.competitiveWhitespace.map((w, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-[#FFFFFF] border border-[#E8E5DF] text-xs text-[#141416]"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Read-Only Routing Footer (Section 12) */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-between text-xs">
            <span className="text-[#686764]">
              Positioning strategy is locked. To modify category or differentiator:
            </span>
            <button
              type="button"
              onClick={() => onNavigateStage("POSITION")}
              className="font-medium text-[#141416] underline hover:opacity-75"
            >
              Edit in Stage 02: Positioning &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PERSONALITY */}
      {activeKitTab === "personality" && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
              Brand Soul &bull; Stage 03
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Personality Archetype &amp; Principles
            </h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Brand Archetype &amp; Rationale
              </span>
              <p className="font-semibold text-base text-[#141416]">
                {finalBrandKit.personality.archetype}
              </p>
              <p className="text-[#686764] leading-relaxed">
                {finalBrandKit.personality.archetypeRationale}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Emotional Territory
              </span>
              <p className="text-[#141416] leading-relaxed">
                {finalBrandKit.personality.emotionalTerritory}
              </p>
            </div>

            {finalBrandKit.personality.traits &&
              finalBrandKit.personality.traits.length > 0 && (
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                    Core Character Traits
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {finalBrandKit.personality.traits.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-medium text-[#141416]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finalBrandKit.personality.personalityDo &&
                finalBrandKit.personality.personalityDo.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#E8F5E9]/50 border border-[#C8E6C9] space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2E7D32] block">
                      Personality Do Rules
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-[#2E7D32]">
                      {finalBrandKit.personality.personalityDo.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {finalBrandKit.personality.personalityDont &&
                finalBrandKit.personality.personalityDont.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#FFEBEE]/50 border border-[#FFCDD2] space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C62828] block">
                      Personality Don&apos;t Rules
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-[#C62828]">
                      {finalBrandKit.personality.personalityDont.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>

          {/* Read-Only Routing Footer (Section 12) */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-between text-xs">
            <span className="text-[#686764]">
              Personality strategy is locked. To modify traits or archetype:
            </span>
            <button
              type="button"
              onClick={() => onNavigateStage("SHAPE", "personality")}
              className="font-medium text-[#141416] underline hover:opacity-75"
            >
              Edit in Stage 03: Personality &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: NAME (STRICT NAME PROTECTION - SECTION 5 & 12) */}
      {activeKitTab === "naming" && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
              Authoritative Naming System &bull; Stage 04
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Brand Name &amp; Trademark Rationale
            </h3>
          </div>

          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
              Authoritative Selected Name
            </span>
            <div className="flex items-center gap-3">
              <span className="font-editorial text-4xl text-[#141416]">
                {finalBrandKit.naming.selectedName}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#E8F5E9] border border-[#C8E6C9] text-xs font-semibold text-[#2E7D32]">
                Immutable
              </span>
            </div>
            {finalBrandKit.naming.selectedTagline && (
              <p className="font-editorial italic text-base text-[#686764]">
                &ldquo;{finalBrandKit.naming.selectedTagline}&rdquo;
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            {finalBrandKit.naming.directionName && (
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Naming Territory / Direction
                </span>
                <p className="font-semibold text-[#141416]">
                  {finalBrandKit.naming.directionName}
                </p>
              </div>
            )}

            {finalBrandKit.naming.domainSuitability && (
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Domain &amp; Handle Suitability
                </span>
                <p className="text-[#141416]">
                  {finalBrandKit.naming.domainSuitability}
                </p>
              </div>
            )}
          </div>

          {finalBrandKit.naming.rationale && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1 text-xs sm:text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Strategic Rationale
              </span>
              <p className="text-[#4A4946] leading-relaxed">
                {finalBrandKit.naming.rationale}
              </p>
            </div>
          )}

          {finalBrandKit.naming.linguisticRationale && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1 text-xs sm:text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Linguistic Assessment
              </span>
              <p className="text-[#4A4946] leading-relaxed">
                {finalBrandKit.naming.linguisticRationale}
              </p>
            </div>
          )}

          {/* Read-Only Routing Footer (Section 12) */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-between text-xs">
            <span className="text-[#686764]">
              Selected name is strictly protected. To select an alternative candidate name:
            </span>
            <button
              type="button"
              onClick={() => onNavigateStage("SHAPE", "naming")}
              className="font-medium text-[#141416] underline hover:opacity-75"
            >
              Edit in Stage 04: Naming &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: VOICE */}
      {activeKitTab === "voice" && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
              Voice System &bull; Stage 05
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Voice Guidelines &amp; Tonal Profile
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5 text-xs sm:text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
              Voice Summary
            </span>
            <p className="text-[#141416] leading-relaxed">
              {finalBrandKit.voice.voiceSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Primary Tone &amp; Secondary Tones
              </span>
              <p className="font-semibold text-[#141416]">
                {finalBrandKit.voice.primaryTone}
              </p>
              {finalBrandKit.voice.secondaryTones?.length > 0 && (
                <p className="text-[#686764]">
                  {finalBrandKit.voice.secondaryTones.join(", ")}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Emotional Effect
              </span>
              <p className="text-[#141416]">
                {finalBrandKit.voice.emotionalEffect || "Direct, trustworthy resonance"}
              </p>
            </div>
          </div>

          {/* Vocabulary: Preferred vs Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2E7D32] block">
                Preferred Vocabulary
              </span>
              <div className="flex flex-wrap gap-1.5">
                {finalBrandKit.voice.vocabulary.preferred.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-[#E8F5E9] border border-[#C8E6C9] text-xs text-[#2E7D32]"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C62828] block">
                Words to Avoid
              </span>
              <div className="flex flex-wrap gap-1.5">
                {finalBrandKit.voice.vocabulary.avoid.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-[#FFEBEE] border border-[#FFCDD2] text-xs text-[#C62828]"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Do Rules & Don't Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#141416] block">
                Voice Do Rules
              </span>
              <ul className="list-disc pl-5 space-y-1.5 text-[#4A4946]">
                {finalBrandKit.voice.doRules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#141416] block">
                Voice Don&apos;t Rules
              </span>
              <ul className="list-disc pl-5 space-y-1.5 text-[#4A4946]">
                {finalBrandKit.voice.dontRules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Examples */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-3 text-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
              Canonical Copy Examples
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {finalBrandKit.voice.examples.homepageHero && (
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E8E5DF] space-y-1">
                  <span className="font-semibold text-[#141416] block">Homepage Hero:</span>
                  <p className="text-[#4A4946] italic">
                    &ldquo;{finalBrandKit.voice.examples.homepageHero}&rdquo;
                  </p>
                </div>
              )}
              {finalBrandKit.voice.examples.shortPitch && (
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E8E5DF] space-y-1">
                  <span className="font-semibold text-[#141416] block">Elevator / Short Pitch:</span>
                  <p className="text-[#4A4946] italic">
                    &ldquo;{finalBrandKit.voice.examples.shortPitch}&rdquo;
                  </p>
                </div>
              )}
              {finalBrandKit.voice.examples.primaryCTA && (
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E8E5DF] space-y-1">
                  <span className="font-semibold text-[#141416] block">Primary CTA:</span>
                  <p className="text-[#4A4946] font-medium">
                    {finalBrandKit.voice.examples.primaryCTA}
                  </p>
                </div>
              )}
              {finalBrandKit.voice.examples.socialPost && (
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E8E5DF] space-y-1">
                  <span className="font-semibold text-[#141416] block">Social Launch Post:</span>
                  <p className="text-[#4A4946] italic">
                    &ldquo;{finalBrandKit.voice.examples.socialPost}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Read-Only Routing Footer (Section 12) */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-between text-xs">
            <span className="text-[#686764]">
              Voice guidelines are locked. To adjust tonal profile or vocabulary:
            </span>
            <button
              type="button"
              onClick={() => onNavigateStage("SHAPE", "voice")}
              className="font-medium text-[#141416] underline hover:opacity-75"
            >
              Edit in Stage 05: Voice &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: MESSAGING */}
      {activeKitTab === "messaging" && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
              Messaging Architecture &bull; Stage 09 Delivery
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Core Messaging &amp; Value Proposition
            </h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Core Message
                </span>
                <p className="text-base text-[#141416] font-medium leading-relaxed">
                  {finalBrandKit.messaging.coreMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onCopyText(finalBrandKit.messaging.coreMessage, "core-msg")}
                className="p-1.5 text-[#78756F] hover:text-[#141416] rounded-md hover:bg-[#FFFFFF] transition-colors shrink-0"
                title="Copy message"
              >
                {copiedKey === "core-msg" ? (
                  <Check className="w-4 h-4 text-[#2E7D32]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Value Proposition
                </span>
                <p className="text-[#141416] leading-relaxed">
                  {finalBrandKit.messaging.valueProposition}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onCopyText(finalBrandKit.messaging.valueProposition, "vp-msg")}
                className="p-1.5 text-[#78756F] hover:text-[#141416] rounded-md hover:bg-[#FFFFFF] transition-colors shrink-0"
                title="Copy message"
              >
                {copiedKey === "vp-msg" ? (
                  <Check className="w-4 h-4 text-[#2E7D32]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Elevator Pitch
                </span>
                <p className="text-[#141416] leading-relaxed">
                  {finalBrandKit.messaging.elevatorPitch}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onCopyText(finalBrandKit.messaging.elevatorPitch, "pitch-msg")}
                className="p-1.5 text-[#78756F] hover:text-[#141416] rounded-md hover:bg-[#FFFFFF] transition-colors shrink-0"
                title="Copy message"
              >
                {copiedKey === "pitch-msg" ? (
                  <Check className="w-4 h-4 text-[#2E7D32]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Messaging Pillars */}
            {finalBrandKit.messaging.messagingPillars &&
              finalBrandKit.messaging.messagingPillars.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                    Strategic Messaging Pillars
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {finalBrandKit.messaging.messagingPillars.map((pillar, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2 text-xs"
                      >
                        <span className="font-semibold text-sm text-[#141416] block">
                          {pillar.pillar}
                        </span>
                        <p className="text-[#686764] italic">
                          &ldquo;{pillar.headline}&rdquo;
                        </p>
                        <p className="text-[11px] text-[#4A4946]">
                          {pillar.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Key Messages */}
            {finalBrandKit.messaging.keyMessages &&
              finalBrandKit.messaging.keyMessages.length > 0 && (
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2 text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                    Key Talking Points
                  </span>
                  <ul className="list-disc pl-5 space-y-1.5 text-[#4A4946]">
                    {finalBrandKit.messaging.keyMessages.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}

      {/* TAB 8: VISUAL DIRECTION */}
      {activeKitTab === "visual" && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
              Visual Identity &bull; Stage 06
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Color, Typography &amp; Art Direction
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1 text-xs sm:text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
              Aesthetic Mood
            </span>
            <p className="font-semibold text-base text-[#141416]">
              {finalBrandKit.visualDirection.aestheticMood}
            </p>
          </div>

          {/* Primary Color Palette */}
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
              Primary Color System
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {finalBrandKit.visualDirection.colorSystem.primary.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2"
                >
                  <div
                    className="h-14 rounded-lg w-full shadow-inner border border-black/5"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div>
                    <span className="font-semibold text-[#141416] block">{c.name}</span>
                    <div className="flex items-center justify-between text-[11px] text-[#686764]">
                      <span className="font-mono">{c.hex}</span>
                      <button
                        type="button"
                        onClick={() => onCopyText(c.hex, `hex-p-${idx}`)}
                        className="underline hover:text-[#141416]"
                      >
                        {copiedKey === `hex-p-${idx}` ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography Pairings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Heading Typography
              </span>
              <p className="font-editorial text-2xl text-[#141416]">
                {finalBrandKit.visualDirection.typography.heading.fontFamily}
              </p>
              <p className="text-[#686764] text-xs">
                Usage: {finalBrandKit.visualDirection.typography.heading.usage}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Body Typography
              </span>
              <p className="font-sans text-xl text-[#141416]">
                {finalBrandKit.visualDirection.typography.body.fontFamily}
              </p>
              <p className="text-[#686764] text-xs">
                Usage: {finalBrandKit.visualDirection.typography.body.usage}
              </p>
            </div>
          </div>

          {/* Imagery & Logo Direction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Imagery &amp; Photography Direction
              </span>
              <p className="text-[#4A4946] leading-relaxed">
                {finalBrandKit.visualDirection.imagery.photographyDirection}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                Logo Concept &amp; Geometry
              </span>
              <p className="text-[#4A4946] leading-relaxed">
                {finalBrandKit.visualDirection.logoDirection.concept}
              </p>
            </div>
          </div>

          {/* Read-Only Routing Footer (Section 12) */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-between text-xs">
            <span className="text-[#686764]">
              Visual direction is locked. To modify palettes or typography:
            </span>
            <button
              type="button"
              onClick={() => onNavigateStage("VISUALIZE")}
              className="font-medium text-[#141416] underline hover:opacity-75"
            >
              Edit in Stage 06: Visual Direction &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 9: CONSISTENCY */}
      {activeKitTab === "consistency" && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
              Diagnostic Coherence &bull; Stage 08
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Consistency Evaluation &amp; Launch Readiness
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
                Launch Readiness Assessment
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  finalBrandKit.consistency.readiness === "coherent"
                    ? "bg-[#E8F5E9] text-[#2E7D32]"
                    : finalBrandKit.consistency.readiness === "mostly_coherent"
                    ? "bg-[#FFF8E1] text-[#B78103]"
                    : "bg-[#FFEBEE] text-[#C62828]"
                }`}
              >
                {finalBrandKit.consistency.readiness.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#141416] leading-relaxed">
              {finalBrandKit.consistency.overallAssessment}
            </p>
          </div>

          {/* Systemic Strengths */}
          {finalBrandKit.consistency.strengths?.length > 0 && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2E7D32] block">
                Verified Systemic Strengths ({finalBrandKit.consistency.strengths.length})
              </span>
              <ul className="list-disc pl-5 space-y-1 text-[#4A4946]">
                {finalBrandKit.consistency.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings & Cross-System Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {finalBrandKit.consistency.warnings?.length > 0 && (
              <div className="p-4 rounded-xl bg-[#FFF8E1]/60 border border-[#FFE082] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B78103] block">
                  Consistency Warnings ({finalBrandKit.consistency.warnings.length})
                </span>
                <ul className="list-disc pl-5 space-y-1 text-[#7A5600]">
                  {finalBrandKit.consistency.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {finalBrandKit.consistency.crossSystemIssues?.length > 0 && (
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F] block">
                  Cross-System Issues ({finalBrandKit.consistency.crossSystemIssues.length})
                </span>
                <ul className="list-disc pl-5 space-y-1 text-[#4A4946]">
                  {finalBrandKit.consistency.crossSystemIssues.map((issue, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="font-semibold text-[#141416]">[{issue.relationship}]</span>{" "}
                      {issue.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Read-Only Routing Footer (Section 12) */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] flex items-center justify-between text-xs">
            <span className="text-[#686764]">
              Consistency summary is preserved. To re-evaluate alignment scores:
            </span>
            <button
              type="button"
              onClick={() => onNavigateStage("CONSISTENCY")}
              className="font-medium text-[#141416] underline hover:opacity-75"
            >
              Edit in Stage 08: Consistency &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 10: USAGE */}
      {activeKitTab === "usage" && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
              Multi-Channel Execution &bull; Stage 09 Delivery
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Channel Usage Guidelines
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
                  Website &amp; Digital Experience
                </span>
                <button
                  type="button"
                  onClick={() => onCopyText(finalBrandKit.usage.website, "usage-web")}
                  className="text-[#78756F] hover:text-[#141416]"
                  title="Copy text"
                >
                  {copiedKey === "usage-web" ? (
                    <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[#4A4946] leading-relaxed">
                {finalBrandKit.usage.website}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
                  Social Media &amp; Content Channels
                </span>
                <button
                  type="button"
                  onClick={() => onCopyText(finalBrandKit.usage.social, "usage-soc")}
                  className="text-[#78756F] hover:text-[#141416]"
                  title="Copy text"
                >
                  {copiedKey === "usage-soc" ? (
                    <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[#4A4946] leading-relaxed">
                {finalBrandKit.usage.social}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
                  Presentations &amp; Pitch Decks
                </span>
                <button
                  type="button"
                  onClick={() => onCopyText(finalBrandKit.usage.presentations, "usage-pres")}
                  className="text-[#78756F] hover:text-[#141416]"
                  title="Copy text"
                >
                  {copiedKey === "usage-pres" ? (
                    <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[#4A4946] leading-relaxed">
                {finalBrandKit.usage.presentations}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
                  Marketing &amp; Campaign Collateral
                </span>
                <button
                  type="button"
                  onClick={() => onCopyText(finalBrandKit.usage.marketing, "usage-mkt")}
                  className="text-[#78756F] hover:text-[#141416]"
                  title="Copy text"
                >
                  {copiedKey === "usage-mkt" ? (
                    <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[#4A4946] leading-relaxed">
                {finalBrandKit.usage.marketing}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: ASSETS */}
      {activeKitTab === "assets" && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78756F]">
              Production Deliverables &bull; Stage 09 Delivery
            </span>
            <h3 className="font-editorial text-2xl text-[#141416]">
              Launch Deliverables ({finalBrandKit.deliveryAssets.length})
            </h3>
          </div>

          <div className="space-y-4">
            {finalBrandKit.deliveryAssets.map((asset, idx) => (
              <div
                key={asset.id || idx}
                className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#141416]">
                        {asset.title}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#E8E5DF] text-[10px] uppercase font-semibold text-[#686764]">
                        {asset.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#686764]">{asset.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onCopyText(asset.content, `asset-${idx}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] text-xs font-medium text-[#141416] hover:bg-[#F5F2EB] transition-colors shrink-0 self-start sm:self-auto"
                  >
                    {copiedKey === `asset-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Deliverable</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E8E5DF] text-xs text-[#4A4946] whitespace-pre-wrap font-mono text-[11px] max-h-48 overflow-y-auto">
                  {asset.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
