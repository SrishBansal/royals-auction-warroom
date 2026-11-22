import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarClock, ExternalLink, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { navigation, warRoomData } from "@/data/war-room";
import { cn } from "@/lib/utils";

const OFFICIAL_RR_CREST_URL =
  "https://www.rajasthanroyals.com/static-assets/images/cssimages/static/rr-new.png?v=7.96";

/** Uses the club-hosted Royal Crest asset; the text lockup is only a network-failure fallback. */
export function OfficialRoyalsCrest({ compact = false }: { compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn(
        "rr-official-logo flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-royal-pink/20 shadow-sm",
        compact ? "h-11 w-[7.25rem] px-2" : "h-14 w-36 px-3",
      )}
      aria-label="Rajasthan Royals official Royal Crest"
    >
      {!failed ? (
        <img
          src={OFFICIAL_RR_CREST_URL}
          alt="Rajasthan Royals official Royal Crest"
          width={710}
          height={480}
          className="max-h-full max-w-full object-contain"
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-center text-[12px] font-extrabold leading-tight tracking-[.18em] text-white">
          RAJASTHAN
          <br />
          ROYALS
        </span>
      )}
    </span>
  );
}

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
          <OfficialRoyalsCrest compact />
          <span className="hidden leading-none sm:block">
            <b className="display-face block text-[15px] leading-[1.02] tracking-wide">
              Royals
              <br />
              War Room
            </b>
            <small className="mt-1 block text-[10px] uppercase tracking-[.16em] text-muted-foreground">
              RR 2027 · Decision engine
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
                "whitespace-nowrap px-2.5 py-2 text-[13px] font-semibold transition-colors hover:text-royal-gold sm:px-3 sm:text-xs",
                pathname === item.to
                  ? "border-b-2 border-royal-gold text-royal-gold"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="war-room">
      <SiteNavigation />
      <aside
        role="note"
        aria-label="Auction candidate-pool status"
        className="border-b border-royal-gold/25 bg-royal-gold/5"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-2.5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-2.5">
            <CalendarClock
              size={16}
              className="mt-0.5 shrink-0 text-royal-gold"
              aria-hidden="true"
            />
            <p className="text-[11px] leading-5 text-muted-foreground sm:text-xs">
              <strong className="font-bold text-foreground">
                CANDIDATE POOL · SNAPSHOT 22 NOV 2026:
              </strong>{" "}
              Recruitment and squad-fit analysis uses the released-player names in the supplied 18
              November dataset only. It does not include new auction registrations submitted during
              the still-open registration window, and it is not the final registered auction pool.
              The reported timeline is registration close 23 November, additional-player requests
              through 27 November, and final list to franchises on 3 December.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3 pl-[26px] text-[10px] font-semibold">
            <a
              href="https://www.moneycontrol.com/news/cricket/ipl/ipl-2027-bcci-extends-deadline-for-franchises-to-submit-player-retention-list-check-new-date-14066701.html"
              target="_blank"
              rel="noreferrer"
              className="text-royal-gold underline decoration-royal-gold/40 underline-offset-4 hover:text-royal-pink"
            >
              Registration timeline ↗
            </a>
            <a
              href="/sources"
              className="text-foreground underline decoration-border underline-offset-4 hover:text-royal-pink"
            >
              Sources & methods
            </a>
          </div>
        </div>
      </aside>
      {children}
      <footer className="border-t border-border px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span className="display-face text-sm tracking-wider text-foreground">
            Royals War Room <span className="text-royal-pink">/</span> IPL 2027
          </span>
          <span>Prepared by Srish Bansal · Rajasthan Royals auction analysis</span>
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
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[.2em] text-royal-pink">
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
      <span className="mt-2 block text-[12px] uppercase tracking-[.12em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function PageIntro({ path }: { path: string }) {
  const item = navigation.find((entry) => entry.to === path);
  return (
    <div className="border-b border-border bg-royal-blue/20 px-5 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-[12px] uppercase tracking-[.14em] text-muted-foreground">
        <span>
          {item?.label ?? "Analysis"} <span className="text-royal-pink">/</span> RR 2027 decision
          support
        </span>
        <span className="flex items-center gap-1">
          <Sparkles size={11} className="text-royal-gold" /> MATCH CONTEXT
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

export function teamSnapshot() {
  return warRoomData.team;
}
