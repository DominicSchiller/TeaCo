window.onresize = function() {
/*function update() {*/
    var winWidth = Math.max($(document.body).width());
    ///if ($('#eyecatcher_wrapper').length) updateHome(winWidth);
    //if ($('#head_meetings').length) updateDashboard(winWidth);
    if ($('#suggestion_view').length) updateMeetingView(winWidth);
    if ($('#not_found_wrapper').length) updateNotFound(winWidth);
    updateGeneral(winWidth);

    var wscreen = $('div#welcome_screen');
    if (wscreen.length) {
        wscreen.css('left',$('#hdr_form span.user').offset().left-6);
    }
};


function update() {
var winWidth = Math.max($(document.body).width());
///if ($('#eyecatcher_wrapper').length) updateHome(winWidth);
//if ($('#head_meetings').length) updateDashboard(winWidth);
if ($('#suggestion_view').length) updateMeetingView(winWidth);
if ($('#not_found_wrapper').length) updateNotFound(winWidth);
updateGeneral(winWidth);

var wscreen = $('div#welcome_screen');
if (wscreen.length) {
    wscreen.css('left',$('#hdr_form span.user').offset().left-6);
}
};


//Korrigiert die Größen, wenn das Browserfenster resized wurde
function updateGeneral(winWidth) {
	var logo = $('#hdr_logo').outerWidth();
	var links = 0;
	if (document.getElementById('hdr_lnk_02'))
		links += $('#hdr_lnk_02').outerWidth()
	if (document.getElementById('hdr_lnk_03'))
		links += $('#hdr_lnk_03').outerWidth();

	//Header+Footer über die ganze Breite mit 10px Rand links und rechts
	//$('#header_bar').width(winWidth-20);
	//$('#footer').width(winWidth-20);
	//Mittelteil im Header dynamisch
	$('#hdr_form').width(winWidth-(20+logo+links)-2);
	
	//Zweispaltig bleiben
	$(".keep-in-line").width(winWidth);
};

// Passt die Größen der nebeneinanderliegenden Box auf die gleiche Höhe an
$(document).ready(function() {
    var winWidth = Math.max($(document.body).width());

    if (winWidth > 991) {
        var box_row_1 = $('.create_login');

        box_row_1.css('display', 'inline-block');
        setHeight();

        $(window).resize(function() {
            box_row_1.css('height', 'auto');
            box_row_1.css('display', 'inline-block');
            setHeight();
        });

        function setHeight () {
            var maxHeight1 = Math.max.apply(
                Math, box_row_1.map(function () {
                    return $(this).height();
                }).get());
            box_row_1.height(maxHeight1);
            box_row_1.css('display', 'block');
        }
    }
});


function updateMeetingView(winWidth) {
	$('#suggestion_view').width(winWidth);
	/*$('#meeting_titlebar').width(winWidth-90);*/
	$('#grid').width(winWidth);
	/*$('#comments_headline').width(winWidth-40);
	$('#comments').width(winWidth-40);*/
	
	adjustSuggestionAreaWidth();
	removeJumpToSuggArrows();
	addJumpToSuggArrows();
}

function updateNotFound(winWidth) {
	$('#not_found_wrapper').width(winWidth-40);
}

function toggleDisclaimer() {
	var d = $('div#disclaimer');
	if (d.css('display') == 'none')
		d.slideDown();
	else
		d.slideUp();
}