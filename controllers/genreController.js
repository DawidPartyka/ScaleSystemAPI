/*const genreHelper = require('./helpers/genreModelHandler');
const validate = require('../utils/validations');
const Genre = require('../models/genre');

const checkIdAnd404 = async (id, res) => {
    if(!validate.uuidv4(id)){
        res.send({msg: `Invalid id value`})
            .json()
            .status(400);

        return 400;
    }

    const genre = await Genre.findByPk(id);

    if(!genre){
        res.send({msg: `No genre found with given id: ${id}`})
            .json()
            .status(404);

        return 404;
    }

    return genre;
}

exports.getAll = async (req, res) => {
    const genres = await genreHelper.getAll();

    res.status(genres.result ? 200 : 500)
        .send(genres.value)
        .json();
}

exports.getById = async (req, res) => {
    const genre = await checkIdAnd404(req.params.id, res);

    if(genre instanceof Genre){
        res.send(genre)
            .json()
            .status(200);
    }
}

exports.update = async (req, res) => {
    if(!validate.stringValue(req.body.name)){
        res.send({msg: `Invalid name value`})
            .json()
            .status(400);

        return;
    }

    const genre = await checkIdAnd404(req.body.id, res); // Don't need helper for oneliner

    if(genre instanceof Genre){
        genre.name = req.body.name;
        const updated = await genre.save();

        res.send(await updated.reload())
            .json()
            .status(200);
    }
}

exports.create = async (req, res) => {
    if(!validate.stringValue(req.body.name)){
        res.send({msg: `Invalid name value`})
            .json()
            .status(400);

        return;
    }

    const created = await genreHelper.create(req.body.name);
    const stat = created.result ? 200 : 500;

    res.send(created.value)
        .json()
        .status(stat);
}

exports.delete = async (req, res) => {
    const genre = await checkIdAnd404(req.params.id, res);

    if(genre instanceof Genre){
        const deleted = await genreHelper.deleteGenre(req.params.id);

        res.send(deleted.value)
            .json()
            .status(deleted.result ? 200 : 500);
    }
}*/