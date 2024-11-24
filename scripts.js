// document.addEventListener("DOMContentLoaded", () => {
//   const timeButton = document.querySelector(".time-button");
//   const wordsButton = document.querySelector(".words-button");
//   const valueButtons = document.querySelectorAll(".controls .words"); // Buttons for values (Button 3)

//   let mode = "time"; // Default mode

//   // Define the values for each mode
//   const values = {
//     time: [15, 30, 60, 120], // Updated Time values
//     words: [25, 50, 75, 100], // Words values
//   };

//   // Function to update button values
//   function updateValues() {
//     const newValues = values[mode];
//     valueButtons.forEach((button, index) => {
//       button.textContent = newValues[index];
//     });
//   }

//   // Event listeners for mode toggle
//   timeButton.addEventListener("click", () => {
//     mode = "time";
//     updateValues();
//   });

//   wordsButton.addEventListener("click", () => {
//     mode = "words";
//     updateValues();
//   });

//   // Make sure the words button is visible
//   wordsButton.style.display = "inline-block";

//   // Initialize with default mode
//   updateValues();
// });
