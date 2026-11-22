# Coach data readout and Auction Strategy Simulator — implementation record

**Status as of 21 November 2026:** the coach-facing evidence readout and Auction Strategy Simulator v1 are present in the source. This is an analyst decision-support module inside Squad & XI Lab, not a new sixth workspace.

## What the interface surfaces from the supplied data

The Recruitment workspace includes a live readout sourced directly from `src/data/historical-impact-model.json`:

- 362 usable IPL matches from 2022–2026.
- 82,781 legal deliveries.
- 18 numeric venue IDs in the source; 14 curated ground mappings.
- 558 incoming and 558 outgoing historical Impact Player flags.
- Chronological 2026 holdout model diagnostics.

The 2026 venue-blind context model has RMSE 1.84496 against a simple phase baseline RMSE 1.86505 (about 1.08% RMSE improvement), but MAE is worse (1.44937 vs 1.43408). The product calls this uncertain comparative evidence, not an individual forecast.

## Auction Strategy Simulator v1 — implemented

Located in the **Squad & XI Lab**, immediately after the combination builder, and driven by the actual `optimizeRRLineups()` domain engine and the same package, medical and context assumptions as the XI workbench.

### Live package comparisons

1. **No-buy baseline:** retained-only control case.
2. **Single target:** selectable profile from the released-but-registration-unverified research pool.
3. **Two-player package:** two distinct selectable profiles; the second selector excludes the first.
4. **Broader depth package:** mirrors the candidates currently selected in the squad package builder (up to the six genuine open places).

Each package shows legal squad size, overseas squad count, overseas XI count, change in the engine's XI-fit heuristic versus no-buy, role-tag coverage before/after, who enters/leaves the leading XI, and up to three alternative XIs. A retained-player absence stress test is shown for the broader package. The displayed heuristic is not a player-quality rating, match-win probability or calibrated forecast.

### Budget and bid assumptions

- Uses RR's published 2027 remaining auction purse: **₹27.05 crore**, with 19 retained players, six squad places, five retained overseas players and three additional overseas places.
- The analyst may enter a hypothetical planned bid for each accepted candidate.
- The UI calculates package spend, purse remaining and an over-purse warning. It shows a simple purse check after all selected bids have been entered.
- There is no walk-away ceiling input or XI-fit-per-crore KPI: current evidence does not support a player-specific stop price or a defensible monetary value for an XI-fit point. A typed threshold or ratio would risk looking more analytical than it is. Any club-approved stop price belongs in the auction team's separate internal process.
- No price is forecast from player performance or from previous franchise salary. The official released-player PDF's salary column is prior contract salary in lakhs; it is not a 2027 auction base price or expected clearing price.

### Market and medical gates

- The current market snapshot links the official retention announcement, official RR team-purse page, official released-player list, official "To Be Auctioned" page and 2025–27 regulations.
- The official released-player list is used to reconcile player release status. The separate official "To Be Auctioned" page returned no player rows when checked on 21 November 2026; released players therefore remain **registration unverified** and the interface does not call them bid-ready.
- The official release PDF spells Mahipal Lomror as "Mahipal Lamror"; the player identity is cross-checked with the official IPL profile and MI replacement announcement. Mangesh Yadav is listed under RCB in the official release list, resolving the earlier report conflict. Daryl Mitchell remains market-unresolved and blocked because he is not listed in the supplied official 2027 released-player list.
- Matheesha Pathirana remains excluded from the standard single/pair research selector because of the separate medical-review restriction. He can only enter an explicitly hypothetical broader squad scenario through the existing assumption control; the control is not medical clearance. The UI continues to flag him as injury-prone / elevated availability risk.
- No registration feed or automatic refresh exists. Every source link carries retrieval-date context in the shipped snapshot and must be checked again before an actual auction decision.

## Impact Player: what is implemented and what is not

The Match-state Lab evaluates the selected eleven-player starting XI and eligible non-XI squad options against innings mode, phase, wickets, score/current rate or required rate, required role coverage, surface assumption, opposition profile, and historical player evidence where sample gates pass. It shows the recommended candidate, alternatives, rationale and complete situation-based one-for-one incoming-for-outgoing combinations. The team sheet always contains eleven players; the Impact Player is a match-state substitution preview, not a permanent twelfth slot. Each combination pairs an eligible incoming option with a current starter selected by role-coverage checks. It displays the match trigger, role gained, outgoing capability cost and a before/after coverage audit.

The archive also contains 558 incoming and 558 outgoing Impact Player flags across 291 matches with an incoming record. Those flags do not contain the substitution timestamp, score, wickets, innings phase or nominated alternatives. They are displayed descriptively only and are not used to train a state-conditioned Impact Player choice model. The present recommendation is a rules/role-fit decision-support engine with historical player evidence as a cautious tie-break—not a trained classifier predicting the historical coach's choice.

## What is deliberately not implemented

- No price forecast, auction-demand model, price backtest, walk-away calculation or predicted bid recommendation. The simulator uses a manual planned-bid input only for purse arithmetic.
- No live auction registration API or auto-refresh. The registration gate remains conservative until each candidate is present in the official auction list.
- No automatic enumeration/ranking of every possible three-to-six-player package. The broader scenario mirrors the coach's current package-builder selection; the other controls compare a single target and a pair.
- No trained state-conditioned Impact Player classifier; the supplied flags do not contain substitution-time match state.
- No current medical clearance or return-to-play prediction.

## Pathirana risk wording

Matheesha Pathirana is labelled **“Injury-prone · elevated availability risk.”** The medical note records the reported shoulder injury in 2024, left-calf injury during the 2026 T20 World Cup, and left hamstring injury in IPL 2026 requiring surgery. This is a historical risk flag, not a diagnosis or a statement about current fitness. A current independent medical assessment, rehabilitation record and bowling-load review remain mandatory before any real bid.

## Sources for current auction context

- Official 2027 retention announcement: https://www.iplt20.com/news/article/tata-ipl-2027-player-retentions-announced
- Official 2027 team purse / RR team page: https://www.iplt20.com/auction/2027/teams?team=RR
- Official 2027 released-player list: https://www.iplt20.com/cms/files/jot2qw8s50z1/3gFAJ4z1USxcXYhaZVl65L/2a463a9c02a5bb7fd12fa3fbe91cc299/TATA_IPL_2027-_Release_Player_List.pdf
- Official 2027 to-be-auctioned page: https://www.iplt20.com/auction/2027/to-be-auctioned
- Official 2025–27 player regulations: https://www.iplt20.com/news/article/ipl-governing-council-announces-tata-ipl-player-regulations-2025-27
- Mahipal Lomror official IPL player profile: https://www.iplt20.com/teams/RR/squad-details/2970
- MI announcement signing Lomror as a 2026 replacement: https://www.iplt20.com/news/article/mi-sign-mahipal-lomror-and-ruchit-ahir-as-replacements

