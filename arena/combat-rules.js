// Deterministic MMA strike rules with explicit target-zone and defense resolution.
export const MOVES={
 jab:{cost:6,duration:.40,active:[.30,.52],reach:2.05,damage:4.8,stun:.10,knockback:.07,zone:'head'},
 cross:{cost:9,duration:.52,active:[.34,.57],reach:2.18,damage:7.6,stun:.16,knockback:.12,zone:'head'},
 hook:{cost:11,duration:.59,active:[.36,.60],reach:1.92,damage:8.5,stun:.19,knockback:.10,zone:'head'},
 low:{cost:12,duration:.68,active:[.39,.64],reach:2.22,damage:6.8,stun:.08,knockback:.06,zone:'leg'},
 high:{cost:16,duration:.78,active:[.42,.64],reach:2.20,damage:9.2,stun:.22,knockback:.13,zone:'head'},
 takedown:{cost:19,duration:.88,active:[.40,.70],reach:1.55,damage:2.2,stun:.35,knockback:.18,zone:'body'},
 'spinning-backfist':{cost:17,duration:.82,active:[.42,.66],reach:2.02,damage:10.2,stun:.24,knockback:.16,zone:'head'},
 'superman-punch':{cost:18,duration:.76,active:[.39,.63],reach:2.42,damage:9.8,stun:.21,knockback:.18,zone:'head'},
 'switch-kick':{cost:18,duration:.88,active:[.48,.72],reach:2.30,damage:10.1,stun:.18,knockback:.14,zone:'body'},
 'question-mark-kick':{cost:21,duration:1.02,active:[.56,.76],reach:2.24,damage:11.4,stun:.25,knockback:.17,zone:'head'},
 'spinning-elbow':{cost:16,duration:.78,active:[.40,.62],reach:1.78,damage:9.7,stun:.23,knockback:.12,zone:'head'},
 'flying-knee':{cost:22,duration:.92,active:[.49,.72],reach:2.12,damage:11.2,stun:.24,knockback:.19,zone:'head'},
 'ground-pound':{cost:12,duration:.72,active:[.42,.68],reach:1.45,damage:7.2,stun:.18,knockback:0,zone:'head'}
};
export function resolveStrike({move,distance,inFront,guard=false,evading=false,defenderStamina=100,defenderZone='neutral'}){
 const spec=MOVES[move];if(!spec)return {result:'invalid',damage:0,staminaLoss:0,zone:null};
 if(distance>spec.reach||distance<.48||!inFront)return {result:'miss',damage:0,staminaLoss:0,zone:spec.zone};
 if(evading)return {result:'evaded',damage:0,staminaLoss:0,zone:spec.zone};
 const zoneMultiplier=defenderZone==='exposed'?1.18:defenderZone==='braced'?.78:1;
 if(guard&&spec.zone==='head'&&defenderStamina>2){
  const exhausted=defenderStamina<18;
  return {result:'blocked',damage:spec.damage*(exhausted?.28:.10),staminaLoss:exhausted?13:9,stun:exhausted?spec.stun*.45:0,knockback:0,zone:spec.zone};
 }
 if(guard&&spec.zone==='body'&&defenderStamina>8)
  return {result:'partially-blocked',damage:spec.damage*.38,staminaLoss:11,stun:spec.stun*.45,knockback:spec.knockback*.25,zone:spec.zone};
 return {result:'hit',damage:spec.damage*zoneMultiplier,staminaLoss:move==='low'?4:6,stun:spec.stun*(defenderZone==='exposed'?1.15:1),knockback:spec.knockback,zone:spec.zone};
}
