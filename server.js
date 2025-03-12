
require("dotenv").config();
require("./src/db/db")
const app = require("./src/app");

const port = process.env.PORT;

app.listen(port,function(){
    console.log(`app is running on port ${port}`);
})

