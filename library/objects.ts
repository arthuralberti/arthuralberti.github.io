/* Hairline-derived drawing geometry. See hairline/LICENSE and hairline/README.md. */
import {Cam,proj,fit,rad,hull,poly,seg,type Vec2} from './hairline/core/iso';
import {scene,tray,card,pose,N,W,H,G,REST,LIFT} from './hairline/figures/riffle-geometry';
const NS='http://www.w3.org/2000/svg';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function el(tag:string,attrs:Record<string,any>={},parent?:Element,text?:string){const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text)n.textContent=text;parent?.append(n);return n as any;}
function html(tag:string,cls:string,parent:Element,text?:string){const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;}
function stage(parent:Element,label:string){const s=html('div','object-stage',parent);s.tabIndex=0;s.setAttribute('role','group');s.setAttribute('aria-label',label);const svg=el('svg',{viewBox:'0 0 400 320',role:'group','aria-label':label},s);return {s,svg};}
function point(svg:SVGSVGElement,e:PointerEvent):Vec2 {const m=svg.getScreenCTM();if(!m)return [0,0];const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());return [p.x,p.y];}
function paths(parent:Element,items:[string,string][]){for(const [d,cls] of items)el('path',{d,class:cls},parent);}
function tween(from:number,to:number,draw:(v:number)=>void,duration=600,complete=()=>{}){if(reduced.matches){draw(to);complete();return ()=>{};}let frame=0;const start=performance.now();function step(t:number){const f=Math.min(1,(t-start)/duration);draw(from+(to-from)*(1-Math.pow(1-f,3)));if(f<1)frame=requestAnimationFrame(step);else complete();}frame=requestAnimationFrame(step);return ()=>cancelAnimationFrame(frame);}

// The Riffle tray, cards, tab positions, projection and lean follow Hairline's geometry.
type Paper={slug:string,title:string,authors:string,year:string,venue:string,paper_url:string,note:string};
function fileBox(parent:Element,label:string,papers:Paper[]){
 const box=html('section','collection-object',parent);
 const {s,svg}=stage(box,`${label}: use arrow keys to browse papers; Enter selects a paper`);s.style.cursor='default';
 svg.setAttribute('viewBox','0 36 400 252');
 const {P,front,outer,inner}=scene(),body=tray(P,front,outer,inner);paths(svg,body.far);
 const groups=papers.map((paper,j)=>{const i=N-papers.length+j,shape=card(i),g=el('g',{class:'folder-art'},svg);const back=el('path',{class:'sil lo'},g),face=el('path',{class:'sil'},g),head=el('path',{class:'nf'},g),rules=el('path',{class:'nf lo'},g);return {i,shape,g,back,face,head,rules,angle:REST,lift:0};});
 paths(svg,body.near);
 let active=-1,stop=()=>{};
 function draw(){groups.forEach(q=>{const p=pose(P,q.i,q.shape.t0,q.shape.shape,q.angle,q.lift);q.back.setAttribute('d',p.back);q.face.setAttribute('d',p.face);q.head.setAttribute('d',p.head);q.rules.setAttribute('d',p.rules);});}
 function select(j:number){if(j===active)return;active=j;stop();const starts=groups.map(q=>[q.angle,q.lift]);const targets=groups.map((q,k)=>[j<0?REST:k<j?-24:k>j?20:0,k===j?LIFT:0]);stop=tween(0,1,f=>{groups.forEach((q,k)=>{q.angle=starts[k][0]+(targets[k][0]-starts[k][0])*f;q.lift=starts[k][1]+(targets[k][1]-starts[k][1])*f;q.face.classList.toggle('hi',k===j);});draw();});}

 function navigate(j:number){
  select(j);
  const article=document.getElementById(`paper-${papers[j].slug}`);
  if(!article)return;
  const header=document.querySelector('.site-identity'),rect=header?.getBoundingClientRect();
  const fixed=header&&getComputedStyle(header).position==='fixed'&&rect!.width>innerWidth*.7;
  const offset=fixed?rect!.bottom+18:18;
  article.style.scrollMarginTop=`${offset}px`;
  // Leave enough scroll range to align even the final record below the header.
  const page=document.querySelector<HTMLElement>('.favorite-papers-page')!;
  const previousPadding=parseFloat(page.style.paddingBottom)||0;
  const remaining=document.documentElement.scrollHeight-previousPadding-(article.getBoundingClientRect().top+scrollY);
  page.style.paddingBottom=`${Math.max(0,innerHeight-offset-remaining)}px`;
  document.querySelectorAll('.favorite-paper').forEach(p=>p.classList.toggle('is-paper-selected',p===article));
  history.replaceState(null,'',`#${article.id}`);
  article.focus({preventScroll:true});
  document.documentElement.style.scrollBehavior=reduced.matches?'auto':'';
  article.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});
 }
 const targets=groups.map((q,j)=>{const y=q.i*G+H*Math.sin(rad(REST)),z=H*Math.cos(rad(REST));const corners=[P(-5,y-G/2,z),P(W+5,y-G/2,z),P(W+5,y+G/2,z),P(-5,y+G/2,z)];const target=el('path',{class:'file-target',d:poly(corners),tabindex:0,role:'button','aria-label':`${papers[j].authors}, ${papers[j].year}: ${papers[j].title}`},svg);target.addEventListener('pointerenter',()=>select(j));target.addEventListener('focus',()=>select(j));target.setAttribute('aria-controls',`paper-${papers[j].slug}`);target.addEventListener('click',()=>navigate(j));target.addEventListener('keydown',(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navigate(j);}});return target;});
 s.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const step=['ArrowLeft','ArrowUp'].includes(e.key)?-1:1;const next=Math.max(0,Math.min(papers.length-1,active<0?0:active+step));targets[next].focus();}if(e.key==='Escape'){select(-1);s.focus();}});
 draw();
 return ()=>{stop();box.remove();};
}
const paperRoot=document.querySelector<HTMLElement>('[data-paper-files]');
if(paperRoot){const papers:Paper[]=JSON.parse(document.querySelector('#paper-files-data')!.textContent!);fileBox(paperRoot,'Favorite Papers',papers);}

