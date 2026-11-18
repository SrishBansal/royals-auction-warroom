import { warRoomData } from "@/data/war-room";

export interface PlayerAlternative {
  primaryPlayer: string;
  alternativePlayer: string;
  role: string;
  reason: string;
}

export interface ConditionalAcquisitionInfo {
  playerName: string;
  condition: string;
  isRegistered: boolean;
  requiresMedicalClearance?: boolean | undefined;
  requiresWorkloadReview?: boolean | undefined;
}

export interface NormalizedScenario {
  id: string;
  name: string;
  title: string;
  purpose: string;
  startingXI: string[];
  conditionalAcquisitions: ConditionalAcquisitionInfo[];
  medicalRestrictions: string[];
  alternatives: PlayerAlternative[];
  benchOptions: string[];
  newBall: string;
  middle: string;
  death: string;
  batImpact: string;
  bowlImpact: string;
  trade: string;
  fallback: string;
  why: string;
  sourceAttribution: "ui_defined" | "json_source" | "reconciled";
  reconciliationNotes?: string[] | undefined;
}

export interface ScenarioReconciliationEntry {
  scenarioId: string;
  issue: string;
  jsonSource: string;
  uiSource: string;
  resolution: string;
}

/**
 * Explicit reconciliation record for known discrepancies between rr-2027-data.json and pages.tsx.
 */
export const SCENARIO_RECONCILIATIONS: ScenarioReconciliationEntry[] = [
  {
    scenarioId: "boult / pp_swing",
    issue: "Dasun Shanaka listed in JSON overseas_xi but omitted from JSON starting_xi.",
    jsonSource:
      "overseas_xi has 4 players (Archer, Boult, Ferreira, Shanaka), but starting_xi only lists Archer, Boult, Ferreira (3 overseas) plus Nehal Wadhera and 7 Indian retained.",
    uiSource:
      "boult scenario in pages.tsx explicitly places Dasun Shanaka in the starting XI at No.7, completing the 4 overseas starters.",
    resolution:
      "Preserved Shanaka in the normalized starting XI to fulfill the overseas_xi tactical intent, while providing an explicit alternative toggle for an all-Indian bowling/spin combination.",
  },
  {
    scenarioId: "balanced",
    issue:
      "JSON balanced scenario lists Nandre Burger and Dasun Shanaka in overseas_xi, but omits them from starting_xi, which contains only 2 overseas players.",
    jsonSource:
      "overseas_xi: [Archer, Burger, Ferreira, Shanaka]. starting_xi: [Archer, Ferreira] + 9 Indian options (including raw string 'Ravi Bishnoi or Yash Raj Punja').",
    uiSource:
      "balanced scenario in pages.tsx deploys 3 overseas starters (Archer, Ferreira, Burger), keeping Shanaka as a bench/conditions-specific all-round reserve.",
    resolution:
      "Reconciled by using 3 overseas starters (Archer, Ferreira, Burger) as the default XI, while listing Shanaka as a structured bench option and documenting the 4-overseas alternative.",
  },
  {
    scenarioId: "balanced (alternatives)",
    issue:
      "JSON balanced scenario embeds raw multi-player string 'Ravi Bishnoi or Yash Raj Punja' in starting_xi.",
    jsonSource: "starting_xi slot 7: 'Ravi Bishnoi or Yash Raj Punja'.",
    uiSource:
      "pages.tsx selects Ravi Bishnoi in starting XI and leaves Punja on the bench as conditions alternative.",
    resolution:
      "Deconstructed into a structured PlayerAlternative record: primaryPlayer = 'Ravi Bishnoi', alternativePlayer = 'Yash Raj Punja', reason = 'Conditions/matchup wrist-spin alternative'.",
  },
];

export const baseXI: string[] = [
  "Vaibhav Sooryavanshi",
  "Yashasvi Jaiswal",
  "Riyan Parag",
  "Dhruv Jurel",
  "Shubham Dubey",
  "Donovan Ferreira",
  "Ravindra Jadeja",
  "Ravi Bishnoi",
  "Jofra Archer",
  "Mohammed Shami",
  "Nandre Burger",
];

