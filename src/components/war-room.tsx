import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Circle,
  Crown,
  ExternalLink,
  Shield,
  Sparkles,
  Swords,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  navigation,
  warRoomData,
  type RetainedPlayer,
  type WatchlistPlayer,
} from "@/data/war-room";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteNavigation() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7">
        <Link
          to="/"
          aria-label="Royals War Room home"
          className="flex shrink-0 items-center gap-3 text-foreground"
        >
          <span className="grid size-9 place-items-center border border-royal-gold/60 text-royal-gold">
            <Shield size={18} strokeWidth={1.5} />
          </span>
          <span className="hidden leading-none sm:block">
            <b className="display-face block text-base tracking-wide">Royals War Room</b>
            <small className="mt-1 block text-[9px] uppercase tracking-[.16em] text-muted-foreground">
              IPL 2027 · Jaipur
            </small>
          </span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex min-w-0 flex-1 items-center justify-start gap-1 overflow-x-auto py-2"
        >
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={pathname === item.to ? "page" : undefined}
              className={cn(
                "whitespace-nowrap px-2.5 py-2 text-[11px] font-semibold uppercase transition-colors hover:text-royal-pink sm:px-3 sm:text-xs",
                pathname === item.to
                  ? "border-b-2 border-royal-pink text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="hidden shrink-0 items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground xl:flex">
          <i className="size-2 rounded-full bg-royal-gold" /> Snapshot 18 Nov 2026
        </span>
      </div>
    </header>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="war-room">
      <SiteNavigation />
      {children}
      <footer className="border-t border-border px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span className="display-face text-sm tracking-wider text-foreground">
            Royals War Room <span className="text-royal-pink">/</span> IPL 2027
          </span>
          <span>Fan-built decision support · Data snapshot: 18 November 2026</span>
        </div>
      </footer>
    </div>
  );
}

export function SectionTitle({
  kicker,
  title,
  description,
  number,
}: {
  kicker: string;
  title: string;
  description?: string;
  number?: string;
}) {
  return (
    <div className="mb-8 flex items-start gap-4 sm:mb-10">
      <span className="hidden pt-1 font-mono text-xs text-royal-gold sm:block">
        {number ?? "//"}
      </span>
      <div className="max-w-4xl">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-royal-pink">
          {kicker}
        </p>
        <h1 className="display-face text-4xl leading-[.98] text-foreground sm:text-6xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function Subhead({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-3">
      <h2 className="display-face text-2xl text-foreground sm:text-3xl">{children}</h2>
      {trailing}
    </div>
  );
}

export function Metric({
  value,
  label,
  accent = false,
}: {
  value: ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="border-l border-border pl-4">
      <b
        className={cn(
          "display-face block text-3xl leading-none sm:text-4xl",
          accent ? "text-royal-gold" : "text-foreground",
        )}
      >
        {value}
      </b>
      <span className="mt-2 block text-[10px] uppercase tracking-[.12em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function PlayerTile({
  player,
  marker = "RETAINED",
  compact = false,
}: {
  player: RetainedPlayer;
  marker?: string;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "data-card relative min-w-0 border-l-2 border-l-royal-pink p-3",
        compact ? "min-h-24" : "min-h-28",
      )}
    >
      <span className="absolute right-2 top-2 text-[8px] font-semibold uppercase tracking-wider text-royal-gold">
        {marker}
      </span>
      <div className="mb-2 grid size-8 place-items-center border border-border bg-background/60 font-display text-sm text-royal-pink">
        {player.name
          .split(/[\s-]/)
          .map((part) => part[0])
          .slice(0, 2)
          .join("")}
      </div>
      <h3 className="pr-10 text-sm font-bold leading-tight text-foreground">{player.name}</h3>
      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{player.role}</p>
      <span className="mt-2 inline-block text-[9px] uppercase tracking-wider text-muted-foreground">
        {player.overseas ? `OS · ${player.nationality}` : "IND · India"} · Locked
      </span>
    </article>
  );
}

