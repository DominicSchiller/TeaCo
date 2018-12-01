$(document).ready(function(){
    /*
    $("#hdr_lnk_02").livequery(function(){
        var helpURL = $('#hdr_lnk_02').attr('rel');
        var helpTitle = $('#hdr_lnk_02').attr("title");
        $(this).qtip({
            content: {
                title: {
                    text: helpTitle,
                    button: closeButtonImage
                },
                ajax: {
                    url: helpURL
                },
                text: "Loading..."
            },
            style: {
                width: 500,
                classes: "ui-tooltip-teaco"
            },
            position: {
                at: "bottom center",
                my: "top right"
            },
            show: {
                solo: true,
                event: "click"
            },
            hide: {
                event: "click"
            }
        });
    });
    */
    
    $('.help_list li > a').on('click', function(){
        $(this).next().slideToggle();
        return false;
    });
});


