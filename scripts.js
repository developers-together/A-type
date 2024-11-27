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
    lIndex = Math.max(lIndex - 1, 0);
    letter = allLetters[lIndex];
    letter.style.color = "#444444";
    if(lIndex==wordSizes[wIndex-1]-1){
      allWords[wIndex-1].style.textDecoration="none";
      wIndex--;
    }
    
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


function moveCursor() {
  let cursor = document.getElementById("cursor");
  let letter = allLetters[lIndex];

  if (!letter) return; // Avoid errors if `lIndex` is out of range

  const letterRect = letter.getBoundingClientRect();
  const wordsRect = document.getElementById("words").getBoundingClientRect();

  // Update cursor size and position
  cursor.style.height = `${letterRect.height}px`;
  cursor.style.width = `${letterRect.width*20/100}px`; // Adjust width if necessary

  // Calculate position relative to #words
  const offsetLeft = letterRect.left - wordsRect.left;
  const offsetTop = letterRect.top - wordsRect.top;

  cursor.style.left = `${offsetLeft-1}px`;
  cursor.style.top = `${offsetTop}px`;

}

function newGame() {
  lIndex = 0;
  wIndex = 0;

  // Clearing previous words
  let wordSpan = document.getElementById("words");
  wordSpan.innerHTML = "";

  // Rendering new words
  renderWords(20);

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



setInterval(moveCursor,1);
newGame();
