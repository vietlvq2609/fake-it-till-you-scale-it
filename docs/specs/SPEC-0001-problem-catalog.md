# SPEC-0001: Problem Catalog Bounded Context

## Problem Statement

A junior software engineer preparing for system design interviews needs a structured way to study real-world system design problems. They want to:

- Browse a curated catalog of system design problems (e.g., "Design a URL shortener", "Design a chat application")
- For each problem, read the prompt, constraints, and scale expectations
- Study multiple reference solutions showing different architectural approaches
- Understand the trade-offs of each solution (not just "this is the answer" but "this approach chooses X over Y, gaining A but losing B")
- Filter problems by architectural pattern (e.g., "show me all problems with event sourcing solutions") and by difficulty
- Navigate to related problems to build a mental model of the design space

Currently, no open-source platform provides this. LeetCode focuses on algorithmic coding; system design resources are scattered across blogs, PDFs, and paid courses — none offer a structured, filterable catalog with explicit trade-off analysis.

## Solution

Build the **Problem Catalog** bounded context as the first deliverable of the FakeItTillYouScaleIt platform.

The Problem Catalog is a content management system for system design problems. It provides:

1. **Problems** — system design scenarios with prompts, constraints, and difficulty ratings
2. **Solutions** — multiple reference architectures per problem, each with a description, diagram (Mermaid), and explicit trade-offs
3. **Topics** — architectural labels (e.g., `event-sourcing`, `caching`, `sharding`) attached to both problems and solutions for filtering
4. **Relationships** — manual links between related problems
5. **Lifecycle** — Draft → Published → Archived workflow for community contributions

The catalog is **read-only for users** in v1. Community contributions enter as Draft via PR, get reviewed, then Published.

This BC is the foundation — all future BCs (Practice Session, Evaluation Engine, Portfolio & Progress) depend on it for content.

## User Stories

### Browsing & Discovery

1. As a **junior engineer**, I want to **see a list of all published problems**, so that I can choose what to study.
2. As a **junior engineer**, I want to **filter problems by difficulty (Easy/Medium/Hard)**, so that I can practice at my level.
3. As a **junior engineer**, I want to **filter problems by architectural topic** (e.g., "show me problems involving event sourcing"), so that I can study a specific pattern across different domains.
4. As a **junior engineer**, I want to **filter problems by solution pattern** (e.g., "show me problems that have a CQRS solution"), so that I can see how the same pattern applies to different problems.
5. As a **junior engineer**, I want to **see all available topics** with problem counts, so that I can discover what patterns exist in the catalog.

### Problem Detail

6. As a **junior engineer**, I want to **read a problem's full prompt and constraints**, so that I understand the scenario before studying solutions.
7. As a **junior engineer**, I want to **see all reference solutions for a problem**, so that I can compare different approaches.
8. As a **junior engineer**, I want to **read a solution's description and view its diagram**, so that I understand the architecture visually and conceptually.
9. As a **junior engineer**, I want to **read the trade-offs for each solution**, so that I learn *why* an architect would choose one approach over another.
10. As a **junior engineer**, I want to **see which topics a solution uses**, so that I can find other problems using the same pattern.

### Navigation & Learning Paths

11. As a **junior engineer**, I want to **see related problems from a problem page**, so that I can follow a learning path (e.g., URL shortener → Rate limiter → Analytics dashboard).
12. As a **junior engineer**, I want to **see the author of a problem**, so that I know who curated it.

### Content Management (Maintainer)

13. As a **maintainer**, I want to **create a new problem with prompt, difficulty, and topics**, so that I can seed the catalog.
14. As a **maintainer**, I want to **add multiple solutions to a problem**, so that I can show alternative architectures.
15. As a **maintainer**, I want to **add trade-offs to a solution**, so that the comparison value is captured.
16. As a **maintainer**, I want to **publish a problem** (Draft → Published), so that it becomes visible to users.
17. As a **maintainer**, I want to **archive a problem**, so that it's hidden but retained.
18. As a **maintainer**, I want to **link problems as related**, so that users can navigate between them.

