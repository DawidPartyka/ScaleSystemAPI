const { requiresAuth  } = require('express-openid-connect');
const checkManagement = require('../utils/checkManagement');
const routes = require('./routes');
const  { checkUser, requireToken } = require('../services/authentication');

class GenericRouter{
    constructor(model, routeName, modelNaming, modelAttribute, validator) {
        this.model = model;
        this.routeName = routeName;
        this.modelNaming = modelNaming;
        this.modelAttribute = modelAttribute;
        this.validator = validator;
    }

    create() {
        // Those imports ABSOLUTELY need to be here
        // Otherwise all controllers used in routes will be overwritten
        const express = require('express');
        const router = express.Router();
        const controller = require('../controllers/genericController');

        const options = {
            notLogged: routes.user.login,
            noAuthorization: routes.noAuthorization
        }

        const basicController = new controller(this.model, this.modelNaming, this.modelAttribute, this.validator);

        router.get('/getall', checkUser, basicController.genericGetAll());
        router.get('/getbyid/:id', checkUser, basicController.genericGetById());
        router.post('/create', checkManagement(options), basicController.genericCreate());
        router.patch('/update', checkManagement(options), basicController.genericUpdate());
        router.delete('/delete/:id', checkManagement(options), basicController.genericDelete());

        return {
            basePath: `/${this.routeName}`,
            router
        }
    }
}

module.exports = (model, routeName, modelNaming, modelAttribute, validator) => {
    return new GenericRouter(model, routeName, modelNaming, modelAttribute, validator);
};