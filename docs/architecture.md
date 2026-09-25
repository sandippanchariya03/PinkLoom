# PinkLoom Architecture Specification

## Overview

PinkLoom is an AI-powered brand intelligence platform designed to transform rough ideas into launch-ready brand identities through a staged agentic workflow. Rather than relying on a single monolith prompt, PinkLoom breaks brand creation down into structured stages with adversarial critique, multi-agent validation, and iterative revision loops.

---

## Technical Stack

| Layer | Technology | Status |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Server Actions / Route Handlers) | `IMPLEMENTED` |
| **Language** | TypeScript (Strict mode enabled) | `IMPLEMENTED` |
| **Styling & Tokens** | Tailwind CSS v4 + Vanilla CSS Custom Properties | `IMPLEMENTED` |
| **Motion & Physics** | Motion for React (`motion`) | `IMPLEMENTED` |
| **Iconography** | Lucide React | `IMPLEMENTED` |
| **Validation** | Zod (Runtime validation for BrandState and AgentRuns) | `IMPLEMENTED` |
| **Persistence** | Supabase (PostgreSQL schema foundation) | `IMPLEMENTED` (client stub & migrations) |
| **Agent Framework** | Modular Agent Registry & State Machine (LangGraph adapter) | `PLANNED` (Phase 2) |
| **LLM Integrations** | Provider-independent adapter (`LLMProvider`) | `IMPLEMENTED` (interface & stub); live adapters `PLANNED` |

---

## Directory Organization

```
d:/PinkLoom/
├── docs/                     # Architectural and workflow documentation
│   ├── architecture.md
│   ├── agent-workflow.md
│   ├── brand-state.md
│   └── development-phases.md
├── supabase/
│   └── migrations/           # PostgreSQL DDL migrations
│       └── 001_initial_schema.sql
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Global editorial typography and root layout
│   │   ├── page.tsx          # Minimal editorial landing page with Lotus interaction
│   │   ├── workspace/
│   │   │   └── page.tsx      # Staged workflow visualizer shell
│   │   └── globals.css       # Design tokens and custom scrollbars
│   ├── components/
│   │   ├── motion/
│   │   │   └── LotusInteraction.tsx # Wind-responsive organic SVG lotus
│   │   └── ui/               # Reusable UI primitives
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── types.ts      # LLMProvider interfaces and generation options
│   │   │   └── provider.ts   # Provider factory and stub implementation
│   │   ├── agents/
│   │   │   ├── types.ts      # Agent contracts and results
│   │   │   ├── stages.ts     # Stage sequencing and prerequisite guards
│   │   │   └── registry.ts   # Typed stubs for all 10 specialized agents
│   │   ├── db/
│   │   │   └── supabase.ts   # Supabase client factory with graceful fallback
│   │   └── utils.ts          # Classname merger (clsx + tailwind-merge)
│   └── types/
│       ├── brand.ts          # Composite BrandState and Zod schemas
│       ├── workflow.ts       # WorkflowStage and progress tracking
│       └── agent.ts          # AgentRun trace logging model
├── .env.example              # Environment variables template
├── package.json
└── tsconfig.json
```

---

## Architectural Principles

1. **Information Flow Over Prompts (`IMPLEMENTED`)**: Information is deconstructed into a validated `BrandState` that evolves deterministically through pipeline stages.
2. **Provider Independence (`IMPLEMENTED`)**: The system does not lock into OpenAI or Google Gemini directly; all agent calls invoke an abstract `LLMProvider` contract.
3. **Traceability (`IMPLEMENTED`)**: Every agent execution produces an `AgentRun` trace recording stage, duration, inputs, outputs, and critique notes.
4. **Organic Aesthetics (`IMPLEMENTED`)**: Avoids generic chatbot aesthetics; focuses on editorial elegance, calm color palettes, and deliberate micro-physics.
5. **Accessibility (`IMPLEMENTED`)**: Every interactive animation respects `prefers-reduced-motion`.
