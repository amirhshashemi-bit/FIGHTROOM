import * as THREE from 'three';
import { animateFighter } from './motion.js';
import { MOVES, resolveStrike } from './combat-rules.js';
import { chooseCpuAction } from './combat-ai.js';
import { classifyContact } from './hitboxes.js';
import { transitionGround, submissionProgress } from './ground-combat.js';
import { createBout, tickBout, nextRound, stoppage } from './referee.js';
import { buildVenue } from './venue-builder.js';
import { createFightAudio } from './audio.js';
import { qualityProfile } from './performance.js';

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
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const lerp=(a,b,t)=>a+(b-a)*t;const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
function material(color,roughness=.65,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness})}
const skinA=material(0xb97855),skinB=material(0x80533f),shortA=material(0x171f2a),shortB=material(0x12314a),gloveA=material(0xa92732),gloveB=material(0x176ba6),wrap=material(0xe5e7e9),hairA=material(0x17171a),hairB=material(0x211a17);
function sphere(parent,name,r,mat,pos){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat);m.name=name;m.position.copy(pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function capsule(parent,name,r,len,mat){const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.01,len),4,8),mat);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function between(mesh,a,b){mesh.position.copy(a).add(b).multiplyScalar(.5);const d=new THREE.Vector3().subVectors(b,a);mesh.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());const gp=mesh.geometry.parameters||{};const base=(gp.length||.3)+2*(gp.radius||.07);mesh.scale.set(1,d.length()/Math.max(.01,base),1)}
function fighter(name,side,skin,shorts,gloves,hair){const root=new THREE.Group();scene.add(root);root.position.set(side*1.35,0,side*.08);root.rotation.y=side<0?Math.PI/2:-Math.PI/2;
 const rig=new THREE.Group();root.add(rig);
 const body={torso:capsule(rig,'torso',.25,.48,skin),pelvis:capsule(rig,'pelvis',.24,.22,shorts),neck:capsule(rig,'neck',.09,.12,skin),head:sphere(rig,'head',.19,skin,V(0,1.65,0)),hair:sphere(rig,'hair',.195,hair,V(0,1.77,-.015)),shorts:capsule(rig,'shorts',.25,.18,shorts)};
 const limbs={};for(const s of ['L','R']){limbs['upperArm'+s]=capsule(rig,'upperArm'+s,.075,.32,skin);limbs['foreArm'+s]=capsule(rig,'foreArm'+s,.064,.29,skin);limbs['glove'+s]=sphere(rig,'glove'+s,.105,gloves,V());limbs['thigh'+s]=capsule(rig,'thigh'+s,.105,.39,skin);limbs['shin'+s]=capsule(rig,'shin'+s,.075,.36,skin);limbs['foot'+s]=new THREE.Mesh(new THREE.BoxGeometry(.16,.09,.29),material(0x17191e));limbs['foot'+s].castShadow=true;rig.add(limbs['foot'+s]);}
 const belt=new THREE.Mesh(new THREE.BoxGeometry(.43,.055,.29),material(0xc2a56c,.5,.35));rig.add(belt);belt.position.y=1.02;
 const eyes=[];for(const s of [-1,1]){const e=sphere(rig,'eye',.018,material(0x151515),V(s*.07,1.68,.17));eyes.push(e)}
 const state={name,root,rig,body,limbs,side,hp:100,stamina:100,energy:0,action:null,actionTime:0,actionDuration:0,guard:false,dodge:0,evadeVector:V(),hitFlash:0,stun:0,knock:0,move:V(),yaw:0,aiThink:0,lastHit:0,grounded:true,groundState:'standing',submitting:false,submissionProgress:0,submissionFrom:null,skin};
 return state}
