const SIZE = process.env.OPEN_API_PAGINATION;

module.exports = function (Schema) {

    Schema.statics = {

        query: function (params) {
            var q = this.find({});

            for (key in params) {

                switch (key) {
                    case "page": {
                        var p = params[key];
                        var skip = SIZE * p;
                        q.skip(skip);
                        q.limit(SIZE);
                        break;
                    }
                }

            }

            if (params.page == void 0) {
                q.limit(SIZE);
            }

            return q;
        }

    }

}