const Genre = require('../models/genre');

exports.nameList = async (req, res) => {
    const genres = await Genre.findAll({
        attributes: ['name', 'id']
    });

    res.status(genres.length ? 200 : 404)
        .send(genres);
}