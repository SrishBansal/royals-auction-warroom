import source from "./rr-2027-data.json";

export const warRoomData = source;
export type WarRoomData = typeof warRoomData;
export type RetainedPlayer = WarRoomData["team"]["retained_players"][number];
export type WatchlistPlayer = WarRoomData["auction_watchlist"][number];
export type BatterRank = WarRoomData["pressure_ranked_batters_top10"][number];
export type BowlerRank = WarRoomData["pressure_ranked_bowlers_top10"][number];
export type ReleasedPlayer = WarRoomData["released_player_reference"]["players"][number];

export const navigation = [
  { to: "/", label: "War room" },
  { to: "/squad", label: "Squad" },
  { to: "/targets", label: "Targets" },
  { to: "/knockouts", label: "Knockouts" },
  { to: "/methodology", label: "Data & sources" },
] as const;

export const vacantSlots = [
  "Indian middle-order cover",
  "Indian pace depth",
  "Indian utility / development",
  "Overseas strike / death pace",
  "Overseas powerplay / phase option",
  "Best available role fit",
] as const;
