// @ts-check
/**
 * Regression test for the user-reported bug:
 *   "On https://filipegarcia.github.io/ReportBack/ the screenshot is not
 *    working — the Screenshot panel never shows the captured image."
 *
 * The test runs twice:
 *   1. Against the LIVE gh-pages site (which serves the pre-fix code) —
 *      expected to fail. Skipped in CI / when SKIP_LIVE=1.
 *   2. Against the LOCAL server (with our patched report-back.js) —
 *      must pass.
 *
 * Each run walks the widget to step 3, waits for the screenshot
 * pipeline to finish, and asserts that an <img class="screenShotCanvas">
 * with a data: URL was appended.
 */
const { test, expect } = require('@playwright/test');

const LIVE_URL = 'https://filipegarcia.github.io/ReportBack/';

/**
 * Walk the dialog from the floating Feedback button to step 3 and
 * return everything we know about the screenshot panel.
 */
async function walkToScreenshot(page) {
  const pageErrors = [];
  const consoleMsgs = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      consoleMsgs.push(`[${m.type()}] ${m.text()}`);
    }
  });

  // The widget appends the button via JS, so wait until jQuery has wired it up.
  await page.waitForSelector('#feedback', { state: 'visible' });
  await page.click('#feedback');

  await page.waitForSelector('#step1', { state: 'visible' });
  await page.fill('#usrDescription', 'Screenshot regression test');

  await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).click();
  await page.waitForSelector('#step2', { state: 'visible' });
  // Let the dialog finish animating into the corner.
  await page.waitForTimeout(1300);

  await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).click();
  await page.waitForSelector('#step3', { state: 'visible' });

  // Give html2canvas + the thumbnail cropping loop generous time.
  const screenshotImg = page.locator('#screenshootImg img.screenShotCanvas');
  const errorMessage = page.locator('#screenshootImg', { hasText: 'There was a problem creating the screenshot' });

  let outcome = 'pending';
  try {
    await Promise.race([
      screenshotImg.waitFor({ state: 'visible', timeout: 20_000 }).then(() => { outcome = 'image'; }),
      errorMessage.waitFor({ state: 'visible', timeout: 20_000 }).then(() => { outcome = 'error'; }),
    ]);
  } catch {
    outcome = 'timeout';
  }

  const state = await page.evaluate(() => ({
    progressVisible: (() => {
      const p = document.querySelector('#thumbProgress');
      if (!p) return null;
      return /** @type {HTMLElement} */ (p).offsetParent !== null;
    })(),
    hasImg: !!document.querySelector('#screenshootImg img.screenShotCanvas'),
    imgSrc: (() => {
      const img = /** @type {HTMLImageElement} */ (
        document.querySelector('#screenshootImg img.screenShotCanvas')
      );
      return img ? img.src.slice(0, 32) : null;
    })(),
    screenshootHtml: (document.querySelector('#screenshootImg') || {}).innerHTML || null,
    reportHasScreenshot: typeof (window).report === 'object' && !!(window).report && !!(window).report.screenshot,
    html2canvasLoaded: typeof (window).html2canvas === 'function',
  }));

  return { outcome, state, pageErrors, consoleMsgs };
}

test.describe('Screenshot feature regression', () => {
  test('local server (patched code) — screenshot panel renders an <img>', async ({ page }) => {
    await page.goto('/');
    const result = await walkToScreenshot(page);

    console.log('LOCAL state:', result.state);
    console.log('LOCAL outcome:', result.outcome);
    if (result.pageErrors.length) console.log('LOCAL pageerrors:', result.pageErrors);
    if (result.consoleMsgs.length) console.log('LOCAL console:', result.consoleMsgs);

    expect(result.outcome, 'screenshot panel never rendered an <img>').toBe('image');
    expect(result.state.hasImg).toBe(true);
    expect(result.state.imgSrc).toMatch(/^data:image\/png/);
    expect(result.state.reportHasScreenshot).toBe(true);
  });

  test('LIVE gh-pages — reproduces the user-reported bug', async ({ page, browserName }) => {
    test.skip(!!process.env.SKIP_LIVE, 'SKIP_LIVE set');
    test.setTimeout(60_000);

    try {
      await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    } catch (err) {
      test.skip(true, `couldn't reach the live site: ${err.message}`);
    }

    const result = await walkToScreenshot(page);

    console.log('LIVE state:', result.state);
    console.log('LIVE outcome:', result.outcome);
    if (result.pageErrors.length) console.log('LIVE pageerrors:', result.pageErrors);
    if (result.consoleMsgs.length) console.log('LIVE console:', result.consoleMsgs);

    // The bug: the <img> never gets appended. We *assert* the bug exists
    // so this test fails the day the live site is redeployed with the fix
    // (which is the signal we want).
    expect(
      result.outcome,
      'live site unexpectedly produced a screenshot — has it been redeployed?'
    ).not.toBe('image');
  });
});
