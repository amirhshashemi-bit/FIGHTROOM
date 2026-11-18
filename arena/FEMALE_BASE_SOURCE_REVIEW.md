# Female fighter base — source and runtime integration

- Source: https://www.innerscene.com/tools/library/3d-parts/female-base-mesh-3d-person-rigged-a-pose-dba97ed5
- Publisher-described format/size: GLB, 4.5 MB.
- Publisher-described skeleton: 163 bones with skin weights.
- Licence stated by publisher: CC0; adapted from MakeHuman CC0 assets.
- Geometry: approximately 109k triangles.

## Implemented

- The source GLB is now loaded for female roster fighters by the gender-matched mocap loader.
- Skinned bounds are updated before model normalization, so the 1.78 m target height is calculated from the deformed mesh bounds.
- Female-specific rig aliases are recognized by the rig inspector and motion retargeter.
- Runtime fightwear is generated and attached to the skeleton: sports top, shorts, waist/neck trim, hair, gloves and shoes.
- The eight real ACCAD single-actor motion clips can be retargeted to the female base.
- The CMU two-actor preview loader can retarget paired motion onto a female fighter and a male fighter independently.

## Important limitations

- The publisher asset is a neutral base, not a finished clothed fighter character. The outfit pieces are original procedural overlays and require visual art review for clipping, fit and deformation.
- The female rig and its clothing overlay have not yet been physically tested on Android hardware.
- The paired CMU sample is arm wrestling, not MMA takedown/submission/grappling. The pair loader is real and synchronized, but the game still needs dedicated licensed paired MMA captures for those combat actions.
- Do not use the neutral base without the runtime fightwear layer as a player-facing model.
