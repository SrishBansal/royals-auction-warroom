> **Historical report snapshot — 18 November 2026:** This document records the submitted recruitment methodology at that snapshot. Its statements about the application not having venue/style evidence predate the 21 November historical-impact integration. For current application behaviour, read `historical-impact-model-report.md` and `PRODUCT_FLOW.md`. The original report contents are preserved below.

# RR recruitment methodology — continuity and marginal role value

> **Role interpretation update — 22 November 2026:** The retained pace group is not treated as an empty role. Shami and Burger are preferred new-ball profiles; Archer is the premium strike option with death-over flexibility; Sandeep brings control / variations; Brijesh provides Indian pace with death cover; Sushant is developmental reserve depth. Additional pace is a selective insurance advantage, not an automatic must-buy. Hasaranga is acknowledged as a possible leg-spin + lower-order batting profile but is not prioritised because RR already have spin coverage, he would use one of three remaining overseas squad slots, and public reporting records repeated injury interruptions. See [`PACE_AND_HASARANGA_ROLE_REVIEW_2026-11-22.md`](audits/PACE_AND_HASARANGA_ROLE_REVIEW_2026-11-22.md) for sources and decision boundaries.

## Decision being supported

RR should protect the core of its 19 retained players while testing whether no acquisition, one or two targeted additions, or a broader three-to-six-player depth package creates the strongest squad. The dashboard is not a generic list of the best players in cricket. It asks which realistic, role-relevant acquisition(s) make the retained squad more complete without weakening a working combination or consuming an overseas slot without sufficient reason. Six open places are capacity, not a buying requirement.

## Starting squad constraints

- 19 retained players.
- Six open squad places; these are capacity, not required purchases.
- Five retained overseas players.
- Maximum squad size: 25.
- Maximum overseas players in squad: 8.
- Maximum overseas players in the playing XI: 4.

The product uses the supplied snapshot from 18 November 2026. It does not contain a purse simulator or a price forecast because the supplied evidence does not support a defensible auction-price model.

## Evidence-to-decision chain

1. **Retained-core review:** identify the actual primary roles and secondary skills already present. Distinguish role overlap from genuine depth.
2. **Playoff diagnosis:** use the seven supplied RR playoff scorecards and three detailed phase investigations to identify repeated problems rather than selecting players by reputation.
3. **Role-gap statement:** prioritise Indian pace depth and injury resilience; assess a specialist phase bowler only where the XI needs that skill; consider a lower/middle-order batter only when the profile changes the retained combination.
4. **Candidate assessment:** compare the player with the incumbent role, explain incremental value, show supplied evidence and make the main counterargument visible.
5. **XI consequence:** add a candidate only as a hypothetical acquisition, then recompute the squad package, starting XI, bench, overseas count, core continuity and role coverage. Squad acquisitions and starting-XI changes are separate decisions; the two-position-change rule is a strategic optimiser setting, not an IPL acquisition rule.
6. **Match-state response:** use the selected XI and actual bench to identify an appropriate role for the current innings state. A recommendation is a tactical suggestion, not a player-outcome prediction.

## What the playoff evidence says

- **2022 Final:** four wickets fell for 49 batter-run components in overs 7–15, followed by four more wickets in the death phase. This supports a middle-order resilience question, not a generic request for another finisher.
- **2024 Qualifier 2:** five wickets fell for 49 batter-run components in overs 7–15 against spin. The tactical response is a batter who can rotate, access boundary options and avoid clustered dismissals; handedness alone is not treated as a solution.
- **2026 Qualifier 2:** the opponent scored 109 batter-run components in the middle phase. The submitted report diagnoses failure to control a set partnership, not a death-over collapse.
- **2026 Eliminator:** the retained batting core demonstrated a high ceiling. This argues against buying another opener unless a clear contingency or combination benefit is demonstrated.

The phase values are batter-run components from the supplied delivery export. They are not official innings phase totals because extras are categorical in the source.

## Recruitment workstreams

### 1. Indian pace depth and injury resilience

- **Avesh Khan:** Indian multi-phase pace/depth option with a previous RR contribution (19 wickets in 15 matches in 2024, as stated in the submitted report). The report's supplied death wicket rate of 6.74 per 100 legal balls is below the retained-core median of 8.12. This is a depth/competition case, not proof of a first-choice death upgrade.
- **Akash Madhwal:** conditional Indian pace/death-depth backup. The supplied sample is small; the report flags a 2025 RR economy of 11.07 and conflicting phase exports. Do not describe him as a guaranteed closer.
- **Mangesh Yadav / Onkar Tarmale:** domestic development options with limited top-level evidence; not established IPL pressure specialists.

