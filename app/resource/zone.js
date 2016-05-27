const SIZE = process.env.OPEN_API_PAGINATION;

module.exports = function (Schema) {

    Schema.statics = {

        DefaultFormat: function () {
            var pre = {};

            pre._id = 0;
            pre.display_name = 1;
            pre.keywords = 1
            pre.ref=1
            pre.lookAt = "$center";
            pre.shape={
                 $cond: {
                    if: { $eq: ["$shape.type", "rectangle"] }, then: {type:"$shape.type", bounds:"$shape.bounds"}, else: {
                        $cond:{
                            if:{$eq:["$shape.type","polygon"]}, then:{type:"$shape.type", paths:"$shape.paths"}, else:{
                                type:"$shape.type", center:"$shape.center", radius:"$shape.radius"
                            }
                        }
                    }
                }
            }


            var project = { $project: pre };

            return project;

        },
        GeoJSONFormat:function(){   
            var pre={};
            
            pre.type={$literal:'Feature'};
            pre._id=0;
            pre.geometry={
                 $cond: {
                    if: { $eq: ["$shape.type", "rectangle"] }, 
                    then: {type:{$literal:"Polygon"}, coordinates:"$shape.bounds"}, 
                    else: {
                        $cond:{
                            if:{$eq:["$shape.type","polygon"]}, 
                            then:{type:{$literal:"Polygon"}, coordinates:"$shape.paths"}, 
                            else:{
                                type:{$literal:"Point"}, coordinates:"$shape.center"
                            }
                        }
                    }
                }
            }
            
            pre.properties={
                shape:{
                    $cond: {
                    if: { $eq: ["$shape.type", "circle"] }, 
                    then: {type:"$shape.type", radius:"$shape.radius"}, 
                    else: {
                        type:"$shape.type"
                    }
                }
                },
                display_name:"$display_name",
                keywords:"$keywords",
                ref:"$ref",
                
                global_center:{ type: {$literal:"Point"}, coordinates:"$center" }
            }
            
            var project = { $project: pre };

            return project;
            
        }

    };

}