# FIGHTROOM Arena — motion-capture integration pipeline

## Status
The runtime now accepts:
1. A validated animated humanoid GLB as the fighter model and base clip library.
2. Additional BVH files per fighter, retargeted onto the GLB skeleton through Three.js SkeletonUtils.
3. Temporary procedural fallback for moves absent from the imported capture set; the imported mixer remains alive so later supported captured clips can resume.

This is a working import/retarget pipeline. It is **not** a claim that a full MMA mocap pack has been downloaded, embedded or approved for release. No BVH source clip is currently bundled in the repository.

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
4. Name the file after its move, e.g. `jab-left.bvh`, `roundhouse-right.bvh`, `idle-fighting-stance.bvh`. Action aliases resolve the clip name to gameplay moves.
5. If a move has no imported clip, the game uses the procedural pose for that move. It does not discard the imported model or mixer.
6. Before shipping, record each file's source, licence, attribution, SHA-256, frame rate, skeleton notes and a successful playback/retarget test in the asset manifest.

## Current release blockers
- No real combat BVH clips are committed yet; external capture files must be exported and imported for visual playback verification.
- No dedicated two-person wrestling/submission mocap is integrated.
- Retarget mapping is a conservative humanoid name-map, not a universal retargeter. Unusual skeletons are rejected rather than silently accepted.
- Root-motion extraction, foot locking, contact-aware blending and per-move retarget calibration remain future polish.
