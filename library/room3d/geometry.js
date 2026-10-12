import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export const materials={
 white:new T.MeshLambertMaterial({color:0xfafafa}),wall:new T.MeshLambertMaterial({color:0xf3f3f3}),
 pale:new T.MeshLambertMaterial({color:0xe9e9e9}),shell:new T.MeshLambertMaterial({color:0xb9b9b9}),
 leather:new T.MeshLambertMaterial({color:0x737373}),metal:new T.MeshLambertMaterial({color:0x777777}),
 leaf:new T.MeshLambertMaterial({color:0x939393,side:T.DoubleSide}),leafLight:new T.MeshLambertMaterial({color:0xb4b4b4,side:T.DoubleSide}),soil:new T.MeshLambertMaterial({color:0x777777})};
const ink=new T.LineBasicMaterial({color:0x969696,transparent:true,opacity:.63});
export function mesh(geo,mat,parent,edges=true){const m=new T.Mesh(geo,mat);parent.add(m);if(edges){const e=new T.LineSegments(new T.EdgesGeometry(geo,32),ink);m.add(e);}return m;}
export function box(parent,x,y,z,w,h,d,mat=materials.white,edges=true){const m=mesh(new T.BoxGeometry(w,h,d),mat,parent,edges);m.position.set(x,y,z);return m;}
export function rounded(parent,x,y,z,w,h,d,r,mat=materials.white){const m=mesh(new RoundedBoxGeometry(w,h,d,4,r),mat,parent,false);m.position.set(x,y,z);return m;}
export function cylinder(parent,x,y,z,r1,r2,h,mat=materials.white){const m=mesh(new T.CylinderGeometry(r1,r2,h,64,1),mat,parent,false);m.position.set(x,y,z);return m;}
export function tube(parent,points,r,mat=materials.metal){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,24,r,6,false),mat,parent,false);}
export function line(parent,points,color=0x898989){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const l=new T.Line(g,new T.LineBasicMaterial({color,transparent:true,opacity:.65}));parent.add(l);return l;}
// Extruded plan in x/z: continuous faces, no triangulation edges on curved caps.
export function plan(parent,points,y,height,mat=materials.white){const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:64});geo.rotateX(-Math.PI/2);const m=mesh(geo,mat,parent);m.position.y=y;return m;}
export function band(parent,route,from,to,y,h,samples=160,mat=materials.white){const outer=[],inner=[];for(let i=0;i<=samples;i++){const a=route(i/samples,from),b=route(i/samples,to);outer.push([a.x,a.z]);inner.push([b.x,b.z]);}return plan(parent,[...outer,...inner.reverse()],y,h,mat);}
function starBase(group,height,span,legs){cylinder(group,0,height/2,0,2,2.8,height,materials.metal);for(let i=0;i<legs;i++){const a=i*2*Math.PI/legs+.3,x=Math.cos(a)*span,z=Math.sin(a)*span;tube(group,[[0,12,0],[x*.6,5,z*.6],[x,2,z]],1.2);cylinder(group,x,1.2,z,2,2,1.8,materials.metal);}}
function pillow(parent,w,d,h,button=true){
 // A rounded, upholstered volume with a gently crowned surface, perimeter welt
 // and two actual button depressions. Local y is thickness, x/z the cushion.
 const g=new T.Group();parent.add(g);
 const geo=new T.SphereGeometry(1,64,32),v=geo.attributes.position;
 const power=x=>Math.sign(x)*Math.pow(Math.abs(x),.38);
 for(let i=0;i<v.count;i++){const x=power(v.getX(i))*w/2,z=power(v.getZ(i))*d/2;let y=power(v.getY(i))*h/2;if(button&&y>0)y-=h*.15*(Math.exp(-((x-w*.2)**2+z*z)/15)+Math.exp(-((x+w*.2)**2+z*z)/15));v.setXYZ(i,x,y,z);}
 geo.computeVertexNormals();mesh(geo,materials.leather,g,false);
 // Piping follows a rounded rectangular perimeter halfway down the edge.
 const points=[],r=8;for(const [cx,cz,start] of [[w/2-r,d/2-r,0],[-w/2+r,d/2-r,90],[-w/2+r,-d/2+r,180],[w/2-r,-d/2+r,270]])for(let j=0;j<=16;j++){const a=(start+j*90/16)*Math.PI/180;points.push([cx+r*Math.cos(a),h*.16,cz+r*Math.sin(a)]);}points.push(points[0]);tube(g,points,.32,materials.shell);
 if(button)for(const x of [-w*.2,w*.2]){const m=mesh(new T.SphereGeometry(1.5,12,8),materials.leather,g,false);m.scale.set(1,.35,1);m.position.set(x,h*.35+.1,0);}
 return g;
}
export function lounge(parent,x,z,rotation=-.16){
 const g=new T.Group();g.name='Eames-inspired lounge assembly';g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);
 // Classic silhouette: approximately 85 cm wide, 83 deep and 80 high.
 starBase(g,29,35,5);
 const seatShell=rounded(g,0,33,0,74,6,66,3,materials.shell);seatShell.rotation.x=.14;
 const seat=pillow(g,68,59,12);seat.position.set(0,40,1);seat.rotation.x=.14;
 const backAssembly=new T.Group();backAssembly.position.set(0,51,-28);backAssembly.rotation.x=-.30;g.add(backAssembly);
 // Local cushion planes rotated upright, with curved plywood shells behind.
 for(const [height,w,h] of [[0,65,28],[27,64,26]]){
  const section=new T.Group();section.position.y=height;section.rotation.x=Math.PI/2;backAssembly.add(section);
  rounded(section,0,-5,0,w+4,4,h+5,1.8,materials.shell);
  const cushion=pillow(section,w,h,10);cushion.position.y=1;
 }
 // Two exposed rear connectors carry the separated back shells.
 for(const sign of [-1,1])tube(g,[[sign*23,32,-19],[sign*25,49,-32],[sign*24,73,-40]],1.3,materials.metal);
 for(const sign of [-1,1]){
  tube(g,[[sign*29,32,6],[sign*35,46,6],[sign*35,48,-12]],1.3);
  const arm=pillow(g,15,41,8,false);arm.position.set(sign*36,50,-1);arm.rotation.z=-sign*.12;arm.rotation.x=.10;
 }
 // Footstool is a separate four-star assembly, not a slab attached to the chair.
 const ott=new T.Group();ott.position.set(0,0,105);g.add(ott);starBase(ott,25,27,4);
 rounded(ott,0,28,0,62,5,48,2.2,materials.shell);const pad=pillow(ott,59,46,11);pad.position.y=35;
 return g;
}
export function desk(parent,x,z){
 const g=new T.Group();g.position.set(x,0,z);parent.add(g);
 const top=[];for(let i=0;i<=48;i++){const a=-Math.PI/2+i*Math.PI/48;top.push([56+Math.cos(a)*24,Math.sin(a)*24]);}for(let i=0;i<=48;i++){const a=Math.PI/2+i*Math.PI/48;top.push([-56+Math.cos(a)*24,Math.sin(a)*24]);}
 plan(g,top,72,3,materials.pale);cylinder(g,-48,35.9,0,15,15,71.8,materials.white);box(g,58,36,0,3,72,3,materials.metal);
 const chair=new T.Group();chair.position.set(0,0,-49);g.add(chair);for(const xx of [-19,19])for(const zz of [-18,18])tube(chair,[[xx,0,zz],[xx*.85,43,zz*.85]],.95);
 rounded(chair,0,44,0,43,4,42,1.8,materials.pale);const back=rounded(chair,0,63,-18,42,37,3,1.4,materials.pale);back.rotation.x=-.12;
}
function planter(parent,x,z,r,h){const g=new T.Group();g.position.set(x,0,z);parent.add(g);cylinder(g,0,h/2,0,r,r*.82,h,materials.pale);cylinder(g,0,h-.7,0,r-1.5,r-1.5,1,materials.soil);const ring=new T.Mesh(new T.TorusGeometry(r-.4,.65,8,64),materials.white);ring.rotation.x=Math.PI/2;ring.position.y=h;g.add(ring);return g;}
// Botanically structured leaf: a heart-shaped blade with deep marginal splits
// and interior fenestrations, gently folded around its own midrib.
function monsteraLeaf(length=31){
 const s=new T.Shape();
 const outline=[[0,0],[-8,-5],[-17,-2],[-20,6],[-19,12],[-6,13],[-20,19],[-18,23],[-5,20],[-15,28],[-11,32],[-3,26],[-8,36],[0,43],[8,36],[3,26],[11,32],[15,28],[5,20],[18,23],[20,19],[6,13],[19,12],[20,6],[17,-2],[8,-5]];
 const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
 outline.forEach((p,i)=>{const before=mix(p,outline[(i+outline.length-1)%outline.length],.24),after=mix(p,outline[(i+1)%outline.length],.24);if(i)s.lineTo(...before);else s.moveTo(...before);s.quadraticCurveTo(...p,...after);});s.closePath();
 for(const side of [-1,1])for(const [y,r] of [[9,2.3],[17,1.7]]){const hole=new T.Path();hole.absellipse(side*4.8,y,r,3.1,0,Math.PI*2,true);s.holes.push(hole);}
 const geo=new T.ShapeGeometry(s,32),positions=geo.attributes.position;
 for(let i=0;i<positions.count;i++){const xx=positions.getX(i),yy=positions.getY(i);positions.setXYZ(i,xx*length/43,Math.abs(xx)*.16+yy*yy*.002,yy*length/43);}
 geo.computeVertexNormals();return geo;
}
export function monstera(parent,x,z){const g=planter(parent,x,z,24,31);g.name='Monstera deliciosa';for(let i=0;i<11;i++){
 const a=i*2.399,r=18+(i%3)*7,h=52+(i%4)*13,end=[Math.cos(a)*r,h,Math.sin(a)*r];
 tube(g,[[0,30,0],[end[0]*.25,h*.82,end[2]*.25],end],.7,materials.leaf);
 const leaf=mesh(monsteraLeaf(30+(i%3)*6),i%2?materials.leaf:materials.leafLight,g,false);leaf.position.set(...end);leaf.rotation.y=-a+Math.PI/2;leaf.rotation.x=.3+(i%3)*.12;
 const vein=[];for(let j=0;j<=12;j++)vein.push([0,.4+j*j*.012,j*2.5]);const mid=line(leaf,vein,0x727272);
 }return g;}
