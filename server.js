const express = require('express');
const path = require('path');
const body_Parser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt = require('bcryptjs');



const port = process.env.PORT || 80;

//Express Setup ---------------------------------------------------------------------------------------------
const app = express();
mongoose.connect('mongodb+srv://chetan__008:chetan@1234@cluster0.nkxr5.mongodb.net/Police-X?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});


// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });


app.use('/public', express.static('public'));
app.use(body_Parser.json())

//PUG Setup--------------------------------------------------------------------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


//ENDPOINTS-------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.status(200).render('home.pug');
})

app.get('/login', (req, res) => {
    res.status(200).render('login.pug');
})



app.post('/api/register', async(req, res)=>{
        
    const { fName, lName, email_address, pass: plainTextPassword} = req.body

    const key = await bcrypt.hash(plainTextPassword, 10);

    // console.log(await bcrypt.hash(plainTextPassword, 10));
    
    console.log(plainTextPassword);
    console.log(email_address);
    
    try{

        const response = await User.create({
            fName: fName,
            lName: lName,
            email: email_address,
            password: key
        })
        console.log('User Created Successfully', response)

    }catch(error){
        console.log(JSON.stringify(error));
        if(error.code === 11000){
            return res.json({status : "error", error: 'Username already in use' });
        }
    }

    res.json({ status: 'ok' })

})


//Listen ---------------------------------------------------------------------------------------------------
app.listen(port, () =>{
    console.log(`The app is running on the port : ${port}`);
})