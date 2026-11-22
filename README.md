# Royals War Room — RR IPL 2027 Decision Workspace

**Current test release:** Senior Audit + Kadamba Spatial + IPL Pressure Rankings. This build restores the separate IPL-only pressure-ranking workspace and strengthens Match Lab state-sensitivity checks.

## Run locally

Extract the ZIP into its own folder, open Terminal in the extracted project folder, then run:

```bash
bun install
bun run dev
```

Open the exact URL printed by Vite (this project may use port `8080`). Keep Terminal open while testing. Stop with `Control + C`.

## Vercel Deployment Instructions

This repository is configured for direct zero-config import on Vercel:

1. **Framework Preset:** Vite / Other (automatically driven by TanStack Start + Nitro server).
2. **Build Command:** `NITRO_PRESET=vercel npm run build` (or set `NITRO_PRESET=vercel` in Vercel Project Settings and use `npm run build`).
3. **Output Directory:** `.vercel/output`
4. **Node.js Version:** 24.x.
5. **Environment Variables:** No external database or secret API tokens are required. Pre-built models and archives are bundled in repository data. Refer to `.env.example`.

## Main application routes

- `/` — five-season RR War Room, playoff conversion and Gap Finder
- `/squad` — One Core Playing XI (11 starters, 8 bench, exact 19-player partition) and injury resilience
- `/targets` — RR-specific recruitment shortlist with incumbent comparisons
- `/match-lab` — tactical match application and legal one-for-one Impact Player illustrations
- `/knockouts` — seven RR playoff match case studies
- `/spatial-lab` — Kadamba 25-zone spatial research pilot & delivery-level model comparison
- `/pressure-rankings` — separate IPL-only experimental Top 10 batter and bowler lists
- `/sources` — source register, model provenance and limitations

## Recent refinements in this test build

- Match Lab now distinguishes batting-first, chase and defending roles, with a 12-state retained-only sensitivity validator. A repeated batter is disclosed where the bench only offers two partial batting-depth options.
- The IPL Pressure Rankings Lab is restored as a separate, experimental IPL-only workspace; its very low split-half stability is displayed beside both Top 10s.
- The Kadamba Spatial Lab remains separate from recruitment and Match Lab decision logic.
- Playoff evidence, Gap Finder and RR recruitment ordering are preserved.

A decision-support prototype for studying how Rajasthan Royals can approach the 2027 auction: identify marginal squad needs, assess researched targets against retained players, test acquisition packages, and understand the resulting XI, bench and match-state consequences.

The supplied 18 November 2026 RR snapshot and the submitted **SupeRR Selector Season 2 — Pressure & Auction Recruitment Report** are treated as source material, not as proof that every recommendation is optimal. The PDF is not modified by this application.

## Five RR decision workspaces + two separate research labs + source register

1. **War Room (`/`)** — five-season (2022–2026) league-finish comparison, playoff conversion, explicit evidence-to-gap analysis and the decision path.
2. **Squad & XI Lab (`/squad`)** — role coverage, scenario XIs, injury absences, constraints and trade-offs, plus an Auction Strategy Simulator comparing no-buy, single-target, pair and broader packages, with manual planned-bid inputs and purse checks.
3. **Recruitment (`/targets`)** — candidate evidence, role fit, marginal value against incumbents, status, uncertainty and counterarguments.
4. **Match-state Lab (`/match-lab`)** — batting-first, chase and defence states, an eleven-player starting XI, and a separate situation-based one-for-one Impact Player substitution showing who comes in and who makes way.
5. **Playoff Evidence (`/knockouts`)** — the seven supplied RR playoff scorecards and the available detailed phase investigations, with source limitations visible.
6. **Kadamba Spatial Lab (`/spatial-lab`)** — a separate 5×5 pitch-impact zone display with observed outcomes and held-out context-only vs context-plus-location expected-runs / bowler-wicket outputs. Experimental historical IPL tracking analysis; not player-specific, live or linked to RR recruitment.
7. **IPL Pressure Rankings (`/pressure-rankings`)** — two separate ordered experimental IPL-only Top 10 lists for batters and bowlers from the supplied 2022–2026 sample. T20Is are excluded. Split-half reliability is very low (Spearman 0.099 batters, 0.063 bowlers), so the visible rank order is explicitly labelled unstable; these lists must not be presented as certified final pressure rankings or as RR recruitment targets.
8. **Sources & Methods (`/sources`)** — the supplied 24-record source register and model provenance, sample boundaries and limitations.

