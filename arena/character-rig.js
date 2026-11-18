// FIGHTROOM humanoid rig inspection and profile-driven morph target support.
// This validates imported assets without assuming a specific vendor skeleton.
const CORE_BONES = {
  hips: ['hips','mixamorig:hips','pelvis','root'],
  spine: ['spine','mixamorig:spine','spine1','spine_01'],
  head: ['head','mixamorig:head'],
  leftUpperArm: ['leftarm','mixamorig:leftarm','upperarm_l','upperarm.l','leftupperarm','upperarm01.l','upperarm02.l'],
  rightUpperArm: ['rightarm','mixamorig:rightarm','upperarm_r','upperarm.r','rightupperarm','upperarm01.r','upperarm02.r'],
  leftUpperLeg: ['leftupleg','mixamorig:leftupleg','thigh_l','thigh.l','leftupperleg','upperleg01.l','upperleg02.l'],
  rightUpperLeg: ['rightupleg','mixamorig:rightupleg','thigh_r','thigh.r','rightupperleg','upperleg01.r','upperleg02.r']
};
const MORPH_TARGETS = {
  shoulders: ['shoulder_width','shoulders','wide_shoulders','shoulderwidth'],
  chest: ['chest_size','chest','chestwidth','torso_width'],
  arms: ['arm_size','arms','upperarm_size','armwidth'],
  legs: ['leg_size','legs','thigh_size','legwidth']
};
const clean = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function inspectHumanoidRig(root) {
  const names = new Set(), morphs = new Set();
  root?.traverse?.(node => {
    if (node.name) names.add(clean(node.name));
    for (const bone of node.skeleton?.bones || []) if (bone.name) names.add(clean(bone.name));
    for (const key of Object.keys(node.morphTargetDictionary || {})) morphs.add(clean(key));
  });
  const bones = {};
  for (const [key, aliases] of Object.entries(CORE_BONES)) bones[key] = aliases.some(alias => names.has(clean(alias)));
  const morphTargets = {};
  for (const [key, aliases] of Object.entries(MORPH_TARGETS)) morphTargets[key] = aliases.some(alias => morphs.has(clean(alias)));
  const foundCore = Object.values(bones).filter(Boolean).length;
  return {
    bones,
    morphTargets,
    foundCore,
    compatible: foundCore >= 5 && bones.hips && bones.head,
    skeletonCount: [...names].length,
    morphTargetCount: morphs.size
  };
}
export function applyCharacterMorphs(root, profile = {}) {
  const proportions = profile.body || {};
  const applied = [];
  const gender = String(profile.gender || (String(profile.division || '').startsWith('Women') ? 'female' : 'male')).toLowerCase();
  const genderWeights = { gender_female: gender === 'female' ? 1 : 0, gender_male: gender === 'female' ? 0 : 1 };
  root?.traverse?.(node => {
    const dictionary = node.morphTargetDictionary;
    const influences = node.morphTargetInfluences;
    if (!dictionary || !influences) return;
    for (const [key, value] of Object.entries(genderWeights)) {
      const match = Object.keys(dictionary).find(name => clean(name) === clean(key));
      if (!match) continue;
      const index = dictionary[match];
      if (!Number.isInteger(index) || index < 0 || index >= influences.length) continue;
      influences[index] = value;
      applied.push(key);
    }
    for (const [key, aliases] of Object.entries(MORPH_TARGETS)) {
      const match = Object.keys(dictionary).find(name => aliases.some(alias => clean(alias) === clean(name)));
      if (!match) continue;
      const index = dictionary[match], value = Number(proportions[key] ?? 1);
      if (!Number.isInteger(index) || index < 0 || index >= influences.length || !Number.isFinite(value)) continue;
      influences[index] = Math.max(-0.3, Math.min(0.3, value - 1));
      applied.push(key);
    }
  });
  return [...new Set(applied)];
}
