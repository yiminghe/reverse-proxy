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

module.exports = {
    createServer: createProxy
};

function createProxy(option) {
    var httpServer = http.createServer(forward).listen(option.port, function () {
        console.log('listening http on: ' + httpServer.address().port);
    });

    function forward(req, res) {
        console.log('fetch: ' + (utils.isReqHttps(req) ? 'https://' + req.headers.host + '' : '') + req.url);
        incoming.forEach(function (come) {
            come(req, res, option);
        });
    }

    var httpsServer = https.createServer({
        pfx: fs.readFileSync('../pki/yiminghe.pfx')
    }, forward).listen(function () {
            HTTPS_PORT = httpsServer.address().port;
            console.log('listening https on: ' + HTTPS_PORT);
        });


    // en.wikipedia.org/wiki/HTTP_tunnel
    httpServer.on('connect', function (req, socket) {
        console.log('connect ' + req.url);
        if (req.url.match(/:443$/)) {
            var mediator = net.createConnection(HTTPS_PORT);
            mediator.on('connect', function () {
                socket.write("HTTP/1.1 200 Connection established\r\n\r\n");
            });
            socket.pipe(mediator).pipe(socket);
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
    httpsServer.on('upgrade', upgrade);
}





