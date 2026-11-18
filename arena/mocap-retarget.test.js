import test from 'node:test';
import assert from 'node:assert/strict';
import { semanticBone,buildRetargetNameMap,validateRetargetMap } from './mocap-retarget.js';
test('normalizes common Mixamo and BVH bone naming conventions',()=>{
 assert.equal(semanticBone('mixamorig:Hips'),'hips');
 assert.equal(semanticBone('LeftUpLeg'),'leftUpLeg');
 assert.equal(semanticBone('mixamorig:RightForeArm'),'rightForeArm');
});
test('builds target-to-source map for compatible humanoid skeletons',()=>{
 const target=['mixamorig:Hips','mixamorig:Spine','mixamorig:Head','mixamorig:LeftArm','mixamorig:RightArm','mixamorig:LeftUpLeg','mixamorig:RightUpLeg'];
 const source=['Hips','Spine','Head','LeftArm','RightArm','LeftUpLeg','RightUpLeg'];
 const map=buildRetargetNameMap(target,source),valid=validateRetargetMap(map);
 assert.equal(valid.compatible,true);assert.equal(valid.mappedCount,7);assert.equal(map['mixamorig:Hips'],'Hips');
});
test('rejects incomplete skeleton maps rather than silently loading broken motion',()=>{
 const map=buildRetargetNameMap(['Hips','Head','LeftArm'],['Hips','Head','LeftArm']);
 assert.equal(validateRetargetMap(map).compatible,false);
});

test('retargets onto Innerscene female base bone names',()=>{
 const target=['root','spine01','head','upperarm01.L','upperarm01.R','upperleg01.L','upperleg01.R'];
 const source=['Hips','Spine','Head','LeftArm','RightArm','LeftUpLeg','RightUpLeg'];
 const map=buildRetargetNameMap(target,source),valid=validateRetargetMap(map);
 assert.equal(valid.compatible,true);
 assert.equal(valid.mappedCount,7);
 assert.equal(map.root,'Hips');
 assert.equal(map['upperarm01.L'],'LeftArm');
 assert.equal(map['upperleg01.R'],'RightUpLeg');
});
