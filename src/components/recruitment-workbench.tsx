import { ArrowRight, Search, ShieldAlert, Wind } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageFrame, OfficialRoyalsCrest } from "@/components/war-room";
import { getCandidateDetail } from "@/domain/decision-data";
import { getHistoricalImpactUsage, getHistoricalModelSummary } from "@/domain/historical-impact";
import {
  RR_BATTER_RECOMMENDATIONS,
  RR_BOWLER_RECOMMENDATIONS,
  type RecruitmentCandidate,
} from "@/domain/recruitment";
import { chooseRoleMatchedAlternative } from "@/domain/recruitment-alternatives";
import { cn } from "@/lib/utils";
import releaseReferenceData from "@/data/rr-2027-released-reference.json";
import { warRoomData } from "@/data/war-room";
import {
  filterReleaseReferenceRows,
  releaseStatusLabel,
  releaseStatusTone,
  type ReleaseReferenceRow,
} from "@/domain/release-register";

const releasedReferenceRows = releaseReferenceData as ReleaseReferenceRow[];

const workstreams = [
  {
    title: "Pace depth & availability cover",
    priority: "Selective advantage buy · not an empty role",
    thesis:
      "RR already has a defined pace structure: Shami and Burger are preferred new-ball options; Archer is the strongest overall strike option with credible death-over flexibility; Sandeep adds control and variations; Brijesh provides Indian pace and a death-over option (with a still-limited IPL sample), while Sushant is a developmental left-arm reserve. A further quick is an advantage only if he improves injury/workload resilience or adds a distinct phase skill—not simply another name. Tushar Deshpande must be assessed against Brijesh's role and death-over economy rather than added for headcount.",
    candidates: ["Avesh Khan", "Akash Madhwal"],
  },
  {
    title: "Specialist phase cover",
    priority: "Conditional, not automatic",
    thesis:
      "A specialist overseas bowler is worth adding only when the missing phase skill is clear and the medical, market and overseas-slot trade-offs are acceptable.",
    candidates: ["Matheesha Pathirana", "Mustafizur Rahman", "Trent Boult"],
  },
  {
    title: "Lower-order batting insurance",
    priority: "Only if it changes the XI",
    thesis:
      "Ferreira, Dubey and Shanaka already offer lower-order hitting and all-round flexibility. A new batter must add a distinct innings-repair, spin-handling or finishing role rather than duplicate the incumbents.",
    candidates: ["Nehal Wadhera", "Nitish Rana", "Mitch Owen"],
  },
];

function displayMetric(value: string | number | undefined): string | null {
  if (value === undefined || value === null || value === "") return null;
  return typeof value === "number"
    ? value.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : value;
}

function statusClass(status: string) {
  if (/registered/i.test(status)) return "bg-emerald-500/10 text-emerald-700";
  if (/unavailable|unresolved/i.test(status)) return "bg-destructive/10 text-destructive";
  return "bg-royal-gold/10 text-royal-gold";
}

