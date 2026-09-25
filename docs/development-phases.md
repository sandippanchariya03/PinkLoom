# PinkLoom Development Roadmap & Phases

This document outlines the phased engineering milestones for PinkLoom.

---

## Phase 1: Technical & Aesthetic Foundation
**Status: `IMPLEMENTED`**

### Objectives
Establish a clean, modern, type-safe Next.js application foundation with the PinkLoom editorial design system, interactive lotus micro-physics, complete domain types, agent contracts, and database migrations.

### Delivered Deliverables
- [x] **Next.js & Tooling**: Next.js App Router (Turbopack/SWC), TypeScript strict mode, ESLint.
- [x] **Styling & Design Tokens**: Tailwind CSS v4, custom editorial CSS tokens (`#FBF9F6` ecru, `#141416` obsidian, `#E87A90` blush), Newsreader typography.
- [x] **Interactive Lotus Component**: `LotusInteraction.tsx` with organic wind-force calculations, multi-layer SVG petals, Motion spring return, and `prefers-reduced-motion` compliance.
- [x] **Typed Brand State**: `src/types/brand.ts` with comprehensive Zod schemas covering Discovery, Positioning, Shape, Visualize, Challenge, Consistency, and Deliver.
- [x] **Workflow Architecture**: `src/types/workflow.ts` and `src/types/agent.ts` defining stage progression, stage statuses, and `AgentRun` execution traces.
- [x] **Pluggable AI Interface**: `src/lib/ai/` provider interface (`LLMProvider`) and factory without vendor lock-in or fake AI responses.
- [x] **Agent Stubs & Registry**: `src/lib/agents/` registry and pipeline stage configurations for all 10 specialized agents.
- [x] **Database Migrations**: `supabase/migrations/001_initial_schema.sql` defining `projects`, `brand_states`, and `agent_runs`.
- [x] **Landing Page & Workspace Shell**: Minimal editorial landing page (`/`) and staged pipeline visualizer (`/workspace`).
- [x] **Documentation**: Full architectural, workflow, and state documentation.

---

## Phase 2: Discovery Engine
**Status: `IMPLEMENTED`**

### Objectives
Turn the PinkLoom foundation into a real agentic workflow with live LLM provider integration, strict runtime Zod validation, immutable BrandState updates, persistent AgentRun logging, and an interactive workspace UI.

### Delivered Deliverables
- [x] **Provider-Independent Real AI**: `src/lib/ai/provider.ts` integrating official Google GenAI (`@google/genai`) and OpenAI with automated bounded repair retries.
- [x] **Discovery Agent**: `src/lib/agents/discovery.ts` deconstructing raw ideas into problem space, target personas, user needs, constraints, assumptions, missing information, and clarifying questions.
- [x] **Dedicated Discovery Prompt**: `src/lib/agents/prompts/discovery.ts` with strict anti-branding guardrails.
- [x] **Zod Validation Schema**: `DiscoveryOutputSchema` in `src/types/brand.ts` validating all structured outputs before state application.
- [x] **BrandState Integration**: Immutably updates `BrandState.discovery` while preserving `rawIdea` and existing stage data.
- [x] **AgentRun Trace Logging**: Generates live execution traces with run ID, timestamps, duration in ms, and status transitions (`running` -> `completed` / `failed`).
- [x] **Server-Side Execution**: Both Server Route (`src/app/api/discovery/route.ts`) and Server Action (`src/lib/actions/discovery.ts`) protecting API keys.
- [x] **Supabase Repository Layer**: `src/lib/db/repository.ts` persisting to `projects`, `brand_states`, and `agent_runs` with graceful zero-config memory fallback.
- [x] **Live Discovery Workspace UI**: `src/app/workspace/page.tsx` with idea input, sample inspiration chips, progress states, structured findings display, and API key settings drawer.
- [x] **Comprehensive Test Suite**: `scripts/test-discovery.ts` with 22 automated assertions covering valid/invalid schemas, minimal/detailed/ambiguous ideas, missing API keys, and provider failures.

---

## Phase 3: Positioning Engine
**Status: `IMPLEMENTED`**

### Objectives
Build a real Positioning Agent that consumes the validated Discovery output from BrandState and produces a structured positioning strategy with category framing, differentiators, value proposition, competitive whitespace, and risk analysis.

