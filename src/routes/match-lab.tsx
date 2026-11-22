import { createFileRoute } from "@tanstack/react-router";
import { MatchLabPage } from "@/components/match-lab";

export const Route = createFileRoute("/match-lab")({
  head: () => ({
    meta: [
      { title: "Match-state Lab | Royals War Room" },
      {
        name: "description",
        content:
          "Situation-specific Impact Player and role-based match decision analysis for Rajasthan Royals.",
      },
    ],
  }),
  component: MatchLabPage,
});
