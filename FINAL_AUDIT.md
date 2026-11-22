# Final Audit — Royals War Room / RR 2027

**Audit date:** 21 November 2026  
**Revision:** Independent follow-up fixes to `Royals_War_Room_RR_2027_Situation_Based_Impact_Update.zip`  
**Scope:** Source/data review and domain-level validation of the current working tree. This is not a production or browser certification.

## Executive assessment

The previous product audit found multiple user-facing claims and controls that were not aligned with their implementation. This revision addresses the highest-confidence, coach-facing issues: the 89-name register is now real and separate from the 20 researched targets; auction registration remains explicitly unverified; backup research alternatives no longer depend on unexplained ordinal rank; all engine warnings are displayed; venue history is demoted to optional context after showing no first-choice changes in the controlled matrix; the historical model's mixed/weak validation caveat is moved above the evidence; and the champion-continuity panel is labelled as research not yet calculated.

The supplied SupeRR package supports an S2 methodology/data reproducibility retrospective, not a prior-season recruitment hit-rate study. No separate season-one candidate recommendation corpus or linked post-recommendation outcomes were supplied. No 2027 outcomes exist in this planning snapshot.

## Changes in this revision

| Finding | Change | Boundary / remaining limitation |
|---|---|---|
| Recruitment page claimed all 89 released reference names but displayed 20 profiles. | Added a searchable 89-row reference register and corrected route metadata. Kept it separate from the 20-profile recruitment shortlist and acquisition selectors. | The source list is dated 18 Nov 2026 and does not verify auction registration. |
| Release and registration status could be conflated. | Added a prominent market gate and status-specific reference rows. | 0 of 20 research profiles are registration-confirmed in the supplied snapshot. |
| Unexplained ordinal rank drove fallback selection. | Replaced the rank-based fallback with same-discipline role/secondary-role/tactical-tag overlap, with a reason label. | This selects a research alternative, not a player valuation or auction recommendation. The visible 1–10 order remains analyst-curated and explicitly labelled as such. |
| Six-player package hid four warnings. | The simulator renders all engine warnings in a labelled scrollable list. | Native React rendering test still needs to run in a dependency-installed environment. |
| Venue input looked like a primary control despite zero first-choice changes in 50 controlled venue comparisons. | Venue is now optional/collapsed historical context, and the measured comparison is explained. | This null result applies to the tested context set; it does not prove venue can never matter. |
| Model metrics visually outweighed their weak validation. | Moved caveat ahead of historical evidence: RMSE improvement is about 1%, while MAE does not improve and worsens in some 2026 splits. | Metrics remain descriptive comparative evidence, not calibrated forecasts. |
| Homepage champion-continuity panel described a protocol without results. | Reframed as “Research gap · not yet calculated”; no KKR/RR continuity result is implied. | Reconciled match-by-match XI histories are not supplied. |
| Stale JS snapshots sat beside active TS sources. | Moved five unreferenced snapshots to `archive/legacy-js/`. | Preserve only as a historical archive; TypeScript files are active source of truth. |
| Playoff death-phase 36s looked suspiciously identical. | Re-summed raw `runs` by over for the three supplied innings and verified 36 in all three. Added a reconciliation note. | These are batter-run components, not official phase totals. The 2026 Q2 GT innings reconstruction remains 7 below the reported scorecard; exact cause is unresolved. |
| UI tests were absent. | Added XI-rail render tests, recruitment register/search interaction tests, role-alternative unit tests and all-five-route resolution checks. | These tests were added but native Vitest was not run on this exact revision in this container. Other screens still need smoke-render and interaction tests. |

## SupeRR Selector retrospective boundary

The supplied `suprr_selector.zip` contains a Season 2 pipeline and `decision_log.md`, but not a separate Season 1 ranking corpus or longitudinal recommendation/outcome tracker. The retrospective records data-count and extras-reconstruction decisions, pressure-signal reliability (BAT 0.296 / BOWL 0.144), unstable pressure-vs-general advantage across designs and unreproduced handover validation figures. It does not claim a historic recruitment hit rate. See `docs/audits/SUPERR_SELECTOR_S2_RETROSPECTIVE.md`.

## Positive independent checks retained

The decision engine's roster/XI legality gates passed the independent adversarial scenarios supplied in the prior audit and the current package validator: 11 unique players, no more than four overseas in the XI, squad max 25, overseas squad max eight, and the unresolved-market / Pathirana medical gates behaved as designed in the tested assumptions.

## Remaining blockers before production or submission certification

