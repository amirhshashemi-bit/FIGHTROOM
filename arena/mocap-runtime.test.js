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

test('maps committed ACCAD source clip names to supported gameplay actions',()=>{
 const fighter={clips:[
  {name:'Male2_A1_Stand'},{name:'Male2_E1_JabLeft'},{name:'Male2_E3_CrossLeft'},
  {name:'Male2_E5_HookLeft'},{name:'Male2_G8_RoundhouseLeft'},
  {name:'Male2_G17_PushKickLeft'},{name:'Male2_E11_BlockLeftHigh'},
  {name:'Male2_E19_DodgeLeft'},{name:'Male2_A9_Lie'},
  {name:'Male2_A10_LieToCrouch'},{name:'Male2_E3_Advance'},{name:'Male2_E5_Retreat'}
 ]};
 for(const action of ['idle','jab','cross','hook','high','low','guard','dodge','ground-control','stand-up','advance','retreat'])assert.equal(hasFighterClip(fighter,action),true,action);
});
