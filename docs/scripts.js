import { words } from "/data/words.js";
const wordCount = words.length;

let cursorTimeout;
let timerNum = 15;
let wordNum = 10;
let timerOn = 0;
let currentWord;
let currentLetter;
let lastLetter;
const timeButton = document.getElementById("time-button");

let currentTimerValue = timerNum;
let countdownInterval;

let wpm = 0;
let accuracy = 0;
let correct = 0;
let incorrect = 0;
let extra = 0;
let missed = 0;
let time = 0;

let typed = 0;
let totalLetters = 0;
let rawWpm = 0;
let startTime = 0;
let endTime = 0;

let backButton = document.getElementById("back-button");
backButton.addEventListener("click", () => {
  newGame();
});
document.onkeydown = function (key) {
  if (key.ctrlKey || key.metaKey) return;
  if (key.key == "Tab") {
    //quick reset
    key.preventDefault();
    newGame();
  } else if (key.key == "Alt") {
    key.preventDefault();
  } else if (key.key == "Backspace") {
    //backspace
    cursor.classList.add("no-blink");
    let prevLetter = currentLetter.previousElementSibling;
    let prevWord = currentWord.previousElementSibling;
    let typedLetters = parseInt(currentWord.getAttribute("typedletters")) - 1;
    if (!prevWord && !prevLetter && currentWord.children.length != 1) return;

    if (currentLetter.classList.contains("extra")) {
      // extra letter
      currentLetter.remove();
      currentLetter = prevLetter;
      currentWord.setAttribute("typedletters", typedLetters);
    } else if (
      currentLetter == currentWord.lastElementChild &&
      (currentLetter.classList.contains("correct") ||
        currentLetter.classList.contains("incorrect"))
    ) {
      //when last letter in word and already typed
      currentLetter.classList.remove("correct");
      currentLetter.classList.remove("incorrect");
      currentWord.setAttribute("typedletters", typedLetters);
    } else if (!prevLetter && prevWord) {
      //when first letter in word and there is a previous word
      let prevWordLetters = prevWord.getAttribute("typedletters");
      if (prevWordLetters == prevWord.children.length) {
        currentLetter = prevWord.lastElementChild;
      } else currentLetter = prevWord.children[prevWordLetters];
      currentWord = prevWord;
    } else {
      try {
        prevLetter.classList.remove("correct");
        prevLetter.classList.remove("incorrect");
        currentLetter = prevLetter;
        currentWord.setAttribute("typedletters", typedLetters);
      } catch {}
    }
  } else if (key.key.length == 1 && key.key != " ") {
    //letter
    let originalWordSize = currentWord.getAttribute("size");
    let typedLetters = parseInt(currentWord.getAttribute("typedletters")) + 1;
    if (Math.max(typedLetters - originalWordSize, 0) == 18) {
      // if extra letters more than 18 don't do anything
      return;
    }

    currentWord.setAttribute("typedletters", typedLetters);
    if (timerOn == 0 && timeButton.classList.contains("active")) {
      startTime = Date.now();
      startCountdown(timerNum);
      timerOn = 1;
    } else if (timerOn == 0) {
      startTime = Date.now();
      timerOn = 1;
    }
    cursor.classList.add("no-blink");

    if (typedLetters > originalWordSize) {
      //extra letter
      let newSpan = document.createElement("span");
      newSpan.classList.add("incorrect", "extra");
      newSpan.textContent = key.key;
      currentWord.appendChild(newSpan);
    } else if (currentLetter.textContent == key.key) {
      currentLetter.classList.add("correct");
      currentLetter.classList.remove("incorrect");
    } else {
      currentLetter.classList.add("incorrect");
      currentLetter.classList.remove("correct");
    }
    if (currentLetter == lastLetter) {
      newGame(); //make it go to stats screen instead
      statsScreen();
      return;
    }
    let nextLetter = currentLetter.nextElementSibling;
    if (nextLetter) {
      currentLetter = nextLetter;
    }
  } else if (key.key == " ") {
    //space
    key.preventDefault();
    cursor.classList.add("no-blink");
    if (
      currentWord.children.length == 1 &&
      (currentLetter.classList.contains("correct") ||
        currentLetter.classList.contains("incorrect"))
    ) {
      currentWord = currentWord.nextElementSibling;
      currentLetter = currentWord.firstElementChild;
    } else if (currentLetter == currentWord.firstElementChild) return;
    else if (currentWord == lastLetter.parentElement) {
      newGame(); //make it go to stats screen instead
      statsScreen();
      return;
    } else {
      currentWord = currentWord.nextElementSibling;
      currentLetter = currentWord.firstElementChild;
    }
    // currentWord.style.textDecoration = "underline";
  }
  clearTimeout(cursorTimeout);
  cursorTimeout = setTimeout(() => {
    cursor.classList.remove("no-blink");
  }, 1000);
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
  let wordSpan = document.getElementById("words");
  for (let i = 0; i < wordNum; i++) {
    let chosenWord;
    if (numbers.classList.contains("active") && Math.random() < 0.1) {
      chosenWord = String(Math.floor(Math.random() * 1000));
    } else {
      chosenWord = randomWord();
    }
    if (punctuation.classList.contains("active")) {
      const suffix = [",", ".", "?", "!", ";", ":"];
      if (Math.random() < 0.3) {
        chosenWord += suffix[Math.floor(Math.random() * suffix.length)];
      }
    }
    // wordSizes[i] = chosenWord.length;
    wordSpan.innerHTML += formatWord(chosenWord);
  }
}

