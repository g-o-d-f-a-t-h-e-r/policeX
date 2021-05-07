const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
    fName: { type: String, required: true },
    lName : { type: String, required: true },
    email : { type : String, unique : true, required: true },
    password: { type : String, required: true } 
    },
    { collection: 'users' }
)

const model = mongoose.model('UserSchema', UserSchema);

module.exports = model;
