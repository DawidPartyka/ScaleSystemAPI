const validate = require('../utils/validations');
const userLogHelper = require('./helpers/userLogModelHandler');
const userData = require('./helpers/userRequestData');

class GenericController {
    constructor(modelParam, nameParam, modelAttr, validation) {
        this.model = modelParam;
        this.name = nameParam;
        this.modelAttribute = modelAttr;

        if(validation)
            this.additionalNameValidation = validation;
    }

    check() {
        const model = this.model;

        return async function(res, id, action, user){
            if(!validate.uuidv4(id)){
                res.send({msg: `Invalid id value`})
                    .json()
                    .status(400);

                if(user)
                    await userLogHelper.createLog(action, user, 400, JSON.stringify({id: id}));

                return 400;
            }

            const modelInstance = await model.findByPk(id);

            if(!modelInstance){
                res.send({msg: `No ${name} found with given id: ${id}`})
                    .json()
                    .status(404);

                if(user)
                    await userLogHelper.createLog(action, user, 404);

                return 404;
            }

            return modelInstance;
        }
    }

    returnOptions() {
        const modelAttribute = this.modelAttribute;

        return function () {
            let obj = {};
            obj[modelAttribute] = null;
            return obj;
        }
    }

    genericCreate() {
        const model = this.model;
        const additionalNameValidation = this.additionalNameValidation;
        const modelAttribute = this.modelAttribute;
        const returnOptions = this.returnOptions();

        return async function(req, res) {
            let err;
            const name = req.body.name;

            if(!validate.stringValue(name))
                return res.send({msg: `Invalid create value`})
                    .json()
                    .status(400);

            if(additionalNameValidation)
                if(!additionalNameValidation(name))
                    return res.send({msg: `Invalid update value`})
                        .json()
                        .status(400);

            const opt = returnOptions();
            opt[modelAttribute] = name;

            const created = await model.create(opt).catch(e => err = e);

            res.send(created)
                .json()
                .status(err ? 500 : 201);
        }
    }

    genericDelete() {
        const model = this.model;
        const name = this.name;
        const check = this.check();

        return async function(req, res) {
            const data = await check(res, req.params.id);

            if(!(data instanceof model))
                return;

            await data.destroy();

            const deleted = {
                deletedObject: await data.save(),
                modelName: name
            }

            res.send(deleted)
                .json()
                .status(200);
        }
    }

    genericUpdate() {
        const model = this.model;
        const additionalNameValidation = this.additionalNameValidation;
        const modelAttribute = this.modelAttribute;
        const check = this.check();

        return async function(req, res) {
            const { id, name } = req.body;

            if(!validate.stringValue(name))
                return res.send({msg: 'Invalid update value'})
                    .json()
                    .status(400);

            if(additionalNameValidation)
                if(!additionalNameValidation(name))
                    return res.send({msg: `Invalid update value`})
                        .json()
                        .status(400);


            const data = await check(res, id);

            if(!(data instanceof model))
                return;

            data[modelAttribute] = name;

            await data.save();

            const updated = {
                updatedRecord: await data.reload()
            }

            res.send(updated)
                .json()
                .status(200);
        }
    }

    genericGetAll() {
        const modelName = this.name;
        const model = this.model;

        return async function(req, res) {
            let err;
            let stat = 200;
            let actionName = `Get all ${modelName}`;

            const user = await userData(req);

            const data = await model.findAll()
                .catch(e => err = e);

            if(!data.length)
                stat = 404;

            else if(err)
                stat = 500;

            res.send({response: data})
                .json()
                .status(stat);

            await userLogHelper.createLog(actionName, user, stat);
        }

    }

    genericGetById() {
        const modelName = this.name;
        const model = this.model;
        const check = this.check();

        return async function(req, res) {
            let stat = 200;
            let actionName = `Get ${modelName} by id`;
            const user = await userData(req);

            const data = await check(res, req.params.id, actionName, user);

            if(!(data instanceof model))
                return;

            res.send(data).json().status(stat);

            await userLogHelper.createLog(actionName, user, stat);
        }
    }
}

module.exports = GenericController;