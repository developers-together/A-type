import { words } from "./words.js";
const wordCount = words.length;

let wIndex = 0;
let lIndex = 1;
let wordSizes = [];
let allLetters = [];
let allWords = [];

document.onkeydown = function (key) {
  let letter = allLetters[lIndex];
  let cursor = document.getElementById("cursor");
  const letterRect = letter.getBoundingClientRect();
  if (key.key == "Tab") {
    key.preventDefault();
    newGame();
  } else if (key.key == "Alt") {
    key.preventDefault();
  } else if (key.key == "Backspace") {
    // else{
    lIndex = Math.max(lIndex - 1, 0);
    letter = allLetters[lIndex];
    letter.style.color = "#444444";
    // }
  } else if (key.key.length == 1 && key.key != " ") { 
    moveCursor();

    if (lIndex == wordSizes[wIndex]) {
      let textArea = document.getElementById("words");
      let newSpan = document.createElement("span");
      newSpan.classList.add("incorrect");
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
};

function formatWord(word) {
  return `<div class="word">
    <span class="letter">${word.split("").join('</span><span class="letter">')}</span>
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
  lIndex = 0;
  wIndex = 0;

  //clearing previous words
  let wordSpan = document.getElementById("words");
  wordSpan.innerHTML = "";

  //rendering new words
  renderWords(20);

  //adding cursor
  let cursor = document.createElement("section");
  cursor.id='cursor';
  allLetters = wordSpan.querySelectorAll("span");
  allWords = wordSpan.querySelectorAll("div");
  let letter = allLetters[lIndex];
  wordSpan.appendChild(cursor);
  const letterRect = letter.getBoundingClientRect();
  cursor.style.left = (letterRect.left) + "px";
  cursor.style.top = (letterRect.top) + "px";

}

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

let lastZoom = window.devicePixelRatio;
window.addEventListener("resize", () => {
  if (window.devicePixelRatio !== lastZoom) {
    moveCursor();
  }
});
window.addEventListener("scroll", () => {
  moveCursor();
});
function moveCursor(){
  let cursor = document.getElementById("cursor");
  cursor.classList.add("no-blink");
  cursor.hidden = true;
  let letter = allLetters[lIndex];
  const letterRect = letter.getBoundingClientRect();
  cursor.style.left = (letterRect.left) + "px";
  cursor.style.top = (letterRect.top)  + "px";
  cursor.hidden=false;
  setTimeout(() => {
    cursor.classList.remove("no-blink");
  }, 300);
}