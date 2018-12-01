//TODO: auslagern in lang-file
var tut_finish = "<br /><br />Nach diesem Schritt ist das Tutorial abgeschlossen. Durch den <b>Schließen</b>-Button wird das Tutorial geschlossen und beim Öffnen weiterer Meetings wieder gestartet. Der <b>Deaktivieren</b>-Button deaktiviert das Abstimmen-Tutorial auch für weitere Meetings. In den myTeaCo-Einstellungen können Tutorials wieder aktiviert werden.</p>";

var tut_vote_title = "TeaCo-Tutorial: Abstimmen";
var tut_vote_suggs = "<p class=\"tut_text\">Sie wurden zu einem TeaCo-Meeting eingeladen. Mit den folgenden Buttons können Sie über einzelne Terminvorschläge abstimmen.</p><p class=\"tut_close_text\"><img src=\"greenbutton.png\" /> Ja - <img src=\"yellowbutton.png\" /> Vielleicht - <img src=\"redbutton.png\" /> Nein</p>";
var tut_vote_comment = "<p class=\"tut_text\">Hier können Sie Kommentare schreiben."+tut_finish;

var tut_nm_title = "TeaCo-Tutorial: Neues Meeting";
var tut_nm_suggs = "<p class=\"tut_text\">Hier können sie neue Terminvorschläge hinzufügen, indem Sie <b>Datum</b> sowie <b>Startzeit</b> und <b>Dauer/Endzeit</b> festlegen und dann auf <b>Hinzufügen</b> klicken. Alternativ kann ein Termin auch durch Doppelklick auf einem Tag im Kalender hinzugefügt werden.</p>";
var tut_nm_participants = "<p class=\"tut_text\">Hier können sie Teilnehmer zu diesem Meeting einladen.<br /><br />Geben Sie dazu die <b>E-Mail-Adressen</b> der gewünschten Teilnehmer ein und klicken Sie auf <b>Einladungen versenden!</b>.<br /><br />Optional können Sie vorher auch einen <b>Einladungstext</b> verfassen.</p>";
var tut_nm_finish = "<p class=\"tut_text\">Sofern sich ein passender Termin gefunden hat, können Sie hier die <b>Planung abschlie&szlig;en</b>.<br /><br />Wählen Sie dazu den oder die passenden Termine durch einen Klick auf <img src=\"pick.png\" /> aus.<br /><br />Danach können Sie die anderen Teilnehmer mit einem Klick auf <b>Termindaten versenden</b> via E-Mail informieren.<br /><br />Optional können Sie einen <b>Einladungstext</b> verfassen und einen <b>Ort</b> festlegen."+tut_finish;

var tut_close_button1 = "<p class=\"tut_text\"><input type=\"button\" class=\"tut_next tut_button\" value=\"weiter\"><input type=\"button\" class=\"tut_button tut_deactivate\" value=\"Tutorial deaktivieren\"></p>";
var tut_close_button2 = "<p class=\"tut_text\"><input type=\"button\" class=\"tut_close tut_button\" value=\"schlie&szlig;en\"><input type=\"button\" class=\"tut_button tut_deactivate\" value=\"Tutorial deaktivieren\"></p>";
var tut_close_button3 = "<p class=\"tut_text\"><input type=\"button\" class=\"tut_back tut_button\" value=\"zur&uuml;ck\"><input type=\"button\" class=\"tut_next tut_button\" value=\"weiter\"><input type=\"button\" class=\"tut_button tut_deactivate\" value=\"Tutorial deaktivieren\"></p>";
var tut_close_button4 = "<p class=\"tut_text\"><input type=\"button\" class=\"tut_back tut_button\" value=\"zur&uuml;ck\"><input type=\"button\" class=\"tut_close tut_button\" value=\"schlie&szlig;en\"><input type=\"button\" class=\"tut_button tut_deactivate\" value=\"Tutorial deaktivieren\"></p>";
var vote_tut = false;
var new_meeting_tut = false;

function step(current, total) {
	return current +". Schritt ("+current+"/"+total+")";
}

function showNewMeetingTutorial(){
	new_meeting_tut = true;
	expand('exp_newSuggestion');
	showTutorialQtip($('#cont_newSuggestion'), tut_nm_title+" "+step(1,3), tut_nm_suggs, tut_close_button1, 'left center', 'right center', 410);
	var showNewMeetingTutorial2Step = setTimeout(function(){
        showTutorialQtip($('#cont_participants'), tut_nm_title +" "+ step(2,3), tut_nm_participants, tut_close_button3, 'top center', 'bottom center', 500);
    }, 1000);
	var showNewMeetingTutorial3Step = setTimeout(function(){
        showTutorialQtip($('#cont_finishPlanning'), tut_nm_title +" "+ step(3,3), tut_nm_finish, tut_close_button4, 'left center', 'right center', 410);
    }, 2000);
	
	if ($("#tut_next").length) $("#tut_next").addClass("newMeetingTut");
	if ($("#tut_close").length) $("#tut_close").addClass("newMeetingTut");
}

