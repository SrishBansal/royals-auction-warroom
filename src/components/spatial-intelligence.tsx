import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Database,
  ExternalLink,
  Info,
  MapPin,
  Target,
} from "lucide-react";
import { PageFrame } from "@/components/war-room";
import pilot from "@/data/spatial/spatial-model-pilot.json";

type Zone = {
  length_zone: string;
  line_zone: string;
  deliveries: number;
  batter_runs_per_ball: number;
  bowler_wicket_rate: number;
  bowler_wickets: number;
  expected_batter_runs_context: number;
  expected_batter_runs_context_plus_location: number;
  expected_bowler_wicket_rate_context: number;
  expected_bowler_wicket_rate_context_plus_location: number;
  bowler_wicket_rate_wilson95_low: number;
  bowler_wicket_rate_wilson95_high: number;
};

type MetricMode = "runs" | "wickets";
type PredictionLayer = "observed" | "context" | "spatial";
const zones = pilot.zones as Zone[];
const lineOrder = ["L1", "L2", "L3", "L4", "L5"];
const lengthOrder = ["Y5", "Y4", "Y3", "Y2", "Y1"];
const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
const formatPct = (value: number, digits = 2) => `${formatNumber(value * 100, digits)}%`;

function getZoneValue(zone: Zone, metric: MetricMode, layer: PredictionLayer) {
  if (metric === "runs") {
    if (layer === "context") return zone.expected_batter_runs_context;
    if (layer === "spatial") return zone.expected_batter_runs_context_plus_location;
    return zone.batter_runs_per_ball;
  }
  if (layer === "context") return zone.expected_bowler_wicket_rate_context;
  if (layer === "spatial") return zone.expected_bowler_wicket_rate_context_plus_location;
  return zone.bowler_wicket_rate;
}

function getZoneColor(value: number, min: number, max: number, mode: MetricMode) {
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  const alpha = 0.12 + ratio * 0.38;
  return mode === "runs"
    ? `rgba(214, 51, 132, ${alpha.toFixed(3)})`
    : `rgba(204, 164, 67, ${alpha.toFixed(3)})`;
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[11px] font-bold uppercase tracking-[.16em] text-muted-foreground">
        {label}
      </p>
      <p className="display-face mt-3 text-3xl text-foreground sm:text-4xl">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{note}</p>
    </article>
  );
}

