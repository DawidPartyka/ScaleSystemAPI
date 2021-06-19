const User = require('../../models/user');

module.exports = async (req) => {
    const mail = req.oidc.user?.email ?? false;

    if(!mail)
        return false;

    const user = await User.findOne({
        attributes: ['id'],
        where: { mail: req.oidc.user.email }
    }).catch(err => {throw new err});

    if(!user)
        return false;

    return {
        ip: req.ip,
        mail: req.oidc.user.email,
        verified: req.oidc.user.email_verified,
        dbid: user.id
    }
}