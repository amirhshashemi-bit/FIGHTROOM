// Ground grappling state machine. It resolves legal transitions, not full physics.
export const GROUND_STATES=Object.freeze(['standing','clinch','takedown','top-control','bottom-guard','side-control','mount','back-control','submission','ground-and-pound','stand-up']);
const EDGES={
 standing:['clinch','takedown'],clinch:['standing','takedown'],takedown:['top-control','bottom-guard','standing'],
 'top-control':['side-control','mount','back-control','ground-and-pound','stand-up','submission'],
 'bottom-guard':['top-control','submission','stand-up'],'side-control':['mount','back-control','top-control','submission','stand-up'],
 mount:['ground-and-pound','submission','top-control','stand-up'],'back-control':['submission','top-control','stand-up'],
 submission:['top-control','bottom-guard','standing'],'ground-and-pound':['top-control','bottom-guard','submission','stand-up'],'stand-up':['standing','clinch']
};
export function transitionGround(state,next,{stamina=100,defending=false}={}){
 if(!GROUND_STATES.includes(state)||!GROUND_STATES.includes(next))return {ok:false,reason:'invalid-state'};
 if(!EDGES[state].includes(next))return {ok:false,reason:'illegal-transition'};
 if(stamina<8)return {ok:false,reason:'exhausted'};
 if(defending&&next==='submission')return {ok:false,reason:'submission-defended'};
 return {ok:true,state:next,staminaCost:next==='submission'?18:next==='takedown'?14:next==='stand-up'?10:6};
}
export function submissionProgress({control=0,defenderEscape=0,attackerStamina=100,defenderStamina=100}){
 const delta=(control*.7+attackerStamina*.003-defenderEscape*.8-defenderStamina*.002);
 return Math.max(0,Math.min(100,delta));
}
