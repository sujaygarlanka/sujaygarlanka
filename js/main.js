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

window.setTimeout(function () {
  document.querySelector(window.location.hash).scrollIntoView({
    behavior: 'smooth'
});
}, 1000);
