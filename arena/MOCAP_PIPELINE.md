# FIGHTROOM Arena — motion-capture integration pipeline

## Runtime status

The runtime accepts:
1. A validated animated humanoid GLB as the fighter model and base clip library.
2. Additional BVH files per fighter, retargeted onto the GLB skeleton through Three.js SkeletonUtils.
3. Synchronized two-actor FBX motion pairs, retargeted independently to each fighter but driven by one shared elapsed-time clock.
4. Temporary procedural fallback for moves absent from the imported capture set; imported mixers remain available so supported captured clips can resume.

A selected set of 27 real ACCAD BVH source clips is bundled with per-file SHA-256 checksums and CC BY 3.0 attribution. It covers single-performer striking, footwork, blocks, dodges, lying/crawling and get-up motion; it is not a complete paired MMA wrestling pack.

## Female fighter rig — integrated

- Source: Innerscene female base mesh, GLB, 4.5 MB, publisher-described 163-bone skin rig.
- Licence stated by publisher: CC0 public-domain dedication.
- The model is now loaded by the gender-matched ACCAD loader rather than being source-only.
- The loader updates skinned bounds before normalization; this avoids using the undeformed bind-pose bounds and incorrectly scaling the model.
- Female bone aliases are mapped to the existing humanoid motion sources, including root/pelvis, spine segments, shoulders, arms, legs, wrists and feet.
- A lightweight runtime fightwear overlay is attached to the rig: sports top, shorts, trim, hair, gloves and shoes. These are original procedural meshes, not clothing supplied by the model publisher.
- The eight-clip ACCAD demo pack can now be retargeted to the female rig as well as the male test rig.
- The source GLB is still a neutral base mesh; the procedural outfit is a functional game prototype, not a finished bespoke character-art pass. Visual clipping, hair silhouette, facial detail and mobile GPU/memory profiling remain release QA.

## Compatible single-actor sources and attribution

- Open Motion Project / ACCAD, The Ohio State University — CC BY 3.0. Attribution: “Open Motion Project by ACCAD / The Ohio State University.”
- KinemIQ's free motion-capture library describes 115 martial-arts clips from ACCAD under CC BY 3.0 and 170 locomotion clips from 100STYLE under CC BY 4.0. Exports are available as BVH, FBX and GLB/glTF. Verify embedded credit and licence file for every downloaded clip.
- Useful source pages:
  - https://kinemiq.app/free-motion-capture-data/
  - https://kinemiq.app/free-fighting-animations/
  - https://kinemiq.app/sources/
  - https://accad.ohio-state.edu/research/motion-lab/mocap-system-and-data

## Recommended single-actor capture set

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

1. Import the gender-matched base GLB for the selected corner. The loader checks humanoid landmarks before replacing the current model.
2. For female profiles, the runtime adds its sports fightwear overlay to the neutral CC0 base.
3. Choose a BVH file in the same corner's “MOTION BVH” file input, or load the bundled ACCAD demo pack.
4. The importer parses the BVH skeleton, maps target/source bone names using semantic aliases, requires hips/head plus a sufficient set of humanoid landmarks, and retargets the clip to the target skinned mesh.
5. Multiple BVH clips can be selected in one import. The checked-in ACCAD set includes jab, cross, hook, backfist, front/roundhouse/push kicks, blocks, dodges, stand, walk, lying, crawl and get-up clips.
6. If a move has no imported clip, the game uses the procedural pose for that move. It does not discard the imported model or mixer.
7. Before shipping, record each file's source, licence, attribution, SHA-256, frame rate, skeleton notes and a successful playback/retarget test in the asset manifest.

## Actual paired captures integrated — CMU interaction trials

Two matched two-actor interactions are now bundled from the CMU Graphics Lab Motion Capture Database:
- **Pull / resist:** Actor A Subject 18, Trial 3 and Actor B Subject 19, Trial 3 — “A pulls B; B resists”; both clips 4.900 seconds. Files: `assets/mocap/cmu-pairs/pull-resist/actor-a-18-03.fbx` and `actor-b-19-03.fbx`.
- **Arm wrestle:** Actor A Subject 22, Trial 17 and Actor B Subject 23, Trial 17 — “rush up, arm wrestle”; both clips 6.900 seconds. Files: `assets/mocap/cmu-pairs/arm-wrestle/actor-a-22-17.fbx` and `actor-b-23-17.fbx`.
- Converted FBX source distribution: https://huggingface.co/datasets/gbionics/cmu-fbx
- Both pairs are parsed, checked for root translation and skeletal tracks, retargeted independently to each fighter rig, then played from one shared elapsed-time clock. Keyframe counts may differ; time-based playback avoids assuming identical sample counts.
- Arena preview buttons: “PREVIEW ARM-WRESTLE PAIR” and “PREVIEW PULL / RESIST PAIR”. Normal combat and the bout clock pause during the preview; fighter state and position are restored when the clip finishes.
- Each pair's provenance, CMU terms, scope warning and SHA-256 values are in its adjacent `NOTICE.md`.

**Important scope:** these are genuine paired human interaction captures. Pull/resist is useful as a paired contact/force interaction prototype, and arm wrestling validates sustained two-person contact timing. Neither is an MMA double-leg, pummelling, sprawl, BJJ transition, submission, ground-and-pound or full wrestling move. Those gameplay actions still use the existing paired procedural position system until suitable licensed grappling captures are acquired. The paid RTK source previously identified remains unpurchased and is not used.

## Current release blockers

- The eight-clip ACCAD pack is now targeted at both male and female rigs; clip-by-clip visual review and biomechanics QA are still required.
- The CMU pull/resist and arm-wrestling paired demonstrations are integrated; neither replaces dedicated paired MMA grappling capture.
- Retarget mapping is a conservative humanoid name-map, not a universal retargeter. Unusual skeletons are rejected rather than silently accepted.
- Root-motion extraction, foot locking, contact-aware blending, per-move retarget calibration and full paired wrestling capture remain future polish.
- No physical Android test, mobile GPU/memory profile or touch-latency test has been performed.

## Paired package adapter

- `paired-motion.js` validates a shared-world two-subject sample package and samples both subjects at the same fractional frame.
- `paired-fbx-runtime.js` validates matched FBX actors, their root translation tracks and duration, retargets both clips and exposes a single shared-time playback clock.
- Unit tests cover mismatched durations, missing root tracks, independent key counts and shared-clock completion.
