const { User, Scale } = require('../models/allModels');
const routes = require('../routing/routes');
const userLogHelper = require('./helpers/userLogModelHandler');
const userRequestData = require('./helpers/userRequestData');
const validate = require('../utils/validations');
const jamtrackHelper = require("./helpers/jamtrackModelHandler");
const scaleHelper = require("./helpers/scaleModelHandler");
const { soundArray, indexSound } = require('../utils/audioCalculation');

exports.main = (req, res) => {
    req.oidc.isAuthenticated() ? res.send(req.oidc.user) : res.send("You're not logged in");
}

exports.login = (req, res) => {
    res.oidc.login({
        returnTo: routes.user.checkuser,
    });
}

exports.signup = (req, res) => {
    res.oidc.login({
        returnTo: routes.user.checkuser,
        authorizationParams: {
            screen_hint: "signup",
        },
    });
}

exports.logout = async (req, res) => {
    const title = 'User logout';

    req.session.destroy(err => console.log(err));

    const data = await userRequestData(req);

    await res.oidc.logout({
        returnTo: routes.home,
    });

    await userLogHelper.createLog(title, data, 302);
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
        user: req.oidc.user,
        routes: routes.user,
        sound: soundArray
    });
}

// Makes sure that Auth0 user is also in Postgres DB + Saves information about action to UserLog table
exports.checkDbUser = async (req, res) => {
    const data = await userRequestData(req);
    let title;

    if(!data.dbid){
        title = 'User sign up';
        const newUser = await User.create( { mail: req.oidc.user.email } );
        console.log(`Added new user. ID - ${newUser.id}`);
        data.dbid = newUser.id;
    }
    else{
        title = 'User login'
        console.log(`Logged in user. ID - ${data.dbid}`);
    }

    req.session.userId = data.dbid;

    res.redirect('/');

    await userLogHelper.createLog(title, data, 302);
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
        user: req.oidc.user,
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
        user: req.oidc.user,
        routes: routes.user,
        jamtrackData: jamtrackHelper.formatData([data.value])[0]
    })
}

exports.userScaleLibrary = async (req, res) => {
    const userInfo = await userRequestData(req);
    const scales = await scaleHelper.getUserScales(userInfo.dbid);
    const status = scales.result ? scales.value.length > 0 ? 200 : 404 : 500;

    const dataSend = scales.result ? scales.value.map((x) => {
        const data = x.dataValues;
        data.tonic = indexSound(data.tonic);
        return data;
    }) : scales.value;

    res.render('scaleList', {
        css: [routes.css.publicFiles.main],
        js: [routes.js.user.deletePrivateScale],
        jsModules: [routes.js.scale.searchPrivate],
        user: req.oidc.user,
        routes: routes.user,
        scales: dataSend,
        status: status,
        success: status === 200,
        empty: status === 404,
        error: status === 500
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
        user: req.oidc.user,
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
        user: req.oidc.user,
        routes: routes.user,
        scaleName: scale.dataValues.name
    });
}