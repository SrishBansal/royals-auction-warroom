import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";

// Route resolution only: these checks do not claim that the page components render.
describe("App routing", () => {
  it.each([
    ["War Room", "/"],
    ["Squad & XI Lab", "/squad"],
    ["Recruitment", "/targets"],
    ["Match-State Lab", "/match-lab"],
    ["Playoff Evidence", "/knockouts"],
    ["Kadamba Spatial Lab", "/spatial-lab"],
    ["Sources & Methods", "/sources"],
    ["IPL Pressure Rankings", "/pressure-rankings"],
  ])("matches the %s route", (_label, path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes(path);
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
