# Revision Validation Notes — 21 November 2026

## Executed in the current working container

- Verified the input ZIP exists and extracted successfully.
- Independently re-summed three playoff innings from the supplied raw `ball_by_ball.csv` and verified the phase batter-run values.
- Recomputed the 89-row release-register status distribution from the supplied CSV: 86 registration-unverified, 1 workload/availability-unconfirmed, 1 reported medical-unavailable, 1 retired/mentor.
- Added tests for release-register parsing/filtering/status labels, XI-rail render structure and five-route matching.
- Removed the `.js` snapshots from `src/` after checking active source imports; archived them under `archive/legacy-js/`.

## Not executed in this container

The source ZIP does not contain `node_modules`, and this environment cannot resolve the app's native Vite, Vitest, React Testing Library or ESLint packages. Therefore this exact revision has **not** been verified by native Vitest, complete TypeScript typecheck, ESLint, Vite build or browser rendering in this container.

TypeScript syntax transpilation and standalone data/domain scripts are checked separately where possible. They are not substitutes for a native build.

## Re-run before submission

```bash
npm ci
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Then manually verify `/`, `/squad`, `/targets`, `/match-lab` and `/knockouts` at desktop and mobile widths, including search/filter, simulator warning expansion, XI/Impact Player strip and situation-combination preview/apply behaviour.
