# Application routes

The application has seven active TanStack file routes:

| File | URL | Purpose |
| --- | --- | --- |
| `index.tsx` | `/` | Executive War Room, five-season comparison, playoff evidence and squad-gap narrative |
| `squad.tsx` | `/squad` | Retained squad, XI permutations and absence-cover checks |
| `targets.tsx` | `/targets` | Role-first recruitment decisions and evidence |
| `match-lab.tsx` | `/match-lab` | First-innings, chase and defence situation analysis |
| `knockouts.tsx` | `/knockouts` | Seven playoff records and supplied phase diagnostics |
| `spatial-lab.tsx` | `/spatial-lab` | Separate experimental Kadamba 25-zone map and expected-outcome pilot |
| `pressure-rankings.tsx` | `/pressure-rankings` | IPL-only experimental pressure Top 10s; separate from RR recruitment |
| `__root.tsx` | app shell | Shared navigation, metadata and layout |

The spatial lab is deliberately isolated. It does not feed the recruitment board, pressure rankings, squad-selection engine or Match-State recommendations. `routeTree.gen.ts` is the TanStack generated route map and must include all seven routes.