function CandidateDirectoryCard({
  candidate,
  allCandidates,
}: {
  candidate: RecruitmentCandidate;
  allCandidates: RecruitmentCandidate[];
}) {
  const statusTone =
    candidate.marketStatus === "AUCTION_REGISTERED"
      ? "bg-emerald-500/10 text-emerald-700"
      : candidate.marketStatus === "UNAVAILABLE" ||
          candidate.marketStatus === "INELIGIBLE_MARKET" ||
          candidate.marketStatus === "RETAINED_OTHER_FRANCHISE" ||
          candidate.marketStatus === "MARKET_STATUS_UNRESOLVED"
        ? "bg-destructive/10 text-destructive"
        : "bg-royal-gold/10 text-royal-gold";
  const pressure = candidate.pressureEvidence;
  const pressureValue =
    pressure.postMeanPer100 === undefined
      ? null
      : `${pressure.postMeanPer100 > 0 ? "+" : ""}${pressure.postMeanPer100.toFixed(2)} /100`;
  const exposure = [
    pressure.gatedBalls !== undefined ? `${pressure.gatedBalls} balls` : null,
    pressure.gatedMatches !== undefined ? `${pressure.gatedMatches} matches` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const scoutingMetrics = Object.entries(pressure.scoutingMetrics ?? {})
    .filter(([key]) => !/rank|top.?10|probab/i.test(key))
    .slice(0, 3);
  const matchedAlternative = chooseRoleMatchedAlternative(candidate, allCandidates);
  return (
    <article className="rounded-xl border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-royal-pink">
            {candidate.discipline} · Curated shortlist order{" "}
            {String(candidate.rank).padStart(2, "0")}
          </p>
          <h3 className="display-face mt-1 text-xl text-foreground">{candidate.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {candidate.nationality} ·{" "}
            {candidate.primaryRole
              .replaceAll("_", " ")
              .toLowerCase()
              .replace(/\b\w/g, (letter) => letter.toUpperCase())}
            {candidate.secondaryRole
              ? ` · ${candidate.secondaryRole.replaceAll("_", " ").toLowerCase()}`
              : ""}
          </p>
        </div>
        <span
          className={cn(
            "max-w-56 rounded-full px-2.5 py-1 text-right text-[10px] font-semibold leading-4",
            statusTone,
          )}
        >
          {candidate.marketStatusLabel}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Why it could fit
          </p>
          <p className="mt-1 text-xs leading-5 text-foreground">{candidate.whyRR}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Role evidence
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{candidate.roleFit}</p>
        </div>
      </div>
      {scoutingMetrics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {scoutingMetrics.map(([key, value]) => (
            <span
              key={key}
              className="rounded-lg bg-secondary px-2.5 py-1.5 text-[10px] text-foreground"
            >
              <b>{displayMetric(value)}</b>
              <span className="ml-1 text-muted-foreground">{key.replaceAll("_", " ")}</span>
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 rounded-lg bg-secondary/55 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            Pressure evidence
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-royal-gold">
            {pressure.status.replaceAll("_", " ")}
          </span>
        </div>
        {pressureValue && <p className="mt-1 font-mono text-sm text-foreground">{pressureValue}</p>}
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
          {exposure || "No qualifying pressure exposure was supplied."} · {pressure.exposureNote}
        </p>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-royal-pink">
            Marginal case
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {candidate.upgradeOverSquad}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-royal-gold">
            Counterargument
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{candidate.watchOut}</p>
        </div>
      </div>
      {matchedAlternative && (
        <div className="mt-3 rounded-lg border border-border/80 bg-secondary/35 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Role-matched candidate pool alternative
          </p>
          <p className="mt-1 text-xs font-semibold text-foreground">
            {matchedAlternative.candidate.name} ({matchedAlternative.candidate.nationality}) ·{" "}
            {matchedAlternative.reason}
          </p>
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
            Counter-comparison: {matchedAlternative.candidate.watchOut}
          </p>
        </div>
      )}
      <p className="mt-3 border-t border-border pt-3 text-[10px] leading-4 text-muted-foreground">
        Market: {candidate.marketStatusLabel}
        {candidate.medicalRestriction === "MEDICAL_REVIEW"
          ? ` · Medical review: ${candidate.medicalNote ?? "separate clearance required"}`
          : ""}
      </p>
    </article>
  );
}

export function RecruitmentWorkbenchPage() {
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryDiscipline, setDirectoryDiscipline] = useState<"ALL" | "BATTER" | "BOWLER">(
    "ALL",
  );
  const [referenceSearch, setReferenceSearch] = useState("");
  const retainedOverseasCount = warRoomData.team.retained_overseas_count;
  const remainingOverseasSlots = warRoomData.team.additional_overseas_squad_slots_up_to;
  const allCandidates = useMemo(
    () => [...RR_BATTER_RECOMMENDATIONS, ...RR_BOWLER_RECOMMENDATIONS],
    [],
  );
  const filteredReleaseReferences = useMemo(
    () => filterReleaseReferenceRows(releasedReferenceRows, referenceSearch),
    [referenceSearch],
  );
  const candidateMarketSummary = useMemo(
    () => ({
      registered: allCandidates.filter(
        (candidate) => candidate.marketStatus === "AUCTION_REGISTERED",
      ).length,
      releasedUnverified: allCandidates.filter(
        (candidate) => candidate.marketStatus === "RELEASED_REGISTRATION_UNVERIFIED",
      ).length,
      unresolved: allCandidates.filter(
        (candidate) => candidate.marketStatus === "MARKET_STATUS_UNRESOLVED",
      ).length,
    }),
    [allCandidates],
  );
  const historicalSummary = getHistoricalModelSummary() as Record<string, unknown>;
  const impactUsage = getHistoricalImpactUsage();
  const validation = historicalSummary["batter_2026_venue_blind"] as
    Record<string, number> | undefined;
  const filteredCandidates = useMemo(() => {
    const query = directorySearch.trim().toLowerCase();
    return allCandidates.filter((candidate) => {
      const disciplineMatch =
        directoryDiscipline === "ALL" || candidate.discipline === directoryDiscipline;
      const searchMatch =
        !query ||
        [
          candidate.name,
          candidate.primaryRole,
          candidate.secondaryRole,
          candidate.nationality,
          candidate.marketStatusLabel,
          candidate.whyRR,
          candidate.roleFit,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      return disciplineMatch && searchMatch;
    });
  }, [allCandidates, directorySearch, directoryDiscipline]);

  return (
    <PageFrame>
      <main className="pb-16">
        <section className="border-b border-border bg-[linear-gradient(120deg,rgba(30,20,46,.98),rgba(65,18,55,.95))] px-5 py-10 text-white sm:px-8 sm:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-center gap-3">
              <OfficialRoyalsCrest compact />
              <span className="text-xs font-bold uppercase tracking-[.2em] text-royal-gold">
                Recruitment decision room
              </span>
            </div>
            <h1 className="display-face max-w-4xl text-5xl leading-[.94] sm:text-7xl">
              Keep the core.
              <br />
              <span className="text-royal-pink">Cover the pressure points.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/80">
              RR do not need six new names just because six places are open. The retained attack
              already has defined new-ball, strike, control and death-over options. The 2027 job is
              to protect that core: consider an additional Indian quick as workload / injury
              insurance only when he adds a distinct phase skill, and assess lower-middle-order role
              succession after Hetmyer’s release. Every target must improve the 19-player group
              rather than duplicate it.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="mb-6 rounded-xl border border-royal-gold/25 bg-royal-gold/5 p-3 text-xs leading-5 text-muted-foreground">
            <strong className="text-foreground">How to read the 1–10 shortlist order:</strong> the
            current sequence is an analyst-curated review order, not a reproducible weighted score,
            probability of success or auction priority. Compare each profile against the role gap,
            evidence sample, market status and resulting XI; do not treat ordinal position as model
            confidence.
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border-l-4 border-royal-pink bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-royal-pink">
                01 · Advantage / insurance
              </p>
              <h2 className="display-face mt-2 text-2xl text-foreground">
                Pace depth without role duplication
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Shami and Burger are the preferred new-ball profiles; Archer is the strongest
                overall strike option and can cover high-quality death overs. Sandeep brings control
                / variations, Brijesh offers Indian pace and death cover, and Sushant adds reserve
                depth. Avesh or Akash should be judged as extra workload / injury insurance—not as
                proof that RR has no death options. Tushar Deshpande must be evaluated strictly
                against death-over economy and role overlap with Brijesh rather than signed merely
                for headcount.
              </p>
            </article>
            <article className="rounded-2xl border-l-4 border-royal-gold bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                02 · Conditional
              </p>
              <h2 className="display-face mt-2 text-2xl text-foreground">Specialist phase skill</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Pathirana is flagged injury-prone / elevated availability risk after reported
                shoulder, calf and surgically treated hamstring setbacks. He is a high-risk
                conditional option, not a routine medical-review case. Boult is powerplay-first.
                Mustafizur is variation and cutters—not a like-for-like death option.
              </p>
            </article>
            <article className="rounded-2xl border-l-4 border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                03 · Only if distinct
              </p>
              <h2 className="display-face mt-2 text-2xl text-foreground">Middle/lower-order bat</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Nehal and Nitish offer different middle-order profiles; Owen is a more explosive
                overseas option with limited IPL evidence. Compare each against Shanaka, Dubey and
                Ferreira.
              </p>
            </article>
          </div>

          <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-gold">
                  What the supplied data actually says
                </p>
                <h2 className="display-face mt-1 text-3xl text-foreground">
                  Evidence before opinion.
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  These are observed records and model diagnostics from the uploaded IPL 2022–2026
                  archive. They are not auction recommendations by themselves.
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
                Source: suprr_selector.zip
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [String(historicalSummary["usable_ipl_matches"] ?? "—"), "usable IPL matches"],
                [
                  Number(historicalSummary["ipl_legal_deliveries"] ?? 0).toLocaleString("en-IN"),
                  "legal deliveries",
                ],
                [
                  String((historicalSummary["ipl_venue_ids"] as number | undefined) ?? "—"),
                  "numeric venue IDs",
                ],
                [
                  String(impactUsage.incoming_records ?? "—"),
                  "historical incoming Impact Player flags",
                ],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-secondary/55 p-4">
                  <p className="display-face text-3xl text-foreground">{value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-royal-pink">
                  Model validation · 2026 chronological holdout
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Venue-blind context model RMSE:{" "}
                  <b>{validation?.["rmse"]?.toFixed(3) ?? "not available"}</b> vs phase baseline{" "}
                  <b>{validation?.["baseline_rmse"]?.toFixed(3) ?? "not available"}</b>.
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  RMSE improves by about 1.08%, but MAE is worse than baseline. This is a modest,
                  mixed result—not a reliable next-ball or match-outcome predictor.
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                  What this means for recruitment
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Use phase, role, pace/spin and handedness splits to compare candidates when
                  samples qualify. Require sample size and match count; shrink small splits toward
                  broader phase evidence.
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  The archive does not include auction prices, verified 2027 registration, current
                  medical clearance or complete comparable IPL records for every target. No-estimate
                  is not a negative performance rating.
                </p>
              </div>
            </div>
          </section>

          <section
            className="mt-8 overflow-hidden rounded-2xl border border-royal-gold/30 bg-card"
            aria-label="Hasaranga not prioritised assessment"
          >
            <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="max-w-4xl">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-gold">
                  Considered · not prioritised
                </p>
                <h2 className="display-face mt-2 text-3xl text-foreground">
                  Why Wanindu Hasaranga is not the spin recommendation.
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Hasaranga is an understandable alternative on role profile:{" "}
                  {"attacking leg-spin with potential lower-order hitting / batting utility"}. That
                  is a skill-set upside, not proof of a dependable IPL No.6 finishing output. But RR
                  already retain Ravi Bishnoi and Yash Raj Punja as wrist-spin options, alongside
                  Jadeja and Siddharth for left-arm orthodox spin. He does not fill a clean spin
                  vacancy.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-secondary/60 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                      Overseas-slot cost
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      RR have {retainedOverseasCount} overseas players in the 19-player retained
                      group and {remainingOverseasSlots} overseas squad places remaining under the
                      eight-player cap. Hasaranga would use one of those remaining places; that slot
                      must be compared with overseas batting / pace alternatives.
                    </p>
                  </div>
                  <div className="rounded-xl bg-secondary/60 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                      Availability risk
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Public reporting records a heel injury that ruled him out of IPL 2024,
                      recurring left-hamstring injuries in 2024, and a further hamstring injury
                      during the 2026 T20 World Cup. This is a history of interrupted
                      availability—not a claim about his current medical status.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-foreground">
                  <strong>Decision:</strong> do not prioritise him in the base plan. Revisit only if
                  the final auction pool, independent medical clearance and the opportunity cost of
                  an overseas slot make him a clear XI upgrade.
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                  <a
                    className="text-royal-gold underline underline-offset-4"
                    href="https://www.icc-cricket.com/news/another-injury-blow-rules-star-spinner-out-against-india"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ICC · Aug 2024 hamstring injury ↗
                  </a>
                  <a
                    className="text-royal-gold underline underline-offset-4"
                    href="https://www.icc-cricket.com/news/injury-sidelines-sri-lanka-spinner-for-odi-series-against-new-zealand"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ICC · Nov 2024 recurring injury ↗
                  </a>
                  <a
                    className="text-royal-gold underline underline-offset-4"
                    href="https://www.ft.lk/a/b/1-788106"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Daily FT · Feb 2026 fitness update ↗
                  </a>
                </div>
              </div>
              <div className="rounded-xl border border-royal-gold/30 bg-royal-gold/5 px-4 py-3 text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-royal-gold">
                  Market status
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">Released by LSG</p>
                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                  Registration unverified in the 18 Nov supplied register
                </p>
              </div>
            </div>
          </section>

          <div className="mt-12 space-y-14">
            {workstreams.map((stream, streamIndex) => (
              <section key={stream.title}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div className="max-w-4xl">
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-pink">
                      Decision {String(streamIndex + 1).padStart(2, "0")}
                    </p>
                    <h2 className="display-face mt-1 text-3xl text-foreground sm:text-4xl">
                      {stream.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{stream.thesis}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
                    {stream.priority}
                  </span>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {stream.candidates.map((name) => {
                    const candidate = getCandidateDetail(name);
                    if (!candidate) return null;
                    const metrics = candidate.pressureEvidence.scoutingMetrics ?? {};
                    const metricRows = Object.entries(metrics)
                      .filter(([key]) => !/rank|top.?10|probab/i.test(key))
                      .slice(0, 4);
                    const isPathirana = candidate.name === "Matheesha Pathirana";
                    const isAvesh = candidate.name === "Avesh Khan";
                    const isAkash = candidate.name === "Akash Madhwal";
                    const isNehal = candidate.name === "Nehal Wadhera";
                    const isNitish = candidate.name === "Nitish Rana";
                    const isMitch = candidate.name === "Mitch Owen";
                    return (
                      <article
                        key={candidate.name}
                        className="overflow-hidden rounded-2xl border border-border bg-card"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5 sm:p-6">
                          <div>
                            <h3 className="display-face text-2xl text-foreground">
                              {candidate.name}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {candidate.nationality} ·{" "}
                              {candidate.primaryRole
                                .replaceAll("_", " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                            </p>
                            {isPathirana && (
                              <span className="mt-2 inline-flex rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive">
                                Injury-prone · elevated availability risk
                              </span>
                            )}
                          </div>
                          <div className="flex max-w-56 flex-col items-end gap-1">
                            <span
                              className={cn(
                                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
                                candidate.nationality === "Indian"
                                  ? "bg-secondary text-foreground"
                                  : "bg-royal-pink/10 text-royal-pink",
                              )}
                            >
                              {candidate.nationality}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-right text-[11px] leading-4",
                                statusClass(candidate.marketStatusLabel),
                              )}
                            >
                              {candidate.marketStatusLabel}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-4 p-5 sm:p-6">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-royal-pink">
                              Why this profile fits RR
                            </p>
                            <p className="mt-2 text-sm leading-6 text-foreground">
                              {candidate.whyRR}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Role and supplied evidence
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {candidate.roleFit}
                            </p>
                            {metricRows.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {metricRows.map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground"
                                  >
                                    <b>{displayMetric(value)}</b>
                                    <span className="ml-1 text-muted-foreground">
                                      {key.replaceAll("_", " ")}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}
                            {candidate.pressureEvidence.gatedBalls !== undefined && (
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                Observed pressure exposure: {candidate.pressureEvidence.gatedBalls}{" "}
                                deliveries across{" "}
                                {candidate.pressureEvidence.gatedMatches ?? "not supplied"} matches.
                                Exposure is context, not a forecast.
                              </p>
                            )}
                          </div>
                          <div className="rounded-xl bg-secondary/60 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                              Incremental value over the retained group
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {candidate.upgradeOverSquad}
                            </p>
                          </div>
                          <div className="border-l-2 border-royal-gold pl-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-royal-gold">
                              What could make this the wrong choice
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {candidate.watchOut}
                            </p>
                          </div>
                          {(candidate.medicalRestriction === "MEDICAL_REVIEW" ||
                            candidate.marketStatus !== "AUCTION_REGISTERED") && (
                            <div className="flex items-start gap-2 rounded-lg bg-royal-gold/10 p-3 text-xs leading-5 text-foreground">
                              <ShieldAlert size={15} className="mt-0.5 shrink-0 text-royal-gold" />
                              <span>
                                {candidate.medicalNote
                                  ? `${candidate.medicalNote} `
                                  : "Registration and availability remain unverified."}
                                {isPathirana
                                  ? " The dashboard does not infer current fitness; verify with a current independent medical assessment."
                                  : " Release does not establish auction registration."}
                              </span>
                            </div>
                          )}
                          {isNehal && (
                            <div className="mt-3 rounded-xl border border-royal-pink/25 bg-royal-pink/5 p-3.5 text-xs leading-5">
                              <p className="font-bold uppercase tracking-wider text-royal-pink">
                                Target match situation · Middle-order recovery
                              </p>
                              <p className="mt-1 text-foreground font-medium">
                                Scenario: 20/3 in the powerplay / early middle overs
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Tactical role:</strong> Enters at No.5 to absorb swing/spin
                                pressure, rotate strike with Jurel/Parag, and rebuild the platform
                                before counterattacking. Protects the lower-order finishers
                                (Ferreira, Dubey) from premature exposure.
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>XI / Impact application:</strong> Starts in flexible spot
                                No.5 or acts as incoming Impact Player if top order collapses
                                batting first or chasing.
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Trade-off:</strong> Displaces Dubey or a specialist bowling
                                floater; small pressure sample (59 gated balls).
                              </p>
                            </div>
                          )}
                          {isMitch && (
                            <div className="mt-3 rounded-xl border border-royal-gold/25 bg-royal-gold/5 p-3.5 text-xs leading-5">
                              <p className="font-bold uppercase tracking-wider text-royal-gold">
                                Target match situation · Late-innings acceleration
                              </p>
                              <p className="mt-1 text-foreground font-medium">
                                Scenario: 180/5 with 5 overs remaining (overs 16–20 finish)
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Tactical role:</strong> High-explosiveness boundary hitter
                                for positions 6–8. Maximises death-phase boundary conversion
                                alongside Ferreira and Dubey without requiring top-order anchor
                                responsibilities.
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>XI / Impact application:</strong> Nominated as incoming
                                batting Impact Player for an early bowler in first-innings death
                                phase or high-chase target scenarios.
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Trade-off:</strong> Consumes an overseas slot (max 4 in XI);
                                unverified in IPL pressure matches.
                              </p>
                            </div>
                          )}
                          {isPathirana && (
                            <div className="mt-3 rounded-xl border border-destructive/25 bg-destructive/5 p-3.5 text-xs leading-5">
                              <p className="font-bold uppercase tracking-wider text-destructive">
                                Target match situation · Specialist pace insurance & death lock
                              </p>
                              <p className="mt-1 text-foreground font-medium">
                                Scenario: Defending 12–15 runs in overs 18 & 20 or covering pace
                                unavailability
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Tactical role:</strong> Sling-arm specialist closer offering
                                extreme trajectory and yorker execution. Provides high-end cover if
                                Burger is injured or track demands pure death containment over
                                powerplay swing.
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>XI / Impact application:</strong> Incoming bowling Impact
                                Player at over 14–16 for an outgoing specialist batter.
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Trade-off:</strong> Overseas slot cost; high
                                medical/availability risk (hamstring/calf/shoulder history).
                              </p>
                            </div>
                          )}
                          {isAvesh && (
                            <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3.5 text-xs leading-5">
                              <p className="font-bold uppercase tracking-wider text-foreground">
                                Target match situation · Workload & pace rotation
                              </p>
                              <p className="mt-1 text-foreground font-medium">
                                Scenario: Protecting Archer/Shami workloads or covering pace
                                unavailability
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Tactical role:</strong> Hard-length Indian enforcer for
                                middle overs (7–15) and backup rotation. Replaces workload strain
                                without expending an overseas slot.
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Core complement:</strong> Supports Shami and Burger; death
                                overs remain primary to Archer, Sandeep and Brijesh.
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Trade-off:</strong> Death wicket rate (6.74/100 legal balls)
                                is below the retained-core median (8.12); not a primary closer.
                              </p>
                            </div>
                          )}
                          {isAkash && (
                            <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3.5 text-xs leading-5">
                              <p className="font-bold uppercase tracking-wider text-foreground">
                                Target match situation · Indian seam rotation
                              </p>
                              <p className="mt-1 text-foreground font-medium">
                                Scenario: Ground-specific skidding pace / seam rotation
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Tactical role:</strong> Indian pace backup. Small sample and
                                2025 economy require cautious review.
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Trade-off:</strong> Inconsistent phase exports; backup
                                insurance rather than guaranteed XI starter.
                              </p>
                            </div>
                          )}
                          {isNitish && (
                            <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3.5 text-xs leading-5">
                              <p className="font-bold uppercase tracking-wider text-foreground">
                                Target match situation · Spin matchup & innings repair
                              </p>
                              <p className="mt-1 text-foreground font-medium">
                                Scenario: Middle-overs spin squeeze (overs 7–14)
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Tactical role:</strong> Established Indian left-handed
                                No.4/5 anchor with strong boundary game against spin.
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <strong>Trade-off:</strong> Natural position is upper-middle order
                                rather than a specialist No.6/7 death finisher.
                              </p>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <section
            className="mt-14 rounded-2xl border border-royal-gold/30 bg-royal-gold/5 p-5 sm:p-7"
            aria-label="Auction market readiness notice"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 shrink-0 text-royal-gold" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-gold">
                  Candidate-pool boundary · checked 22 November 2026
                </p>
                <h2 className="display-face mt-1 text-2xl text-foreground">
                  Released-player research pool — not the final registered auction pool.
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This analysis uses only the released-player names present in the supplied 18
                  November dataset. It does not include new auction registrations submitted during
                  the still-open registration window. Of the {allCandidates.length} researched
                  profiles, {candidateMarketSummary.registered} are confirmed registered,{" "}
                  {candidateMarketSummary.releasedUnverified} are marked released with registration
                  unverified, and {candidateMarketSummary.unresolved} have unresolved market status.
                  Release does not prove registration or final auction eligibility. The reported
                  registration close is 23 November, with additional-player requests through 27
                  November and the final list expected on 3 December.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-gold">
                  Complete recruitment register
                </p>
                <h2 className="display-face mt-1 text-3xl text-foreground">
                  Inspect all 20 researched profiles.
                </h2>
                <p className="mt-1 text-sm font-medium text-foreground">
                  These are research targets, not a confirmed auction list.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The three workstreams above are the leading decision cases, not the full research
                  pool. This directory keeps every supplied batter and bowler candidate visible for
                  challenge, comparison and follow-up. A board priority is not a statistical
                  forecast or proof of auction registration.
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
                {filteredCandidates.length} / {allCandidates.length} profiles
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
              <label className="relative block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-royal-pink"
                  value={directorySearch}
                  onChange={(event) => setDirectorySearch(event.target.value)}
                  placeholder="Search player, role, nationality or market status"
                  aria-label="Search recruitment candidates"
                />
              </label>
              <select
                className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-royal-pink"
                value={directoryDiscipline}
                onChange={(event) =>
                  setDirectoryDiscipline(event.target.value as "ALL" | "BATTER" | "BOWLER")
                }
                aria-label="Filter recruitment discipline"
              >
                <option value="ALL">All roles · batters & bowlers</option>
                <option value="BATTER">Batters only</option>
                <option value="BOWLER">Bowlers only</option>
              </select>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {filteredCandidates.map((candidate) => (
                <CandidateDirectoryCard
                  key={candidate.id}
                  candidate={candidate}
                  allCandidates={allCandidates}
                />
              ))}
              {filteredCandidates.length === 0 && (
                <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground lg:col-span-2">
                  No candidate matches that search. Clear the search or change the discipline
                  filter.
                </p>
              )}
            </div>
            <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
              Market status reflects the supplied 18 November 2026 snapshot. “Released ·
              registration unverified” permits hypothetical scenario discussion only; it must not be
              interpreted as proof of registration. Medical-review profiles require a separate
              analyst assumption for simulation, which is not official clearance. Where a pressure
              residual is supplied, positive batter values are favourable; for bowlers,
              more-negative values indicate runs saved relative to context. Exposure and uncertainty
              must be read alongside every value.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[.18em] text-royal-gold">
                    Supplied release-list reference
                  </span>
                  <span className="display-face mt-1 block text-2xl text-foreground">
                    Browse the 89-name release register.
                  </span>
                  <span className="mt-1 block max-w-3xl text-sm leading-6 text-muted-foreground">
                    This is a separate market-reference list from the 20-player RR recruitment
                    shortlist. Names are not automatically selectable targets, and release does not
                    establish auction registration.
                  </span>
                </span>
                <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
                  {filteredReleaseReferences.length} / {releasedReferenceRows.length} names
                </span>
              </summary>
              <div className="mt-5 rounded-xl border border-royal-gold/25 bg-royal-gold/5 p-3 text-xs leading-5 text-muted-foreground">
                Source: user-supplied release-list document, snapshot dated 18 November 2026. The
                register contains 86 released / registration-unverified entries, one
                workload-availability-unconfirmed entry, one reported medical-unavailable entry and
                one retired-player / mentor entry. The source does not verify auction registration
                for these names. Salary figures are intentionally omitted because the supplied PDF
                does not specify their unit consistently.
              </div>
              <label className="relative mt-4 block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-royal-pink"
                  value={referenceSearch}
                  onChange={(event) => setReferenceSearch(event.target.value)}
                  placeholder="Search player, released-from franchise or status"
                  aria-label="Search the 89-name release reference"
                />
              </label>
              <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[720px] border-collapse text-left text-xs">
                  <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-3 font-bold">Player</th>
                      <th className="px-3 py-3 font-bold">Released from</th>
                      <th className="px-3 py-3 font-bold">Reference status</th>
                      <th className="px-3 py-3 font-bold">Registration</th>
                      <th className="px-3 py-3 font-bold">As of</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReleaseReferences.map((row) => {
                      const tone = releaseStatusTone(row.availability_status);
                      const toneClass =
                        tone === "danger"
                          ? "bg-destructive/10 text-destructive"
                          : tone === "neutral"
                            ? "bg-secondary text-muted-foreground"
                            : "bg-royal-gold/10 text-royal-gold";
                      return (
                        <tr
                          key={`${row.player_name}-${row.released_from_franchise}`}
                          className="align-top"
                        >
                          <td className="px-3 py-3 font-semibold text-foreground">
                            {row.player_name}
                            <details className="mt-1">
                              <summary className="cursor-pointer text-[10px] font-normal text-muted-foreground">
                                Source note
                              </summary>
                              <p className="mt-1 max-w-sm text-[10px] leading-4 text-muted-foreground">
                                {row.note}
                              </p>
                            </details>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {row.released_from_franchise}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "inline-flex max-w-[240px] rounded-full px-2 py-1 text-[10px] font-semibold leading-4",
                                toneClass,
                              )}
                            >
                              {releaseStatusLabel(row.availability_status)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {row.auction_registration_verified.toLowerCase() === "true"
                              ? "Verified"
                              : "Not verified"}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                            {row.status_as_of}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredReleaseReferences.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                          No reference names match this search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </details>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-secondary/35 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <Wind className="text-royal-pink" />
              <p className="text-xs font-bold uppercase tracking-[.18em] text-royal-pink">
                The final test
              </p>
            </div>
            <h2 className="display-face mt-2 text-3xl text-foreground">
              A recruit must change the combination—not just the name on the shortlist.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Review candidates against RR’s retained squad and six open roster places. The engine
              identifies role gaps without claiming an empty role, keeps recruitment opportunities
              open in the XI, and checks tactical Impact Player applications for specific match
              states.
            </p>
            <Button
              asChild
              className="mt-6 rounded-full bg-royal-pink px-5 text-white hover:bg-royal-pink/90"
            >
              <Link to="/squad">
                Test recruitment in the XI Lab <ArrowRight size={15} />
              </Link>
            </Button>
          </section>
        </section>
      </main>
    </PageFrame>
  );
}
