import historicalModelJson from "@/data/historical-impact-model.json";

export type HistoricalPhase = "powerplay" | "middle" | "death";
export type HistoricalDiscipline = "batting" | "bowling";

type NumericRecord = Record<string, number | string | undefined>;
type PlayerHistoricalProfile = {
  name: string;
  data_status: string;
  batting?: {
    total_legal_balls?: number;
    matches?: number;
    by_phase?: Record<string, NumericRecord>;
    by_bowling_type?: Record<string, NumericRecord>;
    by_phase_and_bowling_type?: Record<string, Record<string, NumericRecord>>;
    by_phase_and_batter_hand?: Record<string, Record<string, NumericRecord>>;
    by_phase_and_venue?: Record<string, Record<string, NumericRecord>>;
  };
  bowling?: {
    legal_balls?: number;
    matches?: number;
    by_phase?: Record<string, NumericRecord>;
    by_bowling_type?: Record<string, NumericRecord>;
    by_phase_and_bowling_type?: Record<string, Record<string, NumericRecord>>;
    by_phase_and_batter_hand?: Record<string, Record<string, NumericRecord>>;
    by_phase_and_venue?: Record<string, Record<string, NumericRecord>>;
  };
  historical_impact_usage?: {
    incoming_matches?: number;
    outgoing_matches?: number;
    window?: string;
  };
};

type VenueProfile = {
  venue_id: number;
  venue_name: string;
  mapping_confidence: string;
  mapping_basis: string;
  matches: number;
  seasons: number[];
  first_innings_avg_total: number | null;
  batting_first_win_pct: number | null;
  phases: Record<string, NumericRecord>;
  bowling_type_profile: Record<string, NumericRecord>;
  phase_bowling_type_profile?: Record<string, Record<string, NumericRecord>>;
};

type HistoricalImpactModel = {
  meta: Record<string, unknown>;
  venues: Record<string, VenueProfile>;
  players: Record<string, PlayerHistoricalProfile>;
  venueAliases: Array<{
    venueId: number;
    name: string;
    aliases: string[];
    mappingConfidence: string;
    mappingBasis: string;
    matches: number;
  }>;
  impactUsage: {
    incoming_records?: number;
    outgoing_records?: number;
    matches_with_incoming_record?: number;
    warning?: string;
  };
};

