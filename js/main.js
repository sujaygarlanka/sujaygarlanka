window.onscroll = function () {
  navbar = document.getElementById("horizontal-inner-navigation");
  floatingNavbar = document.getElementById("horizontal-floating-navigation");
  var bounding = navbar.getBoundingClientRect();
  if (bounding.top < 0) {
    floatingNavbar.classList.remove("hidden");
    console.log("show");
  } else {
    floatingNavbar.classList.add("hidden");
    console.log("hide");
  }
};

window.onload = function () {
  setInterval(function () {
    window.location.href = window.location.hash;
  }, 1000);
}
