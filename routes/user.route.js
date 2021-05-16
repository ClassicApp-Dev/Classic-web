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

route.get("/",async(req,res)=>{
    res.render('index');
});


route.get("/chat-interest",async(req,res)=>{
    // var online = await sessionManager.getSession();
    var sess = req.session;
    if (sess.token){
        await interest.loadInterestData({token:sess.token,_id:sess._id}, async (err,response)=>{
            sess.joinedInterestsData = response.joinedInterestsData;
            sess.allInterests = response.allInterests;
            sess.joined = response.joinedInterests;
            res.render("base",{
                email:sess.email,
                username:sess.username,
                profilePhoto:sess.profilePhoto,
                coverphoto:sess.coverPhoto,
                description:sess.description,
                location:sess.location,
                token:sess.token,
                subRoute:'interestsection.ejs',
                interests:response.allInterests,
                joined:response.joinedInterests,
                storeData:response.joinedInterestsData,
                route:'chat-interest'
                // storedinterest:response.joinedinterestdata=response.joinedInterests
            });
        });
    }else{
        res.redirect("/login")
    }
});

route.get("/chat-messages/:interest",async(req,res)=>{
    // var online = await sessionManager.getSession();
    var sess = req.session;
    if (sess.token){
        res.status(200).json(sess.joinedInterestsData);
        /*await interest.loadInterestData({token:sess.token,_id:sess._id,interestName:req.params.interest}, async (err,response)=>{
            res.render("base",{
                email:sess.email,
                username:sess.username,
                profilePhoto:sess.profilePhoto,
                coverphoto:sess.coverPhoto,
                description:sess.description,
                location:sess.location,
                token:sess.token,
                subRoute:'chatsection.ejs',
                interests:response.allInterests,
                joined:response.joinedInterests,
                //interestData:{ ...response.interestData, ...{interestName:req.params.interest}}
            });
        });*/
    }else{
        res.redirect("/login")
    }
});


route.get("/feedback",async(req,res)=>{
    // var online = await sessionManager.getSession();
    var sess = req.session;
    if (sess.token){
        var allFeedback = [];
        await feedback.getAllfeedbacks(req.session,(error,resp)=>{
            if(!error){
                for(var i in resp.data){
                    var datetime = new Date(resp.data[i].time);
                    var newDate = datetime.toLocaleString()

                    // resp.data[i].time = newDate;
                    resp.data[i]['timeString'] = newDate;
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
                token:sess.token,
                subRoute:'feedbacksection.ejs',
                interests:req.session.allInterests,
                joined:req.session.joined,
                feedback:allFeedback,
                datetime:datetime.toLocaleString(),
                route:'feedback'
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
        res.redirect("/chat-interest")
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

        res.render("base",{
            email:sess.email,
            username:sess.username,
            avatarPhoto:sess.avatarPhoto,
            coverPhoto:sess.coverPhoto,
            location:sess.location,
            description:sess.description,
            token:sess.token,
            subRoute:'profilesection.ejs',
            interests:req.session.allInterests,
            joined:req.session.joined,
            route:'profile'
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
// route.get("/feedbackk",(req,res)=>{
//     res.render("feedbacksection",{
//         feedback:allFeedback,
//     })
// });


route.get("/feedbackk",async(req,res)=>{
    var sess = req.session;
    if (sess.token){
                var allFeedback = [];
                await feedback.getAllfeedbacks(req.session,(error,resp)=>{
                    if(!error){
                          for(var i in resp.data){
                            var datetime = new Date(resp.data[i].time);
                            var newDate = datetime.toLocaleString()
                            resp.data[i]['timeString'] = newDate;
                        }
                        allFeedback = resp.data;
                    }
                    res.render("base2",{
                        email:sess.email,
                        username:sess.username,
                        profilePhoto:sess.profilePhoto,
                        coverphoto:sess.coverPhoto,
                        description:sess.description,
                        location:sess.location,
                        token:sess.token,
                        subRoute:'feedbacksection.ejs',
                        interests:response.allInterests,
                        joined:response.joinedInterests,
                        feedback:allFeedback,
                        datetime:datetime.toLocaleString()
                    });
                });
    }else{
        res.redirect("/login")
    }
});


module.exports = route;
