# IPL Pressure Rankings Lab — methodology and limitations

**Status:** experimental, fixed supplied-data snapshot. **Scope:** IPL only, 2022–2026 inclusive. T20I records are excluded.

## Dataset audit

The supplied IPL competition register contains 371 match records. The ball-by-ball file contains delivery rows for 367 unique IPL matches; four scheduled records have no delivery rows and are excluded from all player calculations. The application reports both counts rather than presenting the delivered sample as the complete schedule.


- IPL matches represented: 367
- Recorded delivery rows: 87,687
- Pressure legal deliveries: 27,687
- Source ball-by-ball SHA-256: `a3926f49d2c684dca2a5d2de535a02c5ee46ea654ca1e79dd31c69e7544e9889`
- Eligible batters after sample gates: 86
- Eligible bowlers after sample gates: 89

## Pressure definition

A delivery is included when at least one of the following observable conditions applies:

1. Death overs 16–20.
2. Middle overs 11–15 after at least four wickets have fallen before the delivery.
3. Over 11 onwards in a Qualifier, Eliminator or Final.
4. Super-over innings (innings 3 or 4).

This is a **phase-and-wicket-stress proxy**, not a complete measure of game pressure. It does not claim that every death over is close or that every knockout ball is equally stressful. The source does not safely support required run-rate, chase margin or bowling economy reconstruction: `extras1_runs` is a categorical code, not an extras-run amount. Those signals are excluded.

## Batter index

Eligibility: at least 60 pressure legal balls and 150 total IPL legal balls. Batter runs per legal ball are measured from the `runs` field. Wide and overstep/no-ball events are excluded from balls faced; batter runs are still accumulated from the event rows. Dismissals are attributed using `dismissed_player_id`, including run-outs as a batter survival outcome.

Pressure strike rate is shrunk toward the player's IPL baseline using a 60-ball prior. The index is a weighted percentile composite: 50% shrunk pressure strike-rate percentile, 30% pressure-retention percentile, and 20% inverse pressure-dismissal-rate percentile.

## Bowler index

Eligibility: at least 90 pressure legal balls, 180 total IPL legal balls and five bowler-credited pressure wickets. Bowler-credited dismissals exclude run-outs, retirements and obstruction dismissals. The index uses 55% shrunk pressure wickets per 100 legal balls, 30% retention versus baseline wicket rate, and 15% pressure-wicket volume percentile. Economy is deliberately omitted because extras cannot be reconstructed reliably from the supplied categorical field.

## Reliability check

An odd/even match-ID split is reported in the dataset JSON. It is descriptive, not a chronological holdout. Low agreement should be read as evidence that ordered ranks are unstable—not hidden or averaged away.

## Interpretation

The displayed Top 10s are exploratory IPL-only shortlist outputs from this fixed 2022–2026 data snapshot. They are **not** statistically certified all-time IPL pressure rankings, not career rankings, not a player-vs-bowler matchup model, and not RR recruitment targets. Use sample counts and uncertainty labels alongside rank. Rebuild the data and rerun all validations before any external submission.
