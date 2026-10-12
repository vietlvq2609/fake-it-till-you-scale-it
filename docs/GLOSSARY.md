# GLOSSARY — Cross-Bounded Context Terms

This glossary defines terms used across multiple bounded contexts. For BC-specific terms, see the BC's own glossary at `packages/<bc>/docs/GLOSSARY.md`.

## Bounded Context
A logical boundary within which a particular domain model applies. Each BC has its own ubiquitous language, models, and lifecycle.

## Ubiquitous Language
The shared, rigorous language used by developers and domain experts within a bounded context. Terms have precise, context-specific meanings.

## Domain Event
An event raised by a domain entity or domain service, representing something that happened in the domain. Handled within the same bounded context.

## Integration Event
An event published by the Application layer after a use case completes, intended for cross-bounded-context communication. Serialized for message bus transport.

## Aggregate
A cluster of domain objects (entities and value objects) treated as a unit for consistency. Has a single root entity (aggregate root) that enforces invariants.

## Value Object
An immutable domain object defined by its attributes, not identity. Two value objects with the same attributes are equal.

## Domain Service
A stateless operation that belongs in the domain but doesn't fit in a single entity/value object. Operates on multiple aggregates.

## Repository Interface
A domain-owned contract for aggregate persistence, expressed in ubiquitous language.

## Outbound Port
An application-owned contract for a technical capability (file storage, event bus, cryptography, external APIs).

## Command (Application)
An input data structure for a use case. Immutable, serializable, expressed in application language.

## Result (Application)
An output data structure returned by a use case. Immutable, serializable.

## Anti-Corruption Layer
A translation layer between bounded contexts that prevents one BC's domain model from leaking into another.

## Context Map
A document describing the relationships between bounded contexts (e.g., upstream/downstream, conformist, anticorruption layer).