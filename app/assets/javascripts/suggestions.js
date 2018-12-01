var animating_gap = false;
var waitingForOpen = false;
var gap_open = false;
var allow_gapClose = true;
var overTimeout;
var outTimeout;
var innerOverTimeout;
var dragging = false;
//Time to open or close a gap on hover in miliseconds
var openCloseTime = 200;

// Constant for which height represents an hour in the suggestion view:
var HOUR_HEIGHT = 48;

// Constant for which width represents a single day:
var INITIAL_DAY_WIDTH = 200;


function removeStaleSuggestions(){
    // Remove any day-box that is empty:
    $('.day_box').each(function(){
        if ($(this).children().length == 0) {
            var dayDate = $(this).attr('id').replace('day_', '');
            var dayWidth = $(this).width();
            $(this).remove();
            $('#day_header_' + dayDate).remove();
            // Lower the width of the suggestion area by the width
            // of the now deleted day box:
            var view_window_width = $('#view_window').width();
            var sugg_area = $('#suggestion_area');
            if (view_window_width > (sugg_area.width() - dayWidth)) {
                sugg_area.width(view_window_width);
            }
            else {
                sugg_area.width(sugg_area.width() - dayWidth);
            }
            var day_bar = $('#day_bar');
            day_bar.width(day_bar.width() - dayWidth);
        }
    });
}

// Adjusts the header of the given date to the width
// of the day beneath it.
function adjustDayHeaderWidth(date){
    var newWidth = $('#day_' + date).width();
    $('#day_header_' + date).width(newWidth);
}

// Sets the width of the whole suggestion area to the sum
// of the widths of all day boxes in it.
function adjustSuggestionAreaWidth(){
    var totalWidth = 0;
    var boxes = $(".day_box");
    var count = boxes.length;
    var date;

    boxes.each(function(){
        date = $(this).attr("id").replace("day_", "");
        adjustDayHeaderWidth(date);
        totalWidth += $(this).width();
    });

    var gaps = $('.day_gap');
    gaps.each(function(){
        totalWidth += $(this).width();
    });

    var nogaps = $('.day_nogap');
    nogaps.each(function(){
        totalWidth += $(this).width();
    });

    // Padding von 20px aufrechnen
    var view_window_width = $('#view_window').width();
    var sugg_area = $('#suggestion_area');
    if (view_window_width > (totalWidth + 20 * count)) {
        sugg_area.width(view_window_width);
    }
    else {
        sugg_area.width(totalWidth + 20 * count);
    }
    $('#day_bar').width(totalWidth + 20 * count);
}

// Creates a new, empty day-box for the given date,
// if it not yet exists:
function createDayBox(date){
    var newBox = "<div id='day_" + date + "' class='day_box'></div>";
    var newHeader = "<div id='day_header_" + date + "' class='day_header'>" + date + "</div>";
    if ($('#day_' + date).length == 0) {
        // Expand the suggestion area to fit in
        // the new box:
        var view_window_width = $('#view_window').width();
        var sugg_area = $('#suggestion_area');
        if (view_window_width > (sugg_area.width() + INITIAL_DAY_WIDTH + 20)) {
            sugg_area.width(view_window_width);
        }
        else {
            sugg_area.width(sugg_area.width() + INITIAL_DAY_WIDTH + 20);
        }
        var day_bar = $('#day_bar');
        day_bar.width(day_bar.width() + INITIAL_DAY_WIDTH + 20);

        // Create a new day-box at the correct position:
        var found = false;
        $('.day_box').each(function(){
            var box_date = $(this).attr("id").replace("day_", "");
            // Once the next box has a greater date than the
            // date for the new box...
            if (box_date > date) {
                // ... insert the box here:
                $(this).before(newBox);
                // And create a header for the new box at the
                // correct position:
                $('#day_header_' + box_date).before(newHeader);
                // The box has been inserted - so break the each-loop:
                found = true;
                return false;
            }
        });
        // If none of the other boxes matched, append the new box
        // to the end of the suggestion-area:
        if (!found) {
            $('#suggestion_area').append(newBox);
            $('#day_bar').append(newHeader);
        }
    }
}

function isElementOutOfViewLeft(elem){
    var viewWindow = $('#view_window');
    var minLeft = 0;
    var suggAreaPos = $('#suggestion_area').position();
    var elemLeftAbs = suggAreaPos.left + elem.parent().position().left;
    return (elemLeftAbs < minLeft);
}

function isElementOutOfViewRight(elem){
    var viewWindow = $('#view_window');
    var maxRight = viewWindow.width();
    var suggAreaPos = $('#suggestion_area').position();
    var elemRightAbs = suggAreaPos.left + elem.parent().position().left + elem.width();
    return (elemRightAbs > maxRight);
}

function isElementOutOfViewTop(elem){
    var viewWindow = $('#view_window');
    var minTop = 0;
    var suggAreaPos = $('#suggestion_area').position();
    var elemTopAbs = suggAreaPos.top + elem.position().top;
    return (elemTopAbs < minTop);
}

function isElementOutOfViewBottom(elem){
    var viewWindow = $('#view_window');
    var maxBottom = viewWindow.height();
    var suggAreaPos = $('#suggestion_area').position();
    var elemBottomAbs = suggAreaPos.top + elem.position().top + elem.height();
    return (elemBottomAbs > maxBottom);
}

