const SIZE = Number(process.env.OPEN_API_PAGINATION);
const Utils = {};


Utils.paginateAggregation = function (pipeline, page, size, by_ref) {
    size=Number(size)||SIZE;
    if (page) {
        var p = Number(page) - 1;
        pipeline.push({ $skip: size * p });
    }

    pipeline.push({ $limit: size });

    if(by_ref!==false)
    pipeline.push({ $sort: { ref: 1 } });
}

module.exports = Utils;