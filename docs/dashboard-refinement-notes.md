> **Historical note — superseded:** this document predates the 21 November historical IPL evidence integration and the later user-requested package-level Auction Strategy Simulator. Its suggestions for hand-authored Wankhede/Chepauk/Jaipur venue pitch archetypes are obsolete. Current Match Lab uses historical player/venue evidence with no inferred physical surface; see `historical-impact-model-report.md` and `impact-player-historical-matrix.md`.

# Royals War Room — product decisions and refinement notes

## Product principles

1. Protect RR's retained core; compare no-buy, one/two-target, and three-to-six-addition packages rather than treating six open places as a shopping list or imposing a two-acquisition cap.
2. Lead with the actual squad problem: selective Indian pace insurance only when it improves the retained Shami–Burger–Archer–Sandeep–Brijesh–Sushant role mix, a specialist phase option only when needed, and a lower/middle-order hitter only when his role adds something distinct.
3. Use the playoff evidence to explain the gap, then connect the recruitment decision to a valid XI and match-state use case.
4. Treat role fit, pressure evidence, market status and medical restrictions as different evidence types.
5. Prefer four or five complete workflows over a larger number of shallow dashboard pages.

## The five decision workspaces

- **War Room:** explains why the retained squad is already close, the continuity principle, the playoff diagnosis and the small number of gaps worth solving.
- **Squad & XI Lab:** shows role coverage and compares continuity-first XI combinations against hypothetical squad packages up to the real six open roster places, bounded by the 25-player / 8-overseas squad limits. It includes injury-absence checks; the two-XI-change rule is a strategy heuristic, not an auction cap.
- **Recruitment:** presents selective pace insurance rather than a missing-role claim, conditional specialist phase cover and lower-order batting insurance. Candidate cards explain role, evidence, incremental value and the main counterargument.
- **Match-state Lab:** distinguishes RR batting first, chasing and defending. It computes score state and rates, ranks role-fit options from the active non-XI squad pool and explains the trade-off; match-day substitute nomination remains a separate check.
- **Playoff Evidence:** presents seven scorecards and three detailed phase investigations with charts that preserve the source report's extras caveat.

## Continuity and recruitment logic

The product tests a seven-player continuity reference: Vaibhav Sooryavanshi, Yashasvi Jaiswal, Riyan Parag, Dhruv Jurel, Donovan Ferreira, Ravindra Jadeja and Jofra Archer. The remaining roles are flexible. The engine currently limits a starting XI to no more than two changes from the reference as a strategic heuristic, but allows fuller hypothetical squad packages within the actual squad and overseas limits.

The main question is not whether a player is individually famous or has a strong historical pressure statistic. It is whether he improves a role RR need, can fit the overseas/squad constraints, and creates a stronger combination than the retained option.

## Player-specific boundaries

- **Shanaka:** retained overseas batting all-rounder; keep him visible in the No.7/8 flexible block. Do not force him to No.7 in every situation.
- **Avesh:** Indian multi-phase pace/depth option; prior RR contribution matters, but the supplied death wicket rate is below the retained-core median.
- **Akash:** conditional Indian backup/depth option with small-sample and 2025 economy caveats.
- **Pathirana:** conditional death specialist only; medical/workload clearance and registration must be verified independently.
- **Nehal:** natural Indian No.5 profile; the supplied pressure exposure is below the stated minimum sample threshold.
- **Nitish:** larger supplied IPL middle-order sample and No.4/5 repair profile; not a specialist No.6/7 finisher.

## Match context and automatic retrieval

The app has no live pitch, weather, fixture or player-matchup data service. The hand-authored venue starting archetypes described in this original note have been removed. Current Match Lab uses sample-gated, shrinkage-adjusted player/phase/ground and player-vs-style evidence from the uploaded 2022–2026 IPL archive. Physical surface defaults to neutral; optional track values remain manual scenario assumptions. See `historical-impact-model-report.md` and `impact-player-historical-matrix.md`.

## Explicit removals

- No standalone global pressure-ranking pages.
- No interface language about a frozen historical ranking archive.
- No benchmark-exclusion register.
- No static allocation-check panel.
- No standalone auction purse planner or predicted-price feature. **Later update:** an integrated package comparison with manual purse assumptions was added inside Squad & XI Lab; it is not a price-prediction model.
- No candidate acquisition is presented as retained or registration-confirmed without evidence.

## Visual direction

Keep the official club-hosted Royal Crest and Jaipur imagery. Use RR pink as the main accent, warm neutral surfaces, selective navy and restrained gold. Keep the interface editorial, legible and explanation-led. Avoid repetitive small metric cards, excessive pills, glowing borders and generic gradient-heavy layouts.


## Separate research lab

A sixth route, Kadamba Spatial Lab (`/spatial-lab`), is a standalone experimental tracking-data demonstration. It does not feed the five decision workspaces, pressure ranking or RR recruitment model. See `audits/SPATIAL_MODEL_PILOT.md`.
