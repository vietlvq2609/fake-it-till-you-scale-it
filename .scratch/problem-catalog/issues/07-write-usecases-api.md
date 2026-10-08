# 07: Write Use Cases + POST Endpoints (Maintainer Workflow)

**What to build:** Application layer for write operations and corresponding REST endpoints. Maintainers can create problems, publish them, add solutions, and link related problems via API. `ProblemPublished` domain event is logged.

**Blocked by:** 03 (read use cases + ports), 04 (repository interface)

**Status:** ready-for-agent

- [ ] Use case: `CreateProblemUseCase` — creates Problem in Draft status, saves via repository
- [ ] Use case: `PublishProblemUseCase` — validates ≥1 solution, transitions to Published, fires `ProblemPublished` event
- [ ] Use case: `AddSolutionUseCase` — adds Solution to existing Problem
- [ ] Use case: `AddRelatedProblemUseCase` — adds bidirectional related link
- [ ] Domain event: `ProblemPublished` logged to console (future: event bus)
- [ ] `POST /problems` — create problem (Draft), returns created Problem
- [ ] `POST /problems/:id/publish` — publish problem, returns updated Problem
- [ ] `POST /problems/:id/solutions` — add solution, returns updated Problem
- [ ] `POST /problems/:id/related` — add related problem, returns updated Problem
- [ ] Request schemas in `packages/contracts` (Zod)
- [ ] Error handling: 404 not found, 400 validation (e.g., publish without solutions)
- [ ] Manual test: create → publish → add solution → verify via GET endpoints