### 2. Specialist phase cover

- **Matheesha Pathirana:** distinct death-overs role and the highest bowler recruitment priority in the submitted report. His hamstring injury/surgery context means medical/workload clearance is a hard gate. Registration remains unverified. An analyst assumption is not clearance.
- **Trent Boult:** powerplay-first option, not a death specialist. Must justify an overseas place against the retained new-ball group.
- **Mustafizur Rahman:** left-arm angle and cutters provide variation; not a like-for-like replacement for Pathirana.

### 3. Lower/middle-order batting insurance — only if distinct

RR already retain Donovan Ferreira, Shubham Dubey, Dasun Shanaka and Ravindra Jadeja as lower-order/all-round resources. A recruit must add a distinct role rather than duplicate those options.

- **Nehal Wadhera:** natural Indian No.5 role fit in the supplied report, but 59 pressure-gated balls are below the report's 100-ball threshold. Present the role case without calling the evidence pressure-qualified.
- **Nitish Rana:** more established supplied IPL middle-order sample and a No.4/5 innings-repair profile; not a pure No.6/7 finisher.
- **Mitch Owen:** lower-order power profile supported by external BBL scouting figures, not an established IPL pressure sample; overseas slot cost matters.
- **Shimron Hetmyer:** established overseas No.6 comparison, but role overlaps retained lower-order hitters and consumes an overseas place.

## Retained-role interpretation

Dasun Shanaka must be visible as an overseas batting all-rounder in the flexible middle/lower-order block. The proposed four-overseas batting order places him at No.7, but the application must not force that position in every match. Ferreira remains a key retained lower-order and wicketkeeping option. Dubey is domestic middle/lower-order depth. Jadeja provides batting depth and left-arm orthodox spin.

The top four (Vaibhav Sooryavanshi, Yashasvi Jaiswal, Riyan Parag and Dhruv Jurel) form the normal batting spine. The XI engine uses a seven-player continuity reference and allows changes where role fit or availability warrants them; it must not present the reference as an unchangeable final XI.

## Decision engine design

The XI engine is deterministic. It enumerates valid combinations from the retained roster and explicitly selected acquisitions, then scores them against transparent role, continuity, pace, spin, overseas and objective rules. It is not a machine-learning model and does not predict match outcomes.

The Match-state engine evaluates three modes separately:

- RR batting first: phase, wickets, current scoring rate and an optional analyst-set total objective; it does not infer a par score when the objective is blank.
- RR chasing: target, score, wickets and balls remaining determine runs required and required rate.
- RR defending: the opponent's score and wickets are compared with RR's defended total; one more than RR's total is required to win.

Both batting and bowling suggestions are drawn only from non-XI members of the active squad pool. The engine does not add a watchlist player who has not been selected as a hypothetical acquisition. It cannot verify inclusion on the official match-day substitute sheet; nomination and final playing-condition eligibility must be confirmed separately. It ranks supplied role descriptions, not predicted player-vs-player results.

## Data and product limitations

- No live pitch report, current weather, fixture-aware venue feed or player-vs-style performance split is bundled with this application. Venue is entered by the analyst; it is never inferred from opponent. Match Lab contains hand-authored venue starting archetypes that are planning priors only, with a manual surface override. A selected surface preference is a role-balance assumption, not live pitch intelligence.
- The current engine does not query a live external feed. It must not imply that pitch, weather or opponent information was automatically retrieved.
- **Candidate-pool snapshot:** this analysis uses only the released-player names contained in the supplied 18 November 2026 dataset. It does not include new auction registrations submitted during the still-open registration window as of 22 November 2026, and it is not the final registered auction pool. The reported registration close is 23 November; additional-player requests may be made through 27 November; the final registered list is expected on 3 December. Rebuild the candidate universe and re-check eligibility after the final list is published.
- Market registration and medical status must be verified independently. A released-player list is not an auction-registration list.
- The project does not model DLS/revised-target innings or final nominated-substitute eligibility for the 2027 season.
- Injury coverage is not complete for every role. The current retained player pool has no direct like-for-like top-order cover for both openers and no direct wicketkeeping cover if Jurel is unavailable; the engine returns no valid XI for those absences rather than inventing a replacement.
- No auction price prediction is claimed or displayed.
