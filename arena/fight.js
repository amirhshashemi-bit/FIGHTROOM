import * as THREE from 'three';
import { animateFighter } from './motion.js';

const mount=document.getElementById('view');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x090f18);scene.fog=new THREE.Fog(0x090f18,13,27);
const camera=new THREE.PerspectiveCamera(38,1,.1,80);camera.position.set(0,5.6,11.7);camera.lookAt(0,1.1,0);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;mount.appendChild(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xb8d5f5,0x171b24,2.1);scene.add(hemi);
function areaLight(color,intensity,pos){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...pos);l.castShadow=true;l.shadow.mapSize.set(1024,1024);scene.add(l)}
areaLight(0xffd6a2,3.2,[-4,8,5]);areaLight(0x75bfff,2.4,[5,6,-4]);
const floor=new THREE.Mesh(new THREE.CircleGeometry(5.3,96),new THREE.MeshStandardMaterial({color:0x202a35,roughness:.86,metalness:.08}));floor.rotation.x=-Math.PI/2;floor.position.y=-.06;floor.receiveShadow=true;scene.add(floor);
const oct=new THREE.Mesh(new THREE.RingGeometry(4.75,4.88,8),new THREE.MeshStandardMaterial({color:0xc0c7ce,metalness:.65,roughness:.35,side:THREE.DoubleSide}));oct.rotation.x=-Math.PI/2;oct.position.y=-.045;scene.add(oct);
for(let i=0;i<8;i++){const a=i*Math.PI/4;const post=new THREE.Mesh(new THREE.CylinderGeometry(.045,.055,2.5,8),new THREE.MeshStandardMaterial({color:0x6f7c8a,metalness:.6}));post.position.set(Math.cos(a)*4.83,1.2,Math.sin(a)*4.83);scene.add(post)}
for(let y of [0.35,1.15,1.95]){const pts=[];for(let i=0;i<=8;i++){const a=i*Math.PI/4;pts.push(new THREE.Vector3(Math.cos(a)*4.83,y,Math.sin(a)*4.83))}const g=new THREE.BufferGeometry().setFromPoints(pts);scene.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0x9daab6,transparent:true,opacity:.45})));}
const matLine=new THREE.Mesh(new THREE.PlaneGeometry(10,10),new THREE.MeshStandardMaterial({color:0x303d4c,roughness:1,transparent:true,opacity:.18}));matLine.rotation.x=-Math.PI/2;matLine.position.y=-.05;scene.add(matLine);
const clock=new THREE.Clock();let elapsed=0,ended=false,roundSeconds=300,player,enemy;
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
 const state={name,root,rig,body,limbs,side,hp:100,stamina:100,energy:0,action:null,actionTime:0,actionDuration:0,guard:false,dodge:0,hitFlash:0,knock:0,move:V(),yaw:0,aiThink:0,lastHit:0,grounded:true,skin};
 return state}
