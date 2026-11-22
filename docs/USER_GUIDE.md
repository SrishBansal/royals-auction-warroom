# Royals War Room — Coach/User Guide

This guide explains what the dashboard does from the point of view of a Rajasthan Royals coach or recruitment decision-maker. It is a decision-support workspace: it organises evidence, tests squad combinations and exposes trade-offs. It does not make final selection, medical or auction decisions.

## What the dashboard helps you answer

- **What does the retained squad already give us?** See the core, role coverage, overseas balance and the gaps that may justify recruitment.
- **Which recruits solve an RR problem rather than simply being good players?** Review role-specific, squad-relative batter and bowler targets, their evidence, their limitations and their market/medical status.
- **What changes if we buy this player or package?** Compare the retained-only baseline with one-player, two-player and broader packages using the same XI-building engine.
- **Does the package improve the preferred XI, add bench depth, or displace a retained player?** Inspect XI entrants, players displaced, alternative XIs and role coverage changes.
- **Can the hypothetical package fit the squad rules and the purse?** Check squad/overseas limits and, after entering planned bid assumptions, calculate package spend and remaining purse.
- **What happens if a key player is unavailable?** Run retained-player absence scenarios and see whether the squad still has a legal, balanced XI.
- **What tactical substitution should we consider in a match?** Use Match Lab to compare Impact Player options against the innings state and the available squad.

## The five decision workspaces

### 1. War Room — compare seasons, then find the gap

Start with the five-season IPL comparison (2022–2026). Each season card uses the same 14-match league-stage basis and displays the knockout route/final tournament finish separately. This matters in 2026: RR finished fourth in the league phase and third overall after winning the Eliminator and losing Qualifier 2. The page then compares the three playoff campaigns, shows the seven-match 3–4 playoff record, and checks the detailed match evidence against the 19 retained players. The Gap Finder separates a role that is genuinely thin from a role that is already covered.

The finishes identify volatility and recovery; they do not prove why RR won or lost. The current pace question is role redundancy under absence and reliable overs 17–20 cover, not a lack of fast-bowling names. The middle-order question is role succession after Hetmyer's release: a No.5/6 who can repair an innings is a different profile from another generic finisher. Read [`gap-finder-methodology.md`](gap-finder-methodology.md) for the retained-role map, candidate caveats and the distinction between the playoff observations and the squad-construction case.

**Use it to:** agree on what has actually happened, what the retained squad already covers, and which gaps merit testing before looking at individual names.

### 2. Recruitment — inspect RR-specific targets

The board separates batter and bowler targets and presents them in the context of Rajasthan Royals' roster and role gaps. Candidate profiles bring together role fit, the supplied performance evidence, incremental value relative to incumbents, counterarguments and status notes.

Pay attention to the distinction between: **released**, **auction-registered**, **market unresolved** and **medically restricted**. A released player is not automatically confirmed as registered for the auction. Pathirana is explicitly flagged as injury-prone / elevated availability risk; this is a historical risk flag, not a statement about current fitness.

**Use it to:** build a shortlist and ask what each player adds that the current squad does not already have.

### 3. Squad & XI Lab — test the squad, not just the player

This is the main planning workspace. Choose a team objective and the relevant scenario assumptions, then select hypothetical additions. The engine searches for legal XIs and shows up to three leading alternatives. Squad-size and overseas limits are hard constraints; the maximum number of changes from the reference XI is a separate analyst policy, not an IPL rule.

For each package, inspect:

- **Squad and overseas counts:** whether the total squad and playing XI respect the applicable limits.
- **XI-fit delta:** how the engine's heuristic changes versus the no-buy baseline. This is a scenario score, not a rating, forecast or win probability.
- **XI entrants and displaced players:** whether a recruit actually enters the leading XI, or mainly adds cover/depth.
- **Role coverage:** whether the number of players carrying curated role tags changes. These counts measure labelled depth, not bowling workload or specialist availability.
- **Alternative XIs:** other legal combinations worth discussing rather than treating one result as certain.
- **Absence stress test:** a separate selector check, not playoff evidence. The engine was run 19 times, removing one retained player each time; it generated a role/constraint-valid XI in 16 scenarios and failed to do so in the Jurel, Sooryavanshi and Jaiswal cases. These are counts under the current tags and constraints—not model accuracy, injury probability or proof that no practical cricket alternative exists.

#### Auction Strategy Simulator — compare acquisition packages

The simulator sits inside Squad & XI Lab and compares four cases:

1. **No-buy baseline:** keep the retained 19 and spend none of the auction purse.
2. **Single target:** add one selected research candidate and see the XI/squad change.
3. **Two-player package:** test two different candidates together, including whether the second player adds a distinct role or useful depth.
4. **Broader package:** test the players currently selected in the package builder, up to the available squad capacity.

Each package is run through the same XI engine. You can compare squad legality, best-XI composition, role coverage, historical phase samples, alternatives and market/medical warnings. For budget analysis, enter your own **planned bid** for each accepted player. The simulator sums those assumptions, calculates package spend and shows the remaining purse or an over-purse warning.

**Important budget boundary:** the planned bid is your scenario input, not a price forecast. The application deliberately has no walk-away-ceiling control and no value-per-crore score. There is no defensible player-specific stop-price model in the supplied data; a club-approved stop price must be set separately by the auction team.

**Use it to:** answer “what does this package buy us in cricket terms, who loses their place, what depth improves and what happens to the purse?” It does not tell you what a player is worth or how much rival franchises will bid.

