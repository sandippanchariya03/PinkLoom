"use client";


import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  History,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Loader2,
  FileText,
} from "lucide-react";
import { getSupabase } from "@/lib/db/supabase";
import { getCurrentUser } from "@/lib/auth/auth";
import type { UserProfile } from "@/lib/auth/auth";
import { AuthHeaderControl } from "@/components/auth/AuthHeaderControl";

interface ProjectSummary {
  id: string;
  rawIdea: string;
  createdAt: string;
  updatedAt: string;
  hasBrand: boolean;
  brandVersion: number | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function IdeaCard({ project, onResume }: { project: ProjectSummary; onResume: (id: string) => void }) {
  const snippet = project.rawIdea.length > 140
    ? project.rawIdea.slice(0, 140).trimEnd() + "…"
    : project.rawIdea;

  return (
    <div
      className="group relative bg-white border border-[#E8E5DF] rounded-2xl p-6 hover:border-[#D4D1CA] hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all"
      id={`project-card-${project.id}`}
    >
      {/* Status badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {project.hasBrand ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Brand Kit Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase font-semibold text-[#686764] bg-[#F7F5F2] border border-[#E8E5DF] px-2.5 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              In Progress
            </span>
          )}
          {project.brandVersion != null && (
            <span className="text-[11px] text-[#96948F]">v{project.brandVersion}</span>
          )}
        </div>
        <span className="text-[11px] text-[#96948F] tabular-nums">
          {formatDate(project.updatedAt)}
        </span>
      </div>

      {/* Idea excerpt */}
      <p className="text-sm text-[#2E2D2B] leading-relaxed mb-5 font-light">{snippet}</p>

      {/* Resume button */}
      <button
        id={`resume-btn-${project.id}`}
        aria-label={`Resume project: ${snippet.slice(0, 50)}`}
        onClick={() => onResume(project.id)}
        className="flex items-center gap-2 text-xs font-medium text-[#141416] group-hover:gap-3 transition-all hover:text-[#E87A90]"
      >
        <FileText className="w-3.5 h-3.5 text-[#E87A90]" />
        Resume in Workspace
        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const profile = await getCurrentUser();
    if (!profile) {
      router.replace("/signin?returnTo=/history");
      return;
    }
    setUser(profile);

    const supabase = getSupabase();
    if (!supabase) {
      setError("Database not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase.rpc("list_user_projects");
      if (fetchError) throw fetchError;

      const mapped: ProjectSummary[] = (data ?? []).map((row: {
        id: string;
        raw_idea: string;
        created_at: string;
        updated_at: string;
        has_brand: boolean;
        brand_version: number | null;
      }) => ({
        id: row.id,
        rawIdea: row.raw_idea,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        hasBrand: row.has_brand,
        brandVersion: row.brand_version,
      }));

      setProjects(mapped);
    } catch (err) {
      console.error("[PinkLoom History] Failed to load projects:", err);
      setError("Could not load your brand history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleResume = (projectId: string) => {
    // Store which project to resume in localStorage, then open workspace
    if (user) {
      localStorage.setItem(
        `pinkloom_user_${user.id}_active_project`,
        projectId
      );
    }
    router.push("/");
  };

  return (
    <div
      className="relative min-h-screen bg-[#FBF9F6] text-[#141416] flex flex-col"
      id="history-page"
    >
      {/* Grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#141416 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#E8E5DF]/70">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            id="history-back-btn"
            className="flex items-center gap-1.5 text-xs text-[#686764] hover:text-[#141416] transition-colors"
            aria-label="Back to workspace"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Workspace
          </Link>
          <span className="text-[#E8E5DF]">·</span>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#E87A90]" />
            <span className="text-sm font-medium text-[#141416]">Brand History</span>
          </div>
        </div>

        <AuthHeaderControl user={user} isLoading={isLoading && !user} returnTo="/history" />
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-6 py-10">

        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#141416] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#E87A90]" />
            </div>
            <h1 id="history-heading" className="text-2xl font-editorial font-normal tracking-tight text-[#141416]">
              Your Brand Projects
            </h1>
          </div>
          {user && (
            <p className="text-sm text-[#686764] ml-11">
              Showing all projects for <span className="font-medium text-[#141416]">{user.email}</span>.
              No other user can access these.
            </p>
          )}
        </div>

        {/* Content states */}
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            aria-label="Loading your brand history"
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="w-8 h-8 animate-spin text-[#E87A90]" />
            <p className="text-sm text-[#686764]">Loading your brand projects…</p>
          </div>
        ) : error ? (
          <div role="alert" className="text-center py-16 space-y-4">
            <p className="text-[#141416] font-medium">{error}</p>
            <button
              id="history-retry-btn"
              onClick={loadData}
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[#E8E5DF] hover:bg-[#F2EFE9] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#F2EFE9] flex items-center justify-center">
              <History className="w-7 h-7 text-[#96948F]" />
            </div>
            <div>
              <p className="text-[#141416] font-medium mb-1">No projects yet</p>
              <p className="text-sm text-[#686764] max-w-xs">
                Start building your first brand in the workspace — it will appear here automatically.
              </p>
            </div>
            <Link
              href="/"
              id="history-start-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141416] text-[#FBF9F6] text-sm font-medium hover:bg-[#27262A] transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#E87A90]" />
              Start Building
            </Link>
          </div>
        ) : (
          <>
            {/* Stats strip */}
            <div className="flex items-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-[#686764]">
                <span className="text-lg font-semibold text-[#141416]">{projects.length}</span>
                project{projects.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2 text-[#686764]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{projects.filter((p: ProjectSummary) => p.hasBrand).length} with brand kit
                </span>
              </div>
              <button
                id="history-refresh-btn"
                onClick={loadData}
                aria-label="Refresh project list"
                className="ml-auto flex items-center gap-1.5 text-xs text-[#96948F] hover:text-[#141416] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {/* Project cards grid */}
            <div
              role="list"
              aria-label="Your brand projects"
              className="grid gap-4 sm:grid-cols-2"
            >
              {projects.map((project) => (
                <div role="listitem" key={project.id}>
                  <IdeaCard project={project} onResume={handleResume} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-6 py-5 border-t border-[#E8E5DF]/60 mt-auto">
        <p className="text-[11px] text-[#A5A39E] text-center">
          PinkLoom Intelligence System · Brand History · Your data is private and never shared.
        </p>
      </footer>
    </div>
  );
}
