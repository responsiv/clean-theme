$(document).ready(function(){

    var $posts = $('#homePosts')

    $posts.isotope({
        itemSelector: '.home-post',
    }).imagesLoaded().progress( function() {
        $posts.isotope('layout');
    })

});
