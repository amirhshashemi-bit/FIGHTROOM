import { buildRetargetNameMap, validateRetargetMap } from './mocap-retarget.js';

const findRootBone = root => {
 let found=null;
 root?.traverse?.(node=>{if(!found&&node.isBone&&['hip','hips','root'].includes(String(node.name).toLowerCase()))found=node});
 return found;
};
const findTargetMesh = model => {
 const meshes=[];model?.traverse?.(node=>{if(node.isSkinnedMesh&&node.skeleton)meshes.push(node)});
 return meshes.sort((a,b)=>b.skeleton.bones.length-a.skeleton.bones.length)[0]||null;
};
const trackForRoot = clip => clip?.tracks?.find(track=>/^hip\.position$/i.test(track.name)||/^hips?\.position$/i.test(track.name));
export function validatePairedFbxScenes(actorA,actorB,tolerance=.08){
 const errors=[],clipA=actorA?.animations?.[0],clipB=actorB?.animations?.[0];
 const rootA=findRootBone(actorA),rootB=findRootBone(actorB);
 if(!clipA||!clipB)errors.push('paired-animation-clip-missing');
 if(!rootA||!rootB)errors.push('paired-root-bone-missing');
 const trackA=trackForRoot(clipA),trackB=trackForRoot(clipB);
 if(!trackA||!trackB||trackA.times.length<2||trackB.times.length<2)errors.push('paired-root-translation-missing');
 const durationA=Number(clipA?.duration),durationB=Number(clipB?.duration);
 if(!Number.isFinite(durationA)||!Number.isFinite(durationB)||durationA<=0||durationB<=0)errors.push('invalid-pair-duration');
 else if(Math.abs(durationA-durationB)>tolerance)errors.push('pair-duration-mismatch');
 if((clipA?.tracks?.length||0)<7||(clipB?.tracks?.length||0)<7)errors.push('paired-animation-incomplete');
 return {ok:errors.length===0,errors,duration:errors.length?null:Math.min(durationA,durationB),
  actors:[{bones:countBones(actorA),tracks:clipA?.tracks?.length||0,rootKeys:trackA?.times?.length||0},
          {bones:countBones(actorB),tracks:clipB?.tracks?.length||0,rootKeys:trackB?.times?.length||0}]};
}
function countBones(root){let count=0;root?.traverse?.(node=>{if(node.isBone)count++});return count}
export function createPairClock(duration){return {time:0,duration:Math.max(0,Number(duration)||0),done:false}}
export function advancePairClock(clock,dt){
 if(!clock||clock.done)return {time:clock?.time||0,done:true};
 clock.time=Math.min(clock.duration,clock.time+Math.max(0,Number(dt)||0));
 clock.done=clock.time>=clock.duration;
 return {time:clock.time,done:clock.done};
}
export async function loadPairedFbxMotion(THREE,fighterA,fighterB,fileA,fileB,label='paired-interaction'){
 if(!fighterA?.externalModel||!fighterB?.externalModel)throw new Error('Both fighters need compatible loaded GLB models first');
 const [{FBXLoader},SkeletonUtils]=await Promise.all([
  import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FBXLoader.js'),
  import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/SkeletonUtils.js')
 ]);
 const loader=new FBXLoader();
 const [bufferA,bufferB]=await Promise.all([fileA.arrayBuffer(),fileB.arrayBuffer()]);
 const sourceA=loader.parse(bufferA,''),sourceB=loader.parse(bufferB,'');
 const report=validatePairedFbxScenes(sourceA,sourceB);
 if(!report.ok)throw new Error('Invalid synchronized pair: '+report.errors.join(', '));
 const sources=[sourceA,sourceB],fighters=[fighterA,fighterB],clips=[];
 for(let i=0;i<2;i++){
  const fighter=fighters[i],source=sources[i],target=findTargetMesh(fighter.externalModel),sourceRoot=findRootBone(source);
  if(!target)throw new Error('Actor '+(i+1)+' target model has no skinned mesh');
  const targetNames=target.skeleton.bones.map(b=>b.name),sourceNames=[],sourceBones=[];
  source.updateMatrixWorld(true);
  source.traverse(node=>{if(node.isBone){sourceNames.push(node.name);sourceBones.push(node)}});
  const names=buildRetargetNameMap(targetNames,sourceNames),mapping=validateRetargetMap(names);
  if(!mapping.compatible)throw new Error('Actor '+(i+1)+' rig map incomplete: '+mapping.mappedCore+'/6 core landmarks');
  source.skeleton=new THREE.Skeleton(sourceBones);
  const sourceHip=sourceRoot.name;
  const clip=SkeletonUtils.retargetClip(target,source,source.animations[0],{
   names,hip:sourceHip,fps:30,preserveHipPosition:false,useFirstFramePosition:false,preserveMatrix:true,preservePosition:false
  });
  if(!clip?.tracks?.length)throw new Error('Actor '+(i+1)+' retarget produced no tracks');
  clip.name='cmu-'+String(label).replace(/[^a-z0-9-]/gi,'-')+'-actor-'+(i+1);
  if(!fighter.mixer)fighter.mixer=new THREE.AnimationMixer(fighter.externalModel);
  fighter.mixer.stopAllAction();
  fighter.clips=[...(fighter.clips||[]),clip];
  fighter.clipActions=fighter.clipActions||new Map();
  const action=fighter.mixer.clipAction(clip);
  action.reset();action.enabled=true;action.setEffectiveWeight(1);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();
  fighter.currentAction=action;fighter.currentClip=clip.name;
  clips.push({fighter,mixer:fighter.mixer,action,mappedBones:mapping.mappedCount});
 }
 const runtimeDuration=Math.min(report.duration,...clips.map(actor=>actor.action.getClip().duration));
 const pair={clock:createPairClock(runtimeDuration),actors:clips,report:{...report,runtimeDuration},active:true};
 for(const actor of clips)actor.fighter.pairedMotion=pair;
 return pair;
}
export function updatePairedFbxMotion(pair,dt){
 if(!pair?.active)return {done:true,time:pair?.clock?.time||0};
 const tick=advancePairClock(pair.clock,dt);
 for(const actor of pair.actors)actor.mixer.setTime(tick.time);
 if(tick.done){
  pair.active=false;
  for(const actor of pair.actors){actor.fighter.pairedMotion=null;actor.mixer.stopAllAction()}
 }
 return tick;
}
