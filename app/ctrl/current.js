var Boom = require("boom");
var async = require("async");
var unirest=require("unirest");
var $ = require('thunkify');
var C = require("../../config/main")
var i18n = require(C.lib + "i18n")
var SensorModel = require(C.models + "sensor");
var SensorCtrl = require(C.ctrl + "sensor")

var Controller = {};

Controller.GetSensorData = $(function (sensor_ref, cb) {
    if (!sensor_ref || sensor_ref === "") return cb(Boom.badData(i18n.E.no_sensor_ref))

    async.waterfall([
        SensorID(sensor_ref),
        CurrentData,
        Format(sensor_ref)
    ], cb);
});


var SensorID = function (ref) {

    ref = Number(ref);
    return function (cb) {

        SensorModel.findOne({ ref: ref }).select("node_id").exec(function (err, result) {
            if (err) return cb(err);
            if (!result) return cb(Boom.expectationFailed(i18n.E.no_sensor));
      
            cb(void 0, result.node_id);

        });
    }

}

const PUSH_HOST=process.env.PUSH_HOST;
const SECRET=process.env.OPEN_API_SECRET;

var CurrentData=function(node_id, cb){
    unirest.get(PUSH_HOST+"realtime/"+node_id)
    .headers("Authorization", SECRET)
    .end(function(res){
        if(!res.body)return cb(Boom.expectationFailed(i18n.E.no_data));
        if(!res.body.data)return cb(Boom.expectationFailed(i18n.E.no_data));
        cb(void 0, res.body.data);
    })
}


var Format=function(ref){
    
    return function(values, cb){
        
        SensorCtrl.GetSensor({ref:ref}, function(err, result){
           if(err)return cb(err);
           
           delete result[0].last_sync;
           console.log(values);
           result[0].current={
               value:Number(values.value),
               timestamp:new Date(values.timestamp)
            
           }
           
           
           
           cb(void 0, result); 
        });
        
        
        
        
    }

}

module.exports = Controller;