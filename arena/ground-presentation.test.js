import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveGroundPair, stepGroundPair } from './ground-presentation.js';
const fighter=(side,state,x)=>({side,groundState:state,x,z:0,root:{position:{x,y:0,z:0},rotation:{y:side<0?Math.PI/2:-Math.PI/2}}});
test('standing fighters are left to normal footwork spacing',()=>{assert.equal(resolveGroundPair(fighter(-1,'standing',-1),fighter(1,'standing',1)),null)});
test('clinch keeps both fighters in close paired range',()=>{const a=fighter(-1,'clinch',-1),b=fighter(1,'clinch',1);const p=resolveGroundPair(a,b);assert.equal(p.phase,'clinch');assert.ok(Math.abs(p.a.x-p.b.x)<1)});
test('top and bottom positions form a stable grounded pair',()=>{const a=fighter(-1,'top-control',-1),b=fighter(1,'bottom-guard',1);const p=resolveGroundPair(a,b);assert.equal(p.phase,'ground');assert.ok(Math.abs(p.a.x-p.b.x)<1);assert.ok(Math.abs(p.a.z-p.b.z)<.5)});
test('pair staging eases positions and rotations instead of teleporting',()=>{const a=fighter(-1,'mount',-1),b=fighter(1,'bottom-guard',1);const before=a.root.position.x;assert.equal(stepGroundPair(a,b,1/60),'ground');assert.notEqual(a.root.position.x,before);assert.ok(a.root.position.x>-1)});