player=fighter('PLAYER',-1,skinA,shortA,gloveA,hairA);enemy=fighter('CPU',1,skinB,shortB,gloveB,hairB);
function pose(f,t,moveSpeed,dt){animateFighter(f,t,moveSpeed,dt)}
function resize(){const w=mount.clientWidth,h=mount.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(mount);resize();
const keys=new Set();let moveVector=V();function setAction(f,type){if(ended||f.action||f.knock>0)return;const costs={jab:7,cross:10,hook:12,low:13,high:17,takedown:20};if(type==='guard'){f.guard=true;return}if(type==='dodge'){if(f.stamina>10){f.stamina-=10;f.dodge=.28}return}const cost=costs[type]||0;if(f.stamina<cost)return;f.stamina-=cost;f.action=type;f.actionTime=0;f.actionDuration=({jab:.42,cross:.56,hook:.62,low:.72,high:.82,takedown:.9})[type]||.5;f.energy=0;}
function releaseAction(f,type){if(type==='guard')f.guard=false}
function bindAction(btn){const a=btn.dataset.action;const down=e=>{e.preventDefault();setAction(player,a);btn.classList.add('active')};const up=e=>{e.preventDefault();releaseAction(player,a);btn.classList.remove('active')};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up)}
document.querySelectorAll('[data-action]').forEach(bindAction);
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();keys.add(k);if(e.repeat)return;const map={j:'jab',l:'cross',k:'hook',u:'low',i:'high',o:'takedown',' ':'guard',shift:'dodge'};if(map[k])setAction(player,map[k]);});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys.delete(k);if(k===' ')releaseAction(player,'guard')});
function distance(a,b){return a.root.position.distanceTo(b.root.position)}
function face(a,b){const dx=b.root.position.x-a.root.position.x;a.root.rotation.y=Math.atan2(dx,Math.abs(b.root.position.z-a.root.position.z)+.001)*(a.side<0?1:-1);a.root.rotation.y=a.side<0?Math.PI/2:-Math.PI/2;}
function applyHit(att,def,type){const d=distance(att,def);const reach=type==='low'||type==='high'?2.55:2.15;if(d>reach||d<.55)return false;const front=Math.abs(def.root.position.z-att.root.position.z)<1.6;if(def.guard&&type!=='low'&&front){def.stamina=Math.max(0,def.stamina-7);def.hp=Math.max(0,def.hp-(['jab','cross'].includes(type)?1.3:3));def.hitFlash=.08;return true}if(type==='takedown'){if(def.guard||def.action==='takedown'){att.stamina=Math.max(0,att.stamina-8);return true}def.hp=Math.max(0,def.hp-3.5);def.stamina=Math.max(0,def.stamina-18);def.knock=.85;def.root.position.x+=Math.sign(def.root.position.x-att.root.position.x)*.22;return true}const dmg={jab:5.2,cross:8.4,hook:9.5,low:7.5,high:10.5}[type]||4;def.hp=Math.max(0,def.hp-dmg);def.stamina=Math.max(0,def.stamina-(type==='low'?4:6));def.hitFlash=.16;def.knock=.12;def.root.position.x+=Math.sign(def.root.position.x-att.root.position.x)*.09;return true}
function tickFighter(f,dt){f.stamina=clamp(f.stamina+dt*(f.guard?2.4:7.5),0,100);f.hitFlash=Math.max(0,f.hitFlash-dt);f.knock=Math.max(0,f.knock-dt);f.dodge=Math.max(0,f.dodge-dt);if(f.action){f.actionTime+=dt;const p=f.actionTime/f.actionDuration;const active=p>.25&&p<.62;if(active&&!f.energy){if(f===player)applyHit(f,enemy,f.action);else if(f.action!=='takedown')applyHit(f,player,f.action);else{if(distance(f,player)<1.6&&!player.guard){player.knock=.35;player.stamina=Math.max(0,player.stamina-14)}}f.energy=1}if(p>=1){f.action=null;f.actionTime=0;f.energy=0}}}
function cpu(dt){if(ended||enemy.hp<=0)return;enemy.aiThink-=dt;if(enemy.aiThink<=0&&!enemy.action&&enemy.knock<=0){const d=distance(enemy,player);enemy.aiThink=.24+Math.random()*.28;if(d>2.05){enemy.move.set(-1,0,0)}else{enemy.move.set(0,0,0);const r=Math.random();if(player.action&&r<.28)enemy.guard=true;else if(r<.43)setAction(enemy,'jab');else if(r<.63)setAction(enemy,'cross');else if(r<.78)setAction(enemy,'low');else if(r<.9)setAction(enemy,'hook');else setAction(enemy,'takedown')}}if(distance(enemy,player)>2.1)enemy.guard=false;}
function updateUI(){for(const [prefix,f] of [['p',player],['e',enemy]]){document.getElementById(prefix+'-health').style.width=f.hp+'%';document.getElementById(prefix+'-stamina').style.width=f.stamina+'%';document.getElementById(prefix+'-hp').textContent=Math.ceil(f.hp);document.getElementById(prefix+'-st').textContent=Math.ceil(f.stamina)}}
function endFight(text){ended=true;const r=document.getElementById('result');r.classList.remove('hidden');r.innerHTML=text+'<br><small>Refresh the page to start a new bout.</small>';document.getElementById('status').textContent='BOUT COMPLETE'}
let lastUi=0;function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;if(!ended){roundSeconds-=dt;if(roundSeconds<=0)endFight(player.hp>enemy.hp?'PLAYER WINS ON POINTS':'CPU WINS ON POINTS');if(player.hp<=0)endFight('CPU WINS — TKO');if(enemy.hp<=0)endFight('PLAYER WINS — TKO');
 const x=(keys.has('d')?1:0)-(keys.has('a')?1:0),z=(keys.has('s')?1:0)-(keys.has('w')?1:0);const moving=Math.hypot(x,z)>0;const speed=player.guard?1.15:2.1;if(moving&&!player.action){player.root.position.x+=x*speed*dt;player.root.position.z+=z*speed*dt;player.root.position.x=clamp(player.root.position.x,-3.8,3.8);player.root.position.z=clamp(player.root.position.z,-3.4,3.4);player.move.set(x,0,z)}else player.move.set(0,0,0);
 cpu(dt);if(enemy.move.lengthSq()&&!enemy.action){enemy.root.position.x-=1.35*dt;enemy.root.position.x=Math.max(.7,enemy.root.position.x);enemy.move.set(-1,0,0)}else enemy.move.set(0,0,0);
 tickFighter(player,dt);tickFighter(enemy,dt);
 pose(player,elapsed,player.move.length(),dt);pose(enemy,elapsed,enemy.move.length(),dt);
 const d=distance(player,enemy);document.getElementById('status').textContent=d>2.3?'RANGE / FOOTWORK':player.action?'PLAYER ATTACK':enemy.action?'CPU ATTACK':'IN FIGHT';
 if(elapsed-lastUi>.1){updateUI();lastUi=elapsed}
 }
 const secs=Math.max(0,Math.ceil(roundSeconds));document.getElementById('clock').textContent=String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0');
 renderer.render(scene,camera)}
loop();updateUI();
