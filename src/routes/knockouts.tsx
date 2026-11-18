import { createFileRoute } from "@tanstack/react-router";
import { KnockoutsPage } from "@/components/pages";

export const Route = createFileRoute("/knockouts")({
  head: () => ({
    meta: [
      { title: "Knockout Case Studies | Royals War Room IPL 2027" },
      {
        name: "description",
        content:
          "Rajasthan Royals 2022, 2024 and 2026 knockout case studies framed as recruitment hypotheses, not causal proof.",
      },
      { property: "og:title", content: "Knockout Case Studies | Royals War Room" },
      {
        property: "og:description",
        content:
          "Three IPL knockout case studies and role-based squad questions for Rajasthan Royals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KnockoutsPage,
});
