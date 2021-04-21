const { Router } = require("express");
const express = require("express");
const route = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios");
const {json} = require("body-parser");
const login = require("../controller/login");
const register = require("../controller/createuser");
const {sessionManager} = require("../sessions/sessionManager");
const { createuser } = require("../controller/createuser");
const md5 = require("md5");

var urlencodedParser = bodyParser.urlencoded({ extended: false});

route.post("/loginuser",urlencodedParser,(req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    login.postLogin(details, (error,response)=>{
        if (error){
            res.redirect('/login');
        }else{
            var localSession = req.session;
            localSession.email = response.email;
            localSession.token = response.token;
            localSession.username = response.username;
            sessionManager.setSession(localSession);
            res.redirect('/profile');
        }
    });
});

route.post("/createuser",urlencodedParser,(req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    register.createuser(details, async (error,response)=>{
        if (error){
           res.redirect('/signup');
        }else{
            var localSession = req.session;
            localSession.emailToVerify = details.email;
            console.log(response.verification) 
            localSession.verificationCode = response.verification;
            sessionManager.setSession(localSession);
           res.redirect("/verify");
        }
    });
});

route.get("/resendcode",async (req,res)=>{
    var session = await sessionManager.getSession();
    register.resendCode(session.emailToVerify);
})

route.post("/verifyuser",urlencodedParser,async (req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    var session = await sessionManager.getSession();
    var toverify = md5(eval(details.code)); console.log(toverify); console.log(session.verificationCode);
    if (toverify==session.verificationCode){
        res.redirect("/profile")
    }else{
        res.redirect("/verify")
    };
});
    



module.exports = route;