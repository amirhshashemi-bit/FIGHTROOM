# FIGHTROOM ARENA — Combat Lab

**Build:** 0.6.0-prealpha · **Status:** playable browser prototype, not release-ready

An isolated browser-based MMA combat prototype inside the FIGHTROOM repository. The existing content marketplace remains intact.

## Open
Visit `/arena/` on the deployed FIGHTROOM site. Three.js is loaded from jsDelivr; an internet connection is required.

## Current scope
- 30 original fictional fighters across 12 weight divisions (including six new fictional additions: three men and three women), with height, reach, stance, style, power, speed, wrestling and cardio attributes
- Distinct skin, hair, shorts and glove palettes; no real athlete names or identifiable likenesses
- FIGHTER FORGE custom fighter editor: name, country (localized ISO country selector), gender selection (male/female), height, weight, reach, skin/eye/hair/shorts/glove colors, stance, fighting style, shoulder/chest/arm/leg proportions and combat attributes
- Body metrics derive visual proportions from height, weight and body sliders; reach affects procedural arm extension as well as strike range
- Two signature-move loadout slots; standard jab/cross are available to all users, while premium subscribers can equip advanced striking and grappling techniques with keyboard 1/2 or mobile buttons
- Custom fighter profiles saved locally in the browser and selectable as a playable corner fighter
- Premium combat catalogue: takedown, ground-and-pound, submissions, spinning backfist, Superman punch, switch kick, question-mark kick, spinning elbow and flying knee are gated behind verified premium entitlement; no purchase/checkout is enabled
- Optional GLB/glTF motion-capture character import with clip-name mapping onto idle, movement, strikes, blocks, dodges and ground actions
- Stance, locomotion, jab, cross, hook, low/high kick, guard and evade for all users; premium takedowns, ground control, ground-and-pound, submissions and advanced striking
- Strike phases, stamina cost/regeneration, range checks, guard mitigation, hit reactions and basic CPU opponent
- Keyboard and touch action buttons
- 10 selectable procedural arena venue shells, with distinct palette and lighting presets (not bespoke photoreal venue art)
- 3-round bout clock, between-round rest, basic stoppage and score decision helpers
- optional synthesized impact/block/bell audio (starts muted until enabled)
- head/body/leg contact-volume checks and basic ground-state actions (early prototype)

## Controls
WASD move; J jab; L cross; K hook; U low kick; I high kick; 1/2 equipped signature moves; Space guard; Shift evade; O takedown (Premium); N ground pound (Premium); hold M submission (Premium); B stand up (free recovery). Select fighters in the roster bar. Upload an animated GLB for either corner to use captured animation clips.

## Honest limitations
This is a first playable combat foundation, not a finished MMA game. The built-in fighters are still procedural fallback models. The pinned CC0 male base-body GLB is now committed under `assets/models/` with a recorded SHA-256 and licence notice. It is a base asset with general locomotion clips, not an MMA-ready fighter, and is not automatically applied as the default model. The optional GLB import pipeline still supports per-corner manual upload. The character creator currently uses the prototype's procedural model; body sliders adjust procedural primitive proportions and do not yet sculpt a production-grade anatomical mesh. Height/weight/reach are reflected in procedural dimensions and arm extension. Custom profiles are local to the browser and are not cloud-synced. Ground states and submissions are early gameplay scaffolding, not a complete grappling animation/physics system. Referee scoring is simplified; a checked-in and retarget-tested mocap pack, complete grappling physics, animation blending polish, crowd/audio assets, network play, and bespoke venue art remain future work. Premium subscription/payment is not live: no account provider, server-side receipt verification, or purchase flow is connected. The entitlement adapter fails closed without a verified provider. The browser-side gate is not a security boundary; any online rewards, purchases or competitive actions must also be validated server-side. Premium special moves currently use original procedural animation, not motion capture. Test on desktop and mobile browsers before release.

See [ASSET_CREDITS.md](./ASSET_CREDITS.md) for source terms and attribution requirements.

## Humanoid rig validation (pre-alpha 0.3 work)
- Imported GLB files are inspected for a minimal humanoid bone set using common Mixamo/Blender aliases.
- The import result reports rig compatibility and the count of detected core bones; an incomplete rig is not silently reported as production-ready.
- If the asset contains supported morph targets (shoulders, chest, arms, legs), the custom fighter proportions are applied to those targets.
- Assets without morph targets remain loadable; the runtime reports zero applied morphs and does not fabricate body customization.
- This is a compatibility foundation, not a universal retargeter. Clip retargeting between unrelated skeletons and production anatomical base meshes remain future work.


## Country selection (pre-alpha 0.4)
- The custom fighter profile now stores a normalized ISO country code and display name.
- The creator presents a broad ISO country/territory selector localized through the browser `Intl.DisplayNames` API, including country flags where emoji glyphs are supported.
- The selected country appears in the fighter profile/HUD and roster option labels. Existing 24 fictional roster members keep their assigned countries.

