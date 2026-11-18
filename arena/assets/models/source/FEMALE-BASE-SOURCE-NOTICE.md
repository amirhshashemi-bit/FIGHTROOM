# Female base mesh — source candidate (not used by runtime)

- Source: https://www.innerscene.com/tools/library/3d-parts/female-base-mesh-3d-person-rigged-a-pose-dba97ed5
- Licence: CC0 public-domain dedication, as stated on the source page.
- Publisher describes a 163-bone rig with skin weights.
- Source asset: `female-base-mesh-base_female.glb` (4,497,424 bytes).
- SHA-256: `7E45EF5EF58D4E6A3AA17EF4078CB5FFB02C3964CEF67C393973A6D4C0A8CBF8`.
- Rig structure passed the name/landmark inspection, but the skinned mesh rendered as severe spikes in the Three.js runtime even with the high-poly mesh hidden and no animation playing.
- It is intentionally excluded from the default roster. The active female fighter is the separate Quaternius CC0 female model at `assets/models/quaternius/human_female.glb`.
- Revisit only after the skin bind/inverse-bind matrices are repaired and static deformation is visually validated. Do not re-enable based on structural rig inspection alone.
