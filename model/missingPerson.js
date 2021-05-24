const mongoose = require('mongoose');

const schema = mongoose.Schema;

const UserSchema = new schema(
    
    {

        emailAdd : {
            type : String,
            required : true
        },

        reportNo : {
            type : String,
            required : true
        },

        salutation : {
            type : String,
            required : true
        },

        missingFName : {
            type : String,
            required : true
        },

        missingLName : {
            type : String,
            required : true
        },

        gender : {
            type : String,
            required : true
        },

        dob : {
            type : String,
            required : true
        },

        religion : {
            type : String,
            required : true,
        },

        phoneNo : {
            type : Number,
            required : true
        },

        aadharNo : {
            type : Number,
            required : true
        },

        occupation : {
            type : String,
            required : true
        },

        nationality : {
            type : String,
            required : true
        },

        houseNoAndBuilding : {
            type : String,
            required : true
        },

        street : {
            type : String,
            required : true
        },

        area : {
            type : String,
            required : true
        },

        city : {
            type : String,
            required : true
        },

        pincode : {
            type : Number,
            required : true
        },

        state : {
            type : String,
            required : true
        },

        missingPhoto : {
            type : String,
            required : true
        },

        missingPhotoID : {
            type : String,
            required : true
        },

        status : {
            type : Number,
            required : true
        }

    },
    {
        collection : 'missingPerson'
    }

);

module.exports = missingPerson = mongoose.model('missingPerson', UserSchema)