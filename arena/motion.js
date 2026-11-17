// FIGHTROOM ARENA — phase-based procedural skeletal motion.
// This is original procedural animation, not motion-capture data.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
function phase(p,keys){
 if(p<=keys[0][0])return keys[0][1];
 for(let i=1;i<keys.length;i++)if(p<=keys[i][0]){const [a,av]=keys[i-1],[b,bv]=keys[i];return mix(av,bv,smooth((p-a)/(b-a)))}
 return keys[keys.length-1][1];
}
function shape(type,p){
 const h=phase(p,[[0,0],[.16,-.22],[.36,.35],[.49,1],[.61,.5],[.82,-.18],[1,0]]);
 const m={left:0,right:0,kick:0,lean:0,turn:0,level:0,guard:0};
 if(type==='jab'){m.left=h;m.lean=.06*h;m.turn=-.08*h}
 if(type==='cross'){m.right=h;m.lean=.16*h;m.turn=.24*h;m.level=-.025*h}
 if(type==='hook'){m.left=.72*h;m.right=.25*h;m.turn=.42*h;m.lean=.08*h}
 if(type==='low'){m.kick=.9*h;m.lean=-.09*h;m.level=-.08*h;m.turn=-.12*h}
 if(type==='high'){m.kick=1.16*h;m.lean=-.2*h;m.level=-.04*h;m.turn=-.1*h}
 if(type==='takedown'){m.left=.58*h;m.right=.58*h;m.lean=.48*h;m.level=-.24*h}
 return m;
}
function segment(mesh,a,b,dt){
 const d=b.clone().sub(a),q=new THREE.Quaternion().setFromUnitVectors(V(0,1,0),d.clone().normalize());
 const gp=mesh.geometry.parameters||{},base=(gp.length||.3)+2*(gp.radius||.07),k=1-Math.exp(-dt*25);
 mesh.position.lerp(a.clone().add(b).multiplyScalar(.5),k);mesh.quaternion.slerp(q,k);
 mesh.scale.y=mix(mesh.scale.y,d.length()/Math.max(.01,base),k);
}
function point(mesh,target,dt){mesh.position.lerp(target,1-Math.exp(-dt*23))}
export function animateFighter(f,t,moveSpeed,dt){
 const p=f.action?clamp(f.actionTime/Math.max(.01,f.actionDuration),0,1):0;
 const m=f.action?shape(f.action,p):{left:0,right:0,kick:0,lean:0,turn:0,level:0};
 if(f.profile?.stance==='Southpaw'){const lead=m.left;m.left=m.right;m.right=lead;}
 const locomotion=clamp(moveSpeed/2.2,0,1),cycle=t*8.6+f.side,stride=locomotion*Math.sin(cycle);
 const bob=Math.sin(t*2.7+f.side)*.012+Math.abs(Math.sin(cycle))*.018*locomotion;
 const guard=f.guard?1:0,hit=f.hitFlash>0?Math.sin(clamp(f.hitFlash/.16,0,1)*Math.PI)*.18:0;
 const dodge=f.dodge>0?Math.sin(clamp(f.dodge/.28,0,1)*Math.PI)*.32:0,grounded=['top-control','bottom-guard','side-control','mount','back-control','submission','ground-and-pound'].includes(f.groundState),down=f.knock>0||grounded?1:0;
 const torsoY=1.25+bob-m.level-down*.38,torsoZ=m.lean+hit-down*.18-dodge*.45;
 const b=f.body,l=f.limbs;
 point(b.torso,V(0,torsoY,torsoZ),dt);point(b.pelvis,V(0,.91+bob-m.level*.45,down*.12),dt);
 point(b.neck,V(0,1.52+bob-m.level*.6,torsoZ*.55),dt);
 point(b.head,V(0,1.7+bob-m.level*.7,torsoZ*.8+hit*.55),dt);
 point(b.hair,V(0,1.79+bob-m.level*.7,torsoZ*.8+hit*.55-.015),dt);
 point(b.shorts,V(0,.94+bob-m.level*.45,down*.12),dt);
 b.torso.rotation.y=m.turn+stride*.035;b.torso.rotation.z=torsoZ*.2;b.torso.rotation.x=down?-.65:m.kick*.12;
 f.rig.position.y=mix(0,-.32,down);f.rig.rotation.x=mix(0,-.34,down);f.rig.rotation.z=grounded?(f.groundState==='bottom-guard'?.18:-.18):0;
 const arm=side=>{
  const left=side==='L',sgn=left?-1:1,ext=left?m.left:m.right;
  const shoulder=V(sgn*.28,1.42+bob-m.level*.5,torsoZ*.35);
  const elbow=V(sgn*(.39+ext*.12),1.29+bob+guard*.13,.12+ext*.27+guard*.12);
  const wrist=V(sgn*(.33+ext*.2),1.28+bob+guard*.27,.34+ext*.52+guard*.12);
  if(down){elbow.y=.82;wrist.y=.9;wrist.z=.12}
  segment(l['upperArm'+side],shoulder,elbow,dt);segment(l['foreArm'+side],elbow,wrist,dt);
  point(l['glove'+side],wrist.clone().add(V(0,0,.055)),dt);
 };
 arm('L');arm('R');
 const leg=side=>{
  const left=side==='L',sgn=left?-1:1,kick=left?0:m.kick,step=left?stride:-stride;
  const hip=V(sgn*.14,.88+bob-m.level*.25,0);
  const knee=V(sgn*(.17+kick*.14),.49+bob-kick*.12+Math.max(0,step)*.06,.03+kick*.36+step*.055);
  const ankle=V(sgn*(.18+kick*.27),.11+bob+kick*.34+Math.max(0,step)*.08,.12+kick*.83+step*.12);
  if(down){knee.y=.25;ankle.y=.08}
  segment(l['thigh'+side],hip,knee,dt);segment(l['shin'+side],knee,ankle,dt);
  point(l['foot'+side],ankle.clone().add(V(0,-.025,.11)),dt);
  l['foot'+side].rotation.x=-kick*.82+step*.12;l['foot'+side].rotation.y=step*.08;
 };
 leg('L');leg('R');
 if(guard)b.head.position.y-=.025*(1-Math.exp(-dt*18));
}
