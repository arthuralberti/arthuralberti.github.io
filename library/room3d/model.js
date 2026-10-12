// Units are centimetres. x/z form the floor plan; y is height.
// Shelf bays, book placement and verification share this one dimensional model.
export const ROOM={size:480,height:264,wall:8,shelfDepth:28,shelfThickness:2.2,pitch:33,base:9};
export const BOOK={width:3.8,height:24,depth:17.5,gap:1.25,pull:7};
export const RADIUS=120,CORNER=128;
export const WING=ROOM.size-CORNER;
export const ARC=Math.PI*RADIUS/2;
export const LENGTH=WING*2+ARC;
export const BAYS=12;
export const BAY=LENGTH/BAYS;
export function wallRoute(s,offset=0){
 s=Math.max(0,Math.min(LENGTH,s));
 if(s<=WING)return {x:8+offset,z:ROOM.size-s,tx:0,tz:-1,nx:1,nz:0};
 if(s<WING+ARC){const a=Math.PI+(s-WING)/RADIUS;return{x:CORNER+(RADIUS-offset)*Math.cos(a),z:CORNER+(RADIUS-offset)*Math.sin(a),tx:-Math.sin(a),tz:Math.cos(a),nx:-Math.cos(a),nz:-Math.sin(a)};}
 return{x:CORNER+s-WING-ARC,z:8+offset,tx:1,tz:0,nx:0,nz:1};
}
// Central shelving follows a true circular arc; radial dividers meet both skins.
export const ISLAND={cx:265,cz:353,r:126,depth:30,start:Math.PI*1.10,end:Math.PI*1.84,height:66,bays:4};
export function islandRoute(t,offset=0){const a=ISLAND.start+(ISLAND.end-ISLAND.start)*t,r=ISLAND.r-offset;return{x:ISLAND.cx+r*Math.cos(a),z:ISLAND.cz+r*Math.sin(a),tx:-Math.sin(a),tz:Math.cos(a),nx:-Math.cos(a),nz:-Math.sin(a)};}
export function layoutBooks(books){return books.map((book,i)=>{
 // Ten groups of ten stay inside straight wall bays (curved corner left open).
 const wall=i<100,group=Math.floor(i/10),slot=i%10;
 const bay=[0,1,2,8,9,10,0,1,9,10][group];
 const row=group===1||group===2?5:group<6?2:4;
 const s=wall?(bay+.5)*BAY+(slot-4.5)*(BOOK.width+BOOK.gap):0;
 const islandBay=i>=116?0:i<110?1:2;
 const t=wall?0:(islandBay+.5)/4+(i>=116?i-117.5:slot-4.5)*(BOOK.width+BOOK.gap)/((ISLAND.end-ISLAND.start)*ISLAND.r);
 const p=wall?wallRoute(s,ROOM.shelfDepth-BOOK.depth-1.5):islandRoute(t,3.2);
 return {id:book.id,index:i,wall,bay:wall?bay:islandBay,row:wall?row:0,s,t,...p,y:wall?ROOM.base+row*ROOM.pitch+ROOM.shelfThickness:38+ROOM.shelfThickness,width:BOOK.width,height:BOOK.height,depth:BOOK.depth};
 });}
export function auditLayout(books){
 const errors=[],slots=layoutBooks(books);
 for(const b of slots){
  if(b.y<0||b.y+b.height>(b.wall?ROOM.base+(b.row+1)*ROOM.pitch:ISLAND.height))errors.push(`Book ${b.id}: vertical clearance`);
  if(b.wall){const within=b.s-b.bay*BAY;if(within-b.width/2<4||within+b.width/2>BAY-4)errors.push(`Book ${b.id}: divider clearance`);if(BOOK.depth+BOOK.pull>ROOM.shelfDepth)errors.push(`Book ${b.id}: pull support`);}
  else {const u=b.t*4-b.bay,margin=(b.width/2+2)/(ISLAND.r*(ISLAND.end-ISLAND.start)/4);if(u<margin||u>1-margin)errors.push(`Book ${b.id}: island divider clearance`);}
 }
 return {errors,slots};
}
