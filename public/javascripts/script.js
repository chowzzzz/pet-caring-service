$(document).on("scroll", function () {
	var scrollDistance = $(this).scrollTop();
	if (scrollDistance > 100) {
		$(".scroll-to-top").fadeIn();
	} else {
		$(".scroll-to-top").fadeOut();
	}
});

// Smooth scrolling using jQuery easing
$(document).on("click", "a.scroll-to-top", function (e) {
	var $anchor = $(this);
	$("html, body")
		.stop()
		.animate(
			{
				scrollTop: $($anchor.attr("href")).offset().top
			},
			1000,
			"easeInOutExpo"
		);
	e.preventDefault();
});
