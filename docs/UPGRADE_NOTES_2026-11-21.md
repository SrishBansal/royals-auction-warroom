# Analyst upgrade notes — 21 November 2026

This note describes the current source package. For exact run counts and constraints, see `permutation-results.md`; for the end-to-end route and state handoff, see `PRODUCT_FLOW.md`.

## Engineering and product changes in this pass

- Replaced free-text-first role classification with curated `roleTags` for the supplied retained squad and focused recruitment profiles. Legacy text matching remains as a fallback for callers without tags.
- Added explicit role-coverage counts for powerplay/new-ball, specialist death role and left-arm pace. These are evidence labels, not inferred execution forecasts.
- Added a transparent XI heuristic score breakdown: positional fit, continuity, bowling balance, batting depth, objective fit, overseas opportunity cost and acquisition complexity. Points are heuristic comparisons, not player ratings, probabilities or forecasts.
- Removed a positive score merely for selecting a recruit. Role fit earns value through the selected scenario; acquisition complexity can carry a visible penalty.
- Added a before/after Impact Player substitution audit. It reports role counts, added/lost capability tags and structural warnings; it rejects invalid XI size, duplicate players, excessive overseas players, no identified keeper, fewer than two pace contributors or no spin contributor.
- Tightened batting-first outgoing-player choices so a batter or part-time spinner is not presented as a specialist bowling release by default.
- Added regression tests for transparent scoring, injury gaps, Pathirana's medical gate, market gating, substitution consequences, 20-profile lookup, package boundaries and 0–6 XI change limits.
- Applied a consistent dark navy / gold / restrained pink visual system with an editorial hero, using the Emergent preview as a design reference while retaining the five-workspace architecture.

## F1–F6 dispositions

- **F1 — package capacity:** 0–6 hypothetical additions are supported according to the actual 25-player and eight-overseas squad caps. Requests above capacity degrade into a valid partial package with an explicit error instead of an empty recommendation result.
- **F2 — continuity and context:** core anchors remain a tested continuity-first hypothesis; six flexible reference positions respond to surface, opposition and objective assumptions. An analyst can set the reference-change limit from 0–6; this is not an IPL rule. The score remains heuristic and should continue to be challenged against real cricket strategy.
- **F3 — candidate visibility:** all 20 supplied recruitment profiles are accessible in the directory and engine lookup. The official 2027 released-player list now reconciles 19 profiles as released but registration-unverified; Daryl Mitchell remains market-unresolved and blocked. Mahipal Lomror (PDF spelling “Lamror”) and Mangesh Yadav have been corrected from stale unresolved statuses. Pathirana has a separate medical-review gate.
- **F4 — live squad header:** squad size, open places, overseas count and overseas capacity are derived from the current roster/package and domain limits.
- **F5 — match context:** The initial hand-authored venue pitch archetypes have been removed. Match Lab now maps 14 recurring numeric venue IDs from the uploaded 2022–2026 archive to curated ground names and uses sample-gated player-specific phase/ground splits as a conservative tie-break. Unknown IDs/grounds stay unknown. Physical surface defaults to neutral; slow/dry/dew/pace-friendly/bouncy are optional manual analyst assumptions. No pitch report, live fixture or weather retrieval occurs.
- **F6 — champion continuity:** product copy distinguishes year-over-year auction retention from within-season XI stability. The UI describes a proper within-season measurement protocol, but exact KKR/RR counts are withheld until full match-XI histories are reconciled.

Additional defects found and fixed during verification:
- The permutation leaf still contained a hard-coded two-change check after the UI/optimizer exposed 0–6. It now applies the same configured maximum as the search and pruning stages.
- The full Chepauk venue label used by the Match Lab select did not exactly match the historical model alias, so it could silently fall back to no ground evidence while the short alias worked. The full visible label is now an explicit alias and a regression loop verifies every one of the 14 displayed venue labels resolves to the intended numeric ID.

The injury-cover output no longer truncates role-matching alternatives at five, so a selected conditional profile is not hidden by an arbitrary display limit. Repair-state recommendations also warn when a lower-order all-rounder is only a partial repair option rather than a specialist middle-order batter.

