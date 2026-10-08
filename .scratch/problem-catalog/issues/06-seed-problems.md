# 06: Seed 5 Gold-Standard Problems

**What to build:** Five hand-written markdown problem files in `content/problems/`. Each has prompt, constraints, 2–3 solutions with Mermaid diagrams and trade-offs, topics, related links. All appear in the API.

**Blocked by:** 04 (filesystem repository + parser)

**Status:** ready-for-agent

- [ ] `content/problems/url-shortener.md` — caching, sharding, read replicas
- [ ] `content/problems/distributed-rate-limiter.md` — sliding window, token bucket, Redis
- [ ] `content/problems/chat-application.md` — WebSocket, pub/sub, message ordering
- [ ] `content/problems/feed-system.md` — fan-out, timeline, pagination
- [ ] `content/problems/link-analytics.md` — event streaming, OLAP, materialized views
- [ ] Each problem: difficulty set (Easy/Medium/Hard), status: published, author, 3+ topics
- [ ] Each problem: 2–3 solutions with unique names, Mermaid diagrams, 2–3 tradeoffs each
- [ ] Related problems linked (e.g., url-shortener ↔ rate-limiter ↔ link-analytics)
- [ ] API returns all 5 via `GET /problems`; each accessible via `GET /problems/:id`
- [ ] Topics list includes all tags with correct counts