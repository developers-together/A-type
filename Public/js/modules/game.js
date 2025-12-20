import { renderWords, mainScreen, statsScreen, wordsAnimation, updateTimerDisplay, moveCursor } from "./ui.js";
import { calculateMetrics, resetStats, setStartTime } from "./stats.js";

export let timerNum = 15;
export let wordNum = 15;
export let timerOn = 0;
export let currentWord;
export let currentLetter;
export let lastLetter;
export let currentTimerValue = timerNum;
export let countdownInterval;
export let currentWordsCount = 15;
export let cooldown = false;

export function setTimerNum(val) {
  timerNum = val;
  currentTimerValue = val;
}

export function setWordNum(val) {
  wordNum = val;
}

export function setCurrentWordsCount(val) {
  currentWordsCount = val;
}

export function setCooldown(val) {
  cooldown = val;
}

export function setCurrentWord(val) {
  currentWord = val;
}

export function setCurrentLetter(val) {
  currentLetter = val;
}

export function startCountdown(value) {
  clearInterval(countdownInterval);
  currentTimerValue = value;
  updateTimerDisplay(currentTimerValue);

  countdownInterval = setInterval(() => {
    if (currentTimerValue == 0) {
      endGame();
    } 
    if (currentTimerValue > 0) {
      currentTimerValue--;
      updateTimerDisplay(currentTimerValue);
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

export function resetCountdown() {
  timerOn = 0;
  clearInterval(countdownInterval);
  updateTimerDisplay(timerNum);
}

export function endGame() {
  clearInterval(countdownInterval);
  timerOn = 0;
  calculateMetrics();
  
  const timeButton = document.getElementById("time-button");
  const isTimeMode = timeButton && timeButton.classList.contains("active");
  
  statsScreen(timerNum, wordNum, isTimeMode);
}

export async function newGame() {
  mainScreen();
  wordsAnimation();
  resetCountdown();
  // calculateMetrics(); // Removed as it's handled in endGame or irrelevant for restart
  resetStats();

  // Clearing previous words
  let wordSpan = document.getElementById("words");
  wordSpan.scrollTop = 0;
  wordSpan.innerHTML = "";
  
  // Check if words button is active to decide render count
  const wordsButton = document.getElementById("words-button");
  const isWordsMode = wordsButton && wordsButton.classList.contains("active");
  
  if (isWordsMode) await renderWords(currentWordsCount);
  else await renderWords(90);

  for (const word of wordSpan.children) {
    //setting attribute for original size of words and typedletters
    word.setAttribute("size", word.children.length);
    word.setAttribute("typedletters", 0);
  }
  
  // Guard clause in case rendering failed
  if (wordSpan.children.length === 0) return;

  currentWord = wordSpan.firstElementChild;
  currentLetter = currentWord.firstElementChild;
  // Find last word (excluding cursor) and get its last letter
  let actualLastWord = wordSpan.lastElementChild;
  if (actualLastWord && actualLastWord.id === "cursor") {
    actualLastWord = actualLastWord.previousElementSibling;
  }
  lastLetter = actualLastWord ? actualLastWord.lastElementChild : null;

  // Adding cursor
  let cursor = document.getElementById("cursor");
  if (!cursor) {
    cursor = document.createElement("section");
    cursor.id = "cursor";
    wordSpan.appendChild(cursor);
  }
}

export async function handleInput(key) {
    if (key.ctrlKey || key.metaKey) return;
    if (!currentWord || !currentLetter) return;
    
    const timeButton = document.getElementById("time-button");
    const wordsButton = document.getElementById("words-button");
    const isWordsMode = wordsButton && wordsButton.classList.contains("active");
    const isTimeMode = timeButton && timeButton.classList.contains("active");

    if (key.key == "Tab") {
      //quick reset
      key.preventDefault();
      if (cooldown) return;
      newGame();
      cooldown = true; 
      setTimeout(() => {
        cooldown = false; 
      }, 400); 
    } else if (key.key == "Alt") {
      key.preventDefault();
    } else if (key.key == "Backspace") {
      //backspace
      let cursor = document.getElementById("cursor");
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
      if (timerOn == 0 && isTimeMode) {
        setStartTime(Date.now());
        startCountdown(timerNum);
        timerOn = 1;
      } else if (timerOn == 0) {
        setStartTime(Date.now());
        timerOn = 1;
      }
      let cursor = document.getElementById("cursor");
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
        // End game when reaching last letter in any mode
        console.log("Game Over Triggered");
        endGame();
        return;
      }
      console.log("Check:", currentLetter === lastLetter, isWordsMode, currentLetter, lastLetter);
      let nextLetter = currentLetter.nextElementSibling;
      if (nextLetter) {
        currentLetter = nextLetter;
      }
    } else if (key.key == " ") {
      //space
      key.preventDefault();
      let cursor = document.getElementById("cursor");
      cursor.classList.add("no-blink");
      
      // Check if we are at the end (on last word) - end the game
      if (currentWord.nextElementSibling && currentWord.nextElementSibling.id === "cursor") {
          // This is the last word, end the game
          console.log("Game Over Triggered (Space on last word)");
          endGame();
          return;
      }

      if (
        currentWord.children.length == 1 &&
        (currentLetter.classList.contains("correct") ||
          currentLetter.classList.contains("incorrect"))
      ) {
        currentWord = currentWord.nextElementSibling;
        currentLetter = currentWord.firstElementChild;
      } else if (currentLetter == currentWord.firstElementChild) return;
      else {
        currentWord = currentWord.nextElementSibling;
        currentLetter = currentWord.firstElementChild;
      }
      // currentWord.style.textDecoration = "underline";
    }
    
    // Cursor blink reset
    let cursor = document.getElementById("cursor");
    // We need to manage cursorTimeout. Since it's local to the event, 
    // we might need a module-level variable if we want to clear it correctly.
    // For now, let's just add the class and let CSS handle the animation restart if possible,
    // or use a simple timeout.
    // The original code used a global `cursorTimeout`.
    // Let's add it to module scope.
}

export function gameLoop() {
    moveCursor(currentLetter, currentWord);
}
