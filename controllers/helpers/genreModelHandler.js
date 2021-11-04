const Genre = require('../../models/genre');
const Jamtrack = require('../../models/jamtrack');
const result = require('./resultObj');
const { Sequelize } = require('sequelize');

const helper = {
    // genres: [ genre1, genre2... ]
    findByGenre: async function(genres) {
        const results = [];

        for(let i = 0; i < genres.length; i++){
            const foundGenre = await Genre.findOne({
                where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), genres[i].toLowerCase())
            });

            const resGen = foundGenre ? result(true, foundGenre) : result(false, genres[i]);
            results.push(resGen);
        }

        return results;
    },
    findByGenreOrCreate: async function(genres) {
        const resultGenres = await this.findByGenre(genres);

        if(resultGenres.every(x => x.result !== false))
            return resultGenres.map(x => x.value);

        const createdGenres = await Genre.bulkCreate(
            resultGenres.filter(x => x.result === false)
                .map((x) => {
                    return {
                        name: x.value
                    }
                }),
            { returning: true }
        );

        return resultGenres.filter(x => x.result === true).map(x => x.value).concat(createdGenres);
    },

    getAll: async () => {
        let err;

        const genres = await Genre.findAll({
            order: [ ['name', 'DESC'] ],
            attributes: [ 'id', 'name' ]
        }).catch(e => err = e);

        return err ? result(false, err) : result(true, genres);
    },

    create: async (name) => {
        let err;

        const created = await Genre.create({ name: name.trim() })
            .catch(e => err = e);

        return err ? result(false, err) : result(true, created);
    },

    deleteGenre: async (id) => {
        const jamtracks = await Jamtrack.count({
            where: {
                GenreId: id
            }
        });

        if(jamtracks === 0){
            const genreDeletion = await Genre.destroy({
                where: {
                    id: id
                }
            });

            return result(true, {deleted: genreDeletion});
        }

        return result(false, {msg: 'There\'re still jamtracks that use this genre therefore it can\'t be deleted'});
    }
}

module.exports = helper;