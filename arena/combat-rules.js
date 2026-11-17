// Deterministic MMA strike rules. Kept separate from rendering for testability.
export const MOVES={
 jab:{cost:6,duration:.40,active:[.30,.52],reach:2.05,damage:4.8,stun:.10,knockback:.07,zone:'head'},
 cross:{cost:9,duration:.52,active:[.34,.57],reach:2.18,damage:7.6,stun:.16,knockback:.12,zone:'head'},
 hook:{cost:11,duration:.59,active:[.36,.60],reach:1.92,damage:8.5,stun:.19,knockback:.10,zone:'head'},
 low:{cost:12,duration:.68,active:[.39,.64],reach:2.22,damage:6.8,stun:.08,knockback:.06,zone:'leg'},
 high:{cost:16,duration:.78,active:[.42,.64],reach:2.20,damage:9.2,stun:.22,knockback:.13,zone:'head'},
 takedown:{cost:19,duration:.88,active:[.40,.70],reach:1.55,damage:2.2,stun:.35,knockback:.18,zone:'body'}
};
export function resolveStrike({move,distance,inFront,guard,evading,defenderStamina=100}){
 const spec=MOVES[move];if(!spec)return {result:'invalid',damage:0,staminaLoss:0};
 if(distance>spec.reach||distance<.48||!inFront)return {result:'miss',damage:0,staminaLoss:0};
 if(evading)return {result:'evaded',damage:0,staminaLoss:0};
 if(guard&&move!=='low'&&defenderStamina>2){
  const exhausted=defenderStamina<18;
  return {result:'blocked',damage:exhausted?spec.damage*.28:spec.damage*.10,staminaLoss:exhausted?13:9,stun:exhausted?spec.stun*.45:0,knockback:0};
 }
 return {result:'hit',damage:spec.damage,staminaLoss:move==='low'?4:6,stun:spec.stun,knockback:spec.knockback};
}
