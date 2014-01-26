/**
 * simple reverse http proxy
 * @author yiminghe@gmail.com
 */
var debug = require('debug')('reverse-proxy');
var http = require('http');
var https = require('https');
var net = require('net');
var incoming = require('./incoming');
var wsIncoming = require('./ws-incoming');
var utils = require('./utils');
var Q = require('q');
var pki = require('./pki');

module.exports = {
    createServer: createProxy
};

function createProxy(option) {
    // one host on https Server
    var httpsPromises = {};
    var httpsPort;

    function createHttpsServer(host) {
        var defer = Q.defer();
        httpsPromises[host] = defer.promise;
        pki.getPKI(host, function (option) {
            debug('add context for: %s', host);
            httpsServer.addContext(host, option);
            defer.resolve();
        });
    }

    var httpsServer = https.createServer({
        key: pki.getRootPKI().key,
        cert: pki.getRootPKI().cert
    }, forward).listen(function () {
            httpsPort = this.address().port;
            debug('listening https on: %s', httpsPort);
        });

    var httpServer = http.createServer(forward).listen(option.port, function () {
        debug('listening http on: %s', httpServer.address().port);
    });

    function forward(req, res) {
        debug('fetch: %s', (utils.isReqHttps(req) ? 'https://' + req.headers.host + '' : '') + req.url);
        incoming.forEach(function (come) {
            come(req, res, option);
        });
    }

    // en.wikipedia.org/wiki/HTTP_tunnel
    httpServer.on('connect', function (req, socket) {
        debug('connect %s', req.url);
        if (req.url.match(/:443$/)) {
            var host = req.url.substring(0, req.url.length - 4);
            if (option.mapHttpsReg === true || host.match(option.mapHttpsReg)) {
                var promise;
                if (promise = httpsPromises[host]) {
                } else {
                    createHttpsServer(host);
                    promise = httpsPromises[host]
                }
                promise.then(function () {
                    var mediator = net.connect(httpsPort);
                    mediator.on('connect', function () {
                        debug('connected %s', req.url);
                        socket.write("HTTP/1.1 200 Connection established\r\n\r\n");
                    });
                    socket.pipe(mediator).pipe(socket);
                });
            } else {
                var mediator = net.connect(443, host);
                mediator.on('connect', function () {
                    socket.write("HTTP/1.1 200 Connection established\r\n\r\n");
                });
                socket.pipe(mediator).pipe(socket);
            }
        }
    });

    function upgrade(req, socket, head) {
        var server = this;
        debug('upgrade: %s', (utils.isReqHttps(req) ? 'https://' + req.headers.host + '' : '') + req.url);
        wsIncoming.forEach(function (come) {
            come(req, socket, option, server, head);
        });
    }

    httpServer.on('upgrade', upgrade);
}





