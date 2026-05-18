# ReportBack

A draggable, in-page feedback and bug-report widget — *à la* YouTube.
Drop it onto any page and your users get a four-step flow to send a
description, highlight or black out parts of the screen, review the
captured page metadata and screenshot, and submit.

[![Demo on GitHub Pages](https://img.shields.io/badge/demo-github%20pages-blue)](https://filipegarcia.github.io/ReportBack/)

## Demo

Live demo: **<https://filipegarcia.github.io/ReportBack/>**

> Heads up: the old `http://filipegarcia.github.com/ReportBack/` URL
> referenced in earlier versions of this README **no longer works** —
> GitHub stopped serving Pages from the `.github.com` host. The site is
> still live; only the hostname changed (`github.com` → `github.io`).

## Screenshots

| Step | Preview |
|------|---------|
| **1. Landing — floating Feedback button** | ![Home](docs/screenshots/01-home.png) |
| **2. Step 1 — write a description**       | ![Step 1](docs/screenshots/02-step1-description.png) |
| **3. Step 2 — highlight / black out**     | ![Step 2](docs/screenshots/03-step2-highlight.png) |
| **4. Step 3 — review captured info**      | ![Step 3](docs/screenshots/04-step3-review.png) |
| **5. Step 4 — done**                      | ![Step 4](docs/screenshots/05-step4-done.png) |

These screenshots are produced by the Playwright suite in
`tests/e2e/screenshots.spec.js` — see [Capturing screenshots](#capturing-screenshots)
to regenerate them.

### On a phone (iPhone 13 emulation)

[Issue #2 — *Support for small screens*](https://github.com/filipegarcia/ReportBack/issues/2)
is **fixed**, and the `iphone` Playwright project (WebKit + iPhone 13
device descriptor: 390 × 844, touch, mobile UA) is the regression guard.
These shots come from `tests/e2e/iphone.spec.js`:

| Step | Preview |
|------|---------|
| **iPhone — landing**                  | ![iPhone home](docs/screenshots/06-iphone-home.png) |
| **iPhone — Step 1, description**      | ![iPhone step 1](docs/screenshots/07-iphone-step1.png) |
| **iPhone — Step 2, highlight panel**  | ![iPhone step 2](docs/screenshots/08-iphone-step2.png) |
| **iPhone — Step 3, review**           | ![iPhone step 3](docs/screenshots/09-iphone-step3.png) |
| **iPhone — Step 4, done**             | ![iPhone step 4](docs/screenshots/10-iphone-step4.png) |

## What it captures

- **Browser info** — version, installed plugins
- **Screenshot** — a `html2canvas` render of the page with highlight /
  blackout overlays, plus a cropped viewport thumbnail
- **Page info** — full URL, the page HTML encoded as base64
- **User info** — cookies, plus anything you pass into
  `report_warmup_dyn(user, product)`
- **Anything else** — extend the `report` global with whatever you need

## Requirements

- Node.js 18+ (tested on Node 22)
- npm 9+

## Getting started

```bash
git clone https://github.com/filipegarcia/ReportBack.git
cd ReportBack
npm install
npm start
```

`npm start` serves the static site on <http://127.0.0.1:8080>. Open it
in a browser, click the **Feedback** button in the bottom-right corner,
and walk through the steps.

## Project layout

```
ReportBack/
├── index.html                  # Demo page
├── assets/
│   ├── css/                    # Bootstrap 2, jQuery UI, docs styles
│   ├── ico/                    # Favicons
│   ├── img/
│   └── js/
│       ├── report-back.js      # Widget source (the only file you really
│       │                       # need on the host page besides the deps)
│       ├── dependencies.js     # Bundled jquery.base64 + html2canvas +
│       │                       # bootstrap.min, loaded lazily on first click
│       ├── jquery.js
│       ├── jquery.ui.js
│       ├── html2canvas.js
│       └── ...
├── tests/e2e/
│   ├── screenshots.spec.js                  # Desktop README screenshots
│   ├── screenshot-feature.spec.js           # Screenshot-pipeline regression
│   ├── highlight-blackout-screenshot.spec.js # Highlight + black-out smoke
│   └── iphone.spec.js                       # iPhone 13 small-screen suite
│                                            # (issue #2)
├── docs/screenshots/           # Generated screenshots (checked in)
├── playwright.config.js
└── package.json
```

## Integrating the widget

Drop the floating button into your layout, then lazy-load the widget
when it's clicked:

```html
<script src="assets/js/jquery.js"></script>
<script src="assets/js/jquery.ui.js"></script>

<script>
  $('body').append("<div id='feedback' class='btn'><i class='icon-bullhorn'></i> Feedback</div>");
  $('#feedback').css({ position: 'fixed', bottom: '0', right: '0' });

  $('#feedback').on('click', () => {
    $.getScript('assets/js/report-back.js', () => report_warmup_dyn(user, product));
  });
</script>
```

`report_warmup_dyn` accepts two optional payloads — `userInfo` and
`productInfo` — which get attached to the report object so you can ship
them along with the description and screenshot.

To send the report somewhere, edit the `saveReport()` function in
`assets/js/report-back.js` and uncomment the `$.ajax` block:

```js
$.ajax({
  type: 'POST',
  url: 'save/savereport',
  dataType: 'json',
  data: { json: report },
});
```

## Capturing screenshots

The Playwright suite walks the widget through every step and dumps PNGs
into `docs/screenshots/`. Run it with:

```bash
npm run screenshots
```

The suite spins up `http-server` automatically via Playwright's
`webServer` config; you don't need to have `npm start` running first.

## Testing on iPhone (small screens)

`tests/e2e/iphone.spec.js` runs the widget under a separate `iphone`
Playwright project that uses the **iPhone 13 device descriptor**
(WebKit engine, 390 × 844 viewport, touch enabled, mobile UA). It was
added in response to
[issue #2 — *Support for small screens*](https://github.com/filipegarcia/ReportBack/issues/2),
which is now **fixed** — the suite is the regression guard.

**One-time setup — install WebKit:**

```bash
npx playwright install webkit
```

**Run just the iPhone project:**

```bash
npx playwright test --project=iphone
```

The suite contains four strict cases:

1. **`landing page fits a phone viewport`** — asserts
   `document.scrollWidth ≤ window.innerWidth`. Guards the CSS load
   order in `index.html` (`bootstrap.min.css` *then*
   `bootstrap-responsive.min.css`); if anyone re-shuffles those into
   the original wrong order, this test catches it.
2. **`feedback dialog fits a phone viewport at every step`** —
   measures the `.ui-dialog` bounding box at steps 1, 2 and 3 and
   verifies it stays inside the 390 px viewport. Guards both the JS
   `dialogWidth()` clamp in `report-back.js` and the CSS safety net
   in `docs.css` (`.ui-dialog { max-width: calc(100vw - 16px); }`).
3. **`touch drawing produces a highlight box`** — synthesizes a
   `touchstart` → `touchmove` → `touchend` sequence on the canvas
   overlay and asserts the underlying `#myCanvas` got cleared at the
   drag's centre point (highlight mode wipes the shader). Guards the
   touch shim in `report-back.js` that bridges touch events to the
   mouse events the legacy jQuery UI `boxer` plugin listens for.
4. **`feedback flow works end-to-end on a phone viewport`** — taps
   through Feedback → describe → next → next → screenshot rendered →
   Submit → step 4. Asserts the screenshot panel produces a real PNG
   `data:` URL > 5 KB. End-to-end smoke test of everything above
   together.

### How the fix works

- **Page overflow** — `bootstrap-responsive.min.css` was loaded
  *before* `bootstrap.min.css`, so the responsive media queries lost
  the cascade and the page rendered at the fixed 940 px desktop
  layout on every viewport. Swapped the link order in `index.html`,
  and added the same ordering safeguard to the dynamic CSS injection
  inside `report_warmup_dyn()` so nothing re-overrides responsive
  after the dialog opens.
- **Dialog overflow** — every `goStepN()` had hard-coded `width: 500`
  / `width: 900` and absolute `left:` positions computed against
  viewport width (e.g. `$(window).width() - 550` would push the
  dialog 160 px off the *left* of a 390 px screen). Replaced the
  hard-coded widths with a `dialogWidth(preferred)` helper that
  clamps to viewport, and clamped every `left/top` animate target.
  Belt-and-braces CSS in `docs.css` caps both `max-width` and
  `max-height`, and makes the body scroll internally so Submit / OK
  stay pinned at the bottom of the dialog and always reachable.
- **Touch drawing** — `report-back.js` now binds
  `touchstart` / `touchmove` / `touchend` handlers directly to
  `#canvas` (the topmost overlay div) and dispatches synthetic
  `MouseEvent`s at the same coordinates. Those bubble up to `window`
  where the boxer's existing mousedown listener picks them up — no
  changes to the boxer itself. Multi-touch (pinch / zoom) is
  explicitly ignored so the user can still zoom the host page, and
  the handlers are scoped to the overlay so page scrolling outside
  the drawing canvas is untouched.

## What changed in this revision

- **Dropped Grunt** — the legacy build only ran uglify, which isn't
  worth the dependency footprint. Source files are now served directly.
- **Modernized `report-back.js`** — wrapped in an IIFE, switched to
  `const`/`let`, arrow functions, template literals; removed implicit
  globals (`context`, `step1` etc.); guarded the optional Google
  Analytics calls so the widget no longer assumes `_gaq` exists; renamed
  `get_cookies_array` → `getCookiesArray`.
- **Fixed bugs**
  - Invalid HTML id `Report-Back<` → `report-back`.
  - `takeScreenShot()` now waits for `html2canvas` to be defined before
    firing (avoids a race on the first click).
  - `report` is now an object, not an array used as a dict.
  - Removed the dead Google Analytics snippet (tracking ID belonged to
    the original author).
  - Removed the IE-8 HTML5 shim conditional.
- **Added Playwright** — single dev dependency, headless Chromium, used
  both as a smoke test and to keep the README screenshots in sync with
  reality.
- **Fixed [issue #2](https://github.com/filipegarcia/ReportBack/issues/2)
  — *Support for small screens***. The page and the dialog now both
  fit a 390 px viewport, and the highlight / black-out canvas
  responds to touch gestures. Three small changes did the work: the
  `bootstrap-responsive.min.css` link in `index.html` was moved to
  load *after* `bootstrap.min.css` (it had been losing the cascade);
  every hard-coded dialog width / position in `report-back.js` was
  routed through a `dialogWidth()` clamp; and a ~30-line touch-shim
  was added to `drawInCanvas()` that converts touch events on the
  drawing canvas into the mouse events the legacy jQuery UI `boxer`
  plugin listens for. A new `iphone` Playwright project
  (WebKit + iPhone 13) and four-test suite in
  `tests/e2e/iphone.spec.js` guard the fix going forward — see
  [Testing on iPhone (small screens)](#testing-on-iphone-small-screens).
- **README + GitHub Pages link** — pointed to the new
  `filipegarcia.github.io` host (the old `.github.com` URL stopped
  resolving years ago).

## Roadmap

- Remove highlight and black-out boxes individually
- Add extra public/private fields to the saved payload
- Record highlighted text along with the canvas overlay
- *(Issue #2 — small-screen support — is now shipped; see
  [What changed in this revision](#what-changed-in-this-revision)
  and
  [Testing on iPhone (small screens)](#testing-on-iphone-small-screens).)*

## Author

ReportBack was created by [Filipe Garcia](mailto:hello@evolving.in).

## License

Code licensed under the [Apache License v2.0](https://www.apache.org/licenses/LICENSE-2.0).
