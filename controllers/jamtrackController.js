const { Jamtrack, Genre, Artist, Scale, TimeSignature } = require('../models/allModels');
const userLogHelper = require('./helpers/userLogModelHandler');
const userData = require('./helpers/userRequestData');
const routes = require('../routing/routes');
const standardFormidable = require('./options/standardFormidable');
const jamtrackHelper = require('./helpers/jamtrackModelHandler');
const genreHelper = require('./helpers/genreModelHandler');
const fileData = require('../utils/getFileData');
const validate = require('../utils/validations');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { indexSound } = require('../utils/audioCalculation');
const { CronJob } = require('cron');

const fileStreams = []

const destroyStream = (userId) => {
    const index = fileStreams.findIndex(e => e.user === userId);

    if(index === -1)
        return;

    const fileStream = fileStreams[index];
    fileStream.stream.destroy();
    fileStreams.splice(index, 1);
    console.log('Executed order 66 on stream');
}


const checkIfExistsOr404 = async (res, id) => {
    if(!validate.uuidv4(id)){
        res.send({msg: `Invalid id value`})
            .json()
            .status(400);

        return 400;
    }

    const jamtrack = await Jamtrack.findByPk(id);

    if(!jamtrack){
        res.send({msg: `No jamtrack with id ${id} found`})
            .json()
            .status(404);

        return 404;
    }

    return jamtrack;
}

/*
    req:
    body{
        genre,
        title,
        scales [{
           scaleId,
           tonic,
           timeStamps [stamp1, stamp2, ...]
        }, ...],
        timeSignatures[],
        artists[],
        bpm
    }
 */
exports.addFileDescription = async (req, res) => {
    const file = validate.uploadFileDescription(req.body);

    if(!file){
        console.log(req.body);
        res.send({msg: 'Bad request. File doesn\'t exist, or supplied data is incorrect'})
            .json()
            .status(400);

        return;
    }

    const artists = req.body.artists.map(x => x.trim()).filter(x => x.length);
    const localFileName = process.env.FILEPREFIX + req.body.jamtrack + file.ext;
    const oldPath = path.join(
        process.env.UPLOADDIR,
        localFileName
    );
    const fileDuration = await fileData.getAudioLength(oldPath);

    if(!fileDuration){
        res.send({msg: 'Couldn\'t get audio file duration'})
            .json()
            .status(500);

        return;
    }

    // findByGenreOrCreate takes an array as parameter and returns an array therefore,
    // creating/retrieving only one we're accessing only the first one with index 0 as well
    const genre = await genreHelper.findByGenreOrCreate([req.body.genre]);
    const newPath = path.join(
        process.env.APPROVED,
        genre[0].name.trim().replace(' ', ''),
        localFileName
    );

    //Adds timestamp that's equal to the duration of audio file
    if(req.body.scales.length === 1)
        req.body.scales[0].timeStamps = [fileDuration];

    const jamtrackData = {
        name: req.body.title,
        fileLocationPath: newPath,
        size: file.sizeMB,
        ext: file.ext,
        bpm: req.body.bpm,
        genre: genre[0].id,
        duration: fileDuration
    }

    const link = await jamtrackHelper.linkAll(jamtrackData, req.body.scales, req.body.timeSignatures, artists);

    if(link.result !== true){
        //console.log(link);
        res.send(link)
            .json()
            .status(400);

        return;
    }

    res.send({msg: 'Description received - resource created', data: link.value})
        .json()
        .status(201);

    //Move the file from pending to appropriate directory
    const newFilePath = path.join(process.env.APPROVED, genre[0].name.replace(/ /g,''));

    if(!fileData.checkIfExists(newFilePath))
        fileData.createDir(newFilePath);

    fileData.move(oldPath, newPath);
}

