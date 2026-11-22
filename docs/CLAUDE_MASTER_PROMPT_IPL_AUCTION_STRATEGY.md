# MASTER BRIEF — ROYALS AUCTION WAR ROOM

> **Market-status date note — 21 November 2026:** this prompt contains historical requirements from an earlier audit. Its older statements that Mahipal Lomror and Mangesh Yadav are market-unresolved are superseded by the official 2027 released-player list. Current status: 19/20 research-board profiles reconciled as released but registration-unverified; Daryl Mitchell remains unresolved. Do not use an older market list over the dated source snapshot in `src/data/auction-market-snapshot.json`.

## Adversarial cricket-strategy review, decision-engine rebuild and final polished ZIP

**Role:** Principal IPL franchise strategist + senior cricket analyst + cricket data scientist + principal full-stack engineer + product/design lead.

**Mission:** Take the supplied Royals War Room codebase apart intellectually, challenge its cricket assumptions, rebuild whatever is weak, and deliver a polished, fully working application that a serious analyst could use to study and prepare IPL auction strategies—not merely a dashboard that looks impressive in a demo.

You are not a caretaker of the current code. You are accountable for the quality of the final decisions the product enables. You may replace flawed components, domain logic, data structures, page layouts and architecture. Do not preserve bad code or a weak strategy just because it already exists. Equally, do not destroy useful evidence, validated data or the only working copy: preserve an untouched source archive and work on a separate copy/branch.

Do not stop after an audit, critique or implementation plan. Inspect, challenge, implement, test, refine and package the finished result in this run. If a requested feature cannot be implemented defensibly from the available evidence, make the limitation explicit and build the best honest alternative. Do not ask the user to repeat information already supplied.

---

## 1. Inputs and authority order

Use the files and reference supplied alongside this prompt:

1. **Latest starting code:** use the most recently supplied Royals War Room source ZIP. The current project includes the F1–F6 fixes plus a historical IPL evidence engine built from `suprr_selector.zip`; do not fall back to an older ZIP if the newer historical-evidence package is attached. This is the current implementation to challenge—not a requirement to preserve every implementation choice.
2. **Analytical source:** the 27-page `SupeRR Selector Season 2 — Pressure & Auction Recruitment Report`, snapshot 18 November 2026. Read the entire report. Do not modify the PDF.
3. **Emergent visual reference:** https://royals-xi-engine--5dc5ge2b.preview.emergentagent.com/?utm_source=share
4. **Supporting files when present:** original cricket data pack, candidate evaluation tables, recruitment shortlist, source register, official retention/release lists, playoff scorecard evidence, current validation/permutation reports and README.
5. **Project repository context:** Royals Auction War Room / SupeRR Selector Season 2, Rajasthan Royals 2027 scenario.

Authority order when sources conflict:
- Official IPL / franchise / governing-body sources for current roster, auction registration, eligibility and playing conditions.
- The supplied 27-page report and its cited primary evidence for the historical analysis in this project.
- The supplied raw/source datasets for calculated statistics, after their schema and quality have been verified.
- The codebase for what is actually implemented—not for what a label claims it does.
- Previous audits and generated notes are hypotheses to reproduce, not authority.

Record source URL, publication/event date, retrieval/as-of date and which fields each source supports. Do not infer auction registration from release status. Do not combine IPL, T20I, domestic T20, U19 and practice/net evidence as though they were the same competition or sample.

**Time boundary:** Work from the actual current date when executing. The current project snapshot is 18 November 2026. Auction registration and final player-pool information may still be changing. Re-verify time-sensitive facts rather than treating the project snapshot as live truth.

---

## 2. The product ambition

The application should function like a compact professional franchise auction room. It must help an analyst answer, with evidence and trade-offs:

- What has the current squad already bought/retained in role terms?
- Which capabilities are genuinely scarce, weakly covered or injury-fragile?
- What does each vacancy represent: a role gap, bench depth, development option, contingency or simply unused capacity?
- Which candidate adds the greatest *marginal value* relative to the actual incumbent and other available options?
- What happens to the XI, bench, overseas slots, bowling/keeping cover and strategic flexibility if the candidate is acquired?
- Which acquisition package is best under different budget, availability, conditions and team objectives?
- What is the opportunity cost of spending on this role rather than another?
- How should the team react to an auction bidding contest, an unavailable target or a late injury?
- What do historical RR playoff patterns—and comparable IPL champion/rebuild/continuity cases—actually establish, and what is only narrative?

