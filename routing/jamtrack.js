const express = require('express');
const router = express.Router();
const { requiresAuth  } = require('express-openid-connect');
const controller = require('../controllers/jamtrackController');
const checkManagement = require('../utils/checkManagement');
const routes = require('./routes');

const options = {
    notLogged: routes.user.login,
    noAuthorization: routes.noAuthorization
}

// Filestream simply check oidc param in passed request in controller as otherwise the
// headers sent from requiresAuth() would throw errors with the headers responsible
// for the audio stream
router.post('/fileUpload', checkManagement(options), controller.fileUpload);
router.post('/addFileDescription', checkManagement(options), controller.addFileDescription);
router.post('/addScaleRelation', checkManagement(options), controller.addJamtrackScale);
router.post('/addArtistRelation', checkManagement(options), controller.addJamtrackArtist);
router.post('/addTimeSignatureRelation', checkManagement(options), controller.addJamtrackTimeSignature);

router.get('/fileStream/:jamtrackId', requiresAuth(),controller.fileStream);
router.get('/getAll', requiresAuth(), controller.getAllJamtracks);
router.get('/getAllRaw', requiresAuth(), controller.getAllJamtracksRaw);
router.get('/getByArtist/:artistId', requiresAuth(), controller.getJamtracksByArtist);
router.get('/getByGenre/:genreId', requiresAuth(), controller.getJamtracksByGenre);
router.get('/getById/:id', requiresAuth(), controller.getJamtrackById);
router.get('/search/:search', requiresAuth(), controller.search);

router.patch('/update', checkManagement(options), controller.updateJamtrack);

router.delete('/delete/:jamtrackId', checkManagement(options), controller.deleteJamtrack);
router.delete('/deleteArtist/:jamtrackId/:artistId', checkManagement(options), controller.deleteJamtrackArtist);
router.delete('/deleteTimeSignature/:jamtrackId/:timeSignatureId', checkManagement(options), controller.deleteJamtrackTimeSignatures);
router.delete('/deleteScale/:jamtrackId/:scaleId', checkManagement(options), controller.deleteJamtrackScales);

module.exports = {
    basePath: '/jamtrack',
    router: router
}
