# Senior analyst release review — 22 November 2026

## Release disposition

**Disposition: improved analytical prototype; not production certified.** The previous user-facing `Run_Fix_And_Storytelling` ZIP did not expose the Kadamba spatial component through the active route tree/navigation. This release restores that sixth route as an explicitly separate research workspace, rebuilds its data summary from the supplied CSV, and strengthens route, data and decision-engine validators.

## What is in the release

- Five connected decision workspaces: War Room, Squad & XI Lab, Recruitment, Match-state Lab and Playoff Evidence.
- Separate Kadamba Spatial Lab at `/spatial-lab`; 5×5 observed and prediction views, not connected to RR recruitment or Match Lab.
- Retained-only Match Lab stress script and broad hypothetical-squad scenario matrix.
- Seven playoff case cards with homepage-to-detail anchors and source URLs.
- Auction-package, released-player register, candidate-alternative and route integration validators.

## Reproducible checks that passed in this container

| Audit | Observed result | What this establishes | What it does not establish |
|---|---|---|---|
| Route integrity | Six route files/tree entries; Kadamba nav and homepage links present | The route is wired into the app source | The browser can render the route successfully |
| Release register | 89 unique names; exact CSV/JSON match; 86/1/1/1 status partition; 0 registration-confirmed | Source register consistency | Current auction registration |
| Recruitment alternatives | 18 eligible research profiles; 17 role-matched alternatives; rank-reversal stability | Fallback mapping does not rely on ordinal shortlist rank | Candidate ordering or player performance validity |
| Auction package and matrix | 2,625 tactical scenarios; 7,875 complete combinations; no-buy/single/pair/six-profile packages pass constraints | Deterministic XI/package legality under the scripted scenarios | Auction-price forecast, market/medical clearance, or actual match results |
| Match Lab retained-only | Five states: batting first, chase, defend powerplay, defend middle, defend death; legal non-empty substitution combinations | The retained 19-player pool can produce options in those tested example states | Every possible user-selected XI and every match state will have a suitable substitute |
| Match Lab full matrix | 2,625 runs, zero invalid/empty results; 14 mapped venues plus unknown × 7 manual surfaces × 5 opponent profiles × 5 states | Deterministic behavior for one hypothetical active squad with six selected research acquisitions | The matrix is not a current retained-only or prediction-accuracy test |
| Venue sensitivity | First choice changed in 0/50 controlled comparisons | Venue did not alter first choice in those tested groups | Venue never matters in cricket or in every future squad state |
| Playoff evidence | Seven unique cases; 3 wins / 4 losses; 7 homepage links; 7 detail anchors; source URLs resolve in supplied data | Internal scoreline labels and UI evidence links are consistent | Fresh official scorecard audit or causal diagnosis |
| Spatial source audit | SHA-256 matches; 149,424 rows; 628 match IDs; zero duplicate match/delivery keys | Exact uploaded CSV identity and key uniqueness | Legal rights or full source provenance beyond repository description |
| Spatial model sample | 135,587 model deliveries / 627 matches; 25 zones populated; counts reconcile | Data filtering and stored zone output contract | Population representativeness or chronological generalisation |
| TS syntax/import scan | 92 TS/TSX files, zero syntax diagnostics; zero unresolved local imports | Source parses and local import paths exist | Full semantic type safety or bundler/runtime success |
| Focused TypeScript audit | `tsc --noEmit -p tsconfig.audit.json` passes | Selected domain/data modules typecheck | Complete React application typecheck |

## Spatial model result — use restrained wording

The rebuilt fixed-configuration three-fold `GroupKFold`-by-match comparison:

- Batter-run MAE: 1.17024 context-only → 1.15824 context + location; 0.0120 runs/legal ball lower, approximately 1.025% relative improvement.
- Batter-run RMSE: 1.60412 → 1.58969; approximately 0.90% lower.
- Bowler-credited wicket Average Precision: 0.07475 → 0.08113; +0.00637 absolute, against 4.6723% event prevalence.
- Wicket Brier: 0.044154 → 0.044025; small improvement.

A paired 1,000-resample match-cluster bootstrap over the **existing OOF predictions** gives intervals above zero for the stored improvements. It does not refit models. The lift is statistically separated from zero under this conditional resampling exercise, but its practical size is modest and not deployment proof. Wicket probability outputs have not undergone calibration analysis and should be read as uncalibrated model estimates.

The model includes `ballSpeed_clean`, a measurement only available after release. Outputs are therefore post-release tracking assessments, not pre-delivery line/length recommendations. Per-zone predictions are averages for deliveries that actually landed in the zone, not counterfactual estimates for deliberately targeting it. Colour scales are re-normalised within each selected view; compare numeric values across toggles.

A second rebuild from the exact CSV produced identical model metrics, bootstrap intervals, all 25 zone rows and the descriptive summary CSV byte-for-byte. The source CSV has no date, season, team, venue or player crosswalk. A 413-row difference from the cited 2026 study's model sample remains unexplained. No chronological holdout, player/season join, subgroup calibration, per-zone calibration, external season test or model-refit bootstrap has been completed. Raw CSV is not bundled. The source repository describes the data as Hawk-Eye statistics via ICC PulseLive; it is a third-party redistribution, not a direct RR/ICC/Hawk-Eye licensed feed. Permission must be confirmed before external publication.

## Cricket interpretation that must remain visible

- RR's pace question is not headcount. The retained group already has six pace options; the proposed requirement is injury resilience, phase competition and dependable death-over redundancy. The 2022 Q1 and 2026 Q2 cases illustrate partnership-control questions, not proof that one pace recruit would have changed either match.
- Hetmyer's release is a lower-middle-order/left-hand finishing role-succession question. It is not a statement that his prior output was consistent. Existing retained options cover parts of this role, so recruitment remains profile-specific.
- The seven-playoff sample is case-study evidence, not a causal five-season performance model. Three wins must stay visible as counter-evidence.
- Absence-test coverage is an engine result under defined role tags and XI constraints, not accuracy, injury risk or a guarantee of equivalent replacement quality.
- Submitted target ordering is left unchanged and treated as an analyst-submitted potential list, not a statistically validated ranking.
- Impact Player recommendations are deterministic scenario suggestions, not a learned state-specific substitute classifier; official match-day sheet eligibility must be checked.

## Required local release gates

The following were **not executed here** because this container does not have the project's `node_modules` and the full TypeScript run cannot resolve `vite/client` and `vitest/globals`:

1. Native Vitest (`bun run test`).
2. Full application typecheck (`tsc --noEmit`).
3. ESLint (`bun run lint`).
4. Vite production build (`bun run build`).
5. Desktop/mobile rendered browser tests across all six routes, including `/squad` and `/spatial-lab`.
6. Browser console/network and keyboard/focus checks.

The code includes React/Vitest route, data-contract and spatial UI interaction tests, but those test files are **not** marked as passed until they run on a dependency-installed machine. The current `/squad` user-side exception also remains unresolved without the browser error/stack from this exact release.
