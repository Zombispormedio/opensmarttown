var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var C = require("../../config/main");

var ZoneResource = require(C.resource + "zone")

var ZoneSchema = new Schema({

   ref:Number,
   display_name:String,
    description:String,
    keywords:[String],
    center:[Number],
    shape:{
        type:String,
        paths:[[Number]],
        bounds:[[Number]],
        center:[Number],
        radius:Number
    }
  
}, {collection:"Zone"});



ZoneResource(ZoneSchema);

module.exports = mongoose.model("Zone", ZoneSchema);