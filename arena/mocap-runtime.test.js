import test from 'node:test';
import assert from 'node:assert/strict';
import { hasFighterClip } from './mocap-runtime.js';

test('recognizes only clips that exist in the imported fighter asset',()=>{
 const fighter={clips:[{name:'idle'},{name:'walk'},{name:'walk_back'},{name:'double_leg'},{name:'armbar'}]};
 assert.equal(hasFighterClip(fighter,'idle'),true);
 assert.equal(hasFighterClip(fighter,'advance'),true);
 assert.equal(hasFighterClip(fighter,'retreat'),true);
 assert.equal(hasFighterClip(fighter,'takedown'),true);
 assert.equal(hasFighterClip(fighter,'submission'),true);
 assert.equal(hasFighterClip(fighter,'spinning-backfist'),false);
 assert.equal(hasFighterClip(fighter,'flying-knee'),false);
});
test('missing clips are not reported as available',()=>assert.equal(hasFighterClip({clips:[]},'jab'),false));
