> **Historical validation snapshot.** This document records an earlier 21 November build and is superseded for current follow-up findings by `docs/audits/INDEPENDENT_AUDIT_2026-11-21.md` and the root `ENGINE_VALIDATION.md`. Do not use its prior test/file counts as the current revision status.

# Final validation record — RR War Room historical-evidence build

**Build date:** 21 November 2026  
**Source basis:** current project source in this ZIP; 18 November 2026 RR planning snapshot; supplied 27-page SupeRR Selector report; user-uploaded `suprr_selector.zip` IPL delivery archive.

## Product scope

Five connected workspaces: War Room (`/`), Squad & XI Lab (`/squad`), Recruitment (`/targets`), Match-state Lab (`/match-lab`) and Playoff Evidence (`/knockouts`). The application compares a continuity-first RR hypothesis against broader 0–6 acquisition packages. It does not claim that one or two additions must be optimal. Six open squad places are capacity, not mandatory purchases.

## F1–F6 and subsequent defects

| Issue | Current status | Implementation / boundary |
|---|---|---|
| F1 — hard two-acquisition cap | Fixed | Supports 0–6 hypothetical squad additions within the actual 25-player and eight-overseas limits. Over-cap requests degrade to valid partial packages with an explicit warning. |
| F2 — core / flex treatment | Reframed and implemented | The continuity reference core remains a hypothesis; six flexible slots can respond to surface, opposition and objective assumptions. The 0–6 change policy is an analyst control, not an IPL rule. |
| F3 — 12 of 20 candidate profiles | Fixed | All 20 research-board profiles are accessible to Recruitment and engine lookup. Market-blocked candidates remain visible but fail closed. Pathirana also has a separate medical gate. |
| F4 — hardcoded squad header | Fixed | Squad and overseas metrics derive from the active roster/package and domain constraints. |
| F5 — dead venue context | Replaced with historical data linkage | Match Lab resolves exact canonical venue names/curated aliases to the uploaded numeric IPL venue IDs where mapped. Venue history never implies a physical pitch type. An unknown or ambiguous ground stays unknown. |
| F6 — champion continuity narrative | Corrected | Separates year-over-year auction retention from in-season XI stability. Does not publish unverified KKR/RR numeric comparisons. |
| Hidden stale XI-change cap | Fixed | The permutation leaf follows the configured 0–6 flex-change limit; no stale hardcoded two-change rejection remains. |
| Venue fuzzy-match risk | Fixed | Venue matching requires a complete canonical name or curated alias; generic partial strings/city-only inputs do not silently map to a ground. |
| Historical value display/sort mismatch | Fixed | Match Lab displays the same final `tieBreakContextMetricPer100` used by the domain sorter, including eligible style/ground adjustments. |

## Historical data layer built from `suprr_selector.zip`

- Usable IPL matches: **362** (2022–2026; revised-overs matches and super-over rows excluded by the supplied P0 pipeline).
- Delivery rows: **86,668**; legal deliveries: **82,781**.
- Numeric IPL venue IDs: **18**; **14** are analyst-curated to ground names using repeated home-team concentration; remaining IDs are not guessed.
- Player evidence profiles: **39** (19 retained and 20 research-board candidates). Players with no supplied IPL ball-by-ball sample remain “no estimate” rather than having a value invented.
- Historical Impact Player usage: **558 incoming flags**, **558 outgoing flags**, **291 matches** with an incoming record. These flags do not include substitution time/score/wickets/phase or nominated alternatives, so they are descriptive only and are not used to train a state-conditioned Impact Player classifier.

### Model construction

A shared `HistGradientBoostingRegressor` context model predicts batter runs on P0-defined legal deliveries using pre-delivery state (balls left, wickets/score/required-rate/current-rate context, over/ball-in-over, season, innings, phase, pace/spin, bowling type and batting type). Actual runs, boundaries, wickets/dismissals and other post-delivery outcomes are not predictors. Player residuals use match-grouped out-of-fold predictions; the player-level outputs are then aggregated by phase and shrunk for exposure.

For bowling, the outcome is batter runs scored against the bowler on legal balls, not the unreliable reconstructed `bowler_runs` field. Positive context-batter-runs-prevented is favourable, but this is not official bowler economy or total bowler runs saved. Wickets and boundary concession are shown separately.

### Chronological 2026 holdout

| Model | MAE | RMSE | RMSE vs simple phase baseline | MAE vs baseline |
|---|---:|---:|---:|---:|
| Context model with venue ID | 1.4475 | 1.8471 | +0.96% improvement | 0.94% worse |
| Context model without venue ID | 1.4494 | 1.8450 | +1.08% improvement | 1.07% worse |

The context model modestly improves RMSE but worsens MAE. Venue ID does not improve the held-out result. Accordingly, production player residuals are venue-blind; ground-specific player samples are a separate descriptive/shrunk adjustment used only for close role-fit comparisons. This is not a calibrated next-ball outcome forecast or a match-win model.

