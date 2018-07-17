$(document).ready(function() {
	
	// Create rotational function which will perform a custom animation of a set of 
	// CSS properties via properties, duration, easing complete values
	$.fn.animateRotate = function(angle, duration, easing, complete) {
		var args = $.speed(duration, easing, complete);
		var step = args.step;
		return this.each(function(i, e) {
			args.complete = $.proxy(args.complete, e);
			args.step = function(now) {
				$.style(e, 'transform', 'rotate(' + now + 'deg)');
				if (step) return step.apply(e, arguments);
			};
			$({
				deg: 0
			}).animate({
				deg: angle
			}, args);
		});
	};

	// When the mainlink and nextlink class gets clicked 
	// they will both execute the animateRotate function
	// The function will first fade out the text in the 
	// main page and makes the object shrink
	$("#main-page").css("background-color", "#B8B8B8");
	$("#main-page").css("height", "100vh");
	$("#main-page").css("width", "100%");
	$("#main-page").fadeIn();
	$(".maincontent").fadeIn();
	$(".mainlink").on("click", function() {
		$(".maincontent").fadeOut();
		$("#main-page").animate({
			width: "25px",
			height: "375px"
		}, function() {
			$(this).animateRotate(90);
		});

		setTimeout(function() {
			$("#main-page").fadeOut();
		}, 1500);

		setTimeout(function() {
			$("#next-page").animateRotate(0, 0);
			$("#next-page").css("height", "25px");
			$("#next-page").css("width", "375px");
			$("#next-page").fadeIn();
			$("#next-page").animate({
				backgroundColor: "white"
			}, function() {
				$(this).animate({
					height: "100vh"
				}, function() {
					$(this).animate({
						width: "100%"
					}, function() {
						$(".nextcontent").fadeIn(300);
					});
				});
			});
		}, 800);
	});

	$(".nextlink").on("click", function() {
		$(".nextcontent").fadeOut();
		$("#next-page").animate({
			width: "25px",
			height: "375px"
		}, function() {
			$(this).animateRotate(-90);
		});

		setTimeout(function() {
			$("#next-page").fadeOut();
		}, 1500);

		setTimeout(function() {
			$("#main-page").animateRotate(0, 0);
			$("#main-page").css("height", "25px");
			$("#main-page").css("width", "375px");
			$("#main-page").fadeIn();
			$("#main-page").animate({
				height: "100vh"
			}, function() {
				$(this).animate({
					width: "100%"
				}, function() {
					$(".maincontent").fadeIn(300);
				});
			});

		}, 1400);
	});
});