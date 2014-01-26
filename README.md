# reverse-proxy


A simple reverse proxy.


## support

* http
* https
* websocket

### https

add ``pki/root/rootCA.pem`` to trusted certificate authority of browsers.

### windows

need to install git and run ``node test/reverse`` in git bash

## usage

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

## changelog

### 0.3.0

- use SNI. does not support ie on windows xp.