This is not a player-statistics catalogue. Statistics must answer a squad or auction decision. Each recommendation must be understandable to a franchise analyst who may challenge the evidence.

### RR's current working hypothesis—challenge it

The user's starting thesis is that RR have a substantially formed core of 19 retained players and may need only one or two material additions: particularly Indian pace depth / injury resilience, possibly a conditional specialist phase option, and a batter only if that player adds a genuinely distinct skill to the Ferreira–Dubey–Shanaka–Jadeja group. The user also wants to study whether recent champions such as KKR and RCB demonstrate the value of core continuity and defined roles.

Treat this as an **analytical hypothesis**, not a hard-coded conclusion. Challenge it with evidence. Do not assert that KKR/RCB succeeded because of continuity merely because their squads contained returning players. Compare retained-core continuity, role-specific turnover, auction recruitment, injuries, match usage and the context of the title run. Separate association from causation.

The product should compare at least:
- no acquisition / retained squad only;
- one material acquisition;
- two targeted acquisitions;
- three-to-six-player squad-completion / depth packages (subject to actual squad and overseas limits).
- alternative combinations that fill more depth slots or create injury resilience;
- a contingency strategy where the first-choice target is unavailable or the club independently decides its price limit has been exceeded.

Six open places are capacity, not a mandate to buy six players. The squad-package selector and the starting-XI optimiser are separate decisions: allow packages of up to six hypothetical squad additions (and only the remaining overseas quota), then show which additions actually earn a place in the XI and which remain bench depth. A two-change continuity setting, if retained, is a strategic heuristic—not an IPL rule. Challenge it and fixed XI anchors rather than treating them as league rules.

---

## 3. RR source snapshot to verify

The supplied 18 November 2026 planning snapshot lists 19 retained players:

- Aman Rao Perala
- Brijesh Sharma
- Dasun Shanaka
- Dhruv Jurel
- Donovan Ferreira
- Jofra Archer
- Lhuan-dre Pretorius
- Manimaran Siddharth
- Mohammed Shami
- Nandre Burger
- Ravi Bishnoi
- Ravindra Jadeja
- Riyan Parag
- Sandeep Sharma
- Shubham Dubey
- Sushant Mishra
- Vaibhav Sooryavanshi
- Yash Raj Punja
- Yashasvi Jaiswal

Planning values supplied with the snapshot:
- 19 retained players;
- 5 overseas retained;
- 6 open squad places;
- maximum squad size 25;
- maximum 8 overseas in the squad;
- maximum 4 overseas in the playing XI;
- ₹27.05 crore supplied remaining purse figure (verify whether and how this is still valid before relying on it).

Do not silently edit these inputs. If a primary source changes or corrects one, preserve both the original snapshot and the verified new snapshot with dates and explain the delta.

---

## 4. Phase One — hostile audit before touching code

Create a separate copy/branch and a baseline archive. Inspect the complete repository, not just the homepage. Map:

- package manager, lockfiles, framework, route structure and entrypoints;
- every page, route, component, shared UI primitive and state owner;
- all CSS/design tokens, fonts, logos, photography and external assets;
- all JSON/CSV/static datasets and the provenance of each field;
- all domain services, recommendation functions, constraints and tests;
- every button, dropdown, filter, selector, tab, navigation link, chart and persisted state;
- browser storage/session behavior and cross-workspace state propagation;
- deployment/build configuration, scripts, README and environment assumptions.

For every user-facing feature classify it as:
1. implemented and verified functional;
2. implemented but incomplete;
3. static/mock/hardcoded presentation;
4. broken, stale, misleading or internally inconsistent;
5. absent but necessary for credible auction study.

Trace at least the critical workflows end-to-end: screen → component state → domain function → source data → rendered decision. A button that changes a label but not the engine is not functional. A chart with hardcoded data must be disclosed.

Publish a baseline `AUDIT_BEFORE.md` with exact files/functions, severity P0–P3, evidence, reproduction steps and recommended correction. Then proceed to implementation; do not stop and ask permission.

### Known handoff defects and corrected diagnoses to verify

The current handoff identified the following. Re-open the actual code and reproduce each one; do not assume this prompt's diagnosis is automatically correct.

