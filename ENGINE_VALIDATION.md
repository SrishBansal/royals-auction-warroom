# Engine Validation — 22 November 2026 User-Feedback Release

**Revision:** Retained-player Match Lab role classification and sample-aware bowling shortlist; Squad Architecture development diagnostics; visible playoff-to-gap evidence; recruitment hero copy; Kadamba spatial route restoration and 25-zone prediction pilot. Submitted recruitment candidate ordering and target profiles remain unchanged.

## Targeted behavior verified

- Balanced retained-core XI, 53/3 after 10 overs, 170 total objective: batting-first and chasing both return Lhuan-dre Pretorius and Aman Rao Perala as general batting-depth options, with legal substitution combinations. They are explicitly marked partial cover; neither is promoted to specialist repair batter or finisher, and neither has qualifying 2022–2026 IPL phase evidence in the supplied archive.
- Defending-state sweep across powerplay, middle overs and death overs returns phase-appropriate bowling options. In the neutral middle-over case, Manimaran Siddharth leads the role-fit group with a 102-ball phase sample; Yash Raj Punja remains a role-based alternative with no qualifying sample. The page explains that this is a tie-break within a close role-fit band, not a certainty or proof of player quality.
- The homepage exposes all seven playoff matches with scoreline, actual match event and a specific “What RR lacked” or “What worked” takeaway. Positive wins remain visible as counter-evidence. The new playoff validator confirms 7 unique cases (3 wins, 4 losses), all seven homepage links and all seven detail anchors; this is an internal evidence-shape check, not a fresh scorecard audit.
- Recruitment hero copy is shorter and more specific: retain the core, cover the pressure points, and do not treat six open squad places as a mandatory buying list.
- `/squad` is present in the generated TanStack route tree. The development error boundary now shows the failing route, error message and stack automatically, including non-`Error` thrown values. The exact user-side Squad Architecture exception remains unknown until the refreshed archive is run locally.

## Spatial pilot checks

- Rebuilt from supplied CSV SHA-256 `138b861f4e72739eff00c6ccb73f80eb5b27f722112d4cefbb957c5a083f2262`.
- 149,424 raw rows / 628 match IDs / 0 duplicate match-delivery keys.
- 135,587 legal main-innings deliveries in 627 matches; all 25 zones are populated and zone sample totals reconcile.
- Corrected both `retired hurt` and `Retired (hurt)` spellings in the wickets-in-hand state; bare `Retired` remains a dismissal.
- 1,000 paired match-cluster bootstrap resamples over existing OOF predictions; no model refit in bootstrap.
- The restored page is a separate experimental tool and does not feed recruitment or Match Lab. In the map, colour intensity is re-scaled within the currently selected outcome/layer; the printed values, not colour similarity between toggles, should be compared. The model uses post-release measured ball speed, so it is a tracking assessment rather than an advance delivery-placement predictor.

## Checks executed in this editing container

| Check | Result | Limitation |
|---|---|---|
| TypeScript/TSX syntax transpilation | PASS: 92 files, 0 syntax diagnostics | Syntax transpilation only; not semantic typechecking |
| Local import path resolution | PASS: 0 unresolved relative or `@/` imports | Does not prove bundler/runtime behavior |
| Focused audit TypeScript project | PASS: `tsc --noEmit -p tsconfig.audit.json` | Covers selected data/domain modules, not the full React app |
| Direct Impact engine sweep | PASS: batting-first, chase, and defending powerplay/middle/death states | Deterministic domain test; not native Vitest or rendered UI QA |
| Release reference validator | 89 unique rows; CSV/JSON exact match | Checks supplied register consistency, not current auction status |
| Recruitment alternatives validator | 18 profiles; 17 role-matched alternatives; rank reversal stable | Does not prove player performance |
| Auction package validator | PASS; 2,625 scenarios / 7,875 combinations | Structural constraints only |
| Playoff evidence validator | PASS: 7 cases, 3 wins, 4 defeats, 7 homepage links and 7 detailed anchors | Checks evidence structure and phrasing; does not independently re-audit official scorecards |
| Kadamba spatial validator | PASS: 149,424 raw rows, 135,587 model deliveries, 25 zones, source hash and outputs reconcile | Uses the supplied third-party tracking CSV; no chronological/player join |
| Impact Player scenario matrix | PASS: 2,625 scenarios, 0 empty/invalid recommendations | Uses one hypothetical six-acquisition active squad package; not all outputs describe the current 19 retained players |
| Native Vitest / full app `tsc` / ESLint / Vite build / browser QA | Not run here | Dependencies are not installed in this editing container; no rendered browser certification |

## Run locally

```bash
bun install
bun run test
bunx tsc --noEmit
bun run lint
bun run build
bun run validate:all
```

`validate:all` runs route integration, release-register, recruitment-alternative, auction-package, retained-only Match Lab, broader Impact Player scenario matrix, Kadamba spatial-data and playoff evidence checks. Run individual `validate:*` scripts when isolating a failure.
Do not confuse syntax transpilation or direct domain checks with a production build. The browser test is still required on the user's machine. See `FINAL_AUDIT.md`, `VISUAL_QA.md` and `docs/audits/` for source and methodology boundaries.


## IPL Pressure Rankings and match-state variation — 22 November 2026

- Added `/pressure-rankings` as a separate IPL-only workspace. It shows two ordered exploratory Top 10s from the supplied IPL 2022–2026 competitions only; T20I records are excluded.
- Pressure delivery rule is deliberately limited to observable data: death overs 16–20; middle overs 11–15 after at least four wickets had fallen; overs 11+ in IPL knockouts; and super-over innings. It does not claim to identify every close match.
- Batter score uses 50% shrunk pressure strike-rate percentile, 30% pressure-retention percentile and 20% inverse pressure-dismissal-rate percentile. Batter eligibility: 60 pressure legal balls / 150 total IPL legal balls.
- Bowler score uses 55% shrunk bowler-credited wickets per 100 pressure legal balls, 30% retention and 15% pressure wicket volume. Bowler eligibility: 90 pressure legal balls, 180 total IPL legal balls and 5 bowler-credited pressure wickets. Economy and chase required rate are omitted because `extras1_runs` is a categorical code, not a safe actual extras total.
- Odd/even match-ID split agreement is weak: batter Spearman 0.099 across 81 comparable players; bowler Spearman 0.063 across 81 players. The UI prominently states that ordered ranks are unstable and exploratory.
- New 12-state retained-only Match Lab regression checks invalid state rejection, non-empty eligible options, legal substitution combinations, role changes for batting platform/collapse, chase run-rate/collapse and all three defending phases. It checks at least three unique incoming options across disciplines and verifies the defender recommendation changes across powerplay/middle/death.
- A repeated batting option is expected for the retained-core baseline because the tested XI leaves only Pretorius and Aman Rao as general/partial batting-depth options on the bench. The role requirement changes; the system does not invent a different eligible batter.
- Route validator now checks seven routes and confirms the pressure ranking page is reachable from both navigation and homepage.
