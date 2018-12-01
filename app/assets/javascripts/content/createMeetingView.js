/*panel_visible = 0;*/

/*function createMeetingView() {
	$('#exp_newSuggestion').bind('click', function() { expand('exp_newSuggestion') });
	$('#exp_participants').bind('click', function() { expand('exp_participants') });
	$('#exp_finishPlanning').bind('click', function() { expand('exp_finishPlanning') });
}*/

/*
//Panel zeigen
function expand(parentId) {
	shrink();
	var img = null;
	switch(parentId) {
		case 'exp_newSuggestion':
			img = $('#state_newSuggestion'); 
			cont = $('#cont_newSuggestion');	
			conn = $('#cont_connect_01');
			panel_visible = 1;
			break;			
		case 'exp_participants':
			img = $('#state_participants');
			cont = $('#cont_participants');	
			conn = $('#cont_connect_02');
			panel_visible = 2;
			break;
		case 'exp_finishPlanning':
			img = $('#state_finishPlanning');
			cont = $('#cont_finishPlanning');	
			conn = $('#cont_connect_03');
			panel_visible = 3;
	}
	
	cont.fadeIn();
	conn.fadeIn();
	
	cont.qtip("show");
	
	img.attr('src','shrink.jpg');
	$("#"+parentId).unbind('click');
	$("#"+parentId).bind('click', function() { shrink() });
	
	if ($('#tut_next').length > 0)
		if ($('#tut_next').hasClass("newMeetingTut"))
			$('#tut_next').closest(".qtip").qtip("show");
		else if ($('#tut_next').hasClass("voteTut"))
			$('#tut_next').closest(".qtip").qtip("hide");
	if ($('#tut_close').length > 0)
		if ($('#tut_close').hasClass("newMeetingTut"))
			$('#tut_close').closest(".qtip").qtip("show");
		else if ($('#tut_close').hasClass("voteTut"))
			$('#tut_close').closest(".qtip").qtip("hide");
}
*/

/*
//Panel verbergen
function shrink() {
	switch (panel_visible) {
		case 1:
			$('#state_newSuggestion').attr('src','expand.jpg');
			$('#cont_newSuggestion').fadeOut();
			$('#cont_connect_01').fadeOut();
			$('#exp_newSuggestion').unbind('click');
			$('#exp_newSuggestion').bind('click', function() { expand('exp_newSuggestion') });
			break;
		case 2:
			$('#state_participants').attr('src','expand.jpg');
			$('#cont_participants').fadeOut();
			$('#cont_connect_02').fadeOut();
			$('#exp_participants').unbind('click');
			$('#exp_participants').bind('click', function() { expand('exp_participants') });
			$('#cont_participants').qtip("show");
			break;
		case 3:
			$('#state_finishPlanning').attr('src','expand.jpg');
			$('#cont_finishPlanning').fadeOut();
			$('#cont_connect_03').fadeOut();
			$('#exp_finishPlanning').unbind('click');
			$('#exp_finishPlanning').bind('click', function() { expand('exp_finishPlanning') });
	}
	panel_visible = 0;
	
	$('.qtip').qtip('hide');
	
	if ($('#tut_next').length > 0)
		if ($('#tut_next').hasClass("voteTut"))
			$('#tut_next').closest(".qtip").qtip("show");
	if ($('#tut_close').length > 0)
		if ($('#tut_close').hasClass("voteTut"))
			$('#tut_close').closest(".qtip").qtip("show");
}
*/


function showUnvoted() {
	shrink();
	var cont = $('#open_sugg_area');
	cont.css('background-image', 'url(\'open_sugg_bg.png\')');
	cont.css('background-repeat', 'repeat');
	cont.css('background-position', 'center top');
	cont.css('height', 'auto');
}

function hideUnvoted() {
	var cont = $('#open_sugg_area');
	cont.css('background-image', '');
	cont.css('background-repeat', '');
	cont.css('background-position', '');
	cont.css('height', '30px');
}