import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBodyContact, resolveImpactImpulse } from './contact-physics.js';
test('body contact separates overlapping fighters with mass-weighted correction',()=>{
 const r=resolveBodyContact({a:{x:0,z:0},b:{x:.5,z:0},radiusA:.4,radiusB:.4,massA:60,massB:90});
 assert.equal(r.hit,true);assert.ok(Math.hypot(r.b.x-r.a.x,r.b.z-r.a.z)>.5);assert.ok(r.a.x<0&&r.b.x>.5);
});
test('body contact leaves non-overlapping fighters unchanged',()=>{
 const r=resolveBodyContact({a:{x:0,z:0},b:{x:2,z:0}});assert.equal(r.hit,false);assert.deepEqual(r.a,{x:0,z:0});
});
test('coincident roots use a stable fallback normal',()=>{
 const r=resolveBodyContact({a:{x:0,z:0},b:{x:0,z:0}});assert.equal(r.hit,true);assert.ok(Number.isFinite(r.a.x)&&Number.isFinite(r.b.x));
});
test('impact impulse scales with damage and defender mass',()=>{
 const light=resolveImpactImpulse({attacker:{x:0,z:0},defender:{x:1,z:0},damage:8,defenderMassKg:60});
 const heavy=resolveImpactImpulse({attacker:{x:0,z:0},defender:{x:1,z:0},damage:8,defenderMassKg:100});
 assert.ok(light.x>0&&light.speed>heavy.speed);assert.equal(light.z,0);
});
test('guard mitigates impact and impulse is bounded',()=>{
 const normal=resolveImpactImpulse({attacker:{x:0,z:0},defender:{x:1,z:0},damage:10});
 const guard=resolveImpactImpulse({attacker:{x:0,z:0},defender:{x:1,z:0},damage:10,guarded:true});
 const max=resolveImpactImpulse({attacker:{x:0,z:0},defender:{x:1,z:0},damage:1000,defenderMassKg:35});
 assert.ok(guard.speed<normal.speed);assert.ok(max.speed<=.72);
});
