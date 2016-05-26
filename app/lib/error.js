module.exports = function (url) {
    return function (error) {
        return {
            error: error,
            url: url
        }
    };

}