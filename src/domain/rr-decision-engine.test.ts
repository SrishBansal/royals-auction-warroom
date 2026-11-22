import { describe, expect, it } from "vitest";
import {
  getHistoricalPlayerEvidence,
  getHistoricalVenueEvidence,
  resolveHistoricalVenue,
} from "./historical-impact";
import { RR_FOCUSED_TARGETS, RR_RETAINED_DECISION_PLAYERS } from "./decision-data";
import {
  assessImpactSubstitution,
  assessInjuryCover,
  canUseHypotheticalTarget,
  deriveMatchContext,
  getHistoricalVenueOption,
  HISTORICAL_VENUE_OPTIONS,
  resolveVenueSurface,
  MAX_FLEXIBLE_XI_CHANGES,
  MAX_OVERSEAS_XI,
  MAX_OVERSEAS_SQUAD_SIZE,
  MAX_SQUAD_SIZE,
  MAX_XI_CHANGES_FROM_REFERENCE,
  optimizeRRLineups,
  parseCricketOvers,
  recommendMatchImpact,
  surfaceBowlingPreference,
  type DecisionPlayer,
  type DecisionSurface,
  type SurfaceSelection,
  type OppositionProfile,
  type TeamObjective,
} from "./rr-decision-engine";

const baseContext = {
  venue: "",
  venueEvidence: "unavailable" as const,
  surface: "neutral" as DecisionSurface,
  opposition: "balanced" as OppositionProfile,
  objective: "balanced" as TeamObjective,
};

function planFor(
  objective: TeamObjective,
  selectedAcquisitions: string[] = [],
  unavailablePlayers: string[] = [],
  medicalClearanceAssumptions: string[] = [],
  surface: DecisionSurface = "neutral",
  opposition: OppositionProfile = "balanced",
  maxXIChangesFromReference: number = MAX_XI_CHANGES_FROM_REFERENCE,
) {
  return optimizeRRLineups({
    retainedPlayers: RR_RETAINED_DECISION_PLAYERS,
    targetPool: RR_FOCUSED_TARGETS,
    selectedAcquisitions,
    unavailablePlayers,
    medicalClearanceAssumptions,
    context: { ...baseContext, objective, surface, opposition },
    maxXIChangesFromReference,
    limit: 3,
  });
}

function target(name: string): DecisionPlayer {
  const player = RR_FOCUSED_TARGETS.find((item) => item.name === name);
  if (!player) throw new Error(`Missing test target: ${name}`);
  return player;
}

