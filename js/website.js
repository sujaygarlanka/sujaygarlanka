function navigate(destination) {
  window.location.href = destination;
}

function loadMode() {
  if (localStorage.getItem("darkMode") == 1) {
    darkMode();
  } else {
    lightMode();
  }
}

function toggleMode() {
  if (localStorage.getItem("darkMode") == 1) {
    lightMode();
  } else {
    darkMode();
  }
}

function lightMode() {
  localStorage.setItem("darkMode", 0);
  let root = document.documentElement;
  root.style.setProperty("--background-color", "var(--light-background-color");
  root.style.setProperty("--text-color", "var(--light-text-color");
  root.style.setProperty("--video-shadow", "var(--light-video-shadow");
  root.style.setProperty("--mobile-shadow", "var(--light-mobile-shadow");
  if (document.getElementById("dark-mode-icon") != null) {
    document.getElementById("dark-mode-icon").className = "fa fa-moon-o";
  }
}

function darkMode() {
  localStorage.setItem("darkMode", 1);
  let root = document.documentElement;
  root.style.setProperty("--background-color", "var(--dark-background-color");
  root.style.setProperty("--text-color", "var(--dark-text-color");
  root.style.setProperty("--video-shadow", "var(--dark-video-shadow");
  root.style.setProperty("--mobile-shadow", "var(--dark-mobile-shadow");
  console.log(document.getElementById("dark-mode-icon"));
  if (document.getElementById("dark-mode-icon") != null) {
    document.getElementById("dark-mode-icon").className = "fa fa-sun-o";
  }
}

// Load when before page loads to get correct background color
loadMode();

// Load once page loads to change dark mode icon
window.addEventListener('DOMContentLoaded', (event) => {
  loadMode();
});
