const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
    fName: { type: String, required: true },
    lName : { type: String, required: true },
    email_address : { type : String, required: true, unique : true },
    key: { type : String, required: true } 
    },
    { collection: 'users' }
)

const model = mongoose.model('user', UserSchema);

module.exports = model;
