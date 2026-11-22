#!/usr/bin/env node
/*
 * Retained-only Match Lab stress test. Tests the exact 19-player squad pool
 * reported by the user, with no hypothetical additions mixed in.
 * Run after dependency installation: node scripts/validate-match-lab-retained.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
const ts = require("typescript");

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");
const oldResolve = Module._resolveFilename;
Module._resolveFilename = function resolveProjectAliases(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    const candidate = path.join(srcRoot, request.slice(2));
    for (const file of [
      candidate + ".ts",
      candidate + ".tsx",
      candidate + ".json",
      path.join(candidate, "index.ts"),
      candidate,
    ]) {
      if (fs.existsSync(file)) return file;
    }
  }
  return oldResolve.call(this, request, parent, isMain, options);
};
require.extensions[".ts"] = function compileTypeScript(module, filename) {
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const engine = require(path.join(srcRoot, "domain/rr-decision-engine.ts"));
const { RR_RETAINED_DECISION_PLAYERS } = require(path.join(srcRoot, "domain/decision-data.ts"));
assert.equal(
  RR_RETAINED_DECISION_PLAYERS.length,
  19,
  "The fixture must be the retained 19-player pool.",
);
const baseline = engine.optimizeRRLineups({
  retainedPlayers: RR_RETAINED_DECISION_PLAYERS,
  targetPool: [],
  selectedAcquisitions: [],
  context: {
    venue: "",
    venueEvidence: "unavailable",
    surface: "neutral",
    opposition: "balanced",
    objective: "balanced",
  },
  limit: 1,
});
assert.equal(
  baseline.recommendations.length > 0,
  true,
  "A legal retained-only XI is required for this test.",
);
const currentXI = baseline.recommendations[0].players.map((entry) => entry.player.name);
assert.equal(currentXI.length, 11);
assert.equal(new Set(currentXI).size, 11);

const states = [
  {
    id: "rr-batting-first-10-overs",
    innings: "batting-first",
    score: 53,
    wickets: 1,
    ballsCompleted: 60,
    targetOrDefendedTotal: 170,
    phase: "middle",
  },
  {
    id: "rr-chasing-10-overs",
    innings: "chasing",
    score: 53,
    wickets: 3,
    ballsCompleted: 60,
    targetOrDefendedTotal: 170,
    phase: "middle",
  },
  {
    id: "rr-defending-powerplay",
    innings: "defending",
    score: 31,
    wickets: 1,
    ballsCompleted: 24,
    targetOrDefendedTotal: 170,
    phase: "powerplay",
  },
  {
    id: "rr-defending-middle",
    innings: "defending",
    score: 53,
    wickets: 1,
    ballsCompleted: 60,
    targetOrDefendedTotal: 170,
    phase: "middle",
  },
  {
    id: "rr-defending-death",
    innings: "defending",
    score: 137,
    wickets: 4,
    ballsCompleted: 96,
    targetOrDefendedTotal: 170,
    phase: "death",
  },
];
const rows = [];
for (const state of states) {
  const result = engine.recommendMatchImpact({
    ...state,
    currentXI,
    availableSquad: RR_RETAINED_DECISION_PLAYERS,
    surface: "neutral",
    surfaceSource: "neutral-fallback",
    opposition: "balanced",
    venue: "",
    venueEvidence: "unavailable",
  });
  assert.equal(result.valid, true, `${state.id}: engine rejected a valid match state.`);
  assert.equal(result.phase, state.phase, `${state.id}: phase classification mismatch.`);
  assert.ok(result.recommended, `${state.id}: no retained-bench recommendation.`);
  assert.ok(
    RR_RETAINED_DECISION_PLAYERS.some((player) => player.name === result.recommended.name),
    `${state.id}: recommendation is not retained.`,
  );
  assert.ok(
    !currentXI.includes(result.recommended.name),
    `${state.id}: recommendation is already in the XI.`,
  );
  assert.ok(result.candidatesEvaluated > 0, `${state.id}: no eligible candidate was evaluated.`);
  assert.ok(
    result.combinations.length > 0,
    `${state.id}: no valid incoming/outgoing combination was generated.`,
  );
  for (const combination of result.combinations) {
    assert.ok(
      RR_RETAINED_DECISION_PLAYERS.some((player) => player.name === combination.incoming.name),
      `${state.id}: incoming option is outside retained pool.`,
    );
    assert.ok(
      !currentXI.includes(combination.incoming.name),
      `${state.id}: incoming option is already in XI.`,
    );
    assert.ok(
      currentXI.includes(combination.outgoing.name),
      `${state.id}: outgoing option is not in XI.`,
    );
    assert.equal(
      combination.assessment.valid,
      true,
      `${state.id}: generated substitution fails XI/role legality.`,
    );
    assert.equal(
      combination.assessment.afterCoverage.overseas <= engine.MAX_OVERSEAS_XI,
      true,
      `${state.id}: substitution exceeds overseas XI cap.`,
    );
  }
  rows.push({
    state: state.id,
    phase: result.phase,
    role: result.requiredRole,
    recommended: result.recommended.name,
    alternatives: result.alternatives.map((player) => player.name),
    evaluated: result.candidatesEvaluated,
    validCombinations: result.combinations.length,
    warnings: result.warnings,
  });
}

const battingStates = rows.filter(
  (row) => row.state.startsWith("rr-batting") || row.state.startsWith("rr-chasing"),
);
for (const row of battingStates) {
  assert.ok(
    ["Lhuan-dre Pretorius", "Aman Rao Perala"].includes(row.recommended) ||
      row.alternatives.some((name) => ["Lhuan-dre Pretorius", "Aman Rao Perala"].includes(name)),
    `${row.state}: general batting-depth options are not disclosed.`,
  );
  assert.ok(
    row.warnings.some((warning) => warning.includes("general batting-depth options")),
    `${row.state}: partial batting cover is not caveated.`,
  );
}
const middleDefence = rows.find((row) => row.state === "rr-defending-middle");
assert.equal(
  middleDefence.recommended,
  "Manimaran Siddharth",
  "Middle-over sample-backed role leader changed; review source/model before release.",
);
assert.ok(
  middleDefence.alternatives.includes("Yash Raj Punja"),
  "Yash Raj Punja should remain visible as a role-based alternative.",
);

// Invalid state gates must fail closed; complete innings must not manufacture a substitute.
const invalid = engine.recommendMatchImpact({
  innings: "chasing",
  score: 53,
  wickets: 11,
  ballsCompleted: 60,
  targetOrDefendedTotal: 170,
  currentXI,
  availableSquad: RR_RETAINED_DECISION_PLAYERS,
  surface: "neutral",
  opposition: "balanced",
  venue: "",
  venueEvidence: "unavailable",
});
assert.equal(invalid.valid, false, "Invalid wicket count should fail closed.");
const complete = engine.recommendMatchImpact({
  innings: "chasing",
  score: 170,
  wickets: 3,
  ballsCompleted: 100,
  targetOrDefendedTotal: 170,
  currentXI,
  availableSquad: RR_RETAINED_DECISION_PLAYERS,
  surface: "neutral",
  opposition: "balanced",
  venue: "",
  venueEvidence: "unavailable",
});
assert.equal(complete.phase, "complete");
assert.equal(complete.recommended, null);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      retainedPlayers: 19,
      xiSize: currentXI.length,
      statesChecked: rows.length,
      rows,
      invalidStateRejected: true,
      completedInningsNoRecommendation: true,
    },
    null,
    2,
  ),
);
