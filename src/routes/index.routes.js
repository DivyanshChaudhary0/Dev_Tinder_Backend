
const {Router} = require("express");
const router = Router();
const userModel = require("../models/user.model")
const bcrypt = require("bcrypt");
const { userAuth, loginValidation, registerValidation } = require("../middlewares/userAuth");
const connectionModel = require("../models/connections.model");

router.get("/",function(req,res){
    res.send("home page")
})

router.post("/login", loginValidation ,async function(req,res){
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Invalid data entered"
            })
        }

        const user = await userModel.findOne({email}).select("+password")

        if(!user){
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isMatched = await bcrypt.compare(password,user.password)

        if(!isMatched){
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        delete user._doc.password;

        const token = user.generateToken();

        res.cookie("token",token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
        });

        res.status(200).json({
            message: "User login successfully",
            token,
            user
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.post("/google-login", async function(req,res){
    try{
        const accessToken = req.body?.accessToken;
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
        });
        const userData = await response.json();

        if (!userData.email) {
            return res.status(401).json({ message: "Invalid Google Token" });
        }

        const {email,name,picture} = userData;

        let user = await userModel.findOne({email});

        if(!user){
            user = await userModel.create({
                username: name,
                email,
                photoURL: picture
            })
        }

        let token = user.generateToken();
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
        });

        res.status(200).json({
            user
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})

router.post("/register", registerValidation ,async function(req,res){
    try{
        const {username,email,password} = req.body;
        const hashed = await userModel.hashPassword(password)
        const user = await userModel.create({
            username,
            email,
            password: hashed
        })

        const token = user.generateToken();

        delete user._doc.password

        res.cookie("token",token)
        res.status(201).json({
            user
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.post("/logout",async function(req,res){
    try{
        res.cookie("token","");
        res.send("user logout")
    }
    catch(err){
        res.send(err.message)
    }
})

router.get("/feed", userAuth ,async function(req,res){
    try{
        const user = req.user;

        let page = req.query.page;
        let limit = req.query.limit || 10;
        if(limit>50) limit = 50;
        let skip = (page-1)*limit;

        const connections = await connectionModel.find({
            $or: [{fromUserId: user._id},{toUserId: user._id}]
        }).select("fromUserId toUserId")

        const hideUsersFromFeed = new Set();

        connections.forEach((req)=>{
            hideUsersFromFeed.add(req.fromUserId.toString())
            hideUsersFromFeed.add(req.toUserId.toString())
        })

        hideUsersFromFeed.add(req.user._id)
        
        const users = await userModel.find({
            _id: {$nin: [ ...hideUsersFromFeed ]}
        }).select("username gender age photoURL skills about").skip(skip).limit(limit)

        res.status(200).json({
            users
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

module.exports = router;
