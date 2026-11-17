import test from 'node:test';
import assert from 'node:assert/strict';
import { MOVES, resolveStrike } from './combat-rules.js';

test('every authored strike has valid timing and positive reach',()=>{
 for(const [name,move] of Object.entries(MOVES)){
  assert.ok(move.cost>0,name);assert.ok(move.duration>0,name);
  assert.ok(move.reach>0,name);assert.ok(move.active[0]<move.active[1],name);
 }
});
test('strike outside range or behind defender misses',()=>{
 assert.equal(resolveStrike({move:'jab',distance:3,inFront:true}).result,'miss');
 assert.equal(resolveStrike({move:'cross',distance:1,inFront:false}).result,'miss');
});
test('front guard mitigates head strikes and drains stamina',()=>{
 const hit=resolveStrike({move:'cross',distance:1.5,inFront:true,guard:true,defenderStamina:80});
 assert.equal(hit.result,'blocked');assert.ok(hit.damage<MOVES.cross.damage);assert.ok(hit.staminaLoss>0);
});
test('evade avoids a correctly ranged strike',()=>{
 assert.equal(resolveStrike({move:'hook',distance:1.2,inFront:true,evading:true}).result,'evaded');
});
test('low kick can bypass high guard and still be defended by range',()=>{
 assert.equal(resolveStrike({move:'low',distance:1.5,inFront:true,guard:true,defenderStamina:80}).result,'hit');
 assert.equal(resolveStrike({move:'low',distance:2.8,inFront:true,guard:false}).result,'miss');
});
test('unknown techniques are rejected safely',()=>{
 assert.equal(resolveStrike({move:'teleport',distance:1,inFront:true}).result,'invalid');
});
