import { describe, expect, it } from "vitest";
import { chooseRoleMatchedAlternative } from "@/domain/recruitment-alternatives";
import type { RecruitmentCandidate } from "@/domain/recruitment";

function candidate(
  overrides: Partial<RecruitmentCandidate> & Pick<RecruitmentCandidate, "name" | "primaryRole">,
): RecruitmentCandidate {
  return {
    id: overrides.name.toLowerCase().replaceAll(" ", "-"),
    rank: 99,
    discipline: "BOWLER",
    nationality: "Indian",
    country: "India",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released · registration unverified",
    medicalRestriction: "NONE",
    whyRR: "Role test profile.",
    roleFit: "Role test profile.",
    pressureEvidence: { status: "NO_ESTIMATE", exposureNote: "No sample." },
    upgradeOverSquad: "Test only.",
    watchOut: "Test only.",
    tacticalRolesSupported: [],
    isProvisional: true,
    ...overrides,
  };
}

describe("role-matched recruitment alternatives", () => {
  it("chooses a same-primary-role option without consulting ordinal rank", () => {
    const selected = candidate({ name: "Selected", primaryRole: "DEATH_SPECIALIST", rank: 1 });
    const lowerOrdinal = candidate({
      name: "Alphabetical Backup",
      primaryRole: "DEATH_SPECIALIST",
      rank: 10,
    });
    const temptingOrdinal = candidate({
      name: "Rank Two",
      primaryRole: "POWERPLAY_SPECIALIST",
      rank: 2,
    });

    const result = chooseRoleMatchedAlternative(selected, [temptingOrdinal, lowerOrdinal]);
    expect(result?.candidate.name).toBe("Alphabetical Backup");
    expect(result?.reason).toContain("Same primary role");
  });

  it("uses shared tactical profile when exact role labels differ", () => {
    const selected = candidate({
      name: "Selected",
      primaryRole: "PACE_ENFORCER",
      tacticalRolesSupported: ["Middle-over control"],
    });
    const alternate = candidate({
      name: "Alternate",
      primaryRole: "VARIATION_SPECIALIST",
      tacticalRolesSupported: ["Middle-over control"],
    });

    const result = chooseRoleMatchedAlternative(selected, [alternate]);
    expect(result?.candidate.name).toBe("Alternate");
    expect(result?.reason).toContain("Shared tactical profile");
  });

  it("does not invent a fallback when no role or tactical overlap exists", () => {
    const selected = candidate({ name: "Selected", primaryRole: "DEATH_SPECIALIST" });
    const unrelated = candidate({
      name: "Unrelated",
      primaryRole: "POWERPLAY_SPECIALIST",
      tacticalRolesSupported: ["New-ball swing"],
    });
    expect(chooseRoleMatchedAlternative(selected, [unrelated])).toBeNull();
  });
});
