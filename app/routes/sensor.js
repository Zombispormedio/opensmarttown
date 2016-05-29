var Router = require('koa-router');
var _ = require("lodash")
var C = require("../../config/main")
var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")

var SensorCtrl = require(C.ctrl + "sensor")

var middleware = require(C.routes + "middleware")

const PREFIX = '/sensors';


var router = new Router({
    prefix: PREFIX
});

router.use(middleware.Developer());

var main = function* () {
  var query = _.cloneDeep(this.query);

    query.ref = this.params.id;
    
     if (query.magnitude) {
        query.magnitudeIDs = yield SensorCtrl.MagnitudeIDs(query.magnitude);
    }
    
    if (query.grid) {
        
        query.gridIDs = yield SensorCtrl.GridIDs(query.grid);
     
    }
    

    var result = yield SensorCtrl.Get(query);
    Response.Success(this, result);


}


router.get('/', main);
router.get('/:id', main);






module.exports = router;