describe("continuity-first XI permutation engine", () => {
  it("starts from the full 19-player retained roster and preserves Shanaka in the flexible lower order", () => {
    expect(RR_RETAINED_DECISION_PLAYERS).toHaveLength(19);
    expect(RR_RETAINED_DECISION_PLAYERS.filter((player) => player.overseas)).toHaveLength(5);
    expect(RR_FOCUSED_TARGETS).toHaveLength(20);
    const previouslyHiddenProfiles = [
      "Matthew Breetzke",
      "Abishek Porel",
      "Robin Minz",
      "Daryl Mitchell",
      "Kamindu Mendis",
      "Matt Henry",
      "Deepak Chahar",
      "Gerald Coetzee",
    ];
    for (const name of previouslyHiddenProfiles) {
      expect(RR_FOCUSED_TARGETS.some((player) => player.name === name)).toBe(true);
    }
    const blockedStatuses = new Set([
      "MARKET_STATUS_UNRESOLVED",
      "UNAVAILABLE",
      "INELIGIBLE_MARKET",
      "RETAINED_OTHER_FRANCHISE",
      "RR_RETAINED",
    ]);
    const marketBlocked = RR_FOCUSED_TARGETS.filter((player) =>
      blockedStatuses.has(player.marketStatus ?? ""),
    );
    expect(marketBlocked.map((player) => player.name).sort()).toEqual(["Daryl Mitchell"]);
    expect(
      RR_FOCUSED_TARGETS.filter(
        (player) => player.marketStatus === "RELEASED_REGISTRATION_UNVERIFIED",
      ),
    ).toHaveLength(19);
    expect(target("Mahipal Lomror").marketStatusLabel).toContain("Released by MI");
    expect(target("Mangesh Yadav").marketStatusLabel).toContain("Released by RCB");
    expect(
      previouslyHiddenProfiles
        .filter((name) => name !== "Daryl Mitchell")
        .every((name) => !blockedStatuses.has(target(name).marketStatus ?? "")),
    ).toBe(true);

    const result = planFor("balanced");
    expect(result.permutationsEvaluated).toBeGreaterThan(0);
    expect(result.validCombinations).toBeGreaterThan(0);
    const first = result.recommendations[0]!;
    expect(first.players).toHaveLength(11);
    expect(first.players.map((entry) => entry.position)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
    expect(first.players.find((entry) => entry.position === 7)?.player.name).toBe("Dasun Shanaka");
    expect(first.overseasCount).toBeLessThanOrEqual(4);
  });

  it("exposes a transparent heuristic scorecard and does not reward an acquisition merely for being selected", () => {
    const retainedOnly = planFor("balanced").recommendations[0]!;
    expect(retainedOnly.scoreBreakdown).toMatchObject({
      positionalFit: expect.any(Number),
      continuity: expect.any(Number),
      bowlingBalance: expect.any(Number),
      battingDepth: expect.any(Number),
      objectiveFit: 0,
    });
    const withAvesh = planFor("injury-resilience", ["Avesh Khan"], ["Jofra Archer"])
      .recommendations[0]!;
    expect(withAvesh.scoreBreakdown.objectiveFit).toBeGreaterThan(0);
    expect(withAvesh.scoreBreakdown.acquisitionComplexity).toBeLessThan(0);
  });

  it("keeps the top-order and specialist wicketkeeping injury gaps honest", () => {
    const noCover: string[] = [];
    for (const player of RR_RETAINED_DECISION_PLAYERS) {
      const result = planFor("injury-resilience", [], [player.name]);
      if (!result.recommendations.length) noCover.push(player.name);
    }
    expect(noCover.sort()).toEqual(
      ["Dhruv Jurel", "Vaibhav Sooryavanshi", "Yashasvi Jaiswal"].sort(),
    );
  });

  it("uses Avesh and Akash as Indian pace-depth options without treating them as retained", () => {
    const avesh = planFor("pace-depth", ["Avesh Khan"]);
    const aveshPlan = avesh.recommendations.find((plan) =>
      plan.players.some((entry) => entry.player.name === "Avesh Khan"),
    );
    expect(aveshPlan).toBeDefined();
    expect(
      aveshPlan?.players.find((entry) => entry.player.name === "Avesh Khan")?.player.isRetained,
    ).toBe(false);

    const akash = planFor("pace-depth", ["Akash Madhwal"]);
    const akashPlan = akash.recommendations.find((plan) =>
      plan.players.some((entry) => entry.player.name === "Akash Madhwal"),
    );
    expect(akashPlan).toBeDefined();
    expect(
      akashPlan?.players.find((entry) => entry.player.name === "Akash Madhwal")?.player.isRetained,
    ).toBe(false);
  });

  it("uses Indian pace acquisitions in the XI when a key retained quick is unavailable", () => {
    const aveshCover = planFor("injury-resilience", ["Avesh Khan"], ["Jofra Archer"]);
    expect(
      aveshCover.recommendations[0]?.players.some((entry) => entry.player.name === "Avesh Khan"),
    ).toBe(true);
    expect(
      aveshCover.recommendations[0]?.players.some((entry) => entry.player.name === "Jofra Archer"),
    ).toBe(false);

    const akashCover = planFor("injury-resilience", ["Akash Madhwal"], ["Jofra Archer"]);
    expect(
      akashCover.recommendations[0]?.players.some((entry) => entry.player.name === "Akash Madhwal"),
    ).toBe(true);
    expect(
      akashCover.recommendations[0]?.players.some((entry) => entry.player.name === "Jofra Archer"),
    ).toBe(false);
  });

  it("keeps Pathirana outside the XI until a separate medical assumption is supplied", () => {
    const blocked = planFor("specialist-death-option", ["Matheesha Pathirana"]);
    expect(
      blocked.recommendations.every(
        (plan) => !plan.players.some((entry) => entry.player.name === "Matheesha Pathirana"),
      ),
    ).toBe(true);
    expect(
      blocked.warnings.some((warning) => warning.includes("medical-clearance assumption")),
    ).toBe(true);

    const clearedForSimulation = planFor(
      "specialist-death-option",
      ["Matheesha Pathirana"],
      [],
      ["Matheesha Pathirana"],
    );
    const selected = clearedForSimulation.recommendations[0]?.players.find(
      (entry) => entry.player.name === "Matheesha Pathirana",
    );
    expect(selected).toBeDefined();
    expect(selected?.position).toBe(9);
    expect(clearedForSimulation.recommendations[0]?.overseasCount).toBeLessThanOrEqual(4);
    expect(
      clearedForSimulation.recommendations[0]?.warnings.some((warning) =>
        warning.includes("independent medical/workload clearance"),
      ),
    ).toBe(true);
  });

  it("accepts squad packages of three to six additions while keeping the XI change policy separate", () => {
    const three = planFor("pace-depth", ["Avesh Khan", "Nehal Wadhera", "Akash Madhwal"]);
    expect(three.errors).toHaveLength(0);
    expect(three.recommendations.length).toBeGreaterThan(0);
    expect(three.selectedSquadAdditions).toHaveLength(3);
    expect(three.squadSize).toBe(22);
    for (const plan of three.recommendations) {
      expect(plan.changesFromReference.length).toBeLessThanOrEqual(MAX_XI_CHANGES_FROM_REFERENCE);
    }

    const six = planFor("injury-resilience", [
      "Avesh Khan",
      "Akash Madhwal",
      "Deepak Chahar",
      "Onkar Tarmale",
      "Abishek Porel",
      "Robin Minz",
    ]);
    expect(six.errors).toHaveLength(0);
    expect(six.recommendations.length).toBeGreaterThan(0);
    expect(six.selectedSquadAdditions).toHaveLength(6);
    expect(six.squadSize).toBe(MAX_SQUAD_SIZE);
    expect(six.overseasSquadCount).toBe(5);

    const seven = planFor("balanced", [
      "Avesh Khan",
      "Akash Madhwal",
      "Deepak Chahar",
      "Onkar Tarmale",
      "Abishek Porel",
      "Robin Minz",
      "Nehal Wadhera",
    ]);
    expect(seven.errors.some((error) => error.includes("open place"))).toBe(true);
    expect(seven.recommendations.length).toBeGreaterThan(0);
    expect(seven.selectedSquadAdditions).toHaveLength(6);
    expect(seven.squadSize).toBe(MAX_SQUAD_SIZE);
  });

  it("treats flexible XI changes as an analyst policy from zero through six, separate from squad additions", () => {
    const unchangedOnly = planFor("balanced", [], [], [], "neutral", "balanced", 0);
    expect(unchangedOnly.maxXIChangesFromReference).toBe(0);
    expect(unchangedOnly.recommendations.length).toBeGreaterThan(0);
    expect(
      unchangedOnly.recommendations.every((plan) => plan.changesFromReference.length === 0),
    ).toBe(true);

    const standardPolicy = planFor(
      "pace-depth",
      ["Avesh Khan", "Akash Madhwal", "Nehal Wadhera"],
      [],
      [],
      "slow",
      "spin-heavy",
      MAX_XI_CHANGES_FROM_REFERENCE,
    );
    const fullyFlexible = planFor(
      "pace-depth",
      ["Avesh Khan", "Akash Madhwal", "Nehal Wadhera"],
      [],
      [],
      "slow",
      "spin-heavy",
      MAX_FLEXIBLE_XI_CHANGES,
    );
    expect(fullyFlexible.maxXIChangesFromReference).toBe(MAX_FLEXIBLE_XI_CHANGES);
    expect(fullyFlexible.recommendations.length).toBeGreaterThan(0);
    expect(
      fullyFlexible.recommendations.every(
        (plan) => plan.changesFromReference.length <= MAX_FLEXIBLE_XI_CHANGES,
      ),
    ).toBe(true);
    // The six-change setting must expand the full search, even when the most
    // highly scored top-three plans still prefer the continuity reference.
    expect(fullyFlexible.validCombinations).toBeGreaterThan(standardPolicy.validCombinations);
    expect(fullyFlexible.squadSize).toBe(22);
  });

  it("skips invalid profiles and still fills available package places from later valid names", () => {
    const requested = [
      "Daryl Mitchell",
      "Avesh Khan",
      "Akash Madhwal",
      "Deepak Chahar",
      "Onkar Tarmale",
      "Abishek Porel",
      "Robin Minz",
    ];
    const result = planFor("injury-resilience", requested);
    expect(result.selectedSquadAdditions).toContain("Avesh Khan");
    expect(result.selectedSquadAdditions).toContain("Robin Minz");
    expect(result.selectedSquadAdditions).toHaveLength(6);
    expect(result.squadSize).toBe(MAX_SQUAD_SIZE);
    expect(result.errors.some((error) => error.includes("Daryl Mitchell"))).toBe(true);
  });

  it("exposes the hypothetical market gate rather than equating release with registration", () => {
    expect(canUseHypotheticalTarget(target("Avesh Khan"))).toBe(true);
    expect(canUseHypotheticalTarget(target("Daryl Mitchell"))).toBe(false);
    expect(canUseHypotheticalTarget(target("Matheesha Pathirana"))).toBe(false);
    expect(canUseHypotheticalTarget(target("Matheesha Pathirana"), ["Matheesha Pathirana"])).toBe(
      true,
    );
  });

  it("enforces the actual eight-player overseas squad limit independently from XI composition", () => {
    const packageResult = planFor("balanced", [
      "Mitch Owen",
      "Shimron Hetmyer",
      "Matthew Breetzke",
      "Kamindu Mendis",
    ]);
    expect(packageResult.recommendations.length).toBeGreaterThan(0);
    expect(packageResult.overseasSquadCount).toBeLessThanOrEqual(MAX_OVERSEAS_SQUAD_SIZE);
    expect(packageResult.errors.some((error) => error.includes("overseas squad limit"))).toBe(true);
  });

  it("derives venue provenance and surface bowling preference without pretending to retrieve pitch data", () => {
    const matchContext = deriveMatchContext({
      surface: "slow",
      opposition: "spin-heavy",
      objective: "balanced",
      venue: "Sawai Mansingh Stadium, Jaipur",
    });
    expect(matchContext.venue).toBe("Sawai Mansingh Stadium, Jaipur");
    expect(matchContext.venueEvidence).toBe("analyst-input");
    expect(
      deriveMatchContext({ surface: "neutral", opposition: "balanced", objective: "balanced" })
        .venueEvidence,
    ).toBe("unavailable");
    expect(surfaceBowlingPreference("slow")).toBe("spin");
    expect(surfaceBowlingPreference("dry")).toBe("spin");
    expect(surfaceBowlingPreference("dew")).toBe("pace");
    expect(surfaceBowlingPreference("pace-friendly")).toBe("pace");
    expect(surfaceBowlingPreference("bouncy")).toBe("pace");
    expect(surfaceBowlingPreference("neutral")).toBe("balanced");
  });

  it("compares the candidate middle-order recruit against retained options rather than forcing a purchase", () => {
    const nehal = planFor("middle-order-cover", ["Nehal Wadhera"]);
    const nitish = planFor("middle-order-cover", ["Nitish Rana"]);
    // A candidate may be admitted to the squad package without earning a
    // starting-XI place. The optimizer must report that honestly, not force it.
    expect(nehal.selectedSquadAdditions).toContain("Nehal Wadhera");
    expect(nitish.selectedSquadAdditions).toContain("Nitish Rana");
    expect(
      nehal.warnings.some(
        (warning) => warning.includes("Nehal Wadhera") && warning.includes("does not appear"),
      ),
    ).toBe(true);
    expect(
      nitish.warnings.some(
        (warning) => warning.includes("Nitish Rana") && warning.includes("does not appear"),
      ),
    ).toBe(true);
  });

  it("exhaustively checks the surface, opposition and selection-objective permutations", () => {
    const surfaces: DecisionSurface[] = [
      "neutral",
      "slow",
      "dry",
      "dew",
      "pace-friendly",
      "bouncy",
    ];
    const oppositions: OppositionProfile[] = [
      "balanced",
      "spin-heavy",
      "pace-heavy",
      "left-hand-heavy",
      "right-hand-heavy",
    ];
    const objectives: TeamObjective[] = [
      "balanced",
      "pace-depth",
      "middle-order-cover",
      "spin-control",
      "injury-resilience",
      "specialist-death-option",
    ];
    let contextsChecked = 0;
    let permutationsChecked = 0;

    for (const surface of surfaces) {
      for (const opposition of oppositions) {
        for (const objective of objectives) {
          const result = planFor(objective, [], [], [], surface, opposition);
          contextsChecked += 1;
          permutationsChecked += result.permutationsEvaluated;
          expect(result.validCombinations).toBeGreaterThan(0);
          for (const plan of result.recommendations) {
            const names = plan.players.map((entry) => entry.player.name);
            expect(names).toHaveLength(11);
            expect(new Set(names).size).toBe(11);
            expect(plan.overseasCount).toBeLessThanOrEqual(4);
            expect(plan.changesFromReference.length).toBeLessThanOrEqual(
              MAX_XI_CHANGES_FROM_REFERENCE,
            );
          }
        }
      }
    }

    expect(contextsChecked).toBe(180);
    expect(permutationsChecked).toBeGreaterThan(10_000);
  });

  it("checks every one- and two-player combination from all market-eligible target profiles across conditions", () => {
    const selectableCandidates = RR_FOCUSED_TARGETS.filter(
      (player) =>
        ![
          "MARKET_STATUS_UNRESOLVED",
          "UNAVAILABLE",
          "INELIGIBLE_MARKET",
          "RETAINED_OTHER_FRANCHISE",
          "RR_RETAINED",
        ].includes(player.marketStatus ?? ""),
    );
    const combinations: string[][] = [];
    for (let i = 0; i < selectableCandidates.length; i += 1) {
      combinations.push([selectableCandidates[i]!.name]);
      for (let j = i + 1; j < selectableCandidates.length; j += 1) {
        combinations.push([selectableCandidates[i]!.name, selectableCandidates[j]!.name]);
      }
    }
    const surfaces: DecisionSurface[] = [
      "neutral",
      "slow",
      "dry",
      "dew",
      "pace-friendly",
      "bouncy",
    ];
    const oppositions: OppositionProfile[] = [
      "balanced",
      "spin-heavy",
      "pace-heavy",
      "left-hand-heavy",
      "right-hand-heavy",
    ];
    let runs = 0;
    let permutations = 0;

    for (const selectedAcquisitions of combinations) {
      for (const surface of surfaces) {
        for (const opposition of oppositions) {
          const result = optimizeRRLineups({
            retainedPlayers: RR_RETAINED_DECISION_PLAYERS,
            targetPool: RR_FOCUSED_TARGETS,
            selectedAcquisitions,
            medicalClearanceAssumptions: selectedAcquisitions.includes("Matheesha Pathirana")
              ? ["Matheesha Pathirana"]
              : [],
            context: { ...baseContext, surface, opposition, objective: "balanced" },
            limit: 3,
          });
          runs += 1;
          permutations += result.permutationsEvaluated;
          expect(result.errors).toHaveLength(0);
          expect(result.recommendations.length).toBeGreaterThan(0);
          for (const plan of result.recommendations) {
            const names = plan.players.map((entry) => entry.player.name);
            expect(names).toHaveLength(11);
            expect(new Set(names).size).toBe(11);
            expect(plan.overseasCount).toBeLessThanOrEqual(4);
            expect(plan.changesFromReference.length).toBeLessThanOrEqual(
              MAX_XI_CHANGES_FROM_REFERENCE,
            );
            expect(
              plan.players.filter((entry) => !entry.player.isRetained).length,
            ).toBeLessThanOrEqual(MAX_XI_CHANGES_FROM_REFERENCE);
          }
        }
      }
    }

    expect(selectableCandidates.length).toBeGreaterThanOrEqual(15);
    expect(combinations).toHaveLength(
      (selectableCandidates.length * (selectableCandidates.length + 1)) / 2,
    );
    expect(runs).toBe(combinations.length * 30);
    expect(permutations).toBeGreaterThan(200_000);
  }, 120_000);

  it("reports uncovered top-order/keeper injury scenarios instead of inventing cover", () => {
    const noCover: string[] = [];
    for (const player of RR_RETAINED_DECISION_PLAYERS) {
      const result = planFor("injury-resilience", [], [player.name]);
      if (!result.recommendations.length) noCover.push(player.name);
      else {
        const names = result.recommendations[0]!.players.map((entry) => entry.player.name);
        expect(names).not.toContain(player.name);
        expect(names).toHaveLength(11);
        expect(new Set(names).size).toBe(11);
      }
    }
    expect(noCover.sort()).toEqual(
      ["Dhruv Jurel", "Vaibhav Sooryavanshi", "Yashasvi Jaiswal"].sort(),
    );
  });
});

describe("injury and substitution trade-off audit", () => {
  const baseline = planFor("balanced").recommendations[0]!;
  const xiPlayers = baseline.players.map((entry) => entry.player);

  it("does not surface Pathirana as injury cover without the separate medical assumption", () => {
    const withoutClearance = assessInjuryCover(
      "Jofra Archer",
      RR_RETAINED_DECISION_PLAYERS,
      RR_FOCUSED_TARGETS,
      ["Matheesha Pathirana"],
    );
    expect(
      withoutClearance.options.some((option) => option.player.name === "Matheesha Pathirana"),
    ).toBe(false);
    const withClearance = assessInjuryCover(
      "Jofra Archer",
      RR_RETAINED_DECISION_PLAYERS,
      RR_FOCUSED_TARGETS,
      ["Matheesha Pathirana"],
      ["Matheesha Pathirana"],
    );
    expect(
      withClearance.options.some((option) => option.player.name === "Matheesha Pathirana"),
    ).toBe(true);
  });

  it("audits the incoming/outgoing role trade-off and rejects a substitution that removes the only keeper", () => {
    const pretorius = RR_RETAINED_DECISION_PLAYERS.find(
      (player) => player.name === "Lhuan-dre Pretorius",
    )!;
    const keeperReplacement = assessImpactSubstitution(xiPlayers, pretorius, "Dhruv Jurel");
    expect(keeperReplacement.valid).toBe(true);
    expect(keeperReplacement.beforeCoverage.wicketkeepers).toBeGreaterThanOrEqual(1);
    expect(keeperReplacement.afterCoverage.wicketkeepers).toBeGreaterThanOrEqual(1);
    expect(keeperReplacement.lostCapabilities).toContain("top-order");

    // Build a valid XI whose only identified keeper is Jurel, then try to replace him with a specialist bowler.
    const sandeep = RR_RETAINED_DECISION_PLAYERS.find(
      (player) => player.name === "Sandeep Sharma",
    )!;
    const onlyJurelKeeperXI = xiPlayers.map((player) =>
      player.name === "Donovan Ferreira" ? sandeep : player,
    );
    const incomingBowler = RR_RETAINED_DECISION_PLAYERS.find(
      (player) => player.name === "Brijesh Sharma",
    )!;
    const removeOnlyKeeper = assessImpactSubstitution(
      onlyJurelKeeperXI,
      incomingBowler,
      "Dhruv Jurel",
    );
    expect(removeOnlyKeeper.valid).toBe(false);
    expect(removeOnlyKeeper.reason).toContain("no identified wicketkeeper");

    const unresolved = target("Daryl Mitchell");
    const blockedMarketIncoming = assessImpactSubstitution(xiPlayers, unresolved, "Mohammed Shami");
    expect(blockedMarketIncoming.valid).toBe(false);
    expect(blockedMarketIncoming.reason).toContain("market or medical gate");

    const pathirana = target("Matheesha Pathirana");
    const blockedMedicalIncoming = assessImpactSubstitution(xiPlayers, pathirana, "Mohammed Shami");
    expect(blockedMedicalIncoming.valid).toBe(false);
    const assumedMedicalIncoming = assessImpactSubstitution(
      xiPlayers,
      pathirana,
      "Mohammed Shami",
      ["Matheesha Pathirana"],
    );
    expect(
      assumedMedicalIncoming.warnings.some((warning) =>
        warning.includes("analyst medical-clearance assumption"),
      ),
    ).toBe(true);
  });
});

describe("venue and pitch-aware Impact Player permutations", () => {
  const baseline = planFor("balanced").recommendations[0]!;
  const currentXI = baseline.players.map((entry) => entry.player.name);
  const selectedNames = [
    "Matthew Breetzke",
    "Abishek Porel",
    "Nitish Rana",
    "Mitch Owen",
    "Avesh Khan",
    "Akash Madhwal",
  ];
  const hypothetical = RR_FOCUSED_TARGETS.filter(
    (player) => selectedNames.includes(player.name) && canUseHypotheticalTarget(player),
  );
  const activeSquad = [...RR_RETAINED_DECISION_PLAYERS, ...hypothetical];

  it("maps historical venue IDs transparently and keeps physical surface as a separate manual override", () => {
    expect(getHistoricalVenueOption("Wankhede Stadium, Mumbai")?.venueId).toBe(3);
    expect(getHistoricalVenueOption("Chepauk, Chennai")?.venueId).toBe(1);
    expect(getHistoricalVenueOption("Sawai Mansingh Stadium, Jaipur")?.venueId).toBe(6);
    expect(getHistoricalVenueOption("Ekana, Lucknow")?.venueId).toBe(3272);
    expect(getHistoricalVenueOption("HPCA Dharamshala")?.venueId).toBe(48);
    expect(getHistoricalVenueOption("unknown ground")).toBeNull();
    expect(resolveVenueSurface("Wankhede Stadium, Mumbai", "venue-default")).toMatchObject({
      surface: "neutral",
      source: "historical-venue-profile",
    });
    expect(resolveVenueSurface("Chepauk, Chennai", "venue-default")).toMatchObject({
      surface: "neutral",
      source: "historical-venue-profile",
    });
    expect(resolveVenueSurface("Wankhede Stadium, Mumbai", "dry")).toMatchObject({
      surface: "dry",
      source: "analyst-override",
    });
    expect(resolveVenueSurface("unknown ground", "venue-default")).toMatchObject({
      surface: "neutral",
      source: "neutral-fallback",
    });

    const makeDecision = (venue: string, selection: SurfaceSelection) => {
      const resolved = resolveVenueSurface(venue, selection);
      return recommendMatchImpact({
        innings: "defending",
        score: 59,
        wickets: 0,
        ballsCompleted: 36,
        targetOrDefendedTotal: 215,
        surface: resolved.surface,
        surfaceSource: resolved.source,
        opposition: "balanced",
        currentXI,
        availableSquad: activeSquad,
        venue,
        venueEvidence: "analyst-input",
      });
    };
    const wankhedeDry = makeDecision("Wankhede Stadium, Mumbai", "dry");
    const chepaukDry = makeDecision("Chepauk, Chennai", "dry");
    expect(wankhedeDry.valid).toBe(true);
    expect(chepaukDry.valid).toBe(true);
    expect(wankhedeDry.historicalEvidence.length).toBeGreaterThan(0);
    expect(chepaukDry.historicalEvidence.length).toBeGreaterThan(0);
  });

  it("uses historical ground and player evidence without inventing a pitch type", () => {
    const wankhedeVenue = getHistoricalVenueEvidence("Wankhede Stadium, Mumbai", "middle");
    const chepaukVenue = getHistoricalVenueEvidence("Chepauk, Chennai", "middle");
    expect(wankhedeVenue?.matches).toBeGreaterThan(10);
    expect(chepaukVenue?.matches).toBeGreaterThan(10);
    expect(wankhedeVenue?.pace?.balls).toBeGreaterThan(0);
    expect(chepaukVenue?.spin?.balls).toBeGreaterThan(0);
    expect(resolveVenueSurface("Wankhede Stadium, Mumbai", "venue-default").surface).toBe(
      "neutral",
    );
    expect(resolveVenueSurface("Chepauk, Chennai", "venue-default").surface).toBe("neutral");

    const decision = recommendMatchImpact({
      innings: "defending",
      score: 59,
      wickets: 0,
      ballsCompleted: 36,
      targetOrDefendedTotal: 215,
      surface: "neutral",
      surfaceSource: "historical-venue-profile",
      opposition: "balanced",
      currentXI,
      availableSquad: activeSquad,
      venue: "Chepauk, Chennai",
      venueEvidence: "analyst-input",
    });
    expect(decision.valid).toBe(true);
    expect(decision.historicalEvidence.length).toBeGreaterThan(0);
    expect(
      decision.warnings.some((warning) =>
        warning.includes("no dry/slow/bouncy condition is inferred"),
      ),
    ).toBe(true);
  });

  it("never uses a small ground-only sample without shrinkage and reports no-sample candidates honestly", () => {
    const tinyLocal = getHistoricalPlayerEvidence(
      "Abishek Porel",
      "batting",
      "middle",
      "Chepauk",
      "balanced",
    );
    expect(tinyLocal.dataAvailable).toBe(true);
    expect(tinyLocal.venueEvidenceUsed).toBe(false);
    expect(tinyLocal.sampleBalls).toBeGreaterThan(0);
    const localEnough = getHistoricalPlayerEvidence(
      "Avesh Khan",
      "bowling",
      "death",
      "Chepauk",
      "balanced",
    );
    expect(localEnough.venueEvidenceUsed).toBe(true);
    expect(localEnough.venueSampleBalls).toBeGreaterThanOrEqual(24);
    expect(localEnough.venueSampleMatches).toBeGreaterThanOrEqual(3);
    const noSample = getHistoricalPlayerEvidence(
      "Yash Raj Punja",
      "bowling",
      "middle",
      "Chepauk",
      "balanced",
    );
    expect(noSample.dataAvailable).toBe(false);
    expect(noSample.confidence).toBe("no IPL sample");
  });

  it("resolves only complete historical venue names/aliases and preserves ambiguous partial strings as unknown", () => {
    expect(resolveHistoricalVenue("Wankhede")?.venue_id).toBe(3);
    expect(resolveHistoricalVenue("Wankhede Stadium, Mumbai")?.venue_id).toBe(3);
    expect(resolveHistoricalVenue("Chepauk")?.venue_id).toBe(1);
    expect(resolveHistoricalVenue("Chepauk, Chennai")?.venue_id).toBe(1);
    // The full label used by the Match Lab select must resolve to the same
    // numeric historical venue as the short alias. This prevents a displayed
    // venue from silently falling back to unknown ground evidence.
    expect(resolveHistoricalVenue("M. A. Chidambaram Stadium (Chepauk), Chennai")?.venue_id).toBe(
      1,
    );
    expect(
      getHistoricalVenueEvidence("M. A. Chidambaram Stadium (Chepauk), Chennai", "middle")?.venueId,
    ).toBe(1);
    expect(resolveHistoricalVenue("Mumbai")).toBeNull();
    expect(resolveHistoricalVenue("Chennai")).toBeNull();
    expect(getHistoricalVenueOption("Mumbai")).toBeNull();
    expect(resolveHistoricalVenue("made-up stadium")).toBeNull();
    for (const option of HISTORICAL_VENUE_OPTIONS) {
      expect(resolveHistoricalVenue(option.venue)?.venue_id).toBe(option.venueId);
      expect(getHistoricalVenueEvidence(option.venue, "middle")?.venueId).toBe(option.venueId);
    }
  });

  it("uses historical batter-vs-pace/spin and bowler-vs-handedness evidence only after sample gates pass", () => {
    const nehalPace = getHistoricalPlayerEvidence(
      "Nehal Wadhera",
      "batting",
      "middle",
      "",
      "pace-heavy",
    );
    const nehalSpin = getHistoricalPlayerEvidence(
      "Nehal Wadhera",
      "batting",
      "middle",
      "",
      "spin-heavy",
    );
    expect(nehalPace.opponentStyle).toBe("pace");
    expect(nehalSpin.opponentStyle).toBe("spin");
    expect(nehalPace.opponentStyleEvidenceUsed).toBe(true);
    expect(nehalSpin.opponentStyleEvidenceUsed).toBe(true);
    expect(nehalPace.tieBreakContextMetricPer100).not.toBeNull();
    expect(nehalSpin.tieBreakContextMetricPer100).not.toBeNull();
    expect(nehalPace.tieBreakContextMetricPer100).not.toBe(nehalSpin.tieBreakContextMetricPer100);

    const bishnoiLeft = getHistoricalPlayerEvidence(
      "Ravi Bishnoi",
      "bowling",
      "middle",
      "",
      "left-hand-heavy",
    );
    const bishnoiRight = getHistoricalPlayerEvidence(
      "Ravi Bishnoi",
      "bowling",
      "middle",
      "",
      "right-hand-heavy",
    );
    expect(bishnoiLeft.opponentStyle).toBe("left-hand");
    expect(bishnoiRight.opponentStyle).toBe("right-hand");
    expect(bishnoiLeft.opponentStyleEvidenceUsed).toBe(true);
    expect(bishnoiRight.opponentStyleEvidenceUsed).toBe(true);
    expect(bishnoiLeft.tieBreakContextMetricPer100).not.toBe(
      bishnoiRight.tieBreakContextMetricPer100,
    );
  });

  it("uses player-specific historical venue splits when both sample gates pass, not a hard-coded ground pitch type", () => {
    const chepauk = getHistoricalPlayerEvidence(
      "Avesh Khan",
      "bowling",
      "death",
      "M. A. Chidambaram Stadium (Chepauk), Chennai",
      "balanced",
    );
    const wankhede = getHistoricalPlayerEvidence(
      "Avesh Khan",
      "bowling",
      "death",
      "Wankhede Stadium, Mumbai",
      "balanced",
    );
    expect(chepauk.venueName).toBe("M. A. Chidambaram Stadium, Chennai");
    expect(wankhede.venueName).toBe("Wankhede Stadium, Mumbai");
    expect(chepauk.venueEvidenceUsed).toBe(true);
    expect(wankhede.venueEvidenceUsed).toBe(true);
    expect(chepauk.tieBreakContextMetricPer100).not.toBe(wankhede.tieBreakContextMetricPer100);
    expect(resolveVenueSurface("Wankhede Stadium, Mumbai", "venue-default")).toMatchObject({
      surface: "neutral",
      source: "historical-venue-profile",
    });
    expect(resolveVenueSurface("Chepauk, Chennai", "venue-default")).toMatchObject({
      surface: "neutral",
      source: "historical-venue-profile",
    });
  });

  it("runs an innings × venue × surface matrix without invalid states or ineligible outputs", () => {
    const venues = [
      "Wankhede Stadium, Mumbai",
      "Chepauk, Chennai",
      "Sawai Mansingh Stadium, Jaipur",
      "Ekana, Lucknow",
      "HPCA Dharamshala",
      "unlisted venue",
    ];
    const selections: SurfaceSelection[] = [
      "venue-default",
      "neutral",
      "slow",
      "dry",
      "dew",
      "pace-friendly",
      "bouncy",
    ];
    const states = [
      {
        innings: "batting-first" as const,
        score: 82,
        wickets: 2,
        ballsCompleted: 54,
        targetOrDefendedTotal: null,
      },
      {
        innings: "chasing" as const,
        score: 53,
        wickets: 3,
        ballsCompleted: 60,
        targetOrDefendedTotal: 170,
      },
      {
        innings: "chasing" as const,
        score: 56,
        wickets: 6,
        ballsCompleted: 60,
        targetOrDefendedTotal: 170,
      },
      {
        innings: "defending" as const,
        score: 59,
        wickets: 0,
        ballsCompleted: 36,
        targetOrDefendedTotal: 215,
      },
      {
        innings: "defending" as const,
        score: 155,
        wickets: 3,
        ballsCompleted: 96,
        targetOrDefendedTotal: 215,
      },
    ];
    const oppositionProfiles: OppositionProfile[] = [
      "balanced",
      "spin-heavy",
      "pace-heavy",
      "left-hand-heavy",
      "right-hand-heavy",
    ];
    let evaluated = 0;
    let recommendations = 0;
    const recommendedNames = new Set<string>();
    for (const venue of venues) {
      for (const selection of selections) {
        const resolved = resolveVenueSurface(venue, selection);
        for (const oppositionProfile of oppositionProfiles) {
          for (const state of states) {
            const decision = recommendMatchImpact({
              ...state,
              surface: resolved.surface,
              surfaceSource: resolved.source,
              opposition: oppositionProfile,
              currentXI,
              availableSquad: activeSquad,
              venue,
              venueEvidence: venue ? "analyst-input" : "unavailable",
            });
            expect(decision.valid).toBe(true);
            if (decision.recommended) {
              recommendations += 1;
              recommendedNames.add(decision.recommended.name);
              expect(activeSquad.some((player) => player.name === decision.recommended?.name)).toBe(
                true,
              );
              expect(currentXI.includes(decision.recommended.name)).toBe(false);
              expect(
                !decision.recommended.overseas ||
                  currentXI.filter(
                    (name) => activeSquad.find((player) => player.name === name)?.overseas,
                  ).length < 4,
              ).toBe(true);
            }
            evaluated += 1;
          }
        }
      }
    }
    expect(evaluated).toBe(1050);
    expect(recommendations).toBeGreaterThan(0);
    expect(recommendedNames.size).toBeGreaterThan(1);
  });
});

describe("situation-based Impact Player engine", () => {
  const baseline = planFor("balanced").recommendations[0]!;
  const currentXI = baseline.players.map((entry) => entry.player.name);
  const hypotheticallyAvailable = [
    ...RR_RETAINED_DECISION_PLAYERS,
    target("Nehal Wadhera"),
    target("Mitch Owen"),
  ];

  it("uses the full retained bench and identifies Shanaka as a partial lower-order option when he is off the XI", () => {
    const xiWithoutShanaka = currentXI.map((name) =>
      name === "Dasun Shanaka" ? "Sandeep Sharma" : name,
    );
    const state = recommendMatchImpact({
      innings: "chasing",
      score: 56,
      wickets: 6,
      ballsCompleted: 60,
      targetOrDefendedTotal: 170,
      surface: "neutral",
      opposition: "balanced",
      currentXI: xiWithoutShanaka,
      availableSquad: RR_RETAINED_DECISION_PLAYERS,
      venue: "",
      venueEvidence: "unavailable",
    });
    expect(xiWithoutShanaka).toHaveLength(11);
    expect(new Set(xiWithoutShanaka).size).toBe(11);
    expect(state.valid).toBe(true);
    expect(state.recommended?.name).toBe("Dasun Shanaka");
    expect(
      state.warnings.some((warning) =>
        warning.includes("not a verified match-day Impact Player nomination"),
      ),
    ).toBe(true);
    expect(
      state.warnings.some((warning) =>
        warning.includes("not a specialist middle-order repair batter"),
      ),
    ).toBe(true);
  });

  it("returns complete, valid situation-based Impact Player combinations without requiring manual outgoing-player selection", () => {
    const chase = recommendMatchImpact({
      innings: "chasing",
      score: 53,
      wickets: 3,
      ballsCompleted: 60,
      targetOrDefendedTotal: 170,
      surface: "neutral",
      opposition: "balanced",
      currentXI,
      availableSquad: hypotheticallyAvailable,
      venue: "",
      venueEvidence: "unavailable",
    });
    expect(chase.combinations.length).toBeGreaterThan(0);
    expect(chase.combinations[0]?.incoming.name).toBe(chase.recommended?.name);
    for (const combination of chase.combinations) {
      expect(combination.assessment.valid).toBe(true);
      expect(currentXI).toContain(combination.outgoing.name);
      expect(currentXI).not.toContain(combination.incoming.name);
      expect(combination.assessment.afterCoverage.overseas).toBeLessThanOrEqual(MAX_OVERSEAS_XI);
      expect(combination.assessment.afterCoverage.wicketkeepers).toBeGreaterThanOrEqual(1);
      expect(combination.assessment.afterCoverage.paceOptions).toBeGreaterThanOrEqual(2);
      expect(combination.assessment.afterCoverage.spinOptions).toBeGreaterThanOrEqual(1);
    }

    const defending = recommendMatchImpact({
      innings: "defending",
      score: 155,
      wickets: 3,
      ballsCompleted: 96,
      targetOrDefendedTotal: 215,
      surface: "neutral",
      opposition: "balanced",
      currentXI,
      availableSquad: hypotheticallyAvailable,
      venue: "",
      venueEvidence: "unavailable",
    });
    expect(defending.combinations.length).toBeGreaterThan(0);
    expect(defending.combinations[0]?.incoming.name).toBe(defending.recommended?.name);
    expect(defending.requiredRole.toLowerCase()).toContain("death");
  });

  it("supports first-innings planning without forcing a chase target", () => {
    const state = recommendMatchImpact({
      innings: "batting-first",
      score: 82,
      wickets: 2,
      ballsCompleted: 54,
      targetOrDefendedTotal: null,
      surface: "neutral",
      opposition: "balanced",
      currentXI,
      availableSquad: hypotheticallyAvailable,
      venue: "",
      venueEvidence: "unavailable",
    });
    expect(state.valid).toBe(true);
    expect(state.runsRemaining).toBeNull();
    expect(state.requiredRate).toBeNull();
    expect(state.recommended).not.toBeNull();
    expect(state.warnings.some((warning) => warning.includes("does not infer a par score"))).toBe(
      true,
    );
  });

  it("changes the role recommendation between acceleration and a six-wicket collapse", () => {
    const stateA = recommendMatchImpact({
      innings: "chasing",
      score: 53,
      wickets: 3,
      ballsCompleted: 60,
      targetOrDefendedTotal: 170,
      surface: "neutral",
      opposition: "balanced",
      currentXI,
      availableSquad: hypotheticallyAvailable,
      venue: "",
      venueEvidence: "unavailable",
    });
    const stateB = recommendMatchImpact({
      innings: "chasing",
      score: 56,
      wickets: 6,
      ballsCompleted: 60,
      targetOrDefendedTotal: 170,
      surface: "neutral",
      opposition: "balanced",
      currentXI,
      availableSquad: hypotheticallyAvailable,
      venue: "",
      venueEvidence: "unavailable",
    });

    expect(stateA.runsRemaining).toBe(117);
    expect(stateA.requiredRate).toBeCloseTo(11.7, 2);
    expect(stateB.runsRemaining).toBe(114);
    expect(stateB.requiredRate).toBeCloseTo(11.4, 2);
    expect(stateA.requiredRole).toContain("acceleration");
    expect(stateB.requiredRole).toContain("repair");
    expect(stateA.recommended?.name).toBe("Mitch Owen");
    expect(stateB.recommended?.name).toBe("Nehal Wadhera");
  });

  it("does not pull a target into the match squad unless it is explicitly available", () => {
    const decision = recommendMatchImpact({
      innings: "chasing",
      score: 53,
      wickets: 3,
      ballsCompleted: 60,
      targetOrDefendedTotal: 170,
      surface: "neutral",
      opposition: "balanced",
      currentXI,
      availableSquad: RR_RETAINED_DECISION_PLAYERS,
      venue: "",
      venueEvidence: "unavailable",
    });
    expect(decision.recommended?.name).not.toBe("Nehal Wadhera");
    expect(decision.recommended?.name).not.toBe("Mitch Owen");
  });

  it("offers retained general batting-depth options without mislabelling them as specialist finishers", () => {
    const firstInnings = recommendMatchImpact({
      innings: "batting-first",
      score: 53,
      wickets: 3,
      ballsCompleted: 60,
      targetOrDefendedTotal: 170,
      surface: "neutral",
      opposition: "pace-heavy",
      currentXI,
      availableSquad: RR_RETAINED_DECISION_PLAYERS,
      venue: "",
      venueEvidence: "unavailable",
    });
    const chase = recommendMatchImpact({
      innings: "chasing",
      score: 53,
      wickets: 3,
      ballsCompleted: 60,
      targetOrDefendedTotal: 170,
      surface: "neutral",
      opposition: "pace-heavy",
      currentXI,
      availableSquad: RR_RETAINED_DECISION_PLAYERS,
      venue: "",
      venueEvidence: "unavailable",
    });
    for (const state of [firstInnings, chase]) {
      expect(state.valid).toBe(true);
      expect(state.recommended).not.toBeNull();
      expect(["Lhuan-dre Pretorius", "Aman Rao Perala"]).toContain(state.recommended?.name);
      expect(state.combinations.length).toBeGreaterThan(0);
      expect(
        state.warnings.some((warning) => warning.includes("general batting-depth options only")),
      ).toBe(true);
      expect(state.recommendedReason).toContain("general batting-depth fit");
    }
  });

  it("shows no-sample middle-over bowling options as a peer group rather than a performance ranking", () => {
    const defending = recommendMatchImpact({
      innings: "defending",
      score: 53,
      wickets: 3,
      ballsCompleted: 60,
      targetOrDefendedTotal: 170,
      surface: "neutral",
      opposition: "balanced",
      currentXI,
      availableSquad: RR_RETAINED_DECISION_PLAYERS,
      venue: "",
      venueEvidence: "unavailable",
    });
    expect(defending.recommended).not.toBeNull();
    expect(
      defending.alternatives.some(
        (player) => player.name === "Manimaran Siddharth" || player.name === "Yash Raj Punja",
      ),
    ).toBe(true);
    expect(defending.recommended?.name).toBe("Manimaran Siddharth");
    expect(defending.alternatives.some((player) => player.name === "Yash Raj Punja")).toBe(true);
    expect(defending.recommendedReason).toContain("top role-fit group");
    expect(
      defending.warnings.some((warning) =>
        warning.includes("No qualifying IPL phase sample is available for Yash Raj Punja"),
      ),
    ).toBe(true);
  });

  it("provides phase-appropriate retained bowling options across a defence", () => {
    const states = [
      { score: 28, wickets: 1, ballsCompleted: 12 },
      { score: 65, wickets: 2, ballsCompleted: 36 },
      { score: 140, wickets: 5, ballsCompleted: 96 },
    ].map((state) =>
      recommendMatchImpact({
        innings: "defending",
        ...state,
        targetOrDefendedTotal: 170,
        surface: "neutral",
        opposition: "balanced",
        currentXI,
        availableSquad: RR_RETAINED_DECISION_PLAYERS,
        venue: "",
        venueEvidence: "unavailable",
      }),
    );

    for (const state of states) {
      expect(state.valid).toBe(true);
      expect(state.recommended).not.toBeNull();
      expect(state.combinations.length).toBeGreaterThan(0);
    }
    expect(states[0]?.phase).toBe("powerplay");
    expect(states[1]?.phase).toBe("middle");
    expect(states[2]?.phase).toBe("death");
    expect(new Set(states.map((state) => state.recommended?.name)).size).toBeGreaterThan(1);
  });

  it("uses the opponent chase state when RR are defending", () => {
    const decision = recommendMatchImpact({
      innings: "defending",
      score: 59,
      wickets: 0,
      ballsCompleted: 36,
      targetOrDefendedTotal: 215,
      surface: "slow",
      opposition: "balanced",
      currentXI,
      availableSquad: RR_RETAINED_DECISION_PLAYERS,
      venue: "",
      venueEvidence: "unavailable",
    });
    expect(decision.runsRemaining).toBe(157);
    expect(decision.requiredRate).toBeCloseTo(11.21, 2);
    expect(decision.requiredRole.toLowerCase()).toContain("partnership-breaking");
    expect(decision.recommended).not.toBeNull();
  });

  it("rejects invalid over notation and completed innings", () => {
    expect(parseCricketOvers("10.3")).toBe(63);
    expect(parseCricketOvers("10.6")).toBeNull();
    expect(parseCricketOvers("20.1")).toBeNull();
    const completed = recommendMatchImpact({
      innings: "chasing",
      score: 170,
      wickets: 6,
      ballsCompleted: 100,
      targetOrDefendedTotal: 170,
      surface: "neutral",
      opposition: "balanced",
      currentXI,
      availableSquad: RR_RETAINED_DECISION_PLAYERS,
      venue: "",
      venueEvidence: "unavailable",
    });
    expect(completed.phase).toBe("complete");
    expect(completed.recommended).toBeNull();
  });

  it("does not recommend an overseas substitute when the XI already contains four overseas players", () => {
    const xi = [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Donovan Ferreira",
      "Dasun Shanaka",
      "Ravindra Jadeja",
      "Jofra Archer",
      "Matheesha Pathirana",
      "Mohammed Shami",
      "Ravi Bishnoi",
    ];
    const squad = [
      ...RR_RETAINED_DECISION_PLAYERS,
      target("Matheesha Pathirana"),
      target("Mitch Owen"),
    ];
    const decision = recommendMatchImpact({
      innings: "chasing",
      score: 53,
      wickets: 3,
      ballsCompleted: 60,
      targetOrDefendedTotal: 170,
      surface: "neutral",
      opposition: "balanced",
      currentXI: xi,
      availableSquad: squad,
      venue: "",
      venueEvidence: "unavailable",
    });
    expect(!decision.recommended || !decision.recommended.overseas).toBe(true);
  });
});