function mainScreen() {
  let container = document.getElementById("container");
  let container2 = document.getElementById("container2");
  container2.style.display = "none";
  container.style.display = "flex";
}

function statsScreen() {
  let container = document.getElementById("container");
  let container2 = document.getElementById("container2");
  container2.style.display = "flex";
  container.style.display = "none";
  document.getElementById("wpm").innerHTML = wpm.toFixed(0);
  document.getElementById("rawwpm").innerHTML = rawWpm.toFixed(0);
  document.getElementById(
    "characters"
  ).innerHTML = `${correct}/${incorrect}/${extra}/${missed}`;
  document.getElementById("acc").innerHTML = accuracy.toFixed(0);
  document.getElementById("time").innerHTML = time.toFixed(1) + "s";
}

function checkCorrect() {
  let wordSpan = document.getElementById("words");
  for (let word of wordSpan.children) {
    for (let letter of word.children) {
      totalLetters++;
      typed++;
      if (letter.classList.contains("correct")) correct++;
      else if (letter.classList.contains("extra")) {
        extra++;
      } else if (letter.classList.contains("incorrect")) {
        incorrect++;
      } else {
        typed--;
        missed++;
      }
    }
  }
}
function printVariables() {
  console.log("--------------------");
  console.log("Time: ", time, "s");
  console.log("correct: ", correct);
  console.log("incorrect: ", incorrect);
  console.log("extra: ", extra);
  console.log("missed: ", missed);
  console.log("Accuracy: ", accuracy, "%");
  console.log("Raw WPM: ", rawWpm);
  console.log("typed: ", typed);
  console.log("WPM: ", wpm);
  console.log("--------------------");
}
function calculateMetrics() {
  accuracy = 0;
  correct = 0;
  incorrect = 0;
  extra = 0;
  missed = 0;
  wpm = 0;
  rawWpm = 0;
  totalLetters = 0;
  typed = 0;

  endTime = Date.now();
  time = parseFloat((endTime - startTime) / 1000);
  checkCorrect();
  accuracy = (correct / totalLetters) * 100;
  rawWpm = (typed + wordNum) / ((5 * time) / 60);
  wpm = (correct + wordNum) / 5 / (time / 60);
}
function newGame() {
  mainScreen();
  wordsAnimation();
  resetCountdown();
  calculateMetrics();
  // printVariables();

  // Clearing previous words
  let wordSpan = document.getElementById("words");
  wordSpan.innerHTML = "";
  // Rendering new words
  renderWords(currentWordsCount);

  for (const word of wordSpan.children) {
    //setting attribute for original size of words and typedletters
    word.setAttribute("size", word.children.length);
    word.setAttribute("typedletters", 0);
  }
  currentWord = wordSpan.firstElementChild;
  currentLetter = currentWord.firstElementChild;
  lastLetter = wordSpan.lastElementChild.lastElementChild;

  // Adding cursor
  let cursor = document.getElementById("cursor");
  if (!cursor) {
    cursor = document.createElement("section");
    cursor.id = "cursor";
    wordSpan.appendChild(cursor);
  }
}

function moveCursor() {
  if (!currentLetter) return;
  let cursor = document.getElementById("cursor");
  cursor.hidden = false;
  let wordSpan = document.getElementById("words");
  let letterRect = currentLetter.getBoundingClientRect();
  const wordsRect = wordSpan.getBoundingClientRect();

  // Calculate position relative to #words
  const offsetLeft = letterRect.left - wordsRect.left;
  const offsetTop = letterRect.top - wordsRect.top;
  let offsetRight = letterRect.right - wordsRect.left;

  // Update cursor size and position
  cursor.style.height = `${letterRect.height}px`;
  cursor.style.top = `${offsetTop}px`;
  let typedLetters = currentWord.getAttribute("typedletters");

  if (
    currentLetter.classList.contains("correct") ||
    currentLetter.classList.contains("incorrect")
  ) {
    cursor.style.left = `${offsetRight}px`;
  } else cursor.style.left = `${offsetLeft - 1}px`;

  // const lineHeight = parseFloat(getComputedStyle(document.getElementById("words")).lineHeight);
  // const scrollThreshold = lineHeight; // Distance from top/bottom to trigger scroll (one line)

  // const containerHeight = wordsRect.height;
  // const cursorBottom = offsetTop + letterRect.height;

  // // Scroll the container up if cursor is too close to the top
  // if (offsetTop < scrollThreshold) {
  //   document.getElementById("words").scrollTop -= lineHeight;
  // }
  // // Scroll the container down if cursor is too close to the bottom
  // else if (cursorBottom > containerHeight - scrollThreshold) {
  //   document.getElementById("words").scrollTop += lineHeight;
  // }
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

const reset = (document.getElementById("reset-button").onclick = newGame);
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
  resetButton.classList.add("rotate-animation");

  setTimeout(() => {
    resetButton.classList.remove("rotate-animation");
  }, 500);
});

