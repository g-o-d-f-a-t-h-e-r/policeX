const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = schema({

        emailAdd : {
            type : String,
            required : true
        },

        fName : {
            type : String,
            required : true
        },

        lName : {
            type : String,
            required : true
        },

        profilePhoto : {
            type : String,
            required : true
        },

        gender : {
            type : String,
            required : true,
            
        },

        dob : {
            type : Date,
            required : true,
            
        },

        religion : {
            type : String,
            required : true,
            
        },

        cast : {
            type : String,
            required : true,
            
        },

        phoneNo : {
            type : Number,
            required : true,
            
        },

        addLine1 : {
            type : String,
            required : true,
            
        },

        addLine2 : {
            type : String,
            required : true,
            
        },

        addLine3 : {
            type : String,
            required : true,
           
        },

        pincode : {
            type : Number,
            required : true,
            
        },

        aadharNo : {
            type : Number,
            required : true,
            
        },

        aadharCardImage : {
            type : String,
            required : true
        },

        status : {
            type : Boolean,
            required : true,
            default : 0
        }
    },
    {
        collection : "userProfile"
    }

);

module.exports = userProfile = mongoose.model('userProfile', userSchema);   