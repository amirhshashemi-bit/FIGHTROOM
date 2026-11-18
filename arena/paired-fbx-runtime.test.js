import test from 'node:test';
import assert from 'node:assert/strict';
import { createPairClock,advancePairClock,validatePairedFbxScenes } from './paired-fbx-runtime.js';

function scene(duration=6.9,rootKeys=205){
 const bones=['hip','abdomen','chest','neck','head','lShldr','rShldr','lForeArm','rForeArm','lHand','rHand','lThigh','rThigh','lShin','rShin','lFoot','rFoot'];
 const root={isBone:true,name:'hip',children:[],traverse(fn){fn(this);for(const b of bones.slice(1))fn({isBone:true,name:b,children:[]})}};
 const track={name:'hip.position',times:new Float32Array(rootKeys),values:new Float32Array(rootKeys*3)};
 return {animations:[{duration,tracks:[track,...bones.slice(1).map(n=>({name:n+'.quaternion',times:new Float32Array([0,duration]),values:new Float32Array(8)}))]}],
  traverse(fn){fn(root);for(const b of bones.slice(1))fn({isBone:true,name:b})}};
}
test('accepts two synchronized actor captures with different key counts but same duration',()=>{
 const result=validatePairedFbxScenes(scene(6.9,205),scene(6.9,207));
 assert.equal(result.ok,true);assert.equal(result.duration,6.9);assert.equal(result.actors[0].rootKeys,205);assert.equal(result.actors[1].rootKeys,207);
});
test('rejects missing actor root translation and duration mismatch',()=>{
 assert.ok(validatePairedFbxScenes(scene(6.9),scene(7.4)).errors.includes('pair-duration-mismatch'));
 const a=scene();a.animations[0].tracks=a.animations[0].tracks.filter(t=>t.name!=='hip.position');
 assert.ok(validatePairedFbxScenes(a,scene()).errors.includes('paired-root-translation-missing'));
});
test('advances both actors on one shared clock and clamps at the common end',()=>{
 const clock=createPairClock(6.9);
 assert.deepEqual(advancePairClock(clock,.25),{time:.25,done:false});
 assert.deepEqual(advancePairClock(clock,9),{time:6.9,done:true});
 assert.deepEqual(advancePairClock(clock,.1),{time:6.9,done:true});
});
