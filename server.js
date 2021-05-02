const { createHash } = require('crypto');
const express = require('express');
const path = require('path');
const port = process.env.PORT || 80;



//Express Setup ---------------------------------------------------------------------------------------------
const app = express();
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