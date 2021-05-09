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
const user = require("../controller/user");

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
    var toverify = md5(eval(details.code));
    if (toverify==sess.verificationCode){
        res.redirect("/profile")
    }else{
        res.redirect("/verify")
    };
});

route.get("/logout",(req,res)=>{
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

route.post("/sendfeedback",urlencodedParser,(req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    feedback.sendfeedback({...details, ...{token:req.session.token}}, async (error,response)=>{
        if (error){
            console.log("error at feedback api")
           res.redirect('/feedback');
        }else{
            res.redirect("/feedback");
        }
    });``
});

route.post("/updateprofile",urlencodedParser,(req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    details['location'] = (details.location==undefined)?req.session.location:details.location;
    details['description'] = (details.description==undefined)?req.session.description:details.description;
    profile.updateprofile({...details, ...{token:req.session.token}}, async (error,response)=>{
        if (error){
           res.redirect('/profile');
        }else{
            var sess = req.session;

            sess.location = details.location;
            sess.description = details.description;
            sess.coverPhoto = details.coverPhoto

           res.redirect("/profile");
        }
    });
});

route.post("/updateprofilephoto",urlencodedParser,(req,res)=>{

    console.log(req.body);
});


route.get("/getfeedbacks",(req,res)=>{
    console.log("gotten feedback");
    feedback.getfeedbacks({token:req.session.token,feedbackId:req.session.id},(error,response)=>{
        res.redirect("/feedback")
    });
});

route.get("/getInterestMessages/:id",(req,res)=>{
  console.log(req.params.id);
    interest.getInterestMessages({token:req.session.token,interestId:req.params.id},(error,response)=>{
        if(!error){
            res.status(200).json(response.messages);
        }else{
            res.status(200).json([]);
        }
    });
});

route.get("/getDirectMessages/:alias",(req,res)=>{
    user.getDirectMessages({token:req.session.token,alias:req.params.alias},(error,response)=>{
        if(!error){
            //console.log(response);
            res.status(200).json(response.data);
        }else{
            res.status(200).json([]);
        }
    });
});

route.get("/refreshprofile", async(req,res)=>{
    await profile.refreshprofile({token:req.session.token,_id:req.session._id}, (error,response)=>{
        if (error){

            console.log('error at refresh profile api');

        }else{
            var sess= req.session;
            sess.avatarPhoto=response.avatarPhoto;
            sess.coverPhoto=response.coverPhoto;
            res.redirect("/profile");
        }
    });
});

route.post("/createinterest",urlencodedParser,(req,res)=>{
    var details = JSON.parse(JSON.stringify(req.body));
    interest.createinterest({...details, ...{token:req.session.token}}, async (error,response)=>{
        if (error){
           console.log("this error occured at create interest api ///////////////")
           console.log(error)
        }else{
            res.redirect('/chat-interest');
        }
    });
});

module.exports = route;
