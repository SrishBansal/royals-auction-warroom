from pathlib import Path
import argparse
import json
import hashlib
import pandas as pd
import numpy as np
from scipy.stats import spearmanr

parser = argparse.ArgumentParser(description="Rebuild IPL-only experimental pressure rankings from the supplied data pack.")
parser.add_argument("--ball-by-ball", required=True, help="Path to ball_by_ball.csv from the supplied data pack")
parser.add_argument("--matches", required=True, help="Path to matches.csv from the supplied data pack")
parser.add_argument("--competitions", required=True, help="Path to competitions.csv from the supplied data pack")
parser.add_argument("--project-root", default=".", help="Project root where src/data and docs outputs will be written")
args = parser.parse_args()
ROOT = Path(args.project_root).resolve()
BB_PATH = Path(args.ball_by_ball).resolve()
MATCH_PATH = Path(args.matches).resolve()
COMP_PATH = Path(args.competitions).resolve()

bb = pd.read_csv(BB_PATH)
match = pd.read_csv(MATCH_PATH)
comps = pd.read_csv(COMP_PATH)
ipl_comps = comps[comps['comp_name'].str.fullmatch(r'IPL \d{4}', na=False)].copy()
ipl_matches = match.merge(ipl_comps, on='comp_id', how='inner')
ipl = bb.merge(ipl_matches[['match_id','season','stage','knock_out','comp_name']], on='match_id', how='inner').copy()
ipl = ipl[ipl['innings'].isin([1,2,3,4])].sort_values(['match_id','innings','innings_ball_num','over_ball_num']).copy()
ipl['wickets_before'] = ipl.groupby(['match_id','innings'])['is_wicket'].transform(lambda s: s.fillna(False).astype(int).cumsum().shift(fill_value=0))
extras = ipl['extras_type'].fillna('').str.strip().str.lower()
ipl['legal_ball'] = ~extras.isin(['wide','overstep'])
ipl['death_over'] = ipl['overid'].between(16,20)
ipl['middle_wicket_pressure'] = ipl['overid'].between(11,15) & ipl['wickets_before'].ge(4)
ipl['knockout_late'] = ipl['stage'].isin(['Qualifier','Eliminator','Final']) & ipl['overid'].ge(11)
ipl['super_over'] = ipl['innings'].ge(3)
ipl['pressure'] = ipl[['death_over','middle_wicket_pressure','knockout_late','super_over']].any(axis=1)
ipl['batter_runs'] = pd.to_numeric(ipl['runs'], errors='coerce').fillna(0)
ipl['is_wicket_bool'] = ipl['is_wicket'].fillna(False).astype(bool)

# ---------------- Batter scoring ----------------
# Runs are the recorded batter runs. Extras are not added to batter output.
# Legal faced balls exclude wide and no-ball/overstep records. Batter dismissals
# include all dismissed-player IDs, including run-outs, because they affect survival.
bat_all_runs = ipl.groupby(['striker_id','striker_name']).agg(all_runs=('batter_runs','sum')).reset_index()
bat_all_balls = ipl[ipl['legal_ball']].groupby(['striker_id','striker_name']).size().rename('all_balls').reset_index()
bat_p_runs = ipl[ipl['pressure']].groupby(['striker_id','striker_name']).agg(pressure_runs=('batter_runs','sum'),pressure_fours=('is_four','sum'),pressure_sixes=('is_six','sum')).reset_index()
bat_p_balls = ipl[ipl['pressure'] & ipl['legal_ball']].groupby(['striker_id','striker_name']).size().rename('pressure_balls').reset_index()
bat_all = bat_all_runs.merge(bat_all_balls,on=['striker_id','striker_name'],how='outer')
bat_all = bat_all.merge(bat_p_runs,on=['striker_id','striker_name'],how='left').merge(bat_p_balls,on=['striker_id','striker_name'],how='left')
for c in ['all_runs','all_balls','pressure_runs','pressure_fours','pressure_sixes','pressure_balls']:
    bat_all[c] = bat_all[c].fillna(0)
