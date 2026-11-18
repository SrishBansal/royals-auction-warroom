import type {
  BatterRank,
  BowlerRank,
  ReleasedPlayer,
  RetainedPlayer,
  WatchlistPlayer,
} from "@/data/war-room";

/**
 * Authoritative market eligibility statuses for IPL 2027 decision support.
 */
export type MarketStatus =
  | "RR_RETAINED"
  | "RETAINED_OTHER_FRANCHISE"
  | "RELEASED_REGISTRATION_UNVERIFIED"
  | "AUCTION_REGISTERED"
  | "UNAVAILABLE"
  | "INELIGIBLE_MARKET"
  | "MARKET_STATUS_UNRESOLVED";

/**
 * Independent medical restriction status.
 * Medical review is tracked separately so that medical status never erases
 * underlying market or auction registration status.
 */
export type MedicalRestriction = "NONE" | "MEDICAL_REVIEW";

/**
 * Comprehensive market eligibility assessment record for a player.
 */
export interface MarketEligibilityAssessment {
  playerName: string;
  marketStatus: MarketStatus;
  medicalRestriction: MedicalRestriction;
  registrationVerified: boolean;
  actionableTarget: boolean;
  hypotheticalCandidateOnly: boolean;
  researchPending?: boolean | undefined;
  isHistoricalRanking?: boolean | undefined;
  reason: string;
  franchise?: string | null | undefined;
  workloadWarning?: boolean | undefined;
  notes?: string | undefined;
}

/**
 * Analyst scenario options.
 * NOTE: Domain rules strictly prohibit analyst checkboxes, manual overrides,
 * or scenario assumptions from granting actual medical clearance, clearing
 * official workload warnings, or verifying auction registration.
 */
export interface AssessmentOptions {
  analystClearedMedical?: boolean | undefined;
  analystWorkloadAssumed?: boolean | undefined;
}

/**
 * Candidates with explicit source-documented medical review requirements.
 */
export const MEDICAL_REVIEW_PLAYERS = new Set<string>([
  "Matheesha Pathirana",
  "Mustafizur Rahman",
  "Wanindu Hasaranga",
]);

/**
 * Candidates with explicit source-documented workload / availability warnings.
 */
export const WORKLOAD_WARNING_PLAYERS = new Set<string>(["Mitchell Starc", "Wanindu Hasaranga"]);

/**
 * Determine whether a player can be recommended as an actionable auction target.
 *
 * Rules:
 * - Only players with explicitly verified auction registration from authoritative recruitment records can be actionable.
 * - Historical P1 ranking records must never establish recruitment actionability.
 * - RR retained players and other franchise retained players are never auction targets.
 * - Players requiring medical review are not actionable until official clearance exists.
 * - Players with workload opt-out / unconfirmed availability are non-actionable.
 * - Unavailable, market-ineligible, or unresolved players are never actionable.
 */
export function isActionableAuctionTarget(assessment: MarketEligibilityAssessment): boolean {
  if (assessment.isHistoricalRanking) {
    return false;
  }
  if (assessment.marketStatus !== "AUCTION_REGISTERED") {
    return false;
  }
  if (!assessment.registrationVerified) {
    return false;
  }
  if (assessment.medicalRestriction === "MEDICAL_REVIEW") {
    return false;
  }
  if (assessment.workloadWarning) {
    return false;
  }
  return true;
}

/**
 * Determine whether a player can only appear as a conditional hypothetical scenario candidate.
 *
 * Rules:
 * - Historical ranking records do not independently become squad acquisition candidates.
 * - Fully actionable targets are not restricted to hypothetical-only.
 * - Retained players, permanently unavailable players, retired/mentor players,
 *   and unresolved players cannot be selectable auction candidates under any scenario.
 * - Conditionally researched released players with unverified registration or
 *   pending medical review can only be discussed in conditional hypothetical scenarios.
 */
