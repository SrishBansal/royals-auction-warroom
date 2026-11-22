# Hawk-Eye-derived data provenance and restrictions

- Input filename supplied by the project owner: `mensIPLHawkeyeStats.csv`.
- SHA-256: `138b861f4e72739eff00c6ccb73f80eb5b27f722112d4cefbb957c5a083f2262`.
- Public repository: <https://github.com/alittlefitness/HawkeyeStats>.
- Repository description: structured/tidy Hawk-Eye statistics available through the ICC PulseLive cricket API.
- This is a community-maintained redistribution, not a direct RR, ICC or Hawk-Eye licensed feed.
- The project-derived spatial model summary and 25-zone aggregate values are packaged; the raw CSV is not included.
- Source fields `PitchX`/`PitchY` describe pitch impact coordinates; `FieldX`/`FieldY` describe post-shot field location and are excluded as predictors; stumps fields remain excluded pending timing semantics.
- Reference methodology: <https://www.scitepress.org/PublishedPapers/2026/153068/>. The independently reproduced sample has a 413-row discrepancy with that paper and is not claimed as an exact reproduction.
- Copyright/permission caution: do not redistribute raw tracking rows without confirming applicable rights. Cricsheet also flags likely copyright concerns for Hawk-Eye data: <https://cricsheet.org/>.
- The spatial pilot has no safe date/season/team/venue or player crosswalk to the RR 2022–2026 data package. It is isolated from recruitment, pressure rankings and Match-State recommendations.
