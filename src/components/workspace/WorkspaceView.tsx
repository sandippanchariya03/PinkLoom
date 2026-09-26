"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Lock,
  X,
  Heart,
  BookmarkCheck,
  Tag,
  Globe,
  Volume2,
  Quote,
  Sliders,
  FileText,
  Copy,
  History,
} from "lucide-react";
import { WORKFLOW_STAGES, type WorkflowStage } from "@/types/workflow";
import type { AgentRun } from "@/types/agent";
import {
  type BrandState,
  type DiscoveryOutput,
  type PositioningOutput,
  type PersonalityOutput,
  type Naming,
  type Voice,
  createInitialBrandState,
} from "@/types/brand";
import { canRunDelivery, canRunFinalBrandKit } from "@/lib/agents/stages";
import { FinalBrandKitView } from "@/components/brand-kit/FinalBrandKitView";
import { CriticView } from "@/components/critic/CriticView";
import { AuthHeaderControl } from "@/components/auth/AuthHeaderControl";
import { getCurrentUser, onAuthStateChange, getUserStorageKey, type UserProfile } from "@/lib/auth/auth";

// Stage-specific icons
const STAGE_ICONS: Record<WorkflowStage, React.ElementType> = {
  DISCOVER: Compass,
  POSITION: Target,
  SHAPE: Sparkles,
  VISUALIZE: Palette,
  CHALLENGE: ShieldAlert,
  CONSISTENCY: Layers,
  DELIVER: PackageCheck,
  DELIVERY: PackageCheck,
  BRAND_KIT: BookmarkCheck,
  FINAL_BRAND_KIT: BookmarkCheck,
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

export interface UnifiedWorkflowStageItem {
  id: string;
  order: string;
  label: string;
  tagline: string;
  stage: WorkflowStage;
  subStage?: "personality" | "naming" | "voice";
  icon: React.ElementType;
}

export const UNIFIED_WORKFLOW_STAGES: UnifiedWorkflowStageItem[] = [
  {
    id: "stage-01-discover",
    order: "01",
    label: "Discover",
    tagline: "Uncover the Core Intent",
    stage: "DISCOVER",
    icon: Compass,
  },
  {
    id: "stage-02-position",
    order: "02",
    label: "Position",
    tagline: "Claim Strategic Space",
    stage: "POSITION",
    icon: Target,
  },
  {
    id: "stage-03-personality",
    order: "03",
    label: "Personality",
    tagline: "Brand Archetype & DNA",
    stage: "SHAPE",
    subStage: "personality",
    icon: Sparkles,
  },
  {
    id: "stage-04-naming",
    order: "04",
    label: "Naming",
    tagline: "Create the Brand Name",
    stage: "SHAPE",
    subStage: "naming",
    icon: Tag,
  },
  {
    id: "stage-05-voice",
    order: "05",
    label: "Voice",
    tagline: "Define Brand Voice",
    stage: "SHAPE",
    subStage: "voice",
    icon: Volume2,
  },
  {
    id: "stage-06-visualize",
    order: "06",
    label: "Visualize",
    tagline: "Translate Soul into Form",
    stage: "VISUALIZE",
    icon: Palette,
  },
  {
    id: "stage-07-challenge",
    order: "07",
    label: "Challenge",
    tagline: "Stress-Test Against Reality",
    stage: "CHALLENGE",
    icon: ShieldAlert,
  },
  {
    id: "stage-08-consistency",
    order: "08",
    label: "Consistency",
    tagline: "Harmonize Every Dimension",
    stage: "CONSISTENCY",
    icon: Layers,
  },
  {
    id: "stage-09-deliver",
    order: "09",
    label: "Deliver",
    tagline: "Synthesize Launch Brand Kit",
    stage: "DELIVER",
    icon: PackageCheck,
  },
  {
    id: "stage-10-brand-kit",
    order: "10",
    label: "Final Brand Kit",
    tagline: "The Authoritative Brand System",
    stage: "BRAND_KIT",
    icon: BookmarkCheck,
  },
];

function WorkflowStageCard({
  item,
  isSelected,
  status,
  onSelect,
}: {
  item: UnifiedWorkflowStageItem;
  isSelected: boolean;
  status: "completed" | "running" | "failed" | "ready" | "waiting" | "locked";
  onSelect: () => void;
}) {
  const Icon = item.icon;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onSelect}
        aria-current={isSelected ? "step" : undefined}
        className={`relative z-10 w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${isSelected
          ? "bg-black border-2 border-[#FFD54F] shadow-[0_0_20px_rgba(255,213,79,0.22)] ring-1 ring-[#FFD54F]/50"
          : "bg-black border border-white/20 hover:border-white/40"
          }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-colors ${status === "completed"
              ? "bg-black text-blue-400 border border-blue-500/40"
              : status === "running"
                ? "bg-black text-yellow-400 border border-yellow-500/40 animate-pulse"
                : status === "failed"
                  ? "bg-black text-red-400 border border-red-500/40"
                  : isSelected
                    ? "bg-black text-[#FFD54F] border border-[#FFD54F]/50"
                    : "bg-black text-white border border-white/20 group-hover:text-white"
              }`}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>

          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-semibold ${isSelected ? "text-[#FFD54F]" : "text-white"
                  }`}
              >
                {item.order}
              </span>
              <span
                className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-white group-hover:text-white"
                  }`}
              >
                {item.label}
              </span>
            </div>
            <p className="text-xs text-white truncate leading-tight mt-0.5 font-normal">
              {item.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {status === "completed" && (
            <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 bg-black border border-blue-500/40 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="w-3 h-3 text-blue-400" />
              Done
            </span>
          )}
          {status === "running" && (
            <span className="inline-flex items-center gap-1 text-[11px] text-yellow-400 bg-black border border-yellow-500/40 px-2 py-0.5 rounded-full font-medium animate-pulse">
              <PlayCircle className="w-3 h-3 text-yellow-400" />
              Running
            </span>
          )}
          {status === "failed" && (
            <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-black border border-red-500/40 px-2 py-0.5 rounded-full font-medium">
              <AlertCircle className="w-3 h-3 text-red-400" />
              Failed
            </span>
          )}
          {status === "ready" && (
            <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 bg-black border border-blue-500/40 px-2.5 py-0.5 rounded-full font-medium">
              Ready
            </span>
          )}
          {status === "waiting" && (
            <span className="inline-flex items-center gap-1 text-[11px] text-white bg-black border border-white/20 px-2.5 py-0.5 rounded-full font-medium">
              <Clock className="w-3 h-3 text-white" />
              Waiting
            </span>
          )}
          {status === "locked" && (
            <span className="inline-flex items-center gap-1 text-[11px] text-white bg-black border border-white/20 px-2.5 py-0.5 rounded-full font-medium">
              <Lock className="w-3 h-3 text-white" />
              Locked
            </span>
          )}
          <ChevronRight
            className={`w-4 h-4 transition-transform ${isSelected ? "text-[#FFD54F] translate-x-0.5" : "text-white group-hover:text-white"
              }`}
          />
        </div>
      </button>
    </div>
  );
}

export interface WorkspaceViewProps {
  initialIdea?: string;
  onBackToWater?: () => void;
  onResetToCrucible?: () => void;
}

