# FIGHTROOM ARENA — third-party asset credits

## Motion capture sources evaluated

The project has a GLB import and animation-mapping pipeline. The sources below have been checked for stated terms, but no third-party motion files are committed to this repository yet.

- Open Motion Project / ACCAD, The Ohio State University — CC BY 3.0. Attribution: “Open Motion Project by ACCAD / The Ohio State University.” Source: https://accad.ohio-state.edu/research/motion-lab/mocap-system-and-data
- 100STYLE Dataset — CC BY 4.0. Attribution: Ian Mason, Sebastian Starke and Taku Komura (2022). Access and export through KinemIQ: https://kinemiq.app/free-motion-capture-data/
- KinemIQ 35-animation starter pack — described by its publisher as CC0 1.0 / Quaternius Universal Animation Library. Source: https://kinemiq.itch.io/free-game-animations

KinemIQ describes its 285 real mocap clips as 115 ACCAD clips (CC BY 3.0) and 170 100STYLE clips (CC BY 4.0), with exports in GLB/glTF, FBX and BVH. Verify each exported clip's embedded attribution and licence file before release. Sources: https://kinemiq.app/sources/ and https://kinemiq.app/free-motion-capture-data/

## Fighter roster

All names and profiles in `roster.js` are original fictional creations. They are not UFC athletes, do not use real fighter names or nicknames, and are not intended to identify any individual. Skin tones and national backgrounds are broad fictional art-direction choices, not a claim about an individual person's ethnicity.

## Release gate

Do not mark motion capture as installed until a real source file is checked into the repository with its matching credit/licence, SHA-256, skeleton notes, and successful retarget/playback test. Do not ship real athlete names, likenesses, personal statistics, UFC branding or official roster data as a commercial roster without a separate rights review.


## Candidate: Innerscene / MakeHuman CC0 base mesh
- Source page: https://www.innerscene.com/tools/library/3d-parts/male-base-mesh-3d-person-rigged-a-pose-380e6d89
- Described asset: male neutral A-pose, 163-bone skeleton, skin weights, embedded textures, about 109k triangles; derived from MakeHuman CC0 assets and dedicated as CC0.
- Status: reviewed, **not downloaded or committed**. It is a male base only, not a complete roster or production-ready fighter. Clothing, female base, shape morphs, and clip compatibility remain to be built and tested.
- MakeHuman asset license details: https://static.makehumancommunity.org/about/license.html
- Candidate generation pipeline (MIT code; CC0 MakeHuman assets claimed by upstream): https://github.com/olatunde85/3d-gen — verify each asset and upstream terms before shipping.


## Candidate: CharacterCreator CC0 animated base body
- Source repository: https://github.com/kblood/CharacterCreator
- Pinned source commit: `852e48f316b90a0937234886630e4fb4cdfd1f78`
- Exact asset: `output/base_body_anim.glb` (8,212,156 bytes; Git blob `bdbdab04eb85903e46c56ff56c7a1ea0cbe9c78b`).
- Upstream license notes identify generated output GLBs as CC0-1.0. The generator code is GPL-3.0-or-later and is not copied into FIGHTROOM.
- Direct download: https://raw.githubusercontent.com/kblood/CharacterCreator/852e48f316b90a0937234886630e4fb4cdfd1f78/output/base_body_anim.glb
- Status: **binary committed in FIGHTROOM** at `arena/assets/models/cc0-base-body-anim.glb`. Its repository Git blob SHA `bdbdab04eb85903e46c56ff56c7a1ea0cbe9c78b` matches the pinned upstream blob SHA. A SHA-256 checksum and licence notice are also committed beside it. The connector cannot display the binary bytes, but the Git object identity verifies the exact upstream asset. This is a male anatomical base with general locomotion clips, not a complete dressed MMA fighter asset. Further clothing, female base, and MMA clip integration are required.
- License notes: https://github.com/kblood/CharacterCreator/blob/852e48f316b90a0937234886630e4fb4cdfd1f78/LICENSE-NOTES.md


## Automated pinned asset retrieval
- Workflow: `.github/workflows/import-cc0-character.yml`
- Target branch: `arena-combat-foundation` only; `main` is not modified.
- The workflow downloads the exact pinned upstream GLB, validates the GLB v2 container, meshes, skin, and embedded clips, and generates a SHA-256 checksum plus this asset notice.
- Repository status remains **pending workflow verification** until the binary, checksum, and notice are visible in the feature branch.
- Even after successful import, the asset remains a male anatomical base with locomotion clips; it is not a finished MMA fighter or a 24-character roster pack.


## Repository import verification
- FIGHTROOM path: `arena/assets/models/cc0-base-body-anim.glb`
- Git blob SHA-1: `bdbdab04eb85903e46c56ff56c7a1ea0cbe9c78b` (identical to the pinned upstream Git blob).
- SHA-256: `0eb271d4adea12b7f6bb1d4d8f7398db702f9449479be559ab9f019b5ab30b0f`
- Checksum file: `arena/assets/models/cc0-base-body-anim.sha256`
- This verifies file transfer into the feature branch. It does **not** establish that the model is a finished fighter or has been visually tested in-game.
