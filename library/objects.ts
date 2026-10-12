/* Hairline-derived drawing geometry. See hairline/LICENSE and hairline/README.md. */
import {Cam,proj,rad,rings,prism,facing,poly,seg,r2,type Vec2} from './hairline/core/iso';
import {scene,tray,card,pose,N,W,H,G,REST,LIFT} from './hairline/figures/riffle-geometry';
const NS='http://www.w3.org/2000/svg';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function el(tag:string,attrs:Record<string,any>={},parent?:Element,text?:string){const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text)n.textContent=text;parent?.append(n);return n as any;}
function html(tag:string,cls:string,parent:Element,text?:string){const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;}
function stage(parent:Element,label:string){const s=html('div','object-stage',parent);s.tabIndex=0;s.setAttribute('role','group');s.setAttribute('aria-label',label);const svg=el('svg',{viewBox:'0 0 400 320',role:'group','aria-label':label},s);return {s,svg};}
function point(svg:SVGSVGElement,e:PointerEvent):Vec2 {const m=svg.getScreenCTM();if(!m)return [0,0];const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());return [p.x,p.y];}
function paths(parent:Element,items:[string,string][]){for(const [d,cls] of items)el('path',{d,class:cls},parent);}
function tween(from:number,to:number,draw:(v:number)=>void,duration=600){if(reduced.matches){draw(to);return ()=>{};}let frame=0;const start=performance.now();function step(t:number){const f=Math.min(1,(t-start)/duration);draw(from+(to-from)*(1-Math.pow(1-f,3)));if(f<1)frame=requestAnimationFrame(step);}frame=requestAnimationFrame(step);return ()=>cancelAnimationFrame(frame);}

// The Riffle tray, cards, tab positions, projection and lean follow Hairline's geometry.
type Paper={slug:string,title:string,authors:string,year:string,venue:string,paper_url:string,note:string};
function fileBox(parent:Element,label:string,papers:Paper[]){
 const box=html('section','collection-object',parent);html('h3','',box,label);html('p','paper-box-count',box,`${papers.length} ${papers.length===1?'paper':'papers'}`);
 const {s,svg}=stage(box,`${label}: use arrow keys to browse papers; Enter selects a paper`);s.style.cursor='default';
 const read=html('div','paper-file-readout',box);read.setAttribute('aria-live','polite');
 const {P,front,outer,inner}=scene(),body=tray(P,front,outer,inner);paths(svg,body.far);
 const groups=papers.map((paper,j)=>{const i=N-papers.length+j,shape=card(i),g=el('g',{class:'folder-art'},svg);const back=el('path',{class:'sil lo'},g),face=el('path',{class:'sil'},g),head=el('path',{class:'nf'},g),rules=el('path',{class:'nf lo'},g);return {i,shape,g,back,face,head,rules,angle:REST,lift:0};});
 paths(svg,body.near);
 let active=-1,stop=()=>{};
 function draw(){groups.forEach(q=>{const p=pose(P,q.i,q.shape.t0,q.shape.shape,q.angle,q.lift);q.back.setAttribute('d',p.back);q.face.setAttribute('d',p.face);q.head.setAttribute('d',p.head);q.rules.setAttribute('d',p.rules);});}
 function select(j:number){if(j===active)return;active=j;stop();const starts=groups.map(q=>[q.angle,q.lift]);const targets=groups.map((q,k)=>[j<0?REST:k<j?-24:k>j?20:0,k===j?LIFT:0]);stop=tween(0,1,f=>{groups.forEach((q,k)=>{q.angle=starts[k][0]+(targets[k][0]-starts[k][0])*f;q.lift=starts[k][1]+(targets[k][1]-starts[k][1])*f;q.face.classList.toggle('hi',k===j);});draw();});read.replaceChildren();if(j<0){html('p','',read,'Move across the files to reveal a paper, or use the arrow keys.');return;}const paper=papers[j];html('h4','',read,paper.title);html('p','',read,`${paper.authors} · ${paper.year}`);html('p','',read,paper.venue);const link=html('a','',read,'Open paper') as HTMLAnchorElement;link.href=paper.paper_url;link.target='_blank';link.rel='noopener noreferrer';const note=html('details','paper-file-note',read);html('summary','',note,'Why I return to it');html('p','',note,paper.note);}
 const targets=groups.map((q,j)=>{const y=q.i*G+H*Math.sin(rad(REST)),z=H*Math.cos(rad(REST));const corners=[P(-5,y-G/2,z),P(W+5,y-G/2,z),P(W+5,y+G/2,z),P(-5,y+G/2,z)];const target=el('path',{class:'file-target',d:poly(corners),tabindex:0,role:'button','aria-label':`${papers[j].authors}, ${papers[j].year}: ${papers[j].title}`},svg);target.addEventListener('pointerenter',()=>select(j));target.addEventListener('focus',()=>select(j));target.addEventListener('click',()=>select(j));target.addEventListener('keydown',(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(j);}});return target;});
 s.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const step=['ArrowLeft','ArrowUp'].includes(e.key)?-1:1;const next=Math.max(0,Math.min(papers.length-1,active<0?0:active+step));targets[next].focus();}if(e.key==='Escape'){select(-1);s.focus();}});
 draw();html('p','',read,'Move across the files to reveal a paper, or use the arrow keys.');
 return ()=>{stop();box.remove();};
}
const paperRoot=document.querySelector<HTMLElement>('[data-paper-files]');
if(paperRoot){const data=document.querySelector('#paper-files-data');const papers:Paper[]=JSON.parse(data!.textContent!);const controls=document.querySelector('.paper-box-mode')!;controls.classList.add('is-ready');let cleanups:(()=>void)[]=[];function render(mode:string){cleanups.forEach(f=>f());cleanups=[];let groups:[string,Paper[]][]=[];if(mode==='journal'){const by=new Map<string,Paper[]>();papers.forEach(p=>{if(!by.has(p.venue))by.set(p.venue,[]);by.get(p.venue)!.push(p);});groups=[...by].sort((a,b)=>a[0].localeCompare(b[0]));}else{for(let i=0;i<papers.length;i+=10)groups.push([`Collection ${String(i/10+1).padStart(2,'0')}`,papers.slice(i,i+10)]);}for(const [label,items] of groups){for(let i=0;i<items.length;i+=10)cleanups.push(fileBox(paperRoot!,items.length>10?`${label} · ${i/10+1}`:label,items.slice(i,i+10)));}controls.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));}
 controls.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>render(b.dataset.mode!)));render('collection');
 const listing=document.querySelector<HTMLDetailsElement>('.paper-list-disclosure');if(listing)listing.open=false;
}

