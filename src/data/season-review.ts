/**
 * Rajasthan Royals five-season review (IPL 2022–2026).
 *
 * League-stage figures and post-season outcomes are deliberately kept in
 * separate fields. The official RR history page's summary table combines
 * knockout matches into Played/Won/Loss/NR for seasons marked with an asterisk;
 * those combined totals must not be compared as league-stage records.
 */
export const seasonReviewSource = {
  label: "Rajasthan Royals — IPL season history",
  url: "https://www.rajasthanroyals.com/latest-news/rajasthan-royals-indian-premier-league-results-win",
  published: "29 May 2026",
  note: "League positions and phase records are taken from the season-by-season narrative. Post-season routes are listed separately. The page's end table includes knockout matches for marked seasons.",
} as const;

export const seasonReview = [
  {
    season: 2022,
    league: { played: 14, won: 9, lost: 5, noResult: 0, points: 18, position: 2 },
    tournamentFinish: "Runner-up",
    postseason: {
      matches: 3,
      won: 1,
      lost: 2,
      route: "Qualifier 1 loss → Qualifier 2 win → Final loss",
    },
    headline: "Reached the final",
  },
  {
    season: 2023,
    league: { played: 14, won: 7, lost: 7, noResult: 0, points: 14, position: 5 },
    tournamentFinish: "5th",
    postseason: { matches: 0, won: 0, lost: 0, route: "Missed playoffs" },
    headline: "Just outside the top four",
  },
  {
    season: 2024,
    league: { played: 14, won: 8, lost: 5, noResult: 1, points: 17, position: 3 },
    tournamentFinish: "3rd",
    postseason: { matches: 2, won: 1, lost: 1, route: "Eliminator win → Qualifier 2 loss" },
    headline: "Won Eliminator; lost Qualifier 2",
  },
  {
    season: 2025,
    league: { played: 14, won: 4, lost: 10, noResult: 0, points: 8, position: 9 },
    tournamentFinish: "9th",
    postseason: { matches: 0, won: 0, lost: 0, route: "Missed playoffs" },
    headline: "Lowest finish in this window",
  },
  {
    season: 2026,
    league: { played: 14, won: 8, lost: 6, noResult: 0, points: 16, position: 4 },
    tournamentFinish: "3rd",
    postseason: { matches: 2, won: 1, lost: 1, route: "Eliminator win → Qualifier 2 loss" },
    headline: "4th in league; 3rd overall",
  },
] as const;

export const fiveSeasonTotals = seasonReview.reduce(
  (total, row) => ({
    leaguePlayed: total.leaguePlayed + row.league.played,
    leagueWins: total.leagueWins + row.league.won,
    leagueLosses: total.leagueLosses + row.league.lost,
    leagueNoResults: total.leagueNoResults + row.league.noResult,
    leaguePoints: total.leaguePoints + row.league.points,
    playoffMatches: total.playoffMatches + row.postseason.matches,
    playoffWins: total.playoffWins + row.postseason.won,
    playoffLosses: total.playoffLosses + row.postseason.lost,
    playoffCampaigns: total.playoffCampaigns + (row.postseason.matches > 0 ? 1 : 0),
  }),
  {
    leaguePlayed: 0,
    leagueWins: 0,
    leagueLosses: 0,
    leagueNoResults: 0,
    leaguePoints: 0,
    playoffMatches: 0,
    playoffWins: 0,
    playoffLosses: 0,
    playoffCampaigns: 0,
  },
);

export function formatLeagueRecord(row: (typeof seasonReview)[number]) {
  const { won, lost, noResult } = row.league;
  return noResult > 0 ? `${won}–${lost}–${noResult}` : `${won}–${lost}`;
}
