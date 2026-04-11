import { formatWord } from "./utils";
import { wpm, accuracy, time, rawWpm, correct, incorrect, extra, missed, sendData } from "./stats";

export function mainScreen() {
  let container = document.getElementById("container");
  let container2 = document.getElementById("container2");
  if (!container || !container2) return;
  container2.style.display = "none";
  container.style.display = "flex";
}

export function statsScreen(timerNum, wordNum, isTimeMode) {
  let container = document.getElementById("container");
  let container2 = document.getElementById("container2");
  if (!container || !container2) return;
  container2.style.display = "flex";
  container.style.display = "none";
  const wpmEl = document.getElementById("wpm");
  const rawWpmEl = document.getElementById("rawwpm");
  const accEl = document.getElementById("acc");
  const timeEl = document.getElementById("time");
  if (!wpmEl || !rawWpmEl || !accEl || !timeEl) return;
  wpmEl.innerHTML = wpm.toFixed(0);
  rawWpmEl.innerHTML = rawWpm.toFixed(0);
  
  // Set characters with tooltip preserved
  const charactersEl = document.getElementById("characters");
  if (!charactersEl) return;
  const tooltip = charactersEl.querySelector('.tooltip');
  const value = `${correct}/${incorrect}/${extra}/${missed}`;
  if (tooltip) {
    charactersEl.innerHTML = value + tooltip.outerHTML;
  } else {
    charactersEl.innerHTML = value;
  }
  
  accEl.innerHTML = accuracy.toFixed(0) + "%";
  timeEl.innerHTML = time.toFixed(1) + "s";
  sendData(timerNum, wordNum, isTimeMode);
}