1. Run native `bun install` or `npm ci`, then `bun run test`, `bun run lint`, `bun run build` and `tsc --noEmit` on this exact ZIP.
2. Add smoke-render and interaction coverage for War Room, Squad & XI Lab, Match Lab and Playoff Evidence, including simulator warning visibility and package preview/apply flow.
3. Run desktop and mobile browser QA on all six routes (five decision workspaces plus the Kadamba Spatial Lab).
4. Confirm the latest official auction registration list and any medical/availability changes using dated sources before using the shortlist for a real auction decision.
5. Do not promote the shortlist order to a model rank unless its scoring method is documented, weighted, reproducible and validated.

This package is an analytical prototype. It does not guarantee championship success or replace the judgement of coaches, scouts, medical staff or auction decision-makers.


## Home-page season comparison and gap-finder follow-up — 21 November 2026

The home page has been reordered around the requested coach-facing story: five-season comparison (2022–2026) → playoff conversion → evidence-tested squad gaps → recruitment → XI/package/Impact Player workflow. The previous home page did not show the 2022–2026 season comparison and began too far down the decision chain.

### Reconciliation correction

- League-stage figures now come from the season-by-season narrative in the official Rajasthan Royals history page, which gives a comparable 14-match basis for each season.
- Knockout matches are separated from league-stage matches. The official history's end table says its starred season totals include knockouts; using those combined match totals as a league table would make the comparison misleading.
- League finishes: 2022 2nd, 2023 5th, 2024 3rd, 2025 9th, 2026 4th. Final tournament finish: Runner-up, 5th, 3rd, 9th, 3rd. The 2026 league place and overall finish are deliberately separate.
- League totals: 70 matches, 36 wins, 33 losses, 1 no-result, 73 points. Playoffs: 3 campaigns, 7 matches, 3 wins, 4 defeats.
- Official source and field definitions: `docs/season-review-methodology.md`.

### Gap-finder safeguards

- Pace depth is framed as proven Indian multi-phase depth/competition—not a simple shortage of pace bowlers. The retained group already includes Archer, Burger, Shami, Sandeep, Brijesh and Sushant.
- The middle-order question is framed as a conditional innings-repair / spin-resilience profile, not another generic finisher. The two detailed RR batting collapse cases are explicitly labelled as two cases, not a universal diagnosis. Batter-run phase values are not called official innings totals.
- The 2022 Q1 and 2026 Q2 chase evidence is labelled a bowling-unit partnership-control warning, not proof that a single pace recruit would change either result.
- Absence-test results are labelled as engine outcomes under current role tags/constraints, not proof of medical unavailability or absence of a practical cricketing workaround.
- Existing opener, finisher/all-rounder and spin coverage is shown as counter-evidence against duplicate purchases. Pathirana remains labelled injury-prone; medical/workload clearance and registration verification are independent gates.

### Verification in this container

- New season data module: strict standalone TypeScript check passed.
- New home page, data module, test and route metadata: TypeScript/TSX transpile syntax check passed (four files).
- Season-row invariant checks passed: 5 seasons, 14 league matches each, 70 total league matches, 36 wins, 33 losses, 1 no-result, 73 points, 7 playoff matches, 3 wins and 4 defeats; 2026 league 4th versus final tournament 3rd.
- Existing release-register validator passed (89 unique rows; exact CSV/JSON match).
- Existing recruitment-alternative validator passed (18 eligible research profiles; 17 role-matched alternatives; rank-reversal stable).
- Existing auction-package / situation-matrix validator passed (no-buy, single, pair and six-player cases; 2,625 scenario matrix; 7,875 complete combinations; Pathirana gate passed).
- The existing focused audit TypeScript project passed after including the new season data module.

**Not verified:** native Vitest, ESLint, Vite production build, browser render, responsive visual QA and real user interactions. An `npm install` attempt timed out in this environment, and project dependencies are not installed. This ZIP must not be described as production-build certified.


## Senior-analyst refinement — role succession and coverage language — 22 November 2026

This was a bounded content/evidence refinement; the submitted target order, recruitment candidate data, XI engine and Impact Player logic were not changed.

