$( document ).ready(function() {
  goToTab();
});

function goToTab() {
  // var someTabTriggerEl = document.querySelector(window.location.hash);
  var tabs = $( ".drink" );
  tabs[0].click();
  tabs[1].click();
  var tab = new bootstrap.Tab(someTabTriggerEl);
  console.log(tab)
  tab.show();
}
