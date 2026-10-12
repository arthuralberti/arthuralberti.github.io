import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {ROOM,BOOK,LENGTH,BAYS,BAY,ISLAND,wallRoute,islandRoute,auditLayout} from './model.js';
import {materials,mesh,box,rounded,band,lounge,desk,monstera,ficus} from './geometry.js';
const root=document.querySelector('.library-room');
if(root)mount();
function mount(){
 const books=JSON.parse(document.querySelector('#room-books-data').textContent),report=auditLayout(books);
 if(report.errors.length)throw Error(report.errors.join('\n'));
 const viewport=root.querySelector('.room-viewport'),readout=root.querySelector('.room-selection-label');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let renderer;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power',preserveDrawingBuffer:true});}
 catch(error){root.hidden=false;root.dataset.render='fallback';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xffffff,1);
 renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene(),camera=new T.OrthographicCamera();camera.position.set(890,750,920);camera.lookAt(240,90,240);
 // Broad ambient illumination with a gentle fill: no spotlights or hard shadows.
 scene.add(new T.AmbientLight(0xffffff,1.24));scene.add(new T.HemisphereLight(0xffffff,0xe0e2de,.82));
 const fill=new T.DirectionalLight(0xffffff,.65);fill.position.set(-200,800,400);scene.add(fill);
 const layers={};for(const name of ['floor','walls','shelves','furniture','plants','books']){const group=new T.Group();group.name=name;scene.add(group);layers[name]=group;}
 // The slab ends exactly where both shelving wings end: no surrounding plinth.
 box(layers.floor,ROOM.size/2,-2,ROOM.size/2,ROOM.size,4,ROOM.size,materials.white);
 const route=(t,d)=>wallRoute(t*LENGTH,d);
 band(layers.walls,route,-ROOM.wall,0,0,ROOM.height,240,materials.wall);
 // One cap, no tessellation seams or faux construction joints.
 band(layers.walls,route,-ROOM.wall,ROOM.shelfDepth,ROOM.height,3,240);
 for(let row=0;row<8;row++)band(layers.shelves,route,0,ROOM.shelfDepth,ROOM.base+row*ROOM.pitch,ROOM.shelfThickness,240);
 for(let bay=0;bay<=BAYS;bay++){
  const p=wallRoute(bay*BAY,ROOM.shelfDepth/2),h=ROOM.height-ROOM.base;
  const m=box(layers.shelves,p.x,ROOM.base+h/2,p.z,2.2,h,ROOM.shelfDepth);m.rotation.y=Math.atan2(-p.tz,p.tx);
 }
 const island=(t,d)=>islandRoute(t,d);
 band(layers.shelves,island,0,2,ROOM.base,ISLAND.height-ROOM.base,128,materials.wall);
 for(const y of [ROOM.base,38,ISLAND.height])band(layers.shelves,island,0,ISLAND.depth,y,ROOM.shelfThickness,128);
 for(let i=0;i<=ISLAND.bays;i++){const p=islandRoute(i/ISLAND.bays,ISLAND.depth/2);const m=box(layers.shelves,p.x,(ROOM.base+ISLAND.height)/2,p.z,2.2,ISLAND.height-ROOM.base,ISLAND.depth);m.rotation.y=Math.atan2(-p.tz,p.tx);}
 lounge(layers.furniture,376,111,-.18);desk(layers.furniture,198,431);
 ficus(layers.plants,90,411);monstera(layers.plants,443,294);
 const objects=[];
 // Each book has a page block, two covers and a rounded spine, inside one bay.
 for(const slot of report.slots){
  const group=new T.Group();group.name=books[slot.index].title;group.position.set(slot.x,slot.y,slot.z);group.rotation.y=Math.atan2(-slot.tz,slot.tx);group.userData.index=slot.index;
  layers.books.add(group);const w=BOOK.width,h=BOOK.height,d=BOOK.depth;
  const value=.58+(slot.index%6)*.055,cover=new T.MeshLambertMaterial({color:new T.Color(value,value,value)});
  box(group,0,h/2,d/2,w-.5,h-.9,d-.65,materials.white,false);
  for(const side of [-1,1])box(group,side*(w/2-.12),h/2,d/2,.24,h,d,cover,false);
  rounded(group,0,h/2,d-.25,w,h,.5,.22,cover);
  // Two embossed binding rules stay wholly on the spine face.
  for(const y of [3.2,h-3.2])box(group,0,y,d+.015,w*.64,.16,.06,materials.pale,false);
  // Consolidate the page/rule and binding pieces into two draws per book.
  const pieces=[...group.children];for(const material of [materials.white,materials.pale,cover]){const parts=pieces.filter(o=>o.material===material);if(!parts.length)continue;const geos=parts.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix).toNonIndexed();});mesh(mergeGeometries(geos),material,group,false);for(const o of parts){group.remove(o);o.geometry.dispose();}geos.forEach(g=>g.dispose());}
  group.userData.rest=group.position.clone();group.userData.normal=new T.Vector3(slot.nx,0,slot.nz);
  objects.push(group);
 }
 viewport.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const hitLayer=root.querySelector('.room-hit-layer'),buttons=[];
 // Transparent, positioned HTML targets preserve keyboard semantics without
 // recreating 3D faces. Pointer selection uses depth-tested mesh raycasting.
 for(let i=0;i<books.length;i++){const b=document.createElement('button');b.type='button';b.className='room-book-target';b.tabIndex=i===0?0:-1;b.dataset.index=i;b.setAttribute('aria-label',`${books[i].title}, ${books[i].author}`);b.addEventListener('focus',()=>select(i));b.addEventListener('click',()=>open(i));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const j=(i+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+books.length)%books.length;buttons[j].focus();}if(e.key==='Escape')select(-1);});hitLayer.append(b);buttons.push(b);}
 const ray=new T.Raycaster(),pointer=new T.Vector2();let selected=-1,frame=0,last=0,onscreen=true;
 function render(){renderer.render(scene,camera);}
 function positionTargets(){scene.updateMatrixWorld(true);objects.forEach((g,i)=>{const p=new T.Vector3(0,BOOK.height/2,BOOK.depth).applyMatrix4(g.matrixWorld).project(camera);buttons[i].style.left=`${(p.x+1)*50}%`;buttons[i].style.top=`${(1-p.y)*50}%`;});}
 function fit(){const w=viewport.clientWidth;if(!w)return;const h=Math.round(w*.82);renderer.setSize(w,h,false);const aspect=w/h,span=645;camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.near=.1;camera.far=3000;camera.updateProjectionMatrix();positionTargets();render();}
 function animate(time){frame=0;const dt=Math.min(.05,(time-last)/1000||.016);last=time;let moving=false;
  objects.forEach((g,i)=>{const destination=g.userData.rest.clone().addScaledVector(g.userData.normal,i===selected?BOOK.pull:0),distance=g.position.distanceTo(destination);if(distance>.003){g.position.lerp(destination,reduced.matches?1:1-Math.exp(-dt*17));moving=true;}else g.position.copy(destination);});
  render();positionTargets();if(moving&&onscreen)frame=requestAnimationFrame(animate);
 }
 function select(i){if(i===selected)return;selected=i;readout.textContent=i<0?'':`${books[i].title} — ${books[i].author}`;readout.classList.remove('is-changing');void readout.offsetWidth;readout.classList.add('is-changing');buttons.forEach((b,j)=>{b.tabIndex=j===i||i<0&&j===0?0:-1;b.setAttribute('aria-pressed',String(j===i));});root.dataset.selected=String(i);if(!frame)frame=requestAnimationFrame(animate);}
 function pick(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(scene.children,true).filter(h=>h.object.isMesh);if(!hits.length)return -1;let item=hits[0].object;while(item&&item.userData.index===undefined)item=item.parent;return item?.userData.index??-1;}
 let down=null,touchSelection=-1;
 viewport.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){const i=pick(e);viewport.style.cursor=i>=0?'pointer':'default';select(i);}});
 viewport.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!dialog.open)select(-1);});
 viewport.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
 viewport.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>8){down=null;return;}down=null;let i=pick(e);if(e.pointerType==='touch'){
  // Only visible books are eligible for touch proximity; never select through
  // a wall or shelf. Check the same ray at every candidate's projected center.
  let best=16;buttons.forEach((b,j)=>{const r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,d=Math.hypot(x-e.clientX,y-e.clientY);if(d<best&&pick({clientX:x,clientY:y})===j){best=d;i=j;}});
 }if(i<0)return;select(i);if(e.pointerType==='touch'){if(touchSelection===i)open(i);touchSelection=i;}else open(i);});
 viewport.addEventListener('pointercancel',()=>{down=null;});
 const dialog=document.querySelector('.room-dialog');let lastFocus=null;
 function open(i){select(i);const b=books[i];lastFocus=document.activeElement;dialog.querySelector('#room-book-title').textContent=b.title;dialog.querySelector('.room-book-author').textContent=b.author;dialog.querySelector('.room-cover-title').textContent=b.title;dialog.querySelector('.room-cover-author').textContent=b.author;const details=dialog.querySelector('.room-book-metadata');details.replaceChildren();for(const text of [b.year&&String(b.year),b.read_month&&`Read in ${b.read_month}`,b.rating&&`${'★'.repeat(b.rating)}${'☆'.repeat(5-b.rating)}`,b.review])if(text){const p=document.createElement('p');p.textContent=text;details.append(p);}dialog.showModal();}
 dialog.querySelector('.room-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{lastFocus?.focus({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 const observer=new IntersectionObserver(([entry])=>{onscreen=entry.isIntersecting;if(!onscreen&&frame){cancelAnimationFrame(frame);frame=0;}else if(onscreen&&!frame)frame=requestAnimationFrame(animate);});observer.observe(viewport);
 new ResizeObserver(fit).observe(viewport);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();root.dataset.render='fallback';if(frame)cancelAnimationFrame(frame);});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{root.dataset.render='webgl';fit();});
 root.hidden=false;root.dataset.render='webgl';fit();
 // Read-only geometry diagnostics use the rendered model, not duplicate data.
 root.roomDiagnostics=()=>{scene.updateMatrixWorld(true);return{errors:report.errors,books:objects.map((g,i)=>{const p=new T.Vector3(0,BOOK.height/2,BOOK.depth+.04).applyMatrix4(g.matrixWorld).project(camera),r=renderer.domElement.getBoundingClientRect(),x=r.x+(p.x+1)*r.width/2,y=r.y+(1-p.y)*r.height/2;return{id:books[i].id,index:i,x,y,visible:pick({clientX:x,clientY:y})===i,position:g.position.toArray(),rest:g.userData.rest.toArray()};}),layers:Object.keys(layers),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};};
}