- **F1 — acquisition cap / graceful degradation:** the old optimizer rejected three or more selected acquisitions and returned zero recommendations. The squad package should now support up to six additions (or fewer when squad capacity is lower), while applying separate market, medical, overseas-squad and XI constraints. If more than capacity is selected, report the excess clearly and still optimise the valid partial package; do not return an empty plan merely because the request exceeds capacity.
- **F2 — continuity vs flexible positions:** hard continuity anchors are not automatically a defect. Retain evidence-based anchors only when justified; the flexible positions must respond to selected surface/opposition role assumptions. Challenge the two-change setting as a strategic policy, not a league rule.
- **F3 — candidate pool completeness:** all 20 recruitment-board profiles must be represented in the decision-data pool and inspectable/selectable where market/medical gates allow. Do not silently filter eight readable candidate profiles out of the engine. Historical wording superseded on 21 November 2026: Mahipal Lomror and Mangesh Yadav are now reconciled as released-but-registration-unverified; Daryl Mitchell remains market-unresolved. Every released profile must still remain registration-unverified until matched against the official auction list, and all candidates remain subject to medical gates. Market-unresolved/unavailable candidates must fail closed for hypothetical squad/XI use.
- **F4 — squad header / stale UI copy:** projected squad count, open places, overseas count and overseas places remaining must derive from the current validated hypothetical squad package and official caps. Never hardcode “2 max” as an IPL rule. Distinguish full squad additions from the XI change policy.
- **F5 — match venue context:** do not hardcode Jaipur as the venue for every match or claim context was retrieved when no fixture/pitch service exists. Venue should be an explicit analyst input (or come from a verified fixture source with provenance). Opponent selection must not silently infer a venue. Surface-to-role preferences must be visibly labelled as analyst assumptions, not live pitch intelligence.
- **F6 — champion-continuity narrative:** separate year-over-year auction/retention continuity from within-season playing-XI stability. Do not claim KKR/RCB title success was caused by retaining a core across an auction when the title-year squad was built through a major auction reset. Use sourced in-season selection stability where the evidence supports it, and present association—not causation.

### Current handoff state — 21 November 2026 (reproduce, do not assume)

The latest source ZIP already contains an initial correction pass for F1–F6. Treat the following as **claims to independently reproduce from source**, not as certified truth:

- `RR_FOCUSED_TARGETS` is intended to include all 20 profiles shown on the recruitment board. As of 21 November 2026, 19 profiles are reconciled as released-but-registration-unverified and Daryl Mitchell remains market-unresolved. Pathirana remains separate under MEDICAL_REVIEW. No profile is auction-registered based on release status alone.
- The optimizer is intended to accept up to six hypothetical squad additions when six places are open, constrained by squad size 25 and eight overseas squad places. An over-capacity request should report rejected excess names while still evaluating the valid partial package.
- Starting-XI selection is separate from total squad acquisition. The code retains a separately named two-position-change continuity heuristic; this is not an IPL rule. Challenge its usefulness, sensitivity and whether the user can relax it without breaking true constraints.
- Squad & XI Lab is intended to derive projected squad count and vacancies from the active plan instead of hardcoded labels.
- The older hand-authored venue pitch archetypes have been removed. Match Lab now uses the uploaded IPL 2022–2026 history for match-grouped out-of-fold context-adjusted player phase evidence, player-specific phase/ground splits, batter-vs-Pace/Spin splits and bowler-vs-LHB/RHB splits. Track preference defaults neutral; optional slow/dry/dew/pace-friendly/bouncy values remain manual analyst assumptions. Venue is a historical ground mapping only and does not imply a physical pitch type.
- The home-page champion narrative is intended to compare within-season XI usage, not post-auction retention counts. No exact KKR/RR usage metrics should be shown until you reconstruct a complete, comparable, reconciled match-XI dataset. In particular, verify the circulated claim that KKR used 16 players / made about 1.1 XI changes per match and the claim RR was even more stable; do not repeat either number without reproducible evidence.