export function isHypotheticalScenarioCandidate(assessment: MarketEligibilityAssessment): boolean {
  if (assessment.isHistoricalRanking) {
    return false;
  }
  if (isActionableAuctionTarget(assessment)) {
    return false;
  }
  if (
    assessment.marketStatus === "RR_RETAINED" ||
    assessment.marketStatus === "RETAINED_OTHER_FRANCHISE" ||
    assessment.marketStatus === "UNAVAILABLE" ||
    assessment.marketStatus === "INELIGIBLE_MARKET" ||
    assessment.marketStatus === "MARKET_STATUS_UNRESOLVED"
  ) {
    return false;
  }
  return (
    assessment.marketStatus === "RELEASED_REGISTRATION_UNVERIFIED" ||
    (assessment.marketStatus === "AUCTION_REGISTERED" &&
      assessment.medicalRestriction === "MEDICAL_REVIEW")
  );
}

/**
 * Determine whether a player is in the historical research / research-pending category.
 * Unresolved players appear in research-pending and historical performance views,
 * but are not selectable as auction acquisitions.
 */
export function isResearchPendingCandidate(assessment: MarketEligibilityAssessment): boolean {
  return assessment.marketStatus === "MARKET_STATUS_UNRESOLVED";
}

/**
 * Return a clear human-readable reason for the eligibility status.
 */
export function getEligibilityReason(assessment: MarketEligibilityAssessment): string {
  return assessment.reason;
}

/**
 * Assess a Rajasthan Royals retained player.
 * All 19 retained players are locked to the RR roster and are never auction targets.
 */
export function assessRetainedPlayer(
  player: RetainedPlayer,
  _options?: AssessmentOptions,
): MarketEligibilityAssessment {
  const assessment: MarketEligibilityAssessment = {
    playerName: player.name,
    marketStatus: "RR_RETAINED",
    medicalRestriction: "NONE",
    registrationVerified: false,
    actionableTarget: false,
    hypotheticalCandidateOnly: false,
    researchPending: false,
    isHistoricalRanking: false,
    franchise: "Rajasthan Royals",
    workloadWarning: false,
    reason: `${player.name} is retained by Rajasthan Royals for IPL 2027 and is not an auction target.`,
    notes: player.lineup_role,
  };
  return assessment;
}

/**
 * Assess a player from the 89-entry released reference register.
 *
 * Registration counts in the supplied 89-player released pool:
 * - 86 registration-unverified released players (including the medical-review subset)
 * - 1 unavailable player (Jacob Bethell)
 * - 1 workload/availability-unconfirmed player (Mitchell Starc)
 * - 1 retired/mentor player (MS Dhoni)
 */
