const User = require('../models/user');
const scaleHelper = require("../controllers/helpers/scaleModelHandler");

const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const uuidv4Regexp = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);


const isUUIDV4 = (id) => {
    return uuidv4Regexp.test(id);
}

exports.emailAndPassword =  (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password){
        res.status(400).send({msg: "Bad request"}).json();
        return;
    }

    if(!emailRegexp.test(email)){
        res.status(400).send({msg: "Invalid email"}).json();
        return;
    }

    if(password.length < process.env.MINPASSWORDLEN){
        res.status(400).send({msg: "Password is too short"}).json();
        return;
    }

    next();
}

exports.emailTaken = async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({
        where: { mail: email },
        raw: true
    });

    if(user){
        res.status(401).send({msg: "Email is already registered"}).json();
        return;
    }

    next();
}

exports.resourceIdExists = (model, reqIdName, body = true) => {
    return async (req, res, next) => {
        const dataPlace = body ? req.body : req.params;

        if(!isUUIDV4(dataPlace[reqIdName])){
            res.status(400)
                .send({msg: `Invalid id value`})
                .json();

            return;
        }

        if(!dataPlace[reqIdName]) {
            res.status(400)
                .send({msg: `Bad request` })
                .json()
                .end();

            return;
        }

        const resource = await model.findByPk(dataPlace[reqIdName]);
        if(!resource) {
            res.status(404)
                .send({msg: `Resource ${model.name} with id ${dataPlace[reqIdName]} not found` })
                .json()
                .end();

            return;
        }

        next();
    }
}

exports.userAuthorizedToScale = async (req, res, next) => {
    if(!await scaleHelper.isAuthorized(req.user, req.params.scaleId)){
        res.send({ msg: 'No access to the resource' })
            .json()
            .status(403);

        return;
    }

    next();
}

// string parameters are needed to be passed here
exports.oneOrMoreQueriesPresent = (querySearchParams) => {
    return (req, res, next) => {
        const flag = querySearchParams.some(query => req.query[query]);

        if(!flag){
            res.status(401).send({msg: 'No parameters passed'})
            return;
        }

        next();
    }
}