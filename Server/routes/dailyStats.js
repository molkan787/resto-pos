const Reports = require("../reports");
const ResponseMaker = require("../utils/response");

module.exports = async (req, res, next) => {
    try {
        const stats = await Reports.genDailyStats(req.params.day);
        res.send(ResponseMaker.success({ stats }));
        next();
    } catch (error) {
        console.error(error)
        return next(new errors.InternalError('ERROR:101'));
    }
}