// Sort individual visible faces by camera depth; keep interaction nodes stable.
function shelfScene(parent:Element){
 const {s,svg}=stage(parent,'Open the library');
 svg.setAttribute('viewBox','0 12 400 300');
 s.style.cursor='pointer';
 type V3=[number,number,number];
 type Solid={v:V3[],kind:string,side:number};
 const solids:Solid[]=[];
 function solid(x:number,y:number,z:number,w:number,d:number,h:number,kind='shelf-frame',side=0){
  if(w>12&&!kind.includes("shelf-stack")){for(let offset=0;offset<w;offset+=8)solid(x+offset,y,z,Math.min(8,w-offset),d,h,kind+' shelf-panel',side);return;}
  if(h>30){for(let offset=0;offset<h;offset+=29)solid(x,y,z+offset,w,d,Math.min(29,h-offset),kind+' shelf-panel',side);return;}
  solids.push({v:[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],kind,side});
 }
 solid(-88,-34,0,176,68,4);solid(-83,-29,4,166,58,4);
 solid(-84,-29,8,4,58,122);solid(80,-29,8,4,58,122);
 solid(-80,-1,8,160,2,122,'shelf-divider');
 for(let row=0;row<4;row++){
  const z=9+row*29;solid(-80,-29,z,160,58,3);
  for(const side of [-1,1]){
   let x=-77,book=0;
   if(row%2===0){
    for(let layer=0;layer<4;layer++)solid(-18,side>0?4:-28,z+3+layer*3,22-layer%2,24,2.5,'shelf-book shelf-stack',side);
   }
   while(x<75){
    if(row%2===0&&x>-22&&x<8){x=8;continue;}
    const width=Math.min(4.6+(book*7+row*3)%5,77-x);
    const height=21+(book+row)%3;
    const depth=21+(book+row)%4;
    solid(x,side>0?4:-(4+depth),z+3,width-.6,depth,height,'shelf-book',side);
    x+=width;book++;
   }
  }
 }
 solid(-86,-31,128,172,62,4);
 for(const x of [-74,65])solid(x,-37,-4,9,74,4);
 // A small rolling ladder is part of the fixed entrance illustration.
 for(const x of [26,48])for(let step=0;step<6;step++){
  const t0=step/6,t1=(step+1)/6,w=2;
  const a=[x+10*(1-t0),31+14*(1-t0),-4+136*t0] as V3;
  const b=[x+10*(1-t1),31+14*(1-t1),-4+136*t1] as V3;
  solids.push({v:[[a[0],a[1],a[2]],[a[0]+w,a[1],a[2]],[a[0]+w,a[1]+w,a[2]],[a[0],a[1]+w,a[2]],[b[0],b[1],b[2]],[b[0]+w,b[1],b[2]],[b[0]+w,b[1]+w,b[2]],[b[0],b[1]+w,b[2]]],kind:'shelf-ladder',side:0});
 }
 for(let step=0;step<9;step++){
  const t=(step+1)/10;
  solid(26+10*(1-t),31+14*(1-t),-4+136*t,24,2,2,'shelf-ladder');
 }
 let mix=0,opening=false,stop=()=>{};
 const g=el('g',{'data-shelf':0},svg),art=el('g',{'aria-hidden':'true'},g);
 const pool=Array.from({length:solids.length*3},()=>el('path',{},art));
 const roof=el('path',{'aria-hidden':'true',class:'shelf-roof-cap'},g);
 const outline=el('path',{'aria-hidden':'true',class:'shelf-outline'},g);
 const target=el('path',{class:'file-target shelf-target',role:'button',tabindex:0,'aria-label':'Open the library'},g);
 const handle=el('circle',{class:'shelf-ladder-handle',r:9,tabindex:0,role:'slider','aria-label':'Move library ladder','aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':70},g);
 let ladderOffset=0,drag:{x:number,start:number}|null=null;
 handle.addEventListener('pointerdown',(e:PointerEvent)=>{if(opening||e.button!==0)return;drag={x:point(svg,e)[0],start:ladderOffset};handle.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation();});
 handle.addEventListener('pointermove',(e:PointerEvent)=>{if(!drag)return;ladderOffset=Math.max(-56,Math.min(24,drag.start+(point(svg,e)[0]-drag.x)/(1.38*Math.cos(rad(45)))));draw();});
 for(const event of ['pointerup','pointercancel'])handle.addEventListener(event,(e:PointerEvent)=>{drag=null;if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);});
 handle.addEventListener('click',(e:Event)=>e.stopPropagation());
 handle.addEventListener('keydown',(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();ladderOffset=e.key==='Home'?-56:e.key==='End'?24:Math.max(-56,Math.min(24,ladderOffset+(e.key==='ArrowRight'?4:-4)));draw();});
 function activate(){
  if(opening)return;opening=true;s.dataset.state='opening';
  stop=tween(0,1,v=>{mix=v;draw();},620,()=>{
   s.dataset.state='open';
   parent.dispatchEvent(new CustomEvent('library-category',{bubbles:true,detail:{category:'All'}}));
  });
 }
 target.addEventListener('click',activate);
 target.addEventListener('keydown',(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
 const corners=[[-89,-37,-4],[89,-37,-4],[89,37,-4],[-89,37,-4],[-89,-37,132],[89,-37,132],[89,37,132],[-89,37,132]] as V3[];
 function draw(){
  const angle=-45*(1-mix),cos=Math.cos(rad(angle)),sin=Math.sin(rad(angle)),side=1;
  const C=Cam(angle,.5-.4*mix,1.38+.32*mix);
  fit(C,corners,200,162);const P=proj(C);
  g.style.opacity=String(1-Math.max(0,(mix-.55)/.45));
   const depth=(p:V3)=>(p[0]*sin+p[1]*cos)*Math.sqrt(1-C.k*C.k)+p[2]*C.k;
   const faces:{v:V3[],kind:string,depth:number}[]=[];
   for(const box of solids){
    if(box.side&&box.side!==side)continue;
    const indices=[[4,5,6,7],side>0?[2,3,7,6]:[0,1,5,4],sin>=0?[1,2,6,5]:[0,3,7,4]];
    indices.forEach((ids,f)=>{const v=ids.map(i=>box.kind.startsWith('shelf-ladder')?[box.v[i][0]+ladderOffset,box.v[i][1],box.v[i][2]] as V3:box.v[i]);faces.push({v,kind:box.kind+(f===0?' shelf-top':f===2?' shelf-end':''),depth:v.reduce((sum,p)=>sum+depth(p),0)/4});});
   }
   faces.sort((a,b)=>a.depth-b.depth);
   const fragment=document.createDocumentFragment();
   faces.forEach((face,i)=>{const path=pool[i];path.setAttribute('d',poly(face.v.map(v=>P(...v))));path.setAttribute('class',face.kind);path.style.display='';fragment.append(path);});
   for(let i=faces.length;i<pool.length;i++)pool[i].style.display='none';
   art.append(fragment);
   roof.setAttribute('d',poly([P(-86,-31,132),P(86,-31,132),P(86,31,132),P(-86,31,132)]));
   let edges=poly([P(-86,-31,132),P(86,-31,132),P(86,31,132),P(-86,31,132)]);
   for(const x of [-84,84])edges+=seg(P(x,side*29,8),P(x,side*29,128));
   for(let row=0;row<4;row++){
    const z=9+row*29;
    edges+=seg(P(-80,side*29,z),P(80,side*29,z));
    edges+=seg(P(-80,side*29,z+3),P(80,side*29,z+3));
   }
   edges+=seg(P(-86,side*31,128),P(86,side*31,128));
   edges+=seg(P(-88,side*34,4),P(88,side*34,4));
   const nearX=sin>=0?88:-88;
   edges+=seg(P(nearX,-34,4),P(nearX,34,4));
   outline.setAttribute('d',edges);
   target.setAttribute('d',poly(hull(corners.map(v=>P(...v)))));
   const grip=P(37+ladderOffset,34,132);handle.setAttribute('cx',String(grip[0]));handle.setAttribute('cy',String(grip[1]));handle.setAttribute('aria-valuenow',String(Math.round((ladderOffset+56)/80*100)));
   g.setAttribute('data-angle',String(angle));
   s.dataset.zoom=String(mix);
 }
 window.addEventListener('resize',draw);
 parent.closest('.library-page')?.addEventListener('library-reset',()=>{
  stop();mix=0;opening=false;s.dataset.state='preview';draw();target.focus();
 });
 s.dataset.state='preview';draw();
}
document.querySelectorAll('[data-rotating-library]').forEach(shelfScene);
const library=document.querySelector<HTMLElement>('.library-page');
if(library){
 const collection=library.querySelector<HTMLElement>('.library-collection')!,frame=library.querySelector<HTMLIFrameElement>('.library-shelf')!,preview=library.querySelector<HTMLElement>('[data-rotating-library]')!;
 collection.hidden=true;
 function apply(){
  const doc=frame.contentDocument;if(!doc)return;
  const radio=doc.getElementById('view-all') as HTMLInputElement;if(radio)radio.checked=true;
  doc.querySelectorAll<HTMLInputElement>('.book-radio:checked').forEach(b=>b.checked=false);
  frame.contentWindow!.location.hash='top';frame.contentWindow!.scrollTo({top:0,behavior:'instant'});
 }
 library.addEventListener('library-category',()=>{
  apply();preview.hidden=true;collection.hidden=false;library.classList.add('catalog-open');
 });
 library.addEventListener('library-reset',()=>{
  collection.hidden=true;preview.hidden=false;library.classList.remove('catalog-open');
  preview.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
 });
 library.querySelector('.catalog-back')!.addEventListener('click',()=>library.dispatchEvent(new CustomEvent('library-reset')));
 frame.addEventListener('load',()=>{if(!collection.hidden)apply();});
}
