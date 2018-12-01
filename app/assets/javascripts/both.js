var closeButtonImage = '<i class="icon-cancel large_icon""></i>';
// Time in milliseconds after a tooltip has shown before
// its first input element is focussed (neccessary because
// these inputs are not available immediately after the
// tooltip form has shown):
var focusTimeOut = 300;

// Blendet die Welcome_Box nach angegebener Zeit aus
$(document).ready(function () {
    setTimeout(function () {
        $('.welcome_box').hide();
    }, 60000);
});

// Closes the tooltips/bubble forms of the
// element with the specified ID.
function close_form_on_id(id){
    $('.qtip').each(function(){
        var a = $(this).qtip('api');
        if (a.elements.target.attr('id') == id) {
            a.hide();
        }
    });
}

// Closes the tooltips/bubble forms of all
// the elements with the specified class.
function close_form_on_class(cssClass){
    $('.qtip').each(function(){
        var a = $(this).qtip('api');
        if (a.elements.target.hasClass(cssClass)) {
            a.hide();
        }
    });
}

function close_stale_tooltips(){
    $('.qtip').each(function(){
        var a = $(this).qtip('api');
        if (!a.elements.target.is(':visible')) {
            a.destroy();
        }
    });
}

// Sets the input focus onto the first
// input or textarea element beneath the
// selected element:
$.fn.focusFirstInput = function(){
    var inputs = $(this).find('input.gain_focus:visible, textarea.gain_focus:visible');
    if (!inputs.length == 0) {
        inputs.get(0).focus();
    }
}

