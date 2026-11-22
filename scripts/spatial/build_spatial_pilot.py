import argparse, hashlib, importlib.metadata, pandas as pd, numpy as np, re, json, warnings, os, time
from sklearn.model_selection import GroupKFold
from sklearn.metrics import mean_absolute_error, mean_squared_error, average_precision_score, brier_score_loss, roc_auc_score
from lightgbm import LGBMRegressor, LGBMClassifier
warnings.filterwarnings('ignore')
parser = argparse.ArgumentParser(description='Build the reproducible Hawk-Eye-derived IPL spatial model pilot.')
parser.add_argument('--input', required=True, help='Path to mensIPLHawkeyeStats.csv obtained from the cited source under its applicable terms.')
parser.add_argument('--output-dir', required=True, help='Directory for spatial_model_pilot.json and pitch_zone_descriptive_summary.csv.')
args = parser.parse_args()
SRC = os.path.abspath(args.input)
OUT = os.path.abspath(args.output_dir)
os.makedirs(OUT, exist_ok=True)
with open(SRC, 'rb') as src_file: source_sha256 = hashlib.sha256(src_file.read()).hexdigest()
df=pd.read_csv(SRC,low_memory=False)
# Parse ICC delivery labels: innings.over.delivery-sequence. The separate `ball`
# field is the legal-ball index inside the over; third component preserves extras.
parts=df['delivery'].str.split('.',expand=True).astype(int)
df['innings']=parts[0]; df['over']=parts[1]; df['delivery_seq']=parts[2]
# Main innings only; wide/no-ball do not consume a legal ball.
ex=df['extras'].fillna('').str.lower()
df['is_legal']=~ex.str.contains('wd|nb',regex=True)
df['is_main_innings']=df['innings'].isin([1,2])
df=df.sort_values(['matchId','innings','over','delivery_seq']).copy()
# All-dismissal state for wickets-in-hand. The wicket target is separately restricted to
# bowler-credited dismissals; retired hurt is not treated as a wicket in state.
dismiss=df['dismissalDetails'].fillna('').str.lower().str.strip()
# Exclude both source spellings of retired hurt; keep bare 'Retired' as a dismissal.
df['is_team_wicket']=df['dismissalDetails'].notna() & ~dismiss.str.contains(r'retired\s*\(?hurt\)?', regex=True)
# Bowler credited: bowled, lbw, caught, stumped, caught & bowled, hit wicket.
patterns=[r'^b\s',r'^lbw\s',r'^c\s.*\sb\s',r'^st\s.*\sb\s',r'^hit wicket',r'^c\s*&\s*b\s',r'^caught\s*&\s*bowled']
df['is_bowler_wicket']=False
for pat in patterns: df['is_bowler_wicket'] |= dismiss.str.contains(pat,regex=True)
# Build pre-delivery state on FULL delivery sequence, including wides/no-balls.
grp=['matchId','innings']
df['score_before']=df.groupby(grp)['runs'].cumsum()-df['runs']
df['wickets_before']=df.groupby(grp)['is_team_wicket'].cumsum().astype(int)-df['is_team_wicket'].astype(int)
df['legal_balls_before']=df.groupby(grp)['is_legal'].cumsum().astype(int)-df['is_legal'].astype(int)
# Derive target from first innings total; use only standard completed two-innings records.
first_totals=(df[df.innings==1].groupby('matchId')['runs'].sum()+1).rename('target')
df=df.merge(first_totals,on='matchId',how='left')
df['balls_remaining']=(120-df['legal_balls_before']).clip(lower=0,upper=120)
df['wickets_in_hand']=(10-df['wickets_before']).clip(lower=0,upper=10)
df['current_rr']=np.where(df['legal_balls_before']>0,df['score_before']/(df['legal_balls_before']/6),0.0)
df['required_rr']=np.where(df['innings']==2,(df['target']-df['score_before'])/(df['balls_remaining'].clip(lower=1)/6),0.0)
df['required_rr']=df['required_rr'].clip(lower=0,upper=36)
df['phase']=pd.cut(df['over'],bins=[0,6,15,20],labels=['powerplay','middle','death'],include_lowest=True).astype(str)
df['innings_cat']=df['innings'].astype(str)
df['rightHandedBat_cat']=df['rightHandedBat'].astype(str)
df['rightArmedBowl_cat']=df['rightArmedBowl'].astype(str)
# Hawk-Eye speed sentinel: documented values <5 m/s are measurement failures.
df['ballSpeed_clean']=df['ballSpeed'].where(df['ballSpeed']>=5,np.nan)
# Physically plausible observed pitch location. The paper describes real locations
# as approximately +/-1m across and 0-13m down the pitch; exclude gross artefacts.
df['pitch_location_valid']=df['pitchX'].between(-1,1)&df['pitchY'].between(0,13)&df['pitchX'].notna()&df['pitchY'].notna()
# Align lateral coordinate relative to batter handedness; retain neutral label until
# source-axis orientation is independently confirmed.
df['line_batter_relative']=np.where(df['rightHandedBat'],df['pitchX'],-df['pitchX'])
# 5x5 equal-width descriptive grid; model uses continuous location features.
df['line_zone']=pd.cut(df['line_batter_relative'],bins=np.linspace(-1,1,6),labels=['L1','L2','L3','L4','L5'],include_lowest=True)
df['length_zone']=pd.cut(df['pitchY'],bins=np.linspace(0,13,6),labels=['Y1','Y2','Y3','Y4','Y5'],include_lowest=True)
df['zone']=df['line_zone'].astype(str)+'-'+df['length_zone'].astype(str)
# Modelling set: main innings, legal deliveries, tracked and plausible pitch location.
model=df[df.is_main_innings & df.is_legal & df.pitch_location_valid].copy()
model=model[model['batterRuns'].notna() & model['bowlingStyle'].notna() & model['rightHandedBat'].notna()].copy()
# Avoid super-over and malformed 0-over labels; target only where first innings observed.
model=model[model['over'].between(1,20)].copy()
# bowler wicket target only for legal deliveries.
# Score-state quality checks
summary={
 'raw_rows':int(len(df)), 'unique_matches':int(df.matchId.nunique()),
 'unique_match_delivery_keys':int(df[['matchId','delivery']].drop_duplicates().shape[0]),
 'duplicate_match_delivery_keys':int(df.duplicated(['matchId','delivery']).sum()),
 'pitch_x_missing':int(df.pitchX.isna().sum()), 'pitch_y_missing':int(df.pitchY.isna().sum()),
 'pitch_pair_missing_pct':round((df.pitchX.isna()|df.pitchY.isna()).mean()*100,3),
 'ball_speed_lt5_count':int((df.ballSpeed<5).sum()), 'ball_speed_lt5_pct':round((df.ballSpeed<5).mean()*100,3),
 'main_innings_rows':int(df.is_main_innings.sum()),
 'legal_main_rows':int((df.is_main_innings&df.is_legal).sum()),
 'legal_main_matches':int(df.loc[df.is_main_innings&df.is_legal,'matchId'].nunique()),
 'pitch_valid_legal_main_rows':int(len(model)),
 'pitch_valid_legal_main_matches':int(model.matchId.nunique()),
 'bowler_wickets_in_model':int(model.is_bowler_wicket.sum()),
 'all_wicket_events_model':int(model.is_team_wicket.sum()),
 'retired_hurt_rows_excluded_from_team_wickets':int(dismiss.str.contains(r'retired\s*\(?hurt\)?',regex=True).sum()),
 'bare_retired_rows_retained_as_team_wickets':int(dismiss.eq('retired').sum()),
 'wicket_rate_bowler':round(model.is_bowler_wicket.mean(),6),
 'pitch_x_invalid_nonmissing_legal_main':int((df.is_main_innings&df.is_legal&df.pitchX.notna()&~df.pitchX.between(-1,1)).sum()),
 'pitch_y_invalid_nonmissing_legal_main':int((df.is_main_innings&df.is_legal&df.pitchY.notna()&~df.pitchY.between(0,13)).sum()),
 'target_available_pct':round(model.target.notna().mean()*100,3),
}
# Compare row count to published paper sample and explain any discrepancy.
# Zone summary
zone=(model.groupby(['length_zone','line_zone'],observed=False)
      .agg(deliveries=('batterRuns','size'),batter_runs_per_ball=('batterRuns','mean'),
           bowler_wicket_rate=('is_bowler_wicket','mean'),bowler_wickets=('is_bowler_wicket','sum'))
      .reset_index())
