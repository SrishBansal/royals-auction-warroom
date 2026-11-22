# Royals War Room — P0–P3 Improvement Register

Updated 21 November 2026 after independent source audit.

| Priority | Issue | Current status | Required next action |
|---|---|---|---|
| P0 | Do not allow an unresolved market / medical profile to enter a bid-ready recommendation. | Existing domain gates passed the supplied adversarial spot checks; market banner now makes status prominent. | Add permanent regression tests around every market/medical status and package path. |
| P1 | Candidate priority order lacks a documented reproducible scoring basis. | Simulator fallback no longer uses ordinal rank; live-data validator confirms outputs remain unchanged when candidate rank values are reversed; recruitment UI says 1–10 order is analyst-curated. | Define transparent weighted criteria or replace ordinal rankings with role-specific tiers and rationale. |
| P1 | No real historical link between prior recommendations and observed acquisition / outcome records. | Limitation documented; supplied S2 package has no Season 1 outcome corpus. | Start an append-only recommendation and decision log for future seasons; capture auction, role deployment and outcomes. |
| P1 | UI components had no smoke/interaction tests. | Added XI-rail and recruitment register tests; role-alternative tests; route checks now cover all five paths. | Tests are added but not run natively in this container. Add smoke renders for War Room, Squad, Match Lab and Playoff pages; add package apply/preview interaction tests. |
| P1 | Auction package engine warnings were hidden. | All engine warnings now render in a scrollable list. | Add an interaction test for the six-player package warning panel. |
| P2 | 89-name route claim was disconnected from the actual 20-player candidate list. | Corrected route description and added a separate 89-row reference register. | Keep the register distinct from the recruitable shortlist; update only from dated verified source documents. |
| P2 | Venue input visually overstated its observed effect. | Demoted into optional collapsed context with the 0/50 controlled-comparison caveat. | Re-run controlled comparisons when the recommendation engine or evidence weights change. |
| P2 | Model caveat visually underweighted relative to historical metric values. | Caveat moved above historical evidence cards. | Keep the same hierarchy in any future evidence cards and exports. |
| P2 | Champion continuity card contained only a measurement protocol. | Reframed as a not-yet-calculated research gap. | Obtain reconciled match-by-match XI tables before publishing a champion comparison. |
| P2 | Diverged JS source snapshots could mislead developers. | Moved outside `src/` to `archive/legacy-js/`. | Avoid restoring them; maintain TypeScript as the source of truth. |
| P2 | 2026 Q2 delivery reconstruction is seven runs below the scorecard. | Documented; identical 36 batter-run death components were re-summed from raw rows and verified. Phase chart values remain batter-run components. | Obtain a higher-fidelity extras/scorecard source before showing official phase totals. |
| P3 | Responsive and rendered visual QA not available in current container. | Not verified. | Run real browser checks at desktop and mobile sizes after installing dependencies. |

## Release gate

Do not call the package production-ready until native dependency installation, full Vitest run, typecheck, ESLint, Vite production build and browser interaction checks have passed on this exact revision.
