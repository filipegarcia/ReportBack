/*
 reportback  <https://github.com/filipegarcia/ReportBack>
 Copyright (c) 2013 Filipe Garcia. All rights reserved.

 Released under MIT License
*/

// report array to be build during the process
var report = []



function saveReport(report ){

	console.log(report);

	console.log("Give feedback to the user")


}


function report_warmup() {

	$('body').append("<div id='feedback' class='btn feedbackBtnGroup'><i class='icon-bullhorn'></i> Feedback</div>")
	$('#feedback').css({
	   position : 'fixed',
	   bottom : '0',
	   right : '0'
	});

	$("#feedback").on("click", function () {
		drawModal1()
	});


}


// 	Get the user feedback description.
// 		prepare click for step2
  function drawModal1() {

		var out = '<div id="reportWindow1" class="modal hide in ">'+
		'    <div class="modal-header">'+
		'        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
		'        <h3>Give us your feedback :)</h3>'+
		'    </div>'+
		'    <div class="modal-body">'+
		'        <form>'+
		'          <div class="row-fluid">'+
		'          tell us where you would improve or change'+
		'              <br />'+
		'          <label>Description</label>'+
		'          <textarea id="usrDescription" ows="4" class="span12"></textarea>'+
		'          </div>'+
		'        </form>'+
		'    </div>'+
		'    <div class="modal-footer">'+
		'        <a href="#" data-dismiss="modal" class="btn">Close</a>'+
		'        <a href="#"  id="window1B" class="btn btn-primary">Next <i></a>'+
		'    </div>'+
		'</div>';

		$('body').append(out);

		$("#reportWindow1").modal('show')

		$("#window1B").on("click", function(){

			// Push user description to final report.
			report.description = $("#usrDescription").val()

			// prepare next step
			$("#reportWindow1").modal('hide')
			drawModal2();

		})


	}




// 	Show modal that allow user to highlight and black out the page.
// 		Set up canvas element and prepare click event for step 3
  function drawModal2() {
  	var out = '<div id="dialog" title="Report Back">'+
  				'	<p>Click and drag on the page to help us better understand your feedback.'+
  				' You can move this dialog if it\'s in the way.</p>'+
  				'<div>'+
  					'<div class="row-fluid">'+
  						'<div class="span12"> <button id="highlight" class="btn" type="button"><i class="icon-eye-open"></i> Highlight&nbsp;</button>'+
  						' Highlight areas relevant to your feedback.</div>'+
  					'</div><br/>'+
  					'<div class="row-fluid">'+
  						'<div class="span12"> <button id="block" class="btn" type="button"><i class="icon-eye-close"></i> Black out</button>'+
  						' Black out any personal information.</div>'+
  					'</div><br/>'+
  					'<div class="row-fluid">'+
  						'<div class="span12"> <button id="clear" class="btn" type="button"><i class="icon-remove"></i> Clear</button>'+
  						' Black out any personal information.</div>'+
  					'</div>'+
  				'</div>'+
				'</div>'


		$('body').append(out)


		$('#dialog').dialog({
			position: { my: "right top", at: "right bottom", of: window },
			width: 500,
			buttons: [{
	        class: "btn",
	        text:"Back",
	        click:function(){
	        	//TODO Do something else
	        }
		    },{
	        class: "btn",
	        text:"Next",
	        click: function(){
	        	takeScreenShot()
	        }
		   	}],
      modal: false,
      resizable: false,
      zIndex: 1050
    });
		//I really don't like the cross mouse pointer in the jquery ui modal
		$(".ui-dialog-titlebar").css("cursor", "auto")


		drawInCanvas()


  }

function drawViewport(){

	//Sets a stroke around the users viewport
	context.strokeStyle = "red";
	var $w = $(window);
	context.strokeRect($w.scrollLeft(),$w.scrollTop(),$w.width(),$w.height());
}


