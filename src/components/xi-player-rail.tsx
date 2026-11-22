import type { DecisionPlayer } from "@/domain/rr-decision-engine";

export interface XIPlayerSlot {
  position: number;
  player: DecisionPlayer;
}

interface XIPlayerRailProps {
  players: XIPlayerSlot[];
  title?: string;
  note?: string;
}

/** Eleven starters only. The Impact Player is a separate match-state substitution. */
export function XIPlayerRail({
  players,
  title = "Starting XI",
  note = "Slot numbers are optimiser positions, not a fixed batting order. Positions 4–8 can float by match situation.",
}: XIPlayerRailProps) {
  const sorted = [...players].sort((a, b) => a.position - b.position);
  return (
    <section
      aria-label="Starting XI, eleven players"
      className="rounded-[22px] border border-royal-gold/25 bg-[linear-gradient(135deg,rgba(33,25,51,.96),rgba(22,32,54,.96))] p-4 shadow-[0_16px_50px_rgba(0,0,0,.12)] sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-royal-gold">
            Team selection
          </p>
          <h3 className="display-face mt-0.5 text-xl text-white">
            {title}{" "}
            <span className="font-sans text-sm font-semibold text-white/55">· 11 players</span>
          </h3>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/65">
          {sorted.length}/11 selected
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {sorted.map(({ position, player }) => {
          const isRecruitmentOpportunity = !player.isRetained;
          const isFlexBatting = player.isRetained && (position === 5 || position === 6);
          const isFinishOpportunity = player.isRetained && (position === 7 || position === 8);
          const isBowlingSlot = player.isRetained && position >= 9;

          return (
            <div
              key={`${position}-${player.name}`}
              className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 transition-colors ${
                isRecruitmentOpportunity
                  ? "border-royal-gold/60 bg-royal-gold/10 ring-1 ring-royal-gold/30"
                  : isFlexBatting
                    ? "border-royal-pink/40 bg-royal-pink/5"
                    : isFinishOpportunity
                      ? "border-royal-gold/35 bg-royal-gold/5"
                      : "border-white/10 bg-white/[.045]"
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full border font-mono text-[10px] font-bold ${
                  isRecruitmentOpportunity
                    ? "border-royal-gold bg-royal-gold text-slate-950"
                    : isFlexBatting
                      ? "border-royal-pink/60 bg-royal-pink/20 text-royal-pink"
                      : "border-royal-gold/45 bg-[#29233a] text-royal-gold"
                }`}
              >
                {String(position).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-semibold text-white" title={player.name}>
                    {player.name}
                  </p>
                </div>
                <p
                  className="mt-0.5 truncate text-[10px] text-white/55"
                  title={player.primaryRole ?? player.role}
                >
                  {player.primaryRole ?? player.role}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span
                    className={`text-[8px] font-bold uppercase tracking-[.12em] ${
                      isRecruitmentOpportunity
                        ? "text-royal-gold"
                        : isFlexBatting
                          ? "text-royal-pink"
                          : "text-white/40"
                    }`}
                  >
                    {isRecruitmentOpportunity
                      ? "Target Opportunity"
                      : isFlexBatting
                        ? "No.5/6 Flex Window"
                        : isFinishOpportunity
                          ? "Lower-Order Finish"
                          : isBowlingSlot
                            ? "Specialist Bowling Slot"
                            : "Retained Core"}
                  </span>
                  <span className="text-[8px] text-white/30">·</span>
                  <span className="text-[8px] text-white/40">
                    {player.overseas ? "Overseas" : "Indian"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-5 text-white/55">
        {note}
      </p>
    </section>
  );
}