The latest domain-harness record reports 20 candidate profiles, 17 locally selectable hypothetical candidates, 153 single/pair packages across 30 surface/opposition contexts, 180 retained-only contexts, 4,770 total XI-engine runs and 816,690 candidate XI assignments with zero invalid/empty matrix contexts. The historical Match Lab engine has additionally run 2,625 cases across all 14 mapped ground names plus an unknown-ground control × 7 surface selections × 5 opposition profiles × 5 match states. In the selected 25-player active package, venue-only changed the top suggestion in 0/50 controlled groups; manual surface changed it in 195/375, opposition in 195/525. Do not claim Wankhede/Chepauk necessarily switch the leading player. The historical context model improves 2026 chronological holdout RMSE by about 1.08% vs a simple phase baseline but worsens MAE by about 1.07%; venue ID does not improve the holdout. Treat residuals as uncertain player-comparison evidence, not forecast. 558 incoming and 558 outgoing Impact Player flags (291 matches) lack substitution time/score/wickets/alternatives and cannot train a state-conditioned Impact Player model. It also reports 16/19 retained absences covered, with Dhruv Jurel, Vaibhav Sooryavanshi and Yashasvi Jaiswal lacking a valid alternative XI in the supplied pool. These are custom domain-harness/compatibility results—not native Vitest, full build or browser certification. Reproduce them before relying on them, and extend testing to meaningful three-to-six-player packages rather than treating single/pair enumeration as exhaustive.

Native `bun run test`, `bun run lint`, `bun run build`, full framework typecheck, SSR build and browser QA were not completed in the prior environment because Bun and installed project dependencies were unavailable. You must run them in your environment or report the exact blocker.

### Current historical evidence-engine addendum — 21 November 2026

The user supplied `suprr_selector.zip`, containing IPL ball-by-ball records. The current implementation derives 362 usable IPL matches (2022–2026), 86,668 delivery rows and 82,781 legal deliveries. It has 18 numeric venue IDs; 14 are curated to stadium names via repeated home-team concentration because no official venue-name dimension exists. Four remain anonymous. Full methods and mapping provenance are in `docs/historical-impact-model-report.md`.

The shared context model predicts **batter runs on legal deliveries** from pre-delivery state/features only. Production player residuals are match-grouped out-of-fold and venue-blind because adding venue ID did not improve 2026 chronological holdout performance. The same expected batter-run model supplies batter context-added and bowler context-batter-runs-prevented residuals; the latter is not official bowler economy or total bowler runs conceded because P0 extra-run reconstruction is unreliable. Wickets and boundary rates remain separate. 2026 holdout: venue-blind RMSE 1.84496 vs phase baseline 1.86505 (1.08% RMSE improvement), but MAE 1.44937 vs 1.43408 (1.07% worse). Do not present this as a calibrated forecast.

Match Lab's historical comparator is a deterministic, sample-shrunk **tie-breaker only within five-point tactical role-fit bands**. Batter-vs-Pace/Spin or bowler-vs-LHB/RHB requires at least 48 legal balls across 4 matches. Player/ground/phase requires at least 24 legal balls across 3 matches and a stronger shrinkage prior. Missing-history profiles are not penalised. The opposition type/handedness input is an analyst assumption, not a retrieved opposing XI. Venue mapping requires a complete canonical name or curated alias; a city/partial string must remain unknown. Venue never implies slow/bouncy/dew. Manual surface assumptions change broad role balance only.

The 558 incoming / 558 outgoing Impact Player flags across IPL 2023–2026 have no exact substitution timestamp, score, wickets, phase or nominated alternative list. They can support retrospective usage counts only. **Do not train or claim a state-conditioned Impact Player chooser from these flags.** The current suggestion system uses match-state role needs plus player-level historical phase/style/ground evidence, with explicit uncertainty. Its 2,625-run matrix found venue-only changed the first-choice player in 0/50 controlled groups for the selected active squad package; manual surface changed it in 195/375, opposition in 195/525. Report that null venue result honestly.

Add dedicated regression tests for F1, F3, F4 and F5. Check F2/F6 in the strategic narrative and the UI copy.

---

## 5. Phase Two — red-team the cricket and auction strategy

### 5.1 Retained-core thesis and role coverage

Challenge the continuity reference, including:
- fixed top four positions;
- fixed Jofra Archer anchor position;
- assumed seven-player continuity block;
- Dasun Shanaka's batting position and lower-order all-round role;
- how Ferreira, Dubey, Shanaka and Jadeja overlap or complement each other;
- whether the retained opening and wicketkeeping cover is genuinely resilient;
- whether a player with a part-time skill is being counted as a full specialist.

