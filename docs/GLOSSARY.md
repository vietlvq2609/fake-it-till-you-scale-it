# GLOSSARY — Problem Catalog BC

## Problem
A system design scenario that a user studies. Examples: "Design a URL shortener", "Design a chat application".

A Problem is the core artifact of the catalog. It contains a prompt, constraints, and one or more reference Solutions.

## Solution
A reference architecture for a Problem. A single Problem can have multiple Solutions, showing different approaches.

Each Solution describes how a particular architecture works, includes a diagram, and lists the trade-offs of its key decisions.

## Trade-off
The pros and cons of a particular architectural decision within a Solution.

A Trade-off is not a judgment about the whole Solution — it's a specific choice (e.g., "use SQL") with its advantage (e.g., "strong consistency") and its disadvantage (e.g., "limited horizontal scaling").

## Topic
A label that describes an architectural concern or pattern. Topics attach to both Problems and Solutions for filtering.

Examples: `event-sourcing`, `caching`, `sharding`, `pub-sub`, `microservices`.

Topics enable filtering: "show me all Problems that have a Solution using event sourcing."

## Difficulty
The relative complexity of a Problem. One of: `Easy`, `Medium`, `Hard`.

Used to help users find problems at their level.

## Related Problem
A link from one Problem to another, curated by maintainers. Indicates that the two problems share a domain, scale, or complementary concerns.

## Status
The lifecycle state of a Problem. One of: `Draft`, `Published`, `Archived`.

- `Draft` — being written, not visible to users.
- `Published` — live in the catalog, visible to all users.
- `Archived` — previously published, now hidden but retained for history.

## Author
The person who wrote a Problem. Used for attribution.