### Community Contribution

19. As a **community contributor**, I want to **submit a new problem via PR**, so that I can extend the catalog.
20. As a **maintainer**, I want to **review community submissions before publishing**, so that quality is maintained.

## Implementation Decisions

### 1. Bounded Context Boundary

- **Problem Catalog** is a standalone BC. It does not depend on Practice Session, Evaluation Engine, Portfolio, or User Management.
- Other BCs will consume Problem Catalog data via its API or domain events (e.g., `ProblemPublished`).
- See ADR 0001 for the full decision record.

### 2. Architecture: Three-Layer Hexagonal (Ports & Adapters)

The BC uses a three-layer hexagonal architecture (no Presentation layer yet — API deferred):

| Layer | Responsibility | Key Types |
|-------|----------------|-----------|
| **Domain** | Pure business logic. Entities, value objects, domain services, domain events, repository interfaces, domain errors. Zero external dependencies. | `Problem`, `Solution`, `Tradeoff`, `Topic`, `Author`, `ProblemCatalogService`, `IProblemRepository`, `ITopicRepository`, `ProblemPublishedEvent` |
| **Application** | Use cases + port interfaces. Orchestrates domain objects. Defines outbound ports (file storage, event bus). No framework deps. | `SearchProblemsUseCase`, `GetProblemDetailUseCase`, `GetTopicsUseCase`, `SearchProblemsCommand`, `SearchProblemsResult`, `IFileStorage`, `IEventBus` |
| **Infrastructure** | Concrete adapters. Implements repository interfaces and outbound ports. Filesystem repo, markdown parser, filesystem storage, in-memory event bus. | `FilesystemProblemRepository`, `MarkdownProblemParser`, `FileSystemStorage`, `InMemoryEventBus` |

**Port interfaces (Application → Infrastructure):**
- `IFileStorage` — outbound port for reading/writing markdown files
- `IEventBus` — outbound port for publishing integration events

**Repository interfaces (Domain → Infrastructure):**
- `IProblemRepository` — domain-owned contract for Problem aggregate persistence
- `ITopicRepository` — domain-owned contract for Topic persistence

**v1 Implementation**: Filesystem-based storage for problem content (markdown files in `content/problems/`). `FileSystemStorage` reads files; `MarkdownProblemParser` parses to domain objects; `FilesystemProblemRepository` implements `IProblemRepository`. Event bus is in-memory (`InMemoryEventBus`). No database, no HTTP.

### 3. Domain Model (Ubiquitous Language)

From `docs/GLOSSARY.md`:

| Concept | Key Properties | Business Rules |
|---------|----------------|----------------|
| **Problem** | id, title, prompt, difficulty (Easy/Medium/Hard), status (Draft/Published/Archived), solutions[], topics[], relatedProblems[], author, createdAt, updatedAt | Must have ≥1 topic. Must have ≥1 solution to publish. |
| **Solution** | id, name, description, diagram (Mermaid), tradeoffs[], topics[] | Must have ≥1 tradeoff. Belongs to exactly one Problem. |
| **Tradeoff** | decision, advantage, disadvantage | All three fields required, non-empty. |
| **Topic** | name, slug (URL-friendly) | Single concept for both categories and tags. |
| **Author** | id, name, bio? | Attribution only. |

**Search behaviors (from `ProblemCatalogService`):**
- `findProblemsBySolutionPattern(problems, topicSlug)` — primary filter: problems with a solution using a pattern
- `findProblemsByTopic(problems, topicSlug)` — problems tagged with topic (problem-level or solution-level)
- `findProblemsByDifficulty(problems, difficulty)` — published problems at a difficulty
- `getAllTopics(problems)` — unique topics across all problems and solutions

