# FIGHTROOM Arena — motion and character pipeline

## Runtime status (2026-11-18)

- **Male/female fighters:** separate Quaternius Universal Base Characters (Standard) GLBs, CC0 1.0. Both use matching 65-joint humanoid skeletons and approximately 13k triangles. The runtime normalizes each model to 1.78 m before attaching it to the fighter root.
- **FIGHTROOM art overlays:** compression tops, shorts, gloves, shoes, short male hair and a female ponytail are procedural meshes attached to the rig; these are original project assets, not part of the Quaternius pack.
- **Native animation:** Quaternius Universal Animation Library 1 (Standard), 43 clips, CC0 1.0. The clip tracks use the same 65 bone names as the fighter models and play directly on both rigs without retargeting. The runtime loads this library once, then disposes its temporary preview geometry/materials/textures. Idle uses a captured, validated bind pose because the pack's generic idle loop did not produce a suitable upright MMA stance on these models.
- **Real single-actor motion capture:** 27 ACCAD BVH source clips are committed with per-file SHA-256 checksums and CC BY 3.0 attribution. Five are currently connected to both active fighters: jab, cross, roundhouse, high block and dodge. The remaining 22 are available but not yet wired into gameplay.
- **Paired motion capture:** two genuine synchronized CMU interaction pairs are integrated: arm wrestling and pull/resist. Neither is an MMA takedown or submission capture.
- **Grappling:** clinch, takedown, sprawl, sweep, pass, mount, back take, frame, escape, submission control, ground-and-pound posture and technical stand-up are currently driven by original paired procedural choreography. They are not labelled as real paired mocap.

## Active model and animation assets

- Male/female model files: `assets/models/quaternius/human_male.glb`, `human_female.glb`.
- Model source and CC0 notice: `assets/models/quaternius/ASSET_NOTICE.md`.
- UAL1 animation library: `assets/mocap/quaternius/UAL1_Standard.glb`.
- UAL1 source and CC0 notice: `assets/mocap/quaternius/UAL1_NOTICE.md`.
- GLB packer: `pack-gltf-to-glb.js`. It embeds source glTF buffers and textures into GLB containers without changing topology, vertex positions, skin weights, inverse bind matrices or bone names.
- The separate Innerscene 163-bone female base is archived under `assets/models/source/` but excluded from runtime because its skin deformation failed visual review even with BVH animation disabled.
- The earlier CharacterCreator male anatomical base remains in the repository for research; it is not the active visible fighter.

## ACCAD retargeting

The active Quaternius skeleton has a separate `root` control bone and a dedicated `pelvis`. The retarget name map therefore maps the BVH `Hips` track to `pelvis` and leaves `root` unmapped. This prevents the same source hip motion from being applied twice. The remaining mapped landmarks include spine, head, upper arms, hands, thighs and feet.

The five selected BVH clips are:
- `Male2_E1_JabLeft.bvh`
- `Male2_E3_CrossLeft.bvh`
- `Male2_G8_RoundhouseLeft.bvh`
- `Male2_E11_BlockLeftHigh.bvh`
- `Male2_E19_DodgeLeft.bvh`

The 43 UAL1 clips provide native idle/walk and authored punch/reaction fallbacks. UAL1 clips are authored animation-library data, not motion-capture recordings; ACCAD clips are the real mocap source. Do not conflate the two.

## Paired human interaction captures

Two matched two-actor interactions are bundled from the CMU Graphics Lab Motion Capture Database:
- **Pull / resist:** Actor A Subject 18, Trial 3 and Actor B Subject 19, Trial 3 — “A pulls B; B resists”; both clips 4.900 seconds.
- **Arm wrestle:** Actor A Subject 22, Trial 17 and Actor B Subject 23, Trial 17 — “rush up, arm wrestle”; both clips 6.900 seconds.

Converted FBX source distribution: https://huggingface.co/datasets/gbionics/cmu-fbx

Both pairs are checked for root translation and skeletal tracks, retargeted independently to each fighter, and played from one shared elapsed-time clock. Their adjacent `NOTICE.md` files contain provenance, terms and SHA-256 values. Preview buttons pause normal combat and restore fighter state when playback ends.

**Scope warning:** these are genuine paired human interactions, but not MMA wrestling. They do not validate double-leg takedowns, pummelling, sprawl, BJJ transitions, submissions or ground-and-pound.

## Import procedure

1. Select a fictional fighter. The runtime loads the gender-matched Quaternius GLB and attaches original FIGHTROOM fightwear overlays.
2. The runtime loads UAL1 once and assigns the native clips to the selected fighter's mixer.
3. Five selected ACCAD BVH files are parsed and retargeted onto the active rig. The importer validates the humanoid landmarks and reports the mapped bone count.
4. If a move has no supported clip, the game uses its procedural fallback. It does not discard the imported model or mixer.
5. For manual import, choose an animated GLB or BVH in the corresponding corner's motion input. Record source, licence, attribution, SHA-256, frame rate, skeleton notes and playback QA before shipping.

## Release blockers

- Five ACCAD actions are wired; the remaining 22 source clips still need per-clip retarget calibration and visual review.
- Fightwear overlays need detailed fit/clipping review on both character rigs.
- The 30-person roster shares the two base meshes; there are not 30 unique production models or bespoke faces.
- The arena is procedural, not photorealistic; no crowd, commentary, network play or production audio pipeline is complete.
- Paired MMA wrestling/submission capture is still missing; most grappling remains procedural.
- No physical Android device QA, GPU/memory profile or touch-latency test has been completed.
- Premium subscription/payment is not connected to a live provider.