- Pace gap now distinguishes six retained fast-bowling options from specialist redundancy: the role map tags Archer, Burger and Shami primarily for powerplay, Sandeep for variation, and Brijesh/Sushant for Indian depth. It describes death-over coverage as a role-map question, not as proof that no retained bowler can bowl at the death.
- Boult is described as a historical new-ball/powerplay reference, not a death-over answer. Pathirana remains explicitly injury-prone / elevated availability risk and subject to independent medical/workload and registration gates. Avesh and Akash are differentiated by the supplied evidence limitations already in their candidate profiles.
- Middle-order gap now states that Hetmyer's confirmed release removes a previous overseas left-hand No.6 / finishing option, without rewriting his inconsistent output as reliable. Parag, Jurel, Jadeja, Dubey, Ferreira and Shanaka are acknowledged as existing cover for parts of the role. Tewatia and Morris are used only as historical role precedents, not as direct replacements.
- Absence result is now labelled 16/19 (84.2%) modeled single-player-absence scenario coverage. It is explicitly **not** model accuracy, injury probability or a guarantee of equivalent performance.
- Added `docs/gap-finder-methodology.md` to record the role logic, source boundaries and decision discipline. Added a regression assertion that the 2027 release register and retained squad keep Hetmyer separate, and that the current retained role-tag map has no `death-specialist` tag.

No submitted target ranks or decision-engine behavior were adjusted. Native app tests, production build and browser QA remain unverified in this environment; the new regression assertion must be run with Vitest on a dependency-installed machine.


## Kadamba Spatial Lab restoration — 22 November 2026

The previous latest archive had the spatial files copied in without a registered TanStack route/navigation entry. That made the lab unreachable despite the component existing. This release registers `/spatial-lab` in the route tree, adds it to the main navigation and home workflow cards, and adds route/data-contract test source.

The raw CSV was rebuilt from the supplied source, SHA-256 `138b861f4e72739eff00c6ccb73f80eb5b27f722112d4cefbb957c5a083f2262`. A second rebuild produced identical model metrics, bootstrap intervals, all zone aggregates and the descriptive summary CSV byte-for-byte. Rebuilt sample: 149,424 raw deliveries, 628 match IDs, 0 duplicate match/delivery keys, 135,587 legal main-innings tracked rows across 627 matches, all 25 zones populated and counts reconciled. Both `retired hurt` and `Retired (hurt)` are excluded from pre-ball wickets-in-hand state, while bare `Retired` remains a team dismissal.

Model comparison (three-fold GroupKFold by match, fixed LightGBM parameters): context + location MAE 1.15824 vs context-only 1.17024 (1.025% lower); wicket AP 0.08113 vs 0.07475 (absolute +0.00637). A 1,000-resample match-cluster bootstrap over existing OOF predictions yields MAE reduction interval 0.01054–0.01344 and AP gain interval 0.00460–0.00806. Bootstrap does not refit the model. The 413-row difference against the 2026 paper's reported model sample remains unresolved; no exact replication claim.

No chronological validation is possible from this CSV as it lacks dates, seasons, team names and venues. The model's wicket percentages have not undergone a calibration audit and are explicitly labelled uncalibrated estimates in the page caveat. The zone prediction cards aggregate held-out predictions for actual deliveries within a zone; they do not predict a deliberate future delivery, individual batter/bowler outcomes or causal effects. Raw tracking CSV is excluded from the application archive.


## Harsh senior-analyst and regression follow-up — 22 November 2026

The prior `Run_Fix_And_Storytelling` archive omitted the Kadamba experience from the active app workflow: the component and reviewed JSON were absent from the route tree/navigation. The new release registers `/spatial-lab`, adds navigation and home-card entry points, includes the reviewed 25-zone data output, and documents the model scope. The source tracking CSV is intentionally not included in the ZIP.

### What was independently rechecked