export const NORMALIZED_SCENARIOS: NormalizedScenario[] = [
  {
    id: "balanced",
    name: "Core Balance · Archer + Shami",
    title: "Core balance · Archer + Shami",
    purpose: "Core balance / Archer + Shami",
    startingXI: baseXI,
    conditionalAcquisitions: [],
    medicalRestrictions: [],
    alternatives: [
      {
        primaryPlayer: "Ravi Bishnoi",
        alternativePlayer: "Yash Raj Punja",
        role: "Right-arm leg-spin",
        reason:
          "Conditions and matchup alternative; Punja offers development exposure on slower tracks.",
      },
      {
        primaryPlayer: "Nandre Burger",
        alternativePlayer: "Sandeep Sharma",
        role: "Pace control",
        reason:
          "Indian seam control option allows fielding an additional overseas batter or utility player.",
      },
    ],
    benchOptions: [
      "Sandeep Sharma",
      "Yash Raj Punja",
      "Manimaran Siddharth",
      "Brijesh Sharma",
      "Sushant Mishra",
      "Dasun Shanaka",
      "Lhuan-dre Pretorius",
      "Aman Rao Perala",
    ],
    why: "Archer leads the pace group; Shami adds an Indian new-ball option. Burger's left-arm angle is available when the matchup warrants it. Bishnoi provides the wrist-spin choice.",
    trade:
      "Three overseas starters. Nehal is a target, not retained; keep Shubham at No.5 unless a signing is made. Sandeep, Siddharth and Punja stay available by conditions.",
    newBall: "Archer + Shami; Burger can rotate in",
    middle: "Bishnoi, Jadeja; Punja / Siddharth by matchup",
    death:
      "Role plan around Archer, with Sandeep as a phase-control option; no yorker accuracy claim",
    batImpact: "Batter from retained bench if chasing",
    bowlImpact: "Sandeep or Siddharth by surface",
    fallback:
      "If Nehal is not signed, retain Shubham Dubey or select another verified Indian No.4–6 option.",
    sourceAttribution: "reconciled",
    reconciliationNotes: [
      "Deconstructed JSON string 'Ravi Bishnoi or Yash Raj Punja' into structured alternative.",
      "Reconciled overseas count to 3 starters (Ferreira, Archer, Burger), leaving Shanaka as reserve.",
    ],
  },
  {
    id: "boult",
    name: "New-ball Squeeze · Boult",
    title: "New-ball squeeze · Boult",
    purpose: "Jaipur / new-ball swing",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Shubham Dubey",
      "Donovan Ferreira",
      "Dasun Shanaka",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Trent Boult",
      "Mohammed Shami",
    ],
    conditionalAcquisitions: [
      {
        playerName: "Trent Boult",
        condition: "Hypothetical acquisition (auction registration unverified)",
        isRegistered: false,
      },
    ],
    medicalRestrictions: [],
    alternatives: [
      {
        primaryPlayer: "Dasun Shanaka",
        alternativePlayer: "Ravindra Jadeja",
        role: "All-rounder",
        reason:
          "Replaces Shanaka with Jadeja to drop overseas count to 3 if powerplay conditions demand Indian spin.",
      },
    ],
    benchOptions: [
      "Nandre Burger",
      "Ravindra Jadeja",
      "Sandeep Sharma",
      "Yash Raj Punja",
      "Manimaran Siddharth",
      "Sushant Mishra",
    ],
    why: "Archer + Boult attack with the new ball; Shami supports the Indian seam group. Boult's supplied role readout is powerplay-heavy (61.2%); death share is 17.3%.",
    trade:
      "Ferreira + Archer + Boult + Shanaka use all four overseas XI places; Burger is benched. Shanaka is included only for his all-round contribution. Boult had 2 wickets at 11.63 economy in IPL 2026 and is not the death solution.",
    newBall: "Archer + Boult + Shami",
    middle: "Bishnoi + Jadeja; Shanaka only if his all-round role earns the slot",
    death:
      "Plan Archer / Sandeep or a separately registered death option; execution metrics not supplied",
    batImpact: "Retained batting option",
    bowlImpact: "Sandeep Sharma",
    fallback:
      "If Boult is not registered or role/value does not fit, keep a distinct death-specific plan; do not substitute an assumed role.",
    sourceAttribution: "reconciled",
    reconciliationNotes: [
      "Reconciled with JSON pp_swing scenario where Shanaka was in overseas_xi but omitted from starting_xi.",
    ],
  },
  {
    id: "death",
    name: "Dedicated Death Attack · Pathirana Gate",
    title: "Dedicated death attack · Pathirana gate",
    purpose: "Death-strike attack",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Shubham Dubey",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Matheesha Pathirana",
      "Nandre Burger",
    ],
    conditionalAcquisitions: [
      {
        playerName: "Matheesha Pathirana",
        condition: "Conditional planning model (unverified registration; medical review required)",
        isRegistered: false,
        requiresMedicalClearance: true,
      },
    ],
    medicalRestrictions: [
      "Matheesha Pathirana requires independent medical clearance following hamstring surgery; registration unverified.",
    ],
    alternatives: [
      {
        primaryPlayer: "Matheesha Pathirana",
        alternativePlayer: "Sushant Mishra",
        role: "Death pace",
        reason: "Fallback Indian pace depth when medical clearance is not modeled.",
      },
      {
        primaryPlayer: "Nandre Burger",
        alternativePlayer: "Mohammed Shami",
        role: "Fast bowling",
        reason: "Indian pace control allows Pathirana + Archer as the sole overseas bowlers.",
      },
    ],
    benchOptions: [
      "Mohammed Shami",
      "Sandeep Sharma",
      "Yash Raj Punja",
      "Manimaran Siddharth",
      "Sushant Mishra",
      "Dasun Shanaka",
    ],
    why: "Archer and Pathirana form the proposed overseas pace pair; Ferreira remains the third overseas player. Nandre Burger can be the optional fourth overseas role; if that adds no value, keep the slot unused and choose Indian seam depth.",
    trade:
      "Pathirana remains excluded from actual targets. Analyst review checkbox models hypothetical scenarios only, not confirmed medical clearance or auction registration. Shami / Sandeep rotate in for Indian control.",
    newBall: "Archer + Shami or Burger",
    middle: "Bishnoi + Jadeja",
    death: "Pathirana only after medical clearance; no clearance is asserted",
    batImpact: "Retained batting option",
    bowlImpact: "Sandeep Sharma",
    fallback:
      "If Pathirana fails medical clearance: Mustafizur only if cleared and registered, otherwise another registered pace alternative.",
    sourceAttribution: "reconciled",
    reconciliationNotes: [
      "Reconciled with JSON death_strike scenario.",
      "Clear gate replacement fallback: Sushant Mishra.",
    ],
  },
  {
    id: "mustafizur",
    name: "Left-arm Variation · Mustafizur",
    title: "Left-arm variation · Mustafizur",
    purpose: "Left-arm variation / Mustafizur",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Shubham Dubey",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Mustafizur Rahman",
      "Nandre Burger",
    ],
    conditionalAcquisitions: [
      {
        playerName: "Mustafizur Rahman",
        condition: "Conditional planning model (unverified registration; medical review required)",
        isRegistered: false,
        requiresMedicalClearance: true,
      },
    ],
    medicalRestrictions: [
      "Mustafizur Rahman requires medical verification; registration unverified.",
    ],
    alternatives: [
      {
        primaryPlayer: "Mustafizur Rahman",
        alternativePlayer: "Sushant Mishra",
        role: "Left-arm variation",
        reason: "Retained Indian left-arm pace alternative if Mustafizur is not registered or fit.",
      },
    ],
    benchOptions: [
      "Mohammed Shami",
      "Sandeep Sharma",
      "Yash Raj Punja",
      "Manimaran Siddharth",
      "Dasun Shanaka",
      "Sushant Mishra",
    ],
    why: "Three overseas options plus Ferreira give variation across phases; Mustafizur supplies cutters/left-arm pace while Burger offers another angle.",
    trade:
      "Mustafizur is not statistically equivalent to Pathirana: supplied IPL-only death economy 10.28 versus 8.80, with different sample sizes. Registration and current medical status remain unverified.",
    newBall: "Archer + Burger; Shami as Indian alternative",
    middle: "Bishnoi + Jadeja",
    death: "Mustafizur phase option; medical review required",
    batImpact: "Shubham / retained batter",
    bowlImpact: "Shami or Sandeep",
    fallback:
      "Use only if Mustafizur is registered and medically cleared; otherwise choose a registered pace alternative.",
    sourceAttribution: "reconciled",
    reconciliationNotes: [
      "Reconciled with JSON variation scenario.",
      "Clear gate replacement fallback: Sushant Mishra.",
    ],
  },
  {
    id: "spin",
    name: "Slow Pitch · Middle-over Choke",
    title: "Slow pitch · middle-over choke",
    purpose: "Slow / turning surface",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Shubham Dubey",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Manimaran Siddharth",
      "Jofra Archer",
      "Mohammed Shami",
    ],
    conditionalAcquisitions: [],
    medicalRestrictions: [],
    alternatives: [
      {
        primaryPlayer: "Manimaran Siddharth",
        alternativePlayer: "Yash Raj Punja",
        role: "Spin bowler",
        reason: "Right-arm leg-spin variation vs left-arm orthodox.",
      },
    ],
    benchOptions: [
      "Nandre Burger",
      "Sandeep Sharma",
      "Yash Raj Punja",
      "Brijesh Sharma",
      "Sushant Mishra",
      "Dasun Shanaka",
    ],
    why: "Jadeja + Bishnoi + Siddharth add three Indian spin options, with pace selected around Archer and Shami.",
    trade:
      "No forced overseas spin purchase. Hasaranga stays conditional on medical/workload review and showing value beyond Bishnoi, Punja, Jadeja and Siddharth.",
    newBall: "Archer + Shami",
    middle: "Jadeja + Bishnoi + Siddharth; Punja alternative",
    death: "Retained pace roles; exact role depends on match plan",
    batImpact: "Retained batter",
    bowlImpact: "Yash Raj Punja / spin option",
    fallback:
      "Use existing Indian spin depth if Hasaranga's review or role comparison does not pass.",
    sourceAttribution: "ui_defined",
  },
  {
    id: "repair",
    name: "Batting Collapse · Innings Repair",
    title: "Batting collapse · innings repair",
    purpose: "Batting collapse / innings repair",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Nehal Wadhera",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Mohammed Shami",
      "Nandre Burger",
    ],
    conditionalAcquisitions: [
      {
        playerName: "Nehal Wadhera",
        condition: "Hypothetical acquisition (auction registration unverified)",
        isRegistered: false,
      },
    ],
    medicalRestrictions: [],
    alternatives: [
      {
        primaryPlayer: "Nehal Wadhera",
        alternativePlayer: "Shubham Dubey",
        role: "Middle-order batter",
        reason: "Retained Indian middle-order hitter if Nehal is not acquired.",
      },
    ],
    benchOptions: [
      "Shubham Dubey",
      "Sandeep Sharma",
      "Yash Raj Punja",
      "Manimaran Siddharth",
      "Brijesh Sharma",
      "Sushant Mishra",
      "Dasun Shanaka",
    ],
    why: "The top four stay intact; a left-hand No.5 repair option sits before retained lower-order hitter Ferreira and Jadeja.",
    trade:
      "Nehal is preferred for a No.4–5 innings-repair vacancy, but his 59 pressure-gated balls are below P1 eligibility. Shahrukh is a different No.6–7 power profile, not the preferred repair role.",
    newBall: "Archer + Shami",
    middle: "Bishnoi + Jadeja",
    death: "Archer / Sandeep by phase plan",
    batImpact: "Retained hitter / wicketkeeper option",
    bowlImpact: "Sandeep Sharma",
    fallback:
      "If Nehal is not acquired, use retained Shubham Dubey or a verified Indian No.4–6 role-fit player.",
    sourceAttribution: "ui_defined",
  },
  {
    id: "overseas",
    name: "Four-Overseas Alternative",
    title: "Four-overseas alternative",
    purpose: "Overseas-lean alternative",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Shubham Dubey",
      "Donovan Ferreira",
      "Ravindra Jadeja",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Nandre Burger",
      "Dasun Shanaka",
    ],
    conditionalAcquisitions: [],
    medicalRestrictions: [],
    alternatives: [
      {
        primaryPlayer: "Dasun Shanaka",
        alternativePlayer: "Mohammed Shami",
        role: "Seam all-rounder vs Indian pacer",
        reason: "Benches Shanaka to deploy 3 overseas starters and add Shami to the pace group.",
      },
    ],
    benchOptions: [
      "Mohammed Shami",
      "Sandeep Sharma",
      "Yash Raj Punja",
      "Manimaran Siddharth",
      "Brijesh Sharma",
      "Sushant Mishra",
    ],
    why: "Ferreira + Archer + Burger + Shanaka use four overseas XI places; Shanaka earns selection only when his all-round role contributes.",
    trade:
      "Four overseas slots are full. Adding Boult or Pathirana means Burger, Shanaka or another overseas player must leave. Three overseas is also a valid choice.",
    newBall: "Archer + Burger + Shami from Indian options",
    middle: "Bishnoi + Jadeja / Siddharth",
    death: "Archer with Indian phase support; no execution forecast",
    batImpact: "Indian retained batting option",
    bowlImpact: "Sandeep / Siddharth / Shami",
    fallback:
      "If a second overseas strike bowler enters, bench Burger or Shanaka based on the role—not overseas quota.",
    sourceAttribution: "ui_defined",
  },
  {
    id: "highscore",
    name: "Chase / High-Scoring Surface",
    title: "Chase / high-scoring surface",
    purpose: "Chasing / high-scoring surface",
    startingXI: [
      "Vaibhav Sooryavanshi",
      "Yashasvi Jaiswal",
      "Riyan Parag",
      "Dhruv Jurel",
      "Shubham Dubey",
      "Donovan Ferreira",
      "Dasun Shanaka",
      "Ravi Bishnoi",
      "Jofra Archer",
      "Mohammed Shami",
      "Sandeep Sharma",
    ],
    conditionalAcquisitions: [],
    medicalRestrictions: [],
    alternatives: [
      {
        primaryPlayer: "Dasun Shanaka",
        alternativePlayer: "Ravindra Jadeja",
        role: "All-rounder",
        reason: "Restore Jadeja for spin control if the surface grips.",
      },
    ],
    benchOptions: [
      "Ravindra Jadeja",
      "Nandre Burger",
      "Yash Raj Punja",
      "Manimaran Siddharth",
      "Brijesh Sharma",
      "Sushant Mishra",
    ],
    why: "Keep retained power hitters and choose a bowling group explicitly; three overseas starters leave one XI overseas place unused.",
    trade:
      "Dropping an extra specialist bowler reduces bowling coverage. The trade is shown rather than hidden; Shanaka is role-selected, not quota-selected.",
    newBall: "Archer + Shami",
    middle: "Bishnoi + Parag option",
    death: "Archer / Sandeep roles; choose phase cover before prioritising another hitter",
    batImpact: "Top-order collapse: retained stabilising option",
    bowlImpact: "Extra seam option if defending",
    fallback: "Restore a specialist bowler if the pitch or opposition increases bowling demand.",
    sourceAttribution: "ui_defined",
  },
];

export function getNormalizedScenario(id: string): NormalizedScenario | undefined {
  return NORMALIZED_SCENARIOS.find((s) => s.id === id);
}
