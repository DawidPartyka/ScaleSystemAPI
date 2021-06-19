const Management = require('../models/management');
const scaleHelper = require('./helpers/scaleModelHandler');
const userLogHelper = require('./helpers/userLogModelHandler');
const userData = require('./helpers/userRequestData');
const sound = require('../utils/audioCalculation');
const validate = require('../utils/validations');
const routes = require("../routing/routes");
const { indexSound } = require("../utils/audioCalculation");
const userMenuPanels = require("./options/userPanelOptions").allPanels;

/*
    Scale array can be passed either as array of booleans [ true, false, false, true, ... ]
    In this case it has to be exactly 12 elements long
    or array of uppercase sound symbols (and # signs for sharps) like
    [ 'A', 'B', 'C#', 'D#', ... ]
    then it will be check if all signs are unique and are contained in another array
    storing all possible signs (from A to G#)

    This validation takes place before scale creation
*/
exports.add = async (req, res) => {
    const tonic = sound.soundIndex(req.body.tonic);

    // quick check up
    if(!validate.soundArray(req.body.scale) ||
       !validate.bulkNotNull([req.body.name]) ||
       !validate.indexInSoundArray(tonic)){
        res.status(400)
            .send({msg: 'Bad request' })
            .json();

        return;
    }

    // formats array of note signs into array of booleans
    if(req.body.scale.some(x => x instanceof String))
        req.body.scale = scaleHelper.formatStringArray(req.body.scale);

    const data = await userData(req);

    // Creates resources doing prior scale array validation
    const create = await scaleHelper.create(req.body.scale, tonic, req.body.name, data.dbid, req.body.featured);

    // Helper returns false when something goes wrong or true on success
    if(!res.headersSent)
        res.setHeader('Content-Type', 'application/json');

    res.status(create.result ? 201 : 400)
        .send(create.value)
        .json();
}

// Returns JSON object with all scales in Featured table
exports.getPublic = async (req, res) => {
    const scales = await scaleHelper.getAllPublic();
    const stat = scales.result ? 200 : 500;

    await userLogHelper.createLog('Get featured scales', await userData(req), stat);

    res.status(stat)
        .send(scales.value)
        .json();
}

// Renders a view presenting all scales in Featured table
exports.getPublicScalesList = async (req, res) => {
    const scales = await scaleHelper.getAllPublic();

    if(!scales.result)
        return res.send({msg: scales.value})
            .json()
            .status(500);

    res.render('scaleList', {
        css: [routes.css.publicFiles.main],
        js: [routes.js.user.deletePrivateScale],
        jsModules: [routes.js.scale.searchPublic],
        user: req.oidc.user,
        routes: routes.user,
        scales: scaleHelper.flattenFeaturedScale(scales),
        status: 200,
        success: true,
        hideModificationButtons: true
    });
}

exports.getUserScale = async (req, res) => {
    const user = await userData(req);
    const logTitle = 'Get user scales';

    if(!await scaleHelper.isAuthorized(user, req.params.scaleId)){
        res.send({ msg: 'No access to the resource' })
            .json()
            .status(403);

        await userLogHelper.createLog(
            logTitle,
            user,
            403,
            JSON.stringify({msg: 'Unauthorized operation attempt on resource'})
        );

        return;
    }

    const scales = await scaleHelper.getUserScales(user.dbid);
    const stat = scales.result ? scales.value ? 200 : 404 : 500;
    const additionalData = scales.result ? JSON.stringify(scales.value) : null;

    res.send(scales.result ? scales.value : { msg: 'Sorry, something went wrong on server side' })
        .json()
        .status(scales.result ? 200 : 500);

    await userLogHelper.createLog(logTitle, user, stat, additionalData);
}

