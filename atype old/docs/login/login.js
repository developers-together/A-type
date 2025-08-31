const signup_button = document.getElementById("signup-button");
const signup_form = document.getElementById("signup-form");
function checkInputs() {
    const inputs = signup_form.querySelectorAll('input');
    const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
    signup_button.disabled = !allFilled;
}
signup_form.addEventListener('input', checkInputs);

const login_button = document.getElementById("login-button");
const login_form = document.getElementById("login-form");
function checkInputs2() {
    const inputs = login_form.querySelectorAll('input');
    const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
    login_button.disabled = !allFilled;
}
login_form.addEventListener('input', checkInputs2);
