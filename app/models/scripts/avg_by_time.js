db.SensorRegistry.aggregate(

  // Pipeline
  [
    // Stage 1
    {
      $group: {
        _id:{
          node_id:"$node_id",
          day:{ $dayOfMonth: "$date" },
          month: { $month: "$date" },
          hour:{ $hour: "$date" },
        },
         avg_value: { $avg: "$value" },
                  max_value: { $max: "$value" },
                  min_value: { $min: "$value" },
                  count: { $sum: 1 }
      
      }
    }

  ]

  // Created with 3T MongoChef, the GUI for MongoDB - http://3t.io/mongochef

);
