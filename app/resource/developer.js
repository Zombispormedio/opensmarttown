var async=require("async");
var C = require("../../config/main")

var Utils=require(C.lib+"utils");

module.exports=function(Schema){
    
    Schema.methods={
        generateAccessToken:function(){
            this.access_token=Utils.generateToken(50);
        }
    }
    
    Schema.statics={
        UpdateAccessToken:function(email, cb){
        
            async.waterfall([
                (function(next){
                    this.checkEmail(email, next);
                }).bind(this), 
                function update(user, next){
                    var flags={update:false};
                    
                    if(!user)return cb(null, flags);
                   
                    user.generateAccessToken();
                    user.save(function(err, result){
                        if(err)return next(err);
                        flags.update=true;
                        flags.access_token=result.access_token;
                        next(null, flags);
                    });
                },
              
         
            ], cb);
           
        },
        checkEmail:function(email, cb){
             this.findOne({"email":email}, cb);
        },
        
        checkAccessToken:function(token, cb){
            this.findOne({"access_token": token}, cb);
        }
    }
    
}