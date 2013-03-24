/*
 reportback  <https://github.com/filipegarcia/ReportBack>
 Copyright (c) 2013 Filipe Garcia. All rights reserved.

 Released under Apache License v2.0
*/
// report array to be used during the process
//Initialize the report back, dynamically loading the scripts and css and set up step1
function report_warmup_dyn(e, t) {
    //Load the dependencies
    $.getScript("assets/js/dependencies.js"), // check /Gruntfile.js to know which files are being minified
    // add stylesheet to IE8 :(
    document.createStyleSheet ? (document.createStyleSheet("assets/css/bootstrap.min.css"), 
    document.createStyleSheet("assets/css/jquery.ui.css")) : ($("head").append($('<link rel="stylesheet" type="text/css" />').attr("href", "assets/css/bootstrap.min.css")), 
    $("head").append($('<link rel="stylesheet" type="text/css" />').attr("href", "assets/css/jquery.ui.css"))), 
    //checking if browser support canvas element
    report.canvas = isCanvasSupported(), //Draw modal dialog and go to step 1
    drawDialog(), goStep1(), report.user = e, report.productInfo = t;
}

//If you don't need to dynamically load anything you can use this one
function report_warmup() {
    $("#feedback").on("click", function() {
        drawDialog(), goStep1();
    });
}

// add all steps to the dialog window
// show step 1 first
function drawDialog() {
    var e = '<div id="reportDialog" title="' + msg.dialog.title + '"></div>';
    step1 = ' <div id="step1">        <form>          <div class="row-fluid">' + msg.dialog.step1.info1 + msg.dialog.step1.info2 + '          <textarea id="usrDescription" rows="5" class="span12"></textarea>' + msg.dialog.step1.info3 + "          </div>" + "        </form>" + "      </div>", 
    step2 = '<div id="step2" style="display:none;">	<p>' + msg.dialog.step2.info1 + "</p>" + "			<div>" + '				<div class="row-fluid">' + '					<div class="span12"> <button id="highlight" class="btn btn-primary" type="button">' + '						<i class="icon-eye-open"></i> ' + msg.highlight + "&nbsp;</button>" + msg.dialog.step2.label1 + "</div>" + "				</div><br/>" + '				<div class="row-fluid">' + '					<div class="span12"> <button id="block" class="btn" type="button"><i class="icon-eye-close">' + "						</i> " + msg.blackOut + "</button>" + msg.dialog.step2.label2 + "</div>" + "				</div><br/>" + '				<div class="row-fluid">' + '					<div class="span12"> <button id="clear" class="btn" type="button"><i class="icon-remove"></i> ' + msg.clear + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</button>" + msg.dialog.step2.label3 + "</div>" + "				</div>" + "				</div>" + "			</div>", 
    step3 = '<div id="step3" style="display:none;">	<div class="row-fluid">	<div id="strechInNoCanvas" class="span6" style="max-height: 350px;overflow-y: scroll;}">		<form>	    <div class="row-fluid">	    <label><b>' + msg.dialog.step3.description + "</b></label>" + '			<div id="usertext" style="margin-left:20px;"></div>' + "	    <label><b>" + msg.dialog.step3.aditionalInfo + "</b></label>" + '	    <div class="accordion" id="envInfo" style="margin-left:20px;">' + '	      <div class="accordion-group">' + '	          <div class="accordion-heading">' + '	              <a class="accordion-toggle" data-toggle="collapse" data-parent="#envInfo" href="#collapseOne">' + msg.dialog.step3.userInfo + "</a>" + "	          </div>" + '	          <div id="collapseOne" class="accordion-body collapse">' + '	              <div class="accordion-inner userInfo"></div>' + "	          </div>" + "	      </div>" + '	      <div class="accordion-group">' + '	          <div class="accordion-heading">' + '	              <a class="accordion-toggle" data-toggle="collapse" data-parent="#envInfo" href="#collapseTwo">' + msg.dialog.step3.pageInfo + "</a>" + "	          </div>" + '	          <div id="collapseTwo" class="accordion-body collapse">' + '	              <div class="accordion-inner pageInfo"></div>' + "	          </div>" + "	      </div>" + '	      <div class="accordion-group">' + '	          <div class="accordion-heading">' + '	              <a class="accordion-toggle" data-toggle="collapse" data-parent="#envInfo" href="#collapseThree">' + msg.dialog.step3.browserInfo + "</a>" + "	          </div>" + '	          <div id="collapseThree" class="accordion-body collapse">' + '	              <div class="accordion-inner browserInfo"></div>' + "	          </div>" + "	      </div>" + "	    </div>" + "	    </div>" + "	   </form>" + "		</div>" + '		<div id="onlyInCanvas" class="span6">' + '			<div id="screenPreview">' + "					<b>" + msg.dialog.step3.screenshot + "</b>" + '					<div id="thumbProgress" class="progress progress-striped active">' + '						<div class="bar" style="width: 100%;"></div>' + "					</div>" + '			<div id="screenshootImg">' + "					</div>" + "			</div>" + "		</div>" + "		</div>" + "	</div>", 
    step4 = '<div id="step4" style="display:none;">				<h3>' + msg.dialog.step4.title + "</h3>" + msg.dialog.step4.info1 + msg.dialog.step4.info2 + "		</div>", 
    $("body").append(e), // if no the browser doesn't support canvas, skip step 2
    report.canvas ? $("#reportDialog").append(step1 + step2 + step3 + step4) : ($("#reportDialog").append(step1 + step3 + step4), 
    $("#onlyInCanvas").remove(), $("#strechInNoCanvas").removeClass("span6").addClass("span12"));
}

