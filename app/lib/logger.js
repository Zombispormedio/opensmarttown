var winston = require('winston');
const Log = {}

Log.info = function (message, metadata) {
    metadata = metadata || {};
    winston.info(message, metadata);
}

Log.error = function (message, metadata) {
    metadata = metadata || {};
    winston.error(message, metadata);
}



Log.test = function (message, metadata) {
    metadata = metadata || {};
  
   winston.warn(message, metadata);
}

module.exports = Log;