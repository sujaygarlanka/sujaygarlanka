$(document).ready(function () {
    goToTab();
});

function goToTab() {
    var someTabTriggerEl = document.querySelector(window.location.hash);
    var tab = new bootstrap.Tab(someTabTriggerEl);
    tab.show();
}
