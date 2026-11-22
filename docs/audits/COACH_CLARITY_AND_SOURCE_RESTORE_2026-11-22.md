# Coach Clarity & Source Restore — 22 November 2026

## Purpose

This release responds to local browser feedback on the prior test ZIP. It corrects the Squad Architecture crash, separates the starting XI from the Impact Player substitution, makes the Kadamba coaching use explicit, restores the source register, and relabels the squad absence stress test so it cannot be mistaken for playoff evidence.

## Changes

### Squad Architecture runtime fix

The browser error was `ReferenceError: TARGET_BY_NAME is not defined` in `src/components/auction-strategy-simulator.tsx`. The component now declares `TARGET_BY_NAME` from `RR_FOCUSED_TARGETS`, and the auction simulator validator asserts that declaration is present. This addresses the exact missing-symbol defect shown in the user's screenshot. It still requires local browser confirmation.

### Team sheet and Impact Player clarity

- The starting XI rail shows exactly eleven selected players.
- It no longer implies a permanently occupied twelfth Impact Player slot.
- Match Lab is a separate step: enter innings mode, score, wickets, overs and target/total; the engine derives the current role need; then inspect one incoming player paired with one outgoing starter.
- The preview makes the benefit and capability trade-off visible and validates the eleven-player resulting XI.
- The retained-only bench has only two generic batting-depth options for the tested batting scenarios. The same candidate may therefore remain first across several batting states. The UI calls this partial cover and does not invent differentiated finishers. Defending choices change by phase in the tested retained-only cases.

### Gap Finder language

The 16-of-19 selector result is no longer called playoff evidence and is not displayed as an accuracy percentage. It is a fixed rule-engine stress test: remove each retained player once and check whether the current role tags and constraints still admit an XI. The three failures (Jurel, Sooryavanshi, Jaiswal) require coach review; they do not prove no real-world replacement exists.

### Kadamba coach use

The page now explains the practical chain: inspect where tracked deliveries landed, compare observed outcomes with context-only and context-plus-location held-out estimates, then select video/training questions. It is not a live pitch report or a recommendation to bowl a specific zone to a named batter. The model remains aggregate and disconnected from RR five-season player/team IDs.

### Sources & Methods

Restored `/sources` with the 24 supplied source records and model provenance cards for pressure rankings, Kadamba and player/phase evidence. The page distinguishes what a source supports from what it cannot prove.

## Validation in the editing environment

Passed:

- 10 standalone domain/data validators: routes, pressure rankings, Match Lab state sensitivity, release register, recruitment alternatives, auction packages, retained-only Match Lab, expanded Impact Player matrix, spatial pilot and playoff evidence.
- 96 TypeScript/TSX files transpiled with zero syntax errors.
- Route-integrity validator sees eight routes, including `/sources`, with home and navigation entry points.
- Source register count check: 24 source records.
- Auction simulator source guard verifies `TARGET_BY_NAME` declaration exists.
- Match Lab validators verify eleven-player team-sheet and one-for-one substitution language/logic.

Not certified in this environment:

- Native Vitest execution.
- Full `tsc --noEmit` (project dependencies/type definitions are not installed here).
- ESLint.
- Vite production build.
- Browser rendering, visual responsiveness or end-to-end clicks.

The route validator explicitly reports `browserRenderingCertified: false`. The fix to `TARGET_BY_NAME` is directly matched to the user's stack trace, but the user must confirm `/squad` locally.

## Known analytical constraints

- Pressure ranks are IPL-only and experimental. The odd/even match-ID split Spearman is 0.099 for batters and 0.063 for bowlers; not a reliable final ranking.
- The Impact Player historical archive has in/out flags but no exact substitution state/time, so recommendations are a rule-based decision aid rather than a trained state-conditioned substitute-choice classifier.
- Several retained-only batting states return Lhuan-dre Pretorius first and Aman Rao Perala as the alternative because those are the two partial batting-depth options in the selected bench. This is not evidence either is a proven specialist finisher or middle-order repair batter.
- Kadamba shows modest context-plus-location improvement, but it is not player-specific, has no chronological holdout, and wicket probabilities are not calibration-certified.
- The absence scan is an engine stress test, not forecast accuracy or real-world injury cover.
