# FakeItTillYouScaleIt — system design practice platform

**Package manager**: pnpm@12.8.1 | **TypeScript**: 7.0.2

## Rules (every request)
- Read spec/docs first — no assumptions
- TDD: write tests before code
- One focused change per edit
- Follow existing patterns
- Update docs when behavior changes
- **Gatekeeper exports**: Bounded context packages export ONLY contracts (domain layer: entities, value objects, services, repository interfaces, events, errors) and entry abstractions (application layer: use cases, port interfaces). Infrastructure implementations are NEVER exported
- **Path aliases**: Use `@fake-it/<bc>/domain` or `@fake-it/<bc>/application` from root tsconfig.json. No relative imports across package boundaries

## Pointers
- Style/format: `.prettierrc` / `tsconfig.json`
- Architecture: `ARCHITECTURE.md`
- BC status: `docs/bounded-contexts.md`
- Glossary: `docs/GLOSSARY.md`
- ADRs: `docs/ADR/`
- Specs: `docs/specs/`
- Turborepo: `turbo.json`
- Workspace: `pnpm-workspace.yaml`

<!-- BEGIN:turborepo-agent-rules -->
# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the turbo package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run node -p "require.resolve('turbo/package.json')" from a workspace that depends on turbo.

Read docs/README.md inside that installed package first, then read the relevant pages from its docs/ directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by turbo before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in crates/turborepo-cli/src/cli/agent_guidance.rs. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set "agentGuidance": false in the root turbo.json or turbo.jsonc to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
