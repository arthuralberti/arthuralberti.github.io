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
    assert(await page.locator('[data-shelf]').getAttribute('data-angle') === '45', 'Shared 45-degree diagonal');
    await page.waitForTimeout(450);
    assert(await page.locator('[data-shelf]').getAttribute('data-angle') === '45', 'Entrance remains fixed');
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
      assert(bounds.x >= bounds.left - 1 && bounds.y >= bounds.top - 1 && bounds.right <= bounds.edge + 1 && bounds.bottom <= bounds.floor + 1, 'Zoom projection stays inside frame: ' + JSON.stringify(bounds));
      samples++;
      assert(samples < 50, 'Zoom completion');
      await page.waitForTimeout(40);
    }
    const frame = page.frameLocator('.library-shelf');
    await frame.locator('#view-all').waitFor({ state: 'attached' });
    assert(await frame.locator('#view-all').isChecked(), 'Complete catalog opens');
    await page.locator('.library-collection').evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
    await page.locator('.library-shelf').scrollIntoViewIfNeeded();
    const handle = frame.getByRole('slider', { name: 'Move library ladder' });
    await handle.waitFor({ state: 'visible' });
    const before = Number(await handle.getAttribute('aria-valuenow'));
    await handle.press('ArrowLeft');
    assert(Number(await handle.getAttribute('aria-valuenow')) < before, 'Ladder keyboard movement');
    await handle.press('Home');
    assert(await handle.getAttribute('aria-valuenow') === '0', 'Left stop');
    await handle.press('End');
    assert(await handle.getAttribute('aria-valuenow') === '100', 'Right stop');
    const box = await handle.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 110, box.y + box.height / 2, { steps: 12 });
    await page.mouse.up();
    assert(Number(await handle.getAttribute('aria-valuenow')) < 90, 'Ladder mouse drag');
    if (options.hasTouch && engine === chromium) {
      await handle.press('End');
      const touchBox = await handle.boundingBox();
      const cdp = await page.context().newCDPSession(page);
      const x = touchBox.x + 22, y = touchBox.y + 22;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let step = 1; step <= 10; step++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 8 * step, y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      assert(Number(await handle.getAttribute('aria-valuenow')) < 90, 'Ladder touch drag');
      await cdp.detach();
    }

    const heights = await frame.locator('.collection.all .upright .book-object').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().height));
    assert(Math.max(...heights) - Math.min(...heights) < 12, 'Small height variation');
    assert(await frame.locator('.collection.all .book-stack').count() > 0, 'Horizontal stacks');
    await page.screenshot({ path: `${artifacts}/${name}-wood-ladder.png` });
    await frame.locator('.collection.all .book-first').first().click();
    await frame.locator('.collection.all .book-second').first().click();
    await frame.locator('.detail-overlay:target').waitFor({ state: 'visible' });
    await frame.locator('.detail-overlay:target').evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
    assert(!await frame.locator('.library-ladder').isVisible(), 'Ladder does not cover book details');
    await frame.locator('.detail-overlay:target .close-detail').click();
    await page.getByRole('button', { name: 'Return to bookshelf', exact: true }).click();
    assert(await preview.isVisible(), 'Return to fixed entrance');
    assert(await stage.getAttribute('data-zoom') === '0', 'Zoom resets');

    await page.goto(base + '/favorite-papers/');
    await page.locator('.folder-art').first().waitFor();
    assert(await page.locator('.paper-box-count,.paper-list-disclosure,.paper-file-readout').count() === 0, 'No counter, disclosure or duplicate readout');
    assert(await page.locator('.favorite-paper:visible').count() === 26, 'All papers always visible');
    const ids = await page.locator('.favorite-paper').evaluateAll(nodes => nodes.map(n => n.id));
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
    assert(await native.frameLocator('.library-shelf').locator('#view-all').isChecked(), 'No-JS full catalog');
    assert(!await native.locator('.catalog-back').isVisible(), 'No inactive fallback control');
    await native.goto(base + '/favorite-papers/');
    assert(await native.locator('.favorite-paper:visible').count() === 26, 'No-JS complete paper list');
    console.log('PASS', name, 'fixed entrance, zoom bounds, ladder drag/stops, book details, subtle heights, stacks, 26 aligned paper anchors, reduced motion and no-JS fallback');
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
