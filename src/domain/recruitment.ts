import { warRoomData } from "@/data/war-room";
import { type MarketStatus, type MedicalRestriction } from "./market-eligibility";

export type BattingRole =
  | "MIDDLE_ORDER_ANCHOR"
  | "LOWER_MIDDLE_ORDER_FINISHER"
  | "FLOATER"
  | "WICKETKEEPER_BATTER"
  | "OVERSEAS_POWER_HITTER"
  | "BATTING_ALL_ROUNDER"
  | "DEVELOPMENTAL_BATTER";

export type BowlingRole =
  | "DEATH_SPECIALIST"
  | "POWERPLAY_SPECIALIST"
  | "PACE_ENFORCER"
  | "VARIATION_SPECIALIST"
  | "INDIAN_PACE_DEPTH"
  | "NEW_BALL_PACE"
  | "EXPRESS_PACE"
  | "SPIN_MATCHUP";

export type PressureStatus =
  "ELIGIBLE_P1_ARCHIVE" | "PROVISIONAL_LOW_SAMPLE" | "P1_NOT_AVAILABLE_IN_ARCHIVE";

export interface PressureEvidence {
  status: PressureStatus;
  p1Rank?: number | undefined;
  postMeanPer100?: number | undefined;
  lo90Per100?: number | undefined;
  hi90Per100?: number | undefined;
  pTop10?: number | undefined;
  rankLo5?: number | undefined;
  rankHi95?: number | undefined;
  tier?: string | undefined;
  gatedBalls?: number | undefined;
  gatedMatches?: number | undefined;
  iplShareOfGated?: number | undefined;
  exposureNote: string;
  scoutingMetrics?: Record<string, string | number> | undefined;
}

export interface RecruitmentCandidate {
  id: string;
  name: string;
  rank: number;
  discipline: "BATTER" | "BOWLER";
  primaryRole: BattingRole | BowlingRole;
  secondaryRole?: BattingRole | BowlingRole | undefined;
  nationality: "Indian" | "Overseas";
  country: string;
  battingHand?: "Left" | "Right" | undefined;
  bowlingStyle?: string | undefined;
  teamReleasedFrom?: string | undefined;
  marketStatus: MarketStatus;
  marketStatusLabel: string;
  medicalRestriction: MedicalRestriction;
  medicalNote?: string | undefined;
  whyRR: string;
  roleFit: string;
  pressureEvidence: PressureEvidence;
  upgradeOverSquad: string;
  watchOut: string;
  tacticalRolesSupported: string[];
  isProvisional: boolean;
}

export interface BenchmarkExclusion {
  name: string;
  globalP1Rank: number;
  discipline: "BATTER" | "BOWLER";
  currentFranchiseOrStatus: string;
  exclusionReason: string;
  pressureScorePer100: number;
}

export interface MiddleOrderTacticalVariation {
  id: string;
  title: string;
  context: string;
  battingOrderSlots4to8: Array<{
    slotNumber: number;
    player: string;
    role: string;
    matchupRationale: string;
  }>;
  keyTacticalAdvantage: string;
  tradeOff: string;
}

export interface ImpactPlayerScenarioRecommendation {
  id: string;
  scenarioName: string;
  matchContext: string;
  recommendedPlayer: string;
  playerRole: string;
  substitutedStartingPlayer: string;
  whyThisSubstitution: string;
  battingBenefit: string;
  bowlingBenefit: string;
  overseasCountInXI: number;
  squadEligibility: string;
  medicalRestrictions: string;
  mainDownside: string;
}

export interface TacticalScenarioLineup {
  id: string;
  name: string;
  title: string;
  purpose: string;
  startingXI: string[];
  overseasCount: number;
  paceOptionsCount: number;
  spinOptionsCount: number;
  deathOversSpecialists: string[];
  roleCoverageSummary: {
    wicketkeepers: string[];
    topOrder: string[];
    middleOrder: string[];
    finishers: string[];
    spinners: string[];
    seamers: string[];
  };
  benchDisplacement: {
    displacedRetained: string[];
    startingRetainedCount: number;
    startingAdditionsCount: number;
  };
  impactPlayerAlternatives: string[];
  actualVsHypothetical: {
    retainedCount: number;
    hypotheticalAdditions: string[];
  };
}

/**
 * ============================================================================
 * PART 1 & 5: GLOBAL P1 BENCHMARK EXCLUSIONS
 * Demonstrates why global P1 leaders CANNOT occupy RR auction recruitment spots.
 * ============================================================================
 */
export const BENCHMARK_EXCLUSIONS: BenchmarkExclusion[] = [
  {
    name: "Jasprit Bumrah",
    globalP1Rank: 1,
    discipline: "BOWLER",
    currentFranchiseOrStatus: "Mumbai Indians (Retained)",
    exclusionReason:
      "Retained by MI for IPL 2027; legally unavailable and not in the auction market.",
    pressureScorePer100: -19.32,
  },
  {
    name: "Yashasvi Jaiswal",
    globalP1Rank: 2,
    discipline: "BATTER",
    currentFranchiseOrStatus: "Rajasthan Royals (Retained)",
    exclusionReason:
      "Already retained by Rajasthan Royals; core locked asset, cannot be re-acquired at auction.",
    pressureScorePer100: +26.68,
  },
  {
    name: "Tim David",
    globalP1Rank: 1,
    discipline: "BATTER",
    currentFranchiseOrStatus: "Royal Challengers Bengaluru (Retained)",
    exclusionReason: "Retained by RCB for IPL 2027; cannot be recruited at auction.",
    pressureScorePer100: +27.97,
  },
  {
    name: "Abhishek Sharma",
    globalP1Rank: 3,
    discipline: "BATTER",
    currentFranchiseOrStatus: "Sunrisers Hyderabad (Retained)",
    exclusionReason:
      "Retained by SRH; not in auction pool. Status unresolved in historical benchmark.",
    pressureScorePer100: +23.94,
  },
  {
    name: "Suryakumar Yadav",
    globalP1Rank: 4,
    discipline: "BATTER",
    currentFranchiseOrStatus: "Mumbai Indians (Retained)",
    exclusionReason: "Retained by MI; contractually locked, unavailable for auction recruitment.",
    pressureScorePer100: +23.67,
  },
  {
    name: "Nicholas Pooran",
    globalP1Rank: 5,
    discipline: "BATTER",
    currentFranchiseOrStatus: "Lucknow Super Giants (Retained)",
    exclusionReason: "Retained by LSG for ₹21 Cr; unavailable for auction recruitment.",
    pressureScorePer100: +17.97,
  },
  {
    name: "Phil Salt",
    globalP1Rank: 6,
    discipline: "BATTER",
    currentFranchiseOrStatus: "Royal Challengers Bengaluru (Retained)",
    exclusionReason: "Retained by RCB; contractually unavailable for auction acquisition.",
    pressureScorePer100: +17.38,
  },
  {
    name: "Haris Rauf",
    globalP1Rank: 3,
    discipline: "BOWLER",
    currentFranchiseOrStatus: "Unresolved / T20I Only",
    exclusionReason:
      "0% IPL share in pressure sample; Pakistan national player not participating in IPL auction.",
    pressureScorePer100: -10.62,
  },
  {
    name: "Sunil Narine",
    globalP1Rank: 6,
    discipline: "BOWLER",
    currentFranchiseOrStatus: "Kolkata Knight Riders (Retained)",
    exclusionReason: "Retained by KKR; contractually locked, unavailable for auction recruitment.",
    pressureScorePer100: -7.25,
  },
  {
    name: "Lungi Ngidi",
    globalP1Rank: 7,
    discipline: "BOWLER",
    currentFranchiseOrStatus: "Delhi Capitals (Retained)",
    exclusionReason: "Retained by DC; contractually unavailable for auction acquisition.",
    pressureScorePer100: -7.03,
  },
  {
    name: "Bhuvneshwar Kumar",
    globalP1Rank: 9,
    discipline: "BOWLER",
    currentFranchiseOrStatus: "Royal Challengers Bengaluru (Retained)",
    exclusionReason: "Retained by RCB; contractually unavailable for auction acquisition.",
    pressureScorePer100: -6.78,
  },
  {
    name: "Shaheen Afridi",
    globalP1Rank: 10,
    discipline: "BOWLER",
    currentFranchiseOrStatus: "Unresolved / T20I Only",
    exclusionReason: "0% IPL share in pressure sample; non-participant in IPL auction.",
    pressureScorePer100: -5.97,
  },
  {
    name: "Jacob Bethell",
    globalP1Rank: 999,
    discipline: "BATTER",
    currentFranchiseOrStatus: "Royal Challengers Bengaluru (Released)",
    exclusionReason:
      "Confirmed unavailable for IPL 2027 following right-knee surgery setback (ICC/RCB bulletins). Hard exclusion.",
    pressureScorePer100: 0,
  },
  {
    name: "Mitchell Starc",
    globalP1Rank: 999,
    discipline: "BOWLER",
    currentFranchiseOrStatus: "Delhi Capitals (Released)",
    exclusionReason:
      "Reported workload opt-out for IPL 2027 due to Australian international schedule. Excluded from actionable targets.",
    pressureScorePer100: 0,
  },
  {
    name: "MS Dhoni",
    globalP1Rank: 999,
    discipline: "BATTER",
    currentFranchiseOrStatus: "Chennai Super Kings (Retired)",
    exclusionReason:
      "Retired from active IPL playing to assume CSK mentor role. Ineligible for auction recruitment.",
    pressureScorePer100: 0,
  },
  {
    name: "Andre Russell",
    globalP1Rank: 8,
    discipline: "BATTER",
    currentFranchiseOrStatus: "Retired / Mentor Transition",
    exclusionReason: "Historical P1 benchmark only; inactive in competitive auction market.",
    pressureScorePer100: +17.32,
  },
  {
    name: "Tushar Deshpande",
    globalP1Rank: 999,
    discipline: "BOWLER",
    currentFranchiseOrStatus: "Rajasthan Royals (Released)",
    exclusionReason:
      "Explicitly excluded by competition mandate; release indicates tactical departure from RR plans.",
    pressureScorePer100: 0,
  },
  {
    name: "M Shahrukh Khan",
    globalP1Rank: 64,
    discipline: "BATTER",
    currentFranchiseOrStatus: "Gujarat Titans (Released)",
    exclusionReason:
      "Explicitly excluded by competition mandate; redundant No.6–7 profile overlaps with retained Donovan Ferreira.",
    pressureScorePer100: -0.12,
  },
];

