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

const userFunctions = {

     getDirectMessages: async function(param,callback){
        axios.get("https://api.classicapp.online/users/"+param.alias+"/messages",{
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
};


module.exports = userFunctions