# Build predictors. No IDs, dismissal/shot/field coords or post-outcome descriptors.
cat_cols=['phase','innings_cat','bowlingStyle','rightHandedBat_cat','rightArmedBowl_cat']
num_context=['over','legal_balls_before','balls_remaining','wickets_before','wickets_in_hand','score_before','current_rr','required_rr','ballSpeed_clean']
ctx=num_context+cat_cols
loc=['line_batter_relative','pitchY']
# Model uses only rows with valid target and state; ensure no leakage features.
feature_df=model[ctx+loc].copy()
for c in cat_cols: feature_df[c]=feature_df[c].astype('category')
# Replace infinite state values and drop impossible states.
feature_df=feature_df.replace([np.inf,-np.inf],np.nan)
y_reg=model['batterRuns'].astype(float).to_numpy()
y_cls=model['is_bowler_wicket'].astype(int).to_numpy()
groups=model['matchId'].to_numpy()
cv=GroupKFold(n_splits=3,shuffle=True,random_state=20261121)

def make_reg():
 return LGBMRegressor(n_estimators=55,learning_rate=.06,num_leaves=15,min_child_samples=150,
                      reg_lambda=2.0,colsample_bytree=.9,verbosity=-1,n_jobs=1,random_state=42)
def make_cls():
 return LGBMClassifier(n_estimators=55,learning_rate=.06,num_leaves=15,min_child_samples=150,
                        reg_lambda=2.0,colsample_bytree=.9,verbosity=-1,n_jobs=1,random_state=42)
