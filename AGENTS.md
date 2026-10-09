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

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
