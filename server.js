const express = require('express');
const path = require('path');
const body_Parser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const userProfile = require('./model/userProfile')
const bcrypt = require('bcryptjs');
const session = require('express-session');
const url = require('./creds/url');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const moment = require('moment');
const { ReadStream } = require('fs');
const userFIR = require('./model/userFirs');
const infoAboutMishap = require('./model/inform');
const missingPerson = require('./model/missingPerson');
const nodemailer = require('nodemailer')
random = {}



// const TWO_HOURS = 36;


const port = process.env.PORT || 80;

//Express Setup ---------------------------------------------------------------------------------------------
const app = express();


// Mongoose Connection ------------------------------------------------------------------------------------
mongoose.connect(url.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(()=>{ console.log('connection to database established') })
.catch(err=>{ console.log(`db error ${err.message}`); 
process.exit(-1) });


const conn = mongoose.connection;



// Setting up GridFs Stream----------------------------------------------------------------------
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('userProfileImgs');
    // gfs.collection('FIRimages');
})

// let gfsForFir;
// conn.once('open', ()=>{
//     gfsForFir = Grid(conn.db, mongoose.mongo);
//     gfsForFir.collection('firImages');
// })


// Create Storage Engine for Profile Images-------------------------------------------------------------------------
const storage = new GridFsStorage({
    url : url.url,
    file : (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if(err){
                    console.log('Storage error')
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename : filename,
                    bucketName : 'userProfileImgs'
                };
                resolve(fileInfo);
            })
        })
    }
})
const upload = multer({storage});                                                                                                                           





//Middlewares ------------------------------------------------------------------------------------
app.use('/public', express.static('public'));
app.use(body_Parser.json());
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(methodOverride('_method'))


//PUG Setup--------------------------------------------------------------------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));



// Session Initialization ----------------------------------------------------------------------------------
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


// FORGOT PASSWORD ---------------------------------------------------------------------------------------------

app.get('/forgotPassword', (req, res) => {
    res.status(200).render('forgotPassword.pug')
})

app.post('/forgotPassword', async(req, res) => {
    const { emailAdd } = req.body

    await User.findOne({
        emailAdd : emailAdd
    })
    .then(async(user) => {
        if(user){
            random[emailAdd] = Math.floor(100000 + Math.random() * 900000)
            console.log(random)
            let transporter = nodemailer.createTransport({
                service : 'gmail',
                auth : {
                    user : `policex112@gmail.com`,
                    pass : `policex@1234`
                }
            })

            let mailOptions = {
                from : `policex112@gmail.com`,
                to : emailAdd,
                subject : `Police X Forgot Password`,
                text : `The OTP for resetting your password is : ${random[emailAdd]}`
            }

            transporter.sendMail(mailOptions, (err, info) => {
                if(err){
                    console.log('Error sending Email to the reciever ! ', err)
                    res.redirect('/login')
                }else{
                    console.log('Email Sent : ' + info.response)
                    res.status(200).render('resetPassword.pug', {
                        emailAdd : emailAdd
                    })
                    // res.redirect('/resetPassword')

                }
            })
        }else{
            delete random[emailAdd]
            res.status(200).render('forgotPassword.pug', {
                msg : `No account is registerd with the given email ID !`
            })
        }
        
    })
    .catch((err) => {
        delete random[emailAdd]
        console.log('Error Finding the person : ', err)
    })
    

})

app.post('/resetPassword', async(req, res) => {
    
    const {emailAdd, OTP, pass, cpass } = req.body
    console.log('this is inside reset password', random[emailAdd])
    if(pass == cpass){

        if(emailAdd in random){

            if(random[emailAdd] == OTP){

                const bkey = await bcrypt.hash(pass, 10);
                const query = {emailAdd : emailAdd}
                const obj = {$set : {
                    key : bkey
                }}
                await User.updateOne(query, obj, (err, response) => {
                    if(err){
                        console.log('Error updating the password : ', err)
                    }else{
                        console.log('Password reset successfull')
                        delete random[emailAdd]
                        res.status(200).render('forgotPassword.pug', {
                            success : `Password reset successfull !`
                        })
                    }
                })
                
            }else{  
                delete random[emailAdd]
                res.status(200).render('forgotPassword.pug', {
                    msg : `OTP did not match !`
                })
            }

        }else{
            delete random[emailAdd]
            res.status(200).render('forgotPassword.pug', {
                msg : `OTP expired please try again !`
            })
        }

    }else{
        res.status(200).render('forgotPassword.pug', {
            msg : `Password and Confirm Password did not match ! `
        })
    }
    
})