exports.fileUpload = async (req, res) => {
    const form = standardFormidable();

    // Controls file extension. If not allowed will stop the upload
    form.onPart = function (part) {
        if(!part.filename || part.filename.match(/\.(mp3|wav)$/i)){
            this.handlePart(part);
        }
    }

    // Will create file with UUIDv4 name that will be moved to proper directory once
    // the additional form data will be passed to a addFileDescription endpoint
    form.on('file', () => {
        fileData.move(form.uploadDir, form.uploadDir, uuidv4);
    });

    form.parse(req, async (err, fields, files) => {
        if (err || !files.file) {
            res.send({err: err ?? 'No file received or file type is not supported'})
                .json()
                .status(400);

            return;
        }

        const file = files.file;
        let fileId = file.path.split(process.env.FILEPREFIX).pop();
        fileId = fileId.slice(0, fileId.indexOf('.'));

        const dummyDate = new Date();
        const deathTime = new Date(dummyDate.getTime() + process.env.FILEDEATHTIME * 60000);

        // Deletes the file from "pending" folder after time specified in ENV file under "FILEDEATHTIME" in minutes
        new CronJob(deathTime, async function () {
            await fileData.deleteFile(files.file.path);
            console.log(`Deleted file laying around for too long: ${process.env.FILEDEATHTIME} minutes`);
        }, null, true, process.env.CRONTIMEZONE).start();

        res.send({
            msg: 'File received - resource created',
            uuid: fileId,
            deletionTime: deathTime
        })
            .json()
            .status(201);
    });
}

exports.fileStream = async (req, res) => {
    const logTitle = 'File stream';
    const user = await userData(req);
    const file = await Jamtrack.findByPk(req.params.jamtrackId); // No need to use helper for oneliners
    destroyStream(user.dbid);

    if(!file) {
        res.status(404)
            .send({msg: 'No file found'})
            .json();

        await userLogHelper.createLog(logTitle, user, 404, JSON.stringify({
            msg: 'File data not found in database'
        }));
        return;
    }

    const filePath = file.serverLocation;
    const stat = fileData.getStat(filePath);

    if(!stat) {
        res.status(404)
            .send({msg: 'No file found'})
            .json();

        await userLogHelper.createLog(logTitle, user, 404, JSON.stringify({
            msg: 'File not found on server'
        }));

        return;
    }

    const total = stat.size;
    const contentType = `audio/${fileData.ext === '.mp3' ? 'mpeg' : 'wav'}`;

    const range = req.headers.range;
    const parts = range.replace(/bytes=/, "").split("-");
    const partialstart = parts[0];
    const partialend = parts[1];

    const start = parseInt(partialstart, 10);
    const end = partialend ? parseInt(partialend, 10) : total-1;
    const chunksize = (end-start)+1;
    const readStream = fs.createReadStream(filePath, {start: start, end: end});

    res.status(206)
        .set('Content-Range' , `bytes ${start}-${end}/${total}`)
        .set('Content-Length', chunksize)
        .set('Accept-Ranges', 'bytes')
        .type(contentType);

    //readStream.pipe(res);
    fileStreams.push({
        user: user.dbid,
        stream: readStream
    });

    readStream
        .on('data', (data) => {
            res.write(data);
        })
        .on('error', async (err) => {
            console.log(err);

            res.status(500)
                .send({msg: 'Sorry, something went wrong on server side'})
                .json();

            destroyStream(user.dbid);

            await userLogHelper.createLog(logTitle, user, 500, JSON.stringify({
                id: file.id
            }));
        })
        .on('end', () => destroyStream(user.dbid));

    await userLogHelper.createLog(logTitle, user, 206, JSON.stringify({
        id: file.id
    }));
}

exports.getAllJamtracks = async (req, res) => {
    const user = req.oidc.user;
    const data = await jamtrackHelper.getAll();

    await userLogHelper.createLog(
        'Get all jamtracks',
        await userData(req),
        data.result ? 200 : 500
    );

    renderJamtrackList(res, data, user);
}

exports.getAllJamtracksRaw = async (req, res) => {
    const data = await jamtrackHelper.getAll();
    const stat = data.result ? 200 : 500;

    await userLogHelper.createLog(
        'Get all jamtracks raw',
        await userData(req),
        stat
    );

    res.send(data.result ? data.value : data)
        .json()
        .status(stat);
}

exports.getJamtrackById = async (req, res) => {
    const data = await checkIfExistsOr404(res, req.params.id);

    if(!(data instanceof Jamtrack))
        return;

    const jamtrack = await jamtrackHelper.getById(data.id);

    res.send(jamtrack.value)
        .json()
        .status(jamtrack.result ? 200 : 500);

    await userLogHelper.createLog(
        'Get jamtrack by id',
        await userData(req),
        jamtrack.result ? 200 : 500,
        JSON.stringify({
            id: data.id
        })
    );
}


