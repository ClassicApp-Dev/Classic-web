const axios = require("axios");
const qs = require("qs")
const https = require('https');
var session = require('express-session');

const httpsAgent = (new https.Agent({
    rejectUnauthorized:false
}));

const feedbackFunctions = {
    sendfeedback : async function(param, callback) {
        
        axios.post('http://50.18.102.80:3000/users/sendfeedback',{message:param.message},{
        httpsAgent: httpsAgent,
        headers:{ Authorization : 'Bearer '+param.token},
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

    getfeedbacks: async function(param,callback){
        axios.get("http://50.18.102.80:3000/users/"+param.feedbackId+"/feedback",{
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

     getAllfeedbacks : async function(param, callback) {
        axios.get("http://50.18.102.80:3000/users/"+ param._id +"/feedback",{
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

module.exports = feedbackFunctions