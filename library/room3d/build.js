import {build} from 'esbuild';
import fs from 'node:fs';
const outfile='../../static/library/room.js';
await build({entryPoints:['main.js'],bundle:true,format:'esm',target:'es2020',minify:true,legalComments:'linked',outfile});
// GLSL source strings in the upstream renderer contain trailing whitespace.
// Removing it preserves shader semantics and keeps the generated diff clean.
fs.writeFileSync(outfile,fs.readFileSync(outfile,'utf8').replace(/[\t ]+$/gm,''));