### Delivered Deliverables
- [x] **Positioning Agent**: `src/lib/agents/positioning.ts` consuming validated `BrandState.discovery` context (problem, audience personas, needs, constraints, assumptions).
- [x] **Dedicated Positioning Prompt**: `src/lib/agents/prompts/positioning.ts` with strict anti-branding guardrails and reasoning mandates.
- [x] **Zod Validation Schema**: `PositioningOutputSchema` in `src/types/brand.ts` validating category, rationale, statement, differentiator, value prop, whitespace, alternatives, proof points, risks, and confidence.
- [x] **BrandState Integration**: Immutably updates `BrandState.positioning` while preserving `rawIdea`, `discovery`, and all subsequent stage structures.
- [x] **AgentRun Trace Logging**: Records execution traces with duration, timestamps, status transitions (`running` -> `completed` / `failed`), and input discovery summaries.
- [x] **Server-Side Execution**: Both Server Route (`src/app/api/positioning/route.ts`) and Server Action (`src/lib/actions/positioning.ts`) protecting API keys.
- [x] **Supabase Repository Layer**: Persists latest `brand_states` and `agent_runs` to Supabase with memory fallback.
- [x] **Stage Dependency Enforcement**: Rejects Positioning execution if Discovery is incomplete or unanalyzed.
- [x] **Interactive Positioning UI**: `src/app/workspace/page.tsx` with information flow indicators ("Built from Discovery"), category framing cards, differentiator wedges, whitespace lists, risk panels, and Phase 4 approval modal.
- [x] **Comprehensive Test Suite**: `scripts/test-positioning.ts` with 26 automated assertions bringing project test coverage to 48/48 tests passing.

---

## Phase 4: Shape (Personality, Naming, Voice) & Visual Identity
**Status: `PLANNED`**

### Objectives
Turn validated positioning and discovery foundations into tangible brand identity: personality archetypes, naming candidate directions with linguistic rationales, tone guidelines, and visual art direction.

### Planned Deliverables
- [ ] Implement `PersonalityAgent` (`src/lib/agents/personality.ts`).
- [ ] Implement `NamingAgent` (`src/lib/agents/naming.ts`).
- [ ] Implement `VoiceAgent` (`src/lib/agents/voice.ts`).
- [ ] Implement `VisualAgent` (`src/lib/agents/visual.ts`).
- [ ] Interactive candidate selection cards in `/workspace` feeding into the Critic Agent.

---

## Phase 3: Shape & Visual Agents
**Status: `PLANNED`**

### Objectives
Turn strategic positioning into tangible brand identity: personality archetypes, naming candidates, voice guidelines, and visual direction.

### Planned Deliverables
- [ ] Implement `PersonalityAgent` (archetypes, core operating principles).
- [ ] Implement `NamingAgent` (thematic candidate naming directions, etymology, and taglines).
- [ ] Implement `VoiceAgent` (tone guidelines, do's & don'ts, messaging hierarchy).
- [ ] Implement `VisualAgent` (cohesive color palette generation with WCAG contrast verification, typography pairing, logo concepts).
- [ ] Workspace interactive stage cards for naming selection and palette preview.

---

## Phase 4: Adversarial Critic & Consistency Loop
**Status: `PLANNED`**

### Objectives
Introduce the key differentiator of PinkLoom: adversarial critique and revision loops.

### Planned Deliverables
- [ ] Implement `CriticAgent`:
  - Scans for generic AI jargon and cliché tropes (e.g., "seamless", "next-gen", "elevate").
  - Identifies internal contradictions between target audience and chosen aesthetic.
- [ ] Implement `ConsistencyAgent`:
  - Cross-matrix scoring between positioning, tone of voice, and visual assets.
- [ ] Implement Orchestrator Revision Loop:
  - If critique severity is `critical` or consistency score < 70%, trigger automated refinement with specific critiques as feedback.

---

## Phase 5: Brand Kit Delivery & Export
**Status: `FUTURE`**

### Objectives
Synthesize the entire brand system into an exportable, investor- and designer-ready Brand Kit.

### Future Deliverables
- [ ] Implement `DeliveryAgent`:
  - Generates cohesive brand manifesto, elevator pitch, typography guidelines, CSS design token export, and logo SVG mockups.
- [ ] Export formats: Downloadable Brand Guidelines PDF, JSON design tokens, SVG logo marks.
- [ ] Sharable read-only public brand kit URLs.
