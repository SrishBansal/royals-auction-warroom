import { describe, expect, it } from "vitest";
import { warRoomData } from "@/data/war-room";
import {
  assessRankedPlayer,
  assessReleasedPlayer,
  assessRetainedPlayer,
  assessSyntheticRecord,
  assessWatchlistPlayer,
  getEligibilityReason,
  isActionableAuctionTarget,
  isHypotheticalScenarioCandidate,
  isResearchPendingCandidate,
  MEDICAL_REVIEW_PLAYERS,
} from "./market-eligibility";

describe("Market Eligibility Domain Service", () => {
  it("Requirement 1: correctly classifies all 19 RR retained players", () => {
    const retained = warRoomData.team.retained_players;
    expect(retained).toHaveLength(19);

    for (const player of retained) {
      const assessment = assessRetainedPlayer(player);

      expect(assessment.playerName).toBe(player.name);
      expect(assessment.marketStatus).toBe("RR_RETAINED");
      expect(assessment.medicalRestriction).toBe("NONE");
      expect(assessment.registrationVerified).toBe(false);
      expect(assessment.actionableTarget).toBe(false);
      expect(assessment.hypotheticalCandidateOnly).toBe(false);
      expect(assessment.researchPending).toBe(false);
      expect(assessment.franchise).toBe("Rajasthan Royals");
      expect(isActionableAuctionTarget(assessment)).toBe(false);
      expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
      expect(getEligibilityReason(assessment)).toContain("retained by Rajasthan Royals");
    }
  });

  it("Requirement 2: other-franchise retained players cannot be actionable targets", () => {
    const batters = warRoomData.pressure_ranked_batters_top10;
    const bowlers = warRoomData.pressure_ranked_bowlers_top10;
    const allRanked = [...batters, ...bowlers];

    const otherRetained = allRanked.filter(
      (p) => p.franchise_status === "retained" && p.franchise !== "RR",
    );

    expect(otherRetained.length).toBeGreaterThan(0);

    for (const player of otherRetained) {
      const assessment = assessRankedPlayer(player);

      expect(assessment.marketStatus).toBe("RETAINED_OTHER_FRANCHISE");
      expect(assessment.franchise).toBe(player.franchise);
      expect(assessment.actionableTarget).toBe(false);
      expect(assessment.hypotheticalCandidateOnly).toBe(false);
      expect(isActionableAuctionTarget(assessment)).toBe(false);
      expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
      expect(getEligibilityReason(assessment)).toContain("cannot be an auction target");
    }

    // Explicitly verify known marquee stars retained elsewhere
    const bumrah = bowlers.find((p) => p.player_name === "Jasprit Bumrah");
    const david = batters.find((p) => p.player_name === "Tim David");
    const surya = batters.find((p) => p.player_name === "Suryakumar Yadav");

    expect(bumrah).toBeDefined();
    expect(david).toBeDefined();
    expect(surya).toBeDefined();

    expect(isActionableAuctionTarget(assessRankedPlayer(bumrah!))).toBe(false);
    expect(isActionableAuctionTarget(assessRankedPlayer(david!))).toBe(false);
    expect(isActionableAuctionTarget(assessRankedPlayer(surya!))).toBe(false);
  });

  it("Requirement 3 & 6: all 89 released-player records retain their supplied registration status with exact count documentation", () => {
    const released = warRoomData.released_player_reference.players;
    expect(released).toHaveLength(89);

    // Verify exact data counts per specification:
    // - 86 registration-unverified released players, including the medical-review subset
    // - 1 unavailable player (Bethell)
    // - 1 workload/availability-unconfirmed player (Starc)
    // - 1 retired player (Dhoni)
    const unverifiedPool = released.filter(
      (p) => p.availability_status === "released_registration_unverified",
    );
    const unavailablePool = released.filter(
      (p) => p.availability_status === "released_unavailable_2027_medical",
    );
    const workloadPool = released.filter(
      (p) => p.availability_status === "released_availability_unconfirmed_workload",
    );
    const retiredPool = released.filter(
      (p) => p.availability_status === "retired_ipl_player_mentor",
    );

    expect(unverifiedPool).toHaveLength(86);
    expect(unavailablePool).toHaveLength(1);
    expect(workloadPool).toHaveLength(1);
    expect(retiredPool).toHaveLength(1);
    expect(
      unverifiedPool.length + unavailablePool.length + workloadPool.length + retiredPool.length,
    ).toBe(89);

    // Verify the medical-review subset within the 86 unverified released players
    const medicalSubsetInReleased = unverifiedPool.filter((p) =>
      MEDICAL_REVIEW_PLAYERS.has(p.player_name),
    );
    expect(medicalSubsetInReleased.map((p) => p.player_name)).toEqual(
      expect.arrayContaining(["Matheesha Pathirana", "Mustafizur Rahman", "Wanindu Hasaranga"]),
    );
    expect(medicalSubsetInReleased).toHaveLength(3);

    for (const player of released) {
      const assessment = assessReleasedPlayer(player);

      // Registration is unverified across the entire supplied release pool
      expect(assessment.registrationVerified).toBe(false);
      expect(assessment.actionableTarget).toBe(false);
      expect(isActionableAuctionTarget(assessment)).toBe(false);

      if (player.player_name === "Jacob Bethell") {
        expect(assessment.marketStatus).toBe("UNAVAILABLE");
        expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
      } else if (player.player_name === "MS Dhoni") {
        expect(assessment.marketStatus).toBe("INELIGIBLE_MARKET");
        expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
      } else if (player.player_name === "Mitchell Starc") {
        expect(assessment.marketStatus).toBe("RELEASED_REGISTRATION_UNVERIFIED");
        expect(assessment.workloadWarning).toBe(true);
        expect(isHypotheticalScenarioCandidate(assessment)).toBe(true);
      } else {
        expect(assessment.marketStatus).toBe("RELEASED_REGISTRATION_UNVERIFIED");
        expect(isHypotheticalScenarioCandidate(assessment)).toBe(true);
      }

      // Check that medical review status is tracked independently without erasing market status
      if (MEDICAL_REVIEW_PLAYERS.has(player.player_name)) {
        expect(assessment.medicalRestriction).toBe("MEDICAL_REVIEW");
        expect(assessment.marketStatus).toBe("RELEASED_REGISTRATION_UNVERIFIED");
      }
    }
  });

  it("Requirement 4: the three medical-review candidates cannot become actionable merely through analyst input", () => {
    const watchlist = warRoomData.auction_watchlist;
    const medicalCandidates = ["Matheesha Pathirana", "Mustafizur Rahman", "Wanindu Hasaranga"];

    for (const name of medicalCandidates) {
      const player = watchlist.find((p) => p.name === name);
      expect(player).toBeDefined();

      // Default baseline assessment
      const baseline = assessWatchlistPlayer(player!);
      expect(baseline.medicalRestriction).toBe("MEDICAL_REVIEW");
      expect(baseline.registrationVerified).toBe(false);
      expect(baseline.marketStatus).toBe("RELEASED_REGISTRATION_UNVERIFIED");
      expect(isActionableAuctionTarget(baseline)).toBe(false);
      expect(isHypotheticalScenarioCandidate(baseline)).toBe(true);

      // Analyst scenario input attempting to clear medical review
      const analystSimulation = assessWatchlistPlayer(player!, {
        analystClearedMedical: true,
      });

      // An analyst checkbox or manual input CANNOT confer verified auction registration or make them actionable
      expect(analystSimulation.registrationVerified).toBe(false);
      expect(analystSimulation.marketStatus).toBe("RELEASED_REGISTRATION_UNVERIFIED");
      expect(isActionableAuctionTarget(analystSimulation)).toBe(false);
      expect(analystSimulation.actionableTarget).toBe(false);
      expect(isHypotheticalScenarioCandidate(analystSimulation)).toBe(true);
      expect(getEligibilityReason(analystSimulation)).toContain(
        "Analyst scenario checkbox does not constitute official medical clearance",
      );
    }
  });

  it("Requirement 5: Jacob Bethell remains unavailable for IPL 2027", () => {
    const bethellWatchlist = warRoomData.auction_watchlist.find((p) => p.name === "Jacob Bethell");
    const bethellReleased = warRoomData.released_player_reference.players.find(
      (p) => p.player_name === "Jacob Bethell",
    );

    expect(bethellWatchlist).toBeDefined();
    expect(bethellReleased).toBeDefined();

    const fromWatchlist = assessWatchlistPlayer(bethellWatchlist!);
    expect(fromWatchlist.marketStatus).toBe("UNAVAILABLE");
    expect(fromWatchlist.actionableTarget).toBe(false);
    expect(fromWatchlist.hypotheticalCandidateOnly).toBe(false);
    expect(isActionableAuctionTarget(fromWatchlist)).toBe(false);
    expect(isHypotheticalScenarioCandidate(fromWatchlist)).toBe(false);
    expect(getEligibilityReason(fromWatchlist)).toContain("unavailable for IPL 2027");

    const fromReleased = assessReleasedPlayer(bethellReleased!);
    expect(fromReleased.marketStatus).toBe("UNAVAILABLE");
    expect(fromReleased.actionableTarget).toBe(false);
    expect(fromReleased.hypotheticalCandidateOnly).toBe(false);
    expect(isActionableAuctionTarget(fromReleased)).toBe(false);
    expect(isHypotheticalScenarioCandidate(fromReleased)).toBe(false);
  });

  it("Requirement 6 & Fix 3: Mitchell Starc remains non-actionable under supplied status and analyst workload assumption", () => {
    const starcWatchlist = warRoomData.auction_watchlist.find((p) => p.name === "Mitchell Starc");
    const starcReleased = warRoomData.released_player_reference.players.find(
      (p) => p.player_name === "Mitchell Starc",
    );

    expect(starcWatchlist).toBeDefined();
    expect(starcReleased).toBeDefined();

    // Baseline from watchlist
    const fromWatchlist = assessWatchlistPlayer(starcWatchlist!);
    expect(fromWatchlist.workloadWarning).toBe(true);
    expect(fromWatchlist.registrationVerified).toBe(false);
    expect(fromWatchlist.actionableTarget).toBe(false);
    expect(isActionableAuctionTarget(fromWatchlist)).toBe(false);
    expect(getEligibilityReason(fromWatchlist)).toContain("non-actionable under supplied status");

    // Analyst workload assumption must NOT clear official workload warning or confer actionability
    const watchlistWorkloadAssumed = assessWatchlistPlayer(starcWatchlist!, {
      analystWorkloadAssumed: true,
    });
    expect(watchlistWorkloadAssumed.workloadWarning).toBe(true);
    expect(watchlistWorkloadAssumed.registrationVerified).toBe(false);
    expect(watchlistWorkloadAssumed.actionableTarget).toBe(false);
    expect(isActionableAuctionTarget(watchlistWorkloadAssumed)).toBe(false);
    expect(getEligibilityReason(watchlistWorkloadAssumed)).toContain(
      "Analyst workload assumption cannot clear official workload warnings",
    );

    // Baseline from released register
    const fromReleased = assessReleasedPlayer(starcReleased!);
    expect(fromReleased.workloadWarning).toBe(true);
    expect(fromReleased.registrationVerified).toBe(false);
    expect(fromReleased.actionableTarget).toBe(false);
    expect(isActionableAuctionTarget(fromReleased)).toBe(false);
    expect(getEligibilityReason(fromReleased)).toContain("non-actionable");

    // Analyst workload assumption on released register record
    const releasedWorkloadAssumed = assessReleasedPlayer(starcReleased!, {
      analystWorkloadAssumed: true,
    });
    expect(releasedWorkloadAssumed.workloadWarning).toBe(true);
    expect(releasedWorkloadAssumed.registrationVerified).toBe(false);
    expect(releasedWorkloadAssumed.actionableTarget).toBe(false);
    expect(isActionableAuctionTarget(releasedWorkloadAssumed)).toBe(false);
    expect(getEligibilityReason(releasedWorkloadAssumed)).toContain(
      "Analyst workload assumption cannot clear official workload warnings",
    );
  });

  it("Requirement 7: MS Dhoni remains ineligible as a playing target", () => {
    const dhoniReleased = warRoomData.released_player_reference.players.find(
      (p) => p.player_name === "MS Dhoni",
    );
    expect(dhoniReleased).toBeDefined();

    const assessment = assessReleasedPlayer(dhoniReleased!);
    expect(assessment.marketStatus).toBe("INELIGIBLE_MARKET");
    expect(assessment.actionableTarget).toBe(false);
    expect(assessment.hypotheticalCandidateOnly).toBe(false);
    expect(isActionableAuctionTarget(assessment)).toBe(false);
    expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
    expect(getEligibilityReason(assessment)).toContain("ineligible as an auction playing target");
  });

  it("Requirement 8: no currently unverified watchlist candidate becomes actionable", () => {
    const watchlist = warRoomData.auction_watchlist;
    expect(watchlist).toHaveLength(13);

    for (const player of watchlist) {
      const assessment = assessWatchlistPlayer(player);

      expect(assessment.registrationVerified).toBe(false);
      expect(assessment.actionableTarget).toBe(false);
      expect(isActionableAuctionTarget(assessment)).toBe(false);

      if (player.name === "Jacob Bethell") {
        expect(assessment.marketStatus).toBe("UNAVAILABLE");
        expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
      } else {
        expect(assessment.marketStatus).toBe("RELEASED_REGISTRATION_UNVERIFIED");
        expect(isHypotheticalScenarioCandidate(assessment)).toBe(true);
      }
    }
  });

  it("Requirement 9: a synthetic test record with explicitly verified registration and no blocking restriction passes the actionability rule", () => {
    // 1. Positive case: verified registration, no medical or workload restriction
    const positiveCandidate = assessSyntheticRecord({
      playerName: "Synthetic Verified Matchwinner",
      auctionRegistrationVerified: true,
      marketStatus: "AUCTION_REGISTERED",
      medicalRestriction: "NONE",
      workloadWarning: false,
      franchise: "Delhi Capitals",
    });

    expect(positiveCandidate.registrationVerified).toBe(true);
    expect(positiveCandidate.marketStatus).toBe("AUCTION_REGISTERED");
    expect(positiveCandidate.medicalRestriction).toBe("NONE");
    expect(positiveCandidate.actionableTarget).toBe(true);
    expect(isActionableAuctionTarget(positiveCandidate)).toBe(true);
    expect(isHypotheticalScenarioCandidate(positiveCandidate)).toBe(false);
    expect(positiveCandidate.hypotheticalCandidateOnly).toBe(false);
    expect(getEligibilityReason(positiveCandidate)).toContain("actionable auction target");

    // 2. Negative variation: verified registration but medical review required
    const verifiedButInjured = assessSyntheticRecord({
      playerName: "Synthetic Registered But Injured",
      auctionRegistrationVerified: true,
      marketStatus: "AUCTION_REGISTERED",
      medicalRestriction: "MEDICAL_REVIEW",
      workloadWarning: false,
    });

    expect(verifiedButInjured.registrationVerified).toBe(true);
    expect(verifiedButInjured.medicalRestriction).toBe("MEDICAL_REVIEW");
    expect(isActionableAuctionTarget(verifiedButInjured)).toBe(false);
    expect(verifiedButInjured.actionableTarget).toBe(false);
    expect(isHypotheticalScenarioCandidate(verifiedButInjured)).toBe(true);
    expect(verifiedButInjured.hypotheticalCandidateOnly).toBe(true);

    // 3. Negative variation: verified registration but workload opt-out warning
    const verifiedWithWorkloadWarning = assessSyntheticRecord({
      playerName: "Synthetic Registered With Workload Warning",
      auctionRegistrationVerified: true,
      marketStatus: "AUCTION_REGISTERED",
      medicalRestriction: "NONE",
      workloadWarning: true,
    });

    expect(isActionableAuctionTarget(verifiedWithWorkloadWarning)).toBe(false);

    // 4. Negative variation: unverified registration (default)
    const unverifiedDefault = assessSyntheticRecord({
      playerName: "Synthetic Unverified Player",
      auctionRegistrationVerified: false,
      medicalRestriction: "NONE",
    });

    expect(unverifiedDefault.marketStatus).toBe("RELEASED_REGISTRATION_UNVERIFIED");
    expect(isActionableAuctionTarget(unverifiedDefault)).toBe(false);
    expect(isHypotheticalScenarioCandidate(unverifiedDefault)).toBe(true);
  });

  it("Fix 1 & Additional test 1: a synthetic historical ranking record with artificially added auction_registration_verified: true must not independently become actionable", () => {
    const syntheticRankedWithRegistration = {
      rank: 1,
      player_id: 99999,
      player_name: "Artificially Verified Ranking Star",
      franchise_status: "released",
      franchise: "KKR",
      auction_registration_verified: true, // Artificially injected into historical ranking record
    };

    const assessment = assessRankedPlayer(syntheticRankedWithRegistration);

    // Registration must not be established from ranking data
    expect(assessment.registrationVerified).toBe(false);
    expect(assessment.marketStatus).not.toBe("AUCTION_REGISTERED");
    expect(assessment.actionableTarget).toBe(false);
    expect(assessment.hypotheticalCandidateOnly).toBe(false);
    expect(isActionableAuctionTarget(assessment)).toBe(false);
    expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
  });

  it("Fix 1 & Additional test 2: a released ranking record must not independently become a squad acquisition candidate", () => {
    const bowlers = warRoomData.pressure_ranked_bowlers_top10;
    const releasedRanked = bowlers.filter((p) => p.franchise_status === "released");

    expect(releasedRanked.length).toBeGreaterThan(0);

    for (const player of releasedRanked) {
      const assessment = assessRankedPlayer(player);

      expect(assessment.marketStatus).toBe("RELEASED_REGISTRATION_UNVERIFIED");
      // Historical ranking records do not independently become squad acquisition candidates
      expect(assessment.hypotheticalCandidateOnly).toBe(false);
      expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
      expect(isActionableAuctionTarget(assessment)).toBe(false);
      expect(getEligibilityReason(assessment)).toContain(
        "historical P1 ranking does not independently establish squad acquisition eligibility",
      );
    }

    // Contrast with assessing a released candidate from an authoritative recruitment record (watchlist)
    const boultWatchlist = warRoomData.auction_watchlist.find((p) => p.name === "Trent Boult");
    expect(boultWatchlist).toBeDefined();
    const boultRecruitmentAssessment = assessWatchlistPlayer(boultWatchlist!);
    expect(boultRecruitmentAssessment.hypotheticalCandidateOnly).toBe(true);
    expect(isHypotheticalScenarioCandidate(boultRecruitmentAssessment)).toBe(true);
  });

  it("Fix 2 & Additional test 3: unknown, missing or unsupported franchise status fails closed to MARKET_STATUS_UNRESOLVED", () => {
    const unknownCases = [
      { player_name: "Missing Status Player" },
      { player_name: "Null Status Player", franchise_status: null },
      { player_name: "Undefined Status Player", franchise_status: undefined },
      { player_name: "Unknown Status Player", franchise_status: "unknown" },
      { player_name: "Pending Review Player", franchise_status: "pending_review" },
      { player_name: "Free Agent Player", franchise_status: "free_agent" },
    ];

    for (const testCase of unknownCases) {
      const assessment = assessRankedPlayer(testCase);

      expect(assessment.marketStatus).toBe("MARKET_STATUS_UNRESOLVED");
      expect(assessment.marketStatus).not.toBe("RELEASED_REGISTRATION_UNVERIFIED");
      expect(assessment.actionableTarget).toBe(false);
      expect(assessment.hypotheticalCandidateOnly).toBe(false);
      expect(assessment.researchPending).toBe(true);
      expect(isActionableAuctionTarget(assessment)).toBe(false);
      expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
      expect(isResearchPendingCandidate(assessment)).toBe(true);
      expect(getEligibilityReason(assessment)).toContain(
        "fails closed to MARKET_STATUS_UNRESOLVED",
      );
    }
  });

  it("Corrections 1-5 & Additional test 4: Abhishek Sharma and Haris Rauf regression tests with MARKET_STATUS_UNRESOLVED", () => {
    const abhishekRecord = warRoomData.pressure_ranked_batters_top10.find(
      (p) => p.player_name === "Abhishek Sharma",
    );
    const raufRecord = warRoomData.pressure_ranked_bowlers_top10.find(
      (p) => p.player_name === "Haris Rauf",
    );

    expect(abhishekRecord).toBeDefined();
    expect(raufRecord).toBeDefined();
    expect(abhishekRecord!.franchise_status).toBe("unresolved");
    expect(raufRecord!.franchise_status).toBe("unresolved");

    // Assess Abhishek Sharma
    const abhishekAssessment = assessRankedPlayer(abhishekRecord!);
    expect(abhishekAssessment.marketStatus).toBe("MARKET_STATUS_UNRESOLVED");
    expect(abhishekAssessment.marketStatus).not.toBe("RELEASED_REGISTRATION_UNVERIFIED");
    expect(abhishekAssessment.actionableTarget).toBe(false);
    expect(abhishekAssessment.hypotheticalCandidateOnly).toBe(false);
    expect(abhishekAssessment.researchPending).toBe(true);
    expect(isActionableAuctionTarget(abhishekAssessment)).toBe(false);
    expect(isHypotheticalScenarioCandidate(abhishekAssessment)).toBe(false);
    expect(isResearchPendingCandidate(abhishekAssessment)).toBe(true);
    expect(getEligibilityReason(abhishekAssessment)).toContain("MARKET_STATUS_UNRESOLVED");

    // Assess Haris Rauf
    const raufAssessment = assessRankedPlayer(raufRecord!);
    expect(raufAssessment.marketStatus).toBe("MARKET_STATUS_UNRESOLVED");
    expect(raufAssessment.marketStatus).not.toBe("RELEASED_REGISTRATION_UNVERIFIED");
    expect(raufAssessment.actionableTarget).toBe(false);
    expect(raufAssessment.hypotheticalCandidateOnly).toBe(false);
    expect(raufAssessment.researchPending).toBe(true);
    expect(isActionableAuctionTarget(raufAssessment)).toBe(false);
    expect(isHypotheticalScenarioCandidate(raufAssessment)).toBe(false);
    expect(isResearchPendingCandidate(raufAssessment)).toBe(true);
    expect(getEligibilityReason(raufAssessment)).toContain("MARKET_STATUS_UNRESOLVED");
  });

  it("Corrections 2-4: all unresolved ranked players are classified as MARKET_STATUS_UNRESOLVED and not released", () => {
    const batters = warRoomData.pressure_ranked_batters_top10;
    const bowlers = warRoomData.pressure_ranked_bowlers_top10;
    const allRanked = [...batters, ...bowlers];

    const unresolvedPlayers = allRanked.filter((p) => p.franchise_status === "unresolved");
    expect(unresolvedPlayers.map((p) => p.player_name)).toEqual([
      "Abhishek Sharma",
      "Fakhar Zaman",
      "Andre Russell",
      "Glenn Maxwell",
      "Haris Rauf",
      "Maheesh Theekshana",
      "Shaheen Afridi",
    ]);

    for (const player of unresolvedPlayers) {
      const assessment = assessRankedPlayer(player);

      expect(assessment.marketStatus).toBe("MARKET_STATUS_UNRESOLVED");
      expect(assessment.marketStatus).not.toBe("RELEASED_REGISTRATION_UNVERIFIED");
      expect(assessment.actionableTarget).toBe(false);
      expect(assessment.hypotheticalCandidateOnly).toBe(false);
      expect(assessment.researchPending).toBe(true);
      expect(isActionableAuctionTarget(assessment)).toBe(false);
      expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
      expect(isResearchPendingCandidate(assessment)).toBe(true);
    }

    // Verify released ranked players: ONLY players with franchise_status: "released"
    const releasedRanked = allRanked.filter((p) => p.franchise_status === "released");
    expect(releasedRanked.map((p) => p.player_name)).toEqual([
      "Matheesha Pathirana",
      "Mustafizur Rahman",
      "Trent Boult",
    ]);

    for (const player of releasedRanked) {
      const assessment = assessRankedPlayer(player);
      expect(assessment.marketStatus).toBe("RELEASED_REGISTRATION_UNVERIFIED");
      expect(assessment.researchPending).toBe(false);
      // Released ranking records do not independently become squad acquisition candidates
      expect(assessment.hypotheticalCandidateOnly).toBe(false);
      expect(isHypotheticalScenarioCandidate(assessment)).toBe(false);
    }
  });
});
