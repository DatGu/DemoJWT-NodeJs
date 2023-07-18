const mongoose = require('mongoose')

const userSchema= new mongoose.Schema({
    userName:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    admin:{
        type: Boolean,
        default: false
    }
},{timestamps:true})

module.exports= mongoose.model("User", userSchema)