function cleanup() {
    _gaq.push([ "_trackEvent", "Step", "close", "Close dialog" ]), //Hide the  canvas element
    hideCanvas(), //return to initial state
    $("#feedback").show(), $("#step1").show(), $("#step2").hide(), $("#step3").hide(), 
    $("#step4").hide(), //Now the click on the feedback button has to be different
    $("#feedback").unbind("click").on("click", function() {
        goStep1();
    }), //Clear the environment variables
    $(".pageInfo").empty(), $(".userInfo").empty(), $(".browserInfo").empty(), cleanThumbElement(), 
    $("#usrDescription").val("");
}

// 	Get the user feedback description.
// 		prepare click actions for step1
function goStep1() {
    _gaq.push([ "_trackEvent", "Step", "1", "Open step1" ]), $("#feedback").hide(), 
    $("#reportDialog").dialog({
        width: 500,
        modal: !1,
        resizable: !1,
        zIndex: 1050,
        close: function() {
            cleanup();
        }
    }), // fixing the position because the dialog is injected in the body
    $(".ui-dialog ").css("position", "fixed"), $("#reportDialog").dialog("option", "position", "center"), 
    $("#step2").is(":visible") ? $("#step2").hide("blind", {
        direction: "vertical"
    }, 500) : $("#step3").is(":visible") && $("#step3").hide("blind", {
        direction: "vertical"
    }, 500), $("#step1").show("blind", {
        direction: "vertical"
    }, 500), setStep1Buttons(), //I really don't like the cross mouse pointer in the jquery ui modal
    $(".ui-dialog-titlebar").css("cursor", "auto");
    //Close btn added(for some reason it's not there) TODO fix this
    var e = '<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span><span class="ui-button-text">close</span>';
    $(".ui-dialog-titlebar-close").html(e);
}

// 	Show modal that allow user to highlight and black out the page.
// 		Set up canvas element and prepare click event for step 2
function goStep2() {
    _gaq.push([ "_trackEvent", "Step", "2", "Open step2" ]);
    var e = $("#reportDialog");
    e.dialog({
        width: 500
    }), e.dialog("widget").animate({
        left: $(window).width() - 550,
        top: $(window).height() - 350
    }, 1e3), $("#step2").show("blind", {
        direction: "vertical"
    }, 500), $("#step1").is(":visible") ? $("#step1").hide("blind", {
        direction: "vertical"
    }, 500) : $("#step3").is(":visible") && $("#step3").hide("blind", {
        direction: "vertical"
    }, 500), setStep2Buttons(), // clean canvas first
    drawInCanvas();
}

