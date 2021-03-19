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

window.onload = (event) => {
  window.setTimeout(function () {
    setScrollForLinks();
    scrollToSection();
  }, 700);
};

function scrollToSection() {
  $("html, body").animate(
    {
      scrollTop: $(window.location.hash).offset().top,
    },
    500
  );
}

function setScrollForLinks() {
  // Add smooth scrolling to all links
  $("a").on("click", function (event) {
    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
      $("html, body").animate(
        {
          scrollTop: $(hash).offset().top,
        },
        500,
        function () {
          // Add hash (#) to URL when done scrolling (default click behavior)
          window.location.hash = hash;
        }
      );
    } // End if
  });
}
