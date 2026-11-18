import { warRoomData } from "@/data/war-room";
import {
  assessRankedPlayer,
  assessReleasedPlayer,
  assessRetainedPlayer,
  assessWatchlistPlayer,
  isActionableAuctionTarget,
  isHypotheticalScenarioCandidate,
  type AssessmentOptions,
  type MarketEligibilityAssessment,
} from "./market-eligibility";

/**
 * Squad constraint constants derived authoritatively from central team data.
 * Values are NOT independently hardcoded.
 */
export const INITIAL_SQUAD_SIZE = warRoomData.team.squad_size; // 19
export const MAX_SQUAD_SIZE = warRoomData.team.max_squad_size; // 25
export const INITIAL_VACANCIES = warRoomData.team.slots_remaining; // 6
export const INITIAL_OVERSEAS_COUNT = warRoomData.team.retained_overseas_count; // 5
export const MAX_OVERSEAS_SQUAD = warRoomData.team.overseas_squad_cap; // 8
export const MAX_OVERSEAS_PLAYING_XI = warRoomData.team.max_overseas_in_playing_xi; // 4
export const INITIAL_PURSE_CRORE = warRoomData.team.purse_remaining_crore; // 27.05
export const PLAYING_XI_SIZE = 11;

/**
 * Classification of a player's acquisition status in scenario planning.
 */
export type AcquisitionStatus =
  | "RETAINED"
  | "CONFIRMED_ACQUISITION"
  | "ACTIONABLE_TARGET"
  | "CONDITIONAL_HYPOTHETICAL"
  | "DISALLOWED";

export interface CandidateClassification {
  playerName: string;
  status: AcquisitionStatus;
  isOverseas: boolean;
  role?: string | undefined;
  assessment: MarketEligibilityAssessment;
  disallowedReason?: string | undefined;
}

export interface SquadValidationInput {
  retainedPlayers?: string[] | undefined;
  hypotheticalAcquisitions?: string[] | undefined;
  confirmedAcquisitions?: string[] | undefined;
  options?: AssessmentOptions | undefined;
}

export interface SquadValidationResult {
  isValid: boolean;
  squadSize: number;
  maxSquadSize: number;
  vacanciesRemaining: number;
  retainedCount: number;
  acquisitionsCount: number;
  overseasCount: number;
  maxOverseas: number;
  overseasSlotsRemaining: number;
  retainedPlayers: string[];
  hypotheticalAcquisitions: string[];
  confirmedAcquisitions: string[];
  errors: string[];
  warnings: string[];
}

export interface RoleCoverageSummary {
  wicketkeeperCount: number;
  bowlingOptionsCount: number;
  overseasPlayers: string[];
  indianPlayers: string[];
  roleCounts: Record<string, number>;
}

export interface PlayingXIValidationInput {
  playingXI: string[];
  squadPlayers?: string[] | undefined;
  options?: AssessmentOptions | undefined;
}

export interface PlayingXIValidationResult {
  isValid: boolean;
  playerCount: number;
  requiredPlayerCount: number;
  distinctPlayerCount: number;
  overseasCount: number;
  maxOverseasInXI: number;
  playersNotInSquad: string[];
  errors: string[];
  warnings: string[];
  roleCoverage: RoleCoverageSummary;
}

export interface BenchDisplacementResult {
  startingXI: string[];
  benchPlayers: string[];
  displacedRetainedPlayers: string[];
  startingRetainedPlayers: string[];
  startingAdditions: string[];
  benchedAdditions: string[];
  summary: string;
}

export interface PlayerBid {
  playerName: string;
  amountCrore: number;
  isHypothetical?: boolean | undefined;
}

export interface PurseCalculationResult {
  isValid: boolean;
  initialPurseCrore: number;
  totalHypotheticalSpendCrore: number;
  totalConfirmedSpendCrore: number;
  totalSpendCrore: number;
  remainingPurseCrore: number;
  bids: Array<{
    playerName: string;
    amountCrore: number;
    isHypothetical: boolean;
  }>;
  errors: string[];
  warnings: string[];
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  purpose?: string | undefined;
  startingXI: string[];
  hypotheticalAdditions?: string[] | undefined;
  confirmedAdditions?: string[] | undefined;
  bids?: PlayerBid[] | undefined;
  why?: string | undefined;
  trade?: string | undefined;
  fallback?: string | undefined;
  isCustom?: boolean | undefined;
}

