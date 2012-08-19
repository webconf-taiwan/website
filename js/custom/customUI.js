var addEvents = function()
{
	$('.floating-rocket').everyTime(10, function () {
			$(".floating-rocket").animate({
				marginTop: "+=10",
				marginLeft: "+=5"
			}, 1000, 'linear').animate({
				marginTop: "-=10",
				marginLeft: "-=5"
			}, 1000, 'linear');
	});

	$('ul.button-items li').hover(function(){
        $('.tooltip').show();
        $('.tooltip p').text($(this).find('img').attr('alt'));
		$('.tooltip p').vAlign();
        $(this).find('img').css({
            'margin-top':'-129px'
        });
    }, function() {
        $(this).find('img').css({
            'margin-top':'0px'
        });
        $('.tooltip').hide();
    });

    $('ul.social li').hover(function(){
        $(this).find('img').css({
            'margin-top':'-23px'
        });
    }, function() {
        $(this).find('img').css({
            'margin-top':'0px'
        });
    });

    $('ul.button-items li').mousemove(function(event) {
        $('.tooltip').css({
            'left':event.pageX-79
        });
    });
	
	 $(document).bind('reveal.facebox', function() {
        $('div.popup input#subscriberEmail.left').attachHint('Enter your email here to subscribe!');
        
        $('div.popup #name').attachHint('Your name:');
        $('div.popup #email').attachHint('E-mail address:');
        $('div.popup #subject').attachHint('Subject:');
        $('div.popup #message').attachHint('Message:');
    });
	
	jQuery('a[rel*=facebox]').facebox({
		opacity : 0.9
	});
}

var ClosePopupWindow = function()
{
	jQuery(document).trigger('close.facebox');
}

	

	