export function WorkspaceView({
  initialIdea = "",
  onBackToWater,
  onResetToCrucible,
}: WorkspaceViewProps) {
  // Current authenticated user (null = not yet resolved, undefined = guest)
  const [currentUser, setCurrentUser] = useState<UserProfile | null | undefined>(undefined);

  // Per-user scoped localStorage key helpers
  // Falls back to legacy global key when user is not yet known (server-side)
  const brandStateKey = currentUser
    ? getUserStorageKey(currentUser.id, "brand_state")
    : "pinkloom_brand_state";
  const agentRunsKey = currentUser
    ? getUserStorageKey(currentUser.id, "agent_runs")
    : "pinkloom_agent_runs";

  // Real Agent State (Hydrated lazily from localStorage on mount)
  const [brandState, setBrandState] = useState<BrandState | null>(null);
  const [allRuns, setAllRuns] = useState<AgentRun[]>([]);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [selectedStage, setSelectedStage] = useState<WorkflowStage>("DISCOVER");

  // Shape Stage Sub-Navigation (Stage 03 Personality vs Stage 04 Naming vs Stage 05 Voice)
  const [shapeSubStage, setShapeSubStage] = useState<"personality" | "naming" | "voice">("personality");

  // Idea input state (declared before hydration useEffect to prevent hoisting errors)
  const [rawIdea, setRawIdea] = useState<string>(initialIdea || "");

  // Load current user on mount and listen to auth changes
  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((profile) => {
      if (isMounted) {
        setCurrentUser(profile ?? null);
      }
    });

    const sub = onAuthStateChange((updated) => {
      if (isMounted) {
        setCurrentUser(updated ?? null);
      }
    });

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, []);

  // Once we know the user, hydrate state from their scoped localStorage (external system sync)
  useEffect(() => {
    if (currentUser === undefined) return; // not yet resolved

    const timer = setTimeout(() => {
      try {
        const bsKey = currentUser
          ? getUserStorageKey(currentUser.id, "brand_state")
          : "pinkloom_brand_state";
        const arKey = currentUser
          ? getUserStorageKey(currentUser.id, "agent_runs")
          : "pinkloom_agent_runs";

        const savedBrand = localStorage.getItem(bsKey);
        if (savedBrand) {
          const parsed = JSON.parse(savedBrand);
          if (parsed && typeof parsed === "object" && parsed.projectId) {
            setBrandState(parsed);
            // Restore stage
            if (parsed.finalBrandKit) setSelectedStage("BRAND_KIT");
            else if (parsed.delivery?.isDelivered) setSelectedStage("DELIVER");
            else if (parsed.consistency?.isEvaluated) setSelectedStage("CONSISTENCY");
            else if (parsed.critique?.isEvaluated) setSelectedStage("CHALLENGE");
            else if (parsed.visualDirection?.isGenerated) setSelectedStage("VISUALIZE");
            else if (parsed.voice?.isGenerated) {
              setSelectedStage("SHAPE");
              setShapeSubStage("voice");
            } else if (parsed.naming?.isSelected || parsed.naming?.isGenerated) {
              setSelectedStage("SHAPE");
              setShapeSubStage("naming");
            } else if (parsed.personality?.isFormulated) setSelectedStage("SHAPE");
            else if (parsed.positioning?.isPositioned) setSelectedStage("POSITION");
            // Restore raw idea (prefer pending idea entered in the Lotus Center)
            const pendingIdea = typeof window !== "undefined" ? sessionStorage.getItem("pinkloom_pending_idea") : null;
            if (pendingIdea) {
              setRawIdea(pendingIdea);
              sessionStorage.removeItem("pinkloom_pending_idea");
            } else if (parsed.discovery?.rawIdea) {
              setRawIdea(parsed.discovery.rawIdea);
            }
          }
        } else {
          const pendingIdea = typeof window !== "undefined" ? sessionStorage.getItem("pinkloom_pending_idea") : null;
          if (pendingIdea) {
            setRawIdea(pendingIdea);
            sessionStorage.removeItem("pinkloom_pending_idea");
          }
        }

        const savedRuns = localStorage.getItem(arKey);
        if (savedRuns) {
          const parsed = JSON.parse(savedRuns);
          if (Array.isArray(parsed)) {
            setAllRuns(parsed);
            if (parsed.length > 0) setActiveRun(parsed[0]);
          }
        }
      } catch {
        // ignore storage errors
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [currentUser]);


  // Final Brand Kit Navigation Tabs
  const [activeKitTab, setActiveKitTab] = useState<
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
  >("overview");

  // Idea input state
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  // Workflow execution state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("Analyzing your idea...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Approval Modals
  const [showPersonalityApprovedModal, setShowPersonalityApprovedModal] = useState<boolean>(false);
  const [showNamingApprovedModal, setShowNamingApprovedModal] = useState<boolean>(false);
  const [showVoiceApprovedModal, setShowVoiceApprovedModal] = useState<boolean>(false);
  const [showVisualApprovedModal, setShowVisualApprovedModal] = useState<boolean>(false);
  const [showCriticApprovedModal, setShowCriticApprovedModal] = useState<boolean>(false);
  const [showConsistencyApprovedModal, setShowConsistencyApprovedModal] = useState<boolean>(false);
  const [showDeliveryApprovedModal, setShowDeliveryApprovedModal] = useState<boolean>(false);
  const [showBrandKitApprovedModal, setShowBrandKitApprovedModal] = useState<boolean>(false);
  const [consistencySeverityFilter, setConsistencySeverityFilter] = useState<string>("all");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Persistence: Sync brandState to per-user localStorage whenever it changes
  useEffect(() => {
    if (brandState && currentUser !== undefined) {
      try {
        localStorage.setItem(brandStateKey, JSON.stringify(brandState));
      } catch {
        // ignore quota errors
      }
    }
  }, [brandState, brandStateKey, currentUser]);

  // Persistence: Sync allRuns to per-user localStorage whenever it changes
  useEffect(() => {
    if (allRuns && allRuns.length > 0 && currentUser !== undefined) {
      try {
        localStorage.setItem(agentRunsKey, JSON.stringify(allRuns));
      } catch {
        // ignore quota errors
      }
    }
  }, [allRuns, agentRunsKey, currentUser]);

  // Reset workspace to blank slate
  const handleResetBrand = () => {
    if (typeof window !== "undefined" && window.confirm("Reset workspace and start a fresh brand? This will clear current progress.")) {
      setBrandState(null);
      setActiveRun(null);
      setAllRuns([]);
      setRawIdea("");
      setSelectedStage("DISCOVER");
      setShapeSubStage("personality");
      try {
        localStorage.removeItem(brandStateKey);
        localStorage.removeItem(agentRunsKey);
      } catch {
        // ignore
      }
      if (onResetToCrucible) {
        onResetToCrucible();
      }
    }
  };

  // Authoritative Unified Stage Status Calculator (All 10 stages: 01 to 10)
  const getUnifiedStageStatus = (
    item: UnifiedWorkflowStageItem
  ): "completed" | "running" | "failed" | "ready" | "waiting" | "locked" => {
    // 01 Discover
    if (item.stage === "DISCOVER") {
      if (isLoading && selectedStage === "DISCOVER") return "running";
      if (brandState?.discovery?.isAnalyzed) return "completed";
      if (errorMessage && selectedStage === "DISCOVER") return "failed";
      return "ready";
    }

    // 02 Position
    if (item.stage === "POSITION") {
      if (isLoading && selectedStage === "POSITION") return "running";
      if (brandState?.positioning?.isPositioned) return "completed";
      if (brandState?.discovery?.isAnalyzed) return "waiting";
      return "locked";
    }

    // 03 Personality
    if (item.stage === "SHAPE" && item.subStage === "personality") {
      if (isLoading && selectedStage === "SHAPE" && shapeSubStage === "personality") return "running";
      if (brandState?.personality?.isFormulated) return "completed";
      if (brandState?.positioning?.isPositioned) return "waiting";
      return "locked";
    }

    // 04 Naming
    if (item.stage === "SHAPE" && item.subStage === "naming") {
      if (isLoading && selectedStage === "SHAPE" && shapeSubStage === "naming") return "running";
      if (brandState?.naming?.isSelected) return "completed";
      if (brandState?.naming?.isGenerated) return "running";
      if (brandState?.personality?.isFormulated) return "waiting";
      return "locked";
    }

    // 05 Voice
    if (item.stage === "SHAPE" && item.subStage === "voice") {
      if (isLoading && selectedStage === "SHAPE" && shapeSubStage === "voice") return "running";
      if (brandState?.voice?.isGenerated) return "completed";
      if (brandState?.naming?.isSelected) return "waiting";
      return "locked";
    }

    // 06 Visualize
    if (item.stage === "VISUALIZE") {
      if (isLoading && selectedStage === "VISUALIZE") return "running";
      if (brandState?.visualDirection?.isGenerated) return "completed";
      if (brandState?.voice?.isGenerated) return "waiting";
      return "locked";
    }

    // 07 Challenge
    if (item.stage === "CHALLENGE") {
      if (isLoading && selectedStage === "CHALLENGE") return "running";
      if (brandState?.critique?.isEvaluated) return "completed";
      if (brandState?.visualDirection?.isGenerated) return "waiting";
      return "locked";
    }

    // 08 Consistency
    if (item.stage === "CONSISTENCY") {
      if (isLoading && selectedStage === "CONSISTENCY") return "running";
      if (brandState?.consistency?.isEvaluated) return "completed";
      if (brandState?.visualDirection?.isGenerated) return "waiting";
      return "locked";
    }

    // 09 Deliver
    if (item.stage === "DELIVER") {
      if (isLoading && (selectedStage === "DELIVER" || selectedStage === "DELIVERY")) return "running";
      if (brandState?.delivery?.isDelivered) return "completed";
      if (brandState?.consistency?.isEvaluated) return "waiting";
      return "locked";
    }

    // 10 Final Brand Kit
    if (item.stage === "BRAND_KIT") {
      if (isLoading && (selectedStage === "BRAND_KIT" || selectedStage === "FINAL_BRAND_KIT")) return "running";
      if (brandState?.finalBrandKit) return "completed";
      if (brandState?.delivery?.isDelivered) return "waiting";
      return "locked";
    }

    return "waiting";
  };

  const isUnifiedStageSelected = (item: UnifiedWorkflowStageItem): boolean => {
    if (item.subStage) {
      return selectedStage === item.stage && shapeSubStage === item.subStage;
    }
    if (item.stage === "DELIVER") {
      return selectedStage === "DELIVER" || selectedStage === "DELIVERY";
    }
    if (item.stage === "BRAND_KIT") {
      return selectedStage === "BRAND_KIT" || selectedStage === "FINAL_BRAND_KIT";
    }
    return selectedStage === item.stage;
  };

  const handleSelectUnifiedStage = (item: UnifiedWorkflowStageItem) => {
    setSelectedStage(item.stage);
    if (item.subStage) {
      setShapeSubStage(item.subStage);
    }
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

  // 3. Run Personality Stage (Consuming Discovery & Positioning context)
  const handleRunPersonality = async () => {
    if (!brandState?.discovery?.isAnalyzed) {
      setErrorMessage("Cannot run Personality: Discovery stage has not been completed yet.");
      return;
    }
    if (!brandState?.positioning?.isPositioned) {
      setErrorMessage("Cannot run Personality: Positioning stage has not been completed yet.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Reading validated Discovery & Positioning context...");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes("Reading")) return "Synthesizing psychological archetype...";
        if (prev.includes("Synthesizing")) return "Distilling behavioral characteristics & traits...";
        if (prev.includes("Distilling")) return "Defining emotional territory & core principles...";
        if (prev.includes("Defining")) return "Formulating brand Do's and Don'ts...";
        return "Finalizing structured brand personality...";
      });
    }, 1200);

    try {
      const res = await fetch("/api/personality", {
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
        throw new Error(data.error || "Personality agent execution failed.");
      }

      setBrandState(data.brandState);
      if (data.agentRun) {
        setActiveRun(data.agentRun);
        setAllRuns((prev) => [data.agentRun, ...prev.filter((r) => r.id !== data.agentRun.id)]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Personality execution failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Run Naming Stage (Consuming Discovery, Positioning, & Personality context)
  const handleRunNaming = async () => {
    if (!brandState?.discovery?.isAnalyzed) {
      setErrorMessage("Cannot run Naming: Discovery stage has not been completed yet.");
      return;
    }
    if (!brandState?.positioning?.isPositioned) {
      setErrorMessage("Cannot run Naming: Positioning stage has not been completed yet.");
      return;
    }
    if (!brandState?.personality?.isFormulated) {
      setErrorMessage("Cannot run Naming: Personality stage has not been completed yet.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Reading validated Discovery, Positioning & Personality...");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes("Reading")) return "Synthesizing strategic naming territories...";
        if (prev.includes("territories")) return "Crafting candidates with linguistic & phonetic assessments...";
        if (prev.includes("linguistic")) return "Evaluating memorability, cadence & domain suitability...";
        if (prev.includes("memorability")) return "Composing complementary tagline directions...";
        return "Finalizing candidate naming territories...";
      });
    }, 1200);

    try {
      const res = await fetch("/api/naming", {
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
        throw new Error(data.error || "Naming agent execution failed.");
      }

      setBrandState(data.brandState);
      if (data.agentRun) {
        setActiveRun(data.agentRun);
        setAllRuns((prev) => [data.agentRun, ...prev.filter((r) => r.id !== data.agentRun.id)]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Naming execution failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Human Selection Action for Naming
  const handleSelectName = async (directionId: string, candidateName: string, tagline?: string) => {
    if (!brandState?.naming?.isGenerated) return;

    try {
      const res = await fetch("/api/naming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "select",
          projectId: brandState.projectId,
          directionId,
          candidateName,
          tagline,
          brandState,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to select candidate name.");
      }

      setBrandState(data.brandState);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to select candidate name.";
      setErrorMessage(msg);
    }
  };

  // 6. Run Voice Stage (Consuming Discovery, Positioning, Personality & Selected Name)
  const handleRunVoice = async () => {
    if (!brandState?.discovery?.isAnalyzed) {
      setErrorMessage("Cannot run Voice: Discovery stage has not been completed yet.");
      return;
    }
    if (!brandState?.positioning?.isPositioned) {
      setErrorMessage("Cannot run Voice: Positioning stage has not been completed yet.");
      return;
    }
    if (!brandState?.personality?.isFormulated) {
      setErrorMessage("Cannot run Voice: Personality stage has not been completed yet.");
      return;
    }
    if (!brandState?.naming?.isSelected || !brandState?.naming?.selectedName) {
      setErrorMessage("Cannot run Voice: You must select a candidate brand name in Stage 04 (Naming) first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Reading validated Strategy, Personality & Selected Name...");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes("Reading")) return "Calibrating multidimensional tone profiles...";
        if (prev.includes("tone")) return "Constructing preferred vocabulary & terminology rules...";
        if (prev.includes("vocabulary")) return "Architecting core strategic messaging pillars...";
        if (prev.includes("messaging")) return "Drafting production voice guidelines & copy examples...";
        return "Finalizing Brand Voice system...";
      });
    }, 1200);

    try {
      const res = await fetch("/api/voice", {
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
        throw new Error(data.error || "Voice agent execution failed.");
      }

      setBrandState(data.brandState);
      if (data.agentRun) {
        setActiveRun(data.agentRun);
        setAllRuns((prev) => [data.agentRun, ...prev.filter((r) => r.id !== data.agentRun.id)]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Voice execution failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Run Visual Direction Stage (Consuming Discovery, Positioning, Personality, Selected Name & Voice)
  const handleRunVisual = async () => {
    if (!brandState?.discovery?.isAnalyzed) {
      setErrorMessage("Cannot run Visual Direction: Discovery stage has not been completed yet.");
      return;
    }
    if (!brandState?.positioning?.isPositioned) {
      setErrorMessage("Cannot run Visual Direction: Positioning stage has not been completed yet.");
      return;
    }
    if (!brandState?.personality?.isFormulated) {
      setErrorMessage("Cannot run Visual Direction: Personality stage has not been completed yet.");
      return;
    }
    if (!brandState?.naming?.isSelected || !brandState?.naming?.selectedName) {
      setErrorMessage("Cannot run Visual Direction: You must select a candidate brand name in Stage 04 (Naming) first.");
      return;
    }
    if (!brandState?.voice?.isGenerated) {
      setErrorMessage("Cannot run Visual Direction: Voice guidelines must be generated in Stage 05 (Voice) first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Reading Strategy, Personality, Selected Name & Voice...");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes("Reading")) return "Calibrating visual personality & aesthetic mood...";
        if (prev.includes("personality")) return "Architecting primary, secondary & neutral color system...";
        if (prev.includes("color")) return "Pairing typography scales & verifying WCAG accessibility...";
        if (prev.includes("typography")) return "Formulating photography, illustration & logo directions...";
        if (prev.includes("photography")) return "Establishing layout cadence & spatial principles...";
        return "Finalizing production Visual Brand System...";
      });
    }, 1200);

    try {
      const res = await fetch("/api/visual", {
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
        throw new Error(data.error || "Visual Direction agent execution failed.");
      }

      setBrandState(data.brandState);
      if (data.agentRun) {
        setActiveRun(data.agentRun);
        setAllRuns((prev) => [data.agentRun, ...prev.filter((r) => r.id !== data.agentRun.id)]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Visual Direction execution failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHex = (hex: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    }
  };

  // 8. Run Critic / Challenge Stage (Consuming complete BrandState across all 6 layers)
  const handleRunCritic = async () => {
    if (!brandState?.discovery?.isAnalyzed) {
      setErrorMessage("Cannot run Critic: Discovery stage has not been completed yet.");
      return;
    }
    if (!brandState?.positioning?.isPositioned) {
      setErrorMessage("Cannot run Critic: Positioning stage has not been completed yet.");
      return;
    }
    if (!brandState?.personality?.isFormulated) {
      setErrorMessage("Cannot run Critic: Personality stage has not been completed yet.");
      return;
    }
    if (!brandState?.naming?.isSelected || !brandState?.naming?.selectedName) {
      setErrorMessage("Cannot run Critic: You must select a candidate brand name in Stage 04 (Naming) first.");
      return;
    }
    if (!brandState?.voice?.isGenerated) {
      setErrorMessage("Cannot run Critic: Voice guidelines must be generated in Stage 05 (Voice) first.");
      return;
    }
    if (!brandState?.visualDirection?.isGenerated) {
      setErrorMessage("Cannot run Critic: Visual Direction must be generated in Stage 06 (Visual) first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Reading complete BrandState across all 6 upstream layers...");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes("Reading")) return "Auditing positioning & differentiation claims...";
        if (prev.includes("positioning")) return "Evaluating name alignment & personality resonance...";
        if (prev.includes("Evaluating")) return "Cross-examining voice guidelines against visual direction...";
        if (prev.includes("Cross-examining")) return "Detecting clichés, generic tropes & unsupported claims...";
        if (prev.includes("Detecting")) return "Synthesizing systemic strengths & diagnostic critique...";
        return "Finalizing Brand Challenge critique...";
      });
    }, 1200);

    try {
      const res = await fetch("/api/critic", {
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
        throw new Error(data.error || "Critic agent execution failed.");
      }

      setBrandState(data.brandState);
      if (data.agentRun) {
        setActiveRun(data.agentRun);
        setAllRuns((prev) => [data.agentRun, ...prev.filter((r) => r.id !== data.agentRun.id)]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Critic execution failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Run Consistency Stage (Evaluating cross-stage coherence across all 7 dimensions)
  const handleRunConsistency = async () => {
    if (!brandState?.discovery?.isAnalyzed) {
      setErrorMessage("Cannot run Consistency: Discovery stage has not been completed yet.");
      return;
    }
    if (!brandState?.positioning?.isPositioned) {
      setErrorMessage("Cannot run Consistency: Positioning stage has not been completed yet.");
      return;
    }
    if (!brandState?.personality?.isFormulated) {
      setErrorMessage("Cannot run Consistency: Personality stage has not been completed yet.");
      return;
    }
    if (!brandState?.naming?.isSelected || !brandState?.naming?.selectedName) {
      setErrorMessage("Cannot run Consistency: You must select a candidate brand name in Stage 04 (Naming) first.");
      return;
    }
    if (!brandState?.voice?.isGenerated) {
      setErrorMessage("Cannot run Consistency: Voice guidelines must be generated in Stage 05 (Voice) first.");
      return;
    }
    if (!brandState?.visualDirection?.isGenerated) {
      setErrorMessage("Cannot run Consistency: Visual Direction must be generated in Stage 06 (Visual) first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Reading complete brand system & diagnostic critique context...");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes("Reading")) return "Cross-checking Strategic & Audience consistency...";
        if (prev.includes("Strategic")) return "Cross-examining Personality, Naming & Voice alignment...";
        if (prev.includes("Personality")) return "Auditing Visual Direction against core messaging pillars...";
        if (prev.includes("Auditing")) return "Detecting cross-system friction & ripple effects...";
        if (prev.includes("Detecting")) return "Synthesizing systemic strengths & consistency recommendations...";
        return "Finalizing Brand Coherence Audit...";
      });
    }, 1200);

    try {
      const res = await fetch("/api/consistency", {
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
        throw new Error(data.error || "Consistency agent execution failed.");
      }

      setBrandState(data.brandState);
      if (data.agentRun) {
        setActiveRun(data.agentRun);
        setAllRuns((prev) => [data.agentRun, ...prev.filter((r) => r.id !== data.agentRun.id)]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Consistency execution failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 10. Run Delivery Stage (Operationalizing complete validated brand system)
  const handleRunDelivery = async () => {
    if (!brandState?.discovery?.isAnalyzed) {
      setErrorMessage("Cannot run Delivery: Discovery stage has not been completed yet.");
      return;
    }
    if (!brandState?.positioning?.isPositioned) {
      setErrorMessage("Cannot run Delivery: Positioning stage has not been completed yet.");
      return;
    }
    if (!brandState?.personality?.isFormulated) {
      setErrorMessage("Cannot run Delivery: Personality stage has not been completed yet.");
      return;
    }
    if (!brandState?.naming?.isSelected || !brandState?.naming?.selectedName) {
      setErrorMessage("Cannot run Delivery: You must select a candidate brand name in Stage 04 (Naming) first.");
      return;
    }
    if (!brandState?.voice?.isGenerated) {
      setErrorMessage("Cannot run Delivery: Voice guidelines must be generated in Stage 05 (Voice) first.");
      return;
    }
    if (!brandState?.visualDirection?.isGenerated) {
      setErrorMessage("Cannot run Delivery: Visual Direction must be generated in Stage 06 first.");
      return;
    }
    if (!brandState?.consistency?.isEvaluated) {
      setErrorMessage("Cannot run Delivery: Consistency stage must be evaluated in Stage 08 first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Reading validated Brand System & Coherence context...");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes("Reading")) return "Synthesizing Executive Brand Overview...";
        if (prev.includes("Overview")) return "Structuring Core Messaging Pillars & Value Proposition...";
        if (prev.includes("Messaging")) return "Compiling Voice Guidelines, Rules & Vocabulary...";
        if (prev.includes("Voice")) return "Drafting Visual System Specifications & Tokens...";
        if (prev.includes("Visual")) return "Architecting Multi-Channel Usage Guidance...";
        if (prev.includes("Usage")) return "Generating Production Deliverables & Asset Specs...";
        return "Finalizing Brand Delivery Kit...";
      });
    }, 1200);

    try {
      const res = await fetch("/api/delivery", {
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
        throw new Error(data.error || "Delivery agent execution failed.");
      }

      setBrandState(data.brandState);
      if (data.agentRun) {
        setActiveRun(data.agentRun);
        setAllRuns((prev) => [data.agentRun, ...prev.filter((r) => r.id !== data.agentRun.id)]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Delivery execution failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 11. Run Final Brand Kit Stage (Authoritative Assembly of complete validated brand system)
  const handleGenerateFinalBrandKit = async () => {
    if (!brandState) {
      setErrorMessage("No brand state found. Please initialize a brand project first.");
      return;
    }
    const check = canRunFinalBrandKit(brandState);
    if (!check.allowed) {
      setErrorMessage(check.reason || "Prerequisites not met for Final Brand Kit.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep("Validating complete brand system prerequisites...");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes("Validating")) return "Verifying authoritative name and immutable strategy...";
        if (prev.includes("authoritative")) return "Assembling Brand Overview & Core Messaging Pillars...";
        if (prev.includes("Overview")) return "Integrating Voice Guidelines & Visual Design System...";
        if (prev.includes("Voice")) return "Collating Consistency Diagnostic Summary & Warnings...";
        if (prev.includes("Consistency")) return "Assembling Production Deliverables & Assets...";
        return "Finalizing Presentation-Ready Final Brand Kit...";
      });
    }, 700);

    try {
      const res = await fetch("/api/brand-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: brandState.projectId,
          brandState,
        }),
      });

      clearInterval(stepInterval);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Final Brand Kit assembly failed.");
      }

      setBrandState(data.brandState);
      if (data.agentRun) {
        setActiveRun(data.agentRun);
        setAllRuns((prev) => [data.agentRun, ...prev.filter((r) => r.id !== data.agentRun.id)]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Final Brand Kit assembly failed.";
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

  const personalityData: PersonalityOutput | null = brandState?.personality?.isFormulated
    ? {
      archetype: brandState.personality.archetype,
      archetypeRationale: brandState.personality.archetypeRationale,
      traits: brandState.personality.traits,
      behavioralCharacteristics: brandState.personality.behavioralCharacteristics,
      principles: brandState.personality.principles,
      emotionalTerritory: brandState.personality.emotionalTerritory,
      personalityDo: brandState.personality.personalityDo,
      personalityDont: brandState.personality.personalityDont,
      confidence: brandState.personality.confidence,
    }
    : null;

  const namingData: Naming | null = brandState?.naming?.isGenerated
    ? brandState.naming
    : null;

  const voiceData: Voice | null = brandState?.voice?.isGenerated
    ? brandState.voice
    : null;

  return (
    <div className="workspace-lotus-theme min-h-screen bg-transparent text-[#FAF6F0] flex flex-col font-sans relative z-10 w-full">
      {/* Top Editorial Bar */}
      <header className="border-b border-white/10 bg-[#0A1014]/65 backdrop-blur-md sticky top-0 z-30 text-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBackToWater ? (
              <button
                type="button"
                onClick={onBackToWater}
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1.5 text-xs"
                title="Return to water"
              >
                <ArrowLeft className="w-4 h-4 text-[#E87A90]" />
                <span className="hidden sm:inline">Water</span>
              </button>
            ) : (
              <Link
                href="/"
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                title="Return to Landing"
              >
                <ArrowLeft className="w-4 h-4 text-[#E87A90]" />
              </Link>
            )}
            <div className="h-4 w-px bg-white/15" />
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="PinkLoom"
                width={16}
                height={16}
                className="w-4 h-4 rounded-full object-cover ring-1 ring-white/20"
              />
              <span className="font-semibold text-xs tracking-widest uppercase text-[#FAF7F2]">PINKLOOM</span>
              <span className="text-white/40 text-xs">/</span>
              <span className="text-xs text-[#FFD54F] font-medium">
                {selectedStage === "DISCOVER"
                  ? "Stage 01: Discovery"
                  : selectedStage === "POSITION"
                    ? "Stage 02: Positioning"
                    : selectedStage === "SHAPE"
                      ? shapeSubStage === "voice"
                        ? "Stage 05: Voice"
                        : shapeSubStage === "naming"
                          ? "Stage 04: Naming"
                          : "Stage 03: Personality"
                      : selectedStage === "VISUALIZE"
                        ? "Stage 06: Visual Direction"
                        : selectedStage === "CHALLENGE"
                          ? "Stage 07: Critic / Challenge"
                          : selectedStage === "CONSISTENCY"
                            ? "Stage 08: Consistency"
                            : selectedStage === "DELIVER" || selectedStage === "DELIVERY"
                              ? "Stage 09: Delivery"
                              : selectedStage === "BRAND_KIT" || selectedStage === "FINAL_BRAND_KIT"
                                ? "Stage 10: Final Brand Kit"
                                : "Brand Pipeline"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {brandState && (
              <button
                type="button"
                onClick={handleResetBrand}
                title="Clear workspace state and start a new brand"
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-950/40 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Start Over</span>
              </button>
            )}
            <Link
              href="/history"
              id="workspace-history-btn"
              title="View your brand history"
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/15 text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-[#E87A90]" />
              <span className="hidden sm:inline">History</span>
            </Link>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-300 font-mono border border-emerald-700/50">
              Phase 8 Live Engine
            </span>
            <AuthHeaderControl user={currentUser} returnTo="/" />
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Mobile Stage Quick Navigator */}
        <div className="lg:hidden col-span-1 w-full overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
          {UNIFIED_WORKFLOW_STAGES.map((item) => {
            const isSelected = isUnifiedStageSelected(item);
            const status = getUnifiedStageStatus(item);
            return (
              <button
                key={`mobile-${item.id}`}
                type="button"
                onClick={() => handleSelectUnifiedStage(item)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected
                  ? "bg-[#182329] border-[#FFD54F] text-[#FFD54F] shadow-sm"
                  : "bg-[#0A1214]/80 border-white/12 text-white/80 hover:text-white"
                  }`}
              >
                <span className="font-mono text-[10px] opacity-75">{item.order}</span>
                <span>{item.label}</span>
                {status === "completed" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Left Column: Staged AI Workflow Progression */}
        <section className="lg:col-span-4 space-y-4">
          <div className="bg-[#050C0F]/75 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col shadow-2xl">
            {/* Header (Fixed) */}
            <div className="pb-3.5 border-b border-white/12">
              <h2 className="text-[11px] font-semibold tracking-widest uppercase text-[#FFD54F]">
                STAGED AI PIPELINE
              </h2>
              <p className="font-editorial text-2xl text-[#FFFFFF] mt-1 font-semibold tracking-tight">
                Workflow Stages
              </p>
              <p className="text-xs text-[#CFD8DC] mt-1 leading-relaxed">
                Real agent execution with persistent state context.
              </p>
            </div>

            {/* Scrollable Stage List (All 10 stages uniform) */}
            <div className="space-y-2 mt-3.5 overflow-y-auto max-h-[calc(100vh-210px)] pr-1 custom-stage-scrollbar">
              {UNIFIED_WORKFLOW_STAGES.map((item) => (
                <WorkflowStageCard
                  key={item.id}
                  item={item}
                  isSelected={isUnifiedStageSelected(item)}
                  status={getUnifiedStageStatus(item)}
                  onSelect={() => handleSelectUnifiedStage(item)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Active Stage Content */}
        <section className="lg:col-span-8 space-y-6">
          {/* ============================================================== */}
          {/* STAGE 01: DISCOVERY                                            */}
          {/* ============================================================== */}
          {selectedStage === "DISCOVER" && (
            <div className="bg-[#080F11]/85 backdrop-blur-xl border border-white/16 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#E87A90]/15 text-[#E87A90] border border-[#E87A90]/30 flex items-center justify-center">
                    <ActiveIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#FFD54F]">STAGE 01</span>
                      <span className="text-white/30">·</span>
                      <span className="text-xs font-medium text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        {brandState?.discovery?.isAnalyzed ? "Analyzed" : "Ready for Input"}
                      </span>
                    </div>
                    <h3 className="font-editorial text-2xl sm:text-3xl text-[#FFF9F2] mt-0.5 font-semibold">
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
                    className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <p className="font-semibold text-rose-300">Discovery Execution Issue</p>
                    <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                    <p className="mt-2 text-[11px] text-rose-400">
                      Tip: Ensure server environment variables (GROQ_API_KEY / GEMINI_API_KEY) are configured for agent intelligence.
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
                      className="block text-xs font-semibold uppercase tracking-wider text-[#CFD8DC] mb-2"
                    >
                      Raw Startup, Product, or Community Idea
                    </label>
                    <textarea
                      id="raw-idea-input"
                      rows={5}
                      value={rawIdea}
                      onChange={(e) => setRawIdea(e.target.value)}
                      placeholder="Describe what you want to build in your own words. Don't worry about sounding polished or picking brand names yet. Focus on who you are helping and what pain you want to solve..."
                      className="w-full p-4 rounded-xl border border-white/20 text-sm text-[#FFFFFF] bg-[#050C0E]/80 placeholder:text-white/65 focus:bg-[#071114]/90 focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/40 focus:border-[#FFD54F]/70 transition-all resize-y shadow-inner"
                    />
                  </div>

                  {/* Inspiration Idea Chips */}
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#CFD8DC] block mb-2">
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
                          className="text-xs px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-[#FFFFFF] hover:text-[#FFFFFF] transition-all border border-white/20 hover:border-[#FFD54F]/60 text-left shadow-sm active:scale-[0.98]"
                        >
                          <span className="font-medium text-[#FFF9F2]">✦ {sample.title}</span>
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
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#15171A] hover:bg-[#22252A] text-[#FFFFFF] border border-white/20 hover:border-[#E87A90]/60 text-sm font-medium disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md active:scale-[0.99] group"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FBF9F6] border-t-transparent rounded-full animate-spin" />
                          <span>{loadingStep}</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze my idea</span>
                          <ArrowRight className="w-4 h-4 text-[#E87A90] group-hover:translate-x-0.5 transition-transform" />
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
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#EF4444]">
                      <HelpCircle className="w-4 h-4 text-[#EF4444]" />
                      <span>Clarifying Questions to Refine Focus</span>
                    </div>
                    <div className="space-y-2">
                      {discoveryData.clarifyingQuestions.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-white bg-black p-2.5 rounded-lg border border-white/20">
                          <span className="font-mono text-[#EF4444] font-semibold">{i + 1}.</span>
                          <span className="font-medium text-white">{q}</span>
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
                        onClick={() => setSelectedStage("SHAPE")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-all shadow-sm"
                      >
                        <span>Approve & Continue to Stage 03 (Personality)</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#E87A90]" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 03: PERSONALITY AGENT WORKSPACE                          */}
          {/* ============================================================== */}
          {selectedStage === "SHAPE" && (
            <div className="space-y-6">
              {/* ------------------------------------------------------------ */}
              {/* SUB-STAGE A: BRAND PERSONALITY                               */}
              {/* ------------------------------------------------------------ */}
              {shapeSubStage === "personality" && (
                <div className="space-y-6">
                  {/* Stage Header */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#CFD8DC] font-mono">
                              Stage 03 / 10
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 font-mono border border-emerald-500/30">
                              Live Agent
                            </span>
                          </div>
                          <h3 className="font-editorial text-2xl text-[#FFF9F2] font-semibold">
                            Brand Personality
                          </h3>
                        </div>
                      </div>

                      {/* Information Flow Indicator */}
                      <div className="flex items-center gap-2 text-xs bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-1.5 rounded-xl">
                        <LinkIcon className="w-3.5 h-3.5 text-[#E87A90]" />
                        <span className="text-[#686764]">Context Flow:</span>
                        <span className="font-semibold text-[#141416]">Built from Positioning</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#686764] mt-3 leading-relaxed">
                      Translates validated strategic positioning into an authentic brand archetype, behavioral traits, operational principles, and visceral emotional resonance.
                    </p>
                  </div>

                  {/* State 1: Prerequisite Missing (Discovery or Positioning not done) */}
                  {(!brandState?.discovery?.isAnalyzed || !brandState?.positioning?.isPositioned) && (
                    <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 text-center space-y-4 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h4 className="font-editorial text-xl text-[#141416]">
                        Prerequisites Required
                      </h4>
                      <p className="text-xs text-[#686764] max-w-md mx-auto">
                        The Personality Agent cannot execute until Stage 01 (Discovery) and Stage 02 (Positioning) are completed. Brand personality must spring from strategic bedrock.
                      </p>
                      <div className="pt-2 flex justify-center gap-3">
                        {!brandState?.discovery?.isAnalyzed && (
                          <button
                            type="button"
                            onClick={() => setSelectedStage("DISCOVER")}
                            className="px-4 py-2 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-colors"
                          >
                            Go to Stage 01: Discover
                          </button>
                        )}
                        {brandState?.discovery?.isAnalyzed && !brandState?.positioning?.isPositioned && (
                          <button
                            type="button"
                            onClick={() => setSelectedStage("POSITION")}
                            className="px-4 py-2 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-colors"
                          >
                            Go to Stage 02: Position
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* State 2: Ready to Run (Positioning completed, Personality not formulated yet) */}
                  {brandState?.positioning?.isPositioned && !personalityData && (
                    <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 shadow-sm space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-editorial text-2xl text-[#141416]">
                          Ready to Formulate Personality
                        </h4>
                        <p className="text-xs text-[#686764] leading-relaxed">
                          The Personality Agent will consume the validated outputs from Stage 01 and Stage 02 to define your archetype, traits, and behavioral guardrails.
                        </p>
                      </div>

                      {/* Context Ingestion Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96948F] flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#3B82F6]" />
                            Consuming Discovery Truth
                          </span>
                          <p className="text-xs font-medium text-[#141416] line-clamp-2">
                            {brandState.discovery.problem}
                          </p>
                          <span className="text-[11px] text-[#686764] block">
                            Targeting: {brandState.discovery.targetAudience.primary}
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96948F] flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-[#2E7D32]" />
                            Consuming Positioning Wedge
                          </span>
                          <p className="text-xs font-medium text-[#141416] line-clamp-1">
                            Category: {brandState.positioning.category}
                          </p>
                          <span className="text-[11px] text-[#686764] block line-clamp-2">
                            Differentiator: {brandState.positioning.differentiator}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          id="run-personality-btn"
                          onClick={handleRunPersonality}
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-all shadow-sm disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <PlayCircle className="w-4 h-4 animate-spin text-[#E87A90]" />
                              <span>{loadingStep}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-[#E87A90]" />
                              <span>Formulate Brand Personality</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* State 3: Personality Formulated — Rich Results Dashboard */}
                  {personalityData && (
                    <div className="space-y-6">
                      {/* Archetype & Rationale Hero Card */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-semibold tracking-wider uppercase text-[#96948F]">
                              Primary Psychological Archetype
                            </span>
                            <h4 className="font-editorial text-3xl sm:text-4xl text-[#141416] mt-1">
                              {personalityData.archetype}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] font-medium shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{personalityData.confidence}% Alignment Confidence</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC]">
                          <span className="text-xs font-semibold text-[#141416] block mb-1">
                            Archetype Rationale & Strategic Fit
                          </span>
                          <p className="text-xs text-[#52514D] leading-relaxed">
                            {personalityData.archetypeRationale}
                          </p>
                        </div>
                      </div>

                      {/* Core Traits & Behavioral Characteristics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personality Traits */}
                        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                            <Sparkles className="w-4 h-4 text-[#B78103]" />
                            <span>Core Personality Traits</span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {personalityData.traits.map((trait, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8E5DF] text-xs font-medium text-[#141416]"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Behavioral Characteristics */}
                        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                            <Users className="w-4 h-4 text-[#3B82F6]" />
                            <span>Behavioral Characteristics</span>
                          </div>
                          <ul className="text-xs text-[#52514D] space-y-2 pt-1">
                            {personalityData.behavioralCharacteristics.map((char, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[#3B82F6] font-mono">•</span>
                                <span>{char}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Foundational Principles */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                          <BookmarkCheck className="w-4 h-4 text-[#2E7D32]" />
                          <span>Foundational Behavioral Principles</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {personalityData.principles.map((principle, i) => (
                            <div key={i} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1.5">
                              <span className="text-xs font-semibold text-[#141416] block">
                                {principle.title}
                              </span>
                              <p className="text-xs text-[#52514D] leading-relaxed">
                                {principle.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Emotional Territory */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#141416]">
                          <Heart className="w-4 h-4 text-[#E87A90]" />
                          <span>Emotional Territory</span>
                        </div>
                        <div className="p-5 rounded-xl bg-black border border-white/20">
                          <p className="font-editorial text-lg text-white italic leading-relaxed">
                            &ldquo;{personalityData.emotionalTerritory}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Do's & Don'ts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Do's */}
                        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#2E7D32]">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Personality Do&apos;s</span>
                          </div>
                          <ul className="text-xs text-[#52514D] space-y-2 pt-1">
                            {personalityData.personalityDo.map((d, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Don'ts */}
                        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#C62828]">
                            <AlertCircle className="w-4 h-4" />
                            <span>Personality Don&apos;ts</span>
                          </div>
                          <ul className="text-xs text-[#52514D] space-y-2 pt-1">
                            {personalityData.personalityDont.map((dont, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <X className="w-3.5 h-3.5 text-[#C62828] shrink-0 mt-0.5" />
                                <span>{dont}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Transition & Approval Action */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-[#686764]">
                          <span className="font-semibold text-[#141416]">Stage 03 Completed.</span> Brand personality committed to BrandState.
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            id="approve-personality-btn"
                            onClick={() => setShowPersonalityApprovedModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E5DF] bg-[#FAF8F5] text-[#141416] text-xs font-medium hover:bg-[#F0EDE6] transition-all shadow-xs"
                          >
                            <Check className="w-4 h-4 text-[#81C784]" />
                            <span>Personality Summary</span>
                          </button>
                          <button
                            type="button"
                            id="proceed-to-naming-btn"
                            onClick={() => setShapeSubStage("naming")}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-all shadow-sm"
                          >
                            <span>Proceed to Stage 04: Naming</span>
                            <ArrowRight className="w-4 h-4 text-[#E87A90]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* SUB-STAGE B: NAMING TERRITORIES (PHASE 4B)                    */}
              {/* ------------------------------------------------------------ */}
              {shapeSubStage === "naming" && (
                <div className="space-y-6">
                  {/* Stage Header */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E87A90] flex items-center justify-center">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#CFD8DC] font-mono">
                              Stage 04 / 10
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 font-mono border border-emerald-500/30">
                              Live Agent
                            </span>
                          </div>
                          <h3 className="font-editorial text-2xl text-[#FFF9F2] font-semibold">
                            Naming Territories & Candidate Strategy
                          </h3>
                        </div>
                      </div>

                      {/* Information Flow Indicator */}
                      <div className="flex items-center gap-2 text-xs bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-1.5 rounded-xl">
                        <LinkIcon className="w-3.5 h-3.5 text-[#E87A90]" />
                        <span className="text-[#686764]">Context Flow:</span>
                        <span className="font-semibold text-[#141416]">Built from Discovery + Position + Personality</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#686764] mt-3 leading-relaxed">
                      Explores 3 to 4 strategically distinct naming territories. Candidate names feature linguistic construction, phonetic mouthfeel, digital domain suitability, and taglines. Human selection is mandatory.
                    </p>
                  </div>

                  {/* State 1: Prerequisite Missing */}
                  {(!brandState?.discovery?.isAnalyzed || !brandState?.positioning?.isPositioned || !brandState?.personality?.isFormulated) && (
                    <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 text-center space-y-4 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h4 className="font-editorial text-xl text-[#141416]">
                        Prerequisites Required
                      </h4>
                      <p className="text-xs text-[#686764] max-w-md mx-auto">
                        The Naming Agent cannot execute until Stage 01 (Discovery), Stage 02 (Positioning), and Stage 03 (Personality) are completed. Naming must anchor directly into strategic bedrock.
                      </p>
                      <div className="pt-2 flex justify-center gap-3">
                        {!brandState?.discovery?.isAnalyzed && (
                          <button
                            type="button"
                            onClick={() => setSelectedStage("DISCOVER")}
                            className="px-4 py-2 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-colors"
                          >
                            Go to Stage 01: Discover
                          </button>
                        )}
                        {brandState?.discovery?.isAnalyzed && !brandState?.positioning?.isPositioned && (
                          <button
                            type="button"
                            onClick={() => setSelectedStage("POSITION")}
                            className="px-4 py-2 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-colors"
                          >
                            Go to Stage 02: Position
                          </button>
                        )}
                        {brandState?.positioning?.isPositioned && !brandState?.personality?.isFormulated && (
                          <button
                            type="button"
                            onClick={() => setShapeSubStage("personality")}
                            className="px-4 py-2 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-colors"
                          >
                            Go to Stage 03: Personality
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* State 2: Ready to Run Naming Generation */}
                  {brandState?.personality?.isFormulated && !namingData && (
                    <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 shadow-sm space-y-6">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold tracking-wider uppercase text-[#E87A90]">
                          Tri-Layer Strategy Foundation Ready
                        </span>
                        <h4 className="font-editorial text-2xl text-[#141416]">
                          Generate Strategic Naming Territories
                        </h4>
                        <p className="text-xs text-[#686764] leading-relaxed max-w-xl">
                          The Naming Agent will translate the audience pain points, category differentiator, and personality archetype into 3 to 4 distinct naming territories with candidate names and linguistic assessments.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                          <span className="font-semibold text-[#141416] block">1. Discovery Bedrock:</span>
                          <span className="text-[#686764]">Audience: </span>
                          <span className="text-[#141416] font-medium">{brandState.discovery.targetAudience.primary}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                          <span className="font-semibold text-[#141416] block">2. Positioning Core:</span>
                          <span className="text-[#686764]">Category: </span>
                          <span className="text-[#141416] font-medium">{brandState.positioning.category}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                          <span className="font-semibold text-[#141416] block">3. Personality DNA:</span>
                          <span className="text-[#686764]">Archetype: </span>
                          <span className="text-[#141416] font-medium">{brandState.personality.archetype}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          id="run-naming-btn"
                          disabled={isLoading}
                          onClick={() => handleRunNaming()}
                          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-all shadow-sm disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4 text-[#FFF8E1]" />
                          <span>{isLoading ? "Generating Territories..." : "Generate Naming Territories"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* State 3: Generated Naming Territories & Selection Interface */}
                  {namingData && (
                    <div className="space-y-6">
                      {/* Selection Status Banner / Hero */}
                      {namingData.isSelected && namingData.selectedName ? (
                        <div className="bg-[#FFFFFF] border-2 border-[#141416] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E8E5DF] pb-4">
                            <div>
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2E7D32] flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Selected Brand Identity (Human Confirmed)
                              </span>
                              <h2 className="font-editorial text-4xl text-[#141416] mt-1 font-bold tracking-tight">
                                {namingData.selectedName}
                              </h2>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-xs text-[#96948F]">Selected on</span>
                              <p className="text-xs font-mono text-[#686764]">
                                {namingData.selectedAt ? new Date(namingData.selectedAt).toLocaleDateString() : "Active"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                            <div>
                              <span className="text-[#96948F] uppercase tracking-wider text-[10px] font-semibold block">
                                Naming Territory
                              </span>
                              <p className="font-medium text-[#141416] mt-0.5">
                                {namingData.directions.find((d) => d.id === namingData.selectedDirectionId)?.name || "Strategic Territory"}
                              </p>
                            </div>
                            {namingData.selectedTagline && (
                              <div>
                                <span className="text-[#96948F] uppercase tracking-wider text-[10px] font-semibold block">
                                  Associated Tagline
                                </span>
                                <p className="font-editorial italic text-sm text-[#141416] mt-0.5">
                                  &ldquo;{namingData.selectedTagline}&rdquo;
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#E8E5DF] text-xs text-[#686764]">
                            <span className="text-[11px]">
                              You can change your selection at any time by clicking &ldquo;Select this name&rdquo; on another candidate below.
                            </span>
                            <span className="text-[11px] font-medium text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                              Downstream Voice Stage Unlocked
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#B78103] uppercase tracking-wider">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Human Selection Required</span>
                            </div>
                            <p className="text-xs text-[#5D4037]">
                              Review the {namingData.directions.length} generated naming territories below. Click <strong>&ldquo;Select this name&rdquo;</strong> on your chosen candidate to establish the brand&apos;s identity and unlock the downstream Voice stage.
                            </p>
                          </div>
                          <div className="text-xs px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#FFE082] text-[#8D6E63] shrink-0 font-medium flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-[#B78103]" />
                            <span>Voice locked until selection</span>
                          </div>
                        </div>
                      )}

                      {/* Naming Territories List */}
                      <div className="space-y-6">
                        {namingData.directions.map((direction, dirIdx) => {
                          const isDirectionSelected = namingData.selectedDirectionId === direction.id;

                          return (
                            <div
                              key={direction.id || dirIdx}
                              className={`bg-[#FFFFFF] rounded-2xl border transition-all shadow-xs p-6 sm:p-7 space-y-6 ${isDirectionSelected ? "border-[#141416] ring-1 ring-[#141416]/10" : "border-[#E8E5DF]"
                                }`}
                            >
                              {/* Territory Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E5DF] pb-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E5DF] text-[#78756F]">
                                      Territory 0{dirIdx + 1}
                                    </span>
                                    <span className="text-xs font-semibold text-[#E87A90] uppercase tracking-wider">
                                      {direction.strategy}
                                    </span>
                                  </div>
                                  <h4 className="font-editorial text-2xl text-[#141416]">
                                    {direction.name}
                                  </h4>
                                </div>
                                {isDirectionSelected && (
                                  <span className="text-xs px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-semibold flex items-center gap-1.5 self-start sm:self-center">
                                    <Check className="w-3.5 h-3.5" />
                                    Active Selection
                                  </span>
                                )}
                              </div>

                              {/* Strategic Rationale & Naming Logic */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1.5">
                                  <span className="font-semibold text-[#141416] block uppercase tracking-wider text-[11px]">
                                    Why This Fits the Strategy
                                  </span>
                                  <p className="text-[#52514D] leading-relaxed">
                                    {direction.rationale}
                                  </p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1.5">
                                  <span className="font-semibold text-[#141416] block uppercase tracking-wider text-[11px]">
                                    Linguistic & Conceptual Mechanics
                                  </span>
                                  <p className="text-[#52514D] leading-relaxed">
                                    {direction.namingLogic}
                                  </p>
                                </div>
                              </div>

                              {/* Candidate Names Grid */}
                              <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold uppercase tracking-wider text-[#141416]">
                                    Candidate Names ({direction.candidates.length})
                                  </span>
                                  <span className="text-[11px] text-[#96948F]">
                                    Click to select as official brand name
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {direction.candidates.map((candidate, candIdx) => {
                                    const isSelectedCandidate =
                                      namingData.selectedName === candidate.name;

                                    return (
                                      <div
                                        key={candIdx}
                                        className={`rounded-xl border p-5 transition-all space-y-3 flex flex-col justify-between ${isSelectedCandidate
                                          ? "bg-[#FAF8F5] border-[#141416] ring-2 ring-[#141416]/10"
                                          : "bg-[#FFFFFF] border-[#E8E5DF] hover:border-[#C8C5BE]"
                                          }`}
                                      >
                                        <div className="space-y-3">
                                          {/* Name Header & Selection Button */}
                                          <div className="flex items-center justify-between gap-3">
                                            <h5 className="font-editorial text-2xl font-bold text-[#141416] tracking-tight">
                                              {candidate.name}
                                            </h5>
                                            {isSelectedCandidate ? (
                                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Selected
                                              </span>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleSelectName(
                                                    direction.id,
                                                    candidate.name,
                                                    direction.taglineCandidates[0]
                                                  )
                                                }
                                                className="px-3 py-1 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] hover:bg-[#141416] hover:text-[#FBF9F6] text-xs font-medium text-[#141416] transition-all shadow-2xs"
                                              >
                                                Select this name
                                              </button>
                                            )}
                                          </div>

                                          <p className="text-xs text-[#383734] leading-relaxed">
                                            {candidate.rationale}
                                          </p>

                                          {/* Linguistic Construction */}
                                          <div className="space-y-1 text-xs pt-1 border-t border-[#EAE7E0]">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#96948F]">
                                              Linguistic Construction
                                            </span>
                                            <p className="text-[#52514D] leading-relaxed">
                                              {candidate.linguisticRationale}
                                            </p>
                                          </div>

                                          {/* Phonetics & Mouthfeel */}
                                          <div className="space-y-1 text-xs">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#96948F]">
                                              Phonetics & Mouthfeel
                                            </span>
                                            <p className="text-[#52514D] leading-relaxed">
                                              {candidate.phoneticAssessment}
                                            </p>
                                          </div>

                                          {/* Domain Suitability */}
                                          <div className="space-y-1 text-xs">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#96948F] flex items-center gap-1">
                                              <Globe className="w-3 h-3 text-[#3B82F6]" />
                                              Domain Usability & Memorability
                                            </span>
                                            <p className="text-[#52514D] leading-relaxed">
                                              {candidate.domainSuitability}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="pt-2 text-[10px] text-[#96948F] italic">
                                          *Linguistic usability assessment; does not imply legal trademark registration clearance.
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Tagline Candidates for this Territory */}
                              <div className="pt-2 border-t border-[#E8E5DF] space-y-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96948F] block">
                                  Tagline Candidates for this Territory
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {direction.taglineCandidates.map((tagline, tagIdx) => {
                                    const isTaglineSelected =
                                      isDirectionSelected && namingData.selectedTagline === tagline;

                                    return (
                                      <button
                                        key={tagIdx}
                                        type="button"
                                        onClick={() => {
                                          if (isDirectionSelected && namingData.selectedName) {
                                            handleSelectName(
                                              direction.id,
                                              namingData.selectedName,
                                              tagline
                                            );
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-editorial italic transition-all ${isTaglineSelected
                                          ? "bg-[#141416] text-[#FBF9F6] shadow-xs"
                                          : "bg-[#FAF8F5] border border-[#E8E5DF] text-[#141416] hover:bg-[#F0EDE6]"
                                          }`}
                                      >
                                        &ldquo;{tagline}&rdquo;
                                        {isTaglineSelected && " ✓"}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Transition & Confirmation Action */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-[#686764]">
                          {namingData.isSelected && namingData.selectedName ? (
                            <span>
                              <strong className="text-[#141416]">Stage 04 Completed.</strong> Selected name &ldquo;{namingData.selectedName}&rdquo; established in BrandState.
                            </span>
                          ) : (
                            <span>
                              <strong className="text-[#B78103]">Action Required:</strong> Please select a candidate name above to complete Stage 04.
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            id="view-naming-summary-btn"
                            onClick={() => setShowNamingApprovedModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E5DF] bg-[#FAF8F5] text-[#141416] text-xs font-medium hover:bg-[#F0EDE6] transition-all shadow-xs"
                          >
                            <Check className="w-4 h-4 text-[#81C784]" />
                            <span>Naming Summary</span>
                          </button>
                          <button
                            type="button"
                            id="proceed-to-voice-btn"
                            onClick={() => setShapeSubStage("voice")}
                            disabled={!namingData.isSelected}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all shadow-sm ${namingData.isSelected
                              ? "bg-[#141416] text-[#FBF9F6] hover:bg-[#27262A]"
                              : "bg-[#EAE7E0] text-[#96948F] cursor-not-allowed"
                              }`}
                          >
                            <span>Proceed to Stage 05: Voice</span>
                            <ArrowRight className="w-4 h-4 text-[#E87A90]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* SUB-STAGE C: VOICE SYSTEM & EDITORIAL (PHASE 4C)              */}
              {/* ------------------------------------------------------------ */}
              {shapeSubStage === "voice" && (
                <div className="space-y-6">
                  {/* Stage Header */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E87A90] flex items-center justify-center">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#CFD8DC] font-mono">
                              Stage 05 / 10
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 font-mono border border-emerald-500/30">
                              Live Agent
                            </span>
                          </div>
                          <h3 className="font-editorial text-2xl text-[#FFF9F2] font-semibold">
                            Brand Voice & Operational Editorial System
                          </h3>
                        </div>
                      </div>

                      {/* Information Flow Indicator */}
                      <div className="flex items-center gap-2 text-xs bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-1.5 rounded-xl">
                        <LinkIcon className="w-3.5 h-3.5 text-[#E87A90]" />
                        <span className="text-[#686764]">Context Flow:</span>
                        <span className="font-semibold text-[#141416]">
                          Built from Personality + Positioning + Selected Name
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#686764] mt-3 leading-relaxed">
                      Translates established strategy into an operational communication system: calibrated tone dimensions, vocabulary constraints, messaging pillars, actionable writing rules, and production copy examples for{" "}
                      <strong className="text-[#141416]">&ldquo;{brandState?.naming?.selectedName || "Selected Brand"}&rdquo;</strong>.
                    </p>
                  </div>

                  {/* State 1: Prerequisite Missing (Must have selected brand name) */}
                  {(!brandState?.naming?.isSelected || !brandState?.naming?.selectedName) && (
                    <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 text-center space-y-4 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6 text-[#B78103]" />
                      </div>
                      <h4 className="font-editorial text-xl text-[#141416]">
                        Brand Name Selection Required
                      </h4>
                      <p className="text-xs text-[#686764] max-w-md mx-auto">
                        The Voice Agent cannot formulate tone guidelines or writing rules without an authoritative, human-selected brand name. Please select a candidate name in Stage 04 (Naming) first.
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShapeSubStage("naming")}
                          className="px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-colors inline-flex items-center gap-2"
                        >
                          <span>Return to Stage 04: Naming</span>
                          <ArrowRight className="w-4 h-4 text-[#E87A90]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* State 2: Ready to Execute Voice */}
                  {brandState?.naming?.isSelected && brandState?.naming?.selectedName && !voiceData && (
                    <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 shadow-sm space-y-6">
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96948F] block">
                            Authoritative Brand Identity Anchor
                          </span>
                          <h4 className="font-editorial text-xl text-[#141416] mt-0.5">
                            &ldquo;{brandState.naming.selectedName}&rdquo;
                          </h4>
                          {brandState.naming.selectedTagline && (
                            <p className="text-xs text-[#686764] italic mt-0.5">
                              &ldquo;{brandState.naming.selectedTagline}&rdquo;
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-mono border border-[#C8E6C9]">
                            Archetype: {brandState.personality.archetype}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-editorial text-lg text-[#141416]">
                          Formulate Voice & Communication Architecture
                        </h4>
                        <p className="text-xs text-[#686764] leading-relaxed">
                          The Voice Agent will synthesize the archetype, differentiator, and selected name into:
                        </p>
                        <ul className="text-xs text-[#686764] space-y-1 list-disc pl-5">
                          <li>Multidimensional tone scales with strategic calibration rationales</li>
                          <li>Operational vocabulary (preferred words, words to avoid, and domain terminology)</li>
                          <li>Strategic messaging pillars directly mapped to your competitive wedge</li>
                          <li>Actionable writing guidelines and real-world copy examples (homepage hero, pitch, CTA, social)</li>
                          <li>Anti-patterns (Voice Don&apos;ts) and Consistency Rules for Phase 7 auditing</li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        id="run-voice-btn"
                        onClick={handleRunVoice}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        <Volume2 className="w-4 h-4 text-[#E87A90]" />
                        <span>Generate Voice Strategy</span>
                      </button>
                    </div>
                  )}

                  {/* State 3: Voice Generated View */}
                  {voiceData && (
                    <div className="space-y-6">
                      {/* Selected Identity & Regeneration Bar */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#96948F]">
                              Selected Identity
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-mono">
                              Locked Anchor
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <h4 className="font-editorial text-2xl text-[#141416]">
                              {brandState?.naming?.selectedName}
                            </h4>
                            {brandState?.naming?.selectedTagline && (
                              <span className="text-xs text-[#686764] italic">
                                &ldquo;{brandState.naming.selectedTagline}&rdquo;
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          id="regenerate-voice-btn"
                          onClick={handleRunVoice}
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8E5DF] bg-[#FAF8F5] text-[#141416] text-xs font-medium hover:bg-[#F0EDE6] transition-all shadow-xs disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#686764]" />
                          <span>Regenerate Voice</span>
                        </button>
                      </div>

                      {/* Section 1: Tone Profile */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                              Vocal Identity
                            </span>
                            <h4 className="font-editorial text-xl text-[#141416]">
                              Tone Profile
                            </h4>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-[#141416] text-[#FBF9F6] text-xs font-medium font-editorial">
                            Primary: {voiceData.toneProfile.primary}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96948F] block">
                              Secondary Tones
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {voiceData.toneProfile.secondary.map((tone, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E5DF] text-xs text-[#141416] font-medium"
                                >
                                  {tone}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96948F] block">
                              Tonal Balance
                            </span>
                            <p className="text-xs text-[#141416] leading-relaxed italic">
                              &ldquo;{voiceData.toneProfile.tonalBalance}&rdquo;
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF]">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96948F] block">
                            Intended Emotional Effect on Audience
                          </span>
                          <p className="text-xs text-[#FFFFFF] leading-relaxed mt-1">
                            {voiceData.toneProfile.emotionalEffect}
                          </p>
                        </div>
                      </div>S

                      {/* Section 2: Tone Dimensions */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="border-b border-[#E8E5DF] pb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                            Calibration Spectrum
                          </span>
                          <h4 className="font-editorial text-xl text-[#141416]">
                            Tone Dimensions
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {voiceData.toneDimensions.map((dim, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#141416]">
                                  {dim.dimension}
                                </span>
                                <span className="font-mono text-xs text-[#E87A90] font-semibold">
                                  {dim.level}/100
                                </span>
                              </div>

                              {/* Progress Meter Bar */}
                              <div className="w-full h-2 rounded-full bg-[#EAE7E0] overflow-hidden">
                                <div
                                  className="h-full bg-[#141416] rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(0, dim.level))}%` }}
                                />
                              </div>

                              <p className="text-[11px] text-[#686764] leading-relaxed pt-1">
                                {dim.rationale}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 3: Operational Vocabulary System */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="border-b border-[#E8E5DF] pb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                            Lexicon Rules
                          </span>
                          <h4 className="font-editorial text-xl text-[#141416]">
                            Operational Vocabulary System
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Preferred */}
                          <div className="p-4 rounded-xl bg-[#E8F5E9]/40 border border-[#C8E6C9] space-y-2">
                            <div className="flex items-center gap-1.5 text-[#2E7D32]">
                              <Check className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-semibold uppercase tracking-wider">
                                Preferred Words
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {voiceData.vocabulary.preferred.map((word, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-white text-[#2E7D32] border border-[#C8E6C9] text-xs font-mono font-medium"
                                >
                                  {word}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Avoid */}
                          <div className="p-4 rounded-xl bg-[#FFEBEE]/40 border border-[#FFCDD2] space-y-2">
                            <div className="flex items-center gap-1.5 text-[#C62828]">
                              <X className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-semibold uppercase tracking-wider">
                                Words to Avoid
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {voiceData.vocabulary.avoid.map((word, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-white text-[#C62828] border border-[#FFCDD2] text-xs font-mono line-through"
                                >
                                  {word}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Terminology */}
                          <div className="p-4 rounded-xl bg-[#E3F2FD]/40 border border-[#BBDEFB] space-y-2">
                            <div className="flex items-center gap-1.5 text-[#1976D2]">
                              <Tag className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-semibold uppercase tracking-wider">
                                Core Terminology
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {voiceData.vocabulary.terminology.map((term, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-white text-[#1976D2] border border-[#BBDEFB] text-xs font-medium"
                                >
                                  {term}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Language Characteristics */}
                          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                            <div className="flex items-center gap-1.5 text-[#141416]">
                              <Sliders className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-semibold uppercase tracking-wider">
                                Language Traits
                              </span>
                            </div>
                            <ul className="text-xs text-[#686764] space-y-1 list-disc pl-4">
                              {voiceData.vocabulary.languageCharacteristics.map((trait, idx) => (
                                <li key={idx}>{trait}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Messaging Pillars */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="border-b border-[#E8E5DF] pb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                            Strategic Architecture
                          </span>
                          <h4 className="font-editorial text-xl text-[#141416]">
                            Messaging Pillars
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {voiceData.messagingPillars.map((pillar, idx) => (
                            <div
                              key={idx}
                              className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] flex flex-col justify-between space-y-3"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-[#96948F]">
                                    0{idx + 1}
                                  </span>
                                  <h5 className="font-semibold text-sm text-[#141416]">
                                    {pillar.title}
                                  </h5>
                                </div>
                                <p className="text-[11px] text-[#686764]">
                                  <strong className="text-[#141416]">Purpose:</strong> {pillar.purpose}
                                </p>
                                <p className="text-xs text-[#141416] italic border-l-2 border-[#E87A90] pl-2.5 py-0.5 font-editorial">
                                  &ldquo;{pillar.keyMessage}&rdquo;
                                </p>
                              </div>

                              <div className="pt-2 border-t border-[#E8E5DF] space-y-1">
                                <span className="text-[10px] uppercase font-semibold text-[#96948F] block">
                                  Supporting Points:
                                </span>
                                <ul className="text-[11px] text-[#686764] space-y-1 list-disc pl-4">
                                  {pillar.supportingPoints.map((pt, pIdx) => (
                                    <li key={pIdx}>{pt}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 5: Communication Principles & Writing Guidelines */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Communication Principles */}
                        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-4">
                          <div className="border-b border-[#E8E5DF] pb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                              Rules of Engagement
                            </span>
                            <h4 className="font-editorial text-xl text-[#141416]">
                              Communication Principles
                            </h4>
                          </div>

                          <div className="space-y-3">
                            {voiceData.communicationPrinciples.map((cp, idx) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#E87A90]" />
                                  <h5 className="text-xs font-semibold text-[#141416]">
                                    {cp.principle}
                                  </h5>
                                </div>
                                <p className="text-xs text-[#686764] pl-3.5 leading-relaxed">
                                  {cp.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Writing Guidelines */}
                        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-4">
                          <div className="border-b border-[#E8E5DF] pb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                              Editorial Handbook
                            </span>
                            <h4 className="font-editorial text-xl text-[#141416]">
                              Writing Guidelines
                            </h4>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF]">
                              <span className="font-semibold text-[#141416] block mb-1">Sentence Style:</span>
                              <ul className="text-[#686764] list-disc pl-4 space-y-0.5">
                                {voiceData.writingGuidelines.sentenceStyle.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF]">
                              <span className="font-semibold text-[#141416] block mb-1">Content Structure:</span>
                              <ul className="text-[#686764] list-disc pl-4 space-y-0.5">
                                {voiceData.writingGuidelines.structure.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF]">
                              <span className="font-semibold text-[#141416] block mb-1">Calls to Action (CTAs):</span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {voiceData.writingGuidelines.callsToAction.map((cta, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-white border border-[#E8E5DF] font-medium text-[#141416]"
                                  >
                                    {cta}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF]">
                              <span className="font-semibold text-[#141416] block mb-1">Punctuation & Formatting:</span>
                              <ul className="text-[#686764] list-disc pl-4 space-y-0.5">
                                {voiceData.writingGuidelines.punctuationAndFormatting.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 6: Real-World Voice Examples */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="border-b border-[#E8E5DF] pb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                            Production Copy Demonstrations
                          </span>
                          <h4 className="font-editorial text-xl text-[#141416]">
                            Real-World Voice Examples
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Hero */}
                          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                              <FileText className="w-3.5 h-3.5 text-[#E87A90]" />
                              <span>Homepage Hero</span>
                            </div>
                            <p className="font-editorial text-lg text-[#141416] leading-snug">
                              &ldquo;{voiceData.examples.homepageHero}&rdquo;
                            </p>
                          </div>

                          {/* Short Pitch */}
                          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                              <Quote className="w-3.5 h-3.5 text-[#E87A90]" />
                              <span>Short Pitch</span>
                            </div>
                            <p className="text-xs text-[#141416] leading-relaxed">
                              {voiceData.examples.shortPitch}
                            </p>
                          </div>

                          {/* Primary CTA */}
                          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                              <span>Primary CTA Button</span>
                            </div>
                            <div className="pt-1">
                              <span className="inline-block px-4 py-2 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold shadow-xs">
                                {voiceData.examples.primaryCTA}
                              </span>
                            </div>
                          </div>

                          {/* Social Post */}
                          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#96948F]">
                              <Globe className="w-3.5 h-3.5 text-[#1976D2]" />
                              <span>Social Announcement Post</span>
                            </div>
                            <p className="text-xs text-[#686764] leading-relaxed whitespace-pre-wrap font-sans">
                              {voiceData.examples.socialPost}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Section 7: Voice Don'ts & Consistency Rules */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Voice Don'ts */}
                        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E8E5DF] shadow-sm space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C62828]">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Voice Don&apos;ts (Anti-Patterns)</span>
                          </div>
                          <ul className="text-xs text-[#686764] space-y-2">
                            {voiceData.voiceDonts.map((dont, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-[#C62828] font-bold">✕</span>
                                <span>{dont}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Consistency Rules */}
                        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E8E5DF] shadow-sm space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#141416]">
                            <ShieldCheck className="w-4 h-4 text-[#81C784]" />
                            <span>Phase 7 Consistency Evaluator Rules</span>
                          </div>
                          <ul className="text-xs text-[#686764] space-y-2">
                            {voiceData.consistencyRules.map((rule, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-[#81C784] font-bold">✓</span>
                                <span>{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Transition & Confirmation Action */}
                      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-[#686764]">
                          <span className="font-semibold text-[#141416]">Stage 05 Completed.</span> Operational brand voice and editorial rules committed to BrandState.
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            id="view-voice-summary-btn"
                            onClick={() => setShowVoiceApprovedModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E5DF] bg-[#FAF8F5] text-[#141416] text-xs font-medium hover:bg-[#F0EDE6] transition-all shadow-xs"
                          >
                            <Check className="w-4 h-4 text-[#81C784]" />
                            <span>Voice Summary</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStage("VISUALIZE")}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-all shadow-sm"
                          >
                            <span>Proceed to Visual Direction</span>
                            <ArrowRight className="w-4 h-4 text-[#E87A90]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 06: VISUAL DIRECTION                                     */}
          {/* ============================================================== */}
          {selectedStage === "VISUALIZE" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* PREREQUISITE GUARD CHECK */}
              {(!brandState?.discovery?.isAnalyzed ||
                !brandState?.positioning?.isPositioned ||
                !brandState?.personality?.isFormulated ||
                !brandState?.naming?.isSelected ||
                !brandState?.voice?.isGenerated) ? (
                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 shadow-sm space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-editorial text-2xl text-[#141416]">
                        Prerequisites Pending for Visual Direction
                      </h3>
                      <p className="text-xs text-[#686764] leading-relaxed max-w-2xl">
                        Visual Direction translates strategy, personality, selected name, and voice into an operational sensory design system.
                        All preceding foundational layers must be established and approved before generating visual tokens.
                      </p>
                    </div>
                  </div>

                  {/* Requirement Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                    <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.discovery?.isAnalyzed ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]" : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                      }`}>
                      <div>
                        <span className="font-semibold block text-[#141416]">01. Discovery</span>
                        <span className="text-[11px] text-[#686764]">{brandState?.discovery?.isAnalyzed ? "Problem & Audience Validated" : "Incomplete"}</span>
                      </div>
                      {brandState?.discovery?.isAnalyzed ? <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" /> : <button type="button" onClick={() => setSelectedStage("DISCOVER")} className="text-xs font-medium text-[#141416] underline">Fix</button>}
                    </div>

                    <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.positioning?.isPositioned ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]" : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                      }`}>
                      <div>
                        <span className="font-semibold block text-[#141416]">02. Positioning</span>
                        <span className="text-[11px] text-[#686764]">{brandState?.positioning?.isPositioned ? "Category & Differentiator Set" : "Incomplete"}</span>
                      </div>
                      {brandState?.positioning?.isPositioned ? <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" /> : <button type="button" onClick={() => setSelectedStage("POSITION")} className="text-xs font-medium text-[#141416] underline">Fix</button>}
                    </div>

                    <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.personality?.isFormulated ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]" : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                      }`}>
                      <div>
                        <span className="font-semibold block text-[#141416]">03. Personality</span>
                        <span className="text-[11px] text-[#686764]">{brandState?.personality?.isFormulated ? "Archetype & Principles Set" : "Incomplete"}</span>
                      </div>
                      {brandState?.personality?.isFormulated ? <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" /> : <button type="button" onClick={() => { setSelectedStage("SHAPE"); setShapeSubStage("personality"); }} className="text-xs font-medium text-[#141416] underline">Fix</button>}
                    </div>

                    <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.naming?.isSelected ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]" : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                      }`}>
                      <div>
                        <span className="font-semibold block text-[#141416]">04. Selected Name</span>
                        <span className="text-[11px] text-[#686764]">{brandState?.naming?.isSelected ? brandState.naming.selectedName : "Candidate Unselected"}</span>
                      </div>
                      {brandState?.naming?.isSelected ? <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" /> : <button type="button" onClick={() => { setSelectedStage("SHAPE"); setShapeSubStage("naming"); }} className="text-xs font-medium text-[#141416] underline">Fix</button>}
                    </div>

                    <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.voice?.isGenerated ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]" : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                      }`}>
                      <div>
                        <span className="font-semibold block text-[#141416]">05. Voice Strategy</span>
                        <span className="text-[11px] text-[#686764]">{brandState?.voice?.isGenerated ? "Tone & Pillars Formulated" : "Incomplete"}</span>
                      </div>
                      {brandState?.voice?.isGenerated ? <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" /> : <button type="button" onClick={() => { setSelectedStage("SHAPE"); setShapeSubStage("voice"); }} className="text-xs font-medium text-[#141416] underline">Fix</button>}
                    </div>
                  </div>
                </div>
              ) : !brandState?.visualDirection?.isGenerated ? (
                /* READY TO RUN STATE */
                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 sm:p-10 shadow-sm text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#F5F2EB] text-[#141416] flex items-center justify-center mx-auto ring-1 ring-[#E8E5DF]">
                    <Palette className="w-8 h-8 text-[#E87A90]" />
                  </div>

                  <div className="max-w-2xl mx-auto space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FAF8F5] border border-[#E8E5DF] text-[#686764]">
                      Stage 06 &bull; Visual Identity Engine
                    </span>
                    <h3 className="font-editorial text-3xl sm:text-4xl text-[#141416] tracking-tight">
                      Translate Soul &amp; Strategy into Form
                    </h3>
                    <p className="text-xs sm:text-sm text-[#686764] leading-relaxed">
                      Synthesizing <strong className="text-[#141416]">{brandState.naming.selectedName}</strong>&apos;s verified positioning,
                      the <strong className="text-[#141416]">{brandState.personality.archetype}</strong> archetype, and
                      the <strong className="text-[#141416]">{brandState.voice.toneProfile.primary}</strong> voice into an authoritative, production-grade visual brand system.
                    </p>
                  </div>

                  {/* 6 Pillars Preview Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-w-4xl mx-auto text-left pt-2">
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                      <span className="text-[10px] font-mono text-[#96948F]">01</span>
                      <p className="text-xs font-semibold text-[#141416]">Visual Personality</p>
                      <p className="text-[11px] text-[#686764] leading-tight">Mood &amp; Principles</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                      <span className="text-[10px] font-mono text-[#96948F]">02</span>
                      <p className="text-xs font-semibold text-[#141416]">Color System</p>
                      <p className="text-[11px] text-[#686764] leading-tight">WCAG &amp; Semantics</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                      <span className="text-[10px] font-mono text-[#96948F]">03</span>
                      <p className="text-xs font-semibold text-[#141416]">Typography</p>
                      <p className="text-[11px] text-[#686764] leading-tight">Pairing &amp; Rationale</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                      <span className="text-[10px] font-mono text-[#96948F]">04</span>
                      <p className="text-xs font-semibold text-[#141416]">Imagery Rules</p>
                      <p className="text-[11px] text-[#686764] leading-tight">Photo &amp; Illustration</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                      <span className="text-[10px] font-mono text-[#96948F]">05</span>
                      <p className="text-xs font-semibold text-[#141416]">Logo Direction</p>
                      <p className="text-[11px] text-[#686764] leading-tight">Mark &amp; Construction</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                      <span className="text-[10px] font-mono text-[#96948F]">06</span>
                      <p className="text-xs font-semibold text-[#141416]">Layout Rules</p>
                      <p className="text-[11px] text-[#686764] leading-tight">Spacing &amp; Density</p>
                    </div>
                  </div>

                  {/* Action Trigger */}
                  <div className="pt-2">
                    <button
                      type="button"
                      id="generate-visual-direction-btn"
                      onClick={handleRunVisual}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-sm font-semibold hover:bg-[#27262A] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#E87A90]" />
                      <span>{isLoading ? "Synthesizing Systemic Aesthetics..." : "Generate Visual Direction"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* GENERATED VISUAL DIRECTION SYSTEM */
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Header Overview Card */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E8E5DF] text-[11px] font-mono font-medium text-[#686764]">
                          v{brandState.version}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Visual System Active
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E8E5DF] text-[11px] font-medium text-[#686764]">
                          {brandState.visualDirection.colorSystem.accessibility.wcagCompliance}
                        </span>
                      </div>
                      <h3 className="font-editorial text-3xl text-[#141416] tracking-tight">
                        {brandState.naming.selectedName} &mdash; Visual Direction
                      </h3>
                      <p className="text-xs text-[#686764] max-w-2xl leading-relaxed">
                        A sensory architecture derived directly from the verified strategic positioning, behavioral archetype, and voice rules.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleRunVisual}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E8E5DF] bg-[#FAF8F5] text-xs font-medium text-[#141416] hover:bg-[#F0EDE6] transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Regenerate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowVisualApprovedModal(true)}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 text-[#81C784]" />
                        <span>Approve Visual System</span>
                      </button>
                    </div>
                  </div>

                  {/* PILLAR 01: VISUAL PERSONALITY */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div>
                        <span className="text-[11px] font-mono text-[#96948F] uppercase tracking-wider block">Pillar 01</span>
                        <h4 className="font-editorial text-2xl text-[#141416]">Visual Personality &amp; Mood</h4>
                      </div>
                      <span className="text-xs text-[#686764] italic">Atmospheric Sensibility</span>
                    </div>

                    {/* Aesthetic Mood Statement */}
                    <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] relative overflow-hidden">
                      <div className="absolute right-4 top-4 text-[#EAE6DC]">
                        <Quote className="w-12 h-12" />
                      </div>
                      <span className="text-[11px] font-mono text-[#96948F] uppercase tracking-wider block mb-1">Aesthetic Mood Thesis</span>
                      <p className="font-editorial text-2xl sm:text-3xl text-[#141416] relative z-10 leading-snug">
                        &ldquo;{brandState.visualDirection.visualPersonality.aestheticMood}&rdquo;
                      </p>
                      <p className="text-xs text-[#686764] mt-3 relative z-10 leading-relaxed">
                        {brandState.visualDirection.visualPersonality.imageryDirection}
                      </p>
                    </div>

                    {/* Visual Keywords */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-[#141416] block">Visual Keywords:</span>
                      <div className="flex flex-wrap gap-2">
                        {brandState.visualDirection.visualPersonality.visualKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#FFFFFF] border border-[#E8E5DF] text-[#141416] shadow-2xs hover:border-[#141416] transition-colors"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Design Principles Grid */}
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-semibold text-[#141416] block">Operational Design Principles:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {brandState.visualDirection.visualPersonality.designPrinciples.map((p, i) => (
                          <div key={i} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-[#96948F]">0{i + 1}</span>
                              <span className="text-xs font-semibold text-[#141416]">{p.principle}</span>
                            </div>
                            <p className="text-xs text-[#686764] leading-relaxed">{p.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* PILLAR 02: COLOR SYSTEM */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div>
                        <span className="text-[11px] font-mono text-[#96948F] uppercase tracking-wider block">Pillar 02</span>
                        <h4 className="font-editorial text-2xl text-[#141416]">Harmonized Color System</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E8E5DF] text-[#2E7D32] font-semibold">
                          {brandState.visualDirection.colorSystem.accessibility.wcagCompliance}
                        </span>
                      </div>
                    </div>

                    {/* Primary Colors */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#141416]">Primary Palette</span>
                        <span className="text-[11px] text-[#686764]">Dominant brand anchors</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {brandState.visualDirection.colorSystem.primary.map((color, i) => (
                          <div key={i} className="rounded-xl border border-[#E8E5DF] overflow-hidden bg-[#FAF8F5] shadow-2xs">
                            <div
                              className="h-24 w-full relative transition-transform hover:scale-[1.02]"
                              style={{ backgroundColor: color.hex }}
                            >
                              <button
                                type="button"
                                onClick={() => handleCopyHex(color.hex)}
                                className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-[#FFFFFF]/90 text-[10px] font-mono font-medium text-[#141416] shadow-sm hover:bg-[#FFFFFF] transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                {copiedHex === color.hex ? "Copied!" : color.hex}
                              </button>
                            </div>
                            <div className="p-3.5 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#141416]">{color.name}</span>
                                <span className="text-[10px] font-mono text-[#686764]">{color.hex}</span>
                              </div>
                              <span className="text-[11px] font-medium text-[#E87A90] block">{color.role}</span>
                              <p className="text-[11px] text-[#686764] leading-relaxed">{color.usage}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Palette */}
                    {brandState.visualDirection.colorSystem.secondary.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#141416]">Secondary &amp; Accent Palette</span>
                          <span className="text-[11px] text-[#686764]">Supporting tonal accents</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {brandState.visualDirection.colorSystem.secondary.map((color, i) => (
                            <div key={i} className="rounded-xl border border-[#E8E5DF] overflow-hidden bg-[#FAF8F5] shadow-2xs">
                              <div
                                className="h-20 w-full relative transition-transform hover:scale-[1.02]"
                                style={{ backgroundColor: color.hex }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleCopyHex(color.hex)}
                                  className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-[#FFFFFF]/90 text-[10px] font-mono font-medium text-[#141416] shadow-sm hover:bg-[#FFFFFF] transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  {copiedHex === color.hex ? "Copied!" : color.hex}
                                </button>
                              </div>
                              <div className="p-3 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-[#141416]">{color.name}</span>
                                  <span className="text-[10px] font-mono text-[#686764]">{color.hex}</span>
                                </div>
                                <span className="text-[10px] font-medium text-[#B78103] block">{color.role}</span>
                                <p className="text-[11px] text-[#686764] leading-relaxed">{color.usage}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Neutrals & Semantic Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Neutrals */}
                      <div className="space-y-3">
                        <span className="text-xs font-semibold text-[#141416] block">Neutrals &amp; Surfaces</span>
                        <div className="space-y-2">
                          {brandState.visualDirection.colorSystem.neutrals.map((color, i) => (
                            <div key={i} className="p-2.5 rounded-lg border border-[#E8E5DF] bg-[#FAF8F5] flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-7 h-7 rounded-md border border-[#E8E5DF] shadow-2xs shrink-0"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <div>
                                  <span className="text-xs font-semibold text-[#141416] block">{color.name}</span>
                                  <span className="text-[10px] text-[#686764]">{color.role}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyHex(color.hex)}
                                className="font-mono text-xs text-[#686764] hover:text-[#141416] transition-colors px-2 py-0.5 rounded-md hover:bg-[#EAE6DC]"
                              >
                                {copiedHex === color.hex ? "Copied!" : color.hex}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Semantic */}
                      <div className="space-y-3">
                        <span className="text-xs font-semibold text-[#141416] block">Semantic Signal Colors</span>
                        <div className="space-y-2">
                          {brandState.visualDirection.colorSystem.semantic.map((color, i) => (
                            <div key={i} className="p-2.5 rounded-lg border border-[#E8E5DF] bg-[#FAF8F5] flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-7 h-7 rounded-md border border-[#E8E5DF] shadow-2xs shrink-0"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <div>
                                  <span className="text-xs font-semibold text-[#141416] block">{color.name}</span>
                                  <span className="text-[10px] text-[#686764]">{color.role}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyHex(color.hex)}
                                className="font-mono text-xs text-[#686764] hover:text-[#141416] transition-colors px-2 py-0.5 rounded-md hover:bg-[#EAE6DC]"
                              >
                                {copiedHex === color.hex ? "Copied!" : color.hex}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Accessibility Report Card */}
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                        <span className="text-xs font-semibold text-[#141416]">Accessibility &amp; Contrast Audit</span>
                      </div>
                      <p className="text-xs text-[#686764] leading-relaxed">
                        <strong className="text-[#141416]">Contrast Notes:</strong> {brandState.visualDirection.colorSystem.accessibility.contrastNotes}
                      </p>
                      <p className="text-xs text-[#686764] leading-relaxed">
                        <strong className="text-[#141416]">Dark Mode Adaptation:</strong> {brandState.visualDirection.colorSystem.accessibility.darkThemeConsiderations}
                      </p>
                    </div>
                  </div>

                  {/* PILLAR 03: TYPOGRAPHY */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div>
                        <span className="text-[11px] font-mono text-[#96948F] uppercase tracking-wider block">Pillar 03</span>
                        <h4 className="font-editorial text-2xl text-[#141416]">Typography System &amp; Hierarchy</h4>
                      </div>
                      <span className="text-xs text-[#686764] italic">Type Craft</span>
                    </div>

                    {/* Live Typographic Specimen Stage */}
                    <div className="p-6 sm:p-8 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-4">
                      <span className="text-[10px] font-mono text-[#96948F] uppercase tracking-wider block">Live Type Pairing Specimen</span>
                      <div className="space-y-2">
                        <h2
                          style={{ fontFamily: brandState.visualDirection.typography.heading.fontFamily }}
                          className="text-3xl sm:text-4xl text-[#141416] tracking-tight leading-tight"
                        >
                          {brandState.naming.selectedName} &mdash; The Architecture of Verifiable Craft
                        </h2>
                        <p className="text-sm text-[#B78103] font-medium italic">
                          {brandState.naming.selectedTagline || "Where strategic intent translates into sensory execution."}
                        </p>
                      </div>
                      <p
                        style={{ fontFamily: brandState.visualDirection.typography.body.fontFamily }}
                        className="text-xs sm:text-sm text-[#4A4844] leading-relaxed max-w-2xl"
                      >
                        True authority is not claimed; it is demonstrated through deterministic execution and disciplined restraint.
                        Every component in the layout communicates purpose, state, and hierarchy without decorative noise.
                      </p>
                    </div>

                    {/* Font Specifications Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Heading Font */}
                      <div className="p-5 rounded-xl border border-[#E8E5DF] bg-[#FAF8F5] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-[#96948F] uppercase">Display / Heading Font</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E8E5DF] font-medium text-[#141416]">
                            {brandState.visualDirection.typography.heading.category}
                          </span>
                        </div>
                        <p className="font-editorial text-2xl text-[#141416]">
                          {brandState.visualDirection.typography.heading.fontFamily}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {brandState.visualDirection.typography.heading.weights.map((w, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#FFFFFF] border border-[#E8E5DF] text-[#686764]">
                              {w}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-[#686764] leading-relaxed pt-1">
                          <strong className="text-[#141416]">Usage:</strong> {brandState.visualDirection.typography.heading.usage}
                        </p>
                      </div>

                      {/* Body Font */}
                      <div className="p-5 rounded-xl border border-[#E8E5DF] bg-[#FAF8F5] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-[#96948F] uppercase">Body / UI Font</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E8E5DF] font-medium text-[#141416]">
                            {brandState.visualDirection.typography.body.category}
                          </span>
                        </div>
                        <p className="font-sans font-semibold text-2xl text-[#141416]">
                          {brandState.visualDirection.typography.body.fontFamily}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {brandState.visualDirection.typography.body.weights.map((w, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#FFFFFF] border border-[#E8E5DF] text-[#686764]">
                              {w}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-[#686764] leading-relaxed pt-1">
                          <strong className="text-[#141416]">Usage:</strong> {brandState.visualDirection.typography.body.usage}
                        </p>
                      </div>
                    </div>

                    {/* Pairing Rationale Callout */}
                    <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#141416]" />
                        <span className="text-xs font-semibold text-[#141416]">Strategic Pairing Calibration</span>
                      </div>
                      <p className="text-xs text-[#686764] leading-relaxed">
                        <strong className="text-[#141416]">Contrast &amp; Mood:</strong> {brandState.visualDirection.typography.pairing.contrast} &mdash; {brandState.visualDirection.typography.pairing.mood}
                      </p>
                      <p className="text-xs text-[#686764] leading-relaxed">
                        <strong className="text-[#141416]">Rationale:</strong> {brandState.visualDirection.typography.rationale}
                      </p>
                    </div>
                  </div>

                  {/* PILLAR 04: IMAGERY */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div>
                        <span className="text-[11px] font-mono text-[#96948F] uppercase tracking-wider block">Pillar 04</span>
                        <h4 className="font-editorial text-2xl text-[#141416]">Imagery &amp; Visual Media Rules</h4>
                      </div>
                      <span className="text-xs text-[#686764] italic">Art Direction</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Photography Direction */}
                      <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                        <span className="text-xs font-semibold text-[#141416] block">Photography Direction</span>
                        <p className="text-xs text-[#686764] leading-relaxed">
                          {brandState.visualDirection.imagery.photographyDirection}
                        </p>
                      </div>

                      {/* Illustration Direction */}
                      <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                        <span className="text-xs font-semibold text-[#141416] block">Illustration &amp; Schematics</span>
                        <p className="text-xs text-[#686764] leading-relaxed">
                          {brandState.visualDirection.imagery.illustrationDirection}
                        </p>
                      </div>

                      {/* Compositional Rules */}
                      <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                        <span className="text-xs font-semibold text-[#141416] block">Compositional Cadence</span>
                        <p className="text-xs text-[#686764] leading-relaxed">
                          {brandState.visualDirection.imagery.composition}
                        </p>
                      </div>

                      {/* Subject Treatment */}
                      <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                        <span className="text-xs font-semibold text-[#141416] block">Subject Treatment &amp; Context</span>
                        <p className="text-xs text-[#686764] leading-relaxed">
                          {brandState.visualDirection.imagery.subjectTreatment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PILLAR 05: LOGO DIRECTION */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div>
                        <span className="text-[11px] font-mono text-[#96948F] uppercase tracking-wider block">Pillar 05</span>
                        <h4 className="font-editorial text-2xl text-[#141416]">Logo Architecture &amp; Mark Direction</h4>
                      </div>
                      <span className="text-xs text-[#686764] italic">Identity Geometry</span>
                    </div>

                    {/* Conceptual Thesis */}
                    <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                      <span className="text-[10px] font-mono text-[#96948F] uppercase tracking-wider block">The Conceptual Thesis</span>
                      <p className="text-xs sm:text-sm text-[#141416] font-medium leading-relaxed">
                        {brandState.visualDirection.logoDirection.concept}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Mark / Glyph Direction */}
                      <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                        <span className="text-xs font-semibold text-[#141416] block">Logomark &amp; Symbol Direction</span>
                        <p className="text-xs text-[#686764] leading-relaxed">
                          {brandState.visualDirection.logoDirection.markDirection}
                        </p>
                      </div>

                      {/* Wordmark Direction */}
                      <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-2">
                        <span className="text-xs font-semibold text-[#141416] block">Wordmark &amp; Letterforms</span>
                        <p className="text-xs text-[#686764] leading-relaxed">
                          {brandState.visualDirection.logoDirection.wordmarkDirection}
                        </p>
                      </div>
                    </div>

                    {/* Construction Principles */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-semibold text-[#141416] block">Construction &amp; Scalability Principles:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {brandState.visualDirection.logoDirection.constructionPrinciples.map((cp, i) => (
                          <div key={i} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] text-xs text-[#686764] flex items-start gap-2.5">
                            <span className="text-[10px] font-mono text-[#96948F] mt-0.5">0{i + 1}</span>
                            <p className="leading-relaxed">{cp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* PILLAR 06: LAYOUT PRINCIPLES */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div>
                        <span className="text-[11px] font-mono text-[#96948F] uppercase tracking-wider block">Pillar 06</span>
                        <h4 className="font-editorial text-2xl text-[#141416]">Layout &amp; Spatial Principles</h4>
                      </div>
                      <span className="text-xs text-[#686764] italic">Grid Discipline</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                        <span className="text-[10px] font-mono text-[#96948F] uppercase block">Spatial Cadence</span>
                        <p className="text-xs font-semibold text-[#141416]">Spacing Rhythm</p>
                        <p className="text-xs text-[#686764] leading-relaxed">{brandState.visualDirection.layoutPrinciples.spacing}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                        <span className="text-[10px] font-mono text-[#96948F] uppercase block">Cognitive Load</span>
                        <p className="text-xs font-semibold text-[#141416]">Density Calibration</p>
                        <p className="text-xs text-[#686764] leading-relaxed">{brandState.visualDirection.layoutPrinciples.density}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                        <span className="text-[10px] font-mono text-[#96948F] uppercase block">Visual Scale</span>
                        <p className="text-xs font-semibold text-[#141416]">Hierarchy Scale</p>
                        <p className="text-xs text-[#686764] leading-relaxed">{brandState.visualDirection.layoutPrinciples.hierarchy}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                        <span className="text-[10px] font-mono text-[#96948F] uppercase block">Geometry</span>
                        <p className="text-xs font-semibold text-[#141416]">Shape Language</p>
                        <p className="text-xs text-[#686764] leading-relaxed">{brandState.visualDirection.layoutPrinciples.shapeLanguage}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1 sm:col-span-2">
                        <span className="text-[10px] font-mono text-[#96948F] uppercase block">Swiss Grid</span>
                        <p className="text-xs font-semibold text-[#141416]">Compositional Rules</p>
                        <p className="text-xs text-[#686764] leading-relaxed">{brandState.visualDirection.layoutPrinciples.composition}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Phase 5 Milestone Banner */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="w-2 h-2 rounded-full bg-[#81C784]" />
                        <span className="text-xs font-semibold text-[#141416]">Phase 5 &mdash; Visual Direction Complete</span>
                      </div>
                      <p className="text-xs text-[#686764]">
                        The visual brand system has been synthesized and committed to BrandState. Ready for Phase 6 (Critic Agent).
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStage("SHAPE");
                          setShapeSubStage("voice");
                        }}
                        className="px-4 py-2.5 rounded-xl border border-[#E8E5DF] text-xs font-medium text-[#686764] hover:bg-[#FAF8F5] transition-colors"
                      >
                        &larr; Back to Voice
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowVisualApprovedModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors shadow-sm"
                      >
                        <Check className="w-4 h-4 text-[#81C784]" />
                        <span>Review Milestone</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 07: CHALLENGE & CRITIQUE (PHASE 6)                       */}
          {/* ============================================================== */}
          {selectedStage === "CHALLENGE" && (
            <CriticView
              brandState={brandState || createInitialBrandState("")}
              isLoading={isLoading}
              loadingStep={loadingStep}
              errorMessage={errorMessage}
              onRunCritic={handleRunCritic}
              onClearError={() => setErrorMessage(null)}
              onNavigateStage={(stg, sub) => {
                setSelectedStage(stg);
                if (sub) setShapeSubStage(sub);
              }}
              onReviewApproved={() => setShowCriticApprovedModal(true)}
            />
          )}

          {/* ============================================================== */}
          {/* STAGE 08: CONSISTENCY & SYSTEM HARMONY (PHASE 7)              */}
          {/* ============================================================== */}
          {selectedStage === "CONSISTENCY" && (
            <div className="space-y-6">
              {/* PREREQUISITE GUARD: Check if all 6 core layers are available */}
              {!brandState?.discovery?.isAnalyzed ||
                !brandState?.positioning?.isPositioned ||
                !brandState?.personality?.isFormulated ||
                !brandState?.naming?.isSelected ||
                !brandState?.naming?.selectedName ||
                !brandState?.voice?.isGenerated ||
                !brandState?.visualDirection?.isGenerated ? (
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
                        Prerequisites Pending for Consistency Audit
                      </h3>
                      <p className="text-xs text-[#686764] leading-relaxed max-w-2xl mt-1">
                        The Consistency Agent evaluates holistic harmony across all 7 brand dimensions.
                        All foundational layers (Discovery through Visual Direction) must be completed before auditing cross-system coherence.
                      </p>
                    </div>
                  </div>

                  {/* Requirement Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.discovery?.isAnalyzed
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">01. Discovery</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.discovery?.isAnalyzed ? "Problem & Audience Set" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.discovery?.isAnalyzed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("DISCOVER")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.positioning?.isPositioned
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">02. Positioning</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.positioning?.isPositioned ? "Category & Differentiation Set" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.positioning?.isPositioned ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("POSITION")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.personality?.isFormulated
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">03. Personality</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.personality?.isFormulated ? "Archetype & Principles Set" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.personality?.isFormulated ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStage("SHAPE");
                            setShapeSubStage("personality");
                          }}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.naming?.isSelected
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">04. Selected Name</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.naming?.isSelected
                            ? brandState.naming.selectedName
                            : "Candidate Unselected"}
                        </span>
                      </div>
                      {brandState?.naming?.isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStage("SHAPE");
                            setShapeSubStage("naming");
                          }}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.voice?.isGenerated
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">05. Voice Strategy</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.voice?.isGenerated ? "Tone & Pillars Set" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.voice?.isGenerated ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStage("SHAPE");
                            setShapeSubStage("voice");
                          }}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.visualDirection?.isGenerated
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">06. Visual Direction</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.visualDirection?.isGenerated ? "Color & Typography Set" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.visualDirection?.isGenerated ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("VISUALIZE")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : !brandState?.consistency?.isEvaluated ? (
                /* READY TO RUN STATE */
                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 sm:p-10 shadow-sm text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#E8F5E9] text-[#141416] flex items-center justify-center mx-auto ring-1 ring-[#C8E6C9]">
                    <Layers className="w-8 h-8 text-[#2E7D32]" />
                  </div>

                  <div className="max-w-2xl mx-auto space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FAF8F5] border border-[#E8E5DF] text-[#686764]">
                      Stage 08 &bull; Cross-System Coherence Engine
                    </span>
                    <h3 className="font-editorial text-3xl sm:text-4xl text-[#141416] tracking-tight">
                      Audit Brand System Coherence
                    </h3>
                    <p className="text-xs sm:text-sm text-[#686764] leading-relaxed">
                      The Consistency Agent evaluates holistic harmony across all 7 brand dimensions for{" "}
                      <strong className="text-[#141416]">&ldquo;{brandState.naming.selectedName}&rdquo;</strong>{" "}
                      &mdash; verifying that strategy, audience, archetype, naming, voice, visual identity, and messaging form a seamless, self-reinforcing brand system without contradiction.
                    </p>
                  </div>

                  {/* 7 Dimensions Preview Badges */}
                  <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-2 pt-2">
                    {[
                      "1. Strategic Consistency",
                      "2. Audience Consistency",
                      "3. Personality Consistency",
                      "4. Naming Consistency",
                      "5. Voice Consistency",
                      "6. Visual Consistency",
                      "7. Messaging Consistency",
                    ].map((dim, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FAF8F5] border border-[#E8E5DF] text-[#4A4946]"
                      >
                        {dim}
                      </span>
                    ))}
                  </div>

                  {/* Critique Context Notice */}
                  <div className="max-w-xl mx-auto p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] text-xs text-[#686764] flex items-center justify-center gap-2">
                    {brandState.critique?.isEvaluated ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                        <span>
                          Critique Context Active: Phase 6 diagnostic findings ({brandState.critique.issues.length} issues) will inform cross-system synthesis.
                        </span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-4 h-4 text-[#B78103] shrink-0" />
                        <span>
                          Critic stage optional: Running directly on foundational brand layers (Discovery through Visual).
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleRunConsistency}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-sm font-semibold hover:bg-[#27262A] transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      <Layers className="w-4 h-4 text-[#81C784]" />
                      <span>{isLoading ? loadingStep : "Evaluate Cross-System Consistency"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EVALUATED CONSISTENCY AUDIT VIEW */
                <div className="space-y-6">
                  {/* Top Coherence Hero Card */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#E87A90]" />
                          <span className="text-[11px] font-mono uppercase tracking-wider text-[#686764] font-semibold">
                            Stage 08 &bull; Coherence Audit
                          </span>
                        </div>
                        <h3 className="font-editorial text-2xl sm:text-3xl text-[#141416]">
                          Brand System Coherence: &ldquo;{brandState.naming.selectedName}&rdquo;
                        </h3>
                        <p className="text-xs text-[#686764]">
                          Holistic evaluation across all 7 dimensions of strategy, voice, archetype, and visual form.
                        </p>
                      </div>

                      {/* Readiness Status Pill */}
                      <div>
                        {brandState.consistency.readiness === "coherent" && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32]">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">System Coherent &amp; Unified</span>
                          </div>
                        )}
                        {brandState.consistency.readiness === "mostly_coherent" && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFF8E1] border border-[#FFE082] text-[#B78103]">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Mostly Coherent &bull; Minor Friction</span>
                          </div>
                        )}
                        {brandState.consistency.readiness === "inconsistent" && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828]">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Systemic Friction Detected</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#96948F] block">Readiness Status</span>
                        <p className="text-sm font-semibold text-[#141416] capitalize">
                          {brandState.consistency.readiness.replace("_", " ")}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#96948F] block">Cross-System Issues</span>
                        <p className={`text-sm font-semibold ${brandState.consistency.crossSystemIssues.length > 0 ? "text-[#E65100]" : "text-[#2E7D32]"}`}>
                          {brandState.consistency.crossSystemIssues.length} {brandState.consistency.crossSystemIssues.length === 1 ? "Issue" : "Issues"}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#96948F] block">Systemic Synergies</span>
                        <p className="text-sm font-semibold text-[#2E7D32]">
                          {brandState.consistency.strengths.length} Affirmed
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#96948F] block">Advisory Warnings</span>
                        <p className={`text-sm font-semibold ${brandState.consistency.warnings.length > 0 ? "text-[#B78103]" : "text-[#686764]"}`}>
                          {brandState.consistency.warnings.length} Active
                        </p>
                      </div>
                    </div>

                    {/* Overall Assessment Quote Card */}
                    <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#141416]">
                        <Quote className="w-3.5 h-3.5 text-[#E87A90]" />
                        <span>Holistic Synthesis Assessment</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#4A4946] leading-relaxed italic">
                        &ldquo;{brandState.consistency.overallAssessment}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* 7 Dimensions Grid */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#E87A90]" />
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#686764] font-semibold">
                          Multi-Dimensional Breakdown
                        </span>
                      </div>
                      <h4 className="font-editorial text-2xl text-[#141416]">
                        The Seven Brand Dimensions
                      </h4>
                      <p className="text-xs text-[#686764]">
                        Evaluating resonance, mutual reinforcement, and potential friction across all distinct brand layers.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          key: "strategic",
                          title: "1. Strategic Consistency",
                          subtitle: "Problem ↔ Audience ↔ Category ↔ Positioning ↔ Differentiator",
                          icon: Target,
                          data: brandState.consistency.strategic,
                        },
                        {
                          key: "audience",
                          title: "2. Audience Consistency",
                          subtitle: "Audience ↔ Positioning ↔ Personality ↔ Voice ↔ Visual",
                          icon: Users,
                          data: brandState.consistency.audience,
                        },
                        {
                          key: "personality",
                          title: "3. Personality Consistency",
                          subtitle: "Archetype ↔ Name ↔ Voice ↔ Messaging ↔ Visual Identity",
                          icon: Sparkles,
                          data: brandState.consistency.personality,
                        },
                        {
                          key: "naming",
                          title: "4. Naming Consistency",
                          subtitle: `Selected Name "${brandState.naming.selectedName}" ↔ Strategic Identity`,
                          icon: Tag,
                          data: brandState.consistency.naming,
                        },
                        {
                          key: "voice",
                          title: "5. Voice Consistency",
                          subtitle: "Voice Definition ↔ Messaging ↔ Hero Copy ↔ Guidelines",
                          icon: Volume2,
                          data: brandState.consistency.voice,
                        },
                        {
                          key: "visual",
                          title: "6. Visual Consistency",
                          subtitle: "Colors ↔ Typography ↔ Photography ↔ Aesthetic Mood",
                          icon: Palette,
                          data: brandState.consistency.visual,
                        },
                        {
                          key: "messaging",
                          title: "7. Messaging Consistency",
                          subtitle: "Pillars ↔ Value Prop ↔ Differentiator ↔ Proof Points",
                          icon: FileText,
                          data: brandState.consistency.messaging,
                        },
                      ].map((dim) => {
                        const DimIcon = dim.icon;
                        const status = dim.data?.status || "coherent";
                        const findings = dim.data?.findings || [];

                        const statusBadge =
                          status === "coherent" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                              Coherent
                            </span>
                          ) : status === "warning" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#FFF8E1] text-[#B78103] border border-[#FFE082]">
                              Warning
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
                              Inconsistent
                            </span>
                          );

                        return (
                          <div
                            key={dim.key}
                            className="p-5 rounded-2xl border border-[#E8E5DF] bg-[#FAF8F5] space-y-3 transition-all hover:border-[#D0CDC6]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E8E5DF] flex items-center justify-center text-[#141416]">
                                  <DimIcon className="w-4 h-4 text-[#E87A90]" />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-xs text-[#141416]">{dim.title}</h5>
                                  <p className="text-[10px] text-[#686764]">{dim.subtitle}</p>
                                </div>
                              </div>
                              {statusBadge}
                            </div>

                            {/* Findings list */}
                            <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E8E5DF] space-y-1.5">
                              <span className="text-[10px] font-mono uppercase text-[#96948F] block">
                                Key Dimension Findings:
                              </span>
                              <ul className="space-y-1 text-xs text-[#4A4946]">
                                {findings.length > 0 ? (
                                  findings.map((f, fi) => (
                                    <li key={fi} className="flex items-start gap-1.5 leading-relaxed">
                                      <span className="text-[#96948F] mt-1 shrink-0">&bull;</span>
                                      <span>{f}</span>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-[11px] italic text-[#96948F]">Dimension harmoniously aligned.</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Synergistic Strengths Section */}
                  {brandState.consistency.strengths.length > 0 && (
                    <div className="bg-[#FFFFFF] border border-[#C8E6C9] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-editorial text-xl text-[#141416]">Systemic Synergies &amp; Strengths</h4>
                          <p className="text-xs text-[#686764]">
                            Cross-stage alignments where multiple layers actively reinforce and amplify the core brand promise.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {brandState.consistency.strengths.map((str, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-black border border-white/20 text-xs text-white flex items-start gap-2.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed text-white">{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cross-System Inconsistencies Section */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#E87A90]" />
                          <span className="text-[11px] font-mono uppercase tracking-wider text-[#686764] font-semibold">
                            Systemic Coherence Diagnostics
                          </span>
                        </div>
                        <h4 className="font-editorial text-2xl text-[#141416]">
                          Cross-System Issues ({brandState.consistency.crossSystemIssues.length})
                        </h4>
                        <p className="text-xs text-[#686764]">
                          Relationships between distinct layers that exhibit contradiction, misalignment, or tonal dissonance.
                        </p>
                      </div>

                      {/* Severity Filter Tabs */}
                      <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] border border-[#E8E5DF] rounded-xl self-stretch sm:self-auto overflow-x-auto">
                        {["all", "critical", "high", "medium", "low"].map((sev) => {
                          const count =
                            sev === "all"
                              ? brandState.consistency.crossSystemIssues.length
                              : brandState.consistency.crossSystemIssues.filter((iss) => iss.severity === sev).length;

                          return (
                            <button
                              key={sev}
                              type="button"
                              onClick={() => setConsistencySeverityFilter(sev)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all shrink-0 ${consistencySeverityFilter === sev
                                ? "bg-[#FFFFFF] text-[#141416] shadow-xs font-semibold"
                                : "text-[#686764] hover:text-[#141416]"
                                }`}
                            >
                              {sev} ({count})
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Filtered Issues List */}
                    {brandState.consistency.crossSystemIssues.filter(
                      (iss) => consistencySeverityFilter === "all" || iss.severity === consistencySeverityFilter
                    ).length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#E8E5DF] space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#81C784] mx-auto" />
                        <p className="text-xs font-semibold text-[#141416]">
                          {brandState.consistency.crossSystemIssues.length === 0
                            ? "No Cross-System Inconsistencies Detected"
                            : `No ${consistencySeverityFilter} severity issues found.`}
                        </p>
                        <p className="text-[11px] text-[#686764] max-w-sm mx-auto">
                          All evaluated relationships are functioning in harmonic alignment across strategy, identity, voice, and visuals.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {brandState.consistency.crossSystemIssues
                          .filter(
                            (iss) => consistencySeverityFilter === "all" || iss.severity === consistencySeverityFilter
                          )
                          .map((issue) => {
                            const sevColor =
                              issue.severity === "critical"
                                ? "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]"
                                : issue.severity === "high"
                                  ? "bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]"
                                  : issue.severity === "medium"
                                    ? "bg-[#FFF8E1] text-[#B78103] border-[#FFE082]"
                                    : "bg-[#F5F2EB] text-[#686764] border-[#E8E5DF]";

                            return (
                              <div
                                key={issue.id}
                                className="p-5 sm:p-6 rounded-2xl border border-[#E8E5DF] bg-[#FAF8F5] space-y-4 transition-all hover:border-[#D0CDC6]"
                              >
                                {/* Top Badges */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${sevColor}`}
                                    >
                                      {issue.severity}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFFFF] border border-[#E8E5DF] text-[#141416]">
                                      {issue.relationship}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[11px] text-[#96948F]">
                                    #{issue.id}
                                  </span>
                                </div>

                                {/* Evidence Quote Block */}
                                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E8E5DF] space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#96948F]">
                                    <Quote className="w-3 h-3 text-[#E87A90]" />
                                    <span>Verbatim Evidence from BrandState</span>
                                  </div>
                                  <p className="text-xs italic font-medium text-[#141416] leading-relaxed">
                                    &ldquo;{issue.evidence}&rdquo;
                                  </p>
                                </div>

                                {/* Systemic Explanation */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono uppercase text-[#96948F] block">
                                    Systemic Coherence Friction
                                  </span>
                                  <p className="text-xs text-[#4A4946] leading-relaxed">
                                    {issue.explanation}
                                  </p>
                                </div>

                                {/* Strategic Recommendation */}
                                <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1 text-xs">
                                  <div className="flex items-center gap-1.5 font-semibold text-[#166534]">
                                    <Lightbulb className="w-3.5 h-3.5 text-[#16A34A]" />
                                    <span>Strategic Alignment Guidance:</span>
                                  </div>
                                  <p className="text-[#14532D] leading-relaxed text-[11px]">
                                    {issue.recommendation}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Advisory Warnings Section */}
                  {brandState.consistency.warnings.length > 0 && (
                    <div className="bg-[#FFFFFF] border border-[#FFE082] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-editorial text-xl text-[#141416]">Systemic Advisory Warnings</h4>
                          <p className="text-xs text-[#686764]">
                            Non-blocking observations and nuance considerations for brand execution.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {brandState.consistency.warnings.map((warn, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] text-xs text-[#333333] flex items-start gap-2.5"
                          >
                            <AlertCircle className="w-4 h-4 text-[#B78103] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{warn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Phase 7 Milestone Banner */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="w-2 h-2 rounded-full bg-[#81C784]" />
                        <span className="text-xs font-semibold text-[#141416]">
                          Phase 7 &mdash; Consistency Audit Complete
                        </span>
                      </div>
                      <p className="text-xs text-[#686764]">
                        Cross-system coherence evaluation has been audited and persisted. Ready for Delivery (Phase 8).
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedStage("CHALLENGE")}
                        className="px-4 py-2.5 rounded-xl border border-[#E8E5DF] text-xs font-medium text-[#686764] hover:bg-[#FAF8F5] transition-colors"
                      >
                        &larr; Back to Critic
                      </button>
                      <button
                        type="button"
                        onClick={handleRunConsistency}
                        disabled={isLoading}
                        className="px-4 py-2.5 rounded-xl border border-[#D5D2CA] text-[#141416] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
                      >
                        Re-audit System
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConsistencyApprovedModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5D2CA] text-[#141416] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
                      >
                        <Check className="w-4 h-4 text-[#81C784]" />
                        <span>Review Summary</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStage("DELIVER")}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors shadow-sm"
                      >
                        <span>Proceed to Delivery</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#E87A90]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 09: DELIVERY (PHASE 8)                                    */}
          {/* ============================================================== */}
          {(selectedStage === "DELIVER" || selectedStage === "DELIVERY") && (
            <div className="space-y-6">
              {/* PREREQUISITE GUARD */}
              {!canRunDelivery(brandState || createInitialBrandState("")).allowed ? (
                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-editorial text-2xl text-[#141416]">
                      Prerequisites Incomplete for Delivery
                    </h3>
                    <p className="text-xs sm:text-sm text-[#686764]">
                      Delivery is an operationalization stage that synthesizes the validated brand assets.
                      It requires all 8 upstream foundational stages (Discovery, Positioning, Personality,
                      Selected Name, Voice, Visual Direction, and Consistency evaluation) to be completed.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.discovery?.isAnalyzed
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">01. Discovery</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.discovery?.isAnalyzed ? "Analyzed" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.discovery?.isAnalyzed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("DISCOVER")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.positioning?.isPositioned
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">02. Positioning</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.positioning?.isPositioned ? "Positioned" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.positioning?.isPositioned ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("POSITION")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.naming?.isSelected
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">04. Selected Name</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.naming?.isSelected
                            ? brandState.naming.selectedName
                            : "Candidate Unselected"}
                        </span>
                      </div>
                      {brandState?.naming?.isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStage("SHAPE");
                            setShapeSubStage("naming");
                          }}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.consistency?.isEvaluated
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">08. Consistency</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.consistency?.isEvaluated ? "Evaluated" : "Unevaluated"}
                        </span>
                      </div>
                      {brandState?.consistency?.isEvaluated ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("CONSISTENCY")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Evaluate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : !brandState?.delivery?.isDelivered ? (
                /* READY TO RUN STATE */
                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 sm:p-10 shadow-sm text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#E8F5E9] text-[#141416] flex items-center justify-center mx-auto ring-1 ring-[#C8E6C9]">
                    <PackageCheck className="w-8 h-8 text-[#2E7D32]" />
                  </div>

                  <div className="max-w-2xl mx-auto space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FAF8F5] border border-[#E8E5DF] text-[#686764]">
                      Stage 09 &bull; Operationalization &amp; Deliverables
                    </span>
                    <h3 className="font-editorial text-3xl sm:text-4xl text-[#141416] tracking-tight">
                      Synthesize Brand Deliverables
                    </h3>
                    <p className="text-xs sm:text-sm text-[#686764] leading-relaxed">
                      Transform the approved brand system for{" "}
                      <strong className="text-[#141416]">&ldquo;{brandState?.naming?.selectedName}&rdquo;</strong>{" "}
                      into practical, production-ready deliverables. The Delivery Agent compiles executive summaries, messaging architecture, voice rules, visual specifications, multi-channel usage guidance, and distribution assets without modifying any upstream brand decisions.
                    </p>
                  </div>

                  {/* Deliverable Scope Badges */}
                  <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-2 pt-2">
                    {[
                      "1. Executive Brand Overview",
                      "2. Messaging Architecture & Pillars",
                      "3. Voice Guidelines & Vocabulary",
                      "4. Visual Identity Specifications",
                      "5. Multi-Channel Usage Guidance",
                      "6. Production Launch Deliverables",
                    ].map((sec, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FAF8F5] border border-[#E8E5DF] text-[#4A4946]"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>

                  {/* Consistency Context Notice */}
                  <div className="max-w-xl mx-auto p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] text-xs text-[#686764] flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    <span>
                      Consistency Verified ({brandState?.consistency?.readiness?.toUpperCase()}): Cross-system harmony affirmed across all 7 dimensions.
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleRunDelivery}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-sm font-semibold hover:bg-[#27262A] transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      <PackageCheck className="w-4 h-4 text-[#81C784]" />
                      <span>{isLoading ? loadingStep : "Generate Operational Brand Deliverables"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* DELIVERED STATE VIEW */
                <div className="space-y-6">
                  {/* Header Card */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Deliverables Operationalized
                        </span>
                        {brandState.delivery.deliveredAt && (
                          <span className="text-[11px] text-[#96948F]">
                            {new Date(brandState.delivery.deliveredAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-editorial text-2xl sm:text-3xl text-[#141416]">
                        {brandState.delivery.brandOverview.name} &mdash; Brand Delivery System
                      </h3>
                      <p className="text-xs sm:text-sm text-[#686764]">
                        Practical brand guidance, messaging matrix, voice rules, visual specifications, and launch assets ready for team deployment.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleRunDelivery}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-xl border border-[#D5D2CA] text-xs font-medium text-[#141416] hover:bg-[#FAF8F5] transition-colors"
                      >
                        Re-Synthesize
                      </button>
                    </div>
                  </div>

                  {/* 1. Brand Overview Card */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div className="flex items-center gap-2.5">
                        <BookmarkCheck className="w-5 h-5 text-[#E87A90]" />
                        <h4 className="font-editorial text-xl text-[#141416]">Executive Brand Overview</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            `Brand: ${brandState.delivery.brandOverview.name}\nPositioning: ${brandState.delivery.brandOverview.positioning}\nAudience: ${brandState.delivery.brandOverview.audience}\nPersonality: ${brandState.delivery.brandOverview.personality}\nDifferentiator: ${brandState.delivery.brandOverview.differentiator}`,
                            "overview"
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E5DF] text-xs text-[#686764] hover:text-[#141416] hover:bg-[#FAF8F5] transition-colors"
                      >
                        {copiedKey === "overview" ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "overview" ? "Copied" : "Copy Overview"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                        <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Authoritative Brand Name</span>
                        <p className="text-base font-semibold text-[#141416] font-editorial">{brandState.delivery.brandOverview.name}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                        <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Personality Archetype</span>
                        <p className="text-sm font-semibold text-[#141416]">{brandState.delivery.brandOverview.personality}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1 md:col-span-2">
                        <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Positioning Framing</span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.brandOverview.positioning}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                        <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Target Audience</span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.brandOverview.audience}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                        <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Core Differentiator</span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.brandOverview.differentiator}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Messaging Architecture Card */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div className="flex items-center gap-2.5">
                        <Quote className="w-5 h-5 text-[#E87A90]" />
                        <h4 className="font-editorial text-xl text-[#141416]">Messaging Architecture</h4>
                      </div>
                    </div>

                    {/* Core Message Callout */}
                    <div className="p-6 rounded-2xl bg-[#141416] text-[#FBF9F6] space-y-2 relative overflow-hidden">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-[#81C784]">Core Brand Message</span>
                      <p className="font-editorial text-xl sm:text-2xl leading-snug tracking-tight">
                        &ldquo;{brandState.delivery.messaging.coreMessage}&rdquo;
                      </p>
                      <p className="text-xs text-[#B8B5AD] pt-1">
                        <strong className="text-[#FBF9F6]">Value Proposition:</strong> {brandState.delivery.messaging.valueProposition}
                      </p>
                    </div>

                    {/* Elevator Pitch */}
                    <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#141416] uppercase tracking-wider text-[10px]">
                          30-Second Elevator Pitch
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(brandState.delivery.messaging.elevatorPitch, "pitch")}
                          className="inline-flex items-center gap-1 text-[11px] text-[#686764] hover:text-[#141416] transition-colors"
                        >
                          {copiedKey === "pitch" ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === "pitch" ? "Copied" : "Copy Pitch"}</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-[#4A4946] leading-relaxed italic">
                        &ldquo;{brandState.delivery.messaging.elevatorPitch}&rdquo;
                      </p>
                    </div>

                    {/* Key Messages */}
                    {brandState.delivery.messaging.keyMessages?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">
                          Supporting Key Messages
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {brandState.delivery.messaging.keyMessages.map((msg, i) => (
                            <div key={i} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs text-[#4A4946] flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#141416]/5 text-[#141416] flex items-center justify-center shrink-0 font-mono text-[10px]">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{msg}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messaging Pillars */}
                    {brandState.delivery.messaging.messagingPillars?.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-xs font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">
                          Strategic Messaging Pillars
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {brandState.delivery.messaging.messagingPillars.map((pil, i) => (
                            <div key={i} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                              <span className="text-[10px] font-mono font-semibold text-[#E87A90] uppercase tracking-wider block">
                                Pillar 0{i + 1} &bull; {pil.pillar}
                              </span>
                              <h5 className="font-semibold text-xs text-[#141416] leading-snug">{pil.headline}</h5>
                              <p className="text-[11px] text-[#686764] leading-relaxed">{pil.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Voice & Verbal Identity Card */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div className="flex items-center gap-2.5">
                        <Volume2 className="w-5 h-5 text-[#E87A90]" />
                        <h4 className="font-editorial text-xl text-[#141416]">Voice &amp; Verbal Guidelines</h4>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs space-y-1">
                      <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Voice Posture Summary</span>
                      <p className="text-xs sm:text-sm text-[#141416] leading-relaxed">{brandState.delivery.voiceGuidelines.voiceSummary}</p>
                    </div>

                    {/* Dos and Don'ts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-5 rounded-xl bg-[#E8F5E9]/40 border border-[#C8E6C9] space-y-3">
                        <span className="font-semibold text-[#2E7D32] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" />
                          Communication Rules &mdash; DO
                        </span>
                        <ul className="space-y-2">
                          {brandState.delivery.voiceGuidelines.doRules?.map((rule, i) => (
                            <li key={i} className="flex items-start gap-2 text-[#2E7D32]">
                              <span className="shrink-0 font-bold">&bull;</span>
                              <span className="text-[#141416] leading-relaxed">{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-5 rounded-xl bg-[#FFEBEE]/40 border border-[#FFCDD2] space-y-3">
                        <span className="font-semibold text-[#C62828] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <X className="w-4 h-4" />
                          Forbidden Habits &mdash; DON&apos;T
                        </span>
                        <ul className="space-y-2">
                          {brandState.delivery.voiceGuidelines.dontRules?.map((rule, i) => (
                            <li key={i} className="flex items-start gap-2 text-[#C62828]">
                              <span className="shrink-0 font-bold">&bull;</span>
                              <span className="text-[#141416] leading-relaxed">{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Vocabulary Guidance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">
                          Preferred Vocabulary &amp; Terminology
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {brandState.delivery.voiceGuidelines.vocabularyGuidance?.preferred?.map((term, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">
                          Prohibited / Buzzwords to Avoid
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {brandState.delivery.voiceGuidelines.vocabularyGuidance?.avoid?.map((term, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F5F2EB] text-[#78756F] border border-[#E8E5DF] line-through">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Example Copy Lines */}
                    {brandState.delivery.voiceGuidelines.exampleLines?.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">
                          Signature Copy Lines
                        </span>
                        <div className="space-y-2">
                          {brandState.delivery.voiceGuidelines.exampleLines.map((line, i) => (
                            <div key={i} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs flex items-center justify-between gap-3">
                              <p className="text-[#4A4946] italic leading-relaxed">&ldquo;{line}&rdquo;</p>
                              <button
                                type="button"
                                onClick={() => handleCopyText(line, `line-${i}`)}
                                className="text-[#686764] hover:text-[#141416] p-1 rounded transition-colors shrink-0"
                                title="Copy line"
                              >
                                {copiedKey === `line-${i}` ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Visual Identity Specifications Card */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div className="flex items-center gap-2.5">
                        <Palette className="w-5 h-5 text-[#E87A90]" />
                        <h4 className="font-editorial text-xl text-[#141416]">Visual Identity Specifications</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                        <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Color Direction</span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.visualGuidelines.colorDirection}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                        <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Typography Hierarchy</span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.visualGuidelines.typographyDirection}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                        <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Imagery &amp; Photography</span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.visualGuidelines.imageryDirection}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1">
                        <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Logo Mark Construction</span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.visualGuidelines.logoGuidance}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1 md:col-span-2">
                        <span className="font-semibold text-[#96948F] uppercase tracking-wider text-[10px] block">Composition &amp; Grid Rhythm</span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.visualGuidelines.compositionGuidance}</p>
                      </div>
                    </div>
                  </div>

                  {/* 5. Multi-Channel Usage Guidance Card */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-5 h-5 text-[#E87A90]" />
                        <h4 className="font-editorial text-xl text-[#141416]">Multi-Channel Usage Guidance</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#E87A90] block font-semibold">
                          Digital &amp; Website
                        </span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.usageGuidance.website}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#E87A90] block font-semibold">
                          Social Media &amp; Community
                        </span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.usageGuidance.social}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#E87A90] block font-semibold">
                          Keynotes &amp; Pitch Decks
                        </span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.usageGuidance.presentations}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#E87A90] block font-semibold">
                          Marketing &amp; Campaigns
                        </span>
                        <p className="text-xs text-[#4A4946] leading-relaxed">{brandState.delivery.usageGuidance.marketing}</p>
                      </div>
                    </div>
                  </div>

                  {/* 6. Production Deliverables Matrix */}
                  <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
                      <div className="flex items-center gap-2.5">
                        <PackageCheck className="w-5 h-5 text-[#E87A90]" />
                        <h4 className="font-editorial text-xl text-[#141416]">
                          Production Deliverables ({brandState.delivery.deliverables.length})
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {brandState.delivery.deliverables.map((item) => (
                        <div key={item.id} className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141416]/5 text-[#686764] uppercase font-semibold">
                                {item.type}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(item.content, item.id)}
                                className="inline-flex items-center gap-1 text-[11px] text-[#686764] hover:text-[#141416] transition-colors"
                              >
                                {copiedKey === item.id ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedKey === item.id ? "Copied" : "Copy"}</span>
                              </button>
                            </div>
                            <h5 className="font-semibold text-sm text-[#141416]">{item.title}</h5>
                            <p className="text-xs text-[#686764]">{item.description}</p>
                          </div>

                          <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E8E5DF] text-xs text-[#4A4946] whitespace-pre-wrap font-mono text-[11px] max-h-48 overflow-y-auto">
                            {item.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 7. Advisory Warnings (if any) */}
                  {brandState.delivery.warnings?.length > 0 && (
                    <div className="bg-[#FFF8E1]/60 border border-[#FFE082] rounded-2xl p-6 shadow-sm space-y-3">
                      <div className="flex items-center gap-2 text-[#B78103]">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <h4 className="font-semibold text-xs uppercase tracking-wider">
                          Execution Cautions &amp; Advisory Warnings ({brandState.delivery.warnings.length})
                        </h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#7A5600] pl-6 list-disc">
                        {brandState.delivery.warnings.map((warn, i) => (
                          <li key={i} className="leading-relaxed">{warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <span className="text-xs font-semibold text-[#141416] block">
                        Phase 8 Delivery Complete
                      </span>
                      <p className="text-xs text-[#686764]">
                        The brand system for &ldquo;{brandState.delivery.brandOverview.name}&rdquo; has been operationalized into practical, production-ready deliverables.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedStage("CONSISTENCY")}
                        className="px-4 py-2.5 rounded-xl border border-[#E8E5DF] text-xs font-medium text-[#686764] hover:bg-[#FFFFFF] transition-colors"
                      >
                        &larr; Review Consistency
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeliveryApprovedModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E5DF] text-xs font-semibold text-[#141416] hover:bg-[#FFFFFF] transition-colors"
                      >
                        <Check className="w-4 h-4 text-[#81C784]" />
                        <span>Acknowledge Delivery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStage("BRAND_KIT")}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors shadow-sm"
                      >
                        <span>Proceed to Final Brand Kit</span>
                        <ArrowRight className="w-4 h-4 text-[#E87A90]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 10: FINAL BRAND KIT (PHASE 9)                            */}
          {/* ============================================================== */}
          {(selectedStage === "BRAND_KIT" || selectedStage === "FINAL_BRAND_KIT") && (
            <div className="space-y-6">
              {/* PREREQUISITE GUARD */}
              {!canRunFinalBrandKit(brandState || createInitialBrandState("")).allowed ? (
                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-editorial text-2xl text-[#141416]">
                      Prerequisites Incomplete for Final Brand Kit
                    </h3>
                    <p className="text-xs sm:text-sm text-[#686764]">
                      The Final Brand Kit is the authoritative assembly layer. It requires all 9 upstream stages
                      (Discovery, Positioning, Personality, Authoritative Selected Name, Voice, Visual Direction, Consistency evaluation, and Delivery) to be completed.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.discovery?.isAnalyzed
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">01. Discovery</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.discovery?.isAnalyzed ? "Analyzed" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.discovery?.isAnalyzed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("DISCOVER")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.positioning?.isPositioned
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">02. Positioning</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.positioning?.isPositioned ? "Positioned" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.positioning?.isPositioned ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("POSITION")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.personality?.isFormulated
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">03. Personality</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.personality?.isFormulated ? "Formulated" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.personality?.isFormulated ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStage("SHAPE");
                            setShapeSubStage("personality");
                          }}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.naming?.isSelected && brandState?.naming?.selectedName
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">04. Selected Name</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.naming?.selectedName || "No name chosen"}
                        </span>
                      </div>
                      {brandState?.naming?.isSelected && brandState?.naming?.selectedName ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStage("SHAPE");
                            setShapeSubStage("naming");
                          }}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.voice?.isGenerated
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">05. Voice</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.voice?.isGenerated ? "Generated" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.voice?.isGenerated ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStage("SHAPE");
                            setShapeSubStage("voice");
                          }}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.visualDirection?.isGenerated
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">06. Visual</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.visualDirection?.isGenerated ? "Generated" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.visualDirection?.isGenerated ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("VISUALIZE")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.consistency?.isEvaluated
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">08. Consistency</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.consistency?.isEvaluated ? "Evaluated" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.consistency?.isEvaluated ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("CONSISTENCY")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs flex items-center justify-between ${brandState?.delivery?.isDelivered
                        ? "bg-[#FAF8F5] border-[#81C784]/60 text-[#2E7D32]"
                        : "bg-[#FAF8F5] border-[#E8E5DF] text-[#78756F]"
                        }`}
                    >
                      <div>
                        <span className="font-semibold block text-[#141416]">09. Delivery</span>
                        <span className="text-[11px] text-[#686764]">
                          {brandState?.delivery?.isDelivered ? "Delivered" : "Incomplete"}
                        </span>
                      </div>
                      {brandState?.delivery?.isDelivered ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStage("DELIVER")}
                          className="text-xs font-medium text-[#141416] underline"
                        >
                          Fix
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : !brandState?.finalBrandKit ? (
                /* DELIBERATE HUMAN FINALIZATION STEP (Prompt Section 13) */
                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 sm:p-12 shadow-sm text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DC] text-[#141416] flex items-center justify-center mx-auto shadow-inner">
                    <BookmarkCheck className="w-8 h-8 text-[#E87A90]" />
                  </div>
                  <div className="space-y-2 max-w-xl mx-auto">
                    <h3 className="font-editorial text-3xl text-[#141416]">
                      Ready to Assemble Final Brand Kit
                    </h3>
                    <p className="text-xs sm:text-sm text-[#686764] leading-relaxed">
                      All upstream strategic and operational layers are verified and consistent for{" "}
                      <strong className="text-[#141416]">&ldquo;{brandState?.naming?.selectedName}&rdquo;</strong>.
                      Initiate final assembly to produce the single authoritative, presentation-ready brand system.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto pt-2">
                    {[
                      "01. Discovery",
                      "02. Positioning",
                      "03. Personality",
                      `04. Name: ${brandState?.naming?.selectedName}`,
                      "05. Voice",
                      "06. Visual Direction",
                      "08. Consistency",
                      "09. Delivery",
                    ].map((st, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[11px] font-medium text-[#2E7D32]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                        {st}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleGenerateFinalBrandKit}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-sm font-semibold hover:bg-[#27262A] transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-[#E87A90]" />
                      <span>Generate Final Brand Kit</span>
                    </button>
                  </div>
                </div>
              ) : brandState && brandState.finalBrandKit ? (
                <FinalBrandKitView
                  finalBrandKit={brandState.finalBrandKit}
                  activeKitTab={activeKitTab}
                  setActiveKitTab={setActiveKitTab}
                  onReassemble={handleGenerateFinalBrandKit}
                  onAcknowledge={() => setShowBrandKitApprovedModal(true)}
                  isLoading={isLoading}
                  onNavigateStage={(stage, subStage) => {
                    setSelectedStage(stage);
                    if (subStage) setShapeSubStage(subStage);
                  }}
                  onCopyText={handleCopyText}
                  copiedKey={copiedKey}
                />
              ) : null}
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGES 11+: DOWNSTREAM BOUNDARY PLACEHOLDER (PHASE 10+)        */}
          {/* ============================================================== */}
          {selectedStage !== "DISCOVER" &&
            selectedStage !== "POSITION" &&
            selectedStage !== "SHAPE" &&
            selectedStage !== "VISUALIZE" &&
            selectedStage !== "CHALLENGE" &&
            selectedStage !== "CONSISTENCY" &&
            selectedStage !== "DELIVER" &&
            selectedStage !== "DELIVERY" &&
            selectedStage !== "BRAND_KIT" &&
            selectedStage !== "FINAL_BRAND_KIT" && (
              <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F2EB] text-[#78756F] flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7 text-[#96948F]" />
                </div>
                <h3 className="font-editorial text-3xl text-[#141416]">
                  {activeStageConfig.label} — Locked
                </h3>
                <p className="text-xs sm:text-sm text-[#686764] max-w-md mx-auto leading-relaxed">
                  {activeStageConfig.description}
                </p>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E5DF] text-xs text-[#78756F] max-w-md mx-auto">
                  <p className="font-semibold text-[#141416]">Phase 9 Boundary Gate</p>
                  <p className="mt-1">
                    Final Brand Kit is complete. Stage 11 (Polish / Demo / Export) is scheduled for Phase 10.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStage("BRAND_KIT")}
                  className="inline-flex items-center gap-1.5 text-xs text-[#141416] font-medium underline underline-offset-4 hover:opacity-75"
                >
                  &larr; Return to Stage 10: Final Brand Kit
                </button>
              </div>
            )}
        </section>
      </main>

      {/* Phase 4A Personality Approved Modal */}
      {showPersonalityApprovedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-2xl text-[#141416]">
              Personality Strategy Approved
            </h4>
            <p className="text-xs text-[#686764] leading-relaxed">
              Stage 03 (Personality) has successfully concluded. The BrandState now holds the psychological archetype, behavioral characteristics, operational principles, and emotional territory.
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs text-[#4A4946] space-y-1">
              <span className="font-semibold text-[#141416] block">Next Stage:</span>
              <p>
                Stage 04 (Naming) is ready to generate naming territories anchored in this personality strategy.
              </p>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPersonalityApprovedModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E5DF] text-[#686764] text-xs font-medium hover:bg-[#FAF8F5] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPersonalityApprovedModal(false);
                  setShapeSubStage("naming");
                }}
                className="px-5 py-2 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-colors"
              >
                Proceed to Naming
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 4B Naming Approved Modal */}
      {showNamingApprovedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-2xl text-[#141416]">
              Naming Strategy Established
            </h4>
            <p className="text-xs text-[#686764] leading-relaxed">
              Stage 04 (Naming) generated {brandState?.naming?.directions.length || 0} distinct naming territories.
              {brandState?.naming?.isSelected ? (
                <> The authoritative brand name is <strong className="text-[#141416]">&ldquo;{brandState.naming.selectedName}&rdquo;</strong>.</>
              ) : (
                <> A candidate name must be selected to unlock Voice.</>
              )}
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs text-[#4A4946] space-y-1">
              <span className="font-semibold text-[#141416] block">Next Stage:</span>
              <p>
                Stage 05 (Voice) is ready to formulate tone profiles, vocabulary systems, messaging pillars, and real-world copy.
              </p>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNamingApprovedModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E5DF] text-[#686764] text-xs font-medium hover:bg-[#FAF8F5] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNamingApprovedModal(false);
                  setShapeSubStage("voice");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-colors"
              >
                Proceed to Voice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 4C Voice Approved Modal */}
      {showVoiceApprovedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-2xl text-[#141416]">
              Voice Strategy Established
            </h4>
            <p className="text-xs text-[#686764] leading-relaxed">
              Stage 05 (Voice) established the operational voice system for <strong className="text-[#141416]">&ldquo;{brandState?.naming?.selectedName}&rdquo;</strong> with primary tone <strong className="text-[#141416]">&ldquo;{brandState?.voice?.toneProfile?.primary}&rdquo;</strong>.
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs text-[#4A4946] space-y-1">
              <span className="font-semibold text-[#141416] block">Next Stage:</span>
              <p>
                Stage 06 (Visual Direction) is unlocked and ready to translate strategy and voice into color, typography, imagery, and logo architecture.
              </p>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowVoiceApprovedModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E5DF] text-[#686764] text-xs font-medium hover:bg-[#FAF8F5] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVoiceApprovedModal(false);
                  setSelectedStage("VISUALIZE");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-medium hover:bg-[#27262A] transition-colors"
              >
                Proceed to Visual Direction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 5 Visual Direction Approved Modal */}
      {showVisualApprovedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-2xl text-[#141416]">
              Visual Brand System Approved
            </h4>
            <p className="text-xs text-[#686764] leading-relaxed">
              Stage 06 (Visual Direction) for <strong className="text-[#141416]">&ldquo;{brandState?.naming?.selectedName}&rdquo;</strong> has been synthesized and committed to BrandState.
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs text-[#4A4946] space-y-1">
              <span className="font-semibold text-[#141416] block">Next Stage:</span>
              <p>
                Stage 07 (Critic / Challenge Agent) is unlocked and ready to audit the complete brand system across all 6 upstream layers.
              </p>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowVisualApprovedModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E5DF] text-[#686764] text-xs font-medium hover:bg-[#FAF8F5] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVisualApprovedModal(false);
                  setSelectedStage("CHALLENGE");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors"
              >
                Proceed to Critic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 6 Critic / Challenge Approved Modal */}
      {showCriticApprovedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-2xl text-[#141416]">
              Diagnostic Critique Completed
            </h4>
            <p className="text-xs text-[#686764] leading-relaxed">
              Stage 07 (Critic / Challenge) has audited the complete brand system across all 6 upstream layers for{" "}
              <strong className="text-[#141416]">&ldquo;{brandState?.naming?.selectedName}&rdquo;</strong>.
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs text-[#4A4946] space-y-1">
              <span className="font-semibold text-[#141416] block">Audit Summary:</span>
              <p>
                Status: <span className="font-semibold text-[#141416] capitalize">{brandState?.critique?.readiness?.replace("_", " ")}</span> &bull; {brandState?.critique?.issues?.length || 0} issues identified &bull; {brandState?.critique?.strengths?.length || 0} systemic strengths affirmed.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCriticApprovedModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E8E5DF] text-[#686764] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCriticApprovedModal(false);
                  setSelectedStage("CONSISTENCY");
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors"
              >
                <span>Proceed to Consistency</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E87A90]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 7 Consistency Approved Modal */}
      {showConsistencyApprovedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-2xl text-[#141416]">
              Brand Coherence Verified
            </h4>
            <p className="text-xs text-[#686764] leading-relaxed">
              Stage 08 (Consistency) has audited cross-system harmony across all 7 dimensions for{" "}
              <strong className="text-[#141416]">&ldquo;{brandState?.naming?.selectedName}&rdquo;</strong>.
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs text-[#4A4946] space-y-1">
              <span className="font-semibold text-[#141416] block">Coherence Summary:</span>
              <p>
                Readiness: <span className="font-semibold text-[#141416] capitalize">{brandState?.consistency?.readiness?.replace("_", " ")}</span> &bull; {brandState?.consistency?.crossSystemIssues?.length || 0} issues identified &bull; {brandState?.consistency?.strengths?.length || 0} systemic synergies affirmed.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConsistencyApprovedModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E8E5DF] text-[#686764] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConsistencyApprovedModal(false);
                  setSelectedStage("DELIVER");
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors shadow-sm"
              >
                <span>Proceed to Delivery</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E87A90]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 8 Delivery Approved Modal */}
      {showDeliveryApprovedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-2xl text-[#141416]">
              Brand Deliverables Operationalized
            </h4>
            <p className="text-xs text-[#686764] leading-relaxed">
              Stage 09 (Delivery) has synthesized production-ready brand guidance, messaging architecture, voice rules, visual specifications, multi-channel usage rules, and {brandState?.delivery?.deliverables?.length || 0} launch deliverables for{" "}
              <strong className="text-[#141416]">&ldquo;{brandState?.naming?.selectedName}&rdquo;</strong>.
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs text-[#4A4946] space-y-1">
              <span className="font-semibold text-[#141416] block">Deliverables Summary:</span>
              <p>
                {brandState?.delivery?.deliverables?.length || 0} production deliverables &bull; Full multi-channel usage rules &bull; Zero unsupported claims.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeliveryApprovedModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E8E5DF] text-[#686764] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
              >
                Review Deliverables
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeliveryApprovedModal(false);
                  setSelectedStage("BRAND_KIT");
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors shadow-sm"
              >
                <span>Proceed to Final Brand Kit</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E87A90]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 9 Final Brand Kit Approved Modal */}
      {showBrandKitApprovedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-2xl text-[#141416]">
              Final Brand Kit Authoritative &amp; Locked
            </h4>
            <p className="text-xs text-[#686764] leading-relaxed">
              The complete brand system for <strong className="text-[#141416]">&ldquo;{brandState?.naming?.selectedName}&rdquo;</strong> has been assembled into one authoritative, presentation-ready Final Brand Kit.
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC] text-xs text-[#4A4946] space-y-1">
              <span className="font-semibold text-[#141416] block">Kit Summary:</span>
              <p>
                11 Authoritative Brand Sections &bull; 100% Upstream Preservation &bull; Protected Brand Name &bull; Single Source of Truth.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBrandKitApprovedModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-xs font-semibold hover:bg-[#27262A] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
