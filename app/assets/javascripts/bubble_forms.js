$(document).ready(function() {

    // Hides everything that is inside the element
    // with the given id:
    $.fn.hide_contents_of = function(id){
        $(id).children().hide();
    };
    
    // Deletes any invisible element (display: none) within
    // the element with the given id:
    $.fn.delete_if_invisible = function(id){
        $(id).children().filter(function(index){
            return $(this).css("display") == "none";
        }).remove();
    };


    /*$(".manipbl .edit_time").on("change", function(){
        var contentUrl = $(this).attr("href");
        var editTitle = $(this).find('#form_title').attr('title');
        $(this).qtip({
            content: {
                title: {
                    text: editTitle,
                    button: closeButtonImage
                },
                ajax: {
                    url: contentUrl
                },
                text: "Loading..."
            },
            style: {
                classes: "ui-tooltip-teaco-editTime"
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
    });*/


    var editMeetingURL = $('#edit_title').attr('href');
    var editMeetingFormTitle = $('#edit_title').attr("title");
    $("#edit_title").editable(editMeetingURL, {
        indicator: save_meeting_title,
        tooltip: editMeetingFormTitle,
        name: 'meeting[title]',
        submit: change_meeting_title,
        cancel: cancel_meeting_title,
        onblur: 'submit',
        onreset: function(){
            $('i.editableTitle').show();
        },
        submitdata: {
            _method: 'put',
            authenticity_token: AUTH_TOKEN
        },
        callback: function(){
            $('i.editableTitle').show();
        }
    });


    $("#edit_title").click(function(){
        $('img.editableTitle').hide();
    });

    $('img.editableTitle').click(function(){
        $("#edit_title").trigger('click');
    });
    
    $.fn.inputTextWidth = function(){
        var orgText = $(this).attr('value') + '.';
        var sensor = $('<div />').css({
            margin: '0px 0px 15px 0px',
            padding: '0 5px',
            display: 'none',
            fontSize: '22px',
            fontFamily: 'Trebuchet MS'
        });
        sensor.html(orgText);
        $('body').append(sensor);
        var width = $('body').find('div:last').outerWidth() * 1.1;
        $('body').find('div:last').remove();
        return width;
    };

    
    $("#edit_title form input").on("change", function(){
        $(this).attr('maxlength', '60');
        var size = $(this).inputTextWidth();
        $(this).css('width', Math.min(size, 700));
        $(this).bind('keyup', function(){
            var size = $(this).inputTextWidth();
            $(this).css('width', Math.min(size, 700));
        });
    });


    /*$(".edit_comment").on("change", function(){
        var editCommentURL = $(this).attr('rel');
        var editCommentTitle = $(this).attr('title');
        var editCommentId = $(this).attr('id');
        $(this).parent().parent().children('.text').editable(editCommentURL, {
            loadurl: editCommentURL,
            indicator: 'Saving...',
            name: 'comment[text]',
            type: 'textarea',
            submit: change_meeting_title,
            cancel: cancel_meeting_title,
            onblur: 'submit',
            cssclass: 'expand',
            event: 'myPseudoEvent',
            style: 'padding-bottom:15px',
            submitdata: {
                _method: 'put',
                authenticity_token: AUTH_TOKEN
            }
        });
        $(this).click(function(){
            $(this).parent().parent().children('.text').trigger('myPseudoEvent');
        });
    });
    */



    $(".expand").on("change", function(){
        $(this).children('textarea').TextAreaExpander(50, 9999);
    });
    
    // Confirmation-Form for the uninvite-participants-button:
    /*$("#uninvite_submit").on("change", function(){
        var uninviteFormTitle = $(this).val();
        var uninviteForm = $('.uninvite_form').clone();
        $(this).qtip({
            content: {
                title: {
                    text: uninviteFormTitle,
                    button: closeButtonImage
                },
                text: uninviteForm
            },
            style: {
                classes: "ui-tooltip-teaco"
            },
            position: {
                adjust: {
                    method: "flip flip"
                },
                at: "center left",
                my: "center right",
                viewport: $(window)
            },
            show: {
                event: "click"
            },
            hide: {
                event: "click"
            },
            events: {
                show: function(event, api){
                    $(".participant_check").attr("disabled", "disabled");
                    // Check if the initiator was checked too. If so,
                    // display a message that he cannot be uninvited:
                    var initiatorCheck = $(".participant_check[title]:checked");
                    if (initiatorCheck.length > 0) {
                        if (initiatorCheck.attr('title') == "") {
                            initiatorCheck.qtip('show');
                        }
                        else {
                            initiatorCheck.qtip({
                                content: {
                                    text: $(this).attr('title')
                                },
                                style: {
                                    width: 150,
                                    classes: "ui-tooltip-teaco"
                                },
                                position: {
                                    adjust: {
                                        method: "flip flip"
                                    },
                                    at: "top right",
                                    my: "bottom left",
                                    viewport: $(window)
                                },
                                show: {
                                    ready: true,
                                    delay: 0
                                },
                                hide: {
                                    event: "unfocus"
                                }
                            });
                            alreadyTipped = true;
                        }
                    }
                },
                hide: function(event, api){
                    $(".participant_check").removeAttr('disabled');
                    $('.confirm_uninvite').removeAttr('disabled');
                    $('.submit_button_replacer').remove();
                }
            }
        });
    });
    */
    
    /*$("#send_message_button").on("click", function(){
        var sendMessageURL = $(this).attr('rel');
        var sendMessageFormTitle = $(this).val();
        $(this).qtip({
            content: {
                title: {
                    text: sendMessageFormTitle,
                    button: closeButtonImage
                },
                ajax: {
                    url: sendMessageURL
                },
                text: "Loading..."
            },
            style: {
                width: 400,
                classes: "ui-tooltip-teaco"
            },
            position: {
                adjust: {
                    method: "flip flip"
                },
                at: "bottom left",
                my: "top right",
                viewport: $(window)
            },
            show: {
                event: "click"
            },
            hide: {
                event: "click"
            },
            events: {
                show: function(event, api){
                    setTimeout(function(){
                        $(".message_form").focusFirstInput();
                    }, focusTimeOut);
                }
            }
        });
    });*/
    
    /*// Popup-form for the send-dates-button:
     var sendDatesURL = $("#send_dates_link").attr('rel');
     var sendDatesFormTitle = $("#send_dates_link").attr('title');
     function enableSendDates() {
     $("#send_dates_link").qtip({
     content: {
     url: sendDatesURL,
     title: { text: sendDatesFormTitle, button: closeButtonImage }
     },
     style: {
     name: 'teaco',
     width: 250
     },
     position: {
     corner: {
     target: 'leftMiddle',
     tooltip: 'rightMiddle'
     },
     adjust:{ screen:true }
     },
     show: { when: 'click' },
     hide: { when: 'click' },
     api: {
     // This is neccessary so that the content is not cached.
     onHide: function() {
     $("#send_dates_link").qtip('destroy');
     enableSendDates();
     },
     onShow: function() {
     setTimeout(function() { $('.send_dates_form').focusFirstInput(); }, focusTimeOut)
     }
     }
     }).click(function() { return false; });
     }
     enableSendDates();*/

    /*$('.vote_bar.large').on('click', function(){
        if (!dragging) {
            var contentURL = $(this).attr('rel');
            var voteBarTitle = $(this).attr('title');
            $(this).qtip({
                content: {
                    title: {
                        text: voteBarTitle
                    },
                    ajax: {
                        url: contentURL
                    },
                    text: "Loading..."
                },
                style: {
                    classes: "ui-tooltip-teaco"
                },
                hide: {
                    fixed: true
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
                    delay: 0
                }
            });
        }
    });
    */
    
    /*$('.sugg_box.30_min').on("click",function(){
        var contentURL = $(this).find('div.vote_bar').attr('rel');
        var voteBarTitle = $(this).find('div.vote_bar').attr('title');
        $(this).qtip({
            content: {
                title: {
                    text: voteBarTitle
                },
                ajax: {
                    url: contentURL
                },
                text: "Loading..."
            },
            style: {
                width: "auto",
                classes: "ui-tooltip-teaco"
            },
            hide: {
                fixed: true
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
                delay: 0
            }
        });
    });
    */
    
    /*$('.busy_box').on("click", function(){
        var content = $(this).find('div.tooltip');
        var title = $(this).attr('title');
        $(this).qtip({
            content: {
                text: content,
                title: title
            },
            style: {
                classes: "ui-tooltip-teaco"
            },
            position: {
                target: "mouse",
                adjust: {
                    method: "flip flip"
                },
                at: "bottom center",
                my: "top center",
                viewport: $(window)
            },
            show: {
                solo: false
            }
        });
    });*/
}); // end jQuery

