//Create mongoose schema for users
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Don't include Username/HashedPassword in userSchema, they will be added onto schema by passport-local-mongoose
userSchema.plugin(passportLocalMongoose);
// Passport-Local Mongoose 
// adds: username, hash and salt fields. 
// stores: username, hashedPw, and saltValue


const User = mongoose.model("User", userSchema);

//Export to use in app.js
module.exports = User;