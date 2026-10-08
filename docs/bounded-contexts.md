# Bounded Contexts

This document tracks the status of each bounded context in the FakeItTillYouScaleIt platform.

## ✅ Confirmed (Building Now)

### Problem Catalog
- **Status**: In development
- **Scope**: Manage the library of system design problems, reference solutions, trade-offs, topics, and related problems.
- **Storage**: Markdown files with YAML frontmatter (v1)
- **Architecture**: Hexagonal (ports & adapters)
- **Docs**: `docs/GLOSSARY.md`, `docs/ADR/0001-problem-catalog-bc.md`

## 🔬 Deferred (Research Later)

### Practice Session
- **Status**: Deferred
- **Description**: The user's workflow for engaging with a problem — drafting a design, submitting it, revising, and triggering evaluation.
- **Complexity**: High. This is the core workflow and the primary candidate for event sourcing.
- **Dependency**: Depends on Problem Catalog for problem data.

### Evaluation Engine
- **Status**: Deferred
- **Description**: AI-powered evaluation of submitted designs. Generates comparative analysis, rubric-based scoring, and Socratic coaching.
- **Complexity**: Very high. Involves AI agent orchestration, saga patterns, retries, and compensation.
- **Dependency**: Depends on Problem Catalog and Practice Session.

### Portfolio & Progress
- **Status**: Deferred
- **Description**: Auto-generated ADRs, skill radar, and progress tracking. Consumes events from Practice Session and Evaluation Engine.
- **Complexity**: Medium-High. Read-model heavy with projection rebuilds.
- **Dependency**: Depends on Practice Session and Evaluation Engine.

### User Management
- **Status**: Deferred
- **Description**: User authentication, profiles, and preferences.
- **Complexity**: Low-Medium. Standard auth BC.
- **Dependency**: Independent, but needed by all other BCs for user attribution.

## Notes

- The deferred BCs are documented in `research/SESSION_RESEARCH.md` with directional intent, but their domain models, event catalogs, and architecture are not yet designed.
- We will design each deferred BC in a future session, starting with Practice Session.
- The Problem Catalog BC is designed to be independent — it does not depend on any deferred BC.