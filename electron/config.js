const DEV = global.DEV;

const config = {
    master_host: DEV ? '192.168.1.3' : 'api.ecomretail.co.uk',
    master_api_url: DEV ? 'http://127.0.0.1:8095/client' : 'http://api.ecomretail.co.uk/client',
    dl_base_url: DEV ? 'http://127.0.0.1' : 'http://dl.ecomretail.co.uk'
}

global.main_config = config;

module.exports = config;