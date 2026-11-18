# GLB rig inspection — Quaternius runtime characters (2026-11-18)

## Active runtime assets

- Male: `assets/models/quaternius/human_male.glb`
- Female: `assets/models/quaternius/human_female.glb`
- Source: Quaternius Universal Base Characters (Standard), CC0 1.0 Universal.
- Each model contains one scene, 69 nodes, three meshes, one skin and 65 humanoid joints.
- The male and female skeletons use matching bone names: `root`, `pelvis`, `spine_01` through `spine_03`, `Head`, upper/lower arms, hands, thighs, calves and feet.
- The source glTFs have no embedded animation clips. The GLB packer embeds the original binary buffer and texture images without changing topology, vertex weights, inverse bind matrices or joint names.
- Source and packing notice: `assets/models/quaternius/ASSET_NOTICE.md`; packer: `pack-gltf-to-glb.js`.

## Runtime integration

- `ensureFighterMocapModel` chooses the male or female GLB from the selected fictional fighter's gender/division.
- Imported models are normalized to a 1.78 m standing height **before** being attached to the fighter root. This avoids applying world-space corner offsets as local model coordinates.
- Original fightwear and hair overlays attach to the Quaternius `spine_03`, `pelvis`, `Head`, `hand_l/r` and `foot_l/r` bones.
- ACCAD BVH retargeting uses the dedicated `pelvis` as the humanoid hips target and leaves the separate `root` control bone unmapped. This prevents the source Hips track from being applied twice to both root and pelvis.
- The browser runtime loads the 43-clip Quaternius UAL1 Standard library once and uses its native tracks on both matching rigs. Five ACCAD BVH combat clips (jab, cross, roundhouse, high block and dodge) plus one ACCAD standing capture for neutral idle are retargeted for each active corner; the remaining 21 committed ACCAD clips remain available for further mapping.

## Honest limitations

- These are stylized superhero-base characters, not photorealistic bespoke MMA fighters. FIGHTROOM adds original compression-top, shorts, glove, shoe, short-hair and ponytail geometry; fit and clipping need art review.
- The 30-person roster still shares the two base meshes; there are not 30 unique production character models or bespoke faces.
- The imported single-actor ACCAD clips are real motion capture, but paired grappling choreography remains procedural except for the two real CMU interaction previews (arm wrestle and pull/resist).
- No physical Android device QA has been completed. Performance, input latency, lighting and animation deformation still require a real handset test.
- Premium payment/entitlement is not connected to a live payment provider.