// -------------------------------------------------------------------------------------------------------------



// ------------------------------------------SIGNUP -------------------------------------------------------------
app.post('/api/register', async(req, res)=>{
        
    const { fName, lName, emailAdd, pass, cpass } = req.body;
    

    if(pass === cpass){
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
    }else{
        res.status(200).render('login.pug', {
            error : 'passNotMatch'
        })
    }
    

})
// -------------------------------------------------------------------------------------------------------------









// ---------------------------------------------- DASHBOARD -----------------------------------------------------

app.get('/dashboard', redirectLogin, (req, res) => {
    res.status(200).render('dashboard.pug', {
        fName: req.session.fName,
    });
})







// -------------------------------------------------------------------------------------------------------------

// Middleware forGetting profilePhoto from the GFS Chunks 
app.get('/profilePhoto/:filename', redirectLogin,  (req,res) => {

    userProfile.findOne({
        emailAdd : req.session.emailAdd,
    })
    .then((user)=> {
        //Finding Profile Photo :
        gfs.files.findOne({filename : user.profilePhoto}, (err, file) => {
            if(!file || file.length === 0){
                return res.status(404).json({
                    err : 'No file exists'
                })
            }

            if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
                let profilePhoto = gfs.createReadStream(file.filename);
                profilePhoto.pipe(res);
            }else{
                res.status(404).json({
                    err : 'Not an Image'
                })
            }
        })
    })
    .catch((error) => {
        console.log("Something went wrong", error);
    })
     
})

// Middleware for Getting profilePhoto from the GFS Chunks 
app.get('/aadharCardImage/:filename', redirectLogin, (req,res) => {

    const user = userProfile.findOne({
        emailAdd : req.session.emailAdd,
    })
    .then((user)=> {
        
        //Finding aadharCard Image
        gfs.files.findOne({filename : user.aadharCardImage}, (err, file) => {
            if(!file || file.length === 0){
                return res.status(404).json({
                    err : 'No file exists'
                })
            }

            if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
                let aadharCardImage = gfs.createReadStream(file.filename);
                aadharCardImage.pipe(res);
            }else{
                res.status(404).json({
                    err : 'Not an Image'
                })
            }
        })
    })
    .catch((error) => {
        console.log("Something went wrong", error);
    })
     
})


// Middleware for Getting FIR IMAGES from the GFS Chunks -
app.get('/firImages/', redirectLogin, (req,res) => {

    const allegedPhoto = req.param('filename')
    
    //Finding allegedPhoto Image
    gfs.files.findOne({filename : allegedPhoto}, (err, file) => {
        if(!file || file.length === 0){
            return res.status(404).json({
                err : 'No file exists'
            })
        }

        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
            let allegedPhoto = gfs.createReadStream(file.filename);
            allegedPhoto.pipe(res);
        }else{
            res.status(404).json({
                err : 'Not an Image'
            })
        }
    })
     
})


// Middleware for Getting FIR IMAGES from the GFS Chunks -
app.get('/missingPhotos/', redirectLogin, (req,res) => {

    const missingPerson = req.param('filename')
    
    //Finding allegedPhoto Image
    gfs.files.findOne({filename : missingPerson}, (err, file) => {
        if(!file || file.length === 0){
            return res.status(404).json({
                err : 'No file exists'
            })
        }

        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
            let missingPerson = gfs.createReadStream(file.filename);
            missingPerson.pipe(res);
        }else{
            res.status(404).json({
                err : 'Not an Image'
            })
        }
    })
     
})

// --------------------------------------------------------------------------------------------------------------







