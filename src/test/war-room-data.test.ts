import { describe, expect, it } from "vitest";
import { navigation, warRoomData } from "@/data/war-room";
import { RR_RETAINED_DECISION_PLAYERS } from "@/domain/decision-data";

describe("RR 2027 squad snapshot", () => {
  it("exposes the Kadamba Spatial Lab in the main navigation", () => {
    expect(navigation.some((item) => item.to === "/spatial-lab")).toBe(true);
  });

  it("uses the supplied 19-player retained roster", () => {
    expect(warRoomData.team.retained_players).toHaveLength(19);
    expect(RR_RETAINED_DECISION_PLAYERS).toHaveLength(19);
    expect(warRoomData.team.slots_remaining).toBe(6);
  });

  it("keeps the 2027 Hetmyer release separate from retained-role coverage", () => {
    const retainedNames = warRoomData.team.retained_players.map((player) => player.name);
    expect(warRoomData.team.released_by_rr).toContain("Shimron Hetmyer");
    expect(retainedNames).not.toContain("Shimron Hetmyer");
    expect(retainedNames).toEqual(
      expect.arrayContaining([
        "Jofra Archer",
        "Nandre Burger",
        "Mohammed Shami",
        "Sandeep Sharma",
        "Brijesh Sharma",
        "Sushant Mishra",
        "Shubham Dubey",
      ]),
    );
    expect(
      RR_RETAINED_DECISION_PLAYERS.some((player) => player.roleTags?.includes("death-specialist")),
    ).toBe(false);
  });

  it("preserves overseas squad and playing-XI constraints", () => {
    expect(warRoomData.team.retained_overseas_count).toBe(5);
    expect(RR_RETAINED_DECISION_PLAYERS.filter((player) => player.overseas)).toHaveLength(5);
    expect(warRoomData.team.overseas_squad_cap).toBe(8);
    expect(warRoomData.team.additional_overseas_squad_slots_up_to).toBe(3);
    expect(warRoomData.team.max_overseas_in_playing_xi).toBe(4);
  });

  it("does not expose global leaderboards or an unsupported purse/price feature", () => {
    expect("purse_remaining_crore" in warRoomData.team).toBe(false);
    expect("pressure_ranked_batters_top10" in warRoomData).toBe(false);
    expect("pressure_ranked_bowlers_top10" in warRoomData).toBe(false);
  });

  it("has enough source metadata to show provenance for the squad and match evidence", () => {
    expect(warRoomData.sources.length).toBeGreaterThan(0);
    expect(
      warRoomData.sources.every((source) =>
        Boolean(source.name && (source.url || source.local_file)),
      ),
    ).toBe(true);
  });
});
