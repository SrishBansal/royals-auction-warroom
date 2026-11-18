import { describe, expect, it } from "vitest";
import { warRoomData } from "@/data/war-room";
import {
  baseXI,
  getNormalizedScenario,
  NORMALIZED_SCENARIOS,
  SCENARIO_RECONCILIATIONS,
} from "./scenarios";
import {
  calculateBenchDisplacement,
  calculatePurse,
  classifyCandidateAcquisition,
  evaluateSquadScenario,
  INITIAL_PURSE_CRORE,
  MAX_OVERSEAS_PLAYING_XI,
  MAX_OVERSEAS_SQUAD,
  MAX_SQUAD_SIZE,
  PLAYING_XI_SIZE,
  resolvePlayerDetails,
  validatePlayingXI,
  validateSquad,
} from "./squad-rules";

describe("Task 03: Integrated Squad Builder & Scenario Planning", () => {
  it("Requirement 1 & 6: All 8 normalized scenarios exist and load with valid configurations", () => {
    expect(NORMALIZED_SCENARIOS).toHaveLength(8);

    const scenarioIds = [
      "balanced",
      "boult",
      "death",
      "mustafizur",
      "spin",
      "repair",
      "overseas",
      "highscore",
    ];

    for (const id of scenarioIds) {
      const scenario = getNormalizedScenario(id);
      expect(scenario).toBeDefined();
      expect(scenario?.id).toBe(id);
      expect(scenario?.title).toBeTruthy();
      expect(scenario?.purpose).toBeTruthy();
      expect(scenario?.startingXI).toHaveLength(PLAYING_XI_SIZE);

      // Verify no duplicate players within any starting XI
      const uniquePlayers = new Set(scenario?.startingXI);
      expect(uniquePlayers.size).toBe(PLAYING_XI_SIZE);
    }
  });

  it("Requirement 2: Retained roster is permanently locked at 19 players across all scenarios", () => {
    expect(warRoomData.team.retained_players).toHaveLength(19);

    for (const scenario of NORMALIZED_SCENARIOS) {
      const evaluation = evaluateSquadScenario({
        id: scenario.id,
        name: scenario.name,
        startingXI: scenario.startingXI,
        hypotheticalAdditions: scenario.conditionalAcquisitions.map((c) => c.playerName),
      });

      expect(evaluation.squadValidation.retainedCount).toBe(19);
      expect(evaluation.squadValidation.squadSize).toBeLessThanOrEqual(MAX_SQUAD_SIZE);
    }
  });

  it("Requirement 3: Dynamic overseas counts are enforced in XI (max 4) and squad (max 8)", () => {
    for (const scenario of NORMALIZED_SCENARIOS) {
      const xiValidation = validatePlayingXI({
        playingXI: scenario.startingXI,
      });

      expect(xiValidation.overseasCount).toBeLessThanOrEqual(MAX_OVERSEAS_PLAYING_XI);

      const squadValidation = validateSquad({
        hypotheticalAcquisitions: scenario.conditionalAcquisitions.map((c) => c.playerName),
      });

      expect(squadValidation.overseasCount).toBeLessThanOrEqual(MAX_OVERSEAS_SQUAD);
      expect(squadValidation.overseasSlotsRemaining).toBe(
        MAX_OVERSEAS_SQUAD - squadValidation.overseasCount,
      );
    }
  });

  it("Requirement 4: Bench displacement dynamically tracks starters, displaced retained, and bench reserves", () => {
    const retained = warRoomData.team.retained_players.map((p) => p.name);

    // Test with balanced scenario (all 11 starters are retained players)
    const balancedScenario = getNormalizedScenario("balanced")!;
    const balancedDisplacement = calculateBenchDisplacement(
      balancedScenario.startingXI,
      retained,
      retained,
    );
    expect(balancedDisplacement.startingRetainedPlayers).toHaveLength(11);
    expect(balancedDisplacement.displacedRetainedPlayers).toHaveLength(8);
    expect(balancedDisplacement.startingAdditions).toHaveLength(0);

    // Test with boult scenario: Shanaka IS retained; only Boult is a non-retained addition.
    // Boult XI: 10 retained starters + 1 addition (Trent Boult) = 11.
    const boultScenario = getNormalizedScenario("boult")!;
    const boultSquad = [...retained, "Trent Boult"];
    const boultDisplacement = calculateBenchDisplacement(
      boultScenario.startingXI,
      boultSquad,
      retained,
    );
    expect(boultDisplacement.startingRetainedPlayers).toHaveLength(10);
    expect(boultDisplacement.startingAdditions).toHaveLength(1);
    expect(boultDisplacement.displacedRetainedPlayers).toHaveLength(9);
    expect(boultDisplacement.benchPlayers).toHaveLength(9);
  });

  it("Requirement 7: Custom lineup isolates from predefined strategic claims and recalculates live", () => {
    // Custom user lineup modified from baseXI
    const userModifiedXI = [...baseXI];
    // Replace Nandre Burger with Sandeep Sharma
    userModifiedXI[10] = "Sandeep Sharma";

    const customEvaluation = evaluateSquadScenario({
      id: "custom",
      name: "Custom User Lineup",
      startingXI: userModifiedXI,
      isCustom: true,
    });

    // Custom lineup must NOT inherit predefined strategic explanations
    expect(customEvaluation.strategicExplanation).toBeUndefined();
    expect(customEvaluation.isCustom).toBe(true);
    expect(customEvaluation.xiValidation.isValid).toBe(true);
    expect(customEvaluation.benchDisplacement.displacedRetainedPlayers).toContain("Nandre Burger");
    expect(customEvaluation.benchDisplacement.startingRetainedPlayers).toContain("Sandeep Sharma");
  });

  it("Requirement 8: Purse calculations distinguish hypothetical spend from initial ₹27.05 Cr purse", () => {
    // Zero bids scenario
    const emptyBids = calculatePurse([]);
    expect(emptyBids.initialPurseCrore).toBe(27.05);
    expect(emptyBids.totalHypotheticalSpendCrore).toBe(0);
    expect(emptyBids.remainingPurseCrore).toBe(27.05);
    expect(emptyBids.isValid).toBe(true);

    // Valid hypothetical bids
    const validBids = calculatePurse([
      { playerName: "Trent Boult", amountCrore: 8.5, isHypothetical: true },
      { playerName: "Dasun Shanaka", amountCrore: 2.0, isHypothetical: true },
    ]);
    expect(validBids.totalHypotheticalSpendCrore).toBe(10.5);
    expect(validBids.remainingPurseCrore).toBeCloseTo(16.55, 2);
    expect(validBids.isValid).toBe(true);

    // Negative bid rejection
    const negativeBid = calculatePurse([{ playerName: "Trent Boult", amountCrore: -5.0 }]);
    expect(negativeBid.isValid).toBe(false);
    expect(negativeBid.errors[0]).toMatch(/cannot be negative/i);

    // Non-finite bid rejection
    const nanBid = calculatePurse([{ playerName: "Trent Boult", amountCrore: NaN }]);
    expect(nanBid.isValid).toBe(false);
    expect(nanBid.errors[0]).toMatch(/must be a finite number/i);

    // Exceeding purse rejection
    const excessiveBid = calculatePurse([
      { playerName: "Trent Boult", amountCrore: 30.0, isHypothetical: true },
    ]);
    expect(excessiveBid.isValid).toBe(false);
    expect(excessiveBid.remainingPurseCrore).toBeCloseTo(-2.95, 2);
    expect(excessiveBid.errors[0]).toMatch(/exceed available purse/i);
  });

  it("Requirement 4 & 5: Watchlist candidates remain conditional hypothetical additions; none are actionable targets", () => {
    for (const player of warRoomData.auction_watchlist) {
      const classification = classifyCandidateAcquisition(player.name);

      // Bethell is UNAVAILABLE -> DISALLOWED.
      // Starc has workload warning but is classified as CONDITIONAL_HYPOTHETICAL, not DISALLOWED.
      if (player.name === "Jacob Bethell") {
        expect(classification.status).toBe("DISALLOWED");
      } else {
        expect(classification.status).toBe("CONDITIONAL_HYPOTHETICAL");
      }

      // No watchlist player in current snapshot is an actionable verified target
      expect(classification.status).not.toBe("ACTIONABLE_TARGET");
    }
  });

  it("Requirement 5: Analyst medical and workload toggles do not assert actual clearance", () => {
    // Without analyst toggle, gated players require review
    const pathiranaUngated = classifyCandidateAcquisition("Matheesha Pathirana", {
      analystClearedMedical: false,
    });
    expect(pathiranaUngated.assessment.medicalRestriction).toBe("MEDICAL_REVIEW");
    expect(pathiranaUngated.assessment.registrationVerified).toBe(false);

    // With analyst toggle, it remains conditional with explicit disclosure notice
    const pathiranaGated = classifyCandidateAcquisition("Matheesha Pathirana", {
      analystClearedMedical: true,
    });
    expect(pathiranaGated.assessment.registrationVerified).toBe(false);
    expect(pathiranaGated.assessment.actionableTarget).toBe(false);
    expect(pathiranaGated.assessment.reason).toContain(
      "Analyst scenario checkbox does not constitute official medical clearance",
    );

    // Hasaranga workload toggle
    const hasarangaGated = classifyCandidateAcquisition("Wanindu Hasaranga", {
      analystWorkloadAssumed: true,
    });
    expect(hasarangaGated.assessment.registrationVerified).toBe(false);
    expect(hasarangaGated.assessment.actionableTarget).toBe(false);
  });

  it("Requirement 6: Scenario reconciliation registry explicitly documents JSON vs UI alignments", () => {
    expect(SCENARIO_RECONCILIATIONS.length).toBeGreaterThanOrEqual(3);

    const boultReconciliation = SCENARIO_RECONCILIATIONS.find((r) =>
      r.scenarioId.includes("boult"),
    );
    expect(boultReconciliation).toBeDefined();
    expect(boultReconciliation?.issue).toContain("Dasun Shanaka");

    const balancedReconciliation = SCENARIO_RECONCILIATIONS.find(
      (r) => r.scenarioId === "balanced",
    );
    expect(balancedReconciliation).toBeDefined();
    expect(balancedReconciliation?.resolution).toContain("3 overseas starters");

    const alternativesReconciliation = SCENARIO_RECONCILIATIONS.find((r) =>
      r.scenarioId.includes("alternatives"),
    );
    expect(alternativesReconciliation).toBeDefined();
    expect(alternativesReconciliation?.resolution).toContain("PlayerAlternative");
  });

  it("Requirement 9: Playing XI role coverage accurately derives wicketkeepers, bowlers, and role breakdown", () => {
    const balancedScenario = getNormalizedScenario("balanced")!;
    const xiValidation = validatePlayingXI({
      playingXI: balancedScenario.startingXI,
    });

    expect(xiValidation.roleCoverage.wicketkeeperCount).toBeGreaterThanOrEqual(1);
    expect(xiValidation.roleCoverage.bowlingOptionsCount).toBeGreaterThanOrEqual(5);
    expect(xiValidation.roleCoverage.overseasPlayers).toEqual([
      "Donovan Ferreira",
      "Jofra Archer",
      "Nandre Burger",
    ]);
    expect(xiValidation.roleCoverage.indianPlayers).toHaveLength(8);
  });
});
