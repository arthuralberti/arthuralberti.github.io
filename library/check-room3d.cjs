const {chromium,webkit,devices}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.ROOM_BASE_URL||'http://127.0.0.1:8770',out=process.env.ROOM_ARTIFACTS||'/tmp/library-room3d-review';fs.mkdirSync(out,{recursive:true});
const args=['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
(async()=>{
 for(const [name,type,options] of [['chromium',chromium,{viewport:{width:1440,height:1100},deviceScaleFactor:2}],['webkit',webkit,{viewport:{width:1440,height:1100}}],['iphone',webkit,{...devices['iPhone 13']}],['small',chromium,{viewport:{width:320,height:780},isMobile:true,hasTouch:true}]]){
 if(process.env.ROOM_CASE&&process.env.ROOM_CASE!==name)continue;
 const browser=await type.launch(type===chromium?{args}:{headless:true}),context=await browser.newContext(options),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/library/');await page.locator('[data-render=webgl]').waitFor();
 await page.locator('.room-viewport').scrollIntoViewIfNeeded();await page.waitForTimeout(200);
 const data=await page.locator('#room-books-data').evaluate(e=>JSON.parse(e.textContent));
 assert.equal(await page.locator('.room-book-target').count(),120);assert.equal(await page.locator('.favorite-book').count(),120);
 assert.equal(await page.locator('.room-search,.room-zoom,[data-room-open],input[type=search]').count(),0);
 const report=await page.locator('.library-room').evaluate(e=>e.roomDiagnostics());assert.deepEqual(report.errors,[]);assert.deepEqual(report.books.filter(b=>!b.visible).map(b=>b.index),[]);assert.deepEqual(report.layers,['floor','walls','shelves','furniture','plants','books']);
 assert((await page.locator('.room-readout').boundingBox()).y<(await page.locator('.room-viewport').boundingBox()).y);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const samples=options.hasTouch?[0,59,110]:[0,19,29,39,59,69,89,99,100,109,110,115,119];
 for(const i of samples){
  let expected=i;
  let b=await page.locator('.library-room').evaluate((e,i)=>e.roomDiagnostics().books[i],i);
  if(options.hasTouch){await page.touchscreen.tap(b.x,b.y);await page.waitForTimeout(350);expected=Number(await page.locator('.library-room').getAttribute('data-selected'));assert(expected>=0&&Math.abs(expected-i)<=1,'Touch must choose a neighboring visible spine');assert.equal(await page.locator('.room-selection-label').textContent(),`${data[expected].title} — ${data[expected].author}`);b=await page.locator('.library-room').evaluate((e,i)=>e.roomDiagnostics().books[i],expected);await page.touchscreen.tap(b.x,b.y);}
  else{await page.mouse.move(b.x,b.y);await page.waitForTimeout(280);assert.equal(await page.locator('.room-selection-label').textContent(),`${data[i].title} — ${data[i].author}`);b=await page.locator('.library-room').evaluate((e,i)=>e.roomDiagnostics().books[i],i);assert(b.position.some((v,j)=>Math.abs(v-b.rest[j])>1));await page.mouse.click(b.x,b.y);}
  await page.locator('.room-dialog[open]').waitFor();assert.equal(await page.locator('#room-book-title').textContent(),data[expected].title);await page.locator('.room-close').click();await page.waitForTimeout(40);
 }
 await page.locator('.room-book-target').first().focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');assert.equal(await page.locator('#room-book-title').textContent(),data[1].title);await page.screenshot({path:out+'/'+name+'-detail.png'});await page.keyboard.press('Escape');assert.equal(await page.locator('.room-dialog[open]').count(),0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.room-book-target').nth(2).focus();await page.waitForTimeout(100);assert.equal(await page.locator('.room-selection-label').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.locator('.library-room').screenshot({path:out+'/'+name+'-hover.png'});await page.keyboard.press('Escape');await page.waitForTimeout(100);await page.locator('.library-room').screenshot({path:out+'/'+name+'-room.png'});
 if(type===chromium&&options.hasTouch){await page.evaluate(()=>window.scrollTo({top:document.querySelector('.room-viewport').getBoundingClientRect().top+scrollY-150,behavior:'instant'}));const cdp=await context.newCDPSession(page),before=await page.evaluate(()=>scrollY);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:160,y:400}]});for(let y=380;y>=220;y-=20)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:160,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200);assert(await page.evaluate(()=>scrollY)>before+40);}
 await page.goto(base+'/favorite-papers/');await page.locator('.file-target').first().waitFor();assert.equal(await page.locator('.file-target').count(),26);await page.locator('.file-target').last().click();assert(await page.locator('.favorite-paper').last().evaluate(e=>e===document.activeElement));assert.deepEqual(errors,[]);
 await context.close();
 const nojs=await browser.newContext({...options,javaScriptEnabled:false}),fallback=await nojs.newPage();await fallback.goto(base+'/library/');assert.equal(await fallback.locator('.favorite-book').count(),120);assert.equal(await fallback.locator('.library-room').isVisible(),false);await nojs.close();
 const nogl=await browser.newContext(options);await nogl.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...rest){return type.includes('webgl')?null:get.call(this,type,...rest)};});const still=await nogl.newPage();await still.goto(base+'/library/');await still.locator('[data-render=fallback]').waitFor();assert(await still.locator('.room-still').isVisible());assert(await still.locator('.room-still').evaluate(e=>e.naturalWidth>0));assert.equal(await still.locator('.favorite-book').count(),120);await nogl.close();await browser.close();console.log('PASS '+name);
 }
})().catch(e=>{console.error(e);process.exit(1)});
