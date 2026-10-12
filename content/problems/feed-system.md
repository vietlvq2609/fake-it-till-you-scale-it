---
id: "feed-system"
title: "Design a Feed System"
prompt: "Design a social media feed system (like Twitter/Instagram timeline). Users follow other users. When a user posts, the post appears in followers' timelines. Support: chronological and algorithmic ranking, infinite scroll pagination, \"while you were away\" summaries, and real-time updates."
difficulty: "Hard"
status: "Published"
topics: ["fan-out", "timeline", "pagination", "ranking", "caching", "event-sourcing"]
solutions:
  - id: "sol-1"
    name: "Fan-out on Write (Push Model)"
    description: "On post creation, push post ID to all followers' timeline Redis lists/sorted sets. Timeline read = fetch from user's precomputed timeline."
    diagram: "graph TD\n    User[User Posts] --> API[Post API]\n    API --> Fanout[Fan-out Service]\n    Fanout --> Redis1[(Redis: User 1 Timeline)]\n    Fanout --> Redis2[(Redis: User 2 Timeline)]\n    Fanout --> RedisN[(Redis: User N Timeline)]"
    tradeoffs:
      - decision: "Fan-out on write for most users"
        advantage: "Fast reads (O(1) list access); real-time updates natural; simple read path."
        disadvantage: "Write amplification (500 writes per post); storage amplification; slow for high-fanout users."
      - decision: "Hybrid pull for celebrities (>1M followers)"
        advantage: "Avoids massive write fan-out; reduces storage."
        disadvantage: "Read path complexity (merge); slight staleness for celebrity posts."
    topics: ["fan-out", "redis", "caching"]
author:
  id: "author-1"
  name: "System Design Team"
  bio: "Core maintainers of FakeItTillYouScaleIt"
createdAt: "2024-02-10T10:00:00Z"
updatedAt: "2024-02-10T10:00:00Z"
---

## Prompt

Design a social media feed system (like Twitter/Instagram timeline). Users follow other users. When a user posts, the post appears in followers' timelines. Support: chronological and algorithmic ranking, infinite scroll pagination, "while you were away" summaries, and real-time updates.

## Constraints

- **Scale**: 300M users; 100M posts/day; 1B timeline reads/day
- **Fan-out**: Average 500 followers; celebrities with 50M+ followers
- **Latency**: Timeline read < 50ms (p99); post visibility < 1s for followers
- **Availability**: 99.95% uptime
- **Storage**: Posts retained indefinitely; timeline generated on-demand or precomputed

## Solutions

### Solution 1: Fan-out on Write (Push Model)

**Description**: On post creation, push post ID to all followers' timeline Redis lists/sorted sets. Timeline read = fetch from user's precomputed timeline. Celebrities handled via "pull on read" hybrid: don't fan-out to massive follower counts; instead, merge celebrity posts at read time.

```mermaid
graph TD
    User[User Posts] --> API[Post API]
    API --> Fanout[Fan-out Service]
    Fanout --> Redis1[(Redis: User 1 Timeline)]
    Fanout --> Redis2[(Redis: User 2 Timeline)]
    Fanout --> RedisN[(Redis: User N Timeline)]
    Fanout -.-> Celebs[Celebrity Exception List]
    Reader[Reader] --> API2[Timeline API]
    API2 --> RedisR[(Redis: Reader Timeline)]
```

#### Trade-offs

- **Decision**: Fan-out on write for most users.
  - **Advantage**: Fast reads (O(1) list access); real-time updates natural; simple read path.
  - **Disadvantage**: Write amplification (500 writes per post); storage amplification; slow for high-fanout users.

- **Decision**: Hybrid pull for celebrities (>1M followers).
  - **Advantage**: Avoids massive write fan-out; reduces storage.
  - **Disadvantage**: Read path complexity (merge); slight staleness for celebrity posts.

- **Decision**: Redis sorted sets with score = timestamp.
  - **Advantage**: Natural ordering; easy pagination with ZRANGEBYSCORE; TTL for old entries.
  - **Disadvantage**: Memory cost; sorted set operations O(log N); cluster sharding by user_id.

### Solution 2: Fan-out on Read (Pull Model) with Ranking Service

**Description**: Posts stored in central PostgreSQL/PostgreSQL. On timeline read: fetch followee IDs, query posts from followees, merge and rank in ranking service, return paginated. Cache ranked timelines in Redis with short TTL. Real-time via WebSocket push of new post IDs.

```mermaid
graph TD
    User[User Posts] --> API[Post API]
    API --> PG[(PostgreSQL: Posts)]
    Reader[Reader] --> TimelineAPI[Timeline API]
    TimelineAPI --> Follows[(Follow Graph)]
    TimelineAPI --> PG
    TimelineAPI --> Ranker[Ranking Service]
    Ranker --> Cache[(Redis: Cached Timeline)]
    Cache --> TimelineAPI
    TimelineAPI --> Reader
```

#### Trade-offs

- **Decision**: Fan-out on read with ranking service.
  - **Advantage**: No write amplification; supports complex ranking; single source of truth.
  - **Disadvantage**: Read latency higher (multiple queries + ranking); cache invalidation complexity.

- **Decision**: Ranking service as separate microservice.
  - **Advantage**: ML models isolated; independent scaling; A/B testable.
  - **Disadvantage**: Additional network hop; service discovery; versioning.

- **Decision**: Short-TTL cached timelines.
  - **Advantage**: Absorbs read spikes; reduces DB load.
  - **Disadvantage**: Staleness; cache miss latency spike; memory for hot users.

### Solution 3: Event Sourcing + Materialized Timelines

**Description**: Posts as events in Kafka (partitioned by user_id). Consumer builds per-user materialized timeline in Cassandra/ScyllaDB (wide rows: user_id, timeline of post_ids). Timeline read = single row read. Ranking applied at materialization time. Real-time via WebSocket from consumer lag monitoring.

```mermaid
graph TD
    User[User Posts] --> API[Post API]
    API --> Kafka[(Kafka: Posts by User)]
    Kafka --> Consumer[Timeline Builder]
    Consumer --> Cassandra[(ScyllaDB: Materialized Timelines)]
    Reader[Reader] --> API2[Timeline API]
    API2 --> Cassandra
    API2 --> Reader
```

#### Trade-offs

- **Decision**: Event-sourced materialized timelines.
  - **Advantage**: Single-read timeline access; natural replay/rebuild; handles fan-out at write time in batch.
  - **Disadvantage**: Eventual consistency (consumer lag); rebuild cost; schema evolution.

- **Decision**: ScyllaDB/Cassandra wide rows.
  - **Advantage**: Linear scale; efficient time-series reads; TTL support.
  - **Disadvantage**: Operational complexity; no secondary indexes on clustering keys; tombstone issues.

- **Decision**: Ranking at materialization time.
  - **Advantage**: Read path stays simple; ranking logic centralized.
  - **Disadvantage**: Ranking changes require full rebuild; A/B testing harder.

## Related Problems

- [Design a Chat Application](./chat-application.md)
- [Design a Link Analytics Dashboard](./link-analytics.md)