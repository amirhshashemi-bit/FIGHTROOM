import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGlbJson, inspectGlbDocument } from './glb-rig-inspector.js';

function makeGlb(doc) {
  const json = Buffer.from(JSON.stringify(doc));
  const padded = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 0x20)]);
  const header = Buffer.alloc(20);
  header.write('glTF',0); header.writeUInt32LE(2,4);
  header.writeUInt32LE(20+padded.length,8);
  header.writeUInt32LE(padded.length,12); header.write('JSON',16);
  return Buffer.concat([header,padded]);
}

test('parses a valid GLB v2 JSON chunk', () => {
  const doc={asset:{version:'2.0'},nodes:[],scenes:[{}]};
  assert.deepEqual(parseGlbJson(makeGlb(doc)),doc);
});
test('rejects malformed GLB headers and lengths', () => {
  assert.throws(()=>parseGlbJson(Buffer.from('nope')),/invalid-glb-magic/);
  const b=makeGlb({asset:{version:'2.0'}});
  b.writeUInt32LE(99,8);
  assert.throws(()=>parseGlbJson(b),/glb-length-mismatch/);
});
test('maps humanoid joints and only claims actions present in clip names', () => {
  const doc={
    asset:{version:'2.0'}, scenes:[{}],
    nodes:['Hips','Spine','Head','LeftArm','RightArm','LeftUpLeg','RightUpLeg'].map(name=>({name})),
    meshes:[{}], skins:[{joints:[0,1,2,3,4,5,6]}],
    animations:[
      {name:'Idle',channels:[{target:{node:0}}]},
      {name:'Walk Forward',channels:[{target:{node:1}}]},
      {name:'walk_back',channels:[{target:{node:1}}]},
      {name:'Jab',channels:[{target:{node:3}}]}
    ]
  };
  const r=inspectGlbDocument(doc);
  assert.equal(r.humanoidCoreCandidate,true);
  assert.equal(r.coreBonesFound,7);
  assert.equal(r.actionClipMatches.idle,'Idle');
  assert.equal(r.actionClipMatches.advance,'Walk Forward');
  assert.equal(r.actionClipMatches.retreat,'walk_back');
  assert.equal(r.actionClipMatches.jab,'Jab');
  assert.equal(r.actionClipMatches.cross,null);
  assert.equal(r.mappedActionCount,4);
});
test('does not call an incomplete skeleton humanoid-compatible', () => {
  const r=inspectGlbDocument({nodes:[{name:'Hips'}],skins:[{joints:[0]}],meshes:[{}],animations:[{name:'Walk'}]});
  assert.equal(r.humanoidCoreCandidate,false);
});