// show the screenshot taken and all the info about the environment
//		set up buttons for step 3
function goStep3() {
    _gaq.push([ "_trackEvent", "Step", "3", "Open step3" ]), //	animate to center, already using the new width
    $("#reportDialog").dialog("widget").animate({
        left: $(window).width() / 2 - 450,
        top: $(window).height() / 2 - 260
    }, 1e3), $("#reportDialog").dialog({
        width: 900
    }), //Check if is jumping step2 because of not supporting canvas
    $("#step1").is(":visible") && $("#step1").hide("blind", {
        direction: "vertical"
    }, 500), $("#step2").hide("blind", {
        direction: "vertical"
    }, 500), $("#step3").show("blind", {
        direction: "vertical"
    }, 500), setStep3Buttons(), // Collect and fill in the info about the page
    fillInInfo(), //take the screenshot and continue the logic after that
    // wait after the animation is complete or otherwise the screen can flicker
    report.canvas && setTimeout(function() {
        takeScreenShot();
    }, 1e3);
}

function saveReport() {
    _gaq.push([ "_trackEvent", "Step", "save", "Open save Report" ]), $("#reportDialog").dialog({
        width: 500
    }), $("#step3").hide("blind", {
        direction: "vertical"
    }, 200), $("#step4").show("blind", {
        direction: "vertical"
    }, 200), finishButtons(), //remove this for production
    console.log(report);
}

/* #########################################################################################

		Set up the button actions

######################################################################################### */
function setStep1Buttons() {
    $("#reportDialog").dialog({
        buttons: [ {
            text: msg.next,
            click: function() {
                report.description = $("#usrDescription").val(), report.canvas ? goStep2() : goStep3();
            }
        } ]
    }), $(".ui-dialog-buttonset :button").addClass("btn");
}

function setStep2Buttons() {
    $("#reportDialog").dialog({
        buttons: [ {
            text: msg.back,
            click: function() {
                goStep1(), // The animation is only set only when coming back
                $("#reportDialog").dialog("widget").animate({
                    left: $(window).width() / 2 - 250,
                    top: $(window).height() / 2 - 200
                }, 1e3);
            }
        }, {
            text: msg.next,
            click: function() {
                goStep3();
            }
        } ]
    }), $(".ui-dialog-buttonset :button").addClass("btn");
}

function setStep3Buttons() {
    $("#reportDialog").dialog({
        buttons: [ {
            text: msg.back,
            click: function() {
                report.canvas ? (goStep2(), cleanThumbElement()) : goStep1();
            }
        }, {
            text: msg.submit,
            click: function() {
                report.description = $("#updatedDescription").val(), saveReport();
            }
        } ]
    }), $(".ui-dialog-buttonset :button").addClass("btn");
}

function finishButtons() {
    $("#reportDialog").dialog({
        buttons: [ {
            text: msg.ok,
            click: function() {
                $("#reportDialog").dialog(msg.close), cleanup();
            }
        } ]
    }), $(".ui-dialog-buttonset :button").addClass("btn");
}

/* #########################################################################################

		Take a screenshot and create a "thumbnail"

######################################################################################### */
function isCanvasSupported() {
    var e = document.createElement("canvas");
    return !(!e.getContext || !e.getContext("2d"));
}

//Draw a red stoke around the viewport so when the screenshot is taken
//		the viewport is defined
function drawViewportBox() {
    context.strokeStyle = "red";
    var e = $(window);
    context.strokeRect(e.scrollLeft(), e.scrollTop(), e.width(), e.height());
}

// Create a "thumbnail" of the original render of the page
//		using drawImage and cropping only the viewport.
//		The new canvas is then appended to the modal box with fixed width
//			(not a real thumbnail I now)
function makeThumbnail() {
    var e = $(window), t = new Image();
    t.src = report.screenshot, $("body").append('<canvas id="thumbCanvas"></canvas>');
    // The thumbnail will be drawn in here
    var o = $("#thumbCanvas");
    o[0].width = e.width(), o[0].height = e.height(), // This will be used to check if the thumbnail canvas is empty
    $("body").append('<canvas id="thumbCanvasBlank" style="display:none"></canvas>');
    var n = $("#thumbCanvasBlank");
    n[0].width = e.width(), n[0].height = e.height(), //set viewport crop window
    // It looks like drawImage doesn't like to wait for original image
    // so divided the function to a loop for now.
    //TODO add loop limit counter
    //TODO try to optimize this process
    startCrop(t, e, o, n);
}

// try to draw the thumbnail
// if it's still empty, try again.
function startCrop(e, t, o, n) {
    var i = o[0].getContext("2d");
    // draw the viewport image and copy it to another var
    i.drawImage(e, t.scrollLeft(), t.scrollTop(), t.width(), t.height(), 0, 0, t.width(), t.height()), 
    o[0].toDataURL() == n[0].toDataURL() ? setTimeout(function() {
        startCrop(e, t, o, n);
    }, 500) : finishCrop(e, t, o, n);
}