player=fighter('PLAYER',-1,skinA,shortA,gloveA,hairA);enemy=fighter('CPU',1,skinB,shortB,gloveB,hairB);
function pose(f,t,moveSpeed,dt){animateFighter(f,t,moveSpeed,dt)}
function resize(){const w=mount.clientWidth,h=mount.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(mount);resize();
const keys=new Set(),touchMove=new Set();
function currentMoveVector(){
 const x=(keys.has('d')?1:0)-(keys.has('a')?1:0)+(touchMove.has('right')?1:0)-(touchMove.has('left')?1:0);
 const z=(keys.has('s')?1:0)-(keys.has('w')?1:0)+(touchMove.has('down')?1:0)-(touchMove.has('up')?1:0);
 const v=V(x,0,z);return v.lengthSq()>1?v.normalize():v;
}
function setAction(f,type){
 if(ended||bout.phase!=='fight'||f.action||f.knock>0||f.stun>0)return;
 if(type==='submission'||type==='ground-pound'||type==='stand-up'){
  const def=f===player?enemy:player;
  if(type==='submission'&&['top-control','mount','back-control'].includes(f.groundState)){
   const tr=transitionGround(f.groundState,'submission',{stamina:f.stamina});
   if(tr.ok&&f.stamina>=tr.staminaCost){f.submissionFrom=f.groundState;f.groundState='submission';f.submitting=true;f.submissionProgress=0;f.stamina-=tr.staminaCost;document.getElementById('status').textContent='HOLD SUBMISSION TO FINISH'}
  }else if(type==='ground-pound'&&f.groundState==='top-control'){def.hp=Math.max(0,def.hp-5);def.stun=Math.max(def.stun,.12);audio.impact()}
  else if(type==='stand-up'&&f.groundState!=='standing'){f.groundState='standing';def.groundState='standing';f.submitting=false;def.submitting=false;f.stamina=Math.max(0,f.stamina-10)}
  updateUI();return;
 }
 if(type==='guard'){f.guard=true;return}
 if(type==='dodge'){if(f.stamina>10){f.stamina-=10;f.dodge=.30;const v=currentMoveVector();f.evadeVector=v.lengthSq()>.01?v.clone():V(f===player?-1:1,0,0)}return}
 const spec=MOVES[type];if(!spec||f.stamina<spec.cost)return;
 f.stamina-=spec.cost;f.action=type;f.actionTime=0;f.actionDuration=spec.duration;f.energy=0;f.guard=false;
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
window.addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
 const alias={arrowup:'w',arrowdown:'s',arrowleft:'a',arrowright:'d'};keys.add(alias[k]||k);if(e.repeat)return;
 const map={j:'jab',l:'cross',k:'hook',u:'low',i:'high',o:'takedown',' ':'guard',shift:'dodge'};if(map[k])setAction(player,map[k]);
});
window.addEventListener('keyup',e=>{
 const k=e.key.toLowerCase(),alias={arrowup:'w',arrowdown:'s',arrowleft:'a',arrowright:'d'};
 keys.delete(alias[k]||k);if(k===' ')releaseAction(player,'guard');
});
function distance(a,b){return a.root.position.distanceTo(b.root.position)}
function face(a,b){const dx=b.root.position.x-a.root.position.x;a.root.rotation.y=Math.atan2(dx,Math.abs(b.root.position.z-a.root.position.z)+.001)*(a.side<0?1:-1);a.root.rotation.y=a.side<0?Math.PI/2:-Math.PI/2;}
function inFront(att,def){
 const dx=def.root.position.x-att.root.position.x,dz=def.root.position.z-att.root.position.z;
 const forward=V(Math.sin(att.root.rotation.y),0,Math.cos(att.root.rotation.y));
 return dx*forward.x+dz*forward.z>.35;
}
function applyHit(att,def,type){
 const zone=MOVES[type]?.zone||'head',direction=Math.sign(def.root.position.x-att.root.position.x)||1;
 const targetY=zone==='head'?1.7:zone==='leg'?.35:1.2;
 const contact=classifyContact({attacker:[att.root.position.x,1.2,att.root.position.z],defender:[def.root.position.x,0,def.root.position.z],attackPoint:[def.root.position.x-direction*.18,targetY,def.root.position.z],attackRadius:zone==='leg'?.20:.18,front:inFront(att,def),evading:def.dodge>0});
 if(!contact.hit||contact.zone!==zone)return false;
 const defenderZone=def.stun>0?'exposed':def.guard?'braced':'neutral';
 const result=resolveStrike({move:type,distance:distance(att,def),inFront:inFront(att,def),guard:def.guard,evading:def.dodge>0,defenderStamina:def.stamina,defenderZone});
 if(['invalid','miss','evaded'].includes(result.result))return false;
 def.hp=Math.max(0,def.hp-result.damage);def.stamina=Math.max(0,def.stamina-result.staminaLoss);
 def.hitFlash=result.result==='blocked'?.09:.18;def.stun=Math.max(def.stun||0,result.stun||0);
 if(result.result==='blocked')audio.block();else{audio.strike();audio.impact()}
 if(type==='takedown'&&result.result==='hit'){
  const a=transitionGround(att.groundState,'clinch',{stamina:att.stamina}),d=transitionGround(def.groundState,'clinch',{stamina:def.stamina});
  const finish=a.ok&&d.ok?transitionGround('clinch','takedown',{stamina:att.stamina}):{ok:false};
  if(finish.ok){att.groundState='top-control';def.groundState='bottom-guard';att.stamina=Math.max(0,att.stamina-finish.staminaCost);def.knock=Math.max(def.knock,.72);def.root.position.x+=Math.sign(def.root.position.x-att.root.position.x)*.18}
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
 f.stamina=clamp(f.stamina+dt*(f.guard?2.1:7.2),0,100);
 f.hitFlash=Math.max(0,f.hitFlash-dt);f.knock=Math.max(0,f.knock-dt);f.dodge=Math.max(0,f.dodge-dt);f.stun=Math.max(0,(f.stun||0)-dt);
 if(f.action){
  f.actionTime+=dt;const p=f.actionTime/f.actionDuration,spec=MOVES[f.action];
  if(p>=spec.active[0]&&p<=spec.active[1]&&!f.energy){applyHit(f,f===player?enemy:player,f.action);f.energy=1}
  if(p>=1){f.action=null;f.actionTime=0;f.energy=0}
 }
}
let cpuDecisionSeed=1;
function cpu(dt){
 if(ended||bout.phase!=='fight'||enemy.hp<=0)return;
 enemy.aiThink-=dt;
 if(enemy.aiThink<=0&&!enemy.action&&enemy.knock<=0&&enemy.stun<=0){
  const d=distance(enemy,player);enemy.aiThink=.24;
  const decision=chooseCpuAction({distance:d,playerAttacking:!!player.action,playerGuarding:player.guard,stamina:enemy.stamina,seed:cpuDecisionSeed++});
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
function updateUI(){for(const [prefix,f] of [['p',player],['e',enemy]]){document.getElementById(prefix+'-health').style.width=f.hp+'%';document.getElementById(prefix+'-stamina').style.width=f.stamina+'%';document.getElementById(prefix+'-hp').textContent=Math.ceil(f.hp);document.getElementById(prefix+'-st').textContent=Math.ceil(f.stamina)}}
function endFight(text){ended=true;audio.bell();const r=document.getElementById('result');r.classList.remove('hidden');r.innerHTML=text+'<br><small>Refresh the page to start a new bout.</small>';document.getElementById('status').textContent='BOUT COMPLETE'}
let lastUi=0;function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;if(!ended){
 if(bout.phase==='fight'){bout=tickBout(bout,dt);roundSeconds=bout.remaining;if(bout.phase==='between-rounds'){restCountdown=bout.restSeconds;document.getElementById('status').textContent='ROUND BREAK';audio.bell()}if(bout.phase==='decision')endFight(player.hp>enemy.hp?'PLAYER WINS ON POINTS':player.hp<enemy.hp?'CPU WINS ON POINTS':'DRAW')}
 else if(bout.phase==='between-rounds'){restCountdown-=dt;if(restCountdown<=0){bout=nextRound(bout);roundSeconds=bout.remaining;document.getElementById('round').textContent='ROUND '+bout.round;audio.bell()}}
 if(stoppage({health:player.hp})==='ko-tko')endFight('CPU WINS — TKO');if(stoppage({health:enemy.hp})==='ko-tko')endFight('PLAYER WINS — TKO');
 if(bout.phase==='fight'){
  const input=currentMoveVector(),moving=input.lengthSq()>.001;
  const speed=player.guard?1.05:player.stun>0?0:2.0;
  if(moving&&!player.action&&player.knock<=0&&player.stun<=0){
   player.root.position.x+=input.x*speed*dt;player.root.position.z+=input.z*speed*dt;
   player.root.position.x=clamp(player.root.position.x,-3.8,3.8);player.root.position.z=clamp(player.root.position.z,-3.4,3.4);player.move.copy(input);
  }else player.move.set(0,0,0);
  if(player.dodge>0){player.root.position.x+=player.evadeVector.x*3.4*dt;player.root.position.z+=player.evadeVector.z*3.4*dt}
  cpu(dt);if(enemy.move.lengthSq()&&!enemy.action&&enemy.stun<=0){enemy.root.position.x+=enemy.move.x*1.15*dt;enemy.root.position.x=clamp(enemy.root.position.x,.7,3.8);enemy.move.set(enemy.move.x,0,0)}else enemy.move.set(0,0,0);
  resolveFighterSpacing();tickFighter(player,dt);tickFighter(enemy,dt);
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
