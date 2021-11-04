const express = require('express');
const routes = require('./routes');
const path = require('path');
const { requiresAuth  } = require('express-openid-connect');
const checkUser = require('../utils/checkUser');
const router = express.Router();
const controller = require('../controllers/mainController');

router.use('/getProfileData', checkUser(routes.noAuthorization));

router.get('/callback', controller.callback);

router.get('/', controller.main);

router.get("/isauthenticated", controller.authenticated);

router.get('/getProfileData', controller.profileData);

router.get('/loginfirst', controller.loginFirst);

router.get("/sign-up", controller.signup);

router.get("/login", controller.login);

router.get("/logout", checkUser, controller.logout);

router.get('/about', controller.about);

module.exports = {
    basePath: '/',
    router: router
}