exports.getJamtracksByArtist = async (req, res) => {
    const user = req.oidc.user;
    const userdb = await userData(req);
    const logTitle = 'Get jamtracks by artist';

    if(!validate.bulkNotNull([req.params.artistId])) {
        res.send({msg: 'Incorrect attribute supplied'})
            .json()
            .status(400);

        await userLogHelper.createLog(logTitle, userdb, 400, JSON.stringify({
            id: 'Invalid request data'
        }));
        return;
    }

    const data = await jamtrackHelper.getByAttribute('Artist', req.params.artistId);

    await userLogHelper.createLog(
        'Get all jamtracks',
        userdb,
        data.result ? 200 : 500
    );

    renderJamtrackList(res, data, user);
}

exports.getJamtracksByGenre = async (req, res) => {
    const user = req.oidc.user;
    const userdb = await userData(req);
    const logTitle = 'Get jamtracks by genre';

    if(!validate.bulkNotNull([req.params.genreId])) {
        res.send({msg: 'Incorrect attribute supplied'})
            .json()
            .status(400);

        await userLogHelper.createLog(logTitle, userdb, 400, JSON.stringify({
            msg: 'Invalid request data'
        }));

        return;
    }

    const data = await jamtrackHelper.getByAttribute('Genre', req.params.genreId);

    await userLogHelper.createLog(
        logTitle,
        userdb,
        data.result ? 200 : 500
    );

    renderJamtrackList(res, data, user);
}

exports.updateJamtrack = async (req, res) => {
    const { name, bpm, id, genreId } = req.body;

    const check1 = !name && !bpm && !genreId || !id;
    const check2 = name && !validate.stringValue(name);
    const check3 = bpm && !validate.numberNatural(parseInt(bpm));
    let check4 = false;

    if(genreId){
        check4 = !validate.uuidv4(genreId);

        if(!check4)
            check4 = !(await Genre.findByPk(genreId) instanceof Genre);
    }

    if(check1 || check2 || check3 || check4){
        res.send({msg: 'Incorrect request data supplied'})
            .json()
            .status(400);

        return;
    }

    const jamtrack = await checkIfExistsOr404(res, id);

    if(!(jamtrack instanceof Jamtrack))
        return;

    if(name)
        jamtrack.name = name;

    if(bpm)
        jamtrack.bpm = bpm;

    if(genreId)
        jamtrack.GenreId = genreId;

    const updated = await jamtrack.save();

    res.send(await updated.reload())
        .json()
        .status(200);
}

exports.deleteJamtrack = async (req, res) => {
    const jamtrack = await checkIfExistsOr404(res, req.params.jamtrackId);

    if(!(jamtrack instanceof Jamtrack))
        return;

    const deletion = await jamtrackHelper.completeDelete(jamtrack);

    if(!deletion.result){
        res.send(deletion.value)
            .json()
            .status(500);

        return;
    }

    const fileDeletion = await fileData.deleteFile(jamtrack.serverLocation);
    deletion.value.fileDeletion = fileDeletion;

    res.send(deletion.value)
        .json()
        .status(fileDeletion ? 200 : 500);
}

exports.deleteJamtrackScales = async (req, res) => {
    const { jamtrackId, scaleId } = req.params;

    if(!validate.uuidv4BulkCheck([jamtrackId, scaleId])){
        res.send({msg: 'Incorrect request data supplied'})
            .json()
            .status(400);

        return;
    }

    const deletion = await jamtrackHelper.deleteJamtrackScales(jamtrackId, scaleId);

    res.send(deletion.result ? {
        scale: deletion.value,
        jamtrackId: jamtrackId
    } : deletion.value)
        .json()
        .status(deletion.result ? 200 : 500);
}

exports.deleteJamtrackTimeSignatures = async (req, res) => {
    const { jamtrackId, timeSignatureId } = req.params;

    if(!validate.uuidv4BulkCheck([jamtrackId, timeSignatureId])){
        res.send({msg: 'Incorrect request data supplied'})
            .json()
            .status(400);

        return;
    }

    const deletion = await jamtrackHelper.deleteJamtrackTimeSignatures(jamtrackId, timeSignatureId);

    res.send(deletion.result ? {
        scale: deletion.value,
        jamtrackId: jamtrackId
    } : deletion.value)
        .json()
        .status(deletion.result ? 200 : 500);
}

