var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var C = require("../../config/main");

var SensorGridResource = require(C.resource + "sensor_grid")

var SensorGridSchema = new Schema({

   ref:Number,
   display_name:String,
   device_name:String,
   description:String,
   location:[Number],
   zone:Schema.ObjectId,
   sensors:[Schema.ObjectId]
   

}, {collection:"SensorGrid"});



SensorGridResource(SensorGridSchema);

module.exports = mongoose.model("SensorGrid", SensorGridSchema);