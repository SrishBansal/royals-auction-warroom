> **Archived prompt snapshot — 20 November 2026:** This brief predates the historical IPL evidence engine added on 21 November. Its references to hand-authored venue archetypes and the absence of player-vs-style evidence are stale. Use `CLAUDE_MASTER_PROMPT_IPL_AUCTION_STRATEGY.md` for the current handoff and `historical-impact-model-report.md` for the current evidence layer.

# Claude Code — hostile audit and final engineering pass

You are the final independent reviewer of this Rajasthan Royals 2027 decision-support application. Do not behave like a design assistant trying to please the author. Behave like a sceptical cricket-data lead, senior franchise analyst and principal engineer whose name will be attached to the recommendation.

Your task is to **try to break the product, expose unsupported cricket logic, verify the combinatorial engine, fix genuine defects, and only then prepare a release candidate**.

## Inputs

- Current project repository: this folder.
- Source of truth: the separately supplied 27-page PDF, `SupeRR Selector Season 2 — Pressure & Auction Recruitment Report`, snapshot 18 November 2026. Read it fully. Do not modify it.
- Current product intent: protect RR's retained core of 19 while challenging whether no-buy, one/two-target or three-to-six-addition squad packages best solve the actual gaps. This is not a generic player leaderboard.

Do not assume earlier validation notes are correct. Reproduce every important result directly from current code.

---

## A. Product thesis — do not drift

RR's retained group is already substantially formed. The product must demonstrate how RR can become more formidable by:

1. protecting the existing core and its defined roles;
2. strengthening Indian fast-bowling depth and injury resilience;
3. considering a specialist phase bowler only when the role materially changes the XI and the medical/market gates pass;
4. considering a lower/middle-order batter only when the profile adds a real skill beyond the retained Ferreira–Dubey–Shanaka–Jadeja options;
5. using match-state and Impact Player decisions to exploit the squad's flexibility.

Do not turn this into a rebuild or a 10-feature dashboard. The five user-facing workspaces should remain:

- War Room
- Squad & XI Lab
- Recruitment
- Match-state Lab
- Playoff Evidence

There must be no global P1 batter/bowler pages, no language about a frozen global ranking archive, no P1 exclusion register, no allocation-check widget, no auction purse planner and no auction price predictor. Do not add these back.

## B. Re-read the report and check every cricket claim

Use the report's own facts and terminology. In particular:

- RR retained 19; six open squad places; five overseas retained; max squad 25; max 8 overseas in squad; max 4 overseas in XI.
- The six open places are capacity, not mandatory purchases.
- Seven playoff matches are included (2022, 2024, 2026); detailed phase investigations are available for three cases.
- 2022 Final and 2024 Qualifier 2 show middle-over wicket clusters.
- 2026 Qualifier 2 is diagnosed as failure to control a set partnership through the middle, not as a death-over collapse.
- 2026 Eliminator demonstrates retained batting upside.
- Phase figures from the delivery file are batter-run components, not official phase totals, because extras are categorical.
- RR's middle order is a flexible 4–8 block; batting entry depends on wickets, phase, required rate, bowling type, left/right balance and venue context.
- Shanaka is a retained lower-order batting all-round option and must not be hidden below the specialist bowlers in batting-order presentations.
- Avesh is an Indian pace/multi-phase depth option, not a proven first-choice death upgrade. The report records his 2024 RR contribution (19 wickets in 15 matches) and supplied death rate 6.74 per 100 legal balls below the retained-core median 8.12.
- Akash Madhwal is a conditional Indian pace/death-depth option; preserve the small-sample, 2025 RR economy and phase-export caveats.
- Pathirana is a conditional specialist death option. Medical/workload clearance is a hard gate; an analyst checkbox is not real clearance. Registration remains unverified.
- Boult is powerplay-first, not a death specialist. Mustafizur offers left-arm/cutter variation, not a like-for-like Pathirana replacement.
- Nehal is a natural Indian No.5 role candidate but has 59 pressure-gated balls, below the supplied 100-ball/8-match eligibility floor. Do not describe him as pressure-qualified.
- Nitish has the larger established IPL No.4/5 middle-order sample and is not a pure No.6/7 finisher.
- Missing pressure evidence is not negative evidence.

Verify all other player claims against the PDF and source register. If a claim is not supported by the PDF or verified official evidence, remove it or mark it uncertain. Do not fill gaps from memory.

## C. Adversarial audit of the XI permutation engine

