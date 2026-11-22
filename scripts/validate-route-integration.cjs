#!/usr/bin/env node
/* Static route/navigation integrity check. Does not replace browser rendering QA. */
const fs = require("node:fs");
const path = require("node:path");
const root = process.cwd();
const routes = [
  "/",
  "/targets",
  "/squad",
  "/match-lab",
  "/knockouts",
  "/spatial-lab",
  "/pressure-rankings",
  "/sources",
];
const routeFiles = [
  "index",
  "targets",
  "squad",
  "match-lab",
  "knockouts",
  "spatial-lab",
  "pressure-rankings",
  "sources",
];
const tree = fs.readFileSync(path.join(root, "src/routeTree.gen.ts"), "utf8");
const navigation = fs.readFileSync(path.join(root, "src/data/war-room.ts"), "utf8");
const home = fs.readFileSync(path.join(root, "src/components/war-room-home.tsx"), "utf8");
const spatialRoute = fs.readFileSync(path.join(root, "src/routes/spatial-lab.tsx"), "utf8");
const spatialComponent = fs.readFileSync(
  path.join(root, "src/components/spatial-intelligence.tsx"),
  "utf8",
);
const spatialData = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/spatial/spatial-model-pilot.json"), "utf8"),
);
const pressureRoute = fs.readFileSync(path.join(root, "src/routes/pressure-rankings.tsx"), "utf8");
const pressurePage = fs.readFileSync(
  path.join(root, "src/components/pressure-rankings.tsx"),
  "utf8",
);
const pressureData = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/pressure-rankings.json"), "utf8"),
);
const sourcesRoute = fs.readFileSync(path.join(root, "src/routes/sources.tsx"), "utf8");
const sourcesPage = fs.readFileSync(path.join(root, "src/components/sources.tsx"), "utf8");
const sourceData = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/rr-2027-data.json"), "utf8"),
);
const missing = [];
for (const file of routeFiles)
  if (!fs.existsSync(path.join(root, `src/routes/${file}.tsx`)))
    missing.push(`route file missing: ${file}`);
for (const route of routes) {
  const routeKey = route === "/" ? "'/'" : `'${route}'`;
  if (!tree.includes(routeKey)) missing.push(`route not registered in generated tree: ${route}`);
}
if (!navigation.includes('to: "/spatial-lab"'))
  missing.push("Kadamba entry missing from primary navigation");
if (!home.includes('to="/spatial-lab"') || !home.includes("Kadamba zones"))
  missing.push("Kadamba homepage entry missing");
if (!spatialRoute.includes('createFileRoute("/spatial-lab")'))
  missing.push("Kadamba route component not bound to /spatial-lab");
if (!spatialComponent.includes("Kadamba 25-zone")) missing.push("Kadamba map component missing");
if (!spatialComponent.includes("uncalibrated model estimates"))
  missing.push("Wicket output calibration limitation is not visible");
if (!spatialComponent.includes("only known after release"))
  missing.push("Post-release ball-speed limitation is not visible");
if (spatialData.zones?.length !== 25)
  missing.push(`expected 25 spatial zones, found ${spatialData.zones?.length}`);
if (!tree.includes("'/spatial-lab': typeof SpatialLabRoute"))
  missing.push("Kadamba route absent from TanStack route type map");
if (!navigation.includes('to: "/pressure-rankings"'))
  missing.push("IPL-only pressure rankings entry missing from primary navigation");
if (!home.includes('to="/pressure-rankings"') || !home.includes("IPL pressure ranks"))
  missing.push("IPL pressure rankings homepage entry missing");
if (!pressureRoute.includes('createFileRoute("/pressure-rankings")'))
  missing.push("Pressure rankings route is not bound to /pressure-rankings");
if (!pressurePage.includes("Top 10 batters") || !pressurePage.includes("Top 10 bowlers"))
  missing.push("Pressure ranking page must expose both ordered lists");
if (pressureData.batters?.length !== 10 || pressureData.bowlers?.length !== 10)
  missing.push("Pressure rankings data must contain exactly 10 batters and 10 bowlers");
if (
  !String(pressureData.scope).includes("IPL only") ||
  !String(pressureData.scope).includes("T20I excluded")
)
  missing.push("Pressure rankings scope is not IPL-only explicit");
if (!tree.includes("'/pressure-rankings': typeof PressureRankingsRoute"))
  missing.push("Pressure rankings route absent from TanStack route type map");
if (!tree.includes("'/sources': typeof SourcesRoute"))
  missing.push("Sources route absent from TanStack route type map");
if (!navigation.includes('to: "/sources"'))
  missing.push("Sources and methods entry missing from primary navigation");
if (!home.includes('to="/sources"')) missing.push("Sources and methods homepage entry missing");
if (!sourcesRoute.includes('createFileRoute("/sources")'))
  missing.push("Sources page not bound to /sources");
if (
  !sourcesPage.includes("Source register") ||
  !sourcesPage.includes("IPL Pressure Rankings") ||
  !sourcesPage.includes("Kadamba 25-zone model")
)
  missing.push("Sources page missing register or model provenance sections");
if (sourceData.sources?.length !== 30)
  missing.push(`Expected 30 source-register records, found ${sourceData.sources?.length}`);
if (
  !sourceData.sources?.some(
    (source) =>
      String(source.name).includes("registration timeline") &&
      String(source.url).includes("moneycontrol.com"),
  )
)
  missing.push("Auction-registration timeline source missing from source register");
if (missing.length) {
  console.error(missing.map((item) => `FAIL: ${item}`).join("\n"));
  process.exit(1);
}
console.log(
  JSON.stringify(
    {
      status: "PASS",
      registeredRoutes: routes,
      standaloneResearchRoutes: ["/spatial-lab", "/pressure-rankings"],
      homeAndNavEntryPoints: true,
      zoneCount: spatialData.zones.length,
      pressureTop10: { batters: pressureData.batters.length, bowlers: pressureData.bowlers.length },
      browserRenderingCertified: false,
    },
    null,
    2,
  ),
);