export function SpatialIntelligencePage() {
  const [metric, setMetric] = useState<MetricMode>("wickets");
  const [layer, setLayer] = useState<PredictionLayer>("spatial");
  const [selectedKey, setSelectedKey] = useState("Y3-L2");
  const selected =
    zones.find((zone) => `${zone.length_zone}-${zone.line_zone}` === selectedKey) ?? zones[0]!;
  const metricValues = zones.map((zone) => getZoneValue(zone, metric, layer));
  const minValue = Math.min(...metricValues);
  const maxValue = Math.max(...metricValues);
  const runDelta = useMemo(
    () =>
      ((pilot.regression_grouped_oof_3fold.context_only.mae -
        pilot.regression_grouped_oof_3fold.context_plus_location.mae) /
        pilot.regression_grouped_oof_3fold.context_only.mae) *
      100,
    [],
  );
  const wicketApDelta =
    pilot.bowler_wicket_grouped_oof_3fold.context_plus_location.average_precision -
    pilot.bowler_wicket_grouped_oof_3fold.context_only.average_precision;
  const bootstrap = pilot.paired_match_cluster_bootstrap;
  const layerLabel =
    layer === "observed"
      ? "Observed outcomes"
      : layer === "context"
        ? "Context-only OOF prediction"
        : "Context + location OOF prediction";

  return (
    <PageFrame>
      <main className="pb-16">
        <section className="border-b border-border bg-[linear-gradient(120deg,rgba(30,20,46,.98),rgba(65,18,55,.95))] px-5 py-10 text-white sm:px-8 sm:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-royal-gold/40 bg-royal-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-royal-gold">
                Experimental · historical IPL tracking sample
              </span>
              <span className="text-[11px] uppercase tracking-[.14em] text-white/60">
                Kadamba 25-zone · spatial model pilot
              </span>
            </div>
            <h1 className="display-face max-w-5xl text-5xl leading-[.96] sm:text-7xl">
              Where did the ball land?
              <br />
              <span className="text-royal-pink">Did location add useful signal?</span>
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
              This research layer helps a coach ask whether landing location adds information beyond
              delivery and match context. Compare observed outcomes with context-only and
              context-plus-location estimates, then decide what deserves video or training review.
              It is not a live pitch report, a named-batter matchup forecast or an instruction to
              bowl at a particular cell.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pt-9 sm:px-8">
          <div className="rounded-2xl border border-royal-pink/25 bg-card p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-pink">
              Why this belongs in a coaching War Room
            </p>
            <h2 className="display-face mt-2 text-3xl text-foreground">
              A research prompt for video review — not a bowling instruction.
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="border-t border-royal-pink/40 pt-3">
                <p className="text-sm font-semibold text-foreground">
                  1 · Inspect the landing area
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Select a 5×5 cell and inspect its delivery count, observed batter-run rate and
                  bowler-credited wicket rate. The sample size matters as much as the colour.
                </p>
              </div>
              <div className="border-t border-royal-gold/40 pt-3">
                <p className="text-sm font-semibold text-foreground">
                  2 · Ask whether location adds signal
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Compare context-only estimates with context-plus-location estimates. A difference
                  suggests location may add information in this sample; it does not prove the
                  location caused the outcome.
                </p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-sm font-semibold text-foreground">
                  3 · Choose what to investigate
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Use the map to shortlist video clips or training questions, then validate with
                  coaches and official player-level tracking. Do not tell a bowler to target a cell
                  from this aggregate pilot.
                </p>
              </div>
            </div>
            <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
              Current boundary: the data has no verified batter identity-to-zone tactical join or RR
              2022–2026 competition crosswalk. The map is aggregate and descriptive; no named
              batter, bowler or matchup recommendation is produced.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-400" size={19} />
            <div>
              <p className="font-semibold text-foreground">
                Historical modelling prototype — not live tactical advice
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The 5×5 “Kadamba” grid is this project's descriptive zone representation; it is not
                an official Hawk-Eye or ICC zone standard. The model uses a third-party
                Hawk-Eye-derived IPL redistribution, match-grouped out-of-fold validation and a
                fixed LightGBM configuration. It has no chronological holdout, player-specific
                modelling or verified join to RR's 2022–2026 delivery archive.
              </p>
            </div>
          </div>

          <div className="mb-7 flex gap-3 rounded-2xl border border-royal-gold/25 bg-royal-gold/5 p-4 text-xs leading-6 text-muted-foreground">
            <Info className="mt-0.5 shrink-0 text-royal-gold" size={17} />
            <p>
              <strong className="text-foreground">How to read the prediction layer:</strong> each
              cell averages out-of-fold predictions for deliveries that actually landed there. It
              does not simulate deliberately targeting that zone. The model also uses measured ball
              speed, which is only known after release, so this is a post-release tracking
              assessment—not an advance line-and-length recommendation. The wicket output has not
              undergone a calibration audit; read percentages as uncalibrated model estimates, not
              literal event-risk guarantees.
            </p>
          </div>

          <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Tracking deliveries"
              value={formatNumber(pilot.raw_rows, 0)}
              note={`${pilot.unique_matches} match IDs in the supplied CSV`}
            />
            <StatCard
              label="Model sample"
              value={formatNumber(pilot.pitch_valid_legal_main_rows, 0)}
              note={`Legal main-innings deliveries with plausible pitch coordinates · ${pilot.pitch_valid_legal_main_matches} matches`}
            />
            <StatCard
              label="Coordinate pair missing"
              value={`${pilot.pitch_pair_missing_pct.toFixed(2)}%`}
              note="Pitch X/Y missing in the raw tracking file"
            />
            <StatCard
              label="Speed sentinels"
              value={`${pilot.ball_speed_lt5_pct.toFixed(2)}%`}
              note="Recorded below 5 m/s; treated as failed measurements"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.12fr_.88fr]">
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.18em] text-royal-pink">
                    01 · Kadamba zone map
                  </p>
                  <h2 className="display-face mt-2 text-3xl text-foreground">
                    25 measured landing zones
                  </h2>
                  <p className="mt-2 max-w-xl text-xs leading-5 text-muted-foreground">
                    Five equal-width lateral bands × five longitudinal bands. L1–L5 and Y1–Y5 are
                    neutral coordinate-bin labels. We deliberately withhold off-side/leg-side and
                    short/full names until the source coordinate origin and orientation are
                    independently confirmed.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className="flex rounded-xl border border-border bg-secondary/50 p-1"
                    role="group"
                    aria-label="Pitch map outcome"
                  >
                    <button
                      type="button"
                      onClick={() => setMetric("wickets")}
                      aria-pressed={metric === "wickets"}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${metric === "wickets" ? "bg-royal-gold text-slate-950" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Wicket probability
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetric("runs")}
                      aria-pressed={metric === "runs"}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${metric === "runs" ? "bg-royal-pink text-white" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Expected runs
                    </button>
                  </div>
                  <div
                    className="flex flex-wrap justify-end gap-1"
                    role="group"
                    aria-label="Prediction layer"
                  >
                    {(
                      [
                        ["observed", "Observed"],
                        ["context", "Context"],
                        ["spatial", "Context + location"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setLayer(value)}
                        aria-pressed={layer === value}
                        className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${layer === value ? "border-royal-gold bg-royal-gold/15 text-royal-gold" : "border-border text-muted-foreground hover:text-foreground"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-[auto_1fr] gap-3">
                <div className="flex flex-col justify-around pb-7 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground [writing-mode:vertical-rl] rotate-180">
                  Longitudinal band
                </div>
                <div>
                  <div className="mb-2 grid grid-cols-5 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {lineOrder.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {lengthOrder.flatMap((length) =>
                      lineOrder.map((line) => {
                        const zone = zones.find(
                          (item) => item.length_zone === length && item.line_zone === line,
                        );
                        if (!zone) return null;
                        const key = `${length}-${line}`;
                        const value = getZoneValue(zone, metric, layer);
                        const isSelected = key === selectedKey;
                        return (
                          <button
                            type="button"
                            key={key}
                            onClick={() => setSelectedKey(key)}
                            aria-label={`${length}, ${line}, ${zone.deliveries} deliveries, ${layerLabel}, ${metric === "runs" ? `${formatNumber(value, 3)} ${layer === "observed" ? "observed batter runs" : "expected batter runs"} per legal delivery` : `${formatPct(value)} ${layer === "observed" ? "observed bowler-credited wicket rate" : "predicted bowler-credited wicket probability"}`}`}
                            aria-pressed={isSelected}
                            className={`min-h-[58px] rounded-lg border p-1.5 text-center transition-all hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-gold sm:min-h-[74px] sm:p-2 ${isSelected ? "border-royal-gold ring-2 ring-royal-gold/40" : "border-border"}`}
                            style={{
                              backgroundColor: getZoneColor(value, minValue, maxValue, metric),
                            }}
                          >
                            <span className="block text-[9px] font-semibold text-white/70">
                              {length}/{line}
                            </span>
                            <span className="mt-1 block text-sm font-bold tabular-nums text-white sm:text-base">
                              {metric === "runs" ? formatNumber(value, 2) : formatPct(value, 1)}
                            </span>
                            <span className="mt-0.5 block text-[9px] text-white/70">
                              n={zone.deliveries.toLocaleString("en-IN")}
                            </span>
                          </button>
                        );
                      }),
                    )}
                  </div>
                  <p className="mt-3 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                    Lateral band · batter-relative mirrored coordinate
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
                <span>
                  Selected cell is outlined in gold. Colour is re-scaled within the active view;
                  compare the printed values across toggles.
                </span>
                <span>
                  {layerLabel} ·{" "}
                  {metric === "runs"
                    ? "runs per legal delivery"
                    : "bowler-credited wicket probability"}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-royal-pink">
                02 · Zone inspection
              </p>
              <h2 className="display-face mt-2 text-3xl text-foreground">
                {selected.length_zone} / {selected.line_zone}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {layer === "observed"
                  ? "Observed outcomes for tracked deliveries in this cell."
                  : "Average out-of-fold predictions for held-out deliveries that actually landed in this cell. The context+location view uses each delivery's pre-ball state and measured pitch location."}{" "}
                These are aggregate sample values—not a live next-ball forecast, player-vs-player
                prediction or causal estimate.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-secondary/55 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tracked deliveries
                  </p>
                  <p className="display-face mt-2 text-3xl text-foreground">
                    {selected.deliveries.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary/55 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Observed bowler wickets
                  </p>
                  <p className="display-face mt-2 text-3xl text-foreground">
                    {selected.bowler_wickets.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary/55 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Observed batter runs / ball
                  </p>
                  <p className="display-face mt-2 text-2xl text-foreground">
                    {formatNumber(selected.batter_runs_per_ball, 3)}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary/55 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Observed wicket rate · 95% CI
                  </p>
                  <p className="display-face mt-2 text-2xl text-foreground">
                    {formatPct(selected.bowler_wicket_rate)}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatPct(selected.bowler_wicket_rate_wilson95_low)}–
                    {formatPct(selected.bowler_wicket_rate_wilson95_high)}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Context-only · expected runs
                  </p>
                  <p className="display-face mt-2 text-2xl text-foreground">
                    {formatNumber(selected.expected_batter_runs_context, 3)}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Expected wickets: {formatPct(selected.expected_bowler_wicket_rate_context)}
                  </p>
                </div>
                <div className="rounded-xl border border-royal-gold/35 bg-royal-gold/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-royal-gold">
                    Context + location · expected
                  </p>
                  <p className="display-face mt-2 text-2xl text-foreground">
                    {formatNumber(selected.expected_batter_runs_context_plus_location, 3)}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Expected wickets:{" "}
                    {formatPct(selected.expected_bowler_wicket_rate_context_plus_location)}
                  </p>
                </div>
              </div>
              {selected.deliveries < 500 ? (
                <div className="mt-4 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  Small zone sample. Treat this raw rate as highly uncertain; it is not a
                  recommendation by itself.
                </div>
              ) : (
                <div className="mt-4 flex gap-2 rounded-xl border border-border bg-secondary/35 p-3 text-xs leading-5 text-muted-foreground">
                  <Info size={15} className="mt-0.5 shrink-0 text-royal-gold" />A larger sample
                  improves descriptive stability, but matchup, phase, batter and bowler effects
                  still need adjustment.
                </div>
              )}
              <div className="mt-5 rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-foreground">
                  What a coach should take from this
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Compare the observed rate with the two held-out prediction views. The difference
                  between context-only and context+location shows what location adds in this pilot's
                  validation sample. It does not prove that bowling to this cell causes wickets;
                  field placement, specific batter/bowler skill and tactical intent are not
                  modelled.
                </p>
              </div>
            </section>
          </div>

          <section className="mt-8">
            <div className="mb-5 max-w-4xl">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-royal-pink">
                03 · Does location add signal?
              </p>
              <h2 className="display-face mt-2 text-3xl text-foreground sm:text-4xl">
                Context first. Spatial detail on top.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Three-fold GroupKFold by match, one fixed LightGBM configuration. Adding pitch
                landing coordinates gives a <strong>modest improvement</strong> (~1.01% in MAE,
                0.88% in RMSE; +0.0067 in wicket Average Precision against a 4.67% base wicket
                rate). This is not high accuracy or proof of a decisive tactical advantage.
              </p>
            </div>
            <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border bg-secondary/40 px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                  Delivery-level model comparison summary
                </p>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[560px] text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-[10px] uppercase text-muted-foreground">
                      <th className="pb-2 font-bold">Metric comparison</th>
                      <th className="pb-2 font-bold">Context-only baseline</th>
                      <th className="pb-2 font-bold">Context + location</th>
                      <th className="pb-2 font-bold">Absolute difference</th>
                      <th className="pb-2 font-bold">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    <tr>
                      <td className="py-2.5 font-medium">Batter-run MAE</td>
                      <td className="py-2.5 font-mono">1.1702</td>
                      <td className="py-2.5 font-mono">1.1582</td>
                      <td className="py-2.5 font-mono text-royal-pink">−0.0120 (−1.03%)</td>
                      <td className="py-2.5 text-muted-foreground">
                        Modest ~1% error reduction per legal ball
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Batter-run RMSE</td>
                      <td className="py-2.5 font-mono">1.6041</td>
                      <td className="py-2.5 font-mono">1.5897</td>
                      <td className="py-2.5 font-mono text-royal-pink">−0.0144 (−0.90%)</td>
                      <td className="py-2.5 text-muted-foreground">
                        Slight outlier penalty reduction
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Wicket Average Precision (AP)</td>
                      <td className="py-2.5 font-mono">0.0748</td>
                      <td className="py-2.5 font-mono">0.0811</td>
                      <td className="py-2.5 font-mono text-royal-gold">+0.0064 (+0.64% abs)</td>
                      <td className="py-2.5 text-muted-foreground">
                        Small gain on 4.67% rare-event baseline
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Wicket Brier Score</td>
                      <td className="py-2.5 font-mono">0.04415</td>
                      <td className="py-2.5 font-mono">0.04403</td>
                      <td className="py-2.5 font-mono text-royal-gold">−0.00013</td>
                      <td className="py-2.5 text-muted-foreground">
                        Calibration virtually identical
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Wicket ROC-AUC</td>
                      <td className="py-2.5 font-mono">0.6043</td>
                      <td className="py-2.5 font-mono">0.6232</td>
                      <td className="py-2.5 font-mono text-royal-gold">+0.0189</td>
                      <td className="py-2.5 text-muted-foreground">
                        Moderate discrimination improvement
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-center gap-2 text-royal-pink">
                  <Target size={17} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Expected batter runs
                  </span>
                </div>
                <p className="display-face mt-3 text-4xl text-foreground">
                  {runDelta.toFixed(2)}%{" "}
                  <span className="text-base font-sans text-muted-foreground">lower MAE</span>
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Adding pitch location to context reduces mean absolute error from{" "}
                  {formatNumber(pilot.regression_grouped_oof_3fold.context_only.mae, 4)} to{" "}
                  {formatNumber(pilot.regression_grouped_oof_3fold.context_plus_location.mae, 4)}{" "}
                  runs per legal delivery.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <span className="text-muted-foreground">Context RMSE</span>
                    <b className="mt-1 block text-lg text-foreground">
                      {formatNumber(pilot.regression_grouped_oof_3fold.context_only.rmse, 4)}
                    </b>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <span className="text-muted-foreground">Spatial RMSE</span>
                    <b className="mt-1 block text-lg text-foreground">
                      {formatNumber(
                        pilot.regression_grouped_oof_3fold.context_plus_location.rmse,
                        4,
                      )}
                    </b>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <ArrowDownRight size={14} className="text-royal-gold" />
                  Match-cluster bootstrap 95% CI for MAE reduction:{" "}
                  {formatNumber(bootstrap.deltas.mae_improvement.ci95_low, 4)}–
                  {formatNumber(bootstrap.deltas.mae_improvement.ci95_high, 4)} runs/ball.
                  Chronological confirmation is still absent.
                </div>
              </article>
              <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-center gap-2 text-royal-gold">
                  <Activity size={17} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Bowler-credited wicket prediction
                  </span>
                </div>
                <p className="display-face mt-3 text-4xl text-foreground">
                  +{formatNumber(wicketApDelta, 4)}{" "}
                  <span className="text-base font-sans text-muted-foreground">absolute AP</span>
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Average Precision rises from{" "}
                  {formatNumber(
                    pilot.bowler_wicket_grouped_oof_3fold.context_only.average_precision,
                    4,
                  )}{" "}
                  to{" "}
                  {formatNumber(
                    pilot.bowler_wicket_grouped_oof_3fold.context_plus_location.average_precision,
                    4,
                  )}
                  . Base wicket rate is {formatPct(pilot.base_bowler_wicket_rate)}. This remains a
                  rare-event prediction task, not a high-confidence wicket forecaster.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <span className="text-muted-foreground">Context Brier</span>
                    <b className="mt-1 block text-lg text-foreground">
                      {formatNumber(pilot.bowler_wicket_grouped_oof_3fold.context_only.brier, 5)}
                    </b>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <span className="text-muted-foreground">Spatial Brier</span>
                    <b className="mt-1 block text-lg text-foreground">
                      {formatNumber(
                        pilot.bowler_wicket_grouped_oof_3fold.context_plus_location.brier,
                        5,
                      )}
                    </b>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <ArrowUpRight size={14} className="text-royal-gold" />
                  Match-cluster bootstrap 95% CI for AP gain:{" "}
                  {formatNumber(bootstrap.deltas.ap_improvement.ci95_low, 4)}–
                  {formatNumber(bootstrap.deltas.ap_improvement.ci95_high, 4)}. CI resamples
                  existing OOF predictions, not new model fits.
                </div>
              </article>
            </div>
            <div className="mt-4 flex gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-xs leading-5 text-muted-foreground">
              <Info size={16} className="mt-0.5 shrink-0 text-royal-gold" />
              The location-only model is weaker than context-only on batter-run error. The signal
              comes from adding location to match context, not replacing context with a heatmap. The
              cluster intervals are conditional on these out-of-fold predictions; no chronological
              test, model-refit bootstrap, per-zone calibration or external-season validation has
              been performed.
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-royal-pink">
                04 · Method and exclusions
              </p>
              <h2 className="display-face mt-2 text-2xl text-foreground">
                How the pilot was built
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>
                  • Legal main-innings deliveries only; wides and no-balls do not consume a legal
                  ball.
                </li>
                <li>
                  • Pitch coordinates retained inside the pilot QC bounds: X −1 to +1 m and Y 0 to
                  13 m.
                </li>
                <li>
                  • Batter-relative lateral mirroring for handedness; off-side/leg-side labels
                  withheld until axis orientation is independently verified.
                </li>
                <li>• Ball-speed values below 5 m/s treated as failed measurements.</li>
                <li>• Batter runs and bowler-credited wickets modelled as separate outcomes.</li>
                <li>
                  • Post-shot field coordinates, dismissal labels and player IDs excluded from
                  predictors.
                </li>
              </ul>
            </article>
            <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-royal-pink">
                05 · What remains unproven
              </p>
              <h2 className="display-face mt-2 text-2xl text-foreground">
                Limits before deployment
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>
                  • CSV has no match dates, seasons, teams or venues; player/match crosswalk to the
                  supplied 2022–2026 competition dataset is unresolved.
                </li>
                <li>
                  • The cited paper reports 135,174 modelling deliveries; this independent pipeline
                  retains 135,587. The 413-row difference is unresolved, so this is not an exact
                  reproduction.
                </li>
                <li>
                  • Tracking availability is selective; tracked and untracked deliveries may not
                  represent the same population.
                </li>
                <li>
                  • No chronological holdout, per-zone calibration audit or external season
                  validation. The bootstrap resamples the existing OOF predictions; it does not
                  refit models.
                </li>
                <li>
                  • The model does not feed IPL pressure rankings, RR recruitment ranks or
                  Match-State recommendations. It is not a player-specific/bowler-specific tactical
                  recommendation engine.
                </li>
              </ul>
            </article>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-royal-pink">
                  06 · Provenance
                </p>
                <h2 className="display-face mt-2 text-2xl text-foreground">Source transparency</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  The uploaded CSV is a community-maintained redistribution described by its
                  repository as a tidy version of ICC PulseLive API Hawk-Eye statistics. It is not
                  an RR-provided feed or a directly licensed Hawk-Eye delivery. Raw tracking rows
                  are not bundled in this application; only derived aggregate outputs are included.
                </p>
              </div>
              <Database className="text-royal-gold" size={24} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <a
                className="rounded-xl border border-border p-4 transition-colors hover:bg-secondary/50"
                href="https://github.com/alittlefitness/HawkeyeStats"
                target="_blank"
                rel="noreferrer"
              >
                <span className="text-xs font-semibold text-foreground">
                  HawkeyeStats repository <ExternalLink className="ml-1 inline" size={12} />
                </span>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Dataset structure, field definitions and source description.
                </p>
              </a>
              <a
                className="rounded-xl border border-border p-4 transition-colors hover:bg-secondary/50"
                href="https://www.scitepress.org/PublishedPapers/2026/153068/"
                target="_blank"
                rel="noreferrer"
              >
                <span className="text-xs font-semibold text-foreground">
                  2026 spatial-modelling paper <ExternalLink className="ml-1 inline" size={12} />
                </span>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Independent reference for data filtering and spatial model comparisons.
                </p>
              </a>
              <a
                className="rounded-xl border border-border p-4 transition-colors hover:bg-secondary/50"
                href="https://cricsheet.org/"
                target="_blank"
                rel="noreferrer"
              >
                <span className="text-xs font-semibold text-foreground">
                  Cricsheet data guidance <ExternalLink className="ml-1 inline" size={12} />
                </span>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Cricsheet's note on Hawk-Eye data redistribution and copyright caution.
                </p>
              </a>
            </div>
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
              <MapPin size={13} className="mt-0.5 shrink-0" />
              Next validation step: request an RR/BCCI-authorised ball-tracking extract if the
              project advances, then verify coverage, coordinate semantics and licensing before
              production use.
            </p>
          </section>
        </section>
      </main>
    </PageFrame>
  );
}
