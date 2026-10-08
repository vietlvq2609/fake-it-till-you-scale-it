# 01: Monorepo Scaffold + Shared Packages

**What to build:** A working Turborepo + pnpm monorepo with three packages: `contracts` (shared Zod schemas), `shared` (Result type), and `problem-catalog` (empty scaffold with tsconfig). Running `pnpm install` and `pnpm build` succeeds. Turbo pipeline caches builds.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `pnpm-workspace.yaml` defines three packages
- [ ] Root `package.json` with turbo, typescript, vitest devDependencies
- [ ] `turbo.json` with build/test/lint pipeline
- [ ] `packages/contracts/package.json` + `tsconfig.json` + exports Zod schemas
- [ ] `packages/shared/package.json` + `tsconfig.json` + exports `Result` type
- [ ] `packages/problem-catalog/package.json` + `tsconfig.json` + empty src/
- [ ] `pnpm install` works; `pnpm build` compiles all packages
- [ ] GitHub Actions workflow runs `pnpm build` + `pnpm test`