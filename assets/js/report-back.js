/*
 reportback  <https://github.com/filipegarcia/ReportBack>
 Copyright (c) 2013 Filipe Garcia. All rights reserved.

 Released under MIT License
*/



function warmup() {

	$('body').append("<div id='feedback' class='btn feedbackBtnGroup'><i class='icon-bullhorn'></i> Feedback</div>")
	$('#feedback').css({
	   position : 'fixed',
	   bottom : '0',
	   right : '0'
	});

	$("#feedback").on("click", function () {
		console.log("getting scripts");
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

				console.log("baaaa")

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

		$("#reportWindow2").modal('show');

		$("#window2BBack").on( "click", function(){
			$("#reportWindow2").modal('hide');
			$("#reportWindow1").modal('show');
		})



	}

       //window.drawModal1=drawModal1;


