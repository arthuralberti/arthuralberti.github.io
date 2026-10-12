const { chromium, webkit, devices } = require('playwright');
const fs = require('fs');
const base = process.argv[2] || 'http://127.0.0.1:8769';
const artifacts = process.argv[3] || '/tmp/bookshelf-qa';
fs.mkdirSync(artifacts, { recursive: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function aligned(page, id) {
  const article = page.locator(`#${id}`);
  const metrics = await article.evaluate(el => ({ top: el.getBoundingClientRect().top, offset: parseFloat(el.style.scrollMarginTop) }));
  const fixedBottom=await page.locator('.site-identity').evaluate(el=>getComputedStyle(el).position==='fixed'?el.getBoundingClientRect().bottom:0);
  assert(metrics.top>=fixedBottom+14,'Title clear of fixed identity');
  assert(Math.abs(metrics.top - metrics.offset) < 3, `${id}: top ${metrics.top}, expected ${metrics.offset}`);
  assert(await page.evaluate(id => document.activeElement.id === id, id), 'Article focus');
  assert(new URL(page.url()).hash === `#${id}`, 'Article fragment');
}

(async () => {
  const configurations = [
    [chromium, 'chromium-desktop', { viewport: { width: 1440, height: 1000 } }],
    [webkit, 'webkit-desktop', { viewport: { width: 1440, height: 1000 } }],
    [webkit, 'webkit-iphone', { ...devices['iPhone 13'] }],
    [chromium, 'chromium-320', { viewport: { width: 320, height: 850 }, isMobile: true, hasTouch: true }],
  ];
  for (const [engine, name, options] of configurations) {
    const browser = await engine.launch({ headless: true });
    const page = await browser.newPage(options);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/library/');
    const preview = page.locator('.rotating-library');
    const stage = preview.locator('.object-stage');
    await preview.scrollIntoViewIfNeeded();
    assert(await page.locator('[data-shelf]').count() === 1, 'One bookcase');
    assert(await page.locator('.shelf-plaque,.shelf-sign').count() === 0, 'No plaques');
    assert(await page.locator('[data-shelf]').getAttribute('data-angle') === '-45', 'Shared 45-degree diagonal');
    await page.waitForTimeout(450);
    assert(await page.locator('[data-shelf]').getAttribute('data-angle') === '-45', 'Entrance remains fixed');
    assert(await page.locator('.favorite-book:visible').count() === 120, 'All books always visible');
    assert(await page.locator('.book-rating').count() === 92, 'Supplied ratings preserved');
    assert(await page.locator('.book-review').count() === 0, 'No invented reviews');
    const center = await preview.locator('svg').evaluate(svg => {
      const main = svg.closest('.library-page').getBoundingClientRect(), box = svg.getBoundingClientRect();
      return Math.abs((box.left + box.right) / 2 - (main.left + main.right) / 2);
    });
    assert(center < 2, 'Entrance centered in content column');
    const handle = preview.getByRole('slider', { name: 'Move library ladder' });
    await handle.press('Home');
    assert(await handle.getAttribute('aria-valuenow') === '0', 'Hairline ladder left stop');
    const leftGrip = await handle.boundingBox();
    await handle.press('End');
    assert(await handle.getAttribute('aria-valuenow') === '100', 'Hairline ladder right stop');
    const grip = await handle.boundingBox();
    const projectedTravel=await preview.locator('svg').evaluate(el=>116*1.38*Math.cos(Math.PI/4)*el.getScreenCTM().a);
    assert(Math.abs(grip.x-leftGrip.x-projectedTravel)<2, 'Ladder crosses the full shelf, beyond the former half-width stop');
    const staticGeometry = await preview.locator('[data-shelf] > g').first().innerHTML();
    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
    await page.mouse.down();
    await page.mouse.move(grip.x - 50, grip.y + grip.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(40);
    assert(Number(await handle.getAttribute('aria-valuenow')) < 90, 'Hairline ladder pointer drag');
    assert(await preview.locator('[data-shelf] > g').first().innerHTML() === staticGeometry, 'Drag updates ladder only');
    assert(await stage.getAttribute('data-dragging') === null, 'Pointer release ends drag');
    const reverseGrip=await handle.boundingBox();
    await page.mouse.move(reverseGrip.x+reverseGrip.width/2,reverseGrip.y+reverseGrip.height/2);
    await page.mouse.down();
    await page.mouse.move(reverseGrip.x+reverseGrip.width/2+180,reverseGrip.y+reverseGrip.height/2,{steps:12});
    await page.mouse.up();
    await page.waitForTimeout(40);
    assert(await handle.getAttribute('aria-valuenow') === '100', 'Reverse drag reaches right edge');
    assert(await handle.evaluate(el=>getComputedStyle(el).touchAction)==='pan-y','Vertical scrolling remains available on ladder');
    assert(await preview.isVisible(), 'Dragging ladder does not open catalog');
    if (options.hasTouch && engine === chromium) {
      await handle.press('End');
      const touchBox = await handle.boundingBox();
      const cdp = await page.context().newCDPSession(page);
      const x = touchBox.x + touchBox.width / 2, y = touchBox.y + touchBox.height / 2;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let step = 1; step <= 10; step++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 4 * step, y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(40);
      assert(Number(await handle.getAttribute('aria-valuenow')) < 90, 'Hairline ladder touch drag');
      assert(await stage.getAttribute('data-dragging') === null,'Touch release ends drag');
      const scrollGrip=await handle.boundingBox();
      const sx=scrollGrip.x+scrollGrip.width/2,sy=scrollGrip.y+scrollGrip.height/2;
      const beforeSwipe=await page.evaluate(()=>scrollY);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sx,y:sy}]});
      for(let n=1;n<=12;n++){
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:sx,y:sy-n*9}]});
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForTimeout(150);
      assert(await page.evaluate(()=>scrollY)>beforeSwipe+30,'Page swipes vertically after ladder drag, even from its rails');
      assert(await stage.getAttribute('data-dragging')===null,'Browser gesture cancellation releases drag');
      await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      await cdp.detach();
    }
    await handle.press('End');
    await handle.evaluate(el=>el.blur());
    await page.screenshot({ path: `${artifacts}/${name}-entrance.png` });
    const target = preview.getByRole('button', { name: 'Open the library', exact: true });
    if (options.hasTouch) await target.tap(); else await target.click();
    let samples = 0;
    while (await preview.isVisible()) {
      const bounds = await stage.evaluate(el => {
        const svg = el.querySelector('svg');
        const g = svg.querySelector('[data-shelf]');
        const b = g.getBBox(), v = svg.viewBox.baseVal;
        return { x: b.x, y: b.y, right: b.x + b.width, bottom: b.y + b.height, left: v.x, top: v.y, edge: v.x + v.width, floor: v.y + v.height };
      });
      if(bounds.right === 0 && !await preview.isVisible()) break;
      assert(bounds.x >= bounds.left - 1 && bounds.y >= bounds.top - 1 && bounds.right <= bounds.edge + 1 && bounds.bottom <= bounds.floor + 1, 'Zoom projection stays inside frame: ' + JSON.stringify(bounds));
      samples++;
      assert(samples < 50, 'Zoom completion');
      await page.waitForTimeout(40);
    }
    const catalog = page.locator('.realistic-library');
    await catalog.waitFor({ state: 'visible' });
    await page.waitForFunction(()=>!document.querySelector('.realistic-library').classList.contains('is-arriving'));
    assert(await page.locator('iframe').count() === 0, 'No iframe or internal scroll');
    assert(await catalog.locator('.book-button').count() === 120, 'All 120 shelf volumes');
    assert(await catalog.locator('.stacked-book').count() === 24, 'Horizontal stacks');
    assert(await catalog.locator('.library-ladder').count() === 0, 'No internal ladder');
    assert(await page.locator('.shelf-ladder-handle').evaluate(el=>el.tagName.toLowerCase()==='path'), 'Ladder grips its rails directly');
    assert(await preview.locator('circle').count() === 0, 'No round ladder handle');
    assert(await page.locator('.shelf-side-wall').count() === 1, 'Solid outside side wall');
    const nesting = await catalog.evaluate(el=>({overflow:getComputedStyle(el).overflowY,height:el.clientHeight,scroll:el.scrollHeight}));
    assert(!['auto','scroll'].includes(nesting.overflow), 'Catalog is in normal page flow');
    const heights = await catalog.locator('.upright-book .resting-spine').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));
    assert(Math.max(...heights)-Math.min(...heights)<12,'Only slight book height variation');
    assert(await catalog.locator('.resting-spine').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).backgroundColor!=='rgba(0, 0, 0, 0)'&&n.getBoundingClientRect().width>5)),'All resting spines have visible materials in both engines');
    assert(await catalog.locator('.resting-spine .cover-author').count()===0,'Titles only on unzoomed spines');
    await page.screenshot({path:`${artifacts}/${name}-wood-shelf.png`});
    await page.locator('.wood-cabinet').screenshot({path:`${artifacts}/${name}-full-cabinet.png`});
    const data = JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'../data/books.json'),'utf8')).books;
    const room = catalog.locator('.book-reading-room');
    for(const index of [0,12,60,119]){
      const book=catalog.locator(`.book-button[data-book-id="${index}"]`);
      if(options.hasTouch)await book.tap();else await book.click();
      await room.waitFor({state:'visible'});
      assert(await room.locator('h3').innerText()===data[index].title,'Correct title for '+index);
      assert(await room.locator('.reading-book-author').innerText()===data[index].author,'Correct author for '+index);
      await page.waitForFunction(()=>document.querySelectorAll('.book-flight').length===0&&document.querySelector('.reading-book-stage .is-open'));
      await room.locator('.book-cover-front').evaluate(el=>{getComputedStyle(el).transform;return Promise.all(el.getAnimations().map(a=>a.finished));});
      assert(await book.getAttribute('aria-expanded')==='true','Selected shelf gap');
      if(index===0)await page.screenshot({path:`${artifacts}/${name}-book-open.png`});
      await room.getByRole('button',{name:'Return book to shelf'}).click();
      await room.waitFor({state:'hidden'});
      assert(await book.getAttribute('aria-expanded')==='false','Book returns to original slot');
      assert(await page.locator('.book-flight').count()===0,'No detached flight after return');
    }
    // The wheel scrolls the document while the pointer is over the shelf.
    await catalog.locator('.book-button').first().scrollIntoViewIfNeeded();
    const wheelPoint=await catalog.locator('.book-button').first().boundingBox();
    await page.mouse.move(wheelPoint.x+wheelPoint.width/2,wheelPoint.y+wheelPoint.height/2);
    const beforeScroll=await page.evaluate(()=>scrollY);
    if(engine===webkit&&options.isMobile)await page.evaluate(()=>scrollBy({top:420,behavior:'instant'}));
    else await page.mouse.wheel(0,420);
    await page.waitForFunction(y=>scrollY>y+200,beforeScroll);
    assert(await catalog.evaluate(el=>el.scrollTop===0),'No independent catalog scrolling');
    await page.emulateMedia({reducedMotion:'reduce'});
    for(const book of data){
      const button=catalog.locator(`.book-button[data-book-id="${book.id}"]`);
      await button.scrollIntoViewIfNeeded();await button.press('Enter');
      await room.waitFor({state:'visible'});
      assert(await room.locator('h3').innerText()===book.title,'Preserved metadata: '+book.id);
      assert(await room.locator('.reading-book-author').innerText()===book.author,'Preserved author: '+book.id);
      assert(await page.locator('.book-flight').count()===0,'Reduced-motion skips flying book');
      await room.locator('h3').press('Escape');await room.waitFor({state:'hidden'});
    }
    // Rapid selection must cancel the previous flight without leaving ghosts.
    await page.emulateMedia({reducedMotion:'no-preference'});
    await catalog.locator('.book-button').nth(0).click();
    await catalog.locator('.book-button').nth(1).click();
    await page.waitForFunction(()=>document.querySelectorAll('.book-flight').length===0&&document.querySelector('.reading-book-stage .is-open'));
    assert(await room.locator('h3').innerText()===data[1].title,'Rapid selection uses newest book');
    await room.getByRole('button',{name:'Return book to shelf'}).click();await room.waitFor({state:'hidden'});
    // The moving volume shares document coordinates with its shelf and reading area.
    const movingBook=catalog.locator('.book-button').first();
    await movingBook.click();
    const movingVolume=page.locator('.book-flight');
    await movingVolume.waitFor({state:'attached'});
    await movingVolume.evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>a.pause()));
    assert(await movingVolume.evaluate(el=>getComputedStyle(el).position==='absolute'),'Book flight follows document scrolling');
    const sourceTop=await movingBook.evaluate(el=>el.getBoundingClientRect().top+scrollY);
    assert(Math.abs(Number(await movingVolume.evaluate(el=>parseFloat(el.style.top)))-sourceTop)<2,'Flight starts at its actual slot');
    const frozen=await movingVolume.evaluate(el=>({top:el.getBoundingClientRect().top,y:scrollY}));
    await page.evaluate(()=>scrollBy({top:55,behavior:'instant'}));
    const moved=await movingVolume.evaluate(el=>({top:el.getBoundingClientRect().top,y:scrollY}));
    assert(Math.abs(moved.top-frozen.top+moved.y-frozen.y)<2,'Scrolling keeps the flight aligned');
    await movingVolume.evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>a.play()));
    await page.waitForFunction(()=>document.querySelectorAll('.book-flight').length===0&&document.querySelector('.reading-book-stage .is-open'));
    await room.getByRole('button',{name:'Return book to shelf'}).click();await room.waitFor({state:'hidden'});
    await page.getByRole('button', { name: 'Return to bookshelf', exact: true }).click();
    assert(await preview.isVisible(), 'Return to fixed entrance');
    assert(await stage.getAttribute('data-zoom') === '0', 'Zoom resets');

    await page.goto(base + '/favorite-papers/');
    await page.locator('.folder-art').first().waitFor();
    assert(await page.locator('.paper-box-count,.paper-list-disclosure,.paper-file-readout').count() === 0, 'No counter, disclosure or duplicate readout');
    assert(await page.locator('.favorite-paper:visible').count() === 26, 'All papers always visible');
    const ids = await page.locator('.favorite-paper').evaluateAll(nodes => nodes.map(n => n.id));
    const paperData=await page.locator('#paper-files-data').evaluate(el=>JSON.parse(el.textContent));
    for(let i=0;i<paperData.length;i++){
      const label=page.locator('.file-face-label').nth(i);
      const title=await label.locator('text:not(.file-face-year)').allTextContents();
      assert(title.join(' ')===paperData[i].title,'File title preserved: '+i);
      assert(await label.locator('.file-face-year').textContent()===String(paperData[i].year),'File year preserved: '+i);
    }
    await page.locator('.file-target').nth(13).focus();
    await page.waitForTimeout(650);
    await page.locator('.file-target').nth(13).evaluate(el=>el.blur());
    assert(await page.locator('.file-face-label:visible').count()===1,'Only the highlighted file exposes its lettering');
    const textFits=await page.locator('.file-face-label').nth(13).evaluate(el=>{const b=el.getBBox();return b.x>=0&&b.x+b.width<=72&&b.y+b.height<=38;});
    assert(textFits,'Projected file label stays within its face margins');
    await page.screenshot({path:`${artifacts}/${name}-file-label.png`});
    for (const index of [0, 13, 25]) {
      const file = page.locator('.file-target').nth(index);
      if (options.hasTouch) await file.tap(); else await file.click();
      try{await page.waitForFunction(id=>{const e=document.getElementById(id);return Math.abs(e.getBoundingClientRect().top-parseFloat(e.style.scrollMarginTop))<3;},ids[index],{timeout:3000});}catch(e){console.log(name,index,await page.evaluate(id=>({id,top:document.getElementById(id).getBoundingClientRect().top,offset:document.getElementById(id).style.scrollMarginTop,y:scrollY,height:innerHeight,doc:document.documentElement.scrollHeight,padding:document.querySelector('.favorite-papers-page').style.paddingBottom}),ids[index]));throw e;}
      await aligned(page, ids[index]);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (let i = 0; i < 26; i++) {
      await page.locator('.file-target').nth(i).press('Enter');
      await page.waitForFunction(id=>{const e=document.getElementById(id);return Math.abs(e.getBoundingClientRect().top-parseFloat(e.style.scrollMarginTop))<3;},ids[i],{timeout:1500});
      await aligned(page, ids[i]);
    }
    await page.screenshot({ path: `${artifacts}/${name}-paper-list.png` });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
    assert(errors.length === 0, 'Runtime errors: ' + errors.join('; '));
    await page.goto(base + '/library/');
    await page.getByRole('button', { name: 'Open the library', exact: true }).press('Enter');
    assert(await page.locator('.library-collection').isVisible(), 'Reduced-motion immediate opening');

    const native = await browser.newPage({ ...options, javaScriptEnabled: false });
    await native.goto(base + '/library/');
    assert(await native.locator('.book-button:visible').count()===120,'No-JS complete catalog');
    assert(await native.locator('iframe').count()===0,'No-JS page scrolling');
    assert(!await native.locator('.catalog-back').isVisible(), 'No inactive fallback control');
    assert(await native.locator('.favorite-book:visible').count() === 120, 'No-JS complete book list');
    await native.goto(base + '/favorite-papers/');
    assert(await native.locator('.favorite-paper:visible').count() === 26, 'No-JS complete paper list');
    console.log('PASS', name, 'solid entrance, direct ladder drag, zoom bounds, 120 physical books, page-only scroll, animated opening/return, all metadata, 26 aligned paper anchors, reduced motion and no-JS fallback');
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
