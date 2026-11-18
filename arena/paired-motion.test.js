import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePairedMotionPackage,samplePairedMotion} from './paired-motion.js';
const make=(frames=3)=>({fps:60,frameCount:frames,coordinateSpace:'shared-world',frames:Array.from({length:frames},(_,i)=>({
 subject_1:{Hips:[i*.1,0,0],Spine:[i*.1,1,0]},
 subject_2:{Hips:[1+i*.1,0,0],Spine:[1+i*.1,1,0]}
}))});
test('accepts two actors in one shared coordinate frame',()=>{
 const r=validatePairedMotionPackage(make());assert.equal(r.ok,true);assert.equal(r.jointCounts.subject_1,2);assert.equal(r.durationSeconds,2/60);
});
test('rejects a missing actor and missing shared-world declaration',()=>{
 const p=make();delete p.frames[1].subject_2;p.coordinateSpace='per-actor-origin';
 const r=validatePairedMotionPackage(p);assert.ok(r.errors.some(e=>e.includes('subject-2-missing')));assert.ok(r.errors.includes('shared-world-coordinate-space-required'));
});
test('rejects invalid coordinates and skeleton changes mid-capture',()=>{
 const p=make();p.frames[1].subject_1.Hips=[NaN,0,0];p.frames[2].subject_2.Extra=[0,0,0];
 const r=validatePairedMotionPackage(p);assert.ok(r.errors.some(e=>e.includes('invalid-joint:Hips')));assert.ok(r.errors.some(e=>e.includes('skeleton-changed')));
});
test('rejects inconsistent declared frame count and invalid frame rate',()=>{
 const p=make();p.frameCount=9;p.fps=0;const r=validatePairedMotionPackage(p);assert.ok(r.errors.includes('invalid-fps'));assert.ok(r.errors.includes('frame-count-mismatch'));
});
test('samples both actors at the same fractional frame and preserves relative root transform',()=>{
 const p=make();const r=samplePairedMotion(p,1/120);assert.equal(r.ok,true);assert.equal(r.framePosition,.5);assert.ok(Math.abs(r.relativeRoot.distance-1)<1e-9);assert.ok(Math.abs(r.subject_1.Hips[0]-.05)<1e-9);
});
test('clamps samples before and after the capture duration',()=>{
 const p=make();assert.equal(samplePairedMotion(p,-5).framePosition,0);assert.equal(samplePairedMotion(p,50).framePosition,2);
});
test('refuses to sample malformed packages',()=>{
 const p=make();p.frames[0].subject_1.Hips=[1,2];assert.equal(samplePairedMotion(p,0).ok,false);
});
