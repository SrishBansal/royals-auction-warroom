# Match Lab — historical venue, surface and opposition permutation report

**Date:** 21 November 2026  
**Code under test:** current `recommendMatchImpact()`, `resolveVenueSurface()` and `getHistoricalPlayerEvidence()` TypeScript source  
**Historical data:** user-uploaded `suprr_selector.zip`, IPL 2022–2026  
**Method:** direct execution of the actual TypeScript domain modules via a Node/TypeScript transpilation harness; recommendation scoring was not reimplemented.

## 1. Test design

- Venue cases: **15** (14 analyst-mapped historical ground names plus an unlisted/unknown-ground control).
- Track selector values: **7** (`venue-default`, `neutral`, `slow`, `dry`, `dew`, `pace-friendly`, `bouncy`).
- Opposition profiles: **5** (`balanced`, `spin-heavy`, `pace-heavy`, `left-hand-heavy`, `right-hand-heavy`).
- Match states: **5** (first-innings platform, chase acceleration, chase collapse, early defensive partnership, late death defence).
- Active squad pool: 19 retained players plus 6 explicitly selected hypothetical profiles (Mitch Owen, Matthew Breetzke, Nitish Rana, Abishek Porel, Avesh Khan, Akash Madhwal); 25 total.
- Total: **2,625** actual Impact Player recommendation runs.
- Before scenario execution, the harness verifies that each of the 14 complete venue labels shown in the Match Lab dropdown resolves to the expected numeric venue ID. This check caught and fixed a mismatch in the full Chepauk dropdown label.

## 2. Structural results

- Valid recommendation states: **2,625 / 2,625**.
- Invalid states: **0**.
- Empty recommendations: **0**.
- Distinct first-choice player names observed across the matrix: **8** (Abishek Porel, Akash Madhwal, Avesh Khan, Brijesh Sharma, Mitch Owen, Nitish Rana, Sandeep Sharma, Yash Raj Punja).

Every returned first-choice candidate was a member of the explicitly active selected squad and was outside the current XI. The test also checked the overseas-XI gate. A recommendation from this engine is a tactical squad-pool option, not verification of the official match-day nominated substitute list.

## 3. Controlled one-variable comparisons

Each controlled comparison changes one setting at a time while keeping the other dimensions fixed. “Changed” means the first-choice player name changed; it does not measure a probability or model accuracy.

| Variable changed | Controlled groups | Groups where first choice changed |
|---|---:|---:|
| Venue (historical ground selection) | 50 | 0 |
| Track selection (venue default vs manual surface choices) | 375 | 195 |
| Opposition profile | 525 | 195 |

**Important observation:** in this selected 25-player active package, changing venue alone changed the first-choice recommendation in **0 of 50** controlled groups. The model did use venue-specific player evidence where the player’s local sample passed the minimum gate, but in this test the tactical role scores were strong enough that ground-specific evidence did not overturn the leader. This is deliberately reported as a null result; the system does not force a different player simply because the ground name changes.

Changing the manual surface selection changed the leader in the listed groups because the manual surface is an explicit broad role-balance assumption. Changing the opposition profile also changed the leader in some groups because the engine can use the selected player’s historical phase-specific pace/spin or handedness split where sample gates pass, in addition to curated role tags. These are scenario behaviours, not proof that a real future opposing XI or pitch will behave the same way.

In the 2,625 rows, the **top recommended player** had a qualifying player/ground adjustment in 300 cases and a qualifying opponent-style adjustment in 615 cases. This is a count of the evidence flags for the first-choice profile only; the candidate evidence panel also exposes the top three candidates' sample details. It is not a count of prediction wins or recommendation accuracy.


### Ground-sample trace (selected examples)

The following rows show how actual player/ground samples are handled in the same selected 25-player package. The recommendation remains the same in these examples, but the ground evidence is only applied when both the legal-ball and match-count gates pass.

| Match state / recommended player | Ground | Player phase sample | Ground-specific sample | Ground adjustment used? |
|---|---|---:|---:|---|
| First-innings platform / Nitish Rana | Wankhede | 546 balls / 40 matches | 75 balls / 5 matches | Yes |
| First-innings platform / Nitish Rana | Chepauk | 546 balls / 40 matches | 29 balls / 1 match | No — match-count gate fails |
| First-innings platform / Nitish Rana | Jaipur | 546 balls / 40 matches | 26 balls / 3 matches | Yes |
| Death defence / Akash Madhwal | Wankhede | 106 balls / 14 matches | 30 balls / 4 matches | Yes |
| Death defence / Akash Madhwal | Chepauk | 106 balls / 14 matches | 9 balls / 2 matches | No — both gates fail |
| Death defence / Akash Madhwal | Jaipur | 106 balls / 14 matches | 12 balls / 2 matches | No — both gates fail |

This illustrates why a venue choice does not automatically change the first pick: the engine needs the candidate to have relevant historical sample in the relevant phase, and it shrinks local evidence toward the broader phase record. A small ground sample is displayed but not used.

