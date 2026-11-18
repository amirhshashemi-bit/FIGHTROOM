import { inspectHumanoidRig, applyCharacterMorphs } from './character-rig.js';
import { buildRetargetNameMap, validateRetargetMap, semanticBone } from './mocap-retarget.js';
// Load externally supplied, properly licensed humanoid GLB motion-capture packs.
const aliases={
 idle:['idle_talking_loop','idle_breathing','idle_lookaround','idle_loop','idle','stance','fight idle','fighting stance','stand','ready'],
 advance:['advance','walk_loop','walk','forward','move'],
 retreat:['walk_loop_backwards','walk_backwards','retreat','backward','back walk','walk_back','walk'],run:['run_fwd_loop','run','jog','sprint'],
 jab:['jab','punch_jab'],cross:['cross','punch_cross'],hook:['hook','uppercut'],low:['low kick','low-kick','push kick','push-kick','pushkick'],high:['roundhouse','high kick','front kick','side kick','kick'],
 guard:['block','guard'],dodge:['dodge','slip','evade','roll'],hit:['hit','stagger','impact'],death:['death','dead','knockout'],takedown:['takedown','double leg','double_leg','sprawl'],clinch:['clinch','tie up'],sprawl:['sprawl'],frame:['frame','frames'],escape:['escape','get out'],sweep:['sweep','reversal'],pass:['pass','guard pass'],mount:['mount'], 'back-take':['back take','back control'], 'defend-submission':['submission defense','defend submission'],
 'ground-pound':['ground pound','ground-and-pound'], 'stand-up':['get up','stand up','get-up','lie to crouch','lietocrouch','crouch to lie'],submission:['submission','ground control','armbar'],
 'spinning-backfist':['spinning backfist','spinning-backfist'], 'superman-punch':['superman punch','superman-punch'],
 'switch-kick':['switch kick','switch-kick'], 'question-mark-kick':['question mark kick','question-mark-kick'],
 'spinning-elbow':['spinning elbow','spinning-elbow'], 'flying-knee':['flying knee','flying-knee'], 'ground-control':['ground control','top control','bottom guard','side control','mount','back control','lie'],
};
function addMaleFightwear(THREE,model,fighter){
 const find=names=>{let hit=null;model.traverse(o=>{if(!hit&&o.isBone&&names.includes(o.name.toLowerCase()))hit=o});return hit};
 const topBone=find(['spine_03','spine_02','spine_01']),hipBone=find(['pelvis']),headBone=find(['head']);
 if(!topBone||!hipBone||!headBone)throw new Error('Male rig is missing outfit anchor bones');
 const cloth=new THREE.MeshStandardMaterial({color:Number(fighter.profile?.shorts)||0x26384b,roughness:.82,metalness:.02,side:THREE.DoubleSide});
 const trim=new THREE.MeshStandardMaterial({color:Number(fighter.profile?.gloves)||0x9e2b43,roughness:.68,metalness:.03,side:THREE.DoubleSide});
 const hair=new THREE.MeshStandardMaterial({color:Number(fighter.profile?.hair)||0x211914,roughness:.94});
 const add=(bone,name,geometry,mat,position=[0,0,0])=>{const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;bone.add(mesh);return mesh};
 add(topBone,'FIGHTROOM_MALE_COMPRESSION_TOP',new THREE.CylinderGeometry(.17,.195,.31,24,1,true),cloth,[0,.02,0]);
 add(topBone,'FIGHTROOM_MALE_TOP_TRIM',new THREE.TorusGeometry(.105,.009,6,24),trim,[0,.17,0]).rotation.x=Math.PI/2;
 add(hipBone,'FIGHTROOM_MALE_FIGHT_SHORTS',new THREE.CylinderGeometry(.19,.205,.22,24,1,true),cloth,[0,-.015,0]);
 add(hipBone,'FIGHTROOM_MALE_SHORTS_WAISTBAND',new THREE.TorusGeometry(.198,.012,6,24),trim,[0,.095,0]).rotation.x=Math.PI/2;
 for(const [boneName,side] of [['hand_l','L'],['hand_r','R']]){const bone=find([boneName]);if(bone)add(bone,'FIGHTROOM_GLOVE_'+side,new THREE.SphereGeometry(.048,12,10),trim,[0,0,.018])}
 // Keep the source model's own feet. Added box shoes do not share a stable
 // local foot orientation across BVH/GLB rigs and can appear as floating blocks.
 const hairGroup=new THREE.Group();hairGroup.name='FIGHTROOM_MALE_HAIR_GROUP';headBone.add(hairGroup);model.updateMatrixWorld(true);const headWorldQ=headBone.getWorldQuaternion(new THREE.Quaternion()),modelWorldQ=model.getWorldQuaternion(new THREE.Quaternion());hairGroup.quaternion.copy(headWorldQ.invert().multiply(modelWorldQ));
 add(hairGroup,'FIGHTROOM_MALE_HAIR_CAP',new THREE.SphereGeometry(.098,16,10,0,Math.PI*2,0,Math.PI*.58),hair,[0,.115,0]);
 const fringe=add(hairGroup,'FIGHTROOM_MALE_HAIR_FRINGE',new THREE.BoxGeometry(.12,.035,.05),hair,[0,.075,.085]);fringe.rotation.x=.12;
 for(const side of [-1,1])add(hairGroup,'FIGHTROOM_MALE_SIDEBURN_'+side,new THREE.CapsuleGeometry(.014,.065,4,8),hair,[side*.078,.015,.005]);
 return {outfit:'compression-top-shorts-gloves-short-hair',pieces:10};
}
function addFemaleFightwear(THREE,model,fighter){
 const find=names=>{let hit=null;model.traverse(o=>{if(!hit&&o.isBone&&names.includes(o.name.toLowerCase()))hit=o});return hit};
 const topBone=find(['spine03','spine_03','spine04','spine_04','spine02','spine_02','spine01','spine_01']),hipBone=find(['pelvis','spine01','spine_01','root']),headBone=find(['head']);
 if(!topBone||!hipBone||!headBone)throw new Error('Female rig is missing outfit anchor bones');
 const cloth=new THREE.MeshStandardMaterial({color:Number(fighter.profile?.shorts)||0x26384b,roughness:.82,metalness:.02,side:THREE.DoubleSide});
 const trim=new THREE.MeshStandardMaterial({color:Number(fighter.profile?.gloves)||0x9e2b43,roughness:.68,metalness:.03,side:THREE.DoubleSide});
 const hair=new THREE.MeshStandardMaterial({color:Number(fighter.profile?.hair)||0x4a2b1d,roughness:.94});
 const add=(bone,name,geometry,mat,position=[0,0,0])=>{const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;bone.add(mesh);return mesh};
 const top=add(topBone,'FIGHTROOM_FEMALE_SPORTS_TOP',new THREE.CylinderGeometry(.165,.185,.27,24,1,true),cloth,[0,.025,0]);
 top.material=cloth;
 add(topBone,'FIGHTROOM_TOP_NECK_TRIM',new THREE.TorusGeometry(.105,.009,6,24),trim,[0,.155,0]).rotation.x=Math.PI/2;
 add(hipBone,'FIGHTROOM_FEMALE_FIGHT_SHORTS',new THREE.CylinderGeometry(.18,.19,.19,24,1,true),cloth,[0,-.005,0]);
 add(hipBone,'FIGHTROOM_SHORTS_WAISTBAND',new THREE.TorusGeometry(.184,.012,6,24),trim,[0,.09,0]).rotation.x=Math.PI/2;
 for(const [boneName,side] of [['wrist.L','L'],['wrist.R','R'],['hand_l','L'],['hand_r','R']]){const bone=find([boneName.toLowerCase()]);if(bone&&!bone.children.some(c=>c.name==='FIGHTROOM_GLOVE_'+side))add(bone,'FIGHTROOM_GLOVE_'+side,new THREE.SphereGeometry(.043,12,10),trim,[0,0,.018])}
 // Do not add synthetic box shoes: the model's own feet remain aligned
 // with its skeleton and avoid detached geometry on differently oriented rigs.
 const hairGroup=new THREE.Group();hairGroup.name='FIGHTROOM_FEMALE_HAIR_GROUP';headBone.add(hairGroup);model.updateMatrixWorld(true);const headWorldQ=headBone.getWorldQuaternion(new THREE.Quaternion()),modelWorldQ=model.getWorldQuaternion(new THREE.Quaternion());hairGroup.quaternion.copy(headWorldQ.invert().multiply(modelWorldQ));
 add(hairGroup,'FIGHTROOM_FEMALE_HAIR_CAP',new THREE.SphereGeometry(.1,16,10,0,Math.PI*2,0,Math.PI*.6),hair,[0,.115,0]);
 const fringe=add(hairGroup,'FIGHTROOM_FEMALE_HAIR_FRINGE',new THREE.BoxGeometry(.12,.035,.05),hair,[0,.075,.085]);fringe.rotation.x=.12;
 const pony=add(hairGroup,'FIGHTROOM_FEMALE_HAIR_PONYTAIL',new THREE.CapsuleGeometry(.025,.19,4,8),hair,[0,-.015,-.12]);pony.rotation.x=-.25;
 return {outfit:'sports-top-shorts-gloves-ponytail',pieces:9};
}
export function applyGrappleRigPose(THREE,fighter,pose){
 const rig=fighter?.grappleRig;if(!rig||!pose)return false;
 for(const [bone,base] of rig.base)bone.quaternion.copy(base);
 const turn=(bone,x=0,y=0,z=0)=>{if(!bone)return;const delta=new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z,'XYZ'));bone.quaternion.copy(rig.base.get(bone)).multiply(delta)};
 turn(rig.bones.get('hips'),pose.rootPitch+(pose.level||0)*.12,pose.turn*.12,pose.roll);
 const spineCount=Math.max(1,rig.spines.length);
 rig.spines.forEach((bone,i)=>turn(bone,-pose.lean*(.22+.28*(i+1)/spineCount),pose.turn*.12,pose.roll*.2));
 turn(rig.bones.get('neck'),pose.lean*.08,0,0);turn(rig.bones.get('head'),-pose.lean*.06,0,0);
 for(const side of ['left','right']){
  const ext=pose[side==='left'?'left':'right']||0,sign=side==='left'?1:-1;
  if(pose.guard){
   turn(rig.bones.get(side+'Shoulder'),0,sign*.18,sign*.08);
   turn(rig.bones.get(side+'UpperArm'),-.42-ext*.12,sign*.52,sign*(.38+ext*.12));
   turn(rig.bones.get(side+'ForeArm'),-1.15-ext*.15,sign*.12,sign*.04);
   turn(rig.bones.get(side+'Hand'),-.18,0,0);
  }else{
   turn(rig.bones.get(side+'Shoulder'),0,0,sign*.12);
   turn(rig.bones.get(side+'UpperArm'),-.28-ext*.82,0,sign*(.18+ext*.22));
   turn(rig.bones.get(side+'ForeArm'),-.18-ext*.72,0,sign*.05);
   turn(rig.bones.get(side+'Hand'),-.08,0,0);
  }
  turn(rig.bones.get(side+'UpLeg'),-(pose.drive||0)*.42+(pose.level||0)*.12,0,sign*(pose.spread||0)*.22);
  turn(rig.bones.get(side+'Leg'),(pose.drive||0)*.48+(pose.level||0)*.16,0,0);
  turn(rig.bones.get(side+'Foot'),-(pose.drive||0)*.18,0,0);
 }
 // Retarget procedural strikes by segment direction in world space. Euler-only
 // rotations are not portable across different GLB skeleton rest orientations.
 const root=fighter.root;
 if(root){
  root.updateMatrixWorld(true);
  const rootQ=root.getWorldQuaternion(new THREE.Quaternion());
  const forward=new THREE.Vector3(0,0,1).applyQuaternion(rootQ).normalize();
  const right=new THREE.Vector3(1,0,0).applyQuaternion(rootQ).normalize();
  const up=new THREE.Vector3(0,1,0);
  for(const side of ['left','right']){
   const amount=Math.max(0,Math.min(1.25,pose[side]||0));
   if(amount>.035){
    const upper=rig.bones.get(side+'UpperArm'),fore=rig.bones.get(side+'ForeArm'),hand=rig.bones.get(side+'Hand');
    const outward=right.clone().multiplyScalar(side==='left'?-1:1);
    const upperDirection=forward.clone().multiplyScalar(.18+amount*.42).add(up.clone().multiplyScalar(-.04)).add(outward.multiplyScalar(.06)).normalize();
    aimBoneSegment(THREE,upper,fore,upperDirection);
    root.updateMatrixWorld(true);
    const foreDirection=forward.clone().multiplyScalar(.22+amount*.58).add(up.clone().multiplyScalar(-.015)).normalize();
    aimBoneSegment(THREE,fore,hand,foreDirection);
    root.updateMatrixWorld(true);
   }
  }
  const kick=Math.max(0,Math.min(1.25,pose.drive||0));
  if(kick>.035){
   const upper=rig.bones.get('rightUpLeg'),lower=rig.bones.get('rightLeg'),foot=rig.bones.get('rightFoot');
   const hipDirection=forward.clone().multiplyScalar(.18+kick*.24).add(up.clone().multiplyScalar(.10+kick*.10)).normalize();
   aimBoneSegment(THREE,upper,lower,hipDirection);
   root.updateMatrixWorld(true);
   const lowerDirection=forward.clone().multiplyScalar(.24+kick*.72).add(up.clone().multiplyScalar(.12+kick*.12)).normalize();
   aimBoneSegment(THREE,lower,foot,lowerDirection);
   root.updateMatrixWorld(true);
  }
 }
 return true;
}
export async function loadFighterGLB(THREE,GLTFLoader,file,fighter){
 const loader=new GLTFLoader(),buffer=await file.arrayBuffer();
 const gltf=await loader.parseAsync(buffer,'');
 if(!gltf.scene)throw new Error('GLB has no scene');
 const model=gltf.scene;model.name='FIGHTROOM_MOCAP_CHARACTER';
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.name.toLowerCase().includes('high-poly'))o.visible=false}});
 const rigReport=inspectHumanoidRig(model);
 if(!rigReport.compatible)throw new Error('Incompatible humanoid rig: '+rigReport.foundCore+'/7 core landmarks detected');
 if(fighter.externalModel)fighter.root.remove(fighter.externalModel);
 model.updateMatrixWorld(true);
 const grappleBones=new Map(),grappleSpines=[];
 let hasDedicatedPelvis=false;model.traverse(node=>{if(node.isBone&&node.name.toLowerCase()==='pelvis')hasDedicatedPelvis=true});
 model.traverse(node=>{if(!node.isBone)return;if(hasDedicatedPelvis&&node.name.toLowerCase()==='root')return;const semantic=semanticBone(node.name);if(semantic==='spine')grappleSpines.push(node);else if(semantic&&!grappleBones.has(semantic))grappleBones.set(semantic,node)});
 const grappleBase=new Map();for(const bone of [...grappleBones.values(),...grappleSpines])grappleBase.set(bone,bone.quaternion.clone());
 fighter.grappleRig={bones:grappleBones,spines:grappleSpines,base:grappleBase};
 model.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton)o.skeleton.update()});
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 if(size.y>0){const scale=1.78/size.y;model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);model.updateMatrixWorld(true)}
 fighter.root.add(model);
 model.updateMatrixWorld(true);
 fighter.externalModel=model;
 fighter.rig.visible=false;
 const appliedMorphs=applyCharacterMorphs(model,fighter.profile);
 const gender=fighter.profile?.gender||(String(fighter.profile?.division||'').startsWith('Women')?'female':'male');
 const outfit=gender==='female'?addFemaleFightwear(THREE,model,fighter):addMaleFightwear(THREE,model,fighter);
 fighter.rigReport=rigReport;fighter.appliedMorphs=appliedMorphs;fighter.outfitReport=outfit;
 fighter.restPose=[];model.traverse(node=>{if(node.isBone)fighter.restPose.push({bone:node,position:node.position.clone(),quaternion:node.quaternion.clone(),scale:node.scale.clone()})});
 fighter.mixer=new THREE.AnimationMixer(model);
 fighter.clips=gltf.animations||[];
 fighter.clipActions=new Map();
 for(const clip of (gltf.animations||[]))fighter.clipActions.set(clip.name,fighter.mixer.clipAction(clip));
 fighter.currentClip=null;
 fighter.mixer.addEventListener('finished',()=>{if(fighter.action===null)playFighterClip(THREE,fighter,'idle')});
 playFighterClip(THREE,fighter,'idle');
 return {clips:(gltf.animations||[]).map(c=>c.name),height:size.y,rig:rigReport,appliedMorphs,outfit};
}
export function hasFighterClip(fighter,action){
 if(!fighter?.clips?.length)return false;
 const keys=aliases[action]||[action];
 return Boolean(fighter.clips.find(c=>keys.some(k=>c.name.toLowerCase().includes(k))));
}
export function restoreFighterRestPose(fighter){
 if(!fighter?.restPose?.length)return false;
 fighter.mixer?.stopAllAction?.();
 for(const item of fighter.restPose){item.bone.position.copy(item.position);item.bone.quaternion.copy(item.quaternion);item.bone.scale.copy(item.scale)}
 fighter.externalModel?.updateMatrixWorld?.(true);
 fighter.currentAction=null;fighter.currentClip='rest';
 return true;
}

