---
name: OpenAPI and Zod compatibility
description: Integer schemas in the current Orval/Zod toolchain can generate an unsupported zod.int helper.
---

When adding numeric counters to the OpenAPI contract, prefer a plain `number` schema unless integer validation is required at the API boundary.

**Why:** The workspace currently generates Zod 3 validators, while Orval emits `zod.int()` for OpenAPI integer fields; code generation succeeds but the library typecheck fails.

**How to apply:** After changing the API contract, run codegen immediately and keep generated validators compatible with the installed Zod version.