# FIGHTROOM ARENA — Combat Lab

An isolated browser-based MMA combat prototype inside the FIGHTROOM repository. The existing content marketplace remains intact.

## Open
Visit `/arena/` on the deployed FIGHTROOM site. Three.js is loaded from jsDelivr; an internet connection is required.

## Current scope
- Procedural articulated original fighter models (no unlicensed real-fighter likenesses)
- Stance, locomotion, jab, cross, hook, low/high kick, guard, evade and takedown attempt
- Strike phases, stamina cost/regeneration, range checks, guard mitigation, hit reactions and basic CPU opponent
- Keyboard and touch action buttons
- 10 venue identity records in `data/venues.json`; venue-specific 3D builds are not yet implemented

## Controls
WASD move; J jab; L cross; K hook; U low kick; I high kick; Space guard; Shift evade; O takedown.

## Honest limitations
This is a first playable combat foundation, not a finished MMA game. The fighters are procedural models with authored procedural motion, not optical motion-capture. Ground grappling, submissions, referee/ruleset, robust physics, animation blending polish, audio, network play, and full venue art remain future work. Test on desktop and mobile browsers before release.
