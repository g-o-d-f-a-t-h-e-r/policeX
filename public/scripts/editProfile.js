const defaultBtn1 = document.querySelector("#default-btn1")
const customBtn1 = document.querySelector("#custom-btn1")
const img1 = document.querySelector("#img1")
const fileName1 = document.querySelector("#fileName1")
const cancelBtn1 = document.querySelector('#cancel-btn1')
const wrapper1 = document.querySelector(".wrapper1");

const defaultBtn2 = document.querySelector("#default-btn2")
const customBtn2 = document.querySelector("#custom-btn2")
const img2 = document.querySelector("#img2")
const fileName2 = document.querySelector("#fileName2")
const cancelBtn2 = document.querySelector('#cancel-btn2')
const wrapper2 = document.querySelector(".wrapper2");

let regExp = /[0-9a-zA-Z\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\.\%\+\~\_]+$/;



//  For image 1 ---------------------------------------------------------------------------------------------
const defaultBtnActive1 = () =>{
    defaultBtn1.click();
}


defaultBtn1.addEventListener("change", function(){
    const file = this.files[0];

    if(file){
        const reader = new FileReader();
        reader.onload = () =>{
            const result = reader.result;
            img1.src = result;
            wrapper1.classList.add("active");
        }


        reader.readAsDataURL(file);
    }

    if(this.value){
        let valueStore = this.value.match(regExp);
        fileName1.textContent = valueStore;
    }
})

cancelBtn1.addEventListener("click", () => {
    img1.src = "";
    wrapper1.classList.remove("active");
})


// For image 2 -----------------------------------------------------------------------------------------------
const defaultBtnActive2 = () =>{
    defaultBtn2.click();
}


defaultBtn2.addEventListener("change", function(){
    const file = this.files[0];

    if(file){
        const reader = new FileReader();
        reader.onload = () =>{
            const result = reader.result;
            img2.src = result;
            wrapper2.classList.add("active");
        }


        reader.readAsDataURL(file);
    }

    if(this.value){
        let valueStore = this.value.match(regExp);
        fileName2.textContent = valueStore;
    }
})

cancelBtn2.addEventListener("click", () => {
    img2.src = "";
    wrapper2.classList.remove("active");
})

