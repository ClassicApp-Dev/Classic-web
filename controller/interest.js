const axios = require("axios");
const qs = require("qs")
const https = require('https');
var session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const createFunctions = require("./createuser");
const { response } = require("express");
const redisStore = require('connect-redis')(session);
const client  = redis.createClient();

const httpsAgent = (new https.Agent({
    rejectUnauthorized:false
}));

const interestFunctions = {

    loadInterestData: async function(param,callback){
        var that = this;
        await this.getAllInterests({token:param.token},async (error,response)=>{
            if(error){
                response = {};
               response.interests = [];
            }
            await that.getjoinedby({token:param.token,_id:param._id},async(error2,response2)=>{
                if(error2){
                    response2 = {};
                    response2.interests = [];
                }
                var joinedInterestsData = {};
                    function loopInterests(i,array){
                        if(i<array.length){
                            interestId = response2.interests[i].interest_id;
                            onlineMembers = response2.interests[i].membersOnline;
                            joinedInterestsData[interestId] = {interestName:response2.interests[i].interest_name,interestMembers:response2.interests[i].members,onlineMembers:onlineMembers}
                            loopInterests((i+1),array)
                        }else{
                            callback(false,{allInterests:response.interests,joinedInterests:response2.interests,joinedInterestsData:joinedInterestsData})
                        }
                    }
                    loopInterests(0,response2.interests);
            });
        });
    },
    getAllInterests : async function(param, callback) {
       axios.get("http://50.18.102.80:3000/interests",{
            httpsAgent: httpsAgent,
            headers:{ Authorization : 'Bearer '+param.token}
        }).then((response)=>{
            callback(false,response.data);
        }).catch((err)=>{
             if(err.response.data){
                callback(err.response.data,false)
            }else{
                callback({error:1, message:"error encountered"},false)
            }
        });
    },

    getjoinedby : async function(param, callback) {
        axios.get("http://50.18.102.80/interests/joined-by/"+ param._id,{
             httpsAgent: httpsAgent,
             headers:{ Authorization : 'Bearer '+param.token}
         }).then((response)=>{
             callback(false,response.data);
         }).catch((err)=>{
             if(err.response.data){
                callback(err.response.data,false)
             }else{
                 callback({error:1, message:"error encountered"},false)
             }
       });
     },

     getInterestMessages: async function(param,callback){
        axios.get("http://50.18.102.80:3000/interests/"+param.interestId+"/messages",{
            httpsAgent: httpsAgent,
            headers:{ Authorization : 'Bearer '+param.token}
        }).then((response)=>{
            callback(false,response.data);
        }).catch((err)=>{
            if(err.response.data){
                callback(err.response.data,false)
            }else{
                callback({error:1, message:"error encountered"},false)
            }
      });
     },

     joinInterest: async function(param,callback){
        axios.post("http://50.18.102.80:3000/interests/"+param.interestId+"/join",{},{
            httpsAgent: httpsAgent,
            headers:{ Authorization : 'Bearer '+param.token}
        }).then((response)=>{
              callback(false,response.data);
        }).catch((err)=>{
            if(err.response.data){
                callback(err.response.data,false)
            }else{
                callback({error:1, message:"error encountered"},false)
            }
      });
     },

     createinterest : async function(param, callback) {
        axios.post('http://50.18.102.80:3000/interests/create',{name:param.name},{
            httpsAgent: httpsAgent,
            headers:{ Authorization : 'Bearer '+param.token}
        }).then((response)=>{
            callback(false,response.data);
        }).catch((err)=>{
            if(err.response.data){
                callback(err.response.data,false)
            }else{
                callback({error:1, message:"an error encountered at create interest controller"},false)}
        });
    }
};


module.exports = interestFunctions
