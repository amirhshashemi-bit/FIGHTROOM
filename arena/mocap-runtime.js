import { inspectHumanoidRig, applyCharacterMorphs } from './character-rig.js';
import { buildRetargetNameMap, validateRetargetMap, semanticBone } from './mocap-retarget.js';
// Load externally supplied, properly licensed humanoid GLB motion-capture packs.
const aliases={
 idle:['idle','stance','fight idle','fighting stance','stand','ready'],
 advance:['advance','walk','forward','move'],
 retreat:['retreat','backward','back walk','walk_back'],
 jab:['jab'],cross:['cross'],hook:['hook','uppercut'],low:['low kick','low-kick','push kick','push-kick'],high:['roundhouse','high kick','front kick','side kick','kick'],
 guard:['block','guard'],dodge:['dodge','slip','evade'],takedown:['takedown','double leg','double_leg','sprawl'],clinch:['clinch','tie up'],sprawl:['sprawl'],frame:['frame','frames'],escape:['escape','get out'],sweep:['sweep','reversal'],pass:['pass','guard pass'],mount:['mount'], 'back-take':['back take','back control'], 'defend-submission':['submission defense','defend submission'],
 'ground-pound':['ground pound','ground-and-pound'], 'stand-up':['get up','stand up','get-up','lie to crouch','lietocrouch','crouch to lie'],submission:['submission','ground control','armbar'],
 'spinning-backfist':['spinning backfist','spinning-backfist'], 'superman-punch':['superman punch','superman-punch'],
 'switch-kick':['switch kick','switch-kick'], 'question-mark-kick':['question mark kick','question-mark-kick'],
 'spinning-elbow':['spinning elbow','spinning-elbow'], 'flying-knee':['flying knee','flying-knee'], 'ground-control':['ground control','top control','bottom guard','side control','mount','back control','lie'],
};
export async function loadFighterGLB(THREE,GLTFLoader,file,fighter){
 const loader=new GLTFLoader(),buffer=await file.arrayBuffer();
 const gltf=await loader.parseAsync(buffer,'');
 if(!gltf.scene)throw new Error('GLB has no scene');
 if(!gltf.animations?.length)throw new Error('GLB has no animation clips');
 const model=gltf.scene;model.name='FIGHTROOM_MOCAP_CHARACTER';
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 const rigReport=inspectHumanoidRig(model);
 if(!rigReport.compatible)throw new Error('Incompatible humanoid rig: '+rigReport.foundCore+'/7 core landmarks detected');
 if(fighter.externalModel)fighter.root.remove(fighter.externalModel);
 fighter.root.add(model);
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 if(size.y>0){const scale=1.78/size.y;model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale)}
 fighter.externalModel=model;
 fighter.rig.visible=false;
 const appliedMorphs=applyCharacterMorphs(model,fighter.profile);
 fighter.rigReport=rigReport;fighter.appliedMorphs=appliedMorphs;
 fighter.mixer=new THREE.AnimationMixer(model);
 fighter.clips=gltf.animations;
 fighter.clipActions=new Map();
 for(const clip of gltf.animations)fighter.clipActions.set(clip.name,fighter.mixer.clipAction(clip));
 fighter.currentClip=null;
 fighter.mixer.addEventListener('finished',()=>{if(fighter.action===null)playFighterClip(THREE,fighter,'idle')});
 playFighterClip(THREE,fighter,'idle');
 return {clips:gltf.animations.map(c=>c.name),height:size.y,rig:rigReport,appliedMorphs};
}
export function hasFighterClip(fighter,action){
 if(!fighter?.clips?.length)return false;
 const keys=aliases[action]||[action];
 return Boolean(fighter.clips.find(c=>keys.some(k=>c.name.toLowerCase().includes(k))));
}
export function playFighterClip(THREE,fighter,action){
 if(!fighter?.mixer||!fighter?.clips?.length)return false;
 const keys=aliases[action]||[action],clip=fighter.clips.find(c=>keys.some(k=>c.name.toLowerCase().includes(k)));
 if(!clip){fighter.missingClipAction=action;return false;}
 fighter.missingClipAction=null;
 if(fighter.currentClip===clip.name)return true;
 const next=fighter.clipActions.get(clip.name);if(!next)return false;
 const previous=fighter.currentAction;
 next.reset();next.enabled=true;next.setEffectiveWeight(1);
 if(action==='idle'||action==='advance'||action==='retreat'||action==='guard')next.setLoop(THREE.LoopRepeat,Infinity);
 else{next.setLoop(THREE.LoopOnce,1);next.clampWhenFinished=true}
 if(previous)next.crossFadeFrom(previous,.12,true);next.play();
 fighter.currentAction=next;fighter.currentClip=clip.name;return true;
}
export function updateFighterMocap(THREE,fighter,dt,moveSpeed=0){
 if(!fighter?.mixer)return;
 if(!fighter.action){\n  if(fighter.groundState&&fighter.groundState!=='standing'&&fighter.groundState!=='clinch')playFighterClip(THREE,fighter,'ground-control');\n  else playFighterClip(THREE,fighter,fighter.guard?'guard':fighter.dodge>0?'dodge':moveSpeed>.2?'advance':'idle');\n }
 fighter.mixer.update(dt);
}

export async function loadFighterBVH(THREE,file,fighter){
 if(!fighter?.externalModel)throw new Error('Import a compatible animated GLB character before adding BVH motion');
 const [{BVHLoader},SkeletonUtils]=await Promise.all([import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/BVHLoader.js'),import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/SkeletonUtils.js')]);
 const loader=new BVHLoader(),parsed=loader.parse(await file.text());
 const sourceSkeleton=parsed.skeleton?.skeleton,targetMesh=[];
 fighter.externalModel.traverse(node=>{if(node.isSkinnedMesh&&node.skeleton)targetMesh.push(node)});
 if(!sourceSkeleton?.bones?.length||!parsed.clip)throw new Error('BVH file contains no usable skeleton or animation');
 if(!targetMesh.length)throw new Error('Target GLB has no skinned mesh');
 const target=targetMesh.sort((a,b)=>b.skeleton.bones.length-a.skeleton.bones.length)[0];
 const rig=inspectHumanoidRig(fighter.externalModel);
 if(!rig.compatible)throw new Error('Target GLB humanoid rig is incomplete');
 const names=buildRetargetNameMap(target.skeleton.bones.map(b=>b.name),sourceSkeleton.bones.map(b=>b.name));
 const mapping=validateRetargetMap(names);
 if(!mapping.compatible)throw new Error('BVH skeleton mapping incomplete: '+mapping.mappedCount+' bones mapped');
 const sourceHip=sourceSkeleton.bones.find(b=>semanticBone(b.name)==='hips')?.name||sourceSkeleton.bones[0].name;
 const clip=SkeletonUtils.retargetClip(target,sourceSkeleton,parsed.clip,{names,hip:sourceHip,fps:30,useFirstFramePosition:false,preserveBoneMatrix:true,preserveBonePositions:true});
 clip.name=file.name.replace(/\\.bvh$/i,'').replace(/[^a-z0-9_-]/gi,'-').toLowerCase();
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