## Verification performed

- Current squad/XI engine matrix: 4,770 engine runs and 816,690 complete XI assignments evaluated (180 retained-only contexts and 4,590 acquisition-package contexts), with zero invalid/empty contexts.
- Current historical Match Lab matrix: **2,625 actual `recommendMatchImpact()` runs** across all 14 mapped venue labels plus unknown-ground control × 7 surface selections × 5 opposition profiles × 5 match states. Result: 2,625 valid, zero invalid, zero empty recommendations. All 14 full venue-dropdown labels were separately checked against their intended historical numeric IDs.
- Controlled first-choice comparison: venue changed the leader in 0/50 groups; manual surface changed it in 195/375; opposition profile changed it in 195/525. In the selected package, this means historical venue evidence informed some player metrics but did not overturn the first-choice role recommendation. This null result is retained, not disguised.
- Full 20-profile lookup verified; the official released-player list reconciles 19 as released-but-registration-unverified, and Daryl Mitchell remains unresolved. The standard single/pair selector excludes Pathirana because of the separate medical gate; the broader hypothetical package can include him only with an explicit assumption.
- Acquisition package sizes 0–6 and over-cap/blocked-candidate graceful degradation verified.
- Flexible XI-change policy 0–6 verified; valid search combinations rose from 1 at limit 0 to 22,260 at limit 6 in the targeted test scenario.
- All 19 retained-player absence cases checked; 16 returned an alternative XI and three genuine cover gaps remain: Dhruv Jurel, Vaibhav Sooryavanshi and Yashasvi Jaiswal.
- Batting-first, chase and defence match-state calculations and cricket-over notation checks executed against the actual domain module.
- TypeScript/TSX syntax transpilation: 78 files, zero syntax diagnostics after adding the Auction Strategy Simulator.
- Local imports/assets: 123 references checked, zero unresolved paths.
- Added portable `scripts/validate-impact-player-matrix.cjs`; after installing project dependencies, run `node scripts/validate-impact-player-matrix.cjs` from the repository root to reproduce the 2,625-run actual-engine matrix and regenerate the CSV/JSON evidence files.
- Focused strict TypeScript semantic check passed for the decision engine, decision data, recruitment domain and shared War Room data modules.
- Three current domain/data test files were executed through a local Vitest-API compatibility shim after updating the market-status assertions: **44 passed, 0 failed**. This is not a native Vitest run.

## Not verified here

Native `bun run test`, `bun run lint`, Vite client/SSR production builds and browser interaction/responsive QA were not run because Bun and project dependencies are unavailable in this environment. No production certification is claimed. The visual system has been updated in source but has not been certified in a rendered browser here.

## Strategy and model limits

The XI optimizer is deterministic and role/constraint based. Its score is a transparent heuristic, not a calibrated player-quality or suitability model, performance forecast or win probability. Match Lab now includes out-of-fold, context-adjusted phase residuals and sample-shrunk player/ground and player-vs-style splits as tie-breakers within close role-fit bands. The expected-runs context model improves 2026 holdout RMSE by only about 1% and worsens MAE; venue ID does not improve the holdout. The historical player metrics are uncertain comparative evidence, not calibrated predictions. The project contains no validated auction price/demand model, injury forecast, live registration feed, official medical clearance, current pitch/weather data, expected-wicket or win-probability model, spatial delivery coordinates or DLS model. Historical Impact Player flags lack substitution timestamps and match-state fields, so they are descriptive usage only. A hypothetical medical toggle is not medical clearance; released does not mean registered. The starting-XI suggestion is not proof of official match-day substitute nomination.

The current package is the strongest code candidate completed in this pass. Complete the native dependency-based test/lint/build and browser QA before calling it production-ready.


## 21 November historical-data engine addendum

