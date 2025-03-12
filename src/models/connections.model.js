
const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user"
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user"
    },
    status: {
        type:String,
        required: true,
        enum: {
            values: ["ignored","interested","accepted","rejected"],
            message: `{VALUE} is incorrect status type`
        },
    }
},{timestamps: true});

connectionSchema.index({fromUserId: 1,toUserId: 1})

connectionSchema.pre("save",async function(next){
  if(this.fromUserId.equals(this.toUserId)){
    throw new Error("cant send request to youself")
  }
  next();
})

module.exports = mongoose.model("connectionRequest",connectionSchema)
