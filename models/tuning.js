const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'Tuning';

class Tuning extends Model {}

Tuning.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    tuning: {
        type: DataTypes.ARRAY(DataTypes.SMALLINT),
        allowNull: false
    },
    octaves: {
        type: DataTypes.ARRAY(DataTypes.SMALLINT),
        allowNull: false
    }
}, config);

module.exports = Tuning;