// Paired fighter staging for clinch and ground exchanges.
// Coordinates are intentionally deterministic so browser QA can verify spacing.
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const GROUNDED=new Set(['takedown','top-control','bottom-guard','side-control','mount','back-control','submission','ground-and-pound','stand-up']);
export function resolveGroundPair(a,b){
 if(!a||!b)return null;
 const as=a.groundState||'standing',bs=b.groundState||'standing';
 if(as==='standing'&&bs==='standing')return null;
 const centerX=((a.x||0)+(b.x||0))*.5,centerZ=((a.z||0)+(b.z||0))*.5;
 if(as==='clinch'&&bs==='clinch')return {
  a:{x:centerX-.34,z:centerZ,yaw:a.side<0?Math.PI/2:-Math.PI/2},
  b:{x:centerX+.34,z:centerZ,yaw:b.side<0?Math.PI/2:-Math.PI/2},
  phase:'clinch'
 };
 const aTop=['top-control','side-control','mount','back-control','ground-and-pound','submission'].includes(as);
 const bTop=['top-control','side-control','mount','back-control','ground-and-pound','submission'].includes(bs);
 if(!GROUNDED.has(as)&&!GROUNDED.has(bs))return null;
 const aIsTop=aTop&&!bTop?true:bTop&&!aTop?false:(a.side< b.side);
 const top=aIsTop?a:b,bottom=aIsTop?b:a;
 const left=top.side<0;
 const topX=clamp(centerX+(left?-.24:.24),-3.6,3.6);
 const bottomX=clamp(centerX+(left?.24:-.24),-3.6,3.6);
 return {
  a:aIsTop?{x:topX,z:centerZ-.18,yaw:top.side<0?Math.PI/2:-Math.PI/2}:{x:bottomX,z:centerZ+.18,yaw:bottom.side<0?Math.PI/2:-Math.PI/2},
  b:aIsTop?{x:bottomX,z:centerZ+.18,yaw:bottom.side<0?Math.PI/2:-Math.PI/2}:{x:topX,z:centerZ-.18,yaw:top.side<0?Math.PI/2:-Math.PI/2},
  phase:'ground',topSide:top.side
 };
}
export function stepGroundPair(a,b,dt){
 const target=resolveGroundPair(a,b);if(!target)return false;
 const alpha=1-Math.exp(-Math.max(0,dt)*12);
 for(const [fighter,pose] of [[a,target.a],[b,target.b]]){
  fighter.root.position.x+=(pose.x-fighter.root.position.x)*alpha;
  fighter.root.position.z+=(pose.z-fighter.root.position.z)*alpha;
  const delta=Math.atan2(Math.sin(pose.yaw-fighter.root.rotation.y),Math.cos(pose.yaw-fighter.root.rotation.y));
  fighter.root.rotation.y+=delta*alpha;
 }
 return target.phase;
}
