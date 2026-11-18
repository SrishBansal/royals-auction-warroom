import { createFileRoute } from "@tanstack/react-router";
import { BowlersPage } from "@/components/pages";

export const Route = createFileRoute("/bowlers")({
  head: () => ({
    meta: [
      { title: "Pressure-Ranked Bowlers | Royals War Room IPL 2027" },
      {
        name: "description",
        content:
          "The supplied SupeRR P1 top-10 bowler rankings with exact scores, intervals, exposure and IPL share.",
      },
      { property: "og:title", content: "Pressure-Ranked Bowlers | Royals War Room" },
      {
        property: "og:description",
        content:
          "Ten frozen P1 bowling ranks with score direction, uncertainty and T20I-only caveats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BowlersPage,
});
