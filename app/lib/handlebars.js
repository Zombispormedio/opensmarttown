var fs = require("fs");
var Handlebars = require("handlebars");

var helpers = require('handlebars-helpers')({
  handlebars: Handlebars
});


module.exports = function (template_filename, data, cb) {

    fs.readFile(template_filename, function (err, buffer) {
        if (err) return cb(err);

        var source = buffer.toString();
        var template = Handlebars.compile(source);

        cb(null, template(data));

    });

}