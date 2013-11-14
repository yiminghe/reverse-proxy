var proxy = require('../');
proxy.createServer({
    port: 8000,
    map: function (config) {
        if (config.path == '/kissy/k/1.4.0/seed-min.js') {
            config.path = '/t.js';
            config.host = 'localhost';
            console.log('refetch from: ' + config.host + config.path);
        }
        return config;
    }
});