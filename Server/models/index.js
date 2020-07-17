const { Model } = require('objection');
const Knex = require('knex');
const Config = require('../config');
const SqlSyncerMetaData = require('../sqldb-syncer/metadata');
const time = require('../utils/time');

module.exports = function (serverPort){
    // Initialize knex.
    const knex = Knex({
        client: 'mysql2',
        connection: {
            ...Config.db,
            port: serverPort,
        },
    });

    Model.beforeDelete = async function (args){
        await args.asFindQuery().patch({
            [SqlSyncerMetaData.IS_DELETED_COLUMN]: 1,
            [SqlSyncerMetaData.DELETED_TIME_COLUMN]: time.now(),
        });
        args.cancelQuery();
    }

    Model.afterFind = async function (args){
        // console.log(args.context)
    }

    Model.knex(knex);

    console.log('MySQL: Connected');

    return knex;
}
