export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle') || document.getElementById('theme-btn');
  const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
  let currentTheme = localStorage.getItem('theme') || 'dark';

  // Apply saved theme on page load
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (themeIcon) {
    if (currentTheme === 'light') {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
  }

  // Add event listener for theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', (event) => {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      // Get button position for transition origin
      const buttonRect = themeToggle.getBoundingClientRect();
      const buttonX = buttonRect.left + buttonRect.width/2;
      const buttonY = buttonRect.top + buttonRect.height/2;
      setTheme(newTheme, buttonX, buttonY);
      currentTheme = newTheme; // Update local variable
    });
  }
}

function setTheme(theme, originX, originY) {
  const themeToggle = document.getElementById('theme-toggle') || document.getElementById('theme-btn');
  const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

  // Create transition element with the current theme's background color
  const root = document.documentElement;
  
  // Create and apply the transition effect
  const transition = document.createElement('div');
  transition.className = 'theme-transition';
  
  // Set the origin point for the transition
  if (originX && originY) {
    const originPercentX = (originX / window.innerWidth) * 100;
    const originPercentY = (originY / window.innerHeight) * 100;
    transition.style.setProperty('--origin-x', `${originPercentX}%`);
    transition.style.setProperty('--origin-y', `${originPercentY}%`);
  }
  
  // Use the target theme's background color for the transition element
  if (theme === 'light') {
    transition.style.backgroundColor = 'var(--bgcolor-light)';
  } else {
    transition.style.backgroundColor = 'var(--bgcolor-dark)';
  }
  
  document.body.appendChild(transition);
  
  // Force reflow to ensure animation starts
  void transition.offsetWidth;
  
  // Wait for animation to reach halfway before changing the theme
  setTimeout(() => {
    // Apply the new theme colors at the midpoint of the animation
    if (theme === 'light') {
      root.style.setProperty('--bgcolor', 'var(--bgcolor-light)');
      root.style.setProperty('--btncolor', 'var(--btncolor-light)');
      root.style.setProperty('--dtext', 'var(--dtext-light)');
      root.style.setProperty('--text', 'var(--text-light)');
    } else {
      root.style.setProperty('--bgcolor', 'var(--bgcolor-dark)');
      root.style.setProperty('--btncolor', 'var(--btncolor-dark)');
      root.style.setProperty('--dtext', 'var(--dtext-dark)');
      root.style.setProperty('--text', 'var(--text-dark)');
    }
    
    // Set the theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update icon
    if (themeIcon) {
      if (theme === 'light') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      }
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Start fade out
    transition.classList.add('out');
    
    // Remove element after animation completes
    setTimeout(() => {
      transition.remove();
    }, 600);
  }, 300); // This timing should be approximately half of the animation duration
}