/**
 * ============================================================================
 * PART 3: RR-SPECIFIC BATTER RECRUITMENT BOARD (EXACTLY 10 CANDIDATES)
 * ============================================================================
 */
export const RR_BATTER_RECOMMENDATIONS: RecruitmentCandidate[] = [
  {
    id: "rr-bat-01",
    name: "Nehal Wadhera",
    rank: 1,
    discipline: "BATTER",
    primaryRole: "FLOATER",
    secondaryRole: "LOWER_MIDDLE_ORDER_FINISHER",
    nationality: "Indian",
    country: "India",
    battingHand: "Left",
    teamReleasedFrom: "Punjab Kings",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by PBKS · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Direct structural fix for RR's critical missing link: an Indian left-handed middle-order buffer at No.5 between Jurel (No.4) and Ferreira/Jadeja (Nos.6–7). Prevents the middle-over spin squeeze that eliminated RR in the 2024 Qualifier 2.",
    roleFit:
      "Median batting position 5.0 across 36 IPL matches; 538 legal deliveries, 1.396 runs/ball (SR 139.6), 36.99% dot balls. Natural left-hand innings-repairer who can float between Nos. 4 and 6 depending on game situation.",
    pressureEvidence: {
      status: "PROVISIONAL_LOW_SAMPLE",
      exposureNote:
        "59 pressure-gated deliveries (below 100-ball P1 eligibility threshold). Classified as PROVISIONAL low-sample candidate; recommended on tactical role-fit rather than P1 model proof.",
      scoutingMetrics: {
        matches: 36,
        legalBalls: 538,
        strikeRate: 139.59,
        dotPercentage: "36.99%",
        gatedPressureBalls: 59,
        pressureEligibility: "Below 100-ball threshold (Provisional)",
      },
    },
    upgradeOverSquad:
      "Provides a dedicated left-handed middle-order anchor/floater, relieving Shubham Dubey from carrying the entire domestic middle-order burden and allowing Donovan Ferreira to enter in his optimal death-overs power window.",
    watchOut:
      "IPL 2026 production slumped noticeably compared to 2025; pressure sample is below the 100-ball P1 threshold and he will command heavy bidding from multiple franchises seeking Indian LHB middle-order options.",
    tacticalRolesSupported: ["Stabilizer", "Left-handed spin disruptor", "Pace-hitting floater"],
    isProvisional: true,
  },
  {
    id: "rr-bat-02",
    name: "Abishek Porel",
    rank: 2,
    discipline: "BATTER",
    primaryRole: "WICKETKEEPER_BATTER",
    secondaryRole: "FLOATER",
    nationality: "Indian",
    country: "India",
    battingHand: "Left",
    teamReleasedFrom: "Delhi Capitals",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by DC · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Provides high-impact domestic wicketkeeping cover behind Dhruv Jurel while functioning as a dynamic left-handed batting floater. Securing Porel eliminates the need to spend an overseas XI slot on backup keeper Lhuan-dre Pretorius.",
    roleFit:
      "Versatile left-handed wicketkeeper-batter who excelled for DC with an aggressive strike rate (>150) in powerplay and middle overs. Capable of floating between opening and No.5 or entering as a specialist batting Impact Player.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archived dataset. Evaluated on verified IPL descriptive sample (28 matches, 500+ runs, SR 152.4).",
      scoutingMetrics: {
        matches: 28,
        iplStrikeRate: 152.4,
        primaryPositions: "1–4 (Upper order) / Floater",
        keepingDismissals: 14,
      },
    },
    upgradeOverSquad:
      "Offers domestic left-handed batting flexibility and specialist wicketkeeping, allowing RR to field Jurel as a pure batter when workload demands without compromising overseas balance.",
    watchOut:
      "Historical IPL sample is concentrated in the top order (Nos. 1–3); he is NOT a proven death-overs power-hitter and must not be cast as a No.6–7 specialist finisher.",
    tacticalRolesSupported: [
      "Wicketkeeper/cover option",
      "Left-handed spin disruptor",
      "Pace-hitting floater",
    ],
    isProvisional: true,
  },
  {
    id: "rr-bat-03",
    name: "Nitish Rana",
    rank: 3,
    discipline: "BATTER",
    primaryRole: "MIDDLE_ORDER_ANCHOR",
    secondaryRole: "FLOATER",
    nationality: "Indian",
    country: "India",
    battingHand: "Left",
    teamReleasedFrom: "Kolkata Knight Riders",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by KKR · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Experienced left-handed middle-order stabilizer who directly inoculates RR against top-order collapses (such as the 2022 Final). Offers proven boundary hitting against spin through overs 7–15 and handy off-spin bowling against left-handers.",
    roleFit:
      "Proven IPL record across 107 matches (>2,600 runs, SR 135.2, 18 fifties). Operates effectively at Nos. 3–5 to absorb pressure, anchor partnerships, and counter left-arm orthodox or leg-spin.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archived top-10 dataset. Supported by extensive 10-year IPL track record in high-leverage playoff environments.",
      scoutingMetrics: {
        matches: 107,
        careerRuns: 2636,
        strikeRate: 135.2,
        inningsAtNo3to5: "88%",
      },
    },
    upgradeOverSquad:
      "Brings seasoned tactical maturity and spin-hitting mastery that neither young Vaibhav Sooryavanshi nor Shubham Dubey currently possess in crunch playoff scenarios.",
    watchOut:
      "Not an explosive No.7 finisher; scoring rate drops against high-pace back-of-a-length bowling (>142 kph) in the death overs.",
    tacticalRolesSupported: ["Stabilizer", "Left-handed spin disruptor", "Batting all-rounder"],
    isProvisional: true,
  },
  {
    id: "rr-bat-04",
    name: "Mahipal Lomror",
    rank: 4,
    discipline: "BATTER",
    primaryRole: "BATTING_ALL_ROUNDER",
    secondaryRole: "LOWER_MIDDLE_ORDER_FINISHER",
    nationality: "Indian",
    country: "India",
    battingHand: "Left",
    teamReleasedFrom: "Royal Challengers Bengaluru",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by RCB · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Former Royal who knows Sawai Mansingh Stadium intimately. Provides explosive middle-overs boundary hitting against spin combined with useful left-arm orthodox spin, providing local conditions mastery and Impact Player punch.",
    roleFit:
      "Middle-order power-hitter capable of striking at 170+ against spin in overs 9–16. Best deployed between Nos. 5 and 7 to disrupt opposition spin plans.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. Evaluated through 40 IPL matches with RCB/RR, demonstrating rapid boundary cameos against spin.",
      scoutingMetrics: {
        matches: 40,
        strikeRateVsSpin: 158.6,
        overallStrikeRate: 141.2,
      },
    },
    upgradeOverSquad:
      "Domestic left-handed alternative who offers secondary spin cover for Ravindra Jadeja and provides cheaper tactical depth than overseas batting targets.",
    watchOut:
      "Prone to short-ball dismissals against express pace; finishing record in tight, high-required-rate run chases remains inconsistent.",
    tacticalRolesSupported: [
      "Left-handed spin disruptor",
      "Boundary-hitting finisher",
      "Batting all-rounder",
    ],
    isProvisional: true,
  },
  {
    id: "rr-bat-05",
    name: "Shimron Hetmyer",
    rank: 5,
    discipline: "BATTER",
    primaryRole: "OVERSEAS_POWER_HITTER",
    secondaryRole: "LOWER_MIDDLE_ORDER_FINISHER",
    nationality: "Overseas",
    country: "West Indies",
    battingHand: "Left",
    teamReleasedFrom: "Rajasthan Royals",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by RR · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Direct historical buyback candidate who understands RR's death-hitting philosophy. Proven death-overs boundary pedigree (322 legal death balls in IPL, 1.863 runs/ball).",
    roleFit:
      "Specialist No.6 power finisher. Median batting position 6.0; lethal boundary accelerator against pace and spin in overs 16–20.",
    pressureEvidence: {
      status: "ELIGIBLE_P1_ARCHIVE",
      p1Rank: 72,
      postMeanPer100: -0.06,
      pTop10: 0.006,
      gatedBalls: 251,
      gatedMatches: 36,
      iplShareOfGated: 0.81,
      exposureNote:
        "Archived P1 Rank 72. Evaluated in full model with 251 gated deliveries across 36 matches. Below top-tier pressure ranking, but possesses elite IPL-specific death volume.",
      scoutingMetrics: {
        p1Rank: 72,
        deathLegalBalls: 322,
        deathRunsPerBall: 1.863,
        medianPosition: 6.0,
      },
    },
    upgradeOverSquad:
      "Established match-winning pedigree for Rajasthan; provides an overseas contingency if Ferreira suffers an injury or form slump.",
    watchOut:
      "Consumes an overseas XI slot. Because RR already retains Donovan Ferreira as primary overseas finisher, signing Hetmyer restricts overseas bowling combinations (Archer + Pathirana/Boult/Burger).",
    tacticalRolesSupported: ["Boundary-hitting finisher", "Left-handed spin disruptor"],
    isProvisional: false,
  },
  {
    id: "rr-bat-06",
    name: "Robin Minz",
    rank: 6,
    discipline: "BATTER",
    primaryRole: "WICKETKEEPER_BATTER",
    secondaryRole: "LOWER_MIDDLE_ORDER_FINISHER",
    nationality: "Indian",
    country: "India",
    battingHand: "Left",
    teamReleasedFrom: "Gujarat Titans",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by GT · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Exceptional high-ceiling domestic talent: a left-handed wicketkeeper-finisher with enormous natural bat speed. Provides long-term domestic power-hitting depth at low auction expenditure.",
    roleFit:
      "Natural lower-middle-order finisher (Nos. 6–7) who can clear boundary ropes from Ball 1 and serve as domestic backup wicketkeeper.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. Scouting assessment based on domestic power trials and state-level T20 strike rates (>165).",
      scoutingMetrics: {
        profile: "Domestic LHB Wicketkeeper-Finisher",
        powerProfile: "Raw bat-speed outlier",
        ageProfile: "Developmental / Long-term",
      },
    },
    upgradeOverSquad:
      "Adds high-velocity left-handed domestic power without consuming an overseas slot or creating positional friction with Dhruv Jurel.",
    watchOut:
      "Zero senior IPL match caps; unproven against international express pace and elite death-overs yorkers.",
    tacticalRolesSupported: ["Wicketkeeper/cover option", "Boundary-hitting finisher"],
    isProvisional: true,
  },
  {
    id: "rr-bat-07",
    name: "Kamindu Mendis",
    rank: 7,
    discipline: "BATTER",
    primaryRole: "BATTING_ALL_ROUNDER",
    secondaryRole: "FLOATER",
    nationality: "Overseas",
    country: "Sri Lanka",
    battingHand: "Left",
    teamReleasedFrom: "Sri Lanka / International Pool",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "International entrant · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Extraordinary ambidextrous tactical weapon: bats in the middle order with classical composure, while bowling right-arm off-spin to left-handers and left-arm orthodox to right-handers. Gives RR complete matchup dominance.",
    roleFit:
      "Dynamic middle-order floater (Nos. 4–6) with elite temperament under pressure across international cricket (ICC breakout performer 2024–2026).",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in IPL archive. International sample shows extraordinary Test/T20 conversion and poise under scoreboard pressure.",
      scoutingMetrics: {
        internationalAverage: "50+ across formats",
        bowlingVersatility: "Ambidextrous spin (Off-spin + SLA)",
        fieldingRating: "Elite 30-yard fielder",
      },
    },
    upgradeOverSquad:
      "Unmatched tactical flexibility: allows RR to play a single player who solves both middle-order batting stability and opposing-hand spin matchups.",
    watchOut:
      "Zero prior IPL tournament experience; consumes 1 of only 4 available overseas XI slots.",
    tacticalRolesSupported: [
      "Stabilizer",
      "Left-handed spin disruptor",
      "Batting all-rounder",
      "Pace-hitting floater",
    ],
    isProvisional: true,
  },
  {
    id: "rr-bat-08",
    name: "Aman Khan",
    rank: 8,
    discipline: "BATTER",
    primaryRole: "LOWER_MIDDLE_ORDER_FINISHER",
    secondaryRole: "BATTING_ALL_ROUNDER",
    nationality: "Indian",
    country: "India",
    battingHand: "Right",
    teamReleasedFrom: "Chennai Super Kings",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by CSK · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Tall, imposing Indian power-hitter who can strike pace straight down the ground at Nos. 6–7 and bowl 1–2 overs of medium pace, reducing reliance on Dasun Shanaka's overseas slot.",
    roleFit:
      "Lower-order finisher with proven SMAT domestic power output and boundary cameos for KKR and DC.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. Supported by domestic SMAT strike rate (158.4) and proven 50+ meter boundary clearance.",
      scoutingMetrics: {
        domesticT20Matches: 42,
        domesticStrikeRate: 158.4,
        iplInningsSample: 14,
      },
    },
    upgradeOverSquad:
      "Affordable Indian seam-bowling batter alternative who gives tactical bench depth behind Donovan Ferreira.",
    watchOut:
      "IPL output has been sporadic; vulnerability to sharp short-pitch bowling above chest height.",
    tacticalRolesSupported: ["Boundary-hitting finisher", "Batting all-rounder"],
    isProvisional: true,
  },
  {
    id: "rr-bat-09",
    name: "Vihaan Malhotra",
    rank: 9,
    discipline: "BATTER",
    primaryRole: "DEVELOPMENTAL_BATTER",
    secondaryRole: "FLOATER",
    nationality: "Indian",
    country: "India",
    battingHand: "Left",
    teamReleasedFrom: "Royal Challengers Bengaluru",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by RCB · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Long-term blue-chip developmental asset: 2026 India U19 World Cup standout (109* vs Zimbabwe, 4/14 vs Bangladesh) and dominant SMAT form in Nov 2026 (86 off 50 vs Haryana). Perfect developmental peer for Vaibhav Sooryavanshi.",
    roleFit:
      "Left-handed top/middle-order batting floater with right-arm off-spin option. Ideal developmental squad player acquired at base price.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available. High domestic/junior form: 256 runs off 143 balls (SR 179.02) in Sher-e-Punjab T20 and verified U19 WC pressure innings.",
      scoutingMetrics: {
        u19WorldCupHigh: "109* off 107 vs Zimbabwe",
        u19WorldCupBowling: "4/14 vs Bangladesh",
        smatNov2026Score: "86 off 50 balls",
      },
    },
    upgradeOverSquad:
      "Adds elite age-group pedigree and left-handed batting depth for the 2027–2030 cycle at negligible purse expenditure.",
    watchOut:
      "Raw youth; entirely unproven against senior international fast bowlers in high-stakes IPL atmospheres.",
    tacticalRolesSupported: ["Stabilizer", "Left-handed spin disruptor", "Pace-hitting floater"],
    isProvisional: true,
  },
  {
    id: "rr-bat-10",
    name: "Matthew Breetzke",
    rank: 10,
    discipline: "BATTER",
    primaryRole: "OVERSEAS_POWER_HITTER",
    secondaryRole: "MIDDLE_ORDER_ANCHOR",
    nationality: "Overseas",
    country: "South Africa",
    battingHand: "Right",
    teamReleasedFrom: "Lucknow Super Giants",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by LSG · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "High-pace back-foot aggressor who has dominated SA20 cricket. Provides top/upper-middle-order insurance if Jaiswal, Vaibhav, or Parag suffer injuries.",
    roleFit:
      "Top-order power batter (Nos. 1–3) with boundary-hitting ability against 145+ kph pace and exceptional boundary-riding fielding metrics.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. Supported by extensive SA20 and international T20 metrics (SR 142.6, 400+ runs in SA20 2024).",
      scoutingMetrics: {
        sa20StrikeRate: 142.6,
        boundaryPercentage: "18.8%",
        primaryBattingPosition: "1–3",
      },
    },
    upgradeOverSquad:
      "Elite top-order overseas batting cover, but carries significant role overlap with RR's retained core.",
    watchOut:
      "Positional clash with Vaibhav, Jaiswal, and Parag. He is NOT a natural No.5–8 finisher and must not be recruited for death-hitting roles.",
    tacticalRolesSupported: ["Stabilizer", "Pace-hitting floater"],
    isProvisional: true,
  },
];

