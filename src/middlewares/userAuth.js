
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const userAuth = async (req,res,next)=>{
    try{
        const token = req.cookies.token;
        if(!token) return res.status(400).send("token is empty");
        const decode = jwt.verify(token,process.env.JWT_SECRET)
        const user = await userModel.findById(decode.id)
        if(!user){
            return res.status(400).json({
                message: "User not found"
            })
        }
        req.user = user;
        next();
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
}

module.exports = {
    userAuth
}
