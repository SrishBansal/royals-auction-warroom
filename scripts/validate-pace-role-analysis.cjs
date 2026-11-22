const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const data = JSON.parse(read("src/data/rr-2027-data.json"));
const released = JSON.parse(read("src/data/rr-2027-released-reference.json"));
const home = read("src/components/war-room-home.tsx");
const recruitment = read("src/components/recruitment-workbench.tsx");
const audit = read("docs/audits/PACE_AND_HASARANGA_ROLE_REVIEW_2026-11-22.md");
const assert = (condition, message) => {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else console.log(`PASS: ${message}`);
};

const hasaranga = released.find((row) => row.player_name === "Wanindu Hasaranga");
assert(
  data.team.retained_overseas_count === 5,
  "squad baseline has five retained overseas players",
);
assert(
  data.team.additional_overseas_squad_slots_up_to === 3,
  "squad baseline has three additional overseas squad slots",
);
assert(
  hasaranga && hasaranga.overseas_marked_in_pdf === "True",
  "Hasaranga exists in the supplied released-player reference as overseas",
);
assert(
  hasaranga?.availability_status === "released_registration_unverified",
  "Hasaranga is not falsely marked auction-registered",
);
assert(
  recruitment.includes("Shami and Burger are preferred new-ball options"),
  "Recruitment page explains Shami/Burger new-ball roles",
);
assert(
  recruitment.includes("Archer is the strongest overall strike option") &&
    recruitment.includes("death-over flexibility"),
  "Recruitment page explains Archer strike/death flexibility",
);
assert(
  recruitment.includes("Sandeep adds control and variations") ||
    recruitment.includes("Sandeep brings control and variations"),
  "Recruitment page explains Sandeep control/variation value",
);
assert(
  recruitment.includes("Brijesh provides Indian pace and a death-over option"),
  "Recruitment page recognises Brijesh retained death cover",
);
assert(
  recruitment.includes("not an empty role") ||
    recruitment.includes("not an urgent headcount correction"),
  "additional pace is framed as insurance rather than an empty-slot fix",
);
assert(
  recruitment.includes("Why Wanindu Hasaranga is not the spin recommendation"),
  "Hasaranga is explicitly assessed as considered but not prioritised",
);
assert(
  recruitment.includes("attacking leg-spin with potential lower-order hitting / batting utility"),
  "Hasaranga's spin and potential lower-order hitting upside is acknowledged",
);
assert(
  recruitment.includes("independent medical clearance") && recruitment.includes("remaining places"),
  "Hasaranga decision states medical and overseas-slot gates",
);
assert(
  home.includes("Pace depth: insurance, not a vacancy"),
  "homepage Gap Finder reflects the revised pace conclusion",
);
assert(
  home.includes(
    "Hasaranga was considered for attacking leg-spin plus potential lower-order hitting",
  ),
  "homepage explains why Hasaranga was not prioritised",
);
assert(
  data.sources.some(
    (source) =>
      source.url ===
      "https://www.icc-cricket.com/news/injury-sidelines-sri-lanka-spinner-for-odi-series-against-new-zealand",
  ),
  "ICC recurring hamstring evidence is in Sources",
);
assert(
  data.sources.some((source) => source.url === "https://www.ft.lk/a/b/1-788106"),
  "2026 injury availability report is in Sources",
);
assert(
  data.sources.some(
    (source) =>
      source.url ===
      "https://www.iplt20.com/news/article/tata-ipl-2027-player-retentions-announced",
  ),
  "official retained overseas count source is in Sources",
);
assert(
  audit.includes("selective pace insurance") &&
    audit.includes("Hasaranga considered, not prioritised"),
  "methodology audit records the decision and counterargument",
);

if (process.exitCode) process.exit(process.exitCode);
console.log("\nPace-role and Hasaranga decision validation passed.");