export function ficus(parent,x,z){const g=planter(parent,x,z,20,36);g.name='Ficus lyrata';tube(g,[[0,35,0],[-3,68,1],[4,110,-2],[0,159,1]],1.25,materials.shell);
 for(let i=0;i<19;i++){const a=i*2.399,y=69+i*4.7,r=15+(i%4)*4,tip=[Math.cos(a)*r,y+10,Math.sin(a)*r];tube(g,[[0,y-5,0],[tip[0]*.6,y,tip[2]*.6],tip],.48,materials.shell);
  const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-7,2,-12,10,-6,16);shape.bezierCurveTo(-9,25,-6,32,0,35);shape.bezierCurveTo(7,31,10,25,6,16);shape.bezierCurveTo(12,10,7,2,0,0);
  const geo=new T.ShapeGeometry(shape,20),pos=geo.attributes.position;for(let j=0;j<pos.count;j++){let xx=pos.getX(j),yy=pos.getY(j);pos.setXYZ(j,xx,yy*.28+Math.abs(xx)*.12,yy);}geo.computeVertexNormals();
  const leaf=mesh(geo,i%2?materials.leaf:materials.leafLight,g,false);leaf.position.set(...tip);leaf.rotation.y=-a+Math.PI/2;line(leaf,[[0,.3,0],[0,5.2,17],[0,10,35]],0x7b7b7b);
 }return g;}