export function assessReleasedPlayer(
  player: ReleasedPlayer,
  options?: AssessmentOptions,
): MarketEligibilityAssessment {
  const name = player.player_name;
  const isDhoni = name === "MS Dhoni" || player.availability_status === "retired_ipl_player_mentor";
  const isBethell =
    name === "Jacob Bethell" || player.availability_status === "released_unavailable_2027_medical";
  const isStarc =
    name === "Mitchell Starc" ||
    player.availability_status === "released_availability_unconfirmed_workload";

  // Check registration status - defaults to unverified unless explicit verified flag exists
  const registrationVerified = Boolean(player.auction_registration_verified);

  if (isDhoni) {
    return {
      playerName: name,
      marketStatus: "INELIGIBLE_MARKET",
      medicalRestriction: "NONE",
      registrationVerified: false,
      actionableTarget: false,
      hypotheticalCandidateOnly: false,
      researchPending: false,
      isHistoricalRanking: false,
      franchise: player.released_from_franchise,
      workloadWarning: false,
      reason: `${name} has retired from IPL playing (CSK mentor role) and is ineligible as an auction playing target.`,
      notes: player.note,
    };
  }

  if (isBethell) {
    return {
      playerName: name,
      marketStatus: "UNAVAILABLE",
      medicalRestriction: "NONE",
      registrationVerified: false,
      actionableTarget: false,
      hypotheticalCandidateOnly: false,
      researchPending: false,
      isHistoricalRanking: false,
      franchise: player.released_from_franchise,
      workloadWarning: false,
      reason: `${name} is unavailable for IPL 2027 following right-knee surgery; excluded from all auction targets.`,
      notes: player.note,
    };
  }

  // Workload warning remains true even under analyst scenario assumption
  const hasWorkloadWarning = isStarc || WORKLOAD_WARNING_PLAYERS.has(name);
  const requiresMedicalReview = MEDICAL_REVIEW_PLAYERS.has(name);
  const medicalRestriction: MedicalRestriction = requiresMedicalReview ? "MEDICAL_REVIEW" : "NONE";

  const marketStatus: MarketStatus = registrationVerified
    ? "AUCTION_REGISTERED"
    : "RELEASED_REGISTRATION_UNVERIFIED";

  const assessment: MarketEligibilityAssessment = {
    playerName: name,
    marketStatus,
    medicalRestriction,
    registrationVerified,
    actionableTarget: false,
    hypotheticalCandidateOnly: false,
    researchPending: false,
    isHistoricalRanking: false,
    franchise: player.released_from_franchise,
    workloadWarning: hasWorkloadWarning,
    notes: player.note,
    reason: "",
  };

  assessment.actionableTarget = isActionableAuctionTarget(assessment);
  assessment.hypotheticalCandidateOnly = isHypotheticalScenarioCandidate(assessment);

  if (isStarc) {
    const workloadNotice = options?.analystWorkloadAssumed
      ? " (Analyst workload assumption cannot clear official workload warnings or verify auction registration)."
      : "";
    assessment.reason = `${name} is released by ${player.released_from_franchise} with reported workload opt-out and availability concerns; registration unverified and non-actionable${workloadNotice}.`;
  } else if (requiresMedicalReview) {
    const analystNote = options?.analystClearedMedical
      ? " (Analyst scenario assumption does not constitute official medical clearance or registration)."
      : "";
    assessment.reason = `${name} is released by ${player.released_from_franchise}; auction registration is unverified and medical review is required${analystNote}.`;
  } else if (registrationVerified) {
    assessment.reason = `${name} is officially registered for auction.`;
  } else {
    assessment.reason = `${name} is released by ${player.released_from_franchise}; auction registration is unverified.`;
  }

  return assessment;
}

/**
 * Assess a player from the recruitment auction watchlist.
 * Applies RELEASED_REGISTRATION_UNVERIFIED only because the supplied data explicitly
 * establishes released status for these candidates.
 */
export function assessWatchlistPlayer(
  player: WatchlistPlayer,
  options?: AssessmentOptions,
): MarketEligibilityAssessment {
  const name = player.name;

  if (name === "Jacob Bethell" || player.availability_class === "Unavailable for IPL 2027") {
    return {
      playerName: name,
      marketStatus: "UNAVAILABLE",
      medicalRestriction: "NONE",
      registrationVerified: false,
      actionableTarget: false,
      hypotheticalCandidateOnly: false,
      researchPending: false,
      isHistoricalRanking: false,
      franchise: player.team_released_from,
      workloadWarning: false,
      reason: `${name} is unavailable for IPL 2027 following right-knee surgery; excluded from all auction targets.`,
      notes: player.role_fit,
    };
  }

  const isStarc =
    name === "Mitchell Starc" || Boolean(player.availability_class?.includes("workload"));
  // Workload warning remains true even under analyst scenario assumption
  const hasWorkloadWarning = isStarc || WORKLOAD_WARNING_PLAYERS.has(name);
  const requiresMedicalReview = MEDICAL_REVIEW_PLAYERS.has(name);

  // In the supplied data snapshot, NO watchlist player has verified auction registration.
  // Missing registration evidence must default to unverified.
  const registrationVerified = false;

  const marketStatus: MarketStatus = "RELEASED_REGISTRATION_UNVERIFIED";
  const medicalRestriction: MedicalRestriction = requiresMedicalReview ? "MEDICAL_REVIEW" : "NONE";

  const assessment: MarketEligibilityAssessment = {
    playerName: name,
    marketStatus,
    medicalRestriction,
    registrationVerified,
    actionableTarget: false, // Always false under supplied watchlist data
    hypotheticalCandidateOnly: true,
    researchPending: false,
    isHistoricalRanking: false,
    franchise: player.team_released_from,
    workloadWarning: hasWorkloadWarning,
    notes: player.role_fit,
    reason: "",
  };

  if (isStarc) {
    const workloadNotice = options?.analystWorkloadAssumed
      ? " (Analyst workload assumption cannot clear official workload warnings or verify auction registration)."
      : "";
    assessment.reason = `${name} has reported workload opt-out and availability concerns; registration unverified and non-actionable under supplied status${workloadNotice}.`;
  } else if (requiresMedicalReview) {
    const overrideNotice = options?.analystClearedMedical
      ? " (Analyst scenario checkbox does not constitute official medical clearance or auction registration)."
      : "";
    assessment.reason = `${name} requires independent medical review; auction registration is unverified${overrideNotice}.`;
  } else {
    assessment.reason = `${name} is a conditionally researched candidate whose auction registration is unverified; available for hypothetical planning only.`;
  }

  return assessment;
}

