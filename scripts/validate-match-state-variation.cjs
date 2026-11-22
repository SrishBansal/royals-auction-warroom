#!/usr/bin/env node
/*
 * Match-state sensitivity regression: uses the actual TypeScript decision engine.
 * It tests role and candidate changes for deliberately varied scenarios without
 * asserting that every input must force a different player from a constrained bench.
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
assert.equal(RR_RETAINED_DECISION_PLAYERS.length, 19);
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
assert.ok(baseline.recommendations.length);
const currentXI = baseline.recommendations[0].players.map((entry) => entry.player.name);
const states = [
  {
    id: "first-innings-platform",
    innings: "batting-first",
    score: 45,
    wickets: 0,
    ballsCompleted: 30,
    targetOrDefendedTotal: 185,
    phase: "powerplay",
  },
  {
    id: "first-innings-build",
    innings: "batting-first",
    score: 53,
    wickets: 1,
    ballsCompleted: 60,
    targetOrDefendedTotal: 170,
    phase: "middle",
  },
  {
    id: "first-innings-collapse",
    innings: "batting-first",
    score: 50,
    wickets: 5,
    ballsCompleted: 60,
    targetOrDefendedTotal: 170,
    phase: "middle",
  },
  {
    id: "first-innings-death-collapse",
    innings: "batting-first",
    score: 135,
    wickets: 6,
    ballsCompleted: 96,
    targetOrDefendedTotal: 190,
    phase: "death",
  },
  {
    id: "chase-platform",
    innings: "chasing",
    score: 55,
    wickets: 0,
    ballsCompleted: 30,
    targetOrDefendedTotal: 185,
    phase: "powerplay",
  },
  {
    id: "chase-comfort",
    innings: "chasing",
    score: 82,
    wickets: 1,
    ballsCompleted: 60,
    targetOrDefendedTotal: 170,
    phase: "middle",
  },
  {
    id: "chase-acceleration",
    innings: "chasing",
    score: 53,
    wickets: 3,
    ballsCompleted: 60,
    targetOrDefendedTotal: 170,
    phase: "middle",
  },
  {
    id: "chase-collapse",
    innings: "chasing",
    score: 56,
    wickets: 6,
    ballsCompleted: 60,
    targetOrDefendedTotal: 170,
    phase: "middle",
  },
  {
    id: "chase-death",
    innings: "chasing",
    score: 144,
    wickets: 4,
    ballsCompleted: 96,
    targetOrDefendedTotal: 190,
    phase: "death",
  },
  {
    id: "defend-powerplay",
    innings: "defending",
    score: 33,
    wickets: 0,
    ballsCompleted: 24,
    targetOrDefendedTotal: 185,
    phase: "powerplay",
  },
  {
    id: "defend-middle",
    innings: "defending",
    score: 80,
    wickets: 1,
    ballsCompleted: 60,
    targetOrDefendedTotal: 185,
    phase: "middle",
  },
  {
    id: "defend-death",
    innings: "defending",
    score: 160,
    wickets: 4,
    ballsCompleted: 96,
    targetOrDefendedTotal: 185,
    phase: "death",
  },
];
const results = [];
for (const state of states) {
  const decision = engine.recommendMatchImpact({
    ...state,
    currentXI,
    availableSquad: RR_RETAINED_DECISION_PLAYERS,
    surface: "neutral",
    surfaceSource: "neutral-fallback",
    opposition: "balanced",
    venue: "",
    venueEvidence: "unavailable",
  });
  assert.equal(decision.valid, true, `${state.id}: valid state rejected.`);
  assert.equal(decision.phase, state.phase, `${state.id}: wrong phase.`);
  assert.ok(decision.recommended, `${state.id}: empty Impact Player output.`);
  assert.ok(decision.candidatesEvaluated > 0, `${state.id}: no players evaluated.`);
  assert.ok(decision.combinations.length > 0, `${state.id}: no valid replacement combinations.`);
  assert.ok(
    RR_RETAINED_DECISION_PLAYERS.some((p) => p.name === decision.recommended.name),
    `${state.id}: recommendation outside retained squad.`,
  );
  assert.ok(
    !currentXI.includes(decision.recommended.name),
    `${state.id}: recommended player already in XI.`,
  );
  for (const combo of decision.combinations) {
    assert.equal(combo.assessment.valid, true, `${state.id}: illegal substitution.`);
    assert.ok(currentXI.includes(combo.outgoing.name), `${state.id}: outgoing player not in XI.`);
    assert.ok(
      !currentXI.includes(combo.incoming.name),
      `${state.id}: incoming player already in XI.`,
    );
    assert.ok(
      RR_RETAINED_DECISION_PLAYERS.some((p) => p.name === combo.incoming.name),
      `${state.id}: incoming outside retained pool.`,
    );
    assert.ok(
      combo.assessment.afterCoverage.overseas <= engine.MAX_OVERSEAS_XI,
      `${state.id}: overseas XI cap breached.`,
    );
  }
  results.push({
    id: state.id,
    phase: decision.phase,
    requiredRole: decision.requiredRole,
    situation: decision.situation,
    recommended: decision.recommended.name,
    alternatives: decision.alternatives.map((p) => p.name),
    combinations: decision.combinations.length,
  });
}
const byId = Object.fromEntries(results.map((r) => [r.id, r]));
// Match-state changes must change the role interpretation even when a constrained bench
// legitimately returns the same partial-cover batter for multiple batting situations.
assert.notEqual(
  byId["first-innings-platform"].requiredRole,
  byId["first-innings-collapse"].requiredRole,
  "First-innings wicket collapse must change the required role.",
);
assert.notEqual(
  byId["chase-comfort"].requiredRole,
  byId["chase-acceleration"].requiredRole,
  "A high required rate must change the chase role requirement.",
);
assert.notEqual(
  byId["chase-acceleration"].requiredRole,
  byId["chase-collapse"].requiredRole,
  "A wicket collapse must change the chase role requirement.",
);
assert.notEqual(
  byId["defend-powerplay"].requiredRole,
  byId["defend-middle"].requiredRole,
  "Defending powerplay and middle roles must differ.",
);
assert.notEqual(
  byId["defend-middle"].requiredRole,
  byId["defend-death"].requiredRole,
  "Defending middle and death roles must differ.",
);
const distinctRecommendations = new Set(results.map((r) => r.recommended));
assert.ok(
  distinctRecommendations.size >= 3,
  `Expected multiple phase/discipline options, found ${distinctRecommendations.size}.`,
);
assert.notEqual(
  byId["defend-powerplay"].recommended,
  byId["defend-middle"].recommended,
  "Bowling recommendation should change between new-ball and middle-over requirements in retained-only case.",
);
assert.notEqual(
  byId["defend-middle"].recommended,
  byId["defend-death"].recommended,
  "Bowling recommendation should change between middle and death requirements in retained-only case.",
);
const invalid = engine.recommendMatchImpact({
  innings: "chasing",
  score: 50,
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
assert.equal(invalid.valid, false, "Invalid wickets must fail closed.");
console.log(
  JSON.stringify(
    {
      status: "PASS",
      retainedPlayers: 19,
      statesTested: states.length,
      distinctRecommendations: [...distinctRecommendations],
      roleSensitivityAssertions: 5,
      defendingCandidateChanges: 2,
      invalidStateRejected: true,
      results,
      note: "A repeated batter option is permitted when the selected retained-only bench contains only partial batting-depth options; role requirement and XI trade-off must still respond to state.",
    },
    null,
    2,
  ),
);