Inspect `src/domain/rr-decision-engine.ts`, `src/domain/decision-data.ts`, their tests and every consumer.

Challenge all of these potential defects:

1. Is the seven-player continuity reference genuinely preserved when it should be, or can the score weights produce nonsensical combinations?
2. Are positions 1–4 too rigid? Are injury cases reported honestly when the retained data contains no equivalent cover?
3. Is No.7 / lower-order batting fit treating Shanaka properly? Does the engine confuse a partial role fit with a specialist repair batter?
4. Are batting position and bowling priority kept separate?
5. Are all-rounders counted correctly for pace/spin balance without inflating their batting capabilities?
6. Are role labels reliable, or does free-text substring matching classify players incorrectly?
7. Do surface and opposition inputs affect only documented role balance, rather than inventing player-vs-pitch or player-vs-bowler predictions?
8. Does the generator ever admit an unresolved or unavailable market candidate as an acquisition?
9. Does Pathirana remain blocked without a separate medical assumption and still carry registration/medical warnings after selection?
10. Does the engine limit hypothetical acquisitions to two and XI changes to two?
11. Are there duplicate names, >11 players, >4 overseas in the XI, >25 squad, or >8 overseas in squad in any scenario?
12. Are alternatives meaningfully different rather than repeated XIs with a one-player cosmetic swap?

### Required permutation matrix

Run the actual engine, not a simplified reimplementation.

- Base retained-only roster.
- Every pairwise combination of the 10 market-eligible profiles in `RR_FOCUSED_TARGETS` (all singles and pairs; exclude fail-closed market-unresolved profiles).
- Every supported selection objective.
- Every surface state: neutral, slow, dry, dew, pace-friendly and bouncy/carry; test venue-default plus manual overrides for Wankhede, Chepauk and other configured grounds.
- Every opposition profile: balanced, spin-heavy, pace-heavy, left-hand-heavy and right-hand-heavy.
- All 19 retained-player injury/absence cases.
- Pathirana with and without medical assumption.
- Avesh and Akash individually and together, as part of one-to-six-player packages where the actual 25-player and eight-overseas squad limits permit it. The separate two-position-change XI heuristic is not an acquisition limit.

For every emitted XI assert:

- exactly 11 unique players;
- all players belong to the active hypothetical squad;
- at most 4 overseas players in the XI;
- no more than 2 positional changes from the continuity reference under the current strategic heuristic (challenge this setting);
- no more than 6 squad additions in the supplied 19-player snapshot, subject to the 25-player and 8-overseas squad caps; acquisitions can remain on the bench and are not an XI-change cap;
- role coverage warnings are accurate;
- no unresolved/unavailable target is silently selected.

Provide counts, failure cases and reproducible commands. Do not report that a permutation was checked unless it actually ran.

## D. Adversarial audit of the Match-state / Impact Player engine

Inspect `recommendMatchImpact`, `parseCricketOvers`, the UI and tests.

The engine must cover three distinct innings modes:

1. RR batting first;
2. RR chasing;
3. RR defending.

Challenge the state calculations and candidate rules. Test at least:

- First innings 82/2 after 9 overs, without an assumed par/target.
- First innings with an explicitly entered analyst total objective.
- Chase 170 target, 53/3 after 10 overs.
- Chase 170 target, 56/6 after 10 overs.
- Same score states on different actual XIs / bench combinations.
- Defending 215 with opponent 59/0 after 6 overs.
- Defending with wickets already taken and in death overs.
- All-out innings, completed innings, target already reached, zero overs, invalid overs `10.6`, and `20.1`.
- XI with four overseas and three overseas.
- Retained-only squad vs one-, two-, three- and up-to-six-player hypothetical packages, bounded by the real 25-player/eight-overseas squad caps.
- Shanaka on the non-XI pool and Shanaka already in the XI.

Expected calculations for the report's examples:

- 170 target at 53/3 after 10: 117 runs from 60 balls, 11.70 required rate.
- 170 target at 56/6 after 10: 114 runs from 60 balls, 11.40 required rate.
- RR defended 215, opponent 59/0 after 6: opponent needs 157 from 84 balls to win, 11.21 required rate.

Do not hardcode names to these three examples. The suggested player must be derived from the actual active non-XI squad pool and the current role requirement. If the right player is not available, return no recommendation and explain the gap.

### Important match-sheet eligibility boundary