export function playFighterClip(THREE,fighter,action){
 if(!fighter?.mixer||!fighter?.clips?.length)return false;
 if(action==='idle'||action==='stance')return fighter.currentClip==='rest'||restoreFighterRestPose(fighter);
 const keys=aliases[action]||[action],clip=fighter.clips.find(c=>keys.some(k=>c.name.toLowerCase().includes(k)));
 if(!clip){
  // Do not leave the previous jab/walk clip running under a procedural move.
  fighter.mixer.stopAllAction();
  fighter.currentAction=null;
  fighter.currentClip=null;
  restoreFighterRestPose(fighter);
  fighter.missingClipAction=action;
  return false;
 }
 fighter.missingClipAction=null;
 if(fighter.currentClip===clip.name)return true;
 fighter.clipActions=fighter.clipActions||new Map();
 const next=fighter.clipActions.get(clip.name)||fighter.mixer.clipAction(clip);
 if(!fighter.clipActions.has(clip.name))fighter.clipActions.set(clip.name,next);
 const previous=fighter.currentAction;
 next.reset();next.enabled=true;next.setEffectiveWeight(1);next.timeScale=1;
 if(action==='advance'||action==='retreat'||action==='guard')next.setLoop(THREE.LoopRepeat,Infinity);
 else{next.setLoop(THREE.LoopOnce,1);next.clampWhenFinished=true}
 if(previous)next.crossFadeFrom(previous,.12,true);next.play();
 fighter.currentAction=next;fighter.currentClip=clip.name;return true;
}
function aimBoneSegment(THREE,bone,child,targetDirection){
 if(!bone||!child||!bone.parent||targetDirection.lengthSq()<1e-8)return false;
 const start=bone.getWorldPosition(new THREE.Vector3());
 const current=child.getWorldPosition(new THREE.Vector3()).sub(start);
 if(current.lengthSq()<1e-8)return false;
 const delta=new THREE.Quaternion().setFromUnitVectors(current.normalize(),targetDirection.clone().normalize());
 const nextWorld=delta.multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
 const parentInverse=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
 bone.quaternion.copy(parentInverse.multiply(nextWorld));
 bone.updateMatrixWorld(true);
 return true;
}
export function getFighterGuardProfile(profile={},mode='high'){
 const style=String(profile.style||'').toLowerCase();
 const stance=String(profile.stance||'orthodox').toLowerCase();
 const grapplingStyle=style.includes('wrest')||style.includes('sambo')||style.includes('grappl')||style.includes('judo')||style.includes('jiu')||style.includes('bjj');
 const kind=style.includes('muay')||style.includes('thai')?'muay-thai':style.includes('karate')||style.includes('distance')?'long-range':style.includes('kickbox')?'kickboxing':grapplingStyle?'wrestling':'boxing';
 return {kind,lead:stance.includes('southpaw')?'right':'left',mode:['high','body','long'].includes(mode)?mode:'high'};
}
function applyFighterGuardPose(THREE,fighter,guarding=false){
 const rig=fighter?.grappleRig,root=fighter?.root;if(!rig||!root)return false;
 const guardProfile=getFighterGuardProfile(fighter.profile,fighter.guardMode);
 const {kind,lead,mode}=guardProfile;
 const muay=kind==='muay-thai',karate=kind==='long-range',kickbox=kind==='kickboxing',wrestler=kind==='wrestling';
 const reach=guarding?1:.78;
 applyGrappleRigPose(THREE,fighter,{rootPitch:mode==='body'?.055:.025,roll:0,turn:karate?-.09:0,lean:guarding?(karate?.08:.16):.1,left:reach,right:reach,drive:0,spread:karate?.3:wrestler?.16:.22,level:mode==='body'?.08:0,guard:true});
 root.updateMatrixWorld(true);
 const rootRotation=root.getWorldQuaternion(new THREE.Quaternion());
 const front=new THREE.Vector3(0,0,1).applyQuaternion(rootRotation).normalize();
 const up=new THREE.Vector3(0,1,0);
 for(const side of ['left','right']){
  const upper=rig.bones.get(side+'UpperArm'),fore=rig.bones.get(side+'ForeArm'),hand=rig.bones.get(side+'Hand');
  if(!upper||!fore||!hand)continue;
  const shoulder=upper.getWorldPosition(new THREE.Vector3());
  const localShoulder=root.worldToLocal(shoulder.clone());
  const outward=new THREE.Vector3(Math.sign(localShoulder.x)||(side==='left'?-1:1),0,0).applyQuaternion(rootRotation).normalize();
  const isLead=side===lead;
  let upperForward=muay?.08:karate?(isLead?.34:.02):kickbox?.2:wrestler?.04:.14;
  let handHeight=mode==='body'?.03:mode==='long'?.17:muay?.22:karate?.12:kickbox?.16:.19;
  let foreForward=mode==='long'&&isLead?.58:karate&&isLead?.3:kickbox&&isLead?.22:muay?.04:.13;
  if(mode==='body'){upperForward*=.55;foreForward*=.45;handHeight-=.12;}
  const upperDirection=front.clone().multiplyScalar(upperForward).add(up.clone().multiplyScalar(-.06)).add(outward.clone().multiplyScalar(karate&&isLead?.05:.13));
  aimBoneSegment(THREE,upper,fore,upperDirection);
  root.updateMatrixWorld(true);
  const inward=outward.clone().negate();
  const foreDirection=front.clone().multiplyScalar(foreForward).add(up.clone().multiplyScalar(handHeight)).add(inward.multiplyScalar(muay?.08:karate&&isLead?.02:.12));
  aimBoneSegment(THREE,fore,hand,foreDirection);
 }
 root.updateMatrixWorld(true);
 fighter.guardPoseApplied=true;
 return true;
}