function	takeScreenShot(){

		// Draw outline on viewport
		drawViewport();

		// capture current screen
		var target = $('body');
		html2canvas(target, {
	    onrendered: function(canvas) {
	  	  var data = canvas.toDataURL();

	    	// you can append the captured image right away
	    	// $("body").append("<img class='screenShotCanvas' src='"+data+"' alt='Page Screenshot' width='400' >")

	    	// add screenshot image
				report.screenshot = data

				// after canvas is saved, we can remove the draw canvas elements
				prepareStep3();
			}
		})

		//Close modal
		$('#dialog').dialog("close");

	}



function prepareStep3(){
		$("#canvas").hide()
		$("#myCanvas").hide()

		//open step 3 window
		drawModal3();
}


  function drawModal3() {

		var out = '<div id="reportWindow3" class="modal hide in">'+
			'    <div class="modal-header">'+
			'        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
			'        <h3>Give us your feedback :)</h3>'+
			'    </div>'+
			'    <div class="modal-body">'+
			'        <form>'+
			'          <div class="row-fluid">'+
			'          tell us where you would improve or change'+
			'              <br />'+
			'          <label>Description</label>'+
			'          <div class="accordion" id="accordion2">'+
			'            <div class="accordion-group">'+
			'                <div class="accordion-heading">'+
			'                    <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseOne">'+
			'                        User info</a>'+
			'                </div>'+
			'                <div id="collapseOne" class="accordion-body collapse">'+
			'                    <div class="accordion-inner userInfo"></div>'+
			'                </div>'+
			'            </div>'+
			'                <div class="accordion-group">'+
			'                    <div class="accordion-heading">'+
			'                        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseTwo">'+
			'                            Page info </a>'+
			'                    </div>'+
			'                    <div id="collapseTwo" class="accordion-body collapse">'+
			'                        <div class="accordion-inner pageInfo"></div>'+
			'                    </div>'+
			'                </div>'+
			'                <div class="accordion-group">'+
			'                <div class="accordion-heading">'+
			'                    <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseThree">'+
			'                       Browser info </a>'+
			'                </div>'+
			'                <div id="collapseThree" class="accordion-body collapse">'+
			'                    <div class="accordion-inner browserInfo"></div>'+
			'                </div>'+
			'            </div>'+
			'        </div>'+
			'          </div>'+
			'        </form>'+
			'    </div>'+
			'    <div class="modal-footer">'+
			'        <a href="#" id="window3BBack" class="btn">Back</a>'+
			'        <a href="#" data-dismiss="modal" id="window3B" class="btn btn-primary">Send Feedback</a>'+
			'    </div>'+
			'</div>'

			//$('body').append(out);

			//$('body').tooltip({
	    //	selector: '[rel=tooltip]'
			//});

			//$("#reportWindow3").modal('show');

			var content = '<div class="row-fluid">'+
			'<div class="span6" >'+
			'	<form>'+
			'          <div class="row-fluid">'+
			'          tell us where you would improve or change'+
			'              <br />'+
			'          <label>Description</label>'+
			'          <div class="accordion" id="accordion2">'+
			'            <div class="accordion-group">'+
			'                <div class="accordion-heading">'+
			'                    <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseOne">'+
			'                        User info</a>'+
			'                </div>'+
			'                <div id="collapseOne" class="accordion-body collapse">'+
			'                    <div class="accordion-inner userInfo"></div>'+
			'                </div>'+
			'            </div>'+
			'                <div class="accordion-group">'+
			'                    <div class="accordion-heading">'+
			'                        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseTwo">'+
			'                            Page info </a>'+
			'                    </div>'+
			'                    <div id="collapseTwo" class="accordion-body collapse">'+
			'                        <div class="accordion-inner pageInfo"></div>'+
			'                    </div>'+
			'                </div>'+
			'                <div class="accordion-group">'+
			'                <div class="accordion-heading">'+
			'                    <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseThree">'+
			'                       Browser info </a>'+
			'                </div>'+
			'                <div id="collapseThree" class="accordion-body collapse">'+
			'                    <div class="accordion-inner browserInfo"></div>'+
			'                </div>'+
			'            </div>'+
			'        </div>'+
			'          </div>'+
			'        </form>'+
			'	</div>'+
			'	<div class="span6">'+
			'		<div id="screenPreview">'+
			'				<b>Screenshot</b>'+
			' 			<div id="screenshoImg" ></div>'+
			'		</div>'+
			'	</div>'+
			'</div>'



			//	Change width first, then position it in the center, and change the contents
			$('#dialog').dialog({width: 900}).dialog({position: ['center',150]}).html(content)

			$("#screenshoImg").append("<img class='screenShotCanvas' src='"+ report.screenshot +"' alt='Page Screenshot' width='400' >")

			$("#window3BBack").on( "click", function(){
				$("#reportWindow3").modal('hide');
				//close the modal and not window 1
				$("#reportWindow1").modal('show');
			})

			$("#window3B").on( "click", function(){
				$("#reportWindow3").modal('hide');
				saveReport()
		 	  return false;
			})

			//Fetch info
			writeUserInfo()
			writePageInfo()
			writeBrowserInfo()

	}







