# Historical Impact Recommendation Model

**Data window:** IPL 2022–2026 · **Usable matches:** 362 · **Delivery rows:** 86,668 · **Legal deliveries:** 82,781

## Chronological holdout validation

| Delivery target | Model | MAE | RMSE | RMSE vs phase baseline | MAE vs phase baseline |
|---|---|---:|---:|---:|---:|
| Batter runs on legal deliveries | Venue-aware context model | 1.4475 | 1.8471 | 0.96% | -0.94% |
| Batter runs on legal deliveries | Venue-blind context model | 1.4494 | 1.8450 | 1.08% | -1.07% |

This is one shared pre-delivery context model. Its out-of-fold residuals are grouped by striker to describe batting performance and by bowler to describe batter runs prevented on legal deliveries. The bowler aggregation is not official bowler economy or total bowler runs conceded. The holdout uses 2022–2025 for fitting and all usable 2026 IPL matches for evaluation. The baseline is a training-set phase/innings/pace-spin mean. Model inputs are pre-delivery context only; delivery outcomes are not predictors. Production player residuals use venue-blind OOF predictions because adding venue ID did not improve the 2026 holdout. The context model improves RMSE by only about 1% but has worse MAE than the simple baseline. Treat it as uncertain comparative evidence, not a reliable outcome predictor.

## Venue coverage

| Venue ID | Mapped ground | Matches | Mapping confidence | Batting-first win % |
|---:|---|---:|---|---:|
| 3 | Wankhede Stadium, Mumbai | 48 | moderate | 41.66666666666667 |
| 49 | Narendra Modi Stadium, Ahmedabad | 35 | high | 51.42857142857142 |
| 1 | M. A. Chidambaram Stadium, Chennai | 31 | high | 38.70967741935484 |
| 8 | Eden Gardens, Kolkata | 30 | high | 53.57142857142857 |
| 3272 | Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow | 28 | high | 40.74074074074074 |
| 7 | Arun Jaitley Stadium, Delhi | 26 | high | 50.0 |
| 10 | Rajiv Gandhi International Stadium, Hyderabad | 26 | high | 52.0 |
| 2 | M. Chinnaswamy Stadium, Bengaluru | 23 | high | 47.82608695652174 |
| 6 | Sawai Mansingh Stadium, Jaipur | 21 | high | 42.857142857142854 |
| 12 | Unmapped venue ID 12 | 20 | unmapped | 50.0 |
| 3692 | Maharaja Yadavindra Singh International Cricket Stadium, Mullanpur | 17 | high | 47.05882352941176 |
| 46 | Unmapped venue ID 46 | 16 | unmapped | 50.0 |
| 119 | Unmapped venue ID 119 | 13 | unmapped | 76.92307692307693 |
| 48 | Himachal Pradesh Cricket Association Stadium, Dharamshala | 10 | high | 66.66666666666666 |
| 1241 | Barsapara Cricket Stadium, Guwahati | 7 | moderate | 42.857142857142854 |
| 79 | Punjab Cricket Association IS Bindra Stadium, Mohali | 5 | high | 60.0 |
| 101 | ACA-VDCA Cricket Stadium, Visakhapatnam | 4 | moderate | 50.0 |
| 135 | Unmapped venue ID 135 | 2 | unmapped | 0.0 |

## Data availability across current roster and recruitment board

