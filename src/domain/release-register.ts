export interface ReleaseReferenceRow {
  player_name: string;
  released_from_franchise: string;
  overseas_marked_in_pdf: string;
  salary_value_as_printed: string;
  salary_unit: string;
  status_as_of: string;
  availability_status: string;
  auction_registration_verified: string;
  note: string;
  source_document: string;
}

export function releaseStatusLabel(status: string): string {
  switch (status) {
    case "released_registration_unverified":
      return "Released · registration unverified";
    case "released_availability_unconfirmed_workload":
      return "Released · workload / availability unresolved";
    case "released_unavailable_2027_medical":
      return "Unavailable for IPL 2027 · medical status reported";
    case "retired_ipl_player_mentor":
      return "Retired as player · mentor role";
    default:
      return status.replaceAll("_", " ");
  }
}

export function releaseStatusTone(status: string): "warning" | "danger" | "neutral" {
  if (status === "released_unavailable_2027_medical") return "danger";
  if (status === "retired_ipl_player_mentor") return "neutral";
  return "warning";
}

export function filterReleaseReferenceRows(
  rows: ReleaseReferenceRow[],
  query: string,
): ReleaseReferenceRow[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter((row) =>
    [
      row.player_name,
      row.released_from_franchise,
      row.availability_status,
      row.note,
      row.status_as_of,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}
