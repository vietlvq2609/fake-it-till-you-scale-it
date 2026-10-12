# Architecture Overview

## Monorepo Structure

```
fake-it-till-you-scale-it/
├── apps/                    # Deployable applications (empty for now)
├── packages/
│   ├── problem-catalog/     # Bounded Context: Problem Catalog
│   ├── contracts/           # Shared Zod schemas / types
│   └── shared/              # Cross-cutting utilities (Result, etc.)
├── docs/                    # Shared knowledge across BCs
│   ├── bounded-contexts.md  # BC status & dependencies
│   ├── GLOSSARY.md          # Ubiquitous language
│   └── ADR/                 # Architecture Decision Records
└── research/                # Exploration notes (not binding)
```

## Principles

- **Each package = one Bounded Context** with its own `docs/ARCHITECTURE.md`
- **Packages are independent** — no direct imports between BC packages; communicate via contracts or events
- **Business logic first** — framework, database, HTTP are infrastructure details added later
- **In-memory fakes** for testing — no external dependencies in domain/application tests

## Finding Package Architecture

For any package `packages/<name>/`, its internal architecture is documented at:
```
packages/<name>/docs/ARCHITECTURE.md
```

Start there when working inside a BC.