/*
 reportback  <https://github.com/filipegarcia/ReportBack>
 Copyright (c) 2013 Filipe Garcia. All rights reserved.

 Released under Apache License v2.0
*/

// report array to be build during the process
var report = []



function saveReport() {

	var finalMsg = "<h3>All done</h3>  Now it's up to you to do something with the gathered info."+
	"<br/>Check console to view the log of the report object "

	$("#reportDialog").html(finalMsg)

	console.log(report)

}

function report_warmup_dyn(userInfo) {

	//Load the dependencies

		// I already loaded the bootstrap for the demo page but you might need them in here
		$.getScript('assets/js/bootstrap.min.js');
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'assets/css/bootstrap.min.css') );

		// the rest of the dependencies
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'assets/css/jquery.ui.css') );
		$.getScript('assets/js/jquery.base64.min.js');
    $.getScript('assets/js/html2canvas.min.js');

  //Draw modal dialog and set step 1

		drawDialog()
		goStep1()

		report.user = userInfo
}

function report_warmup() {


	$("#feedback").on("click", function () {
		drawDialog()
		goStep1()
	})


}


// add all steps to the dialog window
// show step 1 first
function drawDialog(){

	var out = '<div id="reportDialog" title="Give us your feedback :)"></div>'

	step1 = ' <div id="step1">'+
	'        <form>'+
	'          <div class="row-fluid">'+
	'          Report Back lets you send suggestions about the product.'+
	'					 We welcome problem reports, feature ideas and general comments.<br/><br/>'+
	'					 Legal notifications sent through Report Back will not be processed and '+
	'they\'r something I don\'t care about in here.<br/><br/>'+
	'					 Start by writing a brief description:'+
	'          <textarea id="usrDescription" rows="5" class="span12"></textarea>'+
	'						Next we\'ll let you identify areas of the page related to your description.'+
	'          </div>'+
	'        </form>'+
	'      </div>'

	step2 = '<div id="step2" style="display:none;">'+
	'	<p>Click and drag on the page to help us better understand your feedback.'+
	'			 You can move this dialog if it\'s in the way.</p>'+
	'			<div>'+
	'				<div class="row-fluid">'+
	'					<div class="span12"> <button id="highlight" class="btn btn-primary" type="button">'+
  '<i class="icon-eye-open"></i> Highlight&nbsp;</button>'+
	'					 Highlight areas relevant to your feedback.</div>'+
	'				</div><br/>'+
	'				<div class="row-fluid">'+
	'					<div class="span12"> <button id="block" class="btn" type="button"><i class="icon-eye-close">'+
  '</i> Black out</button>'+
	'					 Black out any personal information.</div>'+
	'				</div><br/>'+
	'				<div class="row-fluid">'+
	'					<div class="span12"> <button id="clear" class="btn" type="button"><i class="icon-remove"></i>'+
  ' Clear&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</button>'+
	'					 Remove all boxes.</div>'+
	'				</div>'+
	'				</div>'+
	'			</div>'

	step3 = '<div id="step3" style="display:none;">'+
	'	<div class="row-fluid">'+
	'	<div class="span6" >'+
	'		<form>'+
	'	    <div class="row-fluid">tell us where you would improve or change'+
	'	        <br />'+
	'	    <label>Description</label>'+
	'	    <div class="accordion" id="envInfo" style="max-height: 350px;overflow-y: scroll;}">'+
	'	      <div class="accordion-group">'+
	'	          <div class="accordion-heading">'+
	'	              <a class="accordion-toggle" data-toggle="collapse" data-parent="#envInfo" href="#collapseOne">'+
	'	                  User info</a>'+
	'	          </div>'+
	'	          <div id="collapseOne" class="accordion-body collapse">'+
	'	              <div class="accordion-inner userInfo"></div>'+
	'	          </div>'+
	'	      </div>'+
	'	          <div class="accordion-group">'+
	'	              <div class="accordion-heading">'+
	'	                  <a class="accordion-toggle" data-toggle="collapse" data-parent="#envInfo" href="#collapseTwo">'+
	'	                      Page info </a>'+
	'	              </div>'+
	'	              <div id="collapseTwo" class="accordion-body collapse">'+
	'	                  <div class="accordion-inner pageInfo"></div>'+
	'	              </div>'+
	'	          </div>'+
	'	          <div class="accordion-group">'+
	'	          <div class="accordion-heading">'+
	'	              <a class="accordion-toggle" data-toggle="collapse" data-parent="#envInfo" href="#collapseThree">'+
	'	                 Browser info </a>'+
	'	          </div>'+
	'	          <div id="collapseThree" class="accordion-body collapse">'+
	'	              <div class="accordion-inner browserInfo"></div>'+
	'	          </div>'+
	'	      </div>'+
	'	    </div>'+
	'	    </div>'+
	'	   </form>'+
	'		</div>'+
	'		<div class="span6">'+
	'			<div id="screenPreview">'+
	'					<b>Screenshot</b>'+
	'					<div id="thumbProgress" class="progress progress-striped active">'+
	'						<div class="bar" style="width: 100%;"></div>'+
	'					</div>'+
	'	 				<div id="screenshootImg" >'+
  '					</div>'+
	'			</div>'+
	'		</div>'+
	'		</div>'+
	'	</div>'


	$('body').append(out)
	$('#reportDialog').append(step1 + step2 + step3)

}

