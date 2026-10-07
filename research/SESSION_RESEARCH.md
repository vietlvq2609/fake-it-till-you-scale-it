# FakeItTillYouScaleIt — Session Research & Context

**Date**: 2025  
**Session Goal**: Define a project idea for a junior software engineer seeking employment, focused on system design mastery and agentic workflow practice.

---

## 1. Engineer Profile & Constraints

| Aspect | Detail |
|--------|--------|
| **Current Level** | Junior software engineer, job-seeking |
| **Target Outcome** | Project impressive enough to secure a *better-than-junior* offer |
| **Core Learning Goals** | System design, software architecture (DDD, modular design, codebase structure), managing context for AI implementation |
| **Stack Philosophy** | TypeScript-only; frameworks/libraries are implementation details AI handles; engineer focuses on *architecture decisions* |
| **Domain Preference** | Agnostic — project must be broadly applicable, not niche |
| **Project Scope** | Open-source, backend-heavy, real utility (not a toy) |
| **Time/Deployment** | Deferred — focus on idea and architecture first |
| **Agentic Workflow** | Engineer designs; AI implements. Project should *also* showcase agentic patterns. |

---

## 2. Project Idea: System Design Practice Platform

### Core Concept
An **open-source, backend-heavy platform** where engineers practice system design by solving interactive prompts, receive AI-powered comparative evaluation and Socratic coaching, and build a portable design portfolio (ADRs + skill radar).

> "LeetCode for system design, but the platform *itself* is the architecture you're studying."

### Target Users
- Engineers preparing for system-design interviews (junior → staff)
- Self-taught developers wanting structured practice
- Engineering managers building internal interview prep
- Open-source contributors extending the problem catalog

### Why This Idea?
- **Impressive to hirers**: The platform *is* a distributed systems case study you can whiteboard from memory
- **Aligns with learning goals**: Building it forces mastery of event-driven, CQRS/ES, saga orchestration, idempotency, outbox pattern
- **Agentic workflow showcase**: Real AI agent orchestration (comparative generation, scoring, coaching) with saga-based reliability
- **Open-source viability**: Real utility → stars, contributors, community
- **Portfolio artifact**: Every completed design exports as ADR + diagram — tangible interview material

---

## 3. Key Product Requirements (from Grilling Rounds)

### Core Practice Format
- **Interactive system design problems** — structured canvas: Requirements → Constraints → High-Level Design → Component Deep-Dive → Trade-offs
- **AI evaluation engine** — three agents working in concert:
  1. **ComparativeAgent**: Generates 2–3 alternative architectures + trade-off matrix
  2. **ScoringAgent**: Rubric-based scores (scalability, reliability, cost, clarity, trade-off articulation) with evidence citations
  3. **CoachingAgent**: 3–5 Socratic follow-up questions per session (adaptive)
- **Output**: Evaluation report → persisted → feeds portfolio & skill radar

### Content Model
- **Curated core (10–20 gold-standard problems)** + **community contributions via PR**
- Problems include: reference solution, rubric, tags (scale, domain, pattern)
- AI-generated problems = v2 feature

### Portfolio & Progress Artifacts
1. **Design Portfolio** — Auto-generated ADR (Markdown + Mermaid diagram) per session; exportable PDF/Notion
2. **Skill Radar** — 8 dimensions: Scalability, Data Modeling, Consistency, Reliability, Cost, Security, Observability, Trade-off Reasoning
3. **Spaced-repetition flashcards** (v2) — auto-generated from weaknesses

### Open-Source Ambition
- **Real utility**, not just portfolio piece
- MIT license, RFC governance, semantic versioning
- Community problem submissions via PR workflow
- Live demo instance (free tier) post-launch

---

## 4. Architectural Direction (High-Level, Not Finalized)

> **Note**: Architecture not yet agreed — captured here as *directional intent* from discussion.