$(document).ready(function(){

    dataConfirmModal.setDefaults({
        title: 'Confirm your action',
        commit: 'Bestätigen',
        cancel: 'Abbrechen'
    });

    // Wechselt das Icon beim Öffnen / Schließen eines Panels
    $('.collapse').on('shown.bs.collapse', function(){
        $(this).parent().find(".icon-down-dir").removeClass("icon-down-dir").addClass("icon-up-dir");
    }).on('hidden.bs.collapse', function(){
        $(this).parent().find(".icon-up-dir").removeClass("icon-up-dir").addClass("icon-down-dir");
    });

    /*$("#new_meeting_button").on("click", function(){
        var newMeetingURL = $('#new_meeting_button').attr('rel');
        var newMeetingFormTitle = $('#new_meeting_button').attr("title");
        $(this).qtip({
            overwrite: false,
            content: {
                title: {
                    text: newMeetingFormTitle,
                    button: closeButtonImage
                },
                ajax: {
                    url: newMeetingURL
                },
                text: "Loading..."
            },
            style: {
                classes: "ui-tooltip-teaco"
            },
            position: {
                adjust: {
                    method: "flip flip"
                },
                at: "bottom center",
                my: "top center",
                viewport: $(window)
            },
            show: {
                solo: false,
                event: "click"
            },
            hide: {
                event: "click"
            },
            events: {
                show: function(event, api){
                    setTimeout(function(){
                        $(".new_meeting_form").focusFirstInput();
                    }, focusTimeOut);
                }
            }
        });
    });
    */

	// When the user changes the selection box for his meetings, jump to that meeting:
    $("select#meeting_selector").on('change', function(){
        var jumpToID = $(this).val();
        if (jumpToID != "none") {
            var divider = "/";
            // Is the last letter already a slash?
            if (location.href.charAt(location.href.length - 1) == '/') {
                // Then append no slash:
                divider = "";
            }
			if ($("#suggestion_area").length)
            	location.href = jumpToID;
			else
				location.href = location.href + divider + jumpToID;
        }
    });
    
    // Handle the "OK" button from the form above:
    $("input.confirm").on('click', function(){
        var updateURL = $(this).closest('form').attr("action");
        //$(this).after("<img src='ajax.gif' class='submit_button_replacer' />");
        $.ajax({
            url: updateURL,
            data: {
                _method: 'delete',
                authenticity_token: AUTH_TOKEN // The global variable in the site's header, storing the authenticity token
            },
            type: 'POST',
            dataType: "script",
        });
        
        return false;
    });
    
    // Handle the "Cancel" button from the form above:
    $("input.cancel").on('click', function(){
        close_form_on_class('confirmed');
        close_form_on_class('confirmed_left');
        close_form_on_class('confirmed_right');
        close_form_on_class('delete_comment');
        return false;
    });
    
    // The action of any "confirmed" link must be confirmed
    // via a common confirmation dialog:
    $('.confirmed').on("click", function(){
        var actionPath = $(this).attr('rel');
        var cloneForm = $('div#confirmation_form').clone();
        cloneForm.find('form').attr('action', actionPath);
        cloneForm.removeAttr('id');
        $(this).removeData('qtip').qtip({
            content: {
                text: cloneForm
            },
            style: {
                classes: "ui-tooltip-teaco"
            },
            position: {
                adjust: {
                    method: "flip flip"
                },
                at: "top center",
                my: "bottom center",
                viewport: $(window)
            },
            show: {
                solo: true,
                event: "click"
            },
            hide: {
                event: "click"
            }
        });
    }).click(function(){
        return false;
    });
	
	$("form.ajax").on("click", function(){
        // Find the submit-button which submits this form:
        var form = $(this);
        var submitButton = $(this).find("input[type='submit']");
        $(this).ajaxForm({
            dataType: 'script',
            beforeSend: function(){
                // When submitting the form, replace any submit-button with a loader image:
                submitButton.attr("disabled", "disabled");
                //submitButton.after("<img src='ajax.gif' class='submit_button_replacer' />");
            },
            complete: function(){
                // Once the request is complete, restore the submit-button:
                var loadImg = form.find("img.submit_button_replacer");
                loadImg.remove();
                submitButton.removeAttr("disabled");
                
            }
        });
    });
    
    
    /******************************************************
     * Apply Tooltips to elements with the corresponding
     * CSS-classes:
     ******************************************************/
    $('.tipped_top').on("click", function(){
        $(this).qtip({
            overwrite: false,
            style: {
                classes: "ui-tooltip-teaco"
            },
            position: {
                adjust: {
                    method: "flip flip"
                },
                at: "top center",
                my: "bottom center",
                viewport: $(window)
            }
        });
    });
    
    $('.tipped_right').on("click", function(){
        $(this).qtip({
            overwrite: false,
            style: {
                classes: "ui-tooltip-teaco"
            },
            position: {
                adjust: {
                    method: "flip flip"
                },
                at: "right center",
                my: "left center",
                viewport: $(window)
            }
        });
    });
    
    $('.tipped_bottom').on("click", function(){
        $(this).qtip({
            overwrite: false,
            style: {
                classes: "ui-tooltip-teaco"
            },
            position: {
                adjust: {
                    method: "flip flip"
                },
                at: "bottom center",
                my: "top center",
                viewport: $(window)
            }
        });
    });
    
    $('.tipped_left').on("click", function(){
        $(this).qtip({
            overwrite: false,
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
            }
        });
    });
	
	//Footer Link "Über TeaCo"
	/*$("#ftr_lnk_01").livequery(function(){
        var aboutText = $('#ftr_lnk_01').attr('rel');
        var aboutTitle = $('#ftr_lnk_01').attr("title");
        $(this).qtip({
            content: {
                text: aboutText,
                title: {
                    text: aboutTitle,
                    button: "<img src=\"close.png\" />"
                }
            },
            style: {
                width: 600,
                classes: "ui-tooltip-teaco"
            },
            position: {
                at: "top center",
                my: "bottom center"
            },
            show: {
                solo: true,
                event: "click"
            },
            hide: {
                event: "click"
            }
        }).click(function(){
            return false;
        });
    });
    */
    
});
