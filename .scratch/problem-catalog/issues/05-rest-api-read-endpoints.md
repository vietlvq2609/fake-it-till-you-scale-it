# 05: REST API — Read Endpoints (GET /problems, GET /problems/:id, GET /topics)

**What to build:** Fastify HTTP server exposing read endpoints. Manual curl test works: list problems with filters, get full problem detail, list topics.

**Blocked by:** 03 (read use cases), 04 (filesystem repository)

**Status:** ready-for-agent

- [ ] Fastify server with type-provider-typescript for schema validation
- [ ] `GET /problems` — query params: `topic`, `difficulty`, `solutionPattern`; returns paginated list of published problems
- [ ] `GET /problems/:id` — returns full Problem with solutions, diagrams, tradeoffs, related problems
- [ ] `GET /topics` — returns all topics with problem counts
- [ ] Error responses: 404 for not found, 400 for invalid query, 500 for internal errors
- [ ] Request/response schemas in `packages/contracts` (Zod)
- [ ] Manual test: `curl localhost:3000/problems`, `curl localhost:3000/problems/url-shortener`, `curl localhost:3000/topics`
- [ ] Server starts on `PORT` env (default 3000)