reg_results={}; cls_results={}
reg_oof_by_model={}; cls_oof_by_model={}
models={'location_only':loc,'context_only':ctx,'context_plus_location':ctx+loc}
for name,features in models.items():
 oof=np.full(len(model),np.nan)
 for tr,te in cv.split(feature_df,y_reg,groups):
  m=make_reg(); m.fit(feature_df.iloc[tr][features],y_reg[tr]); oof[te]=m.predict(feature_df.iloc[te][features])
 reg_oof_by_model[name]=oof
 reg_results[name]={'mae':float(mean_absolute_error(y_reg,oof)),'rmse':float(np.sqrt(mean_squared_error(y_reg,oof)))}
 if name!='location_only':
  oofc=np.full(len(model),np.nan)
  for tr,te in cv.split(feature_df,y_cls,groups):
   m=make_cls(); m.fit(feature_df.iloc[tr][features],y_cls[tr]); oofc[te]=m.predict_proba(feature_df.iloc[te][features])[:,1]
  cls_oof_by_model[name]=oofc
  cls_results[name]={'average_precision':float(average_precision_score(y_cls,oofc)),'brier':float(brier_score_loss(y_cls,oofc)),'auc':float(roc_auc_score(y_cls,oofc))}
summary['regression_grouped_oof_3fold']=reg_results
summary['bowler_wicket_grouped_oof_3fold']=cls_results
summary['base_bowler_wicket_rate']=float(y_cls.mean())
# Paired, match-cluster bootstrap over already generated OOF predictions. This does
# not refit the models; it measures sampling uncertainty in the OOF metric deltas.
# Positive deltas mean context+location is better than context-only.
group_codes, unique_groups = pd.factorize(groups)
n_groups = len(unique_groups)
cluster_rng = np.random.default_rng(20261122)
bootstrap_reps = 1000
bootstrap_metrics = {name: [] for name in ['mae_improvement', 'rmse_improvement', 'ap_improvement', 'brier_improvement']}
for _ in range(bootstrap_reps):
 sampled = cluster_rng.integers(0, n_groups, size=n_groups)
 group_weights = np.bincount(sampled, minlength=n_groups)
 row_weights = group_weights[group_codes].astype(float)
 if row_weights.sum() == 0:
  continue
 reg_ctx = reg_oof_by_model['context_only']
 reg_full = reg_oof_by_model['context_plus_location']
 cls_ctx = cls_oof_by_model['context_only']
 cls_full = cls_oof_by_model['context_plus_location']
 mae_ctx = np.average(np.abs(y_reg-reg_ctx), weights=row_weights)
 mae_full = np.average(np.abs(y_reg-reg_full), weights=row_weights)
 rmse_ctx = np.sqrt(np.average((y_reg-reg_ctx)**2, weights=row_weights))
 rmse_full = np.sqrt(np.average((y_reg-reg_full)**2, weights=row_weights))
 ap_ctx = average_precision_score(y_cls, cls_ctx, sample_weight=row_weights)
 ap_full = average_precision_score(y_cls, cls_full, sample_weight=row_weights)
 brier_ctx = np.average((y_cls-cls_ctx)**2, weights=row_weights)
 brier_full = np.average((y_cls-cls_full)**2, weights=row_weights)
 bootstrap_metrics['mae_improvement'].append(float(mae_ctx-mae_full))
 bootstrap_metrics['rmse_improvement'].append(float(rmse_ctx-rmse_full))
 bootstrap_metrics['ap_improvement'].append(float(ap_full-ap_ctx))
 bootstrap_metrics['brier_improvement'].append(float(brier_ctx-brier_full))
