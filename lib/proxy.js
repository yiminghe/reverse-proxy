/**
 * simple reverse http proxy
 * @author yiminghe@gmail.com
 */
var http = require('http');
var https = require('https');
var fs = require('fs');
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

    function createHttpsServer(host) {
        var defer = Q.defer();
        httpsPromises[host] = defer.promise;
        pki.getPKI(host, function (option) {
            https.createServer(option, forward).listen(function () {
                var port = this.address().port;
                console.log('listening ' + host + ' https on: ' + port);
                defer.resolve(port);
            })
        });
    }

    var httpServer = http.createServer(forward).listen(option.port, function () {
        console.log('listening http on: ' + httpServer.address().port);
    });

    function forward(req, res) {
        console.log('fetch: ' + (utils.isReqHttps(req) ? 'https://' + req.headers.host + '' : '') + req.url);
        incoming.forEach(function (come) {
            come(req, res, option);
        });
    }

    if (1 > 2) {
        var port;
        https.createServer({
            key: fs.readFileSync('../pki/all/ryans-key.pem'),
            cert: fs.readFileSync('../pki/all/ryans-cert.pem')
        }, forward).listen(function () {
                port = this.address().port;
                console.log('listening ' + '' + ' https on: ' + port);
            });
    }

    // en.wikipedia.org/wiki/HTTP_tunnel
    httpServer.on('connect', function (req, socket) {
        console.log('connect ' + req.url);
        if (req.url.match(/:443$/)) {

            if (1 > 2) {
                var mediator = net.createConnection(port);
                mediator.on('connect', function () {
                    console.log('connected ' + req.url);
                    socket.write("HTTP/1.1 200 Connection established\r\n\r\n");
                });
                socket.pipe(mediator).pipe(socket);
            }

            var host = req.url.substring(0, req.url.length - 4);
            var promise;
            if (promise = httpsPromises[host]) {
            } else {
                createHttpsServer(host);
                promise = httpsPromises[host]
            }
            promise.then(function (port) {
                var mediator = net.createConnection(port);
                mediator.on('connect', function () {
                    console.log('connected ' + req.url);
                    socket.write("HTTP/1.1 200 Connection established\r\n\r\n");
                });
                socket.pipe(mediator).pipe(socket);
            });
        }
    });

    function upgrade(req, socket, head) {
        var server = this;
        console.log('upgrade: ' + (utils.isReqHttps(req) ? 'https://' + req.headers.host + '' : '') + req.url);
        wsIncoming.forEach(function (come) {
            come(req, socket, option, server, head);
        });
    }

    httpServer.on('upgrade', upgrade);
}