// It would be cool to catch invalidstateerror instead of doing this bad trick
function finishCrop(e, t, o, n) {
    // Check if canvas is empty
    if (report.thumb = o[0].toDataURL(), // hide the thumbnail
    o.hide(), // Hide the progress bar
    $("#thumbProgress").hide(), o[0].toDataURL() != n[0].toDataURL()) $("#screenshootImg").append("<img class='screenShotCanvas' src='" + report.thumb + "' alt='Page Screenshot' width='400' >"); else {
        var i = "There was a problem creating the screenshot :(<br/> Don't worry, submit your feedback anyway";
        $("#screenshootImg").append(i);
    }
}

// Taking the screenshot of the hole image
function takeScreenShot() {
    // Draw outline on viewport
    drawViewportBox();
    var e = $(window), t = e.scrollTop(), o = e.scrollLeft();
    // set the dialog to be ignored by html2canvas
    $(".ui-dialog").attr("data-html2canvas-ignore", "true"), html2canvas($("body"), {
        //you can enable logging on
        //logging:true ,
        onrendered: function(n) {
            var i = n.toDataURL();
            //the render canvas messes up the viewport
            e.scrollTop(t), e.scrollLeft(o), // add screenshot image to report
            report.screenshot = i, hideCanvas(), // Create screenshot thumbnail
            makeThumbnail();
        }
    });
}

// Clean canvas after all the work is done
function hideCanvas() {
    $("#canvas").hide(), $("#myCanvas").hide();
}

// clean the preview of the thumbnail
function cleanThumbElement() {
    $("#screenshootImg").empty(), $("#thumbProgress").show();
}

/* #########################################################################################

		Fetch environment values

######################################################################################### */
function fillInInfo() {
    //Fetch info
    writeUserComment(), writeProductInfo(), writeUserInfo(), writePageInfo(), writeBrowserInfo();
}

function stripTags(e) {
    return e.replace(/<\/?[^>]+>/gi, "");
}

// append to a div an echo of all properties with exception of empty values, functions or
//		something inside the notInclude array
function dumpVars(e, t, o) {
    $div = $(t), jQuery.each(e, function(e, t) {
        "function" != typeof t && -1 == jQuery.inArray(e, o) && "" !== t && $div.append(e + " : " + t + "<br/>");
    });
}

function showPlugins() {
    for (var e = navigator.plugins.length, t = "", o = 0; e > o; o++) t += '<a rel="tooltip" href="#" data-original-title="' + stripTags(navigator.plugins[o].description) + '" data-triger="hover" data-placement="right">' + navigator.plugins[o].name + "</a>", 
    t += " , ", t += navigator.plugins[o].filename, navigator.plugins[o].version && (t += " | ", 
    t += navigator.plugins[o].version), t += "<br>";
    return t;
}

function get_cookies_array() {
    var e = {};
    if (document.cookie && "" !== document.cookie) for (var t = document.cookie.split(";"), o = 0; t.length > o; o++) {
        var n = t[o].split("=");
        n[0] = n[0].replace(/^ /, ""), e[decodeURIComponent(n[0])] = decodeURIComponent(n[1]);
    }
    return e;
}

function writeBrowserInfo() {
    var e = $(".browserInfo");
    e.append("<h4>" + msg.dialog.step3.browserVersion + ":</h4>"), dumpVars(jQuery.browser, ".browserInfo"), 
    report.browserInfo = jQuery.browser, e.append("<h4>" + msg.dialog.step3.operatingSystem + ": </h4>"), 
    dumpVars(navigator, ".browserInfo", [ "plugins", "mimeTypes" ]), report.navigator = navigator, 
    e.append("<h4>" + msg.dialog.step3.installedPlugins + ": </h4>" + showPlugins());
}

function writePageInfo() {
    var e = $(".pageInfo");
    // Get all page url info
    e.append("<h4>" + msg.dialog.step3.pageUrl + ":</h4>"), dumpVars(window.location, ".pageInfo", [ "ancestorOrigins" ]), 
    report.location = window.location;
    // Get all DOM elements
    var t = $.base64.encode($("html").html());
    report.encodedHtml = t, e.append("<h4>" + msg.dialog.step3.pageStucture + ":</h4>").append("<div class='row-fluid'><textarea rows='4' class='span12'>" + report.encodedHtml + "</textarea></div>");
}

