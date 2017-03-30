/*
 * AutoPager plugin
 * 
 * Data attributes:
 * - data-control="autopager" - enables the plugin on an element
 *
 * JavaScript API:
 * $('a#someElement').autoPager()
 *
 * Usage:

    <div
        data-control="auto-pager"
        data-request="onPageRecords"
        data-request-update="'records': '@#partialRecords'"
        data-current-page="1"
        data-last-page="99">
        Fetching more records...
    </div>
 */

+function ($) { "use strict";

    // AUTOPAGER CLASS DEFINITION
    // ============================

    var AutoPager = function(element, options) {
        this.options   = options
        this.$el       = $(element)

        // Init
        this.init()
    }

    AutoPager.DEFAULTS = { }

    AutoPager.prototype.init = function() {
        // Public properties
        this.$el.on('inview', $.proxy(this.onViewChange, this))
    }

    AutoPager.prototype.onViewChange = function(event, isInView) {
        var $el = this.$el,
            currentPage = $el.data('current-page'),
            lastPage = $el.data('last-page'),
            isComplete = currentPage >= lastPage

        $el.toggle(!isComplete)

        if (isComplete || $el.hasClass('pager-is-loading')) {
            return
        }

        if (isInView) {
            currentPage++
            $el
                .addClass('pager-is-loading')
                .data('request-data', { page: currentPage })
                .request()
                .done(function() {
                    $el
                        .data('current-page', currentPage)
                        .removeClass('pager-is-loading')
                })
        }
    }

    // AUTOPAGER PLUGIN DEFINITION
    // ============================

    var old = $.fn.autoPager

    $.fn.autoPager = function (option) {
        var args = Array.prototype.slice.call(arguments, 1), result
        this.each(function () {
            var $this   = $(this)
            var data    = $this.data('oc.autopager')
            var options = $.extend({}, AutoPager.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.autopager', (data = new AutoPager(this, options)))
            if (typeof option == 'string') result = data[option].apply(data, args)
            if (typeof result != 'undefined') return false
        })
        
        return result ? result : this
    }

    $.fn.autoPager.Constructor = AutoPager

    // AUTOPAGER NO CONFLICT
    // =================

    $.fn.autoPager.noConflict = function () {
        $.fn.autoPager = old
        return this
    }

    // AUTOPAGER DATA-API
    // ===============

    $(document).render(function() {
        $('[data-control="auto-pager"]').autoPager()
    })

}(window.jQuery);


/**
 * Dependency: inview plugin
 *
 * author Christopher Blum
 *    - based on the idea of Remy Sharp, http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 *    - forked from http://github.com/zuk/jquery.inview/
 */
(function (factory) {
    if (typeof define == 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var inviewObjects = [], viewportSize, viewportOffset,
            d = document, w = window, documentElement = d.documentElement, timer;

    $.event.special.inview = {
        add: function(data) {
            inviewObjects.push({ data: data, $element: $(this), element: this });
            // Use setInterval in order to also make sure this captures elements within
            // "overflow:scroll" elements or elements that appeared in the dom tree due to
            // dom manipulation and reflow
            // old: $(window).scroll(checkInView);
            //
            // By the way, iOS (iPad, iPhone, ...) seems to not execute, or at least delays
            // intervals while the user scrolls. Therefore the inview event might fire a bit late there
            //
            // Don't waste cycles with an interval until we get at least one element that
            // has bound to the inview event.
            if (!timer && inviewObjects.length) {
                 timer = setInterval(checkInView, 250);
            }
        },

        remove: function(data) {
            for (var i=0; i<inviewObjects.length; i++) {
                var inviewObject = inviewObjects[i];
                if (inviewObject.element === this && inviewObject.data.guid === data.guid) {
                    inviewObjects.splice(i, 1);
                    break;
                }
            }

            // Clear interval when we no longer have any elements listening
            if (!inviewObjects.length) {
                 clearInterval(timer);
                 timer = null;
            }
        }
    };

    function getViewportSize() {
        var mode, domObject, size = { height: w.innerHeight, width: w.innerWidth };

        // if this is correct then return it. iPad has compat Mode, so will
        // go into check clientHeight/clientWidth (which has the wrong value).
        if (!size.height) {
            mode = d.compatMode;
            if (mode || !$.support.boxModel) { // IE, Gecko
                domObject = mode === 'CSS1Compat' ?
                    documentElement : // Standards
                    d.body; // Quirks
                size = {
                    height: domObject.clientHeight,
                    width:  domObject.clientWidth
                };
            }
        }

        return size;
    }

    function getViewportOffset() {
        return {
            top:  w.pageYOffset || documentElement.scrollTop   || d.body.scrollTop,
            left: w.pageXOffset || documentElement.scrollLeft  || d.body.scrollLeft
        };
    }

    function checkInView() {
        if (!inviewObjects.length) {
            return;
        }

        var i = 0, $elements = $.map(inviewObjects, function(inviewObject) {
            var selector  = inviewObject.data.selector,
                    $element  = inviewObject.$element;
            return selector ? $element.find(selector) : $element;
        });

        viewportSize   = viewportSize   || getViewportSize();
        viewportOffset = viewportOffset || getViewportOffset();

        for (; i<inviewObjects.length; i++) {
            // Ignore elements that are not in the DOM tree
            if (!$.contains(documentElement, $elements[i][0])) {
                continue;
            }

            var $element      = $($elements[i]),
                    elementSize   = { height: $element[0].offsetHeight, width: $element[0].offsetWidth },
                    elementOffset = $element.offset(),
                    inView        = $element.data('inview');

            // Don't ask me why because I haven't figured out yet:
            // viewportOffset and viewportSize are sometimes suddenly null in Firefox 5.
            // Even though it sounds weird:
            // It seems that the execution of this function is interferred by the onresize/onscroll event
            // where viewportOffset and viewportSize are unset
            if (!viewportOffset || !viewportSize) {
                return;
            }

            if (elementOffset.top + elementSize.height > viewportOffset.top &&
                    elementOffset.top < viewportOffset.top + viewportSize.height &&
                    elementOffset.left + elementSize.width > viewportOffset.left &&
                    elementOffset.left < viewportOffset.left + viewportSize.width) {
                if (!inView) {
                    $element.data('inview', true).trigger('inview', [true]);
                }
            } else if (inView) {
                $element.data('inview', false).trigger('inview', [false]);
            }
        }
    }

    $(w).bind("scroll resize scrollstop", function() {
        viewportSize = viewportOffset = null;
    });

    // IE < 9 scrolls to focused elements without firing the "scroll" event
    if (!documentElement.addEventListener && documentElement.attachEvent) {
        documentElement.attachEvent("onfocusin", function() {
            viewportOffset = null;
        });
    }
}));
