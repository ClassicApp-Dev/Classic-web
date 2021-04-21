const { Router, request } = require("express");
const express = require("express");
const route = express.Router();
const bodyParser = require("body-parser");
const {sessionManager} = require("../sessions/sessionManager");

var urlencodedParser = bodyParser.urlencoded({ extended: false});

route.get("/chat-interest",async(req,res)=>{
    var online = await sessionManager.getSession();
    if (online){
        res.render("chat-interest")
    }else{
        res.redirect("/login")
    }
});

route.get("/chat-messages",async(req,res)=>{
    var online = await sessionManager.getSession();
    if (online){
        res.render("chat-messages")
    }else{
        res.redirect("/login")
    }
});

route.get("/feedback",async(req,res)=>{
    var online = await sessionManager.getSession();
    if (online){
        res.render("feedback")
    }else{
        res.redirect("/login")
    }
});

route.get("/forgetpassword",(req,res)=>{
        res.render("forgetpassword")
});

route.get("/login",async (req,res)=>{
    var online = await sessionManager.getSession();
    if (online){
        res.redirect("/profile")
    }else{
        res.render("login")
    }
});

route.get("/logout",(req,res)=>{
    sessionManager.setSession(null)
    res.redirect("/login")
});

route.get("/profile",async(req,res)=>{
    var online = await sessionManager.getSession();
    if (online){
        res.render("profile")
    }else{
        res.redirect("/login")
    }
});

route.get("/signup",(req,res)=>{
    res.render("signup")
});

route.get("/verify",(req,res)=>{
    res.render("verify")
});

route.get("/index",(req,res)=>{
    res.render("index")
});
route.get("/resendcode",(Req,res)=>{
    res.render("verify")
})

module.exports = route;