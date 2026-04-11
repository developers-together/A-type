export function initInfo() {
  const collapsibleButtons = document.querySelectorAll(".collapsible-btn");

  if (collapsibleButtons.length > 0) {
    collapsibleButtons.forEach((btn) => {
      // Remove old listeners to be safe (though not strictly necessary if page reloads)
      // Actually, we can't easily remove anonymous functions.
      // But since this runs once on load, it's fine.
      
      btn.addEventListener("click", () => {
        const targetSelector = btn.getAttribute("data-target");
        const target = document.querySelector(targetSelector);
        if (target) {
          target.classList.toggle("hidden");
        }
      });
    });
  }
}
