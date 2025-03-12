
const cookieParser = require("cookie-parser");
const cors = require("cors")
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

const indexRoutes = require("./routes/index.routes");
const profileRoutes = require("./routes/profile.routes");
const requestRoutes = require("./routes/request.routes");
const userRoutes = require("./routes/user.routes");

app.use("/", indexRoutes);
app.use("/profile", profileRoutes);
app.use("/request", requestRoutes);
app.use("/user", userRoutes);

module.exports = app;
