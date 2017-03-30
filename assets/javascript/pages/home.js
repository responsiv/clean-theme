
function initIsotope() {
    var $posts = $('#homePosts'),
        scrollTop = $(window).scrollTop()

    if ($posts.data('isotope')) {
        $posts.isotope('destroy')
    }

    $posts.isotope({
        itemSelector: '.home-post',
    }).imagesLoaded().progress(function() {
        $posts.isotope('layout');
    })

    $(window).scrollTop(scrollTop)
}

$(document).render(initIsotope)
