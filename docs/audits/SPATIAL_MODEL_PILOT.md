# Kadamba 25-zone spatial and prediction pilot

**Status:** Experimental historical IPL tracking analysis. Suitable for method demonstration only; not a live bowling recommendation or player-specific forecast.

## What the page does

The `/spatial-lab` workspace displays a 5×5 descriptive grid with 25 pitch-impact bins. A user can select a zone, inspect the tracked sample and switch the mapped values between observed outcomes, context-only out-of-fold predictions and context-plus-location out-of-fold predictions. The outcome toggle shows batter runs per legal delivery or bowler-credited wicket probability.

“Kadamba” is this project's name for the neutral 5×5 display. It is not presented as an official Hawk-Eye, ICC or RR zone standard. `L1–L5` and `Y1–Y5` are neutral bins. We do not label off-side/leg-side or short/full until the source axis origin and orientation are independently established.

Critically, the per-zone prediction cards are averages of held-out predictions for deliveries that actually landed in each cell. They are not a simulation of deliberately bowling a future ball into that cell, and they are not an intervention/causal estimate.

## Source and provenance

Input: `mensIPLHawkeyeStats.csv`, supplied by the project owner. SHA-256:

`138b861f4e72739eff00c6ccb73f80eb5b27f722112d4cefbb957c5a083f2262`

Public source repository: <https://github.com/alittlefitness/HawkeyeStats>. Its repository describes the structured data as Hawk-Eye statistics made available through the ICC PulseLive cricket API. This is a community-maintained third-party redistribution, not an RR-provided feed or a directly licensed Hawk-Eye/ICC feed. The raw CSV is deliberately not bundled in the app archive; only reviewed aggregate metrics and zone values are included. Confirm usage and redistribution permissions before external publication. Cricsheet also cautions that Hawk-Eye material is likely copyrighted: <https://cricsheet.org/>.

Reference study: Yuvaan Pandey, *Does the “Good Length, Outside Off” Wicket Hotspot Survive Match Context? A Calibrated Ball-Tracking Model for Twenty20 Cricket*, icSPORTS 2026, <https://www.scitepress.org/PublishedPapers/2026/153068/>. The study reports 135,174 modelling deliveries. This independent pipeline retains 135,587, a 413-row difference. The reason is unresolved; this implementation is not an exact reproduction of that paper.

## Raw data audit and filters

| Audit item | Rebuilt value |
|---|---:|
| Raw delivery records | 149,424 |
| Match IDs | 628 |
| Unique `(matchId, delivery)` keys | 149,424 |
| Duplicate match/delivery keys | 0 |
| Pitch X/Y pair missing | 5,053 (3.382%) |
| `ballSpeed < 5 m/s` sentinel rows | 8,895 (5.953%) |
| Main-innings records | 149,295 |
| Legal main-innings deliveries | 144,331 |
| Model rows with plausible pitch coordinates | 135,587 |
| Matches in spatial model | 627 |
| Non-empty 5×5 zones | 25/25 |
| Smallest / median / largest zone | 74 / 2,761 / 24,011 deliveries |
| Bowler-credited wicket events in model | 6,335 |
| Bowler-credited wicket prevalence | 4.6723% |

The filter retains legal deliveries in innings 1 and 2, requires model outcome/context fields and applies `pitchX ∈ [-1, 1] m` and `pitchY ∈ [0, 13] m`. These are conservative QC bounds used by the reference study, not an assertion that every source feed shares one universal coordinate contract. Values outside the box are excluded rather than clipped. Wides and no-balls are not legal-ball model rows. `ballSpeed < 5 m/s` is treated as a failed measurement and set to missing.

### Dismissal-state correction

The source has both `retired hurt` and `Retired (hurt)` spellings. Both must be excluded from the wickets-in-hand state. Bare `Retired` remains a team dismissal. The rebuilt script normalizes both retired-hurt spellings as non-wickets. The classification target is separately restricted to bowler-credited wicket types.

## Spatial representation

- 5 equal-width lateral bins (`L1`–`L5`) × 5 equal-width longitudinal bins (`Y1`–`Y5`).
- Lateral coordinates are mirrored for left-handed batters to create a batter-relative frame.
- Axis origin and sign semantics remain unverified, so no off/leg or short/full naming is inferred.
- `fieldX`/`fieldY` are post-shot landing coordinates and excluded as predictors.
- `stumpsX`/`stumpsY` are excluded because their timing semantics have not been independently established.
- Player identifiers, dismissal text and outcome labels are excluded from the predictor set.

