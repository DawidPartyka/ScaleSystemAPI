const userRoutes = require('./user');
const mainRoutes = require('./main');
const managementRoutes = require('./management');
const scaleRoutes = require('./scale');
const genericGenreRoutes = require('./genericGenre');
const genreRoutes = require('./genre');
const timeSignatureRoutes = require('./timeSignature');
const jamtrackRoutes = require('./jamtrack');
const artistRoutes = require('./artist');

module.exports = [
    userRoutes,
    mainRoutes,
    managementRoutes,
    scaleRoutes,
    genreRoutes,
    genericGenreRoutes,
    timeSignatureRoutes,
    jamtrackRoutes,
    artistRoutes
]