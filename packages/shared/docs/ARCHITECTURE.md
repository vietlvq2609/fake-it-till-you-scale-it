# Shared Package Architecture

This package contains cross-cutting utilities used across bounded contexts.

## Structure

```
packages/shared/
├── src/
│   ├── result/              # Result<T, E> type for error handling
│   └── ...                  # Other shared utilities
└── docs/
    └── ARCHITECTURE.md      # This file
```

## Principles

- **No domain logic** — only generic utilities (Result, Maybe, etc.)
- **Zero dependencies** on BC packages
- **Stable API** — changes require careful consideration

## Usage

Other packages import via path alias: `@fake-it/shared`