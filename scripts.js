import {words} from './words.js'

document.onkeypress = function (key) {
    console.log(key);
};

function renderWords() {
    const letterSpan = document.getElementById("words");
    words.forEach((word, wordIndex) => {
        word.split("").forEach((letter, letterIndex) => {
            // console.log(letter,letterIndex);
            letterSpan.textContent += letter;
            letterSpan.dataset.wordIndex = wordIndex;
            letterSpan.dataset.letterIndex = letterIndex;
        });
        letterSpan.textContent+=" ";
    });
}

function highlightLetter(wordIndex, letterIndex) {
    console.log('hi');
    // Remove the highlight from all spans
    //document.querySelectorAll("span").forEach(span => span.classList.remove("highlight"));

    // Add highlight to the target letter
    const targetLetter = document.querySelector(
        `span[data-word-index="${wordIndex}"][data-letter-index="${letterIndex}"]`
    );
    if (targetLetter) {
        console.log(targetLetter);
        targetLetter.classList.add("highlight");
    }
}
let currentWordIndex = 0;
let currentLetterIndex = 0;
function cycleHighlights() {
    highlightLetter(currentWordIndex, currentLetterIndex);

    currentLetterIndex++;
    if (currentLetterIndex >= words[currentWordIndex].length) {
        currentLetterIndex = 0;
        currentWordIndex = (currentWordIndex + 1) % words.length;
    }
}
renderWords();
setInterval(cycleHighlights, 0.5);