function cleanup() {
	//Hide the  canvas element
	hideCanvas()
	//return to initial state
	$('#feedback').show()
	$('#step1').show()
	$('#step2').hide()
	$('#step3').hide()

	//Now the click on the feedback button has to be different
	$("#feedback").unbind('click').on('click', function(){
		goStep1()
	})

	//Clear the environment variables
	$(".pageInfo").empty()
	$(".userInfo").empty()
	$(".browserInfo").empty()

	cleanThumbElement()
}

	// 	Get the user feedback description.
	// 		prepare click actions for step1
	function goStep1() {

		$("#feedback").hide()

		$('#reportDialog').dialog({
			width: 500,
			modal: false,
			resizable: false,
			zIndex: 1050,
            close: function() {cleanup()}
		})

		if ($("#step2").is(':visible') ) {
			$('#step2').hide("blind", { direction: "vertical" }, 500)
			$('#step1').show("blind", { direction: "vertical" }, 500)
		}

		setStep1Buttons()

		//I really don't like the cross mouse pointer in the jquery ui modal
		$(".ui-dialog-titlebar").css("cursor", "auto")
	}

	// 	Show modal that allow user to highlight and black out the page.
	// 		Set up canvas element and prepare click event for step 2
	function goStep2() {


		$('#reportDialog').dialog({ width: 500}).dialog("widget").animate({
			left: $(window).width()  - 550,
			top:  $(window).height() - 350
		}, 1000);

		if ($("#step1").is(':visible') ) {
			report.description = $("#usrDescription").val()
			$('#step1').hide("blind", { direction: "vertical" }, 500)
		}
		else if($("#step3").is(':visible') ){
			$('#step3').hide("blind", { direction: "vertical" }, 500)
		}
		$('#step2').show("blind", { direction: "vertical" }, 500)


		setStep2Buttons()

		// clean canvas first
		drawInCanvas()

	}


	// show the screenshot taken and all the info about the environment
	//		set up buttons for step 3
  function goStep3() {

		//	animate to center, already using the new width
		$('#reportDialog').dialog("widget").animate({
        left: ($(window).width()/2  ) - 450 ,
        top:  ($(window).height()/2 ) - 260
    }, 1000)
      $('#reportDialog').dialog({width: 900})

		$('#step2').hide("blind", { direction: "vertical" }, 500)
		$('#step3').show("blind", { direction: "vertical" }, 500)

		setStep3Buttons()

		//take the screenshot and continue the logic after that
		// wait after the animation is complete or otherwise the screen would freeze
		setTimeout(function(){
    	takeScreenShot()
  	}, 1000);

	}


/* #########################################################################################

		Set up the button actions

######################################################################################### */

function setStep1Buttons(){

	$('#reportDialog').dialog({
		buttons: [{
			text:"Next",
      class: "btn",
      click: function(){
    		goStep2()
      }
	  }]
	})
}
function setStep2Buttons(){

	$('#reportDialog').dialog({
		buttons: [{
				text:"Back",
				class: "btn",
				click:function(){
					goStep1()
        	// The animation is only set only when coming back
        	$('#reportDialog').dialog("widget").animate({
        		left: ($(window).width()  /2 ) - 250 ,
        		top:  ($(window).height() /2 ) - 200
        	}, 1000);
	      }
		    },{
		    text:"Next",
		    class: "btn",
		    click: function(){
		    	goStep3()
		    }
	  }]
	})
}


