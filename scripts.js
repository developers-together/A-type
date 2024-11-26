import { words } from "./words.js";
const wordCount = words.length;
document.onkeypress = function (key) {
  // console.log(key);
};
function formatWord(word) {
  return `<div class="word">
        <span class="letter">
        ${word.split("").join('</span><span class="letter">')}
        </span>
    </div>`;
}
function randomWord() {
  const randInd = Math.ceil(Math.random() * wordCount - 1);
  console.log(randInd);
  return words[randInd];
}
function renderWords(wordNum) {
  const wordSpan = document.getElementById("words");
  for (let i = 0; i < wordNum; i++) {
    wordSpan.innerHTML += formatWord(randomWord());
  }
}
function newGame() {
  let wordSpan = document.getElementById("words");
  wordSpan.innerHTML = "";
  renderWords(20);
}
const reset = (document.getElementById("reset-button").onclick = newGame);
newGame();
// setInterval(cycleHighlights, 0.5);
