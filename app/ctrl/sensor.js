var Boom = require("boom");
var async = require("async");
var _ = require("lodash");
var $ = require('thunkify');
var C = require("../../config/main")

var i18n = require(C.lib + "i18n")
var mongo = require(C.lib + "mongoutils")


var SensorGridModel = require(C.models + "sensor_grid")
var SensorModel = require(C.models + "sensor");


var Controller = {};

Controller.Get = $(function (params, cb) {
   
   
SensorModel.find({}).exec(cb);


});

module.exports = Controller;