bat_dismissals = ipl[ipl['is_wicket_bool'] & ipl['dismissed_player_id'].notna()].groupby('dismissed_player_id').size()
bat_p_dismissals = ipl[ipl['pressure'] & ipl['is_wicket_bool'] & ipl['dismissed_player_id'].notna()].groupby('dismissed_player_id').size()
bat_all['all_dismissals'] = bat_all['striker_id'].map(bat_dismissals).fillna(0)
bat_all['pressure_dismissals'] = bat_all['striker_id'].map(bat_p_dismissals).fillna(0)
bat_match_counts = ipl.groupby(['striker_id','striker_name']).agg(all_matches=('match_id','nunique')).reset_index()
bat_pressure_matches = ipl[ipl['pressure']].groupby(['striker_id','striker_name']).agg(pressure_matches=('match_id','nunique')).reset_index()
bat_all = bat_all.merge(bat_match_counts,on=['striker_id','striker_name'],how='left').merge(bat_pressure_matches,on=['striker_id','striker_name'],how='left')
bat_all['pressure_matches'] = bat_all['pressure_matches'].fillna(0)
bat_all['baseline_sr'] = np.where(bat_all['all_balls']>0,100*bat_all['all_runs']/bat_all['all_balls'],0)
bat_all['observed_pressure_sr'] = np.where(bat_all['pressure_balls']>0,100*bat_all['pressure_runs']/bat_all['pressure_balls'],0)
PRIOR_BALLS = 60
bat_all['shrunk_pressure_sr'] = (bat_all['pressure_balls']*bat_all['observed_pressure_sr'] + PRIOR_BALLS*bat_all['baseline_sr'])/(bat_all['pressure_balls']+PRIOR_BALLS)
bat_all['retention_index'] = np.where(bat_all['baseline_sr']>0,bat_all['shrunk_pressure_sr']/bat_all['baseline_sr'],0)
bat_all['pressure_dismissal_rate'] = 100*bat_all['pressure_dismissals']/np.maximum(bat_all['pressure_balls'],1)
BAT_MIN_PRESSURE_BALLS = 60
BAT_MIN_ALL_BALLS = 150
bat_eligible = bat_all[(bat_all['pressure_balls']>=BAT_MIN_PRESSURE_BALLS)&(bat_all['all_balls']>=BAT_MIN_ALL_BALLS)].copy()
bat_eligible['score_pressure_sr_pct'] = bat_eligible['shrunk_pressure_sr'].rank(pct=True)
bat_eligible['score_retention_pct'] = bat_eligible['retention_index'].rank(pct=True)
bat_eligible['score_survival_pct'] = (-bat_eligible['pressure_dismissal_rate']).rank(pct=True)
bat_eligible['index'] = 100*(0.50*bat_eligible['score_pressure_sr_pct']+0.30*bat_eligible['score_retention_pct']+0.20*bat_eligible['score_survival_pct'])
bat_eligible = bat_eligible.sort_values(['index','pressure_balls'],ascending=False).reset_index(drop=True)

