var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
var C = require("../../config/main");

var DeveloperResource = require(C.resource + "developer")

var DeveloperSchema = new Schema({

    email: {
        type: String,
        unique: true,
        required: true
    },

    access_token: String

});

DeveloperSchema.plugin(uniqueValidator);

DeveloperResource(DeveloperSchema);

module.exports = mongoose.model("Developer", DeveloperSchema);