import { compareHistoricalTieBreak, getHistoricalPlayerEvidence, getHistoricalVenueEvidence } from "@/domain/historical-impact";
/**
 * Known venue IDs in the uploaded IPL 2022–2026 archive. The source archive
 * contains numeric venue IDs but no official venue-name dimension. These
 * names are analyst-curated mappings based on repeated home-team concentration
 * and are labelled with their evidence/confidence in the historical profile.
 * No physical pitch type is inferred from a ground name.
 */
export const HISTORICAL_VENUE_OPTIONS = [
    { venue: "Wankhede Stadium, Mumbai", aliases: ["wankhede", "wankhede stadium", "wankhede mumbai"], venueId: 3 },
    { venue: "M. A. Chidambaram Stadium (Chepauk), Chennai", aliases: ["chepauk", "chepauk chennai", "chidambaram", "m a chidambaram", "m. a. chidambaram", "m a chidambaram chennai"], venueId: 1 },
    { venue: "Sawai Mansingh Stadium, Jaipur", aliases: ["sawai mansingh", "sms stadium", "sawai mansingh stadium", "jaipur"], venueId: 6 },
    { venue: "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow", aliases: ["ekana", "ekana lucknow", "atal bihari vajpayee ekana"], venueId: 3272 },
    { venue: "Himachal Pradesh Cricket Association Stadium, Dharamshala", aliases: ["hpca", "hpca dharamshala", "dharamshala", "dharamsala"], venueId: 48 },
    { venue: "M. Chinnaswamy Stadium, Bengaluru", aliases: ["chinnaswamy", "m chinnaswamy"], venueId: 2 },
    { venue: "Arun Jaitley Stadium, Delhi", aliases: ["arun jaitley", "feroz shah kotla"], venueId: 7 },
    { venue: "Eden Gardens, Kolkata", aliases: ["eden gardens"], venueId: 8 },
    { venue: "Rajiv Gandhi International Stadium, Hyderabad", aliases: ["rajiv gandhi international", "uppal"], venueId: 10 },
    { venue: "Narendra Modi Stadium, Ahmedabad", aliases: ["narendra modi stadium", "motera"], venueId: 49 },
    { venue: "Punjab Cricket Association IS Bindra Stadium, Mohali", aliases: ["is bindra", "bindra stadium", "mohali"], venueId: 79 },
    { venue: "Maharaja Yadavindra Singh International Cricket Stadium, Mullanpur", aliases: ["mullanpur", "new chandigarh"], venueId: 3692 },
    { venue: "Barsapara Cricket Stadium, Guwahati", aliases: ["barsapara", "guwahati"], venueId: 1241 },
    { venue: "ACA-VDCA Cricket Stadium, Visakhapatnam", aliases: ["aca vdca", "visakhapatnam", "vizag"], venueId: 101 },
];
export function getHistoricalVenueOption(venue) {
    const normalized = venue.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!normalized)
        return null;
    return HISTORICAL_VENUE_OPTIONS.find((option) => {
        const keys = [option.venue, ...option.aliases].map((value) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim());
        return keys.includes(normalized);
    }) ?? null;
}
export function resolveVenueSurface(venue, selection) {
    const preset = getHistoricalVenueOption(venue);
    if (selection !== "venue-default") {
        return {
            surface: selection,
            source: "analyst-override",
            preset,
            note: `Manual ${selection.replaceAll("-", " ")} surface assumption overrides broad role-balance preferences. Historical player/venue evidence remains separate; this is not a retrieved match-day pitch report.`,
        };
    }
    const historicalVenue = getHistoricalVenueEvidence(venue, "middle");
    if (!historicalVenue) {
        return {
            surface: "neutral",
            source: "neutral-fallback",
            preset: null,
            note: "No mapped historical IPL ground profile is available. Neutral role balance is used until an analyst selects a surface assumption.",
        };
    }
    return {
        // A venue record is not a pitch report. Keep role balance neutral unless
        // an analyst explicitly selects a physical-surface scenario.
        surface: "neutral",
        source: "historical-venue-profile",
        preset,
        note: `${historicalVenue.name}: ${historicalVenue.matches} usable IPL matches in the 2022–2026 archive. Player-specific phase/ground evidence can inform close recommendations where sample thresholds pass; no surface type is inferred from historical scores.`,
    };
}
/** IPL squad constraints are distinct from strategic XI-planning heuristics. */
export const MAX_SQUAD_SIZE = 25;
export const MAX_OVERSEAS_SQUAD_SIZE = 8;
export const MAX_OVERSEAS_XI = 4;
/** The continuity policy caps positional changes in a proposed starting XI. It is not an auction rule. */
export const MAX_XI_CHANGES_FROM_REFERENCE = 2;
/** Six positions (5–9 and 11) are flexible in the reference XI. */
export const MAX_FLEXIBLE_XI_CHANGES = 6;
/**
 * Converts a selected surface scenario into a broad bowling-role preference.
 * This is only a planning assumption; it is not a pitch report or a player
 * performance prediction.
 */
export function surfaceBowlingPreference(surface) {
    if (surface === "slow" || surface === "dry")
        return "spin";
    if (surface === "dew" || surface === "pace-friendly" || surface === "bouncy")
        return "pace";
    return "balanced";
}
/**
 * Builds one consistent context object from the analyst's current selections.
 * Venue is never inferred from the opponent: fixtures/venue feeds are not
 * bundled, so a supplied venue string is explicitly labelled analyst input.
 */
export function deriveMatchContext(input) {
    const venue = input.venue?.trim() ?? "";
    return {
        surface: input.surface,
        opposition: input.opposition,
        objective: input.objective,
        venue,
        venueEvidence: venue ? "analyst-input" : "unavailable",
    };
}
const CORE = [
    "Vaibhav Sooryavanshi",
    "Yashasvi Jaiswal",
    "Riyan Parag",
    "Dhruv Jurel",
    "Donovan Ferreira",
    "Ravindra Jadeja",
    "Jofra Archer",
];
/**
 * The starting combination is a continuity reference, not a locked template.
 * The middle/lower block (5–8) and the two specialist bowling slots (9/11)
 * can move when a role fit or availability change justifies it.
 */
