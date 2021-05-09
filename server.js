const express = require('express');
const path = require('path');
const body_Parser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'shfdjsfhuer89489fije490ur9@@*@(*FHN#*RNF(#*#&RFN#HIHIUHFUIHdkhfskjdhfe48y843984*&*^&HIHKJ';
const session = require('express-session');



const port = process.env.PORT || 80;

//Express Setup ---------------------------------------------------------------------------------------------
const app = express();
mongoose.connect('mongodb+srv://chetan__008:chetan@1234@cluster0.nkxr5.mongodb.net/Police-X?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.use('/public', express.static('public'));
app.use(body_Parser.json())
let sess = {
    name : 'CHETAN',
    resave: false,
    saveUninitialized: true,
    secret: 'keyboard cat',
    cookie: {}
  }
   
  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
  }
   
  app.use(session(sess))

//PUG Setup--------------------------------------------------------------------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));



//middleware for session

function redirectLogin(req, res, next) {

    if(!req.session.emailID){
        res.redirect('/login');
    }
    else{
        next();
    }

}

function redirectHome(req, res, next){
    console.log(req.session);

    if(req.session.emailID){
        res.redirect('/dashboard');
    }
    else{
        next();
    }

}

//ENDPOINTS-------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.status(200).render('home.pug');
})

app.get('/login', redirectHome, (req, res) => {
    res.status(200).render('login.pug');

})

// ------------------------------------------------------------------------------------------------------------




// ----------------------------------------- LOGIN ------------------------------------------------------------
app.post('/api/login', async (req, res)=> {
    const { loginEmail, loginPassword } = req.body
    const user = await User.findOne({ email_address : loginEmail }).lean();

    console.log(!user)

    if(!user){
        return res.json({ status : 'error', data : 'Invalid Email ID / Password' });
    }

    if(await bcrypt.compare(loginPassword, user.key)){

        const token = jwt.sign({ 
            _id : user._id, 
            email_address : user.email_address,
        },
        JWT_SECRET
        )

        req.session.emailID = user.email_address;
        console.log(req.session);

        return res.json({ status : 'ok', data : token });
    }

    // res.json({status : 'error', data : 'Invalid Email ID / Password'});
})

// -------------------------------------------------------------------------------------------------------------





// ------------------------------------------SIGNUP -------------------------------------------------------------
app.post('/api/register', async(req, res)=>{
        
    const { fName, lName, email_address, pass: plainTextPassword} = req.body

    const key = await bcrypt.hash(plainTextPassword, 10);

    
    console.log(plainTextPassword);
    console.log(email_address);

    try{
        
        const response = await User.create({
            fName,
            lName,
            email_address,
            key
        })
        console.log('user created successfully', response);

        //Create session ----------------------
        req.session.emailID = email_address;
        console.log(req.session);

        res.json({status: '1'});
        // res.redirect('/dashboard');

    }catch(error){
        
        if(error.code === 11000){
            console.log(res.json({status : '0'}));
            console.log(JSON.stringify(error));
        }
        throw error;
    }

})
// -------------------------------------------------------------------------------------------------------------






// ---------------------------------------------- DASHBOARD -----------------------------------------------------
app.get('/dashboard', redirectLogin, (req, res) => {
    res.status(200).render('dashboard.pug');
})




//Listen ---------------------------------------------------------------------------------------------------
app.listen(port, () =>{
    console.log(`The app is running on the port : ${port}`);
})