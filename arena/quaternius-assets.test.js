import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseGlbJson } from './glb-rig-inspector.js';

const malePath = new URL('./assets/models/quaternius/human_male.glb', import.meta.url);
const femalePath = new URL('./assets/models/quaternius/human_female.glb', import.meta.url);
const libraryPath = new URL('./assets/mocap/quaternius/UAL1_Standard.glb', import.meta.url);

test('Quaternius male and female runtime models share the same 65-joint humanoid rig', () => {
  const male = parseGlbJson(fs.readFileSync(malePath));
  const female = parseGlbJson(fs.readFileSync(femalePath));
  assert.equal(male.skins?.[0]?.joints?.length, 65);
  assert.equal(female.skins?.[0]?.joints?.length, 65);
  const maleNames = male.skins[0].joints.map(index => male.nodes[index]?.name);
  const femaleNames = female.skins[0].joints.map(index => female.nodes[index]?.name);
  assert.deepEqual(femaleNames, maleNames);
  for (const required of ['root', 'pelvis', 'spine_01', 'spine_02', 'spine_03', 'Head', 'hand_l', 'hand_r', 'foot_l', 'foot_r']) {
    assert.ok(maleNames.includes(required), 'missing shared humanoid bone: ' + required);
  }
});

test('Quaternius UAL1 animation library has native idle/walk clips and matching track nodes', () => {
  const male = parseGlbJson(fs.readFileSync(malePath));
  const library = parseGlbJson(fs.readFileSync(libraryPath));
  assert.equal(library.animations?.length, 43);
  const clipNames = library.animations.map(clip => clip.name);
  assert.ok(clipNames.includes('Idle_Loop'));
  assert.ok(clipNames.includes('Walk_Loop'));
  const modelNames = new Set(male.nodes.map(node => node.name).filter(Boolean));
  const trackNames = new Set();
  for (const clip of library.animations) {
    for (const channel of clip.channels || []) {
      const name = library.nodes[channel.target.node]?.name;
      if (name) trackNames.add(name);
    }
  }
  const missing = [...trackNames].filter(name => !modelNames.has(name));
  assert.deepEqual(missing, []);
});