The user-supplied `suprr_selector.zip` has now been used to construct `src/data/historical-impact-model.json` and the `src/domain/historical-impact.ts` evidence adapter. It covers 362 usable IPL matches, 86,668 delivery rows and 82,781 legal deliveries across 2022–2026. The model target is batter runs on legal deliveries; bowling comparison is batter runs against the bowler on legal balls (not reconstructed bowler runs/economy). It uses pre-delivery context features and match-grouped out-of-fold player residuals. Batter-vs-Pace/Spin and bowler-vs-LHB/RHB splits are exposure-gated and shrunk toward the broader phase metric. Venue-specific player evidence is used only with at least 24 legal balls and 3 matches and a stronger shrinkage prior.

The Match Lab matrix now covers 14 mapped venue names plus unknown × 7 surface selections × 5 opposition profiles × 5 match states: 2,625 actual engine runs, zero invalid and zero empty recommendations. Controlled comparison found venue-only changed the first choice in 0/50 groups for the selected test package; surface changed it in 195/375 and opposition profile in 195/525. Do not imply that Wankhede/Chepauk flipped a recommendation in that matrix. The app now reports the actual historical metric used for sorting. Full methods and limitations are in `historical-impact-model-report.md` and `impact-player-historical-matrix.md`.

## Coach-facing Auction Strategy Simulator and reference alignment — 21 November 2026

- Added `src/components/auction-strategy-simulator.tsx` inside Squad & XI Lab. It compares no-buy, one target, a two-player package and the current broader builder package using the actual squad/XI engine.
- Shows squad and overseas arithmetic, role-tag coverage before/after, XI entrants/displaced players, top-three XI options, a retained-player absence stress test, phase-level historical sample balls/matches/confidence, manual planned-bid inputs, package spend, purse balance and market/medical gate warnings. No walk-away price is calculated.
- Uses the dated ₹27.05 crore RR purse snapshot. It does not forecast market prices; the historic released-player salary field is explicitly not used as a 2027 bid estimate. Released-but-not-auction-listed remains not bid-ready.
- The official released-player list reconciles the two profiles previously left market-unresolved: Mahipal Lomror and Mangesh Yadav. The official PDF spells Lomror as “Lamror”; identity is supported by the official IPL player profile / MI replacement announcement. Mangesh Yadav is listed under RCB. Daryl Mitchell remains blocked as unresolved.
- Updated typography to DM Serif Display without forced uppercase, changed the navigation active treatment to gold/title case, and adjusted the home-page headline to mirror the supplied Emergent reference's editorial question-led layout. The existing stadium hero, crest and five-workspace architecture remain.
- Updated the Pathirana checkbox copy so it cannot be mistaken for medical clearance.



## Auction Strategy Simulator v1 domain test

- Added `scripts/validate-auction-simulator-packages.cjs` and a `validate:packages` npm script. It reproduces no-buy, single, pair and six-player package cases against the current domain engine, checks legal XI and squad/overseas limits, reconciles the 19/20 released-profile count, and tests Pathirana with and without the explicit medical assumption.
- Current result: passed all four package scenarios; legal XI sizes and roster caps held; Pathirana's medical gate behaved as expected. This does not test React rendering or UI input events.


## 21 November 2026 — follow-up budget-control cleanup

- Removed walk-away ceiling inputs and the corresponding totals/warnings; the former logic only compared manual numbers and did not calculate a defensible stop price.
- Removed the uncalibrated XI-fit-per-crore ratio.
- Retained planned-bid inputs only for package spend, purse remaining and within/over-purse status.
- Added `docs/USER_GUIDE.md` explaining the dashboard from a coach/user perspective.
- Re-ran the package and Impact Player domain validators.


## Follow-up interaction refinement — 21 November 2026

