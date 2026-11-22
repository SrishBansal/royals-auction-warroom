#!/usr/bin/env node
/* Validates the separate IPL-only experimental pressure-ranking workspace. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = process.cwd();
const dataPath = path.join(root, "src/data/pressure-rankings.json");
const pagePath = path.join(root, "src/components/pressure-rankings.tsx");
const routePath = path.join(root, "src/routes/pressure-rankings.tsx");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const page = fs.readFileSync(pagePath, "utf8");
const route = fs.readFileSync(routePath, "utf8");
assert.equal(data.scope, "IPL only; seasons 2022–2026 inclusive; T20I excluded.");
assert.deepEqual(data.seasons, [2022, 2023, 2024, 2025, 2026]);
assert.equal(data.matches, 367, "IPL match count with delivery data changed.");
assert.equal(data.scheduledMatchRecords, 371, "IPL competition register count changed.");
assert.equal(data.matchesWithoutDeliveryData, 4, "IPL no-delivery record count changed.");
assert.equal(data.rawDeliveries, 87687, "Raw IPL delivery row count changed.");
assert.equal(data.pressureLegalDeliveries, 27687, "Pressure legal-ball count changed.");
assert.equal(data.batters.length, 10, "Exactly ten batter ranks must be present.");
assert.equal(data.bowlers.length, 10, "Exactly ten bowler ranks must be present.");
for (const [label, rows] of [
  ["batters", data.batters],
  ["bowlers", data.bowlers],
]) {
  assert.deepEqual(
    rows.map((row) => row.rank),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    `${label}: ranks must be ordered 1–10.`,
  );
  assert.equal(
    new Set(rows.map((row) => row.playerId)).size,
    10,
    `${label}: duplicate player IDs.`,
  );
  assert.ok(
    rows.every((row) => row.index >= 0 && row.index <= 100),
    `${label}: index outside 0–100.`,
  );
  assert.ok(
    rows.every((row, i) => i === 0 || rows[i - 1].index >= row.index),
    `${label}: index order is not descending.`,
  );
}
assert.ok(data.batters.every((row) => row.pressureBalls >= 60 && row.allBalls >= 150));
assert.ok(
  data.bowlers.every(
    (row) => row.pressureBalls >= 90 && row.allBalls >= 180 && row.pressureWickets >= 5,
  ),
);
assert.ok(data.dataSha256 && /^[0-9a-f]{64}$/.test(data.dataSha256), "Missing source data hash.");
assert.ok(
  data.splitHalfReliability.batterSpearman !== null &&
    data.splitHalfReliability.bowlerSpearman !== null,
);
assert.ok(
  data.limitations.some((item) => item.includes("extras1_runs field is a categorical code")),
);
assert.ok(data.excludedSignals.includes("Required run rate / chase equation"));
assert.ok(data.excludedSignals.includes("Bowling economy"));
assert.ok(page.includes("The rank order is unstable"));
assert.ok(page.includes("IPL only · T20I excluded"));
assert.ok(
  page.includes("rankings.scheduledMatchRecords") &&
    page.includes("rankings.matchesWithoutDeliveryData"),
  "Page must disclose schedule records without delivery rows.",
);
assert.ok(page.includes("Pressure matches"), "Both tables must show sample match count.");
assert.ok(
  page.includes("Shrunk pressure SR") && page.includes("Dismissals / 100 balls"),
  "Batter table must expose the index shrinkage and dismissal components.",
);
assert.ok(
  page.includes("Shrunk wickets / 100"),
  "Bowler table must expose the index shrinkage component.",
);
assert.ok(route.includes('createFileRoute("/pressure-rankings")'));
console.log(
  JSON.stringify(
    {
      status: "PASS",
      scope: data.scope,
      seasons: data.seasons,
      matches: data.matches,
      scheduledMatchRecords: data.scheduledMatchRecords,
      matchesWithoutDeliveryData: data.matchesWithoutDeliveryData,
      rawDeliveries: data.rawDeliveries,
      pressureLegalDeliveries: data.pressureLegalDeliveries,
      top10Batters: data.batters.map((x) => x.player),
      top10Bowlers: data.bowlers.map((x) => x.player),
      splitHalfReliability: data.splitHalfReliability,
      caution: "Experimental ranks are displayed with instability disclosure.",
    },
    null,
    2,
  ),
);
