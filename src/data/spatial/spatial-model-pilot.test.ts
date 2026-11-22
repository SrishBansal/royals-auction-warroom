import { describe, expect, it } from "vitest";
import pilot from "@/data/spatial/spatial-model-pilot.json";

describe("Kadamba spatial pilot data contract", () => {
  it("contains the complete 5×5 zone grid with reconciled delivery counts", () => {
    expect(pilot.zones).toHaveLength(25);
    expect(new Set(pilot.zones.map((zone) => `${zone.length_zone}-${zone.line_zone}`)).size).toBe(
      25,
    );
    expect(pilot.zones.reduce((sum, zone) => sum + zone.deliveries, 0)).toBe(
      pilot.pitch_valid_legal_main_rows,
    );
    expect(pilot.pitch_valid_legal_main_rows).toBe(135587);
    expect(pilot.oof_prediction_coverage).toBe(pilot.pitch_valid_legal_main_rows);
  });

  it("contains finite, bounded prediction values and observed wicket intervals", () => {
    for (const zone of pilot.zones) {
      expect(zone.deliveries).toBeGreaterThan(0);
      expect(zone.expected_batter_runs_context).toEqual(expect.any(Number));
      expect(Number.isFinite(zone.expected_batter_runs_context_plus_location)).toBe(true);
      expect(zone.expected_bowler_wicket_rate_context).toBeGreaterThanOrEqual(0);
      expect(zone.expected_bowler_wicket_rate_context).toBeLessThanOrEqual(1);
      expect(zone.expected_bowler_wicket_rate_context_plus_location).toBeGreaterThanOrEqual(0);
      expect(zone.expected_bowler_wicket_rate_context_plus_location).toBeLessThanOrEqual(1);
      expect(zone.bowler_wicket_rate_wilson95_low).toBeLessThanOrEqual(zone.bowler_wicket_rate);
      expect(zone.bowler_wicket_rate_wilson95_high).toBeGreaterThanOrEqual(zone.bowler_wicket_rate);
    }
  });

  it("keeps the model comparison modest and transparent", () => {
    expect(pilot.regression_grouped_oof_3fold.context_plus_location.mae).toBeLessThan(
      pilot.regression_grouped_oof_3fold.context_only.mae,
    );
    expect(
      pilot.bowler_wicket_grouped_oof_3fold.context_plus_location.average_precision,
    ).toBeGreaterThan(pilot.bowler_wicket_grouped_oof_3fold.context_only.average_precision);
    expect(pilot.base_bowler_wicket_rate).toBeLessThan(0.06);
    expect(pilot.paired_match_cluster_bootstrap.resamples).toBe(1000);
    expect(pilot.source.redistributed_raw_data_in_project).toBe(false);
  });
});