- Added a reusable tube-style XI rail: eleven numbered player capsules in one smooth horizontal frame, plus a separate twelfth Impact Player slot. It is used for generated XIs in Squad & XI Lab and the selected/current XI in Match-state Lab.
- Moved the Match-state XI rail above the split control area so the full combination can be seen together on desktop; narrow screens can scroll horizontally.
- Removed the free-form outgoing-player dropdown from Match-state Lab. The domain engine now creates complete situation-based combinations by pairing the ranked eligible incoming candidates with an outgoing player chosen by the lowest role-coverage cost among valid exits.
- Each combination displays the match trigger, incoming option, outgoing option, role capabilities added/lost, why the incoming player fits, why the outgoing role is selected, and a before/after constraint audit.
- Added regression coverage for complete combinations across batting acceleration, innings repair, first-innings platform and defending death-over states.
- Improved the Auction Room and War Room language to distinguish a genuine preferred-XI improvement from depth/absence cover; a recruit who stays outside the best XI is not described as an XI upgrade.
- The combination selector is deterministic role/constraint logic, not a trained Impact Player-choice model. Historical in/out flags still lack substitution-time match-state labels and remain descriptive only.

## Follow-up: coach-readable reasons and full-width XI display — 21 November 2026

- The Squad & XI Lab player-tube rail now occupies the full width of each XI option card, rather than the left half of a split panel. It uses the same 11-tube + Impact Player frame as Match-state Lab.
- The Impact Player recommendation card now spells out the match situation, required role, incoming player's supplied role profile and (where available) phase metric, sample size, match count and confidence. Historical figures are described as tie-break evidence only, never as a next-innings forecast.
- Internal role-tag names are converted into coach-readable labels in the generated rationale.
- Outgoing-player rationale explains that the engine selected the least disruptive valid exit under its role-coverage heuristic, and warns that tags do not prove specialist workload or like-for-like ability.
- Corrected Match Lab's historical phase calculation so the legal-ball count is established before the phase label is derived.

## Five-season-led War Room home — 21 November 2026

- Rebuilt the home-page narrative around the RR 2022–2026 league trajectory, followed by postseason conversion, explicit gap finding, and then the squad/recruitment/match-state workflow.
- Added `src/data/season-review.ts` with five 14-match league-stage rows and separately held postseason routes/final tournament places. This avoids mixing league matches and knockout matches in one comparison. In 2026, the league finish (4th) and final tournament finish (3rd) are shown separately.
- Official RR history source: https://www.rajasthanroyals.com/latest-news/rajasthan-royals-indian-premier-league-results-win (published 29 May 2026). Added the data definitions, source boundary, and reconciled sums to `docs/season-review-methodology.md`.
- Reconciled five-season league totals: 70 league matches, 36 wins, 33 losses, 1 no-result, 73 points; 51.4% wins when the no-result remains in the denominator. Playoffs: 3 campaigns, 7 matches, 3 wins, 4 defeats.
- The gap finder distinguishes (a) Indian pace depth and phase competition, (b) middle-order innings repair, and (c) retained-player absence stress tests. It labels scorecard observations separately from role-gap interpretation and does not claim that one recruit explains or fixes a historical result.
- Preserved explicit counter-evidence: top-order options are retained; lower-order hitters and all-rounders are already present; four spin options are listed; a generic finisher or spinner is not treated as a default buy. Pathirana remains described as injury-prone, with medical/workload clearance and registration verification as separate gates.
- Added tests for the five-season row count, 14-game league basis, 2026 league-versus-overall placing, and seven-match playoff record reconciliation.


## Final senior-analyst content pass — 22 November 2026

A no-new-input refinement was made to the War Room Gap Finder only. The pace case now explicitly distinguishes retained fast-bowling headcount from death-over redundancy and injury cover; the middle-order case includes the confirmed Hetmyer release and acknowledges retained partial-role cover; absence outputs are described as modeled scenario coverage rather than accuracy. Historical Tewatia/Morris references are labelled role precedents only. The target list/order, acquisition candidate data, squad engine, auction simulator and Impact Player logic were left unchanged. See `docs/gap-finder-methodology.md` and `FINAL_AUDIT.md`.


## Superseded UI detail — 22 November 2026

The earlier note describing a separate twelfth Impact Player slot reflects a superseded interface iteration. The current team sheet shows exactly eleven starters; Match Lab separately previews one-for-one substitution (incoming Impact Player / outgoing starter). See `docs/USER_GUIDE.md` and `docs/PRODUCT_FLOW.md`.
