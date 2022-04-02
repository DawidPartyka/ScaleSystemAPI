const { User, Scale, UserFavouriteJamtracks } = require('../models/allModels');
const routes = require('../routing/routes');
const userLogHelper = require('./helpers/userLogModelHandler');
const userRequestData = require('./helpers/userRequestData');
const validate = require('../utils/validations');
const jamtrackHelper = require("./helpers/jamtrackModelHandler");
const scaleHelper = require("./helpers/scaleModelHandler");
const { soundArray, indexSound } = require('../utils/audioCalculation');
const { destroyToken } = require('../services/authentication');

const {
    authTokens,
    getHashedPassword,
    generateAuthToken
} = require('../services/authentication');


// Only for basic tests
exports.protected = async (req, res) => {
    res.send({msg: "protected"}).json().status(200);
}

exports.loginSite = (req, res) => {
    res.render('loginPage', {
        css: [routes.css.publicFiles.main, routes.css.publicFiles.login],
        jsModules: [routes.js.modules.login]
    });
}

exports.login = async (req, res) => {
    if(req.user) {
        console.log(`Already logged`);
        res.status(200).send({msg: "Already logged", token: req.cookies['AuthToken']}).json();
        return;
    }

    const { email, password } = req.body;

    const hashedPassword = getHashedPassword(password);

    const user = await User.findOne({
        where: {
            mail: email,
            password: hashedPassword
        },
        raw: true
    });

    if(user){
        let tokenForUserExists = null;

        for(const property in authTokens.data)
        {
            if(authTokens.data[property].mail === email)
            {
                tokenForUserExists = property;
                break;
            }
        }

        const authToken = tokenForUserExists ?? generateAuthToken();
        user.token = authToken;

        authTokens.data[authToken] = user;
        authTokens.setAll();

        res.cookie('AuthToken', authToken);
        res.status(200)
            .send({msg: 'Login successful', token: authToken})
            .json();
    }

    else {
        console.log(`Incorrect login attempt`)
        res.status(401)
            .send({msg: 'Incorrect login or password'})
            .json();
    }
}

exports.validateToken = (req, res) => {
    const { token } = req.params;
    const valid = !!authTokens.data[token];
    res.send({ valid });
}

exports.register = async (req, res) => {
    const { email, password } = req.body;

    const hashedPassword = getHashedPassword(password);
    const created = await User.create({
        mail: email,
        password: hashedPassword
    }).catch(err => console.log(err));

    if(created) {
        res.status(201)
            .send({msg: "User created"})
            .json();
    }
    else {
        res.status(500)
            .send({msg: "Something went wrong server side"})
            .json();
    }
}

exports.logout = async (req, res) => {
    const result = destroyToken(req.user.token);

    if(!result) {
        res.status(400).send({msg: "Bad Request"}).json();
        return;
    }

    res.clearCookie(req.user.token)
        .status(200)
        .send({msg: "Logged out"})
        .json();
}

exports.profile = (req, res) => {
    res.render('profile', {
        css: [routes.css.publicFiles.main],
        js: [
            routes.js.user.userlogs,
            routes.js.scale.scaleUpdate,
            routes.js.scale.deleteScale,
            routes.js.scale.getAllUserScales
        ],
        user: req.user,
        routes: routes.user,
        sound: soundArray
    });
}

exports.getAllUserActions = async (req, res) => {
    const data = await userLogHelper.getAllUserLog(await userRequestData(req));

    res.send(data)
        .json()
        .status(data.status);
}

// Return data from UserLog for currently logged user in given timespan
exports.getUserActions = async (req, res) => {
    // URL: https://localhost:8000/user/getlogs/:start/:end
    const data = await userLogHelper.getUserLogInDate(await userRequestData(req), req.params.start, req.params.end);

    res.send(data)
        .json()
        .status(data.status);
}

exports.getUserLogsByStatus = async (req, res) => {
    const { stat, start, end, count } = req.params.status;
    const user = userRequestData(req);

    if(!validate.isBoolean(stat) ||
       !validate.statusCode(stat) ||
       (count && !validate.isBoolean(count)) ||
       !validate.dateRange(start, end)){
        res.send({msg: 'Bad request'})
            .json()
            .status(400);

        return;
    }

    const logs = await userLogHelper.getAllLogsByResponseStatus(stat, user.dbid, start, end, count);

    res.send(logs)
        .json()
        .status(200);
}

exports.fretboard = async (req, res) => {
    res.render('fretboard', {
        css: [routes.css.publicFiles.main, routes.css.publicFiles.fretboard],
        jsModules: [routes.js.modules.fretboard],
        user: req.user,
        routes: routes.user,
        sound: soundArray
    });
}

