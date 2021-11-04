const { Sequelize } = require('sequelize');
const Artist = require('../../models/artist');
const JamtrackArtists = require('../../models/jamtrackArtists');
const result = require('./resultObj');

const helper = {
    findByName: async function(nameArr) {
        // It's easier to do it in loop as it is easier to point out artist names
        // that are not in db then select all names which matching any value from nameArr
        // and than again check for which names the match wasn't found
        const nameArrResult = [];

        for(let i = 0; i < nameArr.length; i++){
            const artist = await Artist.findOne({
                where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), nameArr[i].toLowerCase())
                //where: (sequelize.fn('lower', sequelize.col('name')), artistName.toLowerCase())
            }).catch(err => console.log(err));

            const searchRes = artist ? result(true, artist) : result(false, nameArr[i]);
            nameArrResult.push(searchRes);
        }

        return nameArrResult;
        /*return nameArr.map(async (artistName) => {
            const artist = await Artist.findOne({
                where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), artistName.toLowerCase())
                //where: (sequelize.fn('lower', sequelize.col('name')), artistName.toLowerCase())
            });

            // result.value: artists name not found in db, or record of artist found in db
            return artist ? result(true, artist) : result(false, artistName);
        });*/
    },
    // unlike findByName method findByNameOrCreate only returns artists from db
    // as there's no need to point out the ones that were not found
    findByNameOrCreate: async function(nameArr) {
        const arr = nameArr.filter(x => x.trim().length); // Making sure to not add empty strings
        const resultArtist = await this.findByName(arr);

        if(resultArtist.every(x => x.result !== false))
            return resultArtist.map(x => x.value);

        const createdArtists = await Artist.bulkCreate(
            resultArtist.filter(x => x.result === false)
                .map(x => {
                    return {
                        name: x.value
                    }
                }),
            { returning: true }
        );

        return resultArtist.filter(x => x.result === true).map(x => x.value).concat(createdArtists);
    },
    getAll: async () => {
        let err;

        const artists = await Artist.findAll({
            order: [ ['name', 'DESC'] ],
            attributes: [ 'id', 'name' ]
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, artists);
    },

    update: async (id, newName) => {
        let err;

        const updated = await Artist.update(
            {
                name: newName
            },
            {
                where: {
                    id: id
                },
            },
            {
                returning: true
            }).catch(e => err = e);

        return err ? result(false, err) : result(true, updated);
    },

    create: async (name) => {
        let err;

        const created = await Artist.create({ name: name.trim() })
            .catch(e => err = e);

        return err ? result(false, err) : result(true, created);
    },

    deleteArtist: async (id) => {
        let err;

        const deletedArtists = await Artist.destroy({
            where: {
                id: id
            }
        }).catch(e => err = e);

        if(err)
            return result(false, err);

        const deletedJamtrackArtists = await JamtrackArtists.destroy({
            where: {
                ArtistId: id
            }
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, {
            artist: deletedArtists,
            jamtrackArtist: deletedJamtrackArtists
        });
    },

    getById: async (id) => {
        let err;

        const artist = await Artist.findOne({
            where: {
                id: id
            }
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, artist);
    }
}

module.exports = helper;