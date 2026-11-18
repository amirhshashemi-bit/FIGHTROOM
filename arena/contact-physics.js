// Lightweight deterministic contact response for the browser prototype.
// Gameplay collision helper; not a full rigid-body solver.
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export function resolveBodyContact({a,b,radiusA=.39,radiusB=.39,massA=75,massB=75,correction=.82,slop=.002}={}){
 if(!a||!b)return {hit:false,a,b,penetration:0};
 let dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
 const min=Math.max(0,radiusA)+Math.max(0,radiusB);
 if(d>=min)return {hit:false,a:{...a},b:{...b},penetration:0};
 if(d<1e-8){dx=1;dz=0;d=1}
 const nx=dx/d,nz=dz/d,penetration=min-d;
 const ia=1/Math.max(1,massA),ib=1/Math.max(1,massB),sum=ia+ib;
 const push=Math.max(0,penetration-slop)*clamp(correction,0,1)/sum;
 return {hit:true,penetration,normal:{x:nx,z:nz},a:{x:a.x-nx*push*ia,z:a.z-nz*push*ia},b:{x:b.x+nx*push*ib,z:b.z+nz*push*ib}};
}
export function resolveImpactImpulse({attacker,defender,damage=0,defenderMassKg=75,guarded=false}={}){
 if(!attacker||!defender)return {x:0,z:0,speed:0};
 let dx=defender.x-attacker.x,dz=defender.z-attacker.z,d=Math.hypot(dx,dz);
 if(d<1e-8){dx=1;dz=0}else{dx/=d;dz/=d}
 const mass=clamp(Number(defenderMassKg)||75,35,180),mitigation=guarded ? 0.22 : 1;
 const speed=clamp(Math.max(0,Number(damage)||0)*.035*(75/mass)*mitigation,0,.72);
 return {x:dx*speed,z:dz*speed,speed};
}
