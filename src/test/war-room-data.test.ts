import { describe, expect, it } from "vitest";
import { warRoomData } from "@/data/war-room";

describe("RR 2027 snapshot invariants", () => {
  it("keeps the supplied 19 retained players and six open squad spaces", () => {
    expect(warRoomData.team.retained_players).toHaveLength(19);
    expect(warRoomData.team.slots_remaining).toBe(6);
    expect(warRoomData.team.purse_remaining_crore).toBe(27.05);
  });

  it("preserves the separate overseas squad and playing XI limits", () => {
    expect(warRoomData.team.retained_overseas_count).toBe(5);
    expect(warRoomData.team.overseas_squad_cap).toBe(8);
    expect(warRoomData.team.additional_overseas_squad_slots_up_to).toBe(3);
    expect(warRoomData.team.max_overseas_in_playing_xi).toBe(4);
  });

  it("keeps both pressure ranking lists in their supplied top-ten order", () => {
    expect(warRoomData.pressure_ranked_batters_top10.map((player) => player.rank)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(warRoomData.pressure_ranked_bowlers_top10.map((player) => player.rank)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it("keeps the full 89-entry released reference pool", () => {
    expect(warRoomData.released_player_reference.players).toHaveLength(89);
    expect(warRoomData.released_player_reference.count).toBe(89);
  });

  it("marks Bethell unavailable and preserves the manual-only auction valuation boundary", () => {
    const bethell = warRoomData.auction_watchlist.find((player) => player.name === "Jacob Bethell");
    expect(bethell?.availability_class).toBe("Unavailable for IPL 2027");
    expect(warRoomData.rr_analytical_notes.pricing_logic).toContain("manual editable scenario");
  });
});
