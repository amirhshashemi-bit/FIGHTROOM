import test from 'node:test';
import assert from 'node:assert/strict';
import {createGrapplePair,advanceGrapplePair,sampleGrapplePose,updateGrapplePair} from './grappling-choreography.js';
const fighter=()=>({grapplePair:null,grappleRole:null,grapplePose:null});
test('paired choreography assigns both actors and advances one shared timeline',()=>{
 const a=fighter(),b=fighter(),pair=createGrapplePair('takedown',a,b);
 assert.equal(a.grapplePair,b.grapplePair);assert.equal(a.grappleRole,'attacker');assert.equal(b.grappleRole,'defender');
 updateGrapplePair(pair,.65);assert.ok(a.grapplePose.drive>0);assert.ok(b.grapplePose.rootPitch>0);
});
test('takedown roles have different, coordinated body mechanics',()=>{
 const a=sampleGrapplePose('takedown','attacker',.5,.5),b=sampleGrapplePose('takedown','defender',.5,.5);
 assert.ok(a.drive>0);assert.ok(a.lean>b.lean);assert.ok(b.rootPitch>0);
});
test('sweep, guard pass, mount and technical stand-up expose distinct pose outputs',()=>{
 assert.ok(sampleGrapplePose('sweep','attacker',.5,.5).turn>.2);
 assert.ok(sampleGrapplePose('pass','defender',.5,.5).guard>.5);
 assert.ok(sampleGrapplePose('mount','attacker',.5,.5).drive>0);
 assert.ok(sampleGrapplePose('stand-up','defender',.2,.2).level>0);
});
test('pair completion clears both actor references',()=>{
 const a=fighter(),b=fighter(),pair=createGrapplePair('clinch',a,b);
 const tick=advanceGrapplePair(pair,9);
 assert.equal(tick.done,true);assert.equal(a.grapplePair,null);assert.equal(b.grapplePair,null);
});
