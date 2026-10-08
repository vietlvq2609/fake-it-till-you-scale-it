# 03: Application Layer — Read Use Cases + Port Interfaces

**What to build:** Application layer for read operations. Use cases orchestrate domain objects via port interfaces. All tests pass with fake in-memory repository.

**Blocked by:** 02 (domain layer)

**Status:** ready-for-agent

- [ ] Port: `IProblemCatalogRepository` with `findAll`, `findById`, `findPublished`, `findByDifficulty`, `findBySolutionTopic`, `findByTopic`, `save`, `update`, `delete`
- [ ] Port: `IFileStorage` with `readDirectory`, `readFile`, `writeFile`, `fileExists`
- [ ] Use case: `SearchProblemsUseCase` — delegates to `ProblemCatalogService`, returns `{ problems, total }`
- [ ] Use case: `GetProblemDetailUseCase` — returns single Problem or not-found error
- [ ] Use case: `GetTopicsUseCase` — returns all unique topics with counts
- [ ] Domain event: `ProblemPublished` with payload (problemId, title, difficulty, topics[], publishedAt)
- [ ] Fake in-memory repository implementation for testing
- [ ] Unit tests: each use case tested with fake repo; verify delegation, error handling, output shape