# FIGHTROOM ARENA — Combat Lab

An isolated browser-based MMA combat prototype inside the FIGHTROOM repository. The existing content marketplace remains intact.

## Open
Visit `/arena/` on the deployed FIGHTROOM site. Three.js is loaded from jsDelivr; an internet connection is required.

## Current scope
- Procedural articulated original fighter models (no unlicensed real-fighter likenesses)
- Stance, locomotion, jab, cross, hook, low/high kick, guard, evade and takedown attempt
- Strike phases, stamina cost/regeneration, range checks, guard mitigation, hit reactions and basic CPU opponent
- Keyboard and touch action buttons
- 10 selectable procedural arena venue shells, with distinct palette and lighting presets (not bespoke photoreal venue art)
- 3-round bout clock, between-round rest, basic stoppage and score decision helpers
- optional synthesized impact/block/bell audio (starts muted until enabled)
- head/body/leg contact-volume checks and basic ground-state actions (early prototype)

## Controls
WASD move; J jab; L cross; K hook; U low kick; I high kick; Space guard; Shift evade; O takedown.

## Honest limitations
This is a first playable combat foundation, not a finished MMA game. The fighters are procedural models with authored procedural motion, not optical motion-capture. Ground states and submissions are early gameplay scaffolding, not a complete grappling animation/physics system. Referee scoring is simplified; robust physics, optical motion capture, animation blending polish, crowd/audio assets, network play, and bespoke venue art remain future work. Test on desktop and mobile browsers before release.
