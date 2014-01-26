var pki = require('../lib/pki');
pki.getPKI('github.com', function (ret) {
    console.log(ret);
});