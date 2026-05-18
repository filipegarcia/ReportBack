// @ts-check
/**
 * The user-requested smoke test:
 *   - click Feedback
 *   - draw one highlight box
 *   - toggle to black-out mode and draw one black-out box
 *   - advance to step 3
 *   - assert the screenshot panel actually renders a real captured image
 *
 * "Real" means: the <img class="screenShotCanvas"> exists, is visible,
 * has a data:image/png URL longer than a trivial blank canvas (>5 KB of
 * base64), and reports a non-zero rendered size. Anything less means the
 * panel is empty / showing the error string / showing a tiny placeholder.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

const SHOT_DIR = path.join(__dirname, '..', '..', 'docs', 'screenshots');

test.describe('Feedback flow: highlight + black-out + screenshot', () => {
  test('captures a real screenshot at step 3', async ({ page }) => {
    test.setTimeout(60_000);

    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') console.log('[browser error]', m.text());
    });

    await page.goto('/');
    await page.waitForSelector('#feedback', { state: 'visible' });

    // -------- step 1 --------
    await page.click('#feedback');
    await page.waitForSelector('#step1', { state: 'visible' });
    await page.fill(
      '#usrDescription',
      'Highlight + blackout E2E: draws one of each box, then verifies the captured screenshot.'
    );
    await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).click();

    // -------- step 2 — highlight first, then black-out --------
    await page.waitForSelector('#step2', { state: 'visible' });
    // The dialog animates into the bottom-right corner; wait it out.
    await page.waitForTimeout(1300);

    // Sanity: the boxer canvas overlay should exist by now.
    await page.waitForSelector('#myCanvas');
    await page.waitForSelector('#canvas');

    // Highlight is the default mode but click it explicitly so the
    // active-button state in the dialog reflects the choice.
    await page.click('#highlight');
    await expect(page.locator('#highlight')).toHaveClass(/btn-primary/);

    // Draw a highlight box over the page header (something visually
    // obvious so the captured screenshot shows the cutout).
    const header = await page.locator('header.subhead').boundingBox();
    if (!header) throw new Error('could not measure header bounding box');
    await page.mouse.move(header.x + 40, header.y + 30);
    await page.mouse.down();
    await page.mouse.move(header.x + header.width * 0.55, header.y + header.height - 30, { steps: 20 });
    await page.mouse.up();

    // Now switch to black-out mode and draw a redaction box over the
    // Description section text.
    await page.click('#block');
    await expect(page.locator('#block')).toHaveClass(/btn-primary/);

    const desc = await page.locator('section#report-back h2').first().boundingBox();
    if (!desc) throw new Error('could not measure description heading bounding box');
    await page.mouse.move(desc.x + 5, desc.y + 5);
    await page.mouse.down();
    await page.mouse.move(desc.x + 260, desc.y + 60, { steps: 20 });
    await page.mouse.up();

    // Capture step 2 state for documentation purposes.
    await page.screenshot({
      path: path.join(SHOT_DIR, '03-step2-highlight.png'),
      fullPage: false,
    });

    // -------- step 3 — verify the screenshot was captured --------
    await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).click();
    await page.waitForSelector('#step3', { state: 'visible' });

    // Wait for the screenshot pipeline (html2canvas + thumbnail crop) to
    // either succeed (an <img> appears) or surface the error message.
    const img = page.locator('#screenshootImg img.screenShotCanvas');
    const errMsg = page.locator('#screenshootImg', { hasText: 'There was a problem creating the screenshot' });

    let outcome = 'timeout';
    await Promise.race([
      img.waitFor({ state: 'visible', timeout: 25_000 }).then(() => { outcome = 'image'; }),
      errMsg.waitFor({ state: 'visible', timeout: 25_000 }).then(() => { outcome = 'error'; }),
    ]).catch(() => {});

    // Inspect everything we'd want to debug if this fails.
    const diag = await page.evaluate(() => {
      const imgEl = /** @type {HTMLImageElement|null} */ (
        document.querySelector('#screenshootImg img.screenShotCanvas')
      );
      const progress = /** @type {HTMLElement|null} */ (
        document.querySelector('#thumbProgress')
      );
      return {
        imgPresent: !!imgEl,
        imgVisible: imgEl ? !!imgEl.offsetParent && imgEl.naturalWidth > 0 : false,
        imgNaturalWidth: imgEl ? imgEl.naturalWidth : 0,
        imgNaturalHeight: imgEl ? imgEl.naturalHeight : 0,
        imgSrcPrefix: imgEl ? imgEl.src.slice(0, 32) : null,
        imgSrcLength: imgEl ? imgEl.src.length : 0,
        progressVisible: progress ? !!progress.offsetParent : false,
        screenshootImgHtmlLen: (document.querySelector('#screenshootImg') || {}).innerHTML
          ? /** @type {HTMLElement} */ (document.querySelector('#screenshootImg')).innerHTML.length
          : 0,
        reportScreenshotLength: (/** @type {any} */ (window)).report && (/** @type {any} */ (window)).report.screenshot
          ? (/** @type {any} */ (window)).report.screenshot.length : 0,
        reportThumbLength: (/** @type {any} */ (window)).report && (/** @type {any} */ (window)).report.thumb
          ? (/** @type {any} */ (window)).report.thumb.length : 0,
      };
    });

    console.log('[diag] outcome:', outcome);
    console.log('[diag]', JSON.stringify(diag, null, 2));
    if (pageErrors.length) console.log('[diag] pageErrors:', pageErrors);

    // Snapshot the dialog so we can eyeball it.
    await page.screenshot({
      path: path.join(SHOT_DIR, '04-step3-review.png'),
      fullPage: false,
    });

    // -------- assertions --------
    expect(pageErrors, 'no JS errors should fire during the flow').toEqual([]);
    expect(outcome, 'screenshot panel never produced an <img> nor an error message').toBe('image');
    expect(diag.imgPresent, 'screenshot <img> must be in the DOM').toBe(true);
    expect(diag.imgVisible, 'screenshot <img> must be visible & loaded').toBe(true);
    expect(diag.imgNaturalWidth, 'thumbnail must be wider than zero').toBeGreaterThan(100);
    expect(diag.imgNaturalHeight, 'thumbnail must be taller than zero').toBeGreaterThan(100);
    expect(diag.imgSrcPrefix, 'thumbnail src must be a PNG data URL').toMatch(/^data:image\/png/);
    // A truly empty/blank png base64 is ~70 chars; a real capture is many KB.
    expect(diag.imgSrcLength, 'thumbnail data URL must contain real pixel data')
      .toBeGreaterThan(5_000);
    expect(diag.reportScreenshotLength, 'report.screenshot must contain a full-page PNG')
      .toBeGreaterThan(10_000);
  });
});
