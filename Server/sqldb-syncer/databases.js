const knex = require('knex');

module.exports.createConnections = (config1, config2) => {
    const connection1 = createConnection(config1);
    const connection2 = createConnection(config2);
    return [
        connection1,
        connection2,
    ]
}

function createConnection(config){
    if(typeof config == 'function') return config;
    return knex({
        client: 'mysql2',
        connection: config,
    });
}