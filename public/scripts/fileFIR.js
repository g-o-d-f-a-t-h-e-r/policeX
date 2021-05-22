

// HIDE AND SHOW of isKnown alleged Details...
const yes = [...document.querySelectorAll('.yes')]

const display = (val) => {
    if(val == 'yes'){
        yes.map((item) => {
            item.classList.add('active')
        })
    }
    if(val == 'no'){
        yes.map((item) => {
            item.classList.remove('active')
        })
    }
}





// Frontend Image -----------------------------------------------------------------------------------------
const defaultBtn = document.getElementById('default-btn');
const img = document.getElementById('img')
const wrapper = document.querySelector('.wrapper');
const cancelBtn = document.getElementById('cancel-btn')

const fileName = document.querySelector('#fileName')
let regExp = /[0-9a-zA-Z\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\.\%\+\~\_]+$/;

const defaultBtnActive = ()=>{
    defaultBtn.click();
}

defaultBtn.addEventListener('change', function() {
    const file = this.files[0];
    console.log(file)

    if(file){
        const reader = new FileReader();
        reader.onload = function(){
            const result = reader.result;
            img.src = result;
        }

        reader.readAsDataURL(file);
        fileName.style.visibility = 'visible';
    }

    if(this.value){
        let valueStore = this.value.match(regExp);
        fileName.textContent = valueStore;
    }

})

// --------------------------------------------------------------------------------------------

// Loading Modal Animation-----------------------------------------------------------------

const submit = document.querySelector('.submit');
const overlay = document.getElementById('overlay');


function openModal(){
    const modal = document.querySelector('#modal')

    modal.classList.add('active')
    overlay.classList.add('active')
}



