const { createHash } = require('crypto');
const express = require('express');
const path = require('path');
const port = process.env.PORT || 80;


//Express Setup ---------------------------------------------------------------------------------------------
const app = express();

// Add headers
app.use(function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE, OPTIONS');
    
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
})




//Listen ---------------------------------------------------------------------------------------------------
app.listen(port, () =>{
    console.log(`The app is running on the port : ${port}`);
})