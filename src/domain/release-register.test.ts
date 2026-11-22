import { describe, expect, it } from "vitest";
import releaseReference from "@/data/rr-2027-released-reference.json";
import {
  filterReleaseReferenceRows,
  releaseStatusLabel,
  releaseStatusTone,
  type ReleaseReferenceRow,
} from "@/domain/release-register";

const rows = releaseReference as ReleaseReferenceRow[];

describe("released-player reference register", () => {
  it("keeps all supplied reference rows and their distinct status groups", () => {
    expect(rows).toHaveLength(89);
    expect(
      rows.filter((row) => row.availability_status === "released_registration_unverified"),
    ).toHaveLength(86);
    expect(
      rows.filter(
        (row) => row.availability_status === "released_availability_unconfirmed_workload",
      ),
    ).toHaveLength(1);
    expect(
      rows.filter((row) => row.availability_status === "released_unavailable_2027_medical"),
    ).toHaveLength(1);
    expect(
      rows.filter((row) => row.availability_status === "retired_ipl_player_mentor"),
    ).toHaveLength(1);
  });

  it("searches player, released-from franchise and notes without changing the source list", () => {
    expect(
      filterReleaseReferenceRows(rows, "Akash Madhwal").map((row) => row.player_name),
    ).toContain("Akash Madhwal");
    expect(filterReleaseReferenceRows(rows, "Chennai Super Kings").length).toBeGreaterThan(1);
    expect(
      filterReleaseReferenceRows(rows, "not a purchasable player").map((row) => row.player_name),
    ).toContain("MS Dhoni");
    expect(filterReleaseReferenceRows(rows, "   ")).toHaveLength(89);
  });

  it("labels unresolved, unavailable and retired cases distinctly", () => {
    expect(releaseStatusLabel("released_registration_unverified")).toContain(
      "registration unverified",
    );
    expect(releaseStatusLabel("released_unavailable_2027_medical")).toContain("Unavailable");
    expect(releaseStatusLabel("retired_ipl_player_mentor")).toContain("Retired");
    expect(releaseStatusTone("released_unavailable_2027_medical")).toBe("danger");
    expect(releaseStatusTone("retired_ipl_player_mentor")).toBe("neutral");
  });
});
