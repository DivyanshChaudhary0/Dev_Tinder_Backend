
const {Router} = require("express");
const { userAuth } = require("../middlewares/userAuth");
const router = Router();
const bcrypt = require("bcrypt")

router.get("/", userAuth ,function(req,res){
    try{
        const user = req.user;
        res.status(200).json({
            user
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.patch("/edit", userAuth , async function(req,res){
    try{
        const updates = Object.keys(req.body)
        const allowedFields = ["username","age","photoURL","skills","about","gender"]
        const invalidFields = updates.filter((field)=> !allowedFields.includes(field))
        
        if (invalidFields.length > 0) {
            return res.status(400).json({
                message: "You can only update age, about, skills, gender and profile Image.",
                invalidFields
            });
        }

        const user = req.user;
        if(!user){
            return res.status(401).json({ message: "Unauthorized. User not found." });
        }

        updates.forEach((key) => {
            user[key] = req.body[key]
        })

        await user.save()

        res.status(200).json({
            message: `${user.username} your profile updated successfully`,
            user
        })
    }
    catch(err){
        res.status(500).json({
            message: "server error",
            error : err.message
        })
    }
})

router.patch("/password", userAuth ,async function(req,res){
    try{
        const {currentPassword,newPassword} = req.body;

        if(currentPassword === newPassword){
            return res.status(400).json({
                message: "Please enter different password"
            })
        }
        const user = req.user;
        
        const isMatched = await bcrypt.compare(currentPassword,user.password);
        if(!isMatched){
            return res.status(400).json({
                message: "Invalid Password"
            })
        }

        const hashed = await bcrypt.hash(newPassword,10);
        user.password = hashed;
        await user.save();

        res.status(200).json({
            message: 'password updated successfully',
            user
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

module.exports = router;
