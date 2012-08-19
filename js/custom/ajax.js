var sendMail = function(){
	var isValid = true;
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if(!emailReg.test($('div.popup #email').val())){
        isValid = false;
        alert('Your email is not in valid format');
    }
    if(isValid){
		var params = {
			'action'    : 'SendMessage',
			'name'      : $('div.popup #name').val(),
			'email'     : $('div.popup #email').val(),
			'subject'   : $('div.popup #subject').val(),
			'message'   : $('div.popup #message').val()
		};
		$.ajax({
			type: "POST",
			url: "php/mainHandler.php",
			data: params,
			success: function(response){
				if(response){
					var responseObj = jQuery.parseJSON(response);
					if(responseObj.ResponseData)
						alert(responseObj.ResponseData);
				}
				ResetInput();
				$('#submitButton').removeAttr('disabled');
				ClosePopupWindow();
			},
			error: function (xhr, ajaxOptions, thrownError){
				//xhr.status : 404, 303, 501...
				var error = null;
				switch(xhr.status)
				{
					case "301":
						error = "Redirection Error!";
						break;
					case "307":
						error = "Error, temporary server redirection!";
						break;
					case "400":
						error = "Bad request!";
						break;
					case "404":
						error = "Page not found!";
						break;
					case "500":
						error = "Server is currently unavailable!";
						break;
					default:
						error ="Unespected error, please try again later.";
				}
				if(error){
					alert(error);
				}
			}
		});
	};
};

var subscribe = function()
{
	var inputEmail = $('div.popup input#subscriberEmail').val();
    var isValid = true;
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if(!emailReg.test(inputEmail)){
        isValid = false;
        alert('Your email is not in valid format');
    }
    if(isValid){
        var params = {
            'action'    : 'Subscribe',
            'email'     : inputEmail
        };
        $.ajax({
            type: "POST",
            url: "php/mainHandler.php",
            data: params,
            success: function(response){
                if(response){
                    var responseObj = jQuery.parseJSON(response);
                    if(responseObj.ResponseData)
                    {
                        $('#subscribe').val('');
						alert('You will be notified when we launch. Thank you!');
						ClosePopupWindow();
                    }
                }
            }
        });
    }
};