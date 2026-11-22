# RR five-season review — data definitions and audit trail

**Window:** IPL 2022–2026  
**Snapshot created:** 21 November 2026  
**Primary source:** [Rajasthan Royals — IPL season history](https://www.rajasthanroyals.com/latest-news/rajasthan-royals-indian-premier-league-results-win), published 29 May 2026.

## Why the interface separates league and post-season results

The official RR history page has both a season-by-season narrative and a summary table. The narrative gives the league-stage position and record. The end summary table marks certain seasons with an asterisk and states that their Played/Won/Loss/NR totals **include knockout matches**. The UI therefore uses the narrative's 14-match league-stage records for like-for-like comparison and keeps knockout routes in separate fields.

This resolves a material comparability problem in the earlier draft, which combined league and playoff matches in one table and treated the 2024 no-result as a generic loss/other. The page does not present a single five-year `matches-won-lost` total as a league-stage metric.

## Season data

| Season | League W–L–NR | Points | League position | Post-season route | Tournament finish |
|---|---:|---:|---:|---|---|
| 2022 | 9–5–0 | 18 | 2nd | Qualifier 1 loss → Qualifier 2 win → Final loss | Runner-up |
| 2023 | 7–7–0 | 14 | 5th | Missed playoffs | 5th |
| 2024 | 8–5–1 | 17 | 3rd | Eliminator win → Qualifier 2 loss | 3rd |
| 2025 | 4–10–0 | 8 | 9th | Missed playoffs | 9th |
| 2026 | 8–6–0 | 16 | 4th | Eliminator win → Qualifier 2 loss | 3rd |

The 2026 distinction is deliberate: RR finished **fourth in the league phase**, then won the Eliminator and lost Qualifier 2, finishing **third overall**. Do not collapse those two placements into one unlabeled number.

## Reconciled aggregates

- League phase: 70 matches, 36 wins, 33 losses, 1 no-result; 73 points.
- League win rate: 36 / 70 = 51.4% (the denominator includes the no-result match).
- Playoffs: three campaigns, seven matches, three wins and four defeats.
- RR reached the playoffs in 3 of these 5 seasons.

These aggregates are simple sums of the season rows above. They are not forecasts or evidence of why RR performed as they did.

## What can and cannot be inferred

**Supported by the history:** RR's league positions across the window were 2nd, 5th, 3rd, 9th and 4th. RR reached three playoff campaigns, reached the 2022 final, and exited at Qualifier 2 in 2024 and 2026. There was a recovery from ninth in 2025 to fourth in the 2026 league phase.

**Not established by the history alone:** the role, player, tactical or injury cause of those changes; that a specific recruit would have improved a past outcome; that retention count caused champion success; or that a high-retention / low-change selection model is superior. The product uses scorecards, the seven RR playoff matches, the three detailed phase investigations and the 19-player retained-role audit to form narrower hypotheses. Those are discussed as hypotheses and not causal proof.

## Source boundary

The RR history page is the primary source for the five-season league positions/records and tournament finishes. Detailed playoff scorecards and phase investigations are documented separately in the supplied technical report and `docs/PRODUCT_FLOW.md`. Phase figures from the supplied ball-by-ball export are labelled **batter-run components**, not official phase totals, because extras are categorical in the source export. In particular, the 2026 Qualifier 2 reconstruction remains seven runs short of the official scorecard total; do not present that reconstructed innings total as a match score.
