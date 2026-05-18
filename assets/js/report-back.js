/*
 * ReportBack <https://github.com/filipegarcia/ReportBack>
 * Copyright (c) 2013 Filipe Garcia. All rights reserved.
 *
 * Released under Apache License v2.0
 */

(function (window, $) {
  'use strict';

  // ----- Optional Google Analytics shim -------------------------------------
  // Older versions called _gaq.push(...) at every step transition. We keep
  // the calls but guard against environments where GA isn't loaded so the
  // widget is safe to drop into any page.
  const track = (...args) => {
    if (typeof window._gaq !== 'undefined' && typeof window._gaq.push === 'function') {
      window._gaq.push(args);
    }
  };

  // Report payload populated as the user walks the steps.
  const report = {};

  // All the labels are extracted, you know, for translation.
  const msg = {
    ok: 'ok',
    close: 'close',
    next: 'next',
    submit: 'Submit',
    back: 'Back',
    highlight: 'Highlight',
    blackOut: 'Black out',
    clear: 'Clear',
    dialog: {
      title: 'Give us your feedback :)',
      step1: {
        info1: 'Report Back lets you send suggestions about the product. ' +
          "We welcome problem reports, feature ideas and general comments.<br/><br/>" +
          'Legal notifications sent through Report Back will not be processed and ' +
          "they're something I don't care about in here. (Legal mambo-jambo)<br/><br/>",
        info2: 'Start by writing a brief description:',
        info3: "Next we'll let you identify areas of the page related to your description.",
      },
      step2: {
        info1: 'Click and drag on the page to help us better understand your feedback. ' +
          "You can move this dialog if it's in the way.",
        label1: ' Highlight areas relevant to your feedback.',
        label2: ' Black out any personal information.',
        label3: ' Remove all boxes.',
      },
      step3: {
        description: 'Description',
        aditionalInfo: 'Additional Info',
        userInfo: 'User info',
        pageInfo: 'Page info',
        browserInfo: 'Browser info',
        screenshot: 'Screenshot',
        cookies: 'Cookies',
        prodInfo: 'Product Info',
        pageStucture: 'Encoded Page Structure',
        pageUrl: 'Page Url',
        installedPlugins: 'Installed Plugins',
        operatingSystem: 'Operating System',
        browserVersion: 'Browser version',
      },
      step4: {
        title: 'All done',
        info1: "Now it's up to you to do something with the gathered info.<br/>" +
          'Why not send it over an ajax request to your server?<br/>',
        info2: 'For development purposes, check console.log to view the log of the report object',
      },
    },
  };

  // --------------------------------------------------------------------------
  // Bootstrap
  // --------------------------------------------------------------------------

  // Initialize ReportBack, dynamically loading the scripts and css and set
  // up step1.
  function report_warmup_dyn(userInfo, productInfo) {
    // Load the dependencies (jquery.base64, html2canvas, bootstrap).
    $.getScript('assets/js/dependencies.js');

    // Add stylesheets (with an IE8 fallback that almost certainly nobody
    // needs in 2025, but kept for parity). Order matters: bootstrap
    // base first, THEN bootstrap-responsive (so the media queries win
    // the cascade — see issue #2), THEN jQuery UI on top. We skip any
    // sheet that's already linked statically so we don't re-shuffle the
    // cascade and lose the responsive layer.
    const ensureSheet = (href) => {
      const already = Array.from(document.styleSheets || []).some((s) => {
        const sheetHref = s.href || '';
        return sheetHref.endsWith(href);
      });
      if (already) return;
      if (document.createStyleSheet) {
        document.createStyleSheet(href);
      } else {
        $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', href));
      }
    };
    ensureSheet('assets/css/bootstrap.min.css');
    ensureSheet('assets/css/bootstrap-responsive.min.css');
    ensureSheet('assets/css/jquery.ui.css');

    // Checking if browser supports the canvas element
    report.canvas = isCanvasSupported();

    // Draw the modal dialog and go to step 1
    drawDialog();
    goStep1();

    report.user = userInfo;
    report.productInfo = productInfo;
  }

  // If you don't need to dynamically load anything you can use this one.
  function report_warmup() {
    $('#feedback').on('click', () => {
      drawDialog();
      goStep1();
    });
  }

  // --------------------------------------------------------------------------
  // Dialog markup
  // --------------------------------------------------------------------------

  function drawDialog() {
    const dialog = `<div id="reportDialog" title="${msg.dialog.title}"></div>`;

    const step1 = `
      <div id="step1">
        <form>
          <div class="row-fluid">
            ${msg.dialog.step1.info1}
            ${msg.dialog.step1.info2}
            <textarea id="usrDescription" rows="5" class="span12"></textarea>
            ${msg.dialog.step1.info3}
          </div>
        </form>
      </div>`;

    const step2 = `
      <div id="step2" style="display:none;">
        <p>${msg.dialog.step2.info1}</p>
        <div>
          <div class="row-fluid">
            <div class="span12">
              <button id="highlight" class="btn btn-primary" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style="vertical-align:-2px;margin-right:4px"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg> ${msg.highlight}&nbsp;</button>
              ${msg.dialog.step2.label1}
            </div>
          </div><br/>
          <div class="row-fluid">
            <div class="span12">
              <button id="block" class="btn" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style="vertical-align:-2px;margin-right:4px"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709z"/><path fill-rule="evenodd" d="M13.646 14.354l-12-12 .708-.708 12 12-.708.708z"/></svg> ${msg.blackOut}</button>
              ${msg.dialog.step2.label2}
            </div>
          </div><br/>
          <div class="row-fluid">
            <div class="span12">
              <button id="clear" class="btn" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style="vertical-align:-2px;margin-right:4px"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg> ${msg.clear}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</button>
              ${msg.dialog.step2.label3}
            </div>
          </div>
        </div>
      </div>`;

    const step3 = `
      <div id="step3" style="display:none;">
        <div class="row-fluid">
          <div id="strechInNoCanvas" class="span6" style="max-height: 350px;overflow-y: scroll;">
            <form>
              <div class="row-fluid">
                <label><b>${msg.dialog.step3.description}</b></label>
                <div id="usertext" style="margin-left:20px;"></div>

                <label><b>${msg.dialog.step3.aditionalInfo}</b></label>
                <div class="accordion" id="envInfo" style="margin-left:20px;">
                  <div class="accordion-group">
                    <div class="accordion-heading">
                      <a class="accordion-toggle" data-toggle="collapse" data-parent="#envInfo" href="#collapseOne">
                        ${msg.dialog.step3.userInfo}
                      </a>
                    </div>
                    <div id="collapseOne" class="accordion-body collapse">
                      <div class="accordion-inner userInfo"></div>
                    </div>
                  </div>

                  <div class="accordion-group">
                    <div class="accordion-heading">
                      <a class="accordion-toggle" data-toggle="collapse" data-parent="#envInfo" href="#collapseTwo">
                        ${msg.dialog.step3.pageInfo}
                      </a>
                    </div>
                    <div id="collapseTwo" class="accordion-body collapse">
                      <div class="accordion-inner pageInfo"></div>
                    </div>
                  </div>

                  <div class="accordion-group">
                    <div class="accordion-heading">
                      <a class="accordion-toggle" data-toggle="collapse" data-parent="#envInfo" href="#collapseThree">
                        ${msg.dialog.step3.browserInfo}
                      </a>
                    </div>
                    <div id="collapseThree" class="accordion-body collapse">
                      <div class="accordion-inner browserInfo"></div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div id="onlyInCanvas" class="span6">
            <div id="screenPreview">
              <b>${msg.dialog.step3.screenshot}</b>
              <!--
                Inline styles on the progress bar so it is visible even
                when Bootstrap 2's .progress class isn't applied for any
                reason (custom CSS bundle, overridden cascade, etc.).
              -->
              <div id="thumbProgress"
                   class="progress progress-striped active"
                   style="height:20px;background:#f7f7f7;border-radius:4px;overflow:hidden;border:1px solid #e3e3e3;margin:4px 0 10px;">
                <div class="bar"
                     style="width:100%;height:100%;background:repeating-linear-gradient(45deg,#149bdf,#149bdf 10px,#0e7ab0 10px,#0e7ab0 20px);"></div>
              </div>
              <div id="screenshootImg"></div>
            </div>
          </div>
        </div>
      </div>`;

    const step4 = `
      <div id="step4" style="display:none;">
        <h3>${msg.dialog.step4.title}</h3>
        ${msg.dialog.step4.info1}
        ${msg.dialog.step4.info2}
      </div>`;

    $('body').append(dialog);

    // If the browser doesn't support canvas, skip step 2
    if (report.canvas) {
      $('#reportDialog').append(step1 + step2 + step3 + step4);
    } else {
      $('#reportDialog').append(step1 + step3 + step4);
      $('#onlyInCanvas').remove();
      $('#strechInNoCanvas').removeClass('span6').addClass('span12');
    }
  }

  function cleanup() {
    track('Step', 'close', 'Close dialog');
    // Hide the canvas element
    hideCanvas();
    // Return to initial state
    $('#feedback').show();
    $('#step1').show();
    $('#step2').hide();
    $('#step3').hide();
    $('#step4').hide();

    // Now the click on the feedback button has to be different
    $('#feedback').off('click').on('click', () => {
      goStep1();
    });

    // Clear the environment variables
    $('.pageInfo').empty();
    $('.userInfo').empty();
    $('.browserInfo').empty();

    cleanThumbElement();
    $('#usrDescription').val('');
  }

  // --------------------------------------------------------------------------
  // Steps
  // --------------------------------------------------------------------------

  // Clamp a preferred dialog width to the current viewport (issue #2).
  // We never want the dialog to exceed (viewport - 16px), so it always
  // leaves a small breathing margin on phones. On desktop the preferred
  // width wins and behavior is unchanged.
  function dialogWidth(preferred) {
    const vw = $(window).width();
    return Math.min(preferred, Math.max(280, vw - 16));
  }

  // Get the user feedback description. Prepare click actions for step1.
  function goStep1() {
    track('Step', '1', 'Open step1');

    $('#feedback').hide();

    $('#reportDialog').dialog({
      width: dialogWidth(500),
      modal: false,
      resizable: false,
      zIndex: 1050,
      close: () => cleanup(),
    });

    // Fix the position because the dialog is injected in the body
    $('.ui-dialog').css('position', 'fixed');
    $('#reportDialog').dialog('option', 'position', 'center');

    if ($('#step2').is(':visible')) {
      $('#step2').hide('blind', { direction: 'vertical' }, 500);
    } else if ($('#step3').is(':visible')) {
      $('#step3').hide('blind', { direction: 'vertical' }, 500);
    }
    $('#step1').show('blind', { direction: 'vertical' }, 500);

    setStep1Buttons();

    // I really don't like the cross mouse pointer in the jquery ui modal
    $('.ui-dialog-titlebar').css('cursor', 'auto');

    // Close button added (for some reason it's not there).
    const btnclose = '<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>' +
      '<span class="ui-button-text">close</span>';
    $('.ui-dialog-titlebar-close').html(btnclose);
  }

  // Show modal that allows the user to highlight and black out the page.
  // Sets up the canvas element and the click events for step 2.
  function goStep2() {
    track('Step', '2', 'Open step2');
    const reportDialog = $('#reportDialog');

    const step2W = dialogWidth(500);
    reportDialog.dialog({ width: step2W });
    // Park the dialog in the bottom-right corner, but clamp so it
    // never goes off-screen on a phone (issue #2). The widget height
    // isn't known until later, so estimate ~300px and clamp top too.
    const vw = $(window).width();
    const vh = $(window).height();
    const targetLeft = Math.max(8, Math.min(vw - step2W - 8, vw - 550));
    const targetTop = Math.max(8, Math.min(vh - 320, vh - 350));
    reportDialog.dialog('widget').animate({
      left: targetLeft,
      top: targetTop,
    }, 1000);

    $('#step2').show('blind', { direction: 'vertical' }, 500);
    if ($('#step1').is(':visible')) {
      $('#step1').hide('blind', { direction: 'vertical' }, 500);
    } else if ($('#step3').is(':visible')) {
      $('#step3').hide('blind', { direction: 'vertical' }, 500);
    }

    setStep2Buttons();

    // Clean canvas first
    drawInCanvas();
  }

  // Show the screenshot taken and all the info about the environment.
  // Set up the buttons for step 3.
  function goStep3() {
    track('Step', '3', 'Open step3');

    // Step 3 prefers 900px so the description + screenshot panels sit
    // side-by-side; clamp for small screens (issue #2). On phones the
    // two `span6` columns will stack instead via Bootstrap's grid.
    const step3W = dialogWidth(900);
    const vw = $(window).width();
    const vh = $(window).height();
    // Animate to center, clamped so the dialog never sits off-screen.
    const targetLeft = Math.max(8, (vw / 2) - (step3W / 2));
    const targetTop = Math.max(8, (vh / 2) - 260);
    $('#reportDialog').dialog('widget').animate({
      left: targetLeft,
      top: targetTop,
    }, 1000);

    $('#reportDialog').dialog({ width: step3W });

    // Check if we're skipping step 2 because of not supporting canvas
    if ($('#step1').is(':visible')) {
      $('#step1').hide('blind', { direction: 'vertical' }, 500);
    }

    $('#step2').hide('blind', { direction: 'vertical' }, 500);
    $('#step3').show('blind', { direction: 'vertical' }, 500);

    setStep3Buttons();

    // Collect and fill in the info about the page. We wrap this in a
    // try/catch so a failure inside any of the info collectors (e.g.
    // base64 encoding choking on a stray Unicode char in the DOM) can
    // never block the screenshot pipeline below.
    try {
      fillInInfo();
    } catch (err) {
      console.error('ReportBack: fillInInfo() failed —', err);
    }

    // Take the screenshot and continue the logic after that.
    // Wait until the animation is complete or the screen can flicker.
    if (report.canvas) {
      setTimeout(takeScreenShot, 1000);
    }
  }

  function saveReport() {
    track('Step', 'save', 'Open save Report');

    $('#reportDialog').dialog({ width: dialogWidth(500) });
    $('#step3').hide('blind', { direction: 'vertical' }, 200);
    $('#step4').show('blind', { direction: 'vertical' }, 200);

    finishButtons();

    // Remove this for production
    console.log(report);

    /*
    // Send to backend
    $.ajax({
      type: 'POST',
      url: 'save/savereport',
      dataType: 'json',
      data: { json: report }
    });
    */
  }

  // --------------------------------------------------------------------------
  // Buttons
  // --------------------------------------------------------------------------

  function setStep1Buttons() {
    $('#reportDialog').dialog({
      buttons: [{
        text: msg.next,
        click: () => {
          report.description = $('#usrDescription').val();
          if (report.canvas) {
            goStep2();
          } else {
            goStep3();
          }
        },
      }],
    });

    $('.ui-dialog-buttonset :button').addClass('btn');
  }

  function setStep2Buttons() {
    $('#reportDialog').dialog({
      buttons: [{
        text: msg.back,
        click: () => {
          goStep1();
          // The animation is only set when coming back. Clamp the
          // target position so the dialog never lands off-screen on
          // small viewports (issue #2).
          const w = dialogWidth(500);
          const vw = $(window).width();
          const vh = $(window).height();
          $('#reportDialog').dialog('widget').animate({
            left: Math.max(8, (vw / 2) - (w / 2)),
            top: Math.max(8, (vh / 2) - 200),
          }, 1000);
        },
      }, {
        text: msg.next,
        click: () => goStep3(),
      }],
    });

    $('.ui-dialog-buttonset :button').addClass('btn');
  }

  function setStep3Buttons() {
    $('#reportDialog').dialog({
      buttons: [{
        text: msg.back,
        click: () => {
          if (report.canvas) {
            goStep2();
            cleanThumbElement();
          } else {
            goStep1();
          }
        },
      }, {
        text: msg.submit,
        click: () => {
          report.description = $('#updatedDescription').val();
          saveReport();
        },
      }],
    });

    $('.ui-dialog-buttonset :button').addClass('btn');
  }

  function finishButtons() {
    $('#reportDialog').dialog({
      buttons: [{
        text: msg.ok,
        click: () => {
          $('#reportDialog').dialog(msg.close);
          cleanup();
        },
      }],
    });

    $('.ui-dialog-buttonset :button').addClass('btn');
  }

  // --------------------------------------------------------------------------
  // Screenshot
  // --------------------------------------------------------------------------

  function isCanvasSupported() {
    const elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
  }

  // Mutable canvas context shared across the boxer widget below. Set inside
  // drawInCanvas().
  let context;

  // Draw a red stroke around the viewport so when the screenshot is taken
  // the viewport is defined.
  function drawViewportBox() {
    if (!context) return;
    context.strokeStyle = 'red';
    const $w = $(window);
    context.strokeRect($w.scrollLeft(), $w.scrollTop(), $w.width(), $w.height());
  }

  // Create a "thumbnail" of the original render of the page using
  // drawImage and cropping only the viewport. The new canvas is then
  // appended to the modal box with fixed width (not a real thumbnail).
  //
  // The original code called startCrop() synchronously right after
  // `original.src = <data URL>` and relied on a 500ms-retry loop to
  // mask the race where drawImage runs before the image decodes.
  // Chromium tends to make data-URL decoding synchronous so it worked;
  // Firefox always defers it to a microtask, so the canvas stayed blank
  // and the loop ran forever ("cropping thumbnail…" in the diagnostic).
  // Wait for onload — no race, no infinite loop.
  function makeThumbnail() {
    const $w = $(window);

    $('body').append('<canvas id="thumbCanvas"></canvas>');
    const thumbCanvas = $('#thumbCanvas');
    thumbCanvas[0].width = $w.width();
    thumbCanvas[0].height = $w.height();

    // This will be used to check if the thumbnail canvas is empty
    $('body').append('<canvas id="thumbCanvasBlank" style="display:none"></canvas>');
    const thumbCanvasBlank = $('#thumbCanvasBlank');
    thumbCanvasBlank[0].width = $w.width();
    thumbCanvasBlank[0].height = $w.height();

    const original = new Image();
    original.onload = () => {
      startCrop(original, $w, thumbCanvas, thumbCanvasBlank);
    };
    original.onerror = (e) => {
      showScreenshotError('Failed to decode the captured screenshot for cropping.');
    };
    original.src = report.screenshot;
  }

  // Try to draw the thumbnail. If it's still empty (which shouldn't
  // happen now that we wait for onload), retry a bounded number of
  // times rather than looping forever.
  function startCrop(original, $w, thumbCanvas, thumbCanvasBlank, attempt) {
    const thumbContext = thumbCanvas[0].getContext('2d');

    // Draw the viewport image and copy it to another var
    thumbContext.drawImage(
      original,
      $w.scrollLeft(), $w.scrollTop(), $w.width(), $w.height(),
      0, 0, $w.width(), $w.height()
    );

    const tryCount = (attempt || 0) + 1;
    if (thumbCanvas[0].toDataURL() === thumbCanvasBlank[0].toDataURL()) {
      if (tryCount > 10) {
        showScreenshotError(
          'Thumbnail canvas stayed blank after 10 retries — the captured ' +
          'screenshot may have been outside the viewport bounds.'
        );
        return;
      }
      setTimeout(() => startCrop(original, $w, thumbCanvas, thumbCanvasBlank, tryCount), 250);
    } else {
      finishCrop(original, $w, thumbCanvas, thumbCanvasBlank);
    }
  }

  // It would be cool to catch invalidstateerror instead of doing this bad trick
  function finishCrop(original, $w, thumbCanvas, thumbCanvasBlank) {
    report.thumb = thumbCanvas[0].toDataURL();

    // Hide the thumbnail
    thumbCanvas.hide();

    // Hide the progress bar
    $('#thumbProgress').hide();

    // Check if canvas is empty
    if (thumbCanvas[0].toDataURL() !== thumbCanvasBlank[0].toDataURL()) {
      $('#screenshootImg').append(
        `<img class='screenShotCanvas' src='${report.thumb}' alt='Page Screenshot' width='400' >`
      );
    } else {
      showScreenshotError('Generated thumbnail was blank.');
    }
  }

  // Render an explicit error message inside the Screenshot panel so the
  // user never sees a silently-empty box. Tagged with [ReportBack] in
  // the console so support requests can grep for it.
  function showScreenshotError(reason) {
    console.error('[ReportBack] screenshot failed:', reason);
    $('#thumbProgress').hide();
    if ($('#screenshootImg .screenShotCanvas').length === 0) {
      $('#screenshootImg')
        .empty()
        .append(
          '<div class="reportback-screenshot-error" style="' +
            'color:#b94a48;padding:8px;border:1px solid #eed3d7;' +
            'background:#f2dede;border-radius:4px;font-size:12px;">' +
            '<b>Screenshot capture failed.</b><br/>' +
            'Submit your feedback anyway — the page metadata is still attached.<br/>' +
            `<small style="color:#7a3a3a;">${String(reason).replace(/</g, '&lt;')}</small>` +
          '</div>'
        );
    }
  }

  // How long to wait for html2canvas to finish before we give up.
  const SCREENSHOT_TIMEOUT_MS = 15000;
  // How long to wait for html2canvas itself to be loaded.
  const HTML2CANVAS_LOAD_TIMEOUT_MS = 10000;
  let screenshotAttemptStart = 0;

  // Take the screenshot of the whole image
  function takeScreenShot() {
    if (typeof window.html2canvas !== 'function') {
      if (!screenshotAttemptStart) screenshotAttemptStart = Date.now();
      const elapsed = Date.now() - screenshotAttemptStart;
      if (elapsed > HTML2CANVAS_LOAD_TIMEOUT_MS) {
        showScreenshotError(
          'html2canvas failed to load. A browser extension (uBlock, NoScript, ' +
          'Privacy Badger…) or content-blocker may be intercepting ' +
          'assets/js/dependencies.js. Try in a private window with extensions disabled.'
        );
        screenshotAttemptStart = 0;
        return;
      }
      setTimeout(takeScreenShot, 250);
      return;
    }
    screenshotAttemptStart = 0;

    console.info('[ReportBack] takeScreenShot starting');

    let onrenderedFired = false;
    const safety = setTimeout(() => {
      if (!onrenderedFired) {
        showScreenshotError(
          `html2canvas did not call onrendered within ${SCREENSHOT_TIMEOUT_MS / 1000}s. ` +
          'Most common causes: a content-blocker, a cross-origin image on the page ' +
          "whose host doesn't send CORS headers, or a CSP that forbids inline canvas use."
        );
      }
    }, SCREENSHOT_TIMEOUT_MS);

    drawViewportBox();

    const $w = $(window);
    const oldTop = $w.scrollTop();
    const oldLeft = $w.scrollLeft();

    $('.ui-dialog').attr('data-html2canvas-ignore', 'true');

    try {
      window.html2canvas($('body'), {
        onrendered(canvas) {
          onrenderedFired = true;
          clearTimeout(safety);
          try {
            if (!canvas || !canvas.width || !canvas.height) {
              showScreenshotError('html2canvas returned an empty canvas.');
              return;
            }
            const data = canvas.toDataURL();

            $w.scrollTop(oldTop);
            $w.scrollLeft(oldLeft);

            report.screenshot = data;
            hideCanvas();
            makeThumbnail();
            console.info('[ReportBack] screenshot captured —',
              canvas.width, 'x', canvas.height,
              `(${Math.round(data.length / 1024)} KB data URL)`);
          } catch (err) {
            // SecurityError happens when toDataURL hits a tainted canvas
            // (cross-origin <img> without CORS headers).
            showScreenshotError(
              `Inside onrendered: ${err && err.message ? err.message : err}`
            );
          }
        },
      });
    } catch (err) {
      clearTimeout(safety);
      showScreenshotError(
        `html2canvas threw synchronously: ${err && err.message ? err.message : err}`
      );
    }
  }

  // Clean canvas after all the work is done.
  //
  // It's not enough to just `display:none` the canvas elements: the
  // boxer widget bound to $(window) in drawInCanvas() extends
  // $.ui.mouse and installs mousedown/click handlers on the window
  // that swallow the next click event on whatever element the user
  // pressed. Leaving the widget alive after the screenshot is taken
  // is what broke <a> clicks for the rest of the page's life
  // (GitHub issue #1).
  //
  // We tear it down here and remove the canvas DOM so the next
  // goStep2()/drawInCanvas() cycle starts from a clean slate.
  function hideCanvas() {
    try {
      const $win = $(window);
      // jQuery UI stores the widget instance under one of these keys
      // depending on version: 'uiBoxer' (1.10+), 'ui-boxer' (older
      // hyphenated form) or just 'boxer' (pre-namespaced legacy).
      const hasWidget = $win.data('uiBoxer')
        || $win.data('ui-boxer')
        || $win.data('boxer');
      if (hasWidget) {
        $win.boxer('destroy');
      }
    } catch (err) {
      // Never let teardown errors block the rest of the flow.
      console.warn('ReportBack: boxer teardown failed —', err);
    }
    // Belt-and-braces: even if the widget destroy ran cleanly, some
    // older vendored jQuery UIs leave the .boxer-namespaced handlers
    // on window. Strip them by namespace — harmless if already gone.
    $(window).off('.boxer');
    $('#canvas').remove();
    $('#myCanvas').remove();
  }

  // Clean the preview of the thumbnail
  function cleanThumbElement() {
    $('#screenshootImg').empty();
    $('#thumbProgress').show();
  }

  // --------------------------------------------------------------------------
  // Environment info
  // --------------------------------------------------------------------------

  function fillInInfo() {
    writeUserComment();
    writeProductInfo();

    writeUserInfo();
    writePageInfo();
    writeBrowserInfo();
  }

  function stripTags(val) {
    return val.replace(/<\/?[^>]+>/gi, '');
  }

  // Append to a div an echo of all properties, with the exception of empty
  // values, functions, or anything inside the notInclude array.
  function dumpVars(obj, div, notInclude = []) {
    const $div = $(div);
    $.each(obj, (j, val) => {
      if (typeof val !== 'function' && $.inArray(j, notInclude) === -1 && val !== '') {
        $div.append(`${j} : ${val}<br/>`);
      }
    });
  }

  function showPlugins() {
    const len = navigator.plugins.length;
    let result = '';
    for (let i = 0; i < len; i++) {
      result += `<a rel="tooltip" href="#" data-original-title="${stripTags(navigator.plugins[i].description)}" data-triger="hover" data-placement="right">${navigator.plugins[i].name}</a>`;
      result += ' , ';
      result += navigator.plugins[i].filename;
      if (navigator.plugins[i].version) {
        result += ' | ';
        result += navigator.plugins[i].version;
      }
      result += '<br>';
    }
    return result;
  }

  function getCookiesArray() {
    const cookies = {};
    if (document.cookie && document.cookie !== '') {
      const split = document.cookie.split(';');
      for (let i = 0; i < split.length; i++) {
        const nameValue = split[i].split('=');
        nameValue[0] = nameValue[0].replace(/^ /, '');
        cookies[decodeURIComponent(nameValue[0])] = decodeURIComponent(nameValue[1]);
      }
    }
    return cookies;
  }

  function writeBrowserInfo() {
    const browserInfo = $('.browserInfo');
    browserInfo.append(`<h4>${msg.dialog.step3.browserVersion}:</h4>`);
    dumpVars($.browser, '.browserInfo');
    report.browserInfo = $.browser;

    browserInfo.append(`<h4>${msg.dialog.step3.operatingSystem}: </h4>`);
    dumpVars(navigator, '.browserInfo', ['plugins', 'mimeTypes']);
    report.navigator = navigator;

    browserInfo.append(`<h4>${msg.dialog.step3.installedPlugins}: </h4>${showPlugins()}`);
  }

  // Unicode-safe base64 encoder. The vendored jquery.base64 throws
  // "INVALID_CHARACTER_ERR: DOM Exception 5" on any char with code > 255
  // (em-dash, smart quotes, emoji…) which used to abort goStep3 before
  // the screenshot could be triggered. We do the UTF-8 → bytes → base64
  // dance ourselves so it works regardless of what the host page contains.
  function encodeUtf8Base64(str) {
    if (str == null) return '';
    if (typeof TextEncoder !== 'undefined' && typeof window.btoa === 'function') {
      const bytes = new TextEncoder().encode(String(str));
      let bin = '';
      // Build the binary string in chunks to keep apply() happy on big payloads.
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      }
      return window.btoa(bin);
    }
    // Fallback for old browsers: percent-encode then btoa.
    return window.btoa(unescape(encodeURIComponent(String(str))));
  }

  function writePageInfo() {
    const pageInfo = $('.pageInfo');
    // Get all page url info
    pageInfo.append(`<h4>${msg.dialog.step3.pageUrl}:</h4>`);
    dumpVars(window.location, '.pageInfo', ['ancestorOrigins']);
    report.location = window.location;

    // Get all DOM elements, base64-encoded (Unicode-safe).
    report.encodedHtml = encodeUtf8Base64($('html').html());

    pageInfo
      .append(`<h4>${msg.dialog.step3.pageStucture}:</h4>`)
      .append(`<div class='row-fluid'><textarea rows='4' class='span12'>${report.encodedHtml}</textarea></div>`);
  }

  function writeUserInfo() {
    const userinfo = $('.userInfo');
    // Check if the user has something filled in
    if (report.user) {
      userinfo.append(`<h4>${msg.dialog.step3.userInfo}:</h4>`);
      dumpVars(report.user, '.userInfo');
    }

    // Get all cookies
    const cookies = getCookiesArray();
    if (!$.isEmptyObject(cookies)) {
      userinfo.append(`<h4>${msg.dialog.step3.cookies}:</h4>`);
      dumpVars(cookies, '.userInfo');
      report.cookies = cookies;
    }
  }

  function writeUserComment() {
    const out = `<textarea rows='4' class='span12' id='updatedDescription'>${report.description || ''}</textarea>`;
    $('#usertext').html(out);
  }

  function writeProductInfo() {
    const out = `<label><b>${msg.dialog.step3.prodInfo}</b></label>` +
      '<div id="prodInfo" style="margin-left:20px;"></div>';

    if (report.productInfo) {
      $('#usertext').after(out);
      dumpVars(report.productInfo, '#prodInfo');
    }
  }

  // --------------------------------------------------------------------------
  // Highlight and Blackout in canvas
  // --------------------------------------------------------------------------

  function drawInCanvas() {
    // Make this call idempotent. If the user bounced back from step3
    // to step2 (or anywhere else that lands here twice), we'd
    // otherwise stack a second canvas/boxer pair on top of the
    // existing one — doubling the click-swallowing problem.
    hideCanvas();

    const canvasElements = '<canvas id="myCanvas"></canvas><div id="canvas"></div>';

    $('body').append(canvasElements);

    // Change the canvas css
    $('#canvas, #myCanvas').css({
      position: 'absolute',
      left: '0px',
      top: '0px',
      display: 'block',
      cursor: 'default',
      'z-index': '1040',
    });

    const drawCanvas = $('#canvas');
    const myCanvas = $('#myCanvas');
    context = myCanvas[0].getContext('2d');

    const shadergb = 'rgba(0, 0, 0, 0.295)';
    const blackrgb = 'rgba(0, 0, 0, 1)';
    const whitergb = 'rgba(0, 0, 0, 0)';

    // Initialization of the canvas element
    stretchOut();

    // Highlight or blackout state
    let boxSettings = 'highlight';

    $(window).resize(() => {
      shrinkIn();
      stretchOut();
    });

    $.extend($.ui.boxer, {
      defaults: $.extend({}, $.ui.mouse.defaults, {
        appendTo: 'body',
        distance: 0,
      }),
    });

    $('#highlight').on('click', function () {
      $('#reportDialog button').removeClass('btn-primary');
      $(this).addClass('btn-primary');
      boxSettings = 'highlight';
    });

    $('#block').on('click', function () {
      $('#reportDialog button').removeClass('btn-primary');
      $(this).addClass('btn-primary');
      boxSettings = 'block';
    });

    $('#clear').on('click', () => cleanCanvas());

    $.widget('ui.boxer', $.ui.mouse, {
      options: {
        appendTo: 'body',
        distance: 0,
      },

      _init() {
        this.element.addClass('ui-boxer');
        this.dragged = false;
        this._mouseInit();

        this.helper = $(document.createElement('div'))
          .css({ border: '1px dotted red' })
          .addClass('ui-boxer-helper');
      },

      // The base widget's destroy doesn't know that we mixed in
      // $.ui.mouse, which means `_mouseDestroy` would never run and
      // the mousedown/click handlers it bound to the element (window)
      // would stay attached forever — swallowing every anchor click
      // on the host page (GitHub issue #1). Override `_destroy` so
      // teardown actually happens.
      _destroy() {
        this._mouseDestroy();
        this.element.removeClass('ui-boxer');
        if (this.helper) this.helper.remove();
      },

      _mouseStart(event) {
        this.opos = [event.pageX, event.pageY];

        if (this.options.disabled) return;

        this._trigger('start', event);

        $(this.options.appendTo).append(this.helper);

        this.helper.css({
          position: 'absolute',
          left: event.clientX,
          top: event.clientY,
          width: 0,
          height: 0,
          'z-index': 1040,
        });

        if (boxSettings === 'highlight') {
          this.helper.css({ background: whitergb });
        } else {
          this.helper.css({ background: shadergb });
        }
      },

      _mouseDrag(event) {
        this.dragged = true;

        if (this.options.disabled) return;

        let x1 = this.opos[0];
        let y1 = this.opos[1];
        let x2 = event.pageX;
        let y2 = event.pageY;
        let tmp;

        if (x1 > x2) { tmp = x2; x2 = x1; x1 = tmp; }
        if (y1 > y2) { tmp = y2; y2 = y1; y1 = tmp; }
        this.helper.css({ left: x1, top: y1, width: x2 - x1, height: y2 - y1 });

        this._trigger('drag', event);

        return false;
      },

      _mouseStop() {
        this.dragged = false;

        // Get the positions
        const btop = this.helper.offset().top;
        const bleft = this.helper.offset().left;
        const bwith = this.helper.width();
        const bheight = this.helper.height();

        // Check if highlight or black out
        if (boxSettings === 'highlight') {
          context.clearRect(bleft, btop, bwith, bheight);
        } else {
          context.fillStyle = blackrgb;
          context.fillRect(bleft, btop, bwith, bheight);
        }

        this.helper.remove();

        return false;
      },
    });

    $.extend($.ui.boxer.prototype, {
      options: $.extend({}, $.ui.mouse.prototype.options, {
        appendTo: '#canvas',
        distance: 0,
      }),
    });

    // Using the boxer plugin
    $(window).boxer({
      stop(event, ui) {
        // hook for the host page to react to a stroke being completed
        if (ui && ui.box) ui.box.offset();
      },
    });

    // ----- Touch shim (issue #2) ----------------------------------------
    // The boxer widget is built on $.ui.mouse, which only listens for
    // mousedown / mousemove / mouseup. Mobile Safari (and any touch
    // browser) doesn't synthesize mouse events from a touch gesture
    // until *after* the gesture ends, so without a shim the highlight
    // / blackout drawing silently never starts.
    //
    // The fix: bind touch listeners directly to #canvas (the topmost
    // overlay div, z-index 1040) and dispatch synthetic MouseEvents at
    // the same coordinates. They bubble up to window where the boxer's
    // mousedown handler picks them up — no boxer code changes needed.
    //
    // Why scope to #canvas and not window? touchmove preventDefault on
    // window would block page scrolling everywhere on the host page.
    // The overlay only exists during step 2, so binding to it means
    // page scrolling is preserved everywhere else.
    if ('ontouchstart' in window) {
      const canvasOverlay = document.getElementById('canvas');
      let touchActive = false;
      const fire = (type, touch) => {
        const evt = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: touch.clientX,
          clientY: touch.clientY,
          button: 0,
          buttons: type === 'mouseup' ? 0 : 1,
        });
        canvasOverlay.dispatchEvent(evt);
      };
      canvasOverlay.addEventListener('touchstart', (e) => {
        // Bail on multi-touch (pinch / zoom) so the user can still
        // zoom the page when they want to.
        if (e.touches.length > 1) return;
        e.preventDefault();
        touchActive = true;
        fire('mousedown', e.changedTouches[0]);
      }, { passive: false });
      canvasOverlay.addEventListener('touchmove', (e) => {
        if (!touchActive || e.touches.length > 1) return;
        e.preventDefault();
        fire('mousemove', e.changedTouches[0]);
      }, { passive: false });
      const endHandler = (e) => {
        if (!touchActive) return;
        e.preventDefault();
        touchActive = false;
        fire('mouseup', e.changedTouches[0]);
      };
      canvasOverlay.addEventListener('touchend', endHandler, { passive: false });
      canvasOverlay.addEventListener('touchcancel', endHandler, { passive: false });
    }

    // Stretch the canvas and div to full page
    function stretchOut() {
      const width = getDocWidth();
      const height = getDocHeight();
      drawCanvas.width(width);
      drawCanvas.height(height);

      myCanvas.attr({ width, height });

      // Fill the canvas with black opacity of shade
      context.fillStyle = shadergb;
      context.fillRect(0, 0, myCanvas.width(), myCanvas.height());

      cleanCanvas();
    }

    // Clear the canvas and div so the page can shrink
    function shrinkIn() {
      drawCanvas.width(0);
      drawCanvas.height(0);
      myCanvas.attr({ width: 0, height: 0 });
    }

    // Clean the canvas element
    function cleanCanvas() {
      context.clearRect(0, 0, myCanvas.width(), myCanvas.height());
      context.fillStyle = shadergb;
      context.fillRect(0, 0, myCanvas.width(), myCanvas.height());
    }

    function getDocWidth() {
      return document.documentElement.offsetWidth;
    }

    function getDocHeight() {
      const D = document;
      return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
      );
    }
  }

  // Expose entry points and the report payload (handy for debugging / tests).
  window.report_warmup_dyn = report_warmup_dyn;
  window.report_warmup = report_warmup;
  window.report = report;

}(window, window.jQuery));


// --------------------------------------------------------------------------
// $.browser shim
// --------------------------------------------------------------------------
// $.browser was removed in jQuery 1.9 but we still need it to output the
// browser info, so we add it back here. Runs in its own IIFE so the rest
// of the file can be wrapped above.
(function () {
  if (typeof jQuery === 'undefined' || jQuery.browser) return;

  jQuery.uaMatch = function (ua) {
    ua = ua.toLowerCase();

    const match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
      /(webkit)[ \/]([\w.]+)/.exec(ua) ||
      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
      /(msie) ([\w.]+)/.exec(ua) ||
      (ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)) ||
      [];

    return {
      browser: match[1] || '',
      version: match[2] || '0',
    };
  };

  const matched = jQuery.uaMatch(navigator.userAgent);
  const browser = {};

  if (matched.browser) {
    browser[matched.browser] = true;
    browser.version = matched.version;
  }

  // Chrome is Webkit, but Webkit is also Safari.
  if (browser.chrome) {
    browser.webkit = true;
  } else if (browser.webkit) {
    browser.safari = true;
  }

  jQuery.browser = browser;
}());
