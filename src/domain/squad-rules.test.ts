import { describe, expect, it } from "vitest";
import { warRoomData } from "@/data/war-room";
import {
  calculateBenchDisplacement,
  calculatePurse,
  classifyCandidateAcquisition,
  cleanPlayerName,
  evaluateSquadScenario,
  getScenarioInconsistencies,
  INITIAL_OVERSEAS_COUNT,
  INITIAL_PURSE_CRORE,
  INITIAL_SQUAD_SIZE,
  INITIAL_VACANCIES,
  MAX_OVERSEAS_PLAYING_XI,
  MAX_OVERSEAS_SQUAD,
  MAX_SQUAD_SIZE,
  resolvePlayerDetails,
  validatePlayingXI,
  validateSquad,
} from "./squad-rules";

describe("Squad Rules & Scenario Engine", () => {
  it("Test 1: initial roster contains exactly 19 retained players", () => {
    expect(INITIAL_SQUAD_SIZE).toBe(19);
    expect(warRoomData.team.retained_players).toHaveLength(19);

    const validation = validateSquad({});
    expect(validation.retainedCount).toBe(19);
    expect(validation.squadSize).toBe(19);
    expect(validation.isValid).toBe(true);
  });

  it("Test 2: initial overseas count is five", () => {
    expect(INITIAL_OVERSEAS_COUNT).toBe(5);
    expect(warRoomData.team.retained_overseas_count).toBe(5);

    const validation = validateSquad({});
    expect(validation.overseasCount).toBe(5);
    expect(validation.overseasSlotsRemaining).toBe(3);
  });

  it("Test 3: six squad vacancies remain initially", () => {
    expect(INITIAL_VACANCIES).toBe(6);
    expect(warRoomData.team.slots_remaining).toBe(6);

    const validation = validateSquad({});
    expect(validation.vacanciesRemaining).toBe(6);
  });

  it("Test 4: initial remaining purse is ₹27.05 crore", () => {
    expect(INITIAL_PURSE_CRORE).toBe(27.05);
    expect(warRoomData.team.purse_remaining_crore).toBe(27.05);

    const purse = calculatePurse([]);
    expect(purse.initialPurseCrore).toBe(27.05);
    expect(purse.remainingPurseCrore).toBe(27.05);
    expect(purse.totalSpendCrore).toBe(0);
    expect(purse.isValid).toBe(true);
  });

  it("Test 5: a full squad of 25 players is accepted", () => {
    // 19 retained + 6 valid hypothetical additions = 25
    // 3 overseas additions (Boult, Pathirana, Hasaranga) + 3 Indian additions (Wadhera, Yadav, Tarmale)
    // Total overseas = 5 + 3 = 8 (within limit of 8)
    const additions = [
      "Trent Boult",
      "Matheesha Pathirana",
      "Wanindu Hasaranga",
      "Nehal Wadhera",
      "Mangesh Yadav",
      "Onkar Tarmale",
    ];

    const validation = validateSquad({
      hypotheticalAcquisitions: additions,
    });

    expect(validation.squadSize).toBe(25);
    expect(validation.vacanciesRemaining).toBe(0);
    expect(validation.overseasCount).toBe(8);
    expect(validation.overseasSlotsRemaining).toBe(0);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("Test 6: squad above 25 players is rejected", () => {
    // 19 retained + 7 additions = 26 players (exceeds cap of 25)
    const additions = [
      "Trent Boult",
      "Matheesha Pathirana",
      "Wanindu Hasaranga",
      "Nehal Wadhera",
      "Mangesh Yadav",
      "Onkar Tarmale",
      "Vihaan Malhotra",
    ];

    const validation = validateSquad({
      hypotheticalAcquisitions: additions,
    });

    expect(validation.squadSize).toBe(26);
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Squad size (26) exceeds maximum allowable limit of 25"),
      ]),
    );
  });

  it("Test 7: eight overseas squad members are accepted", () => {
    // 5 retained overseas + 3 additional overseas = 8 (max squad cap)
    const overseasAdditions = ["Trent Boult", "Matheesha Pathirana", "Mustafizur Rahman"];

    const validation = validateSquad({
      hypotheticalAcquisitions: overseasAdditions,
    });

    expect(validation.overseasCount).toBe(8);
    expect(validation.overseasSlotsRemaining).toBe(0);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("Test 8: nine overseas squad members are rejected", () => {
    // 5 retained overseas + 4 overseas additions = 9 (exceeds limit of 8)
    const overseasAdditions = [
      "Trent Boult",
      "Matheesha Pathirana",
      "Mustafizur Rahman",
      "Wanindu Hasaranga",
    ];

    const validation = validateSquad({
      hypotheticalAcquisitions: overseasAdditions,
    });

    expect(validation.overseasCount).toBe(9);
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Overseas squad count (9) exceeds maximum allowable limit of 8"),
      ]),
    );
  });

  it("Test 9: four overseas players in playing XI are accepted", () => {
    // 4 overseas: Archer, Ferreira, Burger, Shanaka + 7 Indian retained players = 11 players
    const playingXI = [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Donovan Ferreira", // Overseas 1
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer", // Overseas 2
      "Nandre Burger", // Overseas 3
      "Dasun Shanaka", // Overseas 4
      "Mohammed Shami",
    ];

    const validation = validatePlayingXI({ playingXI });

    expect(validation.playerCount).toBe(11);
    expect(validation.overseasCount).toBe(4);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("Test 10: five overseas players in playing XI are rejected", () => {
    // 5 overseas starters in XI (exceeds maximum limit of 4)
    const playingXIWith5Overseas = [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Donovan Ferreira", // Overseas 1
      "Dasun Shanaka", // Overseas 2
      "Lhuan-dre Pretorius", // Overseas 3
      "Jofra Archer", // Overseas 4
      "Nandre Burger", // Overseas 5
      "Ravi Bishnoi",
      "Ravindra Jadeja",
    ];

    const validation = validatePlayingXI({ playingXI: playingXIWith5Overseas });

    expect(validation.overseasCount).toBe(5);
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Playing XI contains 5 overseas players, exceeding the maximum limit of 4",
        ),
      ]),
    );
  });

  it("Test 11: duplicate players are rejected in both squad and playing XI", () => {
    // Duplicate in squad
    const duplicateSquad = validateSquad({
      hypotheticalAcquisitions: ["Nehal Wadhera", "Nehal Wadhera"],
    });
    expect(duplicateSquad.isValid).toBe(false);
    expect(duplicateSquad.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("Duplicate player detected in squad")]),
    );

    // Duplicate in playing XI
    const duplicateXI = [
      "Yashasvi Jaiswal",
      "Yashasvi Jaiswal", // Duplicate
      "Riyan Parag",
      "Dhruv Jurel",
      "Shubham Dubey",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Mohammed Shami",
      "Sandeep Sharma",
    ];

    const xiValidation = validatePlayingXI({ playingXI: duplicateXI });
    expect(xiValidation.isValid).toBe(false);
    expect(xiValidation.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("Duplicate player detected in playing XI")]),
    );
  });

  it("Test 12: an incomplete playing XI is not marked valid", () => {
    // Only 10 players
    const incompleteXI = [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Mohammed Shami",
      "Sandeep Sharma",
    ];

    const validation = validatePlayingXI({ playingXI: incompleteXI });
    expect(validation.distinctPlayerCount).toBe(10);
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Playing XI must contain exactly 11 distinct players (found 10)"),
      ]),
    );
  });

  it("Test 13: unverified watchlist candidate produces a conditional scenario, not an actual acquisition", () => {
    const classification = classifyCandidateAcquisition("Nehal Wadhera");

    expect(classification.status).toBe("CONDITIONAL_HYPOTHETICAL");
    expect(classification.status).not.toBe("CONFIRMED_ACQUISITION");
    expect(classification.status).not.toBe("ACTIONABLE_TARGET");
    expect(classification.assessment.registrationVerified).toBe(false);

    const squad = validateSquad({
      hypotheticalAcquisitions: ["Nehal Wadhera"],
    });

    expect(squad.hypotheticalAcquisitions).toEqual(["Nehal Wadhera"]);
    expect(squad.confirmedAcquisitions).toHaveLength(0);
    // Preserves unverified status with explicit warning
    expect(squad.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining("unverified conditional candidate")]),
    );
  });

  it("Test 14: historical ranking players cannot be acquired", () => {
    // Abhishek Sharma & Haris Rauf from P1 ranking data
    const abhishekClass = classifyCandidateAcquisition("Abhishek Sharma");
    expect(abhishekClass.status).toBe("DISALLOWED");
    expect(abhishekClass.disallowedReason).toContain("cannot enter the acquisition pool");

    const raufClass = classifyCandidateAcquisition("Haris Rauf");
    expect(raufClass.status).toBe("DISALLOWED");
    expect(raufClass.disallowedReason).toContain("cannot enter the acquisition pool");

    // Attempting to include an unresolved player in squad acquisitions is rejected
    const squadWithRankedPlayer = validateSquad({
      hypotheticalAcquisitions: ["Abhishek Sharma"],
    });
    expect(squadWithRankedPlayer.isValid).toBe(false);
    expect(squadWithRankedPlayer.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("cannot enter the acquisition pool")]),
    );

    // Other-franchise retained ranking player (Jasprit Bumrah) is also rejected
    const bumrahClass = classifyCandidateAcquisition("Jasprit Bumrah");
    expect(bumrahClass.status).toBe("DISALLOWED");
    expect(bumrahClass.disallowedReason).toContain("retained by");
  });

  it("Test 15: bench displacement is calculated correctly", () => {
    const startingXI = [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Nehal Wadhera", // Addition 1
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Trent Boult", // Addition 2
      "Mohammed Shami",
    ];

    const squad = [
      ...warRoomData.team.retained_players.map((p) => p.name),
      "Nehal Wadhera",
      "Trent Boult",
    ];

    const displacement = calculateBenchDisplacement(startingXI, squad);

    expect(displacement.startingXI).toHaveLength(11);
    expect(displacement.startingRetainedPlayers).toHaveLength(9);
    expect(displacement.startingAdditions).toEqual(["Nehal Wadhera", "Trent Boult"]);
    // 19 retained players - 9 in starting XI = 10 displaced retained players on the bench
    expect(displacement.displacedRetainedPlayers).toHaveLength(10);
    expect(displacement.benchPlayers).toHaveLength(10);
    expect(displacement.benchedAdditions).toHaveLength(0);
    expect(displacement.displacedRetainedPlayers).toContain("Sandeep Sharma");
    expect(displacement.displacedRetainedPlayers).toContain("Nandre Burger");
    expect(displacement.displacedRetainedPlayers).toContain("Shubham Dubey");
  });

  it("Test 16: no bid entered means purse remains unchanged at ₹27.05 crore", () => {
    // When a player is selected without entering a bid
    const purse = calculatePurse([]);

    expect(purse.initialPurseCrore).toBe(27.05);
    expect(purse.totalSpendCrore).toBe(0);
    expect(purse.remainingPurseCrore).toBe(27.05);
    expect(purse.isValid).toBe(true);
    expect(purse.errors).toHaveLength(0);
  });

  it("Test 17: explicit hypothetical bid amounts update scenario purse correctly", () => {
    const bids = [
      { playerName: "Nehal Wadhera", amountCrore: 5.5, isHypothetical: true },
      { playerName: "Trent Boult", amountCrore: 4.25, isHypothetical: true },
    ];

    const purse = calculatePurse(bids);

    expect(purse.initialPurseCrore).toBe(27.05);
    expect(purse.totalHypotheticalSpendCrore).toBe(9.75);
    expect(purse.totalConfirmedSpendCrore).toBe(0);
    expect(purse.totalSpendCrore).toBe(9.75);
    // 27.05 - 9.75 = 17.30
    expect(purse.remainingPurseCrore).toBe(17.3);
    expect(purse.isValid).toBe(true);
    expect(purse.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining("hypothetical/unverified bid models")]),
    );
  });

  it("Test 18: invalid, negative, non-finite, and excessive bids are rejected", () => {
    // Negative bid
    const negativeBid = calculatePurse([{ playerName: "Nehal Wadhera", amountCrore: -2 }]);
    expect(negativeBid.isValid).toBe(false);
    expect(negativeBid.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("cannot be negative")]),
    );

    // Non-finite bid
    const nanBid = calculatePurse([{ playerName: "Nehal Wadhera", amountCrore: NaN }]);
    expect(nanBid.isValid).toBe(false);
    expect(nanBid.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("must be a finite number")]),
    );

    // Bid exceeding available purse (₹30 Cr > ₹27.05 Cr)
    const excessiveBid = calculatePurse([{ playerName: "Trent Boult", amountCrore: 30.0 }]);
    expect(excessiveBid.isValid).toBe(false);
    expect(excessiveBid.remainingPurseCrore).toBe(-2.95);
    expect(excessiveBid.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("exceed available purse")]),
    );
  });

  it("Test 19: medical and workload restrictions cannot be cleared through analyst inputs", () => {
    // Matheesha Pathirana with analyst override
    const pathiranaClassification = classifyCandidateAcquisition("Matheesha Pathirana", {
      analystClearedMedical: true,
    });
    expect(pathiranaClassification.assessment.medicalRestriction).toBe("MEDICAL_REVIEW");
    expect(pathiranaClassification.assessment.registrationVerified).toBe(false);
    expect(pathiranaClassification.status).toBe("CONDITIONAL_HYPOTHETICAL");
    expect(pathiranaClassification.status).not.toBe("ACTIONABLE_TARGET");
    expect(pathiranaClassification.status).not.toBe("CONFIRMED_ACQUISITION");

    // Mitchell Starc with analyst workload assumption
    const starcClassification = classifyCandidateAcquisition("Mitchell Starc", {
      analystWorkloadAssumed: true,
    });
    expect(starcClassification.assessment.workloadWarning).toBe(true);
    expect(starcClassification.assessment.registrationVerified).toBe(false);
    expect(starcClassification.status).toBe("CONDITIONAL_HYPOTHETICAL");
    expect(starcClassification.status).not.toBe("ACTIONABLE_TARGET");
  });

  it("Test 20: evaluateSquadScenario isolates custom lineups and does not inherit stale strategic explanations", () => {
    // Predefined scenario
    const predefined = evaluateSquadScenario({
      id: "balanced",
      name: "Core balance · Archer + Shami",
      startingXI: [
        "Vaibhav Sooryavanshi",
        "Yashasvi Jaiswal",
        "Riyan Parag",
        "Dhruv Jurel",
        "Shubham Dubey",
        "Donovan Ferreira",
        "Ravindra Jadeja",
        "Ravi Bishnoi",
        "Jofra Archer",
        "Mohammed Shami",
        "Nandre Burger",
      ],
      why: "Archer leads the pace group; Shami adds an Indian new-ball option.",
      trade: "Three overseas starters.",
      isCustom: false,
    });

    expect(predefined.strategicExplanation).toBeDefined();
    expect(predefined.strategicExplanation?.why).toBe(
      "Archer leads the pace group; Shami adds an Indian new-ball option.",
    );
    expect(predefined.isCustom).toBe(false);

    // Custom lineup
    const custom = evaluateSquadScenario({
      id: "custom",
      name: "Custom Analyst XI",
      startingXI: [
        "Vaibhav Sooryavanshi",
        "Yashasvi Jaiswal",
        "Riyan Parag",
        "Dhruv Jurel",
        "Shubham Dubey",
        "Donovan Ferreira",
        "Ravindra Jadeja",
        "Ravi Bishnoi",
        "Jofra Archer",
        "Mohammed Shami",
        "Sandeep Sharma",
      ],
      why: "Stale predefined strategic explanation",
      isCustom: true, // Marked custom
    });

    // Custom lineup must NOT inherit stale strategic explanation
    expect(custom.strategicExplanation).toBeUndefined();
    expect(custom.isCustom).toBe(true);
    expect(custom.xiValidation.isValid).toBe(true);
  });

  it("Clean player names strips parenthetical conditions correctly", () => {
    expect(cleanPlayerName("Nehal Wadhera (if signed)")).toBe("Nehal Wadhera");
    expect(cleanPlayerName("Matheesha Pathirana (medical clearance required)")).toBe(
      "Matheesha Pathirana",
    );
    expect(cleanPlayerName("Mustafizur Rahman (if registered/fit)")).toBe("Mustafizur Rahman");
    expect(cleanPlayerName("Yashasvi Jaiswal")).toBe("Yashasvi Jaiswal");
  });

  it("Scenario inconsistencies between JSON and UI are documented and accessible", () => {
    const report = getScenarioInconsistencies();
    expect(report.jsonScenariosCount).toBe(4);
    expect(report.uiScenariosCount).toBe(8);
    expect(report.differences.length).toBeGreaterThanOrEqual(3);
  });
});