/**
 * ============================================================================
 * PART 4: RR-SPECIFIC BOWLER RECRUITMENT BOARD (EXACTLY 10 CANDIDATES)
 * ============================================================================
 */
export const RR_BOWLER_RECOMMENDATIONS: RecruitmentCandidate[] = [
  {
    id: "rr-bowl-01",
    name: "Matheesha Pathirana",
    rank: 1,
    discipline: "BOWLER",
    primaryRole: "DEATH_SPECIALIST",
    secondaryRole: "EXPRESS_PACE",
    nationality: "Overseas",
    country: "Sri Lanka",
    bowlingStyle: "Right-arm sling fast",
    teamReleasedFrom: "Kolkata Knight Riders",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by KKR · Registration unverified",
    medicalRestriction: "MEDICAL_REVIEW",
    medicalNote:
      "Hamstring surgical recovery in 2026. Hard medical gate: require independent medical clearance and bowling load verification before bidding.",
    whyRR:
      "Direct statistical cure for RR's biggest failure mode: death-overs execution (which cost RR Qualifier 2 in 2026). Partnering Pathirana with Jofra Archer creates the most destructive pace pair in the competition.",
    roleFit:
      "Elite death-overs specialist. 302 IPL death deliveries, 8.80 economy, 8.55 wickets per 100 balls, and 88 recorded yorker-style deliveries. Operates in overs 15, 17, 19, and 20.",
    pressureEvidence: {
      status: "ELIGIBLE_P1_ARCHIVE",
      p1Rank: 2,
      postMeanPer100: -12.3827,
      lo90Per100: -22.3724,
      hi90Per100: -2.393,
      pTop10: 0.838,
      rankLo5: 1,
      rankHi95: 23,
      tier: "Core",
      gatedBalls: 361,
      gatedMatches: 40,
      iplShareOfGated: 0.662,
      exposureNote:
        "P1 Rank 2 overall. Bayesian posterior mean of -12.38 runs/100 conceded relative to context expectation with 83.8% probability of being a top-10 pressure bowler. Strongest pressure profile in the auction pool.",
      scoutingMetrics: {
        p1Rank: 2,
        deathLegalBallsIPL: 302,
        deathEconomyIPL: 8.8,
        deathWicketsPer100IPL: 8.55,
        recordedYorkers: 88,
      },
    },
    upgradeOverSquad:
      "Transformational upgrade over Sandeep Sharma and Nandre Burger at the death, shifting Sandeep to an off-pace control role and freeing Archer for flexible high-leverage overs.",
    watchOut:
      "HARD MEDICAL RESTRICTION. Left hamstring surgery in 2026; cannot be treated as an unconditional acquisition until independent medical evaluation confirms full 145+ kph bowling workload.",
    tacticalRolesSupported: ["DEATH_SPECIALIST", "EXPRESS_PACE"],
    isProvisional: false,
  },
  {
    id: "rr-bowl-02",
    name: "Trent Boult",
    rank: 2,
    discipline: "BOWLER",
    primaryRole: "POWERPLAY_SPECIALIST",
    secondaryRole: "NEW_BALL_PACE",
    nationality: "Overseas",
    country: "New Zealand",
    bowlingStyle: "Left-arm fast-medium swing",
    teamReleasedFrom: "Mumbai Indians",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by MI · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Proven master of Jaipur's Sawai Mansingh Stadium powerplay conditions. Reconstitutes the lethal Boult-Archer-Shami new-ball triumvirate that previously dismantled top orders across the IPL.",
    roleFit:
      "Dedicated powerplay strike bowler. 61.2% of delivery volume occurs in overs 1–6. Attacks with early left-arm swing and seam movement.",
    pressureEvidence: {
      status: "ELIGIBLE_P1_ARCHIVE",
      p1Rank: 8,
      postMeanPer100: -6.8949,
      lo90Per100: -16.9915,
      hi90Per100: 3.2017,
      pTop10: 0.382,
      rankLo5: 3,
      rankHi95: 58,
      tier: "Plausible",
      gatedBalls: 341,
      gatedMatches: 55,
      iplShareOfGated: 0.85,
      exposureNote:
        "P1 Rank 8 bowler. Posterior mean of -6.89 runs/100 with 85% IPL share in gated pressure sample. Wide 90% posterior interval (crosses zero at 3.20) reflects heavy powerplay concentration.",
      scoutingMetrics: {
        p1Rank: 8,
        powerplayDeliveryShare: "61.2%",
        deathDeliveryShare: "17.3%",
        ipl2026Output: "2 wickets in 16.1 overs (11.63 economy)",
      },
    },
    upgradeOverSquad:
      "Elite left-arm swing angle that Nandre Burger cannot match in terms of early lateral movement, setting up high-probability powerplay wickets for Shami and Archer.",
    watchOut:
      "NOT A DEATH BOWLER (only 17.3% death usage). Form dipped in IPL 2026 (11.63 rpo); consumes an overseas XI slot without solving the 18–20 over death phase.",
    tacticalRolesSupported: ["POWERPLAY_SPECIALIST", "NEW_BALL_PACE"],
    isProvisional: false,
  },
  {
    id: "rr-bowl-03",
    name: "Avesh Khan",
    rank: 3,
    discipline: "BOWLER",
    primaryRole: "PACE_ENFORCER",
    secondaryRole: "INDIAN_PACE_DEPTH",
    nationality: "Indian",
    country: "India",
    bowlingStyle: "Right-arm fast",
    teamReleasedFrom: "Lucknow Super Giants",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by LSG · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Vital Indian pace enforcer who knows RR's setup intimately (19 wickets in RR's 2024 campaign). Bowling 142+ kph hard lengths through middle and death overs frees up an overseas slot for an extra batter.",
    roleFit:
      "Hit-the-deck Indian fast bowler capable of bowling in all three phases: 1 over in powerplay, 2 in middle overs, and 1 at the death.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. Supported by extensive IPL playoff workload for RR (19 wickets in 2024, heavy death-overs duty).",
      scoutingMetrics: {
        rr2024Wickets: 19,
        careerIPLMatches: 63,
        careerIPLWickets: 75,
        paceAverage: "142+ kph",
      },
    },
    upgradeOverSquad:
      "Massive upgrade in proven high-intensity experience over domestic reserves Brijesh Sharma and Sushant Mishra; shields Shami from heavy death-overs load.",
    watchOut:
      "Death execution can leak boundaries when radar slips; 2025/2026 IPL economy oscillated above 9.2 rpo; not an automatic first-choice frontline closer.",
    tacticalRolesSupported: ["PACE_ENFORCER", "INDIAN_PACE_DEPTH"],
    isProvisional: true,
  },
  {
    id: "rr-bowl-04",
    name: "Mustafizur Rahman",
    rank: 4,
    discipline: "BOWLER",
    primaryRole: "VARIATION_SPECIALIST",
    secondaryRole: "DEATH_SPECIALIST",
    nationality: "Overseas",
    country: "Bangladesh",
    bowlingStyle: "Left-arm fast-medium cutters",
    teamReleasedFrom: "Kolkata Knight Riders",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by KKR · Registration unverified",
    medicalRestriction: "MEDICAL_REVIEW",
    medicalNote:
      "Requires routine medical update and workload confirmation following 2026 bilateral commitments.",
    whyRR:
      "Direct tactical contingency for Pathirana: brings deceptive off-pace cutters and dipping slower deliveries that grip on slower Jaipur surfaces, offering a stark contrast to Archer's express pace.",
    roleFit:
      "Phase-flexible variation bowler. 206 IPL death deliveries across 21 matches with 10.28 economy and 6.70 wickets/100 balls.",
    pressureEvidence: {
      status: "ELIGIBLE_P1_ARCHIVE",
      p1Rank: 5,
      postMeanPer100: -8.2187,
      lo90Per100: -17.3258,
      hi90Per100: 0.8884,
      pTop10: 0.35,
      rankLo5: 3,
      rankHi95: 54,
      tier: "Plausible",
      gatedBalls: 554,
      gatedMatches: 65,
      iplShareOfGated: 0.307,
      exposureNote:
        "P1 Rank 5 bowler. Concedes -8.22 runs/100 relative to expectation across 554 gated balls. 90% posterior interval includes zero (0.89); IPL share is only 30.7%.",
      scoutingMetrics: {
        p1Rank: 5,
        deathLegalBallsIPL: 206,
        deathEconomyIPL: 10.28,
        deathWicketsPer100IPL: 6.7,
      },
    },
    upgradeOverSquad:
      "Provides a seasoned left-arm variation specialist who can bowl overs 17 and 19 on gripping, dry surfaces where Burger's raw pace would sit up.",
    watchOut:
      "Do NOT equate him to Pathirana: death economy (10.28) is significantly higher than Pathirana (8.80) and pressure score interval includes zero.",
    tacticalRolesSupported: ["VARIATION_SPECIALIST", "DEATH_SPECIALIST"],
    isProvisional: false,
  },
  {
    id: "rr-bowl-05",
    name: "Akash Madhwal",
    rank: 5,
    discipline: "BOWLER",
    primaryRole: "INDIAN_PACE_DEPTH",
    secondaryRole: "DEATH_SPECIALIST",
    nationality: "Indian",
    country: "India",
    bowlingStyle: "Right-arm fast round-arm",
    teamReleasedFrom: "Chennai Super Kings",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by CSK · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Ex-RR squad member (IPL 2025, then CSK replacement in 2026) with skiddy, low-release trajectory that makes his yorkers difficult to get under. Affordable Indian pace reinforcement.",
    roleFit:
      "Middle-and-death phase bowler. 17 IPL matches, 23 wickets; 106 legal death deliveries at 10.30 economy with 6.72 wickets per 100 balls.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. Supported by 106 IPL death deliveries with strong strike rate (6.72 wkts/100).",
      scoutingMetrics: {
        iplMatches: 17,
        iplWickets: 23,
        deathDeliveries: 106,
        deathEconomy: 10.3,
        deathWicketsPer100: 6.72,
      },
    },
    upgradeOverSquad:
      "Gives RR a specialist Indian yorker option on the bench without paying premium auction prices, preserving purse for top-tier targets.",
    watchOut:
      "Economy rate at death (10.30) can be expensive on good batting tracks; limited powerplay utility.",
    tacticalRolesSupported: ["INDIAN_PACE_DEPTH", "DEATH_SPECIALIST"],
    isProvisional: true,
  },
  {
    id: "rr-bowl-06",
    name: "Matt Henry",
    rank: 6,
    discipline: "BOWLER",
    primaryRole: "POWERPLAY_SPECIALIST",
    secondaryRole: "NEW_BALL_PACE",
    nationality: "Overseas",
    country: "New Zealand",
    bowlingStyle: "Right-arm fast-medium seam",
    teamReleasedFrom: "Chennai Super Kings",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by CSK · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "In blazing current form (took 6/27 vs India in the 13 Nov 2026 ODI). Delivers impeccable upright seam presentation that extracts movement on spicy, green, or hard surfaces.",
    roleFit: "New-ball powerplay strike bowler who hits the seam relentlessly in overs 1–6.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. METHODOLOGY NOTE: His recent 6/27 ODI figures against India are current-form indicators only; they are NOT T20 pressure evidence and must NOT enter P1.",
      scoutingMetrics: {
        recentODIForm: "6/27 vs India (13 Nov 2026)",
        t2oInternationalEconomy: 7.82,
        powerplayWicketsT20I: "48 wickets in PP",
      },
    },
    upgradeOverSquad:
      "High-class overseas new-ball alternative if bidding for Trent Boult exceeds disciplined ceilings.",
    watchOut:
      "High role overlap with Mohammed Shami and Jofra Archer; limited death-overs execution; consumes an overseas XI slot.",
    tacticalRolesSupported: ["POWERPLAY_SPECIALIST", "NEW_BALL_PACE"],
    isProvisional: true,
  },
  {
    id: "rr-bowl-07",
    name: "Gerald Coetzee",
    rank: 7,
    discipline: "BOWLER",
    primaryRole: "EXPRESS_PACE",
    secondaryRole: "PACE_ENFORCER",
    nationality: "Overseas",
    country: "South Africa",
    bowlingStyle: "Right-arm fast (145+ kph)",
    teamReleasedFrom: "Mumbai Indians",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by MI · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Genuine 145+ kph hostility and aggression. Provides a hit-the-deck express enforcer who can intimidate middle orders with bouncers and heavy lengths.",
    roleFit:
      "Middle-overs strike bowler and enforcer; 13 wickets in 10 matches for MI in IPL 2024.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. Evaluated through 10 IPL matches with MI (13 wickets, strike rate 15.6 balls/wicket).",
      scoutingMetrics: {
        iplMatches: 10,
        iplWickets: 13,
        strikeRate: 15.69,
        topSpeedKph: "152.3 kph",
      },
    },
    upgradeOverSquad:
      "Adds sheer intimidation factor and high pace alongside Jofra Archer, overwhelming opponents who struggle against high heat.",
    watchOut:
      "Leaky economy rate (career IPL economy 10.18); frequently concedes boundary balls when attempting bouncers; consumes overseas slot.",
    tacticalRolesSupported: ["EXPRESS_PACE", "PACE_ENFORCER"],
    isProvisional: true,
  },
  {
    id: "rr-bowl-08",
    name: "Mangesh Yadav",
    rank: 8,
    discipline: "BOWLER",
    primaryRole: "INDIAN_PACE_DEPTH",
    secondaryRole: "VARIATION_SPECIALIST",
    nationality: "Indian",
    country: "India",
    bowlingStyle: "Left-arm fast-medium",
    teamReleasedFrom: "Royal Challengers Bengaluru",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by RCB · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Rare domestic left-arm fast bowler with lower-order batting capability. Commanded ₹5.2 Crore in the 2026 auction; stellar MP T20 2025 campaign (14 wickets in 21 overs at 8.00 economy).",
    roleFit:
      "Domestic Indian pace-bowling depth and developmental left-arm option for succession planning.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. Domestic MP T20 evidence: 14 wickets in 21 overs at 8.00 economy in 2025; 4 wickets in 21 overs at 10.67 economy in 2026.",
      scoutingMetrics: {
        previousAuctionPriceCrore: 5.2,
        mpT20Wickets2025: 14,
        mpT20Economy2025: 8.0,
      },
    },
    upgradeOverSquad:
      "Provides a left-arm pace angle from an Indian slot, enabling RR to field an extra overseas batter if desired.",
    watchOut:
      "Zero senior IPL match experience; economy ballooned to 10.67 in 2026 MP T20; not a proven death bowler.",
    tacticalRolesSupported: ["INDIAN_PACE_DEPTH", "VARIATION_SPECIALIST"],
    isProvisional: true,
  },
  {
    id: "rr-bowl-09",
    name: "Deepak Chahar",
    rank: 9,
    discipline: "BOWLER",
    primaryRole: "POWERPLAY_SPECIALIST",
    secondaryRole: "NEW_BALL_PACE",
    nationality: "Indian",
    country: "India",
    bowlingStyle: "Right-arm medium-fast swing",
    teamReleasedFrom: "Chennai Super Kings",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by CSK · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "Elite domestic powerplay swing bowler with extensive championship-winning pedigree. Provides early wickets and useful lower-order hitting at No.8, saving an overseas slot.",
    roleFit:
      "Front-loaded powerplay bowler (typically bowls 3 of the first 6 overs) with lifetime IPL powerplay economy under 7.8.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. Backed by 81 IPL matches (77 wickets, 7.97 economy) and proven multi-wicket powerplay spells.",
      scoutingMetrics: {
        iplMatches: 81,
        iplWickets: 77,
        powerplayEconomy: 7.74,
      },
    },
    upgradeOverSquad:
      "Enables an all-Indian new-ball attack (Chahar + Shami) alongside Archer, unlocking two overseas batting slots (Ferreira + Shanaka/Hetmyer).",
    watchOut:
      "Fragile injury history (recurrent hamstring, back, and quadriceps issues); minimal effectiveness outside the first 6 overs.",
    tacticalRolesSupported: ["POWERPLAY_SPECIALIST", "NEW_BALL_PACE"],
    isProvisional: true,
  },
  {
    id: "rr-bowl-10",
    name: "Spencer Johnson",
    rank: 10,
    discipline: "BOWLER",
    primaryRole: "EXPRESS_PACE",
    secondaryRole: "POWERPLAY_SPECIALIST",
    nationality: "Overseas",
    country: "Australia",
    bowlingStyle: "Left-arm fast (145+ kph)",
    teamReleasedFrom: "Gujarat Titans",
    marketStatus: "RELEASED_REGISTRATION_UNVERIFIED",
    marketStatusLabel: "Released by GT · Registration unverified",
    medicalRestriction: "NONE",
    whyRR:
      "High-release 145+ kph left-arm express pace capable of extracting steep bounce. Natural left-arm pace alternative to Nandre Burger.",
    roleFit:
      "Powerplay and middle-overs strike bowler; utilizes high arm action and speed to push batters onto the back foot.",
    pressureEvidence: {
      status: "P1_NOT_AVAILABLE_IN_ARCHIVE",
      exposureNote:
        "P1 score not available in archive. Evaluated through BBL and IPL 2024 appearances (high dot-ball percentage against top orders).",
      scoutingMetrics: {
        bblEconomy: 7.15,
        topSpeedKph: "148.5 kph",
        leftArmAngle: "Steep bounce / High release",
      },
    },
    upgradeOverSquad:
      "Offers left-arm express pace depth if Nandre Burger experiences fatigue or tactical matchups demand extra bounce.",
    watchOut:
      "Consumes an overseas XI slot; recurring soft-tissue injuries; death bowling at IPL level remains volatile.",
    tacticalRolesSupported: ["EXPRESS_PACE", "POWERPLAY_SPECIALIST"],
    isProvisional: true,
  },
];