# ---------------- Bowler scoring ----------------
# Economy is deliberately excluded: the source uses categorical extras1_runs codes,
# not dependable conceded-run totals. Use only bowler-credited wicket events.
non_bowler_dismissals = {'RunOut','Retire Out','Retired (hurt)','Obstracting the field','Obstructing the field'}
ipl['bowler_credited_wicket'] = ipl['is_wicket_bool'] & ~ipl['dismissal_type'].fillna('').isin(non_bowler_dismissals)
bowl_all_balls = ipl[ipl['legal_ball']].groupby(['bowler_id','bowler_name']).size().rename('all_balls').reset_index()
bowl_all_wkts = ipl.groupby(['bowler_id','bowler_name']).agg(all_credited_wickets=('bowler_credited_wicket','sum')).reset_index()
bowl_p_balls = ipl[ipl['pressure'] & ipl['legal_ball']].groupby(['bowler_id','bowler_name']).size().rename('pressure_balls').reset_index()
bowl_p_wkts = ipl[ipl['pressure']].groupby(['bowler_id','bowler_name']).agg(pressure_credited_wickets=('bowler_credited_wicket','sum')).reset_index()
bowl_all = bowl_all_balls.merge(bowl_all_wkts,on=['bowler_id','bowler_name'],how='outer').merge(bowl_p_balls,on=['bowler_id','bowler_name'],how='left').merge(bowl_p_wkts,on=['bowler_id','bowler_name'],how='left')
for c in ['all_balls','all_credited_wickets','pressure_balls','pressure_credited_wickets']:
    bowl_all[c] = bowl_all[c].fillna(0)
bowl_match_counts = ipl.groupby(['bowler_id','bowler_name']).agg(all_matches=('match_id','nunique')).reset_index()
bowl_pressure_matches = ipl[ipl['pressure']].groupby(['bowler_id','bowler_name']).agg(pressure_matches=('match_id','nunique')).reset_index()
bowl_all = bowl_all.merge(bowl_match_counts,on=['bowler_id','bowler_name'],how='left').merge(bowl_pressure_matches,on=['bowler_id','bowler_name'],how='left')
bowl_all['pressure_matches'] = bowl_all['pressure_matches'].fillna(0)
bowl_all['baseline_wicket_rate'] = 100*bowl_all['all_credited_wickets']/np.maximum(bowl_all['all_balls'],1)
bowl_all['observed_pressure_wicket_rate'] = 100*bowl_all['pressure_credited_wickets']/np.maximum(bowl_all['pressure_balls'],1)
bowl_all['shrunk_pressure_wicket_rate'] = (bowl_all['pressure_balls']*bowl_all['observed_pressure_wicket_rate'] + PRIOR_BALLS*bowl_all['baseline_wicket_rate'])/(bowl_all['pressure_balls']+PRIOR_BALLS)
bowl_all['retention_index'] = np.where(bowl_all['baseline_wicket_rate']>0,bowl_all['shrunk_pressure_wicket_rate']/bowl_all['baseline_wicket_rate'],0)
BOWL_MIN_PRESSURE_BALLS = 90
BOWL_MIN_ALL_BALLS = 180
BOWL_MIN_PRESSURE_WICKETS = 5
bowl_eligible = bowl_all[(bowl_all['pressure_balls']>=BOWL_MIN_PRESSURE_BALLS)&(bowl_all['all_balls']>=BOWL_MIN_ALL_BALLS)&(bowl_all['pressure_credited_wickets']>=BOWL_MIN_PRESSURE_WICKETS)].copy()
bowl_eligible['score_pressure_wicket_pct'] = bowl_eligible['shrunk_pressure_wicket_rate'].rank(pct=True)
bowl_eligible['score_retention_pct'] = bowl_eligible['retention_index'].rank(pct=True)
bowl_eligible['score_volume_pct'] = bowl_eligible['pressure_credited_wickets'].rank(pct=True)
bowl_eligible['index'] = 100*(0.55*bowl_eligible['score_pressure_wicket_pct']+0.30*bowl_eligible['score_retention_pct']+0.15*bowl_eligible['score_volume_pct'])
bowl_eligible = bowl_eligible.sort_values(['index','pressure_balls'],ascending=False).reset_index(drop=True)