/**
 * Assess a historical pressure-ranked player (top 10 batters or bowlers).
 *
 * Rules:
 * - Historical P1 ranking records must NEVER independently establish:
 *   1. Auction registration eligibility.
 *   2. Actionable recruitment status.
 *   3. Squad acquisition eligibility.
 * - RR retained players and other franchise retained players are never auction targets.
 * - Only explicit franchiseStatus === "released" receives RELEASED_REGISTRATION_UNVERIFIED,
 *   and even then remains historical performance data only, not an acquisition candidate.
 * - Missing, unexpected or unsupported status values fail closed to MARKET_STATUS_UNRESOLVED,
 *   remaining non-actionable and non-selectable.
 */
export function assessRankedPlayer(
  player: BatterRank | BowlerRank | (Record<string, unknown> & { player_name: string }),
  _options?: AssessmentOptions,
): MarketEligibilityAssessment {
  const name = player.player_name;
  const franchiseStatus = (player as { franchise_status?: unknown }).franchise_status;
  const franchise = (player as { franchise?: string | null }).franchise;

  if (franchiseStatus === "retained") {
    if (franchise === "RR") {
      return {
        playerName: name,
        marketStatus: "RR_RETAINED",
        medicalRestriction: "NONE",
        registrationVerified: false,
        actionableTarget: false,
        hypotheticalCandidateOnly: false,
        researchPending: false,
        isHistoricalRanking: true,
        franchise: "Rajasthan Royals",
        workloadWarning: false,
        reason: `${name} is retained by Rajasthan Royals; historical P1 ranking is performance data only.`,
        notes: (player as { rr_fit_interpretation?: string }).rr_fit_interpretation,
      };
    }

    return {
      playerName: name,
      marketStatus: "RETAINED_OTHER_FRANCHISE",
      medicalRestriction: "NONE",
      registrationVerified: false,
      actionableTarget: false,
      hypotheticalCandidateOnly: false,
      researchPending: false,
      isHistoricalRanking: true,
      franchise: franchise ?? "Other Franchise",
      workloadWarning: false,
      reason: `${name} is retained by ${franchise ?? "another franchise"}; cannot be an auction target.`,
      notes: (player as { availability_summary?: string }).availability_summary,
    };
  }

  // Explicit check for released status: ONLY franchiseStatus === "released" qualifies
  if (franchiseStatus === "released") {
    const requiresMedicalReview = MEDICAL_REVIEW_PLAYERS.has(name);
    const medicalRestriction: MedicalRestriction = requiresMedicalReview
      ? "MEDICAL_REVIEW"
      : "NONE";
    const hasWorkloadWarning = WORKLOAD_WARNING_PLAYERS.has(name);

    // Ranking data cannot independently establish verified registration or squad acquisition eligibility
    return {
      playerName: name,
      marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
      medicalRestriction,
      registrationVerified: false,
      actionableTarget: false,
      hypotheticalCandidateOnly: false, // Ranking records do not independently become acquisition candidates
      researchPending: false,
      isHistoricalRanking: true,
      franchise: franchise ?? null,
      workloadWarning: hasWorkloadWarning,
      notes: (player as { availability_summary?: string }).availability_summary,
      reason: `${name} is released by ${franchise ?? "franchise"} in historical ranking records; historical P1 ranking does not independently establish squad acquisition eligibility or verified auction registration.`,
    };
  }

  // Fail-closed default: franchiseStatus === "unresolved", missing, unexpected, or unsupported values
  return {
    playerName: name,
    marketStatus: "MARKET_STATUS_UNRESOLVED",
    medicalRestriction: "NONE",
    registrationVerified: false,
    actionableTarget: false,
    hypotheticalCandidateOnly: false,
    researchPending: true,
    isHistoricalRanking: true,
    franchise: null,
    workloadWarning: false,
    notes: (player as { availability_summary?: string }).availability_summary,
    reason: `${name} has an unresolved or unverified franchise status in historical ranking data; fails closed to MARKET_STATUS_UNRESOLVED, non-actionable, and not selectable as an auction acquisition (historical research / research-pending only).`,
  };
}