exports.getById = async (req, res) => {
    const logTitle = 'Get scale by id';
    const user = await userData(req);

    // id is passed through url as https://localhost:8000/scale/getbyid/:scaleId
    if(!req.params.scaleId || !validate.uuidv4(req.params.scaleId)){
        res.send({msg: 'Bad request'})
            .json()
            .status(400);

        await userLogHelper.createLog(logTitle, user, 400, JSON.stringify({
            msg: 'Invalid request data'
        }));

        return;
    }

    const scaleId = req.params.scaleId;

    if(!await scaleHelper.isAuthorized(user, req.params.scaleId)){
        res.send({ msg: 'No access to the resource' })
            .json()
            .status(403);

        await userLogHelper.createLog(
            logTitle,
            user,
            403,
            'Unauthorized operation attempt on resource'
        );

        return;
    }

    const scale = await scaleHelper.findById(user.dbid, scaleId, await Management.count({where: {UserId: user.dbid}}));
    const status = scale.result ? scale.value.length === 0 ? 404 : 200 : 500;

    res.send(scale.result ? scale.value : { msg: 'Sorry, something went wrong on server side' })
        .json()
        .status(status);

    await userLogHelper.createLog(logTitle, user, status, JSON.stringify({
        id: req.params.scaleId
    }));
}

exports.findScaleWithVariations = async (req, res) => {
    const logTitle = 'Find scales with variations';
    const user = await userData(req);
    const scale = req.params.sounds.split('').map(x => Boolean(parseInt(x)));

    if(!validate.soundArray(scale)){
        res.send({msg: 'Bad request'})
            .json()
            .status(400);

        await userLogHelper.createLog(logTitle, user, 400, JSON.stringify({
            msg: 'Invalid scale data'
        }));

        return;
    }

    const variations = sound.allVariations(scale);
    const scales = await scaleHelper.findDistinctByScale(variations);

    if(!scales.result){
        res.send({
            msg: 'Sorry, something went wrong on server side',
            err: scales.value
        }).json()
          .status(500);

        await userLogHelper.createLog(logTitle, user, 500, JSON.stringify({
            err: scales.value
        }));

        return;
    }

    res.send(scales.value.map(
        (entry) => {
            return {
                scaleVariations: sound.allVariationsWithTonic(entry['Scale.sounds'], entry['Scale.tonic']),
                scaleName: entry['Scale.name']
            }
        }
    )).json()
      .status(200);

    await userLogHelper.createLog(logTitle, user, 200);
}

// scaleHelper will check if resource can be updated by specific user along the way
// so it needs user data and management session if it exists
exports.update = async (req, res) => {
    let statusCode;
    let response;

    const newValues = req.body.data;
    const scaleId = req.body.scaleId;
    const user = await userData(req);
    user.role = req.session.managementId;

    if(!validate.uuidv4(scaleId) || !validate.bulkNotNull([newValues]) || !validate.scalePatchStructure(newValues)){
        res.send({ msg: 'Bad request' })
            .json()
            .status(400);

        return;
    }

    if(req.body.data.sounds){
        if(req.body.data.sounds?.some(x => x instanceof String))
            newValues.sounds = scaleHelper.formatStringArray(req.body.data.sounds);

        newValues.sounds = newValues.sounds.map(x => x ? 1 : 0).join('');
    }

    const update = await scaleHelper.update(newValues, scaleId, user);

    if(!update.result)
        statusCode = update.value.msg === 'Action on restricted resource' ? 403 : 500;
    else
        statusCode = 200;

    response = update.value;

    res.send(response)
        .json()
        .status(statusCode);
}

exports.scaleToTonic = async (req, res) => {
    const user = await userData(req);
    const logTitle = 'Shift scale to tonic';

    if(!validate.bulkNotNull([req.params.sounds, req.params.tonic, req.params.targetTonic])){
        res.send({ msg: 'Bad request' })
            .json()
            .status(400);

        await userLogHelper.createLog(logTitle, user, 400, JSON.stringify({msg: 'Invalid request data'}));

        return;
    }

    const scale = req.params.sounds.split('').map(x => Boolean(parseInt(x)));
    const tonic = req.params.tonic;
    const targetTonic = req.params.targetTonic;

    if(!validate.soundArray(scale) || !validate.indexInSoundArray(tonic) || !validate.indexInSoundArray(targetTonic)){
        res.send({ msg: 'Bad request' })
            .json()
            .status(400);

        await userLogHelper.createLog(logTitle, user, 400, JSON.stringify({msg: 'Invalid request data'}));

        return;
    }

    res.send(sound.variationToTonic(scale, tonic, targetTonic))
        .json()
        .status(200);

    await userLogHelper.createLog(logTitle, user, 200);
}

