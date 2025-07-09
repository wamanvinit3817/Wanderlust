const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const schema=mongoose.Schema;
const userSchema = new schema({
    email: String,
   
   
});

userSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model("user", userSchema);