
db.Sensor.aggregate([{ $match:{
magnitude:ObjectId("571fba46c479e0beff646d4a")
}
}, {
$group:{
"_id":"$magnitude",
"grids":{$addToSet:"$sensor_grid"}
}
}])
