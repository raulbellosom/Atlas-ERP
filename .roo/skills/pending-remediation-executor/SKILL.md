---
name: pending-remediation-executor
description: Systematically address bugs listed in pending-remediation-matrix.csv. Use when fixing bugs from the remediation backlog, updating CSV status, or closing remediation tasks. Keywords: remediation, pending bugs, fix backlog, CSV status update.
---

# When to use

Use this skill when:

- You need to fix bugs from the pending remediation backlog
- You need to update the status of bugs in pending-remediation-matrix.csv
- You need to close remediation tasks and provide evidence

# When NOT to use

- For new bugs not in the remediation matrix - use standard bug-fixing workflow
- For features or enhancements - use module-scaffold or endpoint-creation skills
- For sync-related fixes - use sync-policy-skill

# Inputs required

- Path to the bug entry (e.g., T-0619) from pending-remediation-matrix.csv
- Source task file path from the CSV for detailed context
- Project context: apps/api (NestJS), apps/web (React), apps/desktop (Tauri),
  apps/worker (NestJS/BullMQ)

# Workflow

## Phase 1: Parse & Cross-Reference

1. Read `docs/07-dev-workflow/pending-remediation-matrix.csv` to get bug
   metadata
2. Read `docs/07-dev-workflow/pending-remediation-master.md` for detailed
   context
3. Read the source task file from `source_task_file` column
4. Identify affected code location and app (api/web/desktop/worker)

## Phase 2: Analyze Root Cause

1. Identify the fix strategy (patch, refactor, configuration change)
2. Check dependencies - read FIX_STRATEGIES.md for guidance
3. Determine correct execution order using dependency column
4. Map to correct app: NestJS API (apps/api), React Web (apps/web), Tauri
   Desktop (apps/desktop)

## Phase 3: Execute Fix

1. Follow AtlasERP coding standards from AGENTS.md files
2. Apply fix respecting architecture:
   - Server is source of truth (PostgreSQL)
   - Offline-first sync via packages/sync-contracts/src/
   - TailwindCSS 4.1 (no Bootstrap), Radix UI for web
   - Tauri + React + SQLite for desktop
3. Run validation: `pnpm --filter=@atlaserp/api lint` /
   `pnpm --filter=@atlaserp/api typecheck`
4. Maintain UTF-8 encoding in all modified files

## Phase 4: Update Status

1. Update pending-remediation-matrix.csv status column:
   - `OPEN` â†’ `IN_PROGRESS` when starting
   - `IN_PROGRESS` â†’ `CLOSED` when completed
2. Add completion notes to last_updated column (ISO 8601 date)
3. Log all actions taken for idempotency

## Phase 5: Report

Output remediation report with:

- Bug ID and title
- Files modified
- Fix strategy applied
- Validation results (lint/typecheck/build)
- Any side effects or follow-up items noted

# Execution Order (from remediation-master.md)

Process bugs in this priority order:

1. **Security/Platform hardening**: T-0632, T-0633, T-0634, T-0905, T-0908,
   T-0910, T-0914, T-0916, T-0917, T-0722
2. **Auth/Scope/Data correctness**: T-0625, T-0706, T-1019
3. **Foundation consistency/UX debt**: T-0619, T-0628, T-0629, T-0814

# Key Dependencies

- T-0632 must complete before T-0633 and T-0634
- T-0628 must complete before T-0629
- T-0618 must be closed before T-0619
- T-0624 must be closed before T-0625
- T-0705 must be closed before T-0706

# Files

- [references/BUG_INDEX.md](references/BUG_INDEX.md) - Bug list with details and
  file paths
- [references/FIX_STRATEGIES.md](references/FIX_STRATEGIES.md) - Fix strategies
  by category

