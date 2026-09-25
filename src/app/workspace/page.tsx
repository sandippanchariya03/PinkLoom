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
  ArrowRight,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Users,
  Key,
  RotateCcw,
  Terminal,
  Crosshair,
  TrendingUp,
  ShieldCheck,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { WORKFLOW_STAGES, type WorkflowStage, type WorkflowStatus } from "@/types/workflow";
import type { AgentRun } from "@/types/agent";
import type { BrandState, DiscoveryOutput, PositioningOutput } from "@/types/brand";

// Stage-specific icons
const STAGE_ICONS: Record<WorkflowStage, React.ElementType> = {
  DISCOVER: Compass,
  POSITION: Target,
  SHAPE: Sparkles,
  VISUALIZE: Palette,
  CHALLENGE: ShieldAlert,
  CONSISTENCY: Layers,
  DELIVER: PackageCheck,
};

const SAMPLE_IDEAS = [
  {
    title: "College Cofounders",
    text: "A platform that helps university students find serious, vetted technical and business cofounders on their campuses based on commitment level and complementary skills rather than just casual coffee chats.",
  },
  {
    title: "Artisanal Honey",
    text: "A direct-to-consumer regenerative honey brand partnering with regional family apiaries to deliver single-origin, traceable raw wildflower honey with pesticide testing reports for every jar.",
  },
  {
    title: "DevOps Incident Scribe",
    text: "An autonomous CLI and Slack tool that watches cloud alerts during production outages, synthesizes logs into real-time incident timelines, and drafts preliminary post-mortems for engineering teams.",
  },
];

