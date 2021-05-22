const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = schema({

    emailAdd : {
        type : String,
        required : true
    },

    dateOfComplaint : {
        type : Date
    },
    
    fName : {
        type : String
    },

    lName : {
        type : String
    },

    parentName : {
        type : String,
        
    },

    phoneNo : {
        type : Number,
        
    },

    complaintAgainst : {
        type : String,
       
    },

    isKnown : {
        type : String,
        
    },

    allegedPhoto : {
        type : String,
        default : 'NA'
    },

    allegedfName : {
        type : String,
        default : 'NA'
    },

    allegedlName : {
        type : String,
        default : 'NA'
    },

    relationWithAlleged : {
        type : String,
        default : 'Unknown'
    },

    allegedGender : {
        type : String,
        default : 'NA'
    },

    dateOfIncidentFrom : {
        type : Date,
        
    },

    dateOfIncidentTo : {
        type : Date,
        
    },

    placeOfIncident : {
        type : String,
        
    },

    typeOfComplaint : {
        type : String,
        
    },

    complaintDescription : {
        type : String,
        
    },

    totalMoneyInvolved : {
        type : Number,
        default : 0
    },

    noOfVictims : {
        type : Number,
        default : 1
    },

    objectInvolved : {
        type : String,
        default : 'NA'
    },

    nearestPoliceStation : {
        type : String
    },

    status : {
        type : String,
        required : true,
        default : 0
    },

    firNo : {
        type: String,
        required : true
    }

},

    {
        collection : 'userFIR'
    }

)

module.exports = userFIR = mongoose.model('userFIR', userSchema)