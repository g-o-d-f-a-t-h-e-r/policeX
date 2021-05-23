const mongoose = require("mongoose");

const schema = mongoose.Schema;

const UserSchema = new schema({
    
    emailAdd : {
        type : String,
        required : true
    },

    informationAbout: {
        type : String,
        required : true
    },

    dateOfMishap : {
        type : String,
        required : true
    },

    placeOfMishap : {
        type : String,
        required : true
    },

    city : {
        type : String,
        required : true
    },

    description : {
        type : String,
        required : true
    }

},
    {
        collection : 'infoAboutMishap'
    }
);

module.exports = infoAboutMishap = mongoose.model('infoAboutMishap', UserSchema)
