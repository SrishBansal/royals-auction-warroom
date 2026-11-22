#!/usr/bin/env node
/*
 * Reproduce the Match Lab venue/surface/opposition/match-state matrix using
 * the actual TypeScript domain engine. Run from the repository root after
 * `bun install` (or `npm install`):
 *   node scripts/validate-impact-player-matrix.cjs
 *
 * This is a deterministic wiring/constraint stress test, not a forecast
 * accuracy test. It writes the row-level evidence to docs/.
 */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
const ts = require("typescript");

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");
const docsRoot = path.join(projectRoot, "docs");
const packageJson = path.join(projectRoot, "package.json");
if (
  !fs.existsSync(packageJson) ||
  !fs.existsSync(path.join(srcRoot, "domain", "rr-decision-engine.ts"))
) {
  throw new Error("Run this script from the Royals War Room repository root.");
}

const originalResolve = Module._resolveFilename;
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
  return originalResolve.call(this, request, parent, isMain, options);
};

require.extensions[".ts"] = function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
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

const engine = require(path.join(srcRoot, "domain", "rr-decision-engine.ts"));
const decisionData = require(path.join(srcRoot, "domain", "decision-data.ts"));
const historical = require(path.join(srcRoot, "domain", "historical-impact.ts"));

// Fail loudly if a visible Match Lab venue label cannot resolve to the same
// numeric ground ID in the historical evidence model.
for (const venueOption of engine.HISTORICAL_VENUE_OPTIONS) {
  const evidence = historical.getHistoricalVenueEvidence(venueOption.venue, "middle");
  assert.equal(
    evidence?.venueId,
    venueOption.venueId,
    `Venue label did not resolve to its historical ID: ${venueOption.venue}`,
  );
}

const retained = decisionData.RR_RETAINED_DECISION_PLAYERS;
const basePlan = engine.optimizeRRLineups({
  retainedPlayers: retained,
  targetPool: decisionData.RR_FOCUSED_TARGETS,
  selectedAcquisitions: [],
  context: {
    venue: "",
    venueEvidence: "unavailable",
    surface: "neutral",
    opposition: "balanced",
    objective: "balanced",
  },
  limit: 3,
});
assert.ok(
  basePlan.recommendations.length > 0,
  "A retained-only baseline XI must exist for this test fixture.",
);
const currentXI = basePlan.recommendations[0].players.map((entry) => entry.player.name);
const selectedTargetNames = [
  "Matthew Breetzke",
  "Abishek Porel",
  "Nitish Rana",
  "Mitch Owen",
  "Avesh Khan",
  "Akash Madhwal",
];
const selectedTargets = decisionData.RR_FOCUSED_TARGETS.filter(
  (player) => selectedTargetNames.includes(player.name) && engine.canUseHypotheticalTarget(player),
);
const activeSquad = [...retained, ...selectedTargets];
const venues = [
  ...engine.HISTORICAL_VENUE_OPTIONS.map((option) => option.venue),
  "Unlisted / unknown ground",
];
const surfaceSelections = [
  "venue-default",
  "neutral",
  "slow",
  "dry",
  "dew",
  "pace-friendly",
  "bouncy",
];
const oppositions = ["balanced", "spin-heavy", "pace-heavy", "left-hand-heavy", "right-hand-heavy"];
const matchStates = [
  {
    id: "first-innings-platform",
    innings: "batting-first",
    score: 82,
    wickets: 2,
    ballsCompleted: 54,
    targetOrDefendedTotal: null,
  },
  {
    id: "chase-acceleration",
    innings: "chasing",
    score: 53,
    wickets: 3,
    ballsCompleted: 60,
    targetOrDefendedTotal: 170,
  },
  {
    id: "chase-collapse",
    innings: "chasing",
    score: 56,
    wickets: 6,
    ballsCompleted: 60,
    targetOrDefendedTotal: 170,
  },
  {
    id: "defend-early-partnership",
    innings: "defending",
    score: 59,
    wickets: 0,
    ballsCompleted: 36,
    targetOrDefendedTotal: 215,
  },
  {
    id: "defend-death",
    innings: "defending",
    score: 155,
    wickets: 3,
    ballsCompleted: 96,
    targetOrDefendedTotal: 215,
  },
];