function stripTags(val) { return val.replace(/<\/?[^>]+>/gi, ''); };


// append to div an echo of all properties with exception
function dumpVars(obj, div, notInclude) {
    jQuery.each(obj, function (j, val) {
        if (typeof (val) != "function" && jQuery.inArray(j, notInclude) == -1) {
            $(div).append(j + " : " + val + "<br/>");
        }
    });
}

function showPlugins() {
  var len = navigator.plugins.length;
  var result = "";
  for (var i = 0; i < len; i++) {
    result += '<a rel="tooltip" href="#" data-original-title="' + stripTags(navigator.plugins[i].description) + '" data-triger="hover" data-placement="right">' + navigator.plugins[i].name + '</a>';
    result += " , ";
    result += navigator.plugins[i].filename;
    if (navigator.plugins[i].version) {
      result += " | ";
      result += navigator.plugins[i].version;
    }
    result += "<br>";
  }
  return result;
}

function get_cookies_array() {
    var cookies = { };
    if (document.cookie && document.cookie != '') {
			var split = document.cookie.split(';');
			for (var i = 0; i < split.length; i++) {
			  var name_value = split[i].split("=");
			  name_value[0] = name_value[0].replace(/^ /, '');
			  cookies[decodeURIComponent(name_value[0])] = decodeURIComponent(name_value[1]);
			}
    }
    return cookies;
}



function writeBrowserInfo() {
   $(".browserInfo").append("<h4>Browser version:</h4>")
   dumpVars(jQuery.browser, ".browserInfo")
   report.browserInfo =  jQuery.browser

   $(".browserInfo").append("<h4>Operating System: </h4>")
   dumpVars(navigator, ".browserInfo", ['plugins', 'mimeTypes'])
   report.navigator =  navigator

   $(".browserInfo").append("<h4>Installed Plugins: </h4>" + showPlugins());
}

function writePageInfo() {
   // Get all page url info
   $(".pageInfo").append("<h4>Page Url:</h4>");
   dumpVars(window.location, ".pageInfo", ["ancestorOrigins"]);
   report.location = window.location

   // Get all DOM elements
   var html = $.base64.encode($("html").clone().html());
   //var html = $("html").clone().html();
   $(".pageInfo").append("<h4>Page Structure:</h4>");
   $(".pageInfo").append("<div class='row-fluid'><textarea rows='4' class='span12'>" + html + "</textarea></div>");
   report.encodedHtml = html

}



function writeUserInfo() {

 // Get all cookies
 var cookies = get_cookies_array();
 $(".userInfo").append("<h4>Cookies:</h4>");
 dumpVars(cookies, ".userInfo");
 report.cookies = cookies

}






/* #########################################################################################

		Highlight and Blackout in canvas


######################################################################################### */





