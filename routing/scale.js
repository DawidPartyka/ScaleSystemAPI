const express = require('express');
const router = express.Router();
const { requiresAuth  } = require('express-openid-connect');
const controller = require('../controllers/scaleController');

router.post('/addScale', requiresAuth(), controller.add);
router.get('/getAll', controller.getPublic);
router.get('/getPublicList', controller.getPublicScalesList);
router.get('/getUserScale', requiresAuth(), controller.getUserScale);
router.get('/getAllUserScales', requiresAuth(), controller.userScales);
router.get('/getById/:scaleId', controller.getById);
router.get('/search/:search', controller.publicSearch);
router.get('/searchPrivate/:search', requiresAuth(), controller.privateSearch)
router.get('/scaleVariations/:sounds', controller.findScaleWithVariations);
router.patch('/update', requiresAuth(), controller.update);
router.get('/changescaletonic/:tonic/:targetTonic/:sounds', controller.scaleToTonic);
router.get('/findPossibleScales/:sounds', requiresAuth(), controller.findPossibleScales);
router.delete('/deletebyid/:scaleId', controller.delete);


module.exports = {
    basePath: '/scale',
    router: router
}