
function initIsotope() {
    var $posts = $('#homePosts')

    if ($posts.data('isotope')) {
        $posts.isotope('destroy')
    }

    $posts.isotope({
        itemSelector: '.home-post',
    }).imagesLoaded().progress(function() {
        $posts.isotope('layout');
    })
}

$(document).render(initIsotope)
