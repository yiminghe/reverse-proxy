// https://github.com/nodejitsu/node-http-proxy
module.exports = [
    /*
     * If is a HTTP 1.0 request, remove chunk headers
     *
     * @param {ClientRequest} req Request object
     * @param {ServerResponse} res Response object
     * @param {ServerResponse} proxyRes Response object from the proxy request
     */
    function (req, res, proxyRes) {
        if (req.httpVersion === '1.0') {
            delete proxyRes.headers['transfer-encoding'];
        }
    },

    /**
     * If is a HTTP 1.0 request, set the correct connection header
     * or if connection header not present, then use `keep-alive`
     *
     * @param {ClientRequest} req Request object
     * @param {ServerResponse} res Response object
     * @param {ServerResponse} proxyRes Response object from the proxy request
     */
        function (req, res, proxyRes) {
        if (req.httpVersion === '1.0') {
            proxyRes.headers.connection = req.headers.connection || 'close';
        } else if (!proxyRes.headers.connection) {
            proxyRes.headers.connection = req.headers.connection || 'keep-alive';
        }
    },

    /**
     * Copy headers from ServerResponse to response
     * set each header in response object.
     *
     * @param {ClientRequest} req Request object
     * @param {ServerResponse} res Response object
     * @param {ServerResponse} proxyRes Response object from the proxy request
     */
        function (req, res, proxyRes) {
        Object.keys(proxyRes.headers).forEach(function (key) {
            res.setHeader(key, proxyRes.headers[key]);
        });
    },

    /**
     * Set the statusCode from the ServerResponse
     *
     * @param {ClientRequest} req Request object
     * @param {ServerResponse} res Response object
     * @param {ServerResponse} proxyRes Response object from the proxy request
     */
        function (req, res, proxyRes) {
        res.writeHead(proxyRes.statusCode);
    }
];