exports.deleteJamtrackArtist = async (req, res) => {
    const { jamtrackId, artistId } = req.params;

    if(!validate.uuidv4BulkCheck([jamtrackId, artistId])){
        res.send({msg: 'Incorrect request data supplied'})
            .json()
            .status(400);

        return;
    }

    const deletion = await jamtrackHelper.deleteJamtrackArtists(jamtrackId, artistId);

    res.send(deletion.result ? {
        scale: deletion.value,
        jamtrackId: jamtrackId
    } : deletion.value)
        .json()
        .status(deletion.result ? 200 : 500);
}

exports.addJamtrackScale = async (req, res) => {
    const { scaleId, jamtrackId, scaleTimeStamp, tonic } = req.body;

    if(!validate.timeStampRegexp(scaleTimeStamp) || !validate.indexInSoundArray(tonic)){
        res.send({msg: 'Bad time stamp or tonic'})
            .json()
            .status(400);

        return;
    }

    const jamtrack = await checkIfExistsOr404(res, jamtrackId);

    if(!(jamtrack instanceof Jamtrack))
        return;

    const link = await Scale.findByPk(scaleId);

    if(!(link instanceof Scale)){
        res.send({msg: `No scale with id ${scaleId} found`})
            .json()
            .status(404);
        return;
    }

    const linked = await jamtrackHelper.linkWithScales(jamtrack.id, [{
        scaleId: scaleId,
        timeStamps: scaleTimeStamp,
        tonic: indexSound(tonic)
    }]);

    res.send(linked)
        .json()
        .status(linked.result ? 201 : 500);
}

exports.addJamtrackArtist = async (req, res) => {
    const { artistId, jamtrackId } = req.body;

    const jamtrack = await checkIfExistsOr404(res, jamtrackId);

    if(!(jamtrack instanceof Jamtrack))
        return;

    const link = await Artist.findByPk(artistId);

    if(!(link instanceof Artist)){
        res.send({msg: `No artist with id ${artistId} found`})
            .json()
            .status(404);
        return;
    }

    const linked = await jamtrackHelper.linkWithArtistId(jamtrack.id, artistId);

    res.send(linked)
        .json()
        .status(linked.result ? 201 : 500);
}

exports.addJamtrackTimeSignature = async (req, res) => {
    const { timeSignatureId, jamtrackId } = req.body;

    const jamtrack = await checkIfExistsOr404(res, jamtrackId);

    if(!(jamtrack instanceof Jamtrack))
        return;

    const link = await TimeSignature.findByPk(timeSignatureId);

    if(!(link instanceof TimeSignature)){
        res.send({msg: `No time signature with id ${timeSignatureId} found`})
            .json()
            .status(404);
        return;
    }

    const linked = await jamtrackHelper.linkWithTimeSignatureId(jamtrack.id, timeSignatureId);

    res.send(linked)
        .json()
        .status(linked.result ? 201 : 500);
}

exports.search = async (req, res) => {
    const user = await userData(req);
    const search = req.params.search.replace(/%20/g, ' ');
    const logTitle = 'Jamtrack search';

    if(!validate.stringValue(search) || search.length > 255){
        res.send({msg: 'Bad request'})
            .json
            .status(401);

        await userLogHelper.createLog(logTitle, user, 401, JSON.stringify({
            search: search,
            raw: req.params.search
        }));

        return;
    }

    const jamtracks = await jamtrackHelper.nameLike(search.trim());
    const stat = jamtracks.result ? jamtracks.value.length === 0 ? 404 : 200 : 500;
    const processed = {
        response: jamtracks.value,
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

const renderJamtrackList = (res, data, user) => {
    const responseObject = data.result ? jamtrackHelper.formatData(data.value) : data.value;

    const routesAltered = routes.jamtrack;
    routesAltered.playWithFretboard = routes.user.playWithFretboard;

    res.render('jamtrackList', {
        css: [routes.css.publicFiles.main],
        js: [routes.js.jamtrack.jamtrackPlay],
        jsModules: [routes.js.jamtrack.search],
        routes: routesAltered,
        jamtracks: responseObject,
        success: data.result,
        user: user
    });
}