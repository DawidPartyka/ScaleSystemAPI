const express = require('express');
const router = express.Router();
const  { checkUser, requireToken } = require('../services/authentication');
const { resourceIdExists, userAuthorizedToScale } = require('../services/validations');
const controller = require('../controllers/scaleController');
const { Scale } = require("../models/allModels");

router.post('/addScale', checkUser, controller.add);
router.post('/addScaleToken/:token', requireToken, checkUser, controller.add);

router.get('/getAll', controller.getPublic);
router.get('/getPublicList', controller.getPublicScalesList);
router.get('/getPublicListToken/:token', requireToken, controller.getPublicScalesListJson);
router.get('/getUserScale', checkUser, controller.getUserScale);
router.get('/getAllUserScales', checkUser, controller.userScales);
router.get('/getById/:scaleId', resourceIdExists(Scale, 'scaleId', false), userAuthorizedToScale, controller.getById);
router.get('/getByIdToken/:token/:scaleId', requireToken, resourceIdExists(Scale, 'scaleId', false), userAuthorizedToScale, controller.getById);
router.get('/search/:search', controller.publicSearch);
router.get('/searchPrivate/:search', checkUser, controller.privateSearch)
router.get('/scaleVariations/:sounds', controller.findScaleWithVariations);
router.get('/changescaletonic/:tonic/:targetTonic/:sounds', controller.scaleToTonic);
router.get('/findPossibleScales/:sounds', checkUser, controller.findPossibleScales);
router.get('/findPossibleScalesToken/:token/:sounds', requireToken, checkUser, controller.findPossibleScales);
router.get('/nameList', checkUser, controller.scaleNameList);
router.get('/nameListToken/:token', requireToken, checkUser, controller.scaleNameList);

router.patch('/update', checkUser, controller.update);

router.delete('/deletebyid/:scaleId', checkUser, controller.delete);
router.delete('/deleteByIdToken/:token/:scaleId', requireToken, checkUser, controller.delete);


module.exports = {
    basePath: '/scale',
    router
}