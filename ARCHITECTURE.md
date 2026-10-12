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
│   ├── GLOSSARY.md          # Cross-BC ubiquitous language
│   ├── ADR/                 # Architecture Decision Records
│   └── specs/               # BC specifications (one per BC)
└── research/                # Exploration notes (not binding)
```

## Principles

- **Each package = one Bounded Context** with its own `docs/ARCHITECTURE.md` (optional for shared packages like contracts/shared)
- **Packages are independent** — no direct imports between BC packages; communicate via contracts or events
- **Business logic first** — framework, database, HTTP are infrastructure details added later
- **In-memory fakes** for testing — no external dependencies in domain/application tests

## Finding Package Architecture

For any BC package `packages/<name>/`, its internal architecture is documented at:
```
packages/<name>/docs/ARCHITECTURE.md
```

Start there when working inside a BC.

## Finding BC Specifications

Each BC has a specification in `docs/specs/SPEC-<NNN>-<name>.md` defining scope, user stories, domain model, and implementation decisions.

## Finding BC-Specific Glossary

Each BC has its own glossary at:
```
packages/<name>/docs/GLOSSARY.md
```

Cross-BC terms are in `docs/GLOSSARY.md` (root).