var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var C = require("../../config/main");

var SensorRegistryResource = require(C.resource + "sensor_registry")

var SensorRegistrySchema = new Schema({

 
    node_id: Schema.ObjectId,
    sensor_grid: Schema.ObjectId,
    value:Number,
    date:Date


}, { collection: "SensorRegistry" });



SensorRegistryResource(SensorRegistrySchema);

module.exports = mongoose.model("SensorRegistry", SensorRegistrySchema);