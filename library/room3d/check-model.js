import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {OBB} from 'three/addons/math/OBB.js';
import {ROOM,BOOK,BAYS,BAY,ISLAND,wallRoute,islandRoute,auditLayout} from './model.js';
const books=JSON.parse(fs.readFileSync(new URL('../../data/books.json',import.meta.url))).books;
const {slots,errors}=auditLayout(books);assert.deepEqual(errors,[]);
const obb=(x,y,z,tx,tz,w,h,d)=>new OBB(new T.Vector3(x,y,z),new T.Vector3(w/2,h/2,d/2),new T.Matrix3().set(tx,0,-tz,0,1,0,tz,0,tx));
const partitions=[];
for(let i=0;i<=BAYS;i++){const p=wallRoute(i*BAY,ROOM.shelfDepth/2);partitions.push(obb(p.x,(ROOM.base+ROOM.height)/2,p.z,p.tx,p.tz,2.2,ROOM.height-ROOM.base,ROOM.shelfDepth));}
for(let i=0;i<=ISLAND.bays;i++){const p=islandRoute(i/ISLAND.bays,ISLAND.depth/2);partitions.push(obb(p.x,(ROOM.base+ISLAND.height)/2,p.z,p.tx,p.tz,2.2,ISLAND.height-ROOM.base,ISLAND.depth));}
for(const pull of [0,.25,.5,.75,1]){
 const volumes=slots.map(s=>{const depth=BOOK.depth/2+pull*BOOK.pull;return obb(s.x+s.nx*depth,s.y+BOOK.height/2,s.z+s.nz*depth,s.tx,s.tz,BOOK.width,BOOK.height,BOOK.depth);});
 volumes.forEach((volume,i)=>{for(const partition of partitions)assert(!volume.intersectsOBB(partition,1e-6),`Book ${i} intersects a divider at pull ${pull}`);for(let j=i+1;j<volumes.length;j++)assert(!volume.intersectsOBB(volumes[j],1e-6),`Books ${i}/${j} intersect`);
  const s=slots[i];for(const a of [-BOOK.width/2,BOOK.width/2])for(const d of [pull*BOOK.pull,BOOK.depth+pull*BOOK.pull]){const x=s.x+s.tx*a+s.nx*d,z=s.z+s.tz*a+s.nz*d;assert(x>=0&&x<=ROOM.size&&z>=0&&z<=ROOM.size,`Book ${i} outside floor`);if(s.wall)assert(x>=ROOM.wall&&z>=ROOM.wall,`Book ${i} enters a wall`);}
 });
}
assert.equal(new Set(slots.map(x=>x.id)).size,120);
console.log('PASS: 120 unique books; shelf/divider/floor clearances; no book intersections at rest or four pull positions.');
