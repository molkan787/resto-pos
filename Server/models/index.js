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

    Model.knex(knex);

    console.log('MySQL: Connected');

    return knex;
}