function setStep3Buttons(){

	$('#reportDialog').dialog({
		buttons: [{
      text:"Back",
      class: "btn",
      click:function(){
      	goStep2()
        cleanThumbElement()
      }
    	},{
    	text:"Next",
      class: "btn",
      click: function(){
      	saveReport()
      }
   	}]
	})

}

/* #########################################################################################

		Take a screenshot and create a "thumbnail"

######################################################################################### */

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}


//Draw a red stoke around the viewport so when the screenshot is taken
//		the viewport is defined
function drawViewportBox(){
	context.strokeStyle = "red"
	var $w = $(window)
	context.strokeRect($w.scrollLeft(),$w.scrollTop(),$w.width(),$w.height())
}


// Create a "thumbnail" of the original render of the page
//		using drawImage and cropping only the viewport.
//		The new canvas is then appended to the modal box with fixed width
//			(not a real thumbnail I now)
function makeThumbnail(){
	var $w = $(window)


	var original = new Image()
  original.src    = report.screenshot

//TODO check why the thumbnail is not always created.


	$('body').append('<canvas id="thumbCanvas"></canvas>')

	// The thumbnail will be drawn in here
	var thumbCanvas = $("#thumbCanvas")
	thumbCanvas[0].width = $w.width()
  thumbCanvas[0].height = $w.height()

  // This will be used to check if the thumbnail canvas is empty
	$('body').append('<canvas id="thumbCanvasBlank" style="display:none"></canvas>')
	var thumbCanvasBlank = $("#thumbCanvasBlank")
	thumbCanvasBlank[0].width = $w.width()
  thumbCanvasBlank[0].height = $w.height()

	var thumbContext = thumbCanvas[0].getContext('2d')


//  thumbContext.drawImage(original, $w.scrollLeft(), $w.scrollTop(), $w.width(), $w.height(), 0, 0, $w.width(), $w.height() )



	//set viewport crop window
	// It looks like drawImage doesn't like to wait for original image
	// so divided the function to a loop for now.
	//TODO add loop limit counter
	//TODO try to optimize this process
	cropImg(original,thumbContext, $w, thumbCanvas, thumbCanvasBlank)

}


// try to draw the thumbnail
// if it's still empty, try again.
function cropImg(original, thumbContext, $w, thumbCanvas, thumbCanvasBlank){

  thumbContext.drawImage(original, $w.scrollLeft(), $w.scrollTop(), $w.width(), $w.height(), 0, 0, $w.width(), $w.height() )

	if (thumbCanvas[0].toDataURL() == thumbCanvasBlank[0].toDataURL()) {
		setTimeout(function(){
			cropImg(original, thumbContext, $w, thumbCanvas, thumbCanvasBlank)
		},500)
	}
	else{
		finishCrop(original, thumbContext, $w, thumbCanvas, thumbCanvasBlank)
	}

}



// It would be cool to catch invalidstateerror instead of doing this bad trick
function finishCrop(original, thumbContext, $w, thumbCanvas, thumbCanvasBlank){

	report.thumb = thumbCanvas[0].toDataURL()

	// hide the thumbnail
	thumbCanvas.hide()

	// Hide the progress bar
	$("#thumbProgress").hide()


	// Check if canvas is empty
	if( thumbCanvas[0].toDataURL() != thumbCanvasBlank[0].toDataURL() ){
		$("#screenshootImg").append("<img class='screenShotCanvas' src='"+ report.thumb +
            "' alt='Page Screenshot' width='400' >")
	}
	else{
		var thumbErrorMsg = 'There was a problem creating the screenshot :(<br/> '+
				'Don\'t worry, submit your feedback anyway'
				$("#screenshootImg").append(thumbErrorMsg)
	}

}






