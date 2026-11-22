# Candidate-pool scope notice — 22 November 2026

## Scope shown in the application

A compact candidate-pool notice is mounted in the shared `PageFrame`, so it appears below the primary navigation across all workspaces. Recruitment also repeats the full scope in its market-readiness gate. The notice links to the timeline source and `/sources`.

The RR recruitment and squad-fit analysis uses the released-player names present in the supplied 18 November 2026 dataset only. It does **not** include new auction registrations submitted during the open registration window and must not be read as the final registered auction pool. The 20-player RR research shortlist and the 89-name release reference are research inputs, not proof that a player has registered or will appear in the auction.

## Reported IPL 2027 schedule as of 22 November 2026

- Player registration window closes: 23 November 2026.
- Additional player requests: reported through 27 November 2026.
- Final player register and sets shared with franchises: expected 3 December 2026.
- Auction: 16 December 2026.

The registration timeline is reported by Moneycontrol and IPL.com, not represented here as an official final register. Sources: [Moneycontrol, 2 November 2026](https://www.moneycontrol.com/news/cricket/ipl/ipl-2027-bcci-extends-deadline-for-franchises-to-submit-player-retention-list-check-new-date-14066701.html) and [IPL.com auction timeline report](https://www.ipl.com/cricket/news/ipl-2027-auction-teams-get-two-extra-days-to-submit-retention-lists/).

## Required update after publication

When the final registered pool is released, ingest the official list, reconcile names and registration status against the current 20-player shortlist and 89-name reference, identify eligible additions that are not currently represented, and rerun the role-fit, market-status and squad-package checks. Do not silently add unverified names.

## Validation

Run `node scripts/validate-candidate-pool-scope.cjs`. The check verifies the global notice, its snapshot date, its explicit exclusion of new registrations, all reported milestones, the Recruitment-page repeat, both timeline source records and the README/methodology/audit notices. The route integration validator was updated to require 25 source-register records and the Moneycontrol schedule reference.
