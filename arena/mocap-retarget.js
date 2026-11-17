const ALIASES={
 hips:['hips','hip','pelvis','root'],
 spine:['spine','spine1','spine01','spine2','spine02','chest'],
 neck:['neck'],
 head:['head'],
 leftShoulder:['leftshoulder','shoulderl'],rightShoulder:['rightshoulder','shoulderr'],
 leftUpperArm:['leftarm','leftupperarm','upperarml'],rightUpperArm:['rightarm','rightupperarm','upperarmr'],
 leftForeArm:['leftforearm','leftlowerarm','forearml'],rightForeArm:['rightforearm','rightlowerarm','forearmr'],
 leftHand:['lefthand','handl'],rightHand:['righthand','handr'],
 leftUpLeg:['leftupleg','leftthigh','thighl'],rightUpLeg:['rightupleg','rightthigh','thighr'],
 leftLeg:['leftleg','leftcalf','lowerlegl'],rightLeg:['rightleg','rightcalf','lowerlegr'],
 leftFoot:['leftfoot','footl'],rightFoot:['rightfoot','footr']
};
const clean=s=>String(s||'').toLowerCase().replace(/mixamorig[:_]?/g,'').replace(/[^a-z0-9]/g,'');
export function semanticBone(name){
 const n=clean(name);
 for(const [semantic,names] of Object.entries(ALIASES))if(names.some(alias=>clean(alias)===n))return semantic;
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
export function buildRetargetNameMap(targetNames,sourceNames){
 const sourceBySemantic=new Map();
 for(const name of sourceNames){const semantic=semanticBone(name);if(semantic&&!sourceBySemantic.has(semantic))sourceBySemantic.set(semantic,name)}
 const names={};
 for(const targetName of targetNames){const semantic=semanticBone(targetName),sourceName=semantic&&sourceBySemantic.get(semantic);if(sourceName)names[targetName]=sourceName}
 return names;
}
export function validateRetargetMap(nameMap){
 const values=Object.values(nameMap||{}),semantics=Object.keys(nameMap||{}).map(semanticBone);
 const unique=new Set(semantics.filter(Boolean));
 return {compatible:unique.has('hips')&&unique.has('head')&&unique.size>=7,mappedCount:values.length,semantics:[...unique]};
}
