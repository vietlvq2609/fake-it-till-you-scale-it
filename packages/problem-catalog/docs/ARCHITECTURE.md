# Problem Catalog — Package Architecture

## Layer Structure (3-Layer Hexagonal)

```
src/
├── domain/           # Pure business logic — zero external deps
│   ├── entities/     # Aggregates, Entities (Problem, Solution)
│   ├── value-objects/# Value Objects (ProblemId, Difficulty, TopicSlug)
│   ├── services/     # Domain services (ProblemSearchService)
│   ├── repositories/ # Repository INTERFACES (IProblemRepository)
│   ├── events/       # Domain events (ProblemPublishedEvent)
│   └── errors/       # Domain errors (ProblemNotFoundError)
│
├── application/      # Use cases + ports — no framework deps
│   ├── use-cases/    # Use case classes (SearchProblemsUseCase)
│   ├── commands/     # Input types (SearchProblemsCommand)
│   ├── results/      # Output types (SearchProblemsResult)
│   └── ports/
│       └── outbound/ # Outbound ports (IFileStorage, IEventBus)
│
└── infrastructure/   # Concrete adapters (implements ports)
    ├── persistence/  # In-memory repo impl (InMemoryProblemRepository)
    ├── storage/      # In-memory file storage (InMemoryFileStorage)
    └── events/       # In-memory event bus (InMemoryEventBus)
```

## Dependency Rule

```
Application → Domain ← Infrastructure
    ↑              ↑
    └──────────────┘ (implements ports)
```

- Domain: **no imports** from application or infrastructure
- Application: imports domain only; defines ports (interfaces)
- Infrastructure: implements domain's repository interfaces + application's outbound ports

## Testing Strategy

| Layer | Approach |
|-------|----------|
| Domain | Unit test entities, VOs, domain services, domain rules — pure functions |
| Application | Unit test use cases with **fake** implementations of ports (in-memory maps) |
| Infrastructure | Integration test: verify in-memory adapters satisfy port contracts |

**No mocks** — use fakes with real behavior (in-memory collections that persist across calls).

## Current Scope (v1)

- Markdown files with YAML frontmatter as source of truth
- `InMemoryFileStorage` loads markdown at startup → parsed to domain objects
- `InMemoryProblemRepository` holds parsed aggregates in memory
- `InMemoryEventBus` collects domain events for assertions
- No HTTP, no database, no external services

## Adding Features

1. Define domain types in `domain/` (entities, VOs, repo interface)
2. Define use case + command/result in `application/use-cases/` + `commands/` + `results/`
3. Define outbound ports in `application/ports/outbound/` if needed
4. Write tests with fakes
5. Implement infrastructure adapters in `infrastructure/`

## Reference

- Shared vocabulary: `docs/GLOSSARY.md` (root)
- BC status: `docs/bounded-contexts.md` (root)
- Architecture decisions: `docs/ADR/` (root)