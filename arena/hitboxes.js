// Deterministic target volumes in fighter-local coordinates (metres).
export const HURTBOXES = Object.freeze({
  head:{center:[0,1.70,0],radius:.22,zone:'head'},
  torso:{center:[0,1.20,0],radius:.34,zone:'body'},
  pelvis:{center:[0,.91,0],radius:.27,zone:'body'},
  legs:{center:[0,.47,0],radius:.38,zone:'leg'}
});
export function sphereOverlap(a,b){const dx=a[0]-b[0],dy=a[1]-b[1],dz=a[2]-b[2];return dx*dx+dy*dy+dz*dz <= (a[3]+b[3])**2}
export function classifyContact({attacker,defender,attackPoint,attackRadius=.12,front=true,evading=false}){
 if(!front||evading)return {hit:false,reason:evading?'evaded':'not-facing',zone:null};
 for(const [part,h] of Object.entries(HURTBOXES)){
  const c=[defender[0]+h.center[0],defender[1]+h.center[1],defender[2]+h.center[2],h.radius];
  if(sphereOverlap([attackPoint[0],attackPoint[1],attackPoint[2],attackRadius],c))return {hit:true,part,zone:h.zone};
 }
 return {hit:false,reason:'no-contact',zone:null};
}
