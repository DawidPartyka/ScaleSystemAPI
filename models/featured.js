const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'Featured';

class Featured extends Model {}

Featured.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        }
    },
    config
);

module.exports = Featured;