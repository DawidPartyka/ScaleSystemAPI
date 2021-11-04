module.exports = async (req) => {
    if(!req.user)
        return false;

    return {
        ip: req.ip,
        mail: req.user.mail,
        dbid: req.user.id
    }
}