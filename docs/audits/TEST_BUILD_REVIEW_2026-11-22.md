# Test build review — IPL Pressure Rankings restored

**Build:** `Royals_War_Room_RR_2027_IPL_Pressure_Rankings_Test_Build.zip`  
**Date:** 22 November 2026  
**Purpose:** give the user a complete integrated build to test locally after restoring the omitted IPL-only pressure-ranking workspace and strengthening Match Lab state-sensitivity checks.

## Integrated routes

1. `/` — five-season War Room, playoff case evidence and Gap Finder.
2. `/squad` — Squad Architecture, XI construction and Auction Strategy Simulator.
3. `/targets` — RR-specific recruitment board; submitted order retained.
4. `/match-lab` — batting-first, chase and defending Impact Player scenarios.
5. `/knockouts` — seven RR playoff case studies.
6. `/spatial-lab` — Kadamba 5×5 spatial research pilot.
7. `/pressure-rankings` — separate IPL-only experimental Top 10 batter and bowler lists.

Pressure Rankings is not connected to RR-specific recruitment ordering or Match Lab selection.

## IPL-only pressure-ranking audit

The data builder filters the supplied competition register to `IPL YYYY` competitions for 2022–2026. It does not import T20I matches. The supplied IPL competition register has 371 match records; four have no delivery rows. The player-level analysis therefore uses 367 matches with delivery data and 87,687 delivery rows. The pressure proxy includes 27,687 legal deliveries.

Pressure proxy rules:

- overs 16–20;
- overs 11–15 after at least four wickets have fallen before the delivery;
- over 11 onwards in Qualifiers, Eliminators and Finals;
- Super-over innings.

This is a phase-and-wicket-stress proxy, not a complete model of close-game pressure. The supplied `extras1_runs` field is categorical, so required run rate, chase margin and bowling economy are not reconstructed. Batter strike rate and bowler-credited wickets per legal ball are compared with the same player's IPL baseline using disclosed minimum sample gates and a 60-ball shrinkage prior.

The batter table exposes observed pressure strike rate, shrunk pressure strike rate, IPL baseline, dismissal rate and sample sizes. The bowler table exposes observed and shrunk wickets per 100 legal balls, baseline and sample sizes. This makes the main index inputs inspectable rather than showing only the output rank.

The displayed ordered lists are explicitly experimental:

- 86 eligible batters and 89 eligible bowlers pass the full-sample gates.
- Descriptive odd/even match-ID split across 81 comparable players gives Spearman rank agreement of **0.099 for batters** and **0.063 for bowlers**.
- These values indicate very low ordering stability. The lists should not be represented as statistically secure or certified final rankings.

The build script is reproducible with `scripts/build_pressure_rankings.py` and `requirements-pressure-rankings.txt`. The raw 19.9 MB tracking/source CSV is not bundled. The source SHA-256 is stored in the generated data JSON and audit manifest. A rebuild into a separate temporary project root produced byte-identical pressure JSON and candidate CSV outputs.

## Impact Player state-sensitivity review

A retained-only regression uses the actual decision engine, the 19-player retained pool and a fixed, legal XI. It evaluates 12 deliberate states: first-innings platform/build/collapse/death-collapse; chase platform/comfort/acceleration/collapse/death; defending powerplay/middle/death.

Assertions include:

- every tested state is valid and returns a non-empty retained-bench candidate;
- recommendation is outside the XI and inside the selected retained squad;
- at least one legal incoming-for-outgoing combination exists;
- substitution legality and overseas limits remain satisfied;
- required role changes when batting wickets, chase pressure and bowling phase change;
- defending recommendation changes between powerplay, middle and death.

Observed retained-only outputs:

- Batting cases: Lhuan-dre Pretorius remains first choice across several scenarios; Aman Rao Perala is shown as the alternative. Both are partial batting-depth cover, not specialist finishers. This repetition reflects the limited retained-only batting bench and is intentionally not hidden by random name rotation.
- Defending powerplay: Nandre Burger.
- Defending middle: Manimaran Siddharth, with Yash Raj Punja and Brijesh Sharma as alternatives.
- Defending death: Nandre Burger, with Sushant Mishra and Brijesh Sharma as alternatives.

A separate 2,625-case / 7,875-combination Impact Player stress matrix uses a hypothetical six-acquisition squad. It is not a retained-only result and must not be described as one.

## Other domain/data checks

- Route integration: all seven routes, home/nav links, two research workspaces, 25 spatial zones and both pressure Top 10 lists.
- Release register: 89 unique names; CSV/JSON representations reconcile.
- Recruitment alternatives: 18 eligible profiles; 17 role-matched alternatives; rank-reversal check stable.
- Auction package: 2,625 scenarios and 7,875 complete combinations pass structural checks.
- Retained-only Match Lab smoke checks: five original cases pass.
- Spatial pilot: 149,424 raw rows, 628 match IDs, 135,587 model deliveries, 627 model matches, all 25 zones; data hash and prediction coverage reconcile. Experimental model comparison remains modest (about 1.025% lower MAE and +0.006373 absolute wicket AP).
- Playoff evidence: seven case IDs (three wins, four defeats), homepage-to-detail anchors and scoreline/result labels pass internal integrity checks. Source scorecards were not independently re-opened as part of this test-build script.
- TypeScript/TSX syntax transpilation: 94 files, zero syntax errors.
- Local import scan: zero unresolved local imports (CSS `?url` imports excluded from module-file resolution).
- Focused `tsconfig.audit.json` typecheck: passes.
- Pressure ranking generation: independent rebuild matched JSON and both full candidate CSVs exactly.

## Not certified in this environment

The environment did not have Bun or `node_modules`. Therefore native Vitest, full application `tsc --noEmit`, ESLint, Vite production build and browser rendering/responsive interactions were **not run**. `/squad` previously failed in the user's local browser and must be re-tested on this exact archive. The route exists in the source route tree; that alone does not certify browser rendering.

## Recommended local checks

```bash
bun install
bun run dev
bun run test
bunx tsc --noEmit
bun run lint
bun run build
bun run validate:all
```

Then manually visit all seven routes, especially `/squad`, `/match-lab`, `/spatial-lab` and `/pressure-rankings`.
