const express = require('express');
const router = express.Router();

const routes = require('./routes');
const checkManagement = require('../utils/checkManagement');
const controller = require('../controllers/managementController');
const { checkUser } = require("../services/authentication");

const options = {
    notLogged: routes.user.login,
    noAuthorization: routes.noAuthorization
}

router.get('/', checkUser, checkManagement(options), controller.main);
router.get('/scalepanel', checkUser, checkManagement(options), controller.scalesPanel);
router.get('/jamtrackpanel', checkUser, checkManagement(options), controller.jamtrackPanel);
router.get('/jamtrackUpdatePanel', checkUser, checkManagement(options), controller.jamtrackUpdatePanel);
router.get('/jamtrackAddPanel', checkUser, checkManagement(options), controller.jamtrackAddPanel);
router.get('/jamtrackDeletePanel', checkUser, checkManagement(options), controller.jamtrackDeletePanel);
router.get('/artistpanel', checkUser, checkManagement(options), controller.artistPanel);
router.get('/genrepanel', checkUser, checkManagement(options), controller.genrePanel);
router.get('/timesignaturepanel', checkUser, checkManagement(options), controller.timeSignaturePanel);
router.get('/logdetails/:start/:end/:success', checkUser, checkManagement(options), controller.logDetails);

module.exports = {
    basePath: '/management',
    router
}