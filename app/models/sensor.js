var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var C = require("../../config/main");

var SensorResource = require(C.resource + "sensor")

var SensorSchema = new Schema({

    ref: Number,
    display_name: String,
    device_name: String,
    description: String,
    magnitude: Schema.ObjectId,
    unit: Schema.ObjectId,
    sensor_grid: Schema.ObjectId


}, { collection: "Sensor" });



SensorResource(SensorSchema);

module.exports = mongoose.model("Sensor", SensorSchema);