const express = require('express');
const router = express.Router();

const routes = require('./routes');
const checkManagement = require('../utils/checkManagement');
const controller = require('../controllers/managementController');

const options = {
    notLogged: routes.user.login,
    noAuthorization: routes.noAuthorization
}

router.get('/', checkManagement(options), controller.main);
router.get('/scalepanel', checkManagement(options), controller.scalesPanel);
router.get('/jamtrackpanel', checkManagement(options), controller.jamtrackPanel);
router.get('/jamtrackUpdatePanel', checkManagement(options), controller.jamtrackUpdatePanel);
router.get('/jamtrackAddPanel', checkManagement(options), controller.jamtrackAddPanel);
router.get('/jamtrackDeletePanel', checkManagement(options), controller.jamtrackDeletePanel);
router.get('/artistpanel', checkManagement(options), controller.artistPanel);
router.get('/genrepanel', checkManagement(options), controller.genrePanel);
router.get('/timesignaturepanel', checkManagement(options), controller.timeSignaturePanel);
router.get('/logdetails/:start/:end/:success', checkManagement(options), controller.logDetails);

module.exports = {
    basePath: '/management',
    router: router
}