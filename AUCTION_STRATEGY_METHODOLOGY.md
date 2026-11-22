# Auction Strategy Methodology — RR IPL 2027

**Snapshot date:** 21 November 2026  
**Decision purpose:** compare RR-specific squad packages against the 19 retained players, six open squad places, five retained overseas players and ₹27.05 crore published purse.

## 1. Start with RR's squad—not generic player quality

The decision is constrained by the retained roster and role gaps. The working thesis is to protect the existing core, test selective Indian pace insurance for workload / injury resilience (not a vacant role), and consider specialist phase or middle/lower-order batting only where the role adds something distinct. This remains a hypothesis to challenge, not a fixed purchase instruction.

The six available places are capacity, not a shopping target. Squad-size and overseas limits are feasibility gates; the flexible-XI continuity policy is a separate analyst setting.

## 2. Package scenarios

Auction Strategy Simulator v1 compares:

1. **No-buy baseline:** the retained 19, no auction spend.
2. **Single target:** one selected released-but-registration-unverified research profile.
3. **Two-player package:** two distinct profiles; a duplicate is prevented in the second selector.
4. **Broader package:** the up-to-six additions currently selected in the Squad & XI package builder.

Each package is run through `optimizeRRLineups()` with the same retained roster, target pool, role constraints, context, medical assumptions and XI-change policy used by the main workbench.

## 3. What is compared

- Squad count against 25 and overseas squad count against 8.
- Best XI overseas count against 4.
- XI-fit heuristic change versus the no-buy case.
- Names entering and leaving the preferred XI relative to the retained-only control.
- Role-tag coverage before and after the package.
- Up to three alternative XIs and their heuristic scores.
- A retained-player absence stress test for the broader package.
- Historical phase sample exposure for accepted players: legal-ball count, matches, confidence label and shrunken context metric where available.
- A same-discipline research alternate to inspect, where one exists.

Role-tag counts are squad-depth labels. They do not measure overs capacity, role primacy, workload, specialist availability or proven execution. The XI-fit score is an analyst heuristic, not a player rating, performance probability or match-win estimate.

## 4. Budget and bid assumptions

The official RR remaining purse in the dated snapshot is ₹27.05 crore. The analyst may enter a hypothetical planned bid for each accepted package member. The simulator sums those inputs, calculates purse remaining and flags a package that exceeds the published purse. It does not suggest a bid, calculate a player-specific walk-away price or model rival bidding.

There is deliberately no walk-away ceiling field in the interface: the available data do not support a defensible player-specific stop price, and a manually typed ceiling would only trigger a basic comparison warning rather than provide decision logic. Any club-approved stop price should be established separately by the auction team using information not currently represented in this prototype.

No new price is inferred from player performance, previous contract salary or the release-list salary column. The official release PDF's salary column is a previous contract amount in lakhs, not a current base price or expected 2027 clearing price.

## 5. Market gates

The dated snapshot references the official retention announcement, team purse page, released-player PDF, “To Be Auctioned” page and player regulations.

As checked on 21 November 2026:

- The released-player list reconciles 19 of 20 research profiles as released.
- Daryl Mitchell remains market-unresolved and blocked.
- Mahipal Lomror's name is spelled “Mahipal Lamror” in the PDF and “Mahipal Lomror” on the official player profile; the identity is reconciled with the official MI replacement announcement.
- Mangesh Yadav is listed under RCB.
- The separate “To Be Auctioned” page returned no player rows at retrieval. Release therefore remains distinct from registration; none of these research profiles is represented as auction-registered by this evidence alone.

Market status must be checked again close to the auction. No live registration API or auto-refresh is present.

## 6. Medical gate: Matheesha Pathirana

Pathirana is labelled injury-prone / elevated availability risk. The source note records reported shoulder (2024), left-calf (2026 T20 World Cup) and left hamstring (IPL 2026, surgery) setbacks. This is a historical risk flag, not a diagnosis or current-fitness claim. He is excluded from the normal single/pair selector and can only enter the broader hypothetical package with an explicit analyst assumption. That assumption is not medical clearance.

A real bid would require current independent medical assessment, rehabilitation records, bowling-load progression and franchise medical clearance.

## 7. Evidence quality and limits

Historical phase residuals are computed from the supplied IPL 2022–2026 data with match-grouped out-of-fold training and a chronological 2026 holdout. The venue-blind model improves RMSE by about 1.08% over a simple phase baseline but worsens MAE. Venue ID does not improve holdout performance. Evidence is sample-gated and shrunk; no-history candidates remain “no estimate.”

The Impact Player archive contains 558 incoming/outgoing flags across 291 matches with incoming records, but lacks exact substitution time and match state. It cannot train a state-conditioned Impact Player selection classifier. Match Lab therefore uses current match-state inputs, role-fit logic and historical evidence as a cautious tie-break.

No current pitch report, weather/dew, ball condition, verified opposing XI, injury prognosis, auction registration feed, auction-price model or rival demand model is present.

## 8. Recommendation discipline

The simulator should support a coach asking:

- What changes relative to retaining the current group?
- Does the target actually enter the XI, or only improve bench depth?
- Which role tags improve, and which gaps remain?
- What is lost or displaced?
- How much purse is consumed under the analyst's own bid assumption?
- At what price should the club stop?
- Which same-discipline alternative deserves another look?

It does not make an autonomous bid recommendation. Final choices require verified registration, current medical status, role/workload assessment, an internally approved spending plan and the coach's judgement.
