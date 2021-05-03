// Grab the news container
let news1 = document.querySelector('.news1');
let news2 = document.querySelector('.news2');


fetch('http://newsapi.org/v2/top-headlines?country=in&apiKey=e56e87add54441be86d6d05eb30b5134', {
    method: 'GET'
})
    .then(res => {
        return res.json()
    })
    .then(Articles => {
        console.log(Articles.articles)
        let articles = Articles.articles

        let num2 = 0;
        let num1 = Math.floor(Math.random() * (articles.length - 1)) + 1;
        if(num1 == 0){
            num2 = num1 + 1;
        }
        else{
            num2 = num1 - 1;
        }

        
        let News1 = `<img src="${articles[num1].urlToImage}" alt="" srcset="" />
        <div class="text">
            <h3>${articles[num1].title}</h3>
            <p>${articles[num1].content}</p>
            <a href="${articles[num1].url}" target = "_blank">Read More</a>
            </div>`;

            
        let News2 = `<div class="text">
            <h3>${articles[num2].title}</h3>
            <p>${articles[num2].content}</p>
            <a href="${articles[num2].url}" target = "_blank">Read More</a>
        </div>
        <img src="${articles[num2].urlToImage}" alt="" srcset="" />`;

        news1.innerHTML = News1;
        news2.innerHTML = News2;
    })
    .catch(error => console.log('ERROR'))