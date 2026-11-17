import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { ROSTER, getFighter } from './roster.js';
import { getCountryOptions, countryFlag, resolveCountryCode } from './countries.js';
import { DEFAULT_CUSTOM_FIGHTER, MOVE_CATALOG, getBodyMetrics, loadCustomFighter, normalizeCustomFighter, saveCustomFighter } from './character-creator.js';
import { loadFighterGLB, loadFighterBVH, playFighterClip, updateFighterMocap, hasFighterClip } from './mocap-runtime.js';
import { animateFighter } from './motion.js';
import { MOVES, resolveStrike } from './combat-rules.js';
import { chooseCpuAction } from './combat-ai.js';
import { classifyContact } from './hitboxes.js';
import { transitionGround, submissionProgress, resolveGrappleAction, GRAPPLE_ACTIONS } from './ground-combat.js';
import { stepGroundPair } from './ground-presentation.js';
import { createBout, tickBout, nextRound, stoppage } from './referee.js';
import { buildVenue } from './venue-builder.js';
import { createFightAudio } from './audio.js';
import { qualityProfile } from './performance.js';
import { canUseCombatAction, resolvePremiumAccess } from './premium-access.js';

const mount=document.getElementById('view');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x090f18);scene.fog=new THREE.Fog(0x090f18,13,27);
const camera=new THREE.PerspectiveCamera(38,1,.1,80);camera.position.set(0,5.6,11.7);camera.lookAt(0,1.1,0);
const quality=qualityProfile({width:innerWidth,height:innerHeight,deviceMemory:navigator.deviceMemory||4,hardwareConcurrency:navigator.hardwareConcurrency||4,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});
const renderer=new THREE.WebGLRenderer({antialias:quality.antialias,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,quality.pixelRatio));renderer.shadowMap.enabled=quality.shadows;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;mount.appendChild(renderer.domElement);
const audio=createFightAudio();let audioEnabled=false;
const hemi=new THREE.HemisphereLight(0xb8d5f5,0x171b24,2.1);scene.add(hemi);
function areaLight(color,intensity,pos){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...pos);l.castShadow=true;l.shadow.mapSize.set(1024,1024);scene.add(l)}
areaLight(0xffd6a2,3.2,[-4,8,5]);areaLight(0x75bfff,2.4,[5,6,-4]);
const floor=new THREE.Mesh(new THREE.CircleGeometry(5.3,96),new THREE.MeshStandardMaterial({color:0x202a35,roughness:.86,metalness:.08}));floor.rotation.x=-Math.PI/2;floor.position.y=-.06;floor.receiveShadow=true;scene.add(floor);
const oct=new THREE.Mesh(new THREE.RingGeometry(4.75,4.88,8),new THREE.MeshStandardMaterial({color:0xc0c7ce,metalness:.65,roughness:.35,side:THREE.DoubleSide}));oct.rotation.x=-Math.PI/2;oct.position.y=-.045;scene.add(oct);
for(let i=0;i<8;i++){const a=i*Math.PI/4;const post=new THREE.Mesh(new THREE.CylinderGeometry(.045,.055,2.5,8),new THREE.MeshStandardMaterial({color:0x6f7c8a,metalness:.6}));post.position.set(Math.cos(a)*4.83,1.2,Math.sin(a)*4.83);scene.add(post)}
for(let y of [0.35,1.15,1.95]){const pts=[];for(let i=0;i<=8;i++){const a=i*Math.PI/4;pts.push(new THREE.Vector3(Math.cos(a)*4.83,y,Math.sin(a)*4.83))}const g=new THREE.BufferGeometry().setFromPoints(pts);scene.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0x9daab6,transparent:true,opacity:.45})));}
const matLine=new THREE.Mesh(new THREE.PlaneGeometry(10,10),new THREE.MeshStandardMaterial({color:0x303d4c,roughness:1,transparent:true,opacity:.18}));matLine.rotation.x=-Math.PI/2;matLine.position.y=-.05;scene.add(matLine);
const clock=new THREE.Clock();let elapsed=0,ended=false,roundSeconds=300,player,enemy;
let bout=createBout({rounds:3,roundSeconds:300,restSeconds:60}),restCountdown=0;
let premiumAccess=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const lerp=(a,b,t)=>a+(b-a)*t;const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
function material(color,roughness=.65,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness})}
const skinA=material(0xb97855),skinB=material(0x80533f),shortA=material(0x171f2a),shortB=material(0x12314a),gloveA=material(0xa92732),gloveB=material(0x176ba6),wrap=material(0xe5e7e9),hairA=material(0x17171a),hairB=material(0x211a17);
function sphere(parent,name,r,mat,pos){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat);m.name=name;m.position.copy(pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function capsule(parent,name,r,len,mat){const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.01,len),4,8),mat);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function between(mesh,a,b){mesh.position.copy(a).add(b).multiplyScalar(.5);const d=new THREE.Vector3().subVectors(b,a);mesh.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());const gp=mesh.geometry.parameters||{};const base=(gp.length||.3)+2*(gp.radius||.07);mesh.scale.set(1,d.length()/Math.max(.01,base),1)}
function fighter(profile,side){const name=profile.name,skin=material(profile.skin),shorts=material(profile.shorts),gloves=material(profile.gloves),hair=material(profile.hair),bodyMetrics=getBodyMetrics({...profile,gender:profile.gender||(String(profile.division||'').startsWith('Women')?'female':'male')});const root=new THREE.Group();scene.add(root);root.position.set(side*1.35,0,side*.08);root.rotation.y=side<0?Math.PI/2:-Math.PI/2;root.scale.y=bodyMetrics.height;
 const rig=new THREE.Group();root.add(rig);
 const body={torso:capsule(rig,'torso',.25,.48,skin),pelvis:capsule(rig,'pelvis',.24,.22,shorts),neck:capsule(rig,'neck',.09,.12,skin),head:sphere(rig,'head',.19,skin,V(0,1.65,0)),hair:sphere(rig,'hair',.195,hair,V(0,1.77,-.015)),shorts:capsule(rig,'shorts',.25,.18,shorts)};
 const proportions=bodyMetrics;body.torso.scale.set(proportions.shoulders,proportions.chest,proportions.chest);body.pelvis.scale.set(proportions.hips,1,proportions.hips);body.shorts.scale.set(proportions.hips,1,proportions.hips);
 const limbs={};for(const s of ['L','R']){limbs['upperArm'+s]=capsule(rig,'upperArm'+s,.075,.32,skin);limbs['foreArm'+s]=capsule(rig,'foreArm'+s,.064,.29,skin);limbs['glove'+s]=sphere(rig,'glove'+s,.105,gloves,V());limbs['thigh'+s]=capsule(rig,'thigh'+s,.105,.39,skin);limbs['shin'+s]=capsule(rig,'shin'+s,.075,.36,skin);limbs['foot'+s]=new THREE.Mesh(new THREE.BoxGeometry(.16,.09,.29),material(0x17191e));limbs['foot'+s].castShadow=true;rig.add(limbs['foot'+s]);}
 const belt=new THREE.Mesh(new THREE.BoxGeometry(.43,.055,.29),material(0xc2a56c,.5,.35));rig.add(belt);belt.position.y=1.02;
 const eyes=[];const eyeMat=material(profile.eye??0x151515,.35);for(const s of [-1,1]){const e=sphere(rig,'eye',.018,eyeMat,V(s*.07,1.68,.17));eyes.push(e)}
 for(const sideKey of ['L','R']){for(const part of ['upperArm','foreArm']){const m=limbs[part+sideKey];m.scale.x=proportions.arms;m.scale.z=proportions.arms}for(const part of ['thigh','shin']){const m=limbs[part+sideKey];m.scale.x=proportions.legs;m.scale.z=proportions.legs}}
 const state={name,profile,root,rig,body,limbs,side,hp:100,stamina:100,energy:0,action:null,actionTime:0,actionDuration:0,guard:false,dodge:0,evadeVector:V(),hitFlash:0,stun:0,knock:0,move:V(),yaw:0,aiThink:0,lastHit:0,grounded:true,groundState:'standing',submitting:false,submissionProgress:0,submissionFrom:null,frameTimer:0,motionOverride:null,motionOverrideTime:0,skin};
 return state}