export interface EvaluatedScenario {
  definition: ScenarioDefinition;
  squadValidation: SquadValidationResult;
  xiValidation: PlayingXIValidationResult;
  benchDisplacement: BenchDisplacementResult;
  purseCalculation: PurseCalculationResult;
  strategicExplanation?:
    | {
        why?: string | undefined;
        trade?: string | undefined;
        fallback?: string | undefined;
      }
    | undefined;
  isCustom: boolean;
}

// Internal fast lookups
const RETAINED_MAP = new Map(warRoomData.team.retained_players.map((p) => [p.name, p]));
const WATCHLIST_MAP = new Map(warRoomData.auction_watchlist.map((p) => [p.name, p]));
const RELEASED_MAP = new Map(
  warRoomData.released_player_reference.players.map((p) => [p.player_name, p]),
);
const RANKED_BATTER_MAP = new Map(
  warRoomData.pressure_ranked_batters_top10.map((p) => [p.player_name, p]),
);
const RANKED_BOWLER_MAP = new Map(
  warRoomData.pressure_ranked_bowlers_top10.map((p) => [p.player_name, p]),
);

/**
 * Clean player name strings that contain parenthetical annotations in JSON scenarios.
 * E.g., "Nehal Wadhera (if signed)" -> "Nehal Wadhera".
 */
