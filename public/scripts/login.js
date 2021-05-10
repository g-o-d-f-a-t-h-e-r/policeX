const loginForm = document.querySelector("form.login");
const signupForm = document.querySelector("form.signup");
const loginBtn = document.querySelector("label.login");
const signupBtn= document.querySelector("label.signup");
const signupLink = document.querySelector(".signup-link a");
const loginText = document.querySelector(".title-text .login");
const signupText = document.querySelector(".title-text .signup");
const message = document.querySelector('.msg');


signupBtn.onclick = (() => {
    loginForm.style.marginLeft = "-50%";
    loginText.style.marginLeft = "-50%";
})

signupLink.onclick = (() => {
    signupBtn.click();
    loginForm.style.marginLeft = "-50%";
    loginText.style.marginLeft = "-50%";
    return false;
})

loginBtn.onclick = (() => {
    loginForm.style.marginLeft = "0";
    loginText.style.marginLeft = "0";
})


// -------------------------------------------------------------------------------------------------------------

// HIDE MESSAGE BLOCK AFTER 5 SECS ----------------------------------------------------------------------------
window.onload = () => {
    setTimeout(() => {
        message.style.display = 'none';
    }, 10000);
}