/**
 * ============================================================================
 * PART 6: TACTICAL MIDDLE-ORDER FLEXIBILITY (3 SPECIFIC VARIATIONS)
 * ============================================================================
 */
export const MIDDLE_ORDER_VARIATIONS: MiddleOrderTacticalVariation[] = [
  {
    id: "mod-var-a",
    title: "Variation A — Early Wickets Lost (Stabilization & Rebuild)",
    context:
      "Top-order wickets fall inside the powerplay (e.g. 25/2 in overs 1–4). Priority is partnership rebuilding without slowing the scoring rate.",
    battingOrderSlots4to8: [
      {
        slotNumber: 4,
        player: "Dhruv Jurel",
        role: "Stabilizer / Wicketkeeper-anchor",
        matchupRationale:
          "Enters early to arrest collapse, rotate strike, and build a partnership with Parag.",
      },
      {
        slotNumber: 5,
        player: "Nitish Rana / Nehal Wadhera",
        role: "Left-handed spin disruptor & Rebuilder",
        matchupRationale:
          "Left-hand presence prevents opposing leg-spinners/SLA from bowling unopposed lines; absorbs pressure through overs 7–12.",
      },
      {
        slotNumber: 6,
        player: "Riyan Parag",
        role: "Middle-order accumulator & Accelerator",
        matchupRationale:
          "Takes ownership of overs 11–17 to accelerate once the innings is stabilized.",
      },
      {
        slotNumber: 7,
        player: "Ravindra Jadeja",
        role: "Left-handed balance & Strike-rotator",
        matchupRationale: "Ensures deep batting experience and prevents late lower-order panics.",
      },
      {
        slotNumber: 8,
        player: "Donovan Ferreira",
        role: "Boundary-hitting finisher",
        matchupRationale:
          "Preserved for overs 17–20 where his 200+ strike rate produces maximum death-overs damage.",
      },
    ],
    keyTacticalAdvantage:
      "Protects boundary hitters from early high-risk entry while maintaining LHB/RHB balance throughout the middle overs.",
    tradeOff:
      "Requires Nehal or Rana to play a disciplined consolidation role, slightly lowering powerplay ceiling for innings security.",
  },
  {
    id: "mod-var-b",
    title: "Variation B — Spin-Heavy Middle Overs (Disrupt & Counter)",
    context:
      "Middle overs (overs 7–15) dominated by opposition wrist-spin and left-arm orthodox (e.g. at Chennai, Lucknow, or Delhi).",
    battingOrderSlots4to8: [
      {
        slotNumber: 4,
        player: "Riyan Parag",
        role: "Spin-hitter & Pace floater",
        matchupRationale: "Dominant against right-arm off-spin and medium pacers.",
      },
      {
        slotNumber: 5,
        player: "Nehal Wadhera / Mahipal Lomror",
        role: "Left-handed spin disruptor",
        matchupRationale:
          "Target short boundaries and slog-sweep away-spinning leg-spin and SLA; breaks bowling rhythms.",
      },
      {
        slotNumber: 6,
        player: "Dhruv Jurel",
        role: "Pace-hitting floater / Gap finder",
        matchupRationale:
          "Manipulates fielders with sweeps, dabs, and aggressive running between wickets.",
      },
      {
        slotNumber: 7,
        player: "Donovan Ferreira",
        role: "Power floater against spin/pace",
        matchupRationale: "Pummel any loose deliveries over long-on; punishes mystery spinners.",
      },
      {
        slotNumber: 8,
        player: "Ravindra Jadeja",
        role: "All-rounder / Finish",
        matchupRationale: "Expert running and boundary placement against defensive death fields.",
      },
    ],
    keyTacticalAdvantage:
      "Alternates left and right hands on every dismissal, preventing opposition captains from establishing favorable match-ups.",
    tradeOff:
      "Aggressive spin disruption carries slight wicket risk if execution on turning surfaces is misjudged.",
  },
  {
    id: "mod-var-c",
    title: "Variation C — Death Overs / High Required Run Rate (Pure Velocity)",
    context:
      "Chasing 200+ or entering overs 14+ with platform intact (e.g. 140/3 in 13 overs). Maximum boundary velocity required.",
    battingOrderSlots4to8: [
      {
        slotNumber: 4,
        player: "Riyan Parag",
        role: "Boundary accelerator",
        matchupRationale: "Target straight boundaries and launch maximums off middle-overs pacers.",
      },
      {
        slotNumber: 5,
        player: "Donovan Ferreira",
        role: "Boundary-hitting finisher",
        matchupRationale:
          "Promoted ahead of Jurel to maximize face-time in the death overs; strike rate >200 against pace.",
      },
      {
        slotNumber: 6,
        player: "Dhruv Jurel",
        role: "Ramp and 360-degree finisher",
        matchupRationale: "Ramps and scoops wide yorkers to exploit vacant fine leg and third man.",
      },
      {
        slotNumber: 7,
        player: "Nehal Wadhera / Mahipal Lomror",
        role: "Left-handed boundary finisher",
        matchupRationale: "Punish wide yorkers or cutters outside off-stump.",
      },
      {
        slotNumber: 8,
        player: "Ravindra Jadeja / Dasun Shanaka",
        role: "Final-over boundary hitter",
        matchupRationale: "Strike-rotation and last-ball boundary execution.",
      },
    ],
    keyTacticalAdvantage:
      "Front-loads boundary hitters (Ferreira promoted) to ensure balls are not consumed by defensive anchors.",
    tradeOff:
      "Higher risk of sudden clatter of wickets if Ferreira or Parag miscue early in the acceleration phase.",
  },
];