The Kadamba 25-zone lab is deliberately isolated from player ranking and match-day decision logic. The pressure-ranking lab is a separate IPL-only experimental analysis and is not connected to RR recruitment or Match Lab; see [`docs/pressure-rankings-methodology.md`](docs/pressure-rankings-methodology.md) and its full candidate CSVs for the calculation and sample caveats; see [`docs/audits/SPATIAL_MODEL_PILOT.md`](docs/audits/SPATIAL_MODEL_PILOT.md) for rebuilt data, metrics and limitations. A coach-facing walkthrough is available in [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md). Season definitions and reconciled totals are documented in [`docs/season-review-methodology.md`](docs/season-review-methodology.md); the squad-gap evidence chain is documented in [`docs/gap-finder-methodology.md`](docs/gap-finder-methodology.md).

## Strategy is a hypothesis to test

The current RR planning hypothesis is to protect a substantially formed retained core and investigate a small number of material additions, especially selective pace insurance (not a vacant role: Shami/Burger new-ball profiles, Archer strike/death flexibility, Sandeep control, Brijesh death cover and Sushant reserve depth) and a genuinely distinct No.5/6 innings-repair option after Shimron Hetmyer's release. The role logic and counter-evidence are documented in [`docs/gap-finder-methodology.md`](docs/gap-finder-methodology.md). Hasaranga is recorded as a considered spin-plus-lower-order option but not prioritised after overseas-slot and repeated availability-risk review; see [`docs/audits/PACE_AND_HASARANGA_ROLE_REVIEW_2026-11-22.md`](docs/audits/PACE_AND_HASARANGA_ROLE_REVIEW_2026-11-22.md). This is a starting thesis, not a conclusion. An analyst can configure no-buy through six-addition packages against the actual role, squad and overseas constraints. The engine ranks XI alternatives inside the selected package; it does not automatically enumerate and rank every possible three-to-six-player acquisition package.

The Kadamba lab is independently navigable and deliberately not connected to player-level decision logic. The six open squad places are capacity, not mandatory purchases. Likewise, the existing continuity reference XI is a starting scenario, not a confirmed or permanently fixed playing XI. The package-level Auction Strategy Simulator uses the actual squad/XI engine, surfaces role and XI changes, and calculates purse impact from manual planned-bid assumptions; it does not predict auction prices or calculate player-specific stop prices. Unsupported walk-away ceiling and heuristic-per-crore controls have deliberately been removed.

## Supplied squad snapshot and constraints

The 18 November 2026 snapshot contains 19 retained players, five overseas players, six available squad places, a maximum squad size of 25, a maximum of eight overseas players in the squad and a maximum of four overseas players in the playing XI. These are scenario inputs; confirm any later official change before using the app for a live auction decision.

The current decision engine admits 0–6 hypothetical squad additions within the actual 25-player / eight-overseas constraints. Starting-XI changes are a separate 0–6 analyst policy (default two) across the six flexible reference positions; this is not an IPL rule. The engine returns up to three leading, meaningfully distinct XIs and a transparent heuristic score breakdown. These points compare plans under the same assumptions; they are not probabilities, player performance ratings, win predictions or a validated optimization objective. Role counts use curated profile tags where supplied, and tags still require expert review for primary-vs-part-time contribution and bowling workload.

## Decision-engine boundaries

