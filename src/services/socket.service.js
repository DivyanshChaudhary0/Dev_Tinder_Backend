
const { Server } = require("socket.io")

const connectSocket = function(server){
    const io = new Server(server,{
        origin: "http://3.108.59.122:3000",
        methods: ["GET", "POST"]
    });

    io.on("connection", function(socket){
        console.log("user connected");

        socket.on("chat-message", function({userId,targetUserId}){
            let room = [userId,targetUserId].sort().join("_");
            socket.join(room)
        })

        socket.on("sendMessage", function({userId,targetUserId,username,message}){
            let room = [userId,targetUserId].sort().join("_");
            let time = new Date(Date.now()).toLocaleTimeString();
            io.to(room).emit("receiveMessage", {text:message,username,time})
        })

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });

    })

}

module.exports = connectSocket;