/**
 * ============================================================================
 * PART 7: IMPACT PLAYER STRATEGY (6 SPECIFIC SCENARIOS)
 * ============================================================================
 */
export const IMPACT_PLAYER_SCENARIOS: ImpactPlayerScenarioRecommendation[] = [
  {
    id: "impact-a",
    scenarioName: "A. Batting-First, High-Scoring Surface",
    matchContext:
      "Jaipur or Chinnaswamy highway where par score is 215+. RR bat first and need maximum firepower to post 225+.",
    recommendedPlayer: "Nehal Wadhera / Abishek Porel",
    playerRole: "Indian middle-order power floater",
    substitutedStartingPlayer: "Sandeep Sharma (bowler rested while batting)",
    whyThisSubstitution:
      "Allows RR to field 8 front-line batters while batting first, replacing the seamer who will only bowl in the second innings.",
    battingBenefit: "Deepens batting order to No.8 with an explosive left-handed boundary hitter.",
    bowlingBenefit:
      "No bowling impact during 1st innings; seamer substituted back via Impact regulation before defense.",
    overseasCountInXI: 3,
    squadEligibility: "Eligible Indian squad member",
    medicalRestrictions: "None",
    mainDownside:
      "Burns the single available Impact substitution early; cannot replace an injured bowler in 2nd innings.",
  },
  {
    id: "impact-b",
    scenarioName: "B. Chasing a Difficult Target (190+)",
    matchContext:
      "RR chasing 190+ under lights. Requires deep batting lineup with aggressive left-hand boundary options.",
    recommendedPlayer: "Abishek Porel / Nitish Rana",
    playerRole: "Left-handed floating batting accelerator",
    substitutedStartingPlayer: "Mohammed Shami (completed 4 overs in 1st innings)",
    whyThisSubstitution:
      "Replaces a frontline seamer whose bowling duty is complete with an aggressive left-handed batter to win the chase.",
    battingBenefit:
      "Injects high-intent boundary hitter into middle overs to prevent required rate from climbing past 12 rpo.",
    bowlingBenefit: "N/A (2nd innings chase).",
    overseasCountInXI: 3,
    squadEligibility: "Eligible Indian squad member",
    medicalRestrictions: "None",
    mainDownside: "If the top order collapses completely, bench seamer is already off the field.",
  },
  {
    id: "impact-c",
    scenarioName: "C. Defending a Total (Pace Control)",
    matchContext:
      "Defending 175–195 on standard pitch. Opposition has strong middle order requiring hard lengths and slower balls.",
    recommendedPlayer: "Avesh Khan / Sandeep Sharma",
    playerRole: "Indian middle/death pace enforcer",
    substitutedStartingPlayer: "Nehal Wadhera (completed batting innings)",
    whyThisSubstitution:
      "Substitutes out a specialist batter after the 1st innings to introduce an extra specialist bowler, providing 6 full bowling options.",
    battingBenefit: "N/A (Defending in 2nd innings).",
    bowlingBenefit:
      "Provides 4 overs of experienced pace/slower-ball control, taking pressure off Shami and Archer.",
    overseasCountInXI: 3,
    squadEligibility: "Eligible Indian squad member",
    medicalRestrictions: "None",
    mainDownside:
      "If defending team is bowled out inside 15 overs, substituted player had minimal game impact.",
  },
  {
    id: "impact-d",
    scenarioName: "D. Powerplay Assistance (Swing Conditions)",
    matchContext:
      "Cloud cover or fresh grass on Jaipur pitch with strong early swing. Need to blow open opposition top order in overs 1–6.",
    recommendedPlayer: "Trent Boult / Deepak Chahar",
    playerRole: "Powerplay swing specialist",
    substitutedStartingPlayer: "Shubham Dubey (batter substituted out before bowling)",
    whyThisSubstitution:
      "Maximizes new-ball movement alongside Archer and Shami to take 3+ powerplay wickets.",
    battingBenefit: "N/A (Bowler brought on for defense).",
    bowlingBenefit: "World-class left-arm swing in overs 1, 3, and 5; lethal powerplay squeeze.",
    overseasCountInXI: 4,
    squadEligibility: "Overseas cap strictly enforced (4/4 in XI)",
    medicalRestrictions: "None",
    mainDownside:
      "Boult provides very limited death-overs execution; remaining 14 overs must be covered by Archer/Shami/Sandeep.",
  },
  {
    id: "impact-e",
    scenarioName: "E. Death-Overs Defence (High-Pressure Closer)",
    matchContext:
      "Opposition needs 55 runs off final 5 overs. Surface is flat; yorkers and dipping slower balls are mandatory.",
    recommendedPlayer: "Matheesha Pathirana",
    playerRole: "Death-overs specialist (P1 Rank 2)",
    substitutedStartingPlayer: "Vaibhav Sooryavanshi (opener substituted after batting)",
    whyThisSubstitution:
      "Brings on the competition's highest-ranked pressure closer for overs 15, 17, 19, and 20.",
    battingBenefit: "N/A.",
    bowlingBenefit:
      "8.80 IPL death economy, 88 recorded yorkers, 8.55 wickets/100 balls in death phase.",
    overseasCountInXI: 4,
    squadEligibility: "Contingent on verified auction acquisition and registration",
    medicalRestrictions:
      "HARD GATE: Requires verified medical clearance from 2026 hamstring surgery.",
    mainDownside:
      "If Pathirana is not medically passed, must substitute Mustafizur or Akash Madhwal instead.",
  },
  {
    id: "impact-f",
    scenarioName: "F. Spin-Friendly Surface (Chennai / Lucknow)",
    matchContext:
      "Dry, turning track offering sharp grip and slow bounce. Opposition stacked with right-handers.",
    recommendedPlayer: "Manimaran Siddharth / Yash Raj Punja",
    playerRole: "Matchup spin specialist (Left-arm orthodox / Leg-spin)",
    substitutedStartingPlayer: "Nandre Burger / Fast bowler rested for spin",
    whyThisSubstitution:
      "Replaces redundant seamer with a specialist spinner to create a 3-spinner choke (Jadeja + Bishnoi + Siddharth).",
    battingBenefit: "N/A.",
    bowlingBenefit: "12 overs of relentless spin squeeze; ideal matchup against RHB-heavy lineups.",
    overseasCountInXI: 2,
    squadEligibility: "Eligible Indian squad member",
    medicalRestrictions: "None",
    mainDownside:
      "Reduces fast-bowling penetration if dew appears in the second half of the match.",
  },
];