function resetActiveButtons(buttonGroup) {
  buttonGroup.forEach((button) => button.classList.remove("active"));
}

function startCountdown(value) {
  // startTime = Date.now();
  clearInterval(countdownInterval);
  currentTimerValue = value;
  timerElement.textContent = `${currentTimerValue}s`;

  countdownInterval = setInterval(() => {
    if (currentTimerValue == 0) {
      newGame();
      statsScreen();
    } // stats screen TODO
    if (currentTimerValue > 0) {
      currentTimerValue--;
      timerElement.textContent = `${currentTimerValue}s`;
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);
}
function resetCountdown() {
  timerOn = 0;
  clearInterval(countdownInterval);
  timerElement.textContent = `${timerNum}s`;
}
function isTimeButtonActive() {
  return timeButton.classList.contains("active");
}

//words and time
let btn1 = document.querySelector(".btn1");
let btn2 = document.querySelector(".btn2");
let btn3 = document.querySelector(".btn3");
let btn4 = document.querySelector(".btn4");
let timerElement = document.querySelector(".timernum");

let wordsButton = document.getElementById("words-button");
let timer = document.getElementById("timer");
let currentWordsCount = 10;
let lastTimeSetting = btn1;
let lastWordSetting = btn1;

function isWordsButtonActive() {
  return wordsButton.classList.contains("active");
}

function activateButton(activeButton, inactiveButton) {
  activeButton.classList.add("active");
  inactiveButton.classList.remove("active");
}

window.addEventListener("load", () => {
  //when loading page
  activateButton(timeButton, wordsButton);
  btn1.classList.add("active");
  timerNum = 15;
  timerElement.textContent = "15s";
  btn1.textContent = "15";
  btn2.textContent = "30";
  btn3.textContent = "60";
  btn4.textContent = "120";
});

timeButton.addEventListener("click", () => {
  //when time button is pressed
  newGame();
  activateButton(timeButton, wordsButton);
  timer.classList.remove("hidden");
  // Reset words buttons and activate default time button
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  lastTimeSetting.classList.add("active");
  btn1.textContent = "15";
  btn2.textContent = "30";
  btn3.textContent = "60";
  btn4.textContent = "120";
});

wordsButton.addEventListener("click", () => {
  // when words button is pressed
  newGame();
  timer.classList.add("hidden"); // hide timer
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  lastWordSetting.classList.add("active");
  activateButton(wordsButton, timeButton);

  btn1.textContent = "10";
  btn2.textContent = "25";
  btn3.textContent = "50";
  btn4.textContent = "100";
});

btn1.addEventListener("click", () => {
  if (isWordsButtonActive()) {
    resetActiveButtons([btn1, btn2, btn3, btn4]);
    btn1.classList.add("active");
    lastWordSetting = btn1;
    currentWordsCount = 10;
  } else {
    resetActiveButtons([btn1, btn2, btn3, btn4]);
    btn1.classList.add("active");
    timerElement.textContent = "15s";
    timerNum = 15;
  }
  newGame();
});

btn2.addEventListener("click", () => {
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  btn2.classList.add("active");
  if (isWordsButtonActive()) {
    lastWordSetting = btn2;
    currentWordsCount = 25;
  } else {
    lastTimeSetting = btn2;
    timerNum = 30;
    timerElement.textContent = "30s";
  }
  newGame();
});

btn3.addEventListener("click", () => {
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  btn3.classList.add("active");
  if (isWordsButtonActive()) {
    lastWordSetting = btn3;
    currentWordsCount = 50;
  } else {
    lastTimeSetting = btn3;
    timerNum = 60;
    timerElement.textContent = "60s";
  }
  newGame();
});

btn4.addEventListener("click", () => {
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  btn4.classList.add("active");
  if (isWordsButtonActive()) {
    lastWordSetting = btn4;
    currentWordsCount = 100;
  } else {
    lastTimeSetting = btn2;
    timerNum = 120;
    timerElement.textContent = "120s";
  }
  newGame();
});

const numbers = document.getElementById("numbers");
const punctuation = document.getElementById("punctuation");
numbers.addEventListener("click", () => {
  numbers.classList.toggle("active");
  newGame();
});
punctuation.addEventListener("click", () => {
  punctuation.classList.toggle("active");
  newGame();
});

setInterval(moveCursor, 0);
newGame();