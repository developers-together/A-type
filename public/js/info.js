document.addEventListener("DOMContentLoaded", () => {
    const collapsibleButtons = document.querySelectorAll(".collapsible-btn");

    collapsibleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetSelector = btn.getAttribute("data-target");
        const target = document.querySelector(targetSelector);
        if (target) {
          target.classList.toggle("hidden");
        }
      });
    });
  });
