import { createFileRoute } from "@tanstack/react-router";
import { RecruitmentWorkbenchPage } from "@/components/recruitment-workbench";

export const Route = createFileRoute("/targets")({
  head: () => ({
    meta: [
      { title: "RR Recruitment Priorities | Royals War Room" },
      {
        name: "description",
        content:
          "Research the 20-player Rajasthan Royals target shortlist and browse a separate 89-name supplied release-list reference register.",
      },
      { property: "og:title", content: "Auction Targets | Royals War Room IPL 2027" },
      {
        property: "og:description",
        content:
          "A focused shortlist of role-specific recruitment options for Rajasthan Royals, with evidence and selection risks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecruitmentWorkbenchPage,
});
