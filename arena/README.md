# FIGHTROOM ARENA — Combat Lab

**Build:** 0.4.0-prealpha · **Status:** playable browser prototype, not release-ready

An isolated browser-based MMA combat prototype inside the FIGHTROOM repository. The existing content marketplace remains intact.

## Open
Visit `/arena/` on the deployed FIGHTROOM site. Three.js is loaded from jsDelivr; an internet connection is required.

## Current scope
- 24 original fictional fighters across 12 weight divisions, with height, reach, stance, style, power, speed, wrestling and cardio attributes
- Distinct skin, hair, shorts and glove palettes; no real athlete names or identifiable likenesses
- FIGHTER FORGE custom fighter editor: name, country (localized ISO country selector), height, weight, reach, skin/eye/hair/shorts/glove colors, stance, fighting style, shoulder/chest/arm/leg proportions and combat attributes
- Body metrics derive visual proportions from height, weight and body sliders; reach affects procedural arm extension as well as strike range
- Two signature-move loadout slots for owned moves; starter jab/cross can be equipped and triggered with keyboard 1/2 or mobile buttons; locked premium entries remain unavailable
- Custom fighter profiles saved locally in the browser and selectable as a playable corner fighter
- Premium MOVE STORE catalogue with separately listed signature/advanced motion entries and preview pricing; checkout is intentionally disabled until a secure payment and entitlement backend exists
- Optional GLB/glTF motion-capture character import with clip-name mapping onto idle, movement, strikes, blocks, dodges and ground actions
- Stance, locomotion, jab, cross, hook, low/high kick, guard, evade and takedown attempt
- Strike phases, stamina cost/regeneration, range checks, guard mitigation, hit reactions and basic CPU opponent
- Keyboard and touch action buttons
- 10 selectable procedural arena venue shells, with distinct palette and lighting presets (not bespoke photoreal venue art)
- 3-round bout clock, between-round rest, basic stoppage and score decision helpers
- optional synthesized impact/block/bell audio (starts muted until enabled)
- head/body/leg contact-volume checks and basic ground-state actions (early prototype)

## Controls
WASD move; J jab; L cross; K hook; U low kick; I high kick; 1/2 equipped signature moves; Space guard; Shift evade; O takedown; N ground pound; hold M submission; B stand up. Select fighters in the roster bar. Upload an animated GLB for either corner to use captured animation clips.

## Honest limitations
This is a first playable combat foundation, not a finished MMA game. The built-in fighters are still procedural fallback models. A GLB import pipeline now accepts externally supplied animated humanoid models and uses their embedded clips, but no real mocap GLB has yet been committed or automatically applied by default. The character creator currently uses the prototype's procedural model; body sliders adjust procedural primitive proportions and do not yet sculpt a production-grade anatomical mesh. Height/weight/reach are reflected in procedural dimensions and arm extension. Custom profiles are local to the browser and are not cloud-synced. Ground states and submissions are early gameplay scaffolding, not a complete grappling animation/physics system. Referee scoring is simplified; a checked-in and retarget-tested mocap pack, complete grappling physics, animation blending polish, crowd/audio assets, network play, and bespoke venue art remain future work. Premium purchases are not live: there is no payment provider, server-side receipt verification, account inventory, refund flow, or secure ownership delivery. The catalogue buttons remain disabled and no payment can be taken. Purchased motion clips will only be equipped after licensed animation assets are integrated and validated. Test on desktop and mobile browsers before release.

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
