const express = require('express');
const router = express.Router();
const  { checkUser, requireToken } = require('../services/authentication');
const controller = require('../controllers/jamtrackController');
const checkManagement = require('../utils/checkManagement');
const routes = require('./routes');
const Jamtrack = require("../models/jamtrack");
const { resourceIdExists, oneOrMoreQueriesPresent } = require('../services/validations');

const options = {
    notLogged: routes.user.login,
    noAuthorization: routes.noAuthorization
}

const querySearchParams = ['phrase', 'genreId', 'scaleId'];

// Filestream simply check oidc param in passed request in controller as otherwise the
// headers sent from checkUser would throw errors with the headers responsible
// for the audio stream
router.post('/fileUpload', checkManagement(options), controller.fileUpload);
router.post('/coverUpload', checkManagement(options),  controller.albumCoverUpload);
router.post('/addFileDescription', checkManagement(options), controller.addFileDescription);
router.post('/addScaleRelation', checkManagement(options), controller.addJamtrackScale);
router.post('/addArtistRelation', checkManagement(options), controller.addJamtrackArtist);
router.post('/addTimeSignatureRelation', checkManagement(options), controller.addJamtrackTimeSignature);

router.get('/latest/:token/:number', requireToken, checkUser, controller.latest);
router.get('/fileStream/:jamtrackId', checkUser,controller.fileStream);
router.get('/fileStreamToken/:token/:jamtrackId', requireToken, checkUser,controller.fileStream);
router.get('/getAll', checkUser, controller.getAllJamtracks);
router.get('/getAllRaw', checkUser, controller.getAllJamtracksRaw);
router.get('/getByArtist/:artistId', checkUser, controller.getJamtracksByArtist);
router.get('/getByGenre/:genreId', checkUser, controller.getJamtracksByGenre);
router.get('/getById/:id', checkUser, resourceIdExists(Jamtrack, 'id', false), controller.getJamtrackById);
router.get('/getByIdToken/:token/:id', requireToken, checkUser, resourceIdExists(Jamtrack, 'id', false), controller.getJamtrackById);
router.get('/search/:search', checkUser, controller.search);
router.get('/searchComplex', checkUser, oneOrMoreQueriesPresent(querySearchParams), controller.complexSearch);
router.get('/searchComplexToken/:token', requireToken, checkUser, oneOrMoreQueriesPresent(querySearchParams), controller.complexSearch);

router.patch('/update', checkManagement(options), controller.updateJamtrack);

router.delete('/delete/:jamtrackId', checkManagement(options), controller.deleteJamtrack);
router.delete('/deleteArtist/:jamtrackId/:artistId', checkManagement(options), controller.deleteJamtrackArtist);
router.delete('/deleteTimeSignature/:jamtrackId/:timeSignatureId', checkManagement(options), controller.deleteJamtrackTimeSignatures);
router.delete('/deleteScale/:jamtrackId/:scaleId', checkManagement(options), controller.deleteJamtrackScales);

module.exports = {
    basePath: '/jamtrack',
    router
}
