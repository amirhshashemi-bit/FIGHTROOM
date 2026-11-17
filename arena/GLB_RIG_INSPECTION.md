# GLB rig inspection — pre-alpha pipeline step

The cloud workflow `.github/workflows/arena-glb-rig-inspection.yml` inspects the pinned CC0 base GLB without loading a browser or changing the game's default fighter.

Run locally from this folder with:

```sh
node --test glb-rig-inspector.test.js
node glb-rig-inspector.js assets/models/cc0-base-body-anim.glb
```

The report includes GLB version, mesh/skin/node counts, actual skin-joint names, matches for a conservative seven-bone humanoid core, embedded animation clip names, and a name-only mapping of clips to the current action vocabulary. The action mapping is deliberately descriptive: a matching name is not proof that the motion is biomechanically suitable or retargeted correctly.

The inspector exits non-zero for malformed GLB containers and for missing mesh, skin, or animation payloads. A model with a partial skeleton is reported as a non-candidate; it is not silently accepted as compatible.

## What this step does not do

- It does not retarget one skeleton to another.
- It does not claim that generic locomotion clips are MMA techniques.
- It does not change the active fighter model or hide the procedural fallback.
- It does not prove visual quality, clothing coverage, facial quality, or Android performance.

Next gate: inspect the real model's report, then decide whether a separately licensed female base and dressed male/female models can share a verified rig. Only after that should we implement and test persistent per-fighter model assets and actual clip retargeting.
