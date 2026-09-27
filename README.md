<p align="center">
  <img src="public/logo.png" alt="PinkLoom Logo" width="180">
</p>

<h1 align="center">PinkLoom 🪷</h1>

<p align="center">
  <strong>AI-Powered Brand Intelligence & Identity Engine</strong><br>
  <em>Transforming nascent concepts into launch-ready, battle-tested brand systems through an 8-stage adversarial agentic pipeline.</em>
</p>

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Lotus-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Zod](https://img.shields.io/badge/Validation-Zod_Strict-3E67B1?style=flat-square&logo=zod)](https://zod.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Why PinkLoom?](#-why-pinkloom)
- [Interactive 3D Lotus Ecosystem](#-interactive-3d-lotus-ecosystem)
- [The 8-Stage Agentic Pipeline](#-the-8-stage-agentic-pipeline)
- [System Architecture](#-system-architecture)
- [Pluggable AI Providers](#-pluggable-ai-providers)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Automated Test Suites](#-automated-test-suites)
- [Database Schema](#-database-schema)
- [License](#-license)

---

## ✨ Overview

**PinkLoom** replaces generic, single-prompt AI generation with an orchestrated, multi-agent brand intelligence pipeline. Instead of spitting out superficial logos and cliché marketing copy from a monolith prompt, PinkLoom deconstructs raw ideas across specialized domains: **Discovery**, **Positioning**, **Personality**, **Naming**, **Voice**, **Visual Identity**, **Adversarial Critique**, and **Consistency Auditing** — culminating in an authoritative, export-ready **Final Brand Kit**.

```
                           RAW FOUNDER IDEA
                                  │
                                  ▼
                         [01 · DISCOVERY]
                Problem Space · Personas · User Needs
                                  │
                                  ▼
                        [02 · POSITIONING]
             Category Framing · Value Prop · Whitespace
                                  │
                                  ▼
                          [03 · SHAPE]
          Archetype ──▶ Naming Candidates ──▶ Tone & Voice
         (Personality)      (Human Pick)        (Pillars)
                                  │
                                  ▼
                        [04 · VISUALIZE]
             Color Harmonies · Typography · Art Direction
                                  │
                                  ▼
                        [05 · CHALLENGE]
             Adversarial Critique (Anti-Cliché Engine)
                                  │
                                  ▼
                       [06 · CONSISTENCY]
             Cross-Matrix Holistic Alignment Scoring
                                  │
                                  ▼
                         [07 · DELIVER]
              Operational Synthesis & Launch Roadmap
                                  │
                                  ▼
                      [08 · FINAL BRAND KIT]
           Authoritative System · 11 Navigable Domains
```

---

## 💡 Why PinkLoom?

Most AI branding tools make three fatal mistakes:
1. **The Monolith Trap**: A single prompt attempts to generate name, colors, tone, and mission all at once, resulting in generic corporate clichés (*"seamless", "next-gen", "elevate"*).
2. **Lack of Validation & Memory**: Downstream decisions forget upstream constraints (e.g. choosing high-tech neon colors for an artisanal botanical soap brand).
3. **No Stress-Testing**: Traditional tools praise whatever they generate without critical friction.

### The PinkLoom Antidotes:
- **Strict Information Flow**: Downstream agents strictly consume validated, immutable state from upstream phases.
- **Human-in-the-Loop Naming**: The user hand-selects an authoritative name from generated linguistic territories before tone and visuals can be forged.
- **Adversarial Critique**: An adversarial critic agent detects AI buzzwords, identifies structural contradictions, and assigns severity ratings.
- **Holistic Alignment Matrix**: Quantitative scoring across Category-Archetype, Voice-Visual, and Audience-Differentiator pairings.
- **Editorial Organic Aesthetics**: Replaces typical cold dashboards with warm ecru canvas tones, editorial typography, and reactive physics.

---

## 🌸 Interactive 3D Lotus Ecosystem

The entry experience is anchored by a real-time procedural lotus pond powered by **Three.js** and **Motion for React**:
- **3D Water Surface & Interactive Ripples**: Dynamic raycasted water canvas reacting to cursor position and click impulses.
- **Multi-Layer Procedural Petals**: Mathematically curved organic geometry with ambient floating physics and subtle wind simulation.
- **Seamless Modal Transitions**: Petal click interactions open the authentication surface and idea incubation gateway without abrupt page redirects.
- **Motion Accessibility**: Fully respects `prefers-reduced-motion` operating system preferences.

---

## 🤖 The 8-Stage Agentic Pipeline

PinkLoom coordinates 10 specialized agent roles to build the brand identity:

| Stage | Primary Agent | Key Responsibilities | Deliverables |
| :--- | :--- | :--- | :--- |
| **01. Discovery** | `DiscoveryAgent` | Unpacks raw founder sparks into structured problem spaces, target audience personas, functional needs, constraints, and assumptions. | Problem statement, primary/secondary personas, core needs, boundary constraints, clarifying questions. |
| **02. Positioning** | `PositioningAgent` | Establishes strategic market angle, competitive category framing, and distinct value proposition. | Category frame, value proposition, competitive whitespace wedge, alternative comparisons, risk mitigations. |
| **03. Shape** | `PersonalityAgent` | Constructs the brand’s psychological archetype, operating virtues, and behavioral spectrum. | Jungian archetype, secondary nuance, brand virtues, tonal axis ratings (formal ↔ casual, reserved ↔ bold). |
| **04. Naming** | `NamingAgent` | Explores thematic linguistic territories and etymological roots with human-in-the-loop selection. | Thematic naming candidates, phonetic breakdown, domain availability heuristics, taglines, authoritative name lock. |
| **05. Voice** | `VoiceAgent` | Codifies communication principles, vocabulary rules, and messaging hierarchy. | Tone profile, vocabulary Do's & Don'ts, elevator pitch, core messaging hierarchy, brand mantras. |
| **06. Visualize** | `VisualAgent` | Translates brand soul into a mathematically cohesive design system. | Accessible color system (Primary, Secondary, Accent, Background), typography pairings, art direction rules, logo concepts. |
| **07. Challenge** | `CriticAgent` | Adversarial auditor scanning for buzzwords, internal contradictions, and feasibility flaws. | Anti-cliché warnings, contradiction alerts, tone-clash flags, constructive remediation feedback. |
| **08. Consistency** | `ConsistencyAgent` | Evaluates cross-dimensional alignment matrix scores across strategy, tone, and aesthetics. | Numeric consistency score (0–100%), matrix dimension scores, warning flags, alignment rationale. |
| **09. Deliver** | `DeliveryAgent` | Translates validated state into operational execution guidelines and checklists. | Launch checklist, brand manifesto, executive summary, social bio snippets, asset requirements. |
| **10. Brand Kit** | `FinalBrandKit` | Assembles all 9 upstream outputs into a unified authoritative brand kit interface. | 11 sub-navigation views, one-click copyable tokens, deduplicated warnings, re-assembly sync. |

---

## 🏛️ System Architecture

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Lotus Ecosystem Landing Experience
│   ├── workspace/page.tsx    # Staged Pipeline Visualizer & Execution Engine
│   ├── signin/page.tsx       # Auth Portal with Google OAuth & Guest Mode
│   ├── history/page.tsx      # Multi-project Brand State Archives
│   └── api/                  # Server-Side API Handlers (Discovery, Positioning, etc.)
├── components/
│   ├── lotus/                # Three.js 3D Scene, WaterCanvas, PetalSignInSurface
│   ├── workspace/            # WorkspaceView (Execution controls, stage progress)
│   ├── brand-kit/            # FinalBrandKitView (11-tab authoritative showcase)
│   ├── critic/               # CriticView (Adversarial critique visualizer)
│   └── ui/                   # Reusable UI primitives
├── lib/
│   ├── agents/               # 10 Specialized Agent implementations & prompts
│   │   ├── stages.ts         # Stage prerequisites, unlock guards & sequencer
│   │   ├── registry.ts       # Agent registry & dispatcher
│   │   └── prompts/          # Hardened system prompts with strict anti-cliché rules
│   ├── ai/                   # Provider-independent AI abstraction
│   │   ├── provider.ts       # Groq, Google Gemini, OpenAI implementations
│   │   └── types.ts          # LLMProvider, LLMMessage, StructuredLLMResponse
│   ├── auth/                 # Supabase Auth client & SSR helpers
│   ├── brand-kit/            # Final Brand Kit completeness validation & compiler
│   └── db/                   # Repository layer (Supabase PostgreSQL + Memory fallback)
└── types/
    ├── brand.ts              # Zod schemas & TypeScript types for all brand states
    ├── workflow.ts           # WorkflowStage and progression statuses
    └── agent.ts              # AgentRun execution trace logging model
```

---

## ⚡ Pluggable AI Providers

PinkLoom is engineered with a strict **provider-independent architecture** via `LLMProvider`. No vendor lock-in; switch models or providers simply via environment variables:

- 🚀 **Groq** (Default / Ultra-Fast): `openai/gpt-oss-120b`, `llama-3.3-70b-versatile`, etc.
- 💎 **Google Gemini** (`@google/genai`): `gemini-2.5-flash`, `gemini-1.5-pro`
- 🧠 **OpenAI**: `gpt-4o-mini`, `gpt-4o`
- 🛡️ **Automated Bounded Schema Repair**: If an LLM returns malformed JSON or omits a Zod-mandated key, the provider automatically invokes a targeted schema-repair prompt to ensure zero runtime crashes.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode enabled)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS Properties
- **3D Graphics & Physics**: [Three.js](https://threejs.org/) + [Motion for React](https://motion.dev/)
- **Validation**: [Zod v4](https://zod.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/ssr`, `@supabase/supabase-js`, PostgreSQL)
- **AI SDKs**: Official [`@google/genai`](https://www.npmjs.com/package/@google/genai) + Native Groq/OpenAI fetch clients
- **Icons**: [Lucide React](https://lucide.react.dev/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.18.0 or higher
- **npm**, **pnpm**, or **yarn**
- An API key for **Groq**, **Google Gemini**, or **OpenAI**
- *(Optional)* A [Supabase](https://supabase.com) project for cloud persistence and Google OAuth

### 1. Clone & Install

```bash
git clone https://github.com/sandippanchariya03/PinkLoom.git
cd PinkLoom
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your preferred AI provider:

```ini
# Supabase Configuration (Optional: in-memory fallback enabled if absent)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Provider Configuration ('groq' | 'gemini' | 'openai')
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key_here

# Alternatively:
# AI_PROVIDER=gemini
# GEMINI_API_KEY=your_gemini_api_key_here

# AI_PROVIDER=openai
# OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Configuration

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `AI_PROVIDER` | Active LLM provider (`groq`, `gemini`, `openai`) | `groq` |
| `GROQ_API_KEY` | API Key for Groq cloud inference | `gsk_...` |
| `GROQ_MODEL` | Custom Groq model ID | `openai/gpt-oss-120b` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GEMINI_MODEL` | Custom Gemini model ID | `gemini-2.5-flash` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-...` |
| `OPENAI_MODEL` | Custom OpenAI model ID | `gpt-4o-mini` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Client Key | `eyJ...` |

> [!NOTE]  
> If Supabase credentials are not provided, PinkLoom automatically falls back to an in-memory repository with local browser storage, allowing full offline experimentation!

---

## 🧪 Automated Test Suites

PinkLoom includes a rigorous, multi-tiered test suite powered by `tsx` validating schema conformance, agent prerequisite guards, API failure resilience, and auth security:

```bash
# Run all core test suites
npm run test

# Run individual stage test suites
npm run test:discovery          # Discovery Engine Zod validation & trace status
npm run test:positioning        # Positioning Agent & category framing
npm run test:personality        # Archetype & psychological profile generation
npm run test:naming             # Linguistic candidate generation & name lock
npm run test:voice              # Voice guidelines & tone profiles
npm run test:visual             # Color harmony, contrast checks & typography
npm run test:critic             # Adversarial critic & cliché detection
npm run test:critic-ui          # Pre-Phase 10 Critic UI test suite
npm run test:consistency       # Cross-matrix alignment calculations
npm run test:delivery           # Operationalization & launch checklist synthesis
npm run test:final-brand-kit    # Unified 11-tab Brand Kit assembly verification
npm run test:auth               # Supabase OAuth, redirect sanitization & route guards
```

---

## 🗄️ Database Schema

When connected to Supabase, PinkLoom persists data across three core PostgreSQL tables defined in `supabase/migrations/`:

- **`projects`**: Stores project ID, user ownership, original raw idea, and timestamps.
- **`brand_states`**: Versioned JSONB document containing the validated state across all 8 pipeline stages (`discovery`, `positioning`, `personality`, `naming`, `voice`, `visual_direction`, `critique`, `consistency`, `final_brand`).
- **`agent_runs`**: Complete execution audit trail recording `agent_name`, `stage`, input payloads, structured outputs, status transitions, duration in milliseconds, and critique diagnostics.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Crafted with intention by the <b>PinkLoom Team</b> · <i>Elevating brand creation through adversarial intelligence.</i>
</p>
