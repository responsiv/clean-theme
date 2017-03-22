$(document).ready(function(){

    $('#homePosts').isotope({
        itemSelector: '.home-post',
    })

});

// This is an attempt to get isotope to redraw after all the
// images on the page have finished loading.

$(window).load(function() {
    $(window).trigger('resize')
});
