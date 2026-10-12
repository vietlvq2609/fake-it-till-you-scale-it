# Contracts Package Architecture

This package contains shared Zod schemas and TypeScript types used across bounded contexts.

## Structure

```
packages/contracts/
├── src/
│   ├── problem-catalog/     # Problem Catalog schemas
│   └── shared/              # Cross-BC shared types
└── docs/
    └── ARCHITECTURE.md      # This file
```

## Principles

- **No business logic** — only type definitions and validation schemas
- **Zero dependencies** on other packages (except shared utilities)
- **Versioned independently** — consumers choose when to upgrade

## Usage

Other packages import via path alias: `@fake-it/contracts/problem-catalog`