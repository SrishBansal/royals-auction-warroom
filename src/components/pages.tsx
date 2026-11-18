import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  HeartPulse,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PageFrame,
  LeadIn,
  SectionTitle,
  Subhead,
  Metric,
  PlayerTile,
  VacancyBays,
  HeroCTA,
  SourceLink,
  StatusLegend,
  TargetStatus,
} from "@/components/war-room";
import {
  warRoomData,
  type BatterRank,
  type BowlerRank,
  type ReleasedPlayer,
  type WatchlistPlayer,
} from "@/data/war-room";
import stadiumImage from "@/assets/jaipur-stadium.jpg";
import { cn } from "@/lib/utils";
import {
  NORMALIZED_SCENARIOS,
  getNormalizedScenario,
  baseXI,
  type NormalizedScenario,
} from "@/domain/scenarios";
import {
  validateSquad,
  validatePlayingXI,
  calculateBenchDisplacement,
  calculatePurse,
  cleanPlayerName,
  resolvePlayerDetails,
  classifyCandidateAcquisition,
  MAX_SQUAD_SIZE,
  MAX_OVERSEAS_SQUAD,
  MAX_OVERSEAS_PLAYING_XI,
  INITIAL_PURSE_CRORE,
  PLAYING_XI_SIZE,
  type PlayerBid,
} from "@/domain/squad-rules";
import { type AssessmentOptions } from "@/domain/market-eligibility";
import {
  RR_BATTER_RECOMMENDATIONS,
  RR_BOWLER_RECOMMENDATIONS,
  BENCHMARK_EXCLUSIONS,
  MIDDLE_ORDER_VARIATIONS,
  IMPACT_PLAYER_SCENARIOS,
  PROPOSED_STARTING_XI_SCENARIOS,
  AUCTION_SLOT_STRATEGY,
  type RecruitmentCandidate,
} from "@/domain/recruitment";

const data = warRoomData;
const team = data.team;
const targetByName = new Map(data.auction_watchlist.map((player) => [player.name, player]));
const retainedByName = new Map(data.team.retained_players.map((player) => [player.name, player]));
const recruitmentCandidateByName = new Map<string, RecruitmentCandidate>(
  [...RR_BATTER_RECOMMENDATIONS, ...RR_BOWLER_RECOMMENDATIONS].map((c) => [c.name, c]),
);

function format(value: number | null | undefined, digits = 2) {
  return value === null || value === undefined
    ? "Not available in supplied data"
    : value.toLocaleString("en-IN", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      });
}

function percent(value: number | null | undefined) {
  return value === null || value === undefined
    ? "Not available in supplied data"
    : `${(value * 100).toFixed(1)}%`;
}

function SnapshotStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-border py-2 text-[9px] font-semibold uppercase tracking-[.15em] text-muted-foreground">
      <span className="text-royal-gold">Data snapshot · 18 Nov 2026</span>
      <span>·</span>
      <span>Release is not registration</span>
      <span>·</span>
      <span>Static decision support</span>
    </div>
  );
}