// Variable neccessary to prevent the "jump to suggestion" arrows
// from showing up while the view scrolls:
var animating = false;
// Scrolls the view-window to the position of the center
// of the element with the specified ID.
function scrollTo(id, offset){
    removeJumpToSuggArrows();
    // Test if element is out of view:
    var view = $('#view_window');
    // These four values define the borders of the (static) view window:
    var maxRight = view.width();
    var maxBottom = view.height();
    var elem = $('#' + id);
    if (elem == null) {
        return false;
    }
    var suggAreaPos = $('#suggestion_area').position();
    // These four values definde the borders of the element in question:
    var elemLeftAbs = suggAreaPos.left + elem.parent().position().left;
    var elemTopAbs = suggAreaPos.top + elem.position().top;
    var elemRightAbs = elemLeftAbs + elem.width();
    var elemBottomAbs = elemTopAbs + elem.height();
    var moveNeccessary = (elemTopAbs < 0) ||
        (elemLeftAbs < 0) ||
        (elemRightAbs > maxRight) ||
        (elemBottomAbs > maxBottom);
    var centerX = maxRight / 2;
    var centerY = maxBottom / 2;
    var distX = elemLeftAbs - centerX + (elem.width() / 2);
    var distY = elemTopAbs - centerY + (elem.height() / 2);

    // If an offset is desired, shift the element y-dimensions:
    if (offset) {
        distY += (view.height() - elem.height()) / 2;
        distY -= 10; //damit die suggestions nicht direkt am Rand oben kleben.
        distX = 0;
    }

    // Only move the view if the targetted element was out of view:
    if (moveNeccessary || offset) {
        animating = true;
        $('#view_window').animate({
            scrollLeft: "+=" + distX + "px",
            scrollTop: "+=" + distY + "px"
        }, 1500, 'swing', function(){
            addJumpToSuggArrows();
            elem.fadeTo("fast", 0.1, function(){
              if (jQuery.browser.msie)
                $(this).get(0).style.removeAttribute('filter');
                elem.fadeTo("fast", 1, function(){
                  if (jQuery.browser.msie)
                    $(this).get(0).style.removeAttribute('filter');
                    animating = false;
                });
            });
        });
        // Scroll time- and day-bar as well:
        $('#time_bar_box').animate({
            scrollTop: "+=" + distY + "px"
        }, 1000);
        $('#day_bar_box').animate({
            scrollLeft: "+=" + distX + "px"
        }, 1000);
    }
    else { // Otherwise, only animate it:
        addJumpToSuggArrows();
        elem.fadeTo("fast", 0.1, function(){
            if (jQuery.browser.msie)
                $(this).get(0).style.removeAttribute('filter');
            elem.fadeTo("fast", 1, function(){
                if (jQuery.browser.msie)
                    $(this).get(0).style.removeAttribute('filter');
            });
        });
    }
}

// Remove the "jump to suggestion" arrows:
function removeJumpToSuggArrows(){
    $('.jump_arrow').remove();
    close_stale_tooltips();
}

var leftSugg = null;
var rightSugg = null;
function addJumpToSuggArrows(){
    leftSugg = null;
    rightSugg = null;
    removeJumpToSuggArrows();
    $('.day_box').each(function(){
        addJumpToSuggArrowsForDay($(this));
    });
    // If in the course of the daybox-search
    // an element left or right out of view
    // was found, add appropriate arrows:

    // -40 da ein Pfeil 80 hoch ist
    var top = ($('#view_window').height() / 2) + $('#view_window').scrollTop() - 40;
    if (leftSugg != null) {
        //+5 damit es nicht direkt am Rand klebt
        var left = $('#view_window').scrollLeft() + 5;
        var leftArrow = $("#arrow_left_dummy").clone();
        leftArrow.css("left", left);
        leftArrow.css("top", top);
        leftArrow.removeClass('invisible');
        leftArrow.addClass('jump_arrow');
        leftArrow.removeAttr('id');
        leftArrow.attr('rel', leftSugg.attr("id"));
        $('#suggestion_area').append(leftArrow);
    }

    if (rightSugg != null) {
        //-30 wegen der Breite des Bildes und -5 damit es nicht am Rand klebt
        var left2 = $('#view_window').scrollLeft() + $('#view_window').width() - 35;
        var rightArrow = $("#arrow_right_dummy").clone();
        rightArrow.css("left", left2);
        rightArrow.css("top", top);
        rightArrow.removeClass('invisible');
        rightArrow.addClass('jump_arrow');
        rightArrow.removeAttr('id');
        rightArrow.attr('rel', rightSugg.attr("id"));
        $('#suggestion_area').append(rightArrow);
    }

    //Falls es HTML-Tut angezeigt wird,
    //update die Position des qTips.
    //if ($("#tut_next").length > 0)
    //    $("#tut_next").closest(".qtip").qtip("reposition");
}