export function updateFighterMocap(THREE,fighter,dt,moveSpeed=0){
 if(!fighter?.mixer||fighter.pairedMotion)return;
 fighter.guardPoseApplied=false;
 if(!fighter.action){
  if(fighter.submitting){fighter.guardPoseActive=false;playFighterClip(THREE,fighter,'submission');}
  else if(fighter.motionOverrideTime>0){fighter.guardPoseActive=false;fighter.motionOverrideTime=Math.max(0,fighter.motionOverrideTime-dt);playFighterClip(THREE,fighter,fighter.motionOverride||'stand-up');if(fighter.motionOverrideTime===0)fighter.motionOverride=null;}
  else if(fighter.groundState&&fighter.groundState!=='standing'&&fighter.groundState!=='clinch'){fighter.guardPoseActive=false;playFighterClip(THREE,fighter,'ground-control');}
  else if(fighter.guard){
   if(!fighter.guardPoseActive){restoreFighterRestPose(fighter);fighter.guardPoseActive=true;}
  }
  else if(fighter.dodge>0){fighter.guardPoseActive=false;playFighterClip(THREE,fighter,'dodge');}
  else if(moveSpeed>.2){fighter.guardPoseActive=false;playFighterClip(THREE,fighter,'advance');}
  else{fighter.guardPoseActive=false;playFighterClip(THREE,fighter,'idle');}
 }
 fighter.mixer.update(dt);
 if(!fighter.action&&fighter.guard&&(!fighter.groundState||fighter.groundState==='standing'||fighter.groundState==='clinch'))applyFighterGuardPose(THREE,fighter,true);
 else if(!fighter.action&&!fighter.guard&&fighter.dodge<=0&&!(fighter.motionOverrideTime>0)&&!fighter.submitting&&moveSpeed<=.2&&(!fighter.groundState||fighter.groundState==='standing'))applyFighterGuardPose(THREE,fighter,false);
}