function takeScreenShot(){
		// Draw outline on viewport
		drawViewportBox()

		var $w = $(window)
		// record current viewport position to set it later
		var oldTop = $w.scrollTop()
		var oldLeft = $w.scrollLeft()

		// set the dialog to be ignored by html2canvas
		$(".ui-dialog").attr("data-html2canvas-ignore", "true")

		html2canvas($('body'), {
		//you can enable logging on
		//logging:true ,
	    onrendered: function(canvas) {
	  	  var data = canvas.toDataURL()

	  	  //the render canvas messes up the viewport
				$w.scrollTop(oldTop)
				$w.scrollLeft(oldLeft)

	    	// add screenshot image to report
				report.screenshot = data

				hideCanvas()

				// Collect and fill in the info about the page
				fillInInfo()

				// Create screenshot thumbnail
				makeThumbnail()
				//setTimeout(function(){makeThumbnail()},2000)

			}
		})
	}

	// Clean canvas after all the work is done
	function hideCanvas(){
				$("#canvas").hide()
				$("#myCanvas").hide()
	}

	// clean the preview of the thumbnail
	function cleanThumbElement(){
		$("#screenshootImg").empty()
		$("#thumbProgress").show()
	}
/* #########################################################################################

		Fetch environment values

######################################################################################### */


function fillInInfo(){

	//Fetch info
		writeUserInfo()
		writePageInfo()
		writeBrowserInfo()
}

function stripTags(val) { return val.replace(/<\/?[^>]+>/gi, ''); }


// append to a div an echo of all properties with exception of empty values, functions or
//		something inside the notInclude array
function dumpVars(obj, div, notInclude) {
    jQuery.each(obj, function (j, val) {
        if (typeof (val) != "function" && jQuery.inArray(j, notInclude) == -1 && val != "") {
            $(div).append(j + " : " + val + "<br/>")
        }
    })
}

function showPlugins() {
  var len = navigator.plugins.length
  var result = ""
  for (var i = 0; i < len; i++) {
    result += '<a rel="tooltip" href="#" data-original-title="' + stripTags(navigator.plugins[i].description) +
        '" data-triger="hover" data-placement="right">' + navigator.plugins[i].name + '</a>'
    result += " , "
    result += navigator.plugins[i].filename
    if (navigator.plugins[i].version) {
      result += " | "
      result += navigator.plugins[i].version
    }
    result += "<br>"
  }
  return result
}

function get_cookies_array() {
    var cookies = { }
    if (document.cookie && document.cookie != '') {
			var split = document.cookie.split(';')
			for (var i = 0; i < split.length; i++) {
			  var name_value = split[i].split("=")
			  name_value[0] = name_value[0].replace(/^ /, '')
			  cookies[decodeURIComponent(name_value[0])] = decodeURIComponent(name_value[1])
			}
    }
    return cookies
}



function writeBrowserInfo() {
   var browserInfo = $(".browserInfo")
   browserInfo.append("<h4>Browser version:</h4>")
   dumpVars(jQuery.browser, ".browserInfo")
   report.browserInfo = jQuery.browser

   browserInfo.append("<h4>Operating System: </h4>")
   dumpVars(navigator, ".browserInfo", ['plugins', 'mimeTypes'])
   report.navigator = navigator

   browserInfo.append("<h4>Installed Plugins: </h4>" + showPlugins())
}

function writePageInfo() {
   var pageInfo  = $(".pageInfo")
   // Get all page url info
   pageInfo.append("<h4>Page Url:</h4>")
   dumpVars(window.location, ".pageInfo", ["ancestorOrigins"])
   report.location = window.location

   // Get all DOM elements
   var html = $.base64.encode($("html").clone().html())
   //var html = $("html").clone().html()
    pageInfo.append("<h4>Page Structure:</h4>")
                 .append("<div class='row-fluid'><textarea rows='4' class='span12'>" + html + "</textarea></div>")
   report.encodedHtml = html

}



function writeUserInfo() {
    var userinfo = $(".userInfo")
	//Check if the user has something filled in
	if (report.user != null) {
        userinfo.append("<h4>User Info:</h4>")
		dumpVars(report.user, ".userInfo")
	}

	// Get all cookies
	var cookies = get_cookies_array()
	if (!$.isEmptyObject(cookies)) {
        userinfo.append("<h4>Cookies:</h4>")
		dumpVars(cookies, ".userInfo")
		report.cookies = cookies
	}
}






/* #########################################################################################

		Highlight and Blackout in canvas

######################################################################################### */

