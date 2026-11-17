import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_CUSTOM_FIGHTER,MOVE_CATALOG,normalizeCustomFighter} from './character-creator.js';

test('custom fighter profile clamps body dimensions and combat attributes',()=>{
 const p=normalizeCustomFighter({name:'  Test Fighter  ',height:999,reach:1,power:200,body:{shoulders:9,chest:.1,arms:1.1,legs:.9}});
 assert.equal(p.name,'Test Fighter');assert.equal(p.height,215);assert.equal(p.reach,145);assert.equal(p.power,100);
 assert.equal(p.body.shoulders,1.3);assert.equal(p.body.chest,.75);assert.equal(p.body.arms,1.1);
});
test('premium move catalogue has unique individually priced entries',()=>{
 assert.ok(MOVE_CATALOG.length>=8);
 assert.equal(new Set(MOVE_CATALOG.map(m=>m.id)).size,MOVE_CATALOG.length);
 for(const move of MOVE_CATALOG){assert.ok(move.name&&move.category&&move.price>0&&move.baseMove&&move.clip)}
});
test('default custom fighter is fictional and starts with a limited starter move set',()=>{
 const p=normalizeCustomFighter(DEFAULT_CUSTOM_FIGHTER);
 assert.equal(p.custom,true);assert.ok(p.ownedMoves.includes('signature-jab'));assert.ok(!p.ownedMoves.includes('flying-knee'));
});
