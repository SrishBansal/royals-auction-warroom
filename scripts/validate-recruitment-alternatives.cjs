#!/usr/bin/env node
/*
 * Independently exercise the live recruitment fallback selector against the
 * real candidate data. This checks role-based selection is independent of the
 * analyst-curated ordinal board rank.
 */
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
const ts = require("typescript");

const root = process.cwd();
const src = path.join(root, "src");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolveProjectAliases(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    const candidate = path.join(src, request.slice(2));
    for (const file of [candidate + ".ts", candidate + ".json", candidate]) {
      try {
        return originalResolve.call(this, file, parent, isMain, options);
      } catch {}
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
require.extensions[".ts"] = function compileTypeScript(module, filename) {
  const output = ts.transpileModule(require("node:fs").readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const { chooseRoleMatchedAlternative } = require(
  path.join(src, "domain", "recruitment-alternatives.ts"),
);
const { RR_FOCUSED_TARGETS } = require(path.join(src, "domain", "decision-data.ts"));
const candidates = RR_FOCUSED_TARGETS.filter(
  (candidate) =>
    candidate.marketStatus === "RELEASED_REGISTRATION_UNVERIFIED" &&
    candidate.medicalRestriction !== "MEDICAL_REVIEW",
);
assert.equal(
  candidates.length,
  18,
  "Current research alternatives should exclude unresolved market and medical-review profiles.",
);

let matches = 0;
for (const selected of candidates) {
  const result = chooseRoleMatchedAlternative(selected, candidates);
  if (!result) continue;
  matches += 1;
  assert.notEqual(result.candidate.name, selected.name);
  assert.equal(result.candidate.discipline, selected.discipline);
  const overlapsRole = [selected.primaryRole, selected.secondaryRole]
    .filter(Boolean)
    .some(
      (role) => role === result.candidate.primaryRole || role === result.candidate.secondaryRole,
    );
  const overlapsTactic = (selected.tacticalRolesSupported ?? []).some((role) =>
    (result.candidate.tacticalRolesSupported ?? []).includes(role),
  );
  assert.ok(
    overlapsRole || overlapsTactic,
    `${selected.name}: fallback must have an explicit role/tactical overlap.`,
  );

  const reversedRanks = candidates.map((candidate) => ({
    ...candidate,
    rank: 100 - candidate.rank,
  }));
  const rankChangedResult = chooseRoleMatchedAlternative(
    { ...selected, rank: 100 - selected.rank },
    reversedRanks,
  );
  assert.equal(
    rankChangedResult?.candidate.name,
    result.candidate.name,
    `${selected.name}: rank changes must not change fallback selection.`,
  );
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      eligibleResearchProfiles: candidates.length,
      roleMatchedAlternatives: matches,
      rankReversalStable: true,
    },
    null,
    2,
  ),
);
