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

## Phase 2: Discovery & Positioning Agents
**Status: `PLANNED`**

### Objectives
Implement live LLM provider integration and construct the first two autonomous pipeline stages: Discovery and Positioning.

### Planned Deliverables
- [ ] Connect live LLM provider (Google Gemini API adapter or OpenAI adapter).
- [ ] Implement `DiscoveryAgent`:
  - Structured extraction of problem space, target audience personas, and implicit constraints.
  - Identification of knowledge gaps in the user's raw idea.
- [ ] Implement `PositioningAgent`:
  - Category definition and whitespace identification.
  - Value proposition and differentiator formulation.
- [ ] Connect Next.js Server Actions to persist stage results into `brand_states` and log `agent_runs`.
- [ ] Interactive user feedback step: allow founder to edit or approve Discovery/Positioning findings.

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
