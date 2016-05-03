var mongoose = require('mongoose');


var C = require("./main.js");
var Log = require(C.lib + "logger")

module.exports = function (done) {

    
    var mongodb=mongoose.connect(C.db).connection;
    //var mongodb = mongoose.connect(C.db_secure).connection;

    mongodb.on("error", function (err) {
        Log.error("It has ocurred this error during mongodb connection", err);

    });

    mongodb.once('open', function () {
         Log.info("MongoDB Connected");

        done();
    });

    mongodb.once('close', function () {
         Log.info("MongoDB Connection Closed");
         process.exit();
    });



};