# Split-half reliability: deterministic odd/even match ID halves. Only players meeting
# low-but-nontrivial minimums on both halves are compared. This is descriptive, not CV.
def split_scores(frame, player_id, name, side, kind):
    sub=frame[frame['match_id'].astype(int)%2==side].copy()
    if kind=='bat':
        all_runs=sub.groupby(player_id)['runs'].sum()
        all_balls=sub[sub['legal_ball']].groupby(player_id).size()
        p_runs=sub[sub['pressure']].groupby(player_id)['runs'].sum()
        p_balls=sub[sub['pressure']&sub['legal_ball']].groupby(player_id).size()
        p_d=sub[sub['pressure']&sub['is_wicket_bool']&sub['dismissed_player_id'].notna()].groupby('dismissed_player_id').size()
        ids=sorted(set(all_balls.index)|set(p_balls.index))
        d=pd.DataFrame({player_id:ids})
        d['all_runs']=d[player_id].map(all_runs).fillna(0);d['all_balls']=d[player_id].map(all_balls).fillna(0)
        d['p_runs']=d[player_id].map(p_runs).fillna(0);d['p_balls']=d[player_id].map(p_balls).fillna(0);d['p_d']=d[player_id].map(p_d).fillna(0)
        d['base']=100*d.all_runs/np.maximum(d.all_balls,1);d['obs']=100*d.p_runs/np.maximum(d.p_balls,1)
        d['shrunk']=(d.p_balls*d.obs+PRIOR_BALLS*d.base)/(d.p_balls+PRIOR_BALLS)
        d['ret']=np.where(d.base>0,d.shrunk/d.base,0);d['dr']=100*d.p_d/np.maximum(d.p_balls,1)
        eligible=d[(d.p_balls>=25)&(d.all_balls>=60)].copy()
        if len(eligible):
            eligible['score']=0.50*eligible.shrunk.rank(pct=True)+0.30*eligible.ret.rank(pct=True)+0.20*(-eligible.dr).rank(pct=True)
        return eligible[[player_id,'score','p_balls']]
    else:
        allb=sub[sub['legal_ball']].groupby('bowler_id').size();allw=sub.groupby('bowler_id')['bowler_credited_wicket'].sum()
        pb=sub[sub['pressure']&sub['legal_ball']].groupby('bowler_id').size();pw=sub[sub['pressure']].groupby('bowler_id')['bowler_credited_wicket'].sum()
        ids=sorted(set(allb.index)|set(pb.index));d=pd.DataFrame({'bowler_id':ids})
        d['all_balls']=d.bowler_id.map(allb).fillna(0);d['all_w']=d.bowler_id.map(allw).fillna(0);d['p_balls']=d.bowler_id.map(pb).fillna(0);d['p_w']=d.bowler_id.map(pw).fillna(0)
        d['base']=100*d.all_w/np.maximum(d.all_balls,1);d['obs']=100*d.p_w/np.maximum(d.p_balls,1);d['shrunk']=(d.p_balls*d.obs+PRIOR_BALLS*d.base)/(d.p_balls+PRIOR_BALLS);d['ret']=np.where(d.base>0,d.shrunk/d.base,0)
        eligible=d[(d.p_balls>=40)&(d.all_balls>=80)&(d.p_w>=2)].copy()
        if len(eligible): eligible['score']=0.55*eligible.shrunk.rank(pct=True)+0.30*eligible.ret.rank(pct=True)+0.15*eligible.p_w.rank(pct=True)
        return eligible[['bowler_id','score','p_balls']]

ipl['is_wicket_bool'] = ipl['is_wicket_bool'].astype(bool)
bat_a=split_scores(ipl, 'striker_id','striker_name',0,'bat').rename(columns={'score':'score_a','p_balls':'p_balls_a'})
bat_b=split_scores(ipl, 'striker_id','striker_name',1,'bat').rename(columns={'score':'score_b','p_balls':'p_balls_b'})
bat_split=bat_a.merge(bat_b,on='striker_id')
bat_rho=float(spearmanr(bat_split.score_a,bat_split.score_b).statistic) if len(bat_split)>=3 else None
bowl_a=split_scores(ipl, 'bowler_id','bowler_name',0,'bowl').rename(columns={'score':'score_a','p_balls':'p_balls_a'})
bowl_b=split_scores(ipl, 'bowler_id','bowler_name',1,'bowl').rename(columns={'score':'score_b','p_balls':'p_balls_b'})
bowl_split=bowl_a.merge(bowl_b,on='bowler_id')
bowl_rho=float(spearmanr(bowl_split.score_a,bowl_split.score_b).statistic) if len(bowl_split)>=3 else None

