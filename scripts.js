import { words } from "./words.js";
const wordCount = words.length;

let wIndex=0;
let lIndex=0;
let wordSizes = [];
let allLetters = [];
let allWords = [];
document.onkeydown = function (key) {
    console.log(key.key);
    let letter = allLetters[lIndex];    
    if(key.key=='Tab'){
        key.preventDefault();
        newGame();
    }
    else if(key.key=='Alt'){
        key.preventDefault();
    }
    else if(key.key=='Backspace'){
       
        // else{
            lIndex=Math.max(lIndex-1,0);
            letter=allLetters[lIndex];
            letter.style.color = 'white';
        // }
    }
    else if(key.key.length==1 && key.key != ' '){
        if(lIndex==wordSizes[wIndex]){
            let textArea = document.getElementById("words");
            let newSpan = document.createElement("span");
            newSpan.classList.add('bad');
            newSpan.textContent = key.key;
            newSpan.style.color = 'red';
            // allLetters.splice(lIndex, 0, newSpan);
            wordSizes[wIndex]++;
            allWords[wIndex].appendChild(newSpan);
            lIndex--;
            wIndex++;
        }
        else if(letter.textContent==key.key){
            letter.style.color = "green";
        }   
        else{
            letter.style.color = "red";
        }
        lIndex++;
    }
    else if(key.key == ' ' && lIndex != 0 && lIndex != wordSizes[wIndex-1] ){
        allWords[wIndex].style.textDecoration = "underline";
        lIndex=wordSizes[wIndex];
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
    const wordSpan = document.getElementById("words");
    for (let i = 0; i < wordNum; i++) {
        let chosenWord = randomWord();
        if(i!=0)
            wordSizes[i] = chosenWord.length + wordSizes[i-1];
        else
            wordSizes[i] = chosenWord.length;
        wordSpan.innerHTML += formatWord(chosenWord);
    }
}
function newGame() {
    lIndex=0;
    wIndex=0;
    let wordSpan = document.getElementById("words");
    wordSpan.innerHTML = "";
    renderWords(10);
    allLetters = wordSpan.querySelectorAll("span");
    allWords = wordSpan.querySelectorAll("div");
}
newGame();
const reset = (document.getElementById("reset-button").onclick = newGame);