export default function WorkspacePage() {
  const [selectedStage, setSelectedStage] = useState<WorkflowStage>("DISCOVER");

  // Idea input state
  const [rawIdea, setRawIdea] = useState<string>("");
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  // Workflow execution state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("Analyzing your idea...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real Agent State
  const [brandState, setBrandState] = useState<BrandState | null>(null);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [allRuns, setAllRuns] = useState<AgentRun[]>([]);

  // Phase 4 next milestone modal
  const [showPhase4Notice, setShowPhase4Notice] = useState<boolean>(false);

  // Dynamic Stage Status calculation
  const getStageStatus = (stage: WorkflowStage): WorkflowStatus => {
    if (stage === "DISCOVER") {
      if (isLoading && selectedStage === "DISCOVER") return "running";
      if (brandState?.discovery?.isAnalyzed) return "completed";
      if (errorMessage && !brandState?.discovery?.isAnalyzed) return "failed";
      return "waiting";
    }
    if (stage === "POSITION") {
      if (isLoading && selectedStage === "POSITION") return "running";
      if (brandState?.positioning?.isPositioned) return "completed";
      if (brandState?.discovery?.isAnalyzed) return "waiting";
      return "waiting";
    }
    return "waiting";
  };

  // 1. Run Discovery Stage
  const handleRunDiscovery = async (ideaToRun?: string) => {
    const textToAnalyze = (ideaToRun || rawIdea).trim();
    if (!textToAnalyze || textToAnalyze.length < 5) {
      setErrorMessage("Please enter an idea of at least 5 characters to analyze.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Connecting to Discovery Agent...");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes("Connecting")) return "Deconstructing problem space...";
        if (prev.includes("Deconstructing")) return "Mapping audience personas & pain points...";
        if (prev.includes("Mapping")) return "Detecting unstated assumptions & blind spots...";
        if (prev.includes("Detecting")) return "Formulating strategic clarifying questions...";
        return "Finalizing structured brand state...";
      });
    }, 1200);

    try {
      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawIdea: textToAnalyze,
          apiKey: customApiKey.trim() || undefined,
        }),
      });

      clearInterval(stepInterval);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Discovery agent execution failed.");
      }

      setBrandState(data.brandState);
      if (data.agentRun) {
        setActiveRun(data.agentRun);
        setAllRuns((prev) => [data.agentRun, ...prev.filter((r) => r.id !== data.agentRun.id)]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Discovery execution failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Run Positioning Stage (Consuming Discovery context)
  const handleRunPositioning = async () => {
    if (!brandState?.discovery?.isAnalyzed) {
      setErrorMessage("Cannot run Positioning: Discovery stage has not been completed yet.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Reading validated Discovery context...");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes("Reading")) return "Framing market category & advantage...";
        if (prev.includes("Framing")) return "Identifying competitive whitespace...";
        if (prev.includes("whitespace")) return "Formulating sharp differentiator & value prop...";
        if (prev.includes("differentiator")) return "Evaluating positioning risks & confidence...";
        return "Finalizing positioning strategy...";
      });
    }, 1200);

    try {
      const res = await fetch("/api/positioning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: brandState.projectId,
          apiKey: customApiKey.trim() || undefined,
          brandState,
        }),
      });

      clearInterval(stepInterval);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Positioning agent execution failed.");
      }

      setBrandState(data.brandState);
      if (data.agentRun) {
        setActiveRun(data.agentRun);
        setAllRuns((prev) => [data.agentRun, ...prev.filter((r) => r.id !== data.agentRun.id)]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Positioning execution failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const activeStageConfig = WORKFLOW_STAGES.find((s) => s.stage === selectedStage) || WORKFLOW_STAGES[0];
  const ActiveIcon = STAGE_ICONS[selectedStage];

  const discoveryData: DiscoveryOutput | null = brandState?.discovery?.isAnalyzed
    ? {
        problem: brandState.discovery.problem,
        targetAudience: brandState.discovery.targetAudience,
        userNeeds: brandState.discovery.userNeeds,
        constraints: brandState.discovery.constraints,
        assumptions: brandState.discovery.assumptions,
        missingInformation: brandState.discovery.missingInformation,
        clarifyingQuestions: brandState.discovery.clarifyingQuestions,
      }
    : null;

  const positioningData: PositioningOutput | null = brandState?.positioning?.isPositioned
    ? {
        category: brandState.positioning.category,
        categoryRationale: brandState.positioning.categoryRationale,
        positioningStatement: brandState.positioning.positioningStatement,
        differentiator: brandState.positioning.differentiator,
        valueProposition: brandState.positioning.valueProposition,
        competitiveWhitespace: brandState.positioning.competitiveWhitespace,
        alternatives: brandState.positioning.alternatives,
        proofPoints: brandState.positioning.proofPoints,
        risks: brandState.positioning.risks,
        confidence: brandState.positioning.confidence,
      }
    : null;

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#141416] flex flex-col font-sans">
      {/* Top Editorial Bar */}
      <header className="border-b border-[#E8E5DF] bg-[#FFFFFF]/85 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
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
              <span className="font-semibold text-xs tracking-widest uppercase text-[#141416]">PINKLOOM</span>
              <span className="text-[#96948F] text-xs">/</span>
              <span className="text-xs text-[#686764] font-medium">
                {selectedStage === "DISCOVER" ? "Stage 01: Discovery" : selectedStage === "POSITION" ? "Stage 02: Positioning" : "Brand Pipeline"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#E8E5DF] text-[#686764] hover:text-[#141416] hover:bg-[#F8F6F0] transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-[#E87A90]" />
              <span>{customApiKey ? "Custom Key Configured" : "API Key Settings"}</span>
            </button>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-mono border border-[#C8E6C9]">
              Phase 3 Live Engine
            </span>
          </div>
        </div>

        {/* Collapsible Key Configuration Drawer */}
        {showKeyInput && (
          <div className="border-t border-[#E8E5DF] bg-[#FDFBF7] px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="text-[#686764]">
                <span className="font-semibold text-[#141416]">LLM Provider Configuration:</span> Defaults to server environment variables (<code className="bg-[#EAE7E0] px-1 rounded">GEMINI_API_KEY</code>). Or provide a temporary session key:
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="password"
                  placeholder="Paste Gemini or OpenAI API Key..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="px-3 py-1.5 border border-[#D5D2CA] rounded-lg text-xs bg-white text-[#141416] w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-[#141416]"
                />
                {customApiKey && (
                  <button
                    type="button"
                    onClick={() => setCustomApiKey("")}
                    className="text-[#96948F] hover:text-[#141416] text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Staged AI Workflow Progression */}
        <section className="lg:col-span-4 space-y-4">
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-[#96948F]">
              Staged AI Pipeline
            </h2>
            <p className="font-editorial text-2xl text-[#141416] mt-1">
              Workflow Stages
            </p>
            <p className="text-xs text-[#686764] mt-1">
              Real agent execution with persistent state context.
            </p>
          </div>

          <div className="space-y-2 mt-4">
            {WORKFLOW_STAGES.map((s, idx) => {
              const Icon = STAGE_ICONS[s.stage];
              const status = getStageStatus(s.stage);
              const isSelected = selectedStage === s.stage;

              return (
                <div key={s.stage} className="relative">
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
                    <div className="flex items-center gap-3">
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
                      {status === "completed" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </span>
                      )}
                      {status === "running" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#B78103] bg-[#FFF8E1] px-2 py-0.5 rounded-full font-medium animate-pulse">
                          <PlayCircle className="w-3 h-3" />
                          Running
                        </span>
                      )}
                      {status === "failed" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#C62828] bg-[#FFEBEE] px-2 py-0.5 rounded-full font-medium">
                          <AlertCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                      {status === "waiting" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#78756F] bg-[#F0EDE6] px-2 py-0.5 rounded-full font-medium">
                          <Clock className="w-3 h-3" />
                          Waiting
                        </span>
                      )}
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

          {/* Live Agent Run Trace Box */}
          <div className="mt-6 rounded-2xl bg-[#141416] text-[#E8E6DF] p-4 font-mono text-xs border border-[#27262A] shadow-md">
            <div className="flex items-center justify-between border-b border-[#2A292E] pb-2 mb-3">
              <div className="flex items-center gap-2 text-[#E87A90]">
                <Terminal className="w-3.5 h-3.5" />
                <span className="font-semibold tracking-wider uppercase text-[11px]">Agent Execution Trace</span>
              </div>
              <span className="text-[10px] text-[#8E8C88]">
                {allRuns.length > 0 ? `${allRuns.length} trace${allRuns.length > 1 ? "s" : ""}` : "Live Status"}
              </span>
            </div>

            {activeRun ? (
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#8E8C88]">Agent:</span>
                  <span className="text-[#FBF9F6] font-semibold">{activeRun.agentName} Agent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8C88]">Stage:</span>
                  <span className="text-[#81C784] font-medium">{activeRun.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8C88]">Status:</span>
                  <span
                    className={
                      activeRun.status === "completed"
                        ? "text-[#81C784]"
                        : activeRun.status === "running"
                        ? "text-[#FFD54F]"
                        : "text-[#E57373]"
                    }
                  >
                    {activeRun.status.toUpperCase()}
                  </span>
                </div>
                {activeRun.durationMs !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-[#8E8C88]">Execution Time:</span>
                    <span className="text-[#FBF9F6]">{(activeRun.durationMs / 1000).toFixed(2)}s</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#8E8C88]">Run ID:</span>
                  <span className="text-[#8E8C88] truncate max-w-[140px]">{activeRun.id}</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-[#8E8C88] text-[11px]">
                No agent runs recorded yet.<br />
                Begin by analyzing an idea in Discovery.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Active Stage Content */}
        <section className="lg:col-span-8 space-y-6">
          {/* ============================================================== */}
          {/* STAGE 01: DISCOVERY                                            */}
          {/* ============================================================== */}
          {selectedStage === "DISCOVER" && (
            <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b border-[#F0EDE6]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FDF0F3] text-[#E87A90] flex items-center justify-center">
                    <ActiveIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#96948F]">STAGE 01</span>
                      <span className="text-[#DDD9D0]">·</span>
                      <span className="text-xs font-medium text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                        {brandState?.discovery?.isAnalyzed ? "Analyzed" : "Ready for Input"}
                      </span>
                    </div>
                    <h3 className="font-editorial text-2xl sm:text-3xl text-[#141416] mt-0.5">
                      Let&apos;s understand what you&apos;re building.
                    </h3>
                  </div>
                </div>

                {brandState?.discovery?.isAnalyzed && (
                  <button
                    type="button"
                    onClick={() => {
                      setBrandState(null);
                      setActiveRun(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#686764] hover:text-[#141416] px-3 py-1.5 rounded-lg border border-[#E8E5DF] hover:bg-[#F8F6F0]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Discovery Execution Issue</p>
                    <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                    <p className="mt-2 text-[11px] text-[#D32F2F]">
                      Tip: If you do not have an API key configured on the server, click &ldquo;API Key Settings&rdquo; in the top navigation to provide a session key.
                    </p>
                  </div>
                </div>
              )}

              {/* State 1: Input Form (when not yet analyzed) */}
              {!brandState?.discovery?.isAnalyzed && (
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="raw-idea-input"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#686764] mb-2"
                    >
                      Raw Startup, Product, or Community Idea
                    </label>
                    <textarea
                      id="raw-idea-input"
                      rows={5}
                      value={rawIdea}
                      onChange={(e) => setRawIdea(e.target.value)}
                      placeholder="Describe what you want to build in your own words. Don't worry about sounding polished or picking brand names yet. Focus on who you are helping and what pain you want to solve..."
                      className="w-full p-4 rounded-xl border border-[#D5D2CA] text-sm text-[#141416] bg-[#FCFBF8] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#141416]/10 focus:border-[#141416] transition-all resize-y"
                    />
                  </div>

                  {/* Inspiration Idea Chips */}
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#96948F] block mb-2">
                      Or try an example idea:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_IDEAS.map((sample) => (
                        <button
                          key={sample.title}
                          type="button"
                          onClick={() => {
                            setRawIdea(sample.text);
                            handleRunDiscovery(sample.text);
                          }}
                          disabled={isLoading}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#F5F2EB] hover:bg-[#EBE7DD] text-[#383734] transition-colors border border-[#E0DCD3] text-left"
                        >
                          <span className="font-medium text-[#141416]">✦ {sample.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      id="analyze-idea-btn"
                      onClick={() => handleRunDiscovery()}
                      disabled={isLoading || !rawIdea.trim()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-sm font-medium hover:bg-[#27262A] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FBF9F6] border-t-transparent rounded-full animate-spin" />
                          <span>{loadingStep}</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze my idea</span>
                          <ArrowRight className="w-4 h-4 text-[#E87A90]" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* State 2: Discovery Structured Results */}
              {discoveryData && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Raw Idea Recap */}
                  <div className="bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl p-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#96948F] block mb-1">
                      Input Idea (Raw Founder Statement)
                    </span>
                    <p className="text-xs sm:text-sm text-[#383734] italic font-serif leading-relaxed">
                      &ldquo;{brandState?.discovery.rawIdea}&rdquo;
                    </p>
                  </div>

                  {/* 1. Problem Statement */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                      <Target className="w-4 h-4 text-[#E87A90]" />
                      <span>The Core Problem</span>
                    </div>
                    <div className="bg-white border border-[#E8E5DF] rounded-xl p-5 shadow-xs">
                      <p className="text-sm text-[#27262A] leading-relaxed">
                        {discoveryData.problem}
                      </p>
                    </div>
                  </div>

                  {/* 2. Target Audience */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                      <Users className="w-4 h-4 text-[#E87A90]" />
                      <span>Target Audience Anatomy</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Primary Segment */}
                      <div className="bg-[#FAF9F5] border border-[#E8E5DF] rounded-xl p-4 space-y-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#686764] block">
                          Primary Persona
                        </span>
                        <p className="text-sm font-medium text-[#141416]">
                          {discoveryData.targetAudience.primary}
                        </p>
                        {discoveryData.targetAudience.characteristics.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[10px] text-[#96948F] block mb-1">Key Traits:</span>
                            <ul className="text-xs text-[#52514D] space-y-1 list-disc list-inside">
                              {discoveryData.targetAudience.characteristics.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Pain Points & Motivations */}
                      <div className="bg-[#FAF9F5] border border-[#E8E5DF] rounded-xl p-4 space-y-3">
                        <div>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-[#C62828] block mb-1">
                            Acute Pain Points
                          </span>
                          <ul className="text-xs text-[#52514D] space-y-1">
                            {discoveryData.targetAudience.painPoints.map((p, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#C62828]">•</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {discoveryData.targetAudience.motivations.length > 0 && (
                          <div>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#2E7D32] block mb-1">
                              Underlying Motivations
                            </span>
                            <ul className="text-xs text-[#52514D] space-y-1">
                              {discoveryData.targetAudience.motivations.map((m, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-[#2E7D32]">•</span>
                                  <span>{m}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. User Needs & Constraints */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* User Needs */}
                    <div className="border border-[#E8E5DF] rounded-xl p-4 bg-white space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                        <Lightbulb className="w-3.5 h-3.5 text-[#E87A90]" />
                        <span>Core User Needs</span>
                      </div>
                      <ul className="text-xs text-[#4A4946] space-y-2 pt-1">
                        {discoveryData.userNeeds.map((need, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E87A90] shrink-0 mt-1.5" />
                            <span>{need}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Constraints */}
                    <div className="border border-[#E8E5DF] rounded-xl p-4 bg-white space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#F57C00]" />
                        <span>Practical Constraints</span>
                      </div>
                      <ul className="text-xs text-[#4A4946] space-y-2 pt-1">
                        {discoveryData.constraints.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F57C00] shrink-0 mt-1.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 4. Assumptions & Missing Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#FFFDF7] border border-[#FFE8B3] rounded-xl p-4 space-y-2">
                      <span className="text-xs font-semibold tracking-wider uppercase text-[#B78103] block">
                        Unproven Assumptions
                      </span>
                      <ul className="text-xs text-[#52514D] space-y-1.5">
                        {discoveryData.assumptions.map((a, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#B78103]">?</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl p-4 space-y-2">
                      <span className="text-xs font-semibold tracking-wider uppercase text-[#495057] block">
                        Missing Information / Blind Spots
                      </span>
                      <ul className="text-xs text-[#52514D] space-y-1.5">
                        {discoveryData.missingInformation.map((m, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#6C757D]">!</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 5. Clarifying Questions */}
                  <div className="bg-[#FDF9FA] border border-[#F3CFD7] rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#C85A70]">
                      <HelpCircle className="w-4 h-4" />
                      <span>Clarifying Questions to Refine Focus</span>
                    </div>
                    <div className="space-y-2">
                      {discoveryData.clarifyingQuestions.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#2A292E] bg-white p-2.5 rounded-lg border border-[#F3CFD7]">
                          <span className="font-mono text-[#C85A70] font-semibold">{i + 1}.</span>
                          <span className="font-medium">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Information Flow Transition to Stage 02: Positioning */}
                  <div className="pt-4 border-t border-[#F0EDE6] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-[#686764]">
                      <span className="font-semibold text-[#141416]">Stage 01 Completed.</span> Information has been committed to BrandState.
                    </div>
                    <button
                      type="button"
                      id="approve-discovery-btn"
                      onClick={() => setSelectedStage("POSITION")}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-all shadow-sm"
                    >
                      <span>Approve & Continue to Stage 02 (Positioning)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E87A90]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 02: POSITIONING (PHASE 3 REAL ENGINE)                    */}
          {/* ============================================================== */}
          {selectedStage === "POSITION" && (
            <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b border-[#F0EDE6]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#F0F5FD] text-[#3B82F6] flex items-center justify-center">
                    <Crosshair className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#96948F]">STAGE 02</span>
                      <span className="text-[#DDD9D0]">·</span>
                      <span className="text-xs font-medium text-[#1E40AF] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                        {brandState?.positioning?.isPositioned ? "Positioned" : "Strategic Synthesis"}
                      </span>
                    </div>
                    <h3 className="font-editorial text-2xl sm:text-3xl text-[#141416] mt-0.5">
                      Where should this idea live?
                    </h3>
                  </div>
                </div>

                {brandState?.positioning?.isPositioned && (
                  <button
                    type="button"
                    onClick={() => handleRunPositioning()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-[#686764] hover:text-[#141416] px-3 py-1.5 rounded-lg border border-[#E8E5DF] hover:bg-[#F8F6F0]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Re-evaluate
                  </button>
                )}
              </div>

              {/* Information Flow Banner: Visualizes Discovery -> Positioning link */}
              <div className="p-3.5 rounded-xl bg-[#F8F6F0] border border-[#EAE6DC] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#4A4946]">
                  <LinkIcon className="w-3.5 h-3.5 text-[#E87A90]" />
                  <span>
                    <span className="font-semibold text-[#141416]">Information Flow:</span> Positioning consumes verified context directly from Stage 01 (Discovery).
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8C8A84] hidden sm:inline">
                  BrandState v{brandState?.version || 1}
                </span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Positioning Execution Issue</p>
                    <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Guard: If Discovery is NOT analyzed yet */}
              {!brandState?.discovery?.isAnalyzed ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="font-editorial text-2xl text-[#141416]">Discovery Context Required</h4>
                  <p className="text-xs sm:text-sm text-[#686764] max-w-md mx-auto leading-relaxed">
                    The Positioning Agent cannot formulate strategic category framing or differentiators in a vacuum. It must build upon the validated problems and personas from Stage 01.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedStage("DISCOVER")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-all"
                  >
                    <span>← Go to Stage 01: Discover</span>
                  </button>
                </div>
              ) : !brandState.positioning?.isPositioned ? (
                /* Ready to Run Positioning */
                <div className="space-y-6">
                  {/* Verified Discovery Ingest Preview */}
                  <div className="border border-[#E8E5DF] rounded-xl p-5 bg-[#FAF9F5] space-y-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#96948F] block">
                      Ingested Discovery Parameters
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-[#141416] block">Problem Target:</span>
                        <p className="text-[#52514D] mt-0.5 line-clamp-2">{brandState.discovery.problem}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-[#141416] block">Primary Audience:</span>
                        <p className="text-[#52514D] mt-0.5">{brandState.discovery.targetAudience.primary}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#141416]">Strategic Objective for this Stage</h4>
                    <p className="text-xs text-[#686764] leading-relaxed">
                      The Positioning Agent will frame an advantageous market category, articulate what genuinely differentiates this venture from alternatives, and pinpoint competitive whitespace gaps.
                    </p>
                  </div>

                  {/* Trigger Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      id="generate-positioning-btn"
                      onClick={() => handleRunPositioning()}
                      disabled={isLoading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-sm font-medium hover:bg-[#27262A] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FBF9F6] border-t-transparent rounded-full animate-spin" />
                          <span>{loadingStep}</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 text-[#E87A90]" />
                          <span>Generate Market Positioning Strategy</span>
                          <ArrowRight className="w-4 h-4 text-[#96948F]" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* State: Positioning Results Display */
                positioningData && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    {/* Confidence & Category Banner */}
                    <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#E1E4E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#6C757D] block">
                          Market Category & Subcategory Framing
                        </span>
                        <p className="text-base font-semibold text-[#141416] mt-0.5">
                          {positioningData.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6C757D]">Strategic Confidence:</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32]">
                          {positioningData.confidence}%
                        </span>
                      </div>
                    </div>

                    {/* Category Rationale */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold tracking-wider uppercase text-[#141416]">
                        Category Framing Rationale
                      </span>
                      <div className="bg-white border border-[#E8E5DF] rounded-xl p-4 text-xs sm:text-sm text-[#4A4946] leading-relaxed">
                        {positioningData.categoryRationale}
                      </div>
                    </div>

                    {/* The Core Positioning Statement */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#C85A70]">
                        <Target className="w-4 h-4" />
                        <span>Core Positioning Statement</span>
                      </div>
                      <div className="bg-[#FAF8F5] border-2 border-[#E87A90]/30 rounded-xl p-6 shadow-xs">
                        <p className="font-editorial text-xl sm:text-2xl text-[#141416] leading-relaxed italic">
                          &ldquo;{positioningData.positioningStatement}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Differentiator & Value Proposition Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Differentiator Wedge */}
                      <div className="border border-[#E8E5DF] rounded-xl p-5 bg-white space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                          <Crosshair className="w-4 h-4 text-[#E87A90]" />
                          <span>The Primary Differentiator</span>
                        </div>
                        <p className="text-sm font-medium text-[#27262A] leading-relaxed pt-1">
                          {positioningData.differentiator}
                        </p>
                      </div>

                      {/* Value Proposition */}
                      <div className="border border-[#E8E5DF] rounded-xl p-5 bg-white space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                          <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
                          <span>Value Proposition</span>
                        </div>
                        <p className="text-sm font-medium text-[#27262A] leading-relaxed pt-1">
                          {positioningData.valueProposition}
                        </p>
                      </div>
                    </div>

                    {/* Competitive Whitespace & Existing Alternatives */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Competitive Whitespace */}
                      <div className="bg-[#F7FAF7] border border-[#C8E6C9] rounded-xl p-5 space-y-2">
                        <span className="text-xs font-semibold tracking-wider uppercase text-[#2E7D32] block">
                          Uncontested Competitive Whitespace
                        </span>
                        <ul className="text-xs text-[#383734] space-y-2 pt-1">
                          {positioningData.competitiveWhitespace.map((gap, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] shrink-0 mt-1.5" />
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Alternatives & Workarounds */}
                      <div className="bg-[#FFFDF7] border border-[#FFE8B3] rounded-xl p-5 space-y-2">
                        <span className="text-xs font-semibold tracking-wider uppercase text-[#B78103] block">
                          Current Alternatives & Workarounds
                        </span>
                        <ul className="text-xs text-[#52514D] space-y-2 pt-1">
                          {positioningData.alternatives.map((alt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#B78103] font-mono">•</span>
                              <span>{alt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Proof Points & Strategic Risks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Proof Points */}
                      <div className="border border-[#E8E5DF] rounded-xl p-5 bg-white space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                          <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                          <span>Required Proof Points</span>
                        </div>
                        <ul className="text-xs text-[#52514D] space-y-1.5 pt-1">
                          {positioningData.proofPoints.map((pp, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-[#3B82F6] shrink-0 mt-0.5" />
                              <span>{pp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Strategic Risks */}
                      <div className="border border-[#E8E5DF] rounded-xl p-5 bg-white space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#C62828]">
                          <AlertCircle className="w-4 h-4" />
                          <span>Identified Positioning Risks</span>
                        </div>
                        <ul className="text-xs text-[#52514D] space-y-1.5 pt-1">
                          {positioningData.risks.map((risk, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#C62828] font-bold">!</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Transition to Stage 03 (Approval Gate) */}
                    <div className="pt-4 border-t border-[#F0EDE6] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-xs text-[#686764]">
                        <span className="font-semibold text-[#141416]">Stage 02 Completed.</span> Market positioning committed to BrandState.
                      </div>
                      <button
                        type="button"
                        id="approve-positioning-btn"
                        onClick={() => setShowPhase4Notice(true)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-all shadow-sm"
                      >
                        <span>Approve & Continue to Stage 03 (Shape)</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#E87A90]" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGES 03-07: PHASE 4+ BOUNDARY PLACEHOLDER                   */}
          {/* ============================================================== */}
          {selectedStage !== "DISCOVER" && selectedStage !== "POSITION" && (
            <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F2EB] text-[#78756F] flex items-center justify-center mx-auto">
                <ActiveIcon className="w-7 h-7" />
              </div>
              <h3 className="font-editorial text-3xl text-[#141416]">
                {activeStageConfig.label} — {activeStageConfig.tagline}
              </h3>
              <p className="text-xs sm:text-sm text-[#686764] max-w-md mx-auto leading-relaxed">
                {activeStageConfig.description}
              </p>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] text-xs text-[#78756F] max-w-md mx-auto">
                <p className="font-semibold text-[#141416]">Phase 3 Architectural Boundary</p>
                <p className="mt-1">
                  The {activeStageConfig.label} stage is typed and scheduled for Phase 4. It will consume the validated Positioning and Discovery data from the shared BrandState.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStage("POSITION")}
                className="inline-flex items-center gap-1.5 text-xs text-[#141416] font-medium underline underline-offset-4 hover:opacity-75"
              >
                ← Return to Stage 02: Position
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Phase 4 Milestone Modal */}
      {showPhase4Notice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-2xl text-[#141416]">
              Positioning Strategy Approved
            </h4>
            <p className="text-xs text-[#686764] leading-relaxed">
              Stage 02 (Positioning) has successfully concluded. The BrandState now holds both the verified problem/audience truth and your defensible market wedge.
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs text-[#4A4946] space-y-1">
              <span className="font-semibold text-[#141416] block">Next Phase Milestone:</span>
              <p>
                Stage 03 (Shape: Personality, Naming, and Voice) will activate in Phase 4.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPhase4Notice(false)}
                className="px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
