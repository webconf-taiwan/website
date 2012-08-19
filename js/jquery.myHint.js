//jQuery hint plugin - written by Vladica Savic - www.vladicasavic.iz.rs
(function($){
    $.fn.attachHint = function(hintText) {
        return this.each(function() {
            var input = $(this);
            function clearHint(){
                if(input.val()==hintText)
                    input.val("");
            }

            function setHint(){
                if(input.val().length==0 || input.val()==hintText){
                    input.val(hintText);
                }
            }

            input.focus(clearHint);
            input.blur(setHint);
            input.change(setHint);

            setHint();
        });
    };
})(jQuery);  