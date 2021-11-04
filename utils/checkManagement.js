module.exports = (options) => {
    return async function(req, res, next){
        if(!req.user){
            res.status(401).redirect(options.notLogged);
            return;
        }

        if(req.user.management){
            next();
            return;
        }

        res.status(401).send({msg: "Unauthorized attempt to access management resources"});
    }
}