## 4. Example first-choice outputs

| Match state | Wankhede | Chepauk | Jaipur |
|---|---|---|
| first innings platform | Nitish Rana | Nitish Rana | Nitish Rana |
| chase collapse | Nitish Rana | Nitish Rana | Nitish Rana |
| defend early partnership | Yash Raj Punja | Yash Raj Punja | Yash Raj Punja |
| defend death | Akash Madhwal | Akash Madhwal | Akash Madhwal |

These rows show why the venue-only comparison is zero for the selected package: role fit and current match state dominate the first choice in these representative examples. The candidate evidence panel still exposes local ground samples and the final combined metric so an analyst can see when historical ground evidence exists and how much exposure supports it.

## 5. How the historical metric enters the ranking

1. The engine first filters the candidate pool to non-XI members who are retained or explicitly selected as hypothetical acquisitions and who pass market/medical gates.
2. It computes the current tactical role score from innings mode, phase, wickets, score/required rate, the selected broad surface assumption and curated player role tags.
3. Candidates are grouped into contiguous tactical role-fit bands no more than five role points below the band leader. Historical performance is not permitted to overcome a larger tactical mismatch.
4. For a batter, the historical metric is context-adjusted batter runs added per 100 legal batting balls. For a bowler, it is context-adjusted batter runs prevented per 100 legal balls against that bowler. Positive is favourable in both definitions. The bowling metric is **not** official bowler economy or total bowler runs conceded.
5. If the analyst selects `pace-heavy` or `spin-heavy` for the opposing bowling profile, a batter’s phase-specific split against that recorded bowling type is used only when there are at least 48 balls across 4 matches, then shrunk toward the broader phase record. If the analyst selects `left-hand-heavy` or `right-hand-heavy` for opposition batting, a bowler’s phase-specific split against LHB/RHB is handled the same way.
6. If the selected ground maps to a numeric historical venue ID, a player’s own phase/ground split is used only with at least 24 legal balls across 3 matches and is shrunk more conservatively toward the style-adjusted phase prior. The ground aggregate itself does not imply a physical track type.
7. The same combined `tieBreakContextMetricPer100` is used for sorting and displayed in Match Lab. Candidates with no historical IPL sample remain eligible on role scouting and are not assigned an invented value or penalised for missingness.

## 6. Ground mapping and data limits

The uploaded archive has numeric `venue_id` values but no official stadium-name table. Fourteen recurring numeric IDs are mapped to ground names through analyst-curated mappings based on repeated home-team concentration. Mapping confidence and basis are stored with the model; four other IDs remain unnamed. The exact mapping and sample counts are in [`historical-impact-model-report.md`](historical-impact-model-report.md). The UI accepts complete canonical names and curated aliases only. A generic city or partial string does not silently identify a ground.

The archive has no prepared pitch report, weather, dew, ball condition or fixture-time ground state. The app does not infer that Chepauk is slow or Wankhede is bouncy. Historical ground/player splits are descriptive past records and may reflect different teams, players, seasons and context. The optional track selector is an analyst assumption, not retrieved evidence.

## 7. Why this is not a trained Impact Player-choice prediction model

The archive has 558 incoming and 558 outgoing Impact Player flags across IPL 2023–2026, in 291 matches with an incoming record. It does not include the exact substitution over/time, score, wickets, innings phase, official nominated alternatives or a complete snapshot of who was eligible at the decision point. Therefore the flags cannot validly train a model of “who should come in at 8 overs when 45/3” or similar. The application reports historical usage descriptively only and ranks candidates using the independent role/state/evidence process described above.

## 8. Historical context-model validation

The embedded player residuals come from a shared pre-delivery expected-batter-runs context model. On the chronological 2026 holdout, the venue-blind version improved RMSE by about 1.08% compared with a simple phase/innings/pace-spin baseline, but its MAE was about 1.07% worse. Adding venue ID did not help. The model is not calibrated for next-ball outcomes, wickets, match win probability or Impact Player selection. Historical residuals are a cautious ranking signal only. See [`historical-impact-model-report.md`](historical-impact-model-report.md) for exact metrics, features, data scope and source limitations.

## 9. Reproduction

The matrix is reproducible from the repository root after `bun install` using `node scripts/validate-impact-player-matrix.cjs`. The script runs the actual TypeScript domain code and verifies all 14 dropdown labels map to their expected numeric IDs before evaluating the scenarios. The exact per-row outputs, top-three candidate evidence samples, venue IDs, surface selection, opposition profile and match state are retained in [`impact-player-historical-matrix.csv`](impact-player-historical-matrix.csv) and [`impact-player-historical-matrix.json`](impact-player-historical-matrix.json).

**Interpretation boundary:** these 2,625 runs validate deterministic wiring, constraints and the behaviour of scenario/evidence ranking. They do not establish prediction accuracy on future matches. The context model itself has modest and mixed holdout performance, and the Impact Player flag data cannot support state-conditioned supervised learning.