export function HomePage() {
  const slashRef = useRef<HTMLElement | null>(null);
  const [slashActive, setSlashActive] = useState(false);
  useEffect(() => {
    const section = slashRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSlashActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return (
    <PageFrame>
      <main>
        <section className="relative flex min-h-[calc(100svh-64px)] items-center overflow-hidden bg-background">
          <img
            src={stadiumImage}
            alt="Floodlit Jaipur cricket stadium at night, with a green pitch and pink-and-blue stands"
            className="hero-image"
            width={1920}
            height={1024}
          />
          <div className="hero-shade" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-20 sm:px-9 sm:pb-32">
            <div className="max-w-3xl fade-rise">
              <div className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.22em] text-royal-gold">
                <span className="grid size-9 place-items-center border border-royal-gold/60">
                  <ShieldCheck size={19} />
                </span>
                IPL 2027 · squad snapshot · 18 Nov 2026
              </div>
              <h1 className="display-face max-w-3xl text-6xl leading-[.82] text-foreground sm:text-8xl lg:text-9xl">
                The Royals
                <br />
                <span className="text-royal-pink">War Room</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-foreground/85 sm:text-lg">
                Build a side that wins the moments that matter.
              </p>
              <HeroCTA />
            </div>
          </div>
          <a
            href="#squad-reveal"
            aria-label="Scroll to the retained squad"
            className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[.18em] text-foreground/80"
          >
            Scroll to the squad <ArrowDown size={15} className="animate-bounce" />
          </a>
        </section>
        <section
          ref={slashRef}
          id="squad-reveal"
          className={cn(
            "slash-transition relative scroll-mt-16 border-y border-royal-gold/30 bg-background px-5 py-16 sm:px-8 sm:py-24",
            slashActive && "slash-active",
          )}
        >
          <div className="relative z-[4] mx-auto max-w-7xl">
            <div className="mb-7 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <SectionTitle
                kicker="The roster reveal · analyst snapshot"
                title="19 retained. 6 decisions left."
                description="A 19-player squad is retained or traded in. Tentative role ideas are not a confirmed 2027 playing XI."
                number="01"
              />
              <div className="pb-2">
                <StatusLegend />
              </div>
            </div>
            <SnapshotStrip />
            <div className="my-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              <Metric value="19 / 25" label="Squad places filled" />
              <Metric value="6" label="Squad places open" accent />
              <Metric value="₹27.05 Cr" label="Purse remaining" />
              <Metric value="5 / 8" label="Overseas in squad" />
              <Metric value="4 max" label="Overseas in playing XI" accent />
            </div>
            <div className="pitch-surface border border-border p-4 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[.18em] text-royal-gold">
                    Locked roster · not a starting XI
                  </p>
                  <h2 className="display-face mt-1 text-2xl text-foreground">
                    Retained dugout <span className="text-muted-foreground">/ 19</span>
                  </h2>
                </div>
                <span className="border border-border bg-background/70 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  5 overseas retained · up to 3 more in squad
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {team.retained_players.map((player) => (
                  <PlayerTile key={player.name} player={player} compact />
                ))}
              </div>
            </div>
            <div className="mt-12 grid gap-4 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-royal-pink">
                  Open roster · role hypotheses only
                </p>
                <h2 className="display-face mt-2 text-3xl text-foreground">Six empty bays.</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  Each position stays vacant until selected. The role labels are questions for the
                  auction room, not assigned players.
                </p>
                <p className="mt-4 border-l-2 border-royal-gold pl-3 text-xs leading-5 text-muted-foreground">
                  <strong className="text-foreground">Finisher is not vacant:</strong> Donovan
                  Ferreira is already retained as an overseas lower-order hitter; Shubham Dubey and
                  Dasun Shanaka add further role options.
                </p>
              </div>
              <VacancyBays />
            </div>
            <div className="mt-14 border-t border-border pt-9">
              <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="text-[9px] uppercase tracking-[.16em] text-royal-gold">
                    Next scene · working-core assumption
                  </p>
                  <h2 className="display-face mt-1 text-3xl text-foreground">
                    A core takes shape.
                  </h2>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
                    Nine retained names appear in a proposed role map. Remaining lineup choices and
                    all six roster bays stay open; the animation does not announce a confirmed XI.
                  </p>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  Pitch-side role projection · not selection
                </span>
              </div>
              <div className="pitch-surface grid grid-cols-2 gap-2 border border-border p-3 sm:grid-cols-3 sm:p-5 lg:grid-cols-4">
                {[
                  ["Vaibhav Sooryavanshi", "01 · Opener"],
                  ["Yashasvi Jaiswal", "02 · Opener"],
                  ["Riyan Parag", "03 · Captain"],
                  ["Dhruv Jurel", "04 · Wicketkeeper"],
                  ["Indian middle-order repair", "05 · Target role · vacant"],
                  ["Donovan Ferreira", "06 · Retained lower-order hitter"],
                  ["Ravindra Jadeja", "07 · All-rounder / spin"],
                  ["Ravi Bishnoi / Punja", "08 · Spin choice · conditions"],
                  ["Jofra Archer", "09 · Strike pace"],
                  ["Mohammed Shami", "10 · New-ball pace"],
                  ["Nandre Burger / Sandeep", "11 · Pace combination · rotation"],
                ].map(([name, role], index) => {
                  const player = retainedByName.get(name?.split(" /")[0] ?? "");
                  const isVacant = index === 4;
                  const playerName = name ?? "Unassigned role";
                  const playerRole = role ?? "Role to review";
                  return (
                    <div
                      key={playerRole}
                      className={cn(
                        "working-card border p-3",
                        isVacant ? "roster-slot" : "data-card",
                        index === 10 && "border-dashed",
                        player?.overseas && "border-royal-gold/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] text-royal-gold">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                          {isVacant
                            ? "Vacant role"
                            : index === 10
                              ? "Retained pace rotation"
                              : index === 7
                                ? "Retained / target choice"
                                : player?.overseas
                                  ? "Retained · overseas"
                                  : "Retained · Indian"}
                        </span>
                      </div>
                      <h3 className="display-face mt-3 text-lg leading-tight text-foreground">
                        {playerName}
                      </h3>
                      <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                        {playerRole}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
                Bishnoi / Punja / Siddharth are a conditions-dependent spin choice. Burger, Shami,
                Sandeep and retained pace depth rotate by phase; the bench is not displayed as
                starting XI.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
              <p className="text-xs text-muted-foreground">
                New auction entrants · awaiting official registration list. Released does not mean
                registered.
              </p>
              <Button asChild variant="outline" className="rounded-sm uppercase tracking-wider">
                <Link to="/squad">
                  Open the squad builder <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-royal-pink">
                Horses for courses
              </p>
              <h2 className="display-face mt-3 text-4xl leading-none text-foreground sm:text-5xl">
                Pick the conditions.
                <br />
                Build for the moment.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
                Compare proposed tactical XIs for swing, spin, innings repair and death overs. These
                are analyst scenarios—not a price model or an official team selection.
              </p>
              <Button asChild className="mt-6 rounded-sm uppercase tracking-wider">
                <Link to="/squad">
                  Explore proposed XIs <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
              {[
                { to: "/targets", n: "01", t: "Auction board" },
                { to: "/batters", n: "02", t: "Pressure batters" },
                { to: "/bowlers", n: "03", t: "Pressure bowlers" },
                { to: "/knockouts", n: "04", t: "Knockout cases" },
                { to: "/methodology", n: "05", t: "Evidence audit" },
                { to: "/squad", n: "06", t: "Working XI" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex min-h-28 flex-col justify-between bg-card p-4 transition-colors hover:bg-accent"
                >
                  <span className="font-mono text-xs text-royal-gold">{item.n}</span>
                  <span className="flex items-center justify-between gap-2 text-xs font-semibold uppercase text-foreground">
                    {item.t}
                    <ArrowUpRight
                      size={14}
                      className="text-royal-pink transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}

function makeSelectClass(extra = "") {
  return `control ${extra}`;
}

export function SquadPage() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("balanced");
  const [pathiranaCleared, setPathiranaCleared] = useState<boolean>(false);
  const [mustafizurCleared, setMustafizurCleared] = useState<boolean>(false);
  const [hasarangaCleared, setHasarangaCleared] = useState<boolean>(false);
  const [customLineup, setCustomLineup] = useState<string[]>(baseXI);
  const [impactSituation, setImpactSituation] = useState<string>("Batting first");
  const [impactPlayer, setImpactPlayer] = useState<string>("Sandeep Sharma");
  const [userMessage, setUserMessage] = useState<string>("");
  const [scenarioBids, setScenarioBids] = useState<Record<string, number>>({});

  const activeScenario =
    NORMALIZED_SCENARIOS.find((item) => item.id === activeScenarioId) ?? NORMALIZED_SCENARIOS[0]!;

  const assessmentOptions: AssessmentOptions = {
    analystClearedMedical: pathiranaCleared || mustafizurCleared,
    analystWorkloadAssumed: hasarangaCleared,
  };

  // Determine current starting XI
  const selectedXI =
    activeScenarioId === "custom"
      ? customLineup
      : activeScenario.startingXI.map((name) => {
          if (name === "Matheesha Pathirana" && !pathiranaCleared) return "Sushant Mishra";
          if (name === "Mustafizur Rahman" && !mustafizurCleared) return "Sushant Mishra";
          if (name === "Wanindu Hasaranga" && !hasarangaCleared) return "Sushant Mishra";
          return name;
        });

  // Track additions in the scenario
  const additionsInXI = Array.from(new Set(selectedXI.filter((name) => !retainedByName.has(name))));

  const scenarioAdditions =
    activeScenarioId === "custom"
      ? additionsInXI
      : Array.from(
          new Set([
            ...activeScenario.conditionalAcquisitions.map((c) => c.playerName),
            ...additionsInXI,
          ]),
        );

  const activeHypotheticalAcquisitions = scenarioAdditions.filter((name) => {
    if (name === "Matheesha Pathirana" && !pathiranaCleared) return false;
    if (name === "Mustafizur Rahman" && !mustafizurCleared) return false;
    if (name === "Wanindu Hasaranga" && !hasarangaCleared) return false;
    return true;
  });

  const retainedPlayerNames = team.retained_players.map((p) => p.name);
  const scenarioSquad = [...retainedPlayerNames, ...activeHypotheticalAcquisitions];

  // Pure domain calculations
  const squadValidation = validateSquad({
    hypotheticalAcquisitions: activeHypotheticalAcquisitions,
    options: assessmentOptions,
  });

  const xiValidation = validatePlayingXI({
    playingXI: selectedXI,
    squadPlayers: scenarioSquad,
    options: assessmentOptions,
  });

  const benchDisplacement = calculateBenchDisplacement(
    selectedXI,
    scenarioSquad,
    retainedPlayerNames,
  );

  const playerBids: PlayerBid[] = activeHypotheticalAcquisitions.map((name) => ({
    playerName: name,
    amountCrore: scenarioBids[name] ?? 0,
    isHypothetical: true,
  }));

  const purseResult = calculatePurse(playerBids);

  function chooseScenario(item: NormalizedScenario) {
    setActiveScenarioId(item.id);
    const resolvedXI = item.startingXI.map((name) => {
      if (name === "Matheesha Pathirana" && !pathiranaCleared) return "Sushant Mishra";
      if (name === "Mustafizur Rahman" && !mustafizurCleared) return "Sushant Mishra";
      if (name === "Wanindu Hasaranga" && !hasarangaCleared) return "Sushant Mishra";
      return name;
    });
    setCustomLineup(resolvedXI);
    setUserMessage("");
  }

  function updateSlot(index: number, newPlayer: string) {
    if (selectedXI[index] === newPlayer) return;

    // Duplicate check
    const duplicateIndex = selectedXI.findIndex((name, i) => i !== index && name === newPlayer);
    if (duplicateIndex !== -1) {
      setUserMessage(
        `Duplicate player: "${newPlayer}" is already selected in batting slot ${duplicateIndex + 1}. A player cannot occupy two positions in the proposed playing XI.`,
      );
      return;
    }

    // Availability checks
    if (newPlayer === "Jacob Bethell" || newPlayer === "Mitchell Starc") {
      setUserMessage(
        `Selection rejected: "${newPlayer}" is not selectable under the current availability snapshot.`,
      );
      return;
    }

    if (newPlayer === "Matheesha Pathirana" && !pathiranaCleared) {
      setUserMessage(
        "Pathirana requires independent medical review and clearance before selection in an analyst scenario.",
      );
      return;
    }
    if (newPlayer === "Mustafizur Rahman" && !mustafizurCleared) {
      setUserMessage(
        "Mustafizur requires independent medical review before selection in an analyst scenario.",
      );
      return;
    }
    if (newPlayer === "Wanindu Hasaranga" && !hasarangaCleared) {
      setUserMessage(
        "Hasaranga requires workload and spin-role review before selection in an analyst scenario.",
      );
      return;
    }

    const nextXI = selectedXI.map((name, i) => (i === index ? newPlayer : name));

    // Overseas in XI limit check
    const proposedOverseasInXI = nextXI.filter((name) => {
      const details = resolvePlayerDetails(name);
      return details.overseas;
    }).length;

    if (proposedOverseasInXI > MAX_OVERSEAS_PLAYING_XI) {
      setUserMessage(
        `Selection rejected: This proposed XI would contain ${proposedOverseasInXI} overseas players, exceeding the maximum limit of ${MAX_OVERSEAS_PLAYING_XI}.`,
      );
      return;
    }

    // Squad vacancies check
    const nextAdditions = Array.from(new Set(nextXI.filter((name) => !retainedByName.has(name))));
    if (nextAdditions.length > team.slots_remaining) {
      setUserMessage(
        `Selection rejected: Adding "${newPlayer}" would exceed RR's ${team.slots_remaining} available squad vacancies.`,
      );
      return;
    }

    // Squad overseas limit check
    const proposedOverseasSquad =
      team.retained_overseas_count +
      nextAdditions.filter((name) => {
        const details = resolvePlayerDetails(name);
        return details.overseas;
      }).length;

    if (proposedOverseasSquad > MAX_OVERSEAS_SQUAD) {
      setUserMessage(
        `Selection rejected: Adding "${newPlayer}" would give ${proposedOverseasSquad} overseas squad members, exceeding the cap of ${MAX_OVERSEAS_SQUAD}.`,
      );
      return;
    }

    // Valid: update custom lineup and switch to custom mode
    setCustomLineup(nextXI);
    setActiveScenarioId("custom");
    setUserMessage("");
  }

  function handleBidChange(playerName: string, rawValue: string) {
    const trimmed = rawValue.trim();
    if (trimmed === "") {
      setScenarioBids((prev) => {
        const next = { ...prev };
        delete next[playerName];
        return next;
      });
      return;
    }

    const parsed = parseFloat(trimmed);
    if (!Number.isFinite(parsed)) {
      setUserMessage(`Bid for "${playerName}" must be a valid number.`);
      return;
    }

    if (parsed < 0) {
      setUserMessage(`Bid for "${playerName}" cannot be negative.`);
      return;
    }

    setUserMessage("");
    setScenarioBids((prev) => ({
      ...prev,
      [playerName]: parsed,
    }));
  }

  // Dynamic Impact Player choices based on bench displacement
  const availableBench = benchDisplacement.benchPlayers;
  const impactChoices =
    impactSituation === "Slow pitch"
      ? availableBench.filter((name) => {
          const details = resolvePlayerDetails(name);
          return (
            details.role?.toLowerCase().includes("spin") ||
            ["Yash Raj Punja", "Manimaran Siddharth", "Ravi Bishnoi", "Ravindra Jadeja"].includes(
              name,
            )
          );
        })
      : impactSituation === "Flat / dewy pitch" || impactSituation === "Batting first"
        ? availableBench.filter((name) => {
            const details = resolvePlayerDetails(name);
            return (
              details.role?.toLowerCase().includes("fast") ||
              details.role?.toLowerCase().includes("seam") ||
              details.role?.toLowerCase().includes("pace") ||
              ["Sandeep Sharma", "Mohammed Shami", "Sushant Mishra", "Nandre Burger"].includes(name)
            );
          })
        : availableBench.filter((name) => {
            const details = resolvePlayerDetails(name);
            return (
              details.role?.toLowerCase().includes("bat") ||
              details.role?.toLowerCase().includes("wicketkeeper") ||
              ["Shubham Dubey", "Nehal Wadhera", "Donovan Ferreira"].includes(name)
            );
          });

  const resolvedImpactChoices = impactChoices.length > 0 ? impactChoices : availableBench;

  const roleOptions = [
    ...team.retained_players.map((player) => player.name),
    ...data.auction_watchlist.map((player) => player.name),
  ];

  const allValidationErrors = [
    ...xiValidation.errors,
    ...squadValidation.errors,
    ...purseResult.errors,
  ];

  const allValidationWarnings = [...xiValidation.warnings, ...squadValidation.warnings];

  return (
    <PageFrame>
      <main>
        <LeadIn
          path="/squad"
          kicker="Roster construction · squad rules & scenario engine"
          title="The working XI"
          description="Switch match plans and hypothetical recruitment targets, then customize the proposed XI. Every metric, constraint check, bench displacement and purse consequence is dynamically calculated by the central domain engine."
        />
        <section className="px-5 pb-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Top Metrics Strip */}
            <div className="grid grid-cols-2 gap-4 border-y border-border py-5 sm:grid-cols-3 lg:grid-cols-6">
              <Metric
                value={`${squadValidation.squadSize} / ${MAX_SQUAD_SIZE}`}
                label="Scenario squad"
              />
              <Metric value={squadValidation.vacanciesRemaining} label="Squad spaces left" accent />
              <Metric
                value={`${xiValidation.overseasCount} / ${MAX_OVERSEAS_PLAYING_XI}`}
                label="Overseas in proposed XI"
                accent
              />
              <Metric
                value={`${squadValidation.overseasCount} / ${MAX_OVERSEAS_SQUAD}`}
                label="Overseas in squad scenario"
              />
              <Metric
                value={`₹${purseResult.remainingPurseCrore.toFixed(2)} Cr`}
                label={
                  purseResult.totalHypotheticalSpendCrore > 0
                    ? `Hypothetical left (spent ₹${purseResult.totalHypotheticalSpendCrore.toFixed(2)} Cr)`
                    : "Purse snapshot (locked ₹27.05 Cr)"
                }
              />
              <Metric value="19 retained" label="Roster locked" />
            </div>

            {/* Scenario Header & Selector */}
            <div className="my-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-royal-pink">
                  Horses for courses
                </p>
                <h2 className="display-face mt-1 text-3xl">Choose a match plan</h2>
              </div>
              <div className="flex items-center gap-2">
                {activeScenarioId === "custom" && (
                  <span className="border border-royal-pink bg-royal-pink/10 px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-royal-pink">
                    Custom working lineup active
                  </span>
                )}
                <span className="border border-royal-gold/40 px-3 py-2 text-[10px] uppercase tracking-wider text-royal-gold">
                  Analyst scenario · hypothetical planning
                </span>
              </div>
            </div>

            {/* Scenario Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {NORMALIZED_SCENARIOS.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={activeScenarioId === item.id ? "default" : "outline"}
                  className="shrink-0 rounded-sm text-[10px] uppercase"
                  onClick={() => chooseScenario(item)}
                >
                  {item.title.split(" · ")[0]}
                </Button>
              ))}
            </div>

            {/* Main Interactive Grid: XI Pitch vs Aside Strategy */}
            <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
              {/* Pitch / Lineup Construction */}
              <div className="pitch-surface border border-border p-4 sm:p-6">
                <div className="mb-5 flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-[.16em] text-royal-gold">
                      {activeScenarioId === "custom"
                        ? "User modified lineup"
                        : activeScenario.purpose}
                    </p>
                    <h3 className="display-face mt-1 text-2xl sm:text-3xl">
                      {activeScenarioId === "custom" ? "Custom working XI" : activeScenario.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-fit border px-3 py-2 text-xs font-bold",
                        xiValidation.overseasCount > MAX_OVERSEAS_PLAYING_XI
                          ? "border-destructive text-destructive"
                          : "border-border text-foreground",
                      )}
                    >
                      {xiValidation.overseasCount} / {MAX_OVERSEAS_PLAYING_XI} overseas
                    </span>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-[42px_1fr] gap-2 border-b border-border pb-2 text-[9px] uppercase tracking-widest text-muted-foreground">
                  <span>Bat</span>
                  <span>Player · select to customize proposed XI</span>
                </div>

                {/* 11 Batting Slots */}
                <div className="space-y-1.5">
                  {selectedXI.map((name, index) => {
                    const retained = retainedByName.get(name);
                    const target = targetByName.get(name);
                    const details = resolvePlayerDetails(name);
                    const overseas = details.overseas;
                    const isGated =
                      (name === "Matheesha Pathirana" && !pathiranaCleared) ||
                      (name === "Mustafizur Rahman" && !mustafizurCleared) ||
                      (name === "Wanindu Hasaranga" && !hasarangaCleared);

                    return (
                      <div
                        key={`${index}-${name}`}
                        className="grid grid-cols-[42px_1fr] items-center gap-2 border-b border-border/60 py-1.5"
                      >
                        <span className="font-mono text-xs text-royal-gold">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <select
                            aria-label={`Batting slot ${index + 1}`}
                            value={name}
                            onChange={(event) => updateSlot(index, event.target.value)}
                            className={makeSelectClass("min-w-0 flex-1")}
                          >
                            <optgroup label="Retained Roster (19 Players · Locked)">
                              {team.retained_players.map((p) => (
                                <option key={p.name} value={p.name}>
                                  {p.name} · {p.role} · {p.overseas ? "Overseas" : "Indian"}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Conditional Watchlist (Unverified Registration)">
                              {data.auction_watchlist.map((p) => {
                                const isUnavailable =
                                  p.name === "Jacob Bethell" || p.name === "Mitchell Starc";
                                const gateDisabled =
                                  (p.name === "Matheesha Pathirana" && !pathiranaCleared) ||
                                  (p.name === "Mustafizur Rahman" && !mustafizurCleared) ||
                                  (p.name === "Wanindu Hasaranga" && !hasarangaCleared);

                                return (
                                  <option
                                    key={p.name}
                                    value={p.name}
                                    disabled={gateDisabled || isUnavailable}
                                  >
                                    {p.name} · {p.role} · {p.overseas ? "Overseas" : "Indian"} ·
                                    {isUnavailable
                                      ? " Unavailable for 2027"
                                      : gateDisabled
                                        ? " Medical/workload review required"
                                        : " Registration unverified"}
                                  </option>
                                );
                              })}
                            </optgroup>
                          </select>

                          {/* Explicit Status Badges */}
                          <span
                            className={cn(
                              "shrink-0 border px-2 py-1 text-[8px] uppercase tracking-wide",
                              retained
                                ? "border-border text-muted-foreground"
                                : "border-royal-gold/60 text-royal-gold font-medium",
                            )}
                          >
                            {retained
                              ? "Retained · locked"
                              : "Hypothetical candidate · unverified registration"}
                          </span>

                          {overseas && (
                            <span className="shrink-0 border border-royal-pink/60 px-2 py-0.5 text-[8px] uppercase tracking-wide text-royal-pink">
                              Overseas
                            </span>
                          )}

                          {isGated && (
                            <span className="text-[9px] text-destructive font-medium">
                              Medical/review gate required
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Validation Feedback & Alerts */}
                {userMessage && (
                  <p
                    role="alert"
                    className="mt-4 flex items-start gap-2 border border-destructive/60 bg-destructive/10 p-3 text-xs leading-5 text-destructive"
                  >
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    {userMessage}
                  </p>
                )}

                {allValidationErrors.length > 0 && (
                  <div className="mt-4 space-y-1.5 border border-destructive/60 bg-destructive/10 p-3 text-xs text-destructive">
                    <p className="font-semibold uppercase tracking-wider text-[10px]">
                      Squad Rules Validation Violations:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      {allValidationErrors.map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {allValidationWarnings.length > 0 && (
                  <div className="mt-3 space-y-1 border border-royal-gold/40 bg-royal-gold/5 p-3 text-xs text-royal-gold">
                    <p className="font-semibold uppercase tracking-wider text-[10px]">
                      Planning Warnings:
                    </p>
                    <ul className="list-inside list-disc space-y-0.5 text-xs">
                      {allValidationWarnings.map((warn) => (
                        <li key={warn}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Live Footprint Summary */}
                <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4 text-[10px] text-muted-foreground">
                  <span>Squad scenario: {squadValidation.squadSize} / 25</span>
                  <span>Added conditional targets: {squadValidation.acquisitionsCount}</span>
                  <span>
                    New overseas in scenario:{" "}
                    {squadValidation.overseasCount - team.retained_overseas_count} / 3
                  </span>
                  <span>
                    Displaced retained players: {benchDisplacement.displacedRetainedPlayers.length}
                  </span>
                </div>
              </div>

              {/* Aside: Tactical Strategic Analysis */}
              <aside className="space-y-5">
                {activeScenarioId === "custom" ? (
                  <div className="border border-royal-gold/60 bg-card/80 p-5">
                    <p className="text-[9px] uppercase tracking-[.16em] text-royal-pink">
                      Custom Working Lineup
                    </p>
                    <h4 className="display-face mt-1 text-xl text-foreground">
                      User-Modified Combination
                    </h4>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Predefined strategic claims (tactical rationale, trade-off notes, phase
                      bowling plans) do not apply to custom player selections.
                    </p>
                    <p className="mt-2 text-xs leading-5 text-royal-gold">
                      Live squad rules validation, role coverage analysis, bench displacement, and
                      hypothetical purse impacts are dynamically calculated below.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4 rounded-sm text-[10px] uppercase tracking-wider"
                      onClick={() =>
                        chooseScenario(
                          NORMALIZED_SCENARIOS.find((s) => s.id === "balanced") ??
                            NORMALIZED_SCENARIOS[0]!,
                        )
                      }
                    >
                      <RotateCcw size={12} className="mr-1.5" /> Reset to Core Balanced Plan
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="border border-border p-5">
                      <p className="text-[9px] uppercase tracking-[.16em] text-royal-pink">
                        Why this combination
                      </p>
                      <p className="mt-2 text-sm leading-6 text-foreground">{activeScenario.why}</p>
                      <div className="my-4 section-rule" />
                      <p className="text-[9px] uppercase tracking-[.16em] text-royal-gold">
                        Trade-off
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {activeScenario.trade}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {[
                        ["New ball", activeScenario.newBall],
                        ["Middle-over control", activeScenario.middle],
                        ["Death-over plan", activeScenario.death],
                        ["Fallback", activeScenario.fallback],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="border-l border-royal-gold/60 bg-card/60 px-4 py-3"
                        >
                          <p className="text-[9px] uppercase tracking-wider text-royal-gold">
                            {label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reconciled Alternatives */}
                    {activeScenario.alternatives && activeScenario.alternatives.length > 0 && (
                      <div className="border border-border bg-card/40 p-4">
                        <p className="text-[9px] uppercase tracking-wider text-royal-pink font-semibold">
                          Tactical Alternatives & Rotations
                        </p>
                        <div className="mt-2 space-y-2">
                          {activeScenario.alternatives.map((alt) => (
                            <div key={alt.alternativePlayer} className="text-xs">
                              <span className="font-semibold text-foreground">
                                {alt.primaryPlayer} ↔ {alt.alternativePlayer}
                              </span>
                              <span className="text-[10px] text-royal-gold ml-1.5">
                                ({alt.role})
                              </span>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {alt.reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </aside>
            </div>

            {/* Impact Player Scenarios */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Batting first", activeScenario.batImpact],
                ["Bowling first", activeScenario.bowlImpact],
              ].map(([label, value]) => (
                <div key={label} className="border border-border p-4">
                  <p className="text-[9px] uppercase tracking-wider text-royal-pink">
                    Likely Impact Player · {label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Live Squad Analytics: Role Coverage & Bench Displacement */}
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {/* Role Coverage Summary */}
              <div className="border border-border p-5 bg-card/50">
                <Subhead>Live Playing XI Role Coverage</Subhead>
                <p className="text-xs text-muted-foreground mb-4">
                  Dynamic breakdown derived directly from the selected 11 starters.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="border border-border/80 p-3 bg-background/50">
                    <span className="text-[10px] uppercase text-muted-foreground block">
                      Wicketkeepers in XI
                    </span>
                    <span className="display-face text-xl text-royal-gold">
                      {xiValidation.roleCoverage.wicketkeeperCount}
                    </span>
                  </div>
                  <div className="border border-border/80 p-3 bg-background/50">
                    <span className="text-[10px] uppercase text-muted-foreground block">
                      Bowling Options in XI
                    </span>
                    <span className="display-face text-xl text-royal-pink">
                      {xiValidation.roleCoverage.bowlingOptionsCount}
                    </span>
                  </div>
                  <div className="border border-border/80 p-3 bg-background/50">
                    <span className="text-[10px] uppercase text-muted-foreground block">
                      Overseas Starters
                    </span>
                    <span className="display-face text-xl text-foreground">
                      {xiValidation.roleCoverage.overseasPlayers.length} / {MAX_OVERSEAS_PLAYING_XI}
                    </span>
                    <small className="text-[9px] text-muted-foreground block truncate">
                      {xiValidation.roleCoverage.overseasPlayers.join(", ") || "None"}
                    </small>
                  </div>
                  <div className="border border-border/80 p-3 bg-background/50">
                    <span className="text-[10px] uppercase text-muted-foreground block">
                      Indian Starters
                    </span>
                    <span className="display-face text-xl text-foreground">
                      {xiValidation.roleCoverage.indianPlayers.length}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-2 font-semibold">
                    Role Distribution in XI
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(xiValidation.roleCoverage.roleCounts).map(([role, count]) => (
                      <span
                        key={role}
                        className="border border-border px-2 py-0.5 text-[10px] text-foreground bg-background/40"
                      >
                        {role}: <b className="text-royal-gold">{count}</b>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bench Displacement */}
              <div className="border border-border p-5 bg-card/50">
                <Subhead>Retained Bench Displacement</Subhead>
                <p className="text-xs text-muted-foreground mb-4">
                  Retained players displaced to the bench by current XI selections or hypothetical
                  signings.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="border border-border/80 p-3 bg-background/50">
                    <span className="text-[10px] uppercase text-muted-foreground block">
                      Retained in Starting XI
                    </span>
                    <span className="display-face text-xl text-royal-gold">
                      {benchDisplacement.startingRetainedPlayers.length} / 19
                    </span>
                  </div>
                  <div className="border border-border/80 p-3 bg-background/50">
                    <span className="text-[10px] uppercase text-muted-foreground block">
                      Retained Displaced to Bench
                    </span>
                    <span className="display-face text-xl text-royal-pink">
                      {benchDisplacement.displacedRetainedPlayers.length}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-2 font-semibold">
                    Displaced Retained Players ({benchDisplacement.displacedRetainedPlayers.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {benchDisplacement.displacedRetainedPlayers.map((name) => (
                      <span
                        key={name}
                        className="border border-border px-2 py-0.5 text-[10px] text-muted-foreground bg-background/40"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground leading-4">
                    {benchDisplacement.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Hypothetical Purse Simulation & Explicit Bids */}
            <div className="mt-10 border border-border p-5 bg-card/60">
              <Subhead>Purse Modeler · Explicit Bid Simulation</Subhead>
              <p className="text-xs leading-5 text-muted-foreground mb-4">
                Enter explicit hypothetical bid valuations (in ₹ Crore) for prospective auction
                additions. No bid is invented or automatically deducted from RR's ₹27.05 Cr
                remaining purse.
              </p>

              {activeHypotheticalAcquisitions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic border border-border/60 p-3">
                  Current scenario consists entirely of retained players. No hypothetical auction
                  spend required.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-[1fr_120px] gap-2 border-b border-border pb-1.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                    <span>Prospective Addition</span>
                    <span>Hypothetical Bid (₹ Cr)</span>
                  </div>
                  {activeHypotheticalAcquisitions.map((name) => {
                    const details = resolvePlayerDetails(name);
                    const currentBid = scenarioBids[name] ?? "";

                    return (
                      <div
                        key={name}
                        className="grid grid-cols-[1fr_120px] items-center gap-2 border-b border-border/40 py-2"
                      >
                        <div>
                          <span className="text-xs font-semibold text-foreground mr-2">{name}</span>
                          <span className="border border-royal-gold/60 text-royal-gold text-[8px] uppercase px-1.5 py-0.5">
                            Unverified registration · conditional
                          </span>
                          <small className="block text-[10px] text-muted-foreground mt-0.5">
                            {details.role ?? "Role in review"} ·{" "}
                            {details.overseas ? "Overseas" : "Indian"}
                          </small>
                        </div>
                        <div>
                          <Input
                            type="number"
                            min="0"
                            step="0.25"
                            placeholder="0.00"
                            value={currentBid}
                            onChange={(e) => handleBidChange(name, e.target.value)}
                            className="h-8 text-right font-mono text-xs"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Purse Results Strip */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border pt-4">
                <div className="border border-border/60 p-3 bg-background/50">
                  <span className="text-[9px] uppercase text-muted-foreground block">
                    Actual Retained Purse
                  </span>
                  <span className="display-face text-lg text-foreground">
                    ₹{INITIAL_PURSE_CRORE.toFixed(2)} Cr
                  </span>
                </div>
                <div className="border border-border/60 p-3 bg-background/50">
                  <span className="text-[9px] uppercase text-muted-foreground block">
                    Total Hypothetical Spend
                  </span>
                  <span className="display-face text-lg text-royal-pink">
                    ₹{purseResult.totalHypotheticalSpendCrore.toFixed(2)} Cr
                  </span>
                </div>
                <div
                  className={cn(
                    "border p-3 bg-background/50",
                    purseResult.remainingPurseCrore < 0
                      ? "border-destructive text-destructive"
                      : "border-border/60 text-royal-gold",
                  )}
                >
                  <span className="text-[9px] uppercase text-muted-foreground block">
                    Projected Remaining Purse
                  </span>
                  <span className="display-face text-lg">
                    ₹{purseResult.remainingPurseCrore.toFixed(2)} Cr
                  </span>
                </div>
              </div>
            </div>

            {/* Impact Player Controls & Medical / Role Review Gates */}
            <div className="mt-10 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
              <div className="border border-border p-5">
                <Subhead>Impact Player</Subhead>
                <p className="mb-4 text-xs leading-5 text-muted-foreground">
                  Regulation continues in the 2025–27 cycle; final 2027 playing conditions remain
                  subject to official confirmation. Impact substitutions drawn dynamically from
                  available bench reserves.
                </p>
                <label className="mb-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Match situation
                </label>
                <select
                  value={impactSituation}
                  onChange={(e) => {
                    const value = e.target.value;
                    setImpactSituation(value);
                  }}
                  className={makeSelectClass("mb-4")}
                >
                  <option>Batting first</option>
                  <option>Bowling first</option>
                  <option>Slow pitch</option>
                  <option>Flat / dewy pitch</option>
                  <option>Top-order collapse</option>
                </select>

                <label className="mb-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Impact option (from available bench)
                </label>
                <select
                  value={impactPlayer}
                  onChange={(e) => setImpactPlayer(e.target.value)}
                  className={makeSelectClass()}
                >
                  {resolvedImpactChoices.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medical & Role-Review Gates */}
              <div className="space-y-4 border border-border p-5">
                <div>
                  <Subhead>Analyst Medical & Role-Review Gates</Subhead>
                  <p className="mb-3 text-xs leading-5 text-muted-foreground">
                    These controls represent hypothetical analyst scenario toggles for modeling
                    purposes only. Enabling a gate does NOT constitute official medical clearance,
                    workload resolution, or verified auction registration.
                  </p>
                </div>
                {[
                  {
                    name: "Matheesha Pathirana",
                    checked: pathiranaCleared,
                    set: setPathiranaCleared,
                    summary: "Hamstring surgery / recovery; clearance is a hard gate.",
                  },
                  {
                    name: "Mustafizur Rahman",
                    checked: mustafizurCleared,
                    set: setMustafizurCleared,
                    summary: "Medical status and registration require independent verification.",
                  },
                  {
                    name: "Wanindu Hasaranga",
                    checked: hasarangaCleared,
                    set: setHasarangaCleared,
                    summary: "Medical/workload review and spin-role overlap check required.",
                  },
                ].map((gate) => (
                  <label
                    key={gate.name}
                    className="flex cursor-pointer items-start gap-3 border-t border-border pt-3"
                  >
                    <input
                      aria-label={`Enable ${gate.name} analyst review gate`}
                      type="checkbox"
                      checked={gate.checked}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        gate.set(enabled);
                        if (!enabled) {
                          setCustomLineup((current) =>
                            current.map((name) => (name === gate.name ? "Sushant Mishra" : name)),
                          );
                        }
                      }}
                      className="mt-1 size-4 accent-[var(--color-royal-pink)]"
                    />
                    <span>
                      <b className="block text-sm text-foreground">{gate.name}</b>
                      <small className="mt-1 block text-xs text-muted-foreground">
                        {gate.summary}
                      </small>
                      <small className="mt-1 block text-[9px] text-royal-gold">
                        {gate.checked
                          ? "Analyst scenario gate enabled (Analyst model only; does not assert actual medical clearance or registration)"
                          : "Requires review before selection"}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Retained Roster & Vacancy Bays */}
            <div className="mt-12 grid gap-8 xl:grid-cols-[1fr_1fr]">
              <div>
                <Subhead
                  trailing={
                    <span className="text-[10px] text-muted-foreground">
                      All 19 retained · locked roster
                    </span>
                  }
                >
                  Retained roster
                </Subhead>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {team.retained_players.map((p) => (
                    <PlayerTile key={p.name} player={p} compact />
                  ))}
                </div>
              </div>
              <div>
                <Subhead
                  trailing={
                    <span className="text-[10px] text-royal-pink">
                      {squadValidation.vacanciesRemaining} unfilled places
                    </span>
                  }
                >
                  Vacant squad places
                </Subhead>
                <VacancyBays compact selectedPlayers={activeHypotheticalAcquisitions} />
                <p className="mt-4 text-xs text-muted-foreground">
                  To fill all six spaces, at least three additions must be Indian: only three
                  additional overseas players fit the 8-player squad cap.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}

const candidateFilters = [
  "All roles",
  "Indian batter",
  "Indian fast",
  "Overseas powerplay",
  "Overseas death",
  "Spin all-rounder",
  "Development prospect",
];

const TARGETS_TABS = [
  "RR Top 10 Batters",
  "RR Top 10 Bowlers",
  "Middle-Order Matrix",
  "Impact Player Strategy",
  "Starting XI Scenarios",
  "P1 Benchmark Exclusions",
  "89 Released Register",
] as const;
type TargetsTab = (typeof TARGETS_TABS)[number];

function RecruitmentCard({ candidate }: { candidate: RecruitmentCandidate }) {
  const pe = candidate.pressureEvidence;
  return (
    <article
      className={cn(
        "data-card flex min-h-full flex-col border-t-2 p-4",
        candidate.rank === 1 ? "border-t-royal-gold" : "border-t-border",
        candidate.medicalRestriction === "MEDICAL_REVIEW" && "opacity-90",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="display-face min-w-10 text-4xl leading-none text-royal-gold">
            {String(candidate.rank).padStart(2, "0")}
          </span>
          <div>
            <h3 className="display-face text-2xl leading-none text-foreground">{candidate.name}</h3>
            <p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">
              {candidate.primaryRole.replaceAll("_", " ")}
              {candidate.secondaryRole && ` · ${candidate.secondaryRole.replaceAll("_", " ")}`}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="border border-border px-2 py-1 text-[8px] uppercase text-muted-foreground">
            {candidate.nationality === "Overseas" ? `Overseas · ${candidate.country}` : "India"}
          </span>
          {candidate.isProvisional && (
            <span className="border border-royal-gold/50 bg-royal-gold/10 px-2 py-0.5 text-[7px] uppercase tracking-wider text-royal-gold">
              Provisional sample
            </span>
          )}
        </div>
      </div>

      {/* Market & medical badges */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="border border-border px-2 py-0.5 text-[8px] text-muted-foreground">
          {candidate.marketStatusLabel}
        </span>
        {candidate.medicalRestriction !== "NONE" && (
          <span className="flex items-center gap-1 border border-destructive/50 bg-destructive/10 px-2 py-0.5 text-[8px] text-destructive">
            <HeartPulse size={10} /> Medical review required
          </span>
        )}
      </div>

      {/* WHY RR? — prominent gold callout */}
      <div className="mt-4 border-l-2 border-royal-gold bg-royal-gold/5 p-3">
        <span className="text-[9px] font-bold uppercase tracking-[.16em] text-royal-gold">
          Why RR?
        </span>
        <p className="mt-1 text-[11px] leading-5 text-foreground">{candidate.whyRR}</p>
      </div>

      {/* PRESSURE EVIDENCE */}
      <div className="mt-3 border border-border p-3">
        <span className="text-[9px] uppercase tracking-wider text-royal-gold">
          Pressure evidence
        </span>
        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{pe.exposureNote}</p>
        {pe.status === "ELIGIBLE_P1_ARCHIVE" && pe.p1Rank != null && (
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div>
              <span className="text-[8px] uppercase text-muted-foreground">P1 rank</span>
              <b className="mt-0.5 block text-sm text-foreground">{pe.p1Rank}</b>
            </div>
            {pe.postMeanPer100 != null && (
              <div>
                <span className="text-[8px] uppercase text-muted-foreground">Score/100</span>
                <b className="mt-0.5 block text-sm text-foreground">
                  {format(pe.postMeanPer100, 2)}
                </b>
              </div>
            )}
            {pe.pTop10 != null && (
              <div>
                <span className="text-[8px] uppercase text-muted-foreground">P(top-10)</span>
                <b className="mt-0.5 block text-sm text-foreground">{percent(pe.pTop10)}</b>
              </div>
            )}
            {pe.gatedBalls != null && (
              <div>
                <span className="text-[8px] uppercase text-muted-foreground">Gated balls</span>
                <b className="mt-0.5 block text-sm text-foreground">{pe.gatedBalls}</b>
              </div>
            )}
            {pe.iplShareOfGated != null && (
              <div>
                <span className="text-[8px] uppercase text-muted-foreground">IPL share</span>
                <b className="mt-0.5 block text-sm text-foreground">
                  {percent(pe.iplShareOfGated)}
                </b>
              </div>
            )}
          </div>
        )}
        {pe.scoutingMetrics && Object.keys(pe.scoutingMetrics).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(pe.scoutingMetrics).map(([label, value]) => (
              <span
                key={label}
                className="border border-border px-2 py-1 text-[9px] text-muted-foreground"
              >
                {label
                  .replaceAll(/([A-Z])/g, " $1")
                  .replaceAll("_", " ")
                  .trim()}
                : <b className="text-foreground">{String(value)}</b>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ROLE FIT */}
      <div className="mt-3">
        <span className="text-[9px] uppercase tracking-wider text-royal-gold">Role fit</span>
        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{candidate.roleFit}</p>
      </div>

      {/* UPGRADE OVER CURRENT SQUAD */}
      <div className="mt-3">
        <span className="text-[9px] uppercase tracking-wider text-royal-gold">
          Upgrade over current squad
        </span>
        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
          {candidate.upgradeOverSquad}
        </p>
      </div>

      {/* WATCH-OUT — prominent red callout, NEVER hidden */}
      <div className="mt-3 border-l-2 border-destructive bg-destructive/5 p-3">
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-destructive">
          <AlertTriangle size={12} /> Watch-out
        </span>
        <p className="mt-1 text-[11px] leading-5 text-foreground">{candidate.watchOut}</p>
      </div>

      {/* Medical note if present */}
      {candidate.medicalNote && (
        <div className="mt-3 flex items-start gap-2 border border-destructive/40 bg-destructive/5 p-2.5 text-[10px] text-destructive">
          <HeartPulse size={14} className="mt-0.5 shrink-0" />
          {candidate.medicalNote}
        </div>
      )}

      {/* Tactical tags */}
      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-1.5">
          {candidate.tacticalRolesSupported.map((tag) => (
            <span
              key={tag}
              className="border border-border px-2 py-0.5 text-[8px] uppercase tracking-wider text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
function getRoleFilter(player: WatchlistPlayer) {
  if (["Nehal Wadhera", "M Shahrukh Khan"].includes(player.name)) return "Indian batter";
  if (["Mangesh Yadav", "Onkar Tarmale", "Akash Madhwal"].includes(player.name))
    return "Indian fast";
  if (player.name === "Trent Boult") return "Overseas powerplay";
  if (["Matheesha Pathirana", "Mustafizur Rahman"].includes(player.name)) return "Overseas death";
  if (player.name === "Wanindu Hasaranga") return "Spin all-rounder";
  return "Development prospect";
}
function getPriority(player: WatchlistPlayer) {
  if (player.name === "Nehal Wadhera") return "Primary";
  if (["Jacob Bethell", "Mitchell Starc"].includes(player.name)) return "Avoid";
  if (["Mangesh Yadav", "Onkar Tarmale", "Vihaan Malhotra", "Akash Madhwal"].includes(player.name))
    return "Developmental";
  return "Alternative";
}
function getCountry(player: WatchlistPlayer) {
  const countries: Record<string, string> = {
    "Nehal Wadhera": "India",
    "Mangesh Yadav": "India",
    "Onkar Tarmale": "India",
    "Vihaan Malhotra": "India",
    "Akash Madhwal": "India",
    "Trent Boult": "New Zealand",
    "Mitchell Starc": "Australia",
    "Jacob Bethell": "England",
    "Wanindu Hasaranga": "Sri Lanka",
    "Matheesha Pathirana": "Sri Lanka",
    "Mustafizur Rahman": "Bangladesh",
    "Shimron Hetmyer": "West Indies",
    "M Shahrukh Khan": "India",
  };
  return countries[player.name] ?? "Not available in supplied data";
}
function getRisk(player: WatchlistPlayer) {
  if (player.name === "Jacob Bethell") return "Unavailable";
  if (player.name === "Mitchell Starc") return "Unavailable";
  if (["Matheesha Pathirana", "Wanindu Hasaranga"].includes(player.name)) return "High";
  const copy = [...player.risks, player.case_for].join(" ").toLowerCase();
  if (
    /poor|high risk|hard gate|limited|unproven|not p1|not a proven|workload|pressure sample|overlap/.test(
      copy,
    )
  )
    return "High";
  if (/unverified|uncertain|role-specific|price|sample|medical|registration/.test(copy))
    return "Medium";
  return "Low";
}
function targetReportDate(player: WatchlistPlayer) {
  if (player.name === "Jacob Bethell") return "18 Nov 2026 · ICC / RCB reporting";
  if (player.name === "Mitchell Starc") return "17 Nov 2026 · Reuters workload report";
  if (player.name === "Wanindu Hasaranga")
    return "Feb 2026 injury report; Sep 2026 squad return; newer clearance not supplied";
  if (player.name === "Vihaan Malhotra") return "18 Nov 2026 · current profile / form update";
  return "18 Nov 2026 snapshot; newer status not supplied";
}
function WatchCard({
  player,
  onCompare,
  compared,
}: {
  player: WatchlistPlayer;
  onCompare: () => void;
  compared: boolean;
}) {
  const disabled = player.name === "Jacob Bethell" || player.name === "Mitchell Starc";
  const evidence = player.project_evidence as Record<string, string | number | undefined>;
  return (
    <article
      className={cn(
        "data-card flex min-h-full flex-col border-t-2 p-4",
        player.name === "Nehal Wadhera" ? "border-t-royal-gold" : "border-t-border",
        disabled && "opacity-75",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-royal-gold">
            {player.category} · {getPriority(player)}
          </span>
          <h3 className="display-face mt-1 text-2xl leading-none text-foreground">{player.name}</h3>
        </div>
        <span className="border border-border px-2 py-1 text-[8px] uppercase text-muted-foreground">
          {player.overseas ? "Overseas" : "India"}
        </span>
      </div>
      <div className="mt-3">
        <TargetStatus player={player} />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          <span className="text-foreground">Country:</span> {getCountry(player)} ·{" "}
          <span className="text-foreground">Batting hand:</span>{" "}
          {player.batting_hand ?? "Not available in supplied data"}
        </p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          <span className="text-foreground">Role / style:</span> {player.role}
        </p>
        <p className="mt-2 text-xs leading-5 text-foreground">{player.role_fit}</p>
        <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
          Status report: {targetReportDate(player)}
        </p>
      </div>
      <div className="my-4 border-l border-royal-gold/60 pl-3">
        <span className="text-[9px] uppercase tracking-wider text-royal-gold">
          Evidence snapshot
        </span>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{player.case_for}</p>
      </div>
      {Object.keys(evidence).length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {Object.entries(evidence).map(([label, value]) => (
            <span
              key={label}
              className="border border-border px-2 py-1 text-[9px] text-muted-foreground"
            >
              {label.replaceAll("_", " ")}: <b className="text-foreground">{String(value)}</b>
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-royal-pink">
          Released ≠ registered
        </p>
        <details className="mb-3 text-[10px] text-muted-foreground">
          <summary className="cursor-pointer">Risk & fallback</summary>
          <ul className="list-disc space-y-1 pl-4 pt-2">
            {player.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
          <p className="mt-2 font-semibold text-foreground">
            Fallback:{" "}
            {player.name === "Nehal Wadhera"
              ? "Shubham Dubey / another verified Indian middle-order option"
              : player.name === "Matheesha Pathirana"
                ? "Mustafizur only if medically cleared and registered; otherwise a registered pace alternative"
                : player.name === "Trent Boult"
                  ? "Keep a separate death-specific plan"
                  : player.name === "Wanindu Hasaranga"
                    ? "Use existing Indian spin depth if workload/role review fails"
                    : "Choose a registered alternative that solves the same role."}
          </p>
        </details>
        <div className="flex items-center justify-between gap-2">
          <SourceLink href={player.sources?.[0]}>Status source</SourceLink>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled || compared}
            onClick={onCompare}
            className="rounded-sm text-[9px] uppercase"
          >
            {disabled ? "Not selectable" : compared ? "Added" : "Compare +"}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function TargetsPage() {
  const [activeTab, setActiveTab] = useState<TargetsTab>("RR Top 10 Batters");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All roles");
  const [status, setStatus] = useState("All statuses");
  const [priority, setPriority] = useState("All priorities");
  const [risk, setRisk] = useState("All risks");
  const [compared, setCompared] = useState<string[]>([]);
  const [marketSearch, setMarketSearch] = useState("");
  const [franchise, setFranchise] = useState("All franchises");
  const [marketStatus, setMarketStatus] = useState("All statuses");
  const [showRegister, setShowRegister] = useState(false);
  const [scenarioBase, setScenarioBase] = useState("");
  const [ceiling, setCeiling] = useState("");
  const [rivals, setRivals] = useState("0");
  const [scenarioTarget, setScenarioTarget] = useState("Nehal Wadhera");
  const [toast, setToast] = useState("");
  const filteredTargets = data.auction_watchlist.filter((p) => {
    const text = `${p.name} ${p.role} ${p.category} ${p.team_released_from}`.toLowerCase();
    const statusMatch =
      status === "All statuses" ||
      (status === "Unavailable"
        ? p.name === "Jacob Bethell"
        : status === "Medical review"
          ? ["Matheesha Pathirana", "Wanindu Hasaranga"].includes(p.name)
          : status === "Availability unconfirmed"
            ? p.name === "Mitchell Starc"
            : p.name !== "Jacob Bethell" && p.name !== "Mitchell Starc");
    return (
      text.includes(search.toLowerCase()) &&
      (role === "All roles" || getRoleFilter(p) === role) &&
      statusMatch &&
      (priority === "All priorities" || getPriority(p) === priority) &&
      (risk === "All risks" || getRisk(p) === risk)
    );
  });
  const marketPlayers = data.released_player_reference.players.filter(
    (p) =>
      `${p.player_name} ${p.released_from_franchise}`
        .toLowerCase()
        .includes(marketSearch.toLowerCase()) &&
      (franchise === "All franchises" || p.released_from_franchise === franchise) &&
      (marketStatus === "All statuses" || marketStatusFor(p) === marketStatus),
  );
  function addCompare(name: string) {
    if (compared.length >= 4) {
      setToast("Comparison holds up to four targets.");
      return;
    }
    setCompared([...compared, name]);
    setToast("");
  }
  const purseLeft =
    scenarioBase !== "" && Number.isFinite(Number(scenarioBase))
      ? team.purse_remaining_crore - Number(scenarioBase)
      : null;
  const fallback =
    scenarioTarget === "Nehal Wadhera"
      ? "Shubham Dubey / another verified Indian No.4–6 option"
      : scenarioTarget === "Matheesha Pathirana"
        ? "Mustafizur only if cleared and registered; otherwise registered pace alternative"
        : scenarioTarget === "Trent Boult"
          ? "Keep a separate death-specific plan"
          : scenarioTarget === "Wanindu Hasaranga"
            ? "Indian spin group: Bishnoi / Punja / Jadeja / Siddharth"
            : "Role-fit registered alternative; do not chase beyond the set ceiling";
  return (
    <PageFrame>
      <main>
        <LeadIn
          path="/targets"
          kicker="RR recruitment room · released is not registration"
          title="Auction recruitment board"
          description="RR-specific pressure-informed recruitment recommendations, tactical scenarios and auction strategy. Not a copy of the global P1 benchmark."
        />
        <section className="px-5 pb-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Tab navigation */}
            <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
              {TARGETS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "border-b-2 px-3 py-2.5 text-[10px] uppercase tracking-wider transition-colors",
                    activeTab === tab
                      ? "border-royal-gold text-royal-gold"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab: RR Top 10 Batters */}
            {activeTab === "RR Top 10 Batters" && (
              <div>
                <div className="mb-5 border-l-2 border-royal-gold bg-royal-gold/5 p-4">
                  <p className="text-xs leading-5 text-muted-foreground">
                    <b className="text-foreground">
                      RR-specific pressure-informed batter recruitment recommendations.
                    </b>{" "}
                    These are NOT copies of the global P1 benchmark. Each candidate is selected
                    based on RR&apos;s actual squad vacancies, tactical needs, and pressure
                    evidence. No candidate has verified auction registration.
                  </p>
                </div>
                <p className="mb-4 text-[10px] uppercase tracking-wider text-muted-foreground">
                  10 ranked batter candidates
                </p>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {RR_BATTER_RECOMMENDATIONS.map((c) => (
                    <RecruitmentCard key={c.id} candidate={c} />
                  ))}
                </div>
              </div>
            )}

            {/* Tab: RR Top 10 Bowlers */}
            {activeTab === "RR Top 10 Bowlers" && (
              <div>
                <div className="mb-5 border-l-2 border-royal-gold bg-royal-gold/5 p-4">
                  <p className="text-xs leading-5 text-muted-foreground">
                    <b className="text-foreground">
                      RR-specific pressure-informed bowler recruitment recommendations.
                    </b>{" "}
                    Distinct from the global P1 bowler benchmark. Death-overs and Indian pace depth
                    are priority roles dictated by RR&apos;s 2024/2026 playoff diagnostics.
                  </p>
                </div>
                <p className="mb-4 text-[10px] uppercase tracking-wider text-muted-foreground">
                  10 ranked bowler candidates
                </p>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {RR_BOWLER_RECOMMENDATIONS.map((c) => (
                    <RecruitmentCard key={c.id} candidate={c} />
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Middle-Order Matrix */}
            {activeTab === "Middle-Order Matrix" && (
              <div>
                <div className="mb-5 border-l-2 border-royal-gold bg-royal-gold/5 p-4">
                  <p className="text-xs leading-5 text-muted-foreground">
                    <b className="text-foreground">Three tactical middle-order variations</b> for
                    slots 4–8, each tailored to a specific match situation. These use hypothetical
                    acquisitions alongside retained players.
                  </p>
                </div>
                <div className="grid gap-5 lg:grid-cols-3">
                  {MIDDLE_ORDER_VARIATIONS.map((variation) => (
                    <article
                      key={variation.id}
                      className="data-card flex min-h-full flex-col border-t-2 border-t-royal-gold p-5"
                    >
                      <span className="text-[9px] uppercase tracking-[.16em] text-royal-gold">
                        {variation.id.toUpperCase()}
                      </span>
                      <h3 className="display-face mt-2 text-xl">{variation.title}</h3>
                      <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                        {variation.context}
                      </p>
                      <div className="mt-4 space-y-2">
                        {variation.battingOrderSlots4to8.map((slot) => (
                          <div
                            key={slot.slotNumber}
                            className="flex items-start gap-3 border-b border-border/60 pb-2"
                          >
                            <span className="display-face min-w-6 text-lg text-royal-gold">
                              {slot.slotNumber}
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-foreground">{slot.player}</p>
                              <p className="text-[9px] text-royal-pink">{slot.role}</p>
                              <p className="mt-0.5 text-[9px] text-muted-foreground">
                                {slot.matchupRationale}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto pt-4">
                        <div className="border-l-2 border-royal-gold pl-3">
                          <span className="text-[8px] uppercase tracking-wider text-royal-gold">
                            Key advantage
                          </span>
                          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                            {variation.keyTacticalAdvantage}
                          </p>
                        </div>
                        <div className="mt-2 border-l-2 border-destructive pl-3">
                          <span className="text-[8px] uppercase tracking-wider text-destructive">
                            Trade-off
                          </span>
                          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                            {variation.tradeOff}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Impact Player Strategy */}
            {activeTab === "Impact Player Strategy" && (
              <div>
                <div className="mb-5 border-l-2 border-royal-gold bg-royal-gold/5 p-4">
                  <p className="text-xs leading-5 text-muted-foreground">
                    <b className="text-foreground">Six Impact Player substitution scenarios</b>{" "}
                    covering batting-first, chasing, defending, powerplay, death and spin-friendly
                    surfaces.
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {IMPACT_PLAYER_SCENARIOS.map((scenario) => (
                    <article
                      key={scenario.id}
                      className="data-card flex min-h-full flex-col border-t-2 border-t-border p-5"
                    >
                      <span className="text-[9px] uppercase tracking-[.16em] text-royal-gold">
                        Scenario {scenario.id.replace("impact-", "").toUpperCase()}
                      </span>
                      <h3 className="display-face mt-2 text-xl">{scenario.scenarioName}</h3>
                      <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                        {scenario.matchContext}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-3">
                        <div>
                          <span className="text-[8px] uppercase text-muted-foreground">
                            Impact player
                          </span>
                          <b className="mt-0.5 block text-xs text-foreground">
                            {scenario.recommendedPlayer}
                          </b>
                          <span className="text-[8px] text-royal-pink">{scenario.playerRole}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase text-muted-foreground">
                            Substituted out
                          </span>
                          <b className="mt-0.5 block text-xs text-foreground">
                            {scenario.substitutedStartingPlayer}
                          </b>
                        </div>
                      </div>
                      <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
                        <b className="text-foreground">Why:</b> {scenario.whyThisSubstitution}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="border border-border px-2 py-0.5 text-[8px] text-muted-foreground">
                          Overseas in XI: {scenario.overseasCountInXI}/4
                        </span>
                        <span className="border border-border px-2 py-0.5 text-[8px] text-muted-foreground">
                          {scenario.squadEligibility}
                        </span>
                      </div>
                      {scenario.medicalRestrictions !== "None" && (
                        <div className="mt-2 flex items-start gap-2 border border-destructive/40 bg-destructive/5 p-2 text-[9px] text-destructive">
                          <HeartPulse size={12} className="mt-0.5 shrink-0" />
                          {scenario.medicalRestrictions}
                        </div>
                      )}
                      <div className="mt-auto border-l-2 border-destructive pl-3 pt-3">
                        <span className="flex items-center gap-1 text-[8px] uppercase tracking-wider text-destructive">
                          <AlertTriangle size={10} /> Downside
                        </span>
                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                          {scenario.mainDownside}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Starting XI Scenarios */}
            {activeTab === "Starting XI Scenarios" && (
              <div>
                <div className="mb-5 border-l-2 border-royal-gold bg-royal-gold/5 p-4">
                  <p className="text-xs leading-5 text-muted-foreground">
                    <b className="text-foreground">Five tactical Starting XI scenarios</b> using
                    retained players and hypothetical acquisitions. Hypothetical additions are
                    clearly marked.
                  </p>
                </div>
                <div className="space-y-6">
                  {PROPOSED_STARTING_XI_SCENARIOS.map((scenario) => (
                    <article
                      key={scenario.id}
                      className="data-card border-t-2 border-t-royal-gold p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="text-[9px] uppercase tracking-[.16em] text-royal-gold">
                            Scenario {scenario.id.replace("tactical-scen-", "")}
                          </span>
                          <h3 className="display-face mt-1 text-2xl">{scenario.title}</h3>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {scenario.purpose}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="border border-border px-2 py-1 text-[8px] uppercase text-muted-foreground">
                            Overseas: {scenario.overseasCount}/4
                          </span>
                          <span className="border border-border px-2 py-1 text-[8px] uppercase text-muted-foreground">
                            Pace: {scenario.paceOptionsCount} · Spin: {scenario.spinOptionsCount}
                          </span>
                        </div>
                      </div>
                      {/* Starting XI grid */}
                      <div className="mt-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {scenario.startingXI.map((player, idx) => {
                          const isHypothetical =
                            scenario.actualVsHypothetical.hypotheticalAdditions.includes(player);
                          return (
                            <div
                              key={player}
                              className={cn(
                                "flex items-center gap-2 border px-3 py-2 text-xs",
                                isHypothetical
                                  ? "border-royal-gold/50 bg-royal-gold/5"
                                  : "border-border",
                              )}
                            >
                              <span className="font-mono text-[9px] text-muted-foreground">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span className="font-semibold text-foreground">{player}</span>
                              {isHypothetical && (
                                <span className="ml-auto text-[7px] uppercase text-royal-gold">
                                  Hypothetical
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* Death specialists */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-[8px] uppercase text-muted-foreground">
                          Death specialists:
                        </span>
                        {scenario.deathOversSpecialists.map((name) => (
                          <span
                            key={name}
                            className="border border-royal-pink/40 px-2 py-0.5 text-[8px] text-royal-pink"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                      {/* Bench displacement & actual vs hypothetical */}
                      <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                            Bench displaced
                          </span>
                          <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                            {scenario.benchDisplacement.displacedRetained.join(", ")}
                          </p>
                          <p className="mt-1 text-[9px] text-royal-gold">
                            {scenario.benchDisplacement.startingRetainedCount} retained +{" "}
                            {scenario.benchDisplacement.startingAdditionsCount} hypothetical
                            addition(s)
                          </p>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                            Impact player alternatives
                          </span>
                          <ul className="mt-1 space-y-1">
                            {scenario.impactPlayerAlternatives.map((alt) => (
                              <li key={alt} className="text-[10px] leading-4 text-muted-foreground">
                                {alt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: P1 Benchmark Exclusions */}
            {activeTab === "P1 Benchmark Exclusions" && (
              <div>
                <div className="mb-5 border-l-2 border-royal-pink bg-destructive/5 p-4">
                  <p className="text-xs leading-5 text-muted-foreground">
                    <b className="text-foreground">
                      Why global P1 leaders cannot occupy RR auction recruitment spots.
                    </b>{" "}
                    These {BENCHMARK_EXCLUSIONS.length} players appear in the historical P1 pressure
                    benchmark but are retained by other franchises, retired, legally unavailable, or
                    explicitly excluded.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                    <thead className="bg-secondary text-[9px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        {[
                          "Player",
                          "P1 Rank",
                          "Discipline",
                          "Current Status",
                          "Exclusion Reason",
                          "Pressure Score/100",
                        ].map((col) => (
                          <th key={col} className="px-3 py-3 font-semibold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {BENCHMARK_EXCLUSIONS.map((exc) => (
                        <tr key={exc.name} className="border-t border-border/60 hover:bg-accent/40">
                          <td className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">
                            {exc.name}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {exc.globalP1Rank === 999 ? "N/A" : exc.globalP1Rank}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{exc.discipline}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {exc.currentFranchiseOrStatus}
                          </td>
                          <td className="max-w-sm px-3 py-2 text-muted-foreground">
                            {exc.exclusionReason}
                          </td>
                          <td className="px-3 py-2 text-foreground">
                            {exc.pressureScorePer100 === 0
                              ? "N/A"
                              : format(exc.pressureScorePer100, 2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: 89 Released Register */}
            {activeTab === "89 Released Register" && (
              <div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[.16em] text-royal-gold">
                      Reference pool · not a recommendation list
                    </p>
                    <h2 className="display-face mt-1 text-3xl">89 released-player register</h2>
                    <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
                      Transcribed from the user-supplied 2027 released-player reference. Release
                      does not confirm registration, fitness, willingness to play or RR fit.
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Metric value="89" label="Reference entries" accent />
                  <Metric
                    value={Object.keys(data.released_player_reference.franchise_counts).length}
                    label="Franchises"
                  />
                  <Metric value="TBD" label="New entrants" />
                  <Metric value="18 Nov 2026" label="Snapshot date" />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {Object.entries(data.released_player_reference.franchise_counts).map(
                    ([name, count]) => (
                      <span
                        key={name}
                        className="border border-border px-2 py-1 text-[9px] text-muted-foreground"
                      >
                        {name}: <b className="text-foreground">{count}</b>
                      </span>
                    ),
                  )}
                </div>
                <div className="mt-5 border border-border">
                  <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-[1fr_220px_220px]">
                    <div className="relative">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        aria-label="Search released player reference"
                        placeholder="Search all 89 names"
                        value={marketSearch}
                        onChange={(e) => setMarketSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <FilterControl
                      ariaLabel="Filter released player franchise"
                      value={franchise}
                      setValue={setFranchise}
                      options={[
                        "All franchises",
                        ...Object.keys(data.released_player_reference.franchise_counts),
                      ]}
                    />
                    <FilterControl
                      ariaLabel="Filter released player status"
                      value={marketStatus}
                      setValue={setMarketStatus}
                      options={[
                        "All statuses",
                        "Released · registration unverified",
                        "Availability unconfirmed",
                        "Unavailable for IPL 2027",
                        "Retired / mentor",
                      ]}
                    />
                  </div>
                  <p className="px-3 py-2 text-[9px] uppercase tracking-wider text-muted-foreground">
                    Showing {marketPlayers.length} · Salary field unit not specified · no player
                    selection from this reference-only table
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] border-collapse text-left text-xs">
                      <thead className="bg-secondary text-[9px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                          {[
                            "Player",
                            "Released from",
                            "Source mark",
                            "source salary field (unit not specified)",
                            "Availability status",
                          ].map((x) => (
                            <th key={x} className="px-3 py-3 font-semibold">
                              {x}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {marketPlayers.map((p) => (
                          <ReleasedRow key={p.player_name} player={p} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Auction Slot Strategy Ladder (always visible below tabs) */}
            <section className="mt-14 border-t border-border pt-8">
              <Subhead>
                Auction capacity &amp; slot strategy{" "}
                <span className="ml-2 font-sans text-xs text-muted-foreground">
                  6 priority levels
                </span>
              </Subhead>
              <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {AUCTION_SLOT_STRATEGY.map((slot) => (
                  <div key={slot.priority} className="border border-border p-4">
                    <div className="flex items-center gap-2">
                      <span className="display-face text-2xl text-royal-gold">
                        P{slot.priority}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {slot.targetArea}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      <b className="text-foreground">Ideal:</b> {slot.idealCandidate}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      <b className="text-foreground">Fallbacks:</b> {slot.fallbacks.join(", ")}
                    </p>
                    <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                      {slot.rationality}
                    </p>
                    <p className="mt-1 text-[9px] text-royal-pink">
                      {slot.overseasOpportunityCost}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Existing legacy shortlist watchcards (preserved) */}
            <section className="mt-14 border-t border-border pt-8">
              <Subhead>
                Legacy watchlist profiles{" "}
                <span className="ml-2 font-sans text-xs text-muted-foreground">
                  {filteredTargets.length} profiles · {compared.length} / 4 in comparison
                </span>
              </Subhead>
              <p className="mb-4 text-[10px] text-muted-foreground">
                Original research shortlist from the supplied watchlist data. For RR-specific ranked
                recruitment recommendations, use the tabs above.
              </p>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <div className="relative min-w-48 flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    aria-label="Search target shortlist"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search player, role or team"
                    className="pl-9"
                  />
                </div>
                <FilterControl
                  ariaLabel="Filter by role"
                  value={role}
                  setValue={setRole}
                  options={candidateFilters}
                />
                <FilterControl
                  ariaLabel="Filter by status"
                  value={status}
                  setValue={setStatus}
                  options={[
                    "All statuses",
                    "Released / registration unverified",
                    "Medical review",
                    "Availability unconfirmed",
                    "Unavailable",
                  ]}
                />
                <FilterControl
                  ariaLabel="Filter by priority"
                  value={priority}
                  setValue={setPriority}
                  options={["All priorities", "Primary", "Alternative", "Developmental", "Avoid"]}
                />
                <FilterControl
                  ariaLabel="Filter by risk"
                  value={risk}
                  setValue={setRisk}
                  options={["All risks", "Low", "Medium", "High", "Unavailable"]}
                />
              </div>
              {toast && (
                <p role="status" className="mb-3 text-xs text-royal-gold">
                  {toast}
                </p>
              )}
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredTargets.map((p) => (
                  <WatchCard
                    key={p.name}
                    player={p}
                    compared={compared.includes(p.name)}
                    onCompare={() => addCompare(p.name)}
                  />
                ))}
              </div>
            </section>

            {/* New auction entrants */}
            <section className="mt-10 border-y border-royal-gold/40 py-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[.16em] text-royal-pink">
                    Awaiting official publication
                  </p>
                  <h2 className="display-face mt-1 text-3xl">New auction entrants</h2>
                  <p className="mt-2 text-xs text-muted-foreground">
                    No names added until the official registration list is supplied. Reported
                    schedule: registration reportedly closes 23 Nov; additions through 27 Nov; final
                    list expected 3 Dec.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-sm uppercase"
                  onClick={() =>
                    setToast(
                      "No official registration feed is connected. This local control does not refresh or verify the list.",
                    )
                  }
                >
                  Refresh auction list <RotateCcw size={14} />
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>
                  Auction date: {data.auction.auction_date} · {data.auction.auction_time}
                </span>
                <span>Venue: {data.auction.venue}</span>
                <span>Registration timeline: reported</span>
              </div>
              <div className="mt-5 border border-dashed border-border px-4 py-5 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                Waiting for official auction registration list · No entrants added
              </div>
            </section>

            {/* Compare tray */}
            <section className="mt-14 border-t border-border pt-8">
              <Subhead>
                Compare tray{" "}
                <span className="ml-2 font-sans text-xs text-muted-foreground">
                  {compared.length} / 4
                </span>
              </Subhead>
              {compared.length === 0 ? (
                <p className="border border-dashed border-border p-5 text-xs text-muted-foreground">
                  Add a shortlist candidate above to compare phase fit, evidence, status and
                  fallback side-by-side.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-[10px]">
                    <thead>
                      <tr>
                        <th className="w-40 p-2 text-muted-foreground">Comparison</th>
                        {compared.map((name) => (
                          <th key={name} className="border-b border-border p-2">
                            <span className="flex items-center justify-between gap-2 text-sm text-foreground">
                              {name}
                              <Button
                                aria-label={`Remove ${name} from comparison`}
                                size="icon"
                                variant="ghost"
                                onClick={() => setCompared(compared.filter((x) => x !== name))}
                              >
                                <X size={14} />
                              </Button>
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        "Indian / overseas",
                        "Batting hand / bowling type",
                        "Intended role",
                        "Phase expertise",
                        "P1 rank / top-10 probability",
                        "IPL-only role metrics",
                        "Availability / medical status",
                        "Squad overlap",
                        "Registration status",
                        "Fallback",
                      ].map((field) => (
                        <tr key={field} className="border-b border-border/60">
                          <th className="p-2 text-left font-medium text-muted-foreground">
                            {field}
                          </th>
                          {compared.map((name) => {
                            const p = targetByName.get(name);
                            return (
                              <td key={name} className="max-w-64 p-2 leading-5 text-foreground">
                                {p ? comparisonValue(p, field) : "Not available in supplied data"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Auction value scenario */}
            <section className="mt-14 grid gap-8 border-t border-border pt-9 lg:grid-cols-[1fr_1fr]">
              <div>
                <p className="text-[9px] uppercase tracking-[.16em] text-royal-pink">
                  Manual only · analyst-entered assumption
                </p>
                <h2 className="display-face mt-1 text-3xl">Auction value scenario</h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  No price prediction or validated auction valuation model exists. Enter your own
                  base price and maximum bid ceiling; rival count is a scenario input, not a price
                  forecast.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Target
                    <select
                      aria-label="Scenario target"
                      value={scenarioTarget}
                      onChange={(e) => setScenarioTarget(e.target.value)}
                      className={makeSelectClass("mt-2")}
                    >
                      {data.auction_watchlist
                        .filter((p) => !["Jacob Bethell", "Mitchell Starc"].includes(p.name))
                        .map((p) => (
                          <option key={p.name}>{p.name}</option>
                        ))}
                    </select>
                  </label>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Your entered base price (₹ Cr)
                    <Input
                      type="number"
                      min="0"
                      step="0.05"
                      value={scenarioBase}
                      onChange={(e) => setScenarioBase(e.target.value)}
                      placeholder="Enter manually"
                      className="mt-2"
                    />
                  </label>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Your maximum bid ceiling (₹ Cr)
                    <Input
                      type="number"
                      min="0"
                      step="0.05"
                      value={ceiling}
                      onChange={(e) => setCeiling(e.target.value)}
                      placeholder="Set walk-away ceiling"
                      className="mt-2"
                    />
                  </label>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Rival bidders (0–3)
                    <select
                      aria-label="Rival bidders"
                      value={rivals}
                      onChange={(e) => setRivals(e.target.value)}
                      className={makeSelectClass("mt-2")}
                    >
                      {[0, 1, 2, 3].map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-5 border-l-2 border-royal-gold bg-card/70 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-royal-gold">
                    Your scenario · not a model prediction
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[9px] text-muted-foreground">
                        Hypothetical entered amount
                      </span>
                      <b className="mt-1 block text-lg text-foreground">
                        {scenarioBase ? `₹${format(Number(scenarioBase))} Cr` : "Not entered"}
                      </b>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground">
                        Budget left after hypothetical bid
                      </span>
                      <b className="mt-1 block text-lg text-foreground">
                        {purseLeft === null ? "Not entered" : `₹${format(purseLeft)} Cr`}
                      </b>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground">
                        Rival bidder scenario
                      </span>
                      <b className="mt-1 block text-lg text-foreground">{rivals}</b>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground">Walk-away threshold</span>
                      <b className="mt-1 block text-lg text-royal-pink">
                        {ceiling ? `₹${format(Number(ceiling))} Cr` : "Set ceiling"}
                      </b>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
                    Fallback if the ceiling is crossed: {fallback}.
                  </p>
                  {scenarioBase !== "" &&
                    ceiling !== "" &&
                    Number(scenarioBase) > Number(ceiling) && (
                      <p
                        role="status"
                        className="mt-3 flex items-center gap-2 text-xs font-bold text-destructive"
                      >
                        <AlertTriangle size={14} />
                        Your entered base is above your ceiling. Walk away and use the fallback:{" "}
                        {fallback}.
                      </p>
                    )}
                </div>
                <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
                  Revise after the official registered-player list and competitor needs are known.
                  The printed release reference salary is not used here.
                </p>
              </div>
              <div className="border-l border-border pl-5">
                <p className="text-[9px] uppercase tracking-[.16em] text-royal-gold">
                  Allocation checks
                </p>
                <h3 className="display-face mt-1 text-2xl">Keep the room honest</h3>
                <ul className="mt-4 space-y-3 text-xs leading-5 text-muted-foreground">
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-royal-gold" />
                    Nehal is the No.4–5 repair preference—not a P1-qualified batter.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-royal-gold" />
                    Ferreira is retained. Compare any new finisher with Ferreira, Dubey and Shanaka.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-royal-gold" />
                    Boult is new-ball first; recent IPL 2026 returns were poor and do not solve
                    death overs.
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-royal-gold" />
                    Pathirana requires medical clearance. Hasaranga requires workload review.
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}

function FilterControl({
  ariaLabel,
  value,
  setValue,
  options,
}: {
  ariaLabel: string;
  value: string;
  setValue: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={makeSelectClass("min-w-40 flex-1 sm:flex-none")}
    >
      {options.map((x) => (
        <option key={x}>{x}</option>
      ))}
    </select>
  );
}
function marketStatusFor(player: ReleasedPlayer) {
  if (player.availability_status === "released_unavailable_2027_medical")
    return "Unavailable for IPL 2027";
  if (player.availability_status === "released_availability_unconfirmed_workload")
    return "Availability unconfirmed";
  if (player.availability_status === "retired_ipl_player_mentor") return "Retired / mentor";
  return "Released · registration unverified";
}
function ReleasedRow({ player }: { player: ReleasedPlayer }) {
  const status = marketStatusFor(player);
  return (
    <tr className="border-t border-border/60 hover:bg-accent/40">
      <td className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">
        {player.player_name}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
        {player.released_from_franchise}
      </td>
      <td className="px-3 py-2 text-muted-foreground">
        {player.overseas_marked_in_pdf ? "Overseas · *" : "India"}
      </td>
      <td className="px-3 py-2 text-foreground">{player.salary_value_as_printed}</td>
      <td className="px-3 py-2">
        <span
          className={cn(
            "text-[10px]",
            status.includes("Unavailable")
              ? "text-destructive"
              : status.includes("unconfirmed")
                ? "text-royal-gold"
                : "text-muted-foreground",
          )}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}
function comparisonValue(p: WatchlistPlayer, field: string) {
  const e = p.project_evidence as Record<string, string | number | undefined>;
  switch (field) {
    case "Indian / overseas":
      return p.overseas ? "Overseas" : "Indian";
    case "Batting hand / bowling type":
      return `${p.batting_hand ?? "Not available in supplied data"} / ${p.role}`;
    case "Intended role":
      return p.role_fit;
    case "Phase expertise":
      return p.role;
    case "P1 rank / top-10 probability":
      return e["p1_rank"]
        ? `Rank ${e["p1_rank"]} · ${percent(Number(e["p1_top10_probability"]))}`
        : "Not P1 ranked / not available in supplied data";
    case "IPL-only role metrics":
      return (
        Object.entries(e)
          .filter(([key]) => key.includes("ipl") || key.includes("death"))
          .map(([k, v]) => `${k.replaceAll("_", " ")}: ${v}`)
          .join(" · ") || "Not available in supplied data"
      );
    case "Availability / medical status":
      return p.status;
    case "Squad overlap":
      return p.name === "Nehal Wadhera"
        ? "No.4–5 repair; preferred role fit"
        : "See role-fit note and retained group overlap";
    case "Registration status":
      return "Released · auction registration unverified";
    case "Fallback":
      return p.name === "Nehal Wadhera"
        ? "Shubham Dubey / another verified Indian middle-order option"
        : p.name === "Matheesha Pathirana"
          ? "Mustafizur if medically cleared/registered; otherwise registered pace alternative"
          : "Role-fit registered alternative";
    default:
      return "Not available in supplied data";
  }
}

function IntervalBar({
  item,
  lower,
  upper,
  center,
}: {
  item: BatterRank | BowlerRank;
  lower: number;
  upper: number;
  center: number;
}) {
  const min = Math.min(lower, 0);
  const max = Math.max(upper, 0);
  const span = max - min || 1;
  const left = ((lower - min) / span) * 100;
  const width = ((upper - lower) / span) * 100;
  const dot = ((center - min) / span) * 100;
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-[8px] text-muted-foreground">
        <span>90% interval</span>
        <span>
          {format(lower, 4)} to {format(upper, 4)}
        </span>
      </div>
      <div className="interval-track">
        <span
          className="interval-range"
          style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
        />
        <span className="interval-dot" style={{ left: `${dot}%` }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[8px] text-muted-foreground">
        <span>{format(lower, 4)}</span>
        <span className="text-royal-gold">mean {format(center, 4)}</span>
        <span>{format(upper, 4)}</span>
      </div>
    </div>
  );
}

function ExposureBars({ balls, probability }: { balls: number; probability: number }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div>
        <div className="mb-1 flex justify-between text-[8px] uppercase tracking-wider text-muted-foreground">
          <span>Gated exposure</span>
          <span>{balls}</span>
        </div>
        <div className="rank-line">
          <span style={{ width: `${Math.min(100, balls / 6)}%` }} />
        </div>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-[8px] uppercase tracking-wider text-muted-foreground">
          <span>Top-10 inclusion probability</span>
          <span>{percent(probability)}</span>
        </div>
        <div className="rank-line">
          <span style={{ width: `${probability * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function BatterCard({ player }: { player: BatterRank }) {
  const position =
    player.median_batting_position === null || player.median_batting_position === undefined
      ? "Not available in supplied data"
      : format(player.median_batting_position, 1);
  return (
    <article className="data-card border-l-2 border-l-royal-pink p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="display-face min-w-10 text-4xl leading-none text-royal-gold">
          {String(player.rank).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="display-face text-2xl text-foreground">{player.player_name}</h2>
            <span className="border border-border px-2 py-1 text-[8px] uppercase tracking-wider text-muted-foreground">
              {player.tier}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-royal-pink">{player.skillset}</p>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
            {player.rr_fit_interpretation}
          </p>
        </div>
      </div>
      <IntervalBar
        item={player}
        lower={player.lo90_per100}
        upper={player.hi90_per100}
        center={player.post_mean_per100}
      />
      <ExposureBars balls={player.gated_balls} probability={player.p_top10} />
      <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-3 sm:grid-cols-4">
        <Stat label="Pressure score / 100 gated balls" value={format(player.post_mean_per100, 4)} />
        <Stat label="Top-10 inclusion probability" value={percent(player.p_top10)} />
        <Stat
          label="Gated balls · matches"
          value={`${player.gated_balls} · ${player.gated_matches}`}
        />
        <Stat label="IPL share of gated exposure" value={percent(player.ipl_share_of_gated)} />
        <Stat label="5th–95th rank range" value={`${player.rank_lo5}–${player.rank_hi95}`} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] sm:grid-cols-4">
        <Stat
          label="Deliveries · legal"
          value={`${player.deliveries} · ${player.legal_deliveries}`}
        />
        <Stat label="Matches" value={player.matches} />
        <Stat label="Observed batting position" value={position} />
        <Stat label="Batter runs" value={player.batter_runs} />
        <Stat label="Runs / legal delivery" value={format(player.runs_per_legal_delivery, 4)} />
        <Stat label="Dot percentage" value={`${format(player.dot_pct, 4)}%`} />
        <Stat
          label="Boundaries (4s · 6s)"
          value={`${player.fours ?? "Not available in supplied data"} · ${player.sixes ?? "Not available in supplied data"}`}
        />
        <Stat
          label="Dismissals · per 100 deliveries"
          value={`${player.dismissal_events} · ${format(player.dismissals_per_100_deliveries, 4)}`}
        />
      </div>
      <div className="mt-4 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
        <div>
          <span className="text-[8px] uppercase tracking-wider text-royal-gold">
            Interpretation
          </span>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
            {player.rr_fit_interpretation}
          </p>
        </div>
        <div>
          <span className="text-[8px] uppercase tracking-wider text-royal-pink">Limitation</span>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
            {player.fit_note}. Pressure model context is not an inherent “clutch gene”; interval and
            sample size matter.
          </p>
        </div>
      </div>
    </article>
  );
}
function BowlerCard({ player }: { player: BowlerRank }) {
  return (
    <article className="data-card border-l-2 border-l-royal-gold p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="display-face min-w-10 text-4xl leading-none text-royal-gold">
          {String(player.rank).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="display-face text-2xl text-foreground">{player.player_name}</h2>
            <span className="border border-border px-2 py-1 text-[8px] uppercase tracking-wider text-muted-foreground">
              {player.tier}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-royal-pink">{player.skillset}</p>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
            {player.rr_fit_interpretation}
          </p>
        </div>
      </div>
      <IntervalBar
        item={player}
        lower={player.lo90_per100}
        upper={player.hi90_per100}
        center={player.post_mean_per100}
      />
      <ExposureBars balls={player.gated_balls} probability={player.p_top10} />
      <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-3 sm:grid-cols-4">
        <Stat label="Pressure score / 100 gated balls" value={format(player.post_mean_per100, 4)} />
        <Stat label="Top-10 inclusion probability" value={percent(player.p_top10)} />
        <Stat
          label="Gated balls · matches"
          value={`${player.gated_balls} · ${player.gated_matches}`}
        />
        <Stat label="IPL share of gated exposure" value={percent(player.ipl_share_of_gated)} />
        <Stat label="5th–95th rank range" value={`${player.rank_lo5}–${player.rank_hi95}`} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] sm:grid-cols-4">
        <Stat
          label="Deliveries · legal"
          value={`${player.deliveries} · ${player.legal_deliveries}`}
        />
        <Stat label="Matches" value={player.matches} />
        <Stat label="Runs conceded" value={player.bowler_runs_conceded} />
        <Stat label="Runs / delivery" value={format(player.runs_per_delivery, 4)} />
        <Stat label="Economy / 6 legal" value={format(player.economy_per_6_legal, 4)} />
        <Stat label="Dot percentage" value={`${format(player.dot_pct, 4)}%`} />
        <Stat label="Wickets" value={player.bowler_wickets} />
        <Stat
          label="Wickets / 100 deliveries"
          value={format(player.wickets_per_100_deliveries, 4)}
        />
      </div>
      <div className="mt-4 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
        <div>
          <span className="text-[8px] uppercase tracking-wider text-royal-gold">
            Role interpretation
          </span>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
            {player.rr_fit_interpretation}
          </p>
        </div>
        <div>
          <span className="text-[8px] uppercase tracking-wider text-royal-pink">Data caveat</span>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{player.fit_note}.</p>
        </div>
      </div>
    </article>
  );
}
function Stat({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <span className="block text-[8px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <b className="mt-1 block text-xs font-semibold text-foreground">{String(value)}</b>
    </div>
  );
}

export function BattersPage() {
  return (
    <PageFrame>
      <main>
        <LeadIn
          path="/batters"
          kicker="SupeRR pressure rankings · P1 frozen order"
          title="Pressure-ranked batters"
          description="Exactly the supplied top 10, unchanged and in rank order. Higher score means better relative performance under the model context; it does not establish an inherent clutch gene."
        />
        <section className="px-5 pb-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Prominent Recruitment Warning Banner */}
            <div className="mb-5 border-l-4 border-royal-pink bg-royal-pink/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-royal-pink">
                    Historical P1 Benchmark · NOT RR Recruitment Recommendations
                  </span>
                  <p className="mt-1 text-xs leading-5 text-foreground">
                    This page displays the frozen historical P1 model benchmark. Most players listed
                    here (e.g. Tim David, Yashasvi Jaiswal, Suryakumar Yadav, Nicholas Pooran) are
                    already retained by their respective franchises and are{" "}
                    <b>legally unavailable for auction recruitment</b>.
                  </p>
                </div>
                <Link
                  to="/targets"
                  className="shrink-0 border border-royal-gold bg-royal-gold px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-royal-dark hover:bg-royal-gold/90"
                >
                  View RR Target Board →
                </Link>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap justify-between gap-2 border-l-2 border-royal-gold bg-card/60 p-4 text-xs leading-5 text-muted-foreground">
              <span>
                All ten P1 ranks are shown, regardless of market status. Ranking inclusion
                probability is not auction-selection probability.
              </span>
              <span className="shrink-0 text-royal-gold">10 batters · ranks 1–10</span>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {data.pressure_ranked_batters_top10.map((p) => (
                <BatterCard key={p.rank} player={p} />
              ))}
            </div>
            <p className="mt-5 text-[10px] text-muted-foreground">
              Observed descriptive profiles and P1 pressure exposure have different scopes.
              Intervals and gated exposure remain visible alongside every rank.
            </p>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}

export function BowlersPage() {
  return (
    <PageFrame>
      <main>
        <LeadIn
          path="/bowlers"
          kicker="SupeRR pressure rankings · P1 frozen order"
          title="Pressure-ranked bowlers"
          description="Exactly the supplied top 10, unchanged and in rank order. Lower / more negative scores indicate fewer runs conceded than contextual expectation."
        />
        <section className="px-5 pb-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Prominent Recruitment Warning Banner */}
            <div className="mb-5 border-l-4 border-royal-pink bg-royal-pink/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-royal-pink">
                    Historical P1 Benchmark · NOT RR Recruitment Recommendations
                  </span>
                  <p className="mt-1 text-xs leading-5 text-foreground">
                    This page displays the frozen historical P1 bowler benchmark. Leaders such as
                    Jasprit Bumrah, Sunil Narine, and Lungi Ngidi are already retained; Haris Rauf
                    and Shaheen Afridi have 0% IPL exposure and are not participating. For
                    actionable targets like Matheesha Pathirana, Trent Boult, and Avesh Khan,
                    consult RR&apos;s recruitment board.
                  </p>
                </div>
                <Link
                  to="/targets"
                  className="shrink-0 border border-royal-gold bg-royal-gold px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-royal-dark hover:bg-royal-gold/90"
                >
                  View RR Target Board →
                </Link>
              </div>
            </div>

            <div className="mb-5 border-l-2 border-royal-gold bg-card/60 p-4 text-xs leading-5 text-muted-foreground">
              <p>
                All ten P1 ranks are shown, regardless of market status. A top-10 inclusion
                probability is not an auction-selection probability.
              </p>
              <p className="mt-2 text-royal-pink">
                Haris Rauf and Shaheen Afridi have 0% IPL share in this pressure sample. Their
                ranking evidence is T20I-only—not proof of IPL suitability or auction eligibility.
              </p>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {data.pressure_ranked_bowlers_top10.map((p) => (
                <BowlerCard key={p.rank} player={p} />
              ))}
            </div>
            <p className="mt-5 text-[10px] text-muted-foreground">
              Pressure score represents runs conceded versus contextual expectation (wides/no-balls
              charged; byes/leg-byes not). It is not a future-results guarantee.
            </p>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}

export function KnockoutsPage() {
  const cases = data.rr_analytical_notes.big_game_case_studies;
  const details = [
    {
      start: "RR 130/9",
      opponent: "GT 133/3 in 18.1",
      context: "The 2022 final",
      diagnostic:
        "Batting ceiling and collapse resistance are a case study, not proof of one isolated cause.",
    },
    {
      start: "RR 65/1 → 79/5",
      opponent: "SRH 175/9 · RR 139/7",
      context: "2024 Qualifier 2",
      diagnostic:
        "Middle-over spin pressure is a possible diagnostic: Shahbaz Ahmed 3/23; Abhishek Sharma 2/24. RR lost by 36 runs.",
    },
    {
      start: "RR 214/6",
      opponent: "GT 219/3 in 18.4",
      context: "2026 Qualifier 2",
      diagnostic:
        "RR made 214, but GT chased it down by seven wickets. Gill 104 off 53; Sudharsan 58 off 32. Bowling response is a separate case study.",
    },
  ];
  return (
    <PageFrame>
      <main>
        <LeadIn
          path="/knockouts"
          kicker="Evidence-led case studies · not causal proof"
          title="What is missing when the lights get brighter?"
          description="Three knockout matches surface recruitment hypotheses. They do not prove a single repeatable weakness or establish causation."
        />
        <section className="px-5 pb-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 lg:grid-cols-3">
              {cases.map((item, index) => (
                <article
                  key={item.season}
                  className="data-card flex min-h-full flex-col border-t-2 border-t-royal-gold p-5"
                >
                  <span className="text-[9px] uppercase tracking-[.16em] text-royal-pink">
                    Case study {String(index + 1).padStart(2, "0")} · {item.season}
                  </span>
                  <h2 className="display-face mt-2 text-2xl">{details[index]?.context}</h2>
                  <div className="my-5 grid grid-cols-2 gap-3 border-y border-border py-4">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                        Rajasthan Royals
                      </span>
                      <b className="display-face mt-1 block text-2xl text-foreground">
                        {item.rr_score}
                      </b>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                        Opponent
                      </span>
                      <b className="display-face mt-1 block text-2xl text-foreground">
                        {item.opponent_score}
                      </b>
                    </div>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">{item.diagnostic}</p>
                  <p className="mt-3 border-l-2 border-royal-pink pl-3 text-xs font-semibold leading-5 text-foreground">
                    {details[index]?.diagnostic}
                  </p>
                  <SourceLink
                    href={
                      index === 0
                        ? data.sources.find((s) => s.name.includes("2022 Final"))?.url
                        : index === 1
                          ? data.sources.find((s) => s.name.includes("Qualifier 2 2024"))?.url
                          : data.sources.find((s) => s.name.includes("Qualifier 2 2026"))?.url
                    }
                  >
                    <span className="mt-auto pt-6">Match source</span>
                  </SourceLink>
                </article>
              ))}
            </div>
            <div className="mt-12">
              <Subhead>Recruitment hypotheses</Subhead>
              <p className="mb-5 max-w-3xl text-sm leading-6 text-muted-foreground">
                These are role questions suggested by the case studies—not verdicts. Each role
                should be tested against opponent, surface, phase and current availability.
              </p>
              <div className="grid gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
                {[
                  {
                    title: "Middle-order innings repair",
                    body: "A left-hand No.4–5 option to navigate spin after early progress. Nehal is a role-fit hypothesis, but his 59 gated balls are below P1 eligibility.",
                  },
                  {
                    title: "Powerplay threat & partnerships",
                    body: "New-ball pressure and opening partnerships; distinguish Boult's supplied powerplay-heavy role from death execution.",
                  },
                  {
                    title: "Middle-over control & wickets",
                    body: "Spin, matchups and control through the middle. Compare retained Bishnoi, Punja, Jadeja and Siddharth before adding overseas overlap.",
                  },
                  {
                    title: "High-leverage death overs",
                    body: "Make the overs 17–20 plan explicit. Pathirana requires medical clearance; recorded yorker usage is not yorker accuracy.",
                  },
                  {
                    title: "Rebuild plus finish",
                    body: "A lower-order hitter who can contribute after a top-order collapse. Ferreira is already retained; compare marginal value with Dubey and Shanaka.",
                  },
                  {
                    title: "Interpret with restraint",
                    body: "Three matches are illustrative case studies only. Conditions, opposition, player availability and match state differ.",
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-card p-5">
                    <span className="text-[9px] uppercase tracking-[.15em] text-royal-gold">
                      Role hypothesis
                    </span>
                    <h3 className="display-face mt-2 text-xl">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}

function sourceGroup(name: string) {
  if (/official|ipl 2025|playing conditions|retained player list/i.test(name))
    return "Official IPL / RR / ICC sources";
  if (/reuters/i.test(name) || name.includes("MS Dhoni")) return "Reuters reporting";
  if (name.includes("User-uploaded")) return "User-owned project reference";
  if (name.includes("profile") || name.includes("timeline")) return "Other secondary sources";
  return "Official / project supporting source";
}
function sourceDate(name: string) {
  if (name.includes("User-uploaded")) return "User-provided · snapshot 18 Nov 2026";
  if (name.includes("timeline")) return "Reported schedule · snapshot 18 Nov 2026";
  if (name.includes("MS Dhoni")) return "Reuters report · 17 Nov 2026";
  if (name.includes("Reuters") || name.includes("Bethell"))
    return "Reuters / ICC availability report · 18 Nov 2026 snapshot";
  if (name.includes("Hasaranga"))
    return "Hamstring injury report · Feb 2026; subsequent squad return · Sep 2026";
  return "Publication date not included in supplied source register · 18 Nov 2026 snapshot";
}
export function MethodologyPage() {
  const sources = data.sources;
  const groups = [
    "Official IPL / RR / ICC sources",
    "Reuters reporting",
    "Other secondary sources",
    "User-owned project reference",
    "Official / project supporting source",
  ];
  const limitations = [
    "P1 is a context-adjusted pressure-performance estimate, not a guarantee of future results.",
    "Reliability is modest; rankings carry uncertainty. The 90% intervals and rank ranges should be read alongside point estimates.",
    "P2 descriptive profiles are not causal skill measures. Use only explicitly IPL-only fields for franchise decisions; other general profiles can pool IPL and T20I.",
    "Small samples are not stable talent claims. Nehal Wadhera has 59 pressure-gated balls and is not P1-eligible.",
    "Recorded delivery-style labels are usage labels—not proof of execution, yorker accuracy, target-zone hit rate or miss percentage.",
    "No auction-price model, full XI optimiser or medical assessment exists. Bid ceilings are analyst-entered scenarios only.",
    "Auction registration was not verified as of 18 November 2026. Released-player status does not imply participation.",
    "The official retained-player PDF is a cross-franchise retained-player/salary reference, not a complete release register or final auction list.",
  ];
  return (
    <PageFrame>
      <main>
        <LeadIn
          path="/methodology"
          kicker="Methodology · sources · evidence audit"
          title="What the data says—and what it cannot"
          description="The snapshot separates frozen pressure rankings from RR role recommendations and keeps source scope, uncertainty, release status and medical questions visible."
        />
        <section className="px-5 pb-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="border-l-2 border-royal-pink bg-card/60 p-4">
                <span className="text-[9px] uppercase tracking-wider text-royal-pink">
                  SupeRR pressure rankings
                </span>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  The ten supplied P1 batter and bowler ranks, frozen in their original order. These
                  lists are not RR auction targets.
                </p>
              </div>
              <div className="border-l-2 border-royal-gold bg-card/60 p-4">
                <span className="text-[9px] uppercase tracking-wider text-royal-gold">
                  RR squad recommendations
                </span>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Analyst role-fit hypotheses, working XIs, squad gaps and fallback logic. Not an
                  automated auction optimiser.
                </p>
              </div>
              <div className="border-l-2 border-royal-pink bg-card/60 p-4">
                <span className="text-[9px] uppercase tracking-wider text-royal-pink">
                  Snapshot
                </span>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  18 November 2026 · auction registration not verified · static user-provided
                  project aggregates.
                </p>
              </div>
            </div>
            <section className="mt-12">
              <Subhead>Model & scope</Subhead>
              <div className="grid gap-7 lg:grid-cols-2">
                <div>
                  <h3 className="display-face text-xl">P1 · pressure-performance estimate</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    The supplied posterior mean is reported per 100 pressure-gated balls. Batter
                    scores are better when higher. Bowler scores are better when lower/more negative
                    because the measure represents fewer runs conceded than contextual expectation.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs leading-5 text-muted-foreground">
                    <li>
                      Each top-10 inclusion probability describes model ranking uncertainty; it is
                      not auction-selection probability.
                    </li>
                    <li>
                      Gated exposure, matches, IPL share, 90% interval and 5th–95th rank range
                      should be considered together.
                    </li>
                    <li>
                      Pressure model exposure can include IPL and international T20; the IPL share
                      is shown for scope awareness.
                    </li>
                    <li>
                      Observed descriptive statistics are separate fields and do not establish
                      causal pressure performance.
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="display-face text-xl">P2 · descriptive profiles</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Some general profiles are pooled IPL + T20I. The target board uses fields
                    explicitly labelled IPL-only when a franchise-specific phase comparison is
                    shown.
                  </p>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Yorker delivery-style counts are recorded usage labels only. They do not measure
                    accuracy, target-zone hit rate, execution rate or misses.
                  </p>
                  <div className="mt-4 border border-border p-4">
                    <span className="text-[9px] uppercase tracking-wider text-royal-gold">
                      Batter direction
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Higher P1 score = better relative performance under the fitted context.
                    </p>
                    <span className="mt-3 block text-[9px] uppercase tracking-wider text-royal-pink">
                      Bowler direction
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Lower / more negative P1 score = fewer runs than contextual expectation.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="mt-12">
              <Subhead>Limitations & decision boundaries</Subhead>
              <div className="grid gap-2 md:grid-cols-2">
                {limitations.map((text, index) => (
                  <div key={text} className="flex gap-3 border-b border-border py-3">
                    <span className="font-mono text-xs text-royal-gold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-xs leading-5 text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="mt-12">
              <Subhead>Availability & auction status</Subhead>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="border border-border p-5">
                  <h3 className="display-face text-xl">Status labels</h3>
                  <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                    <li>
                      <b className="text-foreground">Retained:</b> shown as confirmed in the
                      supplied roster snapshot.
                    </li>
                    <li>
                      <b className="text-foreground">Released — registration unverified:</b> release
                      does not prove registration, availability, medical fitness or willingness.
                    </li>
                    <li>
                      <b className="text-foreground">Medical review required:</b> not a diagnosis or
                      clearance decision.
                    </li>
                    <li>
                      <b className="text-foreground">Unavailable:</b> Jacob Bethell is excluded from
                      IPL 2027 target scenarios based on supplied ICC/RCB reporting.
                    </li>
                    <li>
                      <b className="text-foreground">Availability unconfirmed:</b> Mitchell Starc's
                      workload concerns are reported; participation is not assumed.
                    </li>
                  </ul>
                </div>
                <div className="border border-border p-5">
                  <h3 className="display-face text-xl">Registration timeline · reported</h3>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    The source set reports registration closing 23 November, franchise requests
                    through 27 November and a final list expected 3 December. These dates remain
                    reported—not official confirmation in this snapshot. Auction date{" "}
                    {data.auction.auction_date}, {data.auction.auction_time}, at{" "}
                    {data.auction.venue} is listed separately as confirmed in the supplied IPL
                    advisory.
                  </p>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    The source PDF salary column unit is unspecified. The market register preserves
                    its printed value but does not convert it, call it a base price or use it to
                    predict bids.
                  </p>
                </div>
              </div>
            </section>
            <section className="mt-12">
              <Subhead>Sources & evidence register</Subhead>
              <p className="mb-5 text-xs text-muted-foreground">
                Sources are grouped by evidence type. Injury and availability statements link to the
                supplied public reporting where a URL is provided; snapshot dates are labelled where
                given.
              </p>
              <div className="space-y-8">
                {groups.map((group) => (
                  <div key={group}>
                    <h3 className="display-face mb-3 text-xl text-royal-gold">{group}</h3>
                    <div className="divide-y divide-border border-y border-border">
                      {sources
                        .filter((source) => sourceGroup(source.name) === group)
                        .map((source) => (
                          <article
                            key={source.name}
                            className="grid gap-2 py-4 sm:grid-cols-[1fr_auto]"
                          >
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">
                                {source.name}
                              </h4>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {source.supports}
                              </p>
                              <p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">
                                {source.publisher ? `${source.publisher} · ` : ""}
                                {sourceDate(source.name)}
                              </p>
                            </div>
                            <SourceLink href={source.url}>
                              <span className="text-xs">Open source</span>
                            </SourceLink>
                          </article>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="mt-12 border-t border-border pt-8">
              <Subhead>Retained-player PDF scope</Subhead>
              <p className="max-w-4xl text-xs leading-5 text-muted-foreground">
                {data.retention_document_notes.document_scope}{" "}
                {data.retention_document_notes.not_included}{" "}
                {data.retention_document_notes.interpretation_rule}
              </p>
              <p className="mt-3 text-xs">
                <SourceLink href={data.retention_document_notes.official_document_url}>
                  {data.retention_document_notes.official_document_name}
                </SourceLink>
              </p>
              <p className="mt-8 border-l-2 border-royal-pink pl-4 text-sm font-semibold text-foreground">
                HORSES FOR COURSES. Value depends on the problem, pitch, opponent and phase—not a
                single generic player score.
              </p>
            </section>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