// --------------------------------------------MY PROFILE -------------------------------------------------------

app.get('/myProfile', redirectLogin, (req, res) => {
    

    const user = userProfile.findOne({
        emailAdd : req.session.emailAdd,
    })
    .then((user) => {

        if(user){
            res.status(200).render('myProfile.pug', {
                fName : req.session.fName,
                lName : req.session.lName,
                gender : user.gender,
                dob : user.dob,
                religion : user.religion,
                cast : user.cast,
                phoneNo : user.phoneNo,
                addLine1 : user.addLine1,
                addLine2 : user.addLine2,
                addLine3 : user.addLine3,
                pincode : user.pincode,
                aadharNo : user.aadharNo,
                status : user.status
                
            })
        }else{
            res.status(200).render('myProfile.pug', {
                fName : req.session.fName,
                lName : req.session.lName,  
                gender : "NA",
                dob : "NA",
                religion : "NA",
                cast : "NA",
                phoneNo : "XXXXXXXXXX",
                addLine1 : "NA",
                addLine2 : "NA",
                addLine3 : "NA",
                pincode : "NA",
                aadharNo : "XXXXXXXXXXXX",
                status : 0,
                msg : "You need to complete your USER PROFILE in order to file FIRs/ Inform about Mishap/ Report Missing Person."    
            })
        }
    })
    .catch((error) => {
        console.log("Something went wrong searching the userProfile collection")
        console.log(error);
    })
      
})

// --------------------------------------------------------------------------------------------------------------






// ---------------------------------------------EDIT PROFILE ---------------------------------------------------
app.get('/editProfile', redirectLogin, (req, res) => {
    res.status(200).render('editProfile.pug', {
        fName : req.session.fName,
        lName : req.session.lName,
        emailAdd : req.session.emailAdd
    })
})

app.post('/editProfile', upload.fields([{ name : 'profilePhoto', maxCount : 1 }, { name : 'aadharCardImage', maxCount : 1 }]), (req, res) => {

    // res.json({ file : req.files['profilePhoto'][0].filename});
    const { gender, dob, religion, cast, phoneNo, aadharNo, addLine1, addLine2, addLine3, pincode, status } = req.body;
    const emailAdd = req.session.emailAdd;
    const fName = req.session.fName;
    const lName = req.session.lName;
    const profilePhoto = req.files['profilePhoto'][0];
    const aadharCardImage = req.files['aadharCardImage'][0];

    const userObj = {
        emailAdd : emailAdd,
        fName : fName,
        lName : lName,
        profilePhoto : profilePhoto.filename,
        gender : gender,
        dob : dob,
        religion : religion,
        cast : cast,
        phoneNo : phoneNo,
        addLine1 : addLine1,
        addLine2 : addLine2,
        addLine3 : addLine3,
        pincode : pincode,
        aadharNo : aadharNo,
        aadharCardImage : aadharCardImage.filename,
        status : status
    }


    // Deleting User Profile Images
    userProfile.findOne({
        emailAdd : emailAdd
    })
    .then((user) => {
        if(user){
            gfs.remove({filename : user.profilePhoto, root : 'userProfileImgs'}, function (err) {
                if (err){
                    console.log("Can't delete Profile Photo", err);
                }
                console.log('Old Profile Photo deleted Successfully');
            });
            gfs.remove({filename : user.aadharCardImage, root : 'userProfileImgs'}, function (err) {
                if (err){
                    console.log("Can't delete Aadhar Card Image", err);
                };
                console.log('Old Aadhar Card Image Deleted Successfully');
            });    
        }
    })
    .catch((error) => {
        console.log("Cant delete user Images", error)
    })
    
    // Deleting userProfile data
    userProfile.deleteOne({emailAdd : emailAdd})
    .then((err)=>{
        if(err){
            console.log('Cant delete', err);
        }
        console.log("Successfull User Profile deletion")
    })
    .catch((err) => {
        console.log('Something went Wrong')
    })

    

    new userProfile(userObj).save()
    .then((user) => {
        console.log("User Profile completed");
        res.redirect('/myProfile');
    })
    .catch((error) => {
        console.log("unable to save into database", error);
    })

})

