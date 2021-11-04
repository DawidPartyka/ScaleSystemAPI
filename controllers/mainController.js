const routes = require('../routing/routes');
const path = require("path");

exports.about = (req, res) => {
    res.render('about', {
        css: [routes.css.publicFiles.main],
        user: req.user,
        routes: routes.user,
    });
}

exports.main = (req, res) => {
    /*const user = req.oidc.isAuthenticated() ? req.user : false;

    res.render('home', {
        css: [routes.css.publicFiles.main],
        js: [routes.js.publicFiles.headerbuttons],
        user: user,
        routes: routes.user
    });*/
    res.render('about', {
        css: [routes.css.publicFiles.main],
        user: req.user,
        routes: routes.user,
    });
}

exports.callback = (req, res) => res.redirect('/');

exports.authenticated = (req, res) => res.send(JSON.stringify(req.oidc.isAuthenticated()));

exports.profileData = (req, res) => res.send(JSON.stringify(req.user))

exports.loginFirst = (req, res) => res.sendFile(path.resolve('./public/test.html'));

exports.signup = (req, res) => res.redirect(routes.user.signup);

exports.login = (req, res) => res.redirect(routes.user.login);

exports.logout = (req, res) => res.redirect(routes.user.logout);