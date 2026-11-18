import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Royals War Room — Rajasthan Royals IPL 2027" },
      {
        name: "description",
        content:
          "A Rajasthan Royals squad and auction decision-support war room. 19 retained, six roster decisions, a 18 November 2026 snapshot.",
      },
      { property: "og:title", content: "Royals War Room — IPL 2027" },
      {
        property: "og:description",
        content:
          "Build a side that wins the moments that matter. Explore RR's working squad, role gaps and tactical XI scenarios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
