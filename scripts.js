import { words } from "./words.js";
const wordCount = words.length;

let wIndex = 0;
let lIndex = 0;
let wordSizes = [];
let allLetters = [];
let allWords = [];
<<<<<<< Updated upstream
=======
let lettersInWord = 0;
let cursorTimeout;

>>>>>>> Stashed changes
document.onkeydown = function (key) {
  console.log(key.key);
  let letter = allLetters[lIndex];
<<<<<<< Updated upstream
  if (key.key == "Tab") {
=======
  let cursor = document.getElementById("cursor");
  const letterRect = letter.getBoundingClientRect();
  if (key.key == "Tab") {
    //quick reset
>>>>>>> Stashed changes
    key.preventDefault();
    newGame();
  } else if (key.key == "Alt") {
    key.preventDefault();
  } else if (key.key == "Backspace") {
<<<<<<< Updated upstream
    // else{
    lIndex = Math.max(lIndex - 1, 0);
    letter = allLetters[lIndex];
    letter.style.color = "white";
    // }
  } else if (key.key.length == 1 && key.key != " ") {
    if (lIndex == wordSizes[wIndex]) {
      let textArea = document.getElementById("words");
      let newSpan = document.createElement("span");
      newSpan.classList.add("bad");
      newSpan.textContent = key.key;
      newSpan.style.color = "red";
      // allLetters.splice(lIndex, 0, newSpan);
      wordSizes[wIndex]++;
      allWords[wIndex].appendChild(newSpan);
      lIndex--;
      wIndex++;
    } else if (letter.textContent == key.key) {
      letter.style.color = "green";
    } else {
      letter.style.color = "red";
    }
    lIndex++;
  } else if (key.key == " " && lIndex != 0 && lIndex != wordSizes[wIndex - 1]) {
    allWords[wIndex].style.textDecoration = "underline";
    lIndex = wordSizes[wIndex];
    wIndex++;
  }
=======
    //backspace
    lettersInWord--;
    cursor.classList.add("no-blink");
    lIndex = Math.max(lIndex - 1, 0);
    if (allLetters[lIndex].classList.contains("extra")) {
      allLetters[lIndex].remove();
      allLetters.splice(lIndex, 1);
    }
    cursorIndex--;
    letter = allLetters[lIndex];
    letter.classList.remove("correct");
    letter.classList.remove("incorrect");
    if (lIndex == prefixWordSizes[wIndex - 1] - 1) {
      allWords[wIndex - 1].style.textDecoration = "none";
      wIndex--;
    }
  } else if (key.key.length == 1 && key.key != " ") {
    //letter
    if (lIndex == allLetters.length - 1) {
      newGame(); //make it go to stats screen instead
      return;
    }
    if (Math.max(lettersInWord - wordSizes[wIndex], 0) == 18) {
      return;
    }
    //move cursor
    if (lettersInWord + 1 == wordSizes[wIndex]) {
      cursorRight = 1;
    } else if (lettersInWord + 1 > wordSizes[wIndex]) {
      cursorIndex++;
      cursorRight = 1;
    } else {
      cursorIndex++;
      cursorRight = 0;
    }

    lettersInWord++;
    cursor.classList.add("no-blink");

    if (lettersInWord > wordSizes[wIndex]) {
      //extra letter
      let textArea = document.getElementById("words");
      let newSpan = document.createElement("span");
      newSpan.classList.add("incorrect");
      newSpan.classList.add("incorrect", "extra");
      newSpan.textContent = key.key;

      allWords[wIndex].appendChild(newSpan);
      allLetters.splice(lIndex, 0, newSpan);
    } else if (letter.textContent == key.key) {
      letter.classList.add("correct");
      letter.classList.remove("incorrect");
    } else {
      letter.classList.add("incorrect");
      letter.classList.remove("correct");
    }
    //deciding where the first letter of the next word is
    let extraLetters = Math.max(lettersInWord - wordSizes[wIndex], 0);
    if (wIndex > 0)
      prefixWordSizes[wIndex] = prefixWordSizes[wIndex - 1] + wordSizes[wIndex];
    else prefixWordSizes[wIndex] = wordSizes[0];
    prefixWordSizes[wIndex] += extraLetters;

    lIndex++;
  } else if (
    key.key == " " &&
    lIndex != 0 &&
    lIndex != prefixWordSizes[wIndex - 1]
  ) {
    //space
    cursor.classList.add("no-blink");
    if (wIndex == allWords.length - 1) {
      newGame(); //make it go to stats screen instead
      return;
    }
    cursorRight = 0;
    allWords[wIndex].style.textDecoration = "underline";
    lIndex = prefixWordSizes[wIndex];
    cursorIndex = lIndex;
    lettersInWord = 0;
    wIndex++;
  }
  clearTimeout(cursorTimeout);
  cursorTimeout = setTimeout(() => {
    cursor.classList.remove("no-blink");
  }, 1000);
>>>>>>> Stashed changes
};
function formatWord(word) {
  return `<div class="word">
    <span class="letter">${word
      .split("")
      .join('</span><span class="letter">')}</span>
    </div>`;
}
function randomWord() {
  const randInd = Math.ceil(Math.random() * wordCount - 1);
  return words[randInd];
}
function renderWords(wordNum) {
  const wordSpan = document.getElementById("words");
  for (let i = 0; i < wordNum; i++) {
    let chosenWord = randomWord();
<<<<<<< Updated upstream
    if (i != 0) wordSizes[i] = chosenWord.length + wordSizes[i - 1];
    else wordSizes[i] = chosenWord.length;
=======
    wordSizes[i] = chosenWord.length;
>>>>>>> Stashed changes
    wordSpan.innerHTML += formatWord(chosenWord);
  }
}
function newGame() {
<<<<<<< Updated upstream
=======
  wordsAnimation();
  cursorIndex = 0;
  cursorRight = 0;
  lettersInWord = 0;
>>>>>>> Stashed changes
  lIndex = 0;
  wIndex = 0;
  let wordSpan = document.getElementById("words");
  wordSpan.innerHTML = "";
<<<<<<< Updated upstream
  renderWords(50);
  allLetters = wordSpan.querySelectorAll("span");
=======

  // Rendering new words
  renderWords(currentWordsCount);

  allLetters = Array.from(wordSpan.querySelectorAll("span"));
>>>>>>> Stashed changes
  allWords = wordSpan.querySelectorAll("div");
}
<<<<<<< Updated upstream
=======

