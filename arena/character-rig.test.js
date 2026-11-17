import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectHumanoidRig,applyCharacterMorphs} from './character-rig.js';

function mockRoot(nodes) { return { traverse(fn) { nodes.forEach(fn); } }; }

test('humanoid rig inspection recognizes common Mixamo and Blender bone aliases',()=>{
 const root=mockRoot([{name:'mixamorig:Hips'},{name:'mixamorig:Spine'},{name:'mixamorig:Head'},{name:'mixamorig:LeftArm'},{name:'mixamorig:RightArm'},{name:'mixamorig:LeftUpLeg'},{name:'mixamorig:RightUpLeg'}]);
 const report=inspectHumanoidRig(root);
 assert.equal(report.compatible,true);
 assert.equal(report.foundCore,7);
 assert.equal(report.bones.hips,true);
});

test('rig inspection reports incomplete rigs without falsely accepting them',()=>{
 const report=inspectHumanoidRig(mockRoot([{name:'Head'},{name:'Spine'}]));
 assert.equal(report.compatible,false);
 assert.equal(report.foundCore,2);
});

test('profile proportions apply only to matching morph targets and clamp values',()=>{
 const mesh={morphTargetDictionary:{shoulder_width:0,chest_size:1,arm_size:2},morphTargetInfluences:[0,0,0]};
 const applied=applyCharacterMorphs(mockRoot([mesh]),{body:{shoulders:1.2,chest:.7,arms:1.8,legs:1.1}});
 assert.deepEqual(applied.sort(),['arms','chest','shoulders']);
 assert.ok(Math.abs(mesh.morphTargetInfluences[0]-.2)<1e-9);
 assert.deepEqual(mesh.morphTargetInfluences.slice(1),[-.3,.3]);
});
