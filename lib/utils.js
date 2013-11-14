// https://github.com/nodejitsu/node-http-proxy
var url = require('url');
var http = require('http'),
    https = require('https');

var utils = module.exports = {
    isReqHttps: function (req) {
        return  req.isSpdy ? 1 : (req.connection.pair ? 1 : 0);
    },
    setupOutgoing: function (outgoing, req, res, option) {
        var urlObj = url.parse(req.url);
        var isHttps = utils.isReqHttps(req);
        var headers = req.headers;
        outgoing.port = isHttps ? 443 : (urlObj.port || 80);
        outgoing.host = urlObj.hostname || headers.host;
        outgoing.method = req.method;
        outgoing.path = urlObj.path;
        outgoing.rejectUnauthorized = false;
        outgoing.headers = headers;
        if (option.map) {
            outgoing = option.map(outgoing, req, res);
        }
        return outgoing;
    },

    /**
     * Set the proper configuration for sockets,
     * set no delay and set keep alive, also set
     * the timeout to 0.
     *
     * @param {Socket} socket instance to setup
     * @return {Socket} Return the configured socket.
     */

    setupSocket: function (socket) {
        socket.setTimeout(0);
        socket.setNoDelay(true);
        socket.setKeepAlive(true, 0);
        return socket;
    }
};