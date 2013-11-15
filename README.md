reverse-proxy
=============

A simple reverse proxy for learning http proxy.

simplified from [node-http-proxy](https://github.com/nodejitsu/node-http-proxy).


support
---------------------

* http
* https
* websocket

https
-------------------------------

add ``pki/root/rootCA.pem`` to trusted certificate authority of browsers.

windows
--------------------------

need to install git and run ``node test/reverse`` in git bash

usage
----------------------------

``` javascript
require('reverse-proxy').createServer({
   port: 8000,
   map: function (config) {
        // proxy from localhost
        if (config.path == '/kissy/k/1.4.0/seed-min.js') {
            config.path = '/t.js';
            config.host = 'localhost';
            console.log('refetch from: ' + config.host + config.path);
        }
        return config;
   }
});
```

others
--------------------------------------

* https://npmjs.org/package/http-proxy
* https://npmjs.org/package/proxy
* https://npmjs.org/package/nproxy