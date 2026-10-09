# FakeItTillYouScaleIt — system design practice platform

**Package manager**: pnpm@12.8.1 (workspace)

## Rules (every request)

- Read spec/docs first — no assumptions
- Write tests before code (TDD)
- Small, focused changes — one thing per edit
- Follow existing patterns in codebase
- Update docs when changing behavior

## Pointers (load as needed)

| Topic | File |
|-------|------|
| Code style / format | `.prettierrc` / `tsconfig.json` |
| Architecture (hexagonal) | `docs/bounded-contexts.md` |
| Domain model / glossary | `docs/GLOSSARY.md` |
| ADRs | `docs/ADR/` |
| Problem Catalog spec | `docs/SPEC-0001-problem-catalog.md` |
| Turborepo config | `turbo.json` |
| Workspace config | `pnpm-workspace.yaml` |

## Structure

```
apps/web          # Next.js frontend (empty)
packages/
  contracts       # Shared types/Zod schemas
  problem-catalog # Problem Catalog BC (core)
  shared          # Shared utilities
```