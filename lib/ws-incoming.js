// https://github.com/nodejitsu/node-http-proxy
var http = require('http'),
    https = require('https'),
    utils = require('./utils');

module.exports = [
    /**
     * WebSocket requests must have the `GET` method and
     * the `upgrade:websocket` header
     *
     * @param {ClientRequest} req Request object
     * @param {Socket} socket
     */
        function (req, socket) {
        if (req.method !== 'GET' || !req.headers.upgrade) {
            socket.destroy();
            return;
        }

        if (req.headers.upgrade.toLowerCase() !== 'websocket') {
            socket.destroy();
        }
    },

    /**
     * Set the proper configuration for sockets,
     * set no delay and set keep alive, also set
     * the timeout to 0.
     *
     * @param {ClientRequest} req Request object
     * @param {Socket} socket
     */

        function (req, socket) {
        socket.setTimeout(0);
        socket.setNoDelay(true);

        socket.setKeepAlive(true, 0);
    },

    /**
     * Sets `x-forwarded-*` headers if specified in config.
     *
     * @param {ClientRequest} req Request object
     * @param {Socket} socket
     * @param {Object} Options Config object passed to the proxy
     */

        function (req, socket, options) {
        var values = {
            for: req.connection.remoteAddress || req.socket.remoteAddress,
            port: req.connection.remotePort || req.socket.remotePort,
            proto: req.connection.pair ? 'wss' : 'ws'
        };

        ['for', 'port', 'proto'].forEach(function (header) {
            req.headers['x-forwarded-' + header] =
                (req.headers['x-forwarded-' + header] || '') +
                    (req.headers['x-forwarded-' + header] ? ',' : '') +
                    values[header];
        });
    },

    /**
     * Does the actual proxying. Make the request and upgrade it
     * send the Switching Protocols request and pipe the sockets.
     *
     * @param {ClientRequest} req Request object
     * @param {Socket} socket
     * @param {Object} options Config object passed to the proxy
     */
        function (req, socket, options) {
        utils.setupSocket(socket);

        function onError(err) {
            console.log('error in ws: ' + err);
        }

        var config = utils.setupOutgoing({}, req, null, options);

        var proxyReq = (req.connection.pair ? https : http).request(config);
        // Error Handler
        proxyReq.on('error', onError);

        proxyReq.on('upgrade', function (proxyRes, proxySocket) {
            proxySocket.on('error', onError);
            utils.setupSocket(proxySocket);
            socket.write('HTTP/1.1 101 Switching Protocols\r\n');
            socket.write(Object.keys(proxyRes.headers).map(function (i) {
                var v = proxyRes.headers[i];
                return i + ": " + v;
            }).join('\r\n') + '\r\n\r\n');
            socket.pipe(proxySocket).pipe(socket);
        });
        req.pipe(proxyReq);
    }
];