- Market eligibility, registration, medical status and squad selection are separate. Released does not mean registered. Unresolved market statuses fail closed.
- A medical-review assumption is not official medical clearance.
- XI construction is deterministic role/constraint search, not a machine-learning model, match-outcome forecast or player-performance forecast.
- Match Lab uses the uploaded IPL 2022–2026 delivery history as a cautious player-evidence layer: match-grouped out-of-fold, pre-delivery-context-adjusted player phase residuals; player-specific phase/ground splits; batter-vs-pace/spin splits; and bowler-vs-left/right-handed-batter splits. These are sample-gated and shrunk toward broader player-phase evidence. They only break close role-fit decisions; they do not replace role fit.
- The archive contains numeric venue IDs, not an official ground-name dimension. Fourteen recurring IDs are analyst-curated to ground names using repeated home-team concentration; four IDs remain unnamed. Ground-specific player splits are used only when the local sample has at least 24 legal balls across 3 matches and are shrunk conservatively. Venue is never used to infer a current surface.
- The track selector defaults to historical ground/player evidence with a neutral role preference. Slow, dry, dew, pace-friendly and bouncy are optional manual analyst assumptions; they are not retrieved pitch reports. The venue itself does not imply Chepauk is slow or Wankhede is bouncy.
- The opposition selector is also an analyst profile, not an automatically read opposing XI. When sufficient historical evidence exists, it can use the batter's phase split against Pace/Spin or a bowler's phase split against LHB/RHB. These are descriptive and sample-shrunk, not calibrated player-vs-opponent forecasts.
- Historical model validation is modest: on the 2026 chronological holdout, the venue-blind model improved RMSE by about 1.08% over a simple phase baseline but had about 1.07% worse MAE. Venue ID did not improve holdout results. Treat the player residuals as uncertain comparative evidence, not precise predictions.
- Match-state calculations distinguish batting first, chasing and defending. Overs use cricket notation: `10.3` overs is 63 legal balls; `10.6` is invalid.
- Impact Player outputs are tactical candidates from the selected squad pool outside the XI. Historical Impact Player flags (558 incoming records, 558 outgoing records across IPL 2023–2026) are shown descriptively only; the archive lacks substitution timestamp/score/wickets and cannot train a state-specific Impact Player choice model. The app does not confirm official match-day substitute nomination or eligibility.
- Substitution preview reports before/after role counts, added/lost capability tags and structural warnings. Role counts do not measure bowling workload or guarantee that an occasional skill can replace a specialist.
- Playoff phase values are batter-run components, not official phase totals or official bowler economy, because the supplied delivery export contains categorical extras.
- No live pitch/weather feed, fixture lookup, official venue-name table, state-conditioned Impact Player classifier, DLS model, auction-registration feed or auction-price prediction is included.

## Current user flow

Start on the War Room to compare the 2022–2026 league records and post-season routes, then follow the playoff evidence into the 19-player baseline and squad gaps. Open Recruitment to inspect all 20 profiles, their role fit, evidence, counterarguments and market/medical status. Then open Squad & XI Lab to select an objective, broad surface/opposition assumptions, a 0–6 XI continuity policy and a 0–6 hypothetical squad package. Review the generated XIs, trade-offs and injury-cover gaps, then carry an XI into Match-state Lab. Enter batting-first, chase or defence match state; enter a historical ground or leave venue history unknown; keep the track neutral by default or select a manual track assumption; and select an opposition bowling-style / batting-handedness profile. Match Lab uses phase-specific player history and, where sample gates pass, shrunk player/ground and player-vs-style splits as tie-breakers within close tactical role-fit bands. Review the model evidence and limitations, compare the generated incoming-for-outgoing combinations and inspect the before/after role-coverage audit. Each combination explains the match trigger, incoming player role fit, historical sample used as a cautious tie-break where available, why the outgoing player is selected, and the capability the XI gives up. Role tags are coverage labels, not proof of equivalent specialist workload. The system selects an outgoing role for each scenario; it does not offer arbitrary player-by-player editing. Playoff Evidence provides the seven-match scorecard context and three detailed phase investigations. The separate Kadamba Spatial Lab can be opened from the main navigation to inspect the 25-zone map, observed outcomes and context-versus-spatial prediction comparison; it must not be used as a RR player ranking or direct tactical instruction.

The XI, selected package, medical assumptions and scenario context carry between Squad & XI Lab and Match Lab in browser `sessionStorage` for the current session. The detailed flow, engine rules and state-persistence boundaries are documented in [`docs/PRODUCT_FLOW.md`](docs/PRODUCT_FLOW.md).

## Current verification status

