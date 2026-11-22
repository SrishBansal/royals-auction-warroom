import { createFileRoute } from "@tanstack/react-router";
import { PlayoffEvidencePage } from "@/components/playoff-evidence";

export const Route = createFileRoute("/knockouts")({
  head: () => ({
    meta: [
      { title: "Playoff Evidence | Royals War Room IPL 2027" },
      {
        name: "description",
        content:
          "Rajasthan Royals 2022, 2024 and 2026 knockout case studies framed as recruitment hypotheses, not causal proof.",
      },
      { property: "og:title", content: "Playoff Evidence | Royals War Room" },
      {
        property: "og:description",
        content:
          "Seven playoff results and three phase investigations linked to Rajasthan Royals recruitment decisions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayoffEvidencePage,
});
