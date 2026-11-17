import { inspectHumanoidRig, applyCharacterMorphs } from './character-rig.js';
// Load externally supplied, properly licensed humanoid GLB motion-capture packs.
const aliases={
 idle:['idle','stance','fight idle','fighting stance'],
 advance:['advance','walk','forward','move'],
 retreat:['retreat','backward','back walk'],
 jab:['jab'],cross:['cross'],hook:['hook','uppercut'],low:['low kick','low-kick'],high:['roundhouse','high kick','kick'],
 guard:['block','guard'],dodge:['dodge','slip','evade'],takedown:['takedown','double leg','sprawl'],
 'ground-pound':['ground pound','ground-and-pound'], 'stand-up':['get up','stand up','get-up'],submission:['submission','ground control']
};
export async function loadFighterGLB(THREE,GLTFLoader,file,fighter){
 const loader=new GLTFLoader(),buffer=await file.arrayBuffer();
 const gltf=await loader.parseAsync(buffer,'');
 if(!gltf.scene)throw new Error('GLB has no scene');
 if(!gltf.animations?.length)throw new Error('GLB has no animation clips');
 if(fighter.externalModel)fighter.root.remove(fighter.externalModel);
 fighter.rig.visible=false;
 const model=gltf.scene;model.name='FIGHTROOM_MOCAP_CHARACTER';
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 fighter.root.add(model);
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 if(size.y>0){const scale=1.78/size.y;model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale)}
 fighter.externalModel=model;
 const rigReport=inspectHumanoidRig(model);
 const appliedMorphs=applyCharacterMorphs(model,fighter.profile);
 fighter.rigReport=rigReport;
 fighter.appliedMorphs=appliedMorphs;
 fighter.mixer=new THREE.AnimationMixer(model);
 fighter.clips=gltf.animations;
 fighter.clipActions=new Map();
 for(const clip of gltf.animations)fighter.clipActions.set(clip.name,fighter.mixer.clipAction(clip));
 fighter.currentClip=null;
 fighter.mixer.addEventListener('finished',()=>{if(fighter.action===null)playFighterClip(THREE,fighter,'idle')});
 playFighterClip(THREE,fighter,'idle');
 return {clips:gltf.animations.map(c=>c.name),height:size.y,rig:rigReport,appliedMorphs};
}
export function playFighterClip(THREE,fighter,action){
 if(!fighter?.mixer||!fighter?.clips?.length)return false;
 const keys=aliases[action]||[action],clip=fighter.clips.find(c=>keys.some(k=>c.name.toLowerCase().includes(k)));
 if(!clip)return false;
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
 if(!fighter.action)playFighterClip(THREE,fighter,fighter.guard?'guard':fighter.dodge>0?'dodge':moveSpeed>.2?'advance':'idle');
 fighter.mixer.update(dt);
}