const rows = [];
const uniqueRecommendations = new Set();
let invalid = 0;
let empty = 0;
for (const venue of venues) {
  for (const surfaceSelection of surfaceSelections) {
    for (const opposition of oppositions) {
      for (const state of matchStates) {
        const resolved = engine.resolveVenueSurface(venue, surfaceSelection);
        const decision = engine.recommendMatchImpact({
          ...state,
          surface: resolved.surface,
          surfaceSource: resolved.source,
          opposition,
          currentXI,
          availableSquad: activeSquad,
          venue,
          venueEvidence: "analyst-input",
        });
        if (!decision.valid) invalid += 1;
        if (!decision.recommended) empty += 1;
        if (decision.recommended) {
          uniqueRecommendations.add(decision.recommended.name);
          assert.ok(
            activeSquad.some((player) => player.name === decision.recommended.name),
            "Recommendation must belong to the active squad pool.",
          );
          assert.ok(
            !currentXI.includes(decision.recommended.name),
            "Recommendation must be outside the current XI.",
          );
          const overseasInXI = currentXI.filter(
            (name) => activeSquad.find((player) => player.name === name)?.overseas,
          ).length;
          assert.ok(
            !decision.recommended.overseas || overseasInXI < engine.MAX_OVERSEAS_XI,
            "Do not recommend a fifth overseas player.",
          );
          // Alternatives are recommendations too; verify they obey the same pool and XI rules.
          for (const alternative of decision.alternatives) {
            assert.ok(
              activeSquad.some((player) => player.name === alternative.name),
              "Alternative must belong to the active squad pool.",
            );
            assert.ok(
              !currentXI.includes(alternative.name),
              "Alternative must be outside the current XI.",
            );
            assert.ok(
              !alternative.overseas || overseasInXI < engine.MAX_OVERSEAS_XI,
              "Alternative must respect the overseas-XI limit.",
            );
          }
        }
        const topEvidence =
          decision.historicalEvidence.find(
            (entry) => entry.playerName === decision.recommended?.name,
          )?.evidence ?? null;
        rows.push({
          venue,
          surfaceSelection,
          resolvedSurface: resolved.surface,
          surfaceSource: resolved.source,
          opposition,
          matchState: state.id,
          valid: decision.valid,
          phase: decision.phase,
          requiredRole: decision.requiredRole,
          recommended: decision.recommended?.name ?? "",
          alternatives: decision.alternatives.map((entry) => entry.name).join(";"),
          topMetricPer100: topEvidence?.tieBreakContextMetricPer100 ?? null,
          topSampleBalls: topEvidence?.sampleBalls ?? 0,
          topMatches: topEvidence?.matches ?? 0,
          venueSampleBalls: topEvidence?.venueSampleBalls ?? 0,
          venueSampleMatches: topEvidence?.venueSampleMatches ?? 0,
          venueEvidenceUsed: topEvidence?.venueEvidenceUsed ?? false,
          opponentStyle: topEvidence?.opponentStyle ?? "",
          opponentStyleSampleBalls: topEvidence?.opponentStyleBalls ?? 0,
          opponentStyleMatches: topEvidence?.opponentStyleMatches ?? 0,
          opponentStyleEvidenceUsed: topEvidence?.opponentStyleEvidenceUsed ?? false,
          topRankedEvidence: JSON.stringify(
            decision.historicalEvidence.slice(0, 3).map((entry) => ({
              name: entry.playerName,
              roleScore: entry.roleScore,
              tieBreakContextMetricPer100: entry.evidence.tieBreakContextMetricPer100,
              sampleBalls: entry.evidence.sampleBalls,
              matches: entry.evidence.matches,
              venueName: entry.evidence.venueName,
              venueSampleBalls: entry.evidence.venueSampleBalls,
              venueSampleMatches: entry.evidence.venueSampleMatches,
              venueEvidenceUsed: entry.evidence.venueEvidenceUsed,
              opponentStyle: entry.evidence.opponentStyle,
              opponentStyleBalls: entry.evidence.opponentStyleBalls,
              opponentStyleMatches: entry.evidence.opponentStyleMatches,
              opponentStyleEvidenceUsed: entry.evidence.opponentStyleEvidenceUsed,
            })),
          ),
          warnings: decision.warnings.join(" | "),
        });
      }
    }
  }
}

