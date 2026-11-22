import { useState } from "react";
import { AlertTriangle, ArrowLeftRight, ShieldAlert, Target, Trophy } from "lucide-react";
import { PageFrame, SectionTitle, Metric, Subhead } from "@/components/war-room";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import rankings from "@/data/pressure-rankings.json";

type BatterRow = (typeof rankings.batters)[number];
type BowlerRow = (typeof rankings.bowlers)[number];

function SampleTag({ band }: { band: string }) {
  const tone =
    band === "High"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : band === "Moderate"
        ? "border-royal-gold/30 bg-royal-gold/10 text-royal-gold"
        : "border-royal-pink/30 bg-royal-pink/10 text-royal-pink";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${tone}`}
    >
      {band} sample
    </span>
  );
}

function BatterTable({ rows }: { rows: BatterRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[1120px] border-collapse text-left">
        <thead className="bg-secondary/60 text-[10px] uppercase tracking-[.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Batter</th>
            <th className="px-4 py-3">Observed pressure SR</th>
            <th className="px-4 py-3">Shrunk pressure SR</th>
            <th className="px-4 py-3">IPL baseline SR</th>
            <th className="px-4 py-3">Dismissals / 100 balls</th>
            <th className="px-4 py-3">Pressure balls</th>
            <th className="px-4 py-3">Pressure matches</th>
            <th className="px-4 py-3">Index</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.playerId}
              className="border-t border-border/80 transition-colors hover:bg-secondary/25"
            >
              <td className="px-4 py-4">
                <span className="display-face text-2xl text-royal-gold">
                  {String(row.rank).padStart(2, "0")}
                </span>
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-foreground">{row.player}</p>
                <div className="mt-1">
                  <SampleTag band={row.sampleBand} />
                </div>
              </td>
              <td className="px-4 py-4">
                <b className="font-mono text-lg text-foreground">
                  {row.pressureStrikeRate.toFixed(1)}
                </b>
                <p className="text-[10px] text-muted-foreground">observed runs / 100 balls</p>
              </td>
              <td className="px-4 py-4 font-mono text-sm text-foreground">
                {row.shrunkPressureStrikeRate.toFixed(1)}
              </td>
              <td className="px-4 py-4 font-mono text-sm text-muted-foreground">
                {row.baselineStrikeRate.toFixed(1)}
              </td>
              <td className="px-4 py-4 font-mono text-sm text-foreground">
                {row.pressureDismissalsPer100Balls.toFixed(2)}
              </td>
              <td className="px-4 py-4 font-mono text-sm text-foreground">
                {row.pressureBalls.toLocaleString()}
              </td>
              <td className="px-4 py-4 font-mono text-sm text-foreground">{row.pressureMatches}</td>
              <td className="px-4 py-4">
                <b className="font-mono text-sm text-royal-pink">{row.index.toFixed(1)}</b>
                <p className="text-[10px] text-muted-foreground">weighted percentile</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BowlerTable({ rows }: { rows: BowlerRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[1120px] border-collapse text-left">
        <thead className="bg-secondary/60 text-[10px] uppercase tracking-[.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Bowler</th>
            <th className="px-4 py-3">Observed wickets / 100</th>
            <th className="px-4 py-3">Shrunk wickets / 100</th>
            <th className="px-4 py-3">IPL baseline / 100</th>
            <th className="px-4 py-3">Pressure wickets</th>
            <th className="px-4 py-3">Pressure balls</th>
            <th className="px-4 py-3">Pressure matches</th>
            <th className="px-4 py-3">Index</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.playerId}
              className="border-t border-border/80 transition-colors hover:bg-secondary/25"
            >
              <td className="px-4 py-4">
                <span className="display-face text-2xl text-royal-gold">
                  {String(row.rank).padStart(2, "0")}
                </span>
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-foreground">{row.player}</p>
                <div className="mt-1">
                  <SampleTag band={row.sampleBand} />
                </div>
              </td>
              <td className="px-4 py-4">
                <b className="font-mono text-lg text-foreground">
                  {row.pressureWicketsPer100Balls.toFixed(2)}
                </b>
                <p className="text-[10px] text-muted-foreground">
                  observed wickets / 100 legal balls
                </p>
              </td>
              <td className="px-4 py-4 font-mono text-sm text-foreground">
                {row.shrunkPressureWicketsPer100Balls.toFixed(2)}
              </td>
              <td className="px-4 py-4 font-mono text-sm text-muted-foreground">
                {row.baselineWicketsPer100Balls.toFixed(2)}
              </td>
              <td className="px-4 py-4 font-mono text-sm text-foreground">{row.pressureWickets}</td>
              <td className="px-4 py-4 font-mono text-sm text-foreground">
                {row.pressureBalls.toLocaleString()}
              </td>
              <td className="px-4 py-4 font-mono text-sm text-foreground">{row.pressureMatches}</td>
              <td className="px-4 py-4">
                <b className="font-mono text-sm text-royal-pink">{row.index.toFixed(1)}</b>
                <p className="text-[10px] text-muted-foreground">weighted percentile</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PressureRankingsPage() {
  const [view, setView] = useState("batters");
  const reliability = rankings.splitHalfReliability;
  return (
    <PageFrame>
      <main className="pb-16">
        <section className="border-b border-border bg-[linear-gradient(120deg,rgba(30,20,46,.98),rgba(65,18,55,.95))] px-5 py-12 text-white sm:px-8 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-royal-gold">
              <Trophy size={15} /> SupeRR Selector · Separate research workspace
            </p>
            <h1 className="display-face max-w-5xl text-5xl leading-[.95] sm:text-7xl">
              IPL pressure.
              <br />
              <span className="text-royal-pink">Measured, not assumed.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
              Two IPL-only exploratory Top 10s built from the supplied 2022–2026 ball-by-ball
              snapshot. The page compares player output in observable pressure proxies with each
              player's own IPL baseline. It is separate from Rajasthan Royals recruitment rankings.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                IPL only · T20I excluded
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                2022–2026
              </span>
              <span className="rounded-full border border-royal-gold/40 bg-royal-gold/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-royal-gold">
                Experimental rankings
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-4 sm:p-6">
            <Metric
              value={rankings.matches.toLocaleString()}
              label="IPL matches with delivery data"
            />
            <Metric value={rankings.rawDeliveries.toLocaleString()} label="IPL delivery rows" />
            <Metric
              value={rankings.pressureLegalDeliveries.toLocaleString()}
              label="Pressure legal deliveries"
              accent
            />
            <Metric value="5 seasons" label="2022–2026 · no T20I" />
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            The supplied competition register contains{" "}
            {rankings.scheduledMatchRecords.toLocaleString()} IPL match records;{" "}
            {rankings.matchesWithoutDeliveryData.toLocaleString()} have no delivery rows in the
            supplied ball-by-ball file and are excluded from player calculations.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <article className="rounded-2xl border border-royal-pink/30 bg-royal-pink/5 p-5 sm:p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-royal-pink">
                <ShieldAlert size={15} /> Reliability warning · do not hide this
              </p>
              <h2 className="display-face mt-2 text-3xl text-foreground">
                The rank order is unstable.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                An odd/even match-ID split gives a Spearman rank correlation of{" "}
                <b className="text-foreground">{reliability.batterSpearman.toFixed(3)}</b> for
                batters and{" "}
                <b className="text-foreground">{reliability.bowlerSpearman.toFixed(3)}</b> for
                bowlers. The result means the ordering changes substantially across match samples.
                Treat these as exploratory shortlist signals, not statistically secure final
                rankings.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-royal-gold">
                <AlertTriangle size={15} /> Scope boundary
              </p>
              <h2 className="display-face mt-2 text-2xl text-foreground">
                This is not RR recruitment.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The lists rank eligible IPL records in the supplied five-season window. They do not
                estimate auction value, role fit for RR, future performance or career-long pressure
                skill. Do not substitute them for the RR-specific batter and bowler target boards.
              </p>
            </article>
          </div>

          <div className="mt-10">
            <Subhead
              trailing={
                <span className="rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Top 10 · ranked index / 100
                </span>
              }
            >
              Pressure performance lists
            </Subhead>
            <Tabs value={view} onValueChange={setView}>
              <TabsList className="h-11 rounded-xl bg-secondary/70 p-1">
                <TabsTrigger value="batters" className="rounded-lg px-5">
                  Top 10 batters
                </TabsTrigger>
                <TabsTrigger value="bowlers" className="rounded-lg px-5">
                  Top 10 bowlers
                </TabsTrigger>
              </TabsList>
              <TabsContent value="batters" className="mt-4">
                <BatterTable rows={rankings.batters} />
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Batting score: 50% shrunk pressure strike-rate percentile + 30% pressure-retention
                  percentile + 20% inverse pressure-dismissal-rate percentile. Pressure strike rate
                  is batter runs per 100 legal balls; baseline is the player's full IPL sample in
                  the same data window.
                </p>
              </TabsContent>
              <TabsContent value="bowlers" className="mt-4">
                <BowlerTable rows={rankings.bowlers} />
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Bowling score: 55% shrunk bowler-credited wickets per 100 legal balls + 30%
                  pressure-retention percentile + 15% pressure-wicket-volume percentile. Economy is
                  deliberately excluded because the supplied extras field is categorical and does
                  not safely reconstruct conceded runs.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <Subhead>What counts as pressure here?</Subhead>
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                {rankings.pressureDefinition.map((item) => (
                  <div key={item.name} className="border-l-2 border-royal-pink pl-3">
                    <b className="text-foreground">{item.name}</b>
                    <p>{item.rule}</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <Subhead>What the source cannot safely tell us</Subhead>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {rankings.excludedSignals.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-royal-gold">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl bg-secondary/60 p-3 text-xs leading-5 text-muted-foreground">
                The supplied `extras1_runs` field is a category code, not the number of extras. The
                model therefore does not fabricate required run rate or bowler economy from it.
              </p>
            </article>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-secondary/25 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-royal-gold">
              <Target size={15} /> Eligibility and shrinkage
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Batters</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Minimum {rankings.battingMethod.eligibility.toLowerCase()} Pressure strike rate is
                  shrunk toward the player's own IPL baseline using a 60-ball prior.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Bowlers</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Minimum {rankings.bowlingMethod.eligibility.toLowerCase()} Pressure wicket rate is
                  shrunk toward the player's own IPL baseline using a 60-ball prior. Only
                  bowler-credited dismissals count.
                </p>
              </div>
            </div>
            <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
              Source: supplied Season 2 data pack, IPL competitions only. Data hash:{" "}
              <code className="break-all">{rankings.dataSha256}</code>. This is a fixed extract, not
              live data. The odd/even match-ID split is a descriptive stability check, not a
              chronological holdout.
            </p>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
