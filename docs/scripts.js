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

let numberOfLettersInCorrectWords = 0;
let totalTyped = 0;
let typed = 0;
let totalLetters = 0;
let rawWpm = 0;
let startTime = 0;
let endTime = 0;

let lastY = null;

const numbers = document.getElementById("numbers");
const punctuation = document.getElementById("punctuation");
let backButton = document.getElementById("back-button");
backButton.addEventListener("click", () => {
  newGame();
});
let cooldown = false;
document.onkeydown = function (key) {
  if (key.ctrlKey || key.metaKey) return;
  if (key.key == "Tab") {
    //quick reset
    key.preventDefault();
    if (cooldown) return;
    newGame();
    cooldown = true; // Set the flag to true
    setTimeout(() => {
      cooldown = false; // Reset the cooldown after X milliseconds
    }, 400); // Cooldown duration in milliseconds (e.g., 2 seconds)
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
    if (currentLetter == lastLetter && isWordsButtonActive()) {
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
    else if (currentWord == lastLetter.parentElement && isWordsButtonActive()) {
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
    if (wordSpan.lastElementChild && wordSpan.lastElementChild.id == "cursor") {
      wordSpan.lastElementChild.insertAdjacentHTML(
        "beforebegin",
        formatWord(chosenWord)
      );
    } else {
      wordSpan.innerHTML += formatWord(chosenWord);
    }
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
  document.getElementById("acc").innerHTML = accuracy.toFixed(0) + "%";
  document.getElementById("time").innerHTML = time.toFixed(1) + "s";
  sendData();
}

function sendData() {
  let timeModeOn = isTimeButtonActive();
  let punctuationOn = punctuation.classList.contains("active");
  let numbersOn = numbers.classList.contains("active");
  let data = {
    wpm,
    accuracy,
    time,
    timeModeOn,
    timerNum,
    wordNum,
    punctuationOn,
    numbersOn,
  };
  fetch("http://127.0.0.1:8000/", {
    method: "POST", // Use 'GET', 'PUT', or 'DELETE' as needed
    headers: {
      "Content-Type": "application/json", // Specify JSON data
    },
    body: JSON.stringify(data), // Convert data to JSON string
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse JSON from the response
    })
    .then((data) => console.log("Success:", data))
    .catch((error) => console.error("Error:", error));
}

function checkCorrect() {
  let wordSpan = document.getElementById("words");
  for (let word of wordSpan.children) {
    let correctWord = true;
    let touchedWord = false;
    for (let letter of word.children) {
      totalLetters++;
      if (letter.classList.contains("correct")) {
        totalTyped++;
        typed++;
        correct++;
        touchedWord = true;
      } else if (letter.classList.contains("extra")) {
        totalTyped++;
        typed++;
        touchedWord = true;
        correctWord = false;
        extra++;
      } else if (letter.classList.contains("incorrect")) {
        typed++;
        totalTyped++;
        touchedWord = true;
        correctWord = false;
        incorrect++;
      } else {
        correctWord = false;
        if (touchedWord) missed++;
      }
    }
    if (word === wordSpan.lastElementChild) {
      numberOfLettersInCorrectWords += correctWord ? word.children.length : 0;
    } else {
      typed += touchedWord ? 1 : 0;
      numberOfLettersInCorrectWords += correctWord
        ? word.children.length + 1
        : 0;
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
  totalTyped = 0;
  numberOfLettersInCorrectWords = 0;
  endTime = Date.now();
  time = parseFloat((endTime - startTime) / 1000);
  checkCorrect();
  accuracy = (correct / totalTyped) * 100;
  rawWpm = typed / 5 / (time / 60);
  wpm = numberOfLettersInCorrectWords / 5 / (time / 60);
  printVariables();
}
function newGame() {
  lastY = null;
  mainScreen();
  wordsAnimation();
  resetCountdown();
  calculateMetrics();
  // printVariables();

  // Clearing previous words
  let wordSpan = document.getElementById("words");
  wordSpan.scrollTop = 0;
  wordSpan.innerHTML = "";
  // Rendering new words
  if (isWordsButtonActive()) renderWords(currentWordsCount);
  else renderWords(90);

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

  const letterRect = currentLetter.getBoundingClientRect();
  const wordsRect = wordSpan.getBoundingClientRect();

  // Calculate position relative to the #words container
  const offsetLeft = letterRect.left - wordsRect.left;
  const offsetTop = letterRect.top - wordsRect.top + wordSpan.scrollTop; // Add scrollTop adjustment
  const offsetRight = letterRect.right - wordsRect.left;

  // Update cursor size and position
  cursor.style.height = `${letterRect.height}px`;
  cursor.style.top = `${offsetTop}px`; // Adjust for scrolling

  if (
    currentLetter.classList.contains("correct") ||
    currentLetter.classList.contains("incorrect")
  ) {
    cursor.style.left = `${offsetRight}px`;
  } else {
    cursor.style.left = `${offsetLeft - 1}px`;
  }

  const lineHeight = currentWord.offsetHeight;

  // Calculate the current scroll position
  const scrollTop = wordSpan.scrollTop;

  // Find the closest "line" alignment
  const alignedScrollTop = Math.round(scrollTop / lineHeight) * lineHeight;

  // Set the scrollTop to align properly
  wordSpan.scrollTop = alignedScrollTop;

  // Scroll container logic (unchanged)
  const currentLetterRect = currentLetter.getBoundingClientRect();
  const wordSpanRect = wordSpan.getBoundingClientRect();
  const outOfViewTop = currentLetterRect.top < wordSpanRect.top;
  const outOfViewBottom = currentLetterRect.bottom > wordSpanRect.bottom;

  if (outOfViewTop) {
    wordSpan.scrollTop -= wordSpanRect.top - currentLetterRect.top + 10;
  } else if (outOfViewBottom) {
    if (isTimeButtonActive()) renderWords(20);
    wordSpan.scrollTop += currentLetterRect.bottom - wordSpanRect.bottom + 10;
  }
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
  }, 400);
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
  activateButton(
    document.getElementById("time-mobile"),
    document.getElementById("words-mobile")
  );
  btn1.classList.add("active");
  document.getElementById("btn1-mobile").classList.add("active");
  timerNum = 15;
  timerElement.textContent = "15s";
  btn1.textContent = "15";
  btn2.textContent = "30";
  btn3.textContent = "60";
  btn4.textContent = "120";
  document.getElementById("btn1-mobile").textContent = "15";
  document.getElementById("btn2-mobile").textContent = "30";
  document.getElementById("btn3-mobile").textContent = "60";
  document.getElementById("btn4-mobile").textContent = "120";
});

// Remove old event listeners
// timeButton.addEventListener("click", ...);
// wordsButton.addEventListener("click", ...);
// btn1.addEventListener("click", ...);
// btn2.addEventListener("click", ...);
// btn3.addEventListener("click", ...);
// btn4.addEventListener("click", ...);
// numbers.addEventListener("click", ...);
// punctuation.addEventListener("click", ...);

// Function to add shared event listeners
function addSharedEventListener(buttonId, mobileButtonId, eventHandler) {
  document.getElementById(buttonId).addEventListener("click", eventHandler);
  document
    .getElementById(mobileButtonId)
    .addEventListener("click", eventHandler);
}

// Shared event handlers
function handlePunctuationClick() {
  punctuation.classList.toggle("active");
  document.getElementById("punctuation-mobile").classList.toggle("active");
  newGame();
}

function handleNumbersClick() {
  numbers.classList.toggle("active");
  document.getElementById("numbers-mobile").classList.toggle("active");
  newGame();
}

function handleTimeButtonClick() {
  activateButton(timeButton, wordsButton);
  activateButton(
    document.getElementById("time-mobile"),
    document.getElementById("words-mobile")
  );
  newGame();
  timer.classList.remove("hidden");
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  resetActiveButtons([
    document.getElementById("btn1-mobile"),
    document.getElementById("btn2-mobile"),
    document.getElementById("btn3-mobile"),
    document.getElementById("btn4-mobile"),
  ]);
  lastTimeSetting.classList.add("active");
  if (lastTimeSetting == btn1) {
    document.getElementById("btn1-mobile").classList.add("active");
  } else if (lastTimeSetting == btn2) {
    document.getElementById("btn2-mobile").classList.add("active");
  } else if (lastTimeSetting == btn3) {
    document.getElementById("btn3-mobile").classList.add("active");
  } else if (lastTimeSetting == btn4) {
    document.getElementById("btn4-mobile").classList.add("active");
  }
  document.getElementById("btn1-mobile").textContent = btn1.textContent = "15";
  document.getElementById("btn2-mobile").textContent = btn2.textContent = "30";
  document.getElementById("btn3-mobile").textContent = btn3.textContent = "60";
  document.getElementById("btn4-mobile").textContent = btn4.textContent = "120";
}

function handleWordsButtonClick() {
  activateButton(wordsButton, timeButton);
  activateButton(
    document.getElementById("words-mobile"),
    document.getElementById("time-mobile")
  );
  newGame();
  timer.classList.add("hidden");
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  resetActiveButtons([
    document.getElementById("btn1-mobile"),
    document.getElementById("btn2-mobile"),
    document.getElementById("btn3-mobile"),
    document.getElementById("btn4-mobile"),
  ]);
  if (lastWordSetting == btn1) {
    document.getElementById("btn1-mobile").classList.add("active");
  } else if (lastWordSetting == btn2) {
    document.getElementById("btn2-mobile").classList.add("active");
  } else if (lastWordSetting == btn3) {
    document.getElementById("btn3-mobile").classList.add("active");
  } else if (lastWordSetting == btn4) {
    document.getElementById("btn4-mobile").classList.add("active");
  }
  lastWordSetting.classList.add("active");
  document.getElementById("btn1-mobile").textContent = btn1.textContent = "10";
  document.getElementById("btn2-mobile").textContent = btn2.textContent = "25";
  document.getElementById("btn3-mobile").textContent = btn3.textContent = "50";
  document.getElementById("btn4-mobile").textContent = btn4.textContent = "100";
}

function handleBtn1Click() {
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  resetActiveButtons([
    document.getElementById("btn1-mobile"),
    document.getElementById("btn2-mobile"),
    document.getElementById("btn3-mobile"),
    document.getElementById("btn4-mobile"),
  ]);
  btn1.classList.add("active");
  document.getElementById("btn1-mobile").classList.add("active");
  if (isWordsButtonActive()) {
    lastWordSetting = btn1;
    currentWordsCount = 10;
  } else {
    lastTimeSetting = btn1;
    timerNum = 15;
    timerElement.textContent = "15s";
  }
  newGame();
}

function handleBtn2Click() {
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  resetActiveButtons([
    document.getElementById("btn1-mobile"),
    document.getElementById("btn2-mobile"),
    document.getElementById("btn3-mobile"),
    document.getElementById("btn4-mobile"),
  ]);
  btn2.classList.add("active");
  document.getElementById("btn2-mobile").classList.add("active");
  if (isWordsButtonActive()) {
    lastWordSetting = btn2;
    currentWordsCount = 25;
  } else {
    lastTimeSetting = btn2;
    timerNum = 30;
    timerElement.textContent = "30s";
  }
  newGame();
}

function handleBtn3Click() {
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  resetActiveButtons([
    document.getElementById("btn1-mobile"),
    document.getElementById("btn2-mobile"),
    document.getElementById("btn3-mobile"),
    document.getElementById("btn4-mobile"),
  ]);
  btn3.classList.add("active");
  document.getElementById("btn3-mobile").classList.add("active");
  if (isWordsButtonActive()) {
    lastWordSetting = btn3;
    currentWordsCount = 50;
  } else {
    lastTimeSetting = btn3;
    timerNum = 60;
    timerElement.textContent = "60s";
  }
  newGame();
}

function handleBtn4Click() {
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  resetActiveButtons([
    document.getElementById("btn1-mobile"),
    document.getElementById("btn2-mobile"),
    document.getElementById("btn3-mobile"),
    document.getElementById("btn4-mobile"),
  ]);
  btn4.classList.add("active");
  document.getElementById("btn4-mobile").classList.add("active");
  if (isWordsButtonActive()) {
    lastWordSetting = btn4;
    currentWordsCount = 100;
  } else {
    lastTimeSetting = btn4;
    timerNum = 120;
    timerElement.textContent = "120s";
  }
  newGame();
}

// Add shared event listeners
addSharedEventListener(
  "punctuation",
  "punctuation-mobile",
  handlePunctuationClick
);
addSharedEventListener("numbers", "numbers-mobile", handleNumbersClick);
addSharedEventListener("time-button", "time-mobile", handleTimeButtonClick);
addSharedEventListener("words-button", "words-mobile", handleWordsButtonClick);
addSharedEventListener("btn1", "btn1-mobile", handleBtn1Click);
addSharedEventListener("btn2", "btn2-mobile", handleBtn2Click);
addSharedEventListener("btn3", "btn3-mobile", handleBtn3Click);
addSharedEventListener("btn4", "btn4-mobile", handleBtn4Click);

// Select the hamburger button and the mobile menu
const mobileButton = document.querySelector(".mobile-button");
const mobileMenu = document.getElementById("mobileMenu");

// Toggle the display of the mobile menu
mobileButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");

  document.getElementById("container").classList.toggle("blurred");
});