A non-XI member of the 19-player squad is not automatically a valid match-day Impact Player. The app must clearly label outputs as squad-pool candidate suggestions and must not claim that the individual is among the official nominated substitutes. Verify the applicable 2027 playing conditions before asserting final eligibility. Do not confuse a tactical shortlist with official match-sheet validation.

### Check outgoing player / trade-off logic

The engine must not offer arbitrary player-by-player editing in the Match-state Lab. Generate complete situation-based incoming-for-outgoing combinations: select an outgoing player by the lowest role-coverage cost among eligible exits, then show the tactical role lost, minimum bowling/keeping/batting cover after the substitution, overseas count and why the pairing is permitted. The coach chooses between complete combinations, not individual names from a replacement dropdown. Test that every preview leaves 11 unique players and does not introduce a fifth overseas participant.

### Match context / retrieval honesty

The source project has no live pitch report, weather feed, fixture-aware venue data or validated player-vs-style split. Do not pretend those data were retrieved. If you add a data provider, cite and timestamp every returned field, add failure fallbacks and never make a player recommendation depend on a missing feed. Otherwise keep the fields clearly labelled analyst assumptions. The current UI includes hand-authored venue starting archetypes only; verify that they can be overridden and never describe them as current pitch retrieval.

## E. Recruitment and retained squad red-team

Ensure the app does not show a global player leaderboard or generic "best player" output. The user cares only about players RR can realistically investigate and the marginal value they add to this specific squad.

The shortlist should be organised around these three workstreams:

1. Indian pace depth / injury resilience (Avesh, Akash and clearly labelled development options);
2. specialist phase skill (Pathirana, Boult, Mustafizur, each with different roles and gates);
3. lower/middle-order batting cover only if distinct from Shanaka, Ferreira, Dubey and Jadeja (Nehal, Nitish, Mitch and relevant alternatives).

Every profile needs: role, fit in RR, incumbent comparison, source-backed evidence, market status, sample/uncertainty and a real counterargument. No composite 0–100 suitability or price score unless there is a real validated model and evidence.

Test the full retained squad role coverage. If an injury scenario cannot be covered with the supplied group, report it. Do not fabricate a replacement to make every XI render.

## F. Product / visual review — no superficial reskin

Assess the five workflows as one story:

**Retained core → actual gap → match evidence → recruitment option → changed XI → match-state response.**

Reject:
- generic SaaS card grids;
- repeated KPI tiles without decision value;
- tiny body copy;
- decorative charts that do not explain a cricket finding;
- a methodology flowchart disconnected from actual engine inputs/outputs;
- hidden hardcoded names or static explanations presented as engine outputs;
- controls that do nothing or do not change the underlying state.

The most important visual priorities are the XI and its roles, the candidate-vs-incumbent reasoning, and the match-state recommendation with incoming/outgoing effect. The five workspaces must not become ten fragmented subpages.

Charts should simplify the playoff evidence:

- seven match score comparison and results;
- phase comparisons only for the three detailed source cases;
- middle-over wicket clusters;
- clear note that phase figures are batter-run components, not official totals.

Do not create a predicted-price chart, pressure-leaderboard chart, synthetic expected-run model or fabricated win probability.

## G. Final engineering requirements

1. Create a safety copy or working branch before changing source.
2. Read the entire repository and trace every feature from UI to domain function to source data.
3. List defects by severity (P0/P1/P2/P3) with file path and exact reason.
4. Fix correctness defects before visual details.
5. Add tests for every discovered defect and every decision rule changed.
6. Run `bun install` if needed, then `bun run test`, `bun run lint` and `bun run build`.
7. If a command cannot run, report the exact blocker and do not claim success.
8. Perform browser QA for all five routes and the state-changing controls.
9. Search source/UI/docs for obsolete global-ranking, frozen-archive, auction-purse and price-prediction references. Remove any user-facing leftovers.
10. Verify every local import, route, image and README command.
11. Produce a new ZIP without overwriting the input project.

## H. Required final outputs

Deliver:

- `CLAUDE_AUDIT.md`: findings, severity, evidence and fixes made;
- `PERMUTATION_RESULTS.md`: contexts, number of single/pair combinations, total permutations, valid/invalid counts, failed cases and commands;
- updated `docs/final-validation.md`;
- a clean final source ZIP;
- a clear list of full tests actually passed and any remaining limitations.

Do not say "production ready" merely because the homepage renders. The product is acceptable only when its decision logic is explainable, constraints are enforced, and failures are honest.
