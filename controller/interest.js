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
                callback(false,{allInterests:response.interests,joinedInterests:response2.interests})
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
             console.log(err)
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
                //  console.log(response)
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
            console.log(response)
            callback(false,response.data);
        }).catch((err)=>{
            if(err.response.data){
                callback(err.response.data,false)
            }else{
                callback({error:1, message:"error encountered"},false)
            }
      });
     }
};


module.exports = interestFunctions