## Professional character asset source review
- A CC0 rigged male base mesh is available from Innerscene, adapted from MakeHuman: 163-bone skeleton, skin weights, embedded textures, approximately 109k triangles. Source/download page: https://www.innerscene.com/tools/library/3d-parts/male-base-mesh-3d-person-rigged-a-pose-380e6d89
- This source is a neutral A-pose male base only; it is not a complete fight-ready 24-character pack, and the download has not been committed to this repository. It needs clothing, female counterpart(s), body morphs, and animation retarget/validation before production use.
- MakeHuman core graphics assets are CC0; source code licensing is separate. Asset terms are documented by MakeHuman Community: https://static.makehumancommunity.org/about/license.html
- Ara 3D Gen is another open-source character generation pipeline using CC0 MakeHuman data and exports GLB/FBX; evaluate the exact source assets and export pipeline before adopting. https://github.com/olatunde85/3d-gen

- Verified animated CC0 base-body export (8.21 MB) from CharacterCreator is linked in the creator panel for download/import. Its upstream license notes mark generated `output/*.glb` assets CC0; the generator code has a separate GPL-3.0-or-later license. The linked base is an anatomical male base with basic procedural locomotion clips, not a dressed fight-ready roster pack. Source commit pinned: `852e48f316b90a0937234886630e4fb4cdfd1f78`.
- For fully dressed, hair/customization exports, the creator panel links to Ara 3D Gen, a separate open-source pipeline based on CC0 MakeHuman assets. Verify each export and its source terms before shipping.


## Automated CC0 base asset retrieval (pre-alpha 0.5 work)
- A branch-scoped GitHub Actions workflow now fetches the exact pinned upstream GLB directly from its immutable source commit; this bypasses the binary-transfer limitation of the GitHub text-content connector.
- Before committing, the workflow checks the GLB v2 container header, declared file length, mesh payload, skin/skeleton payload, embedded animation clips, and expected upstream byte size. It then records a SHA-256 checksum and the CC0 asset notice.
- The workflow writes only to `arena/assets/models/` on `arena-combat-foundation`; it does not modify `main`.
- This asset retrieval is not the same as completing the 24 fighters. The source is an anatomical male base with general locomotion clips. Do not enable it as the default visible fighter until clothing/coverage, rig compatibility, proportions, and Android performance are reviewed. It does not contain a verified MMA move set.
- The workflow is triggered by its first feature-branch push and can also be run manually through GitHub Actions if the push trigger is not available.


## Roster expansion and gender-aware creator (pre-alpha 0.5)
- Roster expanded from 24 to 30 original fictional fighters: three new men and three new women.
- Each new fighter has a distinct country, division, stance, style, combat attributes, color palette and body-proportion profile.
- The custom fighter creator now saves a male/female selection. The procedural model uses a subtle shoulder/arm/hip silhouette adjustment; it remains a low-detail placeholder, not a professional anatomical mesh.


## Imported base model asset (verified in repository)
- File: `assets/models/cc0-base-body-anim.glb` (upstream file size: 8,212,156 bytes).
- Pinned upstream: CharacterCreator commit `852e48f316b90a0937234886630e4fb4cdfd1f78`; upstream Git blob `bdbdab04eb85903e46c56ff56c7a1ea0cbe9c78b`.
- Repository blob SHA matches the pinned upstream Git blob; SHA-256 is recorded in `assets/models/cc0-base-body-anim.sha256`.
- Licence notice: `assets/models/CC0-ASSET-NOTICE.md` (CC0-1.0 for generated GLB output).
- This is an anatomical male base with general locomotion animations. It has not passed visual, clothing, fight-clip, retarget or Android performance QA; it is not yet the default model.


## Premium combat implementation (pre-alpha 0.6)
See [PREMIUM_COMBAT.md](./PREMIUM_COMBAT.md) for the standard/premium move split, entitlement contract and security limits. The premium move set has dedicated timing, stamina, range and damage values and shares the standard contact/guard/evasion resolver. The CPU can now attempt wrestling entries and react to ground-control states. Automated tests cover the new move specifications and fail-closed entitlement behavior.


## Grappling expansion (pre-alpha 0.7 work)
- Added a deterministic paired-position resolver for clinch, takedown outcomes, top control, bottom guard, side control, mount, back control, submission, ground-and-pound, and stand-up recovery.
- Added premium-gated clinch entries, takedowns, positional passing, sweeps, mount/back takes, ground-and-pound and submissions. Sprawl, frames, escape, submission defense and stand-up recovery remain free so players can defend and avoid a gameplay soft-lock.
- Mobile touch controls now expose the grappling and defensive actions. A clinch closes the distance before the takedown follow-up; wrestling skill affects takedown success.
- Seven deterministic grappling tests are included in the Node suite.
- Browser QA now has a Playwright workflow for desktop and a 390×844 Android-sized touch viewport, including screenshots uploaded as a GitHub Actions artifact.
- This CI browser run is an emulated viewport, not a physical Android handset test. Real-device input latency, GPU performance, browser compatibility and visual motion review still require a physical device.
- Grappling positions are gameplay state transitions with procedural fallback poses; they are not yet physically simulated wrestling or real motion-capture clips.