const REFERENCE_FLEX = {
    5: "Shubham Dubey",
    6: "Donovan Ferreira",
    7: "Dasun Shanaka",
    8: "Ravindra Jadeja",
    9: "Ravi Bishnoi",
    11: "Mohammed Shami",
};
/** The opening/top-four spine and strike-pace anchor are held by default. */
const CORE_POSITIONS = {
    "Vaibhav Sooryavanshi": 1,
    "Yashasvi Jaiswal": 2,
    "Riyan Parag": 3,
    "Dhruv Jurel": 4,
    "Jofra Archer": 10,
};
function textOf(player) {
    return `${player.role} ${player.lineupRole ?? ""} ${player.primaryRole ?? ""} ${player.secondaryRole ?? ""} ${player.bowlingStyle ?? ""}`.toLowerCase();
}
function has(player, ...terms) {
    const text = textOf(player);
    return terms.some((term) => text.includes(term));
}
function hasCapability(player, tag, ...legacyTerms) {
    if (player.roleTags !== undefined)
        return player.roleTags.includes(tag);
    return has(player, ...legacyTerms);
}
function isOpener(player) {
    return hasCapability(player, "opener", "opening batter", "opener");
}
function isTopOrder(player) {
    return isOpener(player) || hasCapability(player, "top-order", "top-order", "no.3", "no.4");
}
function isMiddleOrder(player) {
    return hasCapability(player, "middle-order", "middle-order", "middle order", "no.5", "no.4–6", "no.4-6", "stabilizer", "stabiliser", "floater", "innings repair", "anchor");
}
function isRepairBatter(player) {
    return hasCapability(player, "repair-batter", "middle-order anchor", "stabilizer", "stabiliser", "innings repair", "no.5", "no.4–6", "no.4-6", "floater");
}
function isLowerOrder(player) {
    return hasCapability(player, "lower-order", "lower-order", "lower order", "finisher", "hitter", "no.6", "no.7", "domestic finishing");
}
function isFinisher(player) {
    return hasCapability(player, "finisher", "finisher", "hitter", "lower-order finisher");
}
function isKeeper(player) {
    return hasCapability(player, "wicketkeeper", "wicketkeeper", "wicket-keeper", "keeper-batter", "keeper batter");
}
function isAllRounder(player) {
    return hasCapability(player, "all-rounder", "all-rounder", "allrounder", "all rounder", "batting_all_rounder", "batting all-rounder", "batting all rounder");
}
function isSpin(player) {
    return hasCapability(player, "spin", "spin", "orthodox", "leg-spin", "leg spin", "off-spin", "off spin");
}
function isPace(player) {
    return hasCapability(player, "pace", "fast", "pace", "seam", "medium-fast", "medium fast", "medium pace", "sling");
}
function isDeathSpecialist(player) {
    return hasCapability(player, "death-specialist", "death_specialist", "death specialist", "death-overs", "death overs", "death-depth", "death depth");
}
function isPowerplaySpecialist(player) {
    return hasCapability(player, "powerplay-specialist", "powerplay_specialist", "powerplay specialist", "new-ball", "new ball");
}
function isVariationSpecialist(player) {
    return hasCapability(player, "variation-specialist", "variation specialist", "cutter", "slower ball");
}
function isLeftArm(player) {
    return hasCapability(player, "left-arm", "left-arm", "left arm");
}
function isRightArm(player) {
    return hasCapability(player, "right-arm", "right-arm", "right arm");
}
function isMedicalBlocked(player, cleared) {
    return player.medicalRestriction === "MEDICAL_REVIEW" && !cleared.has(player.name);
}
function isMarketBlocked(player) {
    if (!player.isRetained && !player.marketStatus)
        return true;
    return ["UNAVAILABLE", "INELIGIBLE_MARKET", "MARKET_STATUS_UNRESOLVED", "RETAINED_OTHER_FRANCHISE", "RR_RETAINED"].includes(player.marketStatus ?? "");
}
/** True only for a non-retained profile that is valid for a hypothetical package. */
export function canUseHypotheticalTarget(player, medicalClearanceAssumptions = []) {
    if (player.isRetained)
        return false;
    return !isMarketBlocked(player) && !isMedicalBlocked(player, new Set(medicalClearanceAssumptions));
}
function clampFlexibleChangeLimit(value) {
    if (value === undefined || !Number.isFinite(value))
        return MAX_XI_CHANGES_FROM_REFERENCE;
    return Math.max(0, Math.min(MAX_FLEXIBLE_XI_CHANGES, Math.floor(value)));
}
function roleFitForPosition(player, position, context) {
    const opener = isOpener(player);
    const top = isTopOrder(player);
    const middle = isMiddleOrder(player);
    const lower = isLowerOrder(player);
    const keeper = isKeeper(player);
    const allrounder = isAllRounder(player);
    const spin = isSpin(player);
    const pace = isPace(player);
    let score = 0;
    switch (position) {
        case 1:
        case 2:
            score = opener ? 100 : top ? 75 : middle ? 25 : 0;
            break;
        case 3:
            score = middle ? 95 : top ? 75 : allrounder ? 45 : 0;
            break;
        case 4:
            score = keeper && (top || middle) ? 95 : middle ? 90 : top ? 65 : 0;
            break;
        case 5:
            score = middle ? 100 : allrounder ? 82 : lower ? 68 : keeper ? 45 : top ? 35 : 0;
            if (context.opposition === "spin-heavy" && middle)
                score += 7;
            if (context.objective === "middle-order-cover" && middle)
                score += 12;
            break;
        case 6:
            score = lower ? 95 : allrounder ? 92 : middle ? 70 : keeper ? 35 : 0;
            break;
        case 7:
            score = allrounder ? 105 : lower ? 92 : middle ? 65 : (spin || pace) ? 15 : 0;
            if (context.objective === "middle-order-cover" && (allrounder || lower))
                score += 10;
            break;
        case 8:
            score = allrounder && spin ? 100 : spin ? 92 : allrounder ? 80 : lower ? 35 : 0;
            break;
        case 9: {
            const surfacePreference = surfaceBowlingPreference(context.surface);
            if (surfacePreference === "spin")
                score = spin ? 112 : pace ? 48 : allrounder ? 30 : 0;
            else if (surfacePreference === "pace")
                score = pace ? (context.surface === "dew" ? 92 : 105) : spin ? 55 : allrounder ? 30 : 0;
            else
                score = spin ? 100 : pace ? 78 : allrounder ? 35 : 0;
            // Slot 9 may be a specialist bowler in a three-seamer combination. It is
            // not hard-wired to spin; the chosen role objective decides the trade-off.
            if (context.objective === "spin-control" && spin)
                score += 12;
            if (context.objective === "pace-depth" && pace)
                score += 10;
            if (context.objective === "specialist-death-option" && isDeathSpecialist(player))
                score = Math.max(score + 36, 164);
            if (context.opposition === "left-hand-heavy" && has(player, "off-spin", "right-arm off-spin"))
                score += 6;
            break;
        }
        case 10:
            score = isPace(player) ? 110 : isSpin(player) ? 28 : 0;
            if (isDeathSpecialist(player))
                score += 8;
            if (context.objective === "specialist-death-option" && isDeathSpecialist(player))
                score += 24;
            if (isPowerplaySpecialist(player) && context.surface === "pace-friendly")
                score += 6;
            if ((context.objective === "pace-depth" || context.objective === "injury-resilience") && isPace(player) && !player.isRetained && !player.overseas)
                score += 24;
            break;
        case 11:
            score = pace ? 112 : spin ? 48 : 0;
            if (isDeathSpecialist(player))
                score += 10;
            if (context.objective === "specialist-death-option" && isDeathSpecialist(player))
                score += 36;
            if (isPowerplaySpecialist(player) && context.surface === "pace-friendly")
                score += 5;
            if ((context.objective === "pace-depth" || context.objective === "injury-resilience") && pace && !player.isRetained && !player.overseas)
                score += 24;
            break;
        default:
            score = 0;
    }
    const surfacePreference = surfaceBowlingPreference(context.surface);
    if (surfacePreference === "spin" && spin && position >= 8)
        score += 5;
    if (surfacePreference === "pace" && pace && position >= 9)
        score += 4;
    if (context.opposition === "pace-heavy" && (middle || allrounder) && position >= 4 && position <= 7)
        score += 4;
    if (context.opposition === "spin-heavy" && (middle || lower) && position >= 5 && position <= 7)
        score += 5;
    return score;
}
function roleSummary(players) {
    return {
        topOrder: players.filter(isTopOrder).length,
        middleOrder: players.filter(isMiddleOrder).length,
        lowerOrder: players.filter(isLowerOrder).length,
        wicketkeepers: players.filter(isKeeper).length,
        paceOptions: players.filter(isPace).length,
        spinOptions: players.filter(isSpin).length,
        allRounders: players.filter(isAllRounder).length,
        deathOptions: players.filter(isDeathSpecialist).length,
        powerplayOptions: players.filter(isPowerplaySpecialist).length,
        leftArmPaceOptions: players.filter((p) => isPace(p) && isLeftArm(p)).length,
        overseas: players.filter((p) => p.overseas).length,
    };
}
function makeContextNote(context) {
    if (context.venueEvidence === "unavailable") {
        return `Venue: ${context.venue || "not specified"}. No current source-backed pitch report is present in the supplied project, so venue-specific weighting is not claimed. ${context.surface === "neutral" ? "Neutral surface weighting is applied." : `The ${context.surface} surface setting is an analyst input, not a retrieved pitch fact.`}`;
    }
    return `Venue: ${context.venue || "not specified"}. ${context.venueEvidence === "supplied" ? "Venue context comes from supplied project data." : "Surface context is an analyst input."}`;
}
function buildReasons(assigned, context, coverage) {
    const reasons = [];
    const tradeOffs = [];
    const players = assigned.map((item) => item.player);
    const selected = new Set(players.map((p) => p.name));
    const numberFive = assigned.find((item) => item.position === 5)?.player;
    const numberSeven = assigned.find((item) => item.position === 7)?.player;
    const lowerOrderSupport = players.filter((p) => isLowerOrder(p) || isAllRounder(p));
    const paceNames = players.filter(isPace).map((p) => p.name);
    const spinNames = players.filter(isSpin).map((p) => p.name);
    const topFour = ["Vaibhav Sooryavanshi", "Yashasvi Jaiswal", "Riyan Parag", "Dhruv Jurel"];
    const topFourPresent = topFour.filter((name) => selected.has(name));
    if (topFourPresent.length === 4) {
        reasons.push("The retained top-four spine is intact: Vaibhav, Jaiswal, Parag and Jurel.");
    }
    else {
        reasons.push(`The top-four availability assumption changes the normal core: ${topFourPresent.length}/4 retained top-four players remain selected.`);
    }
    const flexibleBlock = players.filter((p) => isMiddleOrder(p) || isLowerOrder(p) || isAllRounder(p)).map((p) => p.name);
    if (flexibleBlock.length)
        reasons.push(`The selected flexible 4–8 batting resources are ${flexibleBlock.join(", ")}. Their entry order can change by match state; the XI does not assume a fixed No.5–8 sequence.`);
    if (selected.has("Jofra Archer"))
        reasons.push("Jofra Archer anchors the selected strike-pace group; other bowling places remain open to conditions and availability.");
    else
        reasons.push("Jofra Archer is unavailable in this scenario; the engine has to cover the missing strike-pace role from the selected squad and acquisitions.");
    if (numberFive)
        reasons.push(`${numberFive.name} is assigned at No.5 as the selected middle-order option; this is role coverage, not a projected runs improvement.`);
    if (numberSeven)
        reasons.push(`${numberSeven.name} is assigned at No.7 to keep the lower-order/all-round role visible above the specialist bowling slots.`);
    if (lowerOrderSupport.length)
        reasons.push(`Lower-order/all-round coverage comes from ${lowerOrderSupport.map((p) => p.name).join(", ")}. These are the selected players actually present in this XI, not a generic squad list.`);
    if (paceNames.length)
        reasons.push(`Available pace resources are ${paceNames.join(", ")}. This preserves more than one route to pace cover rather than relying on a single specialist.`);
    if (spinNames.length)
        reasons.push(`Spin coverage is supplied by ${spinNames.join(", ")}; the surface setting changes the balance preference, not a claimed player-vs-pitch success rate.`);
    if (coverage.deathOptions > 0)
        reasons.push(`${coverage.deathOptions} selected player${coverage.deathOptions === 1 ? " has" : "s have"} an explicit specialist death-bowling role tag in the supplied profile data.`);
    else
        reasons.push("No selected player has an explicit specialist death-bowling role tag; the XI still needs a documented death-over plan and should not infer execution from pace alone.");
    if (context.objective === "pace-depth")
        reasons.push("The selected objective favours Indian pace depth and rotation; the engine does not label Avesh or Akash a statistically proven upgrade over retained bowlers.");
    if (context.objective === "specialist-death-option")
        reasons.push("The selected objective tests a specialist death-bowling combination. Pathirana is only considered after the separate medical assumption; this is not official clearance or registration.");
    if (context.objective === "middle-order-cover")
        reasons.push("The selected objective tests an additional No.5/6 option against RR's existing Ferreira, Dubey and Shanaka resources.");
    if (context.surface === "slow" || context.surface === "dry")
        reasons.push("The analyst-selected slower/drier surface setting increases the value of an additional spin role in the combination.");
    if (context.surface === "dew")
        reasons.push("The analyst-selected dew setting favours pace flexibility relative to spin; this is a tactical assumption, not a measured Jaipur forecast.");
    if (context.opposition !== "balanced")
        reasons.push(`The ${context.opposition.replaceAll("-", " ")} opposition profile changes role-balance preferences only; player-specific matchup outcomes are not available in the source pack.`);
    const acquisitions = players.filter((p) => !p.isRetained);
    if (acquisitions.length) {
        reasons.push(`This XI uses ${acquisitions.length} explicitly selected hypothetical acquisition${acquisitions.length > 1 ? "s" : ""}: ${acquisitions.map((p) => p.name).join(", ")}.`);
        tradeOffs.push("Selected acquisitions remain hypothetical: registration/availability must be confirmed before they can be treated as actionable squad members.");
    }
    if (coverage.overseas >= MAX_OVERSEAS_XI)
        tradeOffs.push(`All ${MAX_OVERSEAS_XI} overseas playing-XI places are used; an overseas Impact Player cannot be added under the standard limit.`);
    else
        tradeOffs.push(`${MAX_OVERSEAS_XI - coverage.overseas} overseas playing-XI place${MAX_OVERSEAS_XI - coverage.overseas === 1 ? " remains" : "s remain"} available, but that is not a reason to force another overseas selection.`);
    if (coverage.paceOptions < 4)
        tradeOffs.push("The role map shows fewer than four pace-skill contributors, including all-round pace options. Consider whether the bowling workload is too dependent on the selected specialists.");
    if (coverage.spinOptions < 2)
        tradeOffs.push("Only one spin option is represented. That may be acceptable on a pace-oriented surface but reduces spin rotation if conditions turn slower.");
    if (selected.has("Matheesha Pathirana"))
        tradeOffs.push("Pathirana is included only under an explicit medical-clearance assumption for simulation; that toggle is not official medical clearance or auction registration.");
    return { reasons, tradeOffs };
}
function getSlotRequirements(unavailable) {
    const open = [
        { position: 5, role: "middle-order batting / repair" },
        { position: 6, role: "middle/lower-order batting / all-round flexibility" },
        { position: 7, role: "lower-order batting / all-round flexibility" },
        { position: 8, role: "spin or all-round role" },
        { position: 9, role: "spin or phase-specific bowling" },
        { position: 11, role: "pace / bowling depth" },
    ];
    for (const [name, position] of Object.entries(CORE_POSITIONS)) {
        if (!unavailable.has(name))
            continue;
        const role = position <= 2 ? "opening batting" : position === 4 ? "wicketkeeping / top-order batting" : position === 3 ? "middle-order batting" : position === 6 ? "lower-order batting" : position === 8 ? "spin all-round role" : "strike pace role";
        open.push({ position, role });
    }
    return open.sort((a, b) => a.position - b.position);
}
function validForOpenRole(player, role, position, context) {
    if (role === "opening batting")
        return isOpener(player) || (isTopOrder(player) && isKeeper(player));
    if (role === "wicketkeeping / top-order batting")
        return isKeeper(player) && (isTopOrder(player) || isMiddleOrder(player));
    if (role === "middle-order batting" || role === "middle-order batting / repair")
        return isMiddleOrder(player) || isTopOrder(player) || isAllRounder(player) || isLowerOrder(player);
    if (role === "lower-order batting")
        return isLowerOrder(player) || isAllRounder(player);
    if (role === "middle/lower-order batting / all-round flexibility")
        return isMiddleOrder(player) || isLowerOrder(player) || isAllRounder(player);
    if (role === "spin all-round role")
        return isSpin(player) || isAllRounder(player);
    if (role === "spin or all-round role")
        return isSpin(player) || isAllRounder(player) || (position === 9 && isPace(player));
    if (role === "strike pace role")
        return isPace(player);
    return roleFitForPosition(player, position, context) >= 45;
}
function scoreCombination(assigned, context) {
    const sorted = [...assigned].sort((a, b) => a.position - b.position);
    const players = sorted.map((x) => x.player);
    const coverage = roleSummary(players);
    const warnings = [];
    const rawSlotScore = sorted.reduce((total, item) => total + roleFitForPosition(item.player, item.position, context), 0);
    const positionalFit = Math.round(rawSlotScore / Math.max(1, sorted.length));
    const acquisitions = players.filter((p) => !p.isRetained).length;
    const coreKept = CORE.filter((name) => players.some((p) => p.name === name)).length;
    const referenceOrderBonus = sorted.reduce((total, item) => total + (REFERENCE_FLEX[item.position] === item.player.name ? 1.5 : 0), 0);
    const continuity = Math.round(coreKept * 2.4 + referenceOrderBonus);
    const bowlingBalance = Math.round(Math.min(coverage.paceOptions, 5) * 2.4 + Math.min(coverage.spinOptions, 3) * 2.4);
    const battingDepth = Math.round((coverage.middleOrder >= 2 ? 3 : 0) + (coverage.lowerOrder >= 2 ? 2.5 : 0) + (coverage.wicketkeepers >= 1 ? 1 : -2));
    const overseasOpportunityCost = -Math.round(Math.max(0, coverage.overseas - 3) * 4.5);
    // Merely selecting a recruit is never a positive input. Acquisition count carries
    // a small complexity cost; role fit and objective-specific capability earn value.
    const acquisitionComplexity = -acquisitions * 1.25;
    let objectiveFit = 0;
    if (context.objective === "pace-depth") {
        objectiveFit = players.filter((p) => isPace(p) && !p.overseas).length * 2.2;
    }
    else if (context.objective === "middle-order-cover") {
        objectiveFit = players.filter((p) => (isMiddleOrder(p) || isRepairBatter(p)) && !p.overseas).length * 2.0;
    }
    else if (context.objective === "spin-control") {
        objectiveFit = coverage.spinOptions * 2.8;
    }
    else if (context.objective === "injury-resilience") {
        objectiveFit = players.filter((p) => !p.isRetained && !p.overseas && isPace(p)).length * 4.5
            + players.filter((p) => !p.isRetained && !p.overseas && isKeeper(p)).length * 2;
    }
    else if (context.objective === "specialist-death-option") {
        objectiveFit = coverage.deathOptions * 4.5;
    }
    if (coverage.paceOptions < 2)
        warnings.push("The XI has fewer than two players with a supplied pace role. The bowling attack may lack phase coverage.");
    if (coverage.spinOptions < 1)
        warnings.push("No player in the XI has a supplied spin role. This is a material balance warning.");
    if (coverage.paceOptions < 3)
        warnings.push("The XI has fewer than three pace-skill contributors. Rotation and injury resilience may be thin.");
    if (coverage.spinOptions < 2)
        warnings.push("The XI has only one supplied spin option. That may be acceptable in some conditions but reduces rotation.");
    if (coverage.deathOptions === 0)
        warnings.push("No player carries an explicit specialist death-bowling role tag in the supplied data. Do not infer proven death execution from a general fast-bowler label.");
    if (coverage.powerplayOptions === 0)
        warnings.push("No player carries an explicit powerplay/new-ball specialist tag in the supplied role data.");
    if (coverage.overseas > MAX_OVERSEAS_XI)
        warnings.push(`The XI exceeds the maximum of ${MAX_OVERSEAS_XI} overseas players.`);
    const total = positionalFit + continuity + bowlingBalance + battingDepth + objectiveFit + overseasOpportunityCost + acquisitionComplexity;
    const scoreBreakdown = {
        positionalFit,
        continuity,
        bowlingBalance,
        battingDepth,
        objectiveFit: Math.round(objectiveFit * 10) / 10,
        overseasOpportunityCost,
        acquisitionComplexity,
        total: Math.round(total * 10) / 10,
    };
    return { score: scoreBreakdown.total, scoreBreakdown, coverage, warnings };
}
export function optimizeRRLineups(input) {
    const errors = [];
    const warnings = [];
    const limit = Math.max(1, Math.min(input.limit ?? 3, 5));
    const maxXIChangesFromReference = clampFlexibleChangeLimit(input.maxXIChangesFromReference);
    const unavailable = new Set(input.unavailablePlayers ?? []);
    const medicalClearance = new Set(input.medicalClearanceAssumptions ?? []);
    const retainedRoster = input.retainedPlayers.filter((p) => p.isRetained);
    const retainedNames = retainedRoster.map((p) => p.name);
    const retainedOverseas = retainedRoster.filter((p) => p.overseas).length;
    const invalidRosterReasons = [];
    if (new Set(retainedNames).size !== retainedNames.length)
        invalidRosterReasons.push("The retained roster contains duplicate player names.");
    if (retainedRoster.length > MAX_SQUAD_SIZE)
        invalidRosterReasons.push(`The retained roster exceeds the ${MAX_SQUAD_SIZE}-player squad limit.`);
    if (retainedOverseas > MAX_OVERSEAS_SQUAD_SIZE)
        invalidRosterReasons.push(`The retained roster exceeds the ${MAX_OVERSEAS_SQUAD_SIZE}-player overseas squad limit.`);
    if (invalidRosterReasons.length) {
        return {
            recommendations: [], errors: invalidRosterReasons, warnings: [], permutationsEvaluated: 0, validCombinations: 0,
            contextNote: makeContextNote(input.context), selectedSquadAdditions: [], squadSize: retainedRoster.length,
            overseasSquadCount: retainedOverseas, maxXIChangesFromReference,
        };
    }
    const retained = retainedRoster.filter((p) => !unavailable.has(p.name));
    const targetMap = new Map(input.targetPool.map((p) => [p.name, p]));
    const requestedAcquisitions = [...new Set(input.selectedAcquisitions ?? [])];
    const openSquadPlaces = Math.max(0, MAX_SQUAD_SIZE - retainedRoster.length);
    const overseasPlaces = Math.max(0, MAX_OVERSEAS_SQUAD_SIZE - retainedRoster.filter((p) => p.overseas).length);
    const selectedTargets = [];
    let overseasTargets = 0;
    for (const name of requestedAcquisitions) {
        if (selectedTargets.length >= openSquadPlaces) {
            errors.push(`The retained squad has ${openSquadPlaces} open place${openSquadPlaces === 1 ? "" : "s"}; additional requested profiles are ignored rather than breaking the ${MAX_SQUAD_SIZE}-player squad limit.`);
            break;
        }
        const target = targetMap.get(name);
        if (!target) {
            errors.push(`${name} is not present in the supplied recruitment shortlist.`);
            continue;
        }
        if (isMarketBlocked(target)) {
            errors.push(`${name} has an unresolved, unavailable or ineligible market status and cannot be added to a hypothetical squad.`);
            continue;
        }
        if (isMedicalBlocked(target, medicalClearance)) {
            warnings.push(`${name} remains outside the generated squad until a medical-clearance assumption is explicitly recorded. This assumption is not official clearance.`);
            continue;
        }
        if (target.overseas && overseasTargets >= overseasPlaces) {
            errors.push(`${name} would exceed the ${MAX_OVERSEAS_SQUAD_SIZE}-player overseas squad limit; only ${overseasPlaces} additional overseas place${overseasPlaces === 1 ? "" : "s"} remain.`);
            continue;
        }
        selectedTargets.push({ ...target, isRetained: false });
        if (target.overseas)
            overseasTargets += 1;
    }
    const allPlayers = [...retained, ...selectedTargets];
    const fixed = Object.entries(CORE_POSITIONS).map(([name, position]) => ({ name, position })).filter((item) => !unavailable.has(item.name));
    const fixedProfiles = fixed.map((item) => ({ position: item.position, player: allPlayers.find((p) => p.name === item.name) })).filter((x) => Boolean(x.player));
    const absentCore = fixed.filter((item) => !allPlayers.some((p) => p.name === item.name));
    if (absentCore.length)
        errors.push(`Core player data missing: ${absentCore.map((x) => x.name).join(", ")}.`);
    const slots = getSlotRequirements(unavailable);
    const pool = allPlayers.filter((p) => !fixed.some((c) => c.name === p.name));
    // Build each slot's eligible pool once. The previous implementation ran the
    // same role-text checks at every depth of every permutation, then rejected
    // over-two-change lineups only after reaching the leaf. Pre-filtering and
    // pruning those branches keeps the exhaustive search responsive in-browser.
    const candidatesBySlot = slots.map((slot) => ({
        slot,
        candidates: pool.filter((candidate) => validForOpenRole(candidate, slot.role, slot.position, input.context)),
    }));
    const baseByPosition = new Map();
    for (const [name, position] of Object.entries(CORE_POSITIONS))
        baseByPosition.set(position, name);
    for (const [position, name] of Object.entries(REFERENCE_FLEX))
        baseByPosition.set(Number(position), name);
    const results = [];
    let permutationsEvaluated = 0;
    let validCombinations = 0;
    const assigned = [...fixedProfiles];
    const used = new Set(fixedProfiles.map((x) => x.player.name));
    const fixedOverseas = fixedProfiles.filter((x) => x.player.overseas).length;
    const fixedPace = fixedProfiles.filter((x) => isPace(x.player)).length;
    const fixedSpin = fixedProfiles.filter((x) => isSpin(x.player)).length;
    function visit(depth, overseasCount, paceCount, spinCount, changes) {
        if (depth === candidatesBySlot.length) {
            permutationsEvaluated += 1;
            const sorted = [...assigned].sort((a, b) => a.position - b.position);
            const players = sorted.map((x) => x.player);
            if (players.length !== 11 || new Set(players.map((p) => p.name)).size !== 11)
                return;
            if (overseasCount > MAX_OVERSEAS_XI || paceCount < 2 || spinCount < 1 || changes > maxXIChangesFromReference)
                return;
            const acquisitionsInXI = players.filter((p) => !p.isRetained);
            const scoring = scoreCombination(sorted, input.context);
            validCombinations += 1;
            const baseChanges = sorted.filter((item) => {
                const baseline = baseByPosition.get(item.position);
                return baseline !== undefined && baseline !== item.player.name;
            }).map((item) => `${item.position}. ${item.player.name}`);
            const warningsForXI = [...scoring.warnings];
            for (const p of acquisitionsInXI) {
                warningsForXI.push(`${p.name}: ${p.marketStatusLabel ?? p.marketStatus ?? "market status unverified"}. Treat as a hypothetical option only.`);
            }
            if (players.some((p) => p.name === "Matheesha Pathirana"))
                warningsForXI.push("Pathirana selection depends on independent medical/workload clearance and verified auction registration; the planning assumption does not certify either.");
            const id = players.map((p) => p.name.split(" ").map((part) => part[0]).join("")).join("-");
            results.push({
                id,
                players: sorted,
                selectedAcquisitions: acquisitionsInXI.map((p) => p.name),
                overseasCount,
                corePlayersKept: CORE.filter((name) => players.some((p) => p.name === name)).length,
                roleCoverage: scoring.coverage,
                score: scoring.score,
                scoreBreakdown: scoring.scoreBreakdown,
                reasons: [],
                tradeOffs: [],
                warnings: [...new Set(warningsForXI)],
                changesFromReference: baseChanges,
            });
            return;
        }
        const { slot, candidates } = candidatesBySlot[depth];
        for (const candidate of candidates) {
            if (used.has(candidate.name))
                continue;
            const nextOverseas = overseasCount + Number(candidate.overseas);
            if (nextOverseas > MAX_OVERSEAS_XI)
                continue;
            const nextChanges = changes + Number(baseByPosition.has(slot.position) && baseByPosition.get(slot.position) !== candidate.name);
            if (nextChanges > maxXIChangesFromReference)
                continue;
            const nextPace = paceCount + Number(isPace(candidate));
            const nextSpin = spinCount + Number(isSpin(candidate));
            const remainingSlots = candidatesBySlot.length - depth - 1;
            if (nextPace + remainingSlots < 2 || nextSpin + remainingSlots < 1)
                continue;
            used.add(candidate.name);
            assigned.push({ position: slot.position, player: candidate });
            visit(depth + 1, nextOverseas, nextPace, nextSpin, nextChanges);
            assigned.pop();
            used.delete(candidate.name);
        }
    }
    visit(0, fixedOverseas, fixedPace, fixedSpin, 0);
    results.sort((a, b) => b.score - a.score || b.corePlayersKept - a.corePlayersKept || a.overseasCount - b.overseasCount);
    const unique = [];
    const signatures = new Set();
    const flexiblePositions = [5, 6, 7, 8, 9, 11];
    // Prefer tactically distinct alternatives. The previous top-three selection
    // often returned the same XI three times with only Shami/Sandeep/Brijesh
    // swapped at one slot, which looked like a scenario engine but added little
    // decision value. First pass requires at least two flexible-role differences.
    for (const result of results) {
        const signature = result.players.map((x) => `${x.position}:${x.player.name}`).join("|");
        if (signatures.has(signature))
            continue;
        const byPosition = new Map(result.players.map((entry) => [entry.position, entry.player.name]));
        const meaningfullyDifferent = unique.every((existing) => {
            const existingByPosition = new Map(existing.players.map((entry) => [entry.position, entry.player.name]));
            return flexiblePositions.filter((position) => byPosition.get(position) !== existingByPosition.get(position)).length >= 2;
        });
        if (unique.length === 0 || meaningfullyDifferent) {
            signatures.add(signature);
            unique.push(result);
            if (unique.length === limit)
                break;
        }
    }
    // If the constraints leave fewer than `limit` meaningfully distinct plans,
    // fill remaining places with the next valid unique combinations.
    if (unique.length < limit) {
        for (const result of results) {
            const signature = result.players.map((x) => `${x.position}:${x.player.name}`).join("|");
            if (signatures.has(signature))
                continue;
            signatures.add(signature);
            unique.push(result);
            if (unique.length === limit)
                break;
        }
    }
    if (!unique.length && errors.length === 0) {
        warnings.push("No valid XI was found using the selected squad and role constraints. Check availability assumptions, role cover or selected acquisitions; the engine will not invent a player to fill a gap.");
    }
    const selectedNames = new Set(requestedAcquisitions);
    const usedInTopPlans = new Set(unique.flatMap((plan) => plan.players.map((entry) => entry.player.name)));
    for (const name of selectedNames) {
        if (!usedInTopPlans.has(name)) {
            warnings.push(`${name} was added to the hypothetical pool but does not appear in the generated leading combinations. Selection does not guarantee a starting place; the recruit must improve a role without breaking continuity or constraints.`);
        }
    }
    const recommendations = unique.map((plan) => {
        const explanation = buildReasons(plan.players, input.context, plan.roleCoverage);
        return { ...plan, reasons: explanation.reasons, tradeOffs: explanation.tradeOffs };
    });
    return {
        recommendations,
        errors,
        warnings: [...new Set(warnings)],
        permutationsEvaluated,
        validCombinations,
        contextNote: makeContextNote(input.context),
        selectedSquadAdditions: selectedTargets.map((player) => player.name),
        squadSize: retainedRoster.length + selectedTargets.length,
        overseasSquadCount: retainedOverseas + selectedTargets.filter((player) => player.overseas).length,
        maxXIChangesFromReference,
    };
}
function replacementFit(unavailable, candidate) {
    if (unavailable.name === candidate.name)
        return null;
    let match = 0;
    let aspects = 0;
    if (isPace(unavailable)) {
        aspects++;
        if (isPace(candidate))
            match++;
    }
    if (isSpin(unavailable)) {
        aspects++;
        if (isSpin(candidate))
            match++;
    }
    if (isKeeper(unavailable)) {
        aspects++;
        if (isKeeper(candidate))
            match++;
    }
    if (isOpener(unavailable)) {
        aspects++;
        if (isOpener(candidate))
            match++;
    }
    if (isMiddleOrder(unavailable)) {
        aspects++;
        if (isMiddleOrder(candidate))
            match++;
    }
    if (isLowerOrder(unavailable)) {
        aspects++;
        if (isLowerOrder(candidate))
            match++;
    }
    if (isAllRounder(unavailable)) {
        aspects++;
        if (isAllRounder(candidate))
            match++;
    }
    if (!aspects)
        return null;
    if (match >= Math.max(1, Math.ceil(aspects * 0.75)))
        return "strong";
    if (match > 0)
        return "partial";
    return null;
}
export function assessInjuryCover(unavailablePlayerName, retainedPlayers, targetPool, selectedAcquisitions = [], medicalClearanceAssumptions = []) {
    const unavailablePlayer = retainedPlayers.find((p) => p.name === unavailablePlayerName);
    if (!unavailablePlayer) {
        return { unavailablePlayer: unavailablePlayerName, primaryRole: "Not found in retained roster", options: [], gap: "The selected player is not in the supplied retained roster." };
    }
    const cleared = new Set(medicalClearanceAssumptions);
    const allowedTargets = targetPool.filter((p) => (selectedAcquisitions.includes(p.name) || p.isRetained)
        && !isMarketBlocked(p) && !isMedicalBlocked(p, cleared));
    const options = [...retainedPlayers.filter((p) => p.name !== unavailablePlayerName), ...allowedTargets.filter((p) => !p.isRetained)]
        .map((player) => ({ player, coverage: replacementFit(unavailablePlayer, player) }))
        .filter((row) => Boolean(row.coverage))
        .sort((a, b) => {
        if (a.coverage !== b.coverage)
            return a.coverage === "strong" ? -1 : 1;
        // Show every role-matching option in the selected pool. A short top-five
        // cut could silently hide a cleared specialist simply because several
        // retained Indian backups were sorted ahead of the hypothetical option.
        if (a.player.isRetained !== b.player.isRetained)
            return a.player.isRetained ? -1 : 1;
        return Number(a.player.overseas) - Number(b.player.overseas);
    })
        .map((row) => ({
        player: row.player,
        coverage: row.coverage,
        reason: row.coverage === "strong"
            ? `Shares the supplied primary role characteristics with ${unavailablePlayer.name}. This is role cover, not a claim of equal performance.`
            : `Provides partial role overlap with ${unavailablePlayer.name}; another capability would be lost or need covering elsewhere.`,
    }));
    return {
        unavailablePlayer: unavailablePlayer.name,
        primaryRole: unavailablePlayer.role,
        options,
        gap: options.length ? null : `No like-for-like cover is identifiable in the retained roster and selected hypothetical acquisitions for ${unavailablePlayer.name}.`,
    };
}
function phaseForBalls(balls) {
    if (balls >= 120)
        return "complete";
    if (balls < 36)
        return "powerplay";
    if (balls < 90)
        return "middle";
    return "death";
}
function hasTacticalRole(player, pattern) {
    return (player.tacticalRolesSupported ?? []).some((role) => pattern.test(role));
}
function impactBattingRoleScore(player, requiredRole, opposition, surface) {
    const middle = isMiddleOrder(player);
    const lower = isLowerOrder(player);
    const allrounder = isAllRounder(player);
    const keeper = isKeeper(player);
    const repair = isRepairBatter(player);
    // A keeper label alone is never enough to make a batting recommendation.
    // A finisher/all-rounder is not automatically a collapse-repair specialist.
    if (!middle && !lower && !allrounder)
        return 0;
    let score = 0;
    if (requiredRole === "repair") {
        score = (repair ? 140 : 0) + (middle ? 26 : 0) + (allrounder ? 18 : 0) + (lower ? 8 : 0) + (keeper ? 2 : 0);
        // A lower-order all-rounder can be a partial collapse option when no
        // specialist repair batter is available in the non-XI squad pool. The UI exposes this
        // as a partial fit; it is not silently relabelled as a No.5 anchor.
        if (!repair && allrounder && lower)
            score += 24;
    }
    else if (requiredRole === "accelerate") {
        score = (lower ? 112 : 0) + (allrounder ? 82 : 0) + (middle ? 42 : 0) + (keeper ? 4 : 0);
    }
    else {
        score = (repair ? 96 : 0) + (middle ? 60 : 0) + (allrounder ? 52 : 0) + (lower ? 30 : 0) + (keeper ? 2 : 0);
    }
    // Opposition bowling profile only uses explicit scouting-role tags supplied
    // for a candidate. It does not infer a player-vs-bowler performance split.
    if (opposition === "spin-heavy" && hasTacticalRole(player, /spin disruptor|rotation against spin|spin rotation/i))
        score += 24;
    if (opposition === "pace-heavy" && hasTacticalRole(player, /pace-hitting|against pace|pace disruptor/i))
        score += 18;
    // Surface affects batting suggestions only when the research profile carries
    // a specific tactical tag. It does not infer a batter's performance split.
    if ((surface === "bouncy" || surface === "pace-friendly") && hasTacticalRole(player, /pace-hitting|against pace|pace disruptor/i)) {
        score += requiredRole === "accelerate" ? 20 : 12;
    }
    if ((surface === "slow" || surface === "dry") && hasTacticalRole(player, /spin disruptor|rotation against spin|spin rotation/i)) {
        score += requiredRole === "repair" || requiredRole === "platform" ? 20 : 10;
    }
    return score;
}
function impactBowlingRoleScore(player, input, phase, requiredRate) {
    const pace = isPace(player);
    const spin = isSpin(player);
    const powerplaySpecialist = isPowerplaySpecialist(player);
    const deathSpecialist = isDeathSpecialist(player);
    let score = 0;
    if (phase === "powerplay") {
        score = (pace ? 82 : 0) + (powerplaySpecialist ? 24 : 0) + (spin ? 12 : 0);
    }
    else if (phase === "middle") {
        if (input.surface === "slow" || input.surface === "dry") {
            score = (spin ? 100 : 0) + (pace ? 38 : 0);
        }
        else if (input.surface === "dew") {
            score = (pace ? 78 : 0) + (spin ? 42 : 0);
        }
        else if (input.surface === "bouncy" || input.surface === "pace-friendly") {
            score = (pace ? 96 : 0) + (spin ? 46 : 0);
        }
        else {
            score = (spin ? 76 : 0) + (pace ? 62 : 0);
        }
        // A side that has not taken wickets may need a wicket-taking role, but this
        // adds only a small role preference; it is not a player-outcome prediction.
        if (input.wickets <= 2 && (pace || spin))
            score += 5;
    }
    else if (phase === "death") {
        score = (pace ? 80 : 0) + (deathSpecialist ? 32 : 0) + (spin ? 8 : 0);
    }
    if ((input.surface === "pace-friendly" || input.surface === "bouncy") && pace)
        score += input.surface === "bouncy" ? 14 : 8;
    if (input.surface === "dew" && pace)
        score += 6;
    if ((input.surface === "slow" || input.surface === "dry") && spin)
        score += 8;
    if (input.wickets <= 2 && phase !== "powerplay" && (pace || spin))
        score += 7;
    if ((requiredRate ?? 0) >= 10 && input.wickets <= 4 && (pace || spin))
        score += 6;
    if ((requiredRate ?? 0) <= 7 && input.wickets >= 6 && spin && phase === "middle")
        score += 4;
    return score;
}
function getBattingNeed(input, phase, currentRate, requiredRate) {
    const earlyCollapse = phase === "powerplay" && input.wickets >= 3;
    const spinQualifier = input.opposition === "spin-heavy" ? " with spin-rotation options" : "";
    const paceQualifier = input.opposition === "pace-heavy" ? " against a pace-heavy attack" : "";
    if (input.wickets >= 5 || earlyCollapse) {
        return {
            key: "repair",
            label: `Middle-order repair and batting depth${spinQualifier}`,
            situation: input.innings === "batting-first" ? "First-innings batting resources are under pressure" : "Batting resources are under pressure",
        };
    }
    if (input.innings === "batting-first") {
        if (phase === "death" || (requiredRate ?? 0) >= 9.5) {
            return {
                key: "accelerate",
                label: `Late-innings acceleration with batting cover${paceQualifier}`,
                situation: "First innings: convert the remaining wickets and balls into a stronger finish",
            };
        }
        if (phase === "middle" && input.wickets >= 3 && (currentRate ?? 0) < 7) {
            return {
                key: "repair",
                label: `Middle-over platform repair${spinQualifier}`,
                situation: "First innings: protect the platform after multiple wickets in the middle phase",
            };
        }
        return {
            key: "platform",
            label: `Build the first-innings platform${spinQualifier || paceQualifier}`,
            situation: phase === "powerplay" ? "First innings: establish the platform without overexposing the remaining batting" : "First innings: extend the platform before the acceleration phase",
        };
    }
    if ((requiredRate ?? 0) >= 10 && input.wickets <= 4) {
        return {
            key: "accelerate",
            label: `Lower-order acceleration with batting cover${paceQualifier}`,
            situation: "High required rate with wickets in hand",
        };
    }
    return {
        key: "platform",
        label: `Flexible middle-order support${spinQualifier || paceQualifier}`,
        situation: "Build or extend the chase platform",
    };
}
function getBowlingNeed(input, phase, requiredRate) {
    if (phase === "powerplay")
        return { label: "New-ball pace and early control", situation: "Powerplay: establish control and look for an early breakthrough" };
    if (phase === "middle" && input.wickets <= 2 && (requiredRate ?? 0) >= 9) {
        if (input.surface === "slow" || input.surface === "dry")
            return { label: "Spin-led partnership-breaking strike option", situation: "Middle overs: the opposition has wickets in hand; the selected slow/dry assumption gives the spin role more weight" };
        if (input.surface === "bouncy" || input.surface === "pace-friendly")
            return { label: "Pace-and-carry partnership-breaking strike option", situation: "Middle overs: the opposition has wickets in hand; the selected pace/carry assumption gives the pace role more weight" };
        return { label: "Partnership-breaking strike option", situation: "Middle overs: the opposition has wickets in hand and the chase remains live" };
    }
    if (phase === "middle" && (input.surface === "slow" || input.surface === "dry")) {
        return { label: "Spin control and middle-over wicket option", situation: "Middle overs: use the available spin role on a slower or drier surface" };
    }
    if (phase === "middle" && (input.surface === "bouncy" || input.surface === "pace-friendly")) {
        return { label: "Pace-and-carry middle-over wicket option", situation: "Middle overs: use the available pace role under the selected carry/pace-friendly assumption" };
    }
    if (phase === "middle")
        return { label: "Middle-over control and wicket option", situation: "Middle overs: manage the partnership and scoring rate" };
    return { label: "Death-over pace and execution", situation: "Death overs: protect the boundary and use the best available phase role" };
}
function outgoingOptions(input, currentXIPlayers) {
    if (input.innings !== "defending") {
        const candidates = currentXIPlayers
            .filter((p) => (isPace(p) || isSpin(p)) && !isAllRounder(p) && !isTopOrder(p) && !isMiddleOrder(p) && !isLowerOrder(p) && !isKeeper(p))
            .map((player) => {
            const remaining = currentXIPlayers.filter((p) => p.name !== player.name);
            const remainingPace = remaining.filter(isPace).length;
            const remainingSpin = remaining.filter(isSpin).length;
            const canRelease = (isPace(player) ? remainingPace >= 2 : remainingPace >= 3)
                && (isSpin(player) ? remainingSpin >= 1 : remainingSpin >= 2);
            return { player, canRelease, redundancy: (isPace(player) ? remainingPace : 0) + (isSpin(player) ? remainingSpin : 0) };
        })
            .filter((row) => row.canRelease)
            .sort((a, b) => b.redundancy - a.redundancy)
            .map((row) => row.player.name);
        return { label: "Bowling role to review (retain minimum phase cover)", names: candidates };
    }
    const currentKeepers = currentXIPlayers.filter(isKeeper).length;
    const candidates = currentXIPlayers
        .filter((p) => !isAllRounder(p) && (isMiddleOrder(p) || isLowerOrder(p)))
        .filter((p) => !isKeeper(p) || currentKeepers > 1)
        .sort((a, b) => Number(isLowerOrder(b)) - Number(isLowerOrder(a)))
        .map((p) => p.name);
    return { label: "Batting role to review (retain wicketkeeping and batting depth)", names: candidates };
}
export function assessImpactSubstitution(currentXI, incoming, outgoingName, medicalClearanceAssumptions = []) {
    const beforeCoverage = roleSummary(currentXI);
    const warnings = [];
    const outgoing = currentXI.find((player) => player.name === outgoingName);
    const invalidBase = currentXI.length !== 11 || new Set(currentXI.map((player) => player.name)).size !== 11;
    if (invalidBase) {
        return { valid: false, incoming: incoming.name, outgoing: outgoingName, beforeCoverage, afterCoverage: beforeCoverage,
            addedCapabilities: [], lostCapabilities: [], warnings: ["The starting XI must contain exactly 11 unique players."], reason: "Starting XI is invalid." };
    }
    if (!outgoing) {
        return { valid: false, incoming: incoming.name, outgoing: outgoingName, beforeCoverage, afterCoverage: beforeCoverage,
            addedCapabilities: [], lostCapabilities: [], warnings: ["Choose an outgoing player who is currently in the XI."], reason: "Outgoing player is not in the selected XI." };
    }
    if (!incoming.isRetained && !canUseHypotheticalTarget(incoming, medicalClearanceAssumptions)) {
        return { valid: false, incoming: incoming.name, outgoing: outgoingName, beforeCoverage, afterCoverage: beforeCoverage,
            addedCapabilities: [], lostCapabilities: [], warnings: ["The incoming profile has not passed the market and medical gates for a hypothetical squad. A release or analyst assumption is not official registration or clearance."], reason: "Incoming player fails the market or medical gate." };
    }
    if (currentXI.some((player) => player.name === incoming.name)) {
        return { valid: false, incoming: incoming.name, outgoing: outgoingName, beforeCoverage, afterCoverage: beforeCoverage,
            addedCapabilities: [], lostCapabilities: [], warnings: ["The incoming player is already in the XI."], reason: "The substitution would duplicate a player." };
    }
    const nextXI = currentXI.filter((player) => player.name !== outgoingName).concat(incoming);
    const afterCoverage = roleSummary(nextXI);
    const invalidReasons = [];
    if (nextXI.length !== 11 || new Set(nextXI.map((player) => player.name)).size !== 11)
        invalidReasons.push("The substitution must leave exactly 11 unique players.");
    if (afterCoverage.overseas > MAX_OVERSEAS_XI)
        invalidReasons.push(`The substitution would exceed the ${MAX_OVERSEAS_XI}-overseas playing-XI limit.`);
    if (afterCoverage.wicketkeepers < 1)
        invalidReasons.push("The substitution would leave no identified wicketkeeper in the XI.");
    if (afterCoverage.paceOptions < 2)
        invalidReasons.push("The substitution would leave fewer than two supplied pace-role options.");
    if (afterCoverage.spinOptions < 1)
        invalidReasons.push("The substitution would leave no supplied spin-role option.");
    const capabilities = [
        ["top-order", isTopOrder], ["middle-order", isMiddleOrder], ["lower-order", isLowerOrder],
        ["wicketkeeping", isKeeper], ["pace", isPace], ["spin", isSpin], ["all-round", isAllRounder],
        ["death-over specialist", isDeathSpecialist], ["powerplay/new-ball specialist", isPowerplaySpecialist],
        ["left-arm pace", (p) => isPace(p) && isLeftArm(p)],
    ];
    const addedCapabilities = capabilities.filter(([, test]) => test(incoming) && !test(outgoing)).map(([label]) => label);
    const lostCapabilities = capabilities.filter(([, test]) => test(outgoing) && !test(incoming)).map(([label]) => label);
    if (lostCapabilities.length)
        warnings.push(`The outgoing player contributes ${lostCapabilities.join(", ")}; check whether the remaining squad covers those jobs in this match plan.`);
    if (!incoming.isRetained && incoming.marketStatus === "RELEASED_REGISTRATION_UNVERIFIED") {
        warnings.push(`${incoming.name} is only a hypothetical released-player profile; auction registration and any future squad signing must be independently verified.`);
    }
    if (incoming.medicalRestriction === "MEDICAL_REVIEW") {
        warnings.push(`${incoming.name} is included under an analyst medical-clearance assumption only. This is not official medical clearance or a return-to-play decision.`);
    }
    if (!afterCoverage.deathOptions)
        warnings.push("The updated XI has no explicit specialist death-role tag; keep a documented phase plan rather than assuming any fast bowler can execute at the death.");
    if (afterCoverage.leftArmPaceOptions < beforeCoverage.leftArmPaceOptions)
        warnings.push("Left-arm pace variation is reduced by this change.");
    return {
        valid: invalidReasons.length === 0,
        incoming: incoming.name,
        outgoing: outgoing.name,
        beforeCoverage,
        afterCoverage,
        addedCapabilities,
        lostCapabilities,
        warnings,
        reason: invalidReasons.length ? invalidReasons.join(" ") : `${incoming.name} replaces ${outgoing.name}; XI size and overseas constraints pass. Review the capability changes before applying the tactical option.`,
    };
}
export function recommendMatchImpact(input) {
    const warnings = [];
    const ballsRemaining = Math.max(0, 120 - input.ballsCompleted);
    const phase = phaseForBalls(input.ballsCompleted);
    const target = input.targetOrDefendedTotal;
    const currentRate = input.ballsCompleted > 0 ? input.score * 6 / input.ballsCompleted : null;
    const runsRemaining = input.innings === "batting-first"
        ? target === null ? null : target - input.score
        : input.innings === "chasing"
            ? (target ?? 0) - input.score
            : (target ?? 0) + 1 - input.score;
    const requiredRate = ballsRemaining > 0 && runsRemaining !== null ? Math.max(0, runsRemaining) * 6 / ballsRemaining : null;
    const scoreLine = `${input.score}/${input.wickets} after ${Math.floor(input.ballsCompleted / 6)}.${input.ballsCompleted % 6} overs`;
    const targetInvalid = input.innings === "batting-first"
        ? target !== null && (!Number.isInteger(target) || target <= 0)
        : target === null || !Number.isInteger(target) || target <= 0;
    const invalid = !Number.isInteger(input.score) || input.score < 0
        || !Number.isInteger(input.wickets) || input.wickets < 0 || input.wickets > 10
        || !Number.isInteger(input.ballsCompleted) || input.ballsCompleted < 0 || input.ballsCompleted > 120
        || targetInvalid
        || input.currentXI.length !== 11
        || new Set(input.currentXI).size !== 11
        || input.currentXI.some((name) => !input.availableSquad.some((p) => p.name === name));
    if (invalid) {
        return {
            valid: false, phase, situation: "Invalid match state or XI", scoreLine,
            runsRemaining: null, ballsRemaining, requiredRate: null,
            requiredRole: "Correct the match inputs and selected XI", recommended: null,
            alternatives: [],
            recommendedReason: "The score, wickets, legal balls, target/total or selected XI do not satisfy the match-state constraints.",
            alternativeReason: "No alternative is calculated from invalid input.",
            tradeOff: "No recommendation is available until the match state and XI are valid.",
            suggestedOutgoingRole: "Not calculated", outgoingCandidates: [],
            warnings: ["Use 0–10 wickets, 0–120 legal balls and exactly 11 unique players from the active squad. A chase/defence needs a positive target/total; a first innings may leave the team-total objective blank."],
            candidatesEvaluated: 0,
            historicalEvidence: [],
            combinations: [],
        };
    }
    const currentXIPlayers = input.currentXI.map((name) => input.availableSquad.find((p) => p.name === name));
    const overseasInXI = currentXIPlayers.filter((p) => p.overseas).length;
    if (overseasInXI > MAX_OVERSEAS_XI) {
        return {
            valid: false, phase, situation: "Invalid overseas balance", scoreLine,
            runsRemaining: runsRemaining === null ? null : Math.max(0, runsRemaining), ballsRemaining, requiredRate,
            requiredRole: "Reduce the overseas count before an Impact Player decision", recommended: null,
            alternatives: [], recommendedReason: "The selected XI already exceeds the four-overseas limit.",
            alternativeReason: "No alternative is calculated from an invalid XI.",
            tradeOff: "Resolve the XI constraint first.", suggestedOutgoingRole: "Not calculated",
            outgoingCandidates: [], warnings: [`The selected XI contains more than ${MAX_OVERSEAS_XI} overseas players.`], candidatesEvaluated: 0,
            historicalEvidence: [],
            combinations: [],
        };
    }
    if (input.wickets >= 10 || input.ballsCompleted >= 120 || (input.innings !== "batting-first" && (runsRemaining ?? 1) <= 0)) {
        return {
            valid: true, phase: "complete", situation: "No further Impact Player recommendation", scoreLine,
            runsRemaining: runsRemaining === null ? null : Math.max(0, runsRemaining), ballsRemaining, requiredRate: null,
            requiredRole: "Innings complete or target achieved", recommended: null,
            alternatives: [],
            recommendedReason: "The innings is complete, the side is all out, or the batting side has already reached the target. The engine does not manufacture another substitution.",
            alternativeReason: "No alternative is applicable.",
            tradeOff: "Use the match result for post-innings review, not another in-innings recommendation.",
            suggestedOutgoingRole: "Not applicable", outgoingCandidates: [], warnings,
            candidatesEvaluated: 0,
            historicalEvidence: [],
            combinations: [],
        };
    }
    const need = input.innings !== "defending" ? getBattingNeed(input, phase, currentRate, requiredRate) : null;
    const bowlingNeed = input.innings === "defending" ? getBowlingNeed(input, phase, requiredRate) : null;
    const requiredRole = need?.label ?? bowlingNeed.label;
    const situation = need?.situation ?? bowlingNeed.situation;
    // Only active squad members outside the XI are scored as tactical candidates. A retained keeper
    // with no supplied batting role, for example, is not treated as a No.5 repair batter.
    const candidates = input.availableSquad.filter((p) => !input.currentXI.includes(p.name) && (p.isRetained || canUseHypotheticalTarget(p, input.medicalClearanceAssumptions ?? [])));
    const historicalPhase = phase;
    const roleSorted = candidates.map((player, index) => {
        const roleScore = input.innings !== "defending"
            ? impactBattingRoleScore(player, need.key, input.opposition, input.surface)
            : impactBowlingRoleScore(player, input, phase, requiredRate);
        const evidence = getHistoricalPlayerEvidence(player.name, input.innings === "defending" ? "bowling" : "batting", historicalPhase, input.venue, input.opposition);
        return { player, index, score: roleScore, evidence };
    }).filter((row) => row.score >= 40 && (!row.player.overseas || overseasInXI < MAX_OVERSEAS_XI))
        .sort((a, b) => b.score - a.score || a.index - b.index);
    // Historical performance is a tie-breaker, never a role substitute. Form
    // contiguous bands whose members are within five role points of that band's
    // best role score. Sort only the evidence-eligible members inside each band;
    // candidates without an IPL sample keep their role-score position and are
    // not pushed down merely because data are missing. This avoids a
    // non-transitive pairwise comparator.
    const scored = [];
    for (let start = 0; start < roleSorted.length;) {
        const bandTop = roleSorted[start];
        if (!bandTop)
            break;
        const bandTopScore = bandTop.score;
        let end = start + 1;
        while (end < roleSorted.length) {
            const next = roleSorted[end];
            if (!next || bandTopScore - next.score > 5)
                break;
            end += 1;
        }
        const band = roleSorted.slice(start, end);
        const evidencePositions = band.flatMap((row, index) => row.evidence.dataAvailable && row.evidence.tieBreakContextMetricPer100 !== null ? [index] : []);
        const evidenceRows = evidencePositions
            .map((index) => band[index])
            .filter((row) => row !== undefined)
            .sort((a, b) => compareHistoricalTieBreak(a.evidence, b.evidence) || b.score - a.score || a.index - b.index);
        evidencePositions.forEach((position, index) => {
            const row = evidenceRows[index];
            if (row)
                band[position] = row;
        });
        scored.push(...band);
        start = end;
    }
    const recommended = scored[0]?.player ?? null;
    const alternatives = scored.slice(1, 3).map((row) => row.player);
    const outgoing = outgoingOptions(input, currentXIPlayers);
    const proposedCandidates = [recommended, ...alternatives].filter((player) => Boolean(player));
    const registrationUnverified = proposedCandidates.filter((player) => !player.isRetained && player.marketStatus === "RELEASED_REGISTRATION_UNVERIFIED");
    if (registrationUnverified.length) {
        warnings.push(`${registrationUnverified.map((player) => player.name).join(", ")} remain released-player research profiles with auction registration unverified. Their inclusion in the hypothetical pool does not establish official registration or acquisition.`);
    }
    const medicallyAssumed = proposedCandidates.filter((player) => player.medicalRestriction === "MEDICAL_REVIEW");
    if (medicallyAssumed.length) {
        warnings.push(`${medicallyAssumed.map((player) => player.name).join(", ")} appear only under analyst medical-clearance assumptions. These do not establish official medical clearance or return-to-play status.`);
    }
    if (input.innings === "batting-first" && target === null)
        warnings.push("No first-innings total objective was entered. The recommendation uses innings phase, wickets, current rate and available batting roles; it does not infer a par score.");
    warnings.push("This is a tactical candidate from the active squad pool, not a verified match-day Impact Player nomination. Confirm the player is on the official match sheet and eligible under the applicable 2027 playing conditions before using the option.");
    if (input.venueEvidence === "unavailable") {
        warnings.push(`No verified current pitch report is loaded for ${input.venue || "the selected venue"}. The selected surface is a scenario input, not retrieved match-day evidence.`);
    }
    else if (input.venueEvidence === "analyst-input") {
        warnings.push("The venue label is analyst-entered. Where it matches a mapped archive venue ID, historical player/phase venue records can inform close role-fit comparisons; no live fixture, current pitch report or weather feed is retrieved.");
    }
    if (input.surfaceSource === "historical-venue-profile") {
        warnings.push(`Historical ${input.venue} player/phase splits from the 2022–2026 IPL archive inform close role-fit comparisons. The archive does not contain a pitch-report label, so no dry/slow/bouncy condition is inferred.`);
    }
    else if (input.surfaceSource === "analyst-override") {
        warnings.push(`The ${input.surface} surface preference is manually selected and changes broad role-balance assumptions only. It is not a retrieved pitch fact; historical player/venue evidence remains a separate, sample-gated tie-breaker.`);
    }
    else if (input.surfaceSource === "neutral-fallback") {
        warnings.push("No mapped historical IPL venue or analyst surface override is selected; neutral role balance is applied.");
    }
    const venueEvidence = getHistoricalVenueEvidence(input.venue, historicalPhase);
    if (input.venue && !venueEvidence) {
        warnings.push(`No mapped venue ID is available for ${input.venue} in the supplied archive. Player-wide phase evidence is used instead of a ground-specific split.`);
    }
    else if (venueEvidence && venueEvidence.mappingConfidence !== "high") {
        warnings.push(`${venueEvidence.name} is mapped with ${venueEvidence.mappingConfidence} confidence from repeated home-team concentration, not an official venue lookup table.`);
    }
    const noHistory = scored.filter((row) => !row.evidence.dataAvailable).map((row) => row.player.name);
    if (noHistory.length) {
        warnings.push(`No 2022–2026 IPL delivery sample is available for: ${noHistory.join(", ")}. These players remain role-scouting options and are not penalised with an invented performance estimate.`);
    }
    if (input.innings !== "defending" && input.opposition !== "balanced") {
        warnings.push("The opposing bowling profile only affects candidates with an explicit scouting-role tag (for example, spin rotation or pace hitting). No player-vs-bowler outcome split is available, so this is role-fit context rather than a matchup prediction.");
    }
    if (input.innings === "defending" && (input.opposition === "left-hand-heavy" || input.opposition === "right-hand-heavy")) {
        warnings.push("Opposition handedness is shown as tactical context. The supplied data does not validate bowler-vs-handedness outcomes, so it does not create an individual wicket or economy forecast.");
    }
    if (overseasInXI >= MAX_OVERSEAS_XI)
        warnings.push(`The selected XI already uses ${MAX_OVERSEAS_XI} overseas players; an overseas Impact Player option is excluded.`);
    if (input.innings !== "defending" && need?.key === "repair" && recommended && !isRepairBatter(recommended)) {
        warnings.push(`${recommended.name} is only a partial lower-order/all-round option for a repair situation, not a specialist middle-order repair batter. Treat the fit as partial.`);
    }
    if (input.innings !== "defending" && need?.key === "repair" && !recommended) {
        warnings.push("No eligible middle-order repair option is available in this selected squad pool. Do not force a specialist from the unacquired watchlist into the match XI.");
    }
    const recommendedRow = scored[0];
    const recommendedEvidence = recommendedRow?.evidence;
    const historicalExplanation = recommendedEvidence?.dataAvailable
        ? ` Historical tie-break evidence: ${recommendedEvidence.tieBreakContextMetricPer100?.toFixed(1) ?? "n/a"} context-adjusted ${input.innings === "defending" ? "batter runs prevented" : "runs added"} per 100 ${input.innings === "defending" ? "legal balls" : "batting balls"} in this phase (${recommendedEvidence.sampleBalls} balls across ${recommendedEvidence.matches} matches; ${recommendedEvidence.confidence} confidence).${recommendedEvidence.opponentStyleEvidenceUsed ? ` The ${recommendedEvidence.opponentStyle} split (${recommendedEvidence.opponentStyleBalls} balls across ${recommendedEvidence.opponentStyleMatches} matches) was shrunk toward the wider phase record.` : " The selected opponent-style split did not meet its exposure gate or was not applicable."}${recommendedEvidence.venueEvidenceUsed ? ` The ground-specific sample (${recommendedEvidence.venueSampleBalls} balls across ${recommendedEvidence.venueSampleMatches} matches) was further shrunk toward the style-adjusted phase prior.` : " The ground-specific player sample did not meet its exposure gate or was unavailable."}`
        : recommended ? " No eligible IPL phase sample exists in the supplied archive; this recommendation rests on role fit, not a fabricated historical estimate." : "";
    const recommendedReason = !recommended
        ? "No non-XI player in the selected squad pool has the required primary/secondary role. The engine will not pull an unacquired watchlist player into the XI."
        : input.innings !== "defending"
            ? `${recommended.name} is ranked first because the supplied role description best matches ${requiredRole.toLowerCase()} for the innings phase, wicket state${requiredRate === null ? " and current scoring context" : " and required rate"}. For close role-fit candidates (within five role points), the engine uses match-grouped out-of-fold, context-adjusted IPL phase evidence as a tie-breaker. A first-innings total objective is an analyst target—not a modelled par score. Opposition style splits are descriptive history, not a validated live matchup forecast.${historicalExplanation}`
            : `${recommended.name} is ranked first because the supplied bowling role best fits ${requiredRole.toLowerCase()} for the current phase and score state. For close role-fit candidates (within five role points), the engine uses match-grouped out-of-fold context-adjusted IPL bowling evidence; ground-specific player samples are shrunk toward the wider phase record.${historicalExplanation} Manually selected surface conditions affect broad role balance only; they are not measured pitch effects.`;
    const alternativeReason = alternatives.length
        ? "Alternatives are the next options from the same eligible squad pool. Historical phase evidence only separates close role fits; no-sample players fall back to role scouting rather than being treated as poor performers."
        : "No second non-XI squad option has enough supplied role evidence for this situation.";
    // Turn the candidate recommendation into complete tactical combinations. The
    // system chooses the outgoing role by protecting the rest of the XI's role
    // coverage; coaches choose between plans rather than manually swapping any
    // player in a dropdown. This is a transparent role-coverage heuristic, not
    // a prediction of match outcome.
    const outgoingPenalty = (assessment) => {
        const weights = input.innings === "defending"
            ? new Map([["top-order", 10], ["middle-order", 5], ["lower-order", 2], ["all-round", 7], ["wicketkeeping", 15]])
            : new Map([["death-over specialist", 8], ["powerplay/new-ball specialist", 8], ["left-arm pace", 5], ["pace", 3], ["spin", 2], ["all-round", 4]]);
        const lost = assessment.lostCapabilities.reduce((sum, capability) => sum + (weights.get(capability) ?? 1), 0);
        const addedCredit = Math.min(assessment.addedCapabilities.length, 3);
        const coveragePenalty = Math.max(0, assessment.beforeCoverage.paceOptions - assessment.afterCoverage.paceOptions)
            + Math.max(0, assessment.beforeCoverage.spinOptions - assessment.afterCoverage.spinOptions);
        return lost + coveragePenalty * 4 - addedCredit;
    };
    const combinations = proposedCandidates.flatMap((incoming, incomingIndex) => {
        const bestOutgoing = outgoing.names
            .map((outgoingName) => {
            const assessment = assessImpactSubstitution(currentXIPlayers, incoming, outgoingName, input.medicalClearanceAssumptions ?? []);
            const outgoingPlayer = currentXIPlayers.find((player) => player.name === outgoingName);
            return outgoingPlayer && assessment.valid ? { outgoingPlayer, assessment, penalty: outgoingPenalty(assessment) } : null;
        })
            .filter((row) => row !== null)
            .sort((a, b) => a.penalty - b.penalty || a.outgoingPlayer.name.localeCompare(b.outgoingPlayer.name))[0];
        if (!bestOutgoing)
            return [];
        const rank = incomingIndex + 1;
        const incomingRole = input.innings === "defending" ? "bowling option" : "batting option";
        const suppliedRoleProfile = [
            incoming.primaryRole,
            incoming.secondaryRole,
            ...(incoming.tacticalRolesSupported ?? []).slice(0, 2),
        ].filter((value) => Boolean(value));
        const formatRoleSignal = (value) => value
            .replace(/[_-]+/g, " ")
            .toLowerCase()
            .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
        const roleEvidence = suppliedRoleProfile.length
            ? suppliedRoleProfile.map(formatRoleSignal).join(", ")
            : (incoming.roleTags ?? []).slice(0, 3).map(formatRoleSignal).join(", ") || incoming.role;
        const incomingEvidence = scored.find((row) => row.player.name === incoming.name)?.evidence;
        const historicalNote = incomingEvidence?.dataAvailable && incomingEvidence.tieBreakContextMetricPer100 !== null
            ? ` Historical phase tie-break: ${incomingEvidence.tieBreakContextMetricPer100?.toFixed(1)} context-adjusted ${input.innings === "defending" ? "batter runs prevented" : "runs added"} per 100 ${input.innings === "defending" ? "legal balls" : "batting balls"} (${incomingEvidence.sampleBalls} balls across ${incomingEvidence.matches} matches; ${incomingEvidence.confidence} confidence). This evidence separates close role-fit candidates; it is not a forecast.`
            : " No eligible IPL phase sample is available for this player in the supplied archive, so this recommendation rests on the supplied role profile rather than an invented performance estimate.";
        const preserved = bestOutgoing.assessment.lostCapabilities.length
            ? `The outgoing role is selected as the least disruptive eligible exit under the role-coverage check, but it gives up ${bestOutgoing.assessment.lostCapabilities.join(", ")}; confirm the remaining XI can cover those jobs.`
            : `The outgoing role is selected because it has the lowest capability loss among the eligible exits under the current role-coverage check. This is not a judgement of the player's overall quality.`;
        return [{
                id: `${incoming.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${bestOutgoing.outgoingPlayer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                rank,
                incoming,
                outgoing: bestOutgoing.outgoingPlayer,
                title: rank === 1 ? "Best fit for this match state" : `Alternative ${rank - 1} · different squad option`,
                rationale: `${situation}. ${incoming.name} is selected as the ${incomingRole} because the supplied profile (${roleEvidence}) best fits the ${requiredRole.toLowerCase()} required in this phase. The incoming candidate is scored from the active non-XI squad only.${historicalNote}`,
                tradeOff: `${preserved} The tactical cost of bringing in a ${input.innings === "defending" ? "bowler" : "batter"} is releasing one player from the opposite discipline. Role tags indicate listed coverage, not specialist workload or like-for-like execution; confirm the remaining players can cover the released overs and phase duties.`,
                assessment: bestOutgoing.assessment,
            }];
    }).slice(0, 3);
    return {
        valid: true,
        phase,
        situation: recommended ? situation : "No suitable role cover on the selected bench",
        scoreLine,
        runsRemaining: runsRemaining === null ? null : Math.max(0, runsRemaining),
        ballsRemaining,
        requiredRate,
        requiredRole,
        recommended,
        alternatives,
        recommendedReason,
        alternativeReason,
        tradeOff: input.innings !== "defending"
            ? "Adding a batter reduces one bowling resource. Compare the outgoing option against minimum remaining pace and spin cover before applying the change."
            : "Adding a bowler reduces one batting resource. Preserve a wicketkeeper where required and retain enough recognised batting to support the remaining chase/defence context.",
        suggestedOutgoingRole: outgoing.label,
        outgoingCandidates: outgoing.names,
        warnings,
        candidatesEvaluated: candidates.length,
        historicalEvidence: scored.slice(0, 5).map((row) => ({ playerName: row.player.name, roleScore: row.score, evidence: row.evidence })),
        combinations,
    };
}
/** Utility used by UI/tests for exact cricket-ball conversion. */
export function parseCricketOvers(value) {
    const match = /^(?:0|[1-9]|1[0-9]|20)(?:\.([0-5]))?$/.exec(value.trim());
    if (!match)
        return null;
    const [wholeText] = value.trim().split(".");
    const whole = Number(wholeText);
    const balls = Number(match[1] ?? 0);
    if (whole === 20 && balls > 0)
        return null;
    return whole * 6 + balls;
}