function findRow(venue, surfaceSelection, opposition, matchState) {
  return rows.find(
    (row) =>
      row.venue === venue &&
      row.surfaceSelection === surfaceSelection &&
      row.opposition === opposition &&
      row.matchState === matchState,
  );
}
function distinctRecommendationCount(values) {
  return new Set(values.filter(Boolean)).size;
}

let venueCompared = 0;
let venueChanged = 0;
let surfaceCompared = 0;
let surfaceChanged = 0;
let oppositionCompared = 0;
let oppositionChanged = 0;
for (const surface of ["venue-default", "neutral"]) {
  for (const opposition of oppositions) {
    for (const state of matchStates) {
      const recommendations = venues.map(
        (venue) => findRow(venue, surface, opposition, state.id)?.recommended,
      );
      if (distinctRecommendationCount(recommendations) > 1) venueChanged += 1;
      if (recommendations.filter(Boolean).length > 1) venueCompared += 1;
    }
  }
}
for (const venue of venues) {
  for (const opposition of oppositions) {
    for (const state of matchStates) {
      const recommendations = surfaceSelections.map(
        (surface) => findRow(venue, surface, opposition, state.id)?.recommended,
      );
      if (distinctRecommendationCount(recommendations) > 1) surfaceChanged += 1;
      if (recommendations.filter(Boolean).length > 1) surfaceCompared += 1;
    }
  }
}
for (const venue of venues) {
  for (const surface of surfaceSelections) {
    for (const state of matchStates) {
      const recommendations = oppositions.map(
        (opposition) => findRow(venue, surface, opposition, state.id)?.recommended,
      );
      if (distinctRecommendationCount(recommendations) > 1) oppositionChanged += 1;
      if (recommendations.filter(Boolean).length > 1) oppositionCompared += 1;
    }
  }
}

const representativeVenues = [
  "Wankhede Stadium, Mumbai",
  "M. A. Chidambaram Stadium (Chepauk), Chennai",
  "Sawai Mansingh Stadium, Jaipur",
];
const examples = matchStates.map((state) => ({
  state: state.id,
  recommendations: Object.fromEntries(
    representativeVenues.map((venue) => [
      venue,
      findRow(venue, "venue-default", "balanced", state.id)?.recommended ?? null,
    ]),
  ),
}));

assert.equal(
  invalid,
  0,
  "No invalid engine result should be emitted for the complete test matrix.",
);
assert.equal(
  empty,
  0,
  "Every selected active-pool test state should produce a candidate or the fixture should be revised.",
);
assert.equal(
  rows.length,
  venues.length * surfaceSelections.length * oppositions.length * matchStates.length,
);

