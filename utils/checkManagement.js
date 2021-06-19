const Management = require('../models/management');
const User = require('../models/user');
const userRequestData = require('../controllers/helpers/userRequestData');

module.exports = (options) => {
    return async function(req, res, next){
        let userData;
        let userId = req.session.userId;

        if(req.oidc)
            userData = await userRequestData(req);

        if(!req.oidc.isAuthenticated()){
            res.status(401).redirect(options.notLogged);
            return;
        }

        // TODO: log admin login attempt
        if(req.session.managementId){
            req.session.cookie.expires = new Date(Date.now() + (872 * 2000)); // Change session expiration; 0.5h
            next();
            return;
        }


        if(!userId && userData.dbid !== undefined)
            userId = userData.dbid;

        const user = await User.findOne({
            attributes: ['id'],
            where: {
                id: userId
            }
        }).catch(err => console.log(err));

        const manage = await Management.findOne({
            attributes: ['id'],
            where: {
                UserId: user.id
            }
        }).catch(err => console.log(err));

        if(manage){
            req.session.managementId = manage.id;
            req.session.cookie.expires = new Date(Date.now() + (872 * 2000)); // Set session expiration; 0.5h
            next();
        }

        else
            res.status(401)
                .redirect(options.noAuthorization);

    }
}