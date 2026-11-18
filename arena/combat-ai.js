// Deterministic lightweight opponent decision policy. No random global state.
export function chooseCpuAction({distance,playerAttacking,playerGuarding,stamina=100,wrestling=70,seed=1}){
 const roll=((Math.imul((seed>>>0)||1,1664525)+1013904223)>>>0)/4294967296;
 if(stamina<12)return {action:'guard',move:0,reason:'recover'};
 if(distance>2.35)return {action:'approach',move:-1,reason:'close-distance'};
 if(distance<.62)return {action:'retreat',move:1,reason:'create-space'};
 if(playerAttacking&&distance<2.1&&roll<.62)return {action:'guard',move:0,reason:'defend-attack'};
 if(playerGuarding&&roll<.36)return {action:'low',move:0,reason:'attack-open-leg'};
 if(distance<1.45&&wrestling>=88&&roll<.22)return {action:'takedown',move:0,reason:'wrestling-entry'};
 if(roll<.25)return {action:'jab',move:0,reason:'probe'};
 if(roll<.47)return {action:'cross',move:0,reason:'straight-combination'};
 if(roll<.66)return {action:'low',move:0,reason:'leg-attack'};
 if(roll<.83)return {action:'hook',move:0,reason:'close-range'};
 return {action:'high',move:0,reason:'power-attack'};
}
