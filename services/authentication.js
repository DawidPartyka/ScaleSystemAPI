const crypto = require('crypto');
const { User, Management } = require('../models/allModels');
const Storage = require('../utils/LocalStorage');
const authTokens = new Storage({filePath: process.env.TOKENSTORAGE, defaultProps: {}});
authTokens.parse();

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    return sha256.update(password).digest('base64');
}

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

const destroyToken = (token) => {
    const exists = authTokens.data[token];
    if(!exists){
        return false;
    }

    delete authTokens.data[token];
    authTokens.setAll();

    return true;
}

const requireUser = (req, res, next) => {
    const authToken = req.cookies['AuthToken'];
    if(authToken)
        req.user = authTokens.data[authToken];

    next();
}

const requireToken = (req, res, next) => {
    const authToken = req.params.token;

    if(authToken)
        req.user = authTokens.data[authToken];

    next();
}

const checkUser = async (req, res, next) => {
    console.log(req.user);
    if(!req.user){
        res.status(401).send({msg: "Unauthorized access attempt"}).json().end();
        return;
    }

    const user = await User.findOne({
        where: {
            id: req.user.id
        },
        attributes: {
            exclude: ['password']
        }
    });

    if(!user){
        res.status(401).send({msg: "Unauthorized access attempt"}).json().end();
        return;
    }

    const management = await Management.findOne({
        where: {
            UserId: user.id
        }
    });

    if(management){
        req.user.management = true;
    }

    next();
}

module.exports = {
    authTokens,
    getHashedPassword,
    generateAuthToken,
    destroyToken,
    requireUser,
    requireToken,
    checkUser
}