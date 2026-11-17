// Motion-capture asset manifest and loader adapter. No clip is claimed as installed until supplied.
export const MOCAP_SOURCES=[
 {id:'accad-open-motion',url:'https://accad.ohio-state.edu/research/motion-lab/mocap-system-and-data',license:'CC BY 3.0',credit:'Open Motion Project by ACCAD / The Ohio State University',formats:['C3D','BVH','FBX','GLB'],status:'verified-source-not-yet-imported'},
 {id:'kinemiq-open-mocap',url:'https://kinemiq.app/free-motion-capture-data/',license:'CC BY 3.0 (ACCAD) / CC BY 4.0 (100STYLE)',credit:'Open Motion Project by ACCAD / The Ohio State University; 100STYLE by Ian Mason, Sebastian Starke and Taku Komura',formats:['GLB','glTF','FBX','BVH'],status:'verified-source-not-yet-imported'},
 {id:'kinemiq-cc0-pack',url:'https://kinemiq.itch.io/free-game-animations',license:'CC0 1.0 for the 35-animation starter pack',credit:'Quaternius Universal Animation Library',formats:['GLB','FBX'],status:'verified-source-not-yet-imported'},
 {id:'cmu-mocap',url:'http://mocap.cs.cmu.edu/',license:'CMU custom terms',credit:'CMU Graphics Lab Motion Capture Database',formats:['ASF/AMC','BVH'],status:'candidate'}
];
export const REQUIRED_ACTIONS=['stance','advance','retreat','jab','cross','hook','roundhouse','low-kick','block','slip','sprawl','double-leg','ground-control','stand-up','hit-reaction','knockdown','get-up'];
export function validateMocapManifest(manifest){
 const errors=[];if(!manifest||typeof manifest!=='object')return ['manifest-required'];
 if(!manifest.skeleton||!Array.isArray(manifest.bones)||!manifest.bones.length)errors.push('skeleton-and-bones-required');
 if(!manifest.license||!manifest.source)errors.push('source-and-license-required');
 if(!Array.isArray(manifest.clips)||!manifest.clips.length)errors.push('clips-required');
 else for(const clip of manifest.clips)if(!clip.id||!clip.action||!clip.path||!clip.sha256)errors.push('clip-metadata-or-integrity-missing');
 return errors;
}
export async function loadAnimationClip(THREE,loader,url){if(!loader||typeof loader.loadAsync!=='function')throw new Error('animation-loader-required');const asset=await loader.loadAsync(url);if(!asset.animations?.length)throw new Error('no-animation-track-found');return {asset,clips:asset.animations.map(c=>THREE.AnimationClip.parse(c))}}
