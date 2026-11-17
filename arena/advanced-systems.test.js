import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyContact,HURTBOXES} from './hitboxes.js';
import {transitionGround,submissionProgress} from './ground-combat.js';
import {createBout,tickBout,nextRound,scoreRound,stoppage} from './referee.js';
import {buildVenue} from './venue-builder.js';
import {validateMocapManifest,REQUIRED_ACTIONS} from './mocap.js';
import {qualityProfile,assessFrameTimes} from './performance.js';
test('hitbox contact classifies head/body/leg and rejects misses',()=>{
 assert.equal(classifyContact({defender:[0,0,0],attackPoint:[0,1.7,.1]}).zone,'head');
 assert.equal(classifyContact({defender:[0,0,0],attackPoint:[0,1.2,.1]}).zone,'body');
 assert.equal(classifyContact({defender:[0,0,0],attackPoint:[0,.47,.1]}).zone,'leg');
 assert.equal(classifyContact({defender:[0,0,0],attackPoint:[3,3,3]}).hit,false);
 assert.equal(classifyContact({defender:[0,0,0],attackPoint:[0,1.7,0],evading:true}).reason,'evaded');
 assert.equal(Object.keys(HURTBOXES).length,4);
});
test('ground grappling accepts legal edges and rejects impossible transitions',()=>{
 assert.equal(transitionGround('standing','clinch').ok,true);
 assert.equal(transitionGround('standing','mount').ok,false);
 assert.equal(transitionGround('top-control','submission',{stamina:5}).reason,'exhausted');
 assert.ok(submissionProgress({control:80,defenderEscape:2})>0);
});
test('bout clock, round transition and stoppages',()=>{
 let b=createBout({rounds:2,roundSeconds:10,restSeconds:5});b=tickBout(b,11);
 assert.equal(b.phase,'between-rounds');b=nextRound(b);assert.equal(b.round,2);
 assert.equal(tickBout(b,11).phase,'decision');assert.equal(stoppage({health:0}),'ko-tko');
 assert.equal(scoreRound({cleanStrikes:20}),10);
});
test('venue generator builds deterministic Three-like scene group',()=>{
 class Group{constructor(){this.children=[];this.userData={}}add(...x){this.children.push(...x)}}
 class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.position={y:0};this.rotation={x:0,y:0}}}
 const T={Group,Mesh,MeshStandardMaterial:class{constructor(o){this.options=o}},CylinderGeometry:class{},TorusGeometry:class{},SpotLight:class{constructor(){this.position={set(){}};this.target={position:{set(){}}}}}};
 const scene=new Group(),g=buildVenue(T,scene,{id:'tokyo',canvas:'graphite',lighting:'ice-blue'});
 assert.equal(scene.children[0],g);assert.equal(g.userData.venueId,'tokyo');assert.ok(g.children.length>10);
});
test('mocap import requires provenance, skeleton, clip integrity and action coverage catalog',()=>{
 assert.ok(validateMocapManifest({}).length>=3);
 assert.ok(REQUIRED_ACTIONS.includes('sprawl'));
 assert.deepEqual(validateMocapManifest({source:'x',license:'y',skeleton:'humanoid',bones:['hips'],clips:[{id:'jab',action:'jab',path:'jab.glb',sha256:'abc'}]}),[]);
});
test('mobile quality profile and frame-time assessment',()=>{
 assert.equal(qualityProfile({deviceMemory:4,hardwareConcurrency:4}).tier,'low');
 assert.equal(assessFrameTimes([16,17,16,18,17,16,17,16,18,17]).valid,true);
 assert.equal(assessFrameTimes([16,17]).valid,false);
});

test('combat contact probes resolve head, torso and lower-leg volumes independently',()=>{
 const base={attacker:[-1,1.2,0],defender:[0,0,0],front:true,evading:false};
 assert.equal(classifyContact({...base,attackPoint:[-.18,1.7,0],attackRadius:.18}).zone,'head');
 assert.equal(classifyContact({...base,attackPoint:[-.18,1.2,0],attackRadius:.18}).zone,'body');
 assert.equal(classifyContact({...base,attackPoint:[-.18,.35,0],attackRadius:.20}).zone,'leg');
});
