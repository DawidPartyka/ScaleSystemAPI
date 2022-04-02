const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const  { checkUser, requireToken, requireUser } = require('../services/authentication');
const { emailAndPassword, emailTaken, resourceIdExists } = require('../services/validations');
const Jamtrack = require("../models/jamtrack");

router.post('/login', emailAndPassword, controller.login);

router.post('/register', emailAndPassword, emailTaken, controller.register);

router.post('/addJamtrackToFavourites/:token', requireToken, checkUser, resourceIdExists(Jamtrack, 'jamtrackId'), controller.addJamtrackToFavourites);

router.delete('/deleteJamtrackFromFavourites/:token/:jamtrackId', requireToken, checkUser, resourceIdExists(Jamtrack, 'jamtrackId', false), controller.removeJamtrackFromFavourites);

router.get('/getFavouriteJamtracks/:token', requireToken, checkUser, controller.getAllFavouriteJamtracks);

router.get('/validateToken/:token', controller.validateToken);

router.get('/loginSite', controller.loginSite);

router.get('/protectedToken/:token', requireToken, checkUser, controller.protected);

router.get('/logout', checkUser, controller.logout);

router.get('/logoutToken/:token', requireToken, checkUser, controller.logout);

router.get('/profile', checkUser, controller.profile);

router.get('/getlogs/:start/:end', checkUser, controller.getUserActions);

router.get('/getlogsbystatus/:status/:start/:end/:count?', checkUser, controller.getUserLogsByStatus);

router.get('/fretboard', checkUser, controller.fretboard);

router.get('/playFretboard/:id', checkUser, controller.playFretboard);

router.get('/myScaleLibrary', requireUser, checkUser, controller.userScaleLibrary);

router.get('/myScaleLibraryToken/:token', requireToken, requireUser, checkUser, controller.userScaleLibraryJson);

router.get('/privateScaleUpdate/:id', checkUser, controller.privateScaleUpdate);

router.get('/showScale/:id', checkUser, controller.showScale);

module.exports = {
    basePath: '/user',
    router
}