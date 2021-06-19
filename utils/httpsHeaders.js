/*
    OPTIONS OBJECT (Every property is optional

    options = {
        webkitCSP: string (optional),
        CSP: string (optional),
        XCSP: string (optional),
        ACorigin: string (optional),
        ACHeaders: string (optional),
        ACMethods: string (optional),
        engine: boolean (optional)
    }
*/
class Header{
    constructor(header, value) {
        this.header = header;
        this.value = value;
    }
}

const defaults = {
    //webkitCSP: new Header('X-WebKit-CSP', 'default-src *'),
    //CSP: new Header('Content-Security-Policy', 'default-src *'),
    //XCSP: new Header('X-Content-Security-Policy', 'default-src *'),
    ACorigin: new Header('Access-Control-Allow-Origin', '*'),
    ACHeaders: new Header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'),
    ACMethods: new Header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT')
}


module.exports = function (options){
    return function (req, res, next){
        for(const prop in defaults) {
            res.set(
                defaults[prop].header,
                options[prop] ?? defaults[prop].value
            );
        }

        options.engine ? res.removeHeader('X-Powered-By') : null;
        next();
    }
}