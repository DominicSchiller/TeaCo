/*
 * Contains methods to display errors on screen.
 */

function displayErrors(errors) {
  var errorDiv = '<div id="errors">' + errors + '</div>';
  if ($('#errors').length > 0) {
    $('#errors').replaceWith(errorDiv);
  } else {
    $('body').prepend(errorDiv);
  }
}

$(document).ready(function() {
	$('#errors').on(function() {
		$('#errors').slideDown(250);
		setTimeout(function(){
			$('#errors').slideUp(250, function () { $('#errors').remove(); });
		},5000);
	});
	
	$('#errors').on('click', function() {
		$('#errors').slideUp(250, function () {
			$('#errors').remove();
		});
	});	
});