# FIGHTROOM ARENA — Combat Lab

**Build:** 0.2.0-prealpha · **Status:** playable browser prototype, not release-ready

An isolated browser-based MMA combat prototype inside the FIGHTROOM repository. The existing content marketplace remains intact.

## Open
Visit `/arena/` on the deployed FIGHTROOM site. Three.js is loaded from jsDelivr; an internet connection is required.

## Current scope
- 24 original fictional fighters across 12 weight divisions, with height, reach, stance, style, power, speed, wrestling and cardio attributes
- Distinct skin, hair, shorts and glove palettes; no real athlete names or identifiable likenesses
- FIGHTER FORGE custom fighter editor: name, height, weight, reach, skin/eye/hair/shorts/glove colors, stance, fighting style, shoulder/chest/arm/leg proportions and combat attributes
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