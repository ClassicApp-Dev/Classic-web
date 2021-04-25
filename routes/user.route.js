const { Router, request, response } = require("express");
const express = require("express");
const route = express.Router();
const bodyParser = require("body-parser");
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client  = redis.createClient();
const interest = require("../controller/interest");
const feedback = require("../controller/feedback")
const profile = require("../controller/profile");
const e = require("express");

var urlencodedParser = bodyParser.urlencoded({ extended: false});


route.get("/chat-interest",async(req,res)=>{
    // var online = await sessionManager.getSession();
    var sess = req.session;
    if (sess.token){
        await interest.loadInterestData({token:sess.token,_id:sess._id}, async (err,response)=>{
            res.render("base",{
                email:sess.email, 
                username:sess.username,
                profilePhoto:sess.profilePhoto,
                coverphoto:sess.coverPhoto,
                description:sess.description,
                location:sess.location,
                subRoute:'interestsection.ejs',
                interests:response.allInterests,
                joined:response.joinedInterests,
            });
        });
    }else{
        res.redirect("/login")
    }
});

route.get("/chat-messages",async(req,res)=>{
    // var online = await sessionManager.getSession();
    var sess = req.session;
    if (sess.token){
        await interest.loadInterestData({token:sess.token,_id:sess._id}, async (err,response)=>{
            res.render("base",{
                email:sess.email, 
                username:sess.username,
                profilePhoto:sess.profilePhoto,
                coverphoto:sess.coverPhoto,
                description:sess.description,
                location:sess.location,
                subRoute:'chatsection.ejs',
                interests:response.allInterests,
                joined:response.joinedInterests

            });
        });
    }else{
        res.redirect("/login")
    }
});


route.get("/feedback",async(req,res)=>{
    // var online = await sessionManager.getSession();
    var sess = req.session;
    if (sess.token){        
        await interest.loadInterestData({token:sess.token,_id:sess._id}, async (err,response)=>{
                var allFeedback = [];
                await feedback.getAllfeedbacks(req.session,(error,resp)=>{
                    if(!error){
                        // console.log(resp);
                        for(var i in resp.data){
                            var datetime = new Date(resp.data[i].time);
                            var newDate = datetime.toLocaleString()
                            
                            // resp.data[i].time = newDate;
                            resp.data[i]['timeString'] = newDate;
                            // console.log(ddate);
                        }

                        allFeedback = resp.data;
                    }
                    res.render("base",{
                        email:sess.email, 
                        username:sess.username,
                        profilePhoto:sess.profilePhoto,
                        coverphoto:sess.coverPhoto,
                        description:sess.description,
                        location:sess.location,
                        subRoute:'feedbacksection.ejs',
                        interests:response.allInterests,
                        joined:response.joinedInterests,
                        feedback:allFeedback,
                        datetime:datetime.toLocaleString()
                    });
                });
        });
    }else{
        res.redirect("/login")
    }
});

route.get("/forgetpassword",(req,res)=>{
        res.render("forgetpassword")
});

route.get("/login",async (req,res)=>{
    // var online = await sessionManager.getSession();
    var sess= req.session;
    if (sess.token){
        res.redirect("/profile")
    }else{
        var data ={message:false};
        if(req.query.e){
            data = {message:"Invalid login credentials"}
        }
        res.render("login",data);
    }
});

route.get("/profile",async(req,res)=>{
    var sess = req.session;
    if (sess.token){
        await interest.loadInterestData({token:sess.token,_id:sess._id}, async (err,response)=>{
            console.log(sess.profilePhoto)
            res.render("base",{
                email:sess.email, 
                username:sess.username,
                avatarPhoto:sess.avatarPhoto,
                coverphoto:sess.coverPhoto,
                location:sess.location,
                description:sess.description,
                subRoute:'profilesection.ejs',
                interests:response.allInterests,
                joined:response.joinedInterests
            });
        });
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
});

route.get("/base", (req,res)=>{
    if (sess.token){
        res.render("base")
    }
        else
        {
        res.redirect("/login")
    }
});
// route.get("/sendfeedback",(req,res)=>{
//     res.redirect("/feedback")
// });


module.exports = route;