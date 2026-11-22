import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageFrame, OfficialRoyalsCrest } from "@/components/war-room";
import { XIPlayerRail } from "@/components/xi-player-rail";
import { RR_FOCUSED_TARGETS, RR_RETAINED_DECISION_PLAYERS } from "@/domain/decision-data";
import {
  canUseHypotheticalTarget,
  deriveMatchContext,
  MAX_FLEXIBLE_XI_CHANGES,
  MAX_OVERSEAS_SQUAD_SIZE,
  MAX_XI_CHANGES_FROM_REFERENCE,
  optimizeRRLineups,
  parseCricketOvers,
  recommendMatchImpact,
  type DecisionSurface,
  type SurfaceSelection,
  type OppositionProfile,
  type TeamObjective,
  type SubstitutionAssessment,
  type ImpactCombination,
  HISTORICAL_VENUE_OPTIONS,
  resolveVenueSurface,
} from "@/domain/rr-decision-engine";
import { cn } from "@/lib/utils";
import { getHistoricalVenueEvidence } from "@/domain/historical-impact";

interface TacticalScenario {
  id: string;
  name: string;
  title: string;
  situation: string;
  innings: "batting-first" | "chasing" | "defending";
  score: string;
  wickets: string;
  overs: string;
  target: string;
  description: string;
  targetProfile: string;
  startingXIRole: string;
  impactPlayerRole: string;
  whoMakesWay: string;
  legalEligibility: string;
  tradeOff: string;
}

const TACTICAL_USE_CASES: TacticalScenario[] = [
  {
    id: "wadhera-collapse",
    name: "Nehal Wadhera",
    title: "Middle-Order Recovery & Spin Disruption (RR 20/3)",
    situation: "Powerplay / Early Middle collapse (20/3 after 4 overs)",
    innings: "chasing",
    score: "20",
    wickets: "3",
    overs: "4.0",
    target: "185",
    description:
      "RR loses three early top-order wickets in a stiff chase. The team requires middle-order stabilization, strike rotation against spin/pace, and controlled counter-attacking capability to prevent total innings failure.",
    targetProfile:
      "Left-hand middle-order repair batter with high spin-scoring rate (IPL SR 139.6) and boundary-hitting upside.",
    startingXIRole:
      "Starting XI Addition: Directly slots into No.5 as an Indian batting anchor. Stabilizes between Jurel (3), Parag (4) and lower-order finishers (6), freeing power hitters from early exposure.",
    impactPlayerRole:
      "Impact Player Substitution: If starting on the bench in a bowling-heavy XI, enters at 20/3 to anchor the recovery after an early wicket cluster.",
    whoMakesWay:
      "Outgoing Starter: In a 2nd innings chase, a powerplay bowler who has completed bowling (e.g., Mohammed Shami or Sandeep Sharma). In a 1st innings collapse, a dismissed top-order batter (e.g. Vaibhav Sooryavanshi or Yashasvi Jaiswal; illustrative tactical substitution).",
    legalEligibility:
      "Eligibility & Overseas Rules: Indian domestic player consuming 0 overseas slots. Fully compliant under IPL playing conditions without restricting foreign player combinations.",
    tradeOff:
      "Trade-off: Forfeits remaining bowling overs from the substituted starter; small recorded pressure sample (59 pressure-gated deliveries).",
  },
  {
    id: "owen-launch",
    name: "Mitch Owen",
    title: "Late Death Acceleration Platform (RR 180/5, 5 Overs Left)",
    situation: "Death overs launch platform (180/5 in 15.0 overs)",
    innings: "batting-first",
    score: "180",
    wickets: "5",
    overs: "15.0",
    target: "230",
    description:
      "RR reaches 180/5 after 15 overs batting first with top-order anchors dismissed. The team needs immediate, uninhibited boundary-hitting in overs 16–20 to turn 180 into a 225+ winning total.",
    targetProfile:
      "Extreme strike-rate lower-order boundary finisher (BBL SR 195–203) capable of targeting pace and hard lengths from ball one.",
    startingXIRole:
      "Starting XI Addition: If preferred over Ferreira or Shanaka, slots at No.7 as a designated designated overseas boundary finisher.",
    impactPlayerRole:
      "Impact Player Substitution: If starting on the bench, enters at the 15th over mark as an explosive batting booster to maximize death-overs boundaries alongside Ferreira / Dubey.",
    whoMakesWay:
      "Outgoing Starter: A specialist top-order batter whose innings is completed (e.g., Vaibhav Sooryavanshi or Yashasvi Jaiswal).",
    legalEligibility:
      "Eligibility & Overseas Rules: Overseas player. Permitted under IPL rules ONLY IF RR started the match with at most 3 overseas players in the nominated XI.",
    tradeOff:
      "Trade-off: Consumes RR's 4th overseas spot; no IPL sample (BBL scouting context only; 2025–26 BBL avg was 15.09).",
  },
  {
    id: "pathirana-death",
    name: "Matheesha Pathirana",
    title: "Specialist Death-Over Defence & Burger Pace Cover",
    situation: "Defending 12–15 runs in overs 18 & 20 / Burger unavailable",
    innings: "defending",
    score: "145",
    wickets: "4",
    overs: "16.0",
    target: "180",
    description:
      "Opposition requires 35 runs off the final 4 overs. RR needs an elite sling-action specialist who executes yorkers and changes of pace at sub-8.00 economy in overs 17–20.",
    targetProfile:
      "Specialist death fast bowler with extreme sling release (45 IPL wickets in 32 matches, -12.38 pressure metric).",
    startingXIRole:
      "Starting XI Addition: Direct overseas pace starter if Nandre Burger is rested or unavailable, partnering Archer and Shami.",
    impactPlayerRole:
      "Impact Player Substitution: If RR bats first with an Indian-heavy batting lineup (3 overseas), Pathirana enters in the 2nd innings at over 14–16 as the dedicated death closer.",
    whoMakesWay:
      "Outgoing Starter: A specialist top-order batter who has finished batting (e.g. Yashasvi Jaiswal, Riyan Parag, or Dhruv Jurel).",
    legalEligibility:
      "Eligibility & Overseas Rules: Overseas player. Valid ONLY if RR fielded ≤ 3 overseas players in the first innings XI. Requires independent franchise medical clearance.",
    tradeOff:
      "Trade-off: Elevated availability risk (reported shoulder, calf and surgically treated hamstring history); overseas slot constraint.",
  },
];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-royal-pink";