// ----------------------------------------------------------------------------------------------------------------








// --------------------------------------------------FILE FIR -----------------------------------------------------
app.get('/fileFIR', redirectLogin, (req, res) => {

    userProfile.findOne({
        emailAdd : req.session.emailAdd
    })
    .then((user) => {
        if(!user){
            res.status(200).render('editProfile.pug', {
                emailAdd : req.session.emailAdd,
                fName : req.session.fName,
                lName : req.session.lName,
                msg : 'Complete your User Profile First !'
            })
        }
        else{
            res.status(200).render('fileFIR.pug',{
                emailAdd : req.session.emailAdd,
                fName : req.session.fName,
                lName : req.session.lName,
            })
        }
    })
    .catch((error) => {
        console.log("Something went wrong in searching the database", error)
    })
    
})



app.post('/fileFIR', upload.fields([{ name : 'allegedPhoto', maxCount : 1 }]), (req, res) => {
    const { parentName, phoneNo, complaintAgainst, allegedDetails, allegedfName, allegedlName, allegedRelation, allegedGender, dateOfIncidentFrom, dateOfIncidentTo, placeOfIncident, typeOfComplaint, complaintDescription, totalMoneyInvolved, noOfVictims, objectInvolved, nearestPoliceStation, status } = req.body;
    let firImage = `NA`;
    console.log(req.files)
    if(req.files['allegedPhoto'] != null){
        firImage = req.files['allegedPhoto'][0].filename;
        console.log(req.files['allegedPhoto'][0]);
    }

    const emailAdd = req.session.emailAdd
    const lName = req.session.lName
    const fName = req.session.fName
    
    userFIR.findOne({
        emailAdd : req.session.emailAdd,
        typeOfComplaint : typeOfComplaint
    })
    .then((user) => {

        if(!user){
            let firNo = `PLX-${Math.floor(1000000000 + Math.random() * 9000000000)}`

            const userObj = {
                emailAdd : emailAdd,
                dateOfComplaint : new Date(),
                fName : fName,
                lName : lName,
                parentName : parentName,
                phoneNo : phoneNo,
                complaintAgainst : complaintAgainst,
                isKnown : allegedDetails,
                allegedPhoto : firImage,
                allegedfName : allegedfName,
                allegedlName : allegedlName,
                relationWithAlleged : allegedRelation,
                allegedGender : allegedGender,
                dateOfIncidentFrom : dateOfIncidentFrom,
                dateOfIncidentTo : dateOfIncidentTo,
                placeOfIncident : placeOfIncident,
                typeOfComplaint : typeOfComplaint,
                complaintDescription : complaintDescription,
                totalMoneyInvolved : totalMoneyInvolved,
                noOfVictims : noOfVictims,
                objectInvolved : objectInvolved,
                nearestPoliceStation : nearestPoliceStation,
                status : status,
                firNo : firNo
            }

            new userFIR(userObj).save()
            .then(() => {
                console.log('FIR filled successfuly !')
                req.session.firNo = firNo;
                res.status(200).render('viewFIR.pug', {
                    emailAdd : emailAdd,
                    dateOfComplaint : new Date(),   
                    fName : fName,
                    lName : lName,
                    parentName : parentName,
                    phoneNo : phoneNo,
                    complaintAgainst : complaintAgainst,
                    isKnown : allegedDetails,
                    allegedPhoto : firImage,
                    allegedfName : allegedfName,
                    allegedlName : allegedlName,
                    relationWithAlleged : allegedRelation,
                    allegedGender : allegedGender,
                    dateOfIncidentFrom : dateOfIncidentFrom,
                    dateOfIncidentTo : dateOfIncidentTo,
                    placeOfIncident : placeOfIncident,
                    typeOfComplaint : typeOfComplaint,
                    complaintDescription : complaintDescription,
                    totalMoneyInvolved : totalMoneyInvolved,
                    noOfVictims : noOfVictims,
                    objectInvolved : objectInvolved,
                    nearestPoliceStation : nearestPoliceStation,
                    status : status,
                    firNo : firNo
                })
            })
            .catch((error) => {
                console.log('Error filing FIR ...', error)
            })



        }else{

            gfs.remove({filename : firImage, root : 'userProfileImgs'}, function (err) {
                if (err){
                    console.log("Can't delete Profile Photo", err);
                }
                console.log('Purposely not pushed the image...');
            });

            res.status(200).render('fileFIR.pug', {
                emailAdd : req.session.emailAdd,
                fName: req.session.fName,
                lName : req.session.lName,
                msg : `Note : You cannot file another FIR with same 'Complaint Type'...`
            })
            
        }

    })
    .catch((error) => {
        console.log('Error Finding the userFIR : ', error)
    })   

})