const report = {
  generatedAt: new Date().toISOString(),
  method:
    "Actual TypeScript domain engine executed through TypeScript transpilation; scoring was not reimplemented.",
  venueMappingChecks: engine.HISTORICAL_VENUE_OPTIONS.map((option) => {
    const evidence = historical.getHistoricalVenueEvidence(option.venue, "middle");
    return {
      label: option.venue,
      expectedVenueId: option.venueId,
      resolvedVenueId: evidence?.venueId ?? null,
      historicalMatches: evidence?.matches ?? null,
      matched: evidence?.venueId === option.venueId,
    };
  }),
  matrix: {
    mappedVenues: engine.HISTORICAL_VENUE_OPTIONS.length,
    venueCasesIncludingUnknown: venues.length,
    surfaceSelections: surfaceSelections.length,
    oppositionProfiles: oppositions.length,
    matchStates: matchStates.length,
    totalRuns: rows.length,
    validRuns: rows.length - invalid,
    invalidRuns: invalid,
    emptyRecommendations: empty,
    distinctFirstChoicePlayers: [...uniqueRecommendations].sort(),
  },
  controlledVariation: {
    venue: { comparedGroups: venueCompared, firstChoiceChangedGroups: venueChanged },
    manualSurface: { comparedGroups: surfaceCompared, firstChoiceChangedGroups: surfaceChanged },
    oppositionProfile: {
      comparedGroups: oppositionCompared,
      firstChoiceChangedGroups: oppositionChanged,
    },
  },
  examples,
  evidenceUseSummary: {
    topRecommendationWithPlayerVenueEvidence: rows.filter((row) => row.venueEvidenceUsed).length,
    topRecommendationWithOpponentStyleEvidence: rows.filter((row) => row.opponentStyleEvidenceUsed)
      .length,
  },
  venueEvidenceExamples: [
    {
      venue: "Wankhede Stadium, Mumbai",
      matchState: "first-innings-platform",
      player: "Nitish Rana",
    },
    {
      venue: "M. A. Chidambaram Stadium (Chepauk), Chennai",
      matchState: "first-innings-platform",
      player: "Nitish Rana",
    },
    {
      venue: "Sawai Mansingh Stadium, Jaipur",
      matchState: "first-innings-platform",
      player: "Nitish Rana",
    },
    { venue: "Wankhede Stadium, Mumbai", matchState: "defend-death", player: "Akash Madhwal" },
    {
      venue: "M. A. Chidambaram Stadium (Chepauk), Chennai",
      matchState: "defend-death",
      player: "Akash Madhwal",
    },
    {
      venue: "Sawai Mansingh Stadium, Jaipur",
      matchState: "defend-death",
      player: "Akash Madhwal",
    },
  ].map((item) => {
    const row = findRow(item.venue, "venue-default", "balanced", item.matchState);
    return {
      ...item,
      recommended: row?.recommended ?? null,
      sampleBalls: row?.topSampleBalls ?? 0,
      matches: row?.topMatches ?? 0,
      groundSampleBalls: row?.venueSampleBalls ?? 0,
      groundSampleMatches: row?.venueSampleMatches ?? 0,
      groundEvidenceUsed: row?.venueEvidenceUsed ?? false,
      finalHistoricalMetricPer100: row?.topMetricPer100 ?? null,
    };
  }),
  selectedSquad: {
    retainedPlayers: retained.length,
    selectedHypotheticalProfiles: selectedTargets.map((player) => player.name),
    activeSquadSize: activeSquad.length,
    startingXI: currentXI,
  },
  historicalModelSummary: historical.getHistoricalModelSummary(),
  historicalImpactUsageSummary: historical.getHistoricalImpactUsage(),
  interpretation:
    "This matrix validates deterministic behaviour, sample-gated evidence wiring and structural constraints for one selected active squad package. It does not validate future-match prediction accuracy. The model's chronological holdout performance is modest and mixed; venue-only effects may not change the first choice when the role-fit gap is larger.",
};

fs.mkdirSync(docsRoot, { recursive: true });
fs.writeFileSync(
  path.join(docsRoot, "impact-player-historical-matrix.json"),
  JSON.stringify(report, null, 2),
);
const headers = [
  "venue",
  "surfaceSelection",
  "resolvedSurface",
  "surfaceSource",
  "opposition",
  "matchState",
  "valid",
  "phase",
  "requiredRole",
  "recommended",
  "alternatives",
  "topMetricPer100",
  "topSampleBalls",
  "topMatches",
  "venueSampleBalls",
  "venueSampleMatches",
  "venueEvidenceUsed",
  "opponentStyle",
  "opponentStyleSampleBalls",
  "opponentStyleMatches",
  "opponentStyleEvidenceUsed",
  "topRankedEvidence",
  "warnings",
];
const csv = [
  headers.join(","),
  ...rows.map((row) =>
    headers.map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`).join(","),
  ),
].join("\n");
fs.writeFileSync(path.join(docsRoot, "impact-player-historical-matrix.csv"), csv + "\n");
console.log(JSON.stringify(report, null, 2));