/**
 * ============================================================================
 * PART 8: 5 DETAILED TACTICAL STARTING XI SCENARIOS
 * ============================================================================
 */
export const PROPOSED_STARTING_XI_SCENARIOS: TacticalScenarioLineup[] = [
  {
    id: "tactical-scen-1",
    name: "Pace-Oriented Attack",
    title: "Pace-Oriented Attack · Express Heat & Hard Lengths",
    purpose:
      "Overwhelm opposition with raw pace and bounce using Archer, Burger, Shami and Sandeep Sharma.",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Dhruv Jurel",
      "Riyan Parag",
      "Nehal Wadhera",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Mohammed Shami",
      "Nandre Burger",
    ],
    overseasCount: 3,
    paceOptionsCount: 4,
    spinOptionsCount: 3,
    deathOversSpecialists: ["Jofra Archer", "Sandeep Sharma (Impact)"],
    roleCoverageSummary: {
      wicketkeepers: ["Dhruv Jurel", "Donovan Ferreira"],
      topOrder: ["Vaibhav Sooryavanshi", "Yashasvi Jaiswal", "Riyan Parag"],
      middleOrder: ["Dhruv Jurel", "Nehal Wadhera"],
      finishers: ["Donovan Ferreira", "Ravindra Jadeja"],
      spinners: ["Ravi Bishnoi", "Ravindra Jadeja", "Riyan Parag"],
      seamers: ["Jofra Archer", "Mohammed Shami", "Nandre Burger"],
    },
    benchDisplacement: {
      displacedRetained: [
        "Sandeep Sharma",
        "Dasun Shanaka",
        "Manimaran Siddharth",
        "Yash Raj Punja",
        "Shubham Dubey",
        "Sushant Mishra",
        "Brijesh Sharma",
        "Lhuan-dre Pretorius",
        "Aman Rao Perala",
      ],
      startingRetainedCount: 10,
      startingAdditionsCount: 1,
    },
    impactPlayerAlternatives: [
      "Sandeep Sharma (death bowling control)",
      "Mahipal Lomror (extra spin hitting)",
    ],
    actualVsHypothetical: {
      retainedCount: 10,
      hypotheticalAdditions: ["Nehal Wadhera"],
    },
  },
  {
    id: "tactical-scen-2",
    name: "Batting & All-Rounder Flexibility",
    title: "Batting Depth & All-Round Balance · Shanaka Dynamic",
    purpose:
      "Deepen batting to No.8 with Dasun Shanaka, creating multi-dimensional batting and seam options.",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Dhruv Jurel",
      "Riyan Parag",
      "Nehal Wadhera",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Dasun Shanaka",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Mohammed Shami",
    ],
    overseasCount: 3,
    paceOptionsCount: 3,
    spinOptionsCount: 3,
    deathOversSpecialists: ["Jofra Archer", "Sandeep Sharma (Impact)"],
    roleCoverageSummary: {
      wicketkeepers: ["Dhruv Jurel", "Donovan Ferreira"],
      topOrder: ["Vaibhav Sooryavanshi", "Yashasvi Jaiswal", "Riyan Parag"],
      middleOrder: ["Dhruv Jurel", "Nehal Wadhera"],
      finishers: ["Donovan Ferreira", "Ravindra Jadeja", "Dasun Shanaka"],
      spinners: ["Ravi Bishnoi", "Ravindra Jadeja", "Riyan Parag"],
      seamers: ["Jofra Archer", "Mohammed Shami", "Dasun Shanaka"],
    },
    benchDisplacement: {
      displacedRetained: [
        "Nandre Burger",
        "Sandeep Sharma",
        "Manimaran Siddharth",
        "Yash Raj Punja",
        "Shubham Dubey",
        "Sushant Mishra",
        "Brijesh Sharma",
        "Lhuan-dre Pretorius",
        "Aman Rao Perala",
      ],
      startingRetainedCount: 10,
      startingAdditionsCount: 1,
    },
    impactPlayerAlternatives: [
      "Sandeep Sharma (pace reinforcement)",
      "Yash Raj Punja (conditions leg-spin)",
    ],
    actualVsHypothetical: {
      retainedCount: 10,
      hypotheticalAdditions: ["Nehal Wadhera"],
    },
  },
  {
    id: "tactical-scen-3",
    name: "Spin-Friendly Conditions",
    title: "Slow & Turning Track · Triple Indian Spin Choke",
    purpose:
      "Dominate turning surfaces (SMS, Chepauk, Ekana) with Bishnoi, Jadeja and Siddharth/Punja.",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Dhruv Jurel",
      "Riyan Parag",
      "Nitish Rana",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Manimaran Siddharth",
      "Jofra Archer",
      "Mohammed Shami",
    ],
    overseasCount: 2,
    paceOptionsCount: 2,
    spinOptionsCount: 4,
    deathOversSpecialists: ["Jofra Archer", "Sandeep Sharma (Impact)"],
    roleCoverageSummary: {
      wicketkeepers: ["Dhruv Jurel", "Donovan Ferreira"],
      topOrder: ["Vaibhav Sooryavanshi", "Yashasvi Jaiswal", "Riyan Parag"],
      middleOrder: ["Dhruv Jurel", "Nitish Rana"],
      finishers: ["Donovan Ferreira", "Ravindra Jadeja"],
      spinners: ["Ravi Bishnoi", "Manimaran Siddharth", "Ravindra Jadeja", "Riyan Parag"],
      seamers: ["Jofra Archer", "Mohammed Shami"],
    },
    benchDisplacement: {
      displacedRetained: [
        "Nandre Burger",
        "Dasun Shanaka",
        "Sandeep Sharma",
        "Yash Raj Punja",
        "Shubham Dubey",
        "Sushant Mishra",
        "Brijesh Sharma",
        "Lhuan-dre Pretorius",
        "Aman Rao Perala",
      ],
      startingRetainedCount: 10,
      startingAdditionsCount: 1,
    },
    impactPlayerAlternatives: [
      "Yash Raj Punja (wrist spin matchup)",
      "Sandeep Sharma (seam defense)",
    ],
    actualVsHypothetical: {
      retainedCount: 10,
      hypotheticalAdditions: ["Nitish Rana"],
    },
  },
  {
    id: "tactical-scen-4",
    name: "Powerplay Swing Conditions",
    title: "Jaipur Swing Attack · Boult + Archer + Shami Squeeze",
    purpose: "Exploit new-ball swing in Jaipur with Trent Boult alongside Archer and Shami.",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Dhruv Jurel",
      "Riyan Parag",
      "Nehal Wadhera",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Trent Boult",
      "Mohammed Shami",
    ],
    overseasCount: 3,
    paceOptionsCount: 3,
    spinOptionsCount: 3,
    deathOversSpecialists: ["Jofra Archer", "Sandeep Sharma (Impact)"],
    roleCoverageSummary: {
      wicketkeepers: ["Dhruv Jurel", "Donovan Ferreira"],
      topOrder: ["Vaibhav Sooryavanshi", "Yashasvi Jaiswal", "Riyan Parag"],
      middleOrder: ["Dhruv Jurel", "Nehal Wadhera"],
      finishers: ["Donovan Ferreira", "Ravindra Jadeja"],
      spinners: ["Ravi Bishnoi", "Ravindra Jadeja", "Riyan Parag"],
      seamers: ["Jofra Archer", "Trent Boult", "Mohammed Shami"],
    },
    benchDisplacement: {
      displacedRetained: [
        "Nandre Burger",
        "Dasun Shanaka",
        "Sandeep Sharma",
        "Manimaran Siddharth",
        "Yash Raj Punja",
        "Shubham Dubey",
        "Sushant Mishra",
        "Brijesh Sharma",
        "Lhuan-dre Pretorius",
        "Aman Rao Perala",
      ],
      startingRetainedCount: 9,
      startingAdditionsCount: 2,
    },
    impactPlayerAlternatives: [
      "Sandeep Sharma (essential death bowling substitute)",
      "Mahipal Lomror (batting depth)",
    ],
    actualVsHypothetical: {
      retainedCount: 9,
      hypotheticalAdditions: ["Nehal Wadhera", "Trent Boult"],
    },
  },
  {
    id: "tactical-scen-5",
    name: "Specialist Death-Bowling Scenario",
    title: "Lockdown Death Defense · Pathirana Gate Scenario",
    purpose:
      "Deploy Matheesha Pathirana (P1 Rank 2) alongside Jofra Archer for unassailable death-overs supremacy.",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Dhruv Jurel",
      "Riyan Parag",
      "Nehal Wadhera",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Matheesha Pathirana",
      "Mohammed Shami",
    ],
    overseasCount: 3,
    paceOptionsCount: 3,
    spinOptionsCount: 3,
    deathOversSpecialists: ["Matheesha Pathirana", "Jofra Archer"],
    roleCoverageSummary: {
      wicketkeepers: ["Dhruv Jurel", "Donovan Ferreira"],
      topOrder: ["Vaibhav Sooryavanshi", "Yashasvi Jaiswal", "Riyan Parag"],
      middleOrder: ["Dhruv Jurel", "Nehal Wadhera"],
      finishers: ["Donovan Ferreira", "Ravindra Jadeja"],
      spinners: ["Ravi Bishnoi", "Ravindra Jadeja", "Riyan Parag"],
      seamers: ["Jofra Archer", "Matheesha Pathirana", "Mohammed Shami"],
    },
    benchDisplacement: {
      displacedRetained: [
        "Nandre Burger",
        "Dasun Shanaka",
        "Sandeep Sharma",
        "Manimaran Siddharth",
        "Yash Raj Punja",
        "Shubham Dubey",
        "Sushant Mishra",
        "Brijesh Sharma",
        "Lhuan-dre Pretorius",
        "Aman Rao Perala",
      ],
      startingRetainedCount: 9,
      startingAdditionsCount: 2,
    },
    impactPlayerAlternatives: [
      "Sandeep Sharma (Indian control backup)",
      "Mustafizur Rahman (if Pathirana fails medical review)",
    ],
    actualVsHypothetical: {
      retainedCount: 9,
      hypotheticalAdditions: ["Nehal Wadhera", "Matheesha Pathirana"],
    },
  },
];