Do not simply count text labels. Model at least:
- primary role and secondary role separately;
- role quality / demonstrated evidence;
- likely batting or bowling usage;
- availability and sample reliability;
- specialist vs occasional/contingency capability;
- role flexibility and the cost of moving a player away from their best use.

A team with three players tagged “pace” is not necessarily adequately covered at powerplay, middle and death. Likewise, a secondary all-round skill should not satisfy a specialist bowling requirement without evidence.

Output an explainable squad-role matrix and identify genuine uncovered or fragile capabilities. Test every retained-player absence. Report no-cover cases honestly.

### 5.2 Recruitment candidate assessment

Organise candidates around actual roles, not generic top-ten player quality. At minimum investigate:

1. Indian fast-bowling depth and injury resilience (e.g. Avesh Khan, Akash Madhwal, Naman Tiwari, and other verified candidates in the supplied material);
2. specialist phase skill (e.g. Matheesha Pathirana, Trent Boult, Mustafizur Rahman and other candidates—do not treat these as equivalent roles);
3. middle/lower-order batting cover only where the candidate adds a skill not adequately present in the retained squad (e.g. Nehal Wadhera, Nitish Rana, M Shahrukh Khan, developmental alternatives where substantiated).

For every profile include:
- primary and secondary role;
- phase/position evidence and sample size;
- role gap it addresses;
- incumbent comparator(s);
- marginal value over RR's retained options;
- complementarity vs duplication;
- domestic vs IPL vs T20I exposure separated;
- recent form/sample and uncertainty;
- market / registration status and timestamp;
- medical/workload gate and what is known vs unknown;
- overseas slot cost;
- strongest argument **for** acquisition;
- strongest argument **against** acquisition;
- fallback option and the condition that would change the recommendation.

No generic “best player” leaderboard. Do not use a composite 0–100 suitability score unless a measurable, calibrated, sensitivity-tested model genuinely exists. If using weighted decision dimensions, expose every component and weight, demonstrate rank sensitivity and clearly label the result as an analyst decision aid rather than model truth.

### 5.3 Auction strategy and bidding room

The current tool should be assessed for whether it actually helps plan an auction—not simply recommend player names. Build the most useful defensible auction workflow with:

- verified registered/eligible pool and explicit unknown/unverified states;
- target tiers by scarce role and marginal value;
- primary target, alternatives and a clear statement of any club-defined stop-price policy (do not fabricate or calculate a threshold without evidence);
- squad size and overseas-slot constraints;
- remaining purse/budget scenarios with explicit source and assumptions;
- package-level opportunity-cost comparison;
- a manual planned-bid simulator where an analyst enters scenario bids and sees the remaining budget and alternatives;
- a contingency plan when a target is retained, unavailable, medically blocked or rejected under the club's independently approved price policy;
- a clear distinction between actual auction prices, historical price observations, analyst-entered assumptions and any validated price model.

Do not invent auction prices, rival bidder demand, player availability or price forecasts. If historical auction transaction data are available, audit coverage and comparability before attempting a valuation model. A valid model requires out-of-time validation, error measures, calibration/intervals and a credible baseline; otherwise use manual scenario inputs and label them as such.

### 5.4 Compare acquisition packages—not just individual players

Build package-level comparison around actual constraints and marginal gain. Compare, at minimum, no buy, one acquisition, two acquisitions, three-to-six additions and deeper squad coverage where squad rules allow it. A package should expose:
- which role gaps it closes and which remain;
- retained players displaced or moved to bench;
- playing XI alternatives and overseas composition;
- primary vs secondary capability changes;
- budget/purse arithmetic, with any club-defined stop-price policy treated as external unless a defensible valuation model is built and validated;
- injury resilience and dependency on one player;
- confidence and evidence quality;
- why package A is preferable to package B under the selected objective.

Prefer scenario/Pareto comparisons over a fake precision score. The best package may differ between “balanced XI”, “injury resilience”, “Indian pace depth”, “death-specialist insurance”, “middle-order batting” and “overseas-slot efficiency”.

---

## 6. Phase Three — challenge and improve the decision engine

Inspect actual implementation and consumers of:
- XI permutation / role assignment;
- squad eligibility and market status;
- injury and absence cover;
- acquisition package generation;
- Impact Player / match-state suggestions;
- outgoing-player substitution and bench consequences;
- objective and surface/opposition weighting.