function addJumpToSuggArrowsForDay(dayBox){
    var topFound = false;
    var bottomFound = false;
    var upArrow = $("#arrow_up_dummy").clone();
    var downArrow = $("#arrow_down_dummy").clone();

    dayBox.find('.sugg_box').each(function(){
        var box = $(this);
        // If the suggestion is out of view to the left,
        // take this one as the jump target:
        if (isElementOutOfViewLeft(box)) {
            leftSugg = box;
            // Otherwise, if it's out of view to the right
            // (and the very first one to be found so), take
            // this one as the jump target to the right:
        }
        else
            if (isElementOutOfViewRight(box) && rightSugg == null) {
                rightSugg = box;
            }
        var top = $('#view_window').scrollTop();
        if (isElementOutOfViewTop(box) && !topFound) {
            // -40, da ein Pfeil 80 breit ist
            upArrow.css("left", dayBox.position().left + (dayBox.outerWidth() / 2) - 40);
            //+5, damit sie nicht direkt am Rand kleben
            upArrow.css("top", top + 5);
            upArrow.removeClass('invisible');
            upArrow.addClass('jump_arrow');
            upArrow.removeAttr('id');
            upArrow.attr('rel', box.attr("id"));
            $('#suggestion_area').append(upArrow);
            topFound = true;
        }
        else
            if (isElementOutOfViewBottom(box) && !bottomFound) {
                var height = $('#view_window').height();
                downArrow.css("left", dayBox.position().left + (dayBox.outerWidth() / 2) - 40);
                //-30 wegen der Höhe des Pfeils und -5 damits nicht direkt am rand klebt
                downArrow.css("top", (top + height - 30 - 5));
                downArrow.removeClass('invisible');
                downArrow.addClass('jump_arrow');
                downArrow.removeAttr('id');
                var rel = box.attr("id");
                downArrow.attr('rel', rel);
                $('#suggestion_area').append(downArrow);
                bottomFound = true;
            }
        if (bottomFound && topFound)
            return false;
    });
}

function reEnableDragScroll(){
    jQuery('#view_window').dragscroll({
        draggableSelector: ':not(div.sugg_box)'
    });
}

/*
 * JQuery, executed when document has loaded.
 */
