import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight } from "lucide-react";
import { playoffMatches } from "@/data/playoff-review";
import { PageFrame, OfficialRoyalsCrest } from "@/components/war-room";
import { warRoomData } from "@/data/war-room";

const phaseData = [
  { phase: "Powerplay", final2022: 43, qualifier2024: 49, qualifier2026: 59 },
  { phase: "Middle · 7–15", final2022: 49, qualifier2024: 49, qualifier2026: 109 },
  { phase: "Death · 16–20", final2022: 36, qualifier2024: 36, qualifier2026: 36 },
];

const middleWickets = [
  { match: "2022 Final", wickets: 4, batterRuns: 49 },
  { match: "2024 Q2", wickets: 5, batterRuns: 49 },
  { match: "2026 Q2 · GT chase", wickets: 2, batterRuns: 109 },
];

function sourceUrl(name: string) {
  return warRoomData.sources.find((source) => source.name === name)?.url ?? undefined;
}

export function PlayoffEvidencePage() {
  return (
    <PageFrame>
      <main className="pb-16">
        <section className="border-b border-border bg-[linear-gradient(120deg,rgba(30,20,46,.98),rgba(65,18,55,.95))] px-5 py-10 text-white sm:px-8 sm:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-center gap-3">
              <OfficialRoyalsCrest compact />
              <span className="text-xs font-bold uppercase tracking-[.2em] text-royal-gold">
                Evidence room · 2022–2026
              </span>
            </div>
            <h1 className="display-face max-w-5xl text-5xl leading-[.95] sm:text-7xl">
              What the playoffs
              <br />
              <span className="text-royal-pink">actually tell RR.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/80">
              The seven matches do not show one universal failure. Two losses featured successful GT
              chases with seven wickets in hand; two RR losses expose specific batting-pressure
              cases; and three wins show the core can complete high-stakes chases, post a large
              total and defend it. The recruitment question is what role redundancy remains after
              checking the 19 retained players.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="mb-6 max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-royal-pink">
              01 · Seven-match record
            </p>
            <h2 className="display-face mt-2 text-3xl text-foreground sm:text-4xl">
              Results in context
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              RR and opponent runs are shown from the official match scorelines recorded in the
              submitted report. This chart is a match-result overview, not a phase-performance
              model.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <div className="h-[320px] w-full sm:h-[390px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={playoffMatches}
                  margin={{ top: 12, right: 12, left: 0, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="short"
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--color-border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} runs`,
                      name === "rr" ? "Rajasthan Royals" : "Opponent",
                    ]}
                    contentStyle={{ borderRadius: 12, borderColor: "var(--color-border)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="rr"
                    name="Rajasthan Royals"
                    fill="var(--color-royal-pink)"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={34}
                  />
                  <Bar
                    dataKey="opponent"
                    name="Opponent"
                    fill="var(--color-royal-blue)"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {playoffMatches.map((match) => {
                const href = sourceUrl(match.source);
                return (
                  <article
                    id={`case-${match.id}`}
                    key={match.id}
                    className="scroll-mt-28 rounded-xl bg-secondary/55 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                        {match.short} · {match.date}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${match.result.startsWith("Won") ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"}`}
                      >
                        {match.result}
                      </span>
                    </div>
                    <p className="mt-2 display-face text-2xl text-foreground">
                      RR {match.rr}/{match.rrWkts} <span className="text-muted-foreground">·</span>{" "}
                      Opp {match.opponent}/{match.oppWkts}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{match.read}</p>
                    <div className="mt-3 rounded-lg border border-border bg-background/70 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-royal-gold">
                        {match.takeawayLabel}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-foreground/85">{match.takeaway}</p>
                    </div>
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-royal-pink hover:underline"
                      >
                        Official match reference <ArrowUpRight size={13} />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/25 px-5 py-10 sm:px-8 sm:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-royal-pink">
                02 · Phase investigation
              </p>
              <h2 className="display-face mt-2 text-3xl text-foreground sm:text-4xl">
                Where control was lost
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Only the three detailed investigations are graphed here. Values are batter-run
                components from the supplied delivery export—not official phase totals—because
                extras are categorical in the source.
              </p>
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
              <article className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                <h3 className="display-face text-2xl text-foreground">
                  Batter-run components by phase
                </h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  2022 Final: RR innings · 2024 Q2: RR chase · 2026 Q2: GT chase
                </p>
                <div className="mt-4 h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={phaseData} margin={{ top: 12, right: 10, left: 0, bottom: 8 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="phase"
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                        axisLine={{ stroke: "var(--color-border)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} batter runs`, "Component"]}
                        contentStyle={{ borderRadius: 12, borderColor: "var(--color-border)" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar
                        dataKey="final2022"
                        name="2022 Final · RR"
                        fill="var(--color-royal-pink)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="qualifier2024"
                        name="2024 Q2 · RR"
                        fill="var(--color-royal-gold)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="qualifier2026"
                        name="2026 Q2 · GT"
                        fill="var(--color-royal-blue)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 rounded-xl border border-border bg-secondary/45 p-3 text-[11px] leading-5 text-muted-foreground">
                  <strong className="text-foreground">Source recheck:</strong> the repeated 36
                  death-phase figures are genuine in the supplied delivery export. I independently
                  summed the batter-run field for overs 16–20 in the three innings (2022 Final RR,
                  2024 Q2 RR, 2026 Q2 GT); each totals 36. They are not team totals. One
                  reconciliation limit remains: the export's reconstructed 2026 Q2 GT innings totals
                  212 against the reported scorecard total of 219, a 7-run gap consistent with the
                  source package's documented incomplete-extras reconstruction. The chart therefore
                  remains explicitly a batter-run-component comparison.
                </div>
              </article>
              <article className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                <h3 className="display-face text-2xl text-foreground">Middle-over wicket cost</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Overs 7–15 in the three supplied phase cases
                </p>
                <div className="mt-4 h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={middleWickets}
                      margin={{ top: 12, right: 10, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="match"
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                        axisLine={{ stroke: "var(--color-border)" }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} wickets`, "Dismissals"]}
                        contentStyle={{ borderRadius: 12, borderColor: "var(--color-border)" }}
                      />
                      <Bar
                        dataKey="wickets"
                        name="Middle-over wickets"
                        fill="var(--color-royal-pink)"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={54}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  2022 Final and 2024 Q2 show RR's middle-over wicket clusters. In 2026 Q2, the
                  issue was the opposite: GT scored 109 batter-run components while losing only two
                  wickets.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="grid gap-5 lg:grid-cols-3">
            <article className="rounded-2xl border-t-4 border-royal-pink bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-royal-pink">
                Recruitment implication · batting
              </p>
              <h3 className="display-face mt-2 text-2xl text-foreground">Protect the 4–8 block.</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The evidence supports adaptable entry positions and a batter who can rotate and
                attack spin. It does not justify buying another generic finisher when Ferreira,
                Dubey and Shanaka are already retained.
              </p>
            </article>
            <article className="rounded-2xl border-t-4 border-royal-gold bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                Recruitment implication · bowling
              </p>
              <h3 className="display-face mt-2 text-2xl text-foreground">
                Add phase cover, not labels.
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Avesh is an Indian depth and rotation case; Akash is a conditional backup. Pathirana
                is a specialist death option only after independent medical/workload clearance. A
                single “death bowler” label does not solve partnership control.
              </p>
            </article>
            <article className="rounded-2xl border-t-4 border-royal-blue bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-royal-blue">
                Squad implication · continuity
              </p>
              <h3 className="display-face mt-2 text-2xl text-foreground">Keep the core intact.</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The 2026 Eliminator shows the retained batting core has a high ceiling. Evaluate the
                definitive reference XI, open batting and pace opportunities and injury scenarios
                before proposing a rebuild.
              </p>
            </article>
          </div>
          <p className="mt-6 text-xs leading-5 text-muted-foreground">
            Source basis: submitted SupeRR Selector report, pages 8–10 and 23–25, plus the official
            scorecard references linked above. These observations inform recruitment hypotheses;
            they do not prove one acquisition would have changed a historical result.
          </p>
        </section>
      </main>
    </PageFrame>
  );
}
