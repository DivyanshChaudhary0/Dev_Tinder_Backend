
const {Router} = require("express");
const { userAuth } = require("../middlewares/userAuth");
const router = Router();
const connectionModel = require("../models/connections.model");
const userModel = require("../models/user.model");

router.post("/send/:status/:toUserId", userAuth , async function(req,res){
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // code written in connectionSchema
        // if(toUserId == fromUserId){
        //     return res.status(400).json({
        //         message: "Can not send request"
        //     })
        // } 

        const allowedStatus = ["ignored","interested"]
        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                message: "invalid status type"
            })
        }

        const user = await userModel.findById(toUserId)
        if(!user){
            return res.status(400).json({
                message: "User not exist !!"
            })
        }

        const exist = await connectionModel.findOne({
            $or: [
                {fromUserId,toUserId},
                {fromUserId:toUserId,toUserId:fromUserId}
            ]
        })
        
        if(exist){
            return res.status(400).json({
                message: "Connection request is already exist"
            })
        }

        const data = await connectionModel.create({
            fromUserId,
            toUserId,
            status
        })

        res.status(200).json({
            message: "Connection made successfully",
            data
        })

    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.post("/review/:status/:requestId", userAuth , async function(req,res){
    try{
        const {status,requestId} = req.params;
        const toUserId = req.user._id;

        const allowedStatus = ["accepted","rejected"]
        if(!allowedStatus.includes(status)){
            return res.status(404).json({
                message: "Invalid status type"
            })
        }

        const request = await connectionModel.findOne({
            _id: requestId,
            toUserId,
            status: "interested"
        })
        
        if(!request){
            return res.status(404).json({
                message: "No request found"
            })
        }

        request.status = status;
        const data = await request.save();

        res.status(200).json({
            message: `request ${status}`,
            data
        })

    }
    catch(err){
        res.status(400).json({
            error: err.message,
            message: "Connection failed"
        })
    }
})

module.exports = router;
