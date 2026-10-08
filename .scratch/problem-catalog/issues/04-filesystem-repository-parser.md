# 04: Infrastructure — Filesystem Repository + Markdown Parser

**What to build:** Concrete adapters for file-based persistence. `FilesystemProblemRepository` implements `IProblemCatalogRepository` reading from `content/problems/`. `MarkdownProblemParser` parses `.md` files with YAML frontmatter into `Problem` aggregates. Integration tests pass with test fixtures.

**Blocked by:** 02 (domain layer), 03 (port interfaces)

**Status:** ready-for-agent

- [ ] `MarkdownProblemParser` reads frontmatter (title, difficulty, topics, status, author) and body (prompt, constraints, solutions with diagrams + tradeoffs, related problems)
- [ ] Parser produces valid `Problem` aggregate with all nested `Solution` + `Tradeoff` + `Topic` objects
- [ ] `FilesystemProblemRepository` implements all `IProblemCatalogRepository` methods by reading parsed problems
- [ ] Repository caches parsed problems in memory after first load; `findPublished` filters by status
- [ ] Search methods (`findBySolutionTopic`, `findByTopic`, `findByDifficulty`) delegate to `ProblemCatalogService`
- [ ] `save`/`update`/`writeFile` throw "not implemented" for v1 (read-only catalog)
- [ ] Integration tests: test fixtures in `content/problems/__fixtures__/` with 2–3 problems; verify parser + repository return correct domain objects
- [ ] Handles missing files, malformed frontmatter, invalid content gracefully