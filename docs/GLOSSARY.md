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

## Presentation Layer
The outermost layer in the four-layer hexagonal architecture. Contains entry points (REST controllers, CLI commands, GraphQL resolvers, message consumers) that translate external requests into application commands. Depends only on the Application layer.

## Application Layer
The layer that orchestrates use cases. Contains use case classes, command/result types (input/output), and port interfaces (inbound and outbound). Depends only on the Domain layer.

## Domain Layer
The innermost layer containing pure business logic. Entities, value objects, domain services, domain events, repository interfaces, and domain errors. Has zero external dependencies.

## Infrastructure Layer
The layer that implements concrete adapters for repository interfaces (Domain) and outbound ports (Application). Contains database repositories, file storage, event bus implementations, HTTP server setup, and external API clients.

## Port (Hexagonal Architecture)
An interface defined by an inner layer that an outer layer implements.
- **Inbound Port**: Use case interface (Application → Presentation)
- **Outbound Port**: Technical capability interface (Application → Infrastructure, e.g., `IFileStorage`, `IEventBus`)
- **Repository Interface**: Domain-owned persistence contract (Domain → Infrastructure, e.g., `IProblemRepository`)

## Command (Application)
An input data structure for a use case. Immutable, serializable, expressed in application language (not HTTP-specific). Example: `SearchProblemsCommand`.

## Result (Application)
An output data structure returned by a use case. Immutable, serializable. Example: `SearchProblemsResult`.

## Domain Event
An event raised by a domain entity or domain service, representing something that happened in the domain. Handled within the same bounded context. Example: `ProblemPublishedEvent`.

## Integration Event
An event published by the Application layer after a use case completes, intended for cross-bounded-context communication. Serialized for message bus transport.

## DTO (Data Transfer Object)
A data structure used by the Presentation layer to serialize/deserialize HTTP requests and responses. Distinct from Commands/Results to allow API evolution independent of use case signatures.

## Aggregate
A cluster of domain objects (entities and value objects) treated as a unit for consistency. Has a single root entity (aggregate root) that enforces invariants. Example: `Problem` (root) with `Solution` entities.

## Value Object
An immutable domain object defined by its attributes, not identity. Two value objects with the same attributes are equal. Example: `ProblemId`, `Difficulty`, `TopicSlug`.

## Domain Service
A stateless operation that belongs in the domain but doesn't fit in a single entity/value object. Operates on multiple aggregates. Example: `ProblemSearchService`.