export function MatchLabPage() {
  const [selectedAcquisitions, setSelectedAcquisitions] = useState<string[]>([]);
  const [medicalAssumptions, setMedicalAssumptions] = useState<string[]>([]);
  const [surfaceSelection, setSurfaceSelection] = useState<SurfaceSelection>("venue-default");
  const [opposition, setOpposition] = useState<OppositionProfile>("balanced");
  const [objective, setObjective] = useState<TeamObjective>("balanced");
  const [maxXIChangesFromReference, setMaxXIChangesFromReference] = useState(
    MAX_XI_CHANGES_FROM_REFERENCE,
  );
  const [venue, setVenue] = useState("");
  const [planIndex, setPlanIndex] = useState("0");
  const [innings, setInnings] = useState<"batting-first" | "chasing" | "defending">("chasing");
  const [score, setScore] = useState("53");
  const [wickets, setWickets] = useState("3");
  const [overs, setOvers] = useState("10.0");
  const [targetOrTotal, setTargetOrTotal] = useState("170");
  const [appliedXI, setAppliedXI] = useState<string[] | null>(null);
  const [appliedCombination, setAppliedCombination] = useState<ImpactCombination | null>(null);
  const [savedXI, setSavedXI] = useState<string[] | null>(null);
  const [savedPlanLabel, setSavedPlanLabel] = useState("");
  const [appliedMessage, setAppliedMessage] = useState("");
  const [substitutionAssessment, setSubstitutionAssessment] =
    useState<SubstitutionAssessment | null>(null);
  const [hasRestoredPlan, setHasRestoredPlan] = useState(false);

  useEffect(() => {
    const readStored = (key: string): unknown => {
      try {
        const raw = sessionStorage.getItem(key);
        return raw === null ? null : (JSON.parse(raw) as unknown);
      } catch {
        return null;
      }
    };
    const savedMedical = readStored("rr-wr-medical-assumptions");
    const validMedical = Array.isArray(savedMedical)
      ? [
          ...new Set(
            savedMedical.filter(
              (name): name is string =>
                typeof name === "string" &&
                RR_FOCUSED_TARGETS.some(
                  (player) =>
                    player.name === name && player.medicalRestriction === "MEDICAL_REVIEW",
                ),
            ),
          ),
        ]
      : [];
    setMedicalAssumptions(validMedical);

    const savedAcquisitions = readStored("rr-wr-selected-acquisitions");
    const restored: string[] = [];
    let restoredOverseas = 0;
    if (Array.isArray(savedAcquisitions)) {
      for (const name of savedAcquisitions) {
        if (
          typeof name !== "string" ||
          restored.includes(name) ||
          restored.length >= Math.max(0, 25 - RR_RETAINED_DECISION_PLAYERS.length)
        )
          continue;
        const target = RR_FOCUSED_TARGETS.find((player) => player.name === name);
        if (!target || !canUseHypotheticalTarget(target, validMedical)) continue;
        if (
          target.overseas &&
          restoredOverseas >=
            Math.max(
              0,
              MAX_OVERSEAS_SQUAD_SIZE -
                RR_RETAINED_DECISION_PLAYERS.filter((player) => player.overseas).length,
            )
        )
          continue;
        restored.push(name);
        if (target.overseas) restoredOverseas += 1;
      }
    }
    setSelectedAcquisitions(restored);

    const savedContext = readStored("rr-wr-selected-context");
    if (savedContext && typeof savedContext === "object") {
      const values = savedContext as Record<string, unknown>;
      if (["slow", "dry", "dew", "pace-friendly", "bouncy"].includes(String(values["surface"])))
        setSurfaceSelection(values["surface"] as DecisionSurface);
      // A neutral default from Squad Lab means no manual track assumption was selected;
      // historical venue/player evidence remains active independently of that override.
      if (
        ["balanced", "spin-heavy", "pace-heavy", "left-hand-heavy", "right-hand-heavy"].includes(
          String(values["opposition"]),
        )
      )
        setOpposition(values["opposition"] as OppositionProfile);
      if (
        [
          "balanced",
          "pace-depth",
          "middle-order-cover",
          "spin-control",
          "injury-resilience",
          "specialist-death-option",
        ].includes(String(values["objective"]))
      )
        setObjective(values["objective"] as TeamObjective);
      if (
        typeof values["maxXIChangesFromReference"] === "number" &&
        Number.isFinite(values["maxXIChangesFromReference"])
      ) {
        setMaxXIChangesFromReference(
          Math.max(
            0,
            Math.min(MAX_FLEXIBLE_XI_CHANGES, Math.floor(values["maxXIChangesFromReference"])),
          ),
        );
      }
    }

    const selectedXI = readStored("rr-wr-selected-xi");
    let selectedLabel: string | null = null;
    let savedVenue: string | null = null;
    try {
      selectedLabel = sessionStorage.getItem("rr-wr-selected-plan-label");
      savedVenue = sessionStorage.getItem("rr-wr-match-venue");
    } catch {
      // Browser storage can be unavailable in private or restricted contexts.
    }
    if (
      Array.isArray(selectedXI) &&
      selectedXI.length === 11 &&
      selectedXI.every((name) => typeof name === "string") &&
      new Set(selectedXI).size === 11
    ) {
      setSavedXI(selectedXI as string[]);
      setPlanIndex("saved");
    }
    if (selectedLabel) setSavedPlanLabel(selectedLabel);
    if (savedVenue) setVenue(savedVenue);
    try {
      const savedSurface = sessionStorage.getItem("rr-wr-match-surface-selection");
      if (
        savedSurface &&
        ["venue-default", "neutral", "slow", "dry", "dew", "pace-friendly", "bouncy"].includes(
          savedSurface,
        )
      ) {
        setSurfaceSelection(savedSurface as SurfaceSelection);
      }
    } catch {
      // Keep the neutral historical-venue mode when storage is unavailable.
    }
    setHasRestoredPlan(true);
  }, []);

  useEffect(() => {
    if (!hasRestoredPlan) return;
    try {
      sessionStorage.setItem("rr-wr-match-venue", venue);
      sessionStorage.setItem("rr-wr-match-surface-selection", surfaceSelection);
    } catch {
      /* optional */
    }
  }, [hasRestoredPlan, venue, surfaceSelection]);

  const ballsCompleted = parseCricketOvers(overs);
  const surfaceResolution = useMemo(
    () => resolveVenueSurface(venue, surfaceSelection),
    [venue, surfaceSelection],
  );
  const surface = surfaceResolution.surface;
  const historicalPhase =
    ballsCompleted === null || ballsCompleted < 36
      ? "powerplay"
      : ballsCompleted < 90
        ? "middle"
        : "death";
  const historicalVenue = useMemo(
    () => getHistoricalVenueEvidence(venue, historicalPhase),
    [venue, historicalPhase],
  );
  const context = useMemo(
    () => deriveMatchContext({ surface, opposition, objective, venue }),
    [surface, opposition, objective, venue],
  );
  const engine = useMemo(
    () =>
      optimizeRRLineups({
        retainedPlayers: RR_RETAINED_DECISION_PLAYERS,
        targetPool: RR_FOCUSED_TARGETS,
        selectedAcquisitions,
        medicalClearanceAssumptions: medicalAssumptions,
        context,
        maxXIChangesFromReference,
        limit: 3,
      }),
    [selectedAcquisitions, medicalAssumptions, context, maxXIChangesFromReference],
  );
  const selectedPlan = engine.recommendations[Number(planIndex)] ?? engine.recommendations[0];
  const baseXI = selectedPlan?.players.map((entry) => entry.player.name) ?? [];
  const activeSquad = useMemo(
    () => [
      ...RR_RETAINED_DECISION_PLAYERS,
      ...RR_FOCUSED_TARGETS.filter(
        (player) =>
          selectedAcquisitions.includes(player.name) &&
          canUseHypotheticalTarget(player, medicalAssumptions),
      ),
    ],
    [selectedAcquisitions, medicalAssumptions],
  );
  const savedXIIsValid = Boolean(
    savedXI &&
    savedXI.length === 11 &&
    savedXI.every((name) => activeSquad.some((player) => player.name === name)),
  );
  const currentXI = appliedXI ?? (savedXIIsValid ? savedXI! : baseXI);
  const currentXISlots = currentXI.flatMap((name, index) => {
    const player = activeSquad.find((candidate) => candidate.name === name);
    return player ? [{ position: index + 1, player }] : [];
  });

  const scoreNumber = Number(score);
  const wicketNumber = Number(wickets);
  const targetNumber = targetOrTotal.trim() === "" ? null : Number(targetOrTotal);
  const targetDigitsOnly = targetOrTotal.trim() === "" || /^\d+$/.test(targetOrTotal.trim());
  const targetValid =
    targetDigitsOnly &&
    (innings === "batting-first"
      ? targetNumber === null || (Number.isInteger(targetNumber) && targetNumber > 0)
      : targetNumber !== null && Number.isInteger(targetNumber) && targetNumber > 0);
  const inputsValid =
    /^\d+$/.test(score.trim()) &&
    /^\d+$/.test(wickets.trim()) &&
    ballsCompleted !== null &&
    Number.isInteger(scoreNumber) &&
    scoreNumber >= 0 &&
    Number.isInteger(wicketNumber) &&
    wicketNumber >= 0 &&
    wicketNumber <= 10 &&
    targetValid;
  const decision = useMemo(() => {
    if (!inputsValid || !currentXI.length) return null;
    return recommendMatchImpact({
      innings,
      score: scoreNumber,
      wickets: wicketNumber,
      ballsCompleted: ballsCompleted!,
      targetOrDefendedTotal: targetNumber,
      surface,
      opposition,
      currentXI,
      availableSquad: activeSquad,
      medicalClearanceAssumptions: medicalAssumptions,
      venue: context.venue,
      venueEvidence: context.venueEvidence,
      surfaceSource: surfaceResolution.source,
    });
  }, [
    innings,
    scoreNumber,
    wicketNumber,
    ballsCompleted,
    targetNumber,
    surface,
    surfaceResolution.source,
    opposition,
    context.venue,
    context.venueEvidence,
    currentXI,
    activeSquad,
    medicalAssumptions,
    inputsValid,
  ]);

  useEffect(() => {
    setAppliedXI(null);
    setAppliedMessage("");
    setSubstitutionAssessment(null);
    setAppliedCombination(null);
  }, [
    innings,
    score,
    wickets,
    overs,
    targetOrTotal,
    surface,
    surfaceSelection,
    opposition,
    objective,
    maxXIChangesFromReference,
    venue,
    selectedAcquisitions,
    medicalAssumptions,
    planIndex,
  ]);

  function applyPreview(combination: ImpactCombination) {
    if (!currentXI.includes(combination.outgoing.name) || appliedXI) return;
    const assessment = combination.assessment;
    setSubstitutionAssessment(assessment);
    if (!assessment.valid) {
      setAppliedMessage(assessment.reason);
      return;
    }
    const nextXI = currentXI.map((name) =>
      name === combination.outgoing.name ? combination.incoming.name : name,
    );
    setAppliedXI(nextXI);
    setAppliedCombination(combination);
    setAppliedMessage(assessment.reason);
  }

  const currentRunRate =
    ballsCompleted !== null && ballsCompleted > 0 ? (scoreNumber * 6) / ballsCompleted : null;
  const roleFitRows = decision?.historicalEvidence ?? [];
  const topRoleFitScore = roleFitRows[0]?.roleScore ?? null;
  const topRoleFitGroup =
    topRoleFitScore === null
      ? []
      : roleFitRows.filter((row) => topRoleFitScore - row.roleScore <= 5);
  const noSampleRoleFitPeers = topRoleFitGroup.filter((row) => !row.evidence.dataAvailable);
  const showRoleFitTie =
    innings === "defending" && topRoleFitGroup.length > 1 && noSampleRoleFitPeers.length > 0;
  const activeBench = activeSquad.filter((player) => !currentXI.includes(player.name));

  return (
    <PageFrame>
      <main className="pb-16">
        <section className="border-b border-border bg-[linear-gradient(120deg,rgba(30,20,46,.98),rgba(65,18,55,.95))] px-5 py-10 text-white sm:px-8 sm:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-center gap-3">
              <OfficialRoyalsCrest compact />
              <span className="text-xs font-bold uppercase tracking-[.2em] text-royal-gold">
                Match-state Lab
              </span>
            </div>
            <h1 className="display-face max-w-4xl text-5xl leading-[.95] sm:text-7xl">
              Change the situation.
              <br />
              <span className="text-royal-pink">Change the decision.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/80">
              Start with the eleven selected starters from Squad & XI. Enter the live innings,
              score, wickets and overs. The lab then recommends one possible substitution: one
              player comes in as the Impact Player and one current starter leaves. You will see why
              that role is needed now, who comes in, who leaves, and what capability the team gains
              or gives up. This is a rule-based squad decision aid, not a win-probability model or a
              record of an official match-day nomination.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-[.18em] text-royal-pink">
              Target Use Cases · Situational Impact
            </span>
            <h2 className="display-face mt-1 text-2xl text-foreground sm:text-3xl">
              How Target Acquisitions Fit Specific Match States
            </h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Instead of guessing artificial formulas, evaluate targets against concrete tactical
              situations where their specific skills change RR's ceiling. Select a preset scenario
              to populate the one-for-one substitution engine below:
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TACTICAL_USE_CASES.map((scenario) => (
              <div
                key={scenario.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-royal-pink/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-royal-pink/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-royal-pink">
                      {scenario.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-royal-gold font-semibold">
                      {scenario.innings === "defending"
                        ? "Defending"
                        : scenario.innings === "chasing"
                          ? "Chasing"
                          : "Batting First"}
                    </span>
                  </div>
                  <h3 className="display-face mt-3 text-lg font-semibold text-foreground">
                    {scenario.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {scenario.description}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-border/60 pt-3 text-xs">
                    <div>
                      <span className="block font-semibold text-royal-pink text-[11px]">
                        Starting-XI role (if selected):
                      </span>
                      <span className="text-muted-foreground">{scenario.startingXIRole}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-foreground text-[11px]">
                        Impact Player role (if on bench):
                      </span>
                      <span className="text-muted-foreground">{scenario.impactPlayerRole}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-foreground text-[11px]">
                        Plausible substitution:
                      </span>
                      <span className="text-muted-foreground">{scenario.whoMakesWay}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-royal-gold text-[11px]">
                        Eligibility & overseas constraints:
                      </span>
                      <span className="text-muted-foreground">{scenario.legalEligibility}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-[11px] text-muted-foreground mb-3">
                    <strong className="text-foreground">Key trade-off:</strong> {scenario.tradeOff}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-xl border-royal-pink/40 hover:bg-royal-pink hover:text-white text-xs font-semibold"
                    onClick={() => {
                      setInnings(scenario.innings);
                      setScore(scenario.score);
                      setWickets(scenario.wickets);
                      setOvers(scenario.overs);
                      setTargetOrTotal(scenario.target);
                    }}
                  >
                    Load this match situation ({scenario.score}/{scenario.wickets} in{" "}
                    {scenario.overs} ov)
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-5 pt-4 sm:px-8">
          <XIPlayerRail
            players={currentXISlots}
            title={
              appliedCombination ? "Starting XI · substitution preview" : "Current starting XI"
            }
            note="This strip always shows eleven players. The Impact Player is not a permanent twelfth slot: the substitution plan below shows the incoming player and the starter who leaves."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="grid gap-7 xl:grid-cols-[.82fr_1.18fr]">
            <div className="space-y-6">
              <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-pink">
                    01 · Select the match state
                  </p>
                  <h2 className="display-face mt-1 text-2xl text-foreground">What is happening?</h2>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Start with the match state: score, wickets, overs and target. Then set the
                    opposition profile and, only when you have a defensible view, a surface
                    assumption. Venue is optional historical context—not a live pitch report,
                    fixture lookup or weather feed.
                  </p>
                </div>
                <div className="mb-5 grid grid-cols-3 gap-2">
                  {(
                    [
                      ["batting-first", "RR batting first"],
                      ["chasing", "RR chasing"],
                      ["defending", "RR defending"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => {
                        setInnings(value);
                        if (value === "batting-first" && targetOrTotal === "170")
                          setTargetOrTotal("");
                        if (value !== "batting-first" && targetOrTotal.trim() === "")
                          setTargetOrTotal("170");
                      }}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-xs font-semibold sm:text-sm",
                        innings === value
                          ? "border-royal-pink bg-royal-pink/10 text-royal-pink"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={innings === "defending" ? "Opponent score" : "RR score"}>
                    <input
                      inputMode="numeric"
                      className={inputClass}
                      value={score}
                      onChange={(event) => setScore(event.target.value)}
                    />
                  </Field>
                  <Field
                    label={innings === "defending" ? "Opponent wickets lost" : "RR wickets lost"}
                  >
                    <input
                      inputMode="numeric"
                      className={inputClass}
                      value={wickets}
                      onChange={(event) => setWickets(event.target.value)}
                    />
                  </Field>
                  <Field label="Overs completed">
                    <input
                      className={inputClass}
                      value={overs}
                      onChange={(event) => setOvers(event.target.value)}
                      placeholder="10.0"
                    />
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      Use cricket notation: 10.3 = 63 legal balls.
                    </span>
                  </Field>
                  <Field
                    label={
                      innings === "batting-first"
                        ? "RR total objective (optional)"
                        : innings === "chasing"
                          ? "Target"
                          : "RR total defended"
                    }
                  >
                    <input
                      inputMode="numeric"
                      className={inputClass}
                      value={targetOrTotal}
                      onChange={(event) => setTargetOrTotal(event.target.value)}
                      placeholder={innings === "batting-first" ? "e.g. 190" : "170"}
                    />
                    {innings === "batting-first" && (
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        Leave blank to avoid assuming a par score.
                      </span>
                    )}
                  </Field>
                </div>
                {innings === "defending" && (
                  <p className="mt-3 rounded-lg border border-royal-gold/20 bg-royal-gold/5 p-3 text-xs leading-5 text-muted-foreground">
                    <strong className="text-foreground">Defending mode:</strong> enter the
                    opponent’s live score and wickets. “RR total defended” is Rajasthan’s
                    first-innings total; the opponent needs one more run to win.
                  </p>
                )}
                {!inputsValid && (
                  <p className="mt-3 rounded-xl bg-destructive/5 p-3 text-xs leading-5 text-destructive">
                    Check the match state: valid score, 0–10 wickets and 0–20 overs (with 0–5 balls)
                    are required. A chase/defence needs a target/total; a first innings can leave
                    the total objective blank.
                  </p>
                )}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Track condition · optional analyst override">
                    <select
                      className={inputClass}
                      value={surfaceSelection}
                      onChange={(event) =>
                        setSurfaceSelection(event.target.value as SurfaceSelection)
                      }
                    >
                      <option value="venue-default">
                        Use historical venue/player evidence · no track inferred
                      </option>
                      <option value="neutral">Manual · neutral</option>
                      <option value="slow">Manual · slow / turn</option>
                      <option value="dry">Manual · dry / grip</option>
                      <option value="dew">Manual · dew</option>
                      <option value="pace-friendly">Manual · pace-friendly</option>
                      <option value="bouncy">Manual · bouncy / carry</option>
                    </select>
                  </Field>
                  <Field
                    label={
                      innings !== "defending"
                        ? "Opposition bowling profile"
                        : "Opposition batting handedness · analyst profile"
                    }
                  >
                    <select
                      className={inputClass}
                      value={opposition}
                      onChange={(event) => setOpposition(event.target.value as OppositionProfile)}
                    >
                      <option value="balanced">Balanced / unknown</option>
                      {innings !== "defending" ? (
                        <>
                          <option value="spin-heavy">Spin-heavy attack</option>
                          <option value="pace-heavy">Pace-heavy attack</option>
                        </>
                      ) : (
                        <>
                          <option value="left-hand-heavy">Left-hand-heavy batting</option>
                          <option value="right-hand-heavy">Right-hand-heavy batting</option>
                        </>
                      )}
                    </select>
                  </Field>
                </div>
                <details className="mt-4 rounded-xl border border-border bg-secondary/20 p-4">
                  <summary className="cursor-pointer text-xs font-semibold text-foreground">
                    Optional · historical venue context (not a primary recommendation driver)
                  </summary>
                  <div className="mt-4">
                    <Field label="Venue · select historical ground data or enter another ground">
                      <input
                        list="rr-venue-presets"
                        className={inputClass}
                        value={venue}
                        onChange={(event) => setVenue(event.target.value)}
                        placeholder="e.g. Wankhede Stadium, Mumbai or Chepauk, Chennai"
                      />
                      <datalist id="rr-venue-presets">
                        {HISTORICAL_VENUE_OPTIONS.map((preset) => (
                          <option key={preset.venue} value={preset.venue} />
                        ))}
                      </datalist>
                    </Field>
                    <p className="mt-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
                      <strong className="text-foreground">
                        Surface used: {surface.replaceAll("-", " ")}
                      </strong>{" "}
                      · {surfaceResolution.note}
                    </p>
                    <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                      Opposition bowling type / batting hand is an analyst-selected profile. It is
                      not derived from a verified opposing XI. Where the archive has a sufficient
                      player split, that historical sample is shrunk toward the player’s wider phase
                      record.
                    </p>
                    <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                      The venue lookup uses analyst-curated matches to numeric IPL venue IDs in the
                      uploaded archive; the archive has no official venue-name table. Historical
                      player/phase ground records can influence close recommendations when sample
                      gates pass. No prepared pitch is inferred. Manual track settings remain
                      optional analyst assumptions and affect broad role-balance preferences only.
                    </p>
                    <div className="mt-3 rounded-lg border border-royal-gold/25 bg-royal-gold/5 p-3 text-[11px] leading-5 text-muted-foreground">
                      <strong className="text-foreground">Observed effect in the audit:</strong>{" "}
                      venue alone did not change the first-choice Impact Player recommendation in 50
                      controlled comparisons with the match state held fixed. Treat this as
                      descriptive tie-break context, not a major lever. Surface and opposition
                      assumptions changed recommendations more often in those tested scenarios.
                    </div>
                    <div className="mt-3 rounded-xl border border-border bg-secondary/35 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                        Historical ground record · {historicalPhase}
                      </p>
                      {historicalVenue ? (
                        <>
                          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {historicalVenue.name}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              {historicalVenue.matches} matches ·{" "}
                              {historicalVenue.seasons.join("–")}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <div className="rounded-lg bg-background/75 p-2">
                              <span className="block text-[10px] uppercase text-muted-foreground">
                                Batting-first win
                              </span>
                              <b className="font-mono text-sm text-foreground">
                                {historicalVenue.battingFirstWinPct?.toFixed(0) ?? "n/a"}%
                              </b>
                            </div>
                            <div className="rounded-lg bg-background/75 p-2">
                              <span className="block text-[10px] uppercase text-muted-foreground">
                                Phase balls
                              </span>
                              <b className="font-mono text-sm text-foreground">
                                {historicalVenue.phaseBalls.toLocaleString()}
                              </b>
                            </div>
                            <div className="rounded-lg bg-background/75 p-2">
                              <span className="block text-[10px] uppercase text-muted-foreground">
                                Pace batter runs/100 legal
                              </span>
                              <b className="font-mono text-sm text-foreground">
                                {historicalVenue.pace?.batterRunsPer100Legal?.toFixed(1) ?? "n/a"}
                              </b>
                              <span className="block text-[10px] text-muted-foreground">
                                {historicalVenue.pace?.wicketsPer100?.toFixed(1) ?? "n/a"} bowler
                                wickets/100
                              </span>
                            </div>
                            <div className="rounded-lg bg-background/75 p-2">
                              <span className="block text-[10px] uppercase text-muted-foreground">
                                Spin batter runs/100 legal
                              </span>
                              <b className="font-mono text-sm text-foreground">
                                {historicalVenue.spin?.batterRunsPer100Legal?.toFixed(1) ?? "n/a"}
                              </b>
                              <span className="block text-[10px] text-muted-foreground">
                                {historicalVenue.spin?.wicketsPer100?.toFixed(1) ?? "n/a"} bowler
                                wickets/100
                              </span>
                            </div>
                          </div>
                          <p className="mt-3 text-[11px] leading-4 text-muted-foreground">
                            Ground mapping: {historicalVenue.mappingConfidence} confidence.
                            Pace/spin figures are observed legal-ball batter-run and bowler-wicket
                            rates in this phase, not official bowler economy or a physical pitch
                            classification. They can be affected by teams, players, seasons and
                            match context. The engine only uses player-specific venue splits after
                            exposure gates and shrinkage.
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          No reliable venue-name mapping for this ground in the uploaded archive.
                          Recommendations use player-wide phase history and role scouting.
                        </p>
                      )}
                    </div>
                  </div>
                </details>
                <div className="mt-5">
                  <Field label="Reference XI">
                    <div className="rounded-xl border border-border bg-secondary/50 p-3 text-xs leading-5 text-muted-foreground">
                      <strong className="text-foreground">Analyst Reference Starting XI:</strong>{" "}
                      {savedXIIsValid && savedPlanLabel
                        ? savedPlanLabel
                        : "Definitive 11-Player Starting XI"}{" "}
                      · {selectedPlan?.overseasCount ?? 3}/4 overseas. The substitution preview
                      below tests one-for-one Impact Player replacements against this locked eleven.
                    </div>
                  </Field>
                  {engine.errors.map((error) => (
                    <p key={error} className="mt-2 text-xs leading-5 text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-pink">
                  02 · Calculated state
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <b className="display-face text-3xl text-foreground">
                      {ballsCompleted === null
                        ? "—"
                        : `${Math.floor(ballsCompleted / 6)}.${ballsCompleted % 6}`}
                    </b>
                    <span className="mt-1 block text-[11px] uppercase tracking-wider text-muted-foreground">
                      Overs
                    </span>
                  </div>
                  <div>
                    <b className="display-face text-3xl text-foreground">
                      {currentRunRate === null ? "—" : currentRunRate.toFixed(2)}
                    </b>
                    <span className="mt-1 block text-[11px] uppercase tracking-wider text-muted-foreground">
                      Current rate
                    </span>
                  </div>
                  <div>
                    <b className="display-face text-3xl text-foreground">
                      {decision?.runsRemaining ?? "—"}
                    </b>
                    <span className="mt-1 block text-[11px] uppercase tracking-wider text-muted-foreground">
                      {innings === "batting-first"
                        ? "Runs to objective"
                        : innings === "defending"
                          ? "Runs for opponent"
                          : "Runs to win"}
                    </span>
                  </div>
                  <div>
                    <b className="display-face text-3xl text-foreground">
                      {decision?.requiredRate?.toFixed(2) ?? "—"}
                    </b>
                    <span className="mt-1 block text-[11px] uppercase tracking-wider text-muted-foreground">
                      Required rate
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  The three modes are modelled separately: first-innings decisions use phase,
                  wickets and current rate (plus an optional analyst-set total objective); a chase
                  uses target minus score; while defending, the opponent needs one more than RR's
                  total to win. Overs are converted to legal balls, not decimals.
                </p>
              </article>
            </div>

            <div className="space-y-5">
              <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-pink">
                      03 · Engine recommendation
                    </p>
                    <h2 className="display-face mt-1 text-3xl text-foreground">
                      {decision?.situation ?? "Enter a valid match state"}
                    </h2>
                  </div>
                  <span className="rounded-full bg-royal-gold/10 px-3 py-1.5 text-xs font-semibold text-royal-gold">
                    {decision?.phase ?? "—"}
                  </span>
                </div>
                {decision ? (
                  <>
                    <div className="mt-5 rounded-xl bg-secondary/65 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Match state ·{" "}
                        {innings === "defending" ? "opposition innings" : "RR innings"}
                      </p>
                      <p className="display-face mt-1 text-3xl text-foreground">
                        {innings === "defending" ? "Opposition " : "RR "}
                        {decision.scoreLine}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {decision.runsRemaining === null
                          ? `${decision.ballsRemaining} balls remain · ${currentRunRate === null ? "current rate not yet available" : `current run rate ${currentRunRate.toFixed(2)}`}`
                          : `${decision.runsRemaining} runs ${innings === "batting-first" ? "to selected total objective" : innings === "chasing" ? "required for RR to win" : "required for the opponent to win"} · ${decision.ballsRemaining} balls remaining`}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-royal-pink">
                        Role needed now: {decision.requiredRole}
                      </p>
                      <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                        This role is calculated from the innings, score, wickets and overs. The name
                        is a candidate; the actual decision is the legal one-for-one pairing below.
                        A similar player may remain first choice when the retained bench has limited
                        role cover.
                      </p>
                    </div>
                    {decision.recommended ? (
                      <div className="mt-5 grid gap-5 md:grid-cols-[.78fr_1.22fr]">
                        <div className="rounded-2xl border border-royal-pink/45 bg-royal-pink/5 p-5">
                          <p className="text-xs font-bold uppercase tracking-wider text-royal-pink">
                            {decision.recommended.roleTags?.includes("batting-depth") &&
                            !decision.recommended.roleTags.some((tag) =>
                              [
                                "middle-order",
                                "lower-order",
                                "all-rounder",
                                "repair-batter",
                              ].includes(tag),
                            )
                              ? "Best available · partial batting cover"
                              : showRoleFitTie
                                ? "Leading option · tied role-fit group"
                                : "Suggested Impact Player option"}
                          </p>
                          <h3 className="display-face mt-2 text-3xl text-foreground">
                            {decision.recommended.name}
                          </h3>
                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {decision.recommended.role}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {decision.recommended.isRetained
                                ? "Retained squad option · nomination unverified"
                                : "Hypothetical acquisition · registration unverified"}
                            </span>
                            {decision.recommended.roleTags?.includes("batting-depth") &&
                              !decision.recommended.roleTags.some((tag) =>
                                [
                                  "middle-order",
                                  "lower-order",
                                  "all-rounder",
                                  "repair-batter",
                                ].includes(tag),
                              ) && (
                                <span className="inline-flex rounded-full bg-royal-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-royal-gold">
                                  Partial batting-depth fit
                                </span>
                              )}
                          </div>
                          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                            Role-fit score:{" "}
                            {roleFitRows
                              .find((row) => row.playerName === decision.recommended?.name)
                              ?.roleScore.toFixed(0) ?? "—"}{" "}
                            · heuristic points, not performance probability.
                          </p>
                          {decision.recommended.roleTags?.includes("batting-depth") &&
                            !decision.recommended.roleTags.some((tag) =>
                              [
                                "middle-order",
                                "lower-order",
                                "all-rounder",
                                "repair-batter",
                              ].includes(tag),
                            ) && (
                              <p className="mt-3 rounded-lg border border-royal-gold/25 bg-royal-gold/5 p-3 text-[11px] leading-5 text-muted-foreground">
                                The retained non-XI batting pool contains only general batting-depth
                                profiles for this state. This is the best available partial cover,
                                not a proven specialist No.5/6 repair batter or finisher. The same
                                name may remain first across several batting situations because the
                                current bench lacks a stronger differentiated profile.
                              </p>
                            )}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Why this option fits
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {decision.recommendedReason}
                          </p>
                          {showRoleFitTie && (
                            <div className="mt-3 rounded-xl border border-royal-gold/25 bg-royal-gold/5 p-3">
                              <p className="text-xs font-semibold text-foreground">
                                These are peer options, not a proven ranking
                              </p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {topRoleFitGroup
                                  .map(
                                    (row) =>
                                      `${row.playerName} (${row.roleScore} role points; ${row.evidence.dataAvailable ? `${row.evidence.sampleBalls} phase balls · ${row.evidence.confidence} confidence` : "no qualifying IPL phase sample"})`,
                                  )
                                  .join(" · ")}
                                . The sample-backed player is shown first using the existing shrunk
                                phase metric; no-sample players remain role-based alternatives, not
                                poor performers. Treat this as a close role-fit group, not a
                                certainty.
                              </p>
                            </div>
                          )}
                          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-foreground">
                            Other eligible role-fit options
                          </p>
                          {decision.alternatives.length ? (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {decision.alternatives.map((player) => {
                                const row = roleFitRows.find(
                                  (item) => item.playerName === player.name,
                                );
                                return (
                                  <div
                                    key={player.name}
                                    className="rounded-xl border border-border p-3"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-semibold text-foreground">
                                        {player.name}
                                      </p>
                                      <span className="text-[10px] text-muted-foreground">
                                        {row ? `${row.roleScore} pts` : "Role fit"}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                      {player.role}
                                    </p>
                                    <p className="mt-2 text-[10px] uppercase tracking-wider text-royal-gold">
                                      {row?.evidence.dataAvailable
                                        ? `${row.evidence.sampleBalls} phase balls · ${row.evidence.confidence}`
                                        : "Role scouting · no IPL phase sample"}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                              {decision.alternativeReason}
                            </p>
                          )}
                          <p className="mt-4 text-xs leading-5 text-muted-foreground">
                            {decision.tradeOff}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl border border-border p-5">
                        <p className="text-sm font-semibold text-foreground">
                          No bench player currently clears the role-fit threshold.
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          The selector only considers retained players outside the current XI and
                          hypothetical targets you have explicitly added to Squad Lab. It will not
                          silently insert unacquired names.
                        </p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Available retained bench
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activeBench.map((player) => (
                            <span
                              key={player.name}
                              className="rounded-full border border-border px-3 py-1.5 text-[11px] text-foreground"
                            >
                              {player.name}
                            </span>
                          ))}
                        </div>
                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                          Candidates assessed: {decision.candidatesEvaluated}. Review the selected
                          XI, the supplied role tags and Squad Lab acquisitions before concluding
                          that RR has no practical option.
                        </p>
                      </div>
                    )}
                    {decision.warnings.length > 0 && (
                      <div className="mt-5 rounded-xl bg-royal-gold/10 p-4">
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                          <CircleAlert size={14} />
                          Decision boundaries
                        </p>
                        {decision.warnings.map((warning) => (
                          <p key={warning} className="mt-2 text-xs leading-5 text-muted-foreground">
                            {warning}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    A recommendation appears after the match state and XI are valid.
                  </p>
                )}
              </article>

              {decision?.historicalEvidence?.length ? (
                <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-gold">
                    Historical evidence behind the shortlist
                  </p>
                  <div className="mt-3 rounded-xl border border-royal-gold/25 bg-royal-gold/5 p-3">
                    <p className="text-xs font-semibold text-foreground">
                      Read these figures as low-strength comparative evidence.
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      The context model improves RMSE by only about 1% over a phase baseline, while
                      MAE does not improve and is worse in some 2026 splits. These figures help
                      inspect close role-fit cases; they are not calibrated forecasts or strong
                      evidence that one player will outperform another.
                    </p>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    The engine first groups candidates by tactical role fit. Within a five-point
                    role-fit band, players with a qualifying sample are ordered using the displayed
                    deterministic, sample-shrunk historical tie-break metric from match-grouped
                    out-of-fold IPL records. This is the same final value used for sorting, after
                    eligible player-vs-style and ground adjustments. Positive values favour the
                    batter (context-adjusted batter runs added) or bowler (context-adjusted batter
                    runs prevented on legal balls). Bowling evidence is not official economy because
                    the archive does not reliably reconstruct every extra. Players without a
                    qualifying sample remain eligible after the sample-backed group in that band;
                    this reflects evidence availability, not proof that they are worse performers.
                  </p>
                  <div className="mt-4 space-y-3">
                    {decision.historicalEvidence.slice(0, 3).map((row, index) => (
                      <div key={row.playerName} className="rounded-xl border border-border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {index + 1}. {row.playerName}
                          </p>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Role fit {row.roleScore.toFixed(0)}
                          </span>
                        </div>
                        {row.evidence.dataAvailable ? (
                          <>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>
                                <b className="text-foreground">
                                  {row.evidence.tieBreakContextMetricPer100?.toFixed(1) ?? "n/a"}
                                </b>{" "}
                                historical tie-break metric (
                                {row.evidence.discipline === "bowling"
                                  ? "batter runs prevented"
                                  : "runs added"}
                                /100)
                              </span>
                              <span>{row.evidence.sampleBalls} balls</span>
                              <span>{row.evidence.matches} matches</span>
                              <span>{row.evidence.confidence} confidence</span>
                            </div>
                            {row.evidence.venueEvidenceUsed && (
                              <p className="mt-2 text-[11px] text-royal-gold">
                                {row.evidence.venueName}: local sample{" "}
                                {row.evidence.venueSampleBalls} balls /{" "}
                                {row.evidence.venueSampleMatches} matches, shrunk toward overall
                                phase record.
                              </p>
                            )}
                            {row.evidence.opponentStyle && (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {row.evidence.opponentStyleEvidenceUsed ? (
                                  <>
                                    Historical {row.evidence.opponentStyle} split:{" "}
                                    <b className="text-foreground">
                                      {row.evidence.opponentStyleShrunkenMetricPer100?.toFixed(1) ??
                                        "n/a"}
                                    </b>{" "}
                                    context-adjusted runs{" "}
                                    {row.evidence.discipline === "bowling" ? "prevented" : "added"}
                                    /100 · {row.evidence.opponentStyleBalls} balls /{" "}
                                    {row.evidence.opponentStyleMatches} matches · shrunk toward
                                    phase record.
                                  </>
                                ) : (
                                  <>
                                    Insufficient {row.evidence.opponentStyle} split:{" "}
                                    {row.evidence.opponentStyleBalls} balls /{" "}
                                    {row.evidence.opponentStyleMatches} matches. General phase
                                    record remains the basis.
                                  </>
                                )}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            No IPL sample in the supplied archive. Role scouting only; no
                            performance estimate.
                          </p>
                        )}
                        {row.evidence.impactUsageWindow && (
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            Historical Impact Player usage ({row.evidence.impactUsageWindow}):{" "}
                            {row.evidence.impactIncomingMatches} incoming-role match flags ·{" "}
                            {row.evidence.impactOutgoingMatches} outgoing-role match flags. The
                            archive does not record the substitution score/time, so these counts are
                            descriptive only and do not train the situation ranking.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ) : null}
              {decision && decision.phase !== "complete" && (
                <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-pink">
                    04 · One-for-one Impact Player plan
                  </p>
                  <h3 className="display-face mt-1 text-2xl text-foreground">
                    Who comes in — and who makes way?
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    The Impact Player rule does not add a permanent twelfth player to the XI. This
                    preview replaces one of the eleven starters with one eligible player from the
                    selected squad pool. Check both the benefit and the capability you lose.
                  </p>
                  {decision.recommended && decision.combinations.length > 0 ? (
                    (() => {
                      const primary = decision.combinations[0]!;
                      return (
                        <>
                          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
                            <div className="rounded-2xl border border-royal-pink/40 bg-royal-pink/5 p-5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-royal-pink">
                                Comes in · Impact Player
                              </p>
                              <h4 className="display-face mt-2 text-2xl text-foreground">
                                {primary.incoming.name}
                              </h4>
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                {primary.incoming.role}
                              </p>
                              <span className="mt-3 inline-flex rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold text-muted-foreground">
                                {primary.incoming.isRetained
                                  ? "Retained squad option · match nomination unverified"
                                  : "Hypothetical target · registration unverified"}
                              </span>
                            </div>
                            <div
                              className="flex items-center justify-center text-2xl font-bold text-royal-gold"
                              aria-label="replaces"
                            >
                              ↔
                            </div>
                            <div className="rounded-2xl border border-border bg-secondary/35 p-5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Leaves · current starter
                              </p>
                              <h4 className="display-face mt-2 text-2xl text-foreground">
                                {primary.outgoing.name}
                              </h4>
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                {primary.outgoing.role}
                              </p>
                              <span className="mt-3 inline-flex rounded-full bg-background px-3 py-1 text-[10px] font-semibold text-muted-foreground">
                                Removed from the active XI preview
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 rounded-xl bg-secondary/55 p-4">
                            <p className="text-xs font-semibold text-foreground">
                              Why this pairing fits this match state
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {primary.rationale}
                            </p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                  Adds
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                  {primary.assessment.addedCapabilities.join(" · ") ||
                                    "Fills the required situation-specific role"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-royal-gold">
                                  Gives up / must cover
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                  {primary.assessment.lostCapabilities.join(" · ") ||
                                    "No distinct capability tag removed"}
                                </p>
                              </div>
                            </div>
                            <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
                              Trade-off: {primary.tradeOff}
                            </p>
                          </div>
                          <Button
                            disabled={Boolean(appliedXI) || !primary.assessment.valid}
                            onClick={() => applyPreview(primary)}
                            className="mt-4 w-full rounded-full bg-royal-pink text-white hover:bg-royal-pink/90"
                          >
                            {appliedCombination?.id === primary.id
                              ? "Preview applied"
                              : "Preview this one-for-one substitution"}
                          </Button>
                          {decision.combinations.length > 1 && (
                            <details className="mt-4 rounded-xl border border-border p-4">
                              <summary className="cursor-pointer text-xs font-semibold text-foreground">
                                Compare {decision.combinations.length - 1} alternative substitution
                                {decision.combinations.length - 1 === 1 ? "" : "s"}
                              </summary>
                              <div className="mt-3 space-y-2">
                                {decision.combinations.slice(1).map((combo) => (
                                  <div
                                    key={combo.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary/45 p-3"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">
                                        {combo.incoming.name} for {combo.outgoing.name}
                                      </p>
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {combo.rationale}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={Boolean(appliedXI) || !combo.assessment.valid}
                                      onClick={() => applyPreview(combo)}
                                    >
                                      Preview alternative
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                          {appliedMessage && (
                            <p className="mt-3 rounded-lg border border-royal-pink/25 bg-royal-pink/5 p-3 text-xs leading-5 text-foreground">
                              {appliedMessage}
                            </p>
                          )}
                          {appliedXI && appliedCombination && (
                            <p className="mt-3 rounded-lg bg-secondary p-3 text-xs leading-5 text-foreground">
                              Preview updated: {appliedCombination.incoming.name} replaces{" "}
                              {appliedCombination.outgoing.name}. The XI strip above now shows the
                              resulting eleven.
                            </p>
                          )}
                          {substitutionAssessment && (
                            <div className="mt-4 rounded-xl border border-border bg-secondary/45 p-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                                Role coverage before / after
                              </p>
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                Pace {substitutionAssessment.beforeCoverage.paceOptions} →{" "}
                                {substitutionAssessment.afterCoverage.paceOptions} · Spin{" "}
                                {substitutionAssessment.beforeCoverage.spinOptions} →{" "}
                                {substitutionAssessment.afterCoverage.spinOptions} · Keepers{" "}
                                {substitutionAssessment.beforeCoverage.wicketkeepers} →{" "}
                                {substitutionAssessment.afterCoverage.wicketkeepers} · Overseas{" "}
                                {substitutionAssessment.beforeCoverage.overseas} →{" "}
                                {substitutionAssessment.afterCoverage.overseas}
                              </p>
                              {substitutionAssessment.warnings.map((warning) => (
                                <p key={warning} className="mt-2 text-xs leading-5 text-royal-gold">
                                  {warning}
                                </p>
                              ))}
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            disabled={!appliedXI}
                            onClick={() => {
                              setAppliedXI(null);
                              setAppliedCombination(null);
                              setAppliedMessage("");
                              setSubstitutionAssessment(null);
                            }}
                          >
                            <RefreshCw size={13} /> Reset preview
                          </Button>
                        </>
                      );
                    })()
                  ) : (
                    <div className="mt-4 rounded-xl border border-royal-gold/25 bg-royal-gold/5 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        No legal one-for-one substitution is available for this selected XI and
                        match state.
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        The engine will not invent a player or break squad rules. Check the selected
                        XI, bench roles and any explicitly added hypothetical acquisitions in Squad
                        & XI. This is a selector limitation for this scenario, not proof that no
                        cricketing alternative exists.
                      </p>
                    </div>
                  )}
                </article>
              )}

              <article className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                  How the suggestion is produced
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Match state", "Wickets, balls remaining, required rate and innings phase."],
                    [
                      "Squad filter",
                      "Only retained players or explicitly selected hypothetical acquisitions outside the XI are considered.",
                    ],
                    [
                      "Historical evidence",
                      "Match-grouped out-of-fold IPL phase residuals break close role-fit ties; venue splits are separately shrunk and shown with sample sizes.",
                    ],
                  ].map(([title, body]) => (
                    <div key={title} className="border-l-2 border-royal-pink pl-3">
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  The venue is entered by the analyst and matched to historical ground IDs where the
                  archive supports it. Past player/phase venue splits can influence close role-fit
                  comparisons after shrinkage; the venue itself does not imply a current surface.
                  Manual surface overrides remain scenario assumptions. No player-vs-pitch outcome
                  forecast is generated. The recommended player is a squad-pool candidate, not a
                  verified member of the official match-day nominated substitute pool; confirm the
                  official team sheet and applicable 2027 playing conditions.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