# Top 10 export rows

def records(df, kind):
    out=[]
    for idx,r in df.head(10).iterrows():
        if kind=='bat':
            out.append({
                'rank':idx+1,'playerId':int(r.striker_id),'player':str(r.striker_name),
                'pressureBalls':int(r.pressure_balls),'pressureMatches':int(r.pressure_matches),'allBalls':int(r.all_balls),'allMatches':int(r.all_matches),
                'pressureRuns':int(r.pressure_runs),'pressureStrikeRate':round(float(r.observed_pressure_sr),2),'baselineStrikeRate':round(float(r.baseline_sr),2),
                'shrunkPressureStrikeRate':round(float(r.shrunk_pressure_sr),2),'retentionIndex':round(float(r.retention_index),3),'pressureDismissals':int(r.pressure_dismissals),
                'pressureDismissalsPer100Balls':round(float(r.pressure_dismissal_rate),2),'index':round(float(r['index']),1),
                'sampleBand':'High' if r.pressure_balls>=250 else ('Moderate' if r.pressure_balls>=120 else 'Limited')
            })
        else:
            out.append({
                'rank':idx+1,'playerId':int(r.bowler_id),'player':str(r.bowler_name),
                'pressureBalls':int(r.pressure_balls),'pressureMatches':int(r.pressure_matches),'allBalls':int(r.all_balls),'allMatches':int(r.all_matches),
                'pressureWickets':int(r.pressure_credited_wickets),'pressureWicketsPer100Balls':round(float(r.observed_pressure_wicket_rate),2),'baselineWicketsPer100Balls':round(float(r.baseline_wicket_rate),2),
                'shrunkPressureWicketsPer100Balls':round(float(r.shrunk_pressure_wicket_rate),2),'retentionIndex':round(float(r.retention_index),3),
                'index':round(float(r['index']),1),'sampleBand':'High' if r.pressure_balls>=350 else ('Moderate' if r.pressure_balls>=180 else 'Limited')
            })
    return out

