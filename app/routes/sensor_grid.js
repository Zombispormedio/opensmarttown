var Router = require('koa-router');
var _ = require("lodash")
var C = require("../../config/main")
var Response = require(C.lib + "response")
var i18n = require(C.lib + "i18n")
var log = require(C.lib + "logger")

var SensorGridCtrl = require(C.ctrl + "sensor_grid")
var SensorCtrl = require(C.ctrl + "sensor")

var middleware = require(C.routes + "middleware")

const PREFIX = '/grids';


var router = new Router({
    prefix: PREFIX
});

router.use(middleware.Developer());

var main = function* () {
    var query = _.cloneDeep(this.query);

    var format = query.format;

    query.ref = this.params.id;
    
     
     if(query.magnitude){
         query.magnitudeIDs=yield SensorCtrl.GridIDsByMagnitude(query.magnitude);
     }
  
     
    if (query.near) {
        query.nearIDs = yield SensorGridCtrl.NearIDs(query.near, query.max_distance);
    }
    
    
    var result = yield SensorGridCtrl.Get(query);
   

     switch (format) {
        case "kml":
            Response.SuccessXML(this, result);
            break;
        case "geojson":
            Response.SuccessGeoJSON(this, result);
            break;
        default:
            Response.Success(this, result);

    }




}


router.get('/', main);
router.get('/:id', main);






module.exports = router;