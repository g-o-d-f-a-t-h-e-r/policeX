var lastScrollTop = 0;
var navbar = document.getElementById("nav-area")
window.addEventListener("scroll", function(){
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if(scrollTop > lastScrollTop){
        navbar.style.top = "-200px";
    }
    else{
        navbar.style.top = "0";
    }

    lastScrollTop = scrollTop;
})

// Auto Image scroll----------------------------------------------------
let counter = 1;
setInterval(function(){
    document.getElementById("radio" + counter).checked = true;
    counter++;
    if(counter > 4){
        counter = 1;
    }
},10000);

console.log("HelLo chetan")