const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const csvPath = path.join(root, "src/data/rr-2027-released-reference.csv");
const jsonPath = path.join(root, "src/data/rr-2027-released-reference.json");

function parseCsvRow(line) {
  const fields = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  fields.push(value);
  return fields;
}

const csvText = fs
  .readFileSync(csvPath, "utf8")
  .replace(/^\uFEFF/, "")
  .trimEnd();
const [headerLine, ...dataLines] = csvText.split(/\r?\n/);
const headers = parseCsvRow(headerLine);
const csvRows = dataLines.map((line) => {
  const values = parseCsvRow(line);
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
});
const jsonRows = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

if (csvRows.length !== 89 || jsonRows.length !== 89) {
  throw new Error(`Expected 89 reference rows; CSV=${csvRows.length}, JSON=${jsonRows.length}`);
}
if (JSON.stringify(csvRows) !== JSON.stringify(jsonRows)) {
  throw new Error(
    "CSV and JSON release-reference records differ; regenerate the JSON from the CSV source.",
  );
}

const counts = csvRows.reduce((result, row) => {
  result[row.availability_status] = (result[row.availability_status] ?? 0) + 1;
  return result;
}, {});
const expected = {
  released_registration_unverified: 86,
  released_availability_unconfirmed_workload: 1,
  released_unavailable_2027_medical: 1,
  retired_ipl_player_mentor: 1,
};
const statusKeys = Object.keys(expected);
if (
  Object.keys(counts).length !== statusKeys.length ||
  statusKeys.some((key) => counts[key] !== expected[key])
) {
  throw new Error(`Unexpected release-reference status distribution: ${JSON.stringify(counts)}`);
}
const uniquePlayerNames = new Set(csvRows.map((row) => row.player_name.trim().toLowerCase()));
if (uniquePlayerNames.size !== csvRows.length) {
  throw new Error(
    "The release reference contains duplicate player names; review source rows before rendering the register.",
  );
}
if (csvRows.some((row) => row.auction_registration_verified.toLowerCase() === "true")) {
  throw new Error(
    "Source register now contains a verified registration; review the UI market-gate wording and status source before shipping.",
  );
}

console.log(
  "Release reference validation passed: 89 unique rows, CSV/JSON exact match, 86/1/1/1 status split, zero registrations verified.",
);
