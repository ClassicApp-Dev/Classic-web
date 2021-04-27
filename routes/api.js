const { Router } = require("express");
const express = require("express");
const route = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios");
const {json} = require("body-parser");
const login = require("../controller/login");
const register = require("../controller/createuser");
const interest = require("../controller/interest");
const feedback = require("../controller/feedback");
const profile = require("../controller/profile");

const { createuser } = require("../controller/createuser");
const md5 = require("md5");
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client  = redis.createClient();


var urlencodedParser = bodyParser.urlencoded({ extended: false});

route.post("/loginuser",urlencodedParser,(req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    login.postLogin(details, (error,response)=>{
        if (error){
            // console.log(error);
            res.redirect('/login?e=1');
            
        }else{
            var sess= req.session;
            sess.email = response.email;
            sess.token = response.token;
            sess.username = response.username;
            sess.gender = response.gender;
            sess.dob=response.dob;
            sess.alias=response.alias;
            sess.avatarPhoto=response.avatarPhoto;
            sess.coverPhoto=response.coverPhoto;
            sess.description=response.description;
            sess.location=response.location;
            sess._id=response._id;
            res.redirect("/chat-interest");
        }
    });
});

route.post("/createuser",urlencodedParser,(req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    register.createuser(details, async (error,response)=>{
        if (error){
           res.redirect('/signup');
        }else{
            var sess = req.session;
            sess.emailToVerify = details.email;
            // console.log(response.verification) 
            sess.verificationCode = response.verification;
            // sessionManager.setSession(sess);
           res.redirect("/verify");
        }
    });
});

route.get("/resendcode",async (req,res)=>{
    // var session = await sessionManager.getSession();
    var sess= req.session;
    register.resendCode(sess.emailToVerify);
})

route.post("/verifyuser",urlencodedParser,async (req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    // var session = await sessionManager.getSession();
    var sess= req.session;
    var toverify = md5(eval(details.code)); console.log(toverify); console.log(sess.verificationCode);
    if (toverify==sess.verificationCode){
        res.redirect("/profile")
    }else{
        res.redirect("/verify")
    };
});

route.get("/logout",urlencodedParser,(req,res)=>{
    login.postlogout(req.session.token);
    var sess= req.session;
     sess.token=(null)
     sess.email=(null)
    res.redirect("/login")
});
    
route.get("/joinInterest",(req,res)=>{
    interest.joinInterest({token:req.session.token,interestId:req.query.n},(error,response)=>{
        res.redirect("/chat-interest")
    });
});


// these are not tested yet\/\\/\/\/\/\/\/\/\/\/\/\/\/\/\/
route.post("/sendfeedback",urlencodedParser,(req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    feedback.sendfeedback({...details, ...{token:req.session.token}}, async (error,response)=>{
        if (error){
            console.log("error at feedback api")
           res.redirect('/feedback');
        }else{
            var sess = req.session;
            sess.feedback = details.message;
            sess.token = response.token;
            // console.log("feedback working");
            res.redirect("/feedback");
        }
    });``
});

route.post("/updateprofile",urlencodedParser,(req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    details['location'] = (details.location==undefined)?req.session.location:details.location;
    details['description'] = (details.description==undefined)?req.session.description:details.description;
    details['coverPhoto'] = (details.coverPhoto==undefined)?req.session.coverPhoto:details.coverPhoto;
    profile.updateprofile({...details, ...{token:req.session.token}}, async (error,response)=>{
        if (error){
           res.redirect('/profile');
        }else{
            console.log("gotupdate");
            // console.log(details.location)
            var sess = req.session;
           
            sess.location = details.location;
            sess.description = details.description;
            sess.coverPhoto = details.coverPhoto
            
           res.redirect("/profile");
        }
    });
});

route.post("/updateprofilecover",urlencodedParser,(req,res)=>{
        // var formData = new FormData();
        // var imagefile = document.querySelector('#file');
        // formData.append("image", imagefile.files[0]);

    var details = JSON.parse(JSON.stringify(req.body));
    details['coverPhoto'] = (details.coverPhoto==undefined)?req.session.coverPhoto:details.coverPhoto;
    profile.updateprofile({...details, ...{token:req.session.token}}, async (error,response)=>{
        if (error){
           res.redirect('/profile');
        }else{
          var sess = req.session;           
          sess.coverPhoto = details.coverPhoto            
           res.redirect("/profile");
        }
    });
});


route.get("/getfeedbacks",(req,res)=>{
    console.log("gotten feedback");
    feedback.getfeedbacks({token:req.session.token,feedbackId:req.session.id},(error,response)=>{
        res.redirect("/feedback")
    });
});

route.get("/getInterestMessages/:id",(req,res)=>{
    interest.getInterestMessages({token:req.session.token,interestId:req.params.id},(error,response)=>{
        if(!error){
            res.status(200).json(response.messages);
        }else{
            res.status(200).json([]);
        }
    });
});

module.exports = route;