### Sample gates and ranking use

- Phase context residual: shrunk toward zero using exposure-based priors.
- Batter-vs-Pace/Spin or bowler-vs-LHB/RHB split: at least **48 legal balls and 4 matches**, shrunk toward that player's phase-level metric.
- Player/ground/phase split: at least **24 legal balls and 3 matches**, shrunk more conservatively toward the style-adjusted phase prior.
- The historical metric is used only to order evidence-eligible candidates inside five-point tactical role-fit bands. It cannot make a poor role fit outrank a materially better tactical option. No-history candidates retain role-scouting eligibility and are not penalised.
- The `opposition` field is an analyst profile, not automatically derived from a verified opposing XI.
- A mapped ground name is not a pitch report. Slow/dry/dew/pace-friendly/bouncy are manual scenario assumptions; the default ground mode uses historical player/ground evidence with neutral surface preference.

## Match Lab historical evidence matrix

The actual `recommendMatchImpact()` engine ran **2,625 cases**: 14 mapped ground labels plus an unknown ground × 7 surface selections × 5 opposition profiles × 5 match states. Outcomes: **2,625 valid**, **0 invalid**, **0 empty** recommendations. It used the same 19 retained players and six explicitly selected hypothetical profiles (25 total), with an XI generated from the retained-core scenario. Before the scenario matrix, a regression check verified all 14 complete labels displayed in the Match Lab dropdown resolve to the intended numeric historical venue ID. This found and fixed the mismatch in the full `M. A. Chidambaram Stadium (Chepauk), Chennai` label.

Controlled one-variable comparison in that test package:

| Change | Groups tested | First-choice changes |
|---|---:|---:|
| Venue only | 50 | **0** |
| Manual surface selection | 375 | **195** |
| Opposition profile | 525 | **195** |

Venue-only not changing the top name is an actual test result, not hidden. Venue-specific player metrics can differ where local samples pass, but role fit remained decisive for the first choice in this selected package. Surface changes are broad manual scenario priors. Opposition profiles can select historical player-vs-style splits when exposure gates pass. These are deterministic scenario rankings, not proof of future prediction accuracy.

Full rows and interpretation: `impact-player-historical-matrix.md`, `.csv` and `.json`. The CSV includes the top-three evidence details per scenario. The matrix is reproducible with `node scripts/validate-impact-player-matrix.cjs` from the repository root after dependency installation. Model/data construction and venue coverage: `historical-impact-model-report.md` and `historical-impact-model-card.json`.

## Squad / XI engine verification

The independent package/lineup matrix in `permutation-results.md` reports 4,770 engine runs and 816,690 complete XI assignments across retained-only contexts and single/pair packages from the selectable candidate pool. It returned zero invalid/empty scenarios in that tested matrix. The 0–6 addition package boundary and 0–6 flexible XI-change policy were tested separately. A request above actual capacity admits the valid partial package and reports excess names.

Injury scan: 16/19 absences produced a valid alternative XI. Dhruv Jurel, Vaibhav Sooryavanshi and Yashasvi Jaiswal remain three honest uncovered cases in the supplied pool. The engine does not invent replacements.

## Source-level checks passed

- TypeScript/TSX syntax transpilation: **79 files, zero syntax diagnostics**.
- Local imports/assets: **123 references checked, zero unresolved paths** (including generated `routeTree.gen.ts` and Vite query suffixes).
- JSON parsing: both `src/data/*.json` files, `package.json`, `tsconfig.json` and `tsconfig.audit.json` parse successfully.
- Focused strict TypeScript semantic check: `tsc --noEmit -p tsconfig.audit.json` passed for historical-impact, decision engine/data, recruitment and shared War Room data.
- Actual-engine Match Lab matrix script: 2,625 runs completed; the portable repository script itself passed `node --check` and was executed with the globally installed TypeScript compiler in this environment. After normal `bun install`, it can be run with the documented command without a global compiler path.
- Domain/data test-source compatibility run: **44 passed, 0 failed** across 3 test files, using a local Vitest-API compatibility shim. This is not a native Vitest run.

## Not run — do not claim certification

Native `bun run test`, ESLint, the full application/framework typecheck, Vite client/SSR production build, and browser interaction/visual QA were not run because project dependencies and Bun are not installed in this editing environment. The compatibility shim is not a substitute for native Vitest. The UI has source-level changes but has not been certified in a live desktop/mobile browser.

## Deliberate limits

- No live auction-registration feed, official medical clearance, injury forecast or auction-price/demand model.
- No current venue fixture lookup, pitch report, weather, dew, ball-condition feed or official venue-name dimension in the archive.
- No calibrated next-ball expected-run distribution, expected-wicket model, spatial pitch model, match-win model or individual player-vs-opponent prediction. The context model is modest and mixed on holdout.
- No state-conditioned Impact Player choice classifier because historical in/out flags lack exact substitution timestamp and match-state fields.
- No DLS/revised-target model or official match-day nomination/team-sheet check.
- Role tags and heuristic score weights still require cricket-domain review. Part-time skills are not equivalent to specialist workload or phase execution.
- Scenario state uses browser `sessionStorage`, not server-side persistence.

