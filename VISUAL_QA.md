# Visual QA — Emergent reference alignment

**Reference:** user-supplied Emergent preview screenshot, 20 November 2026.  
**Review date:** 21 November 2026.  
**Status:** source-level design review completed; rendered desktop/mobile QA not completed.

## Reference characteristics observed

The supplied screenshot shows a cinematic deep-navy dashboard with a compact Royals crest and serif wordmark, title-case horizontal navigation, a large editorial question-led headline, warm gold text emphasis, restrained Royals pink branding, stadium imagery, a short explanatory paragraph and spacious KPI treatment.

The wider brief asks for rounded/curved surfaces, generous spacing, readable analytical cards, clear grouping, restrained gradients and no generic “AI dashboard” treatment.

## Source changes made to match

| Reference characteristic | Source treatment |
|---|---|
| Dark navy canvas | Existing navy theme retained and tuned; cards remain layered navy rather than bright white tiles. |
| Royals identity | Official club-hosted crest is used with a text fallback if the remote asset fails. |
| Editorial serif headline | Display face changed to DM Serif Display; forced uppercase removed from `.display-face`. |
| Question-led hero | Home headline now asks what RR must add to improve the 2027 XI without duplicating existing roles. |
| Gold / pink accents | Gold is used for analytical emphasis and active nav; pink is kept for selected actions and RR brand moments. |
| Horizontal title-case navigation | Labels/order updated to War room, Squad architecture, Playoff evidence, Recruitment board, Playing XI. |
| Cinematic stadium treatment | Existing Jaipur stadium hero retained with contrast overlay and rounded container. |
| Dense analysis, clear grouping | Simulator package evidence is in collapsed details panels; package cards separate budget, XI consequences and role coverage. |
| Smooth card language | Rounded 2xl/3xl surfaces and restrained borders retained; repeated data is separated into purposeful sections. |

## Primary route composition

- `/` — cinematic hero, retained-core hypothesis, champion-continuity caveat and playoff evidence summaries.
- `/squad` — role architecture, objective/surface/opposition controls, package builder, XI outputs, Auction Strategy Simulator, then retained-player absence testing.
- `/targets` — role-tiered candidate research, incumbent comparison, evidence and candidate caveats; Pathirana is explicitly flagged injury-prone.
- `/match-lab` — match state, situation-specific Impact Player recommendation, alternatives and before/after substitution preview.
- `/knockouts` — supplied playoff scorecards and phase evidence.
- `/spatial-lab` — separate Kadamba 25-zone map with observed, context-only and context-plus-location layers for expected batter runs and bowler-credited wicket probability.

## Important content/layout decision

The Auction Strategy Simulator is embedded inside Squad & XI Lab. Kadamba Spatial Lab is a sixth, separate research route—not another step in the recruitment decision chain. The five decision workspaces remain continuous: understand the squad → add a hypothetical recruit → compare package economics → check the best XI and injury cover → take the XI to Match Lab.

## Follow-up source-level corrections

The follow-up audit keeps the 89-name release reference visually separate from the 20-player recruitment shortlist, puts the registration caveat in a prominent market-readiness section, moves venue into optional collapsed context, places the model-quality caveat before the evidence numbers and displays all simulator warnings. The homepage champion-continuity area is explicitly labelled as not yet calculated.

## Not visually certified

No live rendered app screenshot was captured in this pass. Although system Chromium is available, Vite, React and Playwright are not installed in the editing environment; the app could not be started and tested at real viewport sizes. Therefore this file does **not** claim pixel parity, visual perfection, mobile overflow-free behaviour, keyboard/focus QA, external-image network reliability or absence of browser console errors.

To complete visual QA locally, install dependencies (`bun install`), run `bun run dev`, then capture and inspect at desktop (1440×900) and mobile (390×844) for all six routes, including the standalone Kadamba Spatial Lab. Test horizontal nav, all package selectors, planned-bid input synchronization, collapsed evidence details, Match Lab state inputs, substitution controls, keyboard focus, crest/stadium image fallback and browser console/network failures.