export async function loadFighterBVH(THREE,file,fighter){
 if(!fighter?.externalModel)throw new Error('Import a compatible animated GLB character before adding BVH motion');
 const [{BVHLoader},SkeletonUtils]=await Promise.all([import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/BVHLoader.js'),import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/SkeletonUtils.js')]);
 const loader=new BVHLoader(),parsed=loader.parse(await file.text());
 const sourceSkeleton=parsed.skeleton?.bones?parsed.skeleton:parsed.skeleton?.skeleton,targetMesh=[];
 fighter.externalModel.traverse(node=>{if(node.isSkinnedMesh&&node.skeleton)targetMesh.push(node)});
 if(!sourceSkeleton?.bones?.length||!parsed.clip)throw new Error('BVH file contains no usable skeleton or animation: '+file.name);
 if(!targetMesh.length)throw new Error('Target GLB has no skinned mesh');
 const target=targetMesh.sort((a,b)=>b.skeleton.bones.length-a.skeleton.bones.length)[0];
 const rig=inspectHumanoidRig(fighter.externalModel);
 if(!rig.compatible)throw new Error('Target GLB humanoid rig is incomplete');
 const names=buildRetargetNameMap(target.skeleton.bones.map(b=>b.name),sourceSkeleton.bones.map(b=>b.name));
 const mapping=validateRetargetMap(names);
 if(!mapping.compatible)throw new Error('BVH skeleton mapping incomplete: '+mapping.mappedCount+' bones mapped');
 const sourceHip=sourceSkeleton.bones.find(b=>semanticBone(b.name)==='hips')?.name||sourceSkeleton.bones[0].name;
 const clip=SkeletonUtils.retargetClip(target,sourceSkeleton,parsed.clip,{names,hip:sourceHip,fps:30,preserveHipPosition:true,useFirstFramePosition:false,preserveMatrix:true,preservePosition:true});
 clip.name=file.name.replace(/\.bvh$/i,'').replace(/[^a-z0-9_-]/gi,'-').toLowerCase();
 if(!clip.tracks?.length)throw new Error('Retarget produced an empty animation clip');
 if(!fighter.mixer)fighter.mixer=new THREE.AnimationMixer(fighter.externalModel);
 fighter.clips=[...(fighter.clips||[]),clip];
 fighter.clipActions=fighter.clipActions||new Map();
 fighter.clipActions.set(clip.name,fighter.mixer.clipAction(clip));
 fighter.currentClip=null;
 const clipName=clip.name.toLowerCase();
 const action=Object.keys(aliases).find(key=>(aliases[key]||[key]).some(alias=>clipName.includes(alias)));
 if(action)playFighterClip(THREE,fighter,action);
 return {clip:clip.name,tracks:clip.tracks.length,mappedBones:mapping.mappedCount,rig};
}
