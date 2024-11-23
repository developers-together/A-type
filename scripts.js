// Select all time buttons, words buttons, and buttons3 containers
const timeButtons = document.querySelectorAll(".time-button");
const wordsButtons = document.querySelectorAll(".words-button");
const buttonGroups = document.querySelectorAll(".buttons3");

// Define the options for each mode
const timeOptions = [15, 30, 60, 120];
const wordOptions = [10, 25, 50, 100];

// Helper function to find the nearest `.buttons3` container
function findButtons3Container(button) {
  return button.closest(".controls").querySelector(".buttons3");
}

// Function to update the text content of existing buttons
function updateButtonContent(buttonGroup, options) {
  const buttons = buttonGroup.querySelectorAll("button"); // Select all buttons inside buttonGroup
  buttons.forEach((button, index) => {
    if (index < options.length) {
      button.textContent = options[index]; // Set the text content from options
      button.style.display = ""; // Ensure the button is visible
    } else {
      button.style.display = "none"; // Hide extra buttons if not needed
    }
  });
}

// Add event listeners to time buttons
timeButtons.forEach((timeButton) => {
  timeButton.addEventListener("click", () => {
    const buttonGroup = findButtons3Container(timeButton);
    updateButtonContent(buttonGroup, timeOptions);
  });
});

// Add event listeners to words buttons
wordsButtons.forEach((wordsButton) => {
  wordsButton.addEventListener("click", () => {
    const buttonGroup = findButtons3Container(wordsButton);
    updateButtonContent(buttonGroup, wordOptions);
  });
});
