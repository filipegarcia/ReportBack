/*
 reportback  <https://github.com/filipegarcia/ReportBack>
 Copyright (c) 2013 Filipe Garcia. All rights reserved.

 Released under MIT License
*/



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
		'          <textarea rows="4" class="span12"></textarea>'+
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

					$("#reportWindow1").modal('hide')
					drawModal2();

		})

	}

  function drawModal2() {

			var out = '<div id="reportWindow2" class="modal hide in">'+
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
				'        <a href="#" id="window2BBack" class="btn">Back</a>'+
				'        <a href="#" data-dismiss="modal" id="window2B" class="btn btn-primary">Send Feedback</a>'+
				'    </div>'+
				'</div>'

		$('body').append(out);

		$('body').tooltip({
    	selector: '[rel=tooltip]'
		});

		$("#reportWindow2").modal('show');

		$("#window2BBack").on( "click", function(){
			$("#reportWindow2").modal('hide');
			$("#reportWindow1").modal('show');
		})

		writeUserInfo()
		writePageInfo()
		writeBrowserInfo()

	}







function stripTags(val) { return val.replace(/<\/?[^>]+>/gi, ''); };


    // append to div an echo of all properties with exeption
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
		   $(".browserInfo").append("<h4>Browser version:</h4>");
		   dumpVars(jQuery.browser, ".browserInfo");
		   $(".browserInfo").append("<h4>Operating System: </h4>");
		   dumpVars(navigator, ".browserInfo", ['plugins', 'mimeTypes']);
		   $(".browserInfo").append("<h4>Installed Plugins: </h4>" + showPlugins());
		}

		function writePageInfo() {
		   // Get all page url info
		   $(".pageInfo").append("<h4>Page Url:</h4>");
		   dumpVars(window.location, ".pageInfo", ["ancestorOrigins"]);

		   // Get all DOM elements
		   var html = $.base64.encode($("html").clone().html());
		   //var html = $("html").clone().html();
		   $(".pageInfo").append("<h4>Page Structure:</h4>");
		   $(".pageInfo").append("<div class='row-fluid'><textarea rows='4' class='span12'>" + html + "</textarea></div>");
		}



		function writeUserInfo() {


		   // Get all cookies
		   var cookies = get_cookies_array();
		   $(".userInfo").append("<h4>Cookies:</h4>");
		   dumpVars(cookies, ".userInfo");

		}

