window.onscroll = function () {
  navbar = document.getElementById("horizontal-inner-navigation");
  floatingNavbar = document.getElementById("horizontal-floating-navigation");
  var bounding = navbar.getBoundingClientRect();
  if (bounding.top < 0) {
    floatingNavbar.classList.remove("hidden");
  } else {
    floatingNavbar.classList.add("hidden");
  }
};

window.onload = function () {
  var intervalId = setInterval(function () {
    window.location.href = window.location.hash;
    clearInterval(intervalId);
  }, 1000);
}