exports.delete = async (req, res) => {
    const id = req.params.scaleId;
    const user = await userData(req);
    const logTitle = 'Scale deletion';
    const isAuthorized = scaleHelper.isAuthorized(user, id); // Checks if user should have access to a resource

    if(!isAuthorized){
        res.send({ msg: 'No access to the resource' })
            .json()
            .status(403);

        await userLogHelper.createLog(
            logTitle,
            user,
            403,
            'Unauthorized operation attempt on resource'
        );

        return;
    }

    const deleted = await scaleHelper.deleteScale(id);
    const stat = deleted.result ? 200 : 500;
    console.log(stat);
    res.send(deleted.value)
        .json()
        .status(stat);

    await userLogHelper.createLog(logTitle, user, stat, JSON.stringify({id: req.params.id}));
}

exports.userScales = async (req, res) => {
    const user = await userData(req);
    const scales = await scaleHelper.getUserScales(user.dbid);
    const stat = scales.result ? scales.value.length === 0 ? 404 : 200 : 500;
    const logTitle = 'Get user scales';
    const additionalData = JSON.stringify({ dataReturnedLength: scales.value.length });

    res.send(scales.value)
        .json()
        .status(stat);

    await userLogHelper.createLog(logTitle, user, stat, additionalData);
}

const searchStringCheck = async (string, stringRaw, res, logTitle) => {
    if(!validate.stringValue(string) || string.length > 255){
        res.send({msg: 'Bad request'})
            .json()
            .status(400);

        await userLogHelper.createLog(logTitle, user, 400, JSON.stringify({
            search: string,
            raw: stringRaw
        }));

        return false;
    }

    return true;
}

// Searches through scales in Featured table
exports.publicSearch = async (req, res) => {
    const user = await userData(req);
    const search = req.params.search.replace('%20', ' ');
    const logTitle = 'Scale search';
    const searchStringChecked = await searchStringCheck(search, req.params.search, res, logTitle);

    if(!searchStringChecked)
        return;

    const scales = await scaleHelper.nameLike(search.trim());
    const stat = scales.result ? scales.value.length === 0 ? 404 : 200 : 500;
    const processed = {
        response: scales.value.map((scale) => {
            const s = scale.Scale;
            s.tonic = indexSound(s.tonic);

            return s;
        }),
        status: stat
    };

    res.send(processed)
        .json()
        .status(stat);

    await userLogHelper.createLog(logTitle, user, stat, JSON.stringify({
        search: search,
        raw: req.params.search
    }));
}

exports.privateSearch = async (req, res) => {
    const user = await userData(req);
    const search = req.params.search.replace('%20', ' ');
    const logTitle = 'Private scale search';
    const searchStringChecked = await searchStringCheck(search, req.params.search, res, logTitle);

    if(!searchStringChecked)
        return;

    const scales = await scaleHelper.getUserScales(user.dbid, null, null, search);
    const stat = scales.result ? scales.value.length === 0 ? 404 : 200 : 500;
    const processed = {
        response: scales.value.map((scale) => {
            scale.tonic = indexSound(scale.tonic);

            return scale;
        }),
        status: stat
    };

    res.send(processed)
        .json()
        .status(stat);

    await userLogHelper.createLog(logTitle, user, stat, JSON.stringify({
        search: search,
        raw: req.params.search
    }));
}

exports.findPossibleScales = async (req, res) => {
    const soundSymbols = req.params.sounds.split('-').map(x => x.replace('s', '#'));

    if(!validate.soundArray(soundSymbols)){
        res.send({msg: "Bad request"})
            .json()
            .status(400);

        return;
    }

    const possibilities = await scaleHelper.findScaleByPartialSounds(soundSymbols);
    const stat = possibilities.result ? possibilities.value.length === 0 ? 404 : 200 : 500;

    const processed = {
        response: possibilities.value,
        status: stat
    };

    res.send(processed)
        .json()
        .status(stat);
}