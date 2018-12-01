/*/*/
// Sets the times in the edit/create fields for
// a suggestion, when one of them is changed:
function adjustTimeFields(updatedField){
    var form = updatedField.closest('form');

    var timePattern = /^([0-9]|(0[0-9])|(1[0-9])|(2[0-3])):[0-5][0-9]$/;
    var dummyDate = "2001/01/01 ";

    var updatedTime = updatedField.attr('value');
    // Is the new value a valid time string?
    if (timePattern.test(updatedTime)) {

        updatedField.css('color', 'black');
        enableSuggSubmit(form);

        var startTimeField = updatedField.closest('form').find('input.sugg_start');
        var durationField = updatedField.closest('form').find('input.sugg_duration');
        var endTimeField = updatedField.closest('form').find('input.sugg_end');

        // Was the user editing the start-time field?
        if (updatedField.hasClass('sugg_start')) {
            // Is the duration value a valid time string?
            var durationTime = durationField.attr('value');
            if (timePattern.test(durationTime)) {
                durationField.css('color', '#888888');
                enableSuggSubmit(form);
                var start = new Date(dummyDate + startTimeField.val() + ":00");
                // Then set the end value accordingly:
                var end = new Date(dummyDate + startTimeField.val() + ":00");

                var duration = new Date(dummyDate + durationField.val() + ":00");
                end.addHours(duration.getHours());
                end.addMinutes(duration.getMinutes());

                // Don't allow 0:00 as an end value - this could lead to errors,
                // as it's not clear whether it is the same or the next day.
                // Neither allow inter-day suggestions - set back to
                // 23:59 then as well:
                if (end.getHours() == 0 && end.getMinutes() == 0 ||
                    end.getDay() != start.getDay()) {
                    end = new Date(dummyDate + " 23:59:00");
                    duration = new Date(end - start);
                    duration.addHours(-1);
                }

                var endString = "" + end.getMinutes();
                if (endString.length < 2) {
                    endString = "0" + endString;
                }
                endTimeField.val(end.getHours() + ":" + endString);

                var durationString = "" + duration.getMinutes();
                if (durationString.length < 2) {
                    durationString = "0" + durationString;
                }
                durationField.val(duration.getHours() + ":" + durationString);

            }
            else {
                durationField.css('color', 'red');
                disableSuggSubmit(form);
            }
        }
        else
        if (updatedField.hasClass('sugg_duration')) { // Was the user editing the duration field?
            // Is the start time value a valid time string?
            var startTime = startTimeField.attr('value');
            if (timePattern.test(startTime)) {
                startTimeField.css('color', 'black');
                enableSuggSubmit(form);
                // Then set the end value accordingly:
                var end = new Date(dummyDate + startTime + ":00");
                var duration = new Date(dummyDate + durationField.val() + ":00");
                var start = new Date(dummyDate + startTime + ":00");
                if (duration.getHours() == 0 && duration.getMinutes() < 30) {
                    durationField.css('color', 'red');
                    disableSuggSubmit(form);
                }
                else {
                    durationField.css('color', '#888888');
                    enableSuggSubmit(form);
                }

                end.addHours(duration.getHours());
                end.addMinutes(duration.getMinutes());

                // Don't allow 0:00 as an end value - this could lead to errors,
                // as it's not clear whether it is the same or the next day.
                // Neither allow inter-day suggestions - set back to
                // 23:59 then as well:
                if (end.getHours() == 0 && end.getMinutes() == 0 ||
                    end.getDay() != start.getDay()) {
                    end = new Date(dummyDate + " 23:59:00");
                    duration = new Date(end - start);
                    duration.addHours(-1);
                }

                var endString = "" + end.getMinutes();
                if (endString.length < 2) {
                    endString = "0" + endString;
                }
                endTimeField.val(end.getHours() + ":" + endString);

                var durationString = "" + duration.getMinutes();
                if (durationString.length < 2) {
                    durationString = "0" + durationString;
                }
                durationField.val(duration.getHours() + ":" + durationString);

            }
            else {
                startTimeField.css('color', 'red');
                disableSuggSubmit(form);
            }
        }
        else { // The user was editing the end time field:
            // Is the start time value a valid time string?
            var startTime = startTimeField.attr('value');
            if (timePattern.test(startTime)) {
                startTimeField.css('color', 'black');
                enableSuggSubmit(form);
                // Then set the duration value accordingly to the start-end-distance:
                var start = new Date(dummyDate + startTime + ":00");
                var end = new Date(dummyDate + endTimeField.val() + ":00");
                var controlDate = new Date(start);
                controlDate.addMinutes(30);
                if (controlDate > end) {
                    durationField.css('color', 'red');
                    disableSuggSubmit(form);
                }
                else {
                    durationField.css('color', '#888888');
                    enableSuggSubmit(form);
                }
                var duration = new Date(end - start);
                duration.addHours(-1);
                var durationString = "" + duration.getMinutes();
                if (durationString.length < 2) {
                    durationString = "0" + durationString;
                }
                durationField.val(duration.getHours() + ":" + durationString);
            }
            else {
                startTimeField.css('color', 'red');
                disableSuggSubmit(form);
            }
        }

    }
    else { // The changed field contained no valid value.
        updatedField.css('color', 'red');
        disableSuggSubmit(form);
    }

}