// Hide mobile menu when screen ratio is not appropriate
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    mobileMenu.classList.add("hidden");
    document.getElementById("container").classList.remove("blurred");
  }
});
window.addEventListener("click", (event) => {
  if (
    !mobileButton.contains(event.target) &&
    !mobileMenu.contains(event.target)
  ) {
    mobileMenu.classList.add("hidden");
    document.getElementById("container").classList.remove("blurred");
  }
});
setInterval(moveCursor, 0);
newGame();

// Theme handling
const themeToggle = document.getElementById('theme-toggle') || document.getElementById('theme-btn');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
let currentTheme = localStorage.getItem('theme') || 'dark';

// Apply saved theme on page load
document.documentElement.setAttribute('data-theme', currentTheme);
if (themeIcon) {
  if (currentTheme === 'light') {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  }
}

// Add event listener for theme toggle
if (themeToggle) {
  themeToggle.addEventListener('click', (event) => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    // Get button position for transition origin
    const buttonRect = themeToggle.getBoundingClientRect();
    const buttonX = buttonRect.left + buttonRect.width/2;
    const buttonY = buttonRect.top + buttonRect.height/2;
    setTheme(newTheme, buttonX, buttonY);
  });
}

function setTheme(theme, originX, originY) {
  // Create transition element with the current theme's background color
  const root = document.documentElement;
  
  // Create and apply the transition effect
  const transition = document.createElement('div');
  transition.className = 'theme-transition';
  
  // Set the origin point for the transition
  if (originX && originY) {
    const originPercentX = (originX / window.innerWidth) * 100;
    const originPercentY = (originY / window.innerHeight) * 100;
    transition.style.setProperty('--origin-x', `${originPercentX}%`);
    transition.style.setProperty('--origin-y', `${originPercentY}%`);
  }
  
  // Use the target theme's background color for the transition element
  if (theme === 'light') {
    transition.style.backgroundColor = 'var(--bgcolor-light)';
  } else {
    transition.style.backgroundColor = 'var(--bgcolor-dark)';
  }
  
  document.body.appendChild(transition);
  
  // Force reflow to ensure animation starts
  void transition.offsetWidth;
  
  // Wait for animation to reach halfway before changing the theme
  setTimeout(() => {
    // Apply the new theme colors at the midpoint of the animation
    if (theme === 'light') {
      root.style.setProperty('--bgcolor', 'var(--bgcolor-light)');
      root.style.setProperty('--btncolor', 'var(--btncolor-light)');
      root.style.setProperty('--dtext', 'var(--dtext-light)');
      root.style.setProperty('--text', 'var(--text-light)');
    } else {
      root.style.setProperty('--bgcolor', 'var(--bgcolor-dark)');
      root.style.setProperty('--btncolor', 'var(--btncolor-dark)');
      root.style.setProperty('--dtext', 'var(--dtext-dark)');
      root.style.setProperty('--text', 'var(--text-dark)');
    }
    
    // Set the theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update icon
    if (themeIcon) {
      if (theme === 'light') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      }
    }
    
    // Update current theme and save to localStorage
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    // Start fade out
    transition.classList.add('out');
    
    // Remove element after animation completes
    setTimeout(() => {
      transition.remove();
    }, 600);
  }, 300); // This timing should be approximately half of the animation duration
}
