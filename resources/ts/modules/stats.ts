export let wpm = 0;
export let accuracy = 0;
export let correct = 0;
export let incorrect = 0;
export let extra = 0;
export let missed = 0;
export let time = 0;
export let rawWpm = 0;
export let totalTyped = 0;
export let typed = 0;
export let totalLetters = 0;
export let numberOfLettersInCorrectWords = 0;
export let startTime = 0;
export let endTime = 0;

export function resetStats() {
  wpm = 0;
  accuracy = 0;
  correct = 0;
  incorrect = 0;
  extra = 0;
  missed = 0;
  time = 0;
  rawWpm = 0;
  totalTyped = 0;
  typed = 0;
  totalLetters = 0;
  numberOfLettersInCorrectWords = 0;
  startTime = 0;
  endTime = 0;
}

export function setStartTime(val) {
  startTime = val;
}

export function incrementTotalTyped() {
  totalTyped++;
}

export function incrementTyped() {
  typed++;
}

export function calculateMetrics() {
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
  time = (endTime - startTime) / 1000;
  checkCorrect();
  accuracy = totalTyped > 0 ? (correct / totalTyped) * 100 : 0;
  rawWpm = time > 0 ? typed / 5 / (time / 60) : 0;
  wpm = time > 0 ? numberOfLettersInCorrectWords / 5 / (time / 60) : 0;
  printVariables();

  return {
    wpm,
    accuracy,
    rawWpm,
    time,
  };
}

function checkCorrect() {
  let wordSpan = document.getElementById("words");
  if (!wordSpan) return;
  
  // Find the actual last word (excluding cursor element)
  let actualLastWord = null;
  for (let i = wordSpan.children.length - 1; i >= 0; i--) {
    if (wordSpan.children[i].id !== "cursor") {
      actualLastWord = wordSpan.children[i];
      break;
    }
  }
  
  for (let word of wordSpan.children) {
    // Skip the cursor element - it's not a word
    if (word.id === "cursor") continue;
    
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
    if (word === actualLastWord) {
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

export function sendData(timerNum, wordNum, isTimeMode) {
  const punctuation = document.getElementById("punctuation");
  const numbers = document.getElementById("numbers");
  const csrfToken = document.querySelector('meta[name=\"csrf-token\"]')?.getAttribute('content') ?? '';
  
  let timeModeOn = isTimeMode ? 1 : 0;
  let punctuationOn = punctuation?.classList.contains("active") ? 1 : 0;
  let numbersOn = numbers?.classList.contains("active") ? 1 : 0;
  
  // Prepare data for x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append('wpm', String(Math.round(wpm)));
  formData.append('accuracy', String(accuracy.toFixed(2)));
  formData.append('mode', timeModeOn ? 'time' : 'words');
  formData.append('amount', String(timeModeOn ? timerNum : wordNum));
  formData.append('punctuation', String(punctuationOn));
  formData.append('numbers', String(numbersOn));

  console.log("Home Page | Save Data | Request | Mode: " + (timeModeOn ? 'time' : 'words') + ", Amount: " + (timeModeOn ? timerNum : wordNum));

  fetch("/home/typing", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-TOKEN": csrfToken,
      "X-Requested-With": "XMLHttpRequest",
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); 
    })
    .then((data) => console.log("Success:", data))
    .catch((error) => console.error("Error:", error));
}