- Raw Hawk-EyeStats-derived CSV SHA-256 matches the archived source record. The rebuild reports 149,424 raw rows, 628 match IDs, no duplicate match/delivery keys, 135,587 model-eligible deliveries in 627 matches, and 25 populated zones summing exactly to the model sample. Both retired-hurt spellings are excluded from wickets-in-hand state; bare `Retired` remains a team dismissal.
- Three-fold match-grouped OOF regression and wicket-classification metrics were rebuilt. Context+location improves batter-run MAE by 0.0120 runs/legal ball (about 1.025% relative) and wicket Average Precision by 0.00637 absolute over context-only. The 1,000-resample bootstrap resamples existing OOF predictions by match; it does not refit the models. The 413-row difference against the cited 2026 study remains unexplained.
- The model's ball-speed feature is observed after delivery release; the UI now states this directly. Zone predictions are averages of OOF predictions for deliveries that actually landed in each zone, not what-if predictions for deliberate targets. Heatmap colours re-scale within the active layer; printed values are the valid cross-layer comparison.
- The retained-only Match Lab stress test now checks five states using only the 19 retained players: batting-first, chase, defend powerplay, defend middle and defend death. It validates candidate membership, bench status, XI legality, overseas cap and non-empty substitution combinations. Pretorius/Aman are explicitly partial batting-depth options; Siddharth leads a close, sample-backed middle-over role group with Punja retained as a no-qualifying-sample role alternative.
- The separate full Match Lab matrix still covers 2,625 combinations and 7,875 complete substitutions for a hypothetical active squad with six selected research acquisitions. This is not a retained-only test and is not a prediction-accuracy test. Venue changes the first choice in 0/50 controlled comparisons; the UI and documents therefore keep venue as optional historical context rather than a strong recommendation driver.
- Auction package tests cover 19 retained profiles and 20 research profiles and pass no-buy, single, pair and six-profile packages under structural XI/squad constraints. Release register has 89 unique names with exact CSV/JSON agreement and zero auction registrations verified in the provided snapshot. Recruitment alternatives cover 18 eligible profiles, 17 role matches, and the ordinal rank-reversal check remains stable.
- A new playoff evidence validator checks the seven stored cases (3 wins, 4 defeats), the 2026 Q2 two-wicket nuance, and all seven homepage links to detail anchors. This is structural/text integrity, not a fresh independent scorecard audit.
- 92 TypeScript/TSX files transpile with zero syntax diagnostics; local import scan found zero unresolved imports; focused `tsconfig.audit.json` typecheck passes. All standalone domain/data validators listed in `ENGINE_VALIDATION.md` pass.

### Still not certified

Native Vitest, full app semantic TypeScript, ESLint, Vite production build, browser route/render QA, responsive behavior and the actual `/squad` runtime exception remain unverified in this container because the dependency tree is not installed. The 2026 paper reports 135,174 modelling rows; the rebuilt source pipeline reports 135,587, a 413-row discrepancy with no resolved explanation. No dates/team/player crosswalk, chronological holdout, per-zone calibration, model-refit bootstrap, external season validation or data-rights clearance is available for the spatial pilot. The 25-zone pilot is not connected to player recruitment, pressure ranking or Match Lab.

**Release judgement:** materially more complete as a source/data package, but not production-certified. Run the exact ZIP on the owner's Mac and complete native/browser checks before submission.


## Final route, narrative and reproducibility checks — 22 November 2026

- `/spatial-lab` is now in route tree, primary navigation and home workflow. A source-level route validator checks all six routes and 25-zone payload; it explicitly reports browser rendering as uncertified.
- The UI shows observed, context-only and context-plus-location views for expected batter runs/legal delivery and bowler-credited wicket model estimates. It tells users the estimates aggregate actual observed deliveries in that zone, are not target-zone counterfactuals, depend on post-release ball speed, have no probability calibration audit, and use a re-scaled colour range per view.
- Rebuilt JSON model metrics, bootstrap intervals, 25 zone rows and descriptive CSV match a second rebuild exactly.
- All eight standalone validation scripts passed when invoked directly: route integration, release reference, recruitment alternatives, auction packages, retained-only Match Lab, full Impact Player matrix, spatial pilot data, and playoff evidence links. 92 TS/TSX files parse with no syntax errors and local imports resolve; focused data/domain TypeScript audit passes.
- Full native tests, ESLint, Vite build and browser smoke/render remain pending on a dependency-installed machine.


## Pace-role and Hasaranga decision update — 22 November 2026

- Pace is now framed as **selective insurance / advantage**, not a missing role: Shami and Burger are the preferred new-ball profiles, Archer is the premium strike bowler with death-over flexibility, Sandeep contributes control and variations, Brijesh provides Indian pace / death cover, and Sushant is reserve depth.
- A further quick is justified only if it improves multi-phase availability, workload resilience or death-over reliability beyond this retained group.
- Hasaranga is acknowledged as a plausible attacking leg-spin plus lower-order batting option, but not prioritised: RR already have four spin options, he would consume one of three remaining overseas squad slots, and public sources document repeated heel / hamstring availability interruptions. Current medical fitness is not inferred.
- Added four injury source records and the official IPL squad-slot source to the source register, plus `scripts/validate-pace-role-analysis.cjs`.
- The new role-context validator passes. All twelve standalone route/data/domain validators pass. 96 TypeScript/TSX files transpile without syntax errors.
- Native Vitest, full semantic TypeScript, ESLint, Vite production build and browser verification remain unrun in this dependency-free editing environment.