sha=hashlib.sha256(BB_PATH.read_bytes()).hexdigest()
pressure_total=int((ipl['pressure']&ipl['legal_ball']).sum())
meta={
 'title':'IPL Pressure Rankings Lab','version':'0.1.0-experimental','scope':'IPL only; seasons 2022–2026 inclusive; T20I excluded.',
 'dataSource':'Supplied SupeRR Selector Season 2 data pack: ball_by_ball.csv, matches.csv, competitions.csv.',
 'dataSha256':sha,'matches':int(ipl['match_id'].nunique()),'scheduledMatchRecords':int(len(ipl_matches)),'matchesWithoutDeliveryData':int(len(set(ipl_matches.match_id)-set(ipl.match_id))),'seasons':[2022,2023,2024,2025,2026],
 'rawDeliveries':int(len(ipl)),'pressureLegalDeliveries':pressure_total,'pressureDefinition':[
   {'name':'Death-over pressure','rule':'All recorded deliveries in overs 16–20. This captures late-innings execution, not necessarily a close match.'},
   {'name':'Middle-overs wicket pressure','rule':'Overs 11–15 when four or more wickets had fallen before the delivery.'},
   {'name':'Knockout pressure','rule':'Deliveries from over 11 onwards in Qualifiers, Eliminators and Finals.'},
   {'name':'Super-over pressure','rule':'All recorded deliveries in innings 3 or 4.'}
 ],
 'excludedSignals':['Required run rate / chase equation','Score margin / match closeness','Bowling economy','Player-vs-bowler matchup effects'],
 'limitations':[
  'The supplied extras1_runs field is a categorical code, not an actual extras-run total. Bowling economy and chase-state calculations are therefore excluded rather than reconstructed unsafely.',
  'Pressure is an observable phase-and-wicket-stress proxy. Death overs are not automatically close-game situations.',
  'Five IPL seasons only; this is not a career-long IPL ranking.',
  'Rank index is a transparent weighted percentile composite, not a calibrated probability or official player rating.',
  'Players have different roles, team contexts and opportunities; the lists are exploratory shortlists, not universal player-quality rankings.',
  '2026 data is included as supplied; this is a fixed dataset snapshot, not a live updating feed.'
 ],
 'battingMethod':{
  'eligibility':'At least 60 pressure legal balls and 150 total IPL legal balls in 2022–2026.',
  'performance':'Batter runs per legal ball (strike rate) in the defined pressure deliveries; batter dismissal count attributed by dismissed_player_id.',
  'shrinkage':'Pressure strike rate shrunk toward the player IPL baseline using a 60-ball prior.',
  'indexWeights':{'shrunkPressureStrikeRatePercentile':0.50,'pressureRetentionPercentile':0.30,'inversePressureDismissalRatePercentile':0.20}
 },
 'bowlingMethod':{
  'eligibility':'At least 90 pressure legal balls, 180 total IPL legal balls and 5 bowler-credited pressure wickets in 2022–2026.',
  'performance':'Bowler-credited wickets per 100 legal balls; run-outs, retirements and obstruction dismissals excluded.',
  'economy':'Not used because extras1_runs is categorical and cannot support reliable conceded-run totals.',
  'shrinkage':'Pressure wicket rate shrunk toward the player IPL baseline using a 60-ball prior.',
  'indexWeights':{'shrunkPressureWicketRatePercentile':0.55,'pressureRetentionPercentile':0.30,'pressureWicketVolumePercentile':0.15}
 },
 'minimumEligibleBatters':int(len(bat_eligible)),'minimumEligibleBowlers':int(len(bowl_eligible)),
 'splitHalfReliability':{
   'method':'Descriptive odd/even match_id split; same score formulas, lower per-half eligibility thresholds. Not a chronological holdout.',
   'batterPlayersCompared':int(len(bat_split)),'batterSpearman':round(bat_rho,3) if bat_rho is not None else None,
   'bowlerPlayersCompared':int(len(bowl_split)),'bowlerSpearman':round(bowl_rho,3) if bowl_rho is not None else None,
   'interpretation':'Low split-half agreement means rank order is sensitive to match sample. Treat ranks as exploratory, not definitive.'
 },
 'pressureProxyOverlap':{k:int(v) for k,v in {'deathOverRows':ipl.death_over.sum(),'middleWicketPressureRows':ipl.middle_wicket_pressure.sum(),'knockoutLateRows':ipl.knockout_late.sum(),'superOverRows':ipl.super_over.sum()}.items()},
 'batters':records(bat_eligible,'bat'),'bowlers':records(bowl_eligible,'bowl')
}
(ROOT/'src/data').mkdir(parents=True, exist_ok=True)
(ROOT/'docs').mkdir(parents=True, exist_ok=True)
(ROOT/'src/data/pressure-rankings.json').write_text(json.dumps(meta,indent=2))
# Full list CSV for transparency
bat_eligible.to_csv(ROOT/'docs/pressure-batter-candidates.csv',index=False)
bowl_eligible.to_csv(ROOT/'docs/pressure-bowler-candidates.csv',index=False)
(ROOT/'docs/pressure-rankings-methodology.md').write_text(f'''# IPL Pressure Rankings Lab — methodology and limitations\n\n**Status:** experimental, fixed supplied-data snapshot. **Scope:** IPL only, 2022–2026 inclusive. T20I records are excluded.\n\n## Dataset audit\n\n- IPL matches represented: {meta['matches']}\n- Recorded delivery rows: {meta['rawDeliveries']:,}\n- Pressure legal deliveries: {pressure_total:,}\n- Source ball-by-ball SHA-256: `{sha}`\n- Eligible batters after sample gates: {len(bat_eligible)}\n- Eligible bowlers after sample gates: {len(bowl_eligible)}\n\n## Pressure definition\n\nA delivery is included when at least one of the following observable conditions applies:\n\n1. Death overs 16–20.\n2. Middle overs 11–15 after at least four wickets have fallen before the delivery.\n3. Over 11 onwards in a Qualifier, Eliminator or Final.\n4. Super-over innings (innings 3 or 4).\n\nThis is a **phase-and-wicket-stress proxy**, not a complete measure of game pressure. It does not claim that every death over is close or that every knockout ball is equally stressful. The source does not safely support required run-rate, chase margin or bowling economy reconstruction: `extras1_runs` is a categorical code, not an extras-run amount. Those signals are excluded.\n\n## Batter index\n\nEligibility: at least 60 pressure legal balls and 150 total IPL legal balls. Batter runs per legal ball are measured from the `runs` field. Wide and overstep/no-ball events are excluded from balls faced; batter runs are still accumulated from the event rows. Dismissals are attributed using `dismissed_player_id`, including run-outs as a batter survival outcome.\n\nPressure strike rate is shrunk toward the player's IPL baseline using a 60-ball prior. The index is a weighted percentile composite: 50% shrunk pressure strike-rate percentile, 30% pressure-retention percentile, and 20% inverse pressure-dismissal-rate percentile.\n\n## Bowler index\n\nEligibility: at least 90 pressure legal balls, 180 total IPL legal balls and five bowler-credited pressure wickets. Bowler-credited dismissals exclude run-outs, retirements and obstruction dismissals. The index uses 55% shrunk pressure wickets per 100 legal balls, 30% retention versus baseline wicket rate, and 15% pressure-wicket volume percentile. Economy is deliberately omitted because extras cannot be reconstructed reliably from the supplied categorical field.\n\n## Reliability check\n\nAn odd/even match-ID split is reported in the dataset JSON. It is descriptive, not a chronological holdout. Low agreement should be read as evidence that ordered ranks are unstable—not hidden or averaged away.\n\n## Interpretation\n\nThe displayed Top 10s are exploratory IPL-only shortlist outputs from this fixed 2022–2026 data snapshot. They are **not** statistically certified all-time IPL pressure rankings, not career rankings, not a player-vs-bowler matchup model, and not RR recruitment targets. Use sample counts and uncertainty labels alongside rank. Rebuild the data and rerun all validations before any external submission.\n''')
# data-level audit manifest
(ROOT/'docs/pressure-rankings-audit.json').write_text(json.dumps({
 'sourceSha256':sha,'iplMatches':meta['matches'],'scheduledMatchRecords':meta['scheduledMatchRecords'],'matchesWithoutDeliveryData':meta['matchesWithoutDeliveryData'],'deliveryRows':len(ipl),'pressureLegalDeliveries':pressure_total,
 'battersEligible':len(bat_eligible),'bowlersEligible':len(bowl_eligible),
 'top10DistinctBatters':len({x['playerId'] for x in meta['batters']})==10,
 'top10DistinctBowlers':len({x['playerId'] for x in meta['bowlers']})==10,
 'splitHalf':meta['splitHalfReliability'],
 'notes':['IPL-only competitions selected by comp_name == IPL YYYY','T20I excluded','No economy or chase required-rate reconstruction','Pressure definition is phase/wicket-stress proxy']
},indent=2))
print(json.dumps({'source_sha':sha,'matches':meta['matches'],'rows':len(ipl),'pressure_legal':pressure_total,'eligible_batters':len(bat_eligible),'eligible_bowlers':len(bowl_eligible),'split_half':meta['splitHalfReliability'],'batters':meta['batters'],'bowlers':meta['bowlers']},indent=2))
