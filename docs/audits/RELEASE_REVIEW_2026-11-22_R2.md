# Release review — IPL pressure rankings restoration and match-state regression

**Release purpose:** Restore the missing IPL-only pressure-ranking workspace and strengthen tests around situation-sensitive Impact Player decisions. Existing RR recruitment ordering, Kadamba model outputs and squad/auction engine logic are preserved.

## IPL-only Pressure Rankings Lab

The previous integrated ZIP omitted the separate pressure-ranking workspace because its earlier reliability results were weak. The correct response is to expose the feature as an experimental analysis with explicit instability warnings, not to erase it or imply it is reliable.

The supplied Season 2 data pack contains IPL 2022–2026 and T20I competitions. This workspace filters competitions to `IPL YYYY` and excludes T20Is. The supplied IPL competition register has 371 match records; four have no ball-by-ball delivery rows. The filtered player-analysis sample therefore contains 367 IPL matches and 87,687 delivery rows. The UI now distinguishes scheduled records from matches with delivery data. The pressure proxy contains 27,687 legal delivery records after the configured legal-ball filter.

Pressure proxy: death overs 16–20; middle overs 11–15 after four wickets are down before the delivery; over 11 onwards in IPL Qualifiers/Eliminators/Finals; and super-over innings. Required run rate, score margin, economy and player-vs-bowler matchup effects are excluded. The dataset's `extras1_runs` is a categorical code, not actual extras runs.

Batters: minimum 60 pressure legal balls and 150 total IPL legal balls. The index uses weighted percentiles: 50% shrunk pressure strike rate, 30% pressure retention relative to baseline, 20% inverse dismissal rate.

Bowlers: minimum 90 pressure legal balls, 180 total legal balls and five bowler-credited pressure wickets. The index uses 55% shrunk bowler wickets per 100 legal balls, 30% retention relative to baseline, 15% wicket volume. Economy is not included.

The resulting split-half rank correlations are very low: 0.099 for batters and 0.063 for bowlers, each based on an odd/even match-ID split across 81 comparable players. Therefore both Top 10s are presented as **exploratory, unstable ordered shortlists**, not certified final rankings. The app displays the values and caveat together.

## Impact Player state regression

The retained-only regression evaluates 12 deliberately varied match states. It checks that batting first-innings platform and collapse states produce different required roles; chase comfort, high required rate and wicket collapse change required roles; and defending powerplay, middle and death each produce distinct requirements. Recommendations must be non-empty, inside the retained squad, outside the XI, and form legal substitutions.

Across the 12 retained-only cases, the model returns three distinct incoming names: Lhuan-dre Pretorius, Nandre Burger and Manimaran Siddharth. Defending recommendations change between powerplay (Burger), middle (Siddharth) and death (Burger). The same batter remains first choice across the tested first-innings/chase states because the optimized retained-only XI leaves only two partial batting-depth candidates—Pretorius and Aman Rao—outside the XI. The UI now explains this constraint. It does not force variety by selecting a player with no role fit.

## Validation results from this container

Passed: route integration (seven routes), pressure-ranking data/eligibility/unique-rank checks, 12-state Match Lab sensitivity, 89-row release-register validation, recruitment-alternative validation, auction package validation, five-case retained-only Match Lab, full 2,625-combination Impact Player matrix, spatial data validation and seven-case playoff evidence integrity.

The pressure ranking data is generated from source SHA-256 recorded in `src/data/pressure-rankings.json`. Full eligible candidate tables are included in `docs/pressure-batter-candidates.csv` and `docs/pressure-bowler-candidates.csv`; methodology is in `docs/pressure-rankings-methodology.md`. The raw ball-by-ball dataset is not bundled.

## Not certified

Native Vitest, full `tsc --noEmit`, ESLint, Vite production build, browser route rendering and responsive QA remain for local verification. Low pressure-rank split-half agreement remains a substantive limitation, not a failed build check.