/**
 * ============================================================================
 * PART 9: AUCTION CAPACITY AND SLOT STRATEGY LADDER
 * ============================================================================
 */
export const AUCTION_SLOT_STRATEGY = [
  {
    priority: 1,
    targetArea: "Indian Middle-Order Hitter / Floater",
    idealCandidate: "Nehal Wadhera",
    fallbacks: ["Nitish Rana", "Mahipal Lomror"],
    rationality:
      "Core squad priority: fills the vacant No.5 position between Parag/Jurel and Ferreira. Protects against spin collapse.",
    overseasOpportunityCost: "Zero (Indian slot preserves overseas quota for fast bowling).",
  },
  {
    priority: 2,
    targetArea: "Indian Wicketkeeper / Floating Cover",
    idealCandidate: "Abishek Porel",
    fallbacks: ["Robin Minz"],
    rationality:
      "Provides domestic backup for Dhruv Jurel, eliminating reliance on overseas backup keeper Lhuan-dre Pretorius.",
    overseasOpportunityCost: "Zero (Saves an overseas squad and XI position).",
  },
  {
    priority: 3,
    targetArea: "Indian Pace Depth",
    idealCandidate: "Avesh Khan",
    fallbacks: ["Akash Madhwal", "Deepak Chahar"],
    rationality:
      "Provides proven high-speed enforcer capability (142+ kph) to prevent overworking Mohammed Shami.",
    overseasOpportunityCost:
      "Zero (Allows RR to field an extra overseas batter like Shanaka or Ferreira).",
  },
  {
    priority: 4,
    targetArea: "Overseas Death Specialist",
    idealCandidate: "Matheesha Pathirana (Medical Gated)",
    fallbacks: ["Mustafizur Rahman", "Gerald Coetzee"],
    rationality:
      "Solves the 2026 Qualifier 2 death-overs failure. Highest P1 pressure score in the auction pool (-12.38 runs/100).",
    overseasOpportunityCost:
      "Uses 1 overseas XI slot (Pairs with Archer and Ferreira; benches Burger or Shanaka).",
  },
  {
    priority: 5,
    targetArea: "Overseas Powerplay / Left-Arm Specialist",
    idealCandidate: "Trent Boult",
    fallbacks: ["Matt Henry", "Spencer Johnson"],
    rationality:
      "Jaipur home-pitch powerplay swing specialist (61.2% powerplay usage). Unlocks early wickets.",
    overseasOpportunityCost:
      "Uses 1 overseas XI slot; cannot be relied upon for death-overs overs 18–20.",
  },
  {
    priority: 6,
    targetArea: "Developmental All-Rounder / Domestic Value",
    idealCandidate: "Mangesh Yadav / Vihaan Malhotra",
    fallbacks: ["Aman Khan", "Onkar Tarmale"],
    rationality:
      "High-upside domestic talent acquired at base or low price for squad depth and long-term asset building.",
    overseasOpportunityCost: "Zero.",
  },
];