## Prediction experiment

One fixed LightGBM configuration was evaluated with three-fold `GroupKFold` split by match. The same retained sample was used for paired comparisons. This is match-grouped cross-validation, not a chronological holdout, repeated cross-validation, full calibration analysis or hyperparameter search.

### Batter runs per legal delivery

| Model | MAE | RMSE |
|---|---:|---:|
| Location only | 1.1718 | 1.6102 |
| Context only | 1.1702 | 1.6041 |
| Context + location | 1.1582 | 1.5897 |

Adding location to context reduces MAE by 0.0120 runs per legal delivery, approximately **1.025%**; RMSE falls by approximately **0.90%**. This is a modest gain. Location-only is worse than context-only, so a heatmap alone is not a useful replacement for match context.

### Bowler-credited wicket probability

| Model | Average precision | Brier | ROC-AUC |
|---|---:|---:|---:|
| Context only | 0.07475 | 0.044154 | 0.60432 |
| Context + location | 0.08113 | 0.044025 | 0.62322 |

Base prevalence is 4.6723%. Absolute Average Precision gain is **0.00637**. The model remains a rare-event predictor with modest discrimination; it is not a high-confidence wicket forecaster.

### Match-cluster bootstrap

A paired 1,000-resample bootstrap samples matches and reweights the existing out-of-fold predictions. It does **not** refit models in each resample. Percentile intervals:

| Metric improvement (positive favours context + location) | Point estimate | 95% interval |
|---|---:|---:|
| MAE reduction (runs/ball) | 0.01200 | 0.01054 to 0.01344 |
| RMSE reduction | 0.01443 | 0.01330 to 0.01555 |
| Wicket Average Precision gain | 0.00637 | 0.00460 to 0.00806 |
| Brier reduction | 0.000129 | 0.000101 to 0.000156 |

These intervals are conditional on the fixed models' existing out-of-fold predictions. They quantify match-resampling variability in those predictions; they do not include model-refit uncertainty, chronological drift, tracking-selection bias or uncertainty from choosing model/features.

## Model inputs and leakage controls

Context features: over/phase, innings, legal balls before the delivery, balls remaining, wickets before the delivery, wickets in hand, score before the delivery, current run rate, required run rate and cleaned ball speed, plus bowling style and handedness categories. Spatial features are batter-relative lateral pitch coordinate and longitudinal pitch coordinate.

Outcome targets are `batterRuns` and a separate bowler-credited dismissal indicator. Pre-ball score/wickets/legal balls are reconstructed by sorting the full delivery sequence (including extras) and shifting cumulative totals. The second-innings target is first-innings total + 1; DLS/revised-target handling is not available. Ball speed is an observed delivery characteristic, not known before the ball is released; therefore the context model is best interpreted as a post-release/ball-tracking assessment, not a pre-delivery selection forecast. This limitation is shown directly above the interactive zone map.

## What the model cannot support

1. No dates, season, team or venue fields exist in this CSV. `matchId` does not safely join the project's 2022–2026 IPL competition archive. No player/match crosswalk is available.
2. Tracked-ball availability is selective. The tracked deliveries may not represent all IPL deliveries or all player/venue populations.
3. The 413-row discrepancy with the 2026 paper remains unresolved.
4. No chronological holdout, external season validation, refit bootstrap, global or per-zone probability calibration audit, or subgroup calibration has been completed. Read wicket percentages as uncalibrated model estimates rather than literal event-risk guarantees.
5. The zone map cannot yet make verified off-side/leg-side or short/full tactical claims.
6. The model does not feed pressure rankings, RR recruitment priorities, Match-State/Impact Player recommendations or player-specific bowler assessments.
7. It does not estimate what would happen if a bowler deliberately targeted a cell. Observed location-outcome association is not a causal intervention estimate and does not adjust for field settings or batter/bowler identity.
8. No rights/redistribution clearance is asserted for the source CSV.

## Rebuild

Install `scripts/spatial/requirements.txt`, obtain the source CSV under its applicable terms, then run:

```bash
python scripts/spatial/build_spatial_pilot.py \
  --input /path/to/mensIPLHawkeyeStats.csv \
  --output-dir ./spatial-output
```

The script writes `spatial_model_pilot.json` and `pitch_zone_descriptive_summary.csv`. The app consumes the reviewed JSON at `src/data/spatial/spatial-model-pilot.json`. Validate it with:

```bash
node scripts/spatial/validate_spatial_pilot.cjs
```
