# RR War Room — current engine and match-state verification
> **Market-status correction (21 November 2026):** this report records the earlier snapshot in which Mahipal Lomror, Daryl Mitchell and Mangesh Yadav were all blocked. The current official 2027 released-player list now confirms Mahipal Lomror (PDF spelling “Lamror”) and Mangesh Yadav as released, while Daryl Mitchell remains unresolved. Release is not auction registration; all released research profiles remain provisional until matched to the official auction-registration list. See `COACH_DATA_READOUT_AND_AUCTION_SIMULATOR.md` for the current market reconciliation.

**Run date:** 21 November 2026  
**Code under test:** current `src/domain/rr-decision-engine.ts`, `src/domain/decision-data.ts` and `src/domain/recruitment.ts`  
**Method:** executed the actual TypeScript domain modules through a Node/TypeScript transpilation harness. The engine/scoring logic was not reimplemented.

## 1. Input pool and package limits

- Retained roster: **19** players, **5** overseas.
- Recruitment directory and engine lookup: **20 / 20** profiles.
- Market-gated hypothetical profiles in this historical run: **17**. This run predates the 21 November market reconciliation below; it must not be read as today’s market-status count or as a full rerun against the corrected 19/20 released-player pool.
- Matheesha Pathirana is one of the 17 market-gate profiles but remains under `MEDICAL_REVIEW`; he only enters a hypothetical squad when a separate analyst assumption is supplied. This is not medical clearance or proof of registration.
- Squad-package capacity: 25 total players / 8 overseas. Against the supplied 19/5 baseline, this means six total openings and three additional overseas openings.

> The 4,770-run matrix below remains a valid record of the exact earlier code/data snapshot and constraints tested. Current package cases are separately reproducible with `scripts/validate-auction-simulator-packages.cjs`; the latter covers no-buy, single, pair, six-player and Pathirana medical-gate scenarios.

## 2. Exhaustive context and single/pair package matrix

The current harness ran:

- Retained-only scenarios: 6 surface assumptions (including bouncy/carry) × 5 opposition profiles × 6 planning objectives = **180** runs; 18,000 XI assignments evaluated.
- Candidate packages: zero additions plus all singles and pairs from the 17 market-gated profiles = **154** packages (the 153 single/pair packages plus retained-only baseline).
- Acquisition contexts: 153 single/pair packages × 6 surfaces × 5 opposition profiles = **4,590** runs.
- Combined total: **4,770 engine runs**.
- Complete XI assignments evaluated by the engine: **816,690** (18,000 retained-only + 798,690 acquisition-package assignments).
- The matrix returned up to three recommendations per run; source tests checked 11-player uniqueness, overseas limits, and configured reference changes.
- Invalid emitted recommendations: **0**.
- Empty context/package recommendations in the matrix: **0**.

For each displayed plan, the harness checked exactly 11 unique players, valid squad membership by construction, no more than four overseas players in the XI, the configured reference-change limit, and no more than the permitted number of hypothetical additions in the XI under the default two-change policy.

## 3. F1 — package size and graceful degradation

The same current optimizer was checked with 0, 1, 2, 3, 4, 5 and 6 Indian additions:

| Requested additions | Admitted | Projected squad | Recommendations |
|---:|---:|---:|---:|
| 0 | 0 | 19 | 3 |
| 1 | 1 | 20 | 3 |
| 2 | 2 | 21 | 3 |
| 3 | 3 | 22 | 3 |
| 4 | 4 | 23 | 3 |
| 5 | 5 | 24 | 3 |
| 6 | 6 | 25 | 3 |

Boundary probes:

- A seven-name request admits the six available places, reports the excess request, and still returns valid recommendations.
- A blocked candidate placed first in the request is skipped; later valid candidates still fill the six available places.
- An overseas-overflow request is reported, but later valid Indian profiles can still fill open squad places up to the real overseas/squad caps.

There is no separate two-acquisition squad cap. The starting-XI continuity setting is a different constraint.

## 4. Flexible reference-XI policy — zero to six changes

A targeted scenario with Avesh Khan, Akash Madhwal and Nehal Wadhera was run at every configured limit:

| Maximum flex changes | Valid XI combinations found |
|---:|---:|
| 0 | 1 |
| 1 | 22 |
| 2 (default) | 209 |
| 3 | 1,185 |
| 4 | 4,852 |
| 5 | 13,199 |
| 6 | 22,260 |

This run caught a stale hard-coded two-change check in the permutation leaf; the leaf now respects the same configured limit as the search/pruning stage. A higher limit expands the valid search space. It does not force the top-ranked three plans to make unnecessary changes; the score still rewards continuity.

## 5. Injury/absence scan

Each retained player was tested as unavailable. **16 of 19** produced a valid alternative XI. Three did not, and remain honest uncovered cases:

- Dhruv Jurel — wicketkeeping / top-order cover.
- Vaibhav Sooryavanshi — opening role cover.
- Yashasvi Jaiswal — opening role cover.

The engine returns no valid XI for these cases rather than inventing a replacement.

The injury-cover list now displays every role-matching option in the selected retained/hypothetical pool rather than truncating to a fixed top-five list that could hide a selected conditional profile.

## 6. Match-state arithmetic and role suggestions

The current function `recommendMatchImpact()` was exercised in batting-first, chase and defence modes. Supplied reference calculations remain:

| Match state | Calculation | Role output | Suggested candidate in a focused test pool |
|---|---|---|---|
| RR batting first: 82/2 after 9 overs, no total objective | 66 balls remain; no target/par score inferred | Build first-innings platform | Role-tagged middle-order option |
| Chase 170: 53/3 after 10 overs | 117 from 60; required rate 11.70 | Lower-order acceleration with batting cover | Mitch Owen in the focused package |
| Chase 170: 56/6 after 10 overs | 114 from 60; required rate 11.40 | Middle-order repair and batting depth | Nehal Wadhera in the focused package |
| Defending 215: opponent 59/0 after 6 overs | 157 required from 84; required rate 11.21 | Partnership-breaking strike option | Role-fit depends on selected surface assumption |

