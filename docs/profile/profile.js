const themeToggle =
  document.getElementById("theme-toggle") ||
  document.getElementById("theme-btn");
const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;
let currentTheme = localStorage.getItem("theme") || "dark";

// Apply saved theme on page load
document.documentElement.setAttribute("data-theme", currentTheme);
if (themeIcon) {
  themeIcon.classList.toggle("fa-sun", currentTheme === "light");
  themeIcon.classList.toggle("fa-moon", currentTheme !== "light");
}

if (themeToggle) {
  themeToggle.addEventListener("click", (event) => {
    const buttonRect = themeToggle.getBoundingClientRect();
    const buttonX = buttonRect.left + buttonRect.width / 2;
    const buttonY = buttonRect.top + buttonRect.height / 2;
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme, buttonX, buttonY);
  });
}

function setTheme(theme, originX, originY) {
  const root = document.documentElement;
  const transition = document.createElement("div");
  transition.className = "theme-transition";

  // Calculate the origin as percentages
  const originPercentX = (originX / window.innerWidth) * 100;
  const originPercentY = (originY / window.innerHeight) * 100;
  transition.style.setProperty("--origin-x", `${originPercentX}%`);
  transition.style.setProperty("--origin-y", `${originPercentY}%`);

  // Set transition background based on the target theme
  transition.style.backgroundColor =
    theme === "light" ? "var(--bgcolor-light)" : "var(--bgcolor-dark)";

  document.body.appendChild(transition);
  void transition.offsetWidth; // Force reflow

  setTimeout(() => {
    if (theme === "light") {
      root.style.setProperty("--bgcolor", "var(--bgcolor-light)");
      root.style.setProperty("--btncolor", "var(--btncolor-light)");
      root.style.setProperty("--dtext", "var(--dtext-light)");
      root.style.setProperty("--text", "var(--text-light)");
    } else {
      root.style.setProperty("--bgcolor", "var(--bgcolor-dark)");
      root.style.setProperty("--btncolor", "var(--btncolor-dark)");
      root.style.setProperty("--dtext", "var(--dtext-dark)");
      root.style.setProperty("--text", "var(--text-dark)");
    }

    document.documentElement.setAttribute("data-theme", theme);
    if (themeIcon) {
      themeIcon.classList.toggle("fa-sun", theme === "light");
      themeIcon.classList.toggle("fa-moon", theme !== "light");
    }
    currentTheme = theme;
    localStorage.setItem("theme", theme);
    transition.classList.add("out");
    setTimeout(() => {
      transition.remove();
    }, 600);
  }, 300); // Half the animation duration
}
