// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'docs', 'screenshots');

test.describe('ReportBack demo — capture documentation screenshots', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => console.log('[pageerror]', err.message));
    await page.goto('/');
    // Wait until the floating Feedback button is wired up.
    await page.waitForSelector('#feedback');
  });

  test('homepage', async ({ page }) => {
    await expect(page).toHaveTitle('Report Back');
    await expect(page.locator('header.subhead h1')).toHaveText('Report Back');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-home.png'),
      fullPage: false,
    });
  });

  test('walk through the feedback flow', async ({ page }) => {
    // Step 1 — open the dialog by clicking the floating Feedback button.
    await page.click('#feedback');
    await page.waitForSelector('#reportDialog', { state: 'visible' });
    await page.waitForSelector('#step1', { state: 'visible' });

    // Fill in a description so the report payload has something to show.
    await page.fill(
      '#usrDescription',
      'When I click "Save" on the settings page my changes are lost. ' +
        'Repro: open settings, change name, click save — page reloads with the old name.'
    );

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-step1-description.png'),
      fullPage: false,
    });

    // Move to step 2 (highlight / blackout).
    await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).click();
    await page.waitForSelector('#step2', { state: 'visible' });
    // Step 2 animates into the bottom-right corner; wait for it to settle.
    await page.waitForTimeout(1300);

    // Draw a highlight box over the page subhead so the screenshot shows
    // the feature actually doing something.
    const head = await page.locator('header.subhead').boundingBox();
    if (head) {
      await page.mouse.move(head.x + 40, head.y + 20);
      await page.mouse.down();
      await page.mouse.move(head.x + head.width - 40, head.y + head.height - 20, { steps: 20 });
      await page.mouse.up();
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-step2-highlight.png'),
      fullPage: false,
    });

    // Move to step 3 (review + screenshot preview).
    await page.locator('.ui-dialog-buttonset button', { hasText: 'next' }).click();
    await page.waitForSelector('#step3', { state: 'visible' });
    // html2canvas + thumbnail crop takes a moment; wait for the progress
    // bar to disappear or for the thumb image to render.
    await page
      .waitForFunction(() => {
        const progress = document.querySelector('#thumbProgress');
        const img = document.querySelector('#screenshootImg img');
        return img || (progress && /** @type {HTMLElement} */ (progress).style.display === 'none');
      }, null, { timeout: 15_000 })
      .catch(() => {
        // Don't fail the screenshot if html2canvas can't render — we still
        // want to capture the panel as it stands.
      });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-step3-review.png'),
      fullPage: false,
    });

    // Submit → step 4 confirmation.
    await page.locator('.ui-dialog-buttonset button', { hasText: 'Submit' }).click();
    await page.waitForSelector('#step4', { state: 'visible' });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '05-step4-done.png'),
      fullPage: false,
    });
  });
});