// ----------------------------------------------------------------------------------------------------------


app.get('/myCases', redirectLogin, async (req, res) => {

    userFIR.find({
        emailAdd : req.session.emailAdd,
    })
    .then((users) => {
        console.log(users)
        
        res.status(200).render('myCases.pug', {
            emailAdd : req.session.emailAdd,
            fName : req.session.fName,
            lName : req.session.lName,
            users : users
        
        })
    })
    .catch((err) => {
        console.log('Error finding the users', err)
    })
    

})



// ---------------------------------------------MY CASES ACTIONS -----------------------------------------------
app.get('/viewFIR', redirectLogin, (req, res) => {

    const firNo = req.param('firNo')
    console.log("this is FIR no : ", firNo)

    userFIR.findOne({
        firNo : firNo
    })
    .then((user) => {
        res.status(200).render('viewFIR.pug', {
            emailAdd : user.emailAdd,
            dateOfComplaint : user.dateOfComplaint,   
            fName : user.fName,
            lName : user.lName,
            parentName : user.parentName,
            phoneNo : user.phoneNo,
            complaintAgainst : user.complaintAgainst,
            isKnown : user.isKnown,
            allegedPhoto : user.allegedPhoto,
            allegedfName : user.allegedfName,
            allegedlName : user.allegedlName,
            relationWithAlleged : user.allegedRelation,
            allegedGender : user.allegedGender,
            dateOfIncidentFrom : user.dateOfIncidentFrom,
            dateOfIncidentTo : user.dateOfIncidentTo,
            placeOfIncident : user.placeOfIncident,
            typeOfComplaint : user.typeOfComplaint,
            complaintDescription : user.complaintDescription,
            totalMoneyInvolved : user.totalMoneyInvolved,
            noOfVictims : user.noOfVictims,
            objectInvolved : user.objectInvolved,
            nearestPoliceStation : user.nearestPoliceStation,
            status : user.status,
            firNo : user.firNo
        })

        console.log(user.allegedPhoto)
    })
})


app.get('/editFIR', redirectLogin, (req, res) => {
    const firNo = req.param('firNo');
    const oldAllegedPhoto = req.param('filename')

    res.status(200).render('editFIR.pug', {
        emailAdd : req.session.emailAdd,
        fName : req.session.fName,
        lName : req.session.lName,
        firNo : firNo,
        oldAllegedPhoto : oldAllegedPhoto
    })

})

