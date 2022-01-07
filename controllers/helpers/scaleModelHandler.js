const { soundArray: sounds, indexSound, soundIndex, allVariations } = require('../../utils/audioCalculation');
const validate = require('../../utils/validations');
const { Scale, Featured, UserScale, JamtrackScales, Management, User, ScaleViews } = require('../../models/allModels');
const { Op } = require('sequelize');
const search = require('../options/searchByNameOptions');
const result = require('./resultObj');

const includeScale = {
    model: Scale,
    attributes: ['id', 'sounds', 'name', 'tonic', 'createdAt']
}

const includeScaleInstance = () => {
    return {
        model: Scale,
        attributes: ['id', 'sounds', 'name', 'tonic', 'createdAt']
    };
}

const helper = {
    formatStringArray: function(arr){
        return sounds.map(x => arr.includes(x));
    },

    isAuthorized: async function (user, scaleId) {
        const isPublic = await Featured.findOne({
            where: {
                ScaleId: scaleId
            }
        });
        if(isPublic)
            return true;

        const isManagement = await Management.findOne({
            where: {
                UserId: user.dbid
            }
        });

        if(!isManagement){
            const userScale = await UserScale.findOne({
                where: {
                    UserId: user.dbid,
                    ScaleId: scaleId
                }
            });

            return !!userScale; // Returns true or false
        }

        return true;
    },

    create: async function(scale, tonic, name, userId, feature){
        let err;

        if(!validate.soundArray(scale))
            return result(false, 'Incorrect scale data');

        const created = await Scale.create({
            name: name,
            sounds: scale.map(x => x ? 1 : 0).join(''),
            tonic: tonic,
            UserId: userId
        }).catch(e => err = e);

        if(err)
            return result(false, err);

        const createdView = await ScaleViews.create({
            ScaleId: created.id,
            UserId: userId
        }).catch(e => err = e);

        if(err)
            return result(false, err);

        await UserScale.create({
            UserId: userId,
            ScaleId: created.id
        }).catch(e => err = e);

        if(feature){
            const featured = await this.feature(created);

            if(!featured.result)
                return featured;
        }

        return err ? result(false, err) : result(true, {scale: created, view: createdView});
    },

    feature: async function (scale){
        let err;
        let featured;

        const exists = await Scale.count({
            where: {
                name: scale.name
            }
        }).catch(e => err = e);

        if(err)
            return result(false, err);

        if(exists === 1)
            featured = await Featured.create({ ScaleId: scale.id})
                .catch(e => err = e);

        return err ? result(false, err) : result(true, featured ?? {msg: 'already exists'});
    },

    update: async (options, scaleId, user) => {
        let err;

        // Check if update should be allowed
        if(!user.role){
            const scale = await UserScale.findOne({
                where: {
                    UserId: user.dbid,
                    ScaleId: scaleId
                }
            });

            if(!scale)
                return result(false, { msg: 'Action on restricted resource' })
        }

        if(typeof options.tonic === 'string' || options.tonic instanceof String)
            options.tonic = sounds.indexOf(options.tonic);

        const updated = await Scale.update(
            options,{
            where: {
                id: scaleId
            },
            returning: true
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, updated);
    },

    getAllPublic: async () => {
        let err;

        const scales = await Featured.findAll({
            include: includeScale,
            attributes: [],
            raw: true
        }).catch(e => err = e);

        /*const scales = await Featured.findAll({
            include: includeScale,
            plain: true
        }).catch(e => err = e);*/

        return err ? result(false, err) : result(true, scales);
    },

    // scaleIds - optional
    // if passed it will return scales with ids matching to those in scaleIds array
    // otherwise it will return all scales of specific user
    // if management role is specified it will be able to return scales of any user
    getUserScales: async function (userId, scaleIds, role, name) {
        let err;

        const options = {
            include: {
                model: User,
                through: { attributes: [] },
                attributes: []
            }
        }

        if(!role)
            options.include.where = {
                id: userId
            }

        if(scaleIds)
            options.where = { // adds check for scale ids
                id: {
                    [Op.in]: scaleIds
                }
            };

        if(name){
            if(!options.where)
                options.where = {};

            options.where = Object.assign(options.where, search(name));
        }


        const userScales = await Scale.findAll(options);

        return err ? result(false, err) : result(true, userScales);
    },

    findByScale: async (scale) => {
        let err;

        if(!validate.soundArray(scale))
            return result(false, 'Incorrect scale data');

        const search = await Featured.findAll({
            include: {
                model: Scale,
                where: {
                    sounds: scale
                }
            }
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, search);
    },

    findById: async function (userId, scaleId, role) {
        let err;

        const scale = await Featured.findOne({
            include: includeScale,
            attributes: [],
            where: {
                ScaleId: scaleId
            }
        }).catch(e => err = e);

        if(err || scale)
            return err ? result(false, err) : result(true, scale);

        // If error didn't occur and no scale was found than search in user private scales
        // No need for checks as the getUserScales method will handle everything
        return await this.getUserScales(userId, [scaleId], role);
    },

    findDistinctByScale: async function (scale) {
        let err;

        const whereData = scale.map((x) => x.map(y => y ? 1 : 0).join(''));

        const scales = await Featured.findAll({
            include: {
                model: Scale,
                where: {
                    sounds: whereData
                },
                attributes: ['id', 'name', 'tonic', 'sounds']
            },
            raw: true
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, scales);
    },

    deleteFromModelByScaleId: async function(model, scaleId, direct) {
        const whereOptions = direct ? { id: scaleId } : { ScaleId: scaleId };
        let success = true;
        const deletion = await model.destroy({where: whereOptions})
            .catch(() => success = !success);

        return result(success, deletion);
    },

    deleteScale: async function (scaleId) {
        let err = null;

        const featuredInstance = await this.deleteFromModelByScaleId(Featured, scaleId, false);
        err = featuredInstance.result ? err : featuredInstance.value;

        const userScaleInstance = await this.deleteFromModelByScaleId(UserScale, scaleId, false);
        err = userScaleInstance.result ? err : userScaleInstance.value;

        const viewsInstances = await this.deleteFromModelByScaleId(UserScale, scaleId, false);
        err = viewsInstances.result ? err : viewsInstances.value;

        const scaleInstance = await this.deleteFromModelByScaleId(Scale, scaleId, true);
        err = scaleInstance.result ? err : scaleInstance.value;

        const jamtrackScaleInstance = await this.deleteFromModelByScaleId(JamtrackScales, scaleId, false);
        err = jamtrackScaleInstance.result ? err : jamtrackScaleInstance.value;

        return err ? result(false, err) : result(true, {
            featured: featuredInstance,
            userScale: userScaleInstance,
            views: viewsInstances,
            scale: scaleInstance,
            jamtrackScale: jamtrackScaleInstance,
            scaleIdSupplied: scaleId
        });
    },

    nameLike: async (name) => {
        let err;
        const include = includeScaleInstance();
        include.where = search(name);

        const scales = await Featured.findAll({
            include: include
        }).catch(e => err = e);

        return result(!!!err, scales);
    },

    flattenFeaturedScale: (scaleArr) => {
        return scaleArr.value.map((scale) => {
            const s = 'Scale.';
            return {
                id: scale[`${s}id`],
                tonic: indexSound(scale[`${s}tonic`]),
                sounds: scale[`${s}sounds`],
                createdAt: scale[`${s}createdAt`],
                name: scale[`${s}name`]
            }
        });
    },

    findScaleByPartialSounds: async (soundSymbols) => {
        let err;
        const soundArr = new Array(12).fill('_');
        soundSymbols.forEach(sound => soundArr[soundIndex(sound)] = '1');
        const variations = allVariations(soundArr);

        const scales = await Featured.findAll({
            include: {
                model: Scale,
                where: {
                    [Op.or]: variations.map((variation) => (
                        {
                            sounds: {
                                [Op.like]: variation.join('')
                            }
                        }
                    ))
                },
                attributes: ['name', 'tonic', 'sounds']
            },
            raw: true
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, scales.map(x => {
            const { id, createdAt, updatedAt, ScaleId } = x;
            return {
                id, createdAt, updatedAt, ScaleId,
                name: x['Scale.name'],
                tonic: x['Scale.tonic'],
                sounds: x['Scale.sounds']
            }
        }));
    }
}

module.exports = helper;