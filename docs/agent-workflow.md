# PinkLoom Agent Workflow & Pipeline Specification

## Workflow Philosophy

PinkLoom replaces single-turn prompt generation with a rigorous staged agentic system. In traditional AI tools, a single prompt produces generic, cliché brand kits. In PinkLoom, ideas undergo sequential deconstruction, positioning, shaping, visual translation, and adversarial critique before the final kit is minted.

```
USER IDEA
   ↓
[01 DISCOVER]   ──→ Uncovers core problem, target audience, user needs, and constraints.
   ↓
[02 POSITION]   ──→ Identifies category, differentiator, value prop, and market angle.
   ↓
[03 SHAPE]      ──→ Defines archetype, principles, naming candidates, and voice pillars.
   ↓
[04 VISUALIZE]  ──→ Translates brand soul into colors, typography, imagery, and logo concepts.
   ↓
[05 CHALLENGE]  ──→ Adversarial critique flagging generic clichés, contradictions, and weak spots.
   ↓
[06 REVISION]   ──→ Orchestrator loops back to refine flagged elements until criteria are met.
   ↓
[07 CONSISTENCY]──→ Cross-checks holistic alignment score across strategy, voice, and visuals.
   ↓
[08 DELIVER]    ──→ Generates the complete, launch-ready Brand Kit.
```

---

## The 10 Specialized Agents

| Agent Name | Primary Stage | Responsibility | Phase Status |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | Global | Manages state machine transitions, triggers revision loops, and verifies pipeline rules. | `IMPLEMENTED` (Architecture & Stub) / `PLANNED` (Phase 2 graph runner) |
| **Discovery** | `DISCOVER` | Unpacks raw idea into problem space, persona profiles, functional needs, and constraints. | `IMPLEMENTED` (Types & Stub) / `PLANNED` (Phase 2 prompt chain) |
| **Positioning** | `POSITION` | Establishes strategic market angle, competitive whitespace, and value proposition. | `IMPLEMENTED` (Types & Stub) / `PLANNED` (Phase 2 prompt chain) |
| **Personality** | `SHAPE` | Constructs psychological archetype, behavioral traits, and operating principles. | `IMPLEMENTED` (Types & Stub) / `PLANNED` (Phase 2 prompt chain) |
| **Naming** | `SHAPE` | Generates thematic naming buckets, linguistic rationales, and candidate taglines. | `IMPLEMENTED` (Types & Stub) / `PLANNED` (Phase 2 prompt chain) |
| **Voice** | `SHAPE` | Codifies tone guidelines, vocabulary do's and don'ts, elevator pitch, and core messaging. | `IMPLEMENTED` (Types & Stub) / `PLANNED` (Phase 2 prompt chain) |
| **Visual** | `VISUALIZE` | Develops color harmony tokens, typographic hierarchy, art direction, and logo direction. | `IMPLEMENTED` (Types & Stub) / `PLANNED` (Phase 2 prompt chain) |
| **Critic** | `CHALLENGE` | Stress-tests against mediocrity: detects generic AI buzzwords, inconsistencies, and vague promises. | `IMPLEMENTED` (Types & Stub) / `PLANNED` (Phase 2 prompt chain) |
| **Consistency** | `CONSISTENCY` | Evaluates cross-dimensional alignment scores (e.g., does the font fit the tone of voice?). | `IMPLEMENTED` (Types & Stub) / `PLANNED` (Phase 2 prompt chain) |
| **Delivery** | `DELIVER` | Synthesizes validated state into exportable Brand Kit guidelines and asset checklists. | `IMPLEMENTED` (Types & Stub) / `PLANNED` (Phase 2 prompt chain) |

---

## Agent Run Trace Logging

To clearly demonstrate the agentic workflow to users and hackathon judges, each agent action is recorded as an `AgentRun`:

```typescript
interface AgentRun {
  id: string;              // UUID
  projectId: string;       // Linked project
  agentName: AgentName;    // "Discovery" | "Critic" | etc.
  stage: WorkflowStage;    // "DISCOVER" | "CHALLENGE" | etc.
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  durationMs?: number;
  critiqueNotes?: string[];
}
```

### Stage Status Indicators
* `waiting`: Stage has not yet begun.
* `running`: Active agent is processing context.
* `completed`: Stage outputs validated and merged into `BrandState`.
* `failed`: Agent encountered validation error or rejected threshold.
