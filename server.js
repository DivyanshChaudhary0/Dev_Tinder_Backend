
require("dotenv").config();
require("./src/db/db")
const app = require("./src/app");
const {createServer} = require("https")
const connectSocket = require("./src/services/socket.service");

const server = createServer(app);

connectSocket(server)

const port = process.env.PORT;

server.listen(port,function(){
    console.log(`app is running on port ${port}`);
})

