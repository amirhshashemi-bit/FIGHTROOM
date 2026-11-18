// Shared-frame two-actor motion package validation and synchronized sampling.
// No capture assets are bundled by this module; it validates licensed inputs before use.
const ROOT_ALIASES=new Set(['root','hips','pelvis','hip','mixamorighips']);
const finiteVec3=v=>Array.isArray(v)&&v.length>=3&&v.slice(0,3).every(Number.isFinite);
const normalizeName=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
function actorRoot(actor){
 if(!actor||typeof actor!=='object')return null;
 const key=Object.keys(actor).find(k=>ROOT_ALIASES.has(normalizeName(k)));
 return key?actor[key]:null;
}
function validateActor(actor,label,expectedNames){
 if(!actor||typeof actor!=='object'||Array.isArray(actor))return {error:label+'-missing'};
 const names=Object.keys(actor);
 if(!names.length)return {error:label+'-empty'};
 for(const name of names)if(!finiteVec3(actor[name]))return {error:label+'-invalid-joint:'+name};
 const root=actorRoot(actor);
 if(!finiteVec3(root))return {error:label+'-root-missing'};
 if(expectedNames&& (names.length!==expectedNames.size||names.some(n=>!expectedNames.has(n))))return {error:label+'-skeleton-changed'};
 return {names:new Set(names),root:root.slice(0,3)};
}
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const lerp=(a,b,t)=>a+(b-a)*t;
function sampleActor(a,b,t){
 const out={};
 for(const k of Object.keys(a))out[k]=[0,1,2].map(i=>lerp(a[k][i],b[k][i],t));
 return out;
}
export function validatePairedMotionPackage(pkg={}){
 const errors=[];
 const fps=Number(pkg.fps),frames=pkg.frames;
 if(!Number.isFinite(fps)||fps<1||fps>240)errors.push('invalid-fps');
 if(pkg.coordinateSpace!=='shared-world')errors.push('shared-world-coordinate-space-required');
 if(!Array.isArray(frames)||frames.length<2)errors.push('at-least-two-frames-required');
 if(Array.isArray(frames)&&Number.isInteger(pkg.frameCount)&&pkg.frameCount!==frames.length)errors.push('frame-count-mismatch');
 let namesA=null,namesB=null,firstDistance=null,lastDistance=null;
 if(Array.isArray(frames)&&frames.length>=2){
  for(let i=0;i<frames.length;i++){
   const frame=frames[i];
   const a=validateActor(frame?.subject_1,'subject-1',namesA);
   const b=validateActor(frame?.subject_2,'subject-2',namesB);
   if(a.error)errors.push('frame-'+i+':'+a.error);
   if(b.error)errors.push('frame-'+i+':'+b.error);
   if(!a.error&&!b.error){
    namesA??=a.names;namesB??=b.names;
    const d=distance(a.root,b.root);
    if(i===0)firstDistance=d;
    if(i===frames.length-1)lastDistance=d;
   }
  }
 }
 return {ok:errors.length===0,errors,frameCount:Array.isArray(frames)?frames.length:0,fps:Number.isFinite(fps)?fps:null,
  durationSeconds:Array.isArray(frames)&&fps>0?(frames.length-1)/fps:null,
  jointCounts:{subject_1:namesA?.size??0,subject_2:namesB?.size??0},
  relativeRootDistance:{start:firstDistance,end:lastDistance}};
}
export function samplePairedMotion(pkg,timeSeconds){
 const check=validatePairedMotionPackage(pkg);
 if(!check.ok)return {ok:false,errors:check.errors};
 const frames=pkg.frames,at=Math.max(0,Math.min(frames.length-1,Math.max(0,Number(timeSeconds)||0)*pkg.fps));
 const i=Math.floor(at),j=Math.min(frames.length-1,i+1),t=at-i;
 const a=sampleActor(frames[i].subject_1,frames[j].subject_1,t);
 const b=sampleActor(frames[i].subject_2,frames[j].subject_2,t);
 const rootA=actorRoot(a),rootB=actorRoot(b);
 return {ok:true,framePosition:at,subject_1:a,subject_2:b,relativeRoot:{
  x:rootB[0]-rootA[0],y:rootB[1]-rootA[1],z:rootB[2]-rootA[2],distance:distance(rootA,rootB)}};
}
