// Structural GLB rig inspector. Reports facts; it does not claim retarget compatibility.
import fs from 'node:fs';

export function parseGlbJson(input) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  if (b.length < 20 || b.toString('ascii', 0, 4) !== 'glTF') throw new Error('invalid-glb-magic');
  if (b.readUInt32LE(4) !== 2) throw new Error('unsupported-glb-version');
  if (b.readUInt32LE(8) !== b.length) throw new Error('glb-length-mismatch');
  const jsonLength = b.readUInt32LE(12);
  if (b.toString('ascii', 16, 20) !== 'JSON') throw new Error('missing-json-chunk');
  if (20 + jsonLength > b.length) throw new Error('truncated-json-chunk');
  return JSON.parse(b.toString('utf8', 20, 20 + jsonLength).replace(/[\\u0000\\u0020]+$/g, ''));
}

const clean = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const aliases = {
  hips: ['hips','pelvis','mixamorighips','root'],
  spine: ['spine','spine1','spine01','mixamorigspine','mixamorigspine1'],
  head: ['head','mixamorighead'],
  leftUpperArm: ['leftarm','upperarml','mixamorigleftarm','upperarm01l','upperarm02l'],
  rightUpperArm: ['rightarm','upperarmr','mixamorigrightarm','upperarm01r','upperarm02r'],
  leftUpperLeg: ['leftupleg','thighl','leftupperleg','mixamorigleftupleg','upperleg01l','upperleg02l'],
  rightUpperLeg: ['rightupleg','thighr','rightupperleg','mixamorigrightupleg','upperleg01r','upperleg02r']
};
const actionAliases = {
  idle: ['idle','stance','fight idle','fighting stance'],
  advance: ['advance','walk','forward','move'],
  retreat: ['retreat','backward','back walk','walk_back','walkback'],
  jab: ['jab'], cross: ['cross'], hook: ['hook','uppercut'],
  lowKick: ['low kick','low-kick'], highKick: ['roundhouse','high kick','kick'],
  guard: ['block','guard'], dodge: ['dodge','slip','evade'],
  takedown: ['takedown','double leg','sprawl'],
  groundPound: ['ground pound','ground-and-pound'],
  standUp: ['get up','stand up','get-up'], submission: ['submission','ground control']
};

export function inspectGlbDocument(doc) {
  const nodes = Array.isArray(doc.nodes) ? doc.nodes : [];
  const skins = Array.isArray(doc.skins) ? doc.skins : [];
  const animations = Array.isArray(doc.animations) ? doc.animations : [];
  const nodeNames = nodes.map((n,i) => n.name || `node_${i}`);
  const joints = [...new Set(skins.flatMap(s => (s.joints || []).map(i => nodeNames[i] || `node_${i}`)))];
  const boneMatches = {};
  for (const [key, names] of Object.entries(aliases)) {
    const match = joints.find(name => names.map(clean).includes(clean(name)));
    boneMatches[key] = match || null;
  }
  const clipNames = animations.map((a,i) => a.name || `animation_${i}`);
  const clipActions = {};
  for (const [action, names] of Object.entries(actionAliases)) {
    clipActions[action] = clipNames.find(name => names.some(alias => clean(name).includes(clean(alias)))) || null;
  }
  const channels = animations.map((a,i) => ({
    name: clipNames[i],
    channels: (a.channels || []).length,
    targetNodes: [...new Set((a.channels || []).map(c => nodeNames[c.target?.node] || 'unknown'))]
  }));
  const found = Object.values(boneMatches).filter(Boolean).length;
  return {
    assetVersion: doc.asset?.version || null,
    sceneCount: doc.scenes?.length || 0,
    nodeCount: nodes.length,
    meshCount: doc.meshes?.length || 0,
    skinCount: skins.length,
    jointCount: joints.length,
    joints,
    boneMatches,
    coreBonesFound: found,
    humanoidCoreCandidate: found >= 5 && Boolean(boneMatches.hips) && Boolean(boneMatches.head),
    animationCount: animations.length,
    clipNames,
    actionClipMatches: clipActions,
    mappedActionCount: Object.values(clipActions).filter(Boolean).length,
    channels
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    const path = process.argv[2];
    if (!path) throw new Error('usage: node glb-rig-inspector.js <file.glb>');
    const report = inspectGlbDocument(parseGlbJson(fs.readFileSync(path)));
    console.log(JSON.stringify(report, null, 2));
    if (!report.meshCount || !report.skinCount || !report.animationCount) process.exitCode = 2;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
