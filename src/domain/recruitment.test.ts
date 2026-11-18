import { describe, expect, it } from "vitest";
import { warRoomData } from "@/data/war-room";
import {
  AUCTION_SLOT_STRATEGY,
  BENCHMARK_EXCLUSIONS,
  IMPACT_PLAYER_SCENARIOS,
  MIDDLE_ORDER_VARIATIONS,
  PROPOSED_STARTING_XI_SCENARIOS,
  RR_BATTER_RECOMMENDATIONS,
  RR_BOWLER_RECOMMENDATIONS,
} from "./recruitment";

describe("RR-Specific Recruitment Strategy & Pressure Evaluation", () => {
  it("Requirement 1: Exactly 10 RR-specific batter recruitment recommendations", () => {
    expect(RR_BATTER_RECOMMENDATIONS).toHaveLength(10);
    const ranks = RR_BATTER_RECOMMENDATIONS.map((b) => b.rank);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    // Ensure all are batters
    for (const batter of RR_BATTER_RECOMMENDATIONS) {
      expect(batter.discipline).toBe("BATTER");
      expect(batter.whyRR).toBeTruthy();
      expect(batter.watchOut).toBeTruthy();
      expect(batter.roleFit).toBeTruthy();
      expect(batter.upgradeOverSquad).toBeTruthy();
    }
  });

  it("Requirement 2: Exactly 10 RR-specific bowler recruitment recommendations", () => {
    expect(RR_BOWLER_RECOMMENDATIONS).toHaveLength(10);
    const ranks = RR_BOWLER_RECOMMENDATIONS.map((b) => b.rank);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    // Ensure all are bowlers
    for (const bowler of RR_BOWLER_RECOMMENDATIONS) {
      expect(bowler.discipline).toBe("BOWLER");
      expect(bowler.whyRR).toBeTruthy();
      expect(bowler.watchOut).toBeTruthy();
      expect(bowler.roleFit).toBeTruthy();
      expect(bowler.upgradeOverSquad).toBeTruthy();
    }
  });

  it("Requirement 3 & 4: No retained or confirmed ineligible players occupy recommendation slots", () => {
    const allRecNames = new Set([
      ...RR_BATTER_RECOMMENDATIONS.map((p) => p.name),
      ...RR_BOWLER_RECOMMENDATIONS.map((p) => p.name),
    ]);

    // Ineligible players from historical P1 / other franchises
    const forbiddenPlayers = [
      "Jasprit Bumrah",
      "Yashasvi Jaiswal",
      "Tim David",
      "Suryakumar Yadav",
      "Nicholas Pooran",
      "Phil Salt",
      "Abhishek Sharma",
      "Sunil Narine",
      "Lungi Ngidi",
      "Bhuvneshwar Kumar",
      "Rohit Sharma",
      "Shaheen Afridi",
      "Haris Rauf",
      "Jacob Bethell",
      "Mitchell Starc",
      "MS Dhoni",
      "Andre Russell",
      "Tushar Deshpande",
      "Shahrukh Khan",
      "M Shahrukh Khan",
    ];

    for (const forbidden of forbiddenPlayers) {
      expect(allRecNames.has(forbidden)).toBe(false);
    }

    // Benchmark exclusions must document why they are excluded
    expect(BENCHMARK_EXCLUSIONS.length).toBeGreaterThanOrEqual(15);
    const bumrahExclusion = BENCHMARK_EXCLUSIONS.find((b) => b.name === "Jasprit Bumrah");
    expect(bumrahExclusion?.currentFranchiseOrStatus).toContain("Retained");
  });

  it("Requirement 4: Historical global P1 rankings remain untouched as benchmarks", () => {
    expect(warRoomData.pressure_ranked_batters_top10).toHaveLength(10);
    expect(warRoomData.pressure_ranked_bowlers_top10).toHaveLength(10);
    expect(warRoomData.pressure_ranked_batters_top10[0]?.player_name).toBe("Tim David");
    expect(warRoomData.pressure_ranked_bowlers_top10[0]?.player_name).toBe("Jasprit Bumrah");
  });

  it("Requirement 5: Trent Boult is explicitly evaluated for powerplay value, not death overs", () => {
    const boult = RR_BOWLER_RECOMMENDATIONS.find((b) => b.name === "Trent Boult");
    expect(boult).toBeDefined();
    expect(boult?.primaryRole).toBe("POWERPLAY_SPECIALIST");
    expect(boult?.roleFit).toContain("61.2%");
    expect(boult?.watchOut).toContain("NOT A DEATH BOWLER");
    expect(boult?.pressureEvidence.p1Rank).toBe(8);
  });

  it("Requirement 6: Matt Henry's ODI performance is strictly separate from T20 pressure evidence", () => {
    const henry = RR_BOWLER_RECOMMENDATIONS.find((b) => b.name === "Matt Henry");
    expect(henry).toBeDefined();
    expect(henry?.pressureEvidence.status).toBe("P1_NOT_AVAILABLE_IN_ARCHIVE");
    expect(henry?.pressureEvidence.exposureNote).toContain("NOT T20 pressure evidence");
    expect(henry?.pressureEvidence.exposureNote).toContain("NOT enter P1");
  });

  it("Requirement 7: Abishek Porel is evaluated as a wicketkeeper / floating batting cover", () => {
    const porel = RR_BATTER_RECOMMENDATIONS.find((b) => b.name === "Abishek Porel");
    expect(porel).toBeDefined();
    expect(porel?.primaryRole).toBe("WICKETKEEPER_BATTER");
    expect(porel?.whyRR).toContain("wicketkeeping cover behind Dhruv Jurel");
    expect(porel?.watchOut).toContain("concentrated in the top order");
  });

  it("Requirement 8: Matthew Breetzke is evaluated with top-order clash explained, not a No.5-8 finisher", () => {
    const breetzke = RR_BATTER_RECOMMENDATIONS.find((b) => b.name === "Matthew Breetzke");
    expect(breetzke).toBeDefined();
    expect(breetzke?.primaryRole).toBe("OVERSEAS_POWER_HITTER");
    expect(breetzke?.watchOut).toContain("NOT a natural No.5–8 finisher");
    expect(breetzke?.watchOut).toContain("Positional clash with Vaibhav, Jaiswal");
  });

  it("Requirement 9: Kamindu Mendis has middle-order and ambidextrous spin-utility evaluation", () => {
    const kamindu = RR_BATTER_RECOMMENDATIONS.find((b) => b.name === "Kamindu Mendis");
    expect(kamindu).toBeDefined();
    expect(kamindu?.primaryRole).toBe("BATTING_ALL_ROUNDER");
    expect(kamindu?.whyRR).toContain("ambidextrous");
    expect(kamindu?.watchOut).toContain("consumes 1 of only 4 available overseas XI slots");
  });

  it("Requirement 10: Avesh Khan and Akash Madhwal have accurate RR historical context and red flags", () => {
    const avesh = RR_BOWLER_RECOMMENDATIONS.find((b) => b.name === "Avesh Khan");
    expect(avesh).toBeDefined();
    expect(avesh?.whyRR).toContain("19 wickets in RR's 2024 campaign");
    expect(avesh?.watchOut).toContain("oscillated above 9.2 rpo");

    const madhwal = RR_BOWLER_RECOMMENDATIONS.find((b) => b.name === "Akash Madhwal");
    expect(madhwal).toBeDefined();
    expect(madhwal?.whyRR).toContain("IPL 2025");
    expect(madhwal?.roleFit).toContain("106 legal death deliveries");
    expect(madhwal?.watchOut).toContain("10.30");
  });

  it("Requirement 11: Tushar Deshpande and M Shahrukh Khan are completely excluded from recommendations", () => {
    const allRecNames = [
      ...RR_BATTER_RECOMMENDATIONS.map((b) => b.name),
      ...RR_BOWLER_RECOMMENDATIONS.map((b) => b.name),
    ];
    expect(allRecNames).not.toContain("Tushar Deshpande");
    expect(allRecNames).not.toContain("M Shahrukh Khan");
    expect(allRecNames).not.toContain("Shahrukh Khan");
  });

  it("Requirement 12: Matheesha Pathirana remains medically gated with P1 rank 2 evidence", () => {
    const pathirana = RR_BOWLER_RECOMMENDATIONS.find((b) => b.name === "Matheesha Pathirana");
    expect(pathirana).toBeDefined();
    expect(pathirana?.medicalRestriction).toBe("MEDICAL_REVIEW");
    expect(pathirana?.pressureEvidence.p1Rank).toBe(2);
    expect(pathirana?.pressureEvidence.postMeanPer100).toBeCloseTo(-12.38, 1);
    expect(pathirana?.watchOut).toContain("HARD MEDICAL RESTRICTION");
    expect(pathirana?.watchOut).toContain("hamstring surgery in 2026");
  });

  it("Requirement 13: Tactical middle-order variations A, B, and C provide structured situational orders", () => {
    expect(MIDDLE_ORDER_VARIATIONS).toHaveLength(3);
    const varA = MIDDLE_ORDER_VARIATIONS.find((v) => v.id === "mod-var-a");
    const varB = MIDDLE_ORDER_VARIATIONS.find((v) => v.id === "mod-var-b");
    const varC = MIDDLE_ORDER_VARIATIONS.find((v) => v.id === "mod-var-c");

    expect(varA?.title).toContain("Early Wickets Lost");
    expect(varB?.title).toContain("Spin-Heavy Middle Overs");
    expect(varC?.title).toContain("Death Overs / High Required Run Rate");

    expect(varA?.battingOrderSlots4to8).toHaveLength(5);
    expect(varB?.battingOrderSlots4to8).toHaveLength(5);
    expect(varC?.battingOrderSlots4to8).toHaveLength(5);
  });

  it("Requirement 14: At least six Impact Player scenarios are provided with detailed tradeoffs", () => {
    expect(IMPACT_PLAYER_SCENARIOS).toHaveLength(6);
    const scenarioIds = ["impact-a", "impact-b", "impact-c", "impact-d", "impact-e", "impact-f"];

    for (const id of scenarioIds) {
      const scenario = IMPACT_PLAYER_SCENARIOS.find((s) => s.id === id);
      expect(scenario).toBeDefined();
      expect(scenario?.recommendedPlayer).toBeTruthy();
      expect(scenario?.substitutedStartingPlayer).toBeTruthy();
      expect(scenario?.whyThisSubstitution).toBeTruthy();
      expect(scenario?.mainDownside).toBeTruthy();
      expect(scenario?.overseasCountInXI).toBeLessThanOrEqual(4);
    }
  });

  it("Requirement 15: All 5 proposed starting XI scenarios enforce 11 distinct players and <= 4 overseas", () => {
    expect(PROPOSED_STARTING_XI_SCENARIOS).toHaveLength(5);

    for (const scen of PROPOSED_STARTING_XI_SCENARIOS) {
      expect(scen.startingXI).toHaveLength(11);
      const uniquePlayers = new Set(scen.startingXI);
      expect(uniquePlayers.size).toBe(11);
      expect(scen.overseasCount).toBeLessThanOrEqual(4);
      expect(scen.deathOversSpecialists.length).toBeGreaterThanOrEqual(1);
      expect(scen.actualVsHypothetical.retainedCount).toBeGreaterThanOrEqual(9);
    }
  });

  it("Requirement 16: Every recommendation card has prominent WHY RR and WATCH-OUT", () => {
    for (const candidate of [...RR_BATTER_RECOMMENDATIONS, ...RR_BOWLER_RECOMMENDATIONS]) {
      expect(candidate.whyRR.trim().length).toBeGreaterThan(20);
      expect(candidate.watchOut.trim().length).toBeGreaterThan(20);
      expect(candidate.roleFit.trim().length).toBeGreaterThan(20);
      expect(candidate.upgradeOverSquad.trim().length).toBeGreaterThan(20);
    }
  });

  it("Requirement 9 (Slot Strategy): Capacity ladder priorities 1 through 6 are established", () => {
    expect(AUCTION_SLOT_STRATEGY).toHaveLength(6);
    const priorities = AUCTION_SLOT_STRATEGY.map((s) => s.priority);
    expect(priorities).toEqual([1, 2, 3, 4, 5, 6]);
    expect(AUCTION_SLOT_STRATEGY[0]?.idealCandidate).toContain("Nehal Wadhera");
    expect(AUCTION_SLOT_STRATEGY[1]?.idealCandidate).toContain("Abishek Porel");
    expect(AUCTION_SLOT_STRATEGY[2]?.idealCandidate).toContain("Avesh Khan");
    expect(AUCTION_SLOT_STRATEGY[3]?.idealCandidate).toContain("Matheesha Pathirana");
    expect(AUCTION_SLOT_STRATEGY[4]?.idealCandidate).toContain("Trent Boult");
  });
});
