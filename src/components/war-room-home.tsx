import {
  Activity,
  BookOpen,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Crosshair,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { OfficialRoyalsCrest, PageFrame } from "@/components/war-room";
import stadiumImage from "@/assets/jaipur-stadium.jpg";
import { playoffMatches } from "@/data/playoff-review";
import { warRoomData } from "@/data/war-room";
import {
  fiveSeasonTotals,
  formatLeagueRecord,
  seasonReview,
  seasonReviewSource,
} from "@/data/season-review";
import { MAX_OVERSEAS_SQUAD_SIZE, MAX_SQUAD_SIZE } from "@/domain/rr-decision-engine";

const playoffCampaigns = [
  {
    season: "2022",
    result: "Runner-up",
    route: ["Q1 · L", "Q2 · W", "Final · L"],
    record: "1 win · 2 defeats",
    tone: "border-royal-gold/45",
  },
  {
    season: "2024",
    result: "3rd overall",
    route: ["Eliminator · W", "Q2 · L"],
    record: "1 win · 1 defeat",
    tone: "border-royal-pink/45",
  },
  {
    season: "2026",
    result: "3rd overall",
    route: ["Eliminator · W", "Q2 · L"],
    record: "1 win · 1 defeat",
    tone: "border-royal-pink/45",
  },
] as const;

function SeasonCard({ row }: { row: (typeof seasonReview)[number] }) {
  const winPercent = (row.league.won / row.league.played) * 100;
  const lossPercent = (row.league.lost / row.league.played) * 100;
  const noResultPercent = (row.league.noResult / row.league.played) * 100;

  return (
    <article className="rounded-[22px] border border-border bg-card p-5 shadow-[0_12px_40px_-32px_rgba(0,0,0,.8)] transition duration-300 hover:-translate-y-1 hover:border-royal-pink/45 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-royal-gold">
            IPL {row.season}
          </p>
          <p className="display-face mt-2 text-4xl leading-none text-foreground">
            {row.tournamentFinish}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Overall tournament finish</p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/55 px-3 py-2 text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            League
          </span>
          <b className="display-face text-2xl text-royal-pink">#{row.league.position}</b>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="display-face text-3xl text-foreground">{formatLeagueRecord(row)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            W–L{row.league.noResult > 0 ? "–NR" : ""} · league stage
          </p>
        </div>
        <div className="text-right">
          <b className="display-face text-2xl text-foreground">{row.league.points}</b>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Points</p>
        </div>
      </div>

      <div
        className="mt-4 flex h-2 overflow-hidden rounded-full bg-secondary"
        aria-label={`${row.league.won} wins, ${row.league.lost} losses, ${row.league.noResult} no results`}
      >
        <span className="bg-royal-pink" style={{ width: `${winPercent}%` }} />
        <span className="bg-muted-foreground/45" style={{ width: `${lossPercent}%` }} />
        {row.league.noResult > 0 && (
          <span className="bg-royal-gold" style={{ width: `${noResultPercent}%` }} />
        )}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">
          Post-season
        </p>
        <p className="mt-1 text-sm font-semibold leading-5 text-foreground">
          {row.postseason.route}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{row.headline}</p>
      </div>
    </article>
  );
}

function GapCard({
  number,
  title,
  priority,
  evidence,
  retained,
  gap,
  decision,
  tone,
  evidenceLinks = [],
  evidenceLabel = "1 · What the playoffs showed",
}: {
  number: string;
  title: string;
  priority: string;
  evidence: string;
  retained: string;
  gap: string;
  decision: string;
  tone: "pink" | "gold" | "slate";
  evidenceLinks?: Array<{ label: string; href: string }>;
  evidenceLabel?: string;
}) {
  const accent =
    tone === "pink"
      ? "text-royal-pink"
      : tone === "gold"
        ? "text-royal-gold"
        : "text-muted-foreground";
  const border =
    tone === "pink"
      ? "border-t-royal-pink"
      : tone === "gold"
        ? "border-t-royal-gold"
        : "border-t-border";
  return (
    <article
      className={`rounded-[22px] border border-border border-t-[3px] ${border} bg-card p-5 sm:p-6`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className={`display-face text-3xl ${accent}`}>{number}</span>
        <div className="min-w-0 flex-1">
          <h3 className="display-face text-2xl leading-tight text-foreground">{title}</h3>
          <p className={`mt-1 text-[10px] font-bold uppercase tracking-[.14em] ${accent}`}>
            {priority}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 border-t border-border pt-5 lg:grid-cols-[1.05fr_.95fr_1.1fr]">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-[.15em] ${accent}`}>
            {evidenceLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{evidence}</p>
          {evidenceLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {evidenceLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[10px] font-semibold text-royal-gold transition hover:border-royal-pink/50 hover:text-royal-pink"
                >
                  Open {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="lg:border-l lg:border-border lg:pl-4">
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">
            2 · What RR already has
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground/85">{retained}</p>
        </div>
        <div className="rounded-xl bg-secondary/55 p-4 lg:bg-secondary/45">
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-royal-gold">
            3 · The gap that survives
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground">{gap}</p>
          <div className="mt-3 border-t border-border/80 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">
              Decision boundary
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{decision}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function WarRoomHomePage() {
  const retainedPlayers = warRoomData.team.retained_players;
  const retainedCount = retainedPlayers.length;
  const retainedOverseas = retainedPlayers.filter((player) => player.overseas).length;
  const openPlaces = Math.max(0, MAX_SQUAD_SIZE - retainedCount);
  const leagueWinRate = (
    (fiveSeasonTotals.leagueWins / fiveSeasonTotals.leaguePlayed) *
    100
  ).toFixed(1);

  return (
    <PageFrame>
      <main className="pb-16">
        <section className="px-3 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-6">
          <div className="rr-hero-panel relative mx-auto flex min-h-[min(72svh,680px)] max-w-[1440px] flex-col justify-between overflow-hidden rounded-[28px] border border-royal-gold/25 sm:rounded-[38px]">
            <img
              src={stadiumImage}
              alt="Floodlit Sawai Mansingh Stadium in Jaipur"
              className="hero-image"
              width={1920}
              height={1024}
            />
            <div className="hero-shade" />
            <div className="relative z-10 flex min-h-[min(72svh,680px)] flex-col justify-between p-6 sm:p-10 lg:p-14">
              <div className="flex items-center gap-4">
                <OfficialRoyalsCrest />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.22em] text-white">
                    Rajasthan Royals
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[.18em] text-white/70">
                    SupeRR Selector · IPL 2027
                  </p>
                </div>
              </div>
              <div className="max-w-5xl py-10">
                <p className="mb-5 text-xs font-bold uppercase tracking-[.24em] text-royal-gold">
                  Five-season review · 2022–2026
                </p>
                <h1
                  className="max-w-5xl font-serif text-5xl leading-[1.02] tracking-[-.035em] text-white sm:text-6xl lg:text-[76px]"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Turn the next playoff return into a{" "}
                  <span className="text-royal-gold">finals run.</span>
                </h1>
                <p className="mt-7 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
                  RR finished 2nd, 5th, 3rd, 9th and 4th in the league across the last five seasons.
                  They reached three playoffs, made the 2022 final, and exited in Qualifier 2 in
                  both 2024 and 2026. This War Room uses that record to frame the investigation—not
                  to pretend league finishes alone explain why a team won or lost.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-royal-pink px-6 font-semibold text-white hover:bg-royal-pink/90"
                  >
                    <a href="#season-review">
                      Compare five seasons <ArrowRight size={16} />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/45 bg-white/10 px-6 text-white hover:bg-white/20"
                  >
                    <Link to="/targets">
                      Review RR recruitment gaps <ArrowUpRight size={15} />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 border-t border-white/20 pt-5 sm:grid-cols-4 sm:gap-6">
                <div>
                  <b className="display-face text-4xl text-white sm:text-5xl">3 / 5</b>
                  <span className="mt-1 block text-xs uppercase tracking-[.14em] text-white/70">
                    Playoff seasons
                  </span>
                </div>
                <div>
                  <b className="display-face text-4xl text-white sm:text-5xl">3W–4L</b>
                  <span className="mt-1 block text-xs uppercase tracking-[.14em] text-white/70">
                    Playoff match record
                  </span>
                </div>
                <div>
                  <b className="display-face text-4xl text-white sm:text-5xl">{retainedCount}</b>
                  <span className="mt-1 block text-xs uppercase tracking-[.14em] text-white/70">
                    2027 players retained
                  </span>
                </div>
                <div>
                  <b className="display-face text-4xl text-royal-gold sm:text-5xl">{openPlaces}</b>
                  <span className="mt-1 block text-xs uppercase tracking-[.14em] text-white/70">
                    Open squad places
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="season-review"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-10 sm:px-8 sm:py-14"
        >
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-royal-pink">
                01 · Five-season comparison
              </p>
              <h2 className="display-face mt-2 text-4xl leading-tight text-foreground sm:text-5xl">
                The league record has swung. The job is to understand why.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Each card uses the 14-match league phase for a fair comparison. The tournament
                finish and knockout route are shown separately, so playoff matches are not
                accidentally counted as league results.
              </p>
            </div>
            <a
              href={seasonReviewSource.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-royal-gold underline decoration-royal-gold/40 underline-offset-4 hover:text-royal-pink"
            >
              Official RR season history <ArrowUpRight size={13} />
            </a>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-royal-pink" /> League wins
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-muted-foreground/45" /> League losses
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-royal-gold" /> No result
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {seasonReview.map((row) => (
              <SeasonCard key={row.season} row={row} />
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
            <article className="rounded-[22px] border border-border bg-secondary/35 p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-royal-gold">
                What the five seasons establish
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-3">
                <div>
                  <b className="display-face text-3xl text-foreground">
                    {fiveSeasonTotals.leagueWins}–{fiveSeasonTotals.leagueLosses}
                  </b>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    League wins–losses across {fiveSeasonTotals.leaguePlayed} matches, plus{" "}
                    {fiveSeasonTotals.leagueNoResults} no result
                  </p>
                </div>
                <div>
                  <b className="display-face text-3xl text-foreground">{leagueWinRate}%</b>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    League win rate across this five-season window
                  </p>
                </div>
                <div>
                  <b className="display-face text-3xl text-foreground">
                    {fiveSeasonTotals.playoffMatches}
                  </b>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Playoff matches: {fiveSeasonTotals.playoffWins} wins,{" "}
                    {fiveSeasonTotals.playoffLosses} defeats
                  </p>
                </div>
              </div>
            </article>
            <article className="rounded-[22px] border border-royal-gold/25 bg-card p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-royal-gold" size={21} />
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-royal-gold">
                  How to read this
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                RR recovered from 9th in 2025 to 4th in the 2026 league phase, then finished 3rd
                overall after the playoffs. The pattern shows volatility and a recent recovery; it
                does not identify the role or tactical cause. That requires the match review and the
                2027 retained-squad audit below.
              </p>
            </article>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/25 px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-royal-pink">
                02 · Playoff conversion
              </p>
              <h2 className="display-face mt-2 text-4xl text-foreground sm:text-5xl">
                Three campaigns. Seven knockout matches. One final.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The seven-match sample contains three wins and four defeats. It is enough to inspect
                specific failure and success cases, but too small to claim a season-wide causal
                pattern by itself.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {playoffCampaigns.map((campaign) => (
                <article
                  key={campaign.season}
                  className={`rounded-[22px] border ${campaign.tone} bg-card p-5 sm:p-6`}
                >
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-royal-gold">
                        IPL {campaign.season}
                      </p>
                      <h3 className="display-face mt-1 text-3xl text-foreground">
                        {campaign.result}
                      </h3>
                    </div>
                    <p className="text-right text-xs text-muted-foreground">{campaign.record}</p>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {campaign.route.map((step) => (
                      <span
                        key={step}
                        className={`rounded-full px-3 py-2 text-[11px] font-bold ${step.endsWith("W") ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}`}
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-royal-gold">
                    Match-by-match evidence
                  </p>
                  <h3 className="display-face mt-1 text-3xl text-foreground">
                    What swung each knockout?
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    Each case names the actual match event and the tactical question it raises. Wins
                    are shown alongside defeats as counter-evidence.
                  </p>
                </div>
                <span className="rounded-full border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  7 cases · 3 wins · 4 defeats
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {playoffMatches.map((match) => (
                  <article
                    key={match.id}
                    className="rounded-2xl border border-border bg-card p-4 transition hover:border-royal-pink/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-royal-gold">
                        {match.short} · {match.date}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${match.result.startsWith("Won") ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}`}
                      >
                        {match.result}
                      </span>
                    </div>
                    <p className="display-face mt-3 text-2xl text-foreground">
                      RR {match.rr}/{match.rrWkts} <span className="text-muted-foreground">·</span>{" "}
                      Opp {match.opponent}/{match.oppWkts}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{match.read}</p>
                    <div className="mt-3 rounded-lg bg-secondary/55 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-royal-pink">
                        {match.takeawayLabel}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-foreground/85">{match.takeaway}</p>
                    </div>
                    <a
                      href={`/knockouts#case-${match.id}`}
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-royal-gold hover:text-royal-pink"
                    >
                      Open evidence & phase analysis <ArrowRight size={13} />
                    </a>
                  </article>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-royal-gold">
                  Go beyond the scoreline
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Open the evidence room for the full scorecards, phase-level wicket clusters,
                  batter-run component charts and source notes.
                </p>
              </div>
              <Button
                asChild
                className="shrink-0 rounded-full bg-royal-pink text-white hover:bg-royal-pink/90"
              >
                <Link to="/knockouts">
                  Open full playoff evidence <ArrowRight size={15} />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-8 max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-royal-pink">
              03 · Gap finder
            </p>
            <h2 className="display-face mt-2 text-4xl text-foreground sm:text-5xl">
              What is covered, what is thin, and what should RR actually buy?
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              The first two rows connect specific playoff sequences to retained-role coverage and
              the recruitment need that remains. The third row is different: it is a squad-selector
              stress test, not a playoff finding. These are role hypotheses, not proof that one
              player type caused a defeat.
            </p>
          </div>

          <div className="grid gap-5">
            <GapCard
              number="01"
              title="Pace depth: insurance, not a vacancy"
              priority="Selective advantage / insurance buy"
              tone="pink"
              evidenceLinks={[
                { label: "2022 Q1", href: "/knockouts#case-2022-q1" },
                { label: "2026 Q2", href: "/knockouts#case-2026-q2" },
              ]}
              evidence="The 2022 Q1 and 2026 Q2 defeats ended with GT at 191/3 and 219/3 respectively, chasing 188/6 and 214/6. In 2026, Gill made 104 off 53 and Sudharsan 58 off 32, sharing 167 in 77 balls. The supported signal is a need to disrupt set partnerships and create follow-up wickets—not proof that pace alone caused either defeat."
              retained="RR already has a defined pace group. Shami and Burger are the preferred new-ball profiles (right-arm and left-arm); Archer is the strongest overall strike option and can also handle high-quality death overs. Sandeep brings control and variations, Brijesh provides Indian pace with a death-over option (still a limited IPL sample), and Sushant adds developmental left-arm depth. Boult is the historical new-ball reference, not the only way to describe the current attack. Another quick like Tushar Deshpande must be weighed against Brijesh's role overlap and death economy rather than signed for headcount. These are role preferences, not phase-exclusive labels."
              gap="A further Indian quick is an advantage purchase for workload and injury resilience—not an urgent headcount correction. The recruit should add a distinct multi-phase skill or improve dependable overs 17–20 cover without duplicating Shami / Burger’s new-ball value or Archer’s strike / death flexibility. Avesh’s supplied death-phase record is 31 wickets from 460 legal balls (6.74 per 100), below the retained-core median of 8.12: this supports a depth / rotation comparison, not a first-choice death upgrade. Akash remains conditional on a smaller, conflicting phase sample."
              decision="Do not describe RR as having no death options: Archer, Sandeep and Brijesh already offer different forms of phase cover. The case for an extra quick is resilience if availability or workload breaks, and only if the candidate adds value over that retained group. Pathirana remains a specialist upside option with elevated medical / availability risk; registration and medical review are separate gates."
            />
            <GapCard
              number="02"
              title="Middle-order role succession"
              priority="Conditional batting need"
              tone="gold"
              evidenceLinks={[
                { label: "2022 Final", href: "/knockouts#case-2022-final" },
                { label: "2024 Q2", href: "/knockouts#case-2024-q2" },
              ]}
              evidence="Two playoff cases show different forms of batting pressure. In the 2022 Final, RR finished 130/9 against GT. In 2024 Q2, after Jaiswal’s 42 off 21, RR scored only 42 and lost four more wickets across the next eight overs; Jurel’s 56* could not recover the chase (139/7). These are case studies—not proof of a five-season trend."
              retained="Parag and Jurel are the middle-order spine; Jadeja adds batting depth; Dubey is a retained left-hand middle / lower-order option; Ferreira and Shanaka add lower-order / all-round options. Hetmyer’s release removes an overseas left-handed No.6 / finishing option. That is a role-succession issue—not a claim that Hetmyer was consistently reliable."
              gap="Test a No.5/6 who can enter around positions 4–6 after early wickets, rebuild and rotate against spin, then still accelerate late. This is more specific than buying another last-five-overs hitter. Tewatia and Morris are historical role precedents for lower-order utility and pace-bowling all-round value—not like-for-like Hetmyer replacements."
              decision="The phase chart uses batter-run components, not full team totals, because extras are categorical in the supplied export. The 2022 Final and 2024 Q2 each show 49 middle-over batter-run components; the corresponding innings lost four and five wickets in overs 7–15. Nehal’s pressure-gated sample is below 100 balls. Keep the submitted target order unchanged; judge each name against the role brief, not as a model-generated score."
            />
            <GapCard
              number="03"
              title="Absence cover & selector resilience"
              priority="Squad-selector stress test · 19 absence scenarios"
              tone="slate"
              evidenceLabel="SYSTEM STRESS TEST · NOT PLAYOFF EVIDENCE"
              evidenceLinks={[{ label: "Squad absence test", href: "/squad" }]}
              evidence="The selector was run 19 times. In 16 cases it could construct an XI that met its current role tags and selection constraints after one retained player was removed. It could not construct one in the Jurel, Sooryavanshi and Jaiswal absence cases. Those three cases are flagged for a coach to review—not treated as proof that the squad has no practical cover."
              retained="Pretorius and Ferreira are wicketkeeping options; Aman is development batting depth; Dubey and other retained players provide some batting-order flexibility. These alternatives may cover parts of a role, not necessarily the same performance."
              gap="Use the three flagged cases to inspect the role tags and selection constraints, then ask whether a recruit would improve cover across more than one absence. The engine can miss practical combinations if its role labels are too narrow."
              decision="16/19 is a count of engine-feasible scenarios in this fixed test. It is not a model-accuracy score, injury probability, player availability estimate or performance guarantee. A rule-valid XI does not prove equivalent performance; a failed engine case does not prove no workable cricket combination exists."
            />
          </div>

          <div className="mt-5 rounded-[22px] border border-emerald-400/20 bg-emerald-400/[.035] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-300">
                  Counter-evidence · preserve what already works
                </p>
                <h3 className="display-face mt-1 text-2xl text-foreground">
                  The playoff record is not a case for rebuilding the team.
                </h3>
              </div>
              <span className="rounded-full border border-emerald-400/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                3 successful reference cases
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="border-t border-emerald-400/20 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  2022 Qualifier 2
                </p>
                <b className="display-face mt-1 block text-2xl text-foreground">161/3 chase</b>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  RR chased RCB’s 157/8; Buttler made 106*. A successful pressure chase and a
                  positive batting reference.
                </p>
              </div>
              <div className="border-t border-emerald-400/20 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  2024 Eliminator
                </p>
                <b className="display-face mt-1 block text-2xl text-foreground">174/6 chase</b>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  RR chased 173 against RCB. The middle and lower order helped finish a high-stakes
                  chase.
                </p>
              </div>
              <div className="border-t border-emerald-400/20 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  2026 Eliminator
                </p>
                <b className="display-face mt-1 block text-2xl text-foreground">
                  243/8 · won by 47
                </b>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  RR posted a major total and bowled SRH out. The retained core has demonstrated a
                  high ceiling.
                </p>
              </div>
            </div>
            <p className="mt-4 border-t border-emerald-400/15 pt-3 text-xs leading-5 text-muted-foreground">
              Interpretation: retain the productive core and add targeted redundancy / role
              succession. Do not infer that these wins erase the gaps—or that the defeats prove a
              full rebuild is necessary.
            </p>
          </div>

          <div className="mt-6 rounded-[22px] border border-border bg-secondary/35 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-royal-gold">
                  Avoid duplicate purchases
                </p>
                <h3 className="display-face mt-1 text-2xl text-foreground">
                  The retained core already covers several labels.
                </h3>
              </div>
              <span className="rounded-full border border-royal-gold/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-royal-gold">
                Not a priority by default
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-royal-gold" size={18} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Another opener</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Low priority with Vaibhav Sooryavanshi and Yashasvi Jaiswal retained. Opener
                    cover is a separate absence scenario.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-royal-gold" size={18} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Generic finisher</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Ferreira, Dubey, Shanaka and Jadeja already give the squad several
                    lower-order/all-round options.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-royal-gold" size={18} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Another spinner</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Bishnoi and Punja offer wrist-spin; Jadeja and Siddharth add left-arm orthodox
                    options.{" "}
                    {
                      "Hasaranga was considered for attacking leg-spin plus potential lower-order hitting"
                    }
                    , but he would consume one of RR’s three remaining overseas squad slots and has
                    a documented history of interrupted availability (heel / hamstring). He is not
                    prioritised without a clear XI upgrade and independent medical clearance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 rounded-[22px] border border-royal-pink/25 bg-card p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-royal-pink">
                From gap to candidate
              </p>
              <h3 className="display-face mt-2 text-3xl text-foreground">
                Every target must change a role—not just a ranking.
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                See the target's role fit, evidence sample, market gate, overseas cost and the exact
                XI consequence before treating the name as an acquisition recommendation.
              </p>
            </div>
            <Button
              asChild
              className="shrink-0 rounded-full bg-royal-pink px-6 text-white hover:bg-royal-pink/90"
            >
              <Link to="/targets">
                Open recruitment board <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        </section>

        <section className="border-y border-border bg-[linear-gradient(110deg,#28182f,#3d203d)] px-5 py-12 text-white sm:px-8 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-gold">
                04 · Decision workflow
              </p>
              <h2 className="display-face mt-2 text-4xl leading-tight sm:text-5xl">
                From squad gap to match-day combination.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/75">
                Review the 11-player reference XI; evaluate genuine recruitment opportunities for
                middle-order repair, late finishing and death bowling; test retained-player
                absences; then use the Match-state Lab to see credible situation-based Impact Player
                applications. The chooser is a transparent role-and-constraint engine, not a trained
                model of historical substitution choices.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[560px]">
              <Link
                to="/squad"
                className="rounded-xl border border-white/20 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <Users size={19} className="text-royal-gold" />
                <span className="mt-3 block text-sm font-semibold">Squad & XI</span>
              </Link>
              <Link
                to="/targets"
                className="rounded-xl border border-white/20 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <Target size={19} className="text-royal-gold" />
                <span className="mt-3 block text-sm font-semibold">Recruitment</span>
              </Link>
              <Link
                to="/match-lab"
                className="rounded-xl border border-white/20 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <Activity size={19} className="text-royal-gold" />
                <span className="mt-3 block text-sm font-semibold">Match state</span>
              </Link>
              <Link
                to="/knockouts"
                className="rounded-xl border border-white/20 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <Crosshair size={19} className="text-royal-gold" />
                <span className="mt-3 block text-sm font-semibold">Evidence</span>
              </Link>
              <Link
                to="/spatial-lab"
                className="rounded-xl border border-white/20 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <MapPin size={19} className="text-royal-gold" />
                <span className="mt-3 block text-sm font-semibold">Kadamba zones</span>
              </Link>
              <Link
                to="/pressure-rankings"
                className="rounded-xl border border-white/20 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <TrendingUp size={19} className="text-royal-gold" />
                <span className="mt-3 block text-sm font-semibold">IPL pressure ranks</span>
              </Link>
              <Link
                to="/sources"
                className="rounded-xl border border-white/20 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <BookOpen size={19} className="text-royal-gold" />
                <span className="mt-3 block text-sm font-semibold">Sources & methods</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-[22px] border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Users className="text-royal-gold" size={20} />
                <p className="text-xs font-bold uppercase tracking-[.16em] text-royal-gold">
                  2027 retained squad snapshot
                </p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <b className="display-face text-3xl text-foreground">{retainedCount}</b>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Retained
                  </p>
                </div>
                <div>
                  <b className="display-face text-3xl text-foreground">
                    {retainedOverseas}/{MAX_OVERSEAS_SQUAD_SIZE}
                  </b>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Overseas squad
                  </p>
                </div>
                <div>
                  <b className="display-face text-3xl text-foreground">{openPlaces}</b>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Open places
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                The six empty places are capacity, not a requirement to sign six players. Up to{" "}
                {warRoomData.team.additional_overseas_squad_slots_up_to} additional overseas squad
                slots remain under the current snapshot.{" "}
                <Link to="/sources" className="font-semibold text-royal-gold hover:text-royal-pink">
                  Open the source register and model limitations ↗
                </Link>
              </p>
            </article>
            <article className="rounded-[22px] border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <XCircle className="text-royal-pink" size={20} />
                <p className="text-xs font-bold uppercase tracking-[.16em] text-royal-pink">
                  What this dashboard does not claim
                </p>
              </div>
              <ul className="mt-4 space-y-2 text-xs leading-5 text-muted-foreground">
                <li>• No player acquisition is proven to change a historical result.</li>
                <li>
                  • No champion-continuity advantage is claimed without reconciled match-by-match
                  XIs.
                </li>
                <li>
                  • Released does not mean auction-registered; player availability must be verified.
                </li>
                <li>
                  • Match-state Impact Player suggestions are heuristic options, not predicted
                  substitution outcomes.
                </li>
              </ul>
            </article>
          </div>
          <p className="mt-6 text-[10px] leading-5 text-muted-foreground">
            Season source: {seasonReviewSource.label}, published {seasonReviewSource.published}.
            Season records are league-stage figures; post-season results are separated. Squad
            snapshot: supplied RR 2027 retention and role data. Detailed phase numbers: submitted
            scorecard/ball-by-ball report; values are batter-run components, not official phase
            totals.
          </p>
        </section>
      </main>
    </PageFrame>
  );
}
