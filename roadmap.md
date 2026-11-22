# Roadmap — Royals War Room

## Before final local handoff
- [ ] Install dependencies with Bun.
- [ ] Run Vitest, ESLint and the Vite production build on the user's Mac.
- [ ] Open all six routes (five decision workspaces plus the Kadamba research lab) in a browser and check desktop/mobile layouts.
- [ ] Test the three innings modes: RR batting first, RR chasing and RR defending.
- [ ] Test a base XI, Avesh acquisition, Akash acquisition, and Pathirana with/without the medical-review assumption.
- [ ] Check that no player with unresolved market status can enter a hypothetical XI.

## Evidence integrations that require a real source
- [ ] Add a fixture-aware venue/pitch adapter only when a licensed/reliable source and timestamped schema are selected.
- [ ] Add current weather/pitch context only with source attribution and stale-data handling.
- [ ] Reconfirm final 2027 Impact Player/substitute regulations against the official playing conditions before treating a preview as eligible.
- [ ] Expand injury and wicketkeeper/top-order cover only with researched candidates and reliable market/availability status.

## Not in scope without new evidence
- Auction-price prediction.
- Win-probability or player-outcome forecasts.
- Player-vs-bowler / bowler-vs-handedness models.
- DLS/revised-target simulation.


## Spatial pilot — 22 November 2026

The standalone Kadamba `/spatial-lab` route is restored in the application route tree, site navigation and homepage workflow. It exposes observed 5×5 zone outcomes and context vs context-plus-location out-of-fold prediction outputs. The model remains experimental and is not connected to RR recruitment, pressure rankings or Match Lab. A chronological holdout, data-source permission confirmation, sample representativeness analysis and coordinate-axis verification remain open gates.
