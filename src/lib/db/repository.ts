import type { BrandState } from "@/types/brand";
import type { AgentRun } from "@/types/agent";
import { getSupabase } from "./supabase";

// In-memory store fallback for zero-config local development
const memoryProjects = new Map<string, { id: string; raw_idea: string; created_at: string }>();
const memoryBrandStates = new Map<string, BrandState>();
const memoryAgentRuns = new Map<string, AgentRun[]>();

/**
 * Persists project entry to Supabase (or memory fallback).
 */
export async function persistProject(projectId: string, rawIdea: string): Promise<boolean> {
  const supabase = getSupabase();
  const timestamp = new Date().toISOString();

  // Always update in-memory cache
  memoryProjects.set(projectId, { id: projectId, raw_idea: rawIdea, created_at: timestamp });

  if (!supabase) {
    return true; // Memory fallback succeeded
  }

  try {
    const { error } = await supabase.from("projects").upsert(
      {
        id: projectId,
        raw_idea: rawIdea,
        updated_at: timestamp,
      },
      { onConflict: "id" }
    );
    if (error) {
      console.warn("[PinkLoom DB] Supabase project upsert warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[PinkLoom DB] Supabase connection error:", err);
    return false;
  }
}

/**
 * Persists the latest BrandState to Supabase (or memory fallback).
 */
export async function persistBrandState(brandState: BrandState): Promise<boolean> {
  const projectId = brandState.projectId || "default-project";
  const supabase = getSupabase();
  const timestamp = new Date().toISOString();

  memoryBrandStates.set(projectId, brandState);

  if (!supabase) {
    return true;
  }

  try {
    const { error } = await supabase.from("brand_states").upsert(
      {
        project_id: projectId,
        discovery: brandState.discovery,
        positioning: brandState.positioning,
        personality: brandState.personality,
        naming: brandState.naming,
        voice: brandState.voice,
        visual_direction: brandState.visualDirection,
        critique: brandState.critique,
        consistency: brandState.consistency,
        final_brand: brandState.finalBrandKit,
        version: brandState.version,
        updated_at: timestamp,
      },
      { onConflict: "project_id" }
    );

    if (error) {
      console.warn("[PinkLoom DB] Supabase brand_states upsert warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[PinkLoom DB] Supabase connection error:", err);
    return false;
  }
}

/**
 * Records an AgentRun execution trace in Supabase (or memory fallback).
 */
export async function persistAgentRun(agentRun: AgentRun): Promise<boolean> {
  const projectId = agentRun.projectId;
  const supabase = getSupabase();

  const existingRuns = memoryAgentRuns.get(projectId) || [];
  memoryAgentRuns.set(projectId, [
    ...existingRuns.filter((r) => r.id !== agentRun.id),
    agentRun,
  ]);

  if (!supabase) {
    return true;
  }

  try {
    const { error } = await supabase.from("agent_runs").upsert(
      {
        id: agentRun.id,
        project_id: agentRun.projectId,
        agent_name: agentRun.agentName,
        stage: agentRun.stage,
        input: agentRun.input,
        output: agentRun.output,
        status: agentRun.status,
        error: agentRun.error,
        duration_ms: agentRun.durationMs,
        created_at: agentRun.createdAt,
        completed_at: agentRun.completedAt,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("[PinkLoom DB] Supabase agent_runs insert warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[PinkLoom DB] Supabase connection error:", err);
    return false;
  }
}

/**
 * Retrieves the cached or stored BrandState for a project.
 */
export async function getStoredBrandState(projectId: string): Promise<BrandState | null> {
  if (memoryBrandStates.has(projectId)) {
    return memoryBrandStates.get(projectId) || null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("brand_states")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error || !data) return null;

    return {
      projectId: data.project_id,
      version: data.version,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      discovery: data.discovery,
      positioning: data.positioning,
      personality: data.personality,
      naming: data.naming,
      voice: data.voice,
      visualDirection: data.visual_direction,
      critique: data.critique,
      consistency: data.consistency,
      finalBrandKit: data.final_brand,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves past agent runs for a project.
 */
export async function getStoredAgentRuns(projectId: string): Promise<AgentRun[]> {
  const inMemory = memoryAgentRuns.get(projectId) || [];
  const supabase = getSupabase();
  if (!supabase) return inMemory;

  try {
    const { data, error } = await supabase
      .from("agent_runs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error || !data) return inMemory;

    return data.map((d) => ({
      id: d.id,
      projectId: d.project_id,
      agentName: d.agent_name,
      stage: d.stage,
      input: d.input,
      output: d.output,
      status: d.status,
      error: d.error,
      durationMs: d.duration_ms,
      createdAt: d.created_at,
      completedAt: d.completed_at,
    }));
  } catch {
    return inMemory;
  }
}