var tooltip_opened = false;
function showVoteTutorial() {
	vote_tut = true;
	var unvoted_suggs_left = false;
	$('.sugg_box').each(function(){
		if (!$(this).hasClass("ive_voted") && !tooltip_opened) {
			showTutorialQtip($(this), tut_vote_title +" "+ step(1,2), tut_vote_suggs, tut_close_button1, 'bottom center', 'top center', 380);
			unvoted_suggs_left = true;
			tooltip_opened = true;
		} else if (!tooltip_opened) {
			$('.qtip').each(function() {
				var a = $(this).qtip('api');
				if (a.elements.target.hasClass("sugg_box")) {
					a.hide();
				}
			});
			tooltip_opened = false;
		}
	});
	if (!unvoted_suggs_left && !tooltip_opened)
		showTutorialQtip($('#comment_text'), tut_vote_title +" "+ step(2,2), tut_vote_comment, tut_close_button2, 'top center', 'bottom center', 400);
	if ($("#tut_next").length) $("#tut_next").addClass("voteTut");
	if ($("#tut_close").length) $("#tut_close").addClass("voteTut");
}

function showTutorialQtip(el, title, text, buttons, target, tooltip, width) {
	if (new_meeting_tut || vote_tut) {
		el.qtip({			
			content: {
                text: "<div class=\"tut_content\">"+text + buttons+"</div>",
				title: {
                    text: title,
                }
            },
            style: {
                classes: "ui-tooltip-teaco_html_tut",
				width: width
            },
            position: {
				adjust: {
					method: 'flip flip'
				},
                at: target,
                my: tooltip,
				viewport: $(window)
            },
            show: {
                ready: true,
            },
            hide: {
				event: false,
                fixed: true
            },
            events: {
                render: function(event, api){
					$(this).closest(".qtip").qtip('hide');
                    tooltip_opened = true;
				}
            }
		});
		if (new_meeting_tut)
			el.qtip('option', 'position.viewport', false);
	}
}

$(document).ready(function() {
	$('#play_vote_tut').on(function(){
		var showVoteTutorialTimer = setTimeout(function(){
            showVoteTutorial();
        }, 1000);
	});
	
	$('#play_new_meeting_tut').on(function(){
		var showNewMeetingTutorialTimer = setTimeout(function(){
            showNewMeetingTutorial();
        }, 1000);
	});
	
    $(document).on('click', '.vote_button', function() {
		var clicked_button = $(this);
		var update_url = $(this).parent().attr('rel');
		var vote_decision = $(this).attr('rel');
		var voted_on = $(this).closest('.sugg_box').hasClass("ive_voted");

		/*$(this).qtip('hide');*/
		
		$.ajax({
			url: update_url,
			data: {
				_method: 'put',
				"vote[decision]": vote_decision,
				authenticity_token: AUTH_TOKEN
			},
			type : 'put',
			dataType: 'script'//,
			/*complete: function(){
				if (vote_tut && !voted_on) {
					clicked_button.closest(".qtip").qtip('destroy');
					tooltip_opened = false;
					showVoteTutorial();
				}
			}*/
		});
	});
	
	$('.tut_deactivate').on('click', function() {
		vote_tut = false;
		new_meeting_tut = false;
		$(this).closest(".qtip").qtip('destroy');
		if ($('#play_vote_tut').length > 0) {
			var update_url = $('#play_vote_tut').attr('rel');
			var variable = "user[watched_vote_tutorial]";
		} else if ($('#play_new_meeting_tut').length > 0) {
			var update_url = $('#play_new_meeting_tut').attr('rel');
			var variable = "user[watched_new_meeting_tutorial]";
		}
		dataArray = {
			_method: 'put',
			authenticity_token: AUTH_TOKEN
		}
		dataArray[variable] = 1;
		
		$.ajax({
			url: update_url,
			data: dataArray,
			type : 'post',
			dataType: 'text'
		});
	});
	
	$('.tut_next').on('click', function() {
		if (vote_tut || new_meeting_tut) {
			if ($('#play_vote_tut').length > 0) {
				$(this).closest(".qtip").qtip('destroy');
				showTutorialQtip($('#comment_text'), tut_vote_title +" "+ step(2,2), tut_vote_comment, tut_close_button2, 'top center', 'bottom center', 400);
				if ($("#tut_next").length > 0) 
					$("#tut_next").addClass("voteTut");
				if ($("#tut_close").length > 0) 
					$("#tut_close").addClass("voteTut");
			} else if ($('#play_new_meeting_tut').length > 0) {
				var panel = panel_visible;
				shrink();
				if (panel == 1) {
					expand('exp_participants');
				} else if (panel == 2) {
					expand('exp_finishPlanning');
				}
				if ($("#tut_next").length > 0) 
					$("#tut_next").addClass("newMeetingTut");
				if ($("#tut_close").length > 0) 
					$("#tut_close").addClass("newMeetingTut");
			}
		}
		
	});
	
	$('.tut_back').on('click', function() {
		if (new_meeting_tut) {
			if ($('#play_new_meeting_tut').length > 0) {
				var panel = panel_visible;
				shrink();
				if (panel == 2) {
					expand('exp_newSuggestion');
				} else if (panel == 3) {
					expand('exp_participants');
				}
				if ($("#tut_next").length > 0) 
					$("#tut_next").addClass("newMeetingTut");
				if ($("#tut_close").length > 0) 
					$("#tut_close").addClass("newMeetingTut");
			}
		}
	});
	
	$('.tut_close').livequery('click', function() {
		vote_tut = false;
		new_meeting_tut = false;
		$(this).closest(".qtip").qtip('destroy');
	});
});