Historical player-performance construction and validation are documented in [`docs/historical-impact-model-report.md`](docs/historical-impact-model-report.md). Reproducible scripts are included at `scripts/validate-impact-player-matrix.cjs` and `scripts/validate-auction-simulator-packages.cjs`; run them after `bun install` to execute the actual TypeScript Match Lab matrix and verify the no-buy/single/pair/six-player package and Pathirana medical-gate cases. The Match Lab script regenerates the row-level CSV/JSON. The full Match Lab stress matrix covers 14 mapped historical venue labels plus an unknown-ground control × 7 surface selections × 5 opposition profiles × 5 match states = 2,625 actual `recommendMatchImpact()` runs. See [`docs/impact-player-historical-matrix.md`](docs/impact-player-historical-matrix.md), [`docs/impact-player-historical-matrix.csv`](docs/impact-player-historical-matrix.csv) and the JSON evidence file. In that tested active squad package, changing venue alone changed the top recommendation in 0/50 controlled groups; changing manual surface changed it in 195/375 groups and changing opposition profile changed it in 195/525. This is reported as observed, not concealed: role fit remained stronger than venue splits for the tested leaders.

The current independent follow-up checks include the 2,625-case Match Lab matrix (7,875 complete combinations), four package scenarios, the 89-row CSV/JSON release-register reconciliation, and a role-alternative check across the 18 market/medical-screened research profiles. These are domain/data checks, not UI-render certification. On the current 22 November follow-up revision, 92 TypeScript/TSX files transpile with zero syntax diagnostics and the local-import scan reports zero unresolved imports. The focused `tsconfig.audit.json` typecheck passes. The retained-only Match Lab smoke test covers batting-first, chase and all three bowling phases; a separate 2,625-case matrix exercises a hypothetical six-acquisition squad package. The Kadamba validator rechecks the raw source hash, 149,424 input rows, 135,587 model deliveries, all 25 zones and the stored out-of-fold predictions. The playoff evidence validator checks seven match cases, their win/loss balance and seven homepage-to-detail anchors. React/Vitest regression tests are included but not executed in this editing container. Full app `tsc`, ESLint, Vite production build and rendered desktop/mobile QA remain unverified because `node_modules` is absent here. See [`FINAL_AUDIT.md`](FINAL_AUDIT.md), [`ENGINE_VALIDATION.md`](ENGINE_VALIDATION.md), [`VISUAL_QA.md`](VISUAL_QA.md) and [`docs/audits/`](docs/audits/) for exact scope and caveats.

## Run locally

Bun is the recommended package manager; the repository includes `bun.lock`.

```bash
bun install
bun run dev
```

Open the exact Vite URL printed in the terminal (this checkout may use port `8080`). Keep the terminal open while using the app. Stop with `Control + C`.

Run the project checks on a machine with dependencies installed:

```bash
bun run test
bunx tsc --noEmit
bun run lint
bun run build
bun run validate:all
# Or run individual checks:
bun run validate:impact-matrix
bun run validate:spatial
bun run validate:match-lab-retained
bun run validate:playoffs
```

## Project structure

```text
src/
  components/       Five decision-workspace views plus standalone Kadamba research lab
  data/             Retained squad snapshot, source register and application data
  domain/           Recruitment evidence, role mapping, XI search and match-state logic
  routes/           TanStack file routes
  test/             Route and source-data checks
docs/               Methodology, audit, permutation and validation records
scripts/            Match Lab, playoff, auction-package, release-register and Kadamba spatial validation
```

## Design and ownership

The UI uses a dark navy canvas, editorial display typography, gold hierarchy and restrained Royals pink, based on the supplied Emergent preview reference. It is an independent decision-support prototype, not an official Rajasthan Royals product. The official club-hosted crest asset requires internet access and has a text fallback.

Prepared by Srish Bansal. Squad/released-player snapshot: 18 November 2026. Candidate-pool status checked: 22 November 2026. Currency: INR. **The recruitment analysis is based on the released-player names in the supplied snapshot only; it does not incorporate new auction registrations submitted during the still-open registration window and is not the final registered auction pool.** The reported registration window closes 23 November, with additional-player requests through 27 November and the final register expected on 3 December. No acquisition, registration, medical clearance, bid value or final playing XI is asserted by this prototype. Planned bids are manual scenario inputs; the simulator does not predict auction prices or calculate walk-away prices. Released players remain registration-unverified until matched against the final official auction list.

## Adversarial upgrade brief