/**
 * Synthetic fixture input for testing actionability transitions.
 * Purely for unit testing; never added to production data.
 */
export interface SyntheticPlayerInput {
  playerName: string;
  marketStatus?: MarketStatus | undefined;
  auctionRegistrationVerified?: boolean | undefined;
  medicalRestriction?: MedicalRestriction | undefined;
  workloadWarning?: boolean | undefined;
  franchise?: string | null | undefined;
  notes?: string | undefined;
  researchPending?: boolean | undefined;
  isHistoricalRanking?: boolean | undefined;
}

/**
 * Assess a synthetic player fixture for testing explicit positive and edge-case transitions.
 */
export function assessSyntheticRecord(input: SyntheticPlayerInput): MarketEligibilityAssessment {
  const isHistoricalRanking = Boolean(input.isHistoricalRanking);
  const registrationVerified = isHistoricalRanking
    ? false
    : Boolean(input.auctionRegistrationVerified);
  const marketStatus: MarketStatus =
    input.marketStatus ??
    (registrationVerified ? "AUCTION_REGISTERED" : "RELEASED_REGISTRATION_UNVERIFIED");
  const medicalRestriction: MedicalRestriction = input.medicalRestriction ?? "NONE";
  const workloadWarning = Boolean(input.workloadWarning);
  const researchPending = input.researchPending ?? marketStatus === "MARKET_STATUS_UNRESOLVED";

  const assessment: MarketEligibilityAssessment = {
    playerName: input.playerName,
    marketStatus,
    medicalRestriction,
    registrationVerified,
    actionableTarget: false,
    hypotheticalCandidateOnly: false,
    researchPending,
    isHistoricalRanking,
    franchise: input.franchise ?? null,
    workloadWarning,
    notes: input.notes,
    reason: "",
  };

  assessment.actionableTarget = isActionableAuctionTarget(assessment);
  assessment.hypotheticalCandidateOnly = isHypotheticalScenarioCandidate(assessment);

  if (assessment.actionableTarget) {
    assessment.reason = `${input.playerName} has verified auction registration with no blocking medical or workload restrictions; actionable auction target.`;
  } else if (assessment.marketStatus === "MARKET_STATUS_UNRESOLVED") {
    assessment.reason = `${input.playerName} has unresolved market status; non-actionable and not selectable as an auction acquisition (research pending).`;
  } else if (isHistoricalRanking) {
    assessment.reason = `${input.playerName} is a historical ranking record and cannot independently establish acquisition eligibility.`;
  } else if (assessment.hypotheticalCandidateOnly) {
    assessment.reason = `${input.playerName} is available as a conditional hypothetical scenario candidate only.`;
  } else {
    assessment.reason = `${input.playerName} is ineligible as an auction target (${marketStatus}).`;
  }

  return assessment;
}
