import { createFileRoute } from "@tanstack/react-router";
import { PressureRankingsPage } from "@/components/pressure-rankings";

export const Route = createFileRoute("/pressure-rankings")({
  head: () => ({
    meta: [
      { title: "IPL Pressure Rankings | Royals War Room" },
      {
        name: "description",
        content:
          "Separate IPL-only experimental pressure-performance Top 10s for batters and bowlers, with sample sizes, methodology and reliability caveats.",
      },
      { property: "og:title", content: "IPL Pressure Rankings | Royals War Room" },
      {
        property: "og:description",
        content:
          "IPL-only batter and bowler pressure rankings from the supplied 2022–2026 data snapshot.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PressureRankingsPage,
});
