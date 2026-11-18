# FIGHTROOM ARENA — third-party asset credits

## Motion capture sources evaluated

The project has a GLB import and animation-mapping pipeline. The active runtime uses separate Quaternius CC0 male/female character bases with 65-joint humanoid rigs, the 43-clip Quaternius UAL1 Standard library (CC0), 27 ACCAD single-actor BVH clips (CC BY 3.0), and matched CMU two-actor interaction captures. The Innerscene female neutral base and earlier CharacterCreator male anatomical base are retained as research assets, not used by the default roster. The CMU pairs are arm wrestling and pull/resist, not an MMA takedown/submission pack.

- Open Motion Project / ACCAD, The Ohio State University — CC BY 3.0. Attribution: “Open Motion Project by ACCAD / The Ohio State University.” Source: https://accad.ohio-state.edu/research/motion-lab/mocap-system-and-data
- 100STYLE Dataset — CC BY 4.0. Attribution: Ian Mason, Sebastian Starke and Taku Komura (2022). Access and export through KinemIQ: https://kinemiq.app/free-motion-capture-data/
- KinemIQ 35-animation starter pack — described by its publisher as CC0 1.0 / Quaternius Universal Animation Library. Source: https://kinemiq.itch.io/free-game-animations

KinemIQ describes its 285 real mocap clips as 115 ACCAD clips (CC BY 3.0) and 170 100STYLE clips (CC BY 4.0), with exports in GLB/glTF, FBX and BVH. Verify each exported clip's embedded attribution and licence file before release. Sources: https://kinemiq.app/sources/ and https://kinemiq.app/free-motion-capture-data/

## Fighter roster

All names and profiles in `roster.js` are original fictional creations. They are not UFC athletes, do not use real fighter names or nicknames, and are not intended to identify any individual. Skin tones and national backgrounds are broad fictional art-direction choices, not a claim about an individual person's ethnicity.

## Release gate

For every additional motion pack, record its source, licence, attribution, SHA-256, skeleton notes and successful retarget/playback test before calling it integrated. Do not label the CMU arm-wrestling pair as MMA grappling. Do not ship real athlete names, likenesses, personal statistics, UFC branding or official roster data as a commercial roster without a separate rights review.


## Candidate: Innerscene / MakeHuman CC0 base mesh
- Source page: https://www.innerscene.com/tools/library/3d-parts/male-base-mesh-3d-person-rigged-a-pose-380e6d89
- Described asset: male neutral A-pose, 163-bone skeleton, skin weights, embedded textures, about 109k triangles; derived from MakeHuman CC0 assets and dedicated as CC0.
- Status: reviewed and downloaded as a candidate; not used by runtime. The source female candidate below is also excluded after visual skin-deformation failure.
- MakeHuman asset license details: https://static.makehumancommunity.org/about/license.html
- Candidate generation pipeline (MIT code; CC0 MakeHuman assets claimed by upstream): https://github.com/olatunde85/3d-gen — verify each asset and upstream terms before shipping.


## Candidate: CharacterCreator CC0 animated base body
- Source repository: https://github.com/kblood/CharacterCreator
- Pinned source commit: `852e48f316b90a0937234886630e4fb4cdfd1f78`
- Exact asset: `output/base_body_anim.glb` (8,212,156 bytes; Git blob `bdbdab04eb85903e46c56ff56c7a1ea0cbe9c78b`).
- Upstream license notes identify generated output GLBs as CC0-1.0. The generator code is GPL-3.0-or-later and is not copied into FIGHTROOM.
- Direct download: https://raw.githubusercontent.com/kblood/CharacterCreator/852e48f316b90a0937234886630e4fb4cdfd1f78/output/base_body_anim.glb
- Status: binary retained at `arena/assets/models/cc0-base-body-anim.glb` for research and rig comparison. It is not the default visible fighter. The active runtime character pair is Quaternius Universal Base Characters; see the notice under `arena/assets/models/quaternius/ASSET_NOTICE.md`.
- License notes: https://github.com/kblood/CharacterCreator/blob/852e48f316b90a0937234886630e4fb4cdfd1f78/LICENSE-NOTES.md


## Automated pinned asset retrieval
- Workflow: `.github/workflows/import-cc0-character.yml`
- Target branch: `arena-combat-foundation` only; `main` is not modified.
- The workflow downloads the exact pinned upstream GLB, validates the GLB v2 container, meshes, skin, and embedded clips, and generates a SHA-256 checksum plus this asset notice.
- Repository status: imported and verified in the feature branch. This research asset is not used by the default runtime; Quaternius male/female character models are the active roster bases.


## Repository import verification
- FIGHTROOM path: `arena/assets/models/cc0-base-body-anim.glb`
- Git blob SHA-1: `bdbdab04eb85903e46c56ff56c7a1ea0cbe9c78b` (identical to the pinned upstream Git blob).
- SHA-256: `0eb271d4adea12b7f6bb1d4d8f7398db702f9449479be559ab9f019b5ab30b0f`
- Checksum file: `arena/assets/models/cc0-base-body-anim.sha256`
- This verifies file transfer into the feature branch. It does **not** establish that the model is a finished fighter or has been visually tested in-game.


