# Female fighter base — source review (not used by runtime)

- Source: https://www.innerscene.com/tools/library/3d-parts/female-base-mesh-3d-person-rigged-a-pose-dba97ed5
- Publisher-described format/size: GLB, 4.5 MB.
- Publisher-described skeleton: 163 bones with skin weights.
- Licence stated by publisher: CC0; adapted from MakeHuman CC0 assets.
- Geometry: approximately 109k triangles.

## Source inspection

- The candidate has 163 bones, six base-mesh primitives and one separate high-poly mesh, with a CC0 notice from its publisher.
- Rig-name inspection and BVH mapping pass structurally, but that does not prove skin deformation is correct.
- In the current Three.js runtime, the skinned mesh rendered as severe spikes even with the high-poly mesh hidden and no BVH clip playing. It is therefore intentionally excluded from the visible roster.
- The game instead uses the CC0 male base's built-in `gender_female` morph target for the female roster, preserving one shared compatible skeleton and animation path.

## Next gate

- Revisit this source only after its skin bind / inverse-bind matrices and mesh deformation are corrected and visually validated.
- Do not re-enable it merely because structural rig inspection passes.
- The paired CMU sample is arm wrestling, not MMA takedown/submission/grappling. The pair loader is real and synchronized, but the game still needs dedicated licensed paired MMA captures for those combat actions.
- Do not use the neutral base without the runtime fightwear layer as a player-facing model.
