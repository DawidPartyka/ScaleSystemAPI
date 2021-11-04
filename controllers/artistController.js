/*const artistHelper = require('./helpers/artistModelHandler');
const userLogHelper = require('./helpers/userLogModelHandler');
const validate = require('../utils/validations');
const userData = require('./helpers/userRequestData');

exports.getAll = async (req, res) => {
    const artists = await artistHelper.getAll();
    const user = await userData(req);
    const stat = artists.result ? 200 : 500;

    res.status(stat)
        .send(artists.value)
        .json();

    await userLogHelper.createLog('Get all artists', user, stat);
}

exports.create = async (req, res) => {
    const name = req.body.name;

    if(!validate.stringValue(name)){
        res.send({msg: 'Bad Request'})
            .json()
            .status(400);

        return;
    }

    const created = await artistHelper.create(name);

    res.send(created.value)
        .json()
        .status(created.result ? 201 : 500);
}

exports.update = async (req, res) => {
    const { id, name } = req.body;

    if(!validate.bulkNotNull([id, name]) || !validate.uuidv4(id)){
        res.send({msg: 'Bad Request'})
            .json()
            .status(400);

        return;
    }

    const updated = await artistHelper.update(id, name);

    res.send(updated.value)
        .json()
        .status(updated.result ? 200 : 500);
}

exports.delete = async (req, res) => {
    const id = req.params.id;

    if(!validate.uuidv4(id)){
        res.send({msg: 'Bad Request'})
            .json()
            .status(400);

        return;
    }

    const deleted = await artistHelper.deleteArtist(id);

    res.send(deleted.value)
        .json()
        .status(deleted.result ? 200 : 500);
}

exports.getById = async (req, res) => {
    const id = req.params.id;
    const user = await userData(req);
    const logTitle = 'Get artist by id';
    const additional = JSON.stringify({id: id});

    if(!validate.uuidv4(id)){
        res.send({msg: 'Bad Request'})
            .json()
            .status(400);

        await userLogHelper.createLog(logTitle, user, 400, additional);
        return;
    }

    const artist = await artistHelper.getById(id);
    const stat = artist.result ? 200 : 500;

    res.send(artist.value)
        .json()
        .status(artist.result ? artist.value.length === 0 ? 404 : 200 : 500);

    await userLogHelper.createLog(logTitle, user, stat, additional);
}*/