function writeUserInfo() {
    var e = $(".userInfo");
    //Check if the user has something filled in
    null !== report.user && (e.append("<h4>" + msg.dialog.step3.userInfo + ":</h4>"), 
    dumpVars(report.user, ".userInfo"));
    // Get all cookies
    var t = get_cookies_array();
    $.isEmptyObject(t) || (e.append("<h4>" + msg.dialog.step3.cookies + ":</h4>"), dumpVars(t, ".userInfo"), 
    report.cookies = t);
}

function writeUserComment() {
    var e = "<textarea rows='4' class='span12' id='updatedDescription'>" + report.description + "</textarea>";
    $("#usertext").html(e);
}

function writeProductInfo() {
    var e = "<label><b>" + msg.dialog.step3.prodInfo + "</b></label>" + '<div id="prodInfo" style="margin-left:20px;"></div>';
    null !== report.productInfo && ($("#usertext").after(e), dumpVars(report.productInfo, "#prodInfo"));
}

/* #########################################################################################

		Highlight and Blackout in canvas

######################################################################################### */
function drawInCanvas() {
    // stretch Canvas and div to full page
    function e() {
        var e = n(), t = i();
        a.width(e), a.height(t), s.attr({
            width: e,
            height: t
        }), // Fill the canvas with black opacity of shade
        context.fillStyle = l, context.fillRect(0, 0, s.width(), s.height()), o();
    }
    // clear Canvas and div so the page can shrink
    function t() {
        a.width(0), a.height(0), s.attr({
            width: 0,
            height: 0
        });
    }
    // clean Canvas element
    function o() {
        context.clearRect(0, 0, s.width(), s.height()), context.fillStyle = l, context.fillRect(0, 0, s.width(), s.height());
    }
    function n() {
        return document.documentElement.offsetWidth;
    }
    function i() {
        var e = document;
        return Math.max(Math.max(e.body.scrollHeight, e.documentElement.scrollHeight), Math.max(e.body.offsetHeight, e.documentElement.offsetHeight), Math.max(e.body.clientHeight, e.documentElement.clientHeight));
    }
    var r = '<canvas id="myCanvas"></canvas><div id="canvas"></div>';
    $("body").append(r), //Change the canvas css
    $("#canvas, #myCanvas").css({
        position: "absolute",
        left: "0px",
        top: "0px",
        display: "block",
        cursor: "default",
        "z-index": "1040"
    });
    var a = $("#canvas"), s = $("#myCanvas");
    context = s[0].getContext("2d");
    var l = "rgba(0, 0, 0, 0.295)", c = "rgba(0, 0, 0, 1)", d = "rgba(0, 0, 0, 0)";
    // initialization of the canvas element
    e();
    // highlight or blackout state
    var p = "highlight";
    $(window).resize(function() {
        t(), e();
    }), $.extend($.ui.boxer, {
        defaults: $.extend({}, $.ui.mouse.defaults, {
            appendTo: "body",
            distance: 0
        })
    }), $("#highlight").on("click", function() {
        $("#reportDialog button").removeClass("btn-primary"), $(this).addClass("btn-primary"), 
        p = "highlight";
    }), $("#block").on("click", function() {
        $("#reportDialog button").removeClass("btn-primary"), $(this).addClass("btn-primary"), 
        p = "block";
    }), $("#clear").on("click", function() {
        o();
    }), //$.widget("ui.boxer", $.extend({}, $.ui.mouse, {
    $.widget("ui.boxer", $.ui.mouse, {
        options: {
            appendTo: "body",
            distance: 0
        },
        _init: function() {
            this.element.addClass("ui-boxer"), this.dragged = !1, this._mouseInit(), this.helper = $(document.createElement("div")).css({
                border: "1px dotted red"
            }).addClass("ui-boxer-helper");
        },
        _mouseStart: function(e) {
            if (this.opos = [ e.pageX, e.pageY ], !this.options.disabled) {
                var t = this.options;
                this._trigger("start", e), $(t.appendTo).append(this.helper), this.helper.css({
                    position: "absolute",
                    left: e.clientX,
                    top: e.clientY,
                    width: 0,
                    height: 0,
                    "z-index": 1040
                }), "highlight" == p ? this.helper.css({
                    background: d
                }) : this.helper.css({
                    background: l
                });
            }
        },
        _mouseDrag: function(e) {
            if (this.dragged = !0, !this.options.disabled) {
                this.options;
                var t, o = this.opos[0], n = this.opos[1], i = e.pageX, r = e.pageY;
                return o > i && (t = i, i = o, o = t), n > r && (t = r, r = n, n = t), this.helper.css({
                    left: o,
                    top: n,
                    width: i - o,
                    height: r - n
                }), this._trigger("drag", e), !1;
            }
        },
        _mouseStop: function() {
            this.dragged = !1, this.options, this.helper.clone();
            // get the positions
            var e = this.helper.offset().top, t = this.helper.offset().left, o = this.helper.width(), n = this.helper.height();
            // check if highlight or black out
            return "highlight" == p ? context.clearRect(t, e, o, n) : (context.fillStyle = c, 
            context.fillRect(t, e, o, n)), this.helper.remove(), !1;
        }
    }), $.extend($.ui.boxer.prototype, {
        options: $.extend({}, $.ui.mouse.prototype.options, {
            appendTo: "#canvas",
            distance: 0
        })
    }), // Using the boxer plugin
    $(window).boxer({
        stop: function(e, t) {
            t.box.offset();
        }
    });
}

