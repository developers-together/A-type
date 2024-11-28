import { words } from "./words.js";
const wordCount = words.length;

let wIndex = 0;
let lIndex = 1;
let wordSizes = [];
let allLetters = [];
let allWords = [];

document.onkeydown = function (key) {
  if (lIndex == allLetters.length - 1) { 
    newGame(); //make it go to stats screen instead
    return;
  }
  let letter = allLetters[lIndex];
  let cursor = document.getElementById("cursor");
  const letterRect = letter.getBoundingClientRect();
  if (key.key == "Tab") { //quick reset
    key.preventDefault();
    newGame();
  } else if (key.key == "Alt") {
    key.preventDefault();
  } else if (key.key == "Backspace") { //backspace
    lIndex = Math.max(lIndex - 1, 0);
    letter = allLetters[lIndex];
    letter.classList.remove('correct');
    letter.classList.remove('incorrect');
    if (lIndex == wordSizes[wIndex - 1] - 1) {
      allWords[wIndex - 1].style.textDecoration = "none";
      wIndex--;
    }
  } else if (key.key.length == 1 && key.key != " ") { //letter
    if (lIndex == wordSizes[wIndex]) {
      let textArea = document.getElementById("words");
      let newSpan = document.createElement("span");
      newSpan.classList.add("incorrect");
      newSpan.textContent = key.key;
      newSpan.style.color = "red";
      wordSizes[wIndex]++;
      allWords[wIndex].appendChild(newSpan);
      lIndex--;
      wIndex++;
    } else if (letter.textContent == key.key) {
      letter.classList.add('correct');
      letter.classList.remove('incorrect');
    } else {
      letter.classList.add('incorrect');
      letter.classList.add('correct');
    }
    lIndex++;
  } else if (key.key == " " && lIndex != 0 && lIndex != wordSizes[wIndex - 1]) { //space
    if(wIndex==allWords.length-1){
      newGame(); //make it go to stats screen instead
      return;
    }
    allWords[wIndex].style.textDecoration = "underline";
    lIndex = wordSizes[wIndex];
    wIndex++;
  }
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
    let chosenWord = randomWord();
    if (i != 0) wordSizes[i] = chosenWord.length + wordSizes[i - 1];
    else wordSizes[i] = chosenWord.length;
    wordSpan.innerHTML += formatWord(chosenWord);
  }
}

function newGame() {
  wordsAnimation();
  lIndex = 0;
  wIndex = 0;

  // Clearing previous words
  let wordSpan = document.getElementById("words");
  wordSpan.innerHTML = "";

  // Rendering new words
  renderWords(10);

  allLetters = wordSpan.querySelectorAll("span");
  allWords = wordSpan.querySelectorAll("div");

  // Adding cursor
  let cursor = document.getElementById("cursor");
  if (!cursor) {
    cursor = document.createElement("section");
    cursor.id = "cursor";
    wordSpan.appendChild(cursor);
  }
  moveCursor();
}

function moveCursor() {
  let cursor = document.getElementById("cursor");
  cursor.hidden = false;
  let letter = allLetters[lIndex];

  if (!letter) return; // Avoid errors if `lIndex` is out of range

  const letterRect = letter.getBoundingClientRect();
  const wordsRect = document.getElementById("words").getBoundingClientRect();

  // Update cursor size and position
  cursor.style.height = `${letterRect.height}px`;

  // Calculate position relative to #words
  let offsetRight = 0;
  if (lIndex != 0) {
    let prevLetter = allLetters[lIndex - 1];
    let prevLetterRect = prevLetter.getBoundingClientRect();
    offsetRight = prevLetterRect.right - wordsRect.left;
  }

  const offsetLeft = letterRect.left - wordsRect.left;
  const offsetTop = letterRect.top - wordsRect.top;
  if (lIndex == wordSizes[wIndex]) {
    cursor.style.left = `${offsetRight}px`;
  } else cursor.style.left = `${offsetLeft}px`;
  cursor.style.top = `${offsetTop}px`;
}

let lastZoom = window.devicePixelRatio;
window.addEventListener("resize", () => {
  if (window.devicePixelRatio !== lastZoom) {
    lastZoom = window.devicePixelRatio;
    let cursor = document.getElementById("cursor");
    cursor.hidden = true;
  }
});

function wordsAnimation(){
  let typingLines = document.getElementById("words");
  typingLines.classList.add("fade");
  setTimeout(() => {
    typingLines.classList.remove("fade");
  }, 500);
}


setInterval(moveCursor, 0);
newGame();

const reset = (document.getElementById("reset-button").onclick = newGame);
// the reset button rotation activity
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
  resetButton.classList.add("rotate-animation");

  setTimeout(() => {
    resetButton.classList.remove("rotate-animation");
  }, 500);
});