| Player | Data status | Batting balls | Bowling legal balls |
|---|---|---:|---:|
| Vaibhav Sooryavanshi | IPL_DATA_AVAILABLE | 433 | 0 |
| Yashasvi Jaiswal | IPL_DATA_AVAILABLE | 1448 | 1 |
| Riyan Parag | IPL_DATA_AVAILABLE | 1000 | 186 |
| Dhruv Jurel | IPL_DATA_AVAILABLE | 772 | 0 |
| Donovan Ferreira | IPL_DATA_AVAILABLE | 191 | 18 |
| Ravindra Jadeja | IPL_DATA_AVAILABLE | 829 | 1223 |
| Ravi Bishnoi | IPL_DATA_AVAILABLE | 53 | 1254 |
| Yash Raj Punja | NO_MATCH_IN_SUPPLIED_IPL_BALL_BY_BALL | 0 | 0 |
| Jofra Archer | IPL_DATA_AVAILABLE | 100 | 741 |
| Nandre Burger | IPL_DATA_AVAILABLE | 9 | 351 |
| Mohammed Shami | IPL_DATA_AVAILABLE | 38 | 1200 |
| Sandeep Sharma | IPL_DATA_AVAILABLE | 11 | 943 |
| Manimaran Siddharth | IPL_DATA_AVAILABLE | 0 | 186 |
| Brijesh Sharma | IPL_DATA_AVAILABLE | 4 | 273 |
| Sushant Mishra | IPL_DATA_AVAILABLE | 3 | 38 |
| Shubham Dubey | IPL_DATA_AVAILABLE | 142 | 0 |
| Dasun Shanaka | IPL_DATA_AVAILABLE | 72 | 36 |
| Lhuan-dre Pretorius | NO_MATCH_IN_SUPPLIED_IPL_BALL_BY_BALL | 0 | 0 |
| Aman Rao Perala | NO_MATCH_IN_SUPPLIED_IPL_BALL_BY_BALL | 0 | 0 |
| Nehal Wadhera | IPL_DATA_AVAILABLE | 538 | 17 |
| Mitch Owen | NO_MATCH_IN_SUPPLIED_IPL_BALL_BY_BALL | 0 | 0 |
| Shimron Hetmyer | IPL_DATA_AVAILABLE | 694 | 0 |
| Matthew Breetzke | IPL_DATA_AVAILABLE | 12 | 0 |
| Nitish Rana | IPL_DATA_AVAILABLE | 857 | 101 |
| Mahipal Lomror | IPL_DATA_AVAILABLE | 221 | 30 |
| Kamindu Mendis | IPL_DATA_AVAILABLE | 68 | 42 |
| Abishek Porel | IPL_DATA_AVAILABLE | 528 | 0 |
| Robin Minz | IPL_DATA_AVAILABLE | 19 | 0 |
| Daryl Mitchell | IPL_DATA_AVAILABLE | 267 | 48 |
| Matheesha Pathirana | IPL_DATA_AVAILABLE | 0 | 686 |
| Avesh Khan | IPL_DATA_AVAILABLE | 37 | 1221 |
| Trent Boult | IPL_DATA_AVAILABLE | 64 | 1333 |
| Matt Henry | IPL_DATA_AVAILABLE | 10 | 132 |
| Mustafizur Rahman | IPL_DATA_AVAILABLE | 7 | 506 |
| Akash Madhwal | IPL_DATA_AVAILABLE | 14 | 352 |
| Mangesh Yadav | NO_MATCH_IN_SUPPLIED_IPL_BALL_BY_BALL | 0 | 0 |
| Deepak Chahar | IPL_DATA_AVAILABLE | 33 | 696 |
| Gerald Coetzee | IPL_DATA_AVAILABLE | 27 | 261 |
| Onkar Tarmale | NO_MATCH_IN_SUPPLIED_IPL_BALL_BY_BALL | 0 | 0 |

## Impact Player historical flags

- Incoming impact records: 558
- Outgoing records: 558
- Matches with an incoming record: 291

Flags identify the historical incoming/outgoing impact players, but this archive does not record the exact substitution over/score. Do not train a state-specific impact-choice classifier from these flags alone.

## Critical limitations

- This is a context-adjusted descriptive player-skill layer, not a calibrated one-ball outcome distribution or match-win model.
- The context model only modestly improves RMSE over a simple phase baseline and does not improve MAE; use player residuals as uncertain comparative evidence, not precise forecasts.
- Venue ID did not improve chronological holdout performance; venue splits are descriptive player/ground samples with shrinkage and are not treated as a predictive pitch effect.
- Bowling context evidence is based on batter runs scored on legal deliveries against each bowler, not official bowler economy or total bowler runs conceded. Wickets and boundary rates are shown separately. The approximate P0 extras reconstruction is excluded from these player comparisons.
- Venue ID mapping is not complete because the uploaded archive has no venue lookup table; mapped names are analyst-curated joins from home-team concentration and retain explicit confidence/basis.
- No pitch report, weather, dew, ball condition or exact substitution timing is present. Venue history is not a prepared-strip or weather forecast.
- Data do not cover every player in the 2027 candidate board; those without an IPL match in the supplied period must remain no-estimate profiles.
- The historical Impact Player in/out flags permit retrospective usage summaries, not state-specific substitute-choice training. The archive has no entry timestamp, score, wickets, innings phase or nominated substitutes at the moment of change.