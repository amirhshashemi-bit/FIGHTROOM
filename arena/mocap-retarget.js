const ALIASES={
 hips:['hips','hip','pelvis','root'],
 spine:['spine','spine1','spine01','spine02','spine03','spine04','spine05','abdomen','chest'],
 neck:['neck'],head:['head'],
 leftShoulder:['leftshoulder','shoulderl','leftclavicle','claviclel','upperarm01l','shoulder01l'],
 rightShoulder:['rightshoulder','shoulderr','rightclavicle','clavicler','upperarm01r','shoulder01r'],
 leftUpperArm:['leftarm','leftupperarm','upperarml','upperarm02l','lshldr'],
 rightUpperArm:['rightarm','rightupperarm','upperarmr','upperarm02r','rshldr'],
 leftForeArm:['leftforearm','leftlowerarm','forearml','leftelbow','lowerarm01l','lforearm'],
 rightForeArm:['rightforearm','rightlowerarm','forearmr','rightelbow','lowerarm01r','rforearm'],
 leftHand:['lefthand','handl','leftwrist','wristl','lowerarm02l','lhand'],
 rightHand:['righthand','handr','rightwrist','wristr','lowerarm02r','rhand'],
 leftUpLeg:['leftupleg','leftthigh','thighl','lefthip','upperleg01l','upperleg02l','pelvisl','lthigh'],
 rightUpLeg:['rightupleg','rightthigh','thighr','righthip','upperleg01r','upperleg02r','pelvisr','rthigh'],
 leftLeg:['leftleg','leftcalf','lowerlegl','leftknee','lowerleg01l','lowerleg02l','lshin'],
 rightLeg:['rightleg','rightcalf','lowerlegr','rightknee','lowerleg01r','lowerleg02r','rshin'],
 leftFoot:['leftfoot','footl','leftankle','lfoot'],rightFoot:['rightfoot','footr','rightankle','rfoot']
};
const clean=s=>String(s||'').toLowerCase().replace(/mixamorig[:_]?/g,'').replace(/[^a-z0-9]/g,'');
export function semanticBone(name){
 const n=clean(name);
 if(['hips','hip','root','pelvis'].includes(n))return 'hips';
 if(['abdomen','chest','spine','spine1','spine2','spine3','spine4','spine5','spine01','spine02','spine03','spine04','spine05'].includes(n))return 'spine';
 for(const [semantic,names] of Object.entries(ALIASES))if(names.some(alias=>clean(alias)===n))return semantic;
 if(/^l(coll(ar|arbone)|clavicle)$/.test(n))return 'leftShoulder';
 if(/^r(coll(ar|arbone)|clavicle)$/.test(n))return 'rightShoulder';
 if(/^l(shldr|shoulder)$/.test(n))return 'leftUpperArm';
 if(/^r(shldr|shoulder)$/.test(n))return 'rightUpperArm';
 if(/^lforearm$/.test(n))return 'leftForeArm';
 if(/^rforearm$/.test(n))return 'rightForeArm';
 if(/^lhand$/.test(n))return 'leftHand';
 if(/^rhand$/.test(n))return 'rightHand';
 if(/^lthigh$/.test(n))return 'leftUpLeg';
 if(/^rthigh$/.test(n))return 'rightUpLeg';
 if(/^lshin$/.test(n))return 'leftLeg';
 if(/^rshin$/.test(n))return 'rightLeg';
 if(/^lfoot$/.test(n))return 'leftFoot';
 if(/^rfoot$/.test(n))return 'rightFoot';
 if(/left.*(upperarm|arm)$/.test(n))return 'leftUpperArm';
 if(/right.*(upperarm|arm)$/.test(n))return 'rightUpperArm';
 if(/left.*(forearm|lowerarm)$/.test(n))return 'leftForeArm';
 if(/right.*(forearm|lowerarm)$/.test(n))return 'rightForeArm';
 if(/left.*(upleg|thigh)$/.test(n))return 'leftUpLeg';
 if(/right.*(upleg|thigh)$/.test(n))return 'rightUpLeg';
 if(/left.*(calf|lowerleg)$/.test(n))return 'leftLeg';
 if(/right.*(calf|lowerleg)$/.test(n))return 'rightLeg';
 return null;
}
function preferredSource(targetName,semantic,sourceBySemantic){
 const n=clean(targetName);
 if(semantic==='spine'){
  if(/spine0?[2-5]/.test(n))return sourceBySemantic.get('spine:upper')||sourceBySemantic.get('spine');
  return sourceBySemantic.get('spine:lower')||sourceBySemantic.get('spine');
 }
 if(semantic==='leftShoulder')return sourceBySemantic.get('leftShoulder')||sourceBySemantic.get('leftUpperArm');
 if(semantic==='rightShoulder')return sourceBySemantic.get('rightShoulder')||sourceBySemantic.get('rightUpperArm');
 return sourceBySemantic.get(semantic);
}
export function buildRetargetNameMap(targetNames,sourceNames){
 const sourceBySemantic=new Map();
 const hasDedicatedPelvis=(targetNames||[]).some(name=>clean(name)==='pelvis');
 for(const name of sourceNames){
  const semantic=semanticBone(name);
  if(!semantic)continue;
  if(semantic==='spine'){
   const n=clean(name);
   const key=(n==='chest'||n==='spine2'||n==='spine02'||n==='spine03'||n==='spine04'||n==='spine05')?'spine:upper':'spine:lower';
   if(!sourceBySemantic.has(key))sourceBySemantic.set(key,name);
   if(!sourceBySemantic.has('spine'))sourceBySemantic.set('spine',name);
  }else if(!sourceBySemantic.has(semantic))sourceBySemantic.set(semantic,name);
 }
 const names={};
 for(const targetName of targetNames){
  if(hasDedicatedPelvis&&clean(targetName)==='root')continue;
  const semantic=semanticBone(targetName),sourceName=semantic&&preferredSource(targetName,semantic,sourceBySemantic);
  if(sourceName)names[targetName]=sourceName;
 }
 return names;
}
export function validateRetargetMap(nameMap){
 const semantics=Object.keys(nameMap||{}).map(semanticBone),unique=new Set(semantics.filter(Boolean));
 const core=[['hips'],['head'],['leftUpperArm','leftShoulder'],['rightUpperArm','rightShoulder'],['leftUpLeg'],['rightUpLeg']];
 const mappedCore=core.filter(group=>group.some(s=>unique.has(s))).length;
 return {compatible:unique.has('hips')&&unique.has('head')&&mappedCore>=5&&unique.size>=7,mappedCount:Object.keys(nameMap||{}).length,semantics:[...unique],mappedCore};
}
