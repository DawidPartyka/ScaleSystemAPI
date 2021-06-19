module.exports = function (options){
    return function (req, res, next){
        console.log(req.oidc.isAuthenticated());
        if(req.oidc.isAuthenticated())
            next();
        else
            res.redirect(options);
    }
}