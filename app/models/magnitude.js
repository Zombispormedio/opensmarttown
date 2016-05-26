var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var C = require("../../config/main");

var MagnitudeResource = require(C.resource + "magnitude")

var MagnitudeSchema = new Schema({

   ref:Number,
   display_name:String,
   type:String,
   analog_units:[{
          display_name:String,
          symbol:String
   }],
   digital_units:{
       on:String,
       off:String
   },
   conversions:{
        display_name:String,
         operation:String,
         unitA:Schema.ObjectId,
         unitB:Schema.ObjectId
   }

}, {collection:"Magnitude"});



MagnitudeResource(MagnitudeSchema);

module.exports = mongoose.model("Magnitude", MagnitudeSchema);