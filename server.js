const { createHash } = require('crypto');
const express = require('express');
const path = require('path');
const cors = require('cors');


const port = process.env.PORT || 80;

//Express Setup ---------------------------------------------------------------------------------------------
const app = express();

app.use(cors());

app.get('/products/:id', function (req, res, next) {
    res.json({msg: 'This is CORS-enabled for all origins!'})
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