# Legacy JavaScript snapshots

These files were present alongside the active TypeScript modules but had no import references in the application source. They materially differed from the active `.ts` implementations and were therefore moved outside `src/` to prevent accidental edits to inert code.

The active modules are:
- `src/domain/recruitment.ts`
- `src/domain/rr-decision-engine.ts`
- `src/domain/historical-impact.ts`
- `src/domain/decision-data.ts`
- `src/data/war-room.ts`

Do not copy the legacy files back into `src/` without an explicit migration and test plan. They are retained here only as an audit snapshot.
