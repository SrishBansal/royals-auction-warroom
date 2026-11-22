const fs = require("node:fs");
const path = require("node:path");

const dataPath = path.join(__dirname, "../../src/data/spatial/spatial-model-pilot.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const errors = [];
const expectedHash = "138b861f4e72739eff00c6ccb73f80eb5b27f722112d4cefbb957c5a083f2262";
const requiredPredictionFields = [
  "expected_batter_runs_context",
  "expected_batter_runs_context_plus_location",
  "expected_bowler_wicket_rate_context",
  "expected_bowler_wicket_rate_context_plus_location",
];
const expectedZoneKeys = new Set(
  Array.from({ length: 5 }, (_, y) =>
    Array.from({ length: 5 }, (_, x) => `Y${y + 1}-L${x + 1}`),
  ).flat(),
);
const actualZoneKeys = new Set(data.zones.map((zone) => `${zone.length_zone}-${zone.line_zone}`));
const deliveriesInZones = data.zones.reduce((sum, zone) => sum + zone.deliveries, 0);
const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

if (data.raw_rows !== 149424)
  errors.push(`Expected 149,424 source rows; received ${data.raw_rows}.`);
if (data.unique_matches !== 628)
  errors.push(`Expected 628 source match IDs; received ${data.unique_matches}.`);
if (data.unique_match_delivery_keys !== data.raw_rows)
  errors.push("Raw match/delivery keys do not reconcile to raw row count.");
if (data.duplicate_match_delivery_keys !== 0)
  errors.push("Duplicate (matchId, delivery) keys were detected.");
if (data.retired_hurt_rows_excluded_from_team_wickets !== 8)
  errors.push("Expected both retired-hurt source spellings to be excluded (8 rows).");
if (data.bare_retired_rows_retained_as_team_wickets !== 1)
  errors.push("Bare Retired dismissal should remain a team wicket (1 row).");
if (data.pitch_valid_legal_main_rows !== 135587)
  errors.push(`Expected 135,587 model deliveries; received ${data.pitch_valid_legal_main_rows}.`);
if (data.pitch_valid_legal_main_matches !== 627)
  errors.push(
    `Expected 627 matches in the spatial model sample; received ${data.pitch_valid_legal_main_matches}.`,
  );
if (data.zones.length !== 25 || actualZoneKeys.size !== 25)
  errors.push("Expected 25 unique pitch zones.");
if (
  expectedZoneKeys.size !== actualZoneKeys.size ||
  [...expectedZoneKeys].some((key) => !actualZoneKeys.has(key))
)
  errors.push("The 5×5 zone grid does not contain the exact Y1–Y5 / L1–L5 keys.");
if (deliveriesInZones !== data.pitch_valid_legal_main_rows)
  errors.push("Zone delivery counts do not reconcile exactly to the model sample.");
if (data.zone_nonempty !== 25 || data.zones.some((zone) => zone.deliveries <= 0))
  errors.push("One or more spatial zones are empty.");
if (data.oof_prediction_coverage !== data.pitch_valid_legal_main_rows)
  errors.push("Out-of-fold prediction coverage does not equal the published modelling sample.");
if (data.source.raw_csv_sha256 !== expectedHash)
  errors.push("Raw source SHA-256 does not match the audited input file.");
if (data.source.redistributed_raw_data_in_project !== false)
  errors.push("Raw tracking redistribution flag must remain false.");
if (!String(data.prototype_notes.validation).toLowerCase().includes("no chronological holdout"))
  errors.push("No-chronological-holdout limitation is not recorded.");
if (!String(data.prototype_notes.validation).includes("GroupKFold"))
  errors.push("Match-grouped validation note is missing.");
if (!String(data.prototype_notes.validation).toLowerCase().includes("1,000-resample"))
  errors.push("Validation note does not disclose the 1,000-resample bootstrap.");

for (const [index, zone] of data.zones.entries()) {
  for (const field of requiredPredictionFields) {
    if (!isFiniteNumber(zone[field]))
      errors.push(`Zone ${index + 1} has a missing/non-finite ${field}.`);
  }
  for (const field of [
    "batter_runs_per_ball",
    "bowler_wicket_rate",
    "bowler_wicket_rate_wilson95_low",
    "bowler_wicket_rate_wilson95_high",
  ]) {
    if (!isFiniteNumber(zone[field]))
      errors.push(`Zone ${index + 1} has a missing/non-finite ${field}.`);
  }
  for (const field of [
    "bowler_wicket_rate",
    "bowler_wicket_rate_wilson95_low",
    "bowler_wicket_rate_wilson95_high",
    "expected_bowler_wicket_rate_context",
    "expected_bowler_wicket_rate_context_plus_location",
  ]) {
    if (zone[field] < 0 || zone[field] > 1)
      errors.push(`Zone ${index + 1} has ${field} outside [0, 1].`);
  }
  if (
    zone.bowler_wicket_rate_wilson95_low > zone.bowler_wicket_rate ||
    zone.bowler_wicket_rate > zone.bowler_wicket_rate_wilson95_high
  ) {
    errors.push(`Zone ${index + 1} Wilson interval does not enclose the observed wicket rate.`);
  }
  if (zone.deliveries < 1 || zone.bowler_wickets > zone.deliveries)
    errors.push(`Zone ${index + 1} has invalid count data.`);
}

const regression = data.regression_grouped_oof_3fold;
const classification = data.bowler_wicket_grouped_oof_3fold;
const maeImprovement = regression.context_only.mae - regression.context_plus_location.mae;
const maeRelativeImprovementPct = (maeImprovement / regression.context_only.mae) * 100;
const apImprovement =
  classification.context_plus_location.average_precision -
  classification.context_only.average_precision;
if (!(regression.context_only.mae > regression.context_plus_location.mae))
  errors.push("Context + location does not improve held-out MAE in the recorded model comparison.");
if (!(regression.context_only.rmse > regression.context_plus_location.rmse))
  errors.push(
    "Context + location does not improve held-out RMSE in the recorded model comparison.",
  );
if (!(regression.location_only.mae > regression.context_only.mae))
  errors.push(
    "Location-only should remain weaker than context-only on MAE; review the comparison if this changes.",
  );
if (
  !(
    classification.context_plus_location.average_precision >
    classification.context_only.average_precision
  )
)
  errors.push(
    "Context + location does not improve held-out wicket AP in the recorded model comparison.",
  );
if (!(classification.context_plus_location.brier < classification.context_only.brier))
  errors.push("Context + location does not improve held-out wicket Brier score.");
if (!(maeRelativeImprovementPct > 0 && maeRelativeImprovementPct < 2))
  errors.push(
    "MAE improvement is outside the expected modest (<2%) interval; review claims before release.",
  );
if (!(data.base_bowler_wicket_rate > 0.04 && data.base_bowler_wicket_rate < 0.06))
  errors.push("Bowler-wicket base rate is outside the expected rare-event range.");

const bootstrap = data.paired_match_cluster_bootstrap;
if (bootstrap.resamples !== 1000 || bootstrap.cluster_unit !== "matchId")
  errors.push("Expected 1,000 match-cluster bootstrap resamples.");
for (const [metric, result] of Object.entries(bootstrap.deltas ?? {})) {
  if (
    ![result.point_estimate, result.ci95_low, result.ci95_high, result.fraction_positive].every(
      isFiniteNumber,
    )
  )
    errors.push(`Bootstrap metric ${metric} contains non-finite values.`);
  if (result.ci95_low > result.ci95_high)
    errors.push(`Bootstrap metric ${metric} has an inverted interval.`);
  if (result.fraction_positive < 0 || result.fraction_positive > 1)
    errors.push(`Bootstrap metric ${metric} has invalid positive fraction.`);
}
if (!(
  bootstrap.deltas.mae_improvement.ci95_low > 0 && bootstrap.deltas.ap_improvement.ci95_low > 0
))
  errors.push("Bootstrap interval for key model gains includes zero; update page interpretation.");

const forbiddenPredictors = new Set([
  "batterRuns",
  "runs",
  "dismissalDetails",
  "fieldX",
  "fieldY",
  "matchId",
  "batter",
  "bowler",
  "bowlerId",
  "batterId",
]);
for (const feature of [...data.features_context, ...data.features_spatial]) {
  if (forbiddenPredictors.has(feature))
    errors.push(`Forbidden target/identity/post-outcome feature is included: ${feature}.`);
}
if (
  !data.features_spatial.includes("pitchY") ||
  !data.features_spatial.some((feature) => feature.includes("line"))
)
  errors.push(
    "Spatial features do not contain both longitudinal and batter-relative lateral coordinates.",
  );

if (errors.length) {
  console.error(errors.map((error) => `FAIL: ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      rawRows: data.raw_rows,
      matchIds: data.unique_matches,
      modelDeliveries: data.pitch_valid_legal_main_rows,
      modelMatches: data.pitch_valid_legal_main_matches,
      zones: data.zones.length,
      deliveriesReconciled: deliveriesInZones,
      sourceHashMatched: true,
      predictionCoverage: data.oof_prediction_coverage,
      maeImprovementPct: Number(maeRelativeImprovementPct.toFixed(3)),
      absoluteWicketApGain: Number(apImprovement.toFixed(6)),
      bootstrapResamples: bootstrap.resamples,
      rawTrackingBundled: data.source.redistributed_raw_data_in_project,
    },
    null,
    2,
  ),
);
