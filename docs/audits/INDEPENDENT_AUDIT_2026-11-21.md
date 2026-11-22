# Independent Application Audit — 21 November 2026

## Scope

Review of the five routes (`/`, `/squad`, `/targets`, `/match-lab`, `/knockouts`) in the supplied `Royals_War_Room_RR_2027_Situation_Based_Impact_Update.zip`, cross-checked against source data files and the independent findings supplied in the review transcript.

This is a source-and-data audit. It is not a rendered-browser certification.

## Findings and changes in this revision

| ID | Finding | Evidence | Severity | Action in this revision |
|---|---|---|---|---|
| F1 | Recruitment route claimed all 89 released reference names, while its only directory showed 20 researched candidates. | `src/routes/targets.tsx`, `src/components/recruitment-workbench.tsx`, `src/data/rr-2027-released-reference.csv` | High | Corrected metadata; added a separate searchable 89-row reference register. It is explicitly not the 20-player recommendation pool and does not make names selectable. |
| F2 | Diverged `.js` snapshots sat beside active `.ts` modules inside `src/`. | `src/domain/*.js`, `src/data/war-room.js`; no active source imports found in the audit. | Medium | Moved five stale JavaScript snapshots to `archive/legacy-js/` with a README identifying active TypeScript modules. |
| F3 | No UI-render/interaction tests existed; route test only resolved `/`. | Existing `src/test/app-routing.test.tsx`; prior test inventory. | High | Added a render/interaction test for the XI rail, two recruitment-page register tests and route-resolution coverage for all five paths. Other component interactions still need coverage. Tests were added but not executed in this container. |
| F4 | Previous project claims referenced validation from an earlier revision; native build/typecheck/test evidence for the exact edited tree was absent here. | `node_modules` absent; global `tsc --noEmit` stops because `vite/client` and `vitest/globals` types cannot be found. | Medium–High | Current revision has syntax transpilation and domain/data validator evidence, but no native test, lint or production build claim. |
| F5 | Champion continuity panel presented a measurement protocol in primary homepage space, without calculated benchmark evidence. | `src/components/war-room-home.tsx`, `CHAMPION_CONTINUITY_BENCHMARK`. | Low–Medium | Reframed as “Research gap · not yet calculated”; removed the named team-case tiles that could imply a completed comparison. |
| F7 | All 20 research-board profiles lacked confirmed auction registration in the supplied snapshot. | `src/domain/recruitment.ts`: 19 `RELEASED_REGISTRATION_UNVERIFIED`, 1 `MARKET_STATUS_UNRESOLVED`, 0 `AUCTION_REGISTERED`. | Medium | Added a prominent market-readiness gate showing counts and explicitly limiting use to hypothetical squad-fit scenarios. |
| F8 | Venue had prominent visual weight despite zero first-choice changes in the controlled venue comparison. | `match-lab` audit: 0/50 first-choice changes with fixed situation and varied venue. | Medium–High | Demoted venue into a collapsed optional historical-context section and surfaced the controlled-comparison result. Surface and opposition remain separate analyst inputs. |
| F9 | Historical context-model validation caveat appeared below bold evidence values. | Historical validation: about 1% RMSE improvement, MAE does not improve and is worse in some 2026 splits. | Medium | Moved the model-quality caveat above the historical evidence cards and reduced the chance of reading the values as predictions. |
| F10 | Auction simulator displayed only the first two engine warnings. | `src/components/auction-strategy-simulator.tsx`; six-player package yielded six engine warnings in the independent review. | Medium–High | Replaced truncation with a labelled, scrollable list that renders every warning. |
| F14 | Backup research option was selected by unexplained ordinal player rank. | `getRankedBackup()` in the simulator sorted candidates by `rank` and used that to pick a fallback. | Medium–High | Replaced it with same-discipline role/tactical-profile overlap. The explanation names the matching role; board rank no longer chooses the fallback. |
| F15 | The 1–10 shortlist sequence had no reproducible weighted derivation documented, but looked like a scored ranking. | `rank` fields in `src/domain/recruitment.ts`; no derivation in methodology documents inspected. | Medium | Added an explicit UI caveat that this is an analyst-curated order, not a weighted model score, probability or auction priority. |
| F12 | Three playoff innings showed the same 36 batter-run component in overs 16–20. | Re-summed the supplied raw `ball_by_ball.csv` by match, innings and over. | Medium pending verification | Confirmed all three 36s are present in the source delivery rows. Added a source-reconciliation note; retained the 2026 scorecard reconstruction gap as unresolved. |
| F13 | Phase charts show batter-run components but do not reconcile all extras to official team totals. | The supplied P0 reconstruction does not preserve all bye/leg-bye amounts; 2026 Q2 source reconstruction is seven below the listed scorecard total. | Medium | Kept chart labels as batter-run components and documented the residual/gap; did not relabel as official phase totals. |

## Findings retained as limitations

- **Auction registration:** zero of the 20 research-board candidates is marked `AUCTION_REGISTERED` in the supplied snapshot. A player can be released without being registered. The 89-name reference register is therefore not a bid-ready list.
- **Historical model quality:** the context model's RMSE improvement is small, and MAE does not improve. Its historical figures should be treated as comparative tie-break evidence only.
- **Venue effect:** no first-choice change was observed in 50 controlled comparisons. This is a result for the tested scenario set, not proof that venue can never matter.
- **UI coverage:** tests have been added for the XI rail, recruitment reference list/search, role-matched fallback and route resolution. Native Vitest was not available in this container, so the new tests have not been executed here. Full interaction coverage for every route, state and responsive layout is not yet present.
- **Build verification:** this working container has no `node_modules`; native Vitest, ESLint and Vite build could not be run after these edits. TypeScript/TSX syntax transpilation and data-level validators are run separately and must not be represented as a full build.

## Positive evidence retained

The independent adversarial review found the core squad legality gates held in its tested scenarios: no duplicate names, no more than eleven players, no more than four overseas in the XI, and correct exclusion of unresolved-market / medical-review players under the tested assumptions. Those checks are useful but do not replace complete UI-level tests.
