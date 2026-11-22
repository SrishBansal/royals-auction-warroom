import { BookOpen, Database, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { PageFrame } from "@/components/war-room";
import { warRoomData } from "@/data/war-room";
import pressure from "@/data/pressure-rankings.json";
import spatial from "@/data/spatial/spatial-model-pilot.json";
import historical from "@/data/historical-impact-model.json";

type SourceRow = {
  name: string;
  url?: string | null;
  supports: string;
  publisher?: string;
  date?: string;
  local_file?: string;
};
const sources = warRoomData.sources as SourceRow[];

function SourceCard({ source, index }: { source: SourceRow; index: number }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-royal-gold">
            Source {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-1 text-sm font-semibold leading-5 text-foreground">{source.name}</h3>
        </div>
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${source.name}`}
            className="rounded-lg border border-border p-2 text-royal-pink hover:bg-secondary"
          >
            <ExternalLink size={15} />
          </a>
        ) : (
          <FileText size={16} className="shrink-0 text-muted-foreground" />
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{source.supports}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        {source.publisher && (
          <span className="rounded-full bg-secondary px-2.5 py-1">{source.publisher}</span>
        )}
        {source.date && (
          <span className="rounded-full bg-secondary px-2.5 py-1">{source.date}</span>
        )}
        {source.local_file && (
          <span className="rounded-full bg-royal-gold/10 px-2.5 py-1 text-royal-gold">
            Provided file: {source.local_file}
          </span>
        )}
        {!source.url && !source.local_file && (
          <span className="rounded-full bg-secondary px-2.5 py-1">Local source record</span>
        )}
      </div>
    </article>
  );
}

function ProvenanceCard({
  title,
  scope,
  facts,
  caveat,
}: {
  title: string;
  scope: string;
  facts: string[];
  caveat: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-royal-pink">
        Model provenance
      </p>
      <h3 className="display-face mt-2 text-2xl text-foreground">{title}</h3>
      <p className="mt-2 text-xs font-semibold text-royal-gold">{scope}</p>
      <ul className="mt-4 space-y-2">
        {facts.map((fact) => (
          <li key={fact} className="flex gap-2 text-xs leading-5 text-muted-foreground">
            <span className="text-royal-pink">•</span>
            {fact}
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
        {caveat}
      </p>
    </article>
  );
}

export function SourcesPage() {
  const ordered = [...sources].sort((a, b) => a.name.localeCompare(b.name));
  const pressureStability = pressure.splitHalfReliability as {
    batterSpearman?: number;
    bowlerSpearman?: number;
    batterPlayersCompared?: number;
    bowlerPlayersCompared?: number;
  };
  const historicalMeta = historical.meta as {
    data_window: string;
    usable_ipl_matches: number;
    ipl_delivery_rows: number;
    ipl_legal_deliveries: number;
    venue_feature_decision: string;
    limitations: string[];
  };
  return (
    <PageFrame>
      <main className="pb-16">
        <section className="border-b border-border bg-[linear-gradient(120deg,rgba(30,20,46,.98),rgba(65,18,55,.95))] px-5 py-10 text-white sm:px-8 sm:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-center gap-3">
              <BookOpen className="text-royal-gold" />
              <span className="text-xs font-bold uppercase tracking-[.2em] text-royal-gold">
                Sources & methods
              </span>
            </div>
            <h1 className="display-face max-w-5xl text-5xl leading-[.96] sm:text-7xl">
              Every decision should have a trail.
              <br />
              <span className="text-royal-pink">Every model should have limits.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
              The source register behind the squad snapshot, season and playoff review, recruitment
              profiles and model experiments. Use this page to see what each source supports—and
              what it does not establish.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/75">
              <span className="rounded-full border border-white/15 px-3 py-1.5">
                {sources.length} registered sources
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1.5">
                Data snapshot · IPL 2022–2026 + 2027 squad
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1.5">
                Static research snapshot · not live feeds
              </span>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="mb-6 flex items-center gap-3">
            <ShieldCheck className="text-royal-gold" />
            <div>
              <h2 className="display-face text-3xl text-foreground">
                Model provenance & validation boundaries
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Read these before using a model output in a cricket decision.
              </p>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <ProvenanceCard
              title="IPL Pressure Rankings"
              scope="IPL only · 2022–2026 · experimental"
              facts={[
                `${pressure.matches} delivery-bearing matches from ${pressure.scheduledMatchRecords} scheduled records; ${pressure.matchesWithoutDeliveryData} have no delivery rows.`,
                `${pressure.rawDeliveries.toLocaleString("en-IN")} raw deliveries; ${pressure.pressureLegalDeliveries.toLocaleString("en-IN")} pressure legal deliveries.`,
                `Split-half Spearman stability: batter ${Number(pressureStability.batterSpearman ?? 0).toFixed(3)}, bowler ${Number(pressureStability.bowlerSpearman ?? 0).toFixed(3)}.`,
                "Required run rate, score margin, official economy and player-vs-bowler effects are excluded.",
              ]}
              caveat="Ranking order is highly unstable in the supplied split-half test. Use as a transparent exploratory shortlist, not a dependable measure of who is best under pressure."
            />
            <ProvenanceCard
              title="Kadamba 25-zone model"
              scope="Third-party historical tracking · experimental"
              facts={[
                `${spatial.raw_rows.toLocaleString("en-IN")} raw delivery rows; ${spatial.pitch_valid_legal_main_rows.toLocaleString("en-IN")} legal main-innings deliveries with usable pitch coordinates.`,
                `${spatial.unique_matches} raw match IDs; ${spatial.pitch_valid_legal_main_matches} matches in the modelling sample; all ${spatial.zones_25} zones populated.`,
                `Batter-run MAE: ${spatial.regression_grouped_oof_3fold.context_only.mae.toFixed(3)} context-only vs ${spatial.regression_grouped_oof_3fold.context_plus_location.mae.toFixed(3)} context + location.`,
                `Wicket AP: ${spatial.bowler_wicket_grouped_oof_3fold.context_only.average_precision.toFixed(4)} vs ${spatial.bowler_wicket_grouped_oof_3fold.context_plus_location.average_precision.toFixed(4)}.`,
              ]}
              caveat="No player/team/season join to RR's five-season record, no chronological holdout, and no wicket-probability calibration. Use to generate video-review questions, not prescribe a zone to bowl at a named batter."
            />
            <ProvenanceCard
              title="Player / phase evidence"
              scope={historicalMeta.data_window}
              facts={[
                `${historicalMeta.usable_ipl_matches} usable matches; ${historicalMeta.ipl_delivery_rows.toLocaleString("en-IN")} delivery rows; ${historicalMeta.ipl_legal_deliveries.toLocaleString("en-IN")} legal deliveries.`,
                "Player comparisons use match-held-out predictions and sample shrinkage.",
                "Venue IDs are excluded from production residual prediction.",
                "Venue joins are analyst-curated where the source has no ground-name dimension.",
              ]}
              caveat={historicalMeta.venue_feature_decision}
            />
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Database className="text-royal-gold" />
            <div>
              <h2 className="display-face text-3xl text-foreground">Source register</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                All records from the supplied RR 2027 source register. External links open the
                original publication; local files are identified by filename.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {ordered.map((source, index) => (
              <SourceCard key={`${source.name}-${index}`} source={source} index={index} />
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="rounded-2xl border border-royal-gold/25 bg-royal-gold/5 p-5">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-royal-gold">
              Interpretation rule
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              A source can support a score, event, player role or published rule without proving a
              recruitment recommendation. The dashboard separates observed facts, analyst
              interpretation and engine-generated scenarios. Auction registration, match-day
              nomination, medical clearance and official playing conditions must be verified
              separately before operational use.
            </p>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
