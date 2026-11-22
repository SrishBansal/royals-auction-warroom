import { createFileRoute } from "@tanstack/react-router";
import { SourcesPage } from "@/components/sources";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "Sources & Methods | Royals War Room" },
      {
        name: "description",
        content:
          "Evidence register, model provenance and validation limits behind the Rajasthan Royals War Room.",
      },
    ],
  }),
  component: SourcesPage,
});
