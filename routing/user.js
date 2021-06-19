const express = require('express');
const router = express.Router();
const { requiresAuth  } = require('express-openid-connect');
const controller = require('../controllers/userController');

router.get('/', controller.main);

router.get('/login', controller.login);

router.get('/sign-up', controller.signup);

router.get('/logout', requiresAuth(), controller.logout);

router.get('/profile', requiresAuth(), controller.profile);

router.get( '/checkuser', requiresAuth(), controller.checkDbUser);

router.get('/getlogs/:start/:end', requiresAuth(), controller.getUserActions);

router.get('/getlogsbystatus/:status/:start/:end/:count?', requiresAuth(), controller.getUserLogsByStatus);

router.get('/fretboard', requiresAuth(), controller.fretboard);

router.get('/playFretboard/:id', requiresAuth(), controller.playFretboard);

router.get('/myScaleLibrary', requiresAuth(), controller.userScaleLibrary);

router.get('/privateScaleUpdate/:id', requiresAuth(), controller.privateScaleUpdate);

router.get('/showScale/:id', requiresAuth(), controller.showScale);

module.exports = {
    basePath: '/user',
    router: router
}