The comprehensive Claude Code assignment is in `docs/CLAUDE_MASTER_PROMPT_IPL_AUCTION_STRATEGY.md`. It is an optional future adversarial brief, not a prerequisite to understanding or running this code. It asks a future engineering pass to challenge the continuity thesis, test broader packages, red-team the decision engine, study real auction strategy and complete browser/build verification. `docs/UPGRADE_NOTES_2026-11-21.md` explains what this ZIP already changes and what remains unverified.


## Recruitment register boundaries

The Recruitment route intentionally separates two datasets. Both are released-player research references from the supplied 18 November snapshot, not a feed of new auction registrations. The registration window remains open as of the 22 November analysis date; the candidate universe must be refreshed and re-screened after the official final register is distributed.

- **20 researched RR candidates**: the curated batter/bowler decision shortlist used in hypothetical squad-fit scenarios. The current supplied snapshot has 0 confirmed auction registrations, 19 released / registration-unverified profiles and 1 unresolved market profile.
- **89-name release reference**: a separate searchable reference copied from the supplied 18 November 2026 release-list CSV. It contains 86 released / registration-unverified entries, one workload/availability-unconfirmed entry, one reported medical-unavailable entry and one retired-player / mentor entry. These names are not automatically selectable targets and the list does not prove auction registration.

The JSON used by the UI is derived from `src/data/rr-2027-released-reference.csv`. Run `npm run validate:release-reference` to check the two representations remain identical and that the status distribution has not silently changed. Run `bun run validate:candidate-pool-scope` to verify the dated global notice, Recruitment boundary, timeline sources and documentation remain present.

## Evidence and ranking caveats

The candidate board's 1–10 sequence is an analyst-curated review order, not a documented weighted score or probability. Simulator fallback research alternatives are selected from explicit same-discipline role/tactical overlap, not from that ordinal sequence. Historical context metrics are modest comparative evidence; their 2026 holdout RMSE gain is small and MAE does not improve.


## Independent follow-up audit — 21 November 2026

The follow-up audit and source-grounded actions are documented in [`docs/audits/INDEPENDENT_AUDIT_2026-11-21.md`](docs/audits/INDEPENDENT_AUDIT_2026-11-21.md). The supplied 89-name release reference is displayed separately from the 20-profile recruitment pool; candidate registration is not confirmed. The former ordinal rank no longer drives the simulator's fallback-research option. Every engine warning is shown, venue context is optional and clearly caveated, and the champion-continuity section is explicitly labelled a research gap until match-by-match XI data is available.


## Five-season comparison data

The home page separates 14-match league-stage records from knockout routes and final tournament places. The 2026 league finish (4th) is distinct from RR's final tournament position (3rd). The table is based on the official RR season history; the sums and limits are documented in [`docs/season-review-methodology.md`](docs/season-review-methodology.md).


## November 22 feedback refinement

- The Gap Finder is now presented left-to-right as playoff signal → retained role coverage → the remaining recruitment question.
- The playoff cards now state the relevant score / player sequence for each of the seven matches, including positive comparator wins.
- The home page adds explicit counter-evidence from RR's 2022 Q2, 2024 Eliminator and 2026 Eliminator wins to explain why the strategy is selective improvement, not a rebuild.
- Match-card anchors are linked from Gap Finder so the evidence trail is one click away.
- Development-mode route errors now reveal their message / stack inside the error screen. The `/squad` route is present in the generated route tree; if it still fails, capture this diagnostic rather than inferring a missing route.
- The submitted candidate ordering, recruitment profiles, squad constraints and auction package logic are unchanged. Match Lab role-data classification and the sample-aware tie-break ordering were corrected so general batting-depth profiles and no-sample bowling options are represented honestly.

### If Squad Architecture still fails locally

The route is registered as `/squad` in the generated TanStack route tree. Start the dev server and append `/squad` to the exact URL printed by Vite (for example, if Vite prints `http://localhost:8080/`, open `http://localhost:8080/squad`). If the error boundary appears, its **Developer diagnostic · local run** panel is open automatically in development mode; copy the route, error message and stack. The earlier screenshot did not expose the actual exception, so the exact Squad Architecture root cause remains unconfirmed until this refreshed release is run.
