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

test('maps the real CMU FBX skeleton onto female rig segments',()=>{
 const target=['root','spine01','spine05','head','clavicle.L','upperarm01.L','upperarm02.L','lowerarm01.L','wrist.L','pelvis.L','upperleg02.L','lowerleg01.L','foot.L','clavicle.R','upperarm01.R','upperarm02.R','lowerarm01.R','wrist.R','pelvis.R','upperleg02.R','lowerleg01.R','foot.R'];
 const source=['hip','abdomen','chest','neck','head','lCollar','lShldr','lForeArm','lHand','lThigh','lShin','lFoot','rCollar','rShldr','rForeArm','rHand','rThigh','rShin','rFoot'];
 const map=buildRetargetNameMap(target,source),valid=validateRetargetMap(map);
 assert.equal(valid.compatible,true);
 assert.equal(map.root,'hip');
 assert.equal(map['upperarm01.L'],'lCollar');
 assert.equal(map['upperarm02.L'],'lShldr');
 assert.equal(map['lowerarm01.R'],'rForeArm');
 assert.equal(map['foot.R'],'rFoot');
});

test('maps Quaternius shared-root rigs to the dedicated pelvis instead of duplicating hip motion',()=>{
 const target=['root','pelvis','spine_01','spine_02','spine_03','Head','upperarm_l','upperarm_r','thigh_l','thigh_r','hand_l','hand_r','foot_l','foot_r'];
 const source=['Hips','Spine','Spine1','Spine2','Head','LeftArm','RightArm','LeftUpLeg','RightUpLeg','LeftHand','RightHand','LeftFoot','RightFoot'];
 const map=buildRetargetNameMap(target,source),valid=validateRetargetMap(map);
 assert.equal(valid.compatible,true);
 assert.equal(map.root,undefined);
 assert.equal(map.pelvis,'Hips');
 assert.equal(map.spine_01,'Spine');
 assert.equal(map.spine_02,'Spine2');
});
