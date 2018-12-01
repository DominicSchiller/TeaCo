$(document).ready(function(){
    /*
    $("#hdr_lnk_03").on(function(){
        var loginURL = $('#hdr_lnk_03').attr('rel');
        var loginFormTitle = $('#hdr_lnk_03').attr("title");
        //in myTeaco hat der Link zur Berechnung der Breite
        //die selbe ID aber kein rel-Tag
        if (loginURL) 
            $(this).qtip({
                content: {
                    title: {
                        text: loginFormTitle,
                        button: closeButtonImage
                    },
                    ajax: {
                        url: loginURL
                    },
                    text: "Loading..."
                },
                style: {
                    width: 300,
                    classes: "ui-tooltip-teaco"
                },
                position: {
                    adjust: {
                        method: "flip flip"
                    },
                    at: "bottom center",
                    my: "top right",
                    viewport: $(window)
                },
                show: {
                    solo: true,
                    event: "click"
                },
                hide: {
                    event: "click"
                },
                events: {
                    show: function(event, api){
                        setTimeout(function(){
                            $(".login_form").focusFirstInput();
                        }, focusTimeOut);
                    }
                }
            });
    });
    */

/*
    $("a.clone_meeting").on('click', function(){
        $(this).qtip({
            content: {
                title: {
                    text: $(this).attr("title"),
                    button: "closeButtonImage"
                },
                ajax: {
                    url: $(this).attr("rel")
                }
            },
            style: {
                width: 400,
                classes: "ui-tooltip-teaco"
            },
            position: {
                adjust: {
                    method: "flip flip"
                },
                at: "left center",
                my: "right top",
                viewport: $(window)
            },
            show: {
                solo: true,
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
        }).click(function(){
            return false;
        });
    });
*/

/* TODO Working qtip - can be deleted
    $("a.clone_meeting").qtip({
        content: {
            text: "HULK Me HULK HULK",
            title: {
                text: "Title",
                button: true
            }
        },
        show: {
            event: 'click',
            solo: true
        },
        hide: {
            fixed: true,
            event: 'unfocus'
        },
        position: {
            target: 'mouse',
            viewport: $(window),
            adjust: {
                method: 'flip shift',
                mouse: false
            }
        },
        style: {
            tip: false,
            widget: false
        }
    });
*/

    // Confirmation-Form for the uninvite-participants-button:
    /*$("#delete_known_addresses_submit").on("click", function(){
        var deleteFormTitle = $(this).val();
        $(this).qtip({
			content: {
				text: $('.delete_form'),
                title: {
                    text: deleteFormTitle,
                    button: closeButtonImage
                }
            },
            style: {
                classes: "ui-tooltip-teaco"
            },
            position: {
                adjust: {
                    method: "flip flip"
                },
                at: "rightt center",
                my: "left center",
                viewport: $(window)
            },
            show: {
                solo: true,
                event: "click"
            },
            hide: {
                event: "click"
            },
            events: {
                show: function(event, api){
                   $(".delete_check").attr("disabled", "disabled");;
                },
				hide: function(event, api){
                    $(".delete_check").removeAttr('disabled');
                    $('.confirm_delete').removeAttr('disabled');
                    $('.submit_button_replacer').remove();
				}
            }
        }).click(function(){
            return false;
        });
    });
    */

    $('.delete_check').on('change', function(){
        if ($('.delete_check:checked').length > 0) {
            $('#delete_known_addresses_submit').removeAttr('disabled');
        }
        else {
            $('#delete_known_addresses_submit').attr('disabled', 'disabled');
        }
    });
    
    $('.confirm_delete').on('click touch', function(){
    
        $(this).attr("disabled", "disabled");
        //$(this).after("<img src='ajax.gif' class='submit_button_replacer' />");
        
        var deleteURL = $(this).attr('rel');
        var selectedAddresses = $('.delete_check:checked');
        var dataArray = new Array();
        dataArray = {
            _method: 'delete',
            authenticity_token: AUTH_TOKEN
        }
        
        selectedAddresses.each(function(i){
            var val = $(this).attr('value').toString();
            dataArray['known_addresses_ids[' + i + ']'] = val;
        });
        
        $.ajax({
            url: deleteURL,
            data: dataArray,
            type: 'POST',
            dataType: "script"
        });
        return false;
    });
    
    /*$('.cancel_delete').on('click', function(){
        $('#delete_known_addresses_submit').qtip('hide');
    });*/
    
    $('.make_active').on('click touch', function(){
        var address = $(this).attr('rel');
        var updateURL = $(this).closest('.alias_addresses_list').attr('rel');
        $.ajax({
            url: updateURL,
            data: {
                _method: 'put',
                "user[email]": address,
                authenticity_token: AUTH_TOKEN // The global variable in the site's header, storing the authenticity token
            },
            type: 'POST',
            dataType: "script",
        });
        //$(this).replaceWith("<img src='ajax.gif' class='submit_button_replacer' />");
    });
    
    $('a#delete_account_link').on('click', function(){
        $('#delete_account_form').show();
        $(this).remove();
        return false;
    });
    
    //diashow on startpage
    $('.dia_pic').fancybox();
});
