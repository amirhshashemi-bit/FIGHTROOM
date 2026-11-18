import test from 'node:test';
import assert from 'node:assert/strict';
import { qualityProfile, assessFrameTimes } from './performance.js';

test('constrained laptop profile caps rendering at 30fps and reduces pixel ratio',()=>{
 const profile=qualityProfile({width:1366,height:768,deviceMemory:4,hardwareConcurrency:2});
 assert.equal(profile.tier,'low');
 assert.equal(profile.maxFPS,30);
 assert.equal(profile.pixelRatio,0.8);
 assert.equal(profile.shadows,false);
 assert.equal(profile.antialias,false);
 assert.equal(profile.maxLights,2);
});

test('capable devices retain the high quality 60fps profile',()=>{
 const profile=qualityProfile({width:1920,height:1080,deviceMemory:16,hardwareConcurrency:12});
 assert.equal(profile.tier,'high');
 assert.equal(profile.maxFPS,60);
 assert.equal(profile.pixelRatio,1.5);
 assert.equal(profile.shadows,true);
 assert.equal(profile.antialias,true);
});

test('reduced-motion preference also limits frame rate',()=>{
 const profile=qualityProfile({width:1920,height:1080,deviceMemory:16,hardwareConcurrency:12,reducedMotion:true});
 assert.equal(profile.tier,'high');
 assert.equal(profile.maxFPS,30);
 assert.equal(profile.reducedMotion,true);
});

test('30fps frame samples are considered stable by the quality gate',()=>{
 const result=assessFrameTimes(Array(20).fill(33.3));
 assert.equal(result.valid,true);
 assert.equal(result.fps,30);
 assert.equal(result.stable,true);
});
