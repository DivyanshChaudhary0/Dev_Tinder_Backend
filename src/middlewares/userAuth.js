
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { body, validationResult } = require("express-validator");

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

const registerValidation = [
    body("username")
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 5, max: 20 }).withMessage("Username must be between 5 and 20 characters"),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email address"),

    body("password")
        .notEmpty().withMessage("Password is required"),

    body("age")
        .optional()
        .isInt({ min: 18, max: 70 }).withMessage("Age must be between 18 and 70"),

    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(401).json({
                errors: errors.array()
            });
        }
        next();
    }
];

const loginValidation = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email address"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({min:5,max:100}),

        function(req,res,next){
            const errors = validationResult(req);
            if(!errors.isEmpty){
                return res.status(401).json({
                    errors: errors.array()
                })
            }
            next();
        }
]

module.exports = {
    userAuth,
    registerValidation,
    loginValidation
}
