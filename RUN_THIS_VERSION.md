# Run this exact test release

Archive: `Royals_War_Room_RR_2027_Pace_Role_Hasaranga_Update.zip`

1. Move the ZIP to Downloads and extract it.
2. Open Terminal in the extracted project folder `Royals_War_Room_RR_2027_Pace_Role_Hasaranga_Update`.
3. Run:

```bash
bun install
bun run dev
```

4. Open the exact local URL printed by Vite. Keep Terminal open.
5. Test these routes:
   - `/` — five-season War Room, playoff comparison, Gap Finder
   - `/squad` — Squad Architecture and Auction Strategy Simulator
   - `/targets` — RR-specific recruitment board
   - `/match-lab` — batting-first, chase and defending Impact Player states
   - `/knockouts` — seven playoff case studies
   - `/spatial-lab` — Kadamba 25-zone research pilot
   - `/pressure-rankings` — IPL-only experimental batter/bowler Top 10s
   - `/sources` — source register and model provenance

## Run the checks

In a second Terminal tab, from the same project folder:

```bash
bun run test
bunx tsc --noEmit
bun run lint
bun run build
bun run validate:all
```

`validate:all` includes route integration, pressure-ranking data gates, 12-state Match Lab sensitivity, release-register, recruitment alternatives, auction packages, retained-only Match Lab, full Impact Player matrix, spatial-data validation and playoff evidence checks.

## Critical interpretation notes

- Pressure rankings use IPL 2022–2026 only; T20I is excluded. The odd/even match-ID split Spearman correlations are very low: 0.099 for batters and 0.063 for bowlers. These Top 10s are experimental and unstable, not certified final rankings.
- Four IPL competition records in the supplied schedule have no delivery rows in the ball-by-ball file. Player calculations cover the 367 matches with delivery data.
- Match Lab is situation-sensitive. The role requirement changes with innings, wickets, score and phase. The retained bench contains only two partial batting-depth choices, so Pretorius can legitimately remain first-choice for several batting scenarios; the engine must not invent diversity. Defending recommendations do change by bowling phase in the retained-only tests.
- The Impact Player matrix's 2,625 scenarios use a hypothetical six-acquisition squad. It is not a retained-only validation. Separate retained-only tests cover 12 specified situations.
- Browser rendering, `/squad` runtime behaviour and device responsiveness must be verified locally. The current source package is not a browser QA certificate. Confirm that the Squad & XI page shows exactly 11 starting players; Match Lab should then show the Impact Player as a separate one-for-one incoming/outgoing decision.

## Recruitment role-map update — 22 November 2026

The Gap Finder and Recruitment board now describe the retained pace group as selective insurance rather than an empty role:

- Shami and Burger are the preferred new-ball profiles.
- Archer is the strongest overall strike option and can cover death overs.
- Sandeep adds control and variations.
- Brijesh provides an Indian pace / death-over option (with a still-limited IPL sample).
- Sushant is developmental left-arm reserve depth.

A backup quick is an advantage for availability and workload resilience only if he adds a distinct role. Do not present RR as having no death options.

Hasaranga is explicitly assessed as considered but not prioritised: attacking leg-spin plus potential lower-order hitting is a plausible two-skill profile, but not proof of a dependable IPL No.6 finisher. RR already retain spin options; he would consume one of the three remaining overseas squad slots and has documented heel / hamstring availability interruptions. His registration and current medical clearance are not assumed. Sources are listed on `/sources` and in `docs/audits/PACE_AND_HASARANGA_ROLE_REVIEW_2026-11-22.md`.

The new `validate:pace-role-analysis` script checks that these role descriptions, overseas slot counts, Hasaranga release status and injury sources remain present in the application.
