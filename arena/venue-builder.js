// Lightweight procedural venue dressing. Call buildVenue(THREE, scene, config).
const PALETTES={charcoal:0x17212d,sandstone:0x59422d,slate:0x273747,graphite:0x202833,'deep-green':0x183c31,navy:0x18223b,crimson:0x491e2b,midnight:0x141a2a,ice:0x293b4b,ocean:0x173b52};
export function buildVenue(THREE,scene,{id='las-vegas',canvas='charcoal',crowd='capacity-12k',lighting='warm-white'}={}){
 const group=new THREE.Group();group.name='venue-'+id;const color=PALETTES[canvas]??PALETTES.charcoal;
 const mat=new THREE.MeshStandardMaterial({color,roughness:.88});
 const tiers=3,segments=48;
 for(let tier=0;tier<tiers;tier++){
  const radius=6.2+tier*.85,depth=.72,height=1.15;
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(radius+depth,radius, height,segments,1,true),mat);
  bowl.position.y=1.3+tier*height*.8;bowl.rotation.y=Math.PI/segments;group.add(bowl);
  const rail=new THREE.Mesh(new THREE.TorusGeometry(radius+depth*.2,.045,6,segments),new THREE.MeshStandardMaterial({color:0x9aa8b7,metalness:.45,roughness:.5}));
  rail.rotation.x=Math.PI/2;rail.position.y=1.9+tier*height*.8;group.add(rail);
 }
 const roof=new THREE.Mesh(new THREE.CylinderGeometry(4.5,5.4,.35,segments,1,true),new THREE.MeshStandardMaterial({color:0x111923,metalness:.25,roughness:.7,side:THREE.DoubleSide}));
 roof.position.y=6.3;group.add(roof);
 const spotColor=lighting.includes('blue')||lighting==='ice-blue'?0x8bbfff:lighting.includes('amber')||lighting.includes('gold')?0xffc078:0xffffff;
 for(let i=0;i<8;i++){const a=i*Math.PI/4,l=new THREE.SpotLight(spotColor,22,18,Math.PI/5,.5,1.5);l.position.set(Math.cos(a)*5.2,5.8,Math.sin(a)*5.2);l.target.position.set(0,0,0);group.add(l,l.target)}
 group.userData={venueId:id,crowd,procedural:true};scene.add(group);return group;
}
