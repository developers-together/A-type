import { handleInput, newGame, setTimerNum, setWordNum, setCurrentWordsCount, setCooldown, gameLoop } from "./game.js";
import { activateButton, resetActiveButtons } from "./ui.js";

export function initEvents() {
  // Keydown event
  document.onkeydown = handleInput;

  // Back button
  let backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      newGame();
    });
  }

  // Reset button
  const resetButton = document.getElementById("reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resetButton.classList.add("rotate-animation");
      newGame();
      setTimeout(() => {
        resetButton.classList.remove("rotate-animation");
      }, 500);
    });
  }

  // Mobile menu
  const mobileButton = document.querySelector(".mobile-button");
  const mobileMenu = document.getElementById("mobileMenu");
  
  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      document.getElementById("container").classList.toggle("blurred");
    });

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
  }

  // Control Buttons
  setupControlButtons();

  // Game Loop
  setInterval(gameLoop, 0);
}

function setupControlButtons() {
    const timeButton = document.getElementById("time-button");
    const wordsButton = document.getElementById("words-button");
    const punctuation = document.getElementById("punctuation");
    const numbers = document.getElementById("numbers");
    const timer = document.getElementById("timer");
    
    // Helper to get all btn elements
    const btn1 = document.querySelector(".btn1");
    const btn2 = document.querySelector(".btn2");
    const btn3 = document.querySelector(".btn3");
    const btn4 = document.querySelector(".btn4");
    
    const btns = [btn1, btn2, btn3, btn4];
    const mobileBtns = [
        document.getElementById("btn1-mobile"),
        document.getElementById("btn2-mobile"),
        document.getElementById("btn3-mobile"),
        document.getElementById("btn4-mobile"),
    ];

    // Shared event listener helper
    function addSharedEventListener(buttonId, mobileButtonId, eventHandler) {
        const btn = document.getElementById(buttonId);
        const mobileBtn = document.getElementById(mobileButtonId);
        if (btn) btn.addEventListener("click", eventHandler);
        if (mobileBtn) mobileBtn.addEventListener("click", eventHandler);
    }

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
        resetActiveButtons(btns);
        resetActiveButtons(mobileBtns);
        
        // Default to first option (15s)
        btn1.classList.add("active");
        document.getElementById("btn1-mobile").classList.add("active");
        
        setTimerNum(15);
        document.querySelector(".timernum").textContent = "15s";
        
        // Update button text
        btn1.textContent = "15";
        btn2.textContent = "30";
        btn3.textContent = "60";
        btn4.textContent = "120";
        document.getElementById("btn1-mobile").textContent = "15";
        document.getElementById("btn2-mobile").textContent = "30";
        document.getElementById("btn3-mobile").textContent = "60";
        document.getElementById("btn4-mobile").textContent = "120";
    }

    function handleWordsButtonClick() {
        activateButton(wordsButton, timeButton);
        activateButton(
            document.getElementById("words-mobile"),
            document.getElementById("time-mobile")
        );
        newGame();
        timer.classList.add("hidden");
        resetActiveButtons(btns);
        resetActiveButtons(mobileBtns);
        
        // Default to first option (15 words)
        btn1.classList.add("active");
        document.getElementById("btn1-mobile").classList.add("active");
        
        setCurrentWordsCount(15);
        
        // Update button text
        btn1.textContent = "15";
        btn2.textContent = "30";
        btn3.textContent = "60";
        btn4.textContent = "120";
        document.getElementById("btn1-mobile").textContent = "15";
        document.getElementById("btn2-mobile").textContent = "30";
        document.getElementById("btn3-mobile").textContent = "60";
        document.getElementById("btn4-mobile").textContent = "120";
    }

    function handleBtn1Click() {
        resetActiveButtons(btns);
        resetActiveButtons(mobileBtns);
        btn1.classList.add("active");
        document.getElementById("btn1-mobile").classList.add("active");
        
        if (wordsButton.classList.contains("active")) {
            setCurrentWordsCount(15);
        } else {
            setTimerNum(15);
            document.querySelector(".timernum").textContent = "15s";
        }
        newGame();
    }

    function handleBtn2Click() {
        resetActiveButtons(btns);
        resetActiveButtons(mobileBtns);
        btn2.classList.add("active");
        document.getElementById("btn2-mobile").classList.add("active");
        
        if (wordsButton.classList.contains("active")) {
            setCurrentWordsCount(30);
        } else {
            setTimerNum(30);
            document.querySelector(".timernum").textContent = "30s";
        }
        newGame();
    }

    function handleBtn3Click() {
        resetActiveButtons(btns);
        resetActiveButtons(mobileBtns);
        btn3.classList.add("active");
        document.getElementById("btn3-mobile").classList.add("active");
        
        if (wordsButton.classList.contains("active")) {
            setCurrentWordsCount(60);
        } else {
            setTimerNum(60);
            document.querySelector(".timernum").textContent = "60s";
        }
        newGame();
    }

    function handleBtn4Click() {
        resetActiveButtons(btns);
        resetActiveButtons(mobileBtns);
        btn4.classList.add("active");
        document.getElementById("btn4-mobile").classList.add("active");
        
        if (wordsButton.classList.contains("active")) {
            setCurrentWordsCount(120);
        } else {
            setTimerNum(120);
            document.querySelector(".timernum").textContent = "120s";
        }
        newGame();
    }

    addSharedEventListener("punctuation", "punctuation-mobile", handlePunctuationClick);
    addSharedEventListener("numbers", "numbers-mobile", handleNumbersClick);
    addSharedEventListener("time-button", "time-mobile", handleTimeButtonClick);
    addSharedEventListener("words-button", "words-mobile", handleWordsButtonClick);
    addSharedEventListener("btn1", "btn1-mobile", handleBtn1Click);
    addSharedEventListener("btn2", "btn2-mobile", handleBtn2Click);
    addSharedEventListener("btn3", "btn3-mobile", handleBtn3Click);
    addSharedEventListener("btn4", "btn4-mobile", handleBtn4Click);
}