export async function renderWords(wordNum) {
  const numbers = document.getElementById("numbers");
  const punctuation = document.getElementById("punctuation");
  let wordSpan = document.getElementById("words");
  if (!wordSpan) return;
  
  try {
    const response = await fetch(`/home/words?amount=${wordNum}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    console.log(`Requested ${wordNum} words, received ${data.length} words from backend`);
    // Assuming backend returns array of objects: [{word: "example"}, ...]
    // or array of strings. Adjust based on actual PHP return.
    // Based on previous context, it returns fetchAll(PDO::FETCH_ASSOC), so it is [{word: "..."}]
    
    for (let i = 0; i < data.length; i++) {
        let chosenWord = data[i].word;
        
        // Numbers logic - 10% chance to replace word with a random number
        if (numbers && numbers.classList.contains("active") && Math.random() < 0.1) {
          chosenWord = String(Math.floor(Math.random() * 1000));
        }
        
        // Punctuation logic - 30% chance to add punctuation
        if (punctuation && punctuation.classList.contains("active")) {
          const suffix = [",", ".", "?", "!", ";", ":"];
          if (Math.random() < 0.3) {
            chosenWord += suffix[Math.floor(Math.random() * suffix.length)];
          }
        }

        if (wordSpan.lastElementChild && wordSpan.lastElementChild.id == "cursor") {
          wordSpan.lastElementChild.insertAdjacentHTML(
            "beforebegin",
            formatWord(chosenWord)
          );
          // Set attributes on the newly added word (it's before cursor)
          const newWord = wordSpan.lastElementChild.previousElementSibling;
          if (newWord && newWord.id !== "cursor") {
            newWord.setAttribute("size", String(newWord.children.length));
            newWord.setAttribute("typedletters", "0");
          }
        } else {
          wordSpan.innerHTML += formatWord(chosenWord);
          // Set attributes on the newly added word (it's the last element)
          const newWord = wordSpan.lastElementChild;
          if (newWord) {
            newWord.setAttribute("size", String(newWord.children.length));
            newWord.setAttribute("typedletters", "0");
          }
        }
    }
  } catch (error) {
    console.error('Error fetching words:', error);
    // Fallback or error handling
  }
}

export function wordsAnimation() {
  let typingLines = document.getElementById("words");
  let typingArea = document.querySelector(".typing-area") as HTMLElement | null;
  if (!typingLines) return;
  
  // Add fade animation to words
  typingLines.classList.add("fade");
  setTimeout(() => {
    typingLines.classList.remove("fade");
  }, 400);
  
  // Add fadeOnly animation to typing area (no vertical movement, just fade)
  if (typingArea) {
    typingArea.style.animation = "none";
    // Force reflow to restart animation
    void typingArea.offsetWidth;
    typingArea.style.animation = "fadeOnly 0.5s ease-in-out";
  }
}

export function moveCursor(currentLetter, currentWord) {
  if (!currentLetter) return;

  let cursor = document.getElementById("cursor");
  if (!cursor) return;
  cursor.hidden = false;
  let wordSpan = document.getElementById("words");
  if (!wordSpan) return;

  const letterRect = currentLetter.getBoundingClientRect();
  const wordsRect = wordSpan.getBoundingClientRect();

  // Calculate position relative to the #words container
  const offsetLeft = letterRect.left - wordsRect.left;
  const offsetTop = letterRect.top - wordsRect.top + wordSpan.scrollTop; // Add scrollTop adjustment
  const offsetRight = letterRect.right - wordsRect.left;

  // Update cursor size and position (2x letter height for better visibility)
  const cursorHeight = letterRect.height * 0.6;
  cursor.style.height = `${cursorHeight}px`;
  // Center cursor vertically on the letter
  cursor.style.top = `${offsetTop - (cursorHeight - letterRect.height) / 2}px`;

  if (
    currentLetter.classList.contains("correct") ||
    currentLetter.classList.contains("incorrect")
  ) {
    cursor.style.left = `${offsetRight}px`;
  } else {
    cursor.style.left = `${offsetLeft - 1}px`;
  }

  // Guard for missing currentWord
  if (!currentWord) return false;
  
  // Get line height from current word (accounts for font size + line-height)
  const lineHeight = currentWord.offsetHeight;
  
  // Calculate which line the cursor is on (0-indexed)
  const cursorLinePosition = letterRect.top - wordsRect.top;
  const currentLine = Math.floor((cursorLinePosition + wordSpan.scrollTop) / lineHeight);
  
  // Calculate what the scroll should be to keep cursor on the first visible line
  const targetScrollTop = currentLine * lineHeight;
  
  // Only scroll if we've moved to a new line
  const currentScrollLine = Math.floor(wordSpan.scrollTop / lineHeight);
  
  if (currentLine > currentScrollLine) {
    // Smooth scroll to align the current line at the top
    wordSpan.scrollTop = targetScrollTop;
  }
  
  // Check if we need more words - if cursor is within last 2 lines of content
  const totalContentHeight = wordSpan.scrollHeight;
  const visibleBottom = wordSpan.scrollTop + wordSpan.clientHeight;
  const distanceFromEnd = totalContentHeight - visibleBottom;
  
  // Return true if less than 2 line heights from the end
  if (distanceFromEnd < lineHeight * 2) {
    return true;
  }
  
  return false;
}

export function resetActiveButtons(buttonGroup) {
  buttonGroup.forEach((button) => button.classList.remove("active"));
}

export function activateButton(activeButton, inactiveButton) {
  activeButton.classList.add("active");
  inactiveButton.classList.remove("active");
}

export function updateTimerDisplay(value) {
  let timerElement = document.querySelector(".timernum");
  timerElement.textContent = `${value}s`;
}

export function updateWordsProgress(completed, total) {
  let timerElement = document.querySelector(".timernum");
  timerElement.textContent = `${completed}/${total}`;
}

export function showTimer() {
  const timer = document.getElementById("timer");
  if (timer) {
    timer.classList.remove("hidden");
    timer.classList.add("visible");
  }
}

export function hideTimer() {
  const timer = document.getElementById("timer");
  if (timer) {
    timer.classList.add("hidden");
    timer.classList.remove("visible");
  }
}

// Focus Mode - hides everything except typing area and timer when typing starts
let focusModeDebounceTimer = null;

export function enterFocusMode() {
  // Clear any pending debounce
  if (focusModeDebounceTimer) {
    clearTimeout(focusModeDebounceTimer);
  }
  
  document.body.classList.add("focus-mode");
  
  // Add mousemove listener after a short delay to prevent immediate exit
  focusModeDebounceTimer = setTimeout(() => {
    document.addEventListener("mousemove", handleMouseMoveExit);
  }, 100);
}

export function exitFocusMode() {
  // Clear debounce timer
  if (focusModeDebounceTimer) {
    clearTimeout(focusModeDebounceTimer);
    focusModeDebounceTimer = null;
  }
  
  document.body.classList.remove("focus-mode");
  // Remove mousemove listener when exiting focus mode
  document.removeEventListener("mousemove", handleMouseMoveExit);
}

export function isFocusModeActive() {
  return document.body.classList.contains("focus-mode");
}

// Handler for mouse movement to exit focus mode
function handleMouseMoveExit() {
  exitFocusMode();
}
