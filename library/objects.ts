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
 const box=html('section','collection-object',parent);html('p','paper-box-count',box,`${papers.length} ${papers.length===1?'paper':'papers'}`);
 const {s,svg}=stage(box,`${label}: use arrow keys to browse papers; Enter selects a paper`);s.style.cursor='default';
 const read=html('div','paper-file-readout',box);read.setAttribute('aria-live','polite');
 const {P,front,outer,inner}=scene(),body=tray(P,front,outer,inner);paths(svg,body.far);
 const groups=papers.map((paper,j)=>{const i=N-papers.length+j,shape=card(i),g=el('g',{class:'folder-art'},svg);const back=el('path',{class:'sil lo'},g),face=el('path',{class:'sil'},g),head=el('path',{class:'nf'},g),rules=el('path',{class:'nf lo'},g);return {i,shape,g,back,face,head,rules,angle:REST,lift:0};});
 paths(svg,body.near);
 let active=-1,stop=()=>{};
 function draw(){groups.forEach(q=>{const p=pose(P,q.i,q.shape.t0,q.shape.shape,q.angle,q.lift);q.back.setAttribute('d',p.back);q.face.setAttribute('d',p.face);q.head.setAttribute('d',p.head);q.rules.setAttribute('d',p.rules);});}
 function select(j:number){if(j===active)return;active=j;stop();const starts=groups.map(q=>[q.angle,q.lift]);const targets=groups.map((q,k)=>[j<0?REST:k<j?-24:k>j?20:0,k===j?LIFT:0]);stop=tween(0,1,f=>{groups.forEach((q,k)=>{q.angle=starts[k][0]+(targets[k][0]-starts[k][0])*f;q.lift=starts[k][1]+(targets[k][1]-starts[k][1])*f;q.face.classList.toggle('hi',k===j);});draw();});read.replaceChildren();if(j<0){return;}const paper=papers[j];html('h4','',read,paper.title);html('p','',read,paper.authors);html('p','',read,paper.venue);const link=html('a','',read,'Open paper') as HTMLAnchorElement;link.href=paper.paper_url;link.target='_blank';link.rel='noopener noreferrer';}
 const targets=groups.map((q,j)=>{const y=q.i*G+H*Math.sin(rad(REST)),z=H*Math.cos(rad(REST));const corners=[P(-5,y-G/2,z),P(W+5,y-G/2,z),P(W+5,y+G/2,z),P(-5,y+G/2,z)];const target=el('path',{class:'file-target',d:poly(corners),tabindex:0,role:'button','aria-label':`${papers[j].authors}, ${papers[j].year}: ${papers[j].title}`},svg);target.addEventListener('pointerenter',()=>select(j));target.addEventListener('focus',()=>select(j));target.addEventListener('click',()=>select(j));target.addEventListener('keydown',(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(j);}});return target;});
 s.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const step=['ArrowLeft','ArrowUp'].includes(e.key)?-1:1;const next=Math.max(0,Math.min(papers.length-1,active<0?0:active+step));targets[next].focus();}if(e.key==='Escape'){select(-1);s.focus();}});
 draw();
 return ()=>{stop();box.remove();};
}
const paperRoot=document.querySelector<HTMLElement>('[data-paper-files]');
if(paperRoot){const papers:Paper[]=JSON.parse(document.querySelector('#paper-files-data')!.textContent!);fileBox(paperRoot,'Favorite Papers',papers);const listing=document.querySelector<HTMLDetailsElement>('.paper-list-disclosure');if(listing)listing.open=false;}

