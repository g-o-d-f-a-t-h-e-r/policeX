const { response } = require('express');
const express = require('express');
const path = require('path');

const port = process.env.PORT || 80;

//Express Setup ---------------------------------------------------------------------------------------------
const app = express();

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use('/public', express.static('public'));

//PUG Setup--------------------------------------------------------------------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


//ENDPOINTS-------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.status(200).render('home.pug');

    let articles = fetch('http://newsapi.org/v2/top-headlines?country=in&apiKey=e56e87add54441be86d6d05eb30b5134', {

    })
    .then(response => {
        return response.json()
    })
    .then(Articles => {
        console.log(Articles)
    })

})


//Listen ---------------------------------------------------------------------------------------------------
app.listen(port, () =>{
    console.log(`The app is running on the port : ${port}`);
})