# GLB rig inspection — completed structural inspection (2026-11-18)

## Result
The cloud workflow inspected the pinned CC0 male base model:
- glTF 2.0; 60 nodes, 6 meshes, 1 skin and 53 joints.
- All seven humanoid-core landmarks matched: hips/pelvis, spine, head, both upper arms and both upper legs.
- 12 embedded clips: fall, idle, idle_breathe, idle_fidget, idle_look, jump, land, run, strafe_left, strafe_right, walk and walk_back.
- Only idle and basic forward/backward locomotion map to the current action vocabulary. No MMA strike, kick, defense, takedown, ground-pound or submission clip is embedded.

## Verified
- Structural GLB parsing and humanoid-core inspection pass in GitHub Actions.
- Browser QA loads eight real ACCAD clips and maps 13 bones on this male test rig.

## Not verified
- This is not a dressed fight-ready character and is not the default roster model.
- Generic locomotion clips are not MMA techniques.
- Structural bone-name matching is not proof of biomechanical correctness.
- Clothing, female rig compatibility and Android performance are not verified.

## Female base candidate
A separate female CC0 source has been imported under assets/models/source/ for inspection only; it is intentionally excluded from the runtime roster. It must not be loaded as a visible fighter until clothing, hair, rig mapping, animation playback and visual QA pass.

The former stale “next gate: inspect the real model” wording is superseded: male GLB structural inspection is complete; dressed production character integration is not.
