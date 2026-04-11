import { handleInput, newGame, setTimerNum, setWordNum, setCurrentWordsCount, gameLoop } from "./game";
import { activateButton, resetActiveButtons } from "./ui";

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

  // Logo click - on home page: reload game, on other pages: go to home
  const logo = document.getElementById("logo");
  if (logo) {
    logo.addEventListener("click", () => {
      const isHomePage = window.location.pathname === "/" || 
                         window.location.pathname === "/Home" || 
                         window.location.pathname.toLowerCase() === "/home";
      
      if (isHomePage && typeof newGame === "function") {
        // On home page - just reload the typing game
        newGame();
      } else {
        // On other pages - navigate to home
        window.location.href = "/home";
      }
    });
  }

  // Mobile menu
  const mobileButton = document.querySelector(".mobile-button");
  const mobileMenu = document.getElementById("mobileMenu");
  
  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      const container = document.getElementById("container");
      if (container) {
        container.classList.toggle("blurred");
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        mobileMenu.classList.add("hidden");
        const container = document.getElementById("container");
        if (container) {
          container.classList.remove("blurred");
        }
      }
    });

    window.addEventListener("click", (event) => {
      const target = event.target as Node | null;
      if (
        target &&
        !mobileButton.contains(target) &&
        !mobileMenu.contains(target)
      ) {
        mobileMenu.classList.add("hidden");
        const container = document.getElementById("container");
        if (container) {
          container.classList.remove("blurred");
        }
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
    console.log("Home Page | Init | Controls | Setup");
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
        
        // Show numbers pill
        const numbersPill = document.getElementById("buttons-numbers");
        if (numbersPill) {
            numbersPill.classList.remove("hidden");
            numbersPill.classList.add("visible");
        }
        
        resetActiveButtons(btns);
        resetActiveButtons(mobileBtns);
        
        // Default to first option (15s)
        btn1.classList.add("active");
        document.getElementById("btn1-mobile").classList.add("active");
        
        console.log("Home Page | Mode Click | Time Button | Active");
        
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
        
        // Call newGame at the end
        newGame();
    }

    function handleWordsButtonClick() {
        activateButton(wordsButton, timeButton);
        activateButton(
            document.getElementById("words-mobile"),
            document.getElementById("time-mobile")
        );
        
        // Show numbers pill
        const numbersPill = document.getElementById("buttons-numbers");
        if (numbersPill) {
            numbersPill.classList.remove("hidden");
            numbersPill.classList.add("visible");
        }
        
        resetActiveButtons(btns);
        resetActiveButtons(mobileBtns);
        
        // Default to first option (10 words)
        btn1.classList.add("active");
        document.getElementById("btn1-mobile").classList.add("active");
        
        // Set word count BEFORE calling newGame
        setCurrentWordsCount(10);
        setWordNum(10);
        console.log("Home Page | Mode Click | Words Button | Active");
        console.log("Home Page | Setting Value | Words | 10");
        
        // Update button text
        btn1.textContent = "10";
        btn2.textContent = "25";
        btn3.textContent = "50";
        btn4.textContent = "100";
        document.getElementById("btn1-mobile").textContent = "10";
        document.getElementById("btn2-mobile").textContent = "25";
        document.getElementById("btn3-mobile").textContent = "50";
        document.getElementById("btn4-mobile").textContent = "100";
        
        // Now call newGame with correct word count
        newGame();
    }

    function handleBtn1Click() {
        resetActiveButtons(btns);
        resetActiveButtons(mobileBtns);
        btn1.classList.add("active");
        document.getElementById("btn1-mobile").classList.add("active");
        
        if (wordsButton.classList.contains("active")) {
            console.log("Home Page | Button Click | Words Option 1 | 10");
            setCurrentWordsCount(10);
            setWordNum(10);
        } else {
            console.log("Home Page | Button Click | Time Option 1 | 15s");
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
            console.log("Home Page | Button Click | Words Option 2 | 25");
            setCurrentWordsCount(25);
            setWordNum(25);
        } else {
            console.log("Home Page | Button Click | Time Option 2 | 30s");
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
            console.log("Home Page | Button Click | Words Option 3 | 50");
            setCurrentWordsCount(50);
            setWordNum(50);
        } else {
            console.log("Home Page | Button Click | Time Option 3 | 60s");
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
            console.log("Home Page | Button Click | Words Option 4 | 100");
            setCurrentWordsCount(100);
            setWordNum(100);
        } else {
            console.log("Home Page | Button Click | Time Option 4 | 120s");
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
    
    // Initialize default mode: Words with 10 button active
    if (wordsButton) {
        // Set up Words mode as default
        wordsButton.classList.add("active");
        if (document.getElementById("words-mobile")) {
            document.getElementById("words-mobile").classList.add("active");
        }
        
        // Show numbers pill
        const numbersPill = document.getElementById("buttons-numbers");
        if (numbersPill) {
            numbersPill.classList.remove("hidden");
            numbersPill.classList.add("visible");
        }
        
        // Set btn1 as active (10 words)
        btn1.classList.add("active");
        if (document.getElementById("btn1-mobile")) {
            document.getElementById("btn1-mobile").classList.add("active");
        }
        
        // Set button text for Words mode
        btn1.textContent = "10";
        btn2.textContent = "25";
        btn3.textContent = "50";
        btn4.textContent = "100";
        if (document.getElementById("btn1-mobile")) document.getElementById("btn1-mobile").textContent = "10";
        if (document.getElementById("btn2-mobile")) document.getElementById("btn2-mobile").textContent = "25";
        if (document.getElementById("btn3-mobile")) document.getElementById("btn3-mobile").textContent = "50";
        if (document.getElementById("btn4-mobile")) document.getElementById("btn4-mobile").textContent = "100";
        
        // Set default word count
        setCurrentWordsCount(10);
        setWordNum(10);
    }
}