## Release judgement

This is the strongest source/code candidate currently assembled from the supplied archive and current application. It adds a historical evidence layer with strict limits and sample gates, and it addresses F1–F6 plus later discovered defects. It remains a **research/strategy prototype, not production-certified software or a calibrated predictive system**, until native dependency-based checks and browser QA pass.


## 21 November 2026 — Auction Simulator v1 recheck

### Implemented in the current source package

- `src/components/auction-strategy-simulator.tsx` is integrated into **Squad & XI Lab** after the acquisition/combination builder and before retained-player injury resilience.
- The screen compares no-buy, a selectable single target, a distinct two-player package and the currently selected broader package (up to six additions). It calls the same `optimizeRRLineups()` engine used by the XI workbench.
- Each package exposes squad/overseas limits, XI-fit heuristic delta versus no-buy, entrants/displaced players, before/after role-tag counts, up to three valid XI options, and a retained-player absence stress test for the broader package.
- The budget controls accept manual planned bids and show package spend, remaining purse and over-purse warnings. No walk-away ceiling is generated or entered in the UI, and no player price is forecast.
- Candidate evidence is available in a collapsed detail panel, with supplied phase-ball samples, matches, confidence and the shrunken context metric. A same-discipline research alternate is labelled as a backup to inspect, not as an automatic recommendation.
- Registration and medical gates remain visible. 19/20 profiles are reconciled as released but not auction-registration verified; Daryl Mitchell remains unresolved. Pathirana remains injury-prone and blocked from the normal single/pair selector by a separate medical-review gate.
- The home-page display typography, hero headline and navigation treatment are aligned more closely with the supplied Emergent reference: navy base, official crest, restrained gold/pink accents, serif headline, title-case navigation and an editorial question-led hero.

### Checks run in this editing environment

- Focused strict TypeScript check: `tsc --noEmit -p tsconfig.audit.json` — passed for shared domain, historical model and decision data.
- TypeScript/TSX syntax transpilation: **79 files, zero syntax diagnostics**. This is syntax validation only; it is not a full app semantic typecheck.
- Match Lab historical matrix rerun using the actual `recommendMatchImpact()` function: **2,625 cases**, all valid, zero invalid and zero empty recommendations.
- New package-domain validation script: `node scripts/validate-auction-simulator-packages.cjs` — passed no-buy, single, pair and six-player package scenarios; 11-player uniqueness; squad and overseas constraints; 19/20 release-status reconciliation; Daryl unresolved gate; and Pathirana medical-gate behaviour.
- Five generated JavaScript source twins were regenerated from TypeScript and checked for exact parity. The four package scenarios generated legal XIs with 19, 20, 21 and 25 total squad members; all remained at five overseas squad members and three overseas XI players in the test configuration.
- `src/data/auction-market-snapshot.json` and package manifest JSON parsing — passed.

### Still not certified

Native Vitest, ESLint, complete application/framework typecheck, Vite client/SSR production build, and rendered desktop/mobile browser interaction/visual QA were not run because the project's dependencies and Bun are not installed in this editing environment. The newly added React simulator component was syntax-transpiled but not fully semantically typechecked or rendered here. The interface source now follows the reference direction, but pixel-perfect visual approval cannot honestly be claimed without browser rendering.

The simulator is **implemented and domain-tested**, but this package remains a research/strategy prototype—not production-certified software. Recheck registration, purse and rules immediately before the 16 December 2026 auction; the source snapshot is dated 21 November 2026.


## Follow-up validation — tube XI and situation-based combinations (21 November 2026)

- Focused strict TypeScript domain check: passed.
- TypeScript/TSX syntax transpilation: 79 files checked, zero syntax diagnostics.
- Direct runtime matrix against the compiled domain engine: 2,625 situations evaluated across 15 venue labels, 7 surface settings, 5 opposition profiles and 5 match states; 7,875 complete tactical combinations returned, all valid.
- Every returned combination was checked for exactly 11 unique players, incoming player outside the starting XI, outgoing player inside the starting XI, overseas limit, at least one wicketkeeper, at least two pace options, at least one spin option, and a non-empty rationale/trade-off explanation.
- Match Lab no longer exposes a free-form outgoing-player select. The outgoing member is selected by the deterministic role-coverage pairing logic; the UI offers complete scenario combinations.
- The new XI tube component is shared between Squad & XI Lab and Match-state Lab. Each suggested combination explains the current situation, supplied role profile and historical phase tie-break sample where available, plus the outgoing capability cost and before/after role coverage. The Squad & XI rail now occupies the full width of each plan card. Browser-rendered visual QA and native app build/tests remain outstanding because dependencies are not installed in this workspace.
