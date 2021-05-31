// Grab the news container
let news1 = document.querySelector('.news1');
let news2 = document.querySelector('.news2');


fetch('http://api.mediastack.com/v1/news?access_key=04688a10ee5bde3f8341027933219ae7&%20countries=in&%20keywords=crime&languages=en&limit=100', {
    
})
    .then(res => {
        return res.json()
    })
    .then(Articles => {
        console.log(Articles.data)
        let articles = Articles.data

        let num2 = 0;
        let num1 = Math.floor(Math.random() * (articles.length - 1)) + 1;
        if(num1 == 0){
            num2 = num1 + 1;
        }
        else{
            num2 = num1 - 1;
        }

        let image1;
        let image2; 

        if(articles[num1].image == null){
            image1 = `../public/img/NEWS.png`;
        
        }
        else{
            image1 = articles[num1].image
        }

        if(articles[num2].image == null){
            image2 = `../public/img/NEWS.png`;
        
        }
        else{
            image2 = articles[num2].image
        }

        let News1 = `<img src="${image1}" alt="" srcset="" />
        <div class="text">
            <h3>${articles[num1].title}</h3>
            <p>${articles[num1].description}</p>
            <a href="${articles[num1].url}" target = "_blank">Read More</a>
            </div>`;

            
        let News2 = `<div class="text">
            <h3>${articles[num2].title}</h3>
            <p>${articles[num2].description}</p>
            <a href="${articles[num2].url}" target = "_blank">Read More</a>
        </div>
        <img src="${image2}" alt="" srcset="" />`;

        news1.innerHTML = News1;
        news2.innerHTML = News2;
    })
    .catch(error => console.log('ERROR'))