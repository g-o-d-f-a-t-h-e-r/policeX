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
const userFirs = require('./model/userFirs');
const user = require('./model/user');



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

// Middleware forGetting profilePhoto from the GFS Chunks ---------------------
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

// Middleware for Getting profilePhoto from the GFS Chunks ---------------------
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


// Middleware for Getting FIR IMAGES from the GFS Chunks ---------------------
app.get('/firImages/', redirectLogin, (req,res) => {

    const allegedPhoto = req.param('filename')
    console.log(allegedPhoto)
    
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
                msg : "You need to complete your USER PROFILE in order to file FIRs."    
            })
        }
    })
    .catch((error) => {
        console.log("Something went wrong searching the userProfile collection")
        console.log(error);
    })
      
})






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
    // const firImage = 'NA'


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
            // let query = {
            //     emailAdd : req.session.emailAdd,
            //     typeOfComplaint : typeOfComplaint
            // }
            // let newValues = {$set: {
            //     dateOfComplaint : new Date(),
            //     parentName : parentName,
            //     phoneNo : phoneNo,
            //     complaintAgainst : complaintAgainst,
            //     isKnown : allegedDetails,
            //     allegedPhoto : firImage,
            //     allegedfName : allegedfName,
            //     allegedlName : allegedlName,
            //     relationWithAlleged : allegedRelation,
            //     allegedGender : allegedGender,
            //     dateOfIncidentFrom : dateOfIncidentFrom,
            //     dateOfIncidentTo : dateOfIncidentTo,
            //     placeOfIncident : placeOfIncident,
            //     typeOfComplaint : typeOfComplaint,
            //     complaintDescription : complaintDescription,
            //     totalMoneyInvolved : totalMoneyInvolved,
            //     noOfVictims : noOfVictims,
            //     objectInvolved : objectInvolved,
            //     nearestPoliceStation : nearestPoliceStation,
            //     status : status,
            // }}

            // userFIR.updateOne(query, newValues, (err, response) => {
            //     if(err){
            //         console.log('Error updating the values : ', err)
            //     }
            //     console.log('Document Updated')

            //     req.session.firNo = user.firNo;
                
            //     gfs.remove({filename : user.allegedPhoto, root : 'userProfileImgs'}, function (err) {
            //         if (err){
            //             console.log("Can't delete Profile Photo", err);
            //         }
            //         console.log('Old Alleged Image Photo deleted Successfully');
            //     });
                
            //     // res.redirect('/myCases');
            //     res.status(200).render('viewFIR.pug', {
            //         emailAdd : emailAdd,
            //         dateOfComplaint : user.dateOfComplaint,   
            //         fName : fName,
            //         lName : lName,
            //         parentName : parentName,
            //         phoneNo : phoneNo,
            //         complaintAgainst : complaintAgainst,
            //         isKnown : allegedDetails,
            //         allegedPhoto : firImage,
            //         allegedfName : allegedfName,
            //         allegedlName : allegedlName,
            //         relationWithAlleged : allegedRelation,
            //         allegedGender : allegedGender,
            //         dateOfIncidentFrom : dateOfIncidentFrom,
            //         dateOfIncidentTo : dateOfIncidentTo,
            //         placeOfIncident : placeOfIncident,
            //         typeOfComplaint : typeOfComplaint,
            //         complaintDescription : complaintDescription,
            //         totalMoneyInvolved : totalMoneyInvolved,
            //         noOfVictims : noOfVictims,
            //         objectInvolved : objectInvolved,
            //         nearestPoliceStation : nearestPoliceStation,
            //         status : status,
            //         firNo : user.firNo
            //     })

            // })
            // .catch((error) => {
            //     console.log("Unknown error occured while updating : ", error)
            // })
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

app.post('/editFIR', upload.fields([{ name : 'allegedPhoto', maxCount : 1 }]), (req, res) => {
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

    userFIR.updateOne(query, newValues, (err, response) => {
        
        if(err){
            console.log('Error updating the values : ', err)
        }
        console.log('FIR Updated...')

        
        
        gfs.remove({filename : oldAllegedPhoto, root : 'userProfileImgs'}, function (err) {
            if (err){
                console.log("Can't delete Profile Photo", err);
            }
            console.log('Old Alleged Image Photo deleted Successfully');
        });

    })

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