### 4. Storage: Markdown Files with YAML Frontmatter (v1)

- Problems stored as `.md` files in `content/problems/`
- Frontmatter holds metadata (title, difficulty, topics, status, author)
- Body holds prompt, constraints, solutions (with diagrams and trade-offs), related problems
- Parser: `MarkdownProblemParser` reads directory at startup, produces `Problem` aggregates
- `FileSystemStorage` reads markdown files from disk
- `FilesystemProblemRepository` implements `IProblemRepository` using parsed aggregates
- Rationale: Fastest to demo, git-friendly, natural for PR-based contributions, no DB needed yet

**Example format:**
```markdown
---
title: "Design a URL Shortener"
difficulty: "Medium"
topics: ["distributed-systems", "caching", "database-sharding"]
status: "published"
author: "your-name"
---

## Prompt
...

## Constraints
...

## Solutions

### Solution 1: Single-Region SQL with Read Replicas
...description...

```mermaid
graph TD ...
```

#### Trade-offs
- **Decision**: Use a single PostgreSQL cluster with read replicas.
  - **Advantage**: Simple, strong consistency.
  - **Disadvantage**: Single region limits global latency.

### Solution 2: Multi-Region KV Store with Caching
...

## Related Problems
- [Design a Distributed Rate Limiter](./rate-limiter.md)

### 5. API Contract (REST) — **Deferred**

No Presentation layer in v1. REST API will be added when a consumer (web UI, CLI, or external integration) needs it. Endpoints will follow the domain model (list, get detail, topics, create, publish, add solution, add related).

### 6. Domain Events

- `ProblemPublished` — fired when a problem transitions to Published
  - Payload: `{ type: "ProblemPublished", problemId, title, difficulty, topics[], publishedAt }`
  - Future BCs (Practice Session, Portfolio) will subscribe to this

### 7. Technology Choices (from research)

- Runtime: Node.js 22 LTS + TypeScript 5.6
- Validation: Zod (shared schemas in `packages/contracts`)
- Testing: Vitest
- Monorepo: Turborepo + pnpm workspaces

**Deferred technology decisions** (to be made per BC when needed):
- HTTP framework (Fastify, Hono, Express, etc.)
- Database (PostgreSQL, SQLite, etc.)
- Message bus (Kafka, NATS, in-memory, etc.)
- Search index (Meilisearch, PostgreSQL full-text, etc.)

### 8. Package Structure

```
packages/
  problem-catalog/     # This BC
    src/
      domain/
        entities/
        value-objects/
        services/
        repositories/
        events/
        errors/
      application/
        use-cases/
        commands/
        results/
        ports/
          outbound/
      infrastructure/
        persistence/     # FilesystemProblemRepository
        storage/         # FileSystemStorage, MarkdownProblemParser
        events/          # InMemoryEventBus
      docs/              # Package-specific docs
        ARCHITECTURE.md
  contracts/           # Shared Zod schemas (ProblemSchema, etc.)
  shared/              # Cross-cutting (Result type)
