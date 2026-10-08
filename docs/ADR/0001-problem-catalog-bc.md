# ADR 0001: Problem Catalog as the First Bounded Context

## Status
Accepted

## Context

We are building a system design practice platform. The platform will eventually have multiple bounded contexts: Problem Catalog, Practice Session, Evaluation Engine, Portfolio & Progress, and User Management.

For the first version, we need to pick one BC to build and ship. The Problem Catalog is the natural choice because:

1. It is the foundation — all other BCs depend on it for content.
2. It is demoable immediately — users can browse problems and read reference solutions.
3. It has no AI, no event sourcing, no saga complexity. It is pure content management.
4. It validates the architecture pattern (hexagonal, modular monolith) before we add distributed systems complexity.

## Decision

We will build the **Problem Catalog** bounded context first.

### Scope

In scope:
- Manage the library of system design problems
- Each problem has a prompt, difficulty, topics, and one or more reference solutions
- Each solution has a description, diagram, and trade-offs
- Problems have a lifecycle: Draft → Published → Archived
- Community contributions enter as Draft, get reviewed, then Published
- Problems can link to related problems (manual curation)

Out of scope (deferred to later BCs):
- User practice sessions (Practice Session BC)
- AI evaluation of submissions (Evaluation Engine BC)
- Portfolio and progress tracking (Portfolio & Progress BC)
- User authentication and profiles (User Management BC)

### Architecture

The Problem Catalog BC will use a **hexagonal (ports & adapters)** architecture:

- `domain/` — pure business logic. Entities, value objects, domain services, domain errors. No framework dependencies, no I/O.
- `application/` — use cases and port interfaces. Inbound ports (repository interfaces) and outbound ports (file storage, etc.).
- `infrastructure/` — concrete adapters. Filesystem-based problem repository, markdown parser, REST API server.

This pattern was chosen because:
- The domain layer is testable without mocking frameworks or databases.
- Ports make it trivial to swap the filesystem adapter for a database adapter later.
- Each BC is self-contained and can evolve independently.

### Storage

For v1, problems are stored as **markdown files with YAML frontmatter** in a `content/problems/` directory.

A `MarkdownProblemParser` reads these files at startup and produces domain `Problem` objects.

This was chosen over a database because:
- It is the fastest path to a working demo.
- It is human-readable and version-controllable via git.
- It is the natural format for community contributions via PR.
- We can add PostgreSQL later without changing the domain model.

## Consequences

### Positive
- A working demo is achievable in days, not weeks.
- The domain model is validated before we add distributed systems complexity.
- The hexagonal pattern is proven on a simple BC before we apply it to event-sourced BCs.
- Content is git-friendly, which supports the open-source contribution model.

### Negative / Trade-offs
- File-based storage does not scale to thousands of problems without a search index.
- There is no database transaction boundary — consistency is file-system-level.
- We will need to refactor the repository interface when we add PostgreSQL.

### Follow-ups
- When Practice Session BC is built, we add PostgreSQL + EventStoreDB.
- We add a search index (e.g., Meilisearch or PostgreSQL full-text search) when the catalog grows.
- We evaluate whether community contributions need a PR-based workflow or an in-app submission form.