export function cleanPlayerName(rawName: string): string {
  return rawName.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/**
 * Resolve player profile details (overseas status, role, retained status).
 */
export function resolvePlayerDetails(name: string): {
  name: string;
  overseas: boolean;
  role?: string | undefined;
  isRetained: boolean;
} {
  const cleaned = cleanPlayerName(name);

  const retained = RETAINED_MAP.get(cleaned);
  if (retained) {
    return {
      name: cleaned,
      overseas: retained.overseas,
      role: retained.role,
      isRetained: true,
    };
  }

  const watchlist = WATCHLIST_MAP.get(cleaned);
  if (watchlist) {
    return {
      name: cleaned,
      overseas: watchlist.overseas,
      role: watchlist.role,
      isRetained: false,
    };
  }

  const released = RELEASED_MAP.get(cleaned);
  if (released) {
    return {
      name: cleaned,
      overseas: released.overseas_marked_in_pdf,
      role: undefined,
      isRetained: false,
    };
  }

  const rankedBatter = RANKED_BATTER_MAP.get(cleaned);
  if (rankedBatter) {
    return {
      name: cleaned,
      overseas: [
        "Tim David",
        "Nicholas Pooran",
        "Phil Salt",
        "Fakhar Zaman",
        "Glenn Maxwell",
      ].includes(cleaned),
      role: rankedBatter.skillset,
      isRetained: false,
    };
  }

  const rankedBowler = RANKED_BOWLER_MAP.get(cleaned);
  if (rankedBowler) {
    return {
      name: cleaned,
      overseas: [
        "Matheesha Pathirana",
        "Haris Rauf",
        "Maheesh Theekshana",
        "Mustafizur Rahman",
        "Sunil Narine",
        "Lungi Ngidi",
        "Trent Boult",
        "Shaheen Afridi",
      ].includes(cleaned),
      role: rankedBowler.skillset,
      isRetained: false,
    };
  }

  return {
    name: cleaned,
    overseas: false,
    role: undefined,
    isRetained: false,
  };
}

/**
 * Assess player eligibility using market-eligibility service.
 */
export function assessPlayerEligibility(
  playerName: string,
  options?: AssessmentOptions,
): MarketEligibilityAssessment {
  const cleaned = cleanPlayerName(playerName);

  const retained = RETAINED_MAP.get(cleaned);
  if (retained) {
    return assessRetainedPlayer(retained, options);
  }

  const watchlist = WATCHLIST_MAP.get(cleaned);
  if (watchlist) {
    return assessWatchlistPlayer(watchlist, options);
  }

  const released = RELEASED_MAP.get(cleaned);
  if (released) {
    return assessReleasedPlayer(released, options);
  }

  const rankedBatter = RANKED_BATTER_MAP.get(cleaned);
  if (rankedBatter) {
    return assessRankedPlayer(rankedBatter, options);
  }

  const rankedBowler = RANKED_BOWLER_MAP.get(cleaned);
  if (rankedBowler) {
    return assessRankedPlayer(rankedBowler, options);
  }

  // Fail-closed default for unknown player names
  return {
    playerName: cleaned,
    marketStatus: "MARKET_STATUS_UNRESOLVED",
    medicalRestriction: "NONE",
    registrationVerified: false,
    actionableTarget: false,
    hypotheticalCandidateOnly: false,
    researchPending: true,
    reason: `${cleaned} is not present in authoritative records; fails closed to MARKET_STATUS_UNRESOLVED.`,
  };
}

/**
 * Classify a candidate's acquisition status for squad planning.
 *
 * Enforces critical rules:
 * - RR-retained players are already retained and cannot be acquired at auction.
 * - Other-franchise retained players cannot be acquired.
 * - Historical ranking records (including unresolved) cannot be acquired.
 * - Released players with unverified registration remain conditional hypothetical candidates only.
 */
export function classifyCandidateAcquisition(
  playerName: string,
  options?: AssessmentOptions,
): CandidateClassification {
  const cleaned = cleanPlayerName(playerName);
  const details = resolvePlayerDetails(cleaned);
  const assessment = assessPlayerEligibility(cleaned, options);

  if (assessment.marketStatus === "RR_RETAINED") {
    return {
      playerName: cleaned,
      status: "RETAINED",
      isOverseas: details.overseas,
      role: details.role,
      assessment,
      disallowedReason: `${cleaned} is already retained by Rajasthan Royals and cannot be acquired at auction.`,
    };
  }

  if (assessment.marketStatus === "RETAINED_OTHER_FRANCHISE") {
    return {
      playerName: cleaned,
      status: "DISALLOWED",
      isOverseas: details.overseas,
      role: details.role,
      assessment,
      disallowedReason: `${cleaned} is retained by ${assessment.franchise ?? "another franchise"} and cannot be acquired.`,
    };
  }

  if (assessment.marketStatus === "UNAVAILABLE") {
    return {
      playerName: cleaned,
      status: "DISALLOWED",
      isOverseas: details.overseas,
      role: details.role,
      assessment,
      disallowedReason: `${cleaned} is unavailable for IPL 2027 following right-knee surgery and cannot be acquired.`,
    };
  }

  if (assessment.marketStatus === "INELIGIBLE_MARKET") {
    return {
      playerName: cleaned,
      status: "DISALLOWED",
      isOverseas: details.overseas,
      role: details.role,
      assessment,
      disallowedReason: `${cleaned} has retired from IPL playing (mentor role) and cannot be acquired.`,
    };
  }

  if (assessment.isHistoricalRanking || assessment.marketStatus === "MARKET_STATUS_UNRESOLVED") {
    return {
      playerName: cleaned,
      status: "DISALLOWED",
      isOverseas: details.overseas,
      role: details.role,
      assessment,
      disallowedReason: `${cleaned} is from historical ranking / research-pending data and cannot enter the acquisition pool.`,
    };
  }

  if (isActionableAuctionTarget(assessment)) {
    return {
      playerName: cleaned,
      status: "ACTIONABLE_TARGET",
      isOverseas: details.overseas,
      role: details.role,
      assessment,
    };
  }

  if (isHypotheticalScenarioCandidate(assessment)) {
    return {
      playerName: cleaned,
      status: "CONDITIONAL_HYPOTHETICAL",
      isOverseas: details.overseas,
      role: details.role,
      assessment,
    };
  }

  return {
    playerName: cleaned,
    status: "DISALLOWED",
    isOverseas: details.overseas,
    role: details.role,
    assessment,
    disallowedReason: `${cleaned} does not have valid market eligibility for acquisition.`,
  };
}

/**
 * Validate a proposed squad roster against IPL and RR 2027 constraints.
 */
export function validateSquad(input: SquadValidationInput): SquadValidationResult {
  const retainedPlayers = (
    input.retainedPlayers ?? warRoomData.team.retained_players.map((p) => p.name)
  ).map(cleanPlayerName);
  const hypotheticalAcquisitions = (input.hypotheticalAcquisitions ?? []).map(cleanPlayerName);
  const confirmedAcquisitions = (input.confirmedAcquisitions ?? []).map(cleanPlayerName);

  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Detect duplicates in the full squad
  const allSquadPlayers = [
    ...retainedPlayers,
    ...confirmedAcquisitions,
    ...hypotheticalAcquisitions,
  ];
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const name of allSquadPlayers) {
    if (seen.has(name)) {
      duplicates.add(name);
    } else {
      seen.add(name);
    }
  }

  if (duplicates.size > 0) {
    errors.push(`Duplicate player detected in squad: ${[...duplicates].join(", ")}`);
  }

  // 2. Validate proposed acquisitions
  for (const name of [...confirmedAcquisitions, ...hypotheticalAcquisitions]) {
    if (retainedPlayers.includes(name)) {
      errors.push(
        `Player "${name}" is already retained by Rajasthan Royals and cannot be added as an acquisition.`,
      );
      continue;
    }

    const classification = classifyCandidateAcquisition(name, input.options);
    if (classification.status === "DISALLOWED") {
      errors.push(
        classification.disallowedReason ??
          `Player "${name}" cannot enter the acquisition pool under current eligibility rules.`,
      );
    } else if (classification.status === "CONDITIONAL_HYPOTHETICAL") {
      warnings.push(
        `"${name}" is an unverified conditional candidate (registration not officially published).`,
      );
    }
  }

  // 3. Squad size constraints
  const squadSize = seen.size;
  const vacanciesRemaining = Math.max(0, MAX_SQUAD_SIZE - squadSize);

  if (squadSize > MAX_SQUAD_SIZE) {
    errors.push(
      `Squad size (${squadSize}) exceeds maximum allowable limit of ${MAX_SQUAD_SIZE} players.`,
    );
  }

  // 4. Overseas squad constraints
  let overseasCount = 0;
  for (const name of seen) {
    if (resolvePlayerDetails(name).overseas) {
      overseasCount++;
    }
  }

  const overseasSlotsRemaining = Math.max(0, MAX_OVERSEAS_SQUAD - overseasCount);
  if (overseasCount > MAX_OVERSEAS_SQUAD) {
    errors.push(
      `Overseas squad count (${overseasCount}) exceeds maximum allowable limit of ${MAX_OVERSEAS_SQUAD} players.`,
    );
  }

  return {
    isValid: errors.length === 0,
    squadSize,
    maxSquadSize: MAX_SQUAD_SIZE,
    vacanciesRemaining,
    retainedCount: retainedPlayers.length,
    acquisitionsCount: confirmedAcquisitions.length + hypotheticalAcquisitions.length,
    overseasCount,
    maxOverseas: MAX_OVERSEAS_SQUAD,
    overseasSlotsRemaining,
    retainedPlayers,
    hypotheticalAcquisitions,
    confirmedAcquisitions,
    errors,
    warnings,
  };
}

