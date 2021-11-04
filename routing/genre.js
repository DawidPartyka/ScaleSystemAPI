const express = require('express');
const router = express.Router();
const  { checkUser, requireToken } = require('../services/authentication');
const controller = require('../controllers/genreController');

router.get('/nameListToken/:token', requireToken, checkUser, controller.nameList);
router.get('/nameList', checkUser, controller.nameList);

module.exports = {
    basePath: '/genre',
    router
}