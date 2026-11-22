import { warRoomData } from "@/data/war-room";
import {
  RR_BATTER_RECOMMENDATIONS,
  RR_BOWLER_RECOMMENDATIONS,
  type RecruitmentCandidate,
} from "@/domain/recruitment";
import type { DecisionPlayer, DecisionRoleTag } from "@/domain/rr-decision-engine";

const retainedRoleOverrides: Record<
  string,
  Pick<DecisionPlayer, "primaryRole" | "secondaryRole" | "tacticalRolesSupported">
> = {
  "Dasun Shanaka": {
    primaryRole: "Lower-order batting all-rounder",
    secondaryRole: "Medium-pace option",
    tacticalRolesSupported: ["Lower-order hitter", "Flexible batting 4–8", "Batting all-rounder"],
  },
  "Donovan Ferreira": {
    primaryRole: "Lower-order batting all-rounder",
    secondaryRole: "Wicketkeeping option",
    tacticalRolesSupported: ["Lower-order hitter", "Finishing option", "Wicketkeeping cover"],
  },
  "Shubham Dubey": {
    primaryRole: "Middle/lower-order batter",
    secondaryRole: "Domestic finishing depth",
    tacticalRolesSupported: ["Lower-order hitter", "Middle/lower-order batting"],
  },
  "Ravindra Jadeja": {
    primaryRole: "Batting all-rounder",
    secondaryRole: "Left-arm orthodox spin",
    tacticalRolesSupported: ["Batting depth", "Spin control"],
  },
};

/** Curated cricket capabilities. These tags are more reliable than broad text matching on role prose. */
const retainedRoleTags: Record<string, DecisionRoleTag[]> = {
  "Vaibhav Sooryavanshi": ["opener", "top-order"],
  "Yashasvi Jaiswal": ["opener", "top-order"],
  "Riyan Parag": ["middle-order", "top-order", "spin"],
  "Dhruv Jurel": ["top-order", "middle-order", "wicketkeeper", "repair-batter"],
  "Donovan Ferreira": ["lower-order", "finisher", "all-rounder", "wicketkeeper"],
  "Ravindra Jadeja": ["middle-order", "lower-order", "all-rounder", "spin"],
  "Ravi Bishnoi": ["spin"],
  "Yash Raj Punja": ["spin"],
  "Jofra Archer": ["pace", "right-arm", "powerplay-specialist"],
  "Nandre Burger": ["pace", "left-arm", "powerplay-specialist"],
  "Mohammed Shami": ["pace", "right-arm", "powerplay-specialist"],
  "Sandeep Sharma": ["pace", "right-arm", "variation-specialist"],
  "Manimaran Siddharth": ["spin", "left-arm"],
  "Brijesh Sharma": ["pace", "right-arm", "indian-pace-depth"],
  "Sushant Mishra": ["pace", "left-arm", "indian-pace-depth"],
  "Shubham Dubey": ["middle-order", "lower-order", "finisher"],
  "Dasun Shanaka": ["middle-order", "lower-order", "all-rounder", "pace"],
  "Lhuan-dre Pretorius": ["wicketkeeper", "batting-depth"],
  "Aman Rao Perala": ["batting-depth"],
};

const candidateRoleTags: Record<string, DecisionRoleTag[]> = {
  MIDDLE_ORDER_ANCHOR: ["middle-order", "repair-batter"],
  TOP_ORDER_COVER: ["top-order"],
  LOWER_MIDDLE_ORDER_FINISHER: ["middle-order", "lower-order", "finisher"],
  FLOATER: ["middle-order", "repair-batter"],
  WICKETKEEPER_BATTER: ["wicketkeeper", "middle-order"],
  OVERSEAS_POWER_HITTER: ["lower-order", "finisher"],
  BATTING_ALL_ROUNDER: ["all-rounder"],
  DEVELOPMENTAL_BATTER: [],
  DEATH_SPECIALIST: ["pace", "death-specialist"],
  POWERPLAY_SPECIALIST: ["pace", "powerplay-specialist"],
  PACE_ENFORCER: ["pace"],
  VARIATION_SPECIALIST: ["pace", "variation-specialist"],
  INDIAN_PACE_DEPTH: ["pace", "indian-pace-depth"],
  NEW_BALL_PACE: ["pace", "powerplay-specialist"],
  EXPRESS_PACE: ["pace"],
  SPIN_MATCHUP: ["spin"],
};

export const RR_RETAINED_DECISION_PLAYERS: DecisionPlayer[] = warRoomData.team.retained_players.map(
  (player) => ({
    name: player.name,
    nationality: player.nationality,
    overseas: player.overseas,
    role: player.role,
    lineupRole: player.lineup_role,
    ...retainedRoleOverrides[player.name],
    roleTags: retainedRoleTags[player.name] ?? [],
    isRetained: true,
    marketStatus: "RR_RETAINED",
    marketStatusLabel: "Retained by RR",
    sourceNote: player.squad_status,
  }),
);

function toDecisionTarget(candidate: RecruitmentCandidate): DecisionPlayer {
  return {
    name: candidate.name,
    nationality: candidate.nationality,
    overseas: candidate.nationality === "Overseas",
    role: `${candidate.primaryRole.replaceAll("_", " ")} ${candidate.secondaryRole?.replaceAll("_", " ") ?? ""}. ${candidate.roleFit}`,
    primaryRole: candidate.primaryRole,
    ...(candidate.secondaryRole !== undefined ? { secondaryRole: candidate.secondaryRole } : {}),
    ...(candidate.bowlingStyle !== undefined ? { bowlingStyle: candidate.bowlingStyle } : {}),
    ...(candidate.battingHand !== undefined ? { battingHand: candidate.battingHand } : {}),
    tacticalRolesSupported: candidate.tacticalRolesSupported,
    roleTags: [
      ...new Set([
        ...(candidateRoleTags[candidate.primaryRole] ?? []),
        ...(candidate.secondaryRole ? (candidateRoleTags[candidate.secondaryRole] ?? []) : []),
      ]),
    ],
    marketStatus: candidate.marketStatus,
    marketStatusLabel: candidate.marketStatusLabel,
    medicalRestriction: candidate.medicalRestriction,
    ...(candidate.medicalNote !== undefined ? { medicalNote: candidate.medicalNote } : {}),
    isRetained: false,
    sourceNote: candidate.watchOut,
  };
}

/**
 * Every researched candidate belongs in the decision engine's candidate pool.
 * Market, medical and squad-capacity gates determine whether a profile can be
 * used in a hypothetical package; a curated shortlist must not silently hide
 * the remaining research-board profiles from the optimizer.
 */

export const RR_FOCUSED_TARGETS: DecisionPlayer[] = [
  ...RR_BATTER_RECOMMENDATIONS,
  ...RR_BOWLER_RECOMMENDATIONS,
].map(toDecisionTarget);

export function getDecisionPlayer(name: string): DecisionPlayer | undefined {
  return (
    RR_RETAINED_DECISION_PLAYERS.find((player) => player.name === name) ??
    RR_FOCUSED_TARGETS.find((player) => player.name === name)
  );
}

export function getCandidateDetail(name: string): RecruitmentCandidate | undefined {
  return [...RR_BATTER_RECOMMENDATIONS, ...RR_BOWLER_RECOMMENDATIONS].find(
    (candidate) => candidate.name === name,
  );
}
