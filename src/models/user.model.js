
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true,"username is required"],
        unique: [true,"username is already exist"],
        trim: true,
        minLength: 3
    },
    email: {
        type: String,
        required: [true,"email is required"],
        unique: [true,"email is already exist"],
        trim: true,
        minLength: 13
    },
    password: {
        type: String,
        select: false,
        minLength: 4
    },
    gender: {
        type: String,
        enum: ["male","female","others"]
    },
    age: {
        type: Number,
        min: 18,
        default: 18,
    },
    photoURL: {
        type: String,
        default: "https://tg-stockach.de/wp-content/uploads/2020/12/5f4d0f15338e20133dc69e95_dummy-profile-pic-300x300.png"
    },
    skills: {
        type: [String],
        default: []
    },
    about: {
        type:String,
        maxLength: 100,
        default: ""
    },
},{timestamps:true})


userSchema.methods.generateToken = function(){
    return jwt.sign({
        id: this._id,
        email: this.email
    },process.env.JWT_SECRET)
}

userSchema.statics.verifyToken = function(token){
    return jwt.verify(token,process.env.JWT_SECRET)
}

userSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password,10)
}

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

module.exports = mongoose.model("user",userSchema)
