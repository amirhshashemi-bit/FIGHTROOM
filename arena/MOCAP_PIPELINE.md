# FIGHTROOM Arena — motion-capture integration pipeline

## Status
The runtime now accepts:
1. A validated animated humanoid GLB as the fighter model and base clip library.
2. Additional BVH files per fighter, retargeted onto the GLB skeleton through Three.js SkeletonUtils.
3. Temporary procedural fallback for moves absent from the imported capture set; the imported mixer remains alive so later supported captured clips can resume.

This is a working import/retarget pipeline. A selected set of 27 real ACCAD BVH source clips is now bundled with per-file SHA-256 checksums and CC BY 3.0 attribution. It covers single-performer striking, footwork, blocks, dodges, lying/crawling and get-up motion; it is not a complete paired MMA wrestling pack.

## Compatible sources and attribution
- Open Motion Project / ACCAD, The Ohio State University — CC BY 3.0. Attribution: “Open Motion Project by ACCAD / The Ohio State University.”
- KinemIQ's free motion-capture library describes 115 martial-arts clips from ACCAD under CC BY 3.0 and 170 locomotion clips from 100STYLE under CC BY 4.0. Exports are available as BVH, FBX and GLB/glTF. Verify the embedded credit and licence file for every downloaded clip.
- Useful source pages:
  - https://kinemiq.app/free-motion-capture-data/
  - https://kinemiq.app/free-fighting-animations/
  - https://kinemiq.app/sources/
  - https://accad.ohio-state.edu/research/motion-lab/mocap-system-and-data

## Recommended first capture set
Export as BVH, 30 FPS, in-place where available:
- idle / fighting stance
- advance and retreat
- jab, cross, hook, uppercut, backfist
- front kick, side kick, roundhouse, push kick
- high / middle / low block
- slip left/right, duck left/right
- hit reaction, fall, ground-to-stand recovery

The ACCAD martial-arts source is principally single-performer striking and footwork. It does not by itself supply a complete paired MMA wrestling set. Clinch pummelling, double-leg entry, sprawl, guard passing, mount transitions, back control, submission mechanics and submission defence need dedicated two-person wrestling capture or a separately licensed source. Do not label a single-person animation as validated two-person wrestling mocap.

## Import procedure
1. Import an animated GLB for the selected corner. The loader checks humanoid landmarks before replacing the current model.
2. Choose a BVH file in the same corner's “MOTION BVH” file input.
3. The importer parses the BVH skeleton, maps target/source bone names using semantic aliases, requires hips/head plus at least seven mapped humanoid landmarks, and retargets the clip to the target skinned mesh.
4. Multiple BVH clips can be selected in one import. The checked-in `assets/mocap/accad/` set includes jab, cross, hook, backfist, front/roundhouse/push kicks, blocks, dodges, stand, walk, lying, crawl and get-up clips. Action aliases resolve clip names to gameplay moves.
5. If a move has no imported clip, the game uses the procedural pose for that move. It does not discard the imported model or mixer.
6. Before shipping, record each file's source, licence, attribution, SHA-256, frame rate, skeleton notes and a successful playback/retarget test in the asset manifest.

## Current release blockers
- Browser CI successfully loads and retargets eight committed ACCAD clips onto the bundled male GLB test rig, reporting 13 mapped bones and no runtime errors. The full 27-clip pack still needs clip-by-clip visual review and biomechanics QA.
- No dedicated two-person wrestling/submission mocap is integrated.
- Retarget mapping is a conservative humanoid name-map, not a universal retargeter. Unusual skeletons are rejected rather than silently accepted.
- Root-motion extraction, foot locking, contact-aware blending and per-move retarget calibration remain future polish.


## Paired grappling source — commercial candidate, not acquired (2026-11-18)

A suitable two-person source has now been identified: RealTime Kinetics (RTK) BJJ captures on Hugging Face, including side-control attacks and De La Riva sequences. The commercial-tier packs contain two BVH actor files plus shared-frame world-space motion data at 60 FPS. The shared frame preserves both actors' relative position and orientation, which is required for contact-aware paired animation.

- Example: https://huggingface.co/datasets/rtk-training/bjj-sidecontrol-lesson001-commercial
- Example: https://huggingface.co/datasets/rtk-training/bjj-delariva-lesson006-commercial
- Licence: RTK Motion Single-Capture Commercial License; the publisher states commercial game use is permitted after purchase.
- Price stated by publisher: USD $99 for one capture; each additional capture requires a separate license.
- Access is gated and requires purchase plus Hugging Face approval.
- Status: **not purchased, not downloaded, not committed, and not used**. Do not fetch or use this material until the project owner explicitly approves the cost and obtains the license.

The free KungFu-Fiesta video/pose dataset is CC BY-NC 4.0 and is therefore not suitable for commercial game integration. The SFU motion database is also research-only. Do not bypass these restrictions.

### Import plan after a licensed capture is obtained
1. Preserve both subject BVH files and the shared-frame data together.
2. Verify the license file, dataset slug, frame rate, frame count and SHA-256 manifest.
3. Map both skeletons to the FIGHTROOM humanoid rig; validate paired root transforms and contact distance.
4. Build paired clips for the licensed action only, then run visual retarget QA before adding any additional capture.
