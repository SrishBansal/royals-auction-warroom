# Project guidance — Royals War Room

## Product mandate

Build a serious Rajasthan Royals IPL 2027 auction-strategy and squad-planning workspace. It must help an analyst move from team baseline → roster/role gap → candidate evidence → auction package → XI/bench consequence → match-state response. It is not a generic cricket-statistics dashboard.

The five connected decision workspaces are a useful starting structure: War Room, Squad & XI Lab, Recruitment, Match-state Lab and Playoff Evidence. Keep them connected as one decision workflow. A separate experimental Kadamba Spatial Lab may be present as a research demonstration, but must stay clearly isolated unless a verified player/team/date crosswalk and stronger validation are added. Restructure or replace a component when the current architecture blocks analytical quality or usability; do not preserve a bad implementation merely for continuity.

## Treat existing strategy as hypotheses, not immutable rules

- RR's supplied 19-player snapshot and competition constraints are source data for the current scenario, not assumptions to silently edit.
- “Protect the retained core and make one or two material additions” is the user's initial strategy hypothesis. Evaluate it against no-buy, one-buy, two-buy and broader squad-completion / contingency packages. Do not hard-code the conclusion that one or two buys are always optimal.
- Six open squad places are capacity, not mandatory purchases.
- The current seven-player continuity reference, fixed top-four/strike-pace anchors, two-acquisition cap and scoring weights must be challenged. Explain which are business rules, which are heuristics and which are temporary UI limits. Only real league constraints are hard constraints.
- Do not confuse historical P1 pressure-performance rankings with RR-specific auction target priorities.

## Source and evidence rules

- The submitted 27-page `SupeRR Selector Season 2 — Pressure & Auction Recruitment Report`, snapshot 18 November 2026, is an analytical source. Do not modify it.
- Re-check time-sensitive auction registration, player availability, releases, medical status, regulations and auction dates against authoritative sources with explicit as-of timestamps. Released does not mean registered.
- Preserve source provenance and separate IPL, T20I, domestic T20, age-group and practice/net evidence. Do not merge incompatible samples.
- Never invent pitch, weather, player-vs-opponent, injury, registration, bid-demand or auction-price evidence.
- A medical-review toggle is a hypothetical scenario assumption, not medical clearance.
- The engine must state when evidence is missing. Missing pressure evidence is not negative performance evidence.

## Decision-engine rules

- Use feasibility gates before candidate ranking: roster eligibility, market status, medical gate, squad cap, overseas squad cap, playing-XI overseas cap, player uniqueness, role requirements and any league rules.
- Separate player capability from role suitability, primary role from occasional/part-time cover, and historical performance from future projection.
- Replace opaque single-number ranking with explainable dimensions, uncertainty, counterarguments, incumbent comparison and scenario sensitivity. A score is permitted only when its definition, weights, calibration and limits are visible and tested.
- Consider package-level and Pareto comparisons. Do not force a single winner when the best option depends on price, availability, role or risk assumptions.
- Never silently remove a player or add an acquisition. Show before/after role coverage, overseas count, bench displacement, tactical cost and any assumptions.
- Match-state suggestions are tactical squad-pool candidates only; they do not verify official Impact Player nomination or match-day eligibility.
- Surface and opposition settings are analyst assumptions unless a timestamped source feed is genuinely integrated. Do not infer player-vs-pitch or player-vs-bowler advantages from labels alone.
- If the available squad lacks a role, report the gap rather than manufacturing a replacement.

## Engineering rules

- Inspect the entire repository and trace key UI paths to domain services and data.
- Create a separate working copy/branch before changes. Preserve the input ZIP untouched.
- You may replace flawed UI, architecture and decision logic, but retain only functionality/data that survives audit.
- Keep source data, domain logic and presentation separate. Keep eligibility rules centralized and testable.
- Add regression tests for every changed decision rule. Run the native test, lint and production build commands. If blocked, state the exact blocker; do not claim success.
- Browser-test all primary workflows and record screenshots at desktop and mobile widths.
- Never label a heuristic as ML, a deterministic search as a forecast, or a manual bid assumption as predicted price.
