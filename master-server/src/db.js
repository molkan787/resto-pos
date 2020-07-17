const knex = require('knex');

const dbClient = knex({
    client: 'mysql2',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'mvps',
    }
});

module.exports = dbClient;