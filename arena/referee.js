// Round clock, scorecards and stoppage helpers; no automated medical diagnosis.
export function createBout({rounds=3,roundSeconds=300,restSeconds=60}={}){return {round:1,rounds,roundSeconds,remaining:roundSeconds,restSeconds,phase:'fight',scores:[0,0],warnings:[0,0],fouls:[0,0]}}
export function tickBout(bout,dt){if(bout.phase!=='fight')return {...bout};const remaining=Math.max(0,bout.remaining-dt);if(remaining>0)return {...bout,remaining};if(bout.round>=bout.rounds)return {...bout,remaining:0,phase:'decision'};return {...bout,remaining:bout.restSeconds,phase:'between-rounds'}}
export function nextRound(bout){if(bout.phase!=='between-rounds')return {...bout};return {...bout,round:bout.round+1,remaining:bout.roundSeconds,phase:'fight'}}
export function scoreRound({cleanStrikes=0,knockdowns=0,controlSeconds=0,submissionThreats=0}){const a=cleanStrikes*1+knockdowns*8+controlSeconds*.015+submissionThreats*2;return a>=10?10:9}
export function recordFoul(bout,corner){const i=corner==='red'?0:1,fouls=[...bout.fouls],warnings=[...bout.warnings];fouls[i]++;if(fouls[i]===1)warnings[i]++;return {...bout,fouls,warnings}}
export function stoppage({health=100,refereeIntervention=false,cornerStop=false}){return cornerStop?'corner-stoppage':refereeIntervention?'referee-stoppage':health<=0?'ko-tko':null}