```

### 9. Seams for Testing

**Primary seam: `IProblemRepository`** (domain repository interface)

All use cases depend on this. Tests provide `InMemoryProblemRepository` fake (in-memory implementation of the interface).

**Secondary seam: `IFileStorage`** (application outbound port)

Tests provide `InMemoryFileStorage` fake.

**Tertiary seam: `IEventBus`** (application outbound port)

Tests provide `InMemoryEventBus` fake to assert domain events published.

**No mocks** — all fakes are in-memory implementations with real behavior (maps/arrays that persist across calls).

**Note**: Production uses `FilesystemProblemRepository` + `FileSystemStorage`; tests swap in in-memory fakes for speed and isolation.

## Testing Decisions

### What Makes a Good Test

- Test **external behavior** (use case inputs → outputs, domain rule enforcement)
- Do **not** test implementation details (private methods, internal structure)
- Use **fake implementations** of ports, not mocks — fakes have real behavior (e.g., in-memory map)
- Domain layer: test business rules (e.g., "cannot publish problem with zero solutions")
- Application layer: test use case orchestration (e.g., "publish fires domain event")

### Modules to Test

| Module | Test Approach |
|--------|---------------|
| `Problem` / `Solution` / `Tradeoff` factories | Unit: invalid inputs throw; valid inputs produce correct objects |
| `ProblemCatalogService` | Unit: pure function inputs → outputs (search, filter, topic extraction) |
| `CreateProblemUseCase` | Unit: repository.save called with correct Problem |
| `PublishProblemUseCase` | Unit: validates solutions exist; updates status; fires event |
| `SearchProblemsUseCase` | Unit: delegates to service; returns correct shape |
| `FilesystemProblemRepository` | Integration: reads actual markdown files from test fixtures |
| `MarkdownProblemParser` | Unit: parses frontmatter + body into Problem aggregate |
| `FileSystemStorage` | Unit: reads markdown files from disk |
| `InMemoryEventBus` | Unit: implements IEventBus contract correctly |
| `InMemoryProblemRepository` (test fake) | Unit: implements IProblemRepository contract correctly |
| `InMemoryFileStorage` (test fake) | Unit: implements IFileStorage contract correctly |

### Prior Art

- This is the first BC — no prior tests exist yet
- Pattern: pure domain functions + use cases with fake ports (standard hexagonal testing)

## Out of Scope

The following are **explicitly not** part of this spec — they belong to deferred BCs:

- **Practice Session** — user workflow for drafting/submitting designs, iterative revisions, evaluation triggering
- **Evaluation Engine** — AI-powered comparative analysis, rubric scoring, Socratic coaching
- **Portfolio & Progress** — ADR generation, skill radar, flashcards, progress tracking
- **User Management** — authentication, profiles, preferences, authorization
- **Community review UI** — in-app PR review; v1 uses GitHub PRs
- **Search index** — Meilisearch/PostgreSQL full-text; v1 uses in-memory filtering
- **Real-time features** — collaboration, live updates
- **Multi-tenancy** — organizations, teams, private catalogs
- **Database** — PostgreSQL; v1 is filesystem-based
- **Admin dashboard** — maintainer UI; v1 has no API (direct markdown/TypeScript constants)

## Further Notes

### Seed Data

The catalog should launch with **5 gold-standard problems** covering different patterns:

1. URL Shortener (caching, sharding, read replicas)
2. Distributed Rate Limiter (sliding window, token bucket, Redis)
3. Chat Application (WebSocket, pub/sub, message ordering)
4. Feed System (fan-out, timeline, pagination)
5. Link Analytics Dashboard (event streaming, OLAP, materialized views)

Each problem: 2–3 solutions with 2–3 trade-offs each. Hand-written by maintainers.

### Future Migration Path

When Practice Session BC is built:
1. Add a database (e.g., PostgreSQL) and ORM for Problem persistence
2. Implement `DatabaseProblemRepository` implementing `IProblemRepository`
3. Keep domain/application unchanged — swap adapter only
4. Add search index (Meilisearch, database full-text, etc.)
5. `ProblemPublished` event consumed by Practice Session to hydrate problem snapshots

**From v1 filesystem → v2 database**: Replace `FilesystemProblemRepository` + `FileSystemStorage` with `DatabaseProblemRepository`. Domain & Application layers untouched. Markdown files can remain as migration source or be imported to DB.

### Open Questions (for future sessions)

- Should community contributions allow alternative solutions for existing problems?
- Should topics be hierarchical? (e.g., `distributed-systems/event-sourcing`)
- Should solutions have versions? (v1: no)
- How to handle problem updates that break existing Practice Sessions? (event-sourced snapshots)

---

**Labels**: `ready-for-agent`, `bc:problem-catalog`, `phase:1`