| Dimension | Leaning |
|-----------|---------|
| **Style** | Modular monolith → event-driven → CQRS + Event Sourcing |
| **Bounded Contexts** | Problem Catalog, Practice Session, Evaluation Engine, Portfolio & Progress, User Management |
| **Event Store** | EventStoreDB (purpose-built for ES, subscriptions, projections) |
| **Read Models** | PostgreSQL + Prisma (relational, type-safe) |
| **AI Orchestration** | Saga pattern with compensation (handles partial AI failures, retries, human fallback) |
| **Reliability Patterns** | Outbox pattern, idempotency keys, projection rebuilds, dead-letter queues |
| **Extensibility** | Plugin system for custom evaluators, exporters, auth providers |

---

## 5. Tech Stack Preferences (TypeScript-First)

| Layer | Preference |
|-------|------------|
| **Runtime** | Node.js 22 LTS + TypeScript 5.6 |
| **API** | Fastify + type-provider-typescript (schema-first) |
| **Event Store** | EventStoreDB |
| **Read DB** | PostgreSQL 16 + Prisma ORM |
| **Queue/Cache** | Redis 7 + BullMQ |
| **AI Gateway** | Adapter pattern: OpenAI / Anthropic / Ollama / LM Studio (local-first default) |
| **Auth** | Better Auth or Lucia |
| **Validation** | Zod (shared client/server schemas) |
| **Testing** | Vitest + Playwright + Testcontainers |
| **Observability** | OpenTelemetry + Prometheus + Grafana |
| **Diagrams** | Mermaid.js (server-side render for PDF) |
| **Monorepo** | Turborepo + pnpm workspaces |

---

## 6. System-Design Interview Stories This Project Enables

| Topic | Concrete Talking Point |
|-------|------------------------|
| Event Sourcing + CQRS | "Every practice session is an event stream. Rebuilt portfolio view from 10k events in <2s." |
| Saga / Orchestration | "AI evaluation is a 5-step saga with compensation. If coaching agent hallucinates, retry with stricter prompt." |
| Idempotency | "Double-click 'Submit Design' → deduplicated via `sessionId + designHash`." |
| Outbox Pattern | "Command handler writes event + outbox row in one PG transaction; relay publishes to EventStoreDB." |
| Projection Rebuilds | "Schema change in SkillRadarView? Replay 50k events in background, zero downtime." |
| AI Reliability | "Structured outputs + JSON schema validation + fallback model + human review queue." |
| Plugin Architecture | "Third-party evaluators register via manifest; sandboxed execution; capability-based permissions." |

---

## 7. Open Questions (Not Yet Decided)

1. **Exact problem catalog** — Which 15–20 problems for MVP?
2. **AI model strategy** — Local-only (Ollama) vs. cloud fallback vs. hybrid?
3. **UI scope** — Thin API-only + CLI first? Minimal React dashboard? Full web app?
4. **Monetization/SaaS path** — Pure OSS? Hosted tier? Enterprise features?
5. **Multi-tenancy** — v1 or v2?
6. **Real-time collaboration** — Pair practice, peer review — priority?

---

## 8. Next Steps (When Ready)

1. Initialize monorepo (`pnpm create turborepo@latest fake-it-till-you-scale-it`)
2. Scaffold `packages/contracts` (Zod schemas, event types)
3. Scaffold `packages/es-core` (aggregate base, ESDB client, saga orchestrator)
4. Spin infrastructure (`docker-compose.yml`: ESDB, PG, Redis, Ollama, Grafana)
5. Implement **Problem Catalog BC** first (command handlers + projections + API)
6. Seed 5 gold-standard problems with hand-written reference solutions + rubrics

---

## 9. Session Meta

- **Grilling rounds completed**: 3 (profile → idea category → specific product shape)
- **Key pivots**: 
  - Started with architecture-first → corrected to idea-first
  - Narrowed from "any developer tool" → "system design practice platform"
  - Named: **FakeItTillYouScaleIt** (user-chosen)
- **Architecture/design**: Explicitly *not* finalized — this research captures context only