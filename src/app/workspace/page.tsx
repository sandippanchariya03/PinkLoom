"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlayCircle,
  ChevronRight,
  Compass,
  Target,
  Sparkles,
  Palette,
  ShieldAlert,
  Layers,
  PackageCheck,
  Bot,
} from "lucide-react";
import { WORKFLOW_STAGES, type WorkflowStage, type WorkflowStatus } from "@/types/workflow";

// Stage-specific icons for clean editorial representation
const STAGE_ICONS: Record<WorkflowStage, React.ElementType> = {
  DISCOVER: Compass,
  POSITION: Target,
  SHAPE: Sparkles,
  VISUALIZE: Palette,
  CHALLENGE: ShieldAlert,
  CONSISTENCY: Layers,
  DELIVER: PackageCheck,
};

// Initial demonstration status for the workspace shell
const INITIAL_DEMO_STATUSES: Record<WorkflowStage, WorkflowStatus> = {
  DISCOVER: "completed",
  POSITION: "completed",
  SHAPE: "running",
  VISUALIZE: "waiting",
  CHALLENGE: "waiting",
  CONSISTENCY: "waiting",
  DELIVER: "waiting",
};

export default function WorkspacePage() {
  const [selectedStage, setSelectedStage] = useState<WorkflowStage>("SHAPE");
  const [stageStatuses] = useState<Record<WorkflowStage, WorkflowStatus>>(INITIAL_DEMO_STATUSES);
  const [rawIdea] = useState<string>(
    "An AI brand intelligence platform that guides early-stage founders to craft cohesive, memorable identities through an adversarial critique and revision workflow."
  );

  const activeStageConfig = WORKFLOW_STAGES.find((s) => s.stage === selectedStage) || WORKFLOW_STAGES[0];
  const ActiveIcon = STAGE_ICONS[selectedStage];

  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case "running":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF8E1] text-[#B78103] animate-pulse">
            <PlayCircle className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFEBEE] text-[#C62828]">
            <AlertCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case "waiting":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0EDE6] text-[#78756F]">
            <Clock className="w-3.5 h-3.5" />
            Waiting
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#141416] flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-[#E8E5DF] bg-[#FFFFFF]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[#686764] hover:text-[#141416] transition-colors p-1.5 rounded-lg hover:bg-[#F0EDE6]"
              title="Return to Landing"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-4 w-px bg-[#E8E5DF]" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E87A90]" />
              <span className="font-semibold text-xs tracking-widest uppercase">PINKLOOM</span>
              <span className="text-[#96948F] text-xs">/</span>
              <span className="text-xs text-[#686764] font-medium">Brand Intelligence Pipeline</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#F0EDE6] text-[#686764] font-mono">
              Phase 1 Architecture Shell
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Staged AI Workflow Pipeline */}
        <section className="lg:col-span-5 space-y-4">
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-[#96948F]">
              Staged Workflow
            </h2>
            <p className="font-editorial text-2xl text-[#141416] mt-1">
              Brand Evolution Pipeline
            </p>
            <p className="text-xs text-[#686764] mt-1">
              Information flows sequentially with adversarial critique and structured validation.
            </p>
          </div>

          {/* Vertical Pipeline Representation */}
          <div className="space-y-2 mt-4">
            {WORKFLOW_STAGES.map((s, idx) => {
              const Icon = STAGE_ICONS[s.stage];
              const status = stageStatuses[s.stage];
              const isSelected = selectedStage === s.stage;

              return (
                <div key={s.stage} className="relative">
                  {/* Connecting Line Between Stages */}
                  {idx < WORKFLOW_STAGES.length - 1 && (
                    <div
                      className={`absolute left-6 top-12 w-0.5 h-6 z-0 ${
                        status === "completed" ? "bg-[#81C784]" : "bg-[#E8E5DF]"
                      }`}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedStage(s.stage)}
                    className={`relative z-10 w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#FFFFFF] border-[#141416] shadow-sm ring-1 ring-[#141416]/10"
                        : "bg-[#FFFFFF]/70 border-[#E8E5DF] hover:bg-[#FFFFFF] hover:border-[#D0CDC6]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          status === "completed"
                            ? "bg-[#E8F5E9] text-[#2E7D32]"
                            : status === "running"
                            ? "bg-[#FFF8E1] text-[#B78103]"
                            : "bg-[#F5F2EB] text-[#78756F]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#96948F]">0{s.order}</span>
                          <span className="text-sm font-semibold text-[#141416]">{s.label}</span>
                        </div>
                        <p className="text-xs text-[#686764] line-clamp-1">{s.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(status)}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? "text-[#141416] translate-x-0.5" : "text-[#96948F]"
                        }`}
                      />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Stage Inspection & Agent Trace View */}
        <section className="lg:col-span-7 space-y-6">
          {/* Active Stage Detail Panel */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between pb-6 border-b border-[#F0EDE6]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FDF0F3] text-[#E87A90] flex items-center justify-center">
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#96948F]">STAGE 0{activeStageConfig.order}</span>
                    <span className="text-[#DDD9D0]">·</span>
                    {getStatusBadge(stageStatuses[selectedStage])}
                  </div>
                  <h3 className="font-editorial text-2xl text-[#141416] mt-0.5">
                    {activeStageConfig.label} — {activeStageConfig.tagline}
                  </h3>
                </div>
              </div>
            </div>

            {/* Description & Objective */}
            <div className="py-5 space-y-4">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#96948F]">Stage Purpose</h4>
                <p className="text-sm text-[#4A4946] mt-1 leading-relaxed">
                  {activeStageConfig.description}
                </p>
              </div>

              {/* Associated Agents */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#96948F]">
                  Orchestrated Agents
                </h4>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {activeStageConfig.associatedAgents.map((agent) => (
                    <span
                      key={agent}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F8F6F0] border border-[#E8E5DF] text-xs font-medium text-[#141416]"
                    >
                      <Bot className="w-3.5 h-3.5 text-[#E87A90]" />
                      {agent}
                    </span>
                  ))}
                </div>
              </div>

              {/* Raw Idea Context Preview */}
              <div className="bg-[#FAF8F5] border border-[#EBE8E1] rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between text-xs text-[#96948F] mb-1.5">
                  <span className="font-mono uppercase tracking-wider">Root Idea Input</span>
                  <span>Read-Only State</span>
                </div>
                <p className="text-xs sm:text-sm text-[#383734] italic font-serif leading-relaxed">
                  &ldquo;{rawIdea}&rdquo;
                </p>
              </div>
            </div>

            {/* Execution Trace Demo Box (How the workflow will show judges live progress) */}
            <div className="mt-2 pt-4 border-t border-[#F0EDE6]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#96948F]">
                  Agent Run Trace Log
                </span>
                <span className="text-[11px] font-mono text-[#A5A39E]">
                  Architecture Specification: Phase 1
                </span>
              </div>

              <div className="rounded-xl bg-[#141416] text-[#E8E6DF] p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[#8E8C88] border-b border-[#2A292E] pb-2">
                  <span>AGENT TRACE ID</span>
                  <span>STATUS</span>
                </div>
                <div className="flex items-center justify-between text-[#81C784]">
                  <span>trace-01 [DiscoveryAgent]</span>
                  <span>COMPLETED (420ms)</span>
                </div>
                <div className="flex items-center justify-between text-[#81C784]">
                  <span>trace-02 [PositioningAgent]</span>
                  <span>COMPLETED (580ms)</span>
                </div>
                <div className="flex items-center justify-between text-[#FFD54F]">
                  <span>trace-03 [PersonalityAgent]</span>
                  <span>RUNNING</span>
                </div>
                <div className="flex items-center justify-between text-[#686764]">
                  <span>trace-04 [CriticAgent]</span>
                  <span>WAITING</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