var report = [], msg = {
    ok: "ok",
    close: "close",
    next: "next",
    submit: "Submit",
    back: "Back",
    highlight: "Highlight",
    blackOut: "Black out",
    clear: "Clear",
    dialog: {
        title: "Give us your feedback :)",
        step1: {
            info1: "Report Back lets you send suggestions about the product.We welcome problem reports, feature ideas and general comments.<br/><br/>Legal notifications sent through Report Back will not be processed and they're something I don't care about in here.(Legal mambo-jambo)<br/><br/>",
            info2: "Start by writing a brief description:",
            info3: "Next we'll let you identify areas of the page related to your description."
        },
        step2: {
            info1: "Click and drag on the page to help us better understand your feedback.You can move this dialog if it's in the way.",
            label1: " Highlight areas relevant to your feedback.",
            label2: " Black out any personal information.",
            label3: " Remove all boxes."
        },
        step3: {
            description: "Description",
            aditionalInfo: "Aditional Info",
            userInfo: "User info",
            pageInfo: "Page info",
            browserInfo: "Browser info",
            screenshot: "Screenshot",
            cookies: "Cookies",
            prodInfo: "Product Info",
            pageStucture: "Encoded Page Structure",
            pageUrl: "Page Url",
            installedPlugins: "Installed Plugins",
            operatingSystem: "Operating System",
            browserVersion: "Browser version"
        },
        step4: {
            title: "All done",
            info1: "Now it's up to you to do something with the gathered info.<br/>Why not send it over an ajax request to your server?<br/>",
            info2: "For development purposes, check console.log to view the log of the report object"
        }
    }
};

// So $.browser was removed in jQuery 1.9 but I really need it
// 	not to make conditional changes but to output the browser info,
//	and because of that I'm including it in here again.
(function() {
    var e, t;
    jQuery.uaMatch = function(e) {
        e = e.toLowerCase();
        var t = /(chrome)[ \/]([\w.]+)/.exec(e) || /(webkit)[ \/]([\w.]+)/.exec(e) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || 0 > e.indexOf("compatible") && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e) || [];
        return {
            browser: t[1] || "",
            version: t[2] || "0"
        };
    }, e = jQuery.uaMatch(navigator.userAgent), t = {}, e.browser && (t[e.browser] = !0, 
    t.version = e.version), // Chrome is Webkit, but Webkit is also Safari.
    t.chrome ? t.webkit = !0 : t.webkit && (t.safari = !0), jQuery.browser = t, jQuery.sub = function() {
        function e(t, o) {
            return new e.fn.init(t, o);
        }
        jQuery.extend(!0, e, this), e.superclass = this, e.fn = e.prototype = this(), e.fn.constructor = e, 
        e.sub = this.sub, e.fn.init = function(o, n) {
            return n && n instanceof jQuery && !(n instanceof e) && (n = e(n)), jQuery.fn.init.call(this, o, n, t);
        }, e.fn.init.prototype = e.fn;
        var t = e(document);
        return e;
    };
})();