function drawInCanvas(){


	var canvasElements = '<canvas id="myCanvas"></canvas>'+
						'<div id="canvas"></div>'

	$('body').append(canvasElements)

	//Change the canvas css
	$('#canvas, #myCanvas').css({
		'position': 'absolute',
		'left': '0px',
	  'top': '0px',
	  'display': 'block',
	  'cursor': 'default',
	  'z-index': '1040'
	})


	var drawCanvas = $('#canvas')
	var myCanvas = $('#myCanvas')
	context = myCanvas[0].getContext('2d')

	var shadergb = "rgba(0, 0, 0, 0.295)"
	var blackrgb = "rgba(0, 0, 0, 1)"
	var whitergb = "rgba(0, 0, 0, 0)"


	// initialization of the canvas element
	stretchOut()

  // highlight or blackout state
  var $boxSettings = "highlight"


	$(window).resize(function() {
	  shrinkIn()
	  stretchOut()
	})



	$.extend($.ui.boxer, {
	  defaults: $.extend({}, $.ui.mouse.defaults, {
	    appendTo: 'body',
	    distance: 0
	  })
	})



$("#highlight").on("click", function(event){
	$("#reportDialog button").removeClass("btn-primary")
	$(this).addClass("btn-primary")
	$boxSettings = "highlight"
})


$("#block").on("click", function(event){
	$("#reportDialog button").removeClass("btn-primary")
	$(this).addClass("btn-primary")
	$boxSettings = "block"
})


$("#clear").on("click", function(){
  cleanCanvas()
})


//$.widget("ui.boxer", $.extend({}, $.ui.mouse, {
$.widget("ui.boxer", $.ui.mouse, {
  options: {
    appendTo: 'body',
    distance: 0
  },

  _init: function() {


    this.element.addClass("ui-boxer")

    this.dragged = false

    this._mouseInit()

    this.helper = $(document.createElement('div'))
      .css({border:'1px dotted red'})
      .addClass("ui-boxer-helper")
  },

  _mouseStart: function(event) {
    var self = this

    this.opos = [event.pageX, event.pageY]

    if (this.options.disabled)
      return

    var options = this.options

    this._trigger("start", event)

    $(options.appendTo).append(this.helper)

    this.helper.css({
      "position": "absolute",
      "left": event.clientX,
      "top": event.clientY,
      "width": 0,
      "height": 0,
      "z-index": 1040
    })

    if ($boxSettings == "highlight") {
    	this.helper.css({"background": whitergb})
    }
    else{
    	this.helper.css({"background": shadergb})
    }
  },

  _mouseDrag: function(event) {
    var self = this
    this.dragged = true

    if (this.options.disabled)
      return

    var options = this.options

    var x1 = this.opos[0], y1 = this.opos[1], x2 = event.pageX, y2 = event.pageY;

    if (x1 > x2) { var tmp = x2; x2 = x1; x1 = tmp; }
    if (y1 > y2) { var tmp = y2; y2 = y1; y1 = tmp; }
    this.helper.css({left: x1, top: y1, width: x2-x1, height: y2-y1})

    this._trigger("drag", event)

    return false
  },

  _mouseStop: function(event) {
    var self = this

    this.dragged = false

    var options = this.options

    var clone = this.helper.clone()

    // get the positions
		var btop = this.helper.offset().top
		var bleft = this.helper.offset().left
		var bwith = this.helper.width()
		var bheight = this.helper.height()


    // check if highlight or black out
 		if ($boxSettings == "highlight") {
			context.clearRect (bleft,btop,bwith,bheight)
    }
    else{
      context.fillStyle = blackrgb
    	context.fillRect (bleft,btop,bwith,bheight)
    }

    this.helper.remove()

    return false
  }

})


	// Using the boxer "plugin"
	$('#canvas').boxer({
	  stop: function(event, ui) {
	    ui.box.addClass($boxSettings)
	  }
	})


// stretch Canvas and div to full page
function stretchOut(){

    drawCanvas.width(document.width)
    drawCanvas.height(document.height)

  	myCanvas.attr({ width: document.width, height: document.height })


  // Fill the canvas with black opacity of shade
    context.fillStyle = shadergb
    context.fillRect (0,0,myCanvas.width(),myCanvas.height())

  	cleanCanvas()
}

// clear Canvas and div so the page can shrink
function shrinkIn(){

    drawCanvas.width(0)
    drawCanvas.height(0)


   myCanvas.attr({ width: 0, height: 0 })
}

// clean Canvas element
function cleanCanvas(){

  context.clearRect (0,0,myCanvas.width(),myCanvas.height())
  context.fillStyle = shadergb
  context.fillRect (0,0,myCanvas.width(),myCanvas.height())
}



}







