const xlBuilder = require('../Helpers/xlBuilder')
const Reconcile = require('./reconcile')
const Sales = require('./sales')
const utils = require('../utils/utils')
const path = require('path')

module.exports = class DailyReports{

    static async gen(data, sales){
        const xb = new xlBuilder('Reconcile', {author: 'Resto POS'})
        Reconcile.put(xb, data)
        xb.createWorksheet('Sales')
        xb.fontSize = 10
        Sales.put(xb, sales)
        const filename = utils.rndSlug('.xlsx')
        const fullpath = path.join(global.TempDir, 'files', filename);
        await xb.writeFile(fullpath)
        return filename;
    }

}