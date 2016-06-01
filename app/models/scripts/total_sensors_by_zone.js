var map_func=function(){
emit(this.zone,this.sensors.length);
}
var reduce_func=function(key, count){
  return Array.sum(count);
}

db.SensorGrid.mapReduce(map_func, reduce_func, {out:"total_sensors_by_zone"});
