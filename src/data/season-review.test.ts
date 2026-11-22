import { describe, expect, it } from "vitest";
import { fiveSeasonTotals, seasonReview } from "@/data/season-review";

describe("RR five-season comparison", () => {
  it("keeps all league-stage records on a 14-match basis", () => {
    expect(seasonReview).toHaveLength(5);
    expect(seasonReview.every((row) => row.league.played === 14)).toBe(true);
    expect(fiveSeasonTotals.leaguePlayed).toBe(70);
    expect(fiveSeasonTotals.leagueWins).toBe(36);
    expect(fiveSeasonTotals.leagueLosses).toBe(33);
    expect(fiveSeasonTotals.leagueNoResults).toBe(1);
  });

  it("does not mix league place with final tournament finish", () => {
    const season2026 = seasonReview.find((row) => row.season === 2026);
    expect(season2026?.league.position).toBe(4);
    expect(season2026?.tournamentFinish).toBe("3rd");
    expect(season2026?.postseason.route).toContain("Qualifier 2 loss");
  });

  it("reconciles the seven playoff matches", () => {
    expect(fiveSeasonTotals.playoffCampaigns).toBe(3);
    expect(fiveSeasonTotals.playoffMatches).toBe(7);
    expect(fiveSeasonTotals.playoffWins).toBe(3);
    expect(fiveSeasonTotals.playoffLosses).toBe(4);
    expect(fiveSeasonTotals.playoffWins + fiveSeasonTotals.playoffLosses).toBe(
      fiveSeasonTotals.playoffMatches,
    );
  });
});
