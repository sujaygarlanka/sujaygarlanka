window.onload = (event) => {
  window.setTimeout(function () {
    goToTab();
  }, 500);
};

function goToTab() {
  var someTabTriggerEl = document.querySelector(window.location.hash);
  var tab = new bootstrap.Tab(someTabTriggerEl)
  tab.show()
}

feather.replace()