/**
 * Validate a playing XI selection.
 * Exactly 11 distinct players, all from scenario squad, max 4 overseas.
 */
export function validatePlayingXI(input: PlayingXIValidationInput): PlayingXIValidationResult {
  const playingXI = input.playingXI.map(cleanPlayerName);
  const squadPlayers = (
    input.squadPlayers ?? warRoomData.team.retained_players.map((p) => p.name)
  ).map(cleanPlayerName);

  const errors: string[] = [];
  const warnings: string[] = [];

  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const name of playingXI) {
    if (seen.has(name)) {
      duplicates.add(name);
    } else {
      seen.add(name);
    }
  }

  if (duplicates.size > 0) {
    errors.push(`Duplicate player detected in playing XI: ${[...duplicates].join(", ")}`);
  }

  const distinctPlayerCount = seen.size;
  if (distinctPlayerCount !== PLAYING_XI_SIZE) {
    errors.push(
      `Playing XI must contain exactly ${PLAYING_XI_SIZE} distinct players (found ${distinctPlayerCount}).`,
    );
  }

  // Check squad membership
  const squadSet = new Set(squadPlayers);
  const playersNotInSquad: string[] = [];

  for (const name of seen) {
    if (!squadSet.has(name)) {
      playersNotInSquad.push(name);
      errors.push(
        `Player "${name}" is not in the scenario squad and cannot be selected in the playing XI.`,
      );
    }
  }

  // Count overseas starters and role coverage
  let overseasCount = 0;
  const overseasPlayers: string[] = [];
  const indianPlayers: string[] = [];
  let wicketkeeperCount = 0;
  let bowlingOptionsCount = 0;
  const roleCounts: Record<string, number> = {};

  for (const name of seen) {
    const details = resolvePlayerDetails(name);
    if (details.overseas) {
      overseasCount++;
      overseasPlayers.push(name);
    } else {
      indianPlayers.push(name);
    }

    const role = (details.role ?? "").toLowerCase();
    if (role.includes("wicketkeeper") || name === "Dhruv Jurel" || name === "Donovan Ferreira") {
      wicketkeeperCount++;
    }
    if (
      role.includes("fast") ||
      role.includes("spin") ||
      role.includes("bowler") ||
      role.includes("all-rounder")
    ) {
      bowlingOptionsCount++;
    }

    const roleKey = details.role ?? "Unspecified role";
    roleCounts[roleKey] = (roleCounts[roleKey] ?? 0) + 1;
  }

  if (overseasCount > MAX_OVERSEAS_PLAYING_XI) {
    errors.push(
      `Playing XI contains ${overseasCount} overseas players, exceeding the maximum limit of ${MAX_OVERSEAS_PLAYING_XI}.`,
    );
  }

  // Helpful informative warnings without inventing mandatory quotas
  if (wicketkeeperCount === 0) {
    warnings.push("Playing XI has no identified wicketkeeper option.");
  }
  if (bowlingOptionsCount < 5) {
    warnings.push(
      `Playing XI has only ${bowlingOptionsCount} identified bowling options; standard T20 balance typically deploys at least 5.`,
    );
  }

  return {
    isValid: errors.length === 0,
    playerCount: playingXI.length,
    requiredPlayerCount: PLAYING_XI_SIZE,
    distinctPlayerCount,
    overseasCount,
    maxOverseasInXI: MAX_OVERSEAS_PLAYING_XI,
    playersNotInSquad,
    errors,
    warnings,
    roleCoverage: {
      wicketkeeperCount,
      bowlingOptionsCount,
      overseasPlayers,
      indianPlayers,
      roleCounts,
    },
  };
}