// Two freestanding double-sided bookcases in a shared scene.
function shelfScene(parent:Element){
 const {s,svg}=stage(parent,'Read and Reading; All and Wishlist');svg.setAttribute('viewBox','0 0 800 440');
 let selected=-1, angle=35, last=0, hovering=false, drag:any=null;
 const names=[['Read','Reading'],['All','Wishlist']];
 function draw(){
  svg.replaceChildren();
  names.forEach((pair,index)=>{
   if(selected>=0&&selected!==index)return;
   const C=Cam(angle+index*18,.28,selected<0?2.1:2.7);C.ox=selected<0?210+index*380:400;C.oy=365;
   const P=proj(C),g=el('g',{'data-shelf':index},svg);
   const face=Math.cos(C.az)>=0?1:-1;
   el('rect',{x:C.ox-83,y:10,width:166,height:32,rx:2,fill:'#fff',stroke:'#c1c4ca','stroke-width':.7},g);
   el('text',{x:C.ox,y:32,'text-anchor':'middle',class:'shelf-sign'},g,pair.join(' / '));
   function solid(x0:number,y0:number,z0:number,x1:number,y1:number,z1:number){
    const pts=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
    const faces=[[4,5,6,7],face>0?[2,3,7,6]:[0,1,5,4],Math.sin(C.az)>0?[1,2,6,5]:[0,3,7,4]];
    faces.forEach(f=>el('path',{d:poly(f.map(i=>P(...pts[i] as [number,number,number]))),class:'sil'},g));
   }
   solid(-62,-35,0,62,35,5);
   solid(-58,-31,5,-54,31,139);solid(54,-31,5,58,31,139);
   for(let row=0;row<5;row++){
    const z=8+row*26;solid(-54,-31,z,54,31,z+3);
    for(let side of [-face,face])for(let k=0;k<23;k++){
     const i=Math.sin(C.az)>0?k:22-k;
     const x=-51+i*4.45,h=17+(i*7+row*3)%7;
     solid(x,side>0?4:-29,z+3,x+3.6,side>0?29:-4,z+3+h);
     const y=side*29;
     el('path',{d:seg(P(x+.8,y,z+6),P(x+2.8,y,z+6)),class:'nf lo'},g);
    }
   }
   solid(-58,-33,138,58,33,142);
   const y=face*32,category=pair[face>0?0:1];
   const target=el('path',{d:poly([P(-62,y,0),P(62,y,0),P(62,y,145),P(-62,y,145)]),class:'file-target',role:'button',tabindex:0,'aria-label':selected<0?`Select ${pair.join(' / ')}`:`Open ${category}`},g);
   function activate(){if(drag?.moved)return;if(selected<0){selected=index;draw();}else parent.dispatchEvent(new CustomEvent('library-category',{bubbles:true,detail:{category}}));}
   target.addEventListener('click',activate);target.addEventListener('keydown',(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
   el('text',{x:C.ox,y:410,'text-anchor':'middle',class:'shelf-face-label'},g,category);
  });
 }
 s.addEventListener('pointerenter',()=>hovering=true);s.addEventListener('pointerleave',()=>hovering=false);
 s.addEventListener('keydown',e=>{if(e.key==='Escape'){selected=-1;draw();}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();angle+=e.key==='ArrowRight'?45:-45;draw();}});
 s.addEventListener('pointerdown',e=>{drag={x:e.clientX,angle,moved:false};});
 s.addEventListener('pointermove',e=>{if(drag&&Math.abs(e.clientX-drag.x)>6){drag.moved=true;angle=drag.angle+(e.clientX-drag.x)*.6;draw();}});
 s.addEventListener('pointerup',()=>{setTimeout(()=>drag=null,0);});s.addEventListener('pointercancel',()=>drag=null);
 function animate(t:number){if(last&&!drag&&!hovering&&!s.contains(document.activeElement)&&!reduced.matches){angle+=(t-last)*.007;draw();}last=t;requestAnimationFrame(animate);}draw();requestAnimationFrame(animate);
}
document.querySelectorAll('[data-rotating-library]').forEach(shelfScene);
const library=document.querySelector<HTMLElement>('.library-page');
if(library){
 const collection=library.querySelector<HTMLElement>('.library-collection')!,frame=library.querySelector<HTMLIFrameElement>('.library-shelf')!,filters=library.querySelector<HTMLElement>('.library-filters')!,heading=library.querySelector<HTMLElement>('.library-active-category')!,empty=library.querySelector<HTMLElement>('.library-category-empty')!;
 collection.hidden=true;filters.hidden=true;let category='Read';
 function apply(){const unknown=category==='Reading'||category==='Wishlist';heading.hidden=false;heading.textContent=category;empty.hidden=!unknown;empty.textContent=category==='Reading'?'Reading status is not recorded yet.':'Wishlist information is not recorded yet.';frame.hidden=unknown;const doc=frame.contentDocument;if(!unknown&&doc){const radio=doc.getElementById(category==='All'?'view-all':'view-read') as HTMLInputElement;if(radio)radio.checked=true;doc.querySelectorAll<HTMLInputElement>('.book-radio:checked').forEach(b=>b.checked=false);frame.contentWindow!.location.hash='top';frame.contentWindow!.scrollTo({top:0,behavior:'instant'});}}
 library.addEventListener('library-category',((e:CustomEvent)=>{category=e.detail.category;collection.hidden=false;apply();}) as EventListener);frame.addEventListener('load',()=>{if(!collection.hidden)apply();});
}