app.post('/editFIR', upload.fields([{ name : 'allegedPhoto', maxCount : 1 }]), async (req, res) => {
    const firNo = req.param('firNo')
    const oldAllegedPhoto = req.param('oldAllegedPhoto')
    console.log(firNo);
    const emailAdd = req.session.emailAdd;
    const { parentName, phoneNo, complaintAgainst, allegedDetails, allegedfName, allegedlName, allegedRelation, allegedGender, dateOfIncidentFrom, dateOfIncidentTo, placeOfIncident, typeOfComplaint, complaintDescription, totalMoneyInvolved, noOfVictims, objectInvolved, nearestPoliceStation, status } = req.body;
    let firImage = `NA`;
    console.log(req.files)
    if(req.files['allegedPhoto'] != null){
        firImage = req.files['allegedPhoto'][0].filename;
        console.log(req.files['allegedPhoto'][0]);
    }

    let query = {
        firNo : firNo
    }

    let newValues = {$set: {
        dateOfComplaint : new Date(),
        parentName : parentName,
        phoneNo : phoneNo,
        complaintAgainst : complaintAgainst,
        isKnown : allegedDetails,
        allegedPhoto : firImage,
        allegedfName : allegedfName,
        allegedlName : allegedlName,
        relationWithAlleged : allegedRelation,
        allegedGender : allegedGender,
        dateOfIncidentFrom : dateOfIncidentFrom,
        dateOfIncidentTo : dateOfIncidentTo,
        placeOfIncident : placeOfIncident,
        typeOfComplaint : typeOfComplaint,
        complaintDescription : complaintDescription,
        totalMoneyInvolved : totalMoneyInvolved,
        noOfVictims : noOfVictims,
        objectInvolved : objectInvolved,
        nearestPoliceStation : nearestPoliceStation,
        status : status,
    }}

    await userFIR.updateOne(query, newValues, (err, response) => {
        
        if(err){
            console.log('Error updating the values : ', err)
        }
        console.log('FIR Updated...')
        console.log(response)
        
        
        gfs.remove({filename : oldAllegedPhoto, root : 'userProfileImgs'}, function (err) {
            if (err){
                console.log("Can't delete Profile Photo", err);
            }
            console.log('Old Alleged Image Photo deleted Successfully');
        });

    })

    await userFIR.findOne({
        firNo : firNo
    })
    .then((user) => {
        res.status(200).render('viewFIR.pug', {
            emailAdd : user.emailAdd,
            dateOfComplaint : user.dateOfComplaint,   
            fName : user.fName,
            lName : user.lName,
            parentName : user.parentName,
            phoneNo : user.phoneNo,
            complaintAgainst : user.complaintAgainst,
            isKnown : user.isKnown,
            allegedPhoto : firImage,
            allegedfName : user.allegedfName,
            allegedlName : user.allegedlName,
            relationWithAlleged : user.allegedRelation,
            allegedGender : user.allegedGender,
            dateOfIncidentFrom : user.dateOfIncidentFrom,
            dateOfIncidentTo : user.dateOfIncidentTo,
            placeOfIncident : user.placeOfIncident,
            typeOfComplaint : user.typeOfComplaint,
            complaintDescription : user.complaintDescription,
            totalMoneyInvolved : user.totalMoneyInvolved,
            noOfVictims : user.noOfVictims,
            objectInvolved : user.objectInvolved,
            nearestPoliceStation : user.nearestPoliceStation,
            status : user.status,
            firNo : user.firNo
        })
    })
    .catch((err) => {
        console.log('Error Finding FIR : ', err)
    })
    

})


app.get('/deleteFIR', redirectLogin, (req, res) => {
    const firNo = req.param('firNo')
    const allegedPhoto = req.param('filename')

    const query = { firNo : firNo }

    gfs.remove({filename : allegedPhoto, root : 'userProfileImgs'}, function (err) {
        if (err){
            console.log("Can't delete Profile Photo", err);
        }
        console.log('Old Alleged Image Photo deleted Successfully');
    });

    userFIR.deleteOne(query, (err, obj) => {
        if(err){
            console.log('Cant delete userFIR : ', err)
        }else{
            console.log('userFIR deleted successfully')
        }

    })

    res.redirect('/myCases')

})
// ---------------------------------------------------------------------------------------------------------------






// Inform About Mishappening-----------------------------------------------------------------------------------
app.get('/inform', redirectLogin, (req, res) => {

    userProfile.findOne({
        emailAdd : req.session.emailAdd
    })
    .then((user) => {
        if(user){
            res.status(200).render('inform.pug',{
                emailAdd : req.session.emailAdd,
                fName : req.session.fName,
                lName : req.session.lName
            })
        }else{
            res.status(200).render('editProfile.pug', {
                emailAdd : req.session.emailAdd,
                fName : req.session.fName,
                lName : req.session.lName,
                msg : 'Complete your User Profile First !'
            })
        }

    })
    
})