/**
 * Calculate bench displacement when a playing XI is selected from a scenario squad.
 */
export function calculateBenchDisplacement(
  playingXI: string[],
  squadPlayers?: string[] | undefined,
  retainedPlayers?: string[] | undefined,
): BenchDisplacementResult {
  const cleanedXI = playingXI.map(cleanPlayerName);
  const xiSet = new Set(cleanedXI);

  const retained = (retainedPlayers ?? warRoomData.team.retained_players.map((p) => p.name)).map(
    cleanPlayerName,
  );
  const retainedSet = new Set(retained);

  const allSquad = (squadPlayers ?? retained).map(cleanPlayerName);

  const benchPlayers = allSquad.filter((name) => !xiSet.has(name));
  const startingRetainedPlayers = cleanedXI.filter((name) => retainedSet.has(name));
  const displacedRetainedPlayers = retained.filter((name) => !xiSet.has(name));
  const startingAdditions = cleanedXI.filter((name) => !retainedSet.has(name));
  const benchedAdditions = benchPlayers.filter((name) => !retainedSet.has(name));

  const summary = `${cleanedXI.length} starters (${startingRetainedPlayers.length} retained, ${startingAdditions.length} additions). ${displacedRetainedPlayers.length} retained players displaced to the bench. ${benchedAdditions.length} additions on the bench.`;

  return {
    startingXI: cleanedXI,
    benchPlayers,
    displacedRetainedPlayers,
    startingRetainedPlayers,
    startingAdditions,
    benchedAdditions,
    summary,
  };
}

/**
 * Calculate scenario purse consequences.
 *
 * Requirements:
 * - Never invent prices or assign automatic bids.
 * - Selecting a player without entering a bid does NOT reduce the purse.
 * - Only subtracts explicitly provided finite non-negative bid amounts.
 * - Rejects bids exceeding available purse.
 * - Distinguishes hypothetical spending from confirmed auction expenditure.
 */
