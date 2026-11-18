// Deterministic grappling resolver. This is gameplay logic, not a physics solver.
export const GROUND_STATES = Object.freeze(['standing','clinch','takedown','top-control','bottom-guard','side-control','mount','back-control','submission','ground-and-pound','stand-up']);
export const GRAPPLE_ACTIONS = Object.freeze({
  clinch:{premium:true,cost:7}, takedown:{premium:true,cost:16},
  sprawl:{premium:false,cost:5}, frame:{premium:false,cost:4}, escape:{premium:false,cost:8},
  sweep:{premium:true,cost:12}, pass:{premium:true,cost:10}, mount:{premium:true,cost:9},
  'back-take':{premium:true,cost:11}, 'ground-pound':{premium:true,cost:12},
  submission:{premium:true,cost:18}, 'defend-submission':{premium:false,cost:7},
  'stand-up':{premium:false,cost:6}
});
const EDGES = {
 standing:['clinch','takedown'],clinch:['standing','takedown'],takedown:['top-control','bottom-guard','standing'],
 'top-control':['side-control','mount','back-control','ground-and-pound','stand-up','submission'],
 'bottom-guard':['top-control','submission','stand-up'],'side-control':['mount','back-control','top-control','submission','stand-up'],
 mount:['ground-and-pound','submission','top-control','stand-up','back-control'],
 'back-control':['submission','top-control','stand-up'],submission:['top-control','bottom-guard','standing'],
 'ground-and-pound':['top-control','bottom-guard','submission','stand-up'],'stand-up':['standing','clinch']
};
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export function transitionGround(state,next,{stamina=100,defending=false}={}) {
 if(!GROUND_STATES.includes(state)||!GROUND_STATES.includes(next))return {ok:false,reason:'invalid-state'};
 if(!EDGES[state]?.includes(next))return {ok:false,reason:'illegal-transition'};
 if(stamina<8)return {ok:false,reason:'exhausted'};
 if(defending&&next==='submission')return {ok:false,reason:'submission-defended'};
 return {ok:true,state:next,staminaCost:next==='submission'?18:next==='takedown'?16:next==='stand-up'?6:7};
}
export function resolveGrappleAction({action,attackerState='standing',defenderState='standing',attackerStamina=100,defenderStamina=100,attackerSkill=50,defenderSkill=50,premium=false,defending=false}={}) {
 const spec=GRAPPLE_ACTIONS[action];
 if(!spec)return {ok:false,reason:'unknown-action'};
 if(spec.premium&&!premium)return {ok:false,reason:'premium-required',premiumRequired:true};
 if(!GROUND_STATES.includes(attackerState)||!GROUND_STATES.includes(defenderState))return {ok:false,reason:'invalid-state'};
 if(attackerStamina<spec.cost)return {ok:false,reason:'exhausted'};
 let a=attackerState,d=defenderState,defenderCost=0;
 const success=attackerSkill-defenderSkill>=-24;
 if(action==='clinch') {
  if(a!=='standing'||d!=='standing')return {ok:false,reason:'wrong-position'};
  a=d='clinch';
 } else if(action==='takedown') {
  if(a!=='clinch'||d!=='clinch')return {ok:false,reason:'wrong-position'};
  if(!success)return {ok:false,reason:'takedown-defended',attackerState:a,defenderState:d,attackerStamina:clamp(attackerStamina-spec.cost*.45,0,100),defenderStamina:clamp(defenderStamina-5,0,100),staminaCost:spec.cost*.45,defenderCost:5};
  a='top-control';d='bottom-guard';defenderCost=8;
 } else if(action==='sprawl') {
  if(!['standing','clinch'].includes(a)||d!=='clinch')return {ok:false,reason:'wrong-position'};
  a=d='standing';defenderCost=4;
 } else if(action==='frame') {
  if(!['bottom-guard','side-control','mount','back-control','submission','ground-and-pound'].includes(a))return {ok:false,reason:'wrong-position'};
 } else if(action==='escape'||action==='stand-up') {
  if(a==='standing')return {ok:false,reason:'already-standing'};
  if(action==='escape'&&a==='submission'&&!success)return {ok:false,reason:'escape-denied',attackerStamina:clamp(attackerStamina-spec.cost,0,100),defenderStamina,staminaCost:spec.cost};
  a=d='standing';
 } else if(action==='sweep') {
  if(a!=='bottom-guard'||d!=='top-control')return {ok:false,reason:'wrong-position'};
  if(!success)return {ok:false,reason:'sweep-defended',attackerStamina:clamp(attackerStamina-spec.cost,0,100),defenderStamina,staminaCost:spec.cost};
  a='top-control';d='bottom-guard';defenderCost=6;
 } else if(action==='pass') {
  if(a!=='top-control'||d!=='bottom-guard')return {ok:false,reason:'wrong-position'};
  a='side-control';
 } else if(action==='mount') {
  if(a!=='side-control'||d!=='bottom-guard')return {ok:false,reason:'wrong-position'};
  a='mount';
 } else if(action==='back-take') {
  if(!['side-control','mount'].includes(a))return {ok:false,reason:'wrong-position'};
  a='back-control';
 } else if(action==='ground-pound') {
  if(!['top-control','mount'].includes(a)||d!=='bottom-guard')return {ok:false,reason:'wrong-position'};
  a='ground-and-pound';
 } else if(action==='submission') {
  if(!['top-control','side-control','mount','back-control'].includes(a))return {ok:false,reason:'wrong-position'};
  if(defending)return {ok:false,reason:'submission-defended'};
  a='submission';
 } else if(action==='defend-submission') {
  if(d!=='submission'&&a!=='submission')return {ok:false,reason:'wrong-position'};
  a=d='standing';
 }
 return {ok:true,action,attackerState:a,defenderState:d,attackerStamina:clamp(attackerStamina-spec.cost,0,100),defenderStamina:clamp(defenderStamina-defenderCost,0,100),staminaCost:spec.cost,defenderCost,premiumRequired:spec.premium};
}
export function submissionProgress({control=0,defenderEscape=0,attackerStamina=100,defenderStamina=100}={}) {
 return clamp(control*.7+attackerStamina*.003-defenderEscape*.8-defenderStamina*.002,0,100);
}