summary['paired_match_cluster_bootstrap'] = {
 'resamples': int(min(len(v) for v in bootstrap_metrics.values())),
 'cluster_unit': 'matchId',
 'seed': 20261122,
 'interpretation': 'Positive values favour context+location; intervals are percentile intervals over match-cluster resamples of the existing out-of-fold predictions, not model-refit intervals.',
 'deltas': {name: {
   'point_estimate': float({
     'mae_improvement': reg_results['context_only']['mae']-reg_results['context_plus_location']['mae'],
     'rmse_improvement': reg_results['context_only']['rmse']-reg_results['context_plus_location']['rmse'],
     'ap_improvement': cls_results['context_plus_location']['average_precision']-cls_results['context_only']['average_precision'],
     'brier_improvement': cls_results['context_only']['brier']-cls_results['context_plus_location']['brier'],
   }[name]),
   'ci95_low': float(np.percentile(values,2.5)),
   'ci95_high': float(np.percentile(values,97.5)),
   'fraction_positive': float(np.mean(np.asarray(values)>0)),
 } for name,values in bootstrap_metrics.items()}
}
# Preserve held-out (out-of-fold) predictions, then aggregate them by the actual
# landing zone. These are averaged predictions on observed tracked deliveries,
# not a next-ball inference API or a causal estimate of bowling to a zone.
pred_frame=model[['length_zone','line_zone']].copy()
for model_name in ['context_only','context_plus_location']:
 pred_frame[f'expected_batter_runs_{model_name}']=reg_oof_by_model[model_name]
 pred_frame[f'expected_bowler_wicket_rate_{model_name}']=cls_oof_by_model[model_name]
pred_zone=(pred_frame.groupby(['length_zone','line_zone'],observed=False)
           .agg(expected_batter_runs_context=('expected_batter_runs_context_only','mean'),
                expected_batter_runs_context_plus_location=('expected_batter_runs_context_plus_location','mean'),
                expected_bowler_wicket_rate_context=('expected_bowler_wicket_rate_context_only','mean'),
                expected_bowler_wicket_rate_context_plus_location=('expected_bowler_wicket_rate_context_plus_location','mean'))
           .reset_index())