## BVH motion-capture import pipeline
- Runtime support: `arena/mocap-runtime.js` accepts BVH motion files and retargets them onto a validated imported GLB humanoid skeleton using Three.js SkeletonUtils.
- Bone mapping and compatibility checks: `arena/mocap-retarget.js`; incomplete rigs are rejected.
- External source candidates: Open Motion Project / ACCAD, The Ohio State University (CC BY 3.0) and 100STYLE (CC BY 4.0), distributed in part through KinemIQ exports.
- Attribution for ACCAD-derived clips: “Open Motion Project by ACCAD / The Ohio State University.”
- Status: **27 real ACCAD BVH clips are committed** under `arena/assets/mocap/accad/`, with individual SHA-256 values in `manifest.json` and `SHA256SUMS`, plus the CC BY 3.0 notice. Fifteen actions (jab, cross, hooks, roundhouse, high block, dodge, advance, retreat, sidesteps and push kicks) are connected to both active Quaternius fighter rigs; 12 source clips remain unwired.


## Quaternius Universal Animation Library 1 — native character motion
- Source: Quaternius Universal Animation Library Standard, official page https://quaternius.com/packs/universalanimationlibrary.html and download page https://quaternius.itch.io/universal-animation-library.
- License: CC0 1.0 Universal. The creator states the Standard library contains 43 clips and allows commercial use.
- Runtime file: `arena/assets/mocap/quaternius/UAL1_Standard.glb`. Its 65-joint naming matches the Quaternius male/female fighter rigs, so clips play natively without retargeting.
- The native library provides walk/punch/reaction clips; neutral idle restores the validated model bind pose. These are authored animation-library clips, not motion-capture recordings. Fifteen ACCAD BVH clips remain the real single-actor motion-capture actions currently connected to gameplay.
- Source notice: `arena/assets/mocap/quaternius/UAL1_NOTICE.md`.

## Active male/female fighter models — Quaternius CC0
- Source: Quaternius Universal Base Characters (Standard), official pack page https://quaternius.com/packs/universalbasecharacters.html and free download https://quaternius.itch.io/universal-base-characters.
- License: CC0 1.0 Universal. The creator describes the six base models as game-ready, humanoid-rigged and averaging about 13k triangles, and explicitly allows commercial use.
- FIGHTROOM imports `human_male.glb` and `human_female.glb` under `arena/assets/models/quaternius/`. Both source rigs have 65 matching humanoid joints; the packer embeds external images and buffers without changing mesh topology, skin weights or bone names.
- Runtime fightwear overlays are original FIGHTROOM geometry. ACCAD BVH clips are a separate CC BY 3.0 source and retain their own attribution requirement.
- Exact source files, packing method and licence notice: `arena/assets/models/quaternius/ASSET_NOTICE.md` and `arena/pack-gltf-to-glb.js`.

## Female Innerscene candidate — excluded from runtime
- Source: Innerscene female base mesh, GLB, publisher-described 163-bone skin rig; licence stated by publisher: CC0.
- Asset: `arena/assets/models/source/female-base-mesh-base_female.glb`; SHA-256: `7e45ef5ef58d4e6a3aa17ef4078cb5ffb02c3964cef67c393973a6d4c0a8cbf8`.
- Rig structure passed inspection, but the skinned mesh visibly deformed into spikes in the Three.js runtime even without BVH animation. It is intentionally excluded until skin bind/deformation is repaired.
- Source notice and review: `arena/assets/models/source/FEMALE-BASE-SOURCE-NOTICE.md` and `arena/FEMALE_BASE_SOURCE_REVIEW.md`.

## Matched two-actor capture — CMU arm wrestling
- Original publisher: Carnegie Mellon University Graphics Lab Motion Capture Database. Matched capture: Subject 22 / Trial 17 (Actor A) and Subject 23 / Trial 17 (Actor B), “rush up, arm wrestle”.
- Converted FBX distribution: https://huggingface.co/datasets/gbionics/cmu-fbx
- Runtime integration: `arena/paired-fbx-runtime.js` validates both actors, retargets them to separate fighter rigs and drives both mixers with a shared clock. Preview button: “PREVIEW REAL 2-PERSON MOCAP”.
- CMU terms permit copying/modification/redistribution and inclusion in commercially sold products, but prohibit reselling the motion data itself, including converted form. The files are game motion assets and are not sold as a standalone pack.
- Requested published-results acknowledgement: “The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217.”
- Exact files, hashes and scope warning: `arena/assets/mocap/cmu-pairs/arm-wrestle/NOTICE.md`.
- Scope: genuine paired human interaction capture; it is not an MMA takedown, BJJ submission or ground-grappling capture. Those still need a suitable licensed paired source.


## Matched two-actor CMU interaction captures
- Original publisher: Carnegie Mellon University Graphics Lab Motion Capture Database; converted FBX distribution: https://huggingface.co/datasets/gbionics/cmu-fbx
- Pull/resist: Subject 18 / Trial 3 (Actor A) + Subject 19 / Trial 3 (Actor B), 4.9 seconds. Files and SHA-256 values: `arena/assets/mocap/cmu-pairs/pull-resist/NOTICE.md`.
- Arm wrestle: Subject 22 / Trial 17 (Actor A) + Subject 23 / Trial 17 (Actor B), 6.9 seconds. Files and SHA-256 values: `arena/assets/mocap/cmu-pairs/arm-wrestle/NOTICE.md`.
- Runtime: `arena/paired-fbx-runtime.js` retargets each actor to a separate fighter skeleton and plays them with a common clock. The two preview buttons are in the arena toolbar.
- CMU terms allow copying, modification and redistribution, and inclusion in commercial products, but do not allow reselling the motion data itself, including converted versions. These files are game assets, not a standalone animation pack for sale.
- Neither capture is a dedicated MMA takedown, BJJ, submission or ground-grappling sequence; do not mislabel them as such.
