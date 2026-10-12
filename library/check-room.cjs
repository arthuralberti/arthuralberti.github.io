/* Run with NODE_PATH pointing to Playwright and a locally served Hugo docs/. */
const {chromium,webkit,devices}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.ROOM_BASE_URL||'http://127.0.0.1:8770';
const output=process.env.ROOM_ARTIFACTS||'/tmp/library-room-review';fs.mkdirSync(output,{recursive:true});
(async()=>{
 for(const [name,engine,options] of [
  ['chromium-desktop',chromium,{viewport:{width:1440,height:1100}}],
  ['webkit-desktop',webkit,{viewport:{width:1440,height:1100}}],
  ['webkit-mobile',webkit,{...devices['iPhone 13']}],
  ['chromium-small',chromium,{viewport:{width:320,height:780},isMobile:true,hasTouch:true,deviceScaleFactor:1}]
 ]){
  if(process.env.ROOM_CASE && name!==process.env.ROOM_CASE)continue;
  const browser=await engine.launch({headless:true});const context=await browser.newContext(options);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/library/');await page.locator('.library-room:not([hidden])').waitFor();
  const data=await page.locator('#room-books-data').evaluate(e=>JSON.parse(e.textContent));
  assert.equal(await page.locator('.room-book-target').count(),data.length);assert.equal(await page.locator('.favorite-book').count(),data.length);
  assert.equal(await page.locator('.realistic-bookshelf,.rotating-library,iframe').count(),0);
  await page.locator('.room-toolbar').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const target=page.locator('.room-book-target').first();
  if(options.hasTouch){await target.scrollIntoViewIfNeeded();const box=await target.boundingBox();await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);assert.equal(await page.locator('.room-dialog[open]').count(),0);await page.locator('[data-room-open]').click();}
  else {await target.click();}
  assert.equal(await page.locator('#room-book-title').textContent(),data[0].title);
  await page.screenshot({path:output+'/'+name+'-book.png'});
  await page.keyboard.press('Escape');assert.equal(await page.locator('.room-dialog[open]').count(),0);
  await target.focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');assert.equal(await page.locator('#room-book-title').textContent(),data[1].title);await page.locator('.room-close').click();
  // Every record is physically selectable at normal scale on desktop.
  if(!options.hasTouch){for(let i=0;i<data.length;i++){await page.locator('.room-book-target').nth(i).click({timeout:3000});assert.equal(await page.locator('#room-book-title').textContent(),data[i].title);await page.locator('.room-close').click();}}
  const search=page.locator('.room-search input');await search.fill('Quantum');await page.locator('.room-results button').first().click();assert.match(await page.locator('#room-book-title').textContent(),/Quantum/);await page.locator('.room-close').click();
  await search.fill('zzzz-not-a-book');assert.equal(await page.locator('.room-results').textContent(),'No matching books.');await search.fill('');
  await page.locator('[data-room-plus]').click();assert.equal(await page.locator('.library-room').getAttribute('data-zoom'),'1.5');
  const scene=page.locator('.room-scene'),before=await scene.getAttribute('transform'),r=await page.locator('.room-viewport').boundingBox();
  await page.mouse.move(r.x+r.width*.5,r.y+r.height*.5);await page.mouse.down();await page.mouse.move(r.x+r.width*.6,r.y+r.height*.55,{steps:5});await page.mouse.up();assert.notEqual(await scene.getAttribute('transform'),before);assert.equal(await page.locator('.room-dialog[open]').count(),0);
  await page.locator('[data-room-reset]').click();assert.equal(await page.locator('.library-room').getAttribute('data-zoom'),'1');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.room-volume').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  await page.locator('.room-book-target').first().focus();await page.keyboard.press('Escape');
  await page.locator('.library-room').screenshot({path:output+'/'+name+'-room.png'});
  await page.goto(base+'/favorite-papers/');await page.locator('.file-target').first().waitFor();assert.equal(await page.locator('.file-target').count(),26);await page.locator('.file-target').last().click();await page.waitForTimeout(500);assert(await page.locator('.favorite-paper').last().evaluate(e=>e===document.activeElement));
  assert.deepEqual(errors,[]);
  await context.close();const nojs=await browser.newContext({...options,javaScriptEnabled:false});const fallback=await nojs.newPage();await fallback.goto(base+'/library/');assert.equal(await fallback.locator('.favorite-book').count(),data.length);assert.equal(await fallback.locator('.library-room').isVisible(),false);assert(await fallback.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await nojs.close();await browser.close();console.log('PASS '+name);
 }
})().catch(e=>{console.error(e);process.exit(1)});
