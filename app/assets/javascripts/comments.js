/*
function hideCommentForm(){
    $('div.comment_form').hide();
    var form = $('div#comment_form_wrapper div.comment_form');
    close_form_on_class('edit_comment');
    form.hide();
    $('#comment_form_button').show();
}


$(function(){
    // Open the "new comment" form when the user
    // clicks on the according button:
    $('#comment_form_button').on('click', function(){
        var form = $('div.comment_form');
        form.show();
        $(this).qtip('hide');
        $(this).hide();
        form.focusFirstInput();
    });
*/
    /*
    // Handle the click on the delete link for a comment.
    // Note that deleting is not actually removing the comment
    // but substituting its text content.
    $("a.delete_comment").on(function(){
        var updateURL = $(this).attr("rel");
        var cloneForm = $('div#confirmation_form').clone();
        cloneForm.find('input.confirm').removeClass('confirm').addClass('confirm_comment_delete').attr('rel', updateURL);
        cloneForm.removeAttr('id');
        $(this).qtip({
			content: {
				text: cloneForm
			},
			style: {
				classes: "ui-tooltip-teaco"
			},
			position: {
				target: $('.next()'),
				adjust: {
					resize: false
				},
				at: "top left",
				my: "bottom left"
			},
			show: {
				event: "click"
			},
			hide: {
				event: false
			}
		}).click(function(){
            return false;
        });
    });

    
    $('input.confirm_comment_delete').on('click', function(){
        var updateURL = $(this).attr("rel");
        var deletedCommentString = $('div#comment_list').attr("rel");
        $.ajax({
            url: updateURL,
            data: {
                _method: 'put',
                "comment[text]": deletedCommentString,
                authenticity_token: AUTH_TOKEN // The global variable in the site's header, storing the authenticity token
            },
            type: 'POST',
            dataType: "script",
        });
    });


});
/*

