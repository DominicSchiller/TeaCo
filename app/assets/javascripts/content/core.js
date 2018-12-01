var wScreen;

$(document).ready(function() {
	/*if ($('#eyecatcher_wrapper').length) createHome();*/
	if ($('#head_meetings').length) createDashboard();
	/*if ($('#suggestion_view').length) createMeetingView();*/
	//Nach dem ersten Update ist möglicherweise (k)eine Scrollbar vorhanden und muss berücksichtigt werden.
	update();
	update();
	if(NOT_FROM_WITHIN && $('#hdr_form span.user').length) {
		showWelcomeScreen();
		$('#hdr_form span.user').css('opacity','0.01');
	}
});

/*
function showWelcomeScreen() {
	$(document.body).append('<div id="welcome_screen">'+$('#hdr_form span.user').html()+'</div>');
	wScreen = $('div#welcome_screen');
	wScreen.css('position','absolute');
	wScreen.css('left',$('#hdr_form span.user').offset().left-6);
	wScreen.css('padding','5px 5px 5px 5px');
	wScreen.css('top',4);
	wScreen.css('height',20);
	wScreen.css('line-height','20px');
	wScreen.css('width',$('#hdr_form span.user').width()+2);
	wScreen.css('background-color','#F60');
	wScreen.css('color','#FFF');
	wScreen.css('display','none');
	wScreen.css('border','1px solid white');
	
	wScreen.fadeIn(1500,function(){
		wScreen.animate({
			opacity: 0.01
		}, 500, function() {
			wScreen.animate({
				opacity: 1
			}, 500, function() {
				wScreen.animate({
					opacity: 0.01
				}, 500, function() {
					wScreen.animate({
						opacity: 1
					}, 500, function() {
						$('#hdr_form span.user').css('opacity','1');
						setTimeout(removeWelcomeScreen,3000);
					});
				});
			});
		});
	});
}
*/

/*
function removeWelcomeScreen() {
	wScreen.fadeOut(500);
}
*/