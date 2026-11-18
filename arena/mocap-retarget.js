const ALIASES={
 hips:['hips','hip','pelvis','root'],
 spine:['spine','spine1','spine01','spine2','spine02','chest'],
 neck:['neck'],
 head:['head'],
 leftShoulder:['leftshoulder','shoulderl'],rightShoulder:['rightshoulder','shoulderr'],
 leftUpperArm:['leftarm','leftupperarm','upperarml','leftshoulder','upperarm01l','upperarm02l'],rightUpperArm:['rightarm','rightupperarm','upperarmr','rightshoulder','upperarm01r','upperarm02r'],
 leftForeArm:['leftforearm','leftlowerarm','forearml','leftelbow','lowerarm01l','lowerarm02l'],rightForeArm:['rightforearm','rightlowerarm','forearmr','rightelbow','lowerarm01r','lowerarm02r'],
 leftHand:['lefthand','handl','leftwrist'],rightHand:['righthand','handr','rightwrist'],
 leftUpLeg:['leftupleg','leftthigh','thighl','lefthip','upperleg01l','upperleg02l'],rightUpLeg:['rightupleg','rightthigh','thighr','righthip','upperleg01r','upperleg02r'],
 leftLeg:['leftleg','leftcalf','lowerlegl','leftknee','lowerleg01l','lowerleg02l'],rightLeg:['rightleg','rightcalf','lowerlegr','rightknee','lowerleg01r','lowerleg02r'],
 leftFoot:['leftfoot','footl','leftankle'],rightFoot:['rightfoot','footr','rightankle']
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
