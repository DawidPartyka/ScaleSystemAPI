const routes = require('../routing/routes');
const userLogHelper = require('./helpers/userLogModelHandler');
const sounds = require('../utils/audioCalculation').soundArray;
const validate = require('../utils/validations');

const basicLogData = async (start, end) => {
    return {
        userCount: await userLogHelper.getUserAmountInDate(
            start,
            end
        ),
        userAction: await userLogHelper.getActionsCountGrouped(
            start,
            end,
            process.env.MANAGEMENTLOGCOUNT
        ),
        successes: await userLogHelper.getAllLogsByResponseStatus(
            true,
            false,
            start,
            end,
            true
        ),
        fails: await userLogHelper.getAllLogsByResponseStatus(
            false,
            false,
            start,
            end,
            true
        ),
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    }
}

exports.main = async (req, res) => {
    const user = req.user;

    // Creating dates to retrieve statistic data for overview from last 24h and last week
    const dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - 1);
    const dateEnd = new Date();
    dateEnd.setDate(dateEnd.getDate() + 1); // Dates are formatted inside helper into yyyy-mm-dd,
                                            // so this way it includes 23:59 of present day
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const data = {
        lastDay: await basicLogData(dateStart, dateEnd),
        lastWeek: await basicLogData(weekAgo, dateEnd)
    }

    user.management = {
        role: req.user.id
    }

    res.render('managementPanel', {
        css: [routes.css.publicFiles.main],
        js: [],
        user: user,
        overviewData: data,
        routes: routes.user,
        logDetailRoute: routes.management.logDetails
    });
}

exports.logDetails = async (req, res) => {
    const { start, end, success } = req.params;
    const user = req.user;

    if(!validate.dateRange(start, end) ||
        (!validate.numberNatural(parseInt(success)) && success !== 'true' && success !== 'false')){
        res.send({msg: 'Bad request'})
            .json()
            .status(400);

        return;
    }

    const logs = await userLogHelper.getAllLogsByResponseStatus(
        validate.numberNatural(parseInt(success)) ? success : success === 'true',
        false,
        start,
        end,
        false
    );

    res.render('logDetails', {
        css: [routes.css.publicFiles.main],
        js: [],
        user: user,
        routes: routes.user,
        logs: logs.map(log=> log.dataValues),
        empty: logs.length === 0
    });
}

exports.scalesPanel = async (req, res) => {
    const user = req.user;

    const jsFiles = routes.js.scale;

    res.render('scalesPanel', {
        css: [routes.css.publicFiles.main],
        js: [
            jsFiles.addScale,
            jsFiles.getScaleVariations,
            jsFiles.getAllScales,
            jsFiles.getScaleById,
            jsFiles.scaleUpdate,
            jsFiles.changeScaleTonic,
            jsFiles.deleteScale,
            jsFiles.getAllUserScales
        ],
        jsModules: [routes.js.scale.searchPublic],
        user: user,
        sound: sounds,
        routes: routes.user
    });
}

exports.artistPanel = async (req, res) => {
    const user = req.user;

    const jsFiles = routes.js.artist;

    res.render('artistPanel', {
        css: [routes.css.publicFiles.main],
        js: [
            jsFiles.addArtist,
            jsFiles.updateArtist,
            jsFiles.getAllArtists,
            jsFiles.getArtistById,
            jsFiles.deleteArtist
        ],
        user: user,
        routes: routes.user
    });
}

exports.timeSignaturePanel = async (req, res) => {
    const user = req.user;

    const jsFiles = routes.js.timeSignature;

    res.render('timeSignaturePanel', {
        css: [routes.css.publicFiles.main],
        js: [
            jsFiles.addTimeSignature,
            jsFiles.updateTimeSignature,
            jsFiles.getAllTimeSignatures,
            jsFiles.getTimeSignatureById,
            jsFiles.deleteTimeSignature
        ],
        user: user,
        routes: routes.user
    });
}

exports.genrePanel = async (req, res) => {
    const user = req.user;

    const jsFiles = routes.js.genre;

    res.render('genrePanel', {
        css: [routes.css.publicFiles.main],
        js: [
            jsFiles.addGenre,
            jsFiles.updateGenre,
            jsFiles.getAllGenres,
            jsFiles.getGenreById,
            jsFiles.deleteGenre
        ],
        user: user,
        routes: routes.user
    });
}

exports.jamtrackPanel = async (req, res) => {
    const user = req.user;

    const jsFiles = routes.js.jamtrack;

    res.render('jamtrackPanel', {
        css: [routes.css.publicFiles.main],
        js: [
            jsFiles.jamtrackUpload,
            jsFiles.coverUpload,
            jsFiles.getJamtrackById,
            jsFiles.getAllJamtracks,
            jsFiles.updateJamtrack,
            jsFiles.deleteJamtrack,
            jsFiles.deleteJamtrackArtist,
            jsFiles.deleteJamtrackScale,
            jsFiles.deleteJamtrackTimeSignature,
            jsFiles.addJamtrackArtist,
            jsFiles.addJamtrackScale,
            jsFiles.addJamtrackTimesignature
        ],
        sound: sounds,
        user: user,
        routes: routes.user
    });
}

exports.jamtrackUpdatePanel = async (req, res) => {
    const user = req.user;

    const jsFiles = routes.js.jamtrack;

    res.render('jamtrackUpdatePanel', {
        css: [routes.css.publicFiles.main],
        js: [
            jsFiles.getJamtrackById,
            jsFiles.getAllJamtracks,
            jsFiles.updateJamtrack,
            jsFiles.addJamtrackArtist,
            jsFiles.addJamtrackScale,
            jsFiles.addJamtrackTimesignature
        ],
        user: user,
        routes: routes.user
    });
}

exports.jamtrackDeletePanel = async (req, res) => {
    const user = req.user;

    const jsFiles = routes.js.jamtrack;

    res.render('jamtrackDeletePanel', {
        css: [routes.css.publicFiles.main],
        js: [
            jsFiles.getJamtrackById,
            jsFiles.getAllJamtracks,
            jsFiles.deleteJamtrack,
            jsFiles.deleteJamtrackArtist,
            jsFiles.deleteJamtrackScale,
            jsFiles.deleteJamtrackTimeSignature,
        ],
        user: user,
        routes: routes.user
    });
}

exports.jamtrackAddPanel = async (req, res) => {
    const user = req.user;

    const jsFiles = routes.js.jamtrack;

    res.render('jamtrackAddPanel', {
        css: [routes.css.publicFiles.main],
        js: [
            jsFiles.jamtrackUpload
        ],
        user: user,
        routes: routes.user
    });
}