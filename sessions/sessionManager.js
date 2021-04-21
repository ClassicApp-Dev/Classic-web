class sessionManager {

    static async getSession(){
        if(this.session) return this.session;
        return false;
    }
    static async setSession(session){
        this.session=session
    }
};

module.exports = {sessionManager}