const model = historicalModelJson as unknown as HistoricalImpactModel;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function number(value: number | string | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export interface HistoricalVenueEvidence {
  venueId: number;
  name: string;
  mappingConfidence: string;
  mappingBasis: string;
  matches: number;
  seasons: number[];
  firstInningsAverage: number | null;
  battingFirstWinPct: number | null;
  phase: HistoricalPhase;
  phaseBalls: number;
  phaseMatches: number;
  batterRunsPer100: number | null;
  wicketsPer100: number | null;
  pace: {
    balls: number;
    matches: number;
    batterRunsPer100Legal: number | null;
    wicketsPer100: number | null;
    contextBatterRunsPreventedPer100: number | null;
  } | null;
  spin: {
    balls: number;
    matches: number;
    batterRunsPer100Legal: number | null;
    wicketsPer100: number | null;
    contextBatterRunsPreventedPer100: number | null;
  } | null;
}

export interface HistoricalPlayerEvidence {
  playerName: string;
  discipline: HistoricalDiscipline;
  phase: HistoricalPhase;
  dataAvailable: boolean;
  sampleBalls: number;
  matches: number;
  rawRunsPer100: number | null;
  rawContextMetricPer100: number | null;
  shrunkenContextMetricPer100: number | null;
  confidence: "higher" | "moderate" | "low" | "no IPL sample";
  venueName: string | null;
  venueSampleBalls: number;
  venueSampleMatches: number;
  venueRawContextMetricPer100: number | null;
  venueBlendedContextMetricPer100: number | null;
  venueEvidenceUsed: boolean;
  opponentStyle: "pace" | "spin" | "left-hand" | "right-hand" | null;
  opponentStyleBalls: number;
  opponentStyleMatches: number;
  opponentStyleContextMetricPer100: number | null;
  opponentStyleShrunkenMetricPer100: number | null;
  opponentStyleEvidenceUsed: boolean;
  /** Single deterministic historical context metric used within role-fit bands. */
  tieBreakContextMetricPer100: number | null;
  impactIncomingMatches: number;
  impactOutgoingMatches: number;
  impactUsageWindow: string | null;
  note: string;
}

export function getHistoricalModelSummary() {
  return model.meta;
}

export function getHistoricalImpactUsage() {
  return model.impactUsage;
}

export function resolveHistoricalVenue(venue: string): VenueProfile | null {
  const query = normalize(venue);
  if (!query) return null;
  // Only accept a complete canonical name or a complete curated alias.
  // Fuzzy substring matches can silently map a city/partial string to the
  // wrong ground (for example, a generic "Mumbai" value is not enough to
  // establish Wankhede). Add an explicit alias when a common short form is safe.
  const found = model.venueAliases.find((entry) => {
    const names = [entry.name, ...entry.aliases].map(normalize).filter(Boolean);
    return names.includes(query);
  });
  return found ? (model.venues[String(found.venueId)] ?? null) : null;
}

export function getHistoricalVenueEvidence(
  venue: string,
  phase: HistoricalPhase,
): HistoricalVenueEvidence | null {
  const profile = resolveHistoricalVenue(venue);
  if (!profile) return null;
  const phaseStats = profile.phases[phase] ?? {};
  const typeStats = profile.phase_bowling_type_profile?.[phase] ?? {};
  const toType = (key: "pace" | "spin") => {
    const row = typeStats[key];
    if (!row) return null;
    return {
      balls: number(row["legal_balls"]) ?? 0,
      matches: number(row["matches"]) ?? 0,
      batterRunsPer100Legal: number(row["batter_runs_per_100_legal"]),
      wicketsPer100: number(row["wickets_per_100_legal"]),
      contextBatterRunsPreventedPer100: number(row["context_batter_runs_prevented_per_100"]),
    };
  };
  return {
    venueId: profile.venue_id,
    name: profile.venue_name,
    mappingConfidence: profile.mapping_confidence,
    mappingBasis: profile.mapping_basis,
    matches: profile["matches"],
    seasons: profile.seasons,
    firstInningsAverage: profile.first_innings_avg_total,
    battingFirstWinPct: profile.batting_first_win_pct,
    phase,
    phaseBalls: number(phaseStats["legal_balls"]) ?? 0,
    phaseMatches: number(phaseStats["matches"]) ?? 0,
    batterRunsPer100: number(phaseStats["batter_runs_per_100_legal"]),
    wicketsPer100: number(phaseStats["wickets_per_100_legal"]),
    pace: toType("pace"),
    spin: toType("spin"),
  };
}

export function getHistoricalPlayerEvidence(
  playerName: string,
  discipline: HistoricalDiscipline,
  phase: HistoricalPhase,
  venue: string,
  opposition: string,
): HistoricalPlayerEvidence {
  const profile = model.players[playerName];
  const empty: HistoricalPlayerEvidence = {
    playerName,
    discipline,
    phase,
    dataAvailable: false,
    sampleBalls: 0,
    matches: 0,
    rawRunsPer100: null,
    rawContextMetricPer100: null,
    shrunkenContextMetricPer100: null,
    confidence: "no IPL sample",
    venueName: null,
    venueSampleBalls: 0,
    venueSampleMatches: 0,
    venueRawContextMetricPer100: null,
    venueBlendedContextMetricPer100: null,
    venueEvidenceUsed: false,
    opponentStyle: null,
    opponentStyleBalls: 0,
    opponentStyleMatches: 0,
    opponentStyleContextMetricPer100: null,
    opponentStyleShrunkenMetricPer100: null,
    opponentStyleEvidenceUsed: false,
    tieBreakContextMetricPer100: null,
    impactIncomingMatches: number(profile?.historical_impact_usage?.incoming_matches) ?? 0,
    impactOutgoingMatches: number(profile?.historical_impact_usage?.outgoing_matches) ?? 0,
    impactUsageWindow: profile?.historical_impact_usage?.window ?? null,
    note: "No player-level IPL delivery sample exists for this player in the supplied 2022–2026 archive. Role scouting remains visible, but no historical performance estimate is invented.",
  };
  if (!profile) return empty;
  const disciplineProfile = discipline === "batting" ? profile.batting : profile.bowling;
  const phaseRow = disciplineProfile?.by_phase?.[phase];
  if (!phaseRow) return empty;

  const isBatting = discipline === "batting";
  const sampleBalls = number(isBatting ? phaseRow["balls"] : phaseRow["legal_balls"]) ?? 0;
  const matches = number(phaseRow["matches"]) ?? 0;
  const rawMetric = number(
    isBatting
      ? phaseRow["context_runs_added_per_100"]
      : phaseRow["context_batter_runs_prevented_per_100"],
  );
  const shrunkMetric = number(
    isBatting
      ? phaseRow["shrunken_context_runs_added_per_100"]
      : phaseRow["shrunken_context_batter_runs_prevented_per_100"],
  );
  const venueProfile = resolveHistoricalVenue(venue);
  const localRow = venueProfile
    ? disciplineProfile?.by_phase_and_venue?.[phase]?.[String(venueProfile.venue_id)]
    : undefined;
  const venueSampleBalls =
    number(localRow ? (isBatting ? localRow["balls"] : localRow["legal_balls"]) : undefined) ?? 0;
  const venueSampleMatches = number(localRow?.["matches"]) ?? 0;
  const venueRawMetric = number(
    localRow
      ? isBatting
        ? localRow["context_runs_added_per_100"]
        : localRow["context_batter_runs_prevented_per_100"]
      : undefined,
  );
  const venueWeight = venueSampleBalls / (venueSampleBalls + (isBatting ? 96 : 120));
  const venueUsed = Boolean(
    localRow && venueSampleBalls >= 24 && venueSampleMatches >= 3 && venueRawMetric !== null,
  );
  const venueBlended =
    venueUsed && shrunkMetric !== null && venueRawMetric !== null
      ? shrunkMetric + venueWeight * (venueRawMetric - shrunkMetric)
      : shrunkMetric;

  // Use phase-specific opponent splits only where the archive actually records
  // the relevant characteristic: batter vs pace/spin, bowler vs LHB/RHB.
  const opponentStyle: HistoricalPlayerEvidence["opponentStyle"] = isBatting
    ? opposition === "pace-heavy"
      ? "pace"
      : opposition === "spin-heavy"
        ? "spin"
        : null
    : opposition === "left-hand-heavy"
      ? "left-hand"
      : opposition === "right-hand-heavy"
        ? "right-hand"
        : null;
  const styleKey =
    opponentStyle === "pace"
      ? "Pace"
      : opponentStyle === "spin"
        ? "Spin"
        : opponentStyle === "left-hand"
          ? "LHB"
          : opponentStyle === "right-hand"
            ? "RHB"
            : null;
  const styleRow = !styleKey
    ? undefined
    : isBatting
      ? disciplineProfile?.by_phase_and_bowling_type?.[phase]?.[styleKey]
      : disciplineProfile?.by_phase_and_batter_hand?.[phase]?.[styleKey];
  const styleBalls =
    number(styleRow ? (isBatting ? styleRow["balls"] : styleRow["legal_balls"]) : undefined) ?? 0;
  const styleMatches = number(styleRow?.["matches"]) ?? 0;
  const styleMetric = number(
    styleRow
      ? isBatting
        ? styleRow["context_runs_added_per_100"]
        : styleRow["context_batter_runs_prevented_per_100"]
      : undefined,
  );
  const styleEvidenceUsed = Boolean(
    styleRow && styleBalls >= 48 && styleMatches >= 4 && styleMetric !== null,
  );
  const stylePrior = isBatting ? 96 : 120;
  const styleWeight = styleBalls / (styleBalls + stylePrior);
  const styleBlended =
    styleEvidenceUsed && styleMetric !== null && shrunkMetric !== null
      ? shrunkMetric + styleWeight * (styleMetric - shrunkMetric)
      : null;

  // Build one deterministic context metric for sorting. First shrink the
  // relevant pace/spin or batter-hand split toward the player's phase record;
  // then, when sample gates pass, apply a more conservative ground-specific
  // adjustment. A single scalar avoids a non-transitive pairwise sort when
  // different candidates have different split availability.
  const styleAdjustedPrior = styleBlended ?? shrunkMetric;
  const venueTieWeight = venueSampleBalls / (venueSampleBalls + (isBatting ? 240 : 300));
  const tieBreakContextMetric =
    venueUsed && venueRawMetric !== null && styleAdjustedPrior !== null
      ? styleAdjustedPrior + venueTieWeight * (venueRawMetric - styleAdjustedPrior)
      : styleAdjustedPrior;

  const confidence: HistoricalPlayerEvidence["confidence"] =
    sampleBalls >= 120 && matches >= 8
      ? "higher"
      : sampleBalls >= 48 && matches >= 4
        ? "moderate"
        : "low";
  const note = venueUsed
    ? `${sampleBalls} ${isBatting ? "batting balls" : "legal bowling balls"} across ${matches} matches in this phase. The ground-specific sample (${venueSampleBalls} balls, ${venueSampleMatches} matches) is shrunk toward the player's wider phase record; it is not a pitch forecast.`
    : `${sampleBalls} ${isBatting ? "batting balls" : "legal bowling balls"} across ${matches} matches in this phase. Venue-specific sample is too small or unavailable, so the wider phase record is used.`;
  return {
    playerName,
    discipline,
    phase,
    dataAvailable: true,
    sampleBalls,
    matches,
    rawRunsPer100: number(
      isBatting ? phaseRow["runs_per_100"] : phaseRow["batter_runs_per_100_legal"],
    ),
    rawContextMetricPer100: rawMetric,
    shrunkenContextMetricPer100: shrunkMetric,
    confidence,
    venueName: venueProfile?.venue_name ?? null,
    venueSampleBalls,
    venueSampleMatches,
    venueRawContextMetricPer100: venueRawMetric,
    venueBlendedContextMetricPer100: venueBlended,
    venueEvidenceUsed: venueUsed,
    opponentStyle,
    opponentStyleBalls: styleBalls,
    opponentStyleMatches: styleMatches,
    opponentStyleContextMetricPer100: styleMetric,
    opponentStyleShrunkenMetricPer100: styleBlended,
    opponentStyleEvidenceUsed: styleEvidenceUsed,
    tieBreakContextMetricPer100: tieBreakContextMetric,
    impactIncomingMatches: number(profile.historical_impact_usage?.incoming_matches) ?? 0,
    impactOutgoingMatches: number(profile.historical_impact_usage?.outgoing_matches) ?? 0,
    impactUsageWindow: profile.historical_impact_usage?.window ?? null,
    note,
  };
}

/**
 * A measured role-fit tie-breaker, deliberately not a player-quality score.
 * Historical context residuals only break close role-fit decisions (within five
 * role points). No-sample players fall back to the role fit and are not penalised.
 */
export function compareHistoricalTieBreak(
  a: HistoricalPlayerEvidence,
  b: HistoricalPlayerEvidence,
): number {
  if (!a.dataAvailable || !b.dataAvailable) return 0;
  const av = a.tieBreakContextMetricPer100;
  const bv = b.tieBreakContextMetricPer100;
  if (av === null || av === undefined || bv === null || bv === undefined) return 0;
  if (Math.abs(av - bv) < 0.05) return 0;
  return bv - av;
}
