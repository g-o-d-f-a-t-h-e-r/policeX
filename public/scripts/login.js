
const loginForm = document.querySelector("form.login");
const signupForm = document.querySelector("form.signup");
const loginBtn = document.querySelector("label.login");
const signupBtn= document.querySelector("label.signup");
const signupLink = document.querySelector(".signup-link a");
const loginText = document.querySelector(".title-text .login")
const signupText = document.querySelector(".title-text .signup")

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





// USER SIGNUP--------------------------------------------------------------------------------------------------

const regForm = document.getElementById('reg-form');
regForm.addEventListener('submit', registerUser);

async function registerUser(event){
    event.preventDefault()
    const fName = document.getElementById('fName').value;
    const lName = document.getElementById('lName').value;
    const email_address = document.getElementById('emailAdd').value;
    const pass = document.getElementById('pass').value;
    const cpass = document.getElementById('cpass').value;

    if(pass === cpass){
        const result = await fetch('/api/register', {
            method: 'POST',
            headers:{
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                fName,
                lName,
                email_address,
                pass
            })
        }).then((res) => res.json())

        console.log(result)
    }
    else{
        console.log('Password did not match')
    }
}