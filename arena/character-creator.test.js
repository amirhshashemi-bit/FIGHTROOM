import {resolveCountryCode,countryNameForCode,countryFlag,getCountryOptions} from './countries.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {CREATOR_SCHEMA_VERSION,CREATOR_STORAGE_KEY,DEFAULT_CUSTOM_FIGHTER,MOVE_CATALOG,getBodyMetrics,loadCustomFighter,normalizeCustomFighter} from './character-creator.js';

test('custom fighter profile clamps body dimensions and combat attributes',()=>{
 const p=normalizeCustomFighter({name:'  Test Fighter  ',height:999,reach:1,power:200,body:{shoulders:9,chest:.1,arms:1.1,legs:.9}});
 assert.equal(p.name,'Test Fighter');assert.equal(p.height,215);assert.equal(p.reach,145);assert.equal(p.power,100);
 assert.equal(p.body.shoulders,1.3);assert.equal(p.body.chest,.75);assert.equal(p.body.arms,1.1);
});
test('premium move catalogue has unique individually priced entries',()=>{
 assert.ok(MOVE_CATALOG.length>=8);
 assert.equal(new Set(MOVE_CATALOG.map(m=>m.id)).size,MOVE_CATALOG.length);
 for(const move of MOVE_CATALOG){assert.ok(move.name&&move.category&&move.price>0&&(move.baseMove||move.action)&&move.clip)}
});
test('default custom fighter is fictional and starts with a limited starter move set',()=>{
 const p=normalizeCustomFighter(DEFAULT_CUSTOM_FIGHTER);
 assert.equal(p.custom,true);assert.ok(p.ownedMoves.includes('signature-jab'));assert.ok(!p.ownedMoves.includes('flying-knee'));
});

test('body metrics reflect height, weight, reach and proportion sliders',()=>{
 const base=getBodyMetrics(DEFAULT_CUSTOM_FIGHTER);
 const larger=getBodyMetrics({...DEFAULT_CUSTOM_FIGHTER,height:200,weight:110,reach:210,body:{shoulders:1.2,chest:1.1,arms:1.15,legs:1.05}});
 assert.ok(larger.height>base.height);assert.ok(larger.mass>base.mass);assert.ok(larger.reach>base.reach);assert.ok(larger.shoulders>base.shoulders);
});
test('equipped move slots can only contain owned moves',()=>{
 const p=normalizeCustomFighter({ownedMoves:['signature-jab'],equippedMoves:['signature-jab','flying-knee']});
 assert.deepEqual(p.equippedMoves,['signature-jab']);
});

test('custom fighter country is normalized and preserved by ISO code',()=>{
 const p=normalizeCustomFighter({countryCode:'AZ'});
 assert.equal(p.countryCode,'AZ');
 assert.equal(p.country,countryNameForCode('AZ','en'));
 assert.equal(normalizeCustomFighter({country:'Iran'}).countryCode,'IR');
});
test('country selector provides a broad ISO country list and flag rendering',()=>{
 const options=getCountryOptions('fa');
 assert.ok(options.length>=240);
 assert.ok(options.some(c=>c.code==='IR'));
 assert.equal(countryFlag('IR'),'🇮🇷');
});

test('custom fighter gender is normalized and affects body silhouette metrics',()=>{
 const male=normalizeCustomFighter({gender:'male'});
 const female=normalizeCustomFighter({gender:'female'});
 assert.equal(male.gender,'male');
 assert.equal(female.gender,'female');
 assert.ok(getBodyMetrics(female).hips>getBodyMetrics(male).hips);
 assert.ok(getBodyMetrics(female).shoulders<getBodyMetrics(male).shoulders);
});

test('legacy custom fighter profiles migrate forward without losing player choices',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 const values=new Map([[CREATOR_STORAGE_KEY,JSON.stringify({name:'Legacy Fighter',gender:'female',countryCode:'IR',stance:'Southpaw',style:'BJJ',power:91,ownedMoves:['signature-jab'],equippedMoves:['signature-jab']})]]);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
  getItem:key=>values.has(key)?values.get(key):null,
  setItem:(key,value)=>values.set(key,String(value))
 }});
 try{
  const migrated=loadCustomFighter();
  assert.equal(migrated.schemaVersion,CREATOR_SCHEMA_VERSION);
  assert.equal(migrated.name,'Legacy Fighter');
  assert.equal(migrated.gender,'female');
  assert.equal(migrated.countryCode,'IR');
  assert.equal(migrated.stance,'Southpaw');
  assert.equal(migrated.power,91);
  assert.equal(JSON.parse(values.get(CREATOR_STORAGE_KEY)).schemaVersion,CREATOR_SCHEMA_VERSION);
 }finally{
  if(previous)Object.defineProperty(globalThis,'localStorage',previous);
  else delete globalThis.localStorage;
 }
});

test('newer unknown save schemas are preserved instead of downgraded',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 const future=JSON.stringify({schemaVersion:CREATOR_SCHEMA_VERSION+1,name:'Future Fighter',custom:true});
 const values=new Map([[CREATOR_STORAGE_KEY,future]]);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
  getItem:key=>values.has(key)?values.get(key):null,
  setItem:(key,value)=>values.set(key,String(value))
 }});
 try{
  assert.equal(loadCustomFighter(),null);
  assert.equal(values.get(CREATOR_STORAGE_KEY),future);
 }finally{
  if(previous)Object.defineProperty(globalThis,'localStorage',previous);
  else delete globalThis.localStorage;
 }
});