export function VacancyBays({
  compact = false,
  selectedPlayers = [],
}: {
  compact?: boolean;
  selectedPlayers?: string[];
}) {
  const labels = [
    "Indian middle-order cover",
    "Indian pace depth",
    "Indian utility / development",
    "Overseas strike / death pace",
    "Overseas powerplay / phase option",
    "Best available role fit",
  ];
  const assigned = new Map<number, string>();
  for (const name of selectedPlayers) {
    const player = warRoomData.auction_watchlist.find((candidate) => candidate.name === name);
    if (!player) continue;
    const slot =
      name === "Nehal Wadhera"
        ? 0
        : ["Mangesh Yadav", "Onkar Tarmale", "Akash Madhwal"].includes(name)
          ? 1
          : name === "Vihaan Malhotra"
            ? 2
            : ["Matheesha Pathirana", "Mustafizur Rahman"].includes(name)
              ? 3
              : name === "Trent Boult"
                ? 4
                : 5;
    if (!assigned.has(slot)) assigned.set(slot, name);
  }
  return (
    <div
      className={cn(
        "grid gap-3",
        compact ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {labels.map((label, i) => {
        const name = assigned.get(i);
        return (
          <div
            key={label}
            className={cn(
              "roster-slot flex min-h-24 items-center gap-4 p-4",
              compact && "min-h-20 p-3",
            )}
          >
            <span className="display-face text-3xl text-royal-pink/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <span className="block text-[9px] uppercase tracking-[.15em] text-royal-pink">
                {name ? "Target scenario · unverified" : "Vacant roster bay"}
              </span>
              <span className="mt-1 block text-xs font-semibold leading-4 text-foreground sm:text-sm">
                {name ?? label}
              </span>
              {name && (
                <span className="mt-1 block text-[9px] text-muted-foreground">
                  {label} · selection not confirmed
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TargetStatus({ player }: { player: WatchlistPlayer }) {
  if (player.name === "Jacob Bethell")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-destructive">
        <Circle size={10} /> Unavailable · IPL 2027
      </span>
    );
  if (player.name === "Mitchell Starc")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-royal-gold">
        <Circle size={10} /> Availability unconfirmed
      </span>
    );
  if (player.name === "Matheesha Pathirana")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-royal-gold">
        <Circle size={10} /> Medical clearance gate
      </span>
    );
  if (player.name === "Wanindu Hasaranga")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-royal-gold">
        <Circle size={10} /> Medical / workload review
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
      <Circle size={10} /> Released · registration unverified
    </span>
  );
}

export function PageIntro({ path }: { path: string }) {
  const item = navigation.find((entry) => entry.to === path);
  return (
    <div className="border-b border-border bg-royal-blue/20 px-5 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-[10px] uppercase tracking-[.14em] text-muted-foreground">
        <span>
          {item?.label ?? "Analysis"} <span className="text-royal-pink">/</span> RR 2027 decision
          support
        </span>
        <span className="flex items-center gap-1">
          <Sparkles size={11} className="text-royal-gold" /> HORSES FOR COURSES
        </span>
      </div>
    </div>
  );
}

export function LeadIn({
  kicker,
  title,
  description,
  path,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  path: string;
  children?: ReactNode;
}) {
  return (
    <>
      <PageIntro path={path} />
      <section className="px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16">
        <div className="mx-auto max-w-7xl">
          <SectionTitle kicker={kicker} title={title} description={description} />
          {children}
          <div className="section-rule mt-10" />
        </div>
      </section>
    </>
  );
}

export function SourceLink({
  href,
  children,
}: {
  href: string | null | undefined;
  children: ReactNode;
}) {
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-royal-gold underline decoration-royal-gold/40 underline-offset-2 hover:text-royal-pink"
    >
      {children}
      <ExternalLink size={12} />
    </a>
  ) : (
    <span className="text-muted-foreground">{children}</span>
  );
}

export function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase tracking-wider text-muted-foreground">
      <span>
        <Check size={11} className="mr-1 inline text-royal-gold" />
        Retained & locked
      </span>
      <span>
        <Circle size={11} className="mr-1 inline text-royal-pink" />
        Vacant role hypothesis
      </span>
      <span>
        <Swords size={11} className="mr-1 inline" />
        Target · unverified
      </span>
      <span>
        <ArrowUpRight size={11} className="mr-1 inline" />
        Working-core assumption
      </span>
    </div>
  );
}

export function HeroCTA() {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button
        asChild
        size="lg"
        className="rounded-sm bg-primary px-6 font-bold uppercase tracking-wider text-primary-foreground"
      >
        <Link to="/squad">
          Enter the war room <ArrowRight size={16} />
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="rounded-sm border-foreground/40 px-6 font-bold uppercase tracking-wider"
      >
        <Link to="/squad">
          View the working XI <ArrowDown size={15} />
        </Link>
      </Button>
    </div>
  );
}

export function teamSnapshot() {
  return warRoomData.team;
}
