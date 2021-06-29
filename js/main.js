window.onload = (event) => {
  window.setTimeout(function () {
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