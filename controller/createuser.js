const axios = require("axios");
const qs = require("qs")
const https = require('https');
var session = require('express-session');
const {sessionManager} = require("../sessions/sessionManager");

const httpsAgent = (new https.Agent({
    rejectUnauthorized:false
}));

const createFunctions = {

    validateEmail: function (email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
    

    createuser : async function(param, callback) {
        if (this.validateEmail(param.email)){
            if (param.password==param.confirm){
            axios.post('http://50.18.102.80:3000/users/create',{
            username:param.username,
            email:param.email,
            gender:param.gender,
            dob:param.dob,
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

            }else{
                callback({error:1,message:"passwords are not thesame"},false)
            }
        }else{
            callback({error:1,message: "email address incorect"},false)
        }
        // Workaround to solve wrong route issue
        
    },
    resendCode : function(email){
        axios.post('http://50.18.102.80:3000/users/resendcode',{
            email:email
        }).then(async (response)=>{
            var session = await sessionManager.getSession();
            if(session){
                session.verificationCode = response.verification;
            }
        });
    }
        }

module.exports = createFunctions