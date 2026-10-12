/* Original axonometric library, following Arthur's approved October 12 concept.
   Geometry is vector-native; the catalog remains the only bibliographic source. */
const root=document.querySelector('.library-room');
if(root) initRoom();
function initRoom(){
 const books=JSON.parse(document.querySelector('#room-books-data').textContent);
 const NS='http://www.w3.org/2000/svg', viewport=root.querySelector('.room-viewport');
 function el(tag,attrs={},parent,text){const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(text)n.textContent=text;parent?.append(n);return n;}
 const svg=el('svg',{viewBox:'35 45 930 730',role:'group','aria-label':'Isometric library. Use arrow keys to browse books and Enter to open.'},viewport);
 const scene=el('g',{'class':'room-scene'},svg);
 const P=([x,y,z=0])=>[500+(x-y)*.85,305+(x+y)*.43-z*.85];
 const path=pts=>'M'+pts.map(p=>P(p).map(v=>v.toFixed(2)).join(',')).join('L')+'Z';
 function face(pts,fill='#fff',parent=scene,attrs={}){return el('path',{d:path(pts),fill,...attrs},parent);}
 function line(pts,parent=scene,attrs={}){return el('path',{d:path(pts).slice(0,-1),fill:'none',...attrs},parent);}
 function box(x,y,z,w,d,h,fill='#f7f7f5',parent=scene){
  face([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],'#f0f0ed',parent);
  face([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],fill,parent);
  face([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],fill,parent);
 }
 function slab(points,z,h,fill='#fff',parent=scene){
  // One continuous edge, including curved furniture: no mesh seams on top.
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((b[1]-a[1])-(b[0]-a[0])<=0)continue;face([[...a,z],[...b,z],[...b,z-h],[...a,z-h]],'#f2f2ef',parent,{stroke:'none'});line([[...a,z-h],[...b,z-h]],parent);}
  face(points.map(([x,y])=>[x,y,z]),fill,parent);
 }
 function ellipse(cx,cy,rx,ry){return Array.from({length:64},(_,i)=>{const a=i*Math.PI/32;return[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry];});}
 // Continuous wall route, straight wings joined by a quarter circle.
 const route=[];
 for(let y=472;y>=140;y-=4)route.push([20,y,1,0]);
 for(let i=1;i<=48;i++){const a=Math.PI+i*Math.PI/96;route.push([140+120*Math.cos(a),140+120*Math.sin(a),-Math.cos(a),-Math.sin(a)]);}
 for(let x=144;x<=472;x+=4)route.push([x,20,0,1]);
 const offset=d=>route.map(([x,y,nx,ny])=>[x+nx*d,y+ny*d]);
 const ribbon=(d1,d2)=>[...offset(d1),...offset(d2).toReversed()];
 // Floor and two thick walls are solid silhouettes; shelving never shows through.
 slab([[0,0],[500,0],[500,500],[0,500]],0,9);
 face([...offset(0).map(([x,y])=>[x,y,0]),...offset(0).toReversed().map(([x,y])=>[x,y,260])],'#fafaf8');
 slab(ribbon(-17,0),260,4,'#fff');
 for(const idx of [0,route.length-1]){const [x,y,nx,ny]=route[idx];face([[x,y,0],[x-nx*17,y-ny*17,0],[x-nx*17,y-ny*17,260],[x,y,260]],'#f5f5f2');}
 const levels=[8,42,76,110,144,178,212,246];
 for(const z of levels)slab(ribbon(0,26),z,2.2);
 const at=t=>route[Math.round(Math.max(0,Math.min(1,t))*(route.length-1))];
 for(const t of [0,.13,.26,.39,.52,.65,.78,.91,1]){
  const [x,y,nx,ny]=at(t),tx=ny,ty=-nx;
  slab([[x,y],[x+nx*27,y+ny*27],[x+nx*27+tx*2,y+ny*27+ty*2],[x+tx*2,y+ty*2]],249,241);
 }
 const targets=[],art=[],pulls=[];
 function volume(book,index,x,y,z,tx,ty,nx,ny){
  const w=4.3,d=17,h=25,g=el('g',{'class':'room-volume','data-book-id':book.id},scene);
  const v=(a,b,c)=>[x+tx*a+nx*b,y+ty*a+ny*b,z+c];
  // Consistent dimensions and face layout for every catalog volume.
  face([v(0,0,h),v(w,0,h),v(w,d,h),v(0,d,h)],'#faf9f6',g);
  face([v(w,0,0),v(w,d,0),v(w,d,h),v(w,0,h)],'#eeede8',g);
  const spine=[v(0,d,0),v(w,d,0),v(w,d,h),v(0,d,h)];
  face(spine,book.cloth||'#a3a29a',g,{'class':'room-spine'});
    line([v(w*.5,d,h-4),v(w*.5,d,5)],g,{stroke:book.foil||'#eee','stroke-width':.5,opacity:.55});
  const origin=P([0,0,0]),out=P([nx*7,ny*7,0]);pulls[index]=[out[0]-origin[0],out[1]-origin[1]];
  const target=el('path',{d:path(spine),fill:'transparent',stroke:'transparent','stroke-width':.2,'class':'room-book-target',role:'button',tabindex:index===0?0:-1,'aria-label':`${book.title}, ${book.author}`,'data-index':index},scene);
  el('title',{},target,`${book.title} — ${book.author}`);
  target.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')select(index);});
  target.addEventListener('focus',()=>select(index));
  target.addEventListener('click',e=>{if(dragged)return;select(index);if(e.pointerType!=='touch'&&lastPointerType!=='touch')open(index);});
  target.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(index);}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const next=(index+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+books.length)%books.length;targets[next].focus();ensureVisible(next);}else if(e.key==='Escape'){select(-1);}});
  targets[index]=target;art[index]=g;
 }
 // Ten compact groups in wall niches; remaining volumes belong to the low island.
 books.slice(0,100).forEach((b,i)=>{
  const group=Math.floor(i/10),t=.055+(group%5)*.182, [x,y,nx,ny]=at(t),tx=ny,ty=-nx;
  volume(b,i,x+nx*6+tx*(i%10)*5.2,y+ny*6+ty*(i%10)*5.2,levels[1+Math.floor(group/5)*2]+.4,tx,ty,nx,ny);
 });
 // Lounge chair and ottoman: molded shell, dark cushions, thin star bases.
 function chair(cx,cy,scale=1,ottoman=false){
  const g=el('g',{'class':ottoman?'room-ottoman':'room-lounge'},scene),w=ottoman?38:43,d=ottoman?29:39;
  const transform=(x,y,z)=>[cx+x*scale,cy+y*scale,z*scale];
  for(const [x,y] of [[-24,-16],[24,16],[-24,16],[24,-16]])line([transform(0,0,13),transform(x,y,1)],g,{stroke:'#4e4b47','stroke-width':2});
  const cushion=(pts,fill)=>{const q=pts.map(p=>P(transform(...p))),mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];let d='';q.forEach((p,i)=>{const before=mix(p,q[(i+q.length-1)%q.length],.16),after=mix(p,q[(i+1)%q.length],.16);d+=(i?'L':'M')+before.join(',')+'Q'+p.join(',')+' '+after.join(',');});return el('path',{d:d+'Z',fill,'stroke-width':.8},g);};
  cushion([[-w/2,-d/2,22],[w/2,-d/2,22],[w/2,d/2,19],[-w/2,d/2,19]],'#8d7c6c');
  cushion([[-w/2,-d/2,26],[w/2,-d/2,26],[w/2,d/2,23],[-w/2,d/2,23]],'#494947');
  if(!ottoman){
   cushion([[-23,-d/2,24],[23,-d/2,24],[25,-d/2-11,66],[-25,-d/2-11,66]],'#8d7c6c');
   cushion([[-21,-d/2+1,28],[21,-d/2+1,28],[22,-d/2-5,45],[-22,-d/2-5,45]],'#494947');
   cushion([[-22,-d/2-6,47],[22,-d/2-6,47],[21,-d/2-10,63],[-21,-d/2-10,63]],'#494947');
   for(const sign of [-1,1])line([transform(sign*24,0,33),transform(sign*20,2,22)],g,{stroke:'#605b53','stroke-width':1.5});
   for(const sign of [-1,1])cushion([[sign*22,-11,35],[sign*29,-11,35],[sign*29,15,32],[sign*22,15,32]],'#494947');
  }
 }
 chair(335,167,1.3);chair(338,227,1.1,true);
 // Low S-curve island. Its unbroken top remains well below the lounge back.
 const island=Array.from({length:61},(_,i)=>{const x=143+i*3.4;return[x,290+24*Math.sin((i/60-.5)*Math.PI)];});
 const islandBand=depth=>island.map(([x,y])=>[x,y+depth]);
 const islandOutline=[...islandBand(0),...islandBand(30).toReversed()];
 face([...island.map(([x,y])=>[x,y,0]),...island.toReversed().map(([x,y])=>[x,y,63])],'#fafaf8');
 for(const z of [5,34])slab(islandOutline,z,2.5);
 for(const i of [0,20,40,60]){const [x,y]=island[i];box(x,y,5,2,30,58);}
 slab(islandOutline,65,2.5);
 books.slice(100).forEach((b,j)=>{const x=150+(j%10)*6.1+(j>=10?136:0),a=((x-143)/204-.5)*Math.PI,y=290+24*Math.sin(a),slope=24*Math.PI/204*Math.cos(a),length=Math.hypot(1,slope),tx=1/length,ty=slope/length;volume(b,100+j,x-ty*8,y+tx*8,7,tx,ty,-ty,tx);});
 // Desk and tucked-in chair, kept clear of the island and room edge.
 box(280,390,0,2,2,29,'#666');box(305,390,0,2,2,29,'#666');
 box(280,410,0,2,2,29,'#666');box(305,410,0,2,2,29,'#666');
 slab([[277,388],[310,388],[310,413],[277,413]],30,3,'#575653');
 face([[277,388,29],[310,388,29],[310,386,57],[277,386,57]],'#575653');
 slab(ellipse(254,441,13,14),48,48,'#f5f5f2');
 box(354,436,0,2.5,2.5,49,'#555');
 // Rounded racetrack desk, one continuous thin top.
 const desk=[];for(let i=0;i<=24;i++){let a=-Math.PI/2+i*Math.PI/24;desk.push([346+Math.cos(a)*21,441+Math.sin(a)*21]);}for(let i=0;i<=24;i++){let a=Math.PI/2+i*Math.PI/24;desk.push([249+Math.cos(a)*21,441+Math.sin(a)*21]);}
 slab(desk,51,2.4,'#a18d7c');
 // Two restrained botanical silhouettes: airy tree and split-leaf plant.
 function plant(cx,cy,tall){
  const g=el('g',{'class':'room-plant'},scene);slab(ellipse(cx,cy,tall?12:18,tall?12:18),tall?30:22,tall?30:22,'#f6f6f2',g);
  face(ellipse(cx,cy,tall?9:14,tall?9:14).map(([x,y])=>[x,y,tall?30:22]),'#77796a',g);
  const [sx,sy]=P([cx,cy,tall?30:22]);
  const count=tall?30:11;
  for(let i=0;i<count;i++){
   const angle=i*2.399,rad=tall?8+(i%5)*4:13+(i%3)*9,height=tall?35+i*2.4:18+(i%4)*7;
   const [ex,ey]=P([cx+Math.cos(angle)*rad,cy+Math.sin(angle)*rad,(tall?30:22)+height]);
   el('path',{d:`M${sx},${sy} Q${sx+(ex-sx)*.25},${ey+12} ${ex},${ey}`,fill:'none',stroke:'#83836e','stroke-width':tall?.75:1},g);
   el('ellipse',{cx:ex,cy:ey,rx:tall?3:8,ry:tall?6:12,fill:'#868b67',stroke:'none',transform:`rotate(${i*47} ${ex} ${ey})`},g);
  }
 }
 plant(130,480,true);plant(455,105,false);
 // Interactive state is independent of the SVG geometry and catalog order.
 let selected=-1,dragged=false,scale=1,panX=0,panY=0,gesture=null,lastFocus=null,lastPointerType='mouse';
 const selection=root.querySelector('.room-selection-label'),openButton=root.querySelector('[data-room-open]');
 function select(i){if(selected>=0){art[selected].style.transform='';targets[selected].setAttribute('tabindex','-1');targets[selected].classList.remove('is-selected');}selected=i;openButton.hidden=i<0;selection.textContent=i<0?'':`${books[i].title} — ${books[i].author}`;if(i>=0){art[i].style.transform=`translate(${pulls[i][0]}px,${pulls[i][1]}px)`;targets[i].setAttribute('tabindex','0');targets[i].classList.add('is-selected');}}
 const dialog=document.querySelector('.room-dialog');
 function open(i){select(i);const b=books[i];lastFocus=document.activeElement;dialog.querySelector('#room-book-title').textContent=b.title;dialog.querySelector('.room-book-author').textContent=b.author;dialog.querySelector('.room-cover-title').textContent=b.title;dialog.querySelector('.room-cover-author').textContent=b.author;dialog.querySelector('.room-cover').style.background=b.cloth||'#58716c';dialog.querySelector('.room-cover').style.color=b.foil||'#fff';const metadata=dialog.querySelector('.room-book-metadata');metadata.replaceChildren();for(const text of [b.year&&String(b.year),b.read_month&&`Read in ${b.read_month}`,b.rating&&`${'★'.repeat(b.rating)}${'☆'.repeat(5-b.rating)}`,b.review]){if(text){const p=document.createElement('p');p.textContent=text;metadata.append(p);}}dialog.showModal();}
 openButton.addEventListener('click',()=>{if(selected>=0)open(selected);});
 dialog.querySelector('.room-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{const destination=lastFocus?.getClientRects().length?lastFocus:root.querySelector('input');destination?.focus({preventScroll:true});});
 function updateView(){const maxX=465*(scale-1),maxY=365*(scale-1);panX=Math.max(-maxX,Math.min(maxX,panX));panY=Math.max(-maxY,Math.min(maxY,panY));scene.setAttribute('transform',`translate(${500+panX} ${410+panY}) scale(${scale}) translate(-500 -410)`);root.dataset.zoom=String(scale);root.querySelector('[data-room-reset]').textContent=`${scale}×`;root.querySelector('[data-room-minus]').disabled=scale===1;root.querySelector('[data-room-plus]').disabled=scale===3;viewport.classList.toggle('is-zoomed',scale>1);}
 function ensureVisible(i){if(scale===1)return;const r=targets[i].getBBox();panX=(500-r.x-r.width/2)*scale;panY=(410-r.y-r.height/2)*scale;updateView();}
 root.querySelector('[data-room-plus]').addEventListener('click',()=>{scale=Math.min(3,scale+.5);if(selected>=0)ensureVisible(selected);else updateView();});
 root.querySelector('[data-room-minus]').addEventListener('click',()=>{scale=Math.max(1,scale-.5);updateView();});
 root.querySelector('[data-room-reset]').addEventListener('click',()=>{scale=1;panX=panY=0;updateView();});
 viewport.addEventListener('pointerdown',e=>{lastPointerType=e.pointerType;dragged=false;if(scale===1||e.button!==0)return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,px:panX,py:panY};});
 viewport.addEventListener('pointermove',e=>{if(!gesture||e.pointerId!==gesture.id)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(Math.hypot(dx,dy)>5){dragged=true;viewport.setPointerCapture(e.pointerId);}if(dragged){panX=gesture.px+dx*930/viewport.clientWidth;panY=gesture.py+dy*930/viewport.clientWidth;updateView();}});
 // Small-screen touch rounding can miss a narrow spine. Resolve a nearby tap
 // to the closest visible book, without enlarging overlapping SVG hit regions.
 viewport.addEventListener('click',e=>{if(dragged||lastPointerType!=='touch'||e.target.closest('.room-book-target'))return;let nearest=-1,distance=24;targets.forEach((target,i)=>{const r=target.getBoundingClientRect(),dx=e.clientX-(r.x+r.width/2),dy=e.clientY-(r.y+r.height/2),d=Math.hypot(dx,dy);if(d<distance){distance=d;nearest=i;}});if(nearest>=0)select(nearest);});
 function end(){if(gesture&&viewport.hasPointerCapture(gesture.id))viewport.releasePointerCapture(gesture.id);gesture=null;}
 viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('lostpointercapture',()=>{gesture=null;});window.addEventListener('blur',end);window.addEventListener('resize',end);
 const search=root.querySelector('input'),results=root.querySelector('.room-results');
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 search.addEventListener('input',()=>{results.replaceChildren();const q=normalize(search.value.trim());results.hidden=!q;if(!q)return;const matches=books.map((b,i)=>({b,i})).filter(({b})=>normalize(b.title+' '+b.author).includes(q));if(!matches.length){results.textContent='No matching books.';return;}for(const {b,i} of matches){const button=document.createElement('button');button.type='button';button.textContent=`${b.title} — ${b.author}`;button.addEventListener('click',()=>{select(i);ensureVisible(i);results.hidden=true;open(i);});results.append(button);}});
 search.addEventListener('keydown',e=>{if(e.key==='Escape'){results.hidden=true;search.value='';}if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('button')?.focus();}});
 results.addEventListener('keydown',e=>{const buttons=[...results.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}if(e.key==='Escape'){results.hidden=true;search.focus();}});
 updateView();root.hidden=false;
}
