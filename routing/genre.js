const { Genre } = require('../models/allModels');
const genericRouter = require('./genericRouter');

const router = genericRouter(
    Genre,
    'genre',
    'Genre',
    'name'
);

module.exports = router.create();