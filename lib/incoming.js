// https://github.com/nodejitsu/node-http-proxy
var outgoing = require('./outgoing');
var utils = require('./utils');
var http = require('http'),
    https = require('https');


module.exports = [
    /**
     * Sets `content-length` to '0' if request is of DELETE type.
     *
     * @param {ClientRequest} req Request object
     * @param {ServerResponse} res Response object
     */
        function (req, res) {
        if (req.method === 'DELETE' && !req.headers['content-length']) {
            req.headers['content-length'] = '0';
        }
    },

    /**
     * Sets `x-forwarded-*` headers if specified in config.
     *
     * @param {ClientRequest} req Request object
     * @param {ServerResponse} res Response object
     */
        function (req, res) {
        var values = {
            'for': req.connection.remoteAddress || req.socket.remoteAddress,
            port: req.connection.remotePort || req.socket.remotePort,
            proto: utils.isReqHttps(req) ? 'https' : 'http'
        };

        ['for', 'port', 'proto'].forEach(function (header) {
            req.headers['x-forwarded-' + header] =
                (req.headers['x-forwarded-' + header] || '') +
                    (req.headers['x-forwarded-' + header] ? ',' : '') +
                    values[header];
        });
    },

    function (req, res, option) {
        var isHttps = utils.isReqHttps(req);

        function response(proxyRes) {
            outgoing.forEach(function (go) {
                go(req, res, proxyRes);
            });
            proxyRes.pipe(res);
        }

        function onError(err) {
            console.error('error in ' + req.url);
            console.error(err);
        }

        var outConfig = utils.setupOutgoing({}, req, res, option);

        if (outConfig) {
            var proxyReq = (isHttps ? https : http).request(outConfig, response);
            proxyReq.on('error', onError);
            req.pipe(proxyReq);
        }
    }
];