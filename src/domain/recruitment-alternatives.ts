import type { RecruitmentCandidate } from "@/domain/recruitment";

export interface RoleMatchedAlternative {
  candidate: RecruitmentCandidate;
  reason: string;
}

function formatRoleLabel(role: string): string {
  return role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Return a research alternate by explicit role/tactical overlap. The ordinal
 * board rank is deliberately not read by this function.
 */
export function chooseRoleMatchedAlternative(
  selected: RecruitmentCandidate,
  candidates: RecruitmentCandidate[],
): RoleMatchedAlternative | null {
  const selectedRoles = new Set<string>(
    [selected.primaryRole, selected.secondaryRole ?? ""].filter(Boolean),
  );
  const selectedTactics = new Set(selected.tacticalRolesSupported ?? []);
  const alternatives = candidates.flatMap((candidate) => {
    if (candidate.name === selected.name || candidate.discipline !== selected.discipline) return [];

    const sharedRoles = [candidate.primaryRole, candidate.secondaryRole].flatMap((role) =>
      role && selectedRoles.has(role) ? [role] : [],
    );
    const sharedTactics = (candidate.tacticalRolesSupported ?? []).filter((role) =>
      selectedTactics.has(role),
    );
    const samePrimaryRole = candidate.primaryRole === selected.primaryRole;
    const score = (samePrimaryRole ? 4 : 0) + sharedRoles.length * 2 + sharedTactics.length;
    if (score === 0) return [];

    const reason = samePrimaryRole
      ? `Same primary role: ${formatRoleLabel(candidate.primaryRole)}.`
      : sharedRoles.length > 0
        ? `Shared role coverage: ${sharedRoles.map(formatRoleLabel).join(", ")}.`
        : `Shared tactical profile: ${sharedTactics.join(", ")}.`;
    return [{ candidate, score, reason }];
  });

  alternatives.sort(
    (a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name),
  );
  const best = alternatives[0];
  return best ? { candidate: best.candidate, reason: best.reason } : null;
}