function disableSuggSubmit(form){
    form.find('input[type=submit]').attr("disabled", "disabled");
    form.addClass('inactive');
}

function enableSuggSubmit(form){
    form.find('input[type=submit]').removeAttr("disabled");
    form.removeClass('inactive');
}

// Clears the user input in the element
// (especially for textareas and inputs).
$.fn.clearField = function(){
    if ($(this).is('input')) {
        $(this).val("");
    }
    else
        if ($(this).is('textarea')) {
            $(this).val("");
        }
};


// jQuery-functions: executed once the document has
// finished loading:
$(function(){
    // Ajaxify all links which are marked as ajax:
    $("a.ajax").on("click", function(){
        $(this).on("click", function(e){

            // Depending on the "method_xxx"-class of the link, the
            // data field "_method" for rails and send type of the ajax
            // request are determined:
            var sendMethod = 'get';
            var ajaxType = "POST";
            if ($(this).hasClass("method_post")) {
                sendMethod = 'post';
            }
            else
                if ($(this).hasClass("method_put")) {
                    sendMethod = 'put'
                }
                else
                    if ($(this).hasClass("method_delete")) {
                        sendMethod = 'delete'
                    }
                    else {
                        ajaxType = "GET";
                    }
            // Send the ajax-request with the determined options:
            $.ajax({
                url: $(this).attr("href"),
                data: {
                    _method: sendMethod,
                    authenticity_token: AUTH_TOKEN // The global variable in the site's header, storing the authenticity token
                },
                type: ajaxType,
                dataType: "script"
            });
            return false;
        })
    });

    // TODO Doppelklick
    // Build the calendar date-picker in the details-panel:
    /*$('.date_picker').livequery(function(){
        $(this).datePicker({
            inline: true,
            renderCallback: function($td, thisDate, month, year){
                if (thisDate.isWeekend()) {
                    $td.addClass('weekend');
                }
                // All clickable days can be double clicked as well,
                // in order to immediately create a suggestion:
                if (!$td.hasClass("disabled")) {
                    $td.attr('alt', gridDoubleClickToAdd);
                    $td.attr('title', gridDoubleClickToAdd);
                    $td.dblclick(function(){
                        var form = $(this).closest('form');
                        if (!form.hasClass('inactive')) {
                            form.triggerHandler("submit");
                        }
                    });
                }
            }
        }).bind('dateSelected', function(e, selectedDate, $td){
            $(this).parent().children('.date_field').attr("value", selectedDate.asString('yyyy/mm/dd'));
        }).val(new Date().asString()).trigger('change');

        theHidden = $(this).parent().children('#suggestion_date');
        act_date = theHidden.val();
        if (act_date) {
            date_arr = act_date.split("-");
            $(this).dpSetSelected(date_arr[2] + '/' + date_arr[1] + '/' + date_arr[0]);
        }
    });*/


    // Enable the time-picker for the corresponding inputs:
    /*$('input.sugg_start, input.sugg_end').on("click", function(){
        $(this).clockpick({}, function(){
            adjustTimeFields($(this));
        });
    });*/


    $('#datepicker').datepicker({
        multidate: false,
        format: 'dd.mm.yyyy',
        todayHighlight: true,
        language: 'de',
        calendarWeeks: true
    });

    $('#datepicker').on('changeDate', function() {
        $('#date_field_id').val(
            $('#datepicker').datepicker('getDates')
        );
    });


    $('.clockpicker').clockpicker({
        twelvehour: false,
        donetext: 'OK',
        autoclose: false
    });


    /* Original */
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

    $('input.sugg_start, input.sugg_duration, input.sugg_end').on("click", function(){
        $(this).change(function(){
            adjustTimeFields($(this));
        });
    });

    //remove jquery clockpick
    $('input.sugg_start, .sugg_duration, input.sugg_end').on("click", function(){
        $(this).keypress(function(){
            $('.CP').remove();
        });
    });

    // When one of the participant-check-boxes is checked or unchecked,
    // change the disabled-state of the uninvite and send-message buttons:
    $('.participant_check').on('click', function(){
        if ($('.participant_check:checked').length > 0) {
            $('#uninvite_submit, #send_message_button').removeAttr('disabled');
        }
        else {
            $('#uninvite_submit, #send_message_button').attr('disabled', 'disabled');
        }
    });

    // Handle the "confirm user uninvitation" click:
    $('.confirm_uninvite').on('click', function(){

        $(this).attr("disabled", "disabled");
        //$(this).after("<img src='/images/ajax.gif' class='submit_button_replacer' />");

        var uninviteURL = $(this).attr('rel');
        var selectedParticipants = $('.participant_check:checked');
        var dataArray = new Array();
        dataArray = {
            _method: 'delete',
            authenticity_token: AUTH_TOKEN
        }

        selectedParticipants.each(function(i){
            var val = $(this).attr('value').toString();
            dataArray['participant_ids[' + i + ']'] = val;
        });

        $.ajax({
            url: uninviteURL,
            data: dataArray,
            type: 'POST',
            dataType: "script"
        });
        return false;
    });

    $('.cancel_uninvite').on('click', function(){
        $('#uninvite_submit').qtip('hide');
    });

    // When the send-message-form is submitted, send the
    // according AJAX-request:
    $('#send_message_submit').on('click', function(){
        var sendMessageURL = $(this).closest('form').attr('action');

        $(this).attr("disabled", "disabled");
        //$(this).after("<img src='/images/ajax.gif' class='submit_button_replacer' />");

        dataArray = {
            _method: 'post',
            authenticity_token: AUTH_TOKEN
        }

        var selectedParticipants = $('.participant_check:checked');
        selectedParticipants.each(function(i){
            var val = $(this).attr('value').toString();
            dataArray['participant_ids[' + i + ']'] = val;
        });

        dataArray['message'] = $(this).closest('form').find('textarea#message').val();

        $.ajax({
            url: sendMessageURL,
            data: dataArray,
            type: 'POST',
            dataType: "script"
        });
        return false;

    });

    // When the user changes the selection box for the open suggestions, jump
    // to that suggestion:
    $("span.unvoted_link").on("change", function(){
        $(this).click(function(){
            var jumpToID = $(this).attr("title");
            scrollTo('sugg_' + jumpToID);
        });
    });

    // Load the data for the auto-complete-function
    // via ajax when the participants input appears:
    $('textarea#participants').on("change", function(){
        var dataURL = $(this).attr('rel');
        var textarea = $(this);
        var addresses;

        function split(val){
            return val.split(/,\s*/);
        }
        function extractLast(term){
            return split(term).pop();
        }

        $.getJSON(dataURL, function(addresses){
            textarea            // don't navigate away from the field on tab when selecting an item
                .bind("keydown", function(event){
                    if (event.keyCode === $.ui.keyCode.TAB &&
                        $(this).data("autocomplete").menu.active) {
                        event.preventDefault();
                    }
                }).autocomplete({
                source: function(request, response){
                    var entrys = new Array();
                    $.each(addresses, function(key, val){
                        if (request.term.indexOf(val.address) == -1) {
                            if (val.name != null)
                                newEntry = val.name + " [" + val.address + "]";
                            else
                                newEntry = val.address;
                            entrys.push(newEntry);
                        }
                    });
                    response($.ui.autocomplete.filter(entrys, extractLast(request.term)));
                },
                open: function(event, ui){
                    // force to width of the textarea
                    $('.ui-menu').css('width', textarea.width());
                },
                focus: function(){
                    // prevent value inserted on focus
                    return false;
                },
                select: function(event, ui){
                    var terms = split(this.value);
                    // remove the current input
                    terms.pop();
                    // add the selected item
                    terms.push(ui.item.value);
                    // add placeholder to get the comma-and-space at the end
                    terms.push("");
                    this.value = terms.join(", ");
                    return false;
                }
            });
        });
    });

    //
    $('.pick_address').on('click', function(){
        var textarea = $('textarea#participants');
        var address = $(this).attr('rel');
        var divider = ", ";
        if (textarea.val() == "") {
            divider = "";
        }
        textarea.val(textarea.val() + divider + address);
    });

    //diashow on startpage
    $('#ftr_lnk_04').on('click', function() {
        $.fancybox([
            {
                'href'  : '/images/tut_expert/01.png',
                'title' : 'Text1'
            },
            {
                'href'  : '/images/tut_expert/02.png',
                'title' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit2'
            },
            {
                'href'  : '/images/tut_expert/01.png',
                'title' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit1'
            },
            {
                'href'  : '/images/tut_expert/03.png',
                'title' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit3'
            },
            {
                'href'  : '/images/tut_expert/04.png',
                'title' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit4'
            },
            {
                'href'  : '/images/tut_expert/05.png',
                'title' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit5'
            },
            {
                'href'  : '/images/tut_expert/06.png',
                'title' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit6'
            },
            {
                'href'  : '/images/tut_expert/07.png',
                'title' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,Lorem ipsum dolor sit amet, consectetur adipiscing elit 7'
            }
        ], {
            'type'		: 'image'
        });
		return false;
	});

});

// equal height to boxes on dashboard
$(document).ready(function() {
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
});

$(document).ready(function() {
    $('.panel-group .panel-collapse.in').prev().addClass('active');
    $('.panel-group')
        .on('show.bs.collapse', function (e) {
            $(e.target).prev('.panel-heading').addClass('active');
        })
        .on('hide.bs.collapse', function (e) {
            $(e.target).prev('.panel-heading').removeClass('active');
        });
});


$(document).ready(function () {

    $('.dropdown-menu').click(function(e) {
        e.stopPropagation();
    });

    // popover on mouseover
    $(".info_popover").popover({ trigger: "hover" });




    // equal height to boxes on imprint
    var box_row_1 = $('.imprint_boxes');
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
});

