import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, getFighter, divisionList } from './roster.js';
import { MOCAP_SOURCES, REQUIRED_ACTIONS, validateMocapManifest } from './mocap.js';

test('fictional roster has unique identities and complete physical attributes',()=>{
 assert.ok(ROSTER.length>=24);
 assert.equal(new Set(ROSTER.map(f=>f.id)).size,ROSTER.length);
 assert.equal(new Set(ROSTER.map(f=>f.name)).size,ROSTER.length);
 for(const f of ROSTER){
  assert.ok(f.height>=150&&f.height<=210);
  assert.ok(f.reach>=150&&f.reach<=220);
  assert.ok(f.weight>45&&f.weight<=130);
  for(const key of ['power','speed','wrestling','cardio'])assert.ok(f[key]>=1&&f[key]<=100);
  assert.ok(f.country&&f.division&&f.style&&['Orthodox','Southpaw'].includes(f.stance));
 }
 assert.ok(divisionList.length>=10);
});
test('fighter lookup is stable and falls back to first fictional fighter',()=>{
 assert.equal(getFighter(ROSTER[0].id),ROSTER[0]);
 assert.equal(getFighter('not-a-real-id'),ROSTER[0]);
});
test('mocap requirements cover core MMA combat and safe source manifest',()=>{
 for(const action of ['jab','cross','hook','roundhouse','block','slip','sprawl','double-leg','ground-control','stand-up','hit-reaction','knockdown','get-up'])assert.ok(REQUIRED_ACTIONS.includes(action));
 assert.ok(MOCAP_SOURCES.some(s=>s.id==='kinemiq-open-mocap'));
 assert.deepEqual(validateMocapManifest(null),['manifest-required']);
 assert.ok(validateMocapManifest({skeleton:'humanoid',bones:[],license:'CC BY',source:'ACCAD',clips:[]}).length>0);
});
