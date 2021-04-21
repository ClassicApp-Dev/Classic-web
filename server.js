require("dotenv").config();
const express = require("express")
const ejs = require("ejs")
const config = require("./config");
const app = express()
const userRoute = require("./routes/user.route")
const api = require("./routes/api")
const session = require("express-session")

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set('trust proxy', 1);

app.use(session({
    secret: 'classic',
    resave: false,
    saveUninitialized: true,
    cookie: {}
  }))

app.use(userRoute);
app.use(api)

app.listen(config.port, () => console.log(`server running on ${config.port}`))