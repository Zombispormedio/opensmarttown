const SIZE = Number(process.env.OPEN_API_PAGINATION);
const Utils={};


Utils.paginateAggregation=function(pipeline, page){
  if (page) {
        var p = Number(page)-1;
        pipeline.push({ $skip: SIZE * p });
    }

    pipeline.push({ $limit: SIZE });

    pipeline.push({ $sort: {ref:1} });
}

module.exports=Utils;