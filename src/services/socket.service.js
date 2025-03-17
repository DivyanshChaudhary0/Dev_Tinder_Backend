const { Server } = require("socket.io");

const users = {}; // Store users with their online status

const connectSocket = function (server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("chat-message", ({ userId, targetUserId }) => {
            if (!userId) return;

            users[userId] = { socketId: socket.id, lastSeen: "online" };
            io.emit("online", users);

            let room = [userId, targetUserId].sort().join("_");
            socket.join(room);

            if (userId === targetUserId) {
                socket.emit("online", "online");
            }
        });

        socket.on("sendMessage", ({ userId, targetUserId, username, message }) => {
            let room = [userId, targetUserId].sort().join("_");
            let time = new Date().toLocaleTimeString();
            io.to(room).emit("receiveMessage", { text: message, username, time });
        });

        socket.on("disconnect", () => {
            const userId = Object.keys(users).find((key) => users[key].socketId === socket.id);
            if (userId) {
                users[userId].lastSeen = new Date().toLocaleString();
                delete users[userId];    
            }
            
            io.emit("offline", new Date().toLocaleTimeString());
            console.log("User disconnected:", socket.id);
        });
    });
};

module.exports = connectSocket;
