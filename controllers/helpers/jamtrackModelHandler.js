const { Op } = require('sequelize');
const {
    Jamtrack,
    Genre,
    Artist,
    Scale,
    TimeSignature,
    JamtrackScales,
    JamtrackArtists,
    JamtrackTimeSignatures
} = require('../../models/allModels');
const artistHelper = require('./artistModelHandler');
const signatureHelper = require('./timesignatureModelHandler');
const result = require('./resultObj');
const sound = require('../../utils/audioCalculation');
const search = require('../options/searchByNameOptions');

const jamtrackInclude = () => {
    return [
        {
            model: Genre,
            attributes: ['id', 'name']
        },
        {
            model: Artist,
            through: { attributes: [] },
            attributes: ['id', 'name']
        },
        {
            model: TimeSignature,
            through: { attributes: [] },
            attributes: ['id', 'signature']
        }
    ]
};

const jamtrackScaleOptions = () => {
    return {
        include: {
            model: Scale,
                attributes: ['id', 'name']
        },

        attributes: ['JamtrackId', 'tonic', 'ScaleTimestamp']
    }
}

const helper = {
    /*
        data:
        {
            name,
            path (fileLocationPath - with filename & extension),
            size,
            type (file type),
            bpm,
            genreId
        }
    */
    addJamtrack: async function(data) {
        let err;

        const track = await Jamtrack.create({
            name: data.name,
            serverLocation: data.fileLocationPath,
            size: data.size,
            ext: data.ext,
            bpm: data.bpm,
            GenreId: data.genre,
            duration: data.duration
        }).catch((e) => {
            console.log(e);
            err = e;
        });

        return err ? result(false, err) : result(true, track);
    },
    /*
        dataArr:
        [{
            scaleTimestamp,
            scaleId,
            tonic
        },...]

        WON'T WORK WITH CustomScale TABLE IDS!
        That's not it's purpose
     */
    linkWithScales: async function(jamtrackId, dataArr) {
        const createData = [];
        let err;

        dataArr.forEach((entry) => {
            entry.timeStamps.forEach((stamp) => {
                createData.push({
                    JamtrackId: jamtrackId,
                    ScaleId: entry.scaleId,
                    ScaleTimestamp: stamp,
                    tonic: sound.soundIndex(entry.tonic)
                });
            });
        });

        const created = await JamtrackScales.bulkCreate(
            createData,
            {
                returning: true
            })
            .catch((e) => {
                console.log(e);
                err = e
            });

        return err ?  result(false, err) : result(true, created);
    },
    /*
        dataArr:
        [ artistName1, artistName2,... ]
    */
    linkWithArtists: async function(jamtrackId, dataArr) {
        const artists = await artistHelper.findByNameOrCreate(dataArr);
        let err;

        const data = artists.map((x) => {
                return {
                    ArtistId: x.id,
                    JamtrackId: jamtrackId
                }
            });

        const created = await JamtrackArtists.bulkCreate(
            data,
            {
                returning: true
            })
            .catch((e) => {
                console.log(e);
                err = e;
            });

        return err ? result(false, err) : result(true, created);
    },

    linkWithArtistId: async function(jamtrackId, artistId) {
        let err;

        const created = await JamtrackArtists.create(
            {
                ArtistId: artistId,
                JamtrackId: jamtrackId
            },
            {
                returning: true
            })
            .catch((e) => {
                console.log(e);
                err = e;
            });

        return err ? result(false, err) : result(true, created);
    },

    /*
        dataArr:
        [ signature1, signature2,... ]
    */
    linkWithTimeSignatures: async function(jamtrackId, dataArr) {
        const signatures = await signatureHelper.findBySignatureOrCreate(dataArr);
        let err;

        const data = signatures.map((x) => {
                return {
                    TimeSignatureId: x.id,
                    JamtrackId: jamtrackId
                }
            });

        const created = await JamtrackTimeSignatures.bulkCreate(
            data,
            {
                returning: true
            })
            .catch((e) => {
                console.log(e);
                err = e;
            });

        return err ? result(false, err) : result(true, created);
    },

    linkWithTimeSignatureId: async function(jamtrackId, timeSignatureId) {
        let err;

        const created = await JamtrackTimeSignatures.create(
            {
                TimeSignatureId: timeSignatureId,
                JamtrackId: jamtrackId
            },
            {
                returning: true
            })
            .catch((e) => {
                console.log(e);
                err = e;
            });

        return err ? result(false, err) : result(true, created);
    },

    linkAll: async function(jamtrackData, scales, timesignatures, artists) {
        const jamtrack = await this.addJamtrack(jamtrackData);

        if(jamtrack.result !== true)
            return result( false, jamtrack.value);

        const artistsLink = await this.linkWithArtists(jamtrack.value.id, artists);
        if(artistsLink.result !== true)
            return result( false, artistsLink.value);

        const scalesLink = await this.linkWithScales(jamtrack.value.id, scales);
        if(scalesLink.result !== true)
            return result( false, scalesLink.value);

        const timeLink = await this.linkWithTimeSignatures(jamtrack.value.id, timesignatures);
        if(timeLink.result !== true)
            return result( false, timeLink.value);

        return result( true, {
            jamtrack: jamtrack.value,
            artistLinks: artistsLink.value,
            scaleLinks: scalesLink.value,
            timeLinks: timeLink.value
        });
    },

    mergeJamtracksWithScales: function (jamtracks, jamtrackScales) {
        return jamtracks.map(obj => ({
            obj,
            scales: jamtrackScales.filter(x => x.JamtrackId === obj.id)
        }));
    },

    getIdsRelatedToAttribute: async function(attr, searchId) {
        let data;

        switch (attr){
            case 'Artist':
                data = await JamtrackArtists.findAll({
                    where: { ArtistId: searchId },
                    attributes: ['JamtrackId'],
                    raw: true
                });

                return data.map(x => x.JamtrackId);

            case 'Genre':
                data = await Jamtrack.findAll({
                    where: { GenreId: searchId },
                    attributes: ['id'],
                    raw: true
                });

                return data.map(x => x.id);

            case 'TimeSignature':
                data = await JamtrackTimeSignatures.findAll({
                    where: { TimeSignatureId: searchId },
                    attributes: ['JamtrackId'],
                    raw: true
                });

                return data.map(x => x.JamtrackId);

            default:
                return false;
        }
    },

    // attribute - model name
    getByAttribute: async function(attribute, searchId) {
        let err;

        const include = jamtrackInclude();

        const jamtrackIds = await this.getIdsRelatedToAttribute(attribute, searchId);

        if(!jamtrackIds)
            return result(false, 'Incorrect search attribute');

        if(!jamtrackIds.length)
            return result(false, 'No records found');

        const jamtracks = await Jamtrack.findAll({
            include: include,
            attributes: ['id', 'name', 'size', 'ext', 'bpm', 'createdAt'],
            nest: true,
            where: {
                id: {
                    [Op.in]: jamtrackIds
                }
            }
        }).catch(e => err = e);

        if(err)
            return result(false, err);

        const jamtrackScaleOpt = jamtrackScaleOptions();
        jamtrackScaleOpt.where = {
            JamtrackId: {
                [Op.in]: jamtrackIds
            }
        }

        const jamtrackScales = await JamtrackScales.findAll(jamtrackScaleOpt).catch(e => err = e);

        return err ? result(false, err) : result(true, this.mergeJamtracksWithScales(jamtracks, jamtrackScales));
    },

    getAll: async function() {
        let err;

        // Needs to be queried separately and merged by hand, as sequelize m:n tables
        // with non unique foreign keys handling is buggy af
        const jamtrackScales = await JamtrackScales.findAll(jamtrackScaleOptions()).catch(e => err = e);

        if(err)
            return result(false, err);

        const jamtracks = await Jamtrack.findAll({
            include: jamtrackInclude(),
            attributes: ['id', 'name', 'size', 'ext', 'bpm', 'createdAt'],
            nest: true
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, this.mergeJamtracksWithScales(jamtracks, jamtrackScales));
    },

    getById: async function(id) {
        let err;

        const opt = jamtrackScaleOptions();
        opt.where = {
            JamtrackId: id
        }
        // Needs to be queried separately and merged by hand, as sequelize m:n tables
        // with non unique foreign keys handling is buggy af
        const jamtrackScales = await JamtrackScales.findAll(opt).catch(e => err = e);

        if(err)
            return result(false, err);

        const jamtrack = await Jamtrack.findAll({
            include: jamtrackInclude(),
            attributes: ['id', 'name', 'size', 'ext', 'bpm', 'createdAt'],
            nest: true,
            where: {
                id: id
            }
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, this.mergeJamtracksWithScales(jamtrack, jamtrackScales)[0]);
    },

    // artistIds is optional and if present should be an array or a single uuidv4
    deleteJamtrackArtists: async function(jamtrackId, artistIds){
        let err;

        const options = {
            where: {
                JamtrackId: jamtrackId
            }
        }

        if(artistIds)
            options.where.ArtistId = artistIds;

        const deleted = await JamtrackArtists.destroy(options)
            .catch(e => err = e);

        return err ? result(false, err) : result(true, deleted);
    },

    deleteJamtrackScales: async function(jamtrackId, scaleIds){
        let err;

        const options = {
            where: {
                JamtrackId: jamtrackId
            }
        }

        if(scaleIds)
            options.where.ScaleId = scaleIds;

        const deleted = await JamtrackScales.destroy(options)
            .catch(e => err = e);

        return err ? result(false, err) : result(true, deleted);
    },

    deleteJamtrackTimeSignatures: async function(jamtrackId, timeSignatureIds){
        let err;

        const options = {
            where: {
                JamtrackId: jamtrackId
            }
        }

        if(timeSignatureIds)
            options.where.TimeSignatureId = timeSignatureIds;

        const deleted = await JamtrackTimeSignatures.destroy(options)
            .catch(e => err = e);

        return err ? result(false, err) : result(true, deleted);
    },

    completeDelete: async function(jamtrack) {
        let err;

        const artists = await this.deleteJamtrackArtists(jamtrack.id);

        if(!artists.result)
            return artists;

        const scales = await this.deleteJamtrackScales(jamtrack.id);

        if(!scales.result)
            return scales;

        const timeSignatures = await this.deleteJamtrackTimeSignatures(jamtrack.id);

        if(!timeSignatures.result)
            return timeSignatures;

        const deletion = await Jamtrack.destroy({
            where: {
                id: jamtrack.id
            }
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, {
            jamtrack: deletion,
            artists: artists,
            scales: scales,
            timeSignatures: timeSignatures,
            file: jamtrack.serverLocation
        });
    },

    nameLike: async (name) => {
        let err;

        const scales = await Jamtrack.findAll({
            where: search(name)
        }).catch(e => err = e);

        return result(!!!err, scales); // !!! casts it into boolean and then reverses the value
    },

    // flattens the response of getAll() as {raw: true} option can't be used
    // because sequelize would return n^2 records duplicating them...
    formatData: function(data) {
        const responseObject = [];

        data.forEach((x) => {
            const base = x.obj["dataValues"];
            const obj = { id, name, size, ext, bpm, createdAt } = base; // destructuring it a bit
            obj.Genre = base.Genre["dataValues"];
            obj.Artists = base.Artists.map(entry => entry["dataValues"]);
            obj.TimeSignatures = base.TimeSignatures.map(entry => entry["dataValues"]);

            obj.Scales = x.scales.map((entry) => {
                //console.log(entry);
                //console.log(entry);
                return {
                    tonic: sound.indexSound(entry["dataValues"].tonic),
                    name: entry.Scale["dataValues"].name,
                    timestamp: entry["dataValues"].ScaleTimestamp
                }
            });

            responseObject.push(obj);
        });

        return responseObject;
    }
}

module.exports = helper;