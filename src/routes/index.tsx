import { createFileRoute } from "@tanstack/react-router";
import { WarRoomHomePage } from "@/components/war-room-home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Royals War Room — Rajasthan Royals IPL 2027" },
      {
        name: "description",
        content:
          "Five-season Rajasthan Royals results comparison, playoff evidence, 2027 recruitment gap analysis, squad construction and match-state planning.",
      },
      { property: "og:title", content: "Royals War Room — IPL 2027" },
      {
        property: "og:description",
        content:
          "Compare RR's 2022–2026 campaigns, identify evidence-backed role gaps and test the 2027 squad, auction and match-state combinations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WarRoomHomePage,
});
