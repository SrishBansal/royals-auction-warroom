# Playoff Phase Component Source Reconciliation

## Question investigated

The Playoff Evidence chart showed 36 batter-run components in overs 16–20 in three different innings. An independent audit correctly flagged the identical values for verification, but could not prove they were wrong.

## Recalculation

I re-summed the raw `runs` (batter-run) field from the supplied data-pack `ball_by_ball.csv`, grouped by match, innings and `overid`:

| Case | Match ID | Innings | Powerplay batter runs (1–6) | Middle batter runs (7–15) | Death batter runs (16–20) | Raw batter runs |
|---|---:|---:|---:|---:|---:|---:|
| IPL 2022 Final · RR innings | 15190 | 1 | 43 | 49 | 36 | 128 |
| IPL 2024 Qualifier 2 · RR chase | 31291 | 2 | 49 | 49 | 36 | 134 |
| IPL 2026 Qualifier 2 · GT chase | 50944 | 2 | 59 | 109 | 36 | 204 |

The repeated 36s are **confirmed in the supplied raw delivery export**. They are not a copied placeholder. The data rows end at over 19 for the 2026 chase because the innings ended before over 20.

## Score reconciliation limitation

Using the S2 pipeline's documented approximate extras reconstruction (`1 + extras_2_runs` on extras deliveries), the reconstructed innings totals are:

| Case | Batter runs | Approx. reconstructed extras | Reconstructed total | Reported scorecard total | Difference |
|---|---:|---:|---:|---:|---:|
| 2022 Final RR | 128 | 2 | 130 | 130 | 0 |
| 2024 Q2 RR | 134 | 5 | 139 | 139 | 0 |
| 2026 Q2 GT | 204 | 8 | 212 | 219 | -7 |

The 2026 seven-run gap is consistent with the source package's already-documented limitation: the export does not fully preserve all extra-run amounts (particularly bye/leg-bye amounts above one), and the reconstruction is approximate. The cause of the full seven-run difference is not fully established here.

## User-facing interpretation

- Keep the chart labelled **batter-run components**, not official team phase totals.
- The three 36 values may remain because they are verified from the supplied delivery export.
- Keep the caveat visible that the 2026 innings reconstruction is seven runs below the reported scorecard total.
- Do not infer that the repeated figure implies a copy/paste error.
