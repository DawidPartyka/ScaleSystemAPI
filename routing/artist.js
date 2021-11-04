const { Artist } = require('../models/allModels');
const genericRouter = require('./genericRouter');

const router = genericRouter(
    Artist,
    'artist',
    'Artist',
    'name'
);

module.exports = router.create();