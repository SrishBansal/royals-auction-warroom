import source from "./rr-2027-data.json";

export const warRoomData = source;
export type WarRoomData = typeof warRoomData;
export type RetainedPlayer = WarRoomData["team"]["retained_players"][number];

export const navigation = [
  { to: "/", label: "War room" },
  { to: "/squad", label: "Squad & XI builder" },
  { to: "/knockouts", label: "Playoff evidence" },
  { to: "/targets", label: "Recruitment board" },
  { to: "/match-lab", label: "Impact Player lab" },
  { to: "/spatial-lab", label: "Kadamba zones" },
  { to: "/pressure-rankings", label: "IPL pressure ranks" },
  { to: "/sources", label: "Sources & methods" },
] as const;

export const vacantSlots = [
  "Indian middle-order cover",
  "Indian pace depth",
  "Indian multi-skill depth",
  "Overseas batting option",
  "Overseas pace / phase option",
  "Best available role fit",
] as const;
