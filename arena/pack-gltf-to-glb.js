import fs from 'node:fs';
import path from 'node:path';

const source = process.argv[2];
const destination = process.argv[3];
if (!source || !destination) {
  console.error('Usage: node pack-gltf-to-glb.js input.gltf output.glb');
  process.exit(2);
}
const folder = path.dirname(source);
const document = JSON.parse(fs.readFileSync(source, 'utf8'));
if (!Array.isArray(document.buffers) || document.buffers.length !== 1 || !document.buffers[0].uri) {
  throw new Error('Expected one external glTF buffer');
}
const binary = fs.readFileSync(path.resolve(folder, document.buffers[0].uri));
document.buffers = [{ byteLength: binary.length }];
for (const image of document.images || []) {
  if (!image.uri || image.uri.startsWith('data:')) continue;
  const imagePath = path.resolve(folder, image.uri);
  const bytes = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  image.uri = `data:${mime};base64,${bytes.toString('base64')}`;
}
const json = Buffer.from(JSON.stringify(document), 'utf8');
const pad = (buffer, byte) => {
  const length = (4 - (buffer.length % 4)) % 4;
  return length ? Buffer.concat([buffer, Buffer.alloc(length, byte)]) : buffer;
};
const jsonChunk = pad(json, 0x20);
const binChunk = pad(binary, 0);
const totalLength = 12 + 8 + jsonChunk.length + 8 + binChunk.length;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(totalLength, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(jsonChunk.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(binChunk.length, 0);
binHeader.writeUInt32LE(0x004e4942, 4);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]));
console.log(`Packed ${source} -> ${destination} (${(fs.statSync(destination).size / 1048576).toFixed(2)} MiB)`);
