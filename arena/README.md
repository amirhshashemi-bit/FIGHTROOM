# FIGHTROOM ARENA — Combat Lab

An isolated browser-based MMA combat prototype inside the FIGHTROOM repository. The existing content marketplace remains intact.

## Open
Visit `/arena/` on the deployed FIGHTROOM site. Three.js is loaded from jsDelivr; an internet connection is required.

## Current scope
- 24 original fictional fighters across 12 weight divisions, with height, reach, stance, style, power, speed, wrestling and cardio attributes
- Distinct skin, hair, shorts and glove palettes; no real athlete names or identifiable likenesses
- Optional GLB/glTF motion-capture character import with clip-name mapping onto idle, movement, strikes, blocks, dodges and ground actions
- Stance, locomotion, jab, cross, hook, low/high kick, guard, evade and takedown attempt
- Strike phases, stamina cost/regeneration, range checks, guard mitigation, hit reactions and basic CPU opponent
- Keyboard and touch action buttons
- 10 selectable procedural arena venue shells, with distinct palette and lighting presets (not bespoke photoreal venue art)
- 3-round bout clock, between-round rest, basic stoppage and score decision helpers
- optional synthesized impact/block/bell audio (starts muted until enabled)
- head/body/leg contact-volume checks and basic ground-state actions (early prototype)

## Controls
WASD move; J jab; L cross; K hook; U low kick; I high kick; Space guard; Shift evade; O takedown; N ground pound; hold M submission; B stand up. Select fighters in the roster bar. Upload an animated GLB for either corner to use captured animation clips.

## Honest limitations
This is a first playable combat foundation, not a finished MMA game. The built-in fighters are still procedural fallback models. A GLB import pipeline now accepts externally supplied animated humanoid models and uses their embedded clips, but no real mocap GLB has yet been committed or automatically applied by default. Ground states and submissions are early gameplay scaffolding, not a complete grappling animation/physics system. Referee scoring is simplified; a checked-in and retarget-tested mocap pack, complete grappling physics, animation blending polish, crowd/audio assets, network play, and bespoke venue art remain future work. Test on desktop and mobile browsers before release.

See [ASSET_CREDITS.md](./ASSET_CREDITS.md) for source terms and attribution requirements.