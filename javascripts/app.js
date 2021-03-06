(function() {
  var pattern = /\blang(?:uage)?-(\w+)/;

  $.each($('pre'), function(i, el) {
    var $el = $(el);
    if (!$el.hasClass('rainbow-code')) {
      var $code = $($el.find('code'));
      var klass = $code.attr('class');
      if (klass && klass.match(pattern)) {
        var match = $code.attr('class').match(pattern);
        $code.removeClass('language-' + match[1]);
        $code.removeClass('lang-' + match[1]);
        $el.addClass("rainbow-code");
        $code.attr('data-language', match[1]);
      }
    }
  });

  var posts = new Bloodhound({
    datumTokenizer: function(d) {
      return d.tokens;
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      url: '/search.json',
      cache: false
    }
  });
  var compiledTemplate = Hogan.compile([
    '<div>',
    '<p class="result-type">{{type}}</p>',
    '<p class="result-name">{{title}}</p>',
    '<p class="result-description">{{description}}</p>',
    '</div>'
  ].join(''));

  $('.widget_search .typeahead').typeahead(null, {
    name: 'posts',
    displayKey: 'title',
    source: posts,
    templates: {
      suggestion: function(context) {
        return compiledTemplate.render(context)
      }
    }
  });

  $('.widget_search .typeahead').bind('typeahead:selected', function(obj, datum) {
    window.location = datum.url;
  });
  $('.widget_search .typeahead').bind('typeahead:autocompleted', function(obj, datum) {
    window.location = datum.url;
  });

})(jQuery);

// Based on: https://github.com/henrik/octopress/blob/master/source/javascripts/group/octopress2-custom.js
// This file must have a name that comes after "jquery" alphabetically, due to how minification works.

// Make the year headers on the index/tag pages position: fixed sometimes, like iOS table headers.
//
// FIXME:
// * Doesn't properly reset on resizing.

$(function() {
  // Scroll events are funky with touch. Let's not even go there.
  var isTouchDevice = 'ontouchstart' in document.documentElement;
  if (isTouchDevice) return;

  var $container = $(".archives");
  if (!$container.length) return;

  var $headers = $container.find("h2");
  var originalPosition = $headers.css("position");
  var originalTop = $headers.css("top");
  var headerHeight;
  var headerOffsets;
  var lastHeader;
  var containerBottom;

  $(document).scroll(moveHeaders);
  $(window).resize(setUp);
  setUp();

  // Any time the window resizes, we must recalculate the things that change,
  // and re-evaluate what header should be fixed.
  function setUp() {
    headerHeight = $headers.height();
    containerBottom = $container.offset().top + $container.height() - headerHeight;
    headerOffsets = $headers.map(function() {
      return { header: this, offset: $(this).offset().top };
    });
    moveHeaders();
  }

  function headerForX(x) {
    var thisHeader;
    var nextOffset;
    headerOffsets.each(function() {
      if (this.offset < x) {
        thisHeader = this.header;
      } else {
        nextOffset = nextOffset || this.offset;
      }
    });

    if (thisHeader) {
      nextOffset = nextOffset || containerBottom;
      thisHeader.nextOffset = nextOffset;
    }

    return thisHeader;
  }

  function moveHeaders() {
    var pos = $(document).scrollTop();
    var header = headerForX(pos);

    if (lastHeader && lastHeader != header) {
      $(lastHeader).css({ position: originalPosition, top: originalTop, opacity: 1.0 });
      lastHeader = null;
    }

    if (header) {
      var opacity = 1.0;
      var fullAt = header.nextOffset - headerHeight;
      if (pos > fullAt) {
        opacity = 1 - (pos - fullAt) / headerHeight;
      }

      $(header).css({ position: "fixed", top: 0, opacity: opacity });
      lastHeader = header;
    }
  }
});