player=fighter(getFighter('mateo-cruz'),-1);enemy=fighter(getFighter('kwame-boateng'),1);
function pose(f,t,moveSpeed,dt){
 if(f.mixer){
  updateFighterMocap(THREE,f,dt,moveSpeed);
  const groundClipMissing=f.groundState==='submission'?!hasFighterClip(f,'submission'):(f.groundState!=='standing'&&!hasFighterClip(f,'ground-control'));
  const unsupported=(f.action&&!hasFighterClip(f,f.action))||(f.guard&&!hasFighterClip(f,'guard'))||(f.dodge>0&&!hasFighterClip(f,'dodge'))||(f.submitting&&!hasFighterClip(f,'submission'))||groundClipMissing;
  if(!unsupported){f.externalModel.visible=true;f.rig.visible=false;return;}
  // Keep the imported mixer alive: procedural fallback is temporary and can
  // hand control back to a later supported mocap clip without re-importing.
  f.externalModel.visible=false;f.rig.visible=true;
 }
 animateFighter(f,t,moveSpeed,dt);
 }
function resize(){const w=mount.clientWidth,h=mount.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(mount);resize();
const keys=new Set(),touchMove=new Set();
function currentMoveVector(){
 const x=(keys.has('d')?1:0)-(keys.has('a')?1:0)+(touchMove.has('right')?1:0)-(touchMove.has('left')?1:0);
 const z=(keys.has('s')?1:0)-(keys.has('w')?1:0)+(touchMove.has('down')?1:0)-(touchMove.has('up')?1:0);
 const v=V(x,0,z);return v.lengthSq()>1?v.normalize():v;
}
function setAction(f,type,animationClip=null){
 if(ended||bout.phase!=='fight'||f.action||f.knock>0||f.stun>0)return;
 if(f===player&&!canUseCombatAction(type,premiumAccess)){document.getElementById('status').textContent='این فن فقط برای اعضای ویژه فعال است';return;}
 if(GRAPPLE_ACTIONS[type]&&GRAPPLE_ACTIONS[type].premium&&f===player&&!premiumAccess){document.getElementById('status').textContent='این فن فقط برای اعضای ویژه فعال است';return;}
 if(['clinch','sprawl','frame','escape','sweep','pass','mount','back-take','defend-submission'].includes(type)){
  const def=f===player?enemy:player;
  if(type==='clinch'&&distance(f,def)>1.6){document.getElementById('status').textContent='برای کلینچ باید نزدیک‌تر شوی';return;}
  const result=resolveGrappleAction({action:type,attackerState:f.groundState,defenderState:def.groundState,attackerStamina:f.stamina,defenderStamina:def.stamina,attackerSkill:f.profile.wrestling,defenderSkill:def.profile.wrestling,premium:f!==player||premiumAccess});
  if(!result.ok){document.getElementById('status').textContent=result.reason==='premium-required'?'این فن فقط برای اعضای ویژه فعال است':'حرکت در این موقعیت قابل اجرا نیست';return}
  f.groundState=result.attackerState;def.groundState=result.defenderState;
  f.stamina=result.attackerStamina;def.stamina=result.defenderStamina;
  if(type==='clinch'){const mid=(f.root.position.x+def.root.position.x)/2;f.root.position.x=mid-(f.side<0?.38:-.38);def.root.position.x=mid+(f.side<0?.38:-.38)}
  if(type==='frame'){f.guard=true;f.frameTimer=.65;}
  playFighterClip(THREE,f,type==='defend-submission'?'submission':type);
  document.getElementById('status').textContent=type.toUpperCase().replaceAll('-',' ')+' · GRAPPLING';
  updateUI();return;
 }
 if(type==='submission'||type==='ground-pound'||type==='stand-up'){
  const def=f===player?enemy:player;
  if(type==='submission'&&['top-control','mount','back-control'].includes(f.groundState)){
   const tr=transitionGround(f.groundState,'submission',{stamina:f.stamina});
   if(tr.ok&&f.stamina>=tr.staminaCost){f.submissionFrom=f.groundState;f.groundState='submission';f.submitting=true;f.submissionProgress=0;f.stamina-=tr.staminaCost;playFighterClip(THREE,f,animationClip||'submission');document.getElementById('status').textContent='HOLD SUBMISSION TO FINISH'}
  }else if(type==='ground-pound'&&f.groundState==='top-control'){
   const spec=MOVES['ground-pound'];if(f.stamina>=spec.cost){f.stamina-=spec.cost;f.action='ground-pound';f.actionTime=0;f.actionDuration=spec.duration;f.energy=0;f.guard=false;playFighterClip(THREE,f,animationClip||'ground-pound')}
  }
  else if(type==='stand-up'&&f.groundState!=='standing'){f.groundState='standing';def.groundState='standing';f.submitting=false;def.submitting=false;f.stamina=Math.max(0,f.stamina-10);f.motionOverride=def.motionOverride='stand-up';f.motionOverrideTime=def.motionOverrideTime=1.2;playFighterClip(THREE,f,'stand-up');playFighterClip(THREE,def,'stand-up')}
  updateUI();return;
 }
 if(type==='guard'){f.guard=true;playFighterClip(THREE,f,'guard');return}
 if(type==='dodge'){if(f.stamina>10){f.stamina-=10;f.dodge=.30;playFighterClip(THREE,f,'dodge');const v=currentMoveVector();f.evadeVector=v.lengthSq()>.01?v.clone():V(f===player?-1:1,0,0)}return}
 if(f.groundState!=='standing'&&!(type==='takedown'&&f.groundState==='clinch'))return;
 const spec=MOVES[type];if(!spec||f.stamina<spec.cost)return;
 f.stamina-=spec.cost;f.action=type;f.actionTime=0;f.actionDuration=spec.duration;f.energy=0;f.guard=false;playFighterClip(THREE,f,animationClip||type);
}
function releaseAction(f,type){
 if(type==='guard')f.guard=false;
 if(type==='submission'&&f.submitting){f.submitting=false;if(f.groundState==='submission')f.groundState=f.submissionFrom||'top-control';f.submissionFrom=null}
}
function bindAction(btn){
 const a=btn.dataset.action;
 const down=e=>{e.preventDefault();if(btn.setPointerCapture)btn.setPointerCapture(e.pointerId);setAction(player,a);btn.classList.add('active')};
 const up=e=>{e.preventDefault();releaseAction(player,a);btn.classList.remove('active')};
 btn.addEventListener('pointerdown',down);['pointerup','pointercancel','lostpointercapture'].forEach(n=>btn.addEventListener(n,up));
}
document.querySelectorAll('[data-action]').forEach(bindAction);
function bindMove(btn){
 const dir=btn.dataset.move;
 const down=e=>{e.preventDefault();if(btn.setPointerCapture)btn.setPointerCapture(e.pointerId);touchMove.add(dir);btn.classList.add('active')};
 const up=e=>{e.preventDefault();touchMove.delete(dir);btn.classList.remove('active')};
 btn.addEventListener('pointerdown',down);['pointerup','pointercancel','lostpointercapture'].forEach(n=>btn.addEventListener(n,up));
}

document.querySelectorAll('[data-move]').forEach(bindMove);
function populateRoster(select){select.innerHTML='';for(const p of ROSTER){const o=document.createElement('option');o.value=p.id;o.textContent=p.division+' — '+p.name+' · '+countryFlag(resolveCountryCode(p.country))+' '+(p.country||'');select.appendChild(o)}}
const playerSelect=document.getElementById('player-roster'),enemySelect=document.getElementById('enemy-roster');
populateRoster(playerSelect);populateRoster(enemySelect);playerSelect.value=player.profile.id;enemySelect.value=enemy.profile.id;
function disposeFighter(f){scene.remove(f.root);f.root.traverse(o=>{o.geometry?.dispose?.();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose?.());else o.material?.dispose?.()})}
function replaceFighter(which,id,profileOverride=null){const next=id==='custom-player'?(profileOverride||loadCustomFighter()||DEFAULT_CUSTOM_FIGHTER):getFighter(id),old=which==='player'?player:enemy,side=which==='player'?-1:1;disposeFighter(old);const fresh=fighter(next,side);if(which==='player')player=fresh;else enemy=fresh;updateUI()}
const customOption=document.createElement('option');customOption.value='custom-player';customOption.textContent='CUSTOM · My Fighter';playerSelect.appendChild(customOption);enemySelect.appendChild(customOption.cloneNode(true));
const savedCustom=loadCustomFighter();if(savedCustom){playerSelect.value='custom-player';replaceFighter('player','custom-player',savedCustom)}
playerSelect.addEventListener('change',e=>replaceFighter('player',e.target.value));
enemySelect.addEventListener('change',e=>replaceFighter('enemy',e.target.value));
const byId=id=>document.getElementById(id);
const colorHex=n=>'#'+(Number(n)>>>0).toString(16).padStart(6,'0').slice(-6);
const colorNum=s=>parseInt(String(s).replace('#',''),16);
function availableMoveIds(profile){
 const ids=new Set(profile?.ownedMoves||DEFAULT_CUSTOM_FIGHTER.ownedMoves);
 if(premiumAccess)for(const move of MOVE_CATALOG)if(move.premium)ids.add(move.id);
 return [...ids];
}
function renderMoveCatalog(profile){
 for(let slot=0;slot<2;slot++){const select=byId('custom-move-slot-'+(slot+1));if(select){select.innerHTML='';for(const id of availableMoveIds(profile)){const move=MOVE_CATALOG.find(m=>m.id===id);if(move){const option=document.createElement('option');option.value=id;option.textContent=move.name;select.appendChild(option)}}select.value=(profile?.equippedMoves||DEFAULT_CUSTOM_FIGHTER.equippedMoves)[slot]||''}}
 const host=byId('move-catalog');if(!host)return;host.innerHTML='';
 for(const move of MOVE_CATALOG){const card=document.createElement('article');card.className='move-card';
  const title=document.createElement('b');title.textContent=move.name;
  const category=document.createElement('small');category.textContent=move.category+' · '+(move.premium?'PREMIUM ACCESS':'STANDARD');
  const state=document.createElement('small');state.textContent=move.premium&&!premiumAccess?'قفل اشتراک ویژه':(profile?.equippedMoves?.includes(move.id)?'مجهز شده':move.premium?'فعال با اشتراک ویژه':'قابل انتخاب · پایه');
  const btn=document.createElement('button');btn.type='button';btn.disabled=true;btn.textContent=move.premium?(premiumAccess?'ویژه فعال':'قفل ویژه'):'پیش‌فرض';
  card.append(title,category,state,btn);host.appendChild(card)}
}
function populateCountries(select,selected='IR'){select.innerHTML='';for(const country of getCountryOptions('fa')){const o=document.createElement('option');o.value=country.code;o.textContent=countryFlag(country.code)+' '+country.name;select.appendChild(o)}select.value=selected;}
populateCountries(byId('custom-country'),(loadCustomFighter()||DEFAULT_CUSTOM_FIGHTER).countryCode||'IR');
function readCustomForm(){
 const saved=loadCustomFighter()||DEFAULT_CUSTOM_FIGHTER;
 return normalizeCustomFighter({...saved,name:byId('custom-name').value,gender:byId('custom-gender').value,height:byId('custom-height').value,weight:byId('custom-weight').value,reach:byId('custom-reach').value,
  skin:colorNum(byId('custom-skin').value),eye:colorNum(byId('custom-eye').value),hair:colorNum(byId('custom-hair').value),shorts:colorNum(byId('custom-shorts').value),gloves:colorNum(byId('custom-gloves').value),
  countryCode:byId('custom-country').value,stance:byId('custom-stance').value,style:byId('custom-style').value,power:byId('custom-power').value,speed:byId('custom-speed').value,wrestling:byId('custom-wrestling').value,cardio:byId('custom-cardio').value,
  body:{shoulders:Number(byId('custom-shoulders').value)/100,chest:Number(byId('custom-chest').value)/100,arms:Number(byId('custom-arms').value)/100,legs:Number(byId('custom-legs').value)/100}});
}
function fillCustomForm(profile){
 const p=profile||DEFAULT_CUSTOM_FIGHTER;
 for(const [id,value] of Object.entries({'custom-name':p.name,'custom-gender':p.gender||'male','custom-height':p.height,'custom-weight':p.weight,'custom-reach':p.reach,'custom-country':p.countryCode||'IR','custom-skin':colorHex(p.skin),'custom-eye':colorHex(p.eye),'custom-hair':colorHex(p.hair),'custom-shorts':colorHex(p.shorts),'custom-gloves':colorHex(p.gloves),'custom-stance':p.stance,'custom-style':p.style,'custom-power':p.power,'custom-speed':p.speed,'custom-wrestling':p.wrestling,'custom-cardio':p.cardio,'custom-shoulders':Math.round((p.body?.shoulders||1)*100),'custom-chest':Math.round((p.body?.chest||1)*100),'custom-arms':Math.round((p.body?.arms||1)*100),'custom-legs':Math.round((p.body?.legs||1)*100)})){if(byId(id))byId(id).value=value}
 for(const id of ['shoulders','chest','arms','legs']){const out=byId('custom-'+id+'-value');if(out)out.textContent=byId('custom-'+id).value+'%'}
}
for(const id of ['shoulders','chest','arms','legs'])byId('custom-'+id)?.addEventListener('input',e=>{byId('custom-'+id+'-value').textContent=e.target.value+'%'});
byId('save-custom-fighter')?.addEventListener('click',()=>{
 try{const profile=saveCustomFighter(readCustomForm());playerSelect.value='custom-player';replaceFighter('player','custom-player',profile);byId('creator-status').textContent='مبارز ذخیره شد و در گوشه قرمز انتخاب شد.';renderMoveCatalog(profile)}
 catch(error){byId('creator-status').textContent='خطا در ذخیره: '+error.message}
});
fillCustomForm(savedCustom);renderMoveCatalog(savedCustom);
async function refreshPremiumState(){const result=await resolvePremiumAccess();premiumAccess=result.active;renderMoveCatalog(player.profile);if(!ended)document.getElementById('status').textContent=premiumAccess?'PREMIUM ACCESS VERIFIED':'STANDARD ACCESS · PREMIUM MOVES LOCKED'}
refreshPremiumState();setInterval(refreshPremiumState,60000);
function equipCustomMove(slot,id){const profile=loadCustomFighter()||DEFAULT_CUSTOM_FIGHTER;const move=MOVE_CATALOG.find(m=>m.id===id);if(!move||(move.premium&&!premiumAccess))return;const owned=[...(profile.ownedMoves||[])];if(move.premium&&!owned.includes(id))owned.push(id);if(!owned.includes(id))return;const equipped=[...(profile.equippedMoves||[])];equipped[slot]=id;const unique=equipped.filter(Boolean);if(new Set(unique).size!==unique.length){byId('creator-status').textContent='هر حرکت فقط در یک خانه قابل تجهیز است.';renderMoveCatalog(profile);return}const next=saveCustomFighter({...profile,ownedMoves:owned,equippedMoves:equipped});renderMoveCatalog(next);byId('creator-status').textContent='حرکت اختصاصی در جایگاه '+(slot+1)+' مجهز شد.'}
for(let slot=0;slot<2;slot++)byId('custom-move-slot-'+(slot+1))?.addEventListener('change',e=>equipCustomMove(slot,e.target.value));
function triggerEquippedMove(slot){const loadout=loadCustomFighter()||DEFAULT_CUSTOM_FIGHTER;const id=loadout.equippedMoves?.[slot],move=MOVE_CATALOG.find(m=>m.id===id);if(!move||!loadout.ownedMoves.includes(id))return;if(move.premium&&!premiumAccess){document.getElementById('status').textContent='حرکات ویژه فقط با اشتراک تأییدشده فعال می‌شوند';return}setAction(player,move.action||move.baseMove,move.clip)}
document.querySelectorAll('[data-custom-move]').forEach(btn=>btn.addEventListener('pointerdown',e=>{e.preventDefault();triggerEquippedMove(Number(btn.dataset.customMove)-1)}));
async function importMocap(input,which){
 const files=Array.from(input.files||[]);if(!files.length)return;
 const f=which==='player'?player:enemy;
 files.sort((a,b)=>Number(a.name.toLowerCase().endsWith('.bvh'))-Number(b.name.toLowerCase().endsWith('.bvh')));
 try{
  let summary='';
  for(const file of files){
   if(file.name.toLowerCase().endsWith('.bvh')){
    const info=await loadFighterBVH(THREE,file,f);
    summary=which.toUpperCase()+' BVH RETARGETED · '+info.mappedBones+' BONES · '+info.tracks+' TRACKS';
   }else{
    const info=await loadFighterGLB(THREE,GLTFLoader,file,f);f.root.scale.y=1;
    summary=which.toUpperCase()+' MOCAP MODEL · '+info.clips.length+' CLIPS · RIG '+info.rig.foundCore+'/7 · MORPHS '+info.appliedMorphs.length;
   }
  }
  document.getElementById('mocap-status').textContent=summary+' · '+files.length+' FILE(S)';
 }catch(error){document.getElementById('mocap-status').textContent='MOCAP IMPORT FAILED: '+error.message;console.error(error)}
}
document.getElementById('p-mocap-file').addEventListener('change',e=>importMocap(e.target,'player'));
document.getElementById('e-mocap-file').addEventListener('change',e=>importMocap(e.target,'enemy'));
const ACCAD_DEMO_CLIPS=['Male2_A1_Stand.bvh','Male2_E1_JabLeft.bvh','Male2_E3_CrossLeft.bvh','Male2_G8_RoundhouseLeft.bvh','Male2_E11_BlockLeftHigh.bvh','Male2_E19_DodgeLeft.bvh','Male2_A9_Lie.bvh','Male2_A10_LieToCrouch.bvh'];
async function loadBundledAccadPack(which){
 const f=which==='player'?player:enemy,status=byId('mocap-status');
 try{
  status.textContent='Loading licensed ACCAD test rig and real motion-capture clips…';
  const modelResponse=await fetch(new URL('./assets/models/cc0-base-body-anim.glb',import.meta.url));
  if(!modelResponse.ok)throw new Error('CC0 test rig download failed: '+modelResponse.status);
  const modelFile=new File([await modelResponse.arrayBuffer()],'accad-test-rig.glb',{type:'model/gltf-binary'});
  const modelInfo=await loadFighterGLB(THREE,GLTFLoader,modelFile,f);f.root.scale.y=1;
  let loaded=0,lastInfo=null;
  for(const name of ACCAD_DEMO_CLIPS){
   const response=await fetch(new URL('./assets/mocap/accad/'+name,import.meta.url));
   if(!response.ok)throw new Error('Missing ACCAD clip '+name+' ('+response.status+')');
   const file=new File([await response.arrayBuffer()],name,{type:'application/octet-stream'});
   lastInfo=await loadFighterBVH(THREE,file,f);loaded++;
  }
  status.textContent=which.toUpperCase()+' · ACCAD REAL MOCAP READY · '+loaded+' CLIPS · '+lastInfo.mappedBones+' BONES MAPPED · TEST RIG (MALE BASE)';
 }catch(error){status.textContent='ACCAD PACK LOAD FAILED: '+error.message;console.error(error)}
}
document.querySelectorAll('[data-load-accad]').forEach(btn=>btn.addEventListener('click',()=>loadBundledAccadPack(btn.dataset.loadAccad)));
updateUI();
window.addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
 const alias={arrowup:'w',arrowdown:'s',arrowleft:'a',arrowright:'d'};keys.add(alias[k]||k);if(e.repeat)return;
 const map={j:'jab',l:'cross',k:'hook',u:'low',i:'high',o:'takedown',n:'ground-pound',m:'submission',b:'stand-up',' ':'guard',shift:'dodge'};if(map[k])setAction(player,map[k]);
});
window.addEventListener('keyup',e=>{
 const k=e.key.toLowerCase(),alias={arrowup:'w',arrowdown:'s',arrowleft:'a',arrowright:'d'};
 keys.delete(alias[k]||k);if(k===' ')releaseAction(player,'guard');if(k==='m')releaseAction(player,'submission');
});
function distance(a,b){return a.root.position.distanceTo(b.root.position)}
function face(a,b){const dx=b.root.position.x-a.root.position.x;a.root.rotation.y=Math.atan2(dx,Math.abs(b.root.position.z-a.root.position.z)+.001)*(a.side<0?1:-1);a.root.rotation.y=a.side<0?Math.PI/2:-Math.PI/2;}
function inFront(att,def){
 const dx=def.root.position.x-att.root.position.x,dz=def.root.position.z-att.root.position.z;
 const forward=V(Math.sin(att.root.rotation.y),0,Math.cos(att.root.rotation.y));
 return dx*forward.x+dz*forward.z>.35;
}
function applyHit(att,def,type){
 if(type==='ground-pound'){
  if(att.groundState!=='top-control'||!['bottom-guard','side-control','mount'].includes(def.groundState))return false;
  const result=resolveStrike({move:type,distance:distance(att,def),inFront:true,guard:def.guard,evading:def.dodge>0,defenderStamina:def.stamina,defenderZone:def.stun>0?'exposed':def.guard?'braced':'neutral'});
  if(['invalid','miss','evaded'].includes(result.result))return false;
  def.hp=Math.max(0,def.hp-result.damage*(.8+att.profile.power/500));def.stamina=Math.max(0,def.stamina-result.staminaLoss);def.stun=Math.max(def.stun||0,result.stun||0);def.hitFlash=.18;if(result.result==='blocked')audio.block();else{audio.strike();audio.impact()}return true;
 }
 const zone=MOVES[type]?.zone||'head',direction=Math.sign(def.root.position.x-att.root.position.x)||1;
 const targetY=(zone==='head'?1.7:zone==='leg'?.35:1.2)*def.root.scale.y;
 const contact=classifyContact({attacker:[att.root.position.x,1.2,att.root.position.z],defender:[def.root.position.x,0,def.root.position.z],attackPoint:[def.root.position.x-direction*.18,targetY,def.root.position.z],attackRadius:zone==='leg'?.20:.18,front:inFront(att,def),evading:def.dodge>0});
 if(!contact.hit||contact.zone!==zone)return false;
 const defenderZone=def.stun>0?'exposed':def.guard?'braced':'neutral';
 const reachBonus=(att.profile.reach-180)/100;const result=resolveStrike({move:type,distance:Math.max(0,distance(att,def)-reachBonus),inFront:inFront(att,def),guard:def.guard,evading:def.dodge>0,defenderStamina:def.stamina,defenderZone});
 if(['invalid','miss','evaded'].includes(result.result))return false;
 def.hp=Math.max(0,def.hp-result.damage*(.8+att.profile.power/500));def.stamina=Math.max(0,def.stamina-result.staminaLoss);
 def.hitFlash=result.result==='blocked'?.09:.18;def.stun=Math.max(def.stun||0,result.stun||0);
 if(result.result==='blocked')audio.block();else{audio.strike();audio.impact()}
 if(type==='takedown'&&result.result==='hit'){
  const grappling=resolveGrappleAction({action:'takedown',attackerState:att.groundState,defenderState:def.groundState,attackerStamina:att.stamina,defenderStamina:def.stamina,attackerSkill:att.profile.wrestling,defenderSkill:def.profile.wrestling,premium:att!==player||premiumAccess});
  if(grappling.ok){att.groundState=grappling.attackerState;def.groundState=grappling.defenderState;att.stamina=grappling.attackerStamina;def.stamina=grappling.defenderStamina;def.knock=Math.max(def.knock,.42)}
  else{def.stun=Math.max(def.stun,.18);document.getElementById('status').textContent='TAKEDOWN DEFENDED'}
 }
 else if(result.knockback)def.root.position.x+=Math.sign(def.root.position.x-att.root.position.x)*result.knockback;
 return true;
}
function tickFighter(f,dt){
 if(f.submitting){
  const def=f===player?enemy:player;
  const pressure=submissionProgress({control:75,attackerStamina:f.stamina,defenderStamina:def.stamina,defenderEscape:def.stamina*.05});
  f.submissionProgress+=dt*pressure*.45;f.stamina=Math.max(0,f.stamina-dt*1.5);
  if(f.submissionProgress>=100){endFight(f===player?'PLAYER WINS — SUBMISSION':'CPU WINS — SUBMISSION');return}
  if(f.stamina<=0)releaseAction(f,'submission');
 }
 f.stamina=clamp(f.stamina+dt*(f.submitting?0:f.guard?2.1:4+f.profile.cardio*.035),0,100);
 f.hitFlash=Math.max(0,f.hitFlash-dt);f.knock=Math.max(0,f.knock-dt);f.dodge=Math.max(0,f.dodge-dt);f.stun=Math.max(0,(f.stun||0)-dt);
 if(f.frameTimer>0){f.frameTimer=Math.max(0,f.frameTimer-dt);if(f.frameTimer===0)f.guard=false;}
 if(f.action){
  f.actionTime+=dt;const p=f.actionTime/f.actionDuration,spec=MOVES[f.action];
  if(p>=spec.active[0]&&p<=spec.active[1]&&!f.energy){applyHit(f,f===player?enemy:player,f.action);f.energy=1}
  if(p>=1){f.action=null;f.actionTime=0;f.energy=0}
 }
}
let cpuDecisionSeed=1;
function cpu(dt){
 if(ended||bout.phase!=='fight'||enemy.hp<=0)return;
 if(enemy.groundState!=='standing'||player.groundState!=='standing'){
  enemy.guard=false;enemy.move.set(0,0,0);enemy.aiThink-=dt;
  if(enemy.aiThink<=0){enemy.aiThink=.8;
   if(enemy.groundState==='clinch')setAction(enemy,'takedown');
   else if(enemy.groundState==='top-control'&&player.groundState==='bottom-guard')setAction(enemy,'ground-pound');
   else if(['mount','back-control'].includes(enemy.groundState))setAction(enemy,'submission');
   else if(enemy.groundState==='bottom-guard'&&player.groundState==='top-control'&&enemy.profile.wrestling>=player.profile.wrestling-10)setAction(enemy,'sweep');
   else if(enemy.groundState!=='standing')setAction(enemy,'escape')
  }
  return;
 }
 enemy.aiThink-=dt;
 if(enemy.aiThink<=0&&!enemy.action&&enemy.knock<=0&&enemy.stun<=0){
  const d=distance(enemy,player);enemy.aiThink=.24;
  if(d<1.55&&enemy.profile.wrestling>=player.profile.wrestling-5&&enemy.stamina>32){setAction(enemy,'clinch');enemy.aiThink=.8;return;}
  const decision=chooseCpuAction({distance:d,playerAttacking:!!player.action,playerGuarding:player.guard,stamina:enemy.stamina,wrestling:enemy.profile.wrestling,seed:cpuDecisionSeed++});
  enemy.guard=decision.action==='guard';
  if(decision.action==='approach')enemy.move.set(-1,0,0);
  else if(decision.action==='retreat')enemy.move.set(1,0,0);
  else{enemy.move.set(0,0,0);if(decision.action!=='guard')setAction(enemy,decision.action)}
 }
}
function resolveFighterSpacing(){
 const dx=enemy.root.position.x-player.root.position.x,dz=enemy.root.position.z-player.root.position.z;
 const d=Math.hypot(dx,dz),minimum=.78;
 if(d>0&&d<minimum){const push=(minimum-d)*.5,ux=dx/d,uz=dz/d;player.root.position.x-=ux*push;player.root.position.z-=uz*push;enemy.root.position.x+=ux*push;enemy.root.position.z+=uz*push}
 player.root.position.x=clamp(player.root.position.x,-3.8,3.8);player.root.position.z=clamp(player.root.position.z,-3.4,3.4);
 enemy.root.position.x=clamp(enemy.root.position.x,-3.8,3.8);enemy.root.position.z=clamp(enemy.root.position.z,-3.4,3.4);
}
function updateUI(){for(const [prefix,f] of [['p',player],['e',enemy]]){document.getElementById(prefix+'-health').style.width=f.hp+'%';document.getElementById(prefix+'-stamina').style.width=f.stamina+'%';document.getElementById(prefix+'-hp').textContent=Math.ceil(f.hp);document.getElementById(prefix+'-st').textContent=Math.ceil(f.stamina);document.getElementById(prefix+'-name').textContent=f.name;document.getElementById(prefix+'-profile').textContent=f.profile.division+' · '+countryFlag(f.profile.countryCode||resolveCountryCode(f.profile.country))+' '+(f.profile.country||'')+' · '+f.profile.style+' · '+f.profile.height+'cm / '+f.profile.reach+'cm · PWR '+f.profile.power+' / SPD '+f.profile.speed+' / WRS '+f.profile.wrestling+' / CAR '+f.profile.cardio}}
function endFight(text){ended=true;audio.bell();const r=document.getElementById('result');r.classList.remove('hidden');r.innerHTML=text+'<br><small>Refresh the page to start a new bout.</small>';document.getElementById('status').textContent='BOUT COMPLETE'}
let lastUi=0;function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;if(!ended){
 if(bout.phase==='fight'){bout=tickBout(bout,dt);roundSeconds=bout.remaining;if(bout.phase==='between-rounds'){restCountdown=bout.restSeconds;document.getElementById('status').textContent='ROUND BREAK';audio.bell()}if(bout.phase==='decision')endFight(player.hp>enemy.hp?'PLAYER WINS ON POINTS':player.hp<enemy.hp?'CPU WINS ON POINTS':'DRAW')}
 else if(bout.phase==='between-rounds'){restCountdown-=dt;if(restCountdown<=0){bout=nextRound(bout);roundSeconds=bout.remaining;document.getElementById('round').textContent='ROUND '+bout.round;audio.bell()}}
 if(stoppage({health:player.hp})==='ko-tko')endFight('CPU WINS — TKO');if(stoppage({health:enemy.hp})==='ko-tko')endFight('PLAYER WINS — TKO');
 if(bout.phase==='fight'){
  const input=currentMoveVector(),moving=input.lengthSq()>.001;
  const speed=player.guard?1.05:player.stun>0?0:1.45+player.profile.speed*.006;
  if(moving&&player.groundState==='standing'&&!player.action&&player.knock<=0&&player.stun<=0){
   player.root.position.x+=input.x*speed*dt;player.root.position.z+=input.z*speed*dt;
   player.root.position.x=clamp(player.root.position.x,-3.8,3.8);player.root.position.z=clamp(player.root.position.z,-3.4,3.4);player.move.copy(input);
  }else player.move.set(0,0,0);
  if(player.dodge>0){player.root.position.x+=player.evadeVector.x*3.4*dt;player.root.position.z+=player.evadeVector.z*3.4*dt}
  cpu(dt);if(enemy.move.lengthSq()&&!enemy.action&&enemy.stun<=0){enemy.root.position.x+=enemy.move.x*(.8+enemy.profile.speed*.004)*dt;enemy.root.position.x=clamp(enemy.root.position.x,.7,3.8);enemy.move.set(enemy.move.x,0,0)}else enemy.move.set(0,0,0);
  const grapplingPhase=stepGroundPair(player,enemy,dt);if(!grapplingPhase)resolveFighterSpacing();tickFighter(player,dt);tickFighter(enemy,dt);
 }else{
  player.move.set(0,0,0);enemy.move.set(0,0,0);player.guard=false;enemy.guard=false;
  player.stamina=clamp(player.stamina+dt*8,0,100);enemy.stamina=clamp(enemy.stamina+dt*8,0,100);
 }
 pose(player,elapsed,player.move.length(),dt);pose(enemy,elapsed,enemy.move.length(),dt);
 const d=distance(player,enemy);document.getElementById('status').textContent=player.stun>0?'PLAYER STAGGERED':enemy.stun>0?'CPU STAGGERED':player.action?'PLAYER ATTACK':enemy.action?'CPU ATTACK':d>2.3?'RANGE / FOOTWORK':'IN FIGHT';
 if(elapsed-lastUi>.1){updateUI();lastUi=elapsed}
 }
 const secs=Math.max(0,Math.ceil(roundSeconds));document.getElementById('clock').textContent=String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0');
 renderer.render(scene,camera)}
const venueConfigs={'las-vegas':['charcoal','warm-white'],'abu-dhabi':['sandstone','gold-amber'],london:['slate','cool-white'],tokyo:['graphite','ice-blue'],rio:['deep-green','tropical-green'],paris:['navy','tricolor-white'],bangkok:['crimson','hot-amber'],'new-york':['midnight','theatre-spot'],toronto:['ice','cold-white'],sydney:['ocean','ocean-blue']};
let activeVenue=null;
function selectVenue(id){if(activeVenue){scene.remove(activeVenue);activeVenue.traverse(o=>{o.geometry?.dispose?.();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose?.());else o.material?.dispose?.()})}const cfg=venueConfigs[id]||venueConfigs['las-vegas'];activeVenue=buildVenue(THREE,scene,{id,canvas:cfg[0],lighting:cfg[1]})}
selectVenue('las-vegas');document.getElementById('venue-select')?.addEventListener('change',e=>selectVenue(e.target.value));
document.getElementById('sound-toggle')?.addEventListener('click',()=>{audioEnabled=!audioEnabled;audio.setEnabled(audioEnabled);document.getElementById('sound-toggle').textContent=audioEnabled?'SOUND ON':'SOUND OFF'});
loop();updateUI();
