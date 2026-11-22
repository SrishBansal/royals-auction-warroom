const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const assert = (condition, message) => {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
};

const frame = read("src/components/war-room.tsx");
const recruitment = read("src/components/recruitment-workbench.tsx");
const sources = read("src/data/rr-2027-data.json");
const readme = read("README.md");
const method = read("docs/rr-recruitment-methodology-report.md");
const audit = read("docs/audits/CANDIDATE_POOL_SCOPE_2026-11-22.md");

assert(
  frame.includes('aria-label="Auction candidate-pool status"'),
  "candidate-pool notice is mounted in the shared PageFrame",
);
assert(frame.includes("SNAPSHOT 22 NOV 2026"), "application notice has a dated market snapshot");
assert(
  frame.includes("does not include new auction registrations"),
  "application notice explicitly excludes new auction registrations",
);
assert(
  frame.includes("23 November") && frame.includes("27 November") && frame.includes("3 December"),
  "application notice includes reported registration milestones",
);
assert(
  recruitment.includes("Released-player research pool — not the final registered auction pool."),
  "Recruitment page repeats the candidate-pool boundary",
);
assert(
  sources.includes("moneycontrol.com/news/cricket/ipl/ipl-2027-bcci-extends-deadline"),
  "Moneycontrol registration timeline is in the source register",
);
assert(
  sources.includes("additional-player requests through Nov 27"),
  "reported additional-player request timeline is sourced",
);
assert(
  readme.includes("does not incorporate new auction registrations"),
  "README explains candidate-pool exclusion",
);
assert(
  method.includes("does not include new auction registrations"),
  "recruitment methodology explains candidate-pool exclusion",
);
assert(
  audit.includes("final registered auction pool"),
  "dated audit records the scope boundary and refresh requirement",
);

if (process.exitCode) process.exit(process.exitCode);
console.log("\nCandidate-pool scope validation passed.");
