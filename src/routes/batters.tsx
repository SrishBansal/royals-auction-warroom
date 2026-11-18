import { createFileRoute } from "@tanstack/react-router";
import { BattersPage } from "@/components/pages";

export const Route = createFileRoute("/batters")({
  head: () => ({
    meta: [
      { title: "Pressure-Ranked Batters | Royals War Room IPL 2027" },
      {
        name: "description",
        content:
          "The supplied SupeRR P1 top-10 batter rankings with exact scores, intervals, exposure and IPL share.",
      },
      { property: "og:title", content: "Pressure-Ranked Batters | Royals War Room" },
      {
        property: "og:description",
        content:
          "Ten frozen P1 batter ranks with uncertainty, gated sample sizes and descriptive evidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BattersPage,
});
