# 02: Domain Layer — Problem, Solution, Tradeoff, Topic, Author + ProblemCatalogService

**What to build:** Pure domain code for the Problem Catalog BC. All entities, value objects, domain services, and domain errors compile and pass unit tests. No framework dependencies, no I/O.

**Blocked by:** 01 (monorepo scaffold)

**Status:** ready-for-agent

- [ ] `Problem` entity with id, title, prompt, difficulty (Easy/Medium/Hard), status (Draft/Published/Archived), solutions[], topics[], relatedProblems[], author, timestamps
- [ ] `Solution` entity with id, name, description, diagram (Mermaid), tradeoffs[], topics[]
- [ ] `Tradeoff` value object with decision, advantage, disadvantage (all required, non-empty)
- [ ] `Topic` entity with name, slug (URL-friendly)
- [ ] `Author` entity with id, name, bio?
- [ ] Factory functions: `createProblem`, `createSolution`, `createTradeoff`, `createTopic`, `createAuthor`
- [ ] Business rule: Problem must have ≥1 topic; must have ≥1 solution to publish
- [ ] Business rule: Solution must have ≥1 tradeoff
- [ ] Domain service: `ProblemCatalogService` with `findProblemsBySolutionPattern`, `findProblemsByTopic`, `findProblemsByDifficulty`, `getAllTopics`, `findRelatedProblems`
- [ ] Domain errors: `ValidationError`, `ProblemNotFoundError`, `SolutionNotFoundError`, `EmptySolutionError`
- [ ] Unit tests for all factories (valid → ok, invalid → throws), business rules, and service functions