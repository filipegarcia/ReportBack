// @ts-check
/**
 * Small-screen / mobile coverage — locks in the fix for GitHub issue #2
 * (https://github.com/filipegarcia/ReportBack/issues/2 — "Support for
 * small screens"). Runs the widget under the `iphone` Playwright
 * project, which emulates an iPhone 13 (390 × 844 viewport, WebKit,
 * touch enabled, mobile UA).
 *
 * After the fix, four things must hold on a phone:
 *
 *   1. The landing page fits the viewport — no horizontal scroll.
 *   2. The feedback dialog fits the viewport at every step.
 *   3. Touch drawing actually works — the highlight/blackout boxer is
 *      backed by jQuery UI's mouse widget, which doesn't listen for
 *      touch events natively; a shim in report-back.js bridges them.
 *   4. The full feedback flow completes end-to-end via taps (open →
 *      describe → next → draw → next → screenshot rendered → submit).
 *
 * Run just this file:
 *   npx playwright test --project=iphone
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

const SHOT_DIR = path.join(__dirname, '..', '..', 'docs', 'screenshots');

test.describe('ReportBack on iPhone (small screen)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => console.log('[pageerror]', err.message));
    await page.goto('/');
    await page.waitForSelector('#feedback', { state: 'visible' });
  });

  test('landing page fits a phone viewport', async ({ page }) => {
    await expect(page).toHaveTitle('Report Back');

    const overflow = await page.evaluate(() => ({
      docWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    console.log('[iphone] doc width:', overflow.docWidth, 'viewport:', overflow.viewportWidth);

    expect(
      overflow.docWidth,
      `page is wider than the viewport (doc=${overflow.docWidth}, vp=${overflow.viewportWidth})`,
    ).toBeLessThanOrEqual(overflow.viewportWidth + 1);

    await page.screenshot({
      path: path.join(SHOT_DIR, '06-iphone-home.png'),
      fullPage: false,
    });
  });

  test('feedback dialog fits a phone viewport at every step', async ({ page }) => {
    test.setTimeout(60_000);

    const vw = await page.evaluate(() => window.innerWidth);

    const measureDialog = async () => {
      const box = await page.locator('.ui-dialog').first().boundingBox();
      expect(box, 'dialog has no bounding box').not.toBeNull();
      return box;
    };

    // ---- step 1 ----
    await page.locator('#feedback').tap();
    await page.waitForSelector('#step1', { state: 'visible' });
    let box = await measureDialog();
    console.log('[iphone] step1 dialog:', box && { x: box.x, w: box.width });
    if (box) {
      expect(box.width, `step1 dialog (${box.width}) > viewport (${vw})`).toBeLessThanOrEqual(vw + 1);
      expect(box.x, 'step1 dialog must start inside the viewport').toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, 'step1 dialog must end inside the viewport').toBeLessThanOrEqual(vw + 1);
    }

    // ---- step 2 ----
    await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).tap();
    await page.waitForSelector('#step2', { state: 'visible' });
    await page.waitForTimeout(1300); // settle the animate into the corner
    box = await measureDialog();
    console.log('[iphone] step2 dialog:', box && { x: box.x, w: box.width });
    if (box) {
      expect(box.width, `step2 dialog (${box.width}) > viewport (${vw})`).toBeLessThanOrEqual(vw + 1);
      expect(box.x, 'step2 dialog must start inside the viewport').toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, 'step2 dialog must end inside the viewport').toBeLessThanOrEqual(vw + 1);
    }

    // ---- step 3 ----
    await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).tap();
    await page.waitForSelector('#step3', { state: 'visible' });
    await page.waitForTimeout(1100); // settle animate to center
    box = await measureDialog();
    console.log('[iphone] step3 dialog:', box && { x: box.x, w: box.width });
    if (box) {
      expect(box.width, `step3 dialog (${box.width}) > viewport (${vw})`).toBeLessThanOrEqual(vw + 1);
      expect(box.x, 'step3 dialog must start inside the viewport').toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, 'step3 dialog must end inside the viewport').toBeLessThanOrEqual(vw + 1);
    }
  });

  test('touch drawing produces a highlight box', async ({ page }) => {
    test.setTimeout(60_000);

    // Walk to step 2.
    await page.locator('#feedback').tap();
    await page.waitForSelector('#step1', { state: 'visible' });
    await page.fill('#usrDescription', 'Touch-drawing smoke test.');
    await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).tap();
    await page.waitForSelector('#step2', { state: 'visible' });
    await page.waitForTimeout(1300);

    await page.waitForSelector('#canvas');
    // Make sure highlight mode is active.
    await page.locator('#highlight').tap();

    // The canvas overlay covers the page; we drag inside the
    // viewport. Avoid the bottom-right where the dialog is parked.
    // Playwright's touchscreen API only exposes tap(), so dispatch
    // touchstart/touchmove/touchend manually to exercise the shim
    // we added to report-back.js. (If the shim is missing, no
    // mouse events are synthesized and no box gets drawn.)
    const drewBox = await page.evaluate(async () => {
      try {
        const canvas = document.getElementById('canvas');
        if (!canvas) return { ok: false, reason: 'no #canvas' };

        // WebKit's `new TouchEvent(...)` throws "Illegal constructor"
        // even with all the right fields, but synthetic Touch events
        // built via document.createEvent('UIEvent') (with touches
        // patched on after) bubble correctly to addEventListener
        // handlers — which is exactly what report-back.js's shim uses.
        const buildTouchEvent = (type, x, y, isEnd) => {
          const touch = {
            identifier: 1, target: canvas,
            clientX: x, clientY: y,
            screenX: x, screenY: y,
            pageX: x, pageY: y,
            radiusX: 1, radiusY: 1,
            rotationAngle: 0, force: 0.5,
          };
          const ev = new Event(type, { bubbles: true, cancelable: true });
          const list = isEnd ? [] : [touch];
          Object.defineProperty(ev, 'touches', { value: list });
          Object.defineProperty(ev, 'targetTouches', { value: list });
          Object.defineProperty(ev, 'changedTouches', { value: [touch] });
          return ev;
        };

        canvas.dispatchEvent(buildTouchEvent('touchstart', 40, 250, false));
        await new Promise((r) => setTimeout(r, 20));
        canvas.dispatchEvent(buildTouchEvent('touchmove', 180, 320, false));
        await new Promise((r) => setTimeout(r, 20));
        canvas.dispatchEvent(buildTouchEvent('touchmove', 280, 380, false));
        await new Promise((r) => setTimeout(r, 20));
        canvas.dispatchEvent(buildTouchEvent('touchend', 280, 380, true));
        await new Promise((r) => setTimeout(r, 80));

        // The boxer "highlight" stroke clears a rectangle on #myCanvas,
        // so after a stroke that rectangle should no longer be the
        // shaded fill. Sample the centre of the drag to confirm.
        const cv = /** @type {HTMLCanvasElement|null} */ (document.getElementById('myCanvas'));
        if (!cv) return { ok: false, reason: 'no #myCanvas' };
        const ctx = cv.getContext('2d');
        if (!ctx) return { ok: false, reason: 'no 2d context' };
        const pixel = ctx.getImageData(160, 300, 1, 1).data;
        // Highlight mode clears to alpha 0 (the page shows through).
        return { ok: true, alpha: pixel[3], r: pixel[0], g: pixel[1], b: pixel[2] };
      } catch (err) {
        return { ok: false, reason: 'threw: ' + (err && err.message) };
      }
    });
    console.log('[iphone] drewBox:', drewBox);

    expect(drewBox.ok, drewBox.reason).toBe(true);
    // Before the stroke this pixel was the shader fill (alpha ~75).
    // After a highlight stroke it should be cleared (alpha 0).
    expect(drewBox.alpha, 'highlight stroke should clear the shader at the drag point').toBe(0);
  });

  test('feedback flow works end-to-end on a phone viewport', async ({ page }) => {
    test.setTimeout(60_000);

    // ---- open the dialog with a tap ----
    await page.locator('#feedback').tap();
    await page.waitForSelector('#reportDialog', { state: 'visible' });
    await page.waitForSelector('#step1', { state: 'visible' });

    // ---- step 1: description ----
    await page.fill(
      '#usrDescription',
      'iPhone small-screen smoke test: filing a bug from a phone.',
    );

    await page.screenshot({
      path: path.join(SHOT_DIR, '07-iphone-step1.png'),
      fullPage: false,
    });

    // ---- step 2: highlight/blackout panel ----
    await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).tap();
    await page.waitForSelector('#step2', { state: 'visible' });
    await page.waitForTimeout(1300);

    await page.screenshot({
      path: path.join(SHOT_DIR, '08-iphone-step2.png'),
      fullPage: false,
    });

    // ---- step 3: review + screenshot ----
    await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).tap();
    await page.waitForSelector('#step3', { state: 'visible' });

    const img = page.locator('#screenshootImg img.screenShotCanvas');
    const errMsg = page.locator('#screenshootImg', {
      hasText: 'There was a problem creating the screenshot',
    });

    let outcome = 'timeout';
    await Promise.race([
      img.waitFor({ state: 'visible', timeout: 25_000 }).then(() => { outcome = 'image'; }),
      errMsg.waitFor({ state: 'visible', timeout: 25_000 }).then(() => { outcome = 'error'; }),
    ]).catch(() => {});

    const diag = await page.evaluate(() => {
      const imgEl = /** @type {HTMLImageElement|null} */ (
        document.querySelector('#screenshootImg img.screenShotCanvas')
      );
      return {
        imgPresent: !!imgEl,
        imgNaturalWidth: imgEl ? imgEl.naturalWidth : 0,
        imgSrcLength: imgEl ? imgEl.src.length : 0,
        imgSrcPrefix: imgEl ? imgEl.src.slice(0, 32) : null,
      };
    });
    console.log('[iphone diag]', outcome, JSON.stringify(diag));

    expect(outcome, 'screenshot panel never produced an <img>').toBe('image');
    expect(diag.imgPresent).toBe(true);
    expect(diag.imgSrcPrefix).toMatch(/^data:image\/png/);
    // A blank canvas is ~70 chars of base64; a real capture is much larger.
    expect(diag.imgSrcLength).toBeGreaterThan(5_000);

    await page.screenshot({
      path: path.join(SHOT_DIR, '09-iphone-step3.png'),
      fullPage: false,
    });

    // ---- step 4: submit ----
    // Let the step-3 centring animation finish (1000ms) so the dialog
    // — and the Submit button — are in their final position before we tap.
    await page.waitForTimeout(1200);

    const submit = page.locator('.ui-dialog-buttonset button', { hasText: 'Submit' });
    const submitBox = await submit.boundingBox();
    const dialogBox = await page.locator('.ui-dialog').first().boundingBox();
    console.log('[iphone] submit btn:', submitBox);
    console.log('[iphone] dialog at submit time:', dialogBox);
    await submit.tap();
    await page.waitForSelector('#step4', { state: 'visible' });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(SHOT_DIR, '10-iphone-step4.png'),
      fullPage: false,
    });
  });
});
