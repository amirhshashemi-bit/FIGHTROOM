# Quaternius Universal Base Characters — FIGHTROOM import notice

- Creator: Quaternius
- Pack: Universal Base Characters (Standard)
- Official page: https://quaternius.com/packs/universalbasecharacters.html
- Free download page: https://quaternius.itch.io/universal-base-characters
- License: CC0 1.0 Universal (public-domain dedication); the creator describes the pack as free for personal, educational and commercial projects.
- Runtime files:
  - `human_male.glb` — converted from `Superhero_Male_FullBody.gltf`
  - `human_female.glb` — converted from `Superhero_Female_FullBody.gltf`
- Both source rigs contain 65 joints and use matching humanoid bone names. The pack advertises an average of about 13k triangles per base character.
- The source glTF, binary buffers and required texture images were downloaded from the public Quaternius Standard asset tree. `pack-gltf-to-glb.js` embeds the referenced images and binary buffer into a GLB container; it does not modify mesh positions, topology, skin weights or bone names.
- Runtime animation: the game retargets the separately licensed ACCAD BVH clips to these rigs. The original Quaternius models themselves contain no animation clips in the source glTF.
- SHA-256 male GLB: `1D6E34CBF3A8E76AC1ED884653B483B6C774F937AB90D9BB703D7D2940C822DD`.
- SHA-256 female GLB: `512349737506278A74BADDD04201F596D6069F4573AF06F1CF2488B498B07453`.
- Outfit overlays added by FIGHTROOM are original procedural game geometry and are not part of the Quaternius pack.

The model and animation licences are separate. ACCAD BVH clips retain their CC BY 3.0 attribution requirements; see `ASSET_CREDITS.md`.
