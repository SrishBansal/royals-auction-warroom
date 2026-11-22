#!/usr/bin/env node
/*
 * Evidence-shape and UI-link validator for the seven supplied RR playoff cases.
 * This validates internal consistency and traceability, not the official scorecards
 * themselves; those require source-level review and are documented separately.
 */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
const ts = require("typescript");

const root = process.cwd();
const source = path.join(root, "src");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    const base = path.join(source, request.slice(2));
    for (const candidate of [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}.json`,
      path.join(base, "index.ts"),
    ]) {
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
require.extensions[".ts"] = (mod, filename) => {
  const js = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  mod._compile(js, filename);
};

const { playoffMatches } = require(path.join(source, "data/playoff-review.ts"));
const warRoomData = JSON.parse(
  fs.readFileSync(path.join(source, "data/rr-2027-data.json"), "utf8"),
);
const home = fs.readFileSync(path.join(source, "components/war-room-home.tsx"), "utf8");
const evidencePage = fs.readFileSync(path.join(source, "components/playoff-evidence.tsx"), "utf8");
const expectedIds = new Set([
  "2022-q1",
  "2022-q2",
  "2022-final",
  "2024-elim",
  "2024-q2",
  "2026-elim",
  "2026-q2",
]);
const ids = new Set(playoffMatches.map((match) => match.id));
assert.equal(
  playoffMatches.length,
  7,
  "Exactly seven supplied RR playoff matches should be rendered.",
);
assert.equal(ids.size, 7, "Playoff match IDs must be unique.");
assert.deepEqual(ids, expectedIds, "The seven audited match IDs changed.");

const wins = playoffMatches.filter((match) => match.result.startsWith("Won"));
const losses = playoffMatches.filter((match) => match.result.startsWith("Lost"));
assert.equal(wins.length, 3, "Expected three playoff wins.");
assert.equal(losses.length, 4, "Expected four playoff defeats.");
for (const match of playoffMatches) {
  assert.ok(
    match.date && match.source && match.read && match.takeaway,
    `${match.id} is missing date/source/evidence/takeaway.`,
  );
  assert.ok(
    warRoomData.sources.some(
      (sourceItem) => sourceItem.name === match.source && /^https?:\/\//.test(sourceItem.url),
    ),
    `${match.id} has no resolved source URL.`,
  );
  assert.ok(
    Number.isInteger(match.rr) && Number.isInteger(match.opponent),
    `${match.id} has invalid scores.`,
  );
  assert.ok(
    Number.isInteger(match.rrWkts) && match.rrWkts >= 0 && match.rrWkts <= 10,
    `${match.id} has invalid RR wickets.`,
  );
  assert.ok(
    Number.isInteger(match.oppWkts) && match.oppWkts >= 0 && match.oppWkts <= 10,
    `${match.id} has invalid opponent wickets.`,
  );
  assert.equal(
    match.result.startsWith("Won"),
    match.rr > match.opponent,
    `${match.id} result label conflicts with scoreline.`,
  );
  assert.equal(
    match.result.startsWith("Lost"),
    match.rr < match.opponent,
    `${match.id} loss label conflicts with scoreline.`,
  );
  assert.ok(
    home.includes("href={`/knockouts#case-${match.id}`}"),
    `Homepage dynamic evidence link missing for ${match.id}.`,
  );
  assert.ok(
    evidencePage.includes("id={`case-${match.id}`}"),
    `Evidence-room dynamic anchor missing for ${match.id}.`,
  );
}
assert.ok(
  wins.every((match) => match.takeawayLabel === "What worked"),
  "Positive matches must be marked as counter-evidence.",
);
assert.ok(
  losses.every((match) => match.takeawayLabel === "What RR lacked"),
  "Defeats must have a specific gap takeaway.",
);
const q2_2026 = playoffMatches.find((match) => match.id === "2026-q2");
assert.match(
  q2_2026.read,
  /two wickets/i,
  "2026 Q2 narrative must acknowledge the two middle-over wickets.",
);
assert.match(
  q2_2026.takeaway,
  /167-run partnership/i,
  "2026 Q2 should focus on the 167-run stand rather than claiming no wickets fell.",
);
const q2_2024 = playoffMatches.find((match) => match.id === "2024-q2");
assert.match(
  q2_2024.read,
  /42 runs and lost four more wickets/i,
  "2024 Q2 should retain the sourced eight-over collapse detail.",
);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      cases: playoffMatches.length,
      wins: wins.length,
      losses: losses.length,
      homepageEvidenceLinks: 7,
      detailedEvidenceAnchors: 7,
      officialSourceUrlsResolved: 7,
      scorelineResultLabelsConsistent: true,
      sourceScorecardsIndependentlyAudited: false,
    },
    null,
    2,
  ),
);
