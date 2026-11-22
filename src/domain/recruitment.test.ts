import { describe, expect, it } from "vitest";
import { RR_BATTER_RECOMMENDATIONS, RR_BOWLER_RECOMMENDATIONS } from "./recruitment";
import { RR_FOCUSED_TARGETS, RR_RETAINED_DECISION_PLAYERS } from "./decision-data";

describe("RR-specific recruitment evidence", () => {
  it("keeps the submitted RR batter priority order as an internal shortlist, not a global leaderboard", () => {
    expect(RR_BATTER_RECOMMENDATIONS.map((candidate) => candidate.name)).toEqual([
      "Nehal Wadhera",
      "Mitch Owen",
      "Shimron Hetmyer",
      "Matthew Breetzke",
      "Nitish Rana",
      "Mahipal Lomror",
      "Kamindu Mendis",
      "Abishek Porel",
      "Robin Minz",
      "Daryl Mitchell",
    ]);
    expect(RR_BATTER_RECOMMENDATIONS.every((candidate) => candidate.discipline === "BATTER")).toBe(
      true,
    );
  });

  it("keeps the submitted RR bowler priority order as an internal shortlist, not a global leaderboard", () => {
    expect(RR_BOWLER_RECOMMENDATIONS.map((candidate) => candidate.name)).toEqual([
      "Matheesha Pathirana",
      "Avesh Khan",
      "Trent Boult",
      "Matt Henry",
      "Mustafizur Rahman",
      "Akash Madhwal",
      "Mangesh Yadav",
      "Deepak Chahar",
      "Gerald Coetzee",
      "Onkar Tarmale",
    ]);
    expect(RR_BOWLER_RECOMMENDATIONS.every((candidate) => candidate.discipline === "BOWLER")).toBe(
      true,
    );
  });

  it("requires every candidate to carry a role argument, incremental value and a counterargument", () => {
    for (const candidate of [...RR_BATTER_RECOMMENDATIONS, ...RR_BOWLER_RECOMMENDATIONS]) {
      expect(candidate.whyRR.trim().length).toBeGreaterThan(20);
      expect(candidate.roleFit.trim().length).toBeGreaterThan(20);
      expect(candidate.upgradeOverSquad.trim().length).toBeGreaterThan(20);
      expect(candidate.watchOut.trim().length).toBeGreaterThan(20);
    }
  });

  it("treats Avesh as Indian pace depth, not a proven first-choice death upgrade", () => {
    const avesh = RR_BOWLER_RECOMMENDATIONS.find((candidate) => candidate.name === "Avesh Khan");
    expect(avesh?.nationality).toBe("Indian");
    expect(avesh?.whyRR).toContain("19 wickets in 15 matches");
    expect(avesh?.watchOut).toContain("below the retained-core median of 8.12");
    expect(avesh?.pressureEvidence.postMeanPer100).toBeCloseTo(0.19, 2);
  });

  it("keeps Akash as conditional Indian pace depth with the supplied limitations", () => {
    const akash = RR_BOWLER_RECOMMENDATIONS.find((candidate) => candidate.name === "Akash Madhwal");
    expect(akash?.nationality).toBe("Indian");
    expect(akash?.roleFit).toContain("phase exports conflict");
    expect(akash?.watchOut).toContain("11.07 economy");
    expect(akash?.pressureEvidence.gatedBalls).toBe(128);
  });

  it("keeps Pathirana behind independent medical and market checks", () => {
    const pathirana = RR_BOWLER_RECOMMENDATIONS.find(
      (candidate) => candidate.name === "Matheesha Pathirana",
    );
    expect(pathirana?.medicalRestriction).toBe("MEDICAL_REVIEW");
    expect(pathirana?.marketStatus).toBe("RELEASED_REGISTRATION_UNVERIFIED");
    expect(pathirana?.watchOut).toContain("Injury-prone");
    expect(pathirana?.watchOut).toContain("surgically treated left hamstring");
    expect(pathirana?.medicalNote).toContain("left hamstring injury");
    expect(pathirana?.pressureEvidence.postMeanPer100).toBeCloseTo(-12.38, 2);
  });

  it("keeps the batter sign convention distinct from the bowler sign convention", () => {
    const hetmyer = RR_BATTER_RECOMMENDATIONS.find(
      (candidate) => candidate.name === "Shimron Hetmyer",
    );
    const boult = RR_BOWLER_RECOMMENDATIONS.find((candidate) => candidate.name === "Trent Boult");
    expect(hetmyer?.pressureEvidence.postMeanPer100).toBeGreaterThan(0);
    expect(boult?.pressureEvidence.postMeanPer100).toBeLessThan(0);
    expect(boult?.roleFit).toContain("61.2%");
    expect(boult?.watchOut.toLowerCase()).toContain("not a death");
  });

  it("keeps the selectable short list focused on RR's material role gaps", () => {
    const selectable = new Set(RR_FOCUSED_TARGETS.map((player) => player.name));
    for (const name of [
      "Avesh Khan",
      "Akash Madhwal",
      "Matheesha Pathirana",
      "Nehal Wadhera",
      "Nitish Rana",
      "Mitch Owen",
    ]) {
      expect(selectable.has(name)).toBe(true);
    }
    expect(selectable.has("Jasprit Bumrah")).toBe(false);
    expect(selectable.has("Yashasvi Jaiswal")).toBe(false);
    expect(RR_RETAINED_DECISION_PLAYERS.some((player) => selectable.has(player.name))).toBe(false);
  });
});
