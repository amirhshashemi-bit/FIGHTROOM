// Original paired grappling choreography. Procedural animation, not motion-capture data.
export const GRAPPLE_SEQUENCE_SECONDS=Object.freeze({
 clinch:1.35,takedown:1.15,sprawl:.95,sweep:1.05,pass:1.1,mount:.9,
 'back-take':1.05,escape:1.0,'stand-up':1.2,submission:1.1,'defend-submission':.9,'ground-pound':.85,frame:.7
});
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const pulse=(t,a,b)=>smooth((t-a)/.12)*(1-smooth((t-b)/.12));
export function createGrapplePair(action,attacker,defender){
 const duration=GRAPPLE_SEQUENCE_SECONDS[action]||.9;
 const pair={action,attacker,defender,duration,time:0,progress:0,active:true};
 for(const [fighter,role] of [[attacker,'attacker'],[defender,'defender']])fighter.grapplePair=pair,fighter.grappleRole=role;
 return pair;
}
export function advanceGrapplePair(pair,dt){
 if(!pair?.active)return {done:true,progress:pair?.progress||1};
 pair.time=Math.min(pair.duration,pair.time+Math.max(0,Number(dt)||0));
 pair.progress=pair.duration?pair.time/pair.duration:1;
 if(pair.progress>=1){pair.active=false;for(const fighter of [pair.attacker,pair.defender]){if(fighter.grapplePair===pair){fighter.grapplePair=null;fighter.grappleRole=null}}}
 return {done:!pair.active,progress:pair.progress};
}
export function sampleGrapplePose(action,role,progress=0,time=0){
 const t=clamp(progress),att=role!=='defender';
 const p={lean:0,level:0,turn:0,left:0,right:0,kick:0,guard:0,rootPitch:0,roll:0,drive:0,spread:0};
 const wave=Math.sin(time*13),w2=Math.sin(time*8+.8);
 if(action==='clinch'){
  p.lean=.16;p.level=.04;p.left=.76+.09*wave;p.right=.76-.09*wave;p.turn=.04*wave;p.guard=.45;p.spread=.12;
 }else if(action==='takedown'){
  if(att){p.level=.34*(1-smooth((t-.68)/.25));p.lean=.56*(1-smooth((t-.68)/.28));p.left=.9;p.right=.95;p.drive=pulse(t,.24,.72);p.spread=.28}
  else{p.guard=.2+.45*pulse(t,.32,.68);p.level=.12+.55*pulse(t,.38,.78);p.rootPitch=.55*pulse(t,.4,.8);p.roll=.12*pulse(t,.42,.75);p.left=.72;p.right=.78;p.spread=.4}
 }else if(action==='sprawl'){
  if(att){p.level=.26;p.lean=.36;p.left=.94;p.right=.94;p.drive=.35;p.spread=.48}
  else{p.level=.32;p.lean=.48;p.left=.85;p.right=.85;p.rootPitch=.38*pulse(t,.35,.8);p.spread=.4}
 }else if(action==='sweep'){
  if(att){p.level=.62;p.lean=-.12;p.turn=.72*pulse(t,.18,.88);p.left=.92;p.right=.86;p.kick=.32*pulse(t,.25,.7);p.rootPitch=-.3;p.spread=.52}
  else{p.level=.42;p.lean=.2;p.left=.9;p.right=.7;p.turn=-.35*pulse(t,.2,.8);p.rootPitch=.25*pulse(t,.3,.8);p.spread=.4}
 }else if(action==='pass'){
  if(att){p.level=.28;p.lean=.38;p.turn=.42*pulse(t,.2,.85);p.left=.88;p.right=.76;p.drive=.32;p.spread=.35}
  else{p.level=.56;p.lean=-.12;p.left=.95;p.right=.9;p.guard=.9;p.turn=-.22*pulse(t,.2,.8);p.spread=.48}
 }else if(action==='mount'){
  if(att){p.level=.18;p.lean=.28;p.left=.8;p.right=.8;p.spread=.25;p.drive=.25}
  else{p.level=.62;p.lean=-.08;p.left=.95;p.right=.95;p.guard=1;p.spread=.48}
 }else if(action==='back-take'){
  if(att){p.level=.16;p.turn=.9*pulse(t,.12,.9);p.lean=.22;p.left=.82;p.right=.9;p.drive=.28}
  else{p.level=.5;p.turn=-.45*pulse(t,.15,.85);p.left=.9;p.right=.85;p.guard=.75}
 }else if(action==='escape'||action==='stand-up'){
  if(att){p.level=.58*(1-smooth((t-.58)/.4));p.rootPitch=-.3*(1-smooth((t-.55)/.4));p.left=.8;p.right=.85;p.drive=.2;p.spread=.35}
  else{p.level=.54*(1-smooth((t-.6)/.38));p.rootPitch=-.24*(1-smooth((t-.58)/.4));p.left=.75;p.right=.8;p.drive=.18}
 }else if(action==='ground-pound'){
  if(att){p.level=.18;p.lean=.3;p.left=.9;p.right=.9;p.drive=.2;p.spread=.2}
  else{p.level=.6;p.lean=-.08;p.left=.98;p.right=.98;p.guard=1;p.rootPitch=.08*Math.sin(time*18)}
 }else if(action==='submission'||action==='defend-submission'){
  if(att){p.level=.2;p.lean=.32;p.left=.95;p.right=.9;p.guard=.65;p.turn=.1*wave}
  else{p.level=.58;p.lean=-.1;p.left=.95;p.right=.95;p.guard=1;p.turn=.08*wave;p.rootPitch=.12*w2}
 }else if(action==='frame'){
  p.level=att?.45:.5;p.lean=att?-.12:.18;p.left=.95;p.right=.95;p.guard=1;p.spread=.3;
 }
 return p;
}
export function updateGrapplePair(pair,dt){
 const tick=advanceGrapplePair(pair,dt);
 for(const [fighter,role] of [[pair?.attacker,'attacker'],[pair?.defender,'defender']]){
  if(fighter&&pair?.active)fighter.grapplePose=sampleGrapplePose(pair.action,role,pair.progress,pair.time);
  else if(fighter)fighter.grapplePose=null;
 }
 return tick;
}
