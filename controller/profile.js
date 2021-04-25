const axios = require("axios");
const qs = require("qs")
const https = require('https');
var session = require('express-session');

const httpsAgent = (new https.Agent({
    rejectUnauthorized:false
}));
    
const profileFunctions = {
    
    updateprofile : async function(param, callback) {
        axios.post("http://50.18.102.80:3000/users/profile",{type:"update" , location:param.location, description:param.description},{
        httpsAgent: httpsAgent,
        headers:{ Authorization : 'Bearer '+param.token},
    }).then((response)=>{
        console.log("got here");
        console.log(response)
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
};

module.exports = profileFunctions