zone=zone.merge(pred_zone,on=['length_zone','line_zone'],how='left',validate='one_to_one')
# Wilson 95% intervals for the descriptive observed bowler-wicket rate.
z=1.96
n=zone['deliveries'].astype(float)
p_hat=zone['bowler_wicket_rate'].astype(float)
denom=1+(z*z/n)
center=(p_hat+(z*z/(2*n)))/denom
half=(z*np.sqrt((p_hat*(1-p_hat)/n)+(z*z/(4*n*n))))/denom
zone['bowler_wicket_rate_wilson95_low']=(center-half).clip(lower=0)
zone['bowler_wicket_rate_wilson95_high']=(center+half).clip(upper=1)
zone.to_csv(os.path.join(OUT,'pitch_zone_descriptive_summary.csv'),index=False)
summary['oof_prediction_coverage']=int(np.isfinite(reg_oof_by_model['context_plus_location']).sum())
summary['oof_prediction_aggregation']='Per-delivery predictions from held-out match folds are averaged within the actual observed 5x5 landing zone. These are not a live next-ball prediction API, player-specific forecast or causal zone effect.'

summary['features_context']=ctx
summary['features_spatial']=loc
# Coverage by zone
summary['zone_nonempty']=int((zone.deliveries>0).sum())
summary['zones_25']=int(len(zone))
summary['min_zone_deliveries']=int(zone.deliveries.min())
summary['median_zone_deliveries']=float(zone.deliveries.median())
summary['max_zone_deliveries']=int(zone.deliveries.max())
summary['source'] = {
 'repository': 'https://github.com/alittlefitness/HawkeyeStats',
 'origin': 'ICC PulseLive cricket API, as described by the repository README',
 'paper': 'https://www.scitepress.org/PublishedPapers/2026/153068/',
 'raw_csv_sha256': source_sha256,
 'redistributed_raw_data_in_project': False
}
summary['prototype_notes'] = {
 'validation': '3-fold GroupKFold by match; one fixed model configuration; paired 1,000-resample match-cluster bootstrap over existing OOF predictions (no model refit); no chronological holdout or hyperparameter search',
 'spatial_features': 'Continuous pitchX mirrored by batter handedness and pitchY; 25 equal-width cells are for descriptive display only',
 'regression_target': 'batterRuns on legal deliveries',
 'classification_target': 'bowler-credited dismissal from dismissalDetails',
 'prediction_leakage_controls': ['fieldX/fieldY excluded because they describe post-shot landing', 'dismissalDetails excluded from predictors', 'runs and wickets are shifted to pre-delivery state before feature construction', 'stumpsX/stumpsY excluded pending timing semantics verification'],
 'important_limitations': ['Retired hurt is excluded from the wicket-in-hand state; both source spellings retired hurt and Retired (hurt) are normalized as non-wickets.', 'The uploaded CSV has no date, season, team or venue columns.', 'Its matchId identifiers do not directly match the current 2022-2026 competition data pack IDs.', 'The Hawk-Eye spatial pilot is not currently joined to the competition-period pressure rankings.', 'Coordinate orientation sign for off/leg interpretation needs confirmation before labeling zones as off-side/leg-side.', 'The pilot is not a final, publication-ready model.', 'Second-innings targets use first-innings total + 1; DLS adjustments are unavailable in the source.'],
 'software_versions': {name: importlib.metadata.version(name) for name in ['pandas', 'numpy', 'scikit-learn', 'lightgbm']}
}
summary['zones'] = zone.replace({np.nan: None}).to_dict(orient='records')
with open(os.path.join(OUT,'spatial_model_pilot.json'),'w') as f: json.dump(summary,f,indent=2)
print(json.dumps({k:v for k,v in summary.items() if k != 'zones'},indent=2))
print('\nTop zone counts')
print(zone.sort_values('deliveries',ascending=False).head(10).to_string(index=False))
print('\nSmallest zones')
print(zone.sort_values('deliveries').head(10).to_string(index=False))