function drawInCanvas(){


	var canvasElements = '<canvas id="myCanvas"></canvas>'+
						'<div id="canvas"></div>'
	$('body').append(canvasElements);


	var drawCanvas = $('#canvas')
	var myCanvas = $('#myCanvas')
	context = myCanvas[0].getContext('2d')

	var shadergb = "rgba(0, 0, 0, 0.295)"
	var blackrgb = "rgba(0, 0, 0, 1)"
	var whitergb = "rgba(0, 0, 0, 0)"


	// initialization of the canvas element
	stretchOut();

  // highlight or blackout state
  var $boxSettings = "highlight";


	$(window).resize(function() {
	  shrinkIn()
	  stretchOut()
	});



	$.extend($.ui.boxer, {
	  defaults: $.extend({}, $.ui.mouse.defaults, {
	    appendTo: 'body',
	    distance: 0
	  })
	});



$("#highlight").on("click", function(event){
	$("#dialog button").removeClass("btn-primary")
	$(this).addClass("btn-primary")
	$boxSettings = "highlight";
});


$("#block").on("click", function(event){
	$("#dialog button").removeClass("btn-primary")
	$(this).addClass("btn-primary")
	$boxSettings = "block";
});


$("#clear").on("click", function(){
  cleanCanvas()
});


//$.widget("ui.boxer", $.extend({}, $.ui.mouse, {
$.widget("ui.boxer", $.ui.mouse, {
  options: {
    appendTo: 'body',
    distance: 0
  },

  _init: function() {


    this.element.addClass("ui-boxer");

    this.dragged = false;

    this._mouseInit();

    this.helper = $(document.createElement('div'))
      .css({border:'1px dotted red'})
      .addClass("ui-boxer-helper");
  },

  _mouseStart: function(event) {
    var self = this;

    this.opos = [event.pageX, event.pageY];

    if (this.options.disabled)
      return;

    var options = this.options;

    this._trigger("start", event);

    $(options.appendTo).append(this.helper);

    this.helper.css({
      "position": "absolute",
      "left": event.clientX,
      "top": event.clientY,
      "width": 0,
      "height": 0,
      "z-index": 1040
    });

    if ($boxSettings == "highlight") {
    	this.helper.css({"background": whitergb})
    }
    else{
    	this.helper.css({"background": shadergb})
    }
  },

  _mouseDrag: function(event) {
    var self = this;
    this.dragged = true;

    if (this.options.disabled)
      return;

    var options = this.options;

    var x1 = this.opos[0], y1 = this.opos[1], x2 = event.pageX, y2 = event.pageY;

    if (x1 > x2) { var tmp = x2; x2 = x1; x1 = tmp; }
    if (y1 > y2) { var tmp = y2; y2 = y1; y1 = tmp; }
    this.helper.css({left: x1, top: y1, width: x2-x1, height: y2-y1});

    this._trigger("drag", event);

    return false;
  },

  _mouseStop: function(event) {
    var self = this;

    this.dragged = false;

    var options = this.options;

    var clone = this.helper.clone()

    // get the positions
		var btop = this.helper.offset().top
		var bleft = this.helper.offset().left
		var bwith = this.helper.width()
		var bheight = this.helper.height()


    // check if highlight or black out
 		if ($boxSettings == "highlight") {
			context.clearRect (bleft,btop,bwith,bheight);
    }
    else{
      context.fillStyle = blackrgb
    	context.fillRect (bleft,btop,bwith,bheight);
    };

    this.helper.remove();

    return false;
  }

});




	// Using the boxer plugin
	$('#canvas').boxer({
	  stop: function(event, ui) {
	    ui.box.addClass($boxSettings);
	  }
	});




// stretch Canvas and div to full page
function stretchOut(){

    drawCanvas.width(document.width)
    drawCanvas.height(document.height)

  	myCanvas.attr({ width: document.width, height: document.height });


  // Fill the canvas with black opacity of shade
    context.fillStyle = shadergb
    context.fillRect (0,0,myCanvas.width(),myCanvas.height())

  	cleanCanvas()
}

// clear Canvas and div so the page can shrink
function shrinkIn(){

    drawCanvas.width(0)
    drawCanvas.height(0)


   myCanvas.attr({ width: 0, height: 0 });
}

// clean Canvas element
function cleanCanvas(){

  context.clearRect (0,0,myCanvas.width(),myCanvas.height())
  context.fillStyle = shadergb
  context.fillRect (0,0,myCanvas.width(),myCanvas.height())
}



}









