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

    updateprofilephoto : async function(param, callback) {
        console.log("gotten inside update profile pic")
       await axios.post("http://50.18.102.80:3000/users/profile",{type:"upload" , avatarPhoto:param.avatarPhoto},{
        httpsAgent: httpsAgent,
        
        headers:{ 
            Authorization : 'Bearer '+param.token},
            "content-type": "multipart/form-data",
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
    
    refreshprofile: async function(param,callback){
        axios.get("http://50.18.102.80/users/"+param._id,{
            httpsAgent: httpsAgent,
            headers:{ Authorization : 'Bearer '+param.token}
        }).then((response)=>{
            callback(false,response.data);
        }).catch((err)=>{
            if(err.response.data){
                callback(err.response.data,false)
                console.log(err)
            }else{
                callback({error:1, message:"error encountered"},false)
            }
      });
     },
};
module.exports = profileFunctions