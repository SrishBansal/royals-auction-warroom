import { createFileRoute } from "@tanstack/react-router";
import { MethodologyPage } from "@/components/pages";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology & Sources | Royals War Room IPL 2027" },
      {
        name: "description",
        content:
          "Audit the P1 ranking methodology, source scope, auction status, medical caveats and evidence register.",
      },
      { property: "og:title", content: "Methodology & Sources | Royals War Room" },
      {
        property: "og:description",
        content:
          "Source register, model direction, uncertainty and decision-support limitations for the 2027 snapshot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MethodologyPage,
});
