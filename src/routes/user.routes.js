
const {Router} = require("express")
const router = Router();
const connectionModel = require("../models/connections.model")
const {userAuth} = require("../middlewares/userAuth");

router.get("/requests/receive", userAuth , async function(req,res){
    try{
        const user = req.user;
        const requests = await connectionModel.find({
            toUserId: user._id,
            status: "interested" 
        }).populate("fromUserId",["username","photoURL","about"])

        res.status(200).json({
            message: "data fetched successfully",
            requests
        })
    }
    catch(err){
        res.status(400).json({
            message: err.message
        })
    }
})

router.get("/connections", userAuth , async function(req,res){
    try{
        const user = req.user;
        const connections = await connectionModel.find({
            $or: [
                { fromUserId: user._id, status: "accepted"},
                { toUserId: user._id, status: "accepted"}
            ]
        })
        .populate("fromUserId",["username","photoURL","about"])
        .populate("toUserId",["username","photoURL","about"])

        const data = connections.map((row)=>{
            if(row.fromUserId._id.toString() === user._id.toString()){
                return row.toUserId
            }
            return row.fromUserId
        })

        res.json({
            data
        })
    }
    catch(err){
        res.status(400).json({
            error: err.message,
            message: "connections not found"
        })
    }
})

module.exports = router;