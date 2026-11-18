import { createFileRoute } from "@tanstack/react-router";
import { TargetsPage } from "@/components/pages";

export const Route = createFileRoute("/targets")({
  head: () => ({
    meta: [
      { title: "Auction Targets & 89-Player Register | Royals War Room" },
      {
        name: "description",
        content:
          "Research the 2027 Rajasthan Royals target shortlist, compare role fit and browse all 89 released reference names.",
      },
      { property: "og:title", content: "Auction Targets | Royals War Room IPL 2027" },
      {
        property: "og:description",
        content:
          "An evidence-led watchlist and searchable released-player reference, with registration caveats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TargetsPage,
});