Challenge these defects explicitly:
1. Are core positions hard-coded when they should be preferences?
2. Does the score over-reward continuity or a chosen objective?
3. Does the engine always emit plausible-looking combinations while hiding genuine unfilled specialist roles?
4. Does the search truncate valuable packages because the acquisition limit or pruning rule is too strict?
5. Are generated alternatives materially different, or just cosmetic one-player swaps?
6. Are overseas, squad-size, XI-size, duplicate-player, market, medical and registration constraints enforced in every path?
7. Can an unresolved or unavailable candidate enter by a UI shortcut or stale state?
8. Do candidates with secondary bowling skills inflate bowling coverage?
9. Is batting position treated as fixed when the 4–8 block should flex by game state?
10. Does the match engine correctly distinguish RR batting first, chasing and defending?
11. Does it correctly parse legal balls, reject `10.6` / `20.1`, handle all-out/completed innings/target reached/zero overs and avoid an invented first-innings par score?
12. Is the Impact Player recommendation drawn only from the active selected squad pool outside the XI?
13. Does it state that official nominated-substitute status and match-day eligibility are unverified until the actual team sheet and applicable rules are checked?
14. Does a proposed outgoing player lose an essential skill? Does the UI show exactly what changes?
15. Are role summaries, warnings and scoring components derived from the same engine state that the UI displays?

Implement domain logic that is:
- deterministic where appropriate;
- explainable and testable;
- feasibility-first (hard rules before desirability ranking);
- explicit about primary/secondary roles and evidence confidence;
- capable of 0–6 additions subject to actual squad constraints, while the interface can spotlight high-priority 1–2 target packages;
- able to show failed/empty scenarios with reasons rather than inventing valid outputs;
- efficient enough for a responsive browser interaction.

Do not call a heuristic “AI”, “machine learning”, “probability” or “optimization” unless that is exactly what it is and has been validated.

### Required test matrix

- base retained-only squad;
- no-buy / one-buy / two-buy and broader feasible packages;
- all selected objectives;
- neutral, slow, dry, dew, pace-friendly and bouncy/carry analyst assumptions;
- configured venue defaults vs manual overrides (Wankhede, Chepauk, Jaipur, Ekana, Dharamshala), clearly labelled as scenario priors;
- balanced, spin-heavy, pace-heavy, left-hand-heavy and right-hand-heavy opposition assumptions;
- all 19 individual retained-player absence scenarios;
- Pathirana with and without a medical assumption;
- each market-status category, including missing/unknown status;
- maximum squad size 25 and maximum overseas squad size 8;
- exactly 11 unique XI members and maximum four overseas;
- all outgoing-player substitutions, including wicketkeeper, top-order, all-rounder, frontline pace and spin cases;
- three match modes with valid and invalid inputs;
- stale session-storage / scenario switch cases;
- responsive browser flows and keyboard/focus states.

For every emitted XI assert membership in the active squad, uniqueness, XI count, overseas cap, squad cap, acquisition registration/medical gate, and any stated package limits. Report totals, invalid results and exact reproducible commands.

---

## 7. Phase Four — historical evidence and strategy case studies

The application should make historical evidence useful without overstating it.

### RR playoff evidence

Use the 27-page report as the supplied reference. Verify all seven RR playoff matches from 2022, 2024 and 2026 against authoritative scorecards. Keep facts separate from interpretation. Detailed phase investigations are available for only three cases; do not imply every match has equivalent ball-by-ball depth.

Preserve the important known interpretations only when supported:
- 2022 Final and 2024 Qualifier 2 show middle-over wicket-cluster pressure cases;
- 2026 Qualifier 2 is a failure to control a set partnership through the middle, not simply a death-over collapse;
- 2026 Eliminator demonstrates retained batting upside;
- phase values in the supplied delivery export are batter-run components, not official phase totals, because extras are categorical.

Do not write causal statements from a single match. Explain the alternative interpretation and confidence.

### Champion / auction strategy comparisons

If using KKR, RCB or other champion examples, build a comparable and sourced framework:
- players retained vs released;
- core continuity from previous season;
- actual auction additions and prices from official/credible records;
- changes in role allocation and playing XI usage;
- availability/injury context;
- what can and cannot be inferred about winning.

Do not reduce “successful teams retain their core” to an unsupported universal law. Use examples to formulate hypotheses about continuity, role clarity, auction discipline, tactical flexibility and player availability. Show counterexamples where relevant.