app.post('/inform', (req, res) => {

    const {informationAbout, dateOfMishap, placeOfMishap, city, description} = req.body;

    const infoObj = {
        emailAdd : req.session.emailAdd,
        informationAbout : informationAbout,
        dateOfMishap : dateOfMishap,
        placeOfMishap : placeOfMishap,
        city : city,
        description : description
    }

    new infoAboutMishap(infoObj).save()
    .then(() => {
        console.log("Information Updated Successfully !")

        res.status(200).render('confirmation.pug', {
            emailAdd : req.session.emailAdd,
            fName : req.session.fName,
            lName : req.session.lName,
            msg : `Mishappening`
        })
    })

})
// -----------------------------------------------------------------------------------------------------------







// Missing Person Report ---------------------------------------------------------------------------------------
app.get('/missingPerson', redirectLogin, (req, res) => {

    userProfile.findOne({
        emailAdd : req.session.emailAdd
    })
    .then((user) => {
        if(user){
            res.status(200).render('missingPerson.pug', {
                emailAdd : req.session.emailAdd,
                fName : req.session.fName,
                lName : req.session.lName
            })
        }else{
            res.status(200).render('editProfile.pug', {
                emailAdd : req.session.emailAdd,
                fName : req.session.fName,
                lName : req.session.lName,
                msg : 'Complete your User Profile First !'
            })
        }
    })
    
})


app.post('/missingPerson', upload.fields([{ name : 'missingPhoto', maxCount : 1 }, { name : 'missingPhotoID', maxCount : 1 }]), (req, res) => {

    const {salutation, missingFName, missingLName, gender, dob, religion, phoneNo, aadharNo, occupation, nationality, houseNoAndBuilding, street, area, city, pincode, state, status} = req.body;
    const emailAdd = req.session.emailAdd;
    const fName = req.session.fName;
    const lName = req.session.lName;
    const missingPhoto = req.files['missingPhoto'][0].filename;
    const missingPhotoID = req.files['missingPhotoID'][0].filename;


    const missingObj = {

        emailAdd : emailAdd,
        reportNo : `PLX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        salutation : salutation,
        missingFName : missingFName,
        missingLName : missingLName,
        gender : gender,
        dob : dob,
        religion : religion,
        phoneNo : phoneNo,
        aadharNo : aadharNo,
        occupation : occupation,
        nationality : nationality,
        houseNoAndBuilding : houseNoAndBuilding,
        street : street,
        area : area,
        city : city,
        pincode : pincode,
        state : state,
        status : status,
        missingPhoto : missingPhoto,
        missingPhotoID : missingPhotoID

    }

    missingPerson.findOne({
        aadharNo : aadharNo
    })
    .then((user) => {

        if(!user){
            new missingPerson(missingObj).save()
            .then(()=> {
                console.log('Successfully filed missing report')
                res.status(200).render('viewMissingReport.pug', {
                    missingObj : missingObj,
                    fName : req.session.fName
                })
            })
            .catch((err) => {
                console.log("Error saving Missing Report to the database : ", err)
            })
        }else{
            res.status(200).render('missingPerson.pug', {
                fName : req.session.fName,
                msg : `This Person's Missing Report has been already registered !`
            })
        }

    })
    
})





app.get('/missingList', redirectLogin, (req, res) => {

    missingPerson.find({
        emailAdd : req.session.emailAdd
    })
    .then((users) => {

        console.log("Found Missing Person associated with this email ID")
        res.status(200).render('missingList.pug', {
            users : users,
            fName : req.session.fName
        })
        
    })
    .catch((err) => {
        console.log("Error Finding the users : ", err)
    })
    
})


app.get('/viewMissingReport', redirectLogin, (req, res) => {

    const reportNo = req.param('reportNo')

    missingPerson.findOne({
        emailAdd : req.session.emailAdd,
        reportNo : reportNo
    })
    .then((user) => {
        res.status(200).render('viewMissingReport.pug', {
            missingObj : user,
            fName : req.session.fName
        })
    })
    .catch((err) => {
        console.log("Error finding the desired missing person's report : ", err)
    })
    
})


