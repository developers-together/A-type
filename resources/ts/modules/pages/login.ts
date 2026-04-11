export function initLogin() {
  const signup_button = document.getElementById("signup-button") as HTMLButtonElement | null;
  const signup_form = document.getElementById("signup-form");
  
  if (signup_form && signup_button) {
    function checkInputs() {
        const inputs = signup_form.querySelectorAll('input');
        const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
        signup_button.disabled = !allFilled;
    }
    signup_form.addEventListener('input', checkInputs);
  }

  const login_button = document.getElementById("login-button") as HTMLButtonElement | null;
  const login_form = document.getElementById("login-form");
  
  if (login_form && login_button) {
    function checkInputs2() {
        const inputs = login_form.querySelectorAll('input');
        const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
        login_button.disabled = !allFilled;
    }
    login_form.addEventListener('input', checkInputs2);
  }
}