function moveCursor() {
  // console.log(cursorIndex);
  let cursor = document.getElementById("cursor");
  cursor.hidden = false;
  let letter = allLetters[cursorIndex];

  if (!letter) return; // Avoid errors if `lIndex` is out of range

  const letterRect = letter.getBoundingClientRect();
  const wordsRect = document.getElementById("words").getBoundingClientRect();

  // Calculate position relative to #words
  const offsetLeft = letterRect.left - wordsRect.left;
  const offsetTop = letterRect.top - wordsRect.top;
  let prevLetter = allLetters[cursorIndex];
  let prevLetterRect = prevLetter.getBoundingClientRect();
  let offsetRight = prevLetterRect.right - wordsRect.left;

  // Update cursor size and position
  cursor.style.height = `${letterRect.height}px`;
  cursor.style.top = `${offsetTop}px`;

  if (cursorRight) {
    cursor.style.left = `${offsetRight}px`;
  } else cursor.style.left = `${offsetLeft - 1}px`;
}

let lastZoom = window.devicePixelRatio;
window.addEventListener("resize", () => {
  if (window.devicePixelRatio !== lastZoom) {
    lastZoom = window.devicePixelRatio;
    let cursor = document.getElementById("cursor");
    cursor.hidden = true;
  }
});

function wordsAnimation() {
  let typingLines = document.getElementById("words");
  typingLines.classList.add("fade");
  setTimeout(() => {
    typingLines.classList.remove("fade");
  }, 500);
}

setInterval(moveCursor, 0);
>>>>>>> Stashed changes
newGame();
const reset = (document.getElementById("reset-button").onclick = newGame);
<<<<<<< Updated upstream

// the reset button rotation activity
=======
>>>>>>> Stashed changes
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
  resetButton.classList.add("rotate-animation");

  setTimeout(() => {
    resetButton.classList.remove("rotate-animation");
  }, 500);
});
<<<<<<< Updated upstream
=======

const timeButton = document.getElementById("time-button");
const wordsButton = document.getElementById("words-button");

const message1 = document.querySelector(".num1");
const message2 = document.querySelector(".num2");
const message3 = document.querySelector(".num3");
const message4 = document.querySelector(".num4");

function activateButton(activeButton, inactiveButton) {
  activeButton.classList.add("active");
  inactiveButton.classList.remove("active");
}

window.addEventListener("load", () => {
  activateButton(timeButton, wordsButton);
  message1.textContent = "15s";
  message2.textContent = "30s";
  message3.textContent = "60s";
  message4.textContent = "120s";
});

timeButton.addEventListener("click", () => {
  activateButton(timeButton, wordsButton);
  message1.textContent = "15";
  message2.textContent = "30";
  message3.textContent = "60";
  message4.textContent = "120";
});

wordsButton.addEventListener("click", () => {
  activateButton(wordsButton, timeButton);
  message1.textContent = "10";
  message2.textContent = "25";
  message3.textContent = "50";
  message4.textContent = "100";
});
>>>>>>> Stashed changes
