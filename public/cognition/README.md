# /cognition asset directory

This directory hosts the seven PM47.9.2 production proof-pack frames
referenced by `src/pages/Cognition.jsx` and rendered at
`https://industriallystrong.com/cognition`.

## Required files

Copy from `~/Documents/Organized_Control_Plane/Phoenix/PM47_9_2_ProofPack/`:

- `2026-05-15_pm47_9_2_grid.png`
- `2026-05-15_pm47_9_2_es_detail.png`
- `2026-05-15_pm47_9_2_nq_detail.png`
- `2026-05-15_pm47_9_2_operator_auth.png`
- `2026-05-15_pm47_9_2_authenticated_header.png`
- `2026-05-15_pm47_9_2_replay_identity.png`
- `2026-05-15_pm47_9_2_runner_evidence.png`

```bash
cp ~/Documents/Organized_Control_Plane/Phoenix/PM47_9_2_ProofPack/2026-05-15_pm47_9_2_*.png \
   ~/Documents/GitHub/industriallystrong-site/public/cognition/
```

## DEMONSTRATOR labelling invariant

Each PNG must be the production capture with the DEMONSTRATOR chip
visible in-band. Do NOT crop or edit the captures — the in-band
labelling is part of the artifact's maturity-discipline contract
(§11.4 of the master spec; see also `PM47_9_2_CAPTURE_PROTOCOL.md` in
`qrl-phoenix-api/docs/`).

## Optional bonus frame

If `2026-05-15_pm47_9_2_replay_identity_json.png` was banked
in S1, copy it as well — Cognition.jsx does not currently render it
but a future revision may.

## Why this README exists

git does not track empty directories. This README is the directory
anchor so the path `public/cognition/` exists in the repo before the
PNGs are copied in. Once the PNGs are copied + committed, this README
can stay or be deleted; it has no runtime effect.