app.get('/deleteMissingReport', redirectLogin, (req, res) => {

    const reportNo = req.param('reportNo')

    missingPerson.findOne({
        emailAdd : req.session.emailAdd,
        reportNo : reportNo
    })
    .then((user) => {

        gfs.remove({filename : user.missingPhoto, root : 'userProfileImgs'}, function (err) {
            if (err){
                console.log("Can't delete Profile Photo", err);
            }
            console.log('Old Missing Photo Image deleted Successfully');
        });

        gfs.remove({filename : user.missingPhotoID, root : 'userProfileImgs'}, function (err) {
            if (err){
                console.log("Can't delete Profile Photo", err);
            }
            console.log('Old Missing Photo ID deleted Successfully');
        });


        const query = {reportNo : reportNo}

        missingPerson.deleteOne(query, (err, obj) => {
            if(err){
                console.log('Cant delete Missing Person : ', err)
            }else{
                console.log('Missing Person profile deleted successfully')
            }
    
        })

        res.redirect('/missingList')

    })
    .catch((err) => {
        console.log('Cant delete Missing Persons profile...')
    })

})

// ------------------------------------------------------------------------------------------------------------








app.get('/confirmation', redirectLogin, (req, res) => {
    res.status(200).render('confirmation.pug',{
        emailAdd : req.session.emailAdd,
        fName : req.session.fName,
        lName : req.session.lName,
        msg : ``
    })
})



app.get('/accountSettings', redirectLogin, (req, res) => {

    userProfile.findOne({
        emailAdd : req.session.emailAdd
    })
    .then((user) => {
        res.status(200).render('accountSettings.pug', {
            emailAdd : req.session.emailAdd,
            fName : req.session.fName,
            lName : req.session.lName,
            phoneNo : user.phoneNo
        })
    })
    .catch((err) => {
        console.log("Error finding profile in userProfile", err0)
    })

})

app.get('/changePassword', redirectLogin, (req, res) => {

    res.status(200).render('changePassword.pug', {
        emailAdd : req.session.emailAdd,
        fName : req.session.fName,
        lName : req.session.lName,
    })
})

app.post('/changePassword', (req, res) => {

    const { oldPassword, password, confirmPassword } = req.body;

    if(password === confirmPassword){

        const user = User.findOne({
            emailAdd : req.session.emailAdd
        })
        .then(async (user) => {
            if(user){
                const status = await bcrypt.compare(oldPassword, user.key);

                if(status){
                    const bkey = await bcrypt.hash(password, 10);
                    
                    const query = { emailAdd : req.session.emailAdd }

                    const newValues = {$set: {
                        key : bkey
                    }}

                    User.updateOne(query, newValues, (err, response) => {
        
                        if(err){
                            console.log('Error Changing Password : ', err)
                        }
                        console.log('Password Changed Successfully !')
                
                    })

                    userProfile.findOne({
                        emailAdd : req.session.emailAdd
                    })
                    .then((user) => {
                        res.status(200).render('accountSettings.pug', {
                            emailAdd : req.session.emailAdd,
                            fName : req.session.fName,
                            lName : req.session.lName,
                            phoneNo : user.phoneNo,
                            msg : `Password changed Successfully !`
                        })
                    })
                    .catch((err) => {
                        console.log("Error finding profile in userProfile", err0)
                    })

                }else{
                    res.status(200).render('changePassword.pug', {
                        msg : `Your Existing Password is Incorrect !`
                    })
                }
    
            }
            else{
                res.status(200).render('dashboard.pug', {
                    fName : req.session.fName
                })
            }
        })
        .catch((error) => {
            console.log("Unknown error finding user in the Database", error);
        })
    }
    else{
        res.status(200).render('changePassword.pug', {
            msg : `Password and Confirm Password did not match !`
        })
    }

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

app.get('/maintainance', (req, res) => {
    res.status(200).render('maintainance.pug')
})

// --------------------------------------------------------------------------------------------------------------

//Listen ---------------------------------------------------------------------------------------------------
app.listen(port, () =>{
    console.log(`The app is running on the port : ${port}`);
})