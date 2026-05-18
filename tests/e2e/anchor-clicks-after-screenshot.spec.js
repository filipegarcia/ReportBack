// @ts-check
/**
 * Regression test for GitHub issue #1:
 *   "Report Back after screenshot, link does not work"
 *
 *   "after I take screenshot, any element of 'a' (link) does not work"
 *
 * Root cause: drawInCanvas() attaches a jQuery UI 'boxer' widget to
 * $(window). The widget extends $.ui.mouse, whose mousedown handler
 * calls event.preventDefault() and whose mouseup handler stamps the
 * target with a 'preventClickEvent' marker that the inherited click
 * handler then uses to swallow the subsequent click event.
 *
 * Because the widget is bound to $(window), every click on the page
 * bubbles into a swallowed click — anchor default actions (URL change,
 * hash navigation, scrolling to anchor) never run.
 *
 * hideCanvas() previously only set display:none on the canvas elements
 * and never destroyed the boxer widget, so anchor clicks stayed broken
 * for the rest of the page's life.
 *
 * Each spec injects a probe anchor with a unique href, clicks it via
 * a real mouse event, and asserts that location.hash actually changed
 * (i.e. the anchor's default action executed). Asserting on the URL
 * is the only way to know the click wasn't swallowed — checking
 * defaultPrevented inside a custom listener gives a false negative
 * because the boxer's click handler is bound to window and runs AFTER
 * any listener bound to the anchor itself.
 */
const { test, expect } = require('@playwright/test');

async function walkToStep3(page) {
  await page.waitForSelector('#feedback', { state: 'visible' });
  await page.click('#feedback');

  await page.waitForSelector('#step1', { state: 'visible' });
  await page.fill('#usrDescription', 'Anchor-clicks regression');
  await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).click();

  await page.waitForSelector('#step2', { state: 'visible' });
  // Let the dialog finish animating into the corner so the boxer widget
  // is fully wired up (matches the real user flow).
  await page.waitForTimeout(1300);

  await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).click();
  await page.waitForSelector('#step3', { state: 'visible' });

  // Wait until the screenshot pipeline finishes. After that hideCanvas()
  // has been called and we're in the exact state the bug describes.
  await page
    .locator('#screenshootImg img.screenShotCanvas')
    .waitFor({ state: 'visible', timeout: 25_000 });
}

/**
 * Drop a probe anchor with a unique hash href at the top of <body> so
 * we can click it without fighting the dialog for screen real estate.
 * Returns the hash value the anchor will navigate to.
 */
async function injectProbeAnchor(page) {
  const hash = `#rb-probe-${Date.now()}`;
  await page.evaluate((h) => {
    const a = document.createElement('a');
    a.id = 'rb-probe';
    a.href = h;
    a.textContent = 'probe';
    a.style.cssText = 'position:fixed;top:8px;left:8px;z-index:2000;background:#fff;padding:4px 8px;border:1px solid #333;';
    document.body.appendChild(a);
  }, hash);
  return hash;
}

test.describe('Anchor clicks survive the screenshot flow (issue #1)', () => {
  test('anchor default action runs while step 3 dialog is open', async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto('/');
    // Start from a known-empty hash.
    await page.evaluate(() => { history.replaceState(null, '', location.pathname + location.search); });

    await walkToStep3(page);

    const hash = await injectProbeAnchor(page);

    // Real mouse click — mousedown → mouseup → click. Pre-fix, the
    // boxer widget on $(window) preventDefault()s the mousedown and
    // marks the target with preventClickEvent so the inherited click
    // handler kills the click event before the browser navigates.
    await page.locator('#rb-probe').click();

    // The single, unambiguous signal: did the browser actually act on
    // the anchor? location.hash flips iff the default action ran.
    await expect.poll(() => page.evaluate(() => location.hash), {
      timeout: 2_000,
      message: 'anchor click default action must execute (location.hash should update)',
    }).toBe(hash);
  });

  test('anchor default action runs after the dialog has been closed', async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto('/');
    await page.evaluate(() => { history.replaceState(null, '', location.pathname + location.search); });

    await walkToStep3(page);

    // Submit and ok out so cleanup() runs.
    await page.locator('.ui-dialog-buttonset button', { hasText: 'Submit' }).click();
    await page.waitForSelector('#step4', { state: 'visible' });
    await page.locator('.ui-dialog-buttonset button', { hasText: 'ok' }).click();

    // jQuery UI keeps the dialog DOM around but hides the wrapper.
    await expect(page.locator('.ui-dialog')).toBeHidden();

    const hash = await injectProbeAnchor(page);
    await page.locator('#rb-probe').click();

    await expect.poll(() => page.evaluate(() => location.hash), {
      timeout: 2_000,
      message: 'anchor click default action must execute after cleanup()',
    }).toBe(hash);
  });
});
