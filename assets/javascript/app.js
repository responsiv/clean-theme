/*
 * Application
 */

$(document).tooltip({
    selector: "[data-toggle=tooltip]"
})

function toggleSidebar() {
    $('#layout-sidebar').toggleClass('in')
}
