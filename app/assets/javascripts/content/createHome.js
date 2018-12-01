var slides;
var slideInterval;
var page = 0;
var numberOfPages = 3;

function createHome() {
	slides = setInterval("eyecatcher_slide(0, false)", 5000);
};

function eyecatcher_slide(toPage, stop) {
	// Falls gerade eine Slide läuft
	clearInterval(slideInterval);
	
	// Variablen
	var slider = $("div#eyecatcher_slider");
	var start = -slider.width()/numberOfPages*page
	if (stop) {
		page = toPage;
		clearInterval(slides);
	} else {
		page = (page+1) % numberOfPages;
	}
	var end = -slider.width()/numberOfPages*page;
	var steps = 40;
	
	// Slider verschieben
	slide(slider,start,end,steps,page);
	
	// Seitenzahl markieren
	$("a.slidepoint").removeClass("active");
	$("a#slidepoint_"+page).addClass("active");	
};

function slide(slider,start,end,steps,page) {
	var stepsize = Math.round((end-start)/steps);
	var i = 1;
	
	slideInterval = setInterval(
		function() {
			old = parseInt(slider.css("margin-left").slice(0,-2));
			slider.css("margin-left", old + stepsize);
			if (i++ == steps) {
				clearInterval(slideInterval);
				// Sicherheit
				slider.css("margin-left", -slider.width()/numberOfPages*page);
			}
		}, 10
	);
}