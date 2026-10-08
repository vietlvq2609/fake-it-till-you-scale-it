# 08: E2E Test Suite + CI Pipeline

**What to build:** Complete test coverage and CI pipeline. All unit, integration, and E2E tests pass. `pnpm test` runs green locally and in GitHub Actions.

**Blocked by:** 05 (read API), 06 (seed problems), 07 (write API)

**Status:** ready-for-agent

- [ ] Unit tests: domain factories, business rules, ProblemCatalogService (pure functions)
- [ ] Unit tests: application use cases with fake repository
- [ ] Integration tests: MarkdownProblemParser with fixtures, FilesystemProblemRepository with test content
- [ ] E2E tests: supertest or Playwright against running Fastify server
  - [ ] GET /problems with all filter combinations
  - [ ] GET /problems/:id returns full detail
  - [ ] GET /topics returns counts
  - [ ] POST /problems → publish → add solution → add related
  - [ ] Error cases: 404, 400 validation
- [ ] GitHub Actions workflow: install → build → test
- [ ] Coverage threshold: ≥80% lines for domain + application
- [ ] `pnpm test` completes in <60s locally