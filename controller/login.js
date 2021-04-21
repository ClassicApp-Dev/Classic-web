const axios = require("axios");
const qs = require("qs")
const https = require('https');
var session = require('express-session');
  
const httpsAgent = (new https.Agent({
    rejectUnauthorized:false
}));

const loginFunctions = {
    postLogin : async function(param, callback) {
        // Workaround to solve wrong route issue
        axios.post('http://50.18.102.80:3000/users/login',{
            username:param.username,
            password:param.password
        },{
            httpsAgent: httpsAgent
        }).then((response)=>{
            callback(false,response.data);
        }).catch((err)=>{
            if(err.response.data){
                callback(err.response.data,false)
            }else{
                callback({error:1, message:"error encountered"},false)
            }
                          
        });


    } 
}

module.exports = loginFunctions