import test from 'node:test';
import assert from 'node:assert/strict';
import { hasFighterClip, applyGrappleRigPose, restoreFighterRestPose, getFighterGuardProfile } from './mocap-runtime.js';
class FakeQuaternion {
 constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
 clone(){return new FakeQuaternion(this.x,this.y,this.z)}
 copy(q){this.x=q.x;this.y=q.y;this.z=q.z;return this}
 multiply(q){this.x+=q.x;this.y+=q.y;this.z+=q.z;return this}
 setFromEuler(e){this.x=e.x;this.y=e.y;this.z=e.z;return this}
 angleTo(q){return Math.hypot(this.x-q.x,this.y-q.y,this.z-q.z)}
}
const THREE={Quaternion:FakeQuaternion,Euler:class{constructor(x,y,z){this.x=x;this.y=y;this.z=z}}};

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

test('paired grappling pose drives imported humanoid bones without quaternion drift',()=>{
 const bones=new Map(),spine={quaternion:new THREE.Quaternion()};
 for(const name of ['hips','leftUpperArm','leftForeArm','rightUpperArm','rightForeArm','leftUpLeg','rightUpLeg'])bones.set(name,{quaternion:new THREE.Quaternion()});
 const base=new Map([...bones.values(),spine].map(b=>[b,b.quaternion.clone()]));
 const fighter={grappleRig:{bones,spines:[spine],base}};
 const pose={rootPitch:.3,roll:.1,turn:.4,lean:.5,left:.9,right:.8,drive:.6,spread:.4,level:.2};
 assert.equal(applyGrappleRigPose(THREE,fighter,pose),true);
 const first=bones.get('leftUpperArm').quaternion.clone();
 assert.ok(first.angleTo(base.get(bones.get('leftUpperArm')))>0.1);
 applyGrappleRigPose(THREE,fighter,pose);
 assert.ok(bones.get('leftUpperArm').quaternion.angleTo(first)<1e-6);
 for(let i=0;i<5;i++)applyGrappleRigPose(THREE,fighter,pose);
 assert.ok(bones.get('leftUpperArm').quaternion.angleTo(first)<1e-6);
});

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

test('restores the imported fighter bind pose after an animation instead of leaving a stale floor pose',()=>{
 const vector=(x,y,z)=>({x,y,z,copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}});
 const quaternion=(x,y,z,w)=>({x,y,z,w,copy(q){this.x=q.x;this.y=q.y;this.z=q.z;this.w=q.w;return this}});
 const bone={position:vector(9,9,9),quaternion:quaternion(9,9,9,9),scale:vector(9,9,9)};
 const rest={position:vector(1,2,3),quaternion:quaternion(.1,.2,.3,.9),scale:vector(1,1,1)};
 let stopped=false,updated=false;
 const fighter={restPose:[{bone,...rest}],mixer:{stopAllAction(){stopped=true}},externalModel:{updateMatrixWorld(value){updated=value}},currentAction:{},currentClip:'male2_jab'};
 assert.equal(restoreFighterRestPose(fighter),true);
 assert.equal(stopped,true);assert.equal(updated,true);
 assert.deepEqual([bone.position.x,bone.position.y,bone.position.z],[1,2,3]);
 assert.deepEqual([bone.quaternion.x,bone.quaternion.y,bone.quaternion.z,bone.quaternion.w],[.1,.2,.3,.9]);
 assert.deepEqual([bone.scale.x,bone.scale.y,bone.scale.z],[1,1,1]);
 assert.equal(fighter.currentAction,null);assert.equal(fighter.currentClip,'rest');
});

test('fighter guard profiles differ by striking style and stance',()=>{
 const boxer=getFighterGuardProfile({style:'Boxing counterpuncher',stance:'Orthodox'});
 const kickbox=getFighterGuardProfile({style:'Technical kickboxing',stance:'Southpaw'});
 const muay=getFighterGuardProfile({style:'Muay Thai pressure',stance:'Southpaw'});
 const wrestler=getFighterGuardProfile({style:'Sambo pressure',stance:'Southpaw'});
 assert.deepEqual(boxer,{kind:'boxing',lead:'left',mode:'high'});
 assert.deepEqual(kickbox,{kind:'kickboxing',lead:'right',mode:'high'});
 assert.deepEqual(muay,{kind:'muay-thai',lead:'right',mode:'high'});
 assert.equal(wrestler.kind,'wrestling');
 assert.notEqual(boxer.kind,kickbox.kind);
 assert.notEqual(kickbox.kind,muay.kind);
});
test('guard profile changes posture for high, body and distance states',()=>{
 const profile={style:'Technical kickboxing',stance:'Southpaw'};
 assert.equal(getFighterGuardProfile(profile,'high').mode,'high');
 assert.equal(getFighterGuardProfile(profile,'body').mode,'body');
 assert.equal(getFighterGuardProfile(profile,'long').mode,'long');
 assert.equal(getFighterGuardProfile(profile,'unknown').mode,'high');
});

test('BJJ and Jiu-Jitsu profiles receive grappling-specific guards',()=>{
 for(const style of ['BJJ and counter striking','Brazilian Jiu-Jitsu','Jiu Jitsu','Grappling all-rounder']){
  assert.equal(getFighterGuardProfile({style,stance:'Southpaw'}).kind,'wrestling',style);
  assert.equal(getFighterGuardProfile({style,stance:'Southpaw'}).lead,'right',style);
 }
});
test('every roster profile resolves to a supported guard and lead stance',async()=>{
 const {ROSTER}=await import('./roster.js');
 for(const fighter of ROSTER){
  const guard=getFighterGuardProfile(fighter);
  assert.ok(['boxing','kickboxing','muay-thai','long-range','wrestling'].includes(guard.kind),fighter.id);
  assert.ok(['left','right'].includes(guard.lead),fighter.id);
 }
});
