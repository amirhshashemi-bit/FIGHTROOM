# Female fighter base — source review and integration gate

- Source: https://www.innerscene.com/tools/library/3d-parts/female-base-mesh-3d-person-rigged-a-pose-dba97ed5
- Publisher-described format/size: GLB, 4.3 MB.
- Publisher-described skeleton: 163 bones with skin weights.
- Licence stated by publisher: CC0; adapted from MakeHuman CC0 assets.
- Geometry: approximately 109k triangles.

## Import policy
The GitHub Actions workflow import-female-cc0-base.yml downloads the source into assets/models/source/, validates the GLB container, mesh, skin and skeleton size, and records SHA-256 plus a source notice.

This is not a playable character asset. The source is an unclothed neutral base with no hair or fight-ready apparel. It must remain outside the runtime asset path until a covered fighter model is built and reviewed. Do not attach it to the roster or expose it in the player import panel.

## Required next checks
1. Verify actual joint names against mocap-retarget.js and character-rig.js.
2. Build and attach sports top, shorts, gloves, footwear and hair/face presentation while preserving skin weights and animation.
3. Run GLB load, BVH retarget, clipping/coverage review, desktop browser QA and then physical Android GPU/memory QA.

## Paired wrestling motion
No commercial-use two-person wrestling/submission capture has been accepted into the game yet. The SFU database is research-only and excludes commercial products, so it is not an acceptable source for a commercial game. Current paired ground positioning remains procedural gameplay presentation, not paired motion capture.
