# Kadamba Spatial Lab — release validation

**Release scope:** separate experimental `/spatial-lab` workspace. Not connected to recruitment, pressure rankings or the Match-State engine.

## Data and model rebuild

| Check | Result |
|---|---|
| Rebuilt original source CSV | PASS |
| Source SHA-256 matches audited source | PASS |
| Raw rows / match IDs | 149,424 / 628 |
| Unique `(matchId, delivery)` keys | 149,424 |
| Duplicate keys | 0 |
| Legal main-innings model deliveries | 135,587 |
| Matches in modelling sample | 627 |
| 5×5 zone count | 25/25 populated |
| Zone counts sum to model sample | PASS: 135,587 |
| Out-of-fold prediction coverage | PASS: 135,587/135,587 |
| Every zone has finite expected-run / wicket-rate outputs | PASS |
| Predicted wicket probabilities remain in [0,1] | PASS |
| Observed Wilson intervals enclose observed rates | PASS |
| Both retired-hurt source spellings excluded from wicket-in-hand state | PASS in rebuilt source logic |
| Raw CSV included in application archive | NO — intentionally excluded |

## Model experiment

| Metric | Context | Context + location |
|---|---:|---:|
| Batter-run MAE | 1.17024 | 1.15824 |
| Batter-run RMSE | 1.60412 | 1.58969 |
| Wicket Average Precision | 0.07475 | 0.08113 |
| Wicket Brier | 0.044154 | 0.044025 |
| Wicket ROC-AUC | 0.60432 | 0.62322 |

A paired 1,000-resample match-cluster bootstrap over the existing out-of-fold predictions passed. MAE-reduction 95% interval: 0.01054–0.01344 runs/ball. Wicket Average Precision gain interval: 0.00460–0.00806. These are not model-refit or chronological intervals.

## Application integration

| Check | Result |
|---|---|
| `/spatial-lab` route file present | PASS |
| Route registered in `routeTree.gen.ts` | PASS |
| Main navigation link present | PASS |
| War Room workflow card present | PASS |
| Route-resolution test case present | PASS (test source; native Vitest not executable in this environment) |
| Data-contract test present | PASS (test source; native Vitest not executable in this environment) |
| Duplicate metric header in spatial UI | Removed |
| Bootstrap count shown in UI | Corrected to 1,000 resamples |
| Post-release ball-speed limitation visible above map | PASS in source inspection |

## Analyst interpretation guardrails

- MAE improves by 0.0120 runs/legal delivery, about 1.025% relative. The conditional match-cluster bootstrap interval excludes zero, but the practical gain remains small.
- Average Precision rises by 0.00637 on a 4.6723% bowler-wicket base rate. This is incremental ranking signal, not high-confidence wicket forecasting; probability calibration, chronological drift and subgroup performance remain untested. Treat percentages as uncalibrated model estimates.
- Ball speed is a post-release measurement. The model cannot decide a delivery's intended line or length before release.
- The 25-zone values are averages of held-out estimates for observed deliveries in each cell, not counterfactual target-zone predictions.
- Location-only is weaker than context-only for batter-run MAE. Use context first and treat location as a modest addition.

## Full repository checks

- Existing auction package validator: PASS (2,625 situations / 7,875 complete combinations, per included validator).
- Release reference validator: PASS (89 unique rows, CSV/JSON match).
- Recruitment alternative validator: PASS (18 eligible profiles, 17 role-matched alternatives, rank-reversal check).
- Spatial JSON validator: PASS.
- `tsc --noEmit -p tsconfig.audit.json`: PASS (domain/data audit subset only).
- TypeScript/TSX syntax transpilation and local import-path scan: report exact results in `FINAL_AUDIT.md`.
- Native Vitest, full app semantic typecheck, ESLint, Vite production build and browser QA: **not run here** because dependencies were unavailable and package registry access failed. These must be run locally.

## Release interpretation

The page can demonstrate the 25-zone data representation and a modest context-plus-location improvement on match-grouped out-of-fold metrics. It cannot support live bowling recommendations, per-player rankings, player-specific expected runs, RR 2022–2026 linking, causal zone claims or production predictions. A chronological validation and source-authorised tracking data are required before deployment.
