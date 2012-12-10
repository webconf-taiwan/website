(function() {

  jQuery("html").removeClass("no-js").addClass("js");

  jQuery(document).ready(function($) {
    $('.popup').each(function() {
      return $(this).qtip({
        content: {
          text: $(this).find('a')
        },
        position: {
          my: 'bottom center',
          at: 'top center',
          target: $(this)
        },
        style: {
          classes: 'ui-tooltip-light ui-tooltip-rounded'
        }
      });
    });
    if ($.browser.msie && $.browser.version.substr(0, 1) < 7) {
      if ($.browser.version.substr(0, 1) !== 1) {
        alert('請用新版瀏覽器 :-)');
      }
    }
    $('#speaker-list').imagesLoaded(function() {
      $('#speaker-list').masonry({
        itemSelector: '.team-member',
        isAnimated: true,
        animationOptions: {
          duration: 750,
          easing: 'linear',
          queue: false
        },
        columnWidth: $('#speaker-list').width() / 6
      });
      return $(window).smartresize(function() {
        return $('#speaker-list').masonry({
          columnWidth: $('#speaker-list').width() / 6
        });
      });
    });
    (function() {
      if (Modernizr.touch) {
        return $("body").addClass("touch-device");
      }
    })();
    (function() {
      var $mainNav, optionsList;
      $mainNav = $("#main-nav").children("ul");
      optionsList = "<option value=\"\" selected>請選擇頁面...</option>";
      $mainNav.on("mouseenter", "li", function() {
        var $subMenu, $this;
        $this = $(this);
        $subMenu = $this.children("ul");
        if ($subMenu.length) {
          $this.addClass("hover");
        }
        return $subMenu.hide().stop(true, true).fadeIn(200);
      }).on("mouseleave", "li", function() {
        return $(this).removeClass("hover").children("ul").stop(true, true).fadeOut(50);
      });
      $mainNav.find("li").each(function() {
        var $anchor, $this, depth, indent;
        $this = $(this);
        $anchor = $this.children("a");
        depth = $this.parents("ul").length - 1;
        indent = "";
        if (depth) {
          while (depth > 0) {
            indent += " - ";
            depth--;
          }
        }
        return optionsList += "<option value=\"" + $anchor.attr("href") + "\">" + indent + " " + $anchor.text() + "</option>";
      }).end().after("<select class=\"responsive-nav\">" + optionsList + "</select>");
      return $(".responsive-nav").on("change", function() {
        return window.location = $(this).val();
      });
    })();
    (function() {
      var setMinHeight;
      setMinHeight = function() {
        return $("#content").css("min-height", $(window).outerHeight(true) - ($("body").outerHeight(true) - $("body").height()) - $("#header").outerHeight(true) - ($("#content").outerHeight(true) - $("#content").height()) + ($(".page-title").length ? Math.abs(parseInt($(".page-title").css("margin-top"))) : 0) - $("#footer").outerHeight(true) - $("#footer-bottom").outerHeight(true));
      };
      setMinHeight();
      return $(window).on("resize", function() {
        var timer;
        return timer = window.setTimeout(function() {
          window.clearTimeout(timer);
          return setMinHeight();
        }, 30);
      });
    })();
    return (function() {
      var oldAndroid, oldiOS, settings;
      settings = {
        button: "#back-to-top",
        text: "Back to Top",
        min: 200,
        fadeIn: 400,
        fadeOut: 400,
        scrollSpeed: 800,
        easingType: "easeInOutExpo"
      };
      oldiOS = false;
      oldAndroid = false;
      if (/(iPhone|iPod|iPad)\sOS\s[0-4][_\d]+/i.test(navigator.userAgent)) {
        oldiOS = true;
      }
      if (/Android\s+([0-2][\.\d]+)/i.test(navigator.userAgent)) {
        oldAndroid = true;
      }
      $("body").append("<a href=\"#\" id=\"" + settings.button.substring(1) + "\" title=\"" + settings.text + "\">" + settings.text + "</a>");
      $(settings.button).click(function(e) {
        $("html, body").animate({
          scrollTop: 0
        }, settings.scrollSpeed, settings.easingType);
        return e.preventDefault();
      });
      return $(window).scroll(function() {
        var position;
        position = $(window).scrollTop();
        if (oldiOS || oldAndroid) {
          $(settings.button).css({
            position: "absolute",
            top: position + $(window).height()
          });
        }
        if (position > settings.min) {
          return $(settings.button).fadeIn(settings.fadeIn);
        } else {
          return $(settings.button).fadeOut(settings.fadeOut);
        }
      });
    })();
  });

}).call(this);
