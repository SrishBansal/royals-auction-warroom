import { createFileRoute } from "@tanstack/react-router";
import { SpatialIntelligencePage } from "@/components/spatial-intelligence";

export const Route = createFileRoute("/spatial-lab")({
  head: () => ({
    meta: [
      { title: "Spatial Intelligence | Royals War Room" },
      {
        name: "description",
        content:
          "An experimental IPL pitch-location model using third-party redistributed Hawk-Eye-derived delivery coordinates, with transparent validation and limitations.",
      },
      { property: "og:title", content: "Spatial Intelligence | Royals War Room" },
      {
        property: "og:description",
        content:
          "Explore the 5×5 pitch-location pilot, expected batter runs and bowler wicket probability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpatialIntelligencePage,
});