$(document).ready(function(){
    // Change this selector to find whatever your 'boxes' are
    var boxes = $("div .sugg_box");
    // Set up click handlers for each box
    boxes.click(function() {
        var el = $(this), // The box that was clicked
            max = 0;
        // Find the highest z-index
        boxes.each(function() {
            // Find the current z-index value
            var z = parseInt( $( this ).css( "z-index" ), 10 );
            // Keep either the current max, or the current z-index, whichever is higher
            max = Math.max( max, z );
        });
        // Set the box that was clicked to the highest z-index plus one
        el.css("z-index", max + 1 );
    });


    /*$('.edit_popover').popover({
        html: true,
        trigger: 'manual',
        container: $(this).attr('id'),
        placement: 'bottom',
        content: function () {
            $return = '<div class="hover-hovercard"></div>';
        }
    }).on("mouseenter", function () {
        var _this = this;
        $(this).popover("show");
        $(this).siblings(".popover").on("mouseleave", function () {
            $(_this).popover('hide');
        });
    }).on("mouseleave", function () {
        var _this = this;
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popover("hide")
            }
        }, 100);
    });
    */


    $(".edit_popover").popover({
        html: true
    }).on('shown.bs.popover', function () {
        $('.date_picker').datepicker({
            multidate: false,
            format: 'dd.mm.yyyy',
            todayHighlight: true,
            language: 'de',
            minutestep: 15,
            calendarWeeks: true,
            startDate: new Date()
        });
        $('.clockpicker').clockpicker({
            twelvehour: false,
            donetext: 'OK',
            autoclose: false
        });
        $('input.sugg_duration').on("click", function(){
            $(this).clockpick({
                starthour: 0,
                endhour: 4,
                showminutes: true,
                minutedivisions: 2
            }, function(){
                adjustTimeFields($(this));
            });
        });
    });



    var not_mine_confirmation = $('#not_mine_confirmation').attr('rel');
    var reset_votes_confirmation = $('#reset_votes_confirmation').attr('rel');

    // When the page loads, scroll to the very first suggestion
    // in the suggestion view:
    var maxDays = Math.floor($('#view_window').width() / (INITIAL_DAY_WIDTH + 20)); //+20 wegen des Paddings
    var first = null;
    var dayBoxes = $('#suggestion_area').find('.day_box');
    for (var i = 0; i < Math.min(maxDays, dayBoxes.length); i++) {
        var dayBox = dayBoxes[i];
        var suggBox = $(dayBox).children('.sugg_box:first');
        if (!first || first.position().top > suggBox.position().top) {
            first = suggBox;
        }
    }
    if (first != null)
        scrollTo(first.attr('id'), true);

    // When clicking on one of those "jump to suggestion" arrows,
    // scroll the associated suggestion into view:
    $('.jump_arrow').on("click", function(){
        var assocSuggId = $(this).attr("rel");
        scrollTo(assocSuggId);
    });


    // Make scroll-by-dragging available for the view window,
    // in which the suggestions are placed:
    function startDragScroll(){
        //remove first to prevent double scrolling
        $('#view_window').dragscroll({
            draggableSelector: ':not(.sugg_box, .jump_arrow)',
            cancel: ".sugg_box, .jump_arrow, .up, .down, .right, .left",
            draggedClassName: 'dragged'
        }).removeClass("dragged");
    }

    function stopDragScroll(){
        $('#view_window').removedragscroll();
    }

    // Adjust the suggestion-area once when the
    // page has loaded:
    adjustSuggestionAreaWidth();

    // Enable drag-scrolling, when loading the page:
    startDragScroll();

    // When the user begins to dragscroll the view, remove the
    // "jump to suggestions out of view" arrows:
    $('#view_window').bind('dragstart', function(e, vector){
        removeJumpToSuggArrows();
    });

    // When the view is drag-scrolled, re-calculate the position
    // of possibly opened suggestion edit forms:
    $('#view_window').bind('dragend', function(e, vector){
        if (!animating) {
            addJumpToSuggArrows();
        }

        /*$('.qtip').each(function(){
            var api = $(this).qtip('api');
            // Only update the position, if the target
            // element still exists:
            if (api.elements.target.is(":visible")) {
                api.reposition();
            }
            else {
                api.destroy();
            }
        });*/
    });

    // Sends an AJAX-request to update the suggestion belonging to the given
    // box, resetting all the votes according to resetVotes.
    function updateSuggestion(box, resetVotes, droppable, draggable){
        var update_url = box.attr('rel');
        var top_position = box.position().top;
        if (droppable) {
            top_position += $('#view_window').scrollTop();
        }
        var minutes_absolute = (top_position / 48) * 60;
        var minutes_absolute_quarter = Math.round(minutes_absolute / 15) * 15;
        var start_hours = Math.floor(minutes_absolute_quarter / 60);
        minutes_absolute_quarter -= start_hours * 60;
        var start_mins = minutes_absolute_quarter;

        var start = new Date();
        start.setHours(start_hours, start_mins, 0, 0);

        var length_hours = Math.floor(box.height() / HOUR_HEIGHT);
        var length_mins = Math.round(((box.height() % HOUR_HEIGHT) / HOUR_HEIGHT) * 60);

        var end = new Date();
        end.setHours(start_hours, start_mins, 0, 0);
        end.addHours(length_hours);
        end.addMinutes(length_mins);

        // Don't allow 0:00 as an end value - this could lead to errors,
        // as it's not clear whether it is midnight the same or the next day:
        if (end.getHours() == 0 && end.getMinutes() == 0) {
            end = new Date("2001/01/01 23:59:00");
        }

        var start_string = start.getHours() + ":" + start.getMinutes() + ":00";
        var end_string = end.getHours() + ":" + end.getMinutes() + ":00";

        var new_date = null;
        if (droppable && droppable.attr("id")) {
            if (draggable.parent().attr('id') != droppable.attr("id")) {
                box_id = droppable.attr("id").split("_");
                new_date = box_id[1];
            }
        }

        dataArray = {
            _method: 'put',
            "suggestion[start]": start_string,
            "suggestion[end]": end_string,
            reset_votes: resetVotes,
            authenticity_token: AUTH_TOKEN
        };

        if (new_date)
            dataArray["suggestion[date]"] = new_date;

        $.ajax({
            url: update_url,
            data: dataArray,
            //type: 'post',
            type: 'put',
            dataType: 'script'
        });
    }

    // Sends an AJAX-request to update the suggestion date belonging to the given
    // box, resetting all the votes according to resetVotes.
    function updateSuggestionDate(box, resetVotes, droppable){
        var update_url = box.attr('rel');

        var new_date = null;
        if (droppable && droppable.attr("id"))
            new_date = droppable.attr("id");

        dataArray = {
            _method: 'put',
            reset_votes: resetVotes,
            authenticity_token: AUTH_TOKEN
        };

        if (new_date)
            dataArray["suggestion[date]"] = new_date;

        $.ajax({
            url: update_url,
            data: dataArray,
            type: 'post',
            dataType: 'script'
        });

        gap_open = false;
    }

    // Gives "this" the width, height, top and left
    // values of the object in "clone".
    $.fn.restoreDimensionsFrom = function(clone){
        $(this).css('width', clone.css('width'));
        $(this).css('height', clone.css('height'));
        $(this).css('top', clone.css('top'));
    };


    // Make every suggestion-box resizable:
    var cloneDrag;
    var origDrag;

    $(document).on("mousedown",'.sugg_box.manipbl', function(){
        var box = $(this);

        box.bind('mouseover', function(){
            box.parent().children('.sugg_box').each(function(){
                $(this).css('z-index', 90);
            });
            box.css('z-index', 100);
        });

        // Make every suggestion-box draggable:
        box.draggable({
            appendTo: '#view_window',
            containment: '#suggestion_area',
            helper: 'clone',
            cancel: '.edit_time, span, icon',
            grid: [1, HOUR_HEIGHT / 4],
            refreshPositions: true,
            opacity: 0.50,
            start: function(event, ui){
                stopDragScroll();
                cloneDrag = $(this).clone();
                origDrag = $(this);
                $(this).hide();
                //$('.qtip').qtip('hide').qtip('disable');
                dragging = true;
            },
            stop: function(event, ui){
                // And re-enable D&D-scrolling:
                startDragScroll();
                //$('.qtip').qtip('enable');
                dragging = false;
            }
        });

        var cloneRes;
        box.resizable({
            handles: 'n,s',
            containment: 'parent',
            cancel: 'img',
            grid: [0, HOUR_HEIGHT / 4],
            minHeight: HOUR_HEIGHT / 2,
            start: function(){
                stopDragScroll();
                cloneRes = $(this).clone();
            },
            stop: function(event, ui){
                // Once resizing is over, update the
                // suggestion accordingly:
                var update = true;
                var resetVotes = false;
                if ($(this).hasClass("not_mine"))
                    if (!confirm(not_mine_confirmation))
                        update = false;

                if (update && $(this).hasClass("voted_on") && confirm(reset_votes_confirmation))
                    resetVotes = true;

                if (update)
                    updateSuggestion(ui.helper, resetVotes, null, null);
                else
                    $(this).restoreDimensionsFrom(cloneRes);

                // And restart D&D-scrolling:
                startDragScroll();
            }
        });
    });

    var opened_gap = null;
    //$(".day_gap").livequery(function(){
    $(document).on('mouseover',".day_gap", function(){
        $(this).droppable({
            accept: '.sugg_box',
            tolerance: 'pointer',
            greedy: true,
            over: function(event, ui){
                //falls kein Gap offen kein Timeout starten
                if (!gap_open) {
                    waitingForOpen = true;
                    opened_gap = $(this);
                    overTimeout = setTimeout(function(){
                        //Auch nach Timeout nochmal prüfen ob kein Gap offen ist
                        if (!gap_open) {
                            openGap(opened_gap)
                        }
                    }, 400);
                }
            },
            out: function(event, ui){
                clearTimeout(overTimeout);
                //falls Gap offen kein Timeout starten
                if (gap_open) {
                    outTimeout = setTimeout(function(){
                        //Auch nach Timeout nochmal prüfen ob Gap offen ist
                        if (gap_open) {
                            closeGap(opened_gap);
                        }
                    }, 200);
                }
            },
            drop: function(event, ui){
                if ($("#dropline-wrapper").length) {
                    closeGap(opened_gap);
                    origDrag.show();
                }
                else {
                    // Once resizing is over, update the
                    // suggestion accordingly:
                    var not_mine = ui.helper.hasClass("not_mine");
                    var update = true;
                    var resetVotes = false;
                    if (not_mine) {
                        if (confirm(not_mine_confirmation)) {
                            update = true;
                        }
                        else {
                            update = false;
                        }
                    }
                    if (update && ui.helper.hasClass("voted_on") && confirm(reset_votes_confirmation)) {
                        resetVotes = true;
                    }
                    if (update) {
                        updateSuggestion(ui.helper, resetVotes, $(this), ui.draggable);
                    }
                    else {
                        closeGap(opened_gap);
                        origDrag.show();
                    }
                }
            }
        });
    });

    //$(".day_box").livequery(function(){
    $(document).on('mouseover',".day_box", function(){
        $(this).droppable({
            accept: '.sugg_box',
            tolerance: 'pointer',
            drop: function(event, ui){
                // Once resizing is over, update the
                // suggestion accordingly:
                var not_mine = ui.helper.hasClass("not_mine");
                var update = true;
                var resetVotes = false;
                if (not_mine) {
                    if (confirm(not_mine_confirmation)) {
                        update = true;
                    }
                    else {
                        update = false;
                    }
                }
                if (update && ui.helper.hasClass("voted_on") && confirm(reset_votes_confirmation)) {
                    resetVotes = true;
                }
                if (update) {
                    updateSuggestion(ui.helper, resetVotes, $(this), ui.draggable);
                }
                else {
                    origDrag.show();
                }
            }
        });
    });

    //$(".dropfield").livequery(function(){
    $(document).on('mouseover',".dropfield", function(){
        $(this).droppable({
            accept: '.sugg_box',
            tolerance: 'pointer',
            greedy: false,
            over: function(event, ui){
                clearTimeout(outTimeout);
                if ($(this).hasClass("day")) {
                    activateDropField($(this));
                }
                else {
                    var dropfield = $(this);
                    clearTimeout(innerOverTimeout);
                    innerOverTimeout = setTimeout(function(){
                        activateDropField(dropfield)
                    }, 400);
                }
            },
            out: function(event, ui){
                if ($(this).hasClass("day"))
                    $(this).removeClass('hover');
                clearTimeout(innerOverTimeout);
            },
            drop: function(event, ui){
                if ($(this).hasClass("day")) {
                    var not_mine = ui.draggable.hasClass("not_mine");
                    var update = true;
                    var resetVotes = false;
                    if (not_mine) {
                        if (confirm(not_mine_confirmation)) {
                            update = true;
                        }
                        else {
                            update = false;
                        }
                    }
                    if (update && ui.draggable.hasClass("voted_on") && confirm(reset_votes_confirmation)) {
                        resetVotes = true;
                    }
                    if (update) {
                        updateSuggestionDate(ui.draggable, resetVotes, $(this));
                    }
                    else {
                        closeGap(opened_gap);
                        origDrag.show();
                    }
                }
                else {
                    closeGap(opened_gap);
                    origDrag.show();
                }
            }
        });
    });

    //$(".dropfield.day").livequery(function(){
    $(document).on('change',".dropfield.day", function(){
        $(this).droppable("option", "greedy", true);
    });

    //Suggestion-Area muss droppable sein, damit Termine,
    //die außerhalb der day_box (rechts) abgelegt werden nicht verschwinden
    //$("#suggestion_area").livequery(function(){
    $(document).on('change',"#suggestion_area", function(){
        $(this).droppable({
            accept: '.sugg_box',
            tolerance: 'pointer',
            drop: function(event, ui){
                origDrag.show();
            }
        });
    });

    //$('.vote_button') transferred to html_tutorial

    // Delete the suggestion when a user clicks the delete button:
    var alreadyAsked = false;
    $(document).on('click','.pick_button', function(){
        var updateURL = $(this).closest('div.sugg_box', 'div.sugg_box_mobile').attr('rel');
        // If there is no suggestion box, then the button is in the
        // send-dates form, so the URL is somewhere else:
        if (updateURL == null)
            updateURL = $(this).attr('rel');
        var picked = 0;
        if ($(this).attr('rel') == "0")
            picked = 1;
        $.ajax({
            url: updateURL,
            data: {
                _method: 'put',
                authenticity_token: AUTH_TOKEN, // The global variable in the site's header, storing the authenticity token
                "suggestion[picked]": picked
            },
            type: 'POST',
            dataType: "script"//,
            /*success: function(){
                var finishPlanning_isHidden = $('#cont_finishPlanning').is(':hidden');
                if (!alreadyAsked && picked == 1 && finishPlanning_isHidden) {
                    $('#exp_finishPlanning').qtip({
                        content: {
                            text: remind_to_pick
                        },
                        style: {
                            classes: "ui-tooltip-teaco"
                        },
                        position: {
                            adjust: {
                                method: "flip flip"
                            },
                            at: "left center",
                            my: "right center",
                            viewport: $(window)
                        },
                        show: {
                            ready: true,
                            event: false
                        },
                        events: {
                            render: function(event, api){
                                var destroyQtip = setTimeout(function(){
                                    $("#exp_finishPlanning").qtip("destroy");
                                }, 3500);
                            }
                        }
                    });
                    alreadyAsked = true;
                }
            }*/
        });
    });

    $(document).on("change",'.replace', function(){
        // use the helper function hover to bind a mouseover and mouseout event
        var tmp = $(this).html();
        $(this).hover(function(){
            if ($(this).children('.to_replace').html() != null)
                $(this).html($(this).children('.to_replace').html());
        }, function(){
            $(this).html(tmp);
        });
    });

    // TODO
    // use hover to show bigger
    // Suggestionboxes,if duration is < 90
    $(document).on("mouseover",'.small_sugg_box', function(){
        var tmp = $(this).html();
        tmp.hide();
    });

});

