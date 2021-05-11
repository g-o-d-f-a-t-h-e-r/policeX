const express = require('express');
const path = require('path');
const body_Parser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const url = require('./creds/url');
// const TWO_HOURS = 36;


const port = process.env.PORT || 80;

//Express Setup ---------------------------------------------------------------------------------------------
const app = express();
mongoose.connect(url.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.use('/public', express.static('public'));
app.use(body_Parser.json())
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));



let sess = {
    name : 'Police-X',
    resave: false,
    saveUninitialized: true,
    secret: url.secret,
    cookie: {}
  }
   
  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = false // serve secure cookies
    // sess.cookie.maxAge = TWO_HOURS;
  }
   
  app.use(session(sess))

//PUG Setup--------------------------------------------------------------------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));



//middleware for session----------------------------------------------------------------------------
function redirectLogin(req, res, next) {

    if(!req.session.ID){
        res.redirect('/login');
    }
    else{
        next();
    }

}

function redirectHome(req, res, next){
    
    if(req.session.ID){
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
app.post('/api/login', (req, res)=> {

    const {loginEmail, loginPassword} = req.body;

    const user = User.findOne({
        emailAdd : loginEmail
    })
    .then(async (user) => {
        if(user){
            const status = await bcrypt.compare(loginPassword, user.key);

            if(status){
                req.session.ID = user._id;
                req.session.emailAdd = user.emailAdd;
                req.session.fName = user.fName;
                req.session.lName = user.lName;

                res.redirect('/dashboard');
            }else{

                res.render('login', {
                    error : 'loginErr'
                })
                console.log('Invalid Email ID / Password');
            }

        }
        else{
            res.render('login', {
                error : 'loginErr'
            })
            console.log('Invalid User ID / Password');
        }
    })
    .catch((error) => {
        console.log(error);
    })

})

// -------------------------------------------------------------------------------------------------------------



// ------------------------------------------SIGNUP -------------------------------------------------------------
app.post('/api/register', async(req, res)=>{
        
    const { fName, lName, emailAdd, pass } = req.body;
    
    console.log(pass);
    console.log(emailAdd);

    const key = await bcrypt.hash(pass, 10);

    User.findOne({
        emailAdd
    })
    .then((user) => {
        if(!user){

            const userObj = {
                fName : fName,
                lName : lName,
                emailAdd : emailAdd,
                key : key
            }

            new User(userObj).save()
                .then((user) => {
                    console.log('User Registered')

                    req.session.ID = user._id;
                    req.session.emailAdd = user.emailAdd;
                    req.session.fName = user.fName;
                    req.session.lName = user.lName;

                    console.log('session', req.session);

                    res.redirect('/dashboard');

                })
                .catch((error) => {
                    console.log('Unable to save into database', error);
                })
        }else{
            console.log('Email ID already exists');
            res.render('login', {
                error : 'regErr'
            })
        }
    })
    .catch((error) => {
        console.log(error);
    })

})
// -------------------------------------------------------------------------------------------------------------



// ---------------------------------------------- DASHBOARD -----------------------------------------------------

app.get('/dashboard', redirectLogin, (req, res) => {
    res.status(200).render('dashboard.pug', {
        fName: req.session.fName,
    });
})

// -------------------------------------------------------------------------------------------------------------

app.get('/myProfile', redirectLogin, (req, res) => {
    res.status(200).render('ahed.pug')
})

app.get('/fileFIR', redirectLogin, (req, res) => {
    res.status(200).render('ahed.pug')
})

app.get('/myCases', redirectLogin, (req, res) => {
    res.status(200).render('ahed.pug')
})

app.get('/inform', redirectLogin, (req, res) => {
    res.status(200).render('ahed.pug')
})

app.get('/missingPerson', redirectLogin, (req, res) => {
    res.status(200).render('ahed.pug')
})

app.get('/accountSettings', redirectLogin, (req, res) => {
    res.status(200).render('ahed.pug')
})

// -------------------------------------------------LOGOUT ------------------------------------------------------

app.post('/logout', (req, res) => {

    req.session.destroy((err) => {
        if(err){
            res.redirect('/dashboard');
        }else{
            res.redirect('/login');
        }
    })

})

// --------------------------------------------------------------------------------------------------------------

//Listen ---------------------------------------------------------------------------------------------------
app.listen(port, () =>{
    console.log(`The app is running on the port : ${port}`);
})