exports.playFretboard = async (req, res) => {
    if(!validate.uuidv4(req.params.id)){
        res.send({msg: 'Bad request'})
            .json()
            .status(400);

        return;
    }

    const data = await jamtrackHelper.getById(req.params.id);

    res.render('playFretboard', {
        css: [routes.css.publicFiles.main, routes.css.publicFiles.fretboard],
        jsModules: [routes.js.modules.playFretboard],
        user: req.user,
        routes: routes.user,
        jamtrackData: jamtrackHelper.formatData([data.value])[0]
    });
}

exports.addJamtrackToFavourites = async(req, res) => {
    let errorOccurred = false;
    await UserFavouriteJamtracks.create({
        UserId: req.user.id,
        JamtrackId: req.body.jamtrackId
    }).catch(e => errorOccurred = e);

    if(!errorOccurred) {
        res.status(201).send({msg: "Created"});
        return;
    }

    res.status(500).send({msg: "Something went wrong"});
    console.log(errorOccurred);
}

exports.getAllFavouriteJamtracks = async (req, res) => {
    const favourites = await UserFavouriteJamtracks.findAll({
        attributes: ['JamtrackId'],
        where: {
            UserId: req.user.id
        }
    });

    res.send({favourites}).status(200);
}

exports.removeJamtrackFromFavourites = async(req, res) => {
    let errorOccurred = false;
    const deleted = await UserFavouriteJamtracks.destroy({
        where: {
            UserId: req.user.id,
            JamtrackId: req.params.jamtrackId
        }
    }).catch(e => errorOccurred = e);

    if(!errorOccurred) {
        res.status(200).send({deleted});
        return;
    }

    res.status(500).send({msg: "Something went wrong"});
    console.log(errorOccurred);
}



const userScaleLibraryRaw = async (req) => {
    const userInfo = await userRequestData(req);
    const scales = await scaleHelper.getUserScales(userInfo.dbid);

    return scales.result ? scales.value.map((x) => {
        const data = x.dataValues;
        data.tonic = indexSound(data.tonic);
        return data;
    }) : scales.value;
}

exports.userScaleLibraryJson = async (req, res) => {
    const dataSend = await userScaleLibraryRaw(req);

    res.status(Array.isArray(dataSend) ? 200 : 500)
        .send(dataSend)
        .end();
}

exports.userScaleLibrary = async (req, res) => {
    const dataSend = await userScaleLibraryRaw(req);

    res.render('scaleList', {
        css: [routes.css.publicFiles.main],
        js: [routes.js.user.deletePrivateScale],
        jsModules: [routes.js.scale.searchPrivate],
        user: req.user,
        routes: routes.user,
        scales: dataSend
    });
}

const privateScaleAction = async (req, res) => {
    if(!validate.uuidv4(req.params.id)){
        res.send({msg: 'Incorrect scale id supplied'}).json().status(401);
        return false;
    }
    const userInfo = await userRequestData(req);
    const authorized = await scaleHelper.isAuthorized(userInfo, req.params.id);

    if(!authorized)
        return false;

    return (await scaleHelper.getUserScales(userInfo.dbid, [req.params.id])).value[0]; // returns array
}

exports.privateScaleUpdate = async (req, res) => {
    const scale = await privateScaleAction(req, res); // retrieves array of scales or false if failed

    if(!scale)
        return;

    res.render('userScaleUpdate', {
        css: [routes.css.publicFiles.main],
        js: [routes.js.user.updatePrivateScale],
        scaleData: scale.dataValues,
        user: req.user,
        routes: routes.user,
        sound: soundArray
    });
}

// Shows both public and private scales on a fretboard that isn't editable unlike the one from "fretboard" endpoint
exports.showScale = async (req, res) => {
    const userInfo = await userRequestData(req);

    if(!validate.uuidv4(req.params.id))
        return res.send({msg: 'Incorrect id supplied'})
            .json()
            .status(401);

    if(!(await scaleHelper.isAuthorized(userInfo, req.params.id))){
        return res.send({msg: 'Unauthorized'})
            .json()
            .status(403);
    }

    const scale = await Scale.findByPk(req.params.id);

    res.render('showScale', {
        css: [routes.css.publicFiles.main, routes.css.publicFiles.fretboard],
        jsModules: [routes.js.modules.showScaleFretboard],
        user: req.user,
        routes: routes.user,
        scaleName: scale.dataValues.name
    });
}