// Funktion zum Auffahren von Gaps
function openGap(drop_zone){
    if (!waitingForOpen || gap_open)
        return;
    waitingForOpen = false;
    gap_open = true;
    var gap_number = drop_zone.attr('rel');
    var header = $("#day_gap_header_" + gap_number);
    var header_gap = $("#day_gap_header_" + gap_number).children(".gap_header");
    var day_gap = drop_zone.children(".gap");
    var gap_width = 30;
    var gap_left = drop_zone.position().left;
    var gap_right = drop_zone.position().left + drop_zone.width();
    var day_width = INITIAL_DAY_WIDTH;
    var open_width = INITIAL_DAY_WIDTH + 20;
    if (!animating_gap) {
        animating_gap = true;
        day_gap.animate({
            width: open_width
        }, openCloseTime, function(){
            animating_gap = false;
        });
        drop_zone.animate({
            width: open_width + gap_width
        }, openCloseTime);
        header_gap.animate({
            width: open_width
        }, openCloseTime);
        header.animate({
            width: open_width + gap_width
        }, openCloseTime);

        if (gap_left + $("#suggestion_area").position().left < day_width) {
            // Nach rechts auffahren (am linken Rand)
            $("#suggestion_area").addClass("righty");
        }
        else
        if ($("#view_window").width() - (gap_right + $("#suggestion_area").position().left) < day_width) {
            // Nach links auffahren (am Rechten Rand)
            $("#suggestion_area").addClass("lefty");
            $("#suggestion_area").animate({
                left: "-=" + open_width,
                width: "+=" + open_width
            }, openCloseTime);
            $("#day_bar").animate({
                left: "-=" + open_width,
                width: "+=" + open_width
            }, openCloseTime);
        }
        else {
            // Nach links und rechts auffahren (Normalfall)
            $("#suggestion_area").animate({
                left: "-=" + (open_width / 2),
                width: "+=" + (open_width / 2)
            }, openCloseTime);
            $("#day_bar").animate({
                left: "-=" + (open_width / 2),
                width: "+=" + open_width
            }, openCloseTime);
        }
    }


    boxbefore_id = drop_zone.prev().attr("id").split("_");
    date_before_arr = boxbefore_id[1].split("-");
    boxafter_id = drop_zone.next().attr("id").split("_");
    date_after_arr = boxafter_id[1].split("-");

    var date1 = new Date(boxbefore_id[1]);
    var date2 = new Date(boxafter_id[1]);
    var daysBetween = days_between(date1, date2);

    if (daysBetween == 1) {
        var dateString = "";
        var dayForDateString = parseInt(date_after_arr[2], 10) - 1;
        var monthForDateString = parseInt(date_after_arr[1], 10);
        var yearForDateString = parseInt(date_after_arr[0], 10);
        if (dayForDateString == 0) {
            dayForDateString = parseInt(date_before_arr[2], 10) + 1;
            monthForDateString = parseInt(date_before_arr[1], 10);
            yearForDateString = parseInt(date_before_arr[0], 10);
        }

        dateString += (dayForDateString < 10) ? "0" + dayForDateString : dayForDateString;
        dateString += "/";
        dateString += (monthForDateString < 10) ? "0" + monthForDateString : monthForDateString + "";
        dateString += "/";
        dateString += yearForDateString + "";
        date = Date.fromString(dateString);
        header_gap.html(date.dayBar(Date.langFormat));
        drop_zone.attr('id', 'daygap_' + yearForDateString + '-' + monthForDateString + '-' + dayForDateString);
    }
    else {
        var yearsStart, yearsEnd, monthsStart, monthsEnd, prevMonth;
        //Wenn noch kein wrapper existiert:
        if ($("#dropline-wrapper").length == 0) {
            //Wrapper um alle Droplines
            day_gap.append('<div id="dropline-wrapper"></div>');

            //Vertikal ausrichten
            $("#dropline-wrapper").css('margin-top', 30 - $("#suggestion_area").position().top);
            $("#dropline-wrapper").attr("rel", boxbefore_id[1] + " " + boxafter_id[1]);

            yearsStart = parseInt(date_before_arr[0], 10);
            if (parseInt(date_before_arr[1], 10) == 12 && parseInt(date_before_arr[2], 10) == 31)
                yearsStart++;

            yearsEnd = parseInt(date_after_arr[0], 10);
            if (parseInt(date_after_arr[1], 10) == 1 && parseInt(date_after_arr[2], 10) == 1)
                yearsEnd--;

            if (yearsStart < yearsEnd)
                renderYears(yearsStart, yearsEnd);
            else {
                var dayArray = new Array(0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
                if (parseInt(date_before_arr[0], 10) % 4 == 0)
                    dayArray[2]++;

                monthsStart = parseInt(date_before_arr[1], 10);
                if (parseInt(date_before_arr[2], 10) == dayArray[monthsStart])
                    monthsStart = (monthsStart % 12) + 1;

                monthsEnd = parseInt(date_after_arr[1], 10);
                if (parseInt(date_after_arr[2], 10) == 1)
                    if (--monthsEnd == 0)
                        monthsEnd = 12;

                if (monthsStart < monthsEnd)
                    renderMonths(monthsStart, monthsEnd);
                else {
                    var startDay = parseInt(date_before_arr[2], 10);
                    if (startDay == dayArray[parseInt(date_before_arr[1], 10)])
                        startDay = 1;
                    else
                        startDay++;

                    var endDay = parseInt(date_after_arr[2], 10);
                    endDay--;
                    if (endDay == 0) {
                        prevMonth = parseInt(date_after_arr[1], 10);
                        prevMonth--;
                        if (prevMonth == 0)
                            prevMonth = 12;
                        endDay = dayArray[prevMonth];
                    }

                    if (startDay < endDay) {
                        var datestring = parseInt(date_before_arr[0], 10) + '-' + parseInt(date_before_arr[1], 10) + '-';
                        renderDays(startDay, endDay, datestring);
                    }
                }
            }
        }
        var headerStr = "";
        if (yearsStart == yearsEnd) {
            if (monthsStart == monthsEnd)
                headerStr += Date.monthNames[monthsStart - 1] + " ";
            headerStr += yearsStart;
        }
        header_gap.html(headerStr);
    }
}

// Funktion zum Zufahren von Gaps
function closeGap(drop_zone){
    if (!waitingForOpen)
        waitingForOpen = false;
    else {
        waitingForOpen = false;
        return;
    }
    gap_open = false;

    var gap_number = drop_zone.attr('rel');
    var header = $("#day_gap_header_" + gap_number)
    var header_gap = $("#day_gap_header_" + gap_number).children(".gap_header");
    var day_gap = drop_zone.children(".gap");
    var open_width = INITIAL_DAY_WIDTH + 20;
    var gap_width = 30;
    if (!animating_gap) {
        day_gap.animate({
            width: 0
        }, openCloseTime, function(){
            animating_gap = false;
        });
        drop_zone.animate({
            width: gap_width
        }, openCloseTime);
        header_gap.animate({
            width: 0
        }, openCloseTime);
        header.animate({
            width: gap_width
        }, openCloseTime);

        if ($("#suggestion_area").hasClass("righty")) {
            // Nach rechts zufahren (am linken Rand)
            $("#suggestion_area").removeClass("righty");
        }
        else
        if ($("#suggestion_area").hasClass("lefty")) {
            // Nach links zufahren (am Rechten Rand)
            $("#suggestion_area").removeClass("lefty");
            $("#suggestion_area").animate({
                left: "+=" + open_width,
                width: "-=" + open_width
            }, openCloseTime);
            $("#day_bar").animate({
                left: "+=" + open_width,
                width: "-=" + open_width
            }, openCloseTime);
        }
        else {
            // Nach links und rechts zufahren (Normalfall)
            $("#suggestion_area").animate({
                left: "+=" + (open_width / 2),
                width: "-=" + (open_width / 2)
            }, openCloseTime);
            $("#day_bar").animate({
                left: "+=" + (open_width / 2),
                width: "-=" + (open_width / 2)
            }, openCloseTime);
        }
    }
    header_gap.html("");

    $("#dropline-wrapper").remove();
}

function renderYears(start, end){
    $("#dropline-wrapper").append('<div class="dropline-group" id="dropline-group-years"></div>');
    var year_cnt = 0;
    var lines = 0;
    for (var i = start; i <= end; i++) {
        if (year_cnt++ % 7 == 0) {
            lines++;
            $("#dropline-group-years").append('<div id="dropline-years-' + lines + '" class="dropline"></div>');
        }
        $("#dropline-years-" + lines).append('<div class="dropfield year" id="year-' + i + '">' + i + '</div>');
    }
    $('.dropline .dropfield:first-child').addClass('left');
    $('.dropline .dropfield:last-child').addClass('right');

    var margin = Math.max(105 - ((end - start + 1) * 30) / 2, 0);
    $("#dropline-group-years").css('margin-left', margin);
    $("#dropline-group-years").css('margin-right', margin);
}

function renderMonths(start, end){
    $("#dropline-wrapper").append('<div class="dropline-group" id="dropline-group-months"></div>');
    var months_cnt = 0;
    var lines = 0;
    for (var i = start; i <= end; i++) {
        if (months_cnt++ % 6 == 0) {
            lines++;
            $("#dropline-group-months").append('<div id="dropline-months-' + lines + '" class="dropline"></div>');
        }
        $("#dropline-months-" + lines).append('<div class="dropfield month" rel="' + i + '" id="month-' + i + '">' + Date.abbrMonthNames[i - 1] + '</div>');
    }
    $('.dropline .dropfield:first-child').addClass('left');
    $('.dropline .dropfield:last-child').addClass('right');

    var margin = Math.max(105 - ((end - start + 1) * 30) / 2, 15);
    $("#dropline-group-months").css('margin-left', margin);
    $("#dropline-group-months").css('margin-right', margin);
}

function renderDays(start, end, datestring){
    $("#dropline-wrapper").append('<div class="dropline-group" id="dropline-group-days"></div>');
    var day_cnt = 0;
    var lines = 0;
    for (var i = start; i <= end; i++) {
        if (day_cnt++ % 7 == 0) {
            lines++;
            $("#dropline-group-days").append('<div id="dropline-days-' + lines + '" class="dropline"></div>');
        }
        $("#dropline-days-" + lines).append('<div class="dropfield day" id=' + datestring + i + '">' + i + '</div>');
    }

    $('.dropline .dropfield:first-child').addClass('left');
    $('.dropline .dropfield:last-child').addClass('right');

    var margin = Math.max(105 - ((end - start + 1) * 30) / 2, 0);
    $("#dropline-group-days").css('margin-left', margin);
    $("#dropline-group-days").css('margin-right', margin);
}

function activateDropField(dropField){
    if ($('#dropline-wrapper').length == 0)
        return;

    dropField.parent().parent().children().children().removeClass('hover');
    dropField.addClass("hover");

    var dayArray = new Array(0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    var dates = $('#dropline-wrapper').attr("rel");

    dates_arr = dates.split(" ");
    date_before_arr = dates_arr[0].split("-");
    date_after_arr = dates_arr[1].split("-");

    if (dropField.hasClass("year")) {
        $("#dropline-group-months").remove();
        $("#dropline-group-days").remove();
        var year = dropField.html();
        if (year % 4 == 0)
            dayArray[2]++;

        var startMonth = 1;
        if (year == date_before_arr[0]) {
            startMonth = parseInt(date_before_arr[1], 10);
            if (parseInt(date_before_arr[2], 10) == dayArray[startMonth])
                startMonth = (startMonth % 12) + 1;
        }

        var endMonth = 12;
        if (year == date_after_arr[0]) {
            endMonth = parseInt(date_after_arr[1], 10);
            if (parseInt(date_after_arr[2], 10) == 1)
                if (--endMonth == 0)
                    endMonth = 12;
        }

        renderMonths(startMonth, endMonth);
    }
    else
    if (dropField.hasClass("month")) {
        $("#dropline-group-days").remove();

        var selectedYear;
        if ($('.dropline .year.hover').length)
            selectedYear = $('.dropline .year.hover').html();
        else
            selectedYear = parseInt(date_before_arr[0]);
        var selectedMonth = dropField.attr("rel");
        var datestring = parseInt(selectedYear, 10) + '-' + parseInt(selectedMonth, 10) + '-';
        //Schaltjahr?
        if (selectedYear % 4 == 0)
            dayArray[2]++;
        if (parseInt(selectedMonth, 10) != parseInt(date_before_arr[1], 10) && parseInt(selectedMonth, 10) != parseInt(date_after_arr[1], 10))
            renderDays(1, dayArray[parseInt(selectedMonth, 10)], datestring);
        else
        if (parseInt(selectedMonth, 10) == parseInt(date_before_arr[1], 10))
            renderDays(parseInt(date_before_arr[2], 10) + 1, dayArray[parseInt(selectedMonth, 10)], datestring);
        else
        if (parseInt(selectedMonth, 10) == parseInt(date_after_arr[1], 10))
            renderDays(1, parseInt(date_after_arr[2], 10) - 1, datestring);
    }
}

function days_between(date1, date2){
    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24;
    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);
    // Convert back to days and return
    return Math.floor(difference_ms / ONE_DAY) - 1;
}


function showEditForm(id) {
    var id = id;
    $('#edit_form_'+id).toggle('show');
    $('#user_sugg_area_'+id).toggle('hide');
}