---

## 8. Product and visual standard — Emergent reference

The visual reference is the supplied Emergent preview URL. Inspect the live rendered reference in a browser if possible and capture screenshots at the same viewport sizes used for the revised app. Do not claim design parity from reading the URL alone.

Desired visual direction:
- cinematic dark navy presentation;
- strong editorial headline hierarchy (serif hero where appropriate);
- gold as the main analytical emphasis, restrained Rajasthan Royals pink for selected actions/highlights;
- stadium imagery only where legitimate/licensed and robustly loaded;
- smooth curved surfaces, refined dividers, generous rhythm and well-fitted long-form cards;
- dense analytical content presented with readable typography, clear grouping and sensible responsive behavior;
- no generic AI-dashboard aesthetic, excessive glow, random gradients or repeated KPI tiles.

The important content surfaces are:
1. current squad architecture and actual role gaps;
2. candidate vs incumbent comparison;
3. acquisition package and budget/slot trade-offs;
4. XI/bench consequences;
5. match-state and substitution response;
6. playoff and champion-strategy evidence.

Prioritise decision clarity over decoration. All controls must work. A control must change real application state and update the underlying calculation. Do not invent player portraits, team crests, sponsor marks, statistics or source images. Keep accessible contrast, keyboard operation, focus states and mobile usability.

The five-workspace structure is a starting point; you may refine navigation or internal page composition if the current flow prevents a coherent auction decision journey. Do not create fragmented pages merely to add features.

Capture before/after screenshots for each primary workflow at desktop and mobile viewport sizes. Explain what was matched to Emergent and what intentionally differs for usability or source truth.

---

## 9. Engineering and delivery rules

1. Preserve the original input ZIP untouched. Work in a new directory/branch and maintain a rollback point.
2. Complete the audit, then implement immediately. Do not return only a proposal.
3. Correct data integrity and decision logic before animation or decorative styling.
4. Centralise status, role and constraint rules. Avoid hidden hard-coded player selections in UI components.
5. Add/update tests for every decision rule and defect corrected.
6. Run the native package-manager checks from a clean install: install, tests, lint, typecheck if configured, production build and SSR build if applicable.
7. Test every route and major state-changing interaction in a browser. Record viewport, browser, steps and result.
8. Inspect browser console and network failures. Provide fallbacks for external assets.
9. Search the entire source and documentation for stale or contradictory labels, old ranking pages, dead controls, fake prices, unsupported metrics and obsolete routes.
10. Verify README commands, file paths, routes, images and deployment output.
11. Do not say “production ready” because the homepage renders. Provide exact evidence of the checks that passed and did not pass.
12. If a dependency install or build is blocked, report the exact command, error and workaround attempted. Do not claim that a custom syntax harness is a native build or that a mock test runner is Vitest.
13. Never fabricate validation counts. All reported permutation counts must be reproduced by the actual current engine.

---

## 10. Required final deliverables

Create a **new** release package; do not overwrite the input. Deliver:

1. `Royals_War_Room_IPL_Auction_Strategy_Final.zip` — complete clean source project, runnable README, no `node_modules`, cache, test scratch files or secrets.
2. `FINAL_AUDIT.md` — baseline flaws, severity, code locations, strategy assumptions challenged, implementation decisions and residual risk.
3. `AUCTION_STRATEGY_METHODOLOGY.md` — decision framework, package-comparison method, evidence and uncertainty rules, market-status gates, and limits.
4. `ENGINE_VALIDATION.md` — test matrix, real run counts, failure cases and exact commands.
5. `VISUAL_QA.md` — before/after screenshots, routes, viewports and Emergent reference comparison.
6. Updated `README.md` and final `docs/final-validation.md`.
7. A short handoff explaining how to run the product and a five-minute demonstration path.

The final result is acceptable only if an analyst can use it to compare credible auction strategies, see exactly why a target/package is selected, understand what it costs in squad roles and constraints, and identify where the available evidence is too weak to support a decision. A beautiful interface with weak decision logic is a failure. A strong engine hidden behind a confusing UI is also a failure.

**Final instruction:** Be willing to say the existing product's main thesis or ranking is wrong. Challenge it with data, implement the strongest defensible alternative, and package the complete improved application. Do not merely tell me what should be done—do the work and deliver the ZIP.
