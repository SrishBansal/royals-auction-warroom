import { createFileRoute } from "@tanstack/react-router";
import { SquadPage } from "@/components/pages";

export const Route = createFileRoute("/squad")({
  head: () => ({
    meta: [
      { title: "Working XI & Squad Builder | Royals War Room IPL 2027" },
      {
        name: "description",
        content:
          "Build proposed Rajasthan Royals 2027 XIs around pitch, phase, overseas limits, role balance and availability gates.",
      },
      { property: "og:title", content: "Working XI & Squad Builder | Royals War Room" },
      {
        property: "og:description",
        content:
          "Horses-for-courses proposed XIs, squad arithmetic and editable tactical scenarios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SquadPage,
});