export function calculatePurse(
  bids: PlayerBid[],
  initialPurseCrore: number = INITIAL_PURSE_CRORE,
): PurseCalculationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let totalHypotheticalSpendCrore = 0;
  let totalConfirmedSpendCrore = 0;

  const sanitizedBids: Array<{
    playerName: string;
    amountCrore: number;
    isHypothetical: boolean;
  }> = [];

  for (const bid of bids) {
    const name = cleanPlayerName(bid.playerName);
    const amount = bid.amountCrore;
    const isHypothetical = bid.isHypothetical !== false;

    if (!Number.isFinite(amount)) {
      errors.push(`Bid for "${name}" must be a finite number.`);
      continue;
    }

    if (amount < 0) {
      errors.push(`Bid for "${name}" cannot be negative (entered ₹${amount} Cr).`);
      continue;
    }

    if (isHypothetical) {
      totalHypotheticalSpendCrore += amount;
    } else {
      totalConfirmedSpendCrore += amount;
    }

    sanitizedBids.push({
      playerName: name,
      amountCrore: amount,
      isHypothetical,
    });
  }

  const totalSpendCrore = totalHypotheticalSpendCrore + totalConfirmedSpendCrore;
  const remainingPurseCrore = Number((initialPurseCrore - totalSpendCrore).toFixed(2));

  if (totalSpendCrore > initialPurseCrore) {
    errors.push(
      `Total bids of ₹${totalSpendCrore.toFixed(2)} Cr exceed available purse of ₹${initialPurseCrore.toFixed(2)} Cr.`,
    );
  }

  if (totalHypotheticalSpendCrore > 0) {
    warnings.push(
      `Includes ₹${totalHypotheticalSpendCrore.toFixed(2)} Cr in hypothetical/unverified bid models; not confirmed expenditure.`,
    );
  }

  return {
    isValid: errors.length === 0,
    initialPurseCrore,
    totalHypotheticalSpendCrore: Number(totalHypotheticalSpendCrore.toFixed(2)),
    totalConfirmedSpendCrore: Number(totalConfirmedSpendCrore.toFixed(2)),
    totalSpendCrore: Number(totalSpendCrore.toFixed(2)),
    remainingPurseCrore,
    bids: sanitizedBids,
    errors,
    warnings,
  };
}

/**
 * Pure evaluation function for a complete squad scenario.
 *
 * Rules:
 * - Custom lineups do NOT inherit stale strategic explanations from predefined scenarios.
 */
export function evaluateSquadScenario(scenario: ScenarioDefinition): EvaluatedScenario {
  const isCustom = Boolean(scenario.isCustom);
  const hypotheticalAdditions = scenario.hypotheticalAdditions ?? [];
  const confirmedAdditions = scenario.confirmedAdditions ?? [];

  const squadValidation = validateSquad({
    hypotheticalAcquisitions: hypotheticalAdditions,
    confirmedAcquisitions: confirmedAdditions,
  });

  const fullSquad = [
    ...squadValidation.retainedPlayers,
    ...confirmedAdditions,
    ...hypotheticalAdditions,
  ];

  const xiValidation = validatePlayingXI({
    playingXI: scenario.startingXI,
    squadPlayers: fullSquad,
  });

  const benchDisplacement = calculateBenchDisplacement(
    scenario.startingXI,
    fullSquad,
    squadValidation.retainedPlayers,
  );

  const purseCalculation = calculatePurse(scenario.bids ?? []);

  const strategicExplanation = isCustom
    ? undefined
    : {
        why: scenario.why,
        trade: scenario.trade,
        fallback: scenario.fallback,
      };

  return {
    definition: scenario,
    squadValidation,
    xiValidation,
    benchDisplacement,
    purseCalculation,
    strategicExplanation,
    isCustom,
  };
}

/**
 * Documentation of inconsistencies identified between JSON scenarios and UI scenarios.
 */
export interface ScenarioInconsistencyReport {
  jsonScenariosCount: number;
  uiScenariosCount: number;
  differences: string[];
}

export function getScenarioInconsistencies(): ScenarioInconsistencyReport {
  return {
    jsonScenariosCount: warRoomData.lineup_scenarios.length, // 4
    uiScenariosCount: 8, // 8 scenarios in pages.tsx
    differences: [
      "rr-2027-data.json defines 4 scenarios (pp_swing, death_strike, balanced, variation) with raw player strings including target conditions like 'Nehal Wadhera (if signed)' and 'Trent Boult (if signed)'.",
      "pages.tsx defines 8 distinct scenarios (balanced, boult, death, mustafizur, spin, repair, overseas, highscore) with clean name arrays and specialized strategic fields (title, why, trade, newBall, middle, death, batImpact, bowlImpact, fallback).",
      "Scenario IDs diverge between sources: 'pp_swing' in JSON corresponds conceptually to 'boult' in pages.tsx, 'death_strike' corresponds to 'death', and 'variation' corresponds to 'mustafizur'.",
      "The domain engine provides cleanPlayerName() and a polymorphic ScenarioDefinition interface so Task 03 can integrate both sources cleanly without duplication.",
    ],
  };
}