### 4. Match-state Lab — prepare the Impact Player decision

Start by selecting exactly **11 players** in Squad & XI Lab. That page decides the starting team; it does not choose an Impact Player and does not contain a permanent twelfth slot. Send the selected XI to Match Lab. There, choose whether RR is batting first, chasing or defending, then enter the match state: score, wickets, overs and target where relevant. The lab recalculates the role needed now and evaluates eligible non-XI squad options. Its recommendation is a **one-for-one substitution**: one player comes in and one current starter makes way. Review both names together, the role gained, the capability lost, supporting historical phase evidence where available and any uncertainty. The same candidate may remain first in more than one batting situation if the retained bench only contains partial batting-depth options; the interface labels that as partial cover rather than manufacturing different names. Role tags are listed-coverage labels; they do not establish specialist overs or like-for-like execution.

The historical archive contains Impact Player in/out flags but not the substitution timestamp or match state needed to train a true historical choice model. Treat the output as a tactical decision aid—not as proof of what a coach historically would have done or a substitute eligibility confirmation. Confirm the official match-day team sheet and rules.

**Use it to:** structure a match-specific discussion, make the trade-off visible and understand what capability is added or lost by the substitution.

### 5. Playoff Evidence — review the supplied knockout context

This area organises the playoff scorecards and available phase investigations so the recruitment case is connected to actual RR evidence. Read the data definitions and limitations alongside the numbers; delivery-derived components are not always identical to official scorecard aggregates.

**Use it to:** challenge the squad thesis with the supplied knockout evidence rather than relying only on general player reputation.

### 6. Kadamba Spatial Lab — ask a better video-review question

Open **Kadamba zones** from the top navigation or homepage. The page displays a 5×5 landing-zone map with observed batter runs / bowler-credited wicket rates and two prediction layers: context-only and context plus location. Switch the outcome between batter runs per legal delivery and bowler-credited wicket probability, then select a zone to inspect its sample size, observed values, Wilson interval and held-out prediction averages.

**How a coach can use it:** identify where balls in the supplied tracking sample actually landed; compare whether location adds anything beyond delivery and match context; then choose a small number of clips or training scenarios for review. It is a research and questioning tool—not a command to bowl at a particular cell, a live pitch report, or a named-batter matchup system. Predictions are averaged over held-out deliveries that actually landed in each cell; they do not simulate intentionally targeting the cell. The 5×5 “Kadamba” label is a project display name, not an official pitch-zone standard. The data lacks a verified date/team/player crosswalk to the RR 2022–2026 analysis, so this page does not influence the recruitment board, pressure rankings or Match-state suggestions. Read [`audits/SPATIAL_MODEL_PILOT.md`](audits/SPATIAL_MODEL_PILOT.md) before interpreting the model results.

### 7. IPL Pressure Rankings — inspect the experimental IPL-only lists

Open [`/pressure-rankings`](../src/routes/pressure-rankings.tsx) for separate ordered Top 10 batter and bowler lists from the supplied IPL 2022–2026 delivery sample. T20Is are excluded. The page shows the ranking sample and split-half stability; the Spearman correlations are only 0.099 for batters and 0.063 for bowlers. This is very low agreement between the two match-ID halves. The lists are exploratory and unstable, not validated final pressure rankings and not RR recruitment rankings. Read [`pressure-rankings-methodology.md`](pressure-rankings-methodology.md) before relying on the ordering.

### 8. Sources & Methods — trace the evidence

Open [`/sources`](../src/routes/sources.tsx) from the main navigation. It lists the 24 source records supplied with the project and separate provenance cards for IPL Pressure Rankings, the Kadamba spatial pilot and player/phase evidence. Check the sample window, what each source supports and the listed limitations before using an output. The page is a static source snapshot, not a live data feed.

**Use it to:** answer “where did this number come from, what is the underlying sample, and what does this source not prove?”

The five-season table definitions, primary source and reconciled league/playoff aggregates are documented in [`season-review-methodology.md`](season-review-methodology.md).

## Recommended way to use the dashboard

1. Start with the retained-core baseline. Do not assume all six vacancies must be filled.
2. Identify the one or two roles that materially limit the preferred XI or injury cover.
3. Open Recruitment and compare each target with the incumbents and alternatives. Check registration and medical caveats.
4. In Squad & XI Lab, test no-buy, one-target, two-target and the broader package. Watch who enters and leaves the XI.
5. Enter your own planned bids only when you have a reasonable internal assumption. Check package spend and purse remaining; do not treat the input as an app recommendation.
6. Run an absence stress test. A recruit may be valuable even if they do not immediately enter the first-choice XI.
7. Carry the preferred XI into Match Lab and test distinct match situations and Impact Player substitutions.
8. Optionally use the separate Kadamba Spatial Lab to examine the tracking sample and prediction comparison; do not treat it as RR-specific tactical advice.
9. Take the best-supported scenarios to the coaching/auction meeting with the evidence, assumptions and unresolved checks visible.

## What the dashboard does not know

The prototype does not have a live auction-price model, rival demand model, automatic auction-registration feed, current injury/medical data feed, live pitch/weather/dew feed, confirmed opposing XI or trained state-conditioned Impact Player classifier. Historical performance is descriptive evidence with sample gates and shrinkage, not a guarantee of future output. The XI optimizer is a deterministic role/constraint heuristic, not a match-win predictor.

For a real auction, independently confirm player registration, current medical and workload status, applicable auction rules, purse updates and the club's internal bid authority.
