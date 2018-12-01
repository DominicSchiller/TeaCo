var dashboardShowTenMeetings;
var dashboardShowAllMeetings;

function createDashboard() {
	//Button zum ein/ausklappen, falls mehr als 10 Meetings
	if ($('table#meeting_list tr').length > 10) {
	    $('meetings_showAll_link').on('click',function() { showAll() });
	}
	updateVars();
	showTen();
}

function updateVars() {
	dashboardShowTenMeetings = $('#meetings_showAll_link').attr('rel');
	dashboardShowAllMeetings = $('#meetings_showAll_link').html();
}

function showAll() {
	$('table#meeting_list tr').css('display','');
	//Button ändern
	var btn = $('#meetings_showAll_link');
	btn.html(dashboardShowTenMeetings);
	btn.off('click');
	btn.on('click',function() { showTen(); });
	update();
}

function showTen() {
	$('table#meeting_list tr:lt(10)').css('display','');
	$('table#meeting_list tr:gt(9)').css('display','none');
	
	var btn = $('#meetings_showAll_link');
	if (btn) {
		if ($('table#meeting_list tr').length > 10) {
			//Und Button mit Funktion versehen
			btn.html(dashboardShowAllMeetings);
			btn.off('click');
			btn.on('click',function() { showAll() });
		} else {
			$('#meetings_showAll').remove();
		}
	}
	update();
}

function setEqualHeightAdministration() {
    var box_row_1 = $('.box_row_1');
    var box_row_2 = $('.box_row_2');

    box_row_1.css('display', 'inline-block');
    box_row_2.css('display', 'inline-block');
    setHeight();

    $(window).resize(function() {
        box_row_1.css('height', 'auto');
        box_row_2.css('height', 'auto');
        box_row_1.css('display', 'inline-block');
        box_row_2.css('display', 'inline-block');
        setHeight();
    });

    function setHeight () {
        var maxHeight1 = Math.max.apply(
            Math, box_row_1.map(function () {
                return $(this).height();
            }).get());
        var maxHeight2 = Math.max.apply(
            Math, box_row_2.map(function () {
                return $(this).height();
            }).get());
        box_row_1.height(maxHeight1);
        box_row_1.css('display', 'block');

        box_row_2.height(maxHeight2);
        box_row_2.css('display', 'block');
    }
}