# SupeRR Selector S2 — Evidence Retrospective

## Scope boundary

The supplied `suprr_selector.zip` contains a Season 2 pipeline, a `decision_log.md`, output rankings, validation exports and the source data package. It does **not** contain a distinct Season 1 candidate-ranking corpus, a complete historical recommendation decision log across prior seasons, or reliable post-recommendation outcome tracking.

Therefore this is a retrospective on the Season 2 methodology and its reproducibility, not a multi-season recruitment hit-rate study. IPL 2027 has not yet been played in this planning snapshot, so no 2027 recruitment outcome can be scored.

## What the S2 methodology did well

1. **It separated player quality from recruitment utility.** The project framed targets against RR's retained-squad role gaps rather than publishing a generic best-player leaderboard.
2. **It separated squad additions from starting-XI changes.** The number of roster additions and the strategic limit on changes to the reference XI are separate controls; they should not be conflated.
3. **It gated weak samples.** The pipeline used minimum exposure thresholds (100 balls and 8 matches) for pressure estimates and explicitly retained no-estimate / low-sample labels instead of filling gaps with invented values.
4. **It documented data exclusions and approximations.** Revised-overs matches, super overs and matches without ball-by-ball rows were handled explicitly; the decision log records the chosen extras reconstruction and its measured error.
5. **It avoided an unsupported auction-price model.** The supplied evidence did not support a defensible bid-price forecast, so the current app should continue to use manual planned bids for budget scenarios rather than invent player valuations.

## Reproducibility and data decisions recorded in `decision_log.md`

| Topic | Logged S2 decision / finding | Interpretation |
|---|---|---|
| Match counts | Before exclusions: 367 IPL, 30 Emerging, 470 T20I. After revised-overs exclusions: 362 IPL, 30 Emerging, 441 T20I; 833 total. | The denominator changes materially after exclusions; summaries must name their filters. |
| Incomplete match coverage | 16 matches had no ball-by-ball rows. Six super-over matches contributed 38 super-over rows; regulation innings retained, tied-match regulation win-probability label set to missing. | Match and delivery counts are not interchangeable. |
| Delivery rows | 200,999 raw rows less 4,433 revised-overs rows and 38 super-over rows = 196,528 retained rows; last ball of 1,653 innings retained. | The preprocessing log gives a checkable accounting trail. |
| Extras reconstruction | Approximation `extras_runs = 1 + extras_2_runs` for each extras delivery; tested against 396 run-margin results, with 31.8% exact and median absolute error 1.5 runs. | Useful for exploratory feature construction, but not an official scorecard reconstruction. |
| Pressure gate | Per-chase top-20% leverage union first-innings overs 17–20. | A specific operational definition; changing it changes the rated population. |
| Pressure reliability | Split-half reliability reported as BAT 0.296 / BOWL 0.144; lower than desirable. | Pressure-only rankings contain substantial noise, especially bowling. |
| Predictive advantage | Sign of pressure-vs-general advantage flips across designs; decision log reports no consistent advantage. | Do not claim pressure-specific superiority as an established finding. |
| Calibration / validation discrepancies | Several handover figures were not reproduced exactly; logged Brier, calibration-slope, era-test and reliability differences. | Keep original-vs-reproduced values visible; do not silently choose the more flattering number. |

## What should be corrected in the current War Room

- Do not let ordinal `rank: 1–10` drive operational logic unless a reproducible scoring method is defined. In this revision the simulator's backup alternative is selected using role overlap, not ordinal rank.
- Keep a clear difference between a statistical estimate, a low-sample scouting note, a role-fit judgement and a registration/medical gate.
- Keep market status dated and visible. “Released” is not synonymous with “registered for auction”.
- When a historical evidence layer is shown to be inert in a controlled comparison, change its UI emphasis; do not bury the result in internal documentation.
- Preserve model-quality caveats at the point where users see the metrics.
- Do not represent the current dataset as evidence of multiple prior seasons' recommendation success. The supplied package cannot support that claim.

## What cannot be concluded from the supplied material

The archive does not support a reliable historic “recommendation hit rate”, “missed target rate”, or causal estimate of how a past recommendation would have changed an RR season. That requires a persistent recommendation log, actual auction/acquisition outcomes, role/deployment records and subsequent player performance. Those linked records are not present in the supplied package.
