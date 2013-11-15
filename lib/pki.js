/**
 * generate key and cert sign by my root ca dynamically
 * @author yiminghe@gmail.com
 */

var pem = require('./pem');
var pkiDir = require('path').normalize(__dirname + '/../pki');
var fs = require('fs');
var serviceKey = fs.readFileSync(pkiDir + '/root/rootCA.key').toString('utf-8');
var serviceCertificate = fs.readFileSync(pkiDir + '/root/rootCA.pem').toString('utf-8');
// http://datacenteroverlords.com/2012/03/01/creating-your-own-ssl-certificate-authority/

if(!fs.existsSync(pkiDir + '/generated/')){
    fs.mkdirSync(pkiDir + '/generated/');
}

/**
 * generate key and cert sign by my root ca dynamically
 * @param cn
 * @param callback
 */
exports.getPKI = function (commonName, callback) {
    var cnDir = pkiDir + '/generated/' + commonName;
    var keyPath = cnDir + '/key.pem';
    var certPath = cnDir + '/cert.pem';
    if (fs.existsSync(keyPath)) {
        callback && callback({
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        });
        return;
    }
    pem.createCertificate({
        serial: Date.now(),
        commonName: commonName,
        serviceKey: serviceKey,
        serviceCertificate: serviceCertificate,
        days: 1000
    }, function (error, ret) {
        if (!fs.existsSync(cnDir)) {
            fs.mkdirSync(cnDir);
        }
        var clientKey, certificate;
        fs.writeFileSync(certPath, clientKey = new Buffer(ret.certificate, 'utf-8'));
        fs.writeFileSync(keyPath, certificate = new Buffer(ret.clientKey, 'utf-8'));
        callback && callback({
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        });
    });
};