// Double-sided display: two identical hardcover solids, one facing each aisle.
function shelfObject(parent:Element,index:number,names:[string,string]){
 const box=html('section','collection-object',parent);html('h3','',box,`0${index+1} — ${names[0]} / ${names[1]}`);const {s,svg}=stage(box,`${names.join(' and ')}: drag to turn, arrow keys rotate, Enter opens the visible collection`);
 const actions=html('div','object-actions',box);const status=html('span','object-status',actions,names[0]);status.setAttribute('aria-live','polite');const button=html('button','object-button',actions,'Turn to the other side');
 let angle=45,stop=()=>{},drag:{x:number,y:number,angle:number,moved:boolean,id:number}|null=null;
 function choose(category:string){parent.dispatchEvent(new CustomEvent('library-category',{bubbles:true,detail:{category}}));}
 function draw(){svg.replaceChildren();const C=Cam(angle,.5,2.2);C.ox=200;C.oy=255;const P=proj(C),front=facing(C);
  const base=el('g',{},svg);const [rr,ri]=rings(-54,-32,54,32,3,1.2);const plinth=prism(P,front,rr,ri,0,5);el('path',{d:plinth.sil,class:'sil'},base);el('path',{d:plinth.crease,class:'nf lo'},base);
  // Draw vertical surfaces back-to-front; shared top shelf is painted last.
  const sides=[{side:-1,category:names[1]},{side:1,category:names[0]}].sort((a,b)=>a.side*Math.cos(C.az)-b.side*Math.cos(C.az));
  for(const {side,category} of sides){
   const y=side*22,visible=side*Math.cos(C.az)>0;
   // Two open end frames and a back-to-back center partition.
   const surface=el('g',{},svg);
   for(const x of [-50,50]){const a=P(x,-28,5),b=P(x,-28,104),c=P(x,28,104),d=P(x,28,5);el('path',{d:`${poly([a,b,c,d])}`,class:'nf lo'},surface);}
   const x0=-25,x1=25,z0=9,z1=84;
   const facePoints=side===1?[P(x0,y,z0),P(x1,y,z0),P(x1,y,z1),P(x0,y,z1)]:[P(x1,y,z0),P(x0,y,z0),P(x0,y,z1),P(x1,y,z1)];
   const book=el('g',{'data-cover-category':category},surface);
   const innerY=y-side*4;
   el('path',{d:poly([P(x0,innerY,z1),P(x1,innerY,z1),P(x1,y,z1),P(x0,y,z1)]),class:'sil lo'},book);
   el('path',{d:poly(facePoints),class:'book-cover'},book);
   el('path',{d:seg(P(x0+3,y,z0),P(x0+3,y,z1)),class:'cover-detail'},book);
   if(visible){const origin=P(side===1?x0:x1,y,z1),u=P(side===1?x1:x0,y,z1),v=P(side===1?x0:x1,y,z0);const matrix=`matrix(${(u[0]-origin[0])/50} ${(u[1]-origin[1])/50} ${(v[0]-origin[0])/75} ${(v[1]-origin[1])/75} ${origin[0]} ${origin[1]})`;const cover=el('g',{transform:matrix},book);
    el('path',{d:'M12 12h26v23H12z M18 12v23 M12 23h26',class:'cover-detail'},cover);
    el('text',{x:25,y:51,'text-anchor':'middle',class:'cover-word'},cover,category);
    el('path',{d:'M17 60h16',class:'cover-detail'},cover);
    const target=el('path',{d:poly(facePoints),class:'file-target shelf-target',role:'button','aria-label':`Open ${category}`},book);
    target.addEventListener('click',()=>{if(!drag?.moved)choose(category);});
   }
  }
  const [top,topIn]=rings(-54,-32,54,32,3,1.2);const roof=prism(P,front,top,topIn,104,108);el('path',{d:roof.sil,class:'sil'},svg);el('path',{d:roof.crease,class:'nf lo'},svg);
  const ground=[P(-68,40,0),P(68,40,0)];el('path',{d:seg(ground[0],ground[1]),class:'nf lo'},svg);
  const face=Math.cos(C.az)>=0?names[0]:names[1];status.textContent=face;box.dataset.angle=String(Math.round(angle));box.dataset.facing=face;
 }
 function rotate(to:number){stop();stop=tween(angle,to,v=>{angle=v;draw();});}
 button.addEventListener('click',()=>rotate(angle+180));
 s.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();rotate(angle+(e.key==='ArrowRight'?45:-45));}if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(Math.cos(rad(angle))>=0?names[0]:names[1]);}});
 s.addEventListener('pointerdown',e=>{if(e.button!==0)return;stop();drag={x:e.clientX,y:e.clientY,angle,moved:false,id:e.pointerId};});
 s.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)){drag.moved=true;s.setPointerCapture(e.pointerId);}if(drag.moved){angle=drag.angle+dx*.75;draw();}});
 s.addEventListener('pointerup',e=>{const wasDragged=drag?.moved;if(wasDragged){rotate(45+180*Math.round((angle-45)/180));if(s.hasPointerCapture(e.pointerId))s.releasePointerCapture(e.pointerId);}setTimeout(()=>{drag=null;},0);});
 s.addEventListener('pointercancel',()=>{drag=null;});draw();
}
document.querySelectorAll('[data-rotating-library]').forEach(shelves=>{shelfObject(shelves,0,['Read','Reading']);shelfObject(shelves,1,['All','Wishlist']);});
const library=document.querySelector<HTMLElement>('.library-page');
if(library){
 const collection=library.querySelector<HTMLElement>('.library-collection')!,frame=library.querySelector<HTMLIFrameElement>('.library-shelf')!,filters=library.querySelector<HTMLElement>('.library-filters')!,heading=library.querySelector<HTMLElement>('.library-active-category')!,empty=library.querySelector<HTMLElement>('.library-category-empty')!;
 collection.hidden=true;filters.hidden=true;let category='Read';
 function apply(){const unknown=category==='Reading'||category==='Wishlist';heading.hidden=false;heading.textContent=category;empty.hidden=!unknown;empty.textContent=category==='Reading'?'Reading status is not recorded yet.':'Wishlist information is not recorded yet.';frame.hidden=unknown;const doc=frame.contentDocument;if(!unknown&&doc){const radio=doc.getElementById(category==='All'?'view-all':'view-read') as HTMLInputElement;if(radio)radio.checked=true;doc.querySelectorAll<HTMLInputElement>('.book-radio:checked').forEach(b=>b.checked=false);frame.contentWindow!.location.hash='top';frame.contentWindow!.scrollTo({top:0,behavior:'instant'});}}
 library.addEventListener('library-category',((e:CustomEvent)=>{category=e.detail.category;collection.hidden=false;apply();}) as EventListener);frame.addEventListener('load',()=>{if(!collection.hidden)apply();});
}