The function only considers members of the selected active squad outside the XI. A candidate not present in the selected squad package is never pulled from the wider recruitment directory.

Overs parsing probes: `10.3` → 63 legal balls; `10.6` and `20.1` are rejected.

## 7. Historical-data-driven Match Lab permutations

The Match Lab now uses the user's uploaded IPL 2022–2026 history rather than hand-authored venue pitch archetypes. The latest actual-engine matrix covers **14 mapped venue labels plus an unknown-ground control × 7 surface selections × 5 opposition profiles × 5 match states = 2,625 `recommendMatchImpact()` runs**. The active pool contained 19 retained players plus six explicitly selected hypothetical profiles (25 total). Results: **2,625 valid, 0 invalid, 0 empty recommendations**. The in-repository `scripts/validate-impact-player-matrix.cjs` reproduces this matrix and first asserts that all 14 full dropdown labels resolve to their intended numeric historical IDs; this caught and fixed the full Chepauk label mismatch.

Controlled single-variable comparisons for this selected package:

| Variable changed | Groups tested | First-choice recommendations changed |
|---|---:|---:|
| Venue only (historical ground data) | 50 | **0** |
| Manual surface selection | 375 | **195** |
| Opposition profile | 525 | **195** |

The venue-only null result is important. Player-specific ground samples do enter the historical tie-break metric where the local sample has at least 24 legal balls across 3 matches, but for this tested active squad and match-state matrix they did not overturn the first-choice candidate. For example, Nitish Rana's middle-phase ground sample is 75 balls / 5 matches at Wankhede (used), 29 / 1 at Chepauk (not used because the match-count gate fails), and 26 / 3 at Jaipur (used). Akash Madhwal's death phase sample is 30 / 4 at Wankhede (used), 9 / 2 at Chepauk (not used), and 12 / 2 at Jaipur (not used). The app does not force the leader to change just because the venue name changes.

Manual surface changes use broad role-balance assumptions only; they are not historical pitch labels. Opposition selection can use a player's phase-specific batter-vs-Pace/Spin or bowler-vs-LHB/RHB sample when it meets the 48-ball / 4-match gate and is shrunk toward the player's wider phase record. These remain descriptive splits, not calibrated future matchup forecasts.

The final historical evidence value used for sorting is also the value displayed in Match Lab. It combines the player phase context residual, any qualifying style split and any qualifying player/ground split with shrinkage. Missing historical samples do not create a penalty. The CSV stores the top-three candidate evidence for each scenario. Run `node scripts/validate-impact-player-matrix.cjs` from the repository root after installing dependencies to reproduce the matrix and CSV/JSON output. Full methods, exact row-level outcomes and limitations are in [`impact-player-historical-matrix.md`](impact-player-historical-matrix.md), [`impact-player-historical-matrix.csv`](impact-player-historical-matrix.csv), [`impact-player-historical-matrix.json`](impact-player-historical-matrix.json) and [`historical-impact-model-report.md`](historical-impact-model-report.md).

The historical archive also has 558 incoming and 558 outgoing Impact Player flags across IPL 2023–2026, but no exact substitution timestamp, score, wickets, phase or nominated alternatives. These counts are shown descriptively only; they cannot validly train a state-specific “who should come in now?” classifier.

## 8. Market, medical and substitution gates

- `canUseHypotheticalTarget()` rejects market-blocked profiles.
- Pathirana is rejected without a separate medical-clearance assumption and can be tested after that assumption, while continuing to carry medical/registration warnings.
- A market-blocked incoming profile is rejected by the one-for-one substitution audit.
- The substitution function checks XI size/uniqueness, overseas count, identified wicketkeeper, minimum pace/spin cover and reports added/lost role capabilities.
- The analyst must choose the outgoing player; the engine does not silently remove someone.
- The Match Lab explicitly warns that a squad-pool candidate is not a verified member of the official match-day nominated substitute pool.

## 9. Domain test-source execution

The current engine, recruitment and data test files were transpiled and executed using a small compatibility shim for the Vitest assertion API: **44 passed, 0 failed** (32 engine, 8 recruitment, 4 data). This is not a native Vitest run and must not be reported as one.

## 10. Limits of this verification

The following remain unrun because the project has no installed `node_modules`, and Bun/Vite/Vitest/ESLint executables are unavailable in this editing environment:

- Native `bun run test` / Vitest.
- ESLint (`bun run lint`).
- Full application/framework TypeScript typecheck.
- Vite client and SSR production build.
- Browser interaction/visual QA at desktop and mobile viewports.

Separate checks recorded for this package: all source TypeScript/TSX files transpile with zero syntax diagnostics; local imports/assets resolve; source JSON data parses; focused strict domain TypeScript check passes. The compatibility tests are not native Vitest and do not certify the full app build.

## 11. Interpretation boundary

The XI optimizer is deterministic and rule/role based. The score is a transparent heuristic, not a calibrated ranking, player-quality model, performance forecast or win probability. Match Lab uses historical player phase residuals and sample-gated venue/style splits only as tie-break evidence within close role-fit bands. The underlying context model has modest/mixed holdout performance (about 1% RMSE improvement but worse MAE) and is not a calibrated forecast. Track selections are manual assumptions; venue name does not imply a pitch type. The historical Impact Player flags lack substitution state and cannot train a state-conditioned choice model. The current evidence does not establish auction registration, medical clearance, price, official match-day substitute nomination or an optimal IPL strategy.
