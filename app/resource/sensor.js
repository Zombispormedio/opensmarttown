var C = require("../../config/main")


module.exports = function (Schema) {

   Schema.statics = {

       GetRefs:function(ids, cb){
           this.find({_id:{$in:ids}}).select("ref").exec(function(err, refs){
               if(err)return cb(err);
               
               var refs=refs.map(function(a){
                  return a.ref; 
               });
               cb(null, refs);
           });
       }
        
   }

}