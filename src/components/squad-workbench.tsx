import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CircleAlert, Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageFrame, OfficialRoyalsCrest } from "@/components/war-room";
import { XIPlayerRail } from "@/components/xi-player-rail";
import { RR_FOCUSED_TARGETS, RR_RETAINED_DECISION_PLAYERS } from "@/domain/decision-data";
import {
  assessInjuryCover,
  canUseHypotheticalTarget,
  MAX_OVERSEAS_SQUAD_SIZE,
  MAX_SQUAD_SIZE,
  optimizeRRLineups,
} from "@/domain/rr-decision-engine";
import { cn } from "@/lib/utils";

const initialContext = {
  surface: "neutral" as const,
  opposition: "balanced" as const,
  objective: "balanced" as const,
  venue: "",
  venueEvidence: "unavailable" as const,
};

const retainedCount = RR_RETAINED_DECISION_PLAYERS.length;
const retainedOverseasCount = RR_RETAINED_DECISION_PLAYERS.filter(
  (player) => player.overseas,
).length;

const groupDefinitions = [
  {
    title: "Batting spine",
    subtitle: "Top four and established middle-order roles",
    names: ["Vaibhav Sooryavanshi", "Yashasvi Jaiswal", "Dhruv Jurel", "Riyan Parag"],
  },
  {
    title: "Lower-order resources",
    subtitle: "Existing finishers and batting-all-round options",
    names: ["Donovan Ferreira", "Shubham Dubey", "Dasun Shanaka"],
  },
  {
    title: "Pace group",
    subtitle: "New-ball, strike pace and rotation options",
    names: [
      "Jofra Archer",
      "Nandre Burger",
      "Mohammed Shami",
      "Sandeep Sharma",
      "Brijesh Sharma",
      "Sushant Mishra",
    ],
  },
  {
    title: "Spin group",
    subtitle: "Wrist-spin, left-arm orthodox and development cover",
    names: ["Ravindra Jadeja", "Ravi Bishnoi", "Yash Raj Punja", "Manimaran Siddharth"],
  },
  {
    title: "Keeping and development cover",
    subtitle: "Additional batting / wicketkeeping depth",
    names: ["Lhuan-dre Pretorius", "Aman Rao Perala"],
  },
];

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
        {label}
      </span>
      <select
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-royal-pink"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SquadWorkbenchPage() {
  const [unavailablePlayer, setUnavailablePlayer] = useState("Jofra Archer");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const context = useMemo(() => initialContext, []);
  const engine = useMemo(
    () =>
      optimizeRRLineups({
        retainedPlayers: RR_RETAINED_DECISION_PLAYERS,
        targetPool: [],
        selectedAcquisitions: [],
        medicalClearanceAssumptions: [],
        context,
        limit: 1,
      }),
    [context],
  );

  const injuryCover = useMemo(
    () =>
      assessInjuryCover(
        unavailablePlayer,
        RR_RETAINED_DECISION_PLAYERS,
        RR_FOCUSED_TARGETS,
        [],
        [],
      ),
    [unavailablePlayer],
  );

  const injuryXI = useMemo(
    () =>
      optimizeRRLineups({
        retainedPlayers: RR_RETAINED_DECISION_PLAYERS,
        targetPool: [],
        selectedAcquisitions: [],
        medicalClearanceAssumptions: [],
        unavailablePlayers: [unavailablePlayer],
        context,
        limit: 1,
      }),
    [unavailablePlayer, context],
  );

  function handleSelectPlanForMatchLab(plan: (typeof engine.recommendations)[number]) {
    const selectedXI = plan.players.map((entry) => entry.player.name);
    setSelectedPlanId(plan.id);
    try {
      sessionStorage.setItem("rr-wr-selected-xi", JSON.stringify(selectedXI));
      sessionStorage.setItem("rr-wr-selected-acquisitions", JSON.stringify([]));
      sessionStorage.setItem("rr-wr-selected-plan-label", "Retained-core combination");
    } catch {
      // Session storage is optional
    }
  }

  return (
    <PageFrame>
      <main className="pb-16">
        <section className="border-b border-border bg-[linear-gradient(120deg,rgba(30,20,46,.98),rgba(65,18,55,.95))] px-5 py-10 text-white sm:px-8 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <OfficialRoyalsCrest compact />
                <span className="text-xs font-bold uppercase tracking-[.2em] text-royal-gold">
                  Squad architecture · XI lab
                </span>
              </div>
              <h1 className="display-face max-w-4xl text-5xl leading-[.95] sm:text-7xl">
                Build the squad.
                <br />
                <span className="text-royal-pink">Choose the starting XI.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/80">
                This page has two jobs: test which additions improve RR’s squad, then select the
                eleven starters. The Impact Player is a separate match-day decision: send your XI to
                Match-State Lab, enter the score and phase, and the engine will assess a one-for-one
                substitution for that situation.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 border-l border-white/20 pl-5 sm:grid-cols-4 lg:grid-cols-2">
              <div>
                <b className="display-face text-4xl">
                  {engine.squadSize} / {MAX_SQUAD_SIZE}
                </b>
                <span className="mt-1 block text-xs uppercase tracking-wider text-white/65">
                  Projected squad
                </span>
              </div>
              <div>
                <b className="display-face text-4xl">
                  {Math.max(0, MAX_SQUAD_SIZE - engine.squadSize)}
                </b>
                <span className="mt-1 block text-xs uppercase tracking-wider text-white/65">
                  Squad places left
                </span>
              </div>
              <div>
                <b className="display-face text-4xl">
                  {engine.overseasSquadCount} / {MAX_OVERSEAS_SQUAD_SIZE}
                </b>
                <span className="mt-1 block text-xs uppercase tracking-wider text-white/65">
                  Overseas in squad
                </span>
              </div>
              <div>
                <b className="display-face text-4xl">
                  {Math.max(0, MAX_OVERSEAS_SQUAD_SIZE - engine.overseasSquadCount)}
                </b>
                <span className="mt-1 block text-xs uppercase tracking-wider text-white/65">
                  Overseas places left
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="mb-7 max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-royal-pink">
              01 · The retained base
            </p>
            <h2 className="display-face mt-2 text-3xl text-foreground sm:text-4xl">
              What RR already have
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Role clusters matter more than nineteen isolated player tiles. The groupings below
              reflect the supplied primary roles; they are not a rating of player quality.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {groupDefinitions.map((group) => (
              <article
                key={group.title}
                className="rounded-2xl border border-border bg-card p-5 sm:p-6"
              >
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 className="display-face text-2xl text-foreground">{group.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{group.subtitle}</p>
                  </div>
                  <span className="font-mono text-xs text-royal-gold">
                    {String(group.names.length).padStart(2, "0")} players
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {group.names.map((name) => {
                    const player = RR_RETAINED_DECISION_PLAYERS.find((item) => item.name === name)!;
                    return (
                      <div key={name} className="flex items-start justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{name}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {player.role}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
                            player.overseas
                              ? "bg-royal-pink/10 text-royal-pink"
                              : "bg-secondary text-muted-foreground",
                          )}
                        >
                          {player.overseas ? "Overseas" : "Indian"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border-l-4 border-royal-pink bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-royal-pink">
                Established spine
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Vaibhav, Jaiswal, Jurel (No.3) and Parag (No.4) anchor the top four; Ferreira
                already supplies lower-order hitting; Jadeja and Archer anchor all-round and
                strike-bowling roles.
              </p>
            </article>
            <article className="rounded-2xl border-l-4 border-royal-gold bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                Most useful additions
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Indian pace depth and injury cover are easier to justify than adding another player
                who duplicates the existing finishing group.
              </p>
            </article>
            <article className="rounded-2xl border-l-4 border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Conditional batting search
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                A No.5/6 option should be added only if it offers a clear difference over Shubham
                Dubey, Dasun Shanaka and Ferreira.
              </p>
            </article>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/25 px-5 py-10 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-royal-pink">
                02 · Reference Core XI
              </p>
              <h2 className="display-face mt-2 text-3xl text-foreground sm:text-4xl">
                One Core Playing XI & Retained Bench
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Exactly one analyst-selected reference XI using RR’s retained squad. Batting
                positions 5 and 6 remain open recruitment opportunities; bowling-phase coverage is
                evaluated across the entire attack rather than assigning death bowling to fixed
                batting numbers.
              </p>
            </div>

            <div className="space-y-6">
              {engine.recommendations.slice(0, 1).map((plan) => (
                <article
                  key={plan.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-card",
                    selectedPlanId === plan.id
                      ? "border-royal-pink ring-1 ring-royal-pink/30"
                      : "border-border",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[.16em] text-royal-pink">
                        Analyst Reference Starting XI
                      </span>
                      <h3 className="display-face mt-1 text-2xl text-foreground">
                        Definitive 11-Player Starting XI
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-3 text-right">
                        <div>
                          <b className="display-face text-2xl text-foreground">
                            {plan.corePlayersKept}/7
                          </b>
                          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                            Core kept
                          </span>
                        </div>
                        <div>
                          <b className="display-face text-2xl text-foreground">
                            {plan.overseasCount}/4
                          </b>
                          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                            Overseas XI
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={selectedPlanId === plan.id ? "default" : "outline"}
                        onClick={() => handleSelectPlanForMatchLab(plan)}
                        className={
                          selectedPlanId === plan.id
                            ? "rounded-full bg-royal-pink text-white hover:bg-royal-pink/90"
                            : "rounded-full"
                        }
                      >
                        {selectedPlanId === plan.id
                          ? "Sent to Match-State Lab"
                          : "Use this Reference XI"}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-5 p-5">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">
                          Starting XI · 11 players
                        </p>
                        <span className="text-[11px] font-semibold text-royal-pink">
                          Batting order can float by match situation
                        </span>
                      </div>
                      <XIPlayerRail
                        players={plan.players}
                        note="These are the eleven selected starters. Positions 5–8 float flexibly by match state. Bowling-phase coverage is evaluated across the bowling group, not by batting slot."
                      />

                      {/* Distinct Phase Coverage: Separating Batting Opportunities from Bowling Phase Execution */}
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-royal-pink/30 bg-royal-pink/5 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-royal-pink">
                            Open Batting Roles & Opportunities
                          </p>
                          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                            <li>
                              <strong className="text-foreground">
                                • No.5/6 Middle-Order Flex:
                              </strong>{" "}
                              Opportunity for an innings-repair anchor (Nehal Wadhera profile) to
                              stabilize clusters at 20/3.
                            </li>
                            <li>
                              <strong className="text-foreground">
                                • Lower-Order Acceleration:
                              </strong>{" "}
                              Boundary-hitting finish opportunity (Mitch Owen profile) alongside
                              Ferreira & Dubey.
                            </li>
                          </ul>
                        </div>
                        <div className="rounded-xl border border-royal-gold/30 bg-royal-gold/5 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                            Bowling Phase Coverage (Whole Attack)
                          </p>
                          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                            <li>
                              <strong className="text-foreground">• New Ball / Powerplay:</strong>{" "}
                              Mohammed Shami (R) & Nandre Burger (L) preferred pair; Boult
                              historical benchmark.
                            </li>
                            <li>
                              <strong className="text-foreground">• Strike & Variations:</strong>{" "}
                              Jofra Archer (strike pace), Sandeep Sharma (control/variations), Ravi
                              Bishnoi & Jadeja (spin).
                            </li>
                            <li>
                              <strong className="text-foreground">
                                • Death Execution (17–20):
                              </strong>{" "}
                              Archer, Sandeep, and Brijesh Sharma provide coverage. Extra quick
                              (Pathirana profile) serves as selective insurance, never an empty-role
                              purchase.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/30 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                        Retained Squad Depth & Bench (
                        {RR_RETAINED_DECISION_PLAYERS.length - plan.players.length} Players Outside
                        XI)
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Existing retained depth on RR's roster before auction recruitment:
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {RR_RETAINED_DECISION_PLAYERS.filter(
                          (player) => !plan.players.some((p) => p.player.name === player.name),
                        ).map((benchPlayer) => (
                          <div
                            key={benchPlayer.name}
                            className="rounded-lg bg-background/80 p-2 border border-border"
                          >
                            <p className="text-xs font-semibold text-foreground">
                              {benchPlayer.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{benchPlayer.role}</p>
                            <span className="mt-1 inline-block text-[9px] font-mono uppercase text-royal-pink">
                              {benchPlayer.overseas ? "Overseas Depth" : "Indian Depth"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-royal-pink">
                          What this core XI provides RR
                        </p>
                        <ul className="mt-2 space-y-2">
                          {plan.reasons.map((reason) => (
                            <li
                              key={reason}
                              className="flex gap-2 text-xs leading-5 text-muted-foreground"
                            >
                              <Check size={14} className="mt-0.5 shrink-0 text-royal-pink" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                          Trade-offs & Open Recruitment Opportunities
                        </p>
                        <ul className="mt-2 space-y-1">
                          {plan.tradeOffs.map((reason) => (
                            <li key={reason} className="text-sm leading-6 text-muted-foreground">
                              • {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-royal-pink">
                03 · Injury resilience
              </p>
              <h2 className="display-face mt-2 text-3xl text-foreground">
                What if a core player is unavailable?
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                A franchise needs cover before it needs a replacement. This view checks role overlap
                in the retained squad and selected targets without claiming identical performance.
              </p>
              <div className="mt-5">
                <SelectField
                  label="Test an absence"
                  value={unavailablePlayer}
                  onChange={setUnavailablePlayer}
                  options={RR_RETAINED_DECISION_PLAYERS.map((p) => ({
                    value: p.name,
                    label: p.name,
                  }))}
                />
              </div>
            </div>
            <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                    Role-cover assessment
                  </span>
                  <h3 className="display-face mt-1 text-2xl text-foreground">
                    {injuryCover.unavailablePlayer}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">{injuryCover.primaryRole}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  {injuryCover.options.length} options identified
                </span>
              </div>
              {injuryCover.options.length ? (
                <div className="mt-4 divide-y divide-border">
                  {injuryCover.options.map((option) => (
                    <div
                      key={option.player.name}
                      className="flex flex-wrap items-start justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {option.player.name}
                        </p>
                        <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                          {option.reason}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
                          option.coverage === "strong"
                            ? "bg-royal-pink/10 text-royal-pink"
                            : "bg-royal-gold/10 text-royal-gold",
                        )}
                      >
                        {option.coverage} role cover
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-destructive">{injuryCover.gap}</p>
              )}
              {injuryXI.recommendations[0] && (
                <div className="mt-5 rounded-xl bg-secondary/55 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-royal-pink">
                    XI regenerated with {unavailablePlayer} unavailable
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    {injuryXI.recommendations[0].players.map(({ position, player }) => (
                      <div
                        key={`${position}-${player.name}`}
                        className="flex gap-2 border-b border-border/60 py-1.5"
                      >
                        <span className="font-mono text-xs text-royal-gold">{position}.</span>
                        <span className="text-xs font-semibold text-foreground">{player.name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    {injuryXI.recommendations[0].tradeOffs[0] ??
                      "The generator has retained the available core and refilled the affected role from the active squad."}
                  </p>
                </div>
              )}
              {injuryXI.errors.map((error) => (
                <p key={error} className="mt-3 text-xs text-destructive">
                  {error}
                </p>
              ))}
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[linear-gradient(110deg,#28182f,#54203f)] p-6 text-white sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-gold">
                Next decision
              </p>
              <h2 className="display-face mt-1 text-3xl">
                Next: test this starting XI in a match situation.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                This is your starting eleven. In Match-State Lab, enter the innings, score, wickets
                and overs to see a proposed player come in for one of these eleven—and the
                capability the team gives up.
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-royal-pink px-5 text-white hover:bg-royal-pink/90"
            >
              <Link to="/match-lab">
                Choose an Impact Player for a match state <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
