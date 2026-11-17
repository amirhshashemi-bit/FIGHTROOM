import { resolveCountryCode, countryNameForCode } from './countries.js';
// FIGHTROOM custom fighter profiles and premium movement catalogue.
// Local profile storage is a prototype only; purchase entitlements must be server-verified.
export const CREATOR_STORAGE_KEY = 'fightroom.arena.custom-fighter.v1';
export const MOVE_CATALOG = [
  {id:'signature-jab',name:'Signature Jab',category:'Boxing',price:90,baseMove:'jab',clip:'jab'},
  {id:'signature-cross',name:'Power Cross',category:'Boxing',price:110,baseMove:'cross',clip:'cross'},
  {id:'spinning-backfist',name:'Spinning Backfist',category:'Advanced Striking',price:180,baseMove:'hook',clip:'spinning backfist'},
  {id:'superman-punch',name:'Superman Punch',category:'Advanced Striking',price:180,baseMove:'cross',clip:'superman punch'},
  {id:'switch-kick',name:'Switch Kick',category:'Kicks',price:160,baseMove:'high',clip:'switch kick'},
  {id:'question-mark-kick',name:'Question Mark Kick',category:'Kicks',price:200,baseMove:'high',clip:'question mark kick'},
  {id:'spinning-elbow',name:'Spinning Elbow',category:'Advanced Striking',price:190,baseMove:'hook',clip:'spinning elbow'},
  {id:'flying-knee',name:'Flying Knee',category:'Knees',price:210,baseMove:'high',clip:'flying knee'},
  {id:'double-leg-chain',name:'Chain Double Leg',category:'Wrestling',price:170,baseMove:'takedown',clip:'double leg'},
  {id:'armbar-transition',name:'Armbar Transition',category:'Ground',price:190,baseMove:'submission',clip:'armbar'}
];
export const DEFAULT_CUSTOM_FIGHTER = {
  id:'custom-player', name:'My Fighter', gender:'male', division:'Custom', weight:77, height:180, reach:184, country:'Iran', countryCode:'IR',
  stance:'Orthodox', style:'All-rounder', country:'Custom', skin:0xb97855, hair:0x211914,
  shorts:0x26313c, gloves:0x9e2733, eye:0x3b2418,
  power:80,speed:80,wrestling:80,cardio:80,
  body:{shoulders:1,chest:1,arms:1,legs:1},
  custom:true,ownedMoves:['signature-jab','signature-cross'],equippedMoves:['signature-jab','signature-cross']
};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||min));
export function normalizeCustomFighter(raw={}){
 const d=DEFAULT_CUSTOM_FIGHTER,b=raw.body||{};
 return {
  ...d,...raw,id:'custom-player',custom:true,
  name:String(raw.name||d.name).trim().slice(0,24)||d.name,
  gender:raw.gender==='female'?'female':'male',
  countryCode:resolveCountryCode(raw.countryCode||raw.country||d.countryCode),
  country:countryNameForCode(resolveCountryCode(raw.countryCode||raw.country||d.countryCode),'en'),
  height:clamp(raw.height??d.height,150,215),reach:clamp(raw.reach??d.reach,145,230),weight:clamp(raw.weight??d.weight,45,150),
  power:clamp(raw.power??d.power,40,100),speed:clamp(raw.speed??d.speed,40,100),wrestling:clamp(raw.wrestling??d.wrestling,40,100),cardio:clamp(raw.cardio??d.cardio,40,100),
  skin:Number.isFinite(Number(raw.skin))?Number(raw.skin):d.skin,
  hair:Number.isFinite(Number(raw.hair))?Number(raw.hair):d.hair,
  shorts:Number.isFinite(Number(raw.shorts))?Number(raw.shorts):d.shorts,
  gloves:Number.isFinite(Number(raw.gloves))?Number(raw.gloves):d.gloves,
  eye:Number.isFinite(Number(raw.eye))?Number(raw.eye):d.eye,
  body:{shoulders:clamp(b.shoulders??d.body.shoulders,0.75,1.3),chest:clamp(b.chest??d.body.chest,0.75,1.3),arms:clamp(b.arms??d.body.arms,0.75,1.3),legs:clamp(b.legs??d.body.legs,0.75,1.3)},
  ownedMoves:Array.isArray(raw.ownedMoves)?[...new Set(raw.ownedMoves.filter(id=>MOVE_CATALOG.some(m=>m.id===id)))]:d.ownedMoves.slice(),
  equippedMoves:Array.isArray(raw.equippedMoves)?raw.equippedMoves.filter(id=>(Array.isArray(raw.ownedMoves)?raw.ownedMoves:d.ownedMoves).includes(id)).slice(0,2):d.equippedMoves.slice()
 };
}
export function loadCustomFighter(){
 try{const raw=JSON.parse(localStorage.getItem(CREATOR_STORAGE_KEY)||'null');return raw?normalizeCustomFighter(raw):null}catch{return null}
}
export function saveCustomFighter(profile){
 const clean=normalizeCustomFighter(profile);
 localStorage.setItem(CREATOR_STORAGE_KEY,JSON.stringify(clean));
 return clean;
}

export function getBodyMetrics(profile={}){
 const body=profile.body||{},height=Math.max(150,Math.min(215,Number(profile.height)||180)),weight=Math.max(45,Math.min(150,Number(profile.weight)||77));
 const bmi=weight/((height/100)**2),baseBmi=77/(1.8**2),mass=Math.max(.86,Math.min(1.18,Math.sqrt(bmi/baseBmi)));
 const female=profile.gender==='female'||String(profile.division||'').startsWith('Women');
 const factor=(key)=>Math.max(.75,Math.min(1.3,Number(body[key])||1));
 return {mass,shoulders:factor('shoulders')*mass*(female?.94:1),chest:factor('chest')*mass,arms:factor('arms')*Math.sqrt(mass)*(female?.96:1),legs:factor('legs')*Math.sqrt(mass)*(female?1.03:1),hips:factor('hips')*mass*(female?1.09:1),reach:Math.max(.82,Math.min(